import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { createHash } from 'node:crypto';
import { validateReport } from './validate.mjs';
const tools = dirname(fileURLToPath(import.meta.url)),
  root = resolve(tools, '../..'),
  runtime = join(root, 'superpowers/comparison');
const { values } = parseArgs({
  options: {
    url: { type: 'string' },
    name: { type: 'string' },
    width: { type: 'string', default: '375' },
    lighthouse: { type: 'string' },
  },
});
async function capture() {
  if (!values.url || !values.name || !/^[a-z0-9-]+$/.test(values.name))
    throw new Error('Use --url=http://127.0.0.1:5182/path --name=new-screen-375');
  const url = new URL(values.url),
    width = Number(values.width);
  if (
    url.hostname !== '127.0.0.1' ||
    ![5180, 5181, 5182].includes(Number(url.port)) ||
    url.protocol !== 'http:'
  )
    throw new Error('Only the three local comparison servers are supported');
  if (!Number.isInteger(width) || width < 320 || width > 1920)
    throw new Error('Viewport width must be320–1920');
  const cli = [
    values.lighthouse,
    process.env.LIGHTHOUSE_CLI,
    join(root, 'node_modules/lighthouse/cli/index.js'),
    join(runtime, 'sources/previous/node_modules/lighthouse/cli/index.js'),
  ].find((p) => p && existsSync(p));
  if (!cli)
    throw new Error(
      'Lighthouse is optional and was not installed. Set LIGHTHOUSE_CLI to an existing installation; no dependency is installed automatically.',
    );
  const core = new URL('../core/index.js', pathToFileURL(resolve(cli))).href;
  const folder = join(runtime, 'capture-tools', values.name);
  mkdirSync(folder, { recursive: true });
  mkdirSync(join(runtime, 'reports'), { recursive: true });
  mkdirSync(join(runtime, 'screens'), { recursive: true });
  const fixture = readFileSync(join(tools, 'fixture.json'), 'utf8');
  writeFileSync(
    join(folder, 'gatherer.mjs'),
    `import {Gatherer} from ${JSON.stringify(core)};
import {collectComparisonGeometry} from ${JSON.stringify(pathToFileURL(join(tools, 'geometry.mjs')).href)};
export default class extends Gatherer {meta={supportedModes:['navigation']};getArtifact(context){return context.driver.executionContext.evaluate(collectComparisonGeometry,{args:[${fixture}],useIsolation:true});}}`,
  );
  writeFileSync(
    join(folder, 'audit.mjs'),
    `import {Audit} from ${JSON.stringify(core)};
import {validateReport} from ${JSON.stringify(pathToFileURL(join(tools, 'validate.mjs')).href)};
export default class extends Audit {static get meta(){return {id:'comparison-content',title:'Requested comparison content rendered',failureTitle:'Requested comparison content missing',description:'Read-only fixture, final route and content validation.',requiredArtifacts:['CompareGeometry','URL']};}static audit(a){const g=a.CompareGeometry;const report={finalDisplayedUrl:a.URL.finalDisplayedUrl,audits:{'comparison-content':{details:{geometry:g}}}};const verdict=validateReport(report,a.URL.requestedUrl);return {score:verdict.valid?1:0,details:{type:'debugdata',geometry:g,validation:verdict}};}}`,
  );
  const config = {
    extends: 'lighthouse:default',
    artifacts: [{ id: 'CompareGeometry', gatherer: join(folder, 'gatherer.mjs') }],
    audits: [join(folder, 'audit.mjs')],
    categories: {
      comparison: {
        title: 'Comparison validity',
        auditRefs: [{ id: 'comparison-content', weight: 1 }],
      },
    },
    settings: {
      onlyCategories: ['accessibility', 'comparison'],
      screenEmulation: { mobile: true, width, height: 844, deviceScaleFactor: 1, disabled: false },
      throttlingMethod: 'provided',
      pauseAfterLoadMs: url.searchParams.get('demo') === 'error' ? 9000 : 1000,
    },
  };
  writeFileSync(join(folder, 'config.json'), JSON.stringify(config));
  const reportPath = join(runtime, 'reports', values.name + '.json'),
    imagePath = join(runtime, 'screens', values.name + '.png');
  // Never leave a stale published screenshot behind if the replacement fails validation.
  if (existsSync(imagePath)) unlinkSync(imagePath);
  const logPath = join(runtime, 'reports', values.name + '.log');
  let log = '';
  const code = await new Promise((fulfill, reject) => {
    const child = spawn(
      process.execPath,
      [
        cli,
        values.url,
        '--config-path=' + join(folder, 'config.json'),
        '--chrome-flags=--headless=new',
        '--output=json',
        '--output-path=' + reportPath,
        '--quiet',
      ],
      { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    child.stdout.on('data', (d) => {
      log += d;
    });
    child.stderr.on('data', (d) => {
      log += d;
    });
    child.once('error', reject);
    child.once('close', fulfill);
  });
  writeFileSync(logPath, log);
  if (code !== 0) throw new Error(`Lighthouse exited${code}; see ${logPath}`);
  const bytes = readFileSync(reportPath),
    report = JSON.parse(bytes),
    validation = validateReport(report, values.url);
  if (!validation.valid) throw new Error(`Rejected ${values.name}: ${validation.reason}`);
  const geometry = report.audits['comparison-content'].details.geometry;
  if (geometry.width !== width)
    throw new Error('Rendered viewport width differs from the requested width');
  const png = report.fullPageScreenshot?.screenshot?.data;
  if (!png) throw new Error('Lighthouse did not provide a screenshot');
  writeFileSync(imagePath, Buffer.from(png.split(',')[1], 'base64'));
  const result = {
    name: values.name,
    url: values.url,
    finalUrl: report.finalDisplayedUrl,
    valid: true,
    width,
    scrollWidth: geometry.scrollWidth,
    font: geometry.font,
    accessibility: report.categories.accessibility.score,
    contrast: report.audits['color-contrast'].score,
    failed: Object.entries(report.audits)
      .filter(([, a]) => a.score === 0)
      .map(([name]) => name),
    fetchTime: report.fetchTime,
    lighthouseVersion: report.lighthouseVersion,
    userAgent: report.userAgent,
    rawSha256: createHash('sha256').update(bytes).digest('hex'),
  };
  writeFileSync(
    join(runtime, 'reports', values.name + '.summary.json'),
    JSON.stringify(result, null, 2) + '\n',
  );
  console.log(JSON.stringify(result));
}
capture().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

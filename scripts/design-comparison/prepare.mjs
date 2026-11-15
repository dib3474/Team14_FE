import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  copyFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const tools = dirname(fileURLToPath(import.meta.url));
const root = resolve(tools, '../..');
const runtime = join(root, 'superpowers/comparison');
const sources = join(runtime, 'sources');
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 128 * 1024 * 1024 });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const shaFor = (ref) =>
  git('rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`).toString().trim();
const variants = [
  { name: 'original', ref: process.env.ORIGINAL_REF || 'develop', port: 5180 },
  { name: 'previous', ref: process.env.PREVIOUS_REF || 'feature/mobile-design', port: 5181 },
  { name: 'new', ref: 'HEAD', port: 5182 },
  {
    name: 'independent',
    ref: process.env.INDEPENDENT_REF || 'feature/brand-ui-comparison',
    port: 5183,
  },
];

const assertFreePort = (port) =>
  new Promise((fulfill, reject) => {
    const server = createServer();
    server.once('error', (error) =>
      reject(
        new Error(
          `Port ${port} is unavailable (${error.code}). Stop the comparison servers before preparing; no process will be killed.`,
        ),
      ),
    );
    server.listen(port, '127.0.0.1', () => server.close(fulfill));
  });

function modulesFor(variant) {
  const fallback = join(root, 'node_modules');
  // A matching previous checkout may have its own locked dependencies. Read it only.
  if (variant.name === 'previous') {
    const entries = git('worktree', 'list', '--porcelain', '-z').toString().split('\0\0');
    for (const entry of entries) {
      const fields = entry.split('\0');
      const path = fields.find((field) => field.startsWith('worktree '))?.slice(9);
      if (
        path &&
        fields.includes(`HEAD ${variant.sha}`) &&
        existsSync(join(path, 'node_modules/vite/bin/vite.js'))
      ) {
        return realpathSync(join(path, 'node_modules'));
      }
    }
  }
  if (!existsSync(join(fallback, 'vite/bin/vite.js'))) {
    throw new Error('Missing root node_modules. Run npm ci in the repository before prepare.mjs.');
  }
  return realpathSync(fallback);
}

function extractSnapshot(variant, staging) {
  // Reject links and traversal before handing this local Git archive to tar.
  const tree = git('ls-tree', '-rz', '--full-tree', variant.sha)
    .toString()
    .split('\0')
    .filter(Boolean);
  for (const entry of tree) {
    const tab = entry.indexOf('\t');
    const mode = entry.slice(0, 6);
    const name = entry.slice(tab + 1);
    if (mode === '120000' || name.startsWith('/') || name.split('/').includes('..')) {
      throw new Error(
        `Unsafe archive entry in ${variant.ref}: ${name}. Comparison snapshots do not extract symbolic links.`,
      );
    }
  }
  const destination = join(staging, variant.name);
  mkdirSync(destination);
  const archive = git('archive', '--format=tar', variant.sha);
  execFileSync('tar', ['-xf', '-', '-C', destination], { input: archive, maxBuffer: 1024 * 1024 });
  symlinkSync(variant.modules, join(destination, 'node_modules'), 'dir');
  return destination;
}

function configFor(variant) {
  return `import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fixtureResponse} from ${JSON.stringify(join(runtime, 'fixture-api.mjs'))};
const root=${JSON.stringify(variant.root)};
const shared=${JSON.stringify(runtime)};
const port=${variant.port};
export default defineConfig(({command})=>{if(command!=='serve')throw new Error('Comparison configs are development-only');return {root,plugins:[react(),tailwind(),{
  name:'local-comparison-only',
  transformIndexHtml(html,context){if(context.path.startsWith('/superpowers/'))return html;return html.replace('/src/main.tsx','/superpowers/comparison/bootstrap.tsx');},
  configureServer(server){server.middlewares.use((req,res,next)=>{
    const url=new URL(req.url,'http://127.0.0.1:'+port);
    if(url.pathname.startsWith('/__fixtures/')){
      const name=url.pathname.slice('/__fixtures/'.length);
      if(!['flowers.png','jeonju.jpg','palace.jpg'].includes(name)){res.statusCode=404;res.end();return;}
      try{const file=readFileSync(join(shared,'assets',name));res.setHeader('Content-Type',name.endsWith('.png')?'image/png':'image/jpeg');res.end(file);}catch{res.statusCode=404;res.end();}return;
    }
    if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/oauth2/')){
      const reply=fixtureResponse(req.method,url,req.headers.referer);res.writeHead(reply.status,{'content-type':'application/json',...reply.headers});res.end(JSON.stringify(reply.body));return;
    }
    next();
  });}
}],resolve:{alias:[
  {find:'@/context/AuthContext',replacement:root+'/superpowers/comparison/templates/auth.tsx'},
  {find:'@/context/WebSocketContext',replacement:root+'/superpowers/comparison/socket.tsx'},
  {find:'@/hooks/useSearch',replacement:root+'/superpowers/comparison/search.ts'},
  {find:'@',replacement:root+'/src'}
]},define:{global:'window','import.meta.env.VITE_API_BASE_URL':JSON.stringify('http://127.0.0.1:'+port),'import.meta.env.VITE_ENABLE_MSW':JSON.stringify('false'),'import.meta.env.VITE_ENABLE_RQ_DEVTOOLS':JSON.stringify('false')},server:{host:'127.0.0.1',port,strictPort:true,fs:{allow:[root,shared,${JSON.stringify(variant.modules)}]}}};});
`;
}

function assertOwnedRuntime() {
  // Never follow a user-created runtime link into an actual checkout.
  for (const path of [
    join(root, 'superpowers'),
    runtime,
    sources,
    join(sources, 'original'),
    join(sources, 'previous'),
    join(sources, 'independent'),
  ]) {
    let stat;
    try {
      stat = lstatSync(path);
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (stat.isSymbolicLink()) throw new Error(`Refusing linked comparison output: ${path}`);
    if (!stat.isDirectory()) throw new Error(`Comparison output must be a directory: ${path}`);
  }
  for (const name of ['original', 'previous', 'independent']) {
    if (existsSync(join(sources, name, '.git')))
      throw new Error(
        `Refusing to overwrite an actual Git checkout in sources/${name}. Move it before preparing snapshots.`,
      );
  }
}

async function prepare() {
  assertOwnedRuntime();
  for (const variant of variants) {
    variant.sha = shaFor(variant.ref);
    variant.root = variant.name === 'new' ? root : join(sources, variant.name);
    variant.modules = modulesFor(variant);
    await assertFreePort(variant.port);
  }
  // Verify the fixture sources exist before changing any generated output.
  for (const name of [
    'fixture-api.mjs',
    'fixture.json',
    'templates/bootstrap.tsx',
    'templates/auth.tsx',
    'templates/socket.tsx',
    'templates/search.ts',
    'templates/index.html',
  ])
    readFileSync(join(tools, name));
  const assetBytes = Object.fromEntries(
    ['flowers.png', 'jeonju.jpg', 'palace.jpg'].map((name) => [
      name,
      git('show', `${variants[1].sha}:src/mocks/assets/${name}`),
    ]),
  );
  mkdirSync(sources, { recursive: true });
  const staging = mkdtempSync(join(sources, '.prepare-'));
  try {
    const extracted = new Map();
    for (const variant of variants.filter((variant) => variant.name !== 'new'))
      extracted.set(variant.name, extractSnapshot(variant, staging));
    for (const variant of variants.filter((variant) => variant.name !== 'new')) {
      if (existsSync(variant.root) && lstatSync(variant.root).isSymbolicLink())
        throw new Error(`Refusing to replace linked snapshot directory: ${variant.root}`);
      rmSync(variant.root, { recursive: true, force: true });
      renameSync(extracted.get(variant.name), variant.root);
    }
    mkdirSync(join(runtime, 'assets'), { recursive: true });
    for (const [name, bytes] of Object.entries(assetBytes))
      writeFileSync(join(runtime, 'assets', name), bytes);
    for (const name of ['fixture-api.mjs', 'fixture.json'])
      copyFileSync(join(tools, name), join(runtime, name));
    copyFileSync(join(tools, 'templates/index.html'), join(runtime, 'index.html'));
    for (const variant of variants) {
      const local = join(variant.root, 'superpowers/comparison');
      mkdirSync(local, { recursive: true });
      for (const name of ['bootstrap.tsx', 'socket.tsx', 'search.ts'])
        copyFileSync(join(tools, 'templates', name), join(local, name));
      mkdirSync(join(local, 'templates'), { recursive: true });
      copyFileSync(join(tools, 'templates/auth.tsx'), join(local, 'templates/auth.tsx'));
      copyFileSync(join(tools, 'fixture.json'), join(local, 'fixture.json'));
      writeFileSync(join(local, 'vite.comparison.config.mjs'), configFor(variant));
    }
    const fixture = readFileSync(join(tools, 'fixture.json'));
    writeFileSync(
      join(runtime, 'sources.json'),
      JSON.stringify(
        {
          schemaVersion: 1,
          generatedAt: new Date().toISOString(),
          sources: Object.fromEntries(variants.map((variant) => [variant.name, variant])),
          newWorkingTreeDirty:
            git('status', '--porcelain', '--untracked-files=no').toString().trim().length > 0,
          fixture: {
            sha256: hash(fixture),
            apiSha256: hash(readFileSync(join(tools, 'fixture-api.mjs'))),
            assets: Object.fromEntries(
              Object.entries(assetBytes).map(([name, bytes]) => [name, hash(bytes)]),
            ),
            variants: {
              default: 'Shared signed-in display fixture',
              login: '/login keeps JWT exchange anonymous (401)',
              empty: '?demo=empty',
              error: '?demo=error',
              text: '?text=200',
              search: '/search?q=수국',
            },
          },
        },
        null,
        2,
      ) + '\n',
    );
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
  console.log(
    'Prepared isolated comparison snapshots. Actual original/previous checkouts are unchanged.',
  );
  for (const variant of variants)
    console.log(
      `${variant.name}: ${variant.ref} ${variant.sha.slice(0, 12)} → 127.0.0.1:${variant.port}`,
    );
  console.log('Next: node scripts/design-comparison/start.mjs');
}

prepare().catch((error) => {
  console.error(`Comparison preparation failed: ${error.message}`);
  process.exitCode = 1;
});

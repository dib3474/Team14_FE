import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const runtime = join(root, 'superpowers/comparison');
const children = new Set();
let stopping = false;

const assertFreePort = (port) =>
  new Promise((fulfill, reject) => {
    const server = createServer();
    server.once('error', (error) =>
      reject(
        new Error(
          `127.0.0.1:${port} is unavailable (${error.code}). Close the server using this port and retry. No existing process was stopped.`,
        ),
      ),
    );
    server.listen(port, '127.0.0.1', () => server.close(fulfill));
  });

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill('SIGTERM');
  const timeout = setTimeout(() => {
    for (const child of children) child.kill('SIGKILL');
  }, 3000);
  timeout.unref();
}

async function start() {
  const manifestPath = join(runtime, 'sources.json');
  if (!existsSync(manifestPath))
    throw new Error('Run node scripts/design-comparison/prepare.mjs first.');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 1)
    throw new Error(
      'Comparison manifest is outdated. Stop active comparison servers, then run prepare.mjs.',
    );
  const variants = ['original', 'previous', 'new'].map((name, index) => {
    const source = manifest.sources?.[name];
    const expectedRoot = name === 'new' ? root : join(runtime, 'sources', name);
    if (source?.root !== expectedRoot || source.port !== 5180 + index)
      throw new Error(`Invalid ${name} manifest path/port. Run prepare.mjs from this checkout.`);
    const config = join(expectedRoot, 'superpowers/comparison/vite.comparison.config.mjs');
    const vite = join(expectedRoot, 'node_modules/vite/bin/vite.js');
    if (!existsSync(config) || !existsSync(vite))
      throw new Error(`Missing ${name} config or dependencies. Run prepare.mjs again.`);
    return { ...source, name, config, vite };
  });
  for (const source of variants) await assertFreePort(source.port);
  process.once('SIGINT', () => stop(0));
  process.once('SIGTERM', () => stop(0));
  process.once('SIGHUP', () => stop(0));
  for (const source of variants) {
    if (stopping) break;
    const child = spawn(
      process.execPath,
      [
        source.vite,
        '--config',
        source.config,
        '--host',
        '127.0.0.1',
        '--port',
        String(source.port),
        '--strictPort',
      ],
      { cwd: source.root, stdio: 'inherit' },
    );
    children.add(child);
    child.once('error', (error) => {
      children.delete(child);
      console.error(`${source.name} could not start: ${error.message}`);
      stop(1);
    });
    child.once('close', (code, signal) => {
      children.delete(child);
      if (!stopping) {
        console.error(
          `${source.name} Vite exited (${signal || code}). Stopping only this command’s remaining child servers.`,
        );
        stop(1);
      }
    });
  }
  console.log('Starting comparison servers on 127.0.0.1:5180 / 5181 / 5182.');
  console.log('Hub: http://127.0.0.1:5182/superpowers/comparison/index.html');
  console.log('Press Ctrl+C to stop only the three child servers started by this command.');
}

start().catch((error) => {
  console.error(`Comparison startup failed: ${error.message}`);
  stop(1);
});

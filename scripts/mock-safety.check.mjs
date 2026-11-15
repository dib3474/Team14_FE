import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfigFromFile } from 'vite';
const aliasFor = (config, name) =>
  Array.isArray(config.resolve?.alias)
    ? config.resolve.alias.find((a) => a.find === name)?.replacement
    : config.resolve?.alias?.[name];
test('mock auth and sockets are aliased only in dev serve, never in any build mode', async () => {
  const previous = process.env.VITE_ENABLE_MSW;
  process.env.VITE_ENABLE_MSW = 'true';
  try {
    const serve = (await loadConfigFromFile({ command: 'serve', mode: 'development' })).config;
    assert.match(aliasFor(serve, '@/context/AuthContext') || '', /MockAuthContext/);
    assert.match(aliasFor(serve, '@/context/WebSocketContext') || '', /MockWebSocketContext/);
    assert.match(aliasFor(serve, '@/hooks/useSearch') || '', /MockSearch/);
    for (const mode of ['production', 'mock', 'development']) {
      const build = (await loadConfigFromFile({ command: 'build', mode })).config;
      assert.equal(aliasFor(build, '@/context/AuthContext'), undefined);
      assert.equal(aliasFor(build, '@/context/WebSocketContext'), undefined);
      assert.equal(aliasFor(build, '@/hooks/useSearch'), undefined);
      assert.equal(build.define['import.meta.env.VITE_ENABLE_MSW'], JSON.stringify('false'));
    }
  } finally {
    if (previous === undefined) delete process.env.VITE_ENABLE_MSW;
    else process.env.VITE_ENABLE_MSW = previous;
  }
});

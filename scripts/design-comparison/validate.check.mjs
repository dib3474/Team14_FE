import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReport } from './validate.mjs';
const report = (url, ready = true) => ({
  finalDisplayedUrl: url,
  audits: { 'comparison-content': { details: { geometry: { ready } } } },
});
test('rejects a successful login render substituted for the requested protected screen', () => {
  assert.equal(
    validateReport(
      report('http://127.0.0.1:5182/login?continue=%2Fsettings'),
      'http://127.0.0.1:5182/settings',
    ).valid,
    false,
  );
});
test('rejects an unexpected recommendation step on the same pathname', () => {
  assert.equal(
    validateReport(
      report('http://127.0.0.1:5182/pick/2?step=style'),
      'http://127.0.0.1:5182/pick/2?step=mbti',
    ).valid,
    false,
  );
});
test('accepts rendered content at the exact requested route and parameters', () => {
  assert.equal(
    validateReport(
      report('http://127.0.0.1:5182/pick/2?step=mbti'),
      'http://127.0.0.1:5182/pick/2?step=mbti',
    ).valid,
    true,
  );
});
test('rejects incomplete content even when the pathname matches', () => {
  assert.equal(
    validateReport(
      report('http://127.0.0.1:5182/settings', false),
      'http://127.0.0.1:5182/settings',
    ).valid,
    false,
  );
});

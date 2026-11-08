import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('project files exist', () => {
  for (const f of ['server/index.js','public/index.html','public/js/app.js','public/css/styles.css','package.json']) {
    assert.ok(fs.existsSync(f), f);
  }
});

test('manifest and health endpoint reference present', () => {
  const html = fs.readFileSync('public/index.html','utf8');
  assert.match(html, /manifest\.webmanifest/);
  const server = fs.readFileSync('server/index.js','utf8');
  assert.match(server, /\/api\/health/);
});

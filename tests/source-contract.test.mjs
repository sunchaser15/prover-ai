import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

test('submission form sends selected images to the submissions API', () => {
  const source = read('app/components/submission-form.tsx');

  assert.match(source, /images:\s*encodedImages/, 'POST body must include encoded images');
  assert.match(source, /encodedImages\s*=\s*await\s+Promise\.all\(/, 'images must be encoded before JSON submit');
  assert.match(source, /fileToDataUrl/, 'selected File objects must be converted before JSON submit');
});

test('AI checks include image parts for Gemini and OpenRouter requests', () => {
  const source = read('app/lib/ai-check.ts');

  assert.match(source, /images\?:\s*AiInputImage\[\]/, 'createAiCheck must accept images');
  assert.match(source, /inlineData:\s*\{/, 'Gemini request must include inline image data');
  assert.match(source, /image_url:\s*\{\s*url:/, 'OpenRouter request must include image_url content parts');
});

test('production sessions require an explicit SESSION_SECRET', () => {
  const source = read('app/lib/auth.ts');

  assert.match(source, /SESSION_SECRET is required in production/, 'production must fail closed without SESSION_SECRET');
  assert.doesNotMatch(source, /process\.env\.SESSION_SECRET \?\? "dev-session-secret-change-me"/, 'production must not silently use the dev secret');
});

test('package.json does not keep unused server/database/rendering dependencies', () => {
  const pkg = JSON.parse(read('package.json'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  for (const name of [
    '@neondatabase/serverless',
    '@prisma/adapter-better-sqlite3',
    '@prisma/adapter-neon',
    'better-sqlite3',
    'shader-park-core',
    'shaders',
    'ws',
  ]) {
    assert.equal(deps[name], undefined, `${name} should be removed`);
  }
});

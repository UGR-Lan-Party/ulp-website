import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const tailwindRequire = createRequire(require.resolve('tailwindcss'));
const watcherRequire = createRequire(tailwindRequire.resolve('chokidar'));
const braces = watcherRequire('braces');

test('El parser de patrones rechaza anidaciones hostiles antes de agotar la pila', () => {
  for (const [open, close] of [
    ['{', '}'],
    ['(', ')'],
  ]) {
    const hostile = open.repeat(4000) + 'a,b' + close.repeat(4000);
    for (const method of ['parse', 'compile', 'expand', 'stringify']) {
      assert.throws(() => braces[method](hostile), {
        name: 'SyntaxError',
        message: 'Maximum nesting depth exceeded',
      });
    }
  }
  assert.deepEqual(braces.expand('src/{components,pages}/**/*.{astro,ts}'), [
    'src/components/**/*.astro',
    'src/components/**/*.ts',
    'src/pages/**/*.astro',
    'src/pages/**/*.ts',
  ]);
});

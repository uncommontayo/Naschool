import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { buildGame } from '../tools/build_game.mjs';

test('public/play/game.js is built from game-src/', async () => {
  const { code } = await buildGame();
  const current = await readFile(new URL('../public/play/game.js', import.meta.url), 'utf8');
  assert.equal(current, code, 'game.js does not match game-src/. Run: npm run build:game');
});

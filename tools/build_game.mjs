// Assembles public/play/game.js from the files in game-src/, in file-name order.
//
//   node tools/build_game.mjs           write public/play/game.js
//   node tools/build_game.mjs --check   exit 1 if game.js does not match game-src/
//
// The game is one browser script, so the numeric prefixes (00-, 01-, ...) are the
// order the code runs in. No dependencies.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = path.join(rootDirectory, 'game-src');
const outputFile = path.join(rootDirectory, 'public', 'play', 'game.js');

export async function buildGame() {
  const names = (await readdir(sourceDirectory)).filter((name) => /^\d\d-.+\.js$/.test(name)).sort();
  if (!names.length) throw new Error('No source files found in game-src/');
  const parts = await Promise.all(names.map((name) => readFile(path.join(sourceDirectory, name), 'utf8')));
  return { names, code: parts.join('') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { names, code } = await buildGame();
  if (process.argv.includes('--check')) {
    const current = await readFile(outputFile, 'utf8');
    if (current !== code) {
      console.error('public/play/game.js does not match game-src/. Run: npm run build:game');
      process.exit(1);
    }
    console.log(`game.js matches game-src/ (${names.length} files).`);
  } else {
    await writeFile(outputFile, code, 'utf8');
    console.log(`Built public/play/game.js from ${names.length} files (${Buffer.byteLength(code)} bytes).`);
  }
}

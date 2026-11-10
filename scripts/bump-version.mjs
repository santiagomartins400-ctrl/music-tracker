// Sobe a versão da app em todos os sítios de uma vez e atualiza a cache do sw.js.
// Uso: node scripts/bump-version.mjs 2.40.0
import { readFile, writeFile } from 'node:fs/promises';

const next = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(next || '')) {
  console.error('Indica a nova versão, por exemplo: node scripts/bump-version.mjs 2.40.0');
  process.exit(1);
}

const cur = JSON.parse(await readFile('desktop/package.json', 'utf8')).version;
const esc = s => s.replace(/\./g, '\\.');
const files = [
  ['desktop/package.json', [[new RegExp(`"version": "${esc(cur)}"`), `"version": "${next}"`]]],
  ['desktop/README.md', [[new RegExp(`Setup ${esc(cur)}\\.exe`, 'g'), `Setup ${next}.exe`]]],
  ['.github/workflows/build-windows.yml', [
    [new RegExp(`tag_name: v${esc(cur)}`), `tag_name: v${next}`],
    [new RegExp(`name: Music Tracker ${esc(cur)}`), `name: Music Tracker ${next}`]]],
  ['index.html', [[new RegExp(esc(cur), 'g'), next]]],
  ['sw.js', [[/const CACHE = 'album-critico-v2-(\d+)'/, (m, n) => `const CACHE = 'album-critico-v2-${Number(n) + 1}'`]]],
];

for (const [file, reps] of files) {
  let s = await readFile(file, 'utf8');
  for (const [re, to] of reps) s = s.replace(re, to);
  await writeFile(file, s);
  console.log('atualizado:', file);
}
console.log(`Versão ${cur} -> ${next}. Revê com git diff antes de publicar.`);

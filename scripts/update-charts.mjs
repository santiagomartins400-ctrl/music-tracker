import { writeFile, mkdir } from 'node:fs/promises';

const COUNTRIES = ['pt', 'us', 'br', 'gb', 'es'];

async function feed(cc, kind) {
  const r = await fetch(`https://itunes.apple.com/${cc}/rss/${kind}/limit=50/json`);
  if (!r.ok) throw new Error(`${cc} ${kind} HTTP ${r.status}`);
  const j = await r.json();
  return (j.feed.entry || []).map((e, i) => {
    const imgs = e['im:image'] || [];
    return {
      rank: i + 1,
      title: e['im:name']?.label || '',
      artist: e['im:artist']?.label || '',
      cover: imgs.length ? imgs[imgs.length - 1].label : '',
      url: e.link?.attributes?.href || '',
      genre: e.category?.attributes?.label || ''
    };
  });
}

const out = { updated: new Date().toISOString(), countries: {} };
for (const cc of COUNTRIES) {
  try {
    const [albums, songs] = await Promise.all([feed(cc, 'topalbums'), feed(cc, 'topsongs')]);
    out.countries[cc] = { albums, songs };
    console.log(`${cc}: ${albums.length} álbuns, ${songs.length} músicas`);
  } catch (e) {
    console.warn(`${cc}: ${e.message}`);
  }
}

if (Object.keys(out.countries).length === 0) {
  console.error('Nenhum país foi atualizado; o ficheiro anterior mantém-se.');
  process.exit(1);
}

await mkdir('data', { recursive: true });
await writeFile('data/charts.json', JSON.stringify(out, null, 2));
console.log('data/charts.json atualizado');

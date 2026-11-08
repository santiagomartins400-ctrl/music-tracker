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
      url: e.link?.attributes?.href || ''
    };
  });
}

// Junta os tops dos vários países num único top global, somando pontos pela posição.
function aggregate(lists) {
  const map = new Map();
  for (const list of lists) {
    list.forEach((item, i) => {
      const key = `${item.artist}|${item.title}`;
      const points = 50 - i;
      if (map.has(key)) map.get(key).points += points;
      else map.set(key, { ...item, points });
    });
  }
  return [...map.values()]
    .sort((a, b) => b.points - a.points)
    .slice(0, 50)
    .map((x, i) => ({ rank: i + 1, title: x.title, artist: x.artist, cover: x.cover, url: x.url }));
}

const albumLists = [], songLists = [];
for (const cc of COUNTRIES) {
  try {
    const [albums, songs] = await Promise.all([feed(cc, 'topalbums'), feed(cc, 'topsongs')]);
    albumLists.push(albums);
    songLists.push(songs);
    console.log(`${cc}: ${albums.length} álbuns, ${songs.length} músicas`);
  } catch (e) {
    console.warn(`${cc}: ${e.message}`);
  }
}

if (albumLists.length === 0) {
  console.error('Nenhum top foi obtido; o ficheiro anterior mantém-se.');
  process.exit(1);
}

const out = {
  updated: new Date().toISOString(),
  global: { albums: aggregate(albumLists), songs: aggregate(songLists) }
};

await mkdir('data', { recursive: true });
await writeFile('data/charts.json', JSON.stringify(out, null, 2));
console.log('data/charts.json atualizado (top global)');

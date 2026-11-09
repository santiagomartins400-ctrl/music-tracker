import { writeFile, mkdir } from 'node:fs/promises';

const COUNTRIES = ['pt', 'us', 'br', 'gb', 'es'];
const UA = 'MusicTracker/2.14 (weekly chart job)';
const sleep = ms => new Promise(r => setTimeout(r, ms));

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
      genre: e.category?.attributes?.label || 'Outros'
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
    .map((x, i) => ({ rank: i + 1, title: x.title, artist: x.artist, genre: x.genre, cover: x.cover, url: x.url }));
}

// Top de artistas: soma os pontos dos álbuns em que cada artista aparece.
function topArtists(albums) {
  const map = new Map();
  albums.forEach(a => {
    const cur = map.get(a.artist) || { name: a.artist, points: 0, albums: 0, cover: a.cover };
    cur.points += 51 - a.rank;
    cur.albums += 1;
    map.set(a.artist, cur);
  });
  return [...map.values()].sort((a, b) => b.points - a.points).slice(0, 50)
    .map((x, i) => ({ rank: i + 1, name: x.name, albums: x.albums, cover: x.cover, photo: '' }));
}

// Foto do artista: MusicBrainz (encontrar) -> Wikidata (P18) -> Wikimedia Commons.
async function artistPhoto(name) {
  try {
    await sleep(1100);
    const s = await (await fetch(`https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(`artist:"${name}"`)}&limit=1&fmt=json`, { headers: { 'User-Agent': UA } })).json();
    const a = s.artists?.[0];
    if (!a || a.name.toLowerCase() !== name.toLowerCase()) return '';
    await sleep(1100);
    const d = await (await fetch(`https://musicbrainz.org/ws/2/artist/${a.id}?inc=url-rels&fmt=json`, { headers: { 'User-Agent': UA } })).json();
    const wd = (d.relations || []).find(r => r.type === 'wikidata')?.url?.resource;
    if (!wd) return '';
    const qid = wd.split('/').pop();
    const w = await (await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims&format=json`, { headers: { 'User-Agent': UA } })).json();
    const file = w.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    return file ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=400` : '';
  } catch (e) {
    console.warn(`foto de ${name}: ${e.message}`);
    return '';
  }
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

const albums = aggregate(albumLists);
const artists = topArtists(albums);
for (const ar of artists) {
  ar.photo = await artistPhoto(ar.name);
  console.log(`${ar.name}: ${ar.photo ? 'com foto' : 'sem foto'}`);
}

const out = {
  updated: new Date().toISOString(),
  global: { albums, songs: aggregate(songLists), artists }
};

await mkdir('data', { recursive: true });
await writeFile('data/charts.json', JSON.stringify(out, null, 2));
console.log('data/charts.json atualizado (top global)');

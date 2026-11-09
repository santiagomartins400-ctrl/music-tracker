/* Service worker: guarda a página e a app para funcionarem offline.
   Estratégia: cache primeiro para os ficheiros do site; rede para o resto (APIs de música e fotos). */
const CACHE = 'album-critico-v2-33';
const SHELL = [
  './',
  './index.html',
  './avaliador-albuns-v2.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Só tratamos os ficheiros do próprio site; as APIs externas vão sempre à rede.
  if (url.origin !== self.location.origin) return;

  // Páginas: primeiro a rede (para receberem sempre a versão nova); a cache só serve offline.
  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isPage) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});

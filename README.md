# Music Tracker — site de download

Página de download e instalação da aplicação de avaliação de álbuns.

## Ficheiros

- `index.html` — página de apresentação, download e instruções
- `avaliador-albuns-v2.html` — a aplicação (ficheiro único)
- `manifest.json` — permite instalar a página como app (PWA)
- `sw.js` — service worker, para funcionar offline depois da primeira abertura
- `icon.svg` — ícone da app

## Publicar no GitHub Pages

1. Cria um repositório novo no GitHub (ex.: `album-critico`).
2. Envia todos os ficheiros desta pasta para a raiz do repositório.
3. Vai a **Settings → Pages**.
4. Em **Source**, escolhe **Deploy from a branch**, branch `main`, pasta `/ (root)`.
5. Guarda. Em alguns minutos o site fica disponível em `https://<utilizador>.github.io/album-critico/`.

Todos os caminhos são relativos, por isso funciona em qualquer subpasta do GitHub Pages.

## Notas

- O service worker só regista em HTTPS (o GitHub Pages usa HTTPS por defeito).
- Para atualizar a app depois de alterar ficheiros, sobe a versão do `CACHE` em `sw.js` (ex.: `album-critico-v2-2`).

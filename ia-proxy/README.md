# Music IA — servidor (Cloudflare Worker)

A app é pública (GitHub Pages), por isso a chave da API nunca vai para o código.
Este Worker recebe as perguntas da app, fala com o Claude usando uma chave guardada no Cloudflare e devolve a resposta.

## Passos (uma vez)

1. Cria uma conta gratuita em https://dash.cloudflare.com e uma chave da API em https://console.anthropic.com.
2. Instala o Wrangler (ferramenta da Cloudflare) e entra na conta:
   ```
   npm install -g wrangler
   wrangler login
   ```
3. Dentro da pasta `ia-proxy`, guarda a chave como segredo (não aparece no código):
   ```
   wrangler secret put ANTHROPIC_API_KEY
   ```
4. Publica:
   ```
   wrangler deploy
   ```
   Vai aparecer um endereço do tipo `https://music-ia.<a-tua-conta>.workers.dev`.
5. Na app (`avaliador-albuns-v2.html`), procura `window.MUSIC_IA_ENDPOINT` e põe esse endereço como valor por defeito.
   Em alternativa, define-o antes do script. Depois publica a app como de costume.

## Limites
- Só aceita pedidos vindos de `https://santiagomartins400-ctrl.github.io` (ver `ALLOWED_ORIGINS` em `worker.js`).
- Cada pedido envia no máximo 8 mensagens e 400 tokens de resposta.
- Para limitar o gasto, define um limite de utilização na consola da Anthropic.
- Para limitar pedidos por IP, podes ativar uma regra de limitação de pedidos no painel da Cloudflare.

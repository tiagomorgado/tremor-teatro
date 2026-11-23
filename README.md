# Tremor Teatro: novo site

React 19 + React Router 7 (framework mode, totalmente pré-renderizado) + Tailwind CSS 4 + Motion + Lenis.
Cada página é gerada em HTML estático no build, por isso o site corre em qualquer alojamento estático
(incluindo o cPanel atual), sem servidor Node.

## Comandos

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # gera build/client (HTML de todas as páginas, sitemap.xml, 404.html)
npm run preview      # serve build/client em http://localhost:4173
npm run media        # reprocessa as fotografias de media-src/ para public/media/
npm run media:focus  # (macOS) recalcula o ponto de interesse das fotografias (rostos)
npm run audit        # verifica SEO de todas as páginas e as ligações externas
npm run media:fetch  # volta a descarregar as fotografias do site WordPress atual
```

Requer Node 20 ou superior.

## Publicar

O site é compilado **no computador**, não no servidor. `npm run build` gera em `build/client/`
o site pronto: HTML de cada página, JavaScript/CSS já otimizados, fotografias, `.htaccess`,
`sitemap.xml` e o script do formulário. O alojamento só precisa de servir esses ficheiros (e
correr o PHP do formulário); não precisa de Node, npm nem de qualquer build. Para mudar algo
no site: editar, `npm run build`, e voltar a carregar `build/client/`.

Copiar o **conteúdo** de `build/client/` (incluindo o ficheiro oculto `.htaccess`) para a raiz do
alojamento (`public_html` no cPanel). O `.htaccess` foi testado num Apache 2.4 real e trata de:

- **HTTPS obrigatório**, domínio sem `www` e barra final, sempre num único redirecionamento 301;
- **URLs antigos do WordPress**: páginas removidas/fundidas redirecionam (301) para o novo sítio,
  e `wp-admin`, `wp-login.php`, `xmlrpc.php`, `feed`… respondem 410 (desapareceram);
- **404 verdadeiro** (estado HTTP 404) com a página "Esta página saiu de cena";
- cabeçalhos de segurança (CSP, HSTS…), cache longa para `assets/`, `media/` e `og/`, e gzip.

O domínio `tremorteatro.pt` está escrito no `.htaccess`, em `app/data/site.ts`, em
`scripts/postbuild.mjs` e em `public/enviar-mensagem.php`. Para testar noutro domínio (ex.: um subdomínio de staging), mudar nesses
três sítios, ou comentar a regra "3. HTTPS, the bare domain…" do `.htaccess`.

Em Netlify/Vercel/Cloudflare Pages: diretório de publicação `build/client`, comando
`npm run build`. Estes serviços ignoram o `.htaccess` e não correm PHP: os redirecionamentos
teriam de ser replicados no formato deles e o formulário precisaria de `VITE_FORM_ENDPOINT`.

### Pré-visualização no GitHub Pages

`.github/workflows/pages.yml` publica o site em `https://<conta>.github.io/<repositório>/` a cada
`git push` para `main` (ou à mão, no separador Actions). Para ligar: no repositório, Settings →
Pages → Source: **GitHub Actions**. Essa versão:

- vive numa subpasta (`BASE_PATH=/<repositório>/`; caminhos, imagens e navegação adaptam-se);
- tem `noindex` em todas as páginas, para não competir no Google com o site verdadeiro;
- não inclui `.htaccess` nem `enviar-mensagem.php` (o GitHub Pages não os usa), por isso o
  formulário abre a aplicação de email do visitante.

Para a testar localmente: `BASE_PATH=/tremor-teatro/ VITE_PREVIEW_URL=http://localhost/tremor-teatro npm run build`.
Depois, `npm run build` normal antes de publicar no alojamento.

### Lista de verificação para lançar

1. `npm run build` e `npm run audit` (deve terminar com "No problems found").
2. Publicar `build/client/` no alojamento e confirmar que o certificado SSL está ativo.
3. Abrir `http://www.tremorteatro.pt/secretum`: deve acabar em `https://tremorteatro.pt/secretum/`.
   Enviar uma mensagem de teste pelo formulário e confirmar que chega a `geral@` (ver também a
   pasta de spam).
4. Google Search Console: adicionar a propriedade `tremorteatro.pt` e submeter
   `https://tremorteatro.pt/sitemap.xml`. Usar "Inspeção de URL" na página inicial.
5. Testar uma página de criação em https://search.google.com/test/rich-results e uma partilha em
   https://developers.facebook.com/tools/debug/ (imagem de pré-visualização).
6. Se o WordPress antigo tinha "Desencorajar motores de pesquisa" ligado, isso deixa de se aplicar:
   o novo site não tem `noindex` (só a página 404).

## SEO

- Cada página tem título, descrição, URL canónico, Open Graph/Twitter e um único `<h1>`.
- Dados estruturados (schema.org): organização (todas as páginas), `WebSite`, criações
  (`CreativeWork`/`Movie`), galerias (`ImageGallery`), notícias (`NewsArticle`/`Article`),
  biografia (`ProfilePage` + `Person`) e breadcrumbs.
- `sitemap.xml` (páginas e as fotografias de cada página, para a pesquisa de imagens) e as
  imagens de partilha (JPEG 1200×630, em `og/`) são gerados no build.
- **GEO (assistentes de IA)**: `/llms.txt` é um resumo em texto simples da companhia, das
  criações (estreias e digressão), da fundadora, da imprensa e dos contactos, gerado a partir
  dos mesmos dados das páginas. As criações em digressão têm também `TheaterEvent` em JSON-LD.
- `npm run audit` verifica todas as páginas (títulos, descrições, canónicos, `h1`, ordem dos
  títulos, `alt`, JSON-LD, ligações internas partidas) e testa as ligações externas.

Os URLs são os mesmos do site WordPress (`/fogo-fatuo/`, `/galeria-secretum/`, `/noticias-dga/`…),
para não perder links nem posicionamento nos motores de busca.

## Conteúdo

Todo o texto vive em `app/data/`:

- `projects.ts`: criações (sinopse, ficha artística, galerias, vídeo, logótipos de apoios)
- `news.ts`: notícias e press releases
- `site.ts`: contactos, redes sociais, navegação, manifesto e biografia

### Espetáculos à venda

Cada criação tem um texto `availability` ("Espetáculo disponível para venda.") que só aparece,
com o botão "Pedir informação", quando `bookable: true`. Neste momento todas as criações já
foram apresentadas, por isso nenhuma tem `bookable`. Para voltar a pôr uma à venda, basta
acrescentar `bookable: true` a essa criação em `projects.ts`.

### Fotografias

1. Colocar o original em `media-src/<conjunto>/<nome>.jpg` (ex.: `media-src/fogo-fatuo/fogo-fatuo-32.jpg`).
2. `npm run media:focus` (só em macOS): encontra o ponto de interesse de cada fotografia com o
   Vision da Apple (rostos primeiro, depois pessoas, depois saliência) e guarda-o em
   `scripts/focus.json`. É isto que mantém os rostos enquadrados nos recortes verticais do
   telemóvel e nos banners largos. O ficheiro fica no repositório, por isso o build funciona
   em qualquer sistema; fotografias sem entrada usam o centro, ligeiramente acima.
3. `npm run media`: gera AVIF + WebP em 640/1280/1920 px, um placeholder desfocado e o ponto de
   interesse.
4. Referenciar como `"fogo-fatuo/fogo-fatuo-32"` em `projects.ts`. Para forçar outro
   enquadramento numa criação, usar `coverPosition`/`heroPosition` (ex.: `"30% 20%"`).

As fotografias atuais vieram do WordPress e muitas têm apenas 1024 a 1366 px de largura.
Originais em alta resolução melhoram bastante os cabeçalhos em ecrã inteiro.

## Formulário de contacto

As mensagens vão para `public/enviar-mensagem.php`, um script pequeno que corre no próprio
alojamento e envia o email pelo sistema de correio do alojamento, como o WordPress fazia. Chega
a `geral@tremorteatro.pt`, com "Responder" a ir diretamente para o visitante. Configuração no
topo do ficheiro: `TO` (destino), `FROM` (remetente; tem de ser um endereço do domínio, para não
cair no spam) e a lista `SUBJECTS`, que tem de ser igual à de `app/routes/contacto.tsx`.

Precisa de PHP 8.1 ou superior (o alojamento atual tem 8.2). Em `npm run dev` não há PHP, por
isso o formulário prepara um email na aplicação de correio do visitante. Para usar um serviço
externo em vez do script (ex.: num alojamento sem PHP), definir `VITE_FORM_ENDPOINT` com um
endereço `https://` num ficheiro `.env` antes do build; a CSP é ajustada automaticamente.

### Segurança e spam

No servidor (`enviar-mensagem.php`), que é o que conta, porque o browser pode ser contornado:

- **Só aceita** POST em JSON, até 16 KB, vindo de páginas de `https://tremorteatro.pt`
  (cabeçalho `Origin`/`Referer`); tudo o resto é recusado.
- **Honeypot e tempo mínimo** repetidos no servidor: bots recebem "enviado" e nada é enviado.
- **Validação igual à do formulário**: nome sem ligações nem `< >`, email válido, assunto da
  lista, até 4000 caracteres e 3 ligações, caracteres de controlo/invisíveis removidos.
- **Sem injeção de cabeçalhos**: os cabeçalhos do email são construídos só a partir das
  constantes e do email validado; o texto do visitante vai no corpo, codificado em base64. Não
  é possível usar o formulário para enviar emails a terceiros.
- **Limite de frequência**: 3 mensagens por visitante a cada 10 minutos e 30 por hora no total.
  Guardado fora de `public_html` (`~/.tremor-contact/`), com o IP só em hash, apagado ao fim de
  uma hora.
- Não mostra erros do PHP ao visitante.

No browser (`app/lib/contact.ts`), para dar feedback imediato e travar bots simples:

- **Honeypot** (`_gotcha`): campo invisível que só bots preenchem. O envio é descartado em
  silêncio, sem dar pistas ao bot.
- **Tempo mínimo**: envios menos de 3 s depois de o formulário aparecer são tratados como bots.
- **Limite de frequência**: uma mensagem por minuto por visitante.
- **Validação e limpeza**: as mesmas regras do servidor.
- **Sem injeção pelo URL**: `?assunto=` só é aceite se for o nome de uma criação existente.
- **Endpoint externo só em HTTPS**: um `VITE_FORM_ENDPOINT` que não seja `https://` é recusado.
- **Content-Security-Policy em duas camadas**: a do `.htaccess` (geral) e, em cada página, uma
  `<meta>` gerada no build com o hash SHA-256 de cada script dessa página. Os browsers aplicam as
  duas: só correm os scripts do próprio site, e um script injetado é bloqueado (testado).
- **Outros cabeçalhos**: HSTS, `X-Frame-Options`, `Cross-Origin-Opener-Policy`,
  `Permissions-Policy`, `nosniff`. Ficheiros ocultos (`.env`, `.git`…) nunca são servidos.
- **YouTube** só carrega ao clicar, em `youtube-nocookie.com`, dentro de uma `sandbox`.

## Estrutura

```
app/
  root.tsx              documento, fontes, navegação, rodapé
  routes.ts             mapa de URLs (espelha o WordPress)
  routes/               páginas
  components/           Img (AVIF/WebP responsivo), Stage (Lenis + transição "cortina"),
                        Lightbox, MasonryGallery, YouTube (carrega só ao clicar), …
  components/home/      secções da página inicial
  data/                 conteúdo
scripts/                fetch-media, optimize-media, postbuild (sitemap + 404)
media-src/              fotografias originais
public/media/           fotografias otimizadas (geradas)
```

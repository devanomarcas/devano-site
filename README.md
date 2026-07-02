# Devano — Site (landing + blog)

Landing page e blog da Devano, construídos em Next.js. O blog lê arquivos
Markdown: para publicar um texto novo, você cria um arquivo `.md` e faz commit.
Nenhum código precisa ser tocado.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em http://localhost:3000

## Publicar um texto novo no blog

1. Crie um arquivo em `content/blog/` com nome em minúsculas e hífens.
   Ex.: `content/blog/meu-novo-texto.md`
2. No topo do arquivo, preencha o cabeçalho (entre as linhas `---`):

```markdown
---
titulo: "O título do texto"
resumo: "Uma ou duas frases que aparecem na listagem e na página."
data: "2026-07-01"
pilar: "Método"           # Método | Categoria | Ponto de vista | Caso
autor: "Lucas Mooneyhan"
capa: "/portfolio/minha-capa.jpg"   # opcional; coloque a imagem em /public/portfolio
---

Aqui começa o texto corrido. Use ## para subtítulos e > para citações.
```

3. (Opcional) Coloque a imagem de capa em `public/portfolio/`.
4. Faça commit. Na Vercel, o texto vai ao ar sozinho em segundos.

O tempo de leitura é calculado automaticamente. A data define a ordem
(mais recente primeiro). O texto aparece na home (3 mais recentes) e no /blog.

## Preencher o portfólio

Em `src/app/page.tsx`, localize a constante `projetos` (está vazia, com um
TODO). Adicione os 6 projetos:

```ts
const projetos = [
  { titulo: "Nome do Projeto", categoria: "Branding", capa: "/portfolio/projeto1.jpg", link: "https://instagram.com/p/..." },
  // ...
];
```

Coloque as imagens em `public/portfolio/`. A grade aparece automaticamente
quando houver pelo menos um projeto.

## Publicar na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em vercel.com, importe o repositório.
3. A Vercel detecta Next.js sozinha. Clique em Deploy.
4. Aponte o domínio quando quiser.

## Estrutura

- `src/app/page.tsx` — landing page
- `src/app/blog/` — índice e páginas de artigo
- `src/components/` — Nav, Footer, Reveal
- `src/lib/posts.ts` — leitura dos Markdown
- `content/blog/` — os textos (.md)
- `public/brand/` — logos e símbolo
- `public/portfolio/` — capas de blog e projetos

## Notas

- Fonte: Montserrat (oficial da marca). Medium (500) nos títulos, Thin (100)
  no texto corrido.
- AJUSTE RÁPIDO DE LEGIBILIDADE: o peso do texto corrido está isolado em uma
  variável no topo de `src/app/globals.css`, em `:root`:
      --peso-corpo: 100;   /* Thin */
  Se o Thin ficar fino demais ao ver no ar, troque 100 por 300 (Light) e faça
  commit. Nada mais precisa mudar. Títulos e labels não são afetados.
- Cores da marca em `src/app/globals.css` (`:root`): verde-musgo #434D42.
- Links de contato (WhatsApp, e-mail, redes) estão em `src/components/Footer.tsx`
  e em `page.tsx` — conferir antes de publicar.

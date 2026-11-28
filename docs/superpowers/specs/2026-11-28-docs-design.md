# /docs — documentação do Collie no site

## Intenção

Uma documentação completa do Collie no site, no formato das docs do Next.js e do NestJS: várias páginas com navegação
lateral, explicando cada funcionalidade, como elas se ligam e como funcionam por baixo, mais boas práticas. Hoje o site tem
`/features` (posts de venda, um por funcionalidade), `/blog` e `/changelog`. Falta o lugar para quem já instalou e quer
trabalhar bem com o Collie, ou entender o que acontece por trás.

## Objetivos

- Uma seção `/docs` (EN) e `/pt/docs` (PT) com sidebar, página longa e índice "Nesta página", no visual do site.
- Cobrir: começar, conceitos, cada funcionalidade, como funciona por baixo, referência da CLI e boas práticas.
- Escrever é editar Markdown: uma página = um arquivo, sem mexer em código.

## Não-objetivos (v1)

- Busca (⌘K). Fica para depois (Pagefind no build, sem servidor).
- Versionamento das docs por release. As docs descrevem a última tag publicada.
- Editor no admin para as docs (o admin do blog continua só do blog).

## Anti-objetivos

- Documentar comando, flag, rótulo ou limite que não está no app na tag publicada. Fonte da verdade:
  `~/Documents/codes/my-orchestrator-memory` na tag (hoje `v0.3.1`), lido com `git show <tag>:<arquivo>`; nunca o
  `main` local (divergiu do remoto) nem specs de design (descrevem intenção, não o que o código faz).
- Um visual que pareça outro site. As docs são parte do collie-web.
- Duplicar `/features`: as docs explicam e linkam para o post da funcionalidade, não repetem o texto de venda.

## Abordagens

- **A. Markdown no repo + pipeline do blog (escolhida).** `content/docs/<locale>/…md`, renderizado com o `marked` e os
  blocos de `src/lib/blocks.ts` que o blog já usa; layout próprio no visual do site. Sem dependência nova; escrever é
  Markdown; o build já valida blocos.
- **B. Framework de docs (Fumadocs, Nextra, Docusaurus).** Busca, sidebar e MDX prontos, mas dependência pesada, risco
  com o Next 16.4 e visual próprio que destoa do design system. Descartada pelo dono depois de ver as duas prévias
  (`docs/pages/docs-opcao-a|b/`, descartáveis).
- **C. Objetos TS tipados, como os posts de `/features`.** Rígido demais para páginas longas. Descartada.

O que a B tinha de bom (passos, avisos, abas, cartões) já existe como bloco do blog (`steps`, `callout`, `tabs`,
`compare`, `stats`) e entra nas docs sem custo.

## Decidido

- Abordagem A, visual da prévia A: header do site com o link "Docs" no Nav, sidebar à esquerda por grupos, conteúdo no
  meio (até ~760px), "Nesta página" à direita, anterior/próximo no rodapé, breadcrumb e eyebrow com a versão/estado
  ("PRÉVIA · 0.3.0") quando a funcionalidade é prévia.
- EN e PT, como o resto do site.
- O layout passa pelo designer antes do código (regra do projeto): frames no painel de design, no design system
  collie-web, desktop e 390px, Dark e Light.

## Estrutura do conteúdo (proposta inicial)

```
content/docs/<locale>/
  getting-started/   install, first-paddock, first-agent
  concepts/          shepherd-and-terminals, paddocks-and-worktrees, how-it-connects
  features/          loop, memory, fields, factory, network, sandbox, plugins, design-and-artifacts,
                     devices, browser, work-log, herds
  internals/         daemon-and-socket, agent-hooks, curator
  reference/         cli, collie-work-json
  guides/            best-practices
```

A ordem e os títulos da sidebar vêm de um arquivo único (`src/i18n/docs-nav.ts`), por locale; o slug da URL é o mesmo
nos dois locales (`/docs/features/fields` e `/pt/docs/features/fields`), para o hreflang. Cada página tem frontmatter
`title`, `description` e opcional `status` (`preview`) e `since` (versão).

## O que fica para o construtor

- Rotas: `src/app/(en)/docs/[[...slug]]` e `src/app/(pt)/pt/docs/[[...slug]]` com `dynamicParams = false`;
  `/docs` sem slug abre a primeira página (ou uma página índice, a decidir no frame).
- Leitura dos arquivos: reaproveitar `parsePost`/renderização de `src/lib/blog.ts` (extrair o que for comum, não copiar).
- Índice "Nesta página": a partir dos `h2`/`h3` do Markdown, com âncoras; reaproveitar `src/components/posts/Toc.tsx`
  se servir.
- Sitemap e metadata (`pageMetadata`, `alternates`) para cada página.
- Página que só existe num locale: falha no build (as docs são sempre bilíngues).
- Diagramas: SVG inline no Markdown ou imagem em `public/docs/`, no token do tema.
- Escrita do conteúdo: delegada por grupo a terminais escritores, com brief no estilo de `docs/briefs/`, cada comando
  conferido em `Sources/` na tag, resposta com "comando → arquivo:linha".
- Verificação: `prettier`, `tsc`, `eslint`, `npm run build`; QA visual em 1440 e 390, Dark e Light.

## Entrega

Todas as páginas de uma vez (decisão do dono, 2026-11-28), escritas em paralelo por vários terminais.

## Calls do Shepherd (revisáveis)

- Sidebar no mobile (390px): gaveta aberta por botão no topo do conteúdo; o frame do designer decide o desenho.
- Sem "Editar no GitHub" na v1 (o link da prévia sai), até o dono decidir expor o repo.
- Escrita: PT e EN no mesmo turno do escritor, na mesma página, como nos posts de `/features`.

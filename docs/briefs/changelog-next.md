# Brief — aba "Em breve" / "What's coming" no Changelog

Aprovado pelo dono. Referência visual e conteúdo: `docs/pages/changelog/index.html` (opção A, aba "Em breve";
abra com `#next`). Dados no array `ROADMAP` desse arquivo (PT). Fonte: repo `ysraelmoreno/collie`
(CHANGELOG `[Unreleased]`, commits `v0.1.7..main`, `docs/superpowers/roadmap/`). Nada inventado além disso.

## Decisões
- Abas no topo do Changelog: **Versões** (`/changelog`, como hoje) e **Em breve** / **What's coming**
  (`/changelog/next` e `/pt/changelog/next`). As abas são links (`<a>`, `aria-current="page"` na ativa), não JS:
  URL compartilhável e funciona sem JS. Contador ao lado do rótulo (8 versões, 7 itens).
- Página "Em breve": aviso curto sem datas; duas seções, **Na main** (pronto, entra na próxima versão) e
  **Planejado** (desenhado, não construído, pode mudar), com coluna lateral fixa como as versões; cards em 2 colunas
  no desktop, 1 no mobile, com tag de área, título, texto e par pedido → comando quando houver. Sem clipes.
- Área nova `plugins` ("Plug-ins").
- Termos EN como no resto do changelog (Loop, Shepherd, Paddock).

## Designer (arquivo de design `collie-web`, página Changelog)
Frame "Changelog / What's coming" em Desktop 1440 e Mobile 390, Dark e Light, com tokens do DS collie-web. Inclua
as abas também no frame de Versões existente. Não publique o DS sem o dono. Ao terminar, avise o terminal `dev-next`
com os nomes dos frames; o frame vence o protótipo em espaçamento e tipografia.

## Developer
1. Dados em `src/i18n/changelog.ts` (`roadmap`, en e pt), traduzindo com o tom curto da landing.
2. Rotas `src/app/(en)/changelog/next/page.tsx` e `src/app/(pt)/pt/changelog/next/page.tsx`, metadata por locale,
   sitemap, alternates EN/PT (o LanguageSwitch leva para a mesma aba no outro idioma).
3. Componente de abas compartilhado pelas duas páginas; reutilize `Command`, `Container`, Tag e o layout da opção A.
   Leia `node_modules/next/dist/docs/` antes de escrever rotas (AGENTS.md).
4. Dark e Light, 360–1440, foco visível.

Checks: `npm run lint`, `npm run typecheck`, `npm run build` (as duas rotas novas na saída). `npm run preview` e
screenshots de `/changelog/next` e `/pt/changelog/next` em 390 e 1440, Dark e Light, em `docs/qa/` (não commitar).

## Regras
Não toque em `media/`, `public/features/`, `docs/pages/`. Sem commit. Relate arquivos, saída dos checks e dúvidas.

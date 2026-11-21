# Brief — Developer: página CHANGELOG

Implementar `/changelog` (EN) e `/pt/changelog` (PT-BR) no site, a partir da opção **A · Linha do tempo** aprovada pelo
dono. Referência visual e conteúdo: `docs/pages/changelog/index.html` (protótipo, abra com a opção A). O designer está
passando a mesma tela para o arquivo de design `collie-web` (página Changelog); quando o frame existir, ele vence o
protótipo em espaçamento e tipografia.

## Leia antes
- `AGENTS.md`: esta versão do Next tem mudanças. Leia o guia em `node_modules/next/dist/docs/` antes de escrever rotas.
- Como a landing faz rotas EN/PT, i18n e dados: `src/app/(en)/page.tsx`, `src/app/(pt)/pt/page.tsx`, `src/i18n/`,
  `src/i18n/features/` (copy como dados), `src/components/landing/FeatureVideo.tsx` (vídeo com tema e reduced-motion:
  reutilize, não crie outro player), `src/components/landing/Nav.tsx`, `src/app/sitemap.ts`.

## O que entregar
1. **Dados**: `src/i18n/changelog.ts` com as releases do protótipo (`AREAS` e `RELEASES`), em `en` e `pt`. Traduza o PT
   para EN com o mesmo tom curto da landing; nada inventado além do que está no protótipo.
2. **Página**: rota EN e PT, layout da opção A: cabeçalho (eyebrow CHANGELOG, H1, lead), chips de filtro por área,
   uma seção por versão (coluna lateral fixa com versão, data e "Latest" na mais nova; manchete; cards de destaque com
   texto, par pedido → comando e clipe; listas Novo/Melhorado/Corrigido com a área). Âncora `#v0.1.7` etc. por versão.
   Filtro é client-side e sem dependência nova; sem JS a página mostra tudo.
3. **Clipes**: `public/features/<clip>.mp4|.jpg` e `-light`. Clipes por área: app→`trilho`, loop→`loop`,
   memory→`memory`, network→`network`, apps→`apps`, sandbox→`sandbox`, design→`design`, updates→`updates`.
   `trilho`, `memory`, `updates` e `design` estão sendo gravados por outros terminais; enquanto o arquivo não existir,
   o card mostra só o texto (sem placeholder quebrado).
4. **Navegação**: link "Changelog" no Nav e no footer (EN e PT), entrada no sitemap, metadata (title/description) por
   locale.
5. Dark e Light, 360px a 1440px, foco visível, `prefers-reduced-motion` como na landing.

## Checks
`npm run lint`, `npm run typecheck`, `npm run build` passam. Rode `npm run preview` e confira `/changelog` e
`/pt/changelog` em 390 e 1440, Dark e Light (screenshots em `docs/qa/` não são commitadas).

## Regras
- Não toque em `media/`, `public/features/` nem `docs/pages/`.
- Sem commit. Ao terminar, relate: arquivos, checks com saída, screenshots e dúvidas.

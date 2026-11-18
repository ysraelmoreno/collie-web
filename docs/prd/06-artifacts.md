# PRD 06 — Seção 09 · Artifacts, Prévia e comentários

Leia antes: [00-overview.md](00-overview.md). `id`: `artifacts`.

## O que é (fatos: `docs/referencia.md` § Artifacts, Prévia e modelos, Comentários, Importar HTML)

- `collie artifact new deck|dashboard|doc|prototype <nome>` cria uma página no projeto, já com os tokens do design
  system ativo (Light/Dark), e abre uma **Prévia** no canvas.
- Na Prévia você **fixa um comentário** num ponto da página; ele chega ao agente no próximo prompt e o agente responde
  na conversa (`collie comment reply`). Só você cria e resolve comentários.
- Uma página de slides vira `.pptx` editável ou PDF: `collie artifact export <id> --format pptx`.
- Páginas locais rodam **sem rede**: bibliotecas (React, etc.) vêm embutidas, fixadas por versão.
- `artifact new` grava a página em `docs/pages/<nome>/index.html` (arquivo do projeto, vai no git); versões `v<N>` e pastas valem para artifacts registrados (`artifact add`, export do Design), não para a página criada por `artifact new`. Dá para importar os do claude.ai.
- Só o usuário cria, continua e resolve comentários; o agente só responde (`comment reply`). O formato exato do recado no prompt não está na referência: o GIF mostra só `comment 1 · "…"`.

## O que falar

Mensagem: o que o agente desenha deixa de ser um HTML solto. Vira página no projeto, que você comenta apontando.

| | EN | PT-BR |
|---|---|---|
| Eyebrow | `09 · ARTIFACTS` | `09 · ARTIFACTS` |
| H2 | Point at it. The agent fixes it. | Aponte. O agente corrige. |
| Lead | Agents start decks, dashboards, docs and prototypes from templates themed with your tokens. Pin a comment on the preview and it lands in the agent's next prompt. | Agentes começam decks, dashboards, docs e protótipos por modelos com os seus tokens. Fixe um comentário na prévia e ele chega no próximo prompt do agente. |
| Bullets | Four templates, themed Light and Dark · Comments pinned to a spot on the page · Decks export to editable PowerPoint or PDF | Quatro modelos, com tema Light e Dark · Comentários fixados num ponto da página · Decks exportam para PowerPoint editável ou PDF |
| Prompt | Draft the pricing page as a prototype | Faça um protótipo da página de preços |
| Command | `collie artifact new prototype pricing` | igual |

## GIF `artifacts` — "comente apontando"

Cena: terminal `designer · claude` à esquerda; `PanelCard` `pricing · preview` grande à direita.

1. **"A page from a template, in your tokens."** `↳ collie artifact new prototype pricing`; a Prévia nasce com uma
   página de preços (3 cartões de plano); saída `docs/pages/pricing/index.html`.
2. **"You pin a comment where it is wrong."** Cursor clica no cartão do meio; alfinete numerado `1` + balão
   `"Make this plan the highlighted one"`.
3. **"It lands in the agent's next prompt."** Uma linha viaja do alfinete até o terminal; terminal mostra
   `comment 1 · "Make this plan the highlighted one"` e depois `↳ collie comment reply 1 "Done, Pro is highlighted"`.
4. **"The agent fixes it. You resolve it."** O cartão do meio ganha borda accent e selo "Popular"; o alfinete vira ✓ (quem resolve é o usuário). **Corrigido:** o rascunho mostrava tag `v1`→`v2`, mas `artifact new` não versiona.

Poster: batida 2 (alfinete + balão sobre a página).

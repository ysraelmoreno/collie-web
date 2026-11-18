# PRD 07 — Seção 10 · Diagram (diagrama)

Leia antes: [00-overview.md](00-overview.md). `id`: `diagram`.

## O que é (fatos: `docs/referencia.md` § Diagrama; comandos `diagram.get|set|mermaid|export|screenshot`)

- Painel **Diagrama**: editor de fluxogramas, raias, ERD e UML no canvas (motor draw.io embutido, roda sem rede).
- `collie panel open diagram --file <caminho.drawio>`: o diagrama é um arquivo `.drawio` do seu repositório.
- O agente escreve o diagrama a partir de Mermaid (`diagram.mermaid`), lê o atual (`diagram.get`) e exporta
  (`diagram.export`). Você edita à mão no mesmo painel.

`diagram export --format png|svg` (confirmado na referência). "draw.io" é marca da JGraph: use só
"compatível com arquivos .drawio", sem logo.

## O que falar

Mensagem: o agente desenha a arquitetura que acabou de ler no código; você ajusta arrastando; fica no repo.

| | EN | PT-BR |
|---|---|---|
| Eyebrow | `10 · DIAGRAM` | `10 · DIAGRAMA` |
| H2 | Architecture, drawn from the code. | Arquitetura, desenhada a partir do código. |
| Lead | Ask for a flowchart, an ERD or a sequence and the agent draws it in a diagram panel. You drag the boxes, it reads your changes back. The file lives in your repo. | Peça um fluxograma, um ERD ou uma sequência e o agente desenha num painel de diagrama. Você arrasta as caixas, ele lê suas mudanças. O arquivo mora no seu repo. |
| Bullets | Flowcharts, swimlanes, ERD and UML · Agents write it from Mermaid · A .drawio file, versioned with the code | Fluxogramas, raias, ERD e UML · Agentes escrevem a partir de Mermaid · Um arquivo .drawio, versionado com o código |
| Prompt | Draw the checkout flow from the code | Desenhe o fluxo de checkout a partir do código |
| Command | `collie diagram mermaid` | igual |

## GIF `diagram` — "do código ao desenho"

Cena: terminal `architect · claude` à esquerda; `PanelCard` `checkout.drawio · diagram` à direita, vazio com grade.

1. **"Ask for the flow."** `› Draw the checkout flow from the code`; terminal lista `reading src/checkout/…` (3
   linhas rápidas).
2. **"The agent draws it."** `↳ collie diagram mermaid`; caixas nascem uma a uma: `Cart → Payment → Order`, um
   losango `paid?` com ramo `no → Retry`; setas se desenham.
3. **"You move things by hand."** Cursor arrasta a caixa `Retry` para baixo; a seta acompanha.
4. **"It stays in the repo."** `↳ collie diagram get` → `docs/diagrams/checkout.drawio` (devolve `{file, xml, pages}`); chip
   com o mesmo caminho, ponto "modified" virando ✓ `saved` (o painel salva a cada mudança). **Corrigido:** o rascunho mostrava
   `5 nodes · 5 edges` e `committed`, que `diagram get` não devolve; o commit é do usuário. Caminho padrão é `docs/diagrams/<painel>.drawio`.

Poster: batida 3 (diagrama completo).

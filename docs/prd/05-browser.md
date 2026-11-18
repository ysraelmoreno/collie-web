# PRD 05 — Seção 08 · Browser (navegador)

Leia antes: [00-overview.md](00-overview.md). `id`: `browser`.

## O que é (fatos: `docs/referencia.md` § Navegador; comandos `browser.navigate|snapshot|click|fill|type|key|hover|
scroll|wait|text|eval|console|storage|screenshot|resize|emulate|reload`)

- Painel **Navegador** no canvas: `collie panel open browser --url http://localhost:3000`.
- O agente lê a página por um snapshot com refs de elementos, clica, preenche, espera, lê o console e tira screenshot.
- `resize` / `emulate` para checar larguras e modos (confira em `Sources/` o que `browser.emulate` aceita antes de
  citar: tema, dispositivo, etc.).
- Um terminal comum abre até 8 painéis de navegador, headless por padrão; o Pastor os abre visíveis no canvas.

## O que falar

Mensagem: o agente confere o próprio trabalho no navegador, ao lado do terminal, e você vê acontecer.

| | EN | PT-BR |
|---|---|---|
| Eyebrow | `08 · BROWSER` | `08 · NAVEGADOR` |
| H2 | Agents that check their own work. | Agentes que conferem o próprio trabalho. |
| Lead | A browser panel sits next to the terminal. The agent opens your dev server, clicks through the flow, reads the console and screenshots the result before telling you it works. | Um painel de navegador fica ao lado do terminal. O agente abre seu dev server, clica pelo fluxo, lê o console e tira um screenshot antes de dizer que funciona. |
| Bullets | Click, fill and wait by element ref · Console and storage, readable by the agent · Resize to check 360px without leaving the canvas | Clica, preenche e espera por ref de elemento · Console e storage, legíveis pelo agente · Redimensiona para checar 360px sem sair do canvas |
| Prompt | Check the signup form at 360px | Confira o formulário de cadastro em 360px |
| Command | `collie browser snapshot` | igual |

## GIF `browser` — "confere antes de avisar"

Cena: terminal `shepherd · claude` (só o Pastor abre painel visível por padrão; terminal comum precisa de `--visible`) à esquerda, `PanelCard` `localhost:3000 · browser` à direita com uma página simples
(título + formulário de 2 campos + botão).

1. **"The dev server opens on the canvas."** `↳ collie panel open browser --url http://localhost:3000`; painel nasce e
   a página carrega.
2. **"The agent drives it by element ref."** `↳ collie browser snapshot` → `- textbox "Email" [ref=e4]` `- button "Sign up" [ref=e6]` (formato real do snapshot);
   `↳ collie browser fill e4 a@b.co`, `↳ collie browser click e6` (a ref é posicional, não há `--ref`); no painel o campo é preenchido e o botão
   pisca.
3. **"It reads the console."** `↳ collie browser console` → `[error] POST /api/signup 422` (formato real do console) em aviso; o agente edita
   (linha `fixed: email validation`) e recarrega: toast verde "Account created".
4. **"And checks it small."** `↳ collie browser resize --width 360 --height 780`; a página fica com largura de telefone dentro do mesmo painel (`resize` não muda o painel; a página é escalada para caber), layout
   empilha; `↳ collie browser screenshot` → flash + `saved signup-360.png`.

Correção: `wait` espera texto/seletor (não ref); a bullet 1 da copy diz isso.

Poster: batida 4 (painel estreito + toast verde).

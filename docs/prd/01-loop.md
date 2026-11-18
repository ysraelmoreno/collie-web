# PRD 01 — Seção 04 · Loop (laço autônomo)

Leia antes: [00-overview.md](00-overview.md) (contrato, regras dos GIFs, DoD). `id`: `loop`.

## O que é (fatos, de `docs/referencia.md` § Registro de trabalho)

- `collie work run` roda as tarefas abertas de um trabalho sem ninguém olhando. No Claude e no Cursor: `/collie:loop`.
- Cada tentativa é um **agente novo**; o `--check` da tarefa (um comando) decide se passou. Não é o agente que se
  declara pronto.
- O dono aprova tarefas, checks e limites num **cartão do app** antes de qualquer coisa rodar.
- Limites duros: `--max` ≤ 30 tentativas, turno ≤ 4 h, `--budget` total. Roda só num cercado, sob sandbox estrito.
- `collie work stop` para depois do veredito atual. O painel Trabalho mostra `em laço: <tarefa> (tentativa 2/3)`.

## O que falar

Mensagem: você define o que é "pronto" com um check, aprova uma vez e sai. O laço tenta até o check passar.

| | EN | PT-BR |
|---|---|---|
| Eyebrow | `04 · LOOP` | `04 · LAÇO` |
| H2 | Work that runs while you sleep. | Trabalho que roda sem você. |
| Lead | Give each task a check and approve the list once. Collie runs a fresh agent per attempt, and the check decides when a task is done. Not the agent. | Dê um check a cada tarefa e aprove a lista uma vez. O Collie roda um agente novo por tentativa, e é o check que decide quando a tarefa acabou. Não o agente. |
| Bullets | A fresh agent per attempt · You approve tasks, checks and limits on a card · Runs in a paddock, under the strict sandbox | Um agente novo por tentativa · Você aprova tarefas, checks e limites num cartão · Roda num cercado, sob o sandbox estrito |
| Prompt | Run the open tasks until the tests pass | Rode as tarefas abertas até os testes passarem |
| Command | `collie work run --max 10` | igual |

## GIF `loop` — "o check decide"

Cena: à esquerda o painel **Work** com 3 tarefas e seus checks; à direita um terminal `loop · claude`; no centro,
em cima, o cartão de aprovação.

1. **"You list the tasks. Each one has a check."** Painel Work mostra `fix login redirect — npm test`,
   `add /pt sitemap — npm run build`, `a11y: focus ring — npm run lint`.
2. **"You approve once."** Cartão `Run loop? 3 tasks · max 10 attempts` → cursor clica **Allow**.
3. **"A fresh agent per attempt. The check decides."** Tarefa 1: tag `attempt 1/3`, terminal digita, check `✗ 2
   failing`; terminal some e nasce outro (`attempt 2/3`), check `✓`. Tarefa vira ✓ verde.
4. **"Done while you were away."** Tarefas 2 e 3 passam rápido; linha final `[collie] Loop finished: 3/3 tasks`.

Poster: quadro da batida 4.

## Correções da verificação (2026-11-18, contra `docs/referencia.md` e `Sources/`)

- **A linha final não existe como no PRD.** `[collie] Loop finished: 3/3 tasks` é inventada. A real (daemon,
  `WorkLoopCommands.swift`) é `[collie] Laço de "<trabalho>" terminou: <n> feitas, <m> adiadas. Veja: collie work
  status`, em português, e chega ao **Pastor**, não ao terminal do laço. O GIF usa essa linha literal na batida 4.
- **O agente de cada tentativa se chama `loop-<tarefa>-<n>`** (ex.: `loop-fix-login-1`); o terminal do GIF usa isso.
- **Passar = check exit 0 + commit novo + árvore limpa**, não só o check. Quem falha vira nota do trabalho (o próximo
  agente lê) e a worktree volta ao commit inicial. O GIF mostra `failure saved as a work note`.
- **O cartão do app é em PT** (Permitir/Negar); o GIF usa `Allow`/`Deny` por ser em inglês. Real: o cartão lista o
  cercado, os limites e cada tarefa com o seu check.
- A tag do painel real é `em laço: <tarefa> (tentativa 2/3)`; o GIF usa `attempt 2/3` na linha da tarefa.
- Copy (`loop.ts`) conferida: sem mudança.
- Composição em `media/loop/index.html` escrita (lint ok); **ainda sem render** (Chrome não abre neste terminal).

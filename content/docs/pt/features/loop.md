---
title: "Laço"
description: "Roda as tarefas abertas de um trabalho sem ninguém olhando: um agente novo por tentativa, e quem decide é o check, nunca o agente."
---

O laço (`collie work run`) roda as tarefas abertas de um trabalho sem ninguém olhando. Cada tentativa é um agente novo
no cercado, e quem decide se a tarefa passou é um comando de shell que você escreveu: o **check** da tarefa. O agente
nunca se dá nota. Nada começa antes de você aprovar a lista de tarefas e checks num cartão do app.

Use quando o trabalho se divide em tarefas que um comando julga: um filtro de testes, um build, um script que sai com 0.
Se você não consegue escrever o check, a tarefa ainda não está pronta para o laço. A apresentação está em
[/pt/features/loop](/pt/features/loop).

## Como se conecta

O laço fica em cima do [registro de trabalho](/pt/docs/features/work-log): roda as tarefas do trabalho ativo do Pastor e
grava nele o estado, as notas e o diário. Precisa de um [cercado](/pt/docs/concepts/paddocks-and-worktrees), porque cada
tentativa volta a worktree do cercado ao commit inicial, e roda cada agente e cada check sob o
[sandbox](/pt/docs/features/sandbox) estrito do cercado. Com `--parallel` usa worktrees temporárias, o mesmo mecanismo
dos [fields](/pt/docs/features/fields). A [fábrica](/pt/docs/features/factory) acrescenta parecer, perfil e auto-land.

## Começar um laço

```steps
items:
  - title: Peça ao Pastor em palavras
    command: "/collie:loop adicionar um botão de modo escuro nos ajustes"
    result: O Pastor quebra o pedido, escreve um spec e propõe um check para cada tarefa, e mostra tudo no chat.
  - title: Adicione cada tarefa
    command: collie work task add "Botão" --spec docs/specs/botao.md --check "npm test -- botao"
    result: O spec é um arquivo do projeto; o check fica no registro do trabalho, não no repositório.
  - title: Rode
    command: collie work run --max 6 --gate "npm run lint"
    result: Volta na hora com `awaiting approval`. Um cartão no app mostra o cercado, os limites e cada tarefa com o seu check.
  - title: Aprove no cartão
    result: Só **Permitir** inicia o laço. Negar, ou nenhuma resposta em 10 minutos, avisa o Pastor que nada rodou.
```

O `/collie:loop` só ensina o procedimento ao agente. Chega aos terminais Claude (um plugin `collie` passado com
`--plugin-dir`) e Cursor. O Codex não tem o comando: peça o laço em palavras.

## O que acontece numa tentativa

1. Um agente novo, `<trabalho>-<tarefa>-t<n>`, abre no cercado com o caminho do spec e as regras da tentativa.
2. Quando o turno termina com commit, roda o `--precheck` (se houver, até 180 s). Se falhar, o mesmo agente recebe uma
   vez as últimas 40 linhas da saída e tenta de novo.
3. O agente é dispensado. Roda o check na worktree, depois o portão (`--gate`), depois o aceite em runtime (`--accept`
   da tarefa, se houver).
4. A tentativa **passa** só com check em exit 0, portão em exit 0 (se houver), commit novo na mesma branch e nenhum
   arquivo rastreado sujo.
5. Se falha, o motivo e o fim da saída do check viram nota que o próximo agente lê, a tentativa vira patch em
   `<raiz>/work-loops/<trabalho>/<tarefa>-<n>.patch` e a worktree volta ao commit inicial. Depois de `--tries` falhas a
   tarefa é adiada.

O check, o portão e o git do laço rodam sob o perfil estrito do próprio laço, só com as variáveis do toolchain (`PATH`,
`HOME`, `LANG`, `DEVELOPER_DIR`…). Nunca recebem tokens nem `SSH_AUTH_SOCK`.

### O agente não reescreve o juiz

O check fica no registro do trabalho, então o agente não o edita. Um check ou portão que chama um script do repositório
só vale se a tentativa não alterou esse script: o laço reprova a tentativa que altera um caminho que o portão executa,
ou um caminho escrito por inteiro no comando e que já existia. Desde a 0.3.0 ele também registra `node_modules/.bin`,
`.venv/bin` e `venv/bin` antes da primeira tentativa e recusa um executável que mudou ali, a menos que o spec cite uma
instalação.

## Limites

```stats
items:
  - value: 30
    label: "`--max`, tentativas no total (obrigatório)"
  - value: 10
    label: "`--tries`, por tarefa (padrão 3)"
  - value: 14 400 s
    label: "`--timeout`, um turno (padrão 3600)"
  - value: 43 200 s
    label: "`--budget`, turnos e checks (padrão 14 400)"
```

São tetos duros. Não há limite de custo em tokens. O `work run` também recusa quando falta check em alguma tarefa,
quando o cercado já tem um laço, quando outro agente do cercado está trabalhando ou quando há arquivo rastreado
modificado.

## Flags úteis

| Flag | O que faz |
|---|---|
| `--gate "<cmd>"` | Roda depois de cada check que passou; comum a todas as tarefas (lint, build). |
| `--precheck "<cmd>"` | Comando rápido no fim de cada turno com commit, antes do check. |
| `--parallel <n>` | Até 4 tarefas ao mesmo tempo, cada uma numa faixa; só tarefas com `--scope` sem sobreposição. |
| `--escalate agente:modelo,…` | A tentativa `n` usa a entrada `min(n, k)`: barato primeiro, mais forte depois de falhas. |
| `--notify task\|end` | `end` (padrão) avisa o Pastor só de tarefa adiada, parada e fim. |
| `--review` | Parecer por personas em cada tentativa (prévia, veja [fábrica](/pt/docs/features/factory)). |

Por tarefa, o `collie work task add` aceita `--scope`, `--needs`, `--evidence "<glob>"`, `--accept`, `--green-ok`,
`--agent` e `--model`. A lista completa está na [referência da CLI](/pt/docs/reference/cli).

## Faixas em paralelo

Com `--parallel` acima de 1, cada tarefa pronta roda numa **faixa**: uma worktree temporária (`.collie/paddocks/lane-…`,
branch `collie/lane/…`) cortada do HEAD do cercado. A faixa só grava o próprio branch. Um integrador faz o merge da faixa
que passou no branch do cercado (sem fast-forward) e **roda o portão de novo** na árvore integrada. Conflito ou portão
quebrado desfaz o merge e refaz a tarefa numa faixa nova.

```callout
kind: warning
title: O escopo decide quem roda junto, não o que o agente toca
body: "Uma tarefa sem `--scope` é exclusiva e roda sozinha. Tarefas que mexem no mesmo arquivo (`Package.swift`, um índice) conflitam na integração. Uma faixa nova não tem cache de build: cada tentativa paga a compilação a frio."
```

## Acompanhar e parar

- `collie work status` mostra `em laço: <tarefa> (tentativa 2/3)` e, com faixas, uma linha por faixa.
- `collie work status --events [N]` mostra o diário do laço (padrão 20, no máximo 100).
- `collie work wait --since <versão>` responde quando o trabalho muda ou o laço termina (padrão 600 s, no máximo 3600).
  Use-o em vez de esperar o aviso digitado: o aviso é só uma dica e pode não chegar.
- `collie work stop` para depois do veredito da tentativa atual (forçado depois de 300 s); `--now` descarta a tentativa.
- No app, o painel **Trabalho** e a seção "LAÇOS" do painel lateral mostram o laço em curso.

Reiniciar o daemon para o laço; `collie work run` de novo continua da próxima tarefa aberta.

## Confiar num cercado

"Sempre neste cercado", no cartão de aprovação, confia nos laços daquele cercado: os próximos começam sem cartão e o
Pastor recebe um aviso com as tarefas e os checks. Só o app liga e desliga (Preferências › "Laços", **Revogar**). Todos
os outros limites continuam valendo.

## Armadilhas

- Um check que já passa antes da tarefa não prova nada. O `work run` o recusa, a menos que a tarefa tenha `--green-ok`
  (uma refatoração).
- `swift build` não compila os testes. Use `swift build --build-tests` como pré-check.
- Árvore suja para o laço e nada é resetado. Commite as suas mudanças antes do `work run`.
- As tarefas de um laço são as abertas na hora do `run`; uma tarefa nova espera o próximo laço.

---
title: "Ganchos dos agentes"
description: "O que o Collie grava para cada terminal Claude, Cursor e Codex, e o que o agente manda de volta."
---

Um agente no Collie é a mesma CLI que você roda em qualquer terminal: `claude`, `cursor-agent` ou `codex`. O Collie não a modifica. Ele a inicia com algumas flags a mais, que apontam para arquivos que o daemon grava para aquele terminal: uma configuração com ganchos (hooks), uma configuração de MCP, uma pasta de plug-in. Os ganchos chamam `collie hook <nome>`, que avisa o [daemon](/pt/docs/internals/daemon-and-socket) e, em alguns eventos, devolve texto ao contexto do agente.

É assim que o `ask` sabe que um turno acabou, que o registro de trabalho se preenche sem o agente digitar comandos, que a memória chega ao prompt e que os plug-ins veem os arquivos que um agente escreveu. Nada é gravado em `~/.claude`, `~/.cursor` nem no seu repositório.

## Terminais Claude

Um terminal Claude é iniciado por `$SHELL -lc` com:

```sh
claude [--model '<m>'] --settings '<root>/hooks/<id>.claude.json' \
  --mcp-config '<root>/hooks/<id>.mcp.json' \
  [--plugin-dir '<pasta>']…
```

| Flag | Aponta para | O que tem |
|---|---|---|
| `--settings` | `hooks/<id>.claude.json` | Os ganchos abaixo, uma `statusLine` e, sob o sandbox do Collie, o sandbox do próprio Claude desligado e a pasta de arquivos do terminal como diretório extra. |
| `--mcp-config` | `hooks/<id>.mcp.json` | Um servidor stdio, `collie mcp`. Sem token no arquivo: o servidor herda o `COLLIE_TOKEN` do ambiente do agente. |
| `--plugin-dir` | `sandbox/<id>/plugin/…` | O comando `/collie:loop` e os procedimentos do terminal como skills. Só vai quando o `claude --help` lista a flag. |

Pastas são 0700 e arquivos 0600. O `--model` só entra quando você escolheu um modelo e o comando ainda não tem um. Um comando custom cujo programa é `claude` recebe o mesmo. Seus servidores MCP continuam: o `--mcp-config` soma o `collie` aos seus.

```callout
kind: warning
title: Um servidor seu chamado collie
body: "Sem `--strict-mcp-config`, o Claude Code soma os servidores do `--mcp-config` aos seus. Se a sua configuração já tem um servidor chamado `collie`, qual vence não foi verificado. Renomeie o seu."
```

### Os ganchos

| Evento | Comando | Timeout (s) | O que faz |
|---|---|---|---|
| `SessionStart` | `collie hook claude-session-start` | 5 | Devolve a orientação e o índice da memória. |
| `UserPromptSubmit` | `collie hook claude-prompt` | 5 | Devolve memórias e recados relevantes a este prompt. |
| `PostToolUse` | `collie hook claude-tool` | 8 | Alimenta o registro de trabalho; manda os arquivos escritos aos plug-ins. |
| `Stop` | `collie hook claude-stop` | 12 | Encerra o turno do `ask`; pode bloquear com o motivo de um plug-in. |
| `SubagentStop` | `collie hook claude-subagent-stop` | 5 | Fecha o job do subagente no registro de trabalho. |
| `PreCompact` | `collie hook claude-precompact` | 5 | Captura a conversa até ali para o curador. |
| `SessionEnd` | `collie hook claude-session-end` | 5 | A mesma captura; enfileira propostas de memória. |
| `Notification` | `collie hook claude-notification` | 5 | Um diálogo de permissão vira aprovação pendente no app. |

Nenhum tem matcher, então o `PostToolUse` dispara em toda chamada de ferramenta; o leitor do registro ignora as ferramentas que não conhece. A `statusLine` roda `collie hook claude-statusline`, que guarda os limites do plano e depois roda a sua própria `statusLine` do `~/.claude/settings.json` com a mesma entrada.

## O que um gancho pode fazer

Um gancho nunca falha e nunca atrasa o agente além do timeout. Erros vão para `~/Library/Logs/Collie/hooks.log`, uma linha com data cada, e o agente não vê nada. Um gancho precisa de `COLLIE_SOCKET`, `COLLIE_TERMINAL_ID` e `COLLIE_TOKEN`; sem eles, registra no log e não faz nada. Entradas acima de 64 KiB são descartadas com uma linha no log.

Só três ganchos devolvem algo:

- **SessionStart e UserPromptSubmit** devolvem `additionalContext`: o texto que o agente lê.
- **Stop** pode devolver uma decisão `block` (de um plug-in, ou o pedido de registrar o que aprendeu) ou uma `systemMessage` (o aviso de contexto grande).

Os outros só avisam o daemon.

## O que chega ao contexto

```tabs
tabs:
  - label: Início da sessão
    body: "Primeiro a **orientação**, até 1500 caracteres: os nomes do terminal e do cercado, os vizinhos ligados por guia, os painéis que ele alcança, a linha do sandbox e, para um Pastor, como delegar, abrir painéis e rodar um laço. Depois as memórias fixadas e o índice da memória, em 4096 bytes sem contar a orientação."
  - label: Cada prompt
    body: "Um orçamento de 2048 bytes, nesta ordem: memórias retiradas, regras empurradas para este terminal, recados do quadro do lote endereçados a ele, seus comentários nas páginas dele, memórias relevantes ao prompt, trechos de documentos ingeridos."
  - label: Depois de compactar
    body: "Num início `compact` ou `resume`, o trabalho ativo (tarefas abertas, últimas notas) e os últimos recados de handoff e status do quadro vêm antes do índice da memória, nos mesmos 4096 bytes."
```

Tudo o que é injetado passa antes por uma limpeza de segredos conhecidos. Como as memórias são escolhidas está em [Memória](/pt/docs/features/memory); o que o curador faz com a conversa capturada, em [Curador da memória](/pt/docs/internals/curator).

## Como um turno acaba

O `collie ask` espera o turno do outro agente acabar. Há dois jeitos de saber.

- **Pelo gancho.** O `Stop` do Claude manda `turn.completed`, que fecha o ask em espera com a última mensagem do agente. Na primeira vez que um terminal manda um, o Collie o marca como capaz de gancho e, dali em diante, espera só o gancho.
- **Pelo silêncio.** Terminais sem gancho de turno encerram um turno depois de 2 s sem saída. É o caso do shell e do Cursor, com as regras extras abaixo.

O Codex tem gancho para isso: ele é iniciado com `-c 'notify=["<collie>","hook","codex-notify"]'`, e o `agent-turn-complete` vira `turn.completed`.

## Terminais Cursor

O preset roda:

```sh
exec cursor-agent [--sandbox disabled --trust] --plugin-dir '<root>/hooks/<id>.cursor/collie' [--model '<m>']
```

`--sandbox disabled --trust` só entra sob o sandbox do Collie, para o Cursor não parar em "Workspace Trust Required"; num terminal livre o diálogo continua, e confiar no repositório é decisão sua. Sem `cursor-agent` no `PATH`, criar o terminal falha na hora.

A pasta do plug-in tem:

| Arquivo | Para quê |
|---|---|
| `hooks/hooks.json` | `sessionStart` → `collie hook cursor-session-start`; `preToolUse` e `postToolUse` → `collie hook cursor-tool`. |
| `.mcp.json` | O servidor `collie`, com as variáveis de ambiente só pelo nome (`${env:COLLIE_TOKEN}`), nunca o valor. |
| `commands/collie:loop.md` | O comando `/collie:loop`. |
| `rules/collie-delegate.mdc` | Só para Pastores: uma regra sempre aplicada para passar o trabalho ao terminal convocado e esperar. |

O Cursor recebe a orientação no início da sessão, com a memória, até 9000 bytes. Ele não tem gancho de turno, então o turno acaba pelo silêncio, exceto enquanto o rodapé `ctrl+c to stop` está na tela ou uma ferramenta está rodando (do `preToolUse` ao `postToolUse`, no máximo 10 min). A resposta é lida da tela; uma resposta cortada diz para rodar `collie check <nome> --screen`. O cliente MCP do Cursor derruba chamadas por volta de 60 s, então pelo MCP um `ask` que espera vira `--no-wait` e o `wait` vai até 50 s.

## Terminais Codex

O Codex não tem gancho de início de sessão nem de prompt: sem orientação, sem injeção de memória. Leia os recados do lote com `collie lot board` e os comentários com `collie comment list`. O servidor MCP `collie` vem desligado no Codex; com `COLLIE_CODEX_MCP=1` no ambiente do daemon, ele vai por `-c mcp_servers.collie.*`. Essa chave não foi verificada contra um `codex` instalado.

## Ganchos de plug-in

Um plug-in instalado pode declarar os eventos `edit` e `stop`. Depois de uma ferramenta de escrita (`Write`, `Edit`, `MultiEdit`, `NotebookEdit`), o `claude-tool` manda os arquivos aos plug-ins; no `Stop`, eles recebem os arquivos do turno inteiro. O helper de cada plug-in roda uma vez por evento, em paralelo, num sandbox próprio (lê o projeto, grava só a sua pasta de dados, sem rede), com 3 s para todos.

```compare
before:
  title: guide
  items:
    - "Texto devolvido ao agente como contexto"
    - "Até 2000 caracteres por plug-in, 4000 no total"
    - "Descartado no `stop`"
after:
  title: block
  items:
    - "No edit, o Claude recebe uma decisão `block` com o motivo"
    - "No stop, o turno não acaba: o agente lê o motivo"
    - "Qualquer block vence os guides"
```

Um helper que falha, estoura o prazo ou responde JSON inválido é pulado. O Cursor recebe o `edit` pelo `postToolUse`, onde um block chega como contexto, e o `stop` uma vez por turno, depois que ele fica em silêncio. A API está em [Plug-ins](/pt/docs/features/plugins).

## Ambiente de um terminal de agente

| Variável | Valor |
|---|---|
| `COLLIE_SOCKET` | `<root>/run/collied.sock` |
| `COLLIE_TERMINAL_ID`, `COLLIE_TERMINAL_NAME` | Este terminal |
| `COLLIE_TOKEN` | O token deste terminal |
| `COLLIE_WORKSPACE_ID` | O workspace |
| `COLLIE_SHEPHERD` | `1` para um Pastor (só muda a lista de ferramentas MCP; o daemon confere o papel por conta própria) |
| `COLLIE_PADDOCK_NAME`, `COLLIE_PADDOCK_PATH`, `COLLIE_BRANCH_NAME` | Quando o terminal está num cercado |
| `TERM_PROGRAM` | `Collie` |

A base é o ambiente do seu shell interativo: o daemon roda `$SHELL -ilc` (timeout de 5 s, guardado por 10 min, refeito quando um rc file muda) para que o `node` do `nvm` e o seu `PATH` valham. `COLLIE_ENV_CAPTURE=1` fica definido durante essa captura, para o seu `.zshrc` pular trechos lentos. As chaves do Collie vencem, e o `collie` vem primeiro no `PATH`. O preset Shell não usa a captura.

## Veja também

- [Daemon e socket](/pt/docs/internals/daemon-and-socket): para onde os ganchos avisam.
- [Registro de trabalho](/pt/docs/features/work-log): o que os ganchos de ferramenta e de subagente registram.
- [Referência da CLI](/pt/docs/reference/cli): `collie hook` e os comandos que os agentes chamam.

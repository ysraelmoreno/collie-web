---
title: "CLI"
description: "Todos os comandos do collie na v0.3.1, por grupo, com quem pode rodar cada um."
---

O `collie` é a linha de comando que os agentes e você usam para falar com o [daemon](/pt/docs/internals/daemon-and-socket). Dentro de um terminal do Collie ele vem primeiro no `PATH` e já leva o token do terminal. A maioria dos comandos também é ferramenta MCP nos terminais Claude, com `_` no lugar dos espaços (`collie work status` é `work_status`).

Esta página lista os comandos da v0.3.1. A ajuda da própria CLI é a fonte de cada flag: `collie --help`, `collie <grupo> --help`, `collie <comando> --help`.

## Convenções

```sh
collie [--json] <command> [args]
collie mcp
```

- **Grupos se encadeiam.** `collie work task add`, `collie design system list`, `collie lot board`.
- **`--json`** imprime o resultado cru. Sem ele, alguns comandos imprimem texto (`list`, `check`, `paddock list`, `model`); os demais imprimem JSON do mesmo jeito.
- **`--`** encerra as flags: tudo depois dele é literal.
- **Quem.** Cada tabela diz quem pode rodar o comando. *Qualquer* é qualquer terminal (dentro das suas guias) ou o app. *Pastor* é um terminal marcado como Pastor; os outros recebem `'<cmd>' is Shepherd-only`. *Você* é o dono: o app (alguns aceitam também a sua CLI num terminal fora do Collie), nunca um agente.

| Código de saída | Significado |
|---|---|
| `0` | Feito (também para a ajuda). |
| `1` | O daemon ou o comando recusou. Também: `factory doctor` abaixo de `--min`, `work plan lint` recusado, `factory ratchet check` que mudou. |
| `2` | Erro de uso: comando ou flag desconhecida, argumento faltando. A linha de uso vai para o stderr. |
| `3` | O daemon não está rodando ("daemon não está rodando (collied)"). |

Os erros vão para o stderr com o prefixo `collie: `. Um comando que o daemon ainda não conhece diz `<comando>: reinicie o serviço para usar isto`: reinicie o serviço.

## Agentes e terminais

| Comando | O que faz | Quem |
|---|---|---|
| `collie list [--all]` | Agentes ligados a você por guia; `--all` soma os outros terminais do seu cercado e como alcançá-los. | Qualquer |
| `collie ask <alvo> <prompt>… [--no-wait] [--timeout <s>] [--raw]` | Manda um prompt e espera a resposta (padrão 1800 s). `--no-wait` devolve um id; a resposta é digitada no seu terminal quando você está ocioso. | Qualquer |
| `collie ask … --check <cmd> [--spec <arquivo>] [--tries <n>] [--check-timeout <s>] [--green-ok]` | O daemon roda o check quando o alvo termina o turno; o ask só acaba quando ele passa. Tentativas padrão 3 (até 10), timeout do check 600 s. `--green-ok` aceita um check que já passa. | Qualquer |
| `collie ask result [<id>]` | A resposta de um ask com `--no-wait`; sem id, os seus asks recentes. | Qualquer |
| `collie wait <alvo> [--timeout <s>]` | Espera o turno do agente acabar; na hora, se ele está ocioso. | Qualquer |
| `collie reply <mensagem>…` | Responde ao ask que você recebeu (até 8 KiB). | Qualquer |
| `collie check <alvo> [--lines <n>] [--screen]` | Saída recente (padrão 200 linhas); `--screen` é a tela como está desenhada agora. | Qualquer |
| `collie model <alvo> <modelo> [--wait] [--timeout <s>]` | Troca o modelo de um agente Claude (`opus`, `sonnet`, `haiku` ou um id). | Qualquer, num alvo ligado por guia |
| `collie open [<url-ou-app>] [--app <app>]` | Abre uma URL http(s) ou mailto, ou um app: o `open` do sandbox. Só CLI. | Qualquer |
| `collie events [--since <n>] [--panel <painel>]` | Eventos recentes de plug-in dos painéis que você alcança. | Qualquer |
| `collie summon <nome> [--preset …] [--model …] [--cwd …] [--paddock …] [--shepherd] [--field \| --no-field] [--connect <a,b>] [<prompt>…]` | Inicia um agente ligado a você por guia. Sem `--preset`, ele recebe o seu. | Pastor |
| `collie dismiss <alvo>` | Encerra um agente ligado a você (um sub-Pastor, com tudo o que ele convocou). | Pastor |
| `collie leash <a> <b>` / `collie unleash <a> <b>` | Liga ou desliga a guia entre dois agentes ligados a você. | Pastor |
| `collie leash request <alvo> [--reason …]` | Pede uma guia a você: um cartão no app. | Pastor |
| `collie notify <mensagem>…` | Uma notificação ao usuário (até 2000 caracteres). | Pastor |

`summon --shepherd` cria um sub-Pastor (até 6 terminais próprios, profundidade 2). Veja [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals).

## Fields

Só CLI. Os fields são prévia desde a 0.3.0; veja [Fields](/pt/docs/features/fields).

| Comando | O que faz | Quem |
|---|---|---|
| `collie field list` | Os fields do seu cercado: agente, branch, base, commits, estado. | Pastor |
| `collie field land <nome>` | Faz o merge do field no branch do cercado e roda o portão de novo; espera até 10 min o cercado ficar livre. | O Pastor que o convocou |
| `collie field drop <nome> [--keep-branch]` | Tira a worktree; sem `--keep-branch`, guarda o código num patch e apaga o branch. | O Pastor que o convocou |

## Cercados

| Comando | O que faz | Quem |
|---|---|---|
| `collie paddock list` | Todos os cercados: nome, caminho, branch. | Qualquer |
| `collie paddock status <nome> [working\|blocked\|review\|idle\|done]` | Lê ou define o estado do cercado. | Qualquer |
| `collie paddock create <nome> [--folder <caminho>]` | Um cercado novo (uma worktree, ou uma pasta comum). | Pastor |
| `collie paddock land <nome> [--mode merge\|squash\|rebase\|pr] [--message …]` | Integra no branch base. `pr` é só seu. | O Pastor que o criou |
| `collie paddock delete <nome> [--force]` | Exclui. | O Pastor que o criou |
| `collie paddock factory <nome> on\|off` | A marca de fábrica. Exige um `collie-work.json` commitado com `static` e `judge` em 1 ou mais. | Você |

`paddock create --factory` e `--repo` são só seus. Veja [Cercados e worktrees](/pt/docs/concepts/paddocks-and-worktrees).

## Painéis

| Comando | O que faz | Quem |
|---|---|---|
| `collie panel open <plugin> [--name …] [--placement dock.left\|dock.right\|dock.bottom\|canvas\|headless] [--visible] [--url …] [--storage isolated\|workspace\|global] [--serial …] [--file …] [--artifact …] [--paddock …] [--connect …]` | Abre um painel. Um terminal que não é Pastor só abre painéis de navegador (até 8, sem janela a não ser com `--visible`) e prévias (até 8). | Qualquer (veja ao lado) |
| `collie panel close <nome>` | Fecha. | Qualquer, os seus |
| `collie panel move <nome> <posição> [--paddock …]` | Move. | Qualquer, os seus |
| `collie panel list` | Os painéis que você alcança. | Qualquer |

## Registro de trabalho

Um terminal mexe no próprio trabalho; um Pastor também no dos terminais ligados a ele por guia (`--terminal <nome>`). Veja [Registro de trabalho](/pt/docs/features/work-log).

| Comando | O que faz | Quem |
|---|---|---|
| `collie work start <título>… [--branch …]` | Abre um trabalho. | Qualquer |
| `collie work done [--reason …]` / `collie work reopen [--id …]` | Fecha ou reabre. | Qualquer |
| `collie work task add <título>… [--spec <arquivo>] [--check <cmd> \| --area <a,b>] [--accept <cmd>] [--accept-timeout <s>] [--evidence <glob>] [--scope <glob,…>] [--needs <id,…>] [--agent claude\|cursor\|codex] [--model …] [--green-ok]` | Cria uma tarefa. Para o laço: um spec e um check. | Qualquer |
| `collie work task done\|reopen <tarefa>…` | Marca como feita; devolve à fila uma tarefa adiada ou abandonada (`--keep-tries`). | Qualquer |
| `collie work task defer\|drop <tarefa> <motivo>…` | Adia ou abandona, com o motivo. | Qualquer |
| `collie work note <texto>… [--decision]` | Uma nota, ou uma decisão. | Qualquer |
| `collie work status [--all] [--events [<n>]]` | O trabalho ativo; `--events` soma o diário do laço (20 por padrão, até 100). | Qualquer |
| `collie work wait [--since <v>] [--timeout <s>]` | Espera uma mudança no trabalho (padrão 600 s, até 3600). | Qualquer |
| `collie work list [--closed]` / `collie work get <id>` | Lista ou lê trabalhos. | Qualquer |
| `collie work summary [--id …] [--natural]` | O que um trabalho fez, pelo registro. `--natural` pede a reescrita ao modelo local. | Qualquer |
| `collie work usage [--limit <n>]` / `collie work history [--limit <n>] [--id …]` | Índice de tokens por trabalho; trabalhos fechados do seu cercado. | Qualquer |
| `collie work handoff` | O handoff do último laço. | Qualquer |
| `collie work config` | No que o `collie-work.json` resulta. Não roda nada. Só CLI. | Qualquer |
| `collie work prd show [--id …]` / `collie work plan lint <pasta>` | O PRD guardado; confere um pacote de plano (exit 1 se recusado). | Qualquer |
| `collie work rerail` | Digita de novo no agente o estado vivo do trabalho (Recolocar no trilho). | Pastor, app |

### O laço

| Comando | O que faz | Quem |
|---|---|---|
| `collie work run --max <n> [--tries <n>] [--timeout <s>] [--budget <s>] [--gate <cmd>] [--precheck <cmd>] [--parallel <n>] [--notify task\|end] [--preset … \| --model … \| --command … \| --escalate agente:modelo,…]` | Roda as tarefas abertas sem ninguém olhando, depois do seu cartão no app. | Pastor |
| `collie work run … [--review \| --no-review] [--personas …] [--reviewer-model …] [--auto-land] [--auto-land-max <n>] [--queue]` | Revisão por personas, auto-land, fila. Prévia. | Pastor |
| `collie work stop [--now]` | Para depois do veredito da tentativa atual; `--now`, na hora. | Pastor |

Tetos: `--max` até 30, `--tries` 10, `--timeout` 14 400 s, `--budget` 43 200 s, `--parallel` 4, `--auto-land-max` 5. Padrões do `collie-work.json`: veja [collie-work.json](/pt/docs/reference/collie-work-json). O fluxo está em [Laço](/pt/docs/features/loop).

### Só seus

`collie work prd add <arquivo> [--origin …] [--replace]` e `collie work plan apply <pasta> --approve <sha256>` (CLI, nunca MCP). `work clear-history`, `work chat …` e `work approvals` / `work approve` são do app.

## Fábrica

Só CLI, prévia desde a 0.2.0. Veja [Fábrica](/pt/docs/features/factory).

| Comando | O que faz | Quem |
|---|---|---|
| `collie factory doctor [--min 0-3]` | Dá nota de 0 a 3 às camadas do perfil (static, judge, verification, review, prose, guardrails); exit 1 abaixo de `--min` (padrão 1). | Qualquer |
| `collie factory bait list` / `collie factory bait report` | O catálogo de mudanças ruins conhecidas e a taxa de captura por camada e persona. | Qualquer |
| `collie factory ratchet check\|update <nome>` | Uma medida cuja linha de base só desce. `check` sai com 1 quando ela mudou. | Qualquer |
| `collie factory ratchet raise <nome> --reason <texto>` | Sobe a linha de base, com motivo escrito (de 1 a 200 caracteres). | Qualquer |

## Memória e lotes

Veja [Memória](/pt/docs/features/memory).

| Comando | O que faz | Quem |
|---|---|---|
| `collie memory search <busca>… [--limit <n>] [--lot …] [--all] [--inactive]` | Busca no seu lote, projeto e global (até 50). | Qualquer |
| `collie memory save --kind decision\|map\|pitfall --subject … --title … [<corpo>…] [--path …] [--scope lot\|project\|paddock\|global]` | Guarda uma memória. | Qualquer |
| `collie memory get <id>` / `collie memory list [--kind …] [--status …]` | Lê uma; lista. | Qualquer |
| `collie memory flag <id> --useful\|--wrong\|--outdated [<motivo>…]` | Julga uma memória injetada. `--wrong` e `--outdated` a mandam ao [curador](/pt/docs/internals/curator). | Qualquer |
| `collie memory supersede <id> --by <id>` / `collie memory promote <id>` | Retira uma memória velha em favor de uma nova; leva uma memória do lote ao projeto. | Qualquer |
| `collie memory doc-search <busca>…` | Busca nos documentos ingeridos. | Qualquer |
| `collie memory context` / `collie memory checklist` / `collie memory task <tarefa>…` | Resumo da sessão; checklist de armadilhas; regras e memórias de uma tarefa. | Qualquer |
| `collie memory enforce <id> [--by <arquivo>] [--clear]` | Marca uma memória como garantida por um check. | Qualquer |
| `collie memory stats [--since 7d\|24h\|2w\|<data>] [--project …] [--lot …] [--terminal …]` | Uso, manutenção, custo do curador. | Qualquer |
| `collie memory trust <id>` | Confia numa memória editada fora do Collie. Só CLI. | Qualquer |

O resto é do app: `memory review`, `pin`, `unpin`, `restore`, `doc-add`, `capture`, `curator`, `digest`, `consolidate`, `cleanup`, `purge`.

| Comando | O que faz | Quem |
|---|---|---|
| `collie lot create <nome> [--goal …] [--members …]` / `collie lot join --lot …` | Cria um lote ou entra nele. | Pastor |
| `collie lot leave` / `collie lot list` / `collie lot get [--lot …]` | Sai; lista; lê. | Qualquer |
| `collie lot post --kind handoff\|question\|status\|answer <texto>… [--to <nome>] [--ref …]` | Posta no quadro do lote. | Qualquer |
| `collie lot board [--since …] [--kind …] [--limit <n>]` | Lê o quadro. | Qualquer |

## Rebanhos

| Comando | O que faz | Quem |
|---|---|---|
| `collie herd list` / `collie herd get <id>` | Rebanhos salvos. | Pastor, app |
| `collie herd apply <id> --name <nome> [--paddock true\|false]` | Aplica um rebanho: tudo o que ele cria fica ligado a você por guia. | Pastor, app |
| `collie herd save <nome> --terminals <a,b,c> [--panels …]` | Salva terminais e painéis como rebanho. | Pastor, app |

Remover, importar e exportar são do app. Veja [Rebanhos](/pt/docs/features/herds).

## Sandbox, arquivos e comentários

| Comando | O que faz | Quem |
|---|---|---|
| `collie access request <caminho> [--read] [--write] [--reason …]` | Pede a você acesso a um caminho: um cartão no app. Nunca contorne um bloqueio. | Qualquer terminal |
| `collie access list` | Os seus acessos. | Qualquer terminal |
| `collie comment list [--artifact …] [--path …] [--open]` / `collie comment reply <id> <texto>…` | Os seus comentários nas páginas do agente; a resposta dele (até 4000 caracteres). | Qualquer |
| `collie font add <família> [--weights 400,700] [--italic]` / `collie font list` | Fontes para páginas e designs. | Qualquer |

Conceder, negar e revogar acesso, `comment add` e `font remove` são do app. Veja [Sandbox](/pt/docs/features/sandbox).

## Plug-ins de painel

Todo comando de painel aceita `[--panel <nome>]`; sem ele, vale o único painel daquele tipo que você alcança. Caminhos de `--out` são gravados pelo `collie`, relativos à pasta dele.

```tabs
tabs:
  - label: browser
    body: "`navigate <url>`, `snapshot`, `click <ref>`, `hover <ref>`, `fill <ref> <texto>`, `type <texto>`, `key <tecla>`, `scroll [--ref] [--dy]`, `eval <js>`, `text`, `wait [--text] [--selector] [--timeout]`, `screenshot [--full-page] [--clip x,y,w,h] [--ref] [--out]`, `console [--lines]`, `resize [--width] [--height] [--reset]`, `emulate [--color-scheme] [--reduced-motion]`, `reload [--hard]`, `storage clear|set|get`, `init-script add|list|clear`. Veja [Navegador](/pt/docs/features/browser)."
  - label: device
    body: "`list`, `screenshot [--out]`, `ui [--all]`, `screen [--ocr | --no-ocr] [--region]`, `wait [--text] [--gone] [--stable] [--then]`, `find <texto> [--role] [--scroll] [--then]`, `tap [<x> <y>] [--ref] [--text] [--id] [--then]`, `swipe <x1> <y1> <x2> <y2> [--ms]`, `text <texto>`, `key <tecla>`, `logcat [--lines] [--grep]`, `install <caminho>`, `launch <pacote>`. Veja [Dispositivos](/pt/docs/features/devices)."
  - label: network
    body: "`attach [--serial]`, `detach`, `status`, `list [--limit] [--host]`, `get <id>`, `curl <id>`, `clear`, `rule-add`, `rule-list`, `rule-remove|rule-enable|rule-disable <id>`, `rule-clear`. Veja [Rede](/pt/docs/features/network)."
  - label: design
    body: "`files`, `new <nome>`, `run <comando> [--params]`, `batch`, `inspect [--node] [--depth]`, `screenshot [--node] [--out]`, `export --format html|css|react|figcraft`, `help [<busca>]`, `prefer artifact|figcraft|ask`, e `design system list|create|publish|history|use|undo|revert|tokens|bind|style|place|mode` (a maioria pede `--reason`). Veja [Design e artifacts](/pt/docs/features/design-and-artifacts)."
  - label: artifact
    body: "`list`, `get <id>`, `add --path`, `new <tipo> [<nome>]`, `export <id> --format pptx|pdf`, `move <ids> --folder`, `folders`, `libs`, `import-claude [<urls>]`, `import <id>`. Diagrama: `diagram get|set|mermaid|export|screenshot`. Prévia: `preview get|screenshot`."
```

## Apps do cercado

| Comando | O que faz | Quem |
|---|---|---|
| `collie app list` / `collie app attach <id>` | Apps do cercado; abre um num painel. | Qualquer |
| `collie app new <id> [--name …]` / `collie app adopt <id> --url http://127.0.0.1:<porta> [--start …] [--cmd nome=METODO:/caminho,…]` | Cria um app novo ou adota um serviço local ([Apps do cercado](/pt/docs/features/apps)). | Qualquer |
| `collie app context <id>` / `collie app snapshot <id>` / `collie app event <seq>` / `collie app logs <id> [--lines <n>]` | O que o app mostra, os eventos, o log. | Qualquer |
| `collie app approve <id> --paddock …` | Aprova um app. | Você |

## Plug-ins

| Comando | O que faz | Quem |
|---|---|---|
| `collie plugin list` / `collie plugin specs` | Plug-ins instalados; os comandos deles. | Qualquer |
| `collie plugin install --path <pasta>` / `install-catalog <id> --version …` / `catalog [--refresh]` / `uninstall\|enable\|disable <id>` | Instalar e gerenciar. | Você |
| `collie plugin validate <pasta>` | Confere uma pasta de plug-in como uma instalação e o catálogo curado fariam. Exit 0 imprime `ok` e o `TeamIdentifier`; exit 1, um motivo por linha. Roda sem o daemon. | Qualquer |
| `collie plugin tree-hash <pasta>` / `catalog-keygen` / `catalog-sign` / `catalog-verify` | Ferramentas para publicar um catálogo. Rodam sem o daemon. | Qualquer |

Veja [Plug-ins](/pt/docs/features/plugins).

## Infraestrutura

| Comando | O que faz |
|---|---|
| `collie mcp` | O servidor MCP (stdio) de um terminal Claude. |
| `collie hook <nome>` | Entradas dos ganchos: `claude-session-start`, `claude-prompt`, `claude-tool`, `claude-stop`, `claude-subagent-stop`, `claude-precompact`, `claude-session-end`, `claude-notification`, `claude-statusline`, `cursor-session-start`, `cursor-tool`, `codex-notify`, `generic-stop`. Sai sempre com 0. Veja [Ganchos dos agentes](/pt/docs/internals/agent-hooks). |

Os grupos `admin …`, `android …`, `design engine …` e `app update …` são do app: criar e reiniciar terminais, o modo do sandbox, exportar e importar dados, parear o celular, o SDK do Android, o motor de design e as atualizações do app. Um agente recebe "the admin token can't be used from inside a Collie terminal".

## Ambiente

| Variável | Para quê |
|---|---|
| `COLLIE_SOCKET` | Caminho do socket. Padrão `~/Library/Application Support/Collie/run/collied.sock`. |
| `COLLIE_TOKEN`, `COLLIE_TERMINAL_ID` | As credenciais do terminal, definidas em todo terminal do Collie. |
| `COLLIE_ADMIN_TOKEN_FILE` | Onde a sua CLI lê o token de admin. Padrão `<root>/admin.token`. |
| `COLLIE_MCP_POLL_MS` | De quanto em quanto tempo o `collie mcp` procura ferramentas novas (padrão 10 000). |

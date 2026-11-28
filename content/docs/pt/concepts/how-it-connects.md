---
title: "Como tudo se liga"
description: "O app, o serviço collied, a CLI collie em cada terminal, os hooks e as guias: o caminho de um pedido."
---

O Collie são três programas que conversam por um socket Unix. O **serviço** (`collied`) guarda o estado e os terminais. O **app** desenha o canvas e é o único admin. A **CLI** (`collie`), no `PATH` de todo terminal, é como os agentes pedem qualquer coisa ao serviço. Guias, cercados, memória e painéis são todos regras que o serviço aplica a esses pedidos.

Esta página segue um pedido do agente até o serviço e de volta, e mostra onde cada funcionalidade se encaixa. As versões aprofundadas estão em [Daemon e socket](/pt/docs/internals/daemon-and-socket) e [Hooks dos agentes](/pt/docs/internals/agent-hooks).

## As três partes

```text
 Collie.app (canvas, painéis, cartões)       admin: o único
        │
        ▼
 collied  ── LaunchAgent dev.collie.daemon
   │  ~/Library/Application Support/Collie   workspaces, memória, artifacts, trabalho…
   │  run/collied.sock                       o socket por onde passa todo pedido
   │
   ├── terminal "lider"  (Claude, Pastor)    COLLIE_TOKEN, collie no PATH, MCP collie
   ├── terminal "api"    (Claude)            perfil de sandbox próprio
   └── terminal "notas"  (Shell)
```

- **`collied`** roda pelo launchd, então continua vivo quando você fecha o app. Ele inicia os processos dos terminais, guarda a saída deles, mantém o workspace (terminais, guias, cercados, painéis) e roda o git, o curador da memória e o laço.
- **O app** se conecta ao mesmo socket para mostrar e mudar tudo isso. Preferências, liberações do sandbox, instalação de plug-ins e land `pr` são admin, e o serviço só aceita admin vindo do próprio app assinado.
- **`collie`** é um cliente fino: transforma `collie ask api "…"` num pedido com a identidade do terminal e envia. Pelo MCP, o servidor `collie` de um terminal Claude envia os mesmos pedidos.

## Um pedido, de ponta a ponta

O que acontece quando o Pastor `lider` roda `collie ask api "Inclua o imposto no total do carrinho"`:

```steps
items:
  - title: A CLI monta o pedido
    result: Comando `ask`, os argumentos, a pasta atual e o `COLLIE_TERMINAL_ID` e o `COLLIE_TOKEN` do terminal, tirados do ambiente.
  - title: Ele vai pelo socket
    result: "`<dados>/run/collied.sock` (ou `COLLIE_SOCKET`). Sem serviço, a CLI sai com código 3."
  - title: O serviço confere quem pede
    result: O token tem de bater com o registro daquele terminal. Um token ruim é recusado como credencial inválida.
  - title: Ele acha o alvo dentro das guias
    result: "`api` precisa estar ligado ao `lider` por guia, direto. Senão: não encontrado, ou sem conexão."
  - title: Ele entrega o prompt
    result: O texto é digitado no terminal do `api`, como se você tivesse digitado.
  - title: Ele espera o fim do turno
    result: O hook Stop do Claude, o notify do Codex, um `collie reply`, ou a ociosidade para os demais.
  - title: A resposta volta
    result: A CLI imprime no terminal do `lider`; com `--no-wait` devolve um id e digita a resposta depois.
```

Todo comando segue esse formato. O que muda é a regra que o serviço aplica no passo 4: comandos de Pastor conferem a marca, comandos de cercado conferem quem criou o cercado, comandos de painel conferem se o painel é alcançável.

Um comando que o serviço em execução ainda não conhece (app atualizado, serviço não reiniciado) responde "restart the service to use this".

## Onde entram os hooks

Os agentes não só chamam o Collie; o Collie também escuta os agentes. Um terminal Claude é lançado com os hooks do Collie no `--settings`, cada um um comando `collie hook …` que fala com o mesmo socket:

| Evento do Claude | O que o Collie faz |
|---|---|
| SessionStart | imprime a orientação e o índice de memórias na sessão |
| UserPromptSubmit | soma ao prompt os recados do quadro do lote, os comentários nas páginas e as memórias relevantes |
| PostToolUse, SubagentStop | registra tarefas, jobs e commits no [registro de trabalho](/pt/docs/features/work-log); roda os hooks `edit` dos plug-ins |
| PreCompact, SessionEnd | mantém o registro de trabalho, dispara a captura de memória |
| Stop | fecha o turno (`turn.completed`), responde o `ask` pendente, roda os hooks `stop` dos plug-ins |

Os hooks nunca fazem o agente falhar: os erros vão para `~/Library/Logs/Collie/hooks.log`. O Cursor recebe um conjunto menor por um plug-in próprio; o Codex tem só o notify de fim de turno, e os terminais shell não têm nenhum. Por isso a injeção de memória e a orientação são primeiro do Claude.

## Onde cada conceito mora

| Conceito | O que é para o serviço |
|---|---|
| Terminal | um registro (nome, preset, pasta, cercado, lote, sandbox) mais um processo e um token |
| Guia | uma aresta entre dois registros; a única fonte de alcance |
| Pastor | uma marca no registro do terminal, posta por você no app (ou por `--shepherd`) |
| Cercado | um registro mais uma worktree e uma branch do git (ou só uma pasta) |
| Sandbox | um perfil Seatbelt gerado por terminal no lançamento |
| Painel | um registro que o app hospeda; alcançado por guia no canvas, por todos numa doca |
| Memória | arquivos em `.collie/memory` por repositório, mais um armazenamento global e um por lote |
| Trabalho | um registro por terminal de tarefas, jobs, notas e commits |

## O que sobrevive a quê

- **Fechar o app:** nada para. Terminais e laços seguem rodando no serviço; o canvas se reconecta quando você abre de novo.
- **Reiniciar o serviço** (depois de uma atualização, ou em **Reiniciar serviço**): os terminais abertos fecham. Workspace, cercados, memória e trabalho estão em disco e voltam.
- **Atualizar o app:** o serviço antigo continua rodando até você reiniciá-lo. Os hooks e o servidor MCP já vêm da versão nova.

## Veja também

- [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals): as regras do passo 4.
- [Cercados e worktrees](/pt/docs/concepts/paddocks-and-worktrees)
- [Sandbox](/pt/docs/features/sandbox): o que o perfil de cada terminal fecha.
- [Referência da CLI](/pt/docs/reference/cli): todos os comandos.

---
title: "Pastor e terminais"
description: "Terminais, presets, a marca de Pastor e as guias: quem alcança quem e como os agentes conversam."
---

Tudo o que um agente faz no Collie acontece num **terminal**: um nó no canvas com um processo, um nome, uma pasta e um sandbox. Alguns terminais são marcados como **Pastor**, o que deixa eles criarem outros terminais e ligarem uns aos outros. A única coisa que decide quem fala com quem é a **guia**, uma linha entre dois nós.

Leia esta página quando quiser saber por que um comando foi recusado, ou como montar uma equipe de agentes. Para uma primeira vez, veja o [primeiro agente](/pt/docs/getting-started/first-agent).

## Terminais e presets

Um terminal roda um preset:

| Preset | Roda | Observações |
|---|---|---|
| Claude | `claude` | MCP `collie`, orientação, hooks e injeção de memória |
| Codex | `codex` | Sem hook de início de sessão: sem orientação, sem injeção |
| Cursor | `cursor-agent` | Seu plano e login do Cursor; o Collie nunca vê a credencial |
| Shell | `zsh` | O seu shell, que lê os próprios rc |
| Próprio | o seu comando | Qualquer linha de comando que você der |

Cada terminal tem um token próprio (`COLLIE_TOKEN`). Todo comando `collie` que ele roda leva esse token, e o serviço confere contra o registro do terminal: um agente só age como ele mesmo.

Um terminal também pertence a no máximo um cercado (ou ao Pasto) e a no máximo um lote. Nenhum dos dois dá alcance: um [lote](/pt/docs/features/memory) agrupa terminais para a memória e um quadro, um [cercado](/pt/docs/concepts/paddocks-and-worktrees) dá uma pasta e uma branch.

## A guia é a permissão

Um terminal alcança exatamente os terminais ligados a ele por guia, direto. Não há transitividade: se A está ligado a B e B a C, A não alcança C. Só terminais com sandbox participam. Um **terminal livre** (sem sandbox) nunca é alcançado por guia nenhuma e não alcança ninguém.

A mesma regra vale para painéis. Um painel no canvas (Navegador, Dispositivo, Design…) é alcançável pelos terminais ligados a ele; um painel numa doca é alcançável por todos os terminais. As ferramentas de painéis que um terminal não alcança ficam ocultas na lista MCP dele.

As guias vêm de três lugares:

- Você arrasta do anel na barra de título de um nó até outro nó.
- O `collie summon` liga o terminal novo ao Pastor que o convocou (e aos alvos de `--connect`).
- Um Pastor roda `collie leash a b` para dois terminais já ligados a ele, ou `collie unleash a b` para cortar uma.

## O que qualquer terminal faz

Dentro das suas guias, todo terminal com sandbox pode:

```sh
collie list                      # agentes ligados a você
collie ask <nome> "<prompt>"     # manda um prompt e espera a resposta (--no-wait: um id na hora)
collie ask result [<id>]         # a resposta de um --no-wait, ou os seus asks recentes
collie wait <nome>               # até aquele agente terminar o turno
collie check <nome>              # a saída recente dele (--lines, --screen)
collie reply "<texto>"           # responde o ask que você recebeu (até 8 KiB)
```

Ele também abre os próprios navegadores de teste (até 8, headless a não ser com `--visible`) e Prévias, lê e grava memória, mantém o próprio [registro de trabalho](/pt/docs/features/work-log) e pede acesso ao sandbox com `collie access request`. Um acesso bloqueado vira um cartão no app: peça, não contorne.

A resposta de um `ask` é a última mensagem do alvo quando o turno dele termina: um hook do Claude, um `collie reply`, ou a ociosidade, para agentes sem hook de fim de turno (shell, Cursor). Um `collie reply` sem ask esperando diz para usar `collie notify`.

## O que só o Pastor faz

A caixa **Pastor** na folha de terminal marca um Pastor: "Pode chamar agentes, abrir painéis e criar cercados. Só alcança quem estiver ligado a ele por guia."

| Comando | Faz |
|---|---|
| `summon <nome>` | cria um terminal ligado a você (`--preset`, `--model`, `--paddock`, `--cwd`, `--connect`) |
| `dismiss <nome>` | encerra um terminal ligado a você |
| `leash` / `unleash` / `leash request` | liga terminais que você alcança; pede ao usuário um que não alcança |
| `notify "<texto>"` | uma notificação para você (até 2000 caracteres) |
| `paddock create / land / delete` | cercados (land e delete: só o que ele criou) |
| `panel open / close / move` | qualquer tipo de painel, no canvas ou numa doca |
| `lot create`, `herd apply`, `work run` | lotes, rebanhos e laços (o laço ainda pede o seu cartão de aprovação) |

Num terminal que não é Pastor, esses comandos são recusados ("'summon' is Shepherd-only"); no `summon` a mensagem ainda sugere pedir a marca a quem o convocou, ou a você.

O `summon` sem `--preset` dá ao terminal novo o preset do próprio Pastor, que é o que "abrir um terminal" quer dizer. Ele recusa um terminal livre como quem convoca. O `--model` escolhe o modelo de um agente Claude (ou Cursor) no lançamento; `collie model <nome> <modelo>` troca o de um agente Claude já rodando.

## Sub-Pastores

Um Pastor pode convocar outro Pastor com `collie summon <nome> --shepherd`, para dividir o trabalho em árvore: um modelo forte reparte, um sub-Pastor coordena a sua parte com agentes mais baratos.

- **Alcance** continua só por guia. O sub-Pastor alcança o que convoca e o Pastor de cima; o Pastor de cima não alcança os netos.
- **Profundidade:** no máximo 2 abaixo de um Pastor marcado por você no app. Um terceiro `--shepherd` é recusado, com a profundidade na mensagem.
- **Teto:** um sub-Pastor mantém no máximo 6 terminais convocados por ele; o sétimo é recusado.
- **Cercado:** fica no cercado de quem o convocou. `--paddock` e `paddock create` são recusados.
- **Dispensa** em cascata: primeiro tudo o que ele convocou, depois ele. Só o Pastor que o convocou pode dispensá-lo; um Pastor marcado por você nunca é dispensado por um agente.

Um sub-Pastor responde para cima com `collie reply` ou `collie lot post`, nunca com um `ask` bloqueante.

## Ask com portão

Um `ask` pode ser julgado por um comando em vez da palavra do próprio alvo:

```sh
collie ask api "Faça o total do carrinho incluir imposto" --check "npm test -- cart" --tries 3
```

Quando o `api` termina o turno, o serviço roda o check na pasta do `api`, sob o sandbox do `api` e sem nenhuma variável `COLLIE_*`. Passou: o ask devolve a resposta com `check: {status: "passed"}`. Falhou: o `api` recebe as últimas 40 linhas da saída e outro turno, até `--tries` (padrão 3, no máximo 10). Uma tentativa que muda um arquivo que o check nomeia é reprovada sem rodar o check, então o agente não se auto-aprova. O check e um `--spec` opcional ficam no serviço, nunca no repositório.

É a versão de uma tarefa só do [laço](/pt/docs/features/loop), que roda uma lista inteira assim, com um agente novo por tentativa.

## O app é o admin

Nada que um agente roda é "admin". Preferências, liberações do sandbox, o modo do sandbox, instalação de plug-ins e o land `pr` são do app (seus). O serviço só aceita pedidos de admin do app Collie assinado e recusa o token de admin vindo de dentro de qualquer terminal do Collie. [Daemon e socket](/pt/docs/internals/daemon-and-socket) traz os detalhes e os limites dessa checagem.

## Veja também

- [Como tudo se liga](/pt/docs/concepts/how-it-connects): o caminho de um `collie ask`.
- [Boas práticas](/pt/docs/guides/best-practices): formatos de equipe que funcionam.
- [Fields](/pt/docs/features/fields): agentes em paralelo num cercado, cada um na sua worktree.
- O [post do Pastor](/pt/features/shepherd).

---
title: "Registro de trabalho"
description: "O que cada agente está fazendo, guardado pelo daemon: tarefas, jobs, notas e commits, mais o painel Trabalho, as perguntas de status e os resumos."
---

O registro de trabalho é o que o daemon guarda sobre o que cada terminal está fazendo. Por terminal há um **trabalho**
ativo com tarefas, jobs (subagentes e shells em segundo plano), notas e commits. Os terminais Claude o preenchem sozinhos
pelos hooks; qualquer agente também escreve nele com `collie work …`. Você o lê no painel **Trabalho**, com
`collie work status` ou num resumo que não gasta tokens.

Use para ver onde um agente está sem perguntar a ele, para passar uma sessão para a próxima e como base do
[laço](/pt/docs/features/loop), que roda as tarefas abertas de um trabalho.

## Como se conecta

- O [laço](/pt/docs/features/loop) e a [fábrica](/pt/docs/features/factory) rodam sobre as tarefas de um trabalho e
  gravam nele o estado, o diário e os patches.
- Quando um trabalho fecha, o resumo vai para a [memória](/pt/docs/features/memory) como decisão não revisada.
- O alcance segue as [guias](/pt/docs/concepts/shepherd-and-terminals): um terminal vê só o próprio trabalho; um Pastor
  vê também o dos terminais ligados por guia a ele (`--terminal`); o app vê tudo.
- Os hooks do Claude que o alimentam estão em [hooks dos agentes](/pt/docs/internals/agent-hooks).

## Os dados

O daemon guarda tudo em `<raiz>/work/` (`work.json`, modo 0600, e `work-archive.jsonl`).

| Estado de | Valores |
|---|---|
| Tarefa | `open`, `inProgress`, `done`, `deferred` (com motivo), `abandoned` |
| Job | `running`, `finished`, `gone`, `unknown` |
| Trabalho | ativo ou fechado (por `merge`, `agent:<terminal>` ou `app`); um ativo por terminal |

Um job só fica `gone` quando confirmado (o terminal morreu, ou o processo não existe mais). Sem nenhum sinal por 30
minutos, um job `running` vira `unknown`; um sinal de fim posterior ainda o finaliza.

```stats
items:
  - value: 500
    label: tarefas por trabalho
  - value: 200
    label: jobs, notas e commits por trabalho
  - value: 200
    label: trabalhos fechados guardados
```

O que passa desses limites vai para `work-archive.jsonl`; nada é apagado. Só o `work.clear-history`, comando reservado
ao app, apaga os trabalhos fechados e o arquivo.

## Como um trabalho abre e fecha

**Trabalho implícito.** Sem trabalho ativo, o primeiro hook com tarefas ou job abre um trabalho chamado
`"<nome do terminal> — AAAA-MM-DD"`, com o cercado e a branch do terminal. `collie work task add` e `collie work note`
também abrem um.

**Fechamento por merge.** Um trabalho fecha sozinho (1) no `land` do cercado (não no modo `pr`, que ainda não foi
integrado) ou (2) no hook Stop, quando há um commit desde que o trabalho abriu e a branch é ancestral do destino (a
`baseBranch` do cercado, ou a branch do pasto). Um trabalho sem branch nunca fecha sozinho.

**Codex e shell** não têm hooks: usam só os comandos explícitos.

## Comandos

```sh
collie work start "Tela de login"          # um trabalho ativo por terminal
collie work task add "Validação do form"   # também abre um trabalho se não houver
collie work task defer "Validação do form" "esperando a API"
collie work note --decision "Manter o endpoint antigo até a 1.0"
collie work status                         # tarefas por estado, jobs, notas recentes
collie work done --reason "integrado à mão"
```

`task defer` e `task drop` pedem o motivo; `task reopen [--keep-tries]` devolve uma tarefa adiada ou abandonada ao lugar
em que estava. `collie work list [--closed]` e `collie work get <id>` leem trabalhos; `work reopen` reabre o último
fechado. Todas as flags estão na [referência da CLI](/pt/docs/reference/cli).

## O painel Trabalho

O plug-in **Trabalho** (dock direito) mostra, por trabalho do workspace: título, terminal · branch, tags de contagem por
estado, tarefas e jobs ao clicar e um ícone de alerta quando há job `gone`/`unknown` ou aprovação pendente. O menu "…"
de cada trabalho tem **Recolocar no trilho** e **Fechar…**; os fechados ficam recolhidos, com "Reabrir". Enquanto um laço
roda, o mesmo menu tem **Parar laço**.

### Perguntas de status não gastam tokens

Os botões "Onde estamos", "O que travou" e "O que está rodando" são respondidos pelo daemon com o registro, sem tocar no
agente. Texto digitado só conta como frase exata (sem acento nem maiúsculas: `onde estamos`, `status`, `o que travou`,
`rodando`…), com no máximo palavras de enchimento no fim (`agora`, `por favor`, `pf`…). Qualquer outra coisa pode ser
uma instrução e vai ao agente sem alteração.

### Roteamento do chat

`@nome` manda o resto do texto para esse terminal. Sem `@`, com um trabalho selecionado, vai para o Pastor do trabalho
(senão, o terminal do trabalho). Sem `@` e sem trabalho: "Escolha um trabalho ou comece com @nome.". A mensagem é
entregue depois que o agente fica 2 s calado.

### Aprovações

Pedidos de permissão (do hook `Notification` do Claude e da tela: `Do you want to …?` com `1. Yes`, `(y/n)`…) viram
cartões. Aprovar ou Negar só digita se **o mesmo pedido ainda está na tela** e nenhuma tecla chegou desde então; senão
nada é digitado. Com aprovação pendente, o chat não digita no terminal.

### Recolocar no trilho

**Recolocar no trilho** (ou `collie work rerail`) digita no agente um bloco só com o estado vivo: tarefas em andamento e
abertas, jobs rodando e as 5 decisões mais recentes, até 2000 caracteres. É recusado com aprovação pendente.

## Resumos

`collie work summary [--id <trabalho>] [--natural]` monta um resumo **só com o registro**: "Feito", "Para depois",
"Em aberto" (ou "Não feito", quando fechado) e "Onde parou". No painel, a palavra exata `resumo` no chat faz o mesmo.
`--natural` pede ao modelo local uma reescrita em linguagem simples; precisa do macOS 26 com Apple Intelligence ligada,
roda no aparelho sem rede e, passados 10 s, vale o resumo do registro.

Uma mensagem que começa com `?` vai a esse assistente local, que só **lê** o registro e nunca chega a um terminal.

`collie work history` lê os resumos imutáveis dos trabalhos fechados do seu cercado (padrão 20, no máximo 50) e
`collie work usage` mostra os tokens por tentativa como índice relativo, nunca dinheiro.

```callout
kind: note
title: Os campos dos payloads dos hooks são suposições
body: "Os nomes dos campos dos payloads dos hooks do Claude ainda não foram verificados contra payloads reais. O parser é tolerante, mas se as tarefas de um terminal nunca aparecem, veja `~/Library/Logs/Collie/hooks.log`."
```

## Armadilhas

- Um trabalho sem branch nunca fecha por merge: feche com `collie work done`.
- As frases de status do painel precisam ser exatas. "onde estamos com o login" vai ao agente e gasta tokens.
- Depois de reiniciar o daemon, um fechamento já guardado na memória pode ser guardado de novo (a marca de "já guardei"
  fica na memória do daemon).

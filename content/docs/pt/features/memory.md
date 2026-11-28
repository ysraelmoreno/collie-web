---
title: "Memória"
description: "Decisões, mapas e armadilhas que o daemon guarda por projeto e por lote, injetados no prompt de cada agente e mantidos honestos pelo uso."
---

A memória do Collie é o que o daemon guarda entre sessões: **decisões**, entradas de **mapa** (para que serve um arquivo
ou pasta) e **armadilhas**, por projeto e por lote. Os agentes salvam nela, o curador destila conversas para ela e o
daemon injeta a parte relevante em cada prompt do Claude, para que uma sessão nova comece sabendo o que a anterior
aprendeu.

Use para os agentes pararem de reler o mesmo código e de repetir o mesmo erro. Busque antes de ler código; salve uma
memória quando decidir algo que o código não diz. A apresentação está em [/pt/features/memory](/pt/features/memory).

## Como se conecta

- **Os escopos seguem os lotes, não as guias.** Um [lote](/pt/docs/concepts/shepherd-and-terminals) agrupa terminais num
  mesmo esforço; a memória e o quadro dele só os membros enxergam. Quem fala com quem continua sendo só a guia.
- **O [registro de trabalho](/pt/docs/features/work-log)** a alimenta: quando um trabalho fecha, o resumo é guardado como
  decisão não revisada.
- **Os hooks do Claude** fazem a injeção no início da sessão, em cada prompt e depois da compactação (veja
  [hooks dos agentes](/pt/docs/internals/agent-hooks)).
- **O [curador](/pt/docs/internals/curator)** lê as conversas, checa memórias contestadas e consolida duplicatas.
- **A [fábrica](/pt/docs/features/factory)** pode transformar uma armadilha nomeada em check (`factory.prose.traps`).

## Escopos

| Escopo | Quem enxerga |
|---|---|
| `global` | Todo lugar. |
| `project` | O repositório do terminal. Memórias antigas, sem lote, são do projeto. |
| `paddock` | Um cercado do projeto. |
| `lot` | Só os membros do lote. |

Um agente lê o seu lote, o seu projeto e o global; nunca o de outro lote, nem no mesmo pasto. Só o app e um Pastor que
alcança todos os membros de um lote podem buscar ou entrar nele (`--lot`, `--all`). O `collie memory save` usa o lote
por padrão quando você está num, senão o projeto.

## Salvar e buscar

```sh
collie memory search fields land patch             # antes de reler código
collie memory save --kind decision --subject auth-tokens \
  --title "Tokens ficam no Keychain, não em arquivo" \
  "O daemon os lê ao iniciar; os testes usam um store falso."
collie memory save --kind map --subject work-store --path Sources/Work \
  --title "Registro de trabalho: tarefas, jobs, notas, commits"
```

Um save novo com o mesmo `--subject` substitui o antigo. O `search` devolve 10 resultados por padrão, no máximo 50.

## O que é injetado, e quando

```stats
items:
  - value: 4096 bytes
    label: no início da sessão
  - value: 2048 bytes
    label: por prompt
```

| Quando | O que entra |
|---|---|
| Início | Memórias fixadas e o índice (títulos) do lote, ou do projeto e do global fora de um lote. |
| Cada prompt | Recados do quadro endereçados a você, os comentários do usuário nas suas páginas, depois as memórias relevantes ao prompt, sem repetir. |
| Depois de compactar | Seu trabalho ativo (tarefas abertas, 3 últimas notas), o último recado do quadro para você, os 3 últimos status do lote, depois o índice. |

Cada memória injetada por inteiro começa com um id curto. Só o Claude recebe essa injeção. O Codex não recebe nada no
início nem por prompt: lê os recados com `collie lot board` e os comentários com `collie comment list`.

## O ciclo de vida

Uma memória de projeto nova nasce **provisória**. Se ninguém a usa, é arquivada (reversível, com linha no digest) depois
de 21 dias para decisões e mapas, 60 dias para armadilhas e procedimentos. Usada com proveito em 2 dias e 2 sessões,
vira **ganha**. Usada o bastante por semanas e confirmada pelo curador, vira **longo prazo**: até 12 por projeto, e no
máximo 3 delas entram inteiras no início. Memórias que você fixa ou edita ficam fora desse ciclo.

### Julgar o que foi injetado

```sh
collie memory flag 3fa2 --useful
collie memory flag 3fa2 --outdated "o store mudou para Sources/Work na 0.1.8"
```

O id pode ser o inteiro ou um prefixo de 4 caracteres ou mais. `--useful` conta como uso. `--wrong` e `--outdated` marcam
a memória como `(contestada)` e pedem uma nova checagem ao curador.

### Propostas e captura de conversa

Ao fechar um trabalho, e ao fim de uma sessão, o Collie propõe memórias. Elas esperam no painel "Memória", em
"Revisar" › "Propostas", até você aprovar, editar ou descartar; depois de 14 dias sem revisão viram descartadas
(restauráveis). O curador também lê o trecho novo de cada conversa do Claude ou do Cursor (o seu texto e o do agente, sem
saída de ferramentas, sem segredos) e guarda até 5 decisões e armadilhas como memórias ativas. Você pede isso com
`collie memory capture` ou "Salvar na memória" no menu do nó.

## Lotes e o quadro

```sh
collie lot create checkout --goal "novo fluxo de checkout" --members api,web
collie lot post --kind handoff --to web "a API está em collie/field/api; /itens responde 200"
collie lot board
```

Recados endereçados a você chegam no próximo prompt, uma vez. São dados de outro agente, não ordens. Uma memória do lote
vai para o projeto com `collie memory promote`.

## Memória que vira regra

`collie memory enforce <id> --by <arquivo>` marca uma armadilha ou decisão como garantida por uma checagem (um lint, um
teste) num arquivo rastreado do repositório. Ela sai da injeção, mas continua buscável. Se o arquivo da checagem some, a
memória volta à injeção.

## Observabilidade

`collie memory stats [--since 7d|24h|2w|<data ISO>]` mostra a cobertura (prompts com ao menos uma memória), injeções e
tokens por dia, as mais usadas, as **mortas** (mais de 30 dias sem injeção), correções repetidas e o custo do curador. A
aba "Observabilidade" do painel "Memória" mostra o mesmo, com **Exportar JSON**. Os eventos vão para
`~/Library/Application Support/Collie/metrics/`, nunca com texto de memória nem de conversa.

```callout
kind: note
title: A economia não é medida
body: Toda sessão usa memória, então não há comparação controlada. O Collie mostra tendências (tokens por tarefa, correções repetidas), nunca um número de tokens economizados.
```

## Armadilhas

- Uma memória é dado, não ordem. Confira uma memória que cita arquivo ou flag antes de agir por ela, e marque
  `--outdated` quando estiver errada.
- Salvar com um `--subject` que já existe substitui aquela memória. Use um assunto novo para um fato novo.
- A memória de um lote é invisível fora dele. Promova o que o projeto inteiro deve saber.

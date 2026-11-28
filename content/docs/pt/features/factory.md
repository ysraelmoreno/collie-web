---
title: "Fábrica"
description: "Um perfil do projeto, um doctor que dá nota, parecer por personas e um auto-land que integra localmente, sem push."
status: preview
since: 0.2.0
---

A fábrica é um conjunto de camadas em cima do [laço](/pt/docs/features/loop) que leva um trabalho do PRD ao cercado
integrado com você aprovando o plano e o resultado, não cada passo. Tem um **perfil** no `collie-work.json`, um
**doctor** que dá nota a ele, **parecer por personas**, **aceite em runtime**, uma entrada por **PRD** e um **auto-land**
que faz o merge do cercado na base quando uma lista fixa de condições passa.

Use num projeto em que o laço já funciona e os checks merecem confiança. Tudo falha fechado: qualquer dúvida para o laço
com um motivo próprio e chama você. A apresentação está em [/pt/features/factory](/pt/features/factory).

```callout
kind: status
title: Prévia desde a 0.2.0
body: "O auto-land foi validado ponta a ponta num repositório descartável (cenários S1 a S10). Nada aqui faz push, abre PR ou cria tag: um land é um merge `--no-ff` local na base."
```

## Como se conecta

A fábrica lê o mesmo [`collie-work.json`](/pt/docs/reference/collie-work-json) do laço, sempre **como está commitado na
base**, nunca da árvore do agente. Roda dentro do laço: parecer, aceite e condições do land são etapas do
`collie work run`. Um [cercado](/pt/docs/concepts/paddocks-and-worktrees) ganha a marca persistente de "cercado fábrica",
que só você liga. Os resultados vão para o [registro de trabalho](/pt/docs/features/work-log) como notas, eventos do
diário e um resumo imutável.

## As camadas e o doctor

`collie factory doctor` dá nota de 0 a 3 a seis camadas, só leitura, a partir do `collie-work.json` e dos arquivos que ele
cita:

| Camada | O que mede |
|---|---|
| `static` | Lint, arquitetura e catracas (`factory.static.ratchets`). |
| `judge` | O portão: se roda testes, e onde o CI o roda. |
| `verification` | Cenários em runtime (`factory.verification.scenarios`). |
| `review` | Personas e limiar (`factory.review`). |
| `prose` | Armadilhas da memória nomeadas para virar check (`factory.prose.traps`). |
| `guardrails` | Orçamento, tentativas, comandos destrutivos, land, teto diário. |

Sai com 1 quando uma camada fica abaixo de `--min` (padrão 1). A skill de Pastor `factory-init` detecta a stack e monta
o perfil a partir dos modelos Swift, Node e Python do repositório do app.

```json collie-work.json
{
  "version": 1,
  "gate": "bash scripts/gate.sh",
  "precheck": "npm run lint --if-present",
  "factory": {
    "version": 1,
    "review": { "personas": ["correcao", "testes", "simplicidade", "seguranca"], "threshold": "major" },
    "guardrails": { "budgetSeconds": 1800, "maxTries": 3, "land": "manual", "autoLandPerDay": 3 }
  }
}
```

`budgetSeconds` e `maxTries` viram os padrões de `--budget` e `--tries`. Uma flag explícita vence o perfil, o perfil
vence o padrão, e o `collie work status` diz de onde veio cada valor. Um bloco `factory` inválido recusa o `work run`
numa linha.

## Parecer por personas

`collie work run --review` dá a cada tentativa um **parecer** de terminais revisores novos. As personas são `correcao`,
`seguranca`, `testes`, `simplicidade` e `motor-concorrencia`; `--personas auto` (padrão) deixa o roteador escolher, e
`--reviewer-model` define o modelo delas.

```compare
before:
  title: O que o parecer pode
  items:
    - Vetar uma tentativa com achado `blocker` ou `major` confirmado (arquivo e linha)
after:
  title: O que ele não pode
  items:
    - Aprovar sozinho; o check e o portão continuam decidindo
    - Provar independência; ele divide o `~/.claude.json` com os agentes
```

Revisor mudo ou inválido equivale a sem `--review`. `--no-review` desliga mesmo quando o perfil liga.

## Aceite em runtime

O check julga o código; o `--accept` julga o **resultado rodando** (a tela abre, o serviço responde):

```sh
collie work task add "Tela de login" --spec docs/specs/login.md \
  --check "swift test --filter LoginTests" \
  --accept "scripts/accept/login.sh" --accept-timeout 900
```

Ordem na tentativa: check, portão, aceite, parecer. O comando fica no estado do trabalho e nunca é lido da worktree.
`--accept-timeout` tem padrão 600 s, no máximo 1800. Uma falha conta como tentativa falha, com até 64 KB da saída na
nota da próxima tentativa.

## Do PRD às tarefas

```steps
items:
  - title: Guardar o PRD (dono)
    command: collie work prd add prd.md --origin "LIN-123" --terminal <pastor>
    result: Uma cópia imutável (até 1 MiB, modo 0444) e o sha256 no trabalho ativo.
  - title: Escrever o plano (Pastor)
    command: collie work plan lint docs/plano-x
    result: "A skill `factory-plan` escreve `waves.md` e `tasks/*.md`; o linter recusa com arquivo e linha e imprime o sha256 do pacote."
  - title: Aprovar o plano (dono)
    command: collie work plan apply docs/plano-x --approve <sha256> --terminal <pastor>
    result: Cria as tarefas, cada onda precisando da anterior. Nunca inicia o laço.
```

O linter recusa tarefa sem check executável, check que só faz grep ou lista o próprio arquivo da tarefa, cartão acima de
1500 caracteres, ciclo em `needs` e tarefa sem teste citado. Mudou um byte, o hash muda.

## Auto-land

```steps
items:
  - title: Marcar o cercado (só o dono)
    command: collie paddock factory meu-cercado on
    result: "Recusado se o perfil não for válido com `static` e `judge` em 1 ou mais. Nunca por MCP nem por terminal de agente."
  - title: Rodar com o land
    command: collie work run --max 6 --auto-land
    result: "O cartão diz `AUTO-LAND no fim` com o portão, o CI e o merge local."
```

`--auto-land` exige cercado fábrica, perfil commitado com `gate` e parecer ligado. Quando todas as tarefas terminam, o
laço confere em ordem, parando na primeira falha: o cercado ainda é fábrica, o teto diário, nenhum arquivo que julga o
land foi editado, o portão no HEAD, parecer limpo de cada tarefa, o aceite, o CI local (`factory.autoland.ci`, senão
`scripts/ci/run-tests.sh`, 1800 s), árvore limpa, base parada, ninguém mais trabalhando. Então `paddock land` por merge.

Cada falha tem o próprio `stopReason`: `landGateRed`, `landReviewVeto`, `landAcceptRed`, `landCiRed`, `landDirty`,
`landBaseMoved`, `landConflict`, `landNotFactory`, `landDailyCap`, `landNothing`. Quando para sem integrar, os commits da
tentativa viram patch em `work-loops/<trabalho>/discarded/` (recupere com `git am`) e as tarefas deles reabrem.

### Fila e tetos

- `--auto-land-max N` (padrão 1, no máximo 5): quantos trabalhos uma execução integra.
- `--queue`: você aprova o trabalho agora e ele espera na fila do cercado; uma corrente o roda depois de um land.
- `factory.guardrails.autoLandPerDay` (1 a 20, padrão 3): lands por 24 h, contados num registro do daemon.

Toda execução com `--auto-land` termina com um resumo em markdown escrito uma vez na pasta do daemon
(`work-loops/<trabalho>/autoland/…md`, modo 0444): horários, `stopReason`, base antes e depois, quem aprovou e quem
vetou, e a linha para reverter, como texto.

## Iscas e catraca

`collie factory bait list|report` lê um catálogo de mudanças ruins conhecidas e a taxa de captura por camada e persona.
`collie factory ratchet check|update|raise <nome>` roda uma medida cuja linha de base só desce; `raise` pede `--reason`.

## Limites conhecidos

- O revisor é um veto probabilístico: pode aprovar um bug justificado. O portão, o CI e o aceite são as checagens duras.
- `factory.guardrails.destructive` é só aviso; não bloqueia nada.
- Um `work stop` entre a última tentativa e o land deixa a tarefa feita com o commit no cercado.
- Com `--parallel` acima de 1, um commit feito depois da integração não passa por parecer de novo.

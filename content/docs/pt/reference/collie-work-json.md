---
title: "collie-work.json"
description: "O arquivo do projeto que define o portão do laço, as áreas de check, os fields e o perfil de fábrica."
---

O `collie-work.json` é um arquivo opcional na raiz de um projeto. Ele dá ao [laço](/pt/docs/features/loop) os seus padrões (o portão e o pré-check), dá nome a comandos de teste para que as tarefas sejam checadas por área, define como os [fields](/pt/docs/features/fields) se comportam e guarda o perfil da [fábrica](/pt/docs/features/factory). Sem ele, todo comando funciona como se ele não existisse.

Commite o arquivo. O laço lê a versão do commit (`HEAD`), nunca a sua árvore de trabalho, para que os agentes que ele julga não mudem as regras editando o arquivo.

## Exemplo

O arquivo do próprio repositório do Collie, na v0.3.1:

```json collie-work.json
{
  "version": 1,
  "gate": "scripts/ci/lint.sh && scripts/ci/check-architecture.sh",
  "smoke": "swift test --disable-sandbox --skip MemoryEventEmissionTests --filter WorkLoopTests --filter AttemptMachineTests --filter WorkStoreTests --filter LoopJournalTests --filter CommandsTests",
  "areas": {
    "work": "swift test --disable-sandbox --skip MemoryEventEmissionTests --filter WorkCommandTests --filter WorkLoopReviewTests --filter LaneHostTests",
    "factory": "swift test --disable-sandbox --skip MemoryEventEmissionTests --filter FactoryDoctorTests --filter FactoryProfileTests --filter FactoryBaitTests --filter FactoryModelsTests --filter RatchetTests",
    "ask": "swift test --disable-sandbox --skip MemoryEventEmissionTests --filter AskTests --filter AskClockTests"
  },
  "factory": {
    "version": 1,
    "static": {
      "architecture": ["scripts/ci/check-architecture.sh"]
    },
    "review": {
      "personas": ["correcao", "motor-concorrencia", "seguranca", "simplicidade", "testes"],
      "threshold": "major",
      "callOwner": true
    },
    "guardrails": {
      "budgetSeconds": 14400,
      "maxTries": 3,
      "destructive": ["git push", "git reset --hard", "git clean", "rm -rf", "paddock land"],
      "land": "manual"
    },
    "prose": {
      "traps": ["07d5be97", "2f68ae8d", "d38f661a", "0d2e6e32", "1dcc610a", "33d74083"]
    }
  }
}
```

## Chaves de primeiro nível

| Chave | Tipo | Padrão | O que faz |
|---|---|---|---|
| `version` | número | — | Opcional. Se houver, precisa ser `1`. |
| `gate` | comando | nenhum | Padrão do `collie work run --gate`: roda depois de cada check que passou. Obrigatório para `--auto-land`. |
| `precheck` | comando | nenhum | Padrão do `collie work run --precheck`: um check rápido na sessão do agente antes do completo. |
| `smoke` | comando | nenhum | Somado a todo check montado a partir de áreas. |
| `areas` | objeto, nome → comando | `{}` | Checks com nome para o `collie work task add --area`. |
| `full` | comando | nenhum | Lido e mostrado pelo `collie work config`. Nada mais na v0.3.1 o usa. |
| `fields` | objeto | — | `default` e `max`, abaixo. |
| `factory` | objeto | nenhum | O perfil de fábrica, abaixo. |

Uma chave desconhecida no primeiro nível ou dentro de `fields` é um aviso ("chave desconhecida ignorada: …"), não um erro.

### Comandos

Todo comando é um texto de até 1000 caracteres, não vazio, sem caracteres de controle (quebra de linha, tab, NUL) e sem caracteres de formato invisíveis. Ele roda num shell, na worktree, sob o sandbox do laço; exit 0 quer dizer que passou.

O `smoke` e os comandos de `areas` são unidos com `&&`, por isso não podem ter `;`, `||`, `#` nem um `&` sozinho: isso mudaria o sentido do check montado. Ponha essa lógica num script do projeto e chame o script. `gate`, `precheck` e `full` não são unidos e não passam por essa checagem.

### Áreas

Um nome de área usa `a-z`, `0-9` e `-`, de 1 a 40 caracteres; no máximo 50 áreas.

```sh
collie work task add "Corrigir timeout do ask" --spec docs/ask.md --area ask,work
```

monta o check da tarefa como `<ask> && <work> && <smoke>`, na ordem pedida, cada área uma vez. `--area` e `--check` juntos são recusados. O check é montado quando a tarefa é criada, a partir do arquivo da árvore de trabalho, e a tarefa guarda o comando montado.

### fields

| Chave | Tipo | Padrão | Faixa |
|---|---|---|---|
| `fields.default` | booleano | `false` | Com `true`, o `collie summon` dá um field ao agente sempre que `--field` seria aceito. `--no-field` desliga numa convocação. |
| `fields.max` | inteiro | `4` | De 1 a 8 fields vivos por cercado. |

Lido do `HEAD` do cercado. Arquivo inválido vale como padrão.

```callout
kind: status
title: Prévia
body: "Os fields são prévia desde a 0.3.0."
```

## O bloco factory

O `factory` é lido com rigor: um campo desconhecido em qualquer nível é erro ("campo desconhecido '…' no perfil de fábrica"), e um bloco inválido faz o `collie work run` recusar, numa linha. Ele é aplicado a partir do commit base, nunca da árvore do agente.

| Chave | Tipo | Padrão | Notas |
|---|---|---|---|
| `version` | número | — | Obrigatório, `1`. |
| `static.architecture` | lista de comandos | `[]` | Até 50. |
| `static.ratchets` | lista de `{name, measure, baseline?}` | `[]` | Até 50. `name` no formato de área, `measure` um comando, `baseline` um caminho no repositório. Nomes não se repetem. |
| `verification.scenarios` | lista de `{area, command}` | `[]` | Até 100. |
| `review.personas` | lista de nomes | `[]` | Até 20, de `docs/fabrica/personas`, sem repetir. |
| `review.threshold` | `"blocker"` ou `"major"` | `"major"` | A partir de que gravidade um achado confirmado veta. |
| `review.callOwner` | booleano | `false` | |
| `guardrails.budgetSeconds` | inteiro, 60–86400 | `14400` | Padrão do `--budget`; acima do teto do laço, 43200, é limitado a ele. |
| `guardrails.maxTries` | inteiro, 1–10 | `3` | Padrão do `--tries`. |
| `guardrails.destructive` | lista de textos | `[]` | Até 50, 200 caracteres cada. Só aparece como aviso; não bloqueia nada. |
| `guardrails.land` | `"manual"` ou `"factory-paddock"` | `"manual"` | Mostrado, não imposto: o auto-land só roda com `work run --auto-land`. |
| `guardrails.autoLandPerDay` | inteiro, 1–20 | `3` | Lands por 24 h. |
| `autoland.ci` | comando | `scripts/ci/run-tests.sh` | O CI local que o auto-land roda. |
| `autoland.timeoutSeconds` | inteiro, 60–86400 | `1800` | |
| `prose.traps` | lista de ids | `[]` | Até 200 ids de memória, 8 caracteres hexadecimais minúsculos cada. |

Um caminho de `baseline` precisa ser relativo, com até 200 caracteres, sem parte `..`, `.` ou vazia, e não pode apontar para `.git`, `.collie` nem para o `collie-work.json`.

Transformar um cercado em cercado fábrica (`collie paddock factory <nome> on`, só o dono) exige um perfil cujas camadas `static` e `judge` do doutor tenham nota 1 ou mais, commitado e fora do `.gitignore`. O `collie factory doctor` dá as notas.

```callout
kind: status
title: Prévia
body: "A fábrica e o auto-land são prévia desde a 0.2.0. Um auto-land é um merge `--no-ff` local: nunca faz push, nunca abre PR, nunca cria tag."
```

## Qual valor vence

No `work run`, uma flag explícita vence o perfil, e o perfil vence o padrão embutido. O `collie work status` diz de onde veio cada valor: "flag", "perfil" ou "padrão".

| Ajuste | Ordem |
|---|---|
| Portão, pré-check | `--gate` / `--precheck`, depois `gate` / `precheck` |
| Tentativas | `--tries`, depois `guardrails.maxTries`, depois 3 |
| Orçamento | `--budget`, depois `guardrails.budgetSeconds` (até 43200), depois 14400 |
| Revisão | `--review` ou `--no-review`, depois `factory.review` |

## Como o laço lê o arquivo

```steps
items:
  - title: Do commit
    result: "O `work run` lê o `collie-work.json` do `HEAD`. O arquivo precisa ser comum (não um link), com até 16 KB."
  - title: Mudanças não commitadas
    result: "\"aviso: collie-work.json tem mudanças não commitadas; o laço usa a versão do commit (HEAD), sem elas\""
  - title: Inválido fora da fábrica
    result: "Um aviso, e o laço roda com os padrões embutidos."
  - title: Bloco factory inválido
    result: "O `work run` recusa."
  - title: Uma tentativa edita o arquivo
    result: "A tentativa não é julgada (\"alterou collie-work.json\"), a não ser que o spec da tarefa cite o arquivo."
```

## collie work config

O `collie work config` mostra no que o arquivo da árvore de trabalho resulta e não roda nada. Ele imprime o caminho, os comandos `gate`, `precheck`, `smoke` e `full` ("(não definido)" quando faltam), cada área como o check completo em que ela vira e os avisos; depois, "Só leitura: nenhum comando do arquivo foi executado." Não mostra `fields` nem `factory`. Com `--json`, as chaves são `output`, `exists`, `source`, `path`, `warnings`, `areas`, `gate`, `precheck`, `smoke` e `full`. Sem arquivo: "nenhum collie-work.json neste projeto".

## Erros

| Caso | Mensagem |
|---|---|
| Mais de 16 KB | `collie-work.json tem N bytes; o limite é 16 KB` |
| Não é JSON | `collie-work.json não é JSON válido` |
| Não é objeto | `collie-work.json precisa ser um objeto JSON ({ ... })` |
| Versão errada | `collie-work.json tem version V; só a version 1 é aceita` |
| Comando longo demais | `o comando 'k' tem N caracteres; o limite é 1000` |
| Caractere de controle | `o comando 'k' tem caractere de controle (quebra de linha, tab, NUL...)` |
| Comando vazio | `o comando 'k' está vazio` |
| `;`, `\|\|`, `#`, `&` no smoke ou numa área | `o comando 'k' tem 'T', que muda o sentido do check montado (área && smoke); ponha isso num script do projeto e chame o script` |
| Nome de área inválido | `nome de área inválido 'n': use a-z, 0-9 e '-', de 1 a 40 caracteres` |
| Área desconhecida | `área 'n' não existe em collie-work.json; existem: …` |
| `fields.max` fora da faixa | `'fields.max' em collie-work.json é N; use de 1 a 8` |
| Um link | `collie-work.json é um link simbólico; só um arquivo regular é lido` |

## Pontos de partida

Em `docs/fabrica/modelos/`, no repositório do Collie, há perfis para Swift, Node e Python, cada um com um script de `gate`, um `precheck`, um `smoke`, uma área e um bloco de fábrica. A skill de Pastor `factory-init` escolhe um para a sua stack.

## Veja também

- [Laço](/pt/docs/features/loop): o que o portão e o check julgam.
- [Fábrica](/pt/docs/features/factory): o doutor, a revisão e o auto-land.
- [Referência da CLI](/pt/docs/reference/cli): `work run`, `work task add`, `work config`.

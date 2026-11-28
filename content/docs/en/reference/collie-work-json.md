---
title: "collie-work.json"
description: "The per-project file that sets the loop's gate, the named check areas, fields and the factory profile."
---

`collie-work.json` is an optional file at the root of a project. It gives the [loop](/docs/features/loop) its defaults (the gate and the pre-check), names test commands so tasks can be checked by area, sets how [fields](/docs/features/fields) behave, and holds the [factory](/docs/features/factory) profile. Without it, every command behaves as if it were not there.

Commit it. The loop reads the version in the commit (`HEAD`), never your working tree, so the agents it judges cannot change the rules by editing the file.

## Example

The Collie repository's own file, at v0.3.1:

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

## Top-level keys

| Key | Type | Default | What it does |
|---|---|---|---|
| `version` | number | — | Optional. If present, must be `1`. |
| `gate` | command | none | Default for `collie work run --gate`: runs after every check that passed. Required for `--auto-land`. |
| `precheck` | command | none | Default for `collie work run --precheck`: a fast check in the agent's session before the full one. |
| `smoke` | command | none | Appended to every check built from areas. |
| `areas` | object, name → command | `{}` | Named checks for `collie work task add --area`. |
| `full` | command | none | Read and shown by `collie work config`. Nothing else in v0.3.1 uses it. |
| `fields` | object | — | `default` and `max`, below. |
| `factory` | object | none | The factory profile, below. |

An unknown key at the top level or under `fields` is a warning ("chave desconhecida ignorada: …"), not an error.

### Commands

Every command is a string of at most 1000 characters, not blank, with no control characters (newline, tab, NUL) and no invisible format characters. It runs in a shell, in the worktree, under the loop's sandbox, with exit 0 meaning pass.

`smoke` and the `areas` commands are joined with `&&`, so they may not contain `;`, `||`, `#` or a lone `&`: those would change what the joined check means. Put that logic in a script of the project and call the script. `gate`, `precheck` and `full` are not joined and are not checked for these characters.

### Areas

An area name uses `a-z`, `0-9` and `-`, 1 to 40 characters; at most 50 areas.

```sh
collie work task add "Fix ask timeout" --spec docs/ask.md --area ask,work
```

builds the task's check as `<ask> && <work> && <smoke>`, in the order you asked, each area once. `--area` and `--check` together are refused. The check is built when the task is added, from the file in the working tree, and the task keeps the built command.

### fields

| Key | Type | Default | Range |
|---|---|---|---|
| `fields.default` | boolean | `false` | With `true`, `collie summon` gives the agent a field when `--field` would be accepted. `--no-field` turns it off for one summon. |
| `fields.max` | integer | `4` | 1 to 8 live fields per paddock. |

Read from the paddock's `HEAD`. An invalid file means the defaults.

```callout
kind: status
title: Preview
body: "Fields are a preview since 0.3.0."
```

## The factory block

`factory` is read strictly: an unknown field at any level is an error ("campo desconhecido '…' no perfil de fábrica"), and an invalid block makes `collie work run` refuse, in one line. It is applied from the base commit, never from the agent's tree.

| Key | Type | Default | Notes |
|---|---|---|---|
| `version` | number | — | Required, `1`. |
| `static.architecture` | list of commands | `[]` | Up to 50. |
| `static.ratchets` | list of `{name, measure, baseline?}` | `[]` | Up to 50. `name` is an area-style name, `measure` a command, `baseline` a path in the repository. Names must not repeat. |
| `verification.scenarios` | list of `{area, command}` | `[]` | Up to 100. |
| `review.personas` | list of names | `[]` | Up to 20, from `docs/fabrica/personas`, no repeats. |
| `review.threshold` | `"blocker"` or `"major"` | `"major"` | What severity of confirmed finding vetoes. |
| `review.callOwner` | boolean | `false` | |
| `guardrails.budgetSeconds` | integer, 60–86400 | `14400` | Default for `--budget`; above the loop's ceiling of 43200 it is capped. |
| `guardrails.maxTries` | integer, 1–10 | `3` | Default for `--tries`. |
| `guardrails.destructive` | list of strings | `[]` | Up to 50, 200 characters each. Shown as a warning only; blocks nothing. |
| `guardrails.land` | `"manual"` or `"factory-paddock"` | `"manual"` | Shown, not enforced: the auto-land only runs with `work run --auto-land`. |
| `guardrails.autoLandPerDay` | integer, 1–20 | `3` | Lands per 24 h. |
| `autoland.ci` | command | `scripts/ci/run-tests.sh` | The local CI the auto-land runs. |
| `autoland.timeoutSeconds` | integer, 60–86400 | `1800` | |
| `prose.traps` | list of ids | `[]` | Up to 200 memory ids, 8 lowercase hex characters each. |

A `baseline` path must be relative, at most 200 characters, with no `..`, `.` or empty part, and must not point into `.git`, `.collie` or at `collie-work.json`.

Turning a paddock into a factory paddock (`collie paddock factory <name> on`, owner only) needs a profile whose doctor layers `static` and `judge` score at least 1, committed and not ignored by git. `collie factory doctor` gives the scores.

```callout
kind: status
title: Preview
body: "The factory and the auto-land are a preview since 0.2.0. An auto-land is a local `--no-ff` merge: it never pushes, opens a PR or tags."
```

## Which value wins

For `work run`, an explicit flag wins over the profile, and the profile over the built-in default. `collie work status` says where each value came from: "flag", "perfil" or "padrão".

| Setting | Order |
|---|---|
| Gate, pre-check | `--gate` / `--precheck`, then `gate` / `precheck` |
| Tries | `--tries`, then `guardrails.maxTries`, then 3 |
| Budget | `--budget`, then `guardrails.budgetSeconds` (capped at 43200), then 14400 |
| Review | `--review` or `--no-review`, then `factory.review` |

## How the loop reads it

```steps
items:
  - title: From the commit
    result: "`work run` reads `collie-work.json` from `HEAD`. The file must be a regular file (not a link) of at most 16 KB."
  - title: Uncommitted changes
    result: "\"aviso: collie-work.json tem mudanças não commitadas; o laço usa a versão do commit (HEAD), sem elas\""
  - title: Invalid outside factory
    result: "A warning, and the loop runs with built-in defaults."
  - title: Invalid factory block
    result: "`work run` refuses."
  - title: An attempt edits the file
    result: "The attempt is not judged (\"alterou collie-work.json\"), unless the task's spec names the file."
```

## collie work config

`collie work config` shows what the file in the working tree resolves to and runs nothing. It prints the path, the `gate`, `precheck`, `smoke` and `full` commands ("(não definido)" when absent), each area as the full check it becomes, and the warnings; then "Só leitura: nenhum comando do arquivo foi executado." It does not show `fields` or `factory`. With `--json` the keys are `output`, `exists`, `source`, `path`, `warnings`, `areas`, `gate`, `precheck`, `smoke` and `full`. Without a file: "nenhum collie-work.json neste projeto".

## Errors

| Case | Message |
|---|---|
| Over 16 KB | `collie-work.json tem N bytes; o limite é 16 KB` |
| Not JSON | `collie-work.json não é JSON válido` |
| Not an object | `collie-work.json precisa ser um objeto JSON ({ ... })` |
| Wrong version | `collie-work.json tem version V; só a version 1 é aceita` |
| Command too long | `o comando 'k' tem N caracteres; o limite é 1000` |
| Control character | `o comando 'k' tem caractere de controle (quebra de linha, tab, NUL...)` |
| Empty command | `o comando 'k' está vazio` |
| `;`, `\|\|`, `#`, `&` in smoke or an area | `o comando 'k' tem 'T', que muda o sentido do check montado (área && smoke); ponha isso num script do projeto e chame o script` |
| Bad area name | `nome de área inválido 'n': use a-z, 0-9 e '-', de 1 a 40 caracteres` |
| Unknown area | `área 'n' não existe em collie-work.json; existem: …` |
| `fields.max` out of range | `'fields.max' em collie-work.json é N; use de 1 a 8` |
| A link | `collie-work.json é um link simbólico; só um arquivo regular é lido` |

## Starting points

`docs/fabrica/modelos/` in the Collie repository has profiles for Swift, Node and Python, each with a `gate` script, a `precheck`, a `smoke`, one area and a factory block. The `factory-init` Shepherd skill picks one for your stack.

## Related

- [Loop](/docs/features/loop): what the gate and the check judge.
- [Factory](/docs/features/factory): the doctor, review and auto-land.
- [CLI reference](/docs/reference/cli): `work run`, `work task add`, `work config`.

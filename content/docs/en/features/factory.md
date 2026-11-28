---
title: "Factory"
description: "A project profile, a doctor that scores it, review by personas and an auto-land that merges locally, never pushes."
status: preview
since: 0.2.0
---

The factory is a set of layers on top of the [loop](/docs/features/loop) that let a work go from PRD to a merged
paddock with you approving the plan and the result, not each step. It has a **profile** in `collie-work.json`, a
**doctor** that scores it, **review by personas**, **runtime acceptance**, an entry from a **PRD**, and an **auto-land**
that merges the paddock into its base when a fixed list of conditions passes.

Use it on a project where the loop already works and you trust the checks. Everything fails closed: any doubt stops
the loop with its own reason and calls you. For the pitch, see [/features/factory](/features/factory).

```callout
kind: status
title: Preview since 0.2.0
body: "The auto-land was validated end to end in a throwaway repository (scenarios S1 to S10). Nothing here pushes, opens a PR or tags: a land is a local `--no-ff` merge into the base."
```

## How it connects

The factory reads the same [`collie-work.json`](/docs/reference/collie-work-json) as the loop, always **as committed
at the base**, never from the agent's tree. It runs inside the loop: review, acceptance and the land conditions are steps
of `collie work run`. A [paddock](/docs/concepts/paddocks-and-worktrees) gets a persistent "cercado fábrica" mark that
only you set. The results land in the [work log](/docs/features/work-log) as notes, journal events and an immutable
summary.

## The layers and the doctor

`collie factory doctor` scores six layers from 0 to 3, read only, from `collie-work.json` and the files it cites:

| Layer | What it measures |
|---|---|
| `static` | Lint, architecture and ratchets (`factory.static.ratchets`). |
| `judge` | The gate: whether it runs tests, and where the CI runs it. |
| `verification` | Runtime scenarios (`factory.verification.scenarios`). |
| `review` | Personas and threshold (`factory.review`). |
| `prose` | Memory pitfalls named to become checks (`factory.prose.traps`). |
| `guardrails` | Budget, tries, destructive commands, land, daily cap. |

It exits 1 when a layer is below `--min` (default 1). The `factory-init` Shepherd skill detects the stack and builds the
profile from the Swift, Node and Python models of the app's repository.

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

`budgetSeconds` and `maxTries` become the defaults of `--budget` and `--tries`. An explicit flag wins over the profile,
the profile over the default, and `collie work status` says where each value came from. An invalid `factory` block
refuses `work run` in one line.

## Review by personas

`collie work run --review` gives each attempt an **opinion** from fresh reviewer terminals. The personas are
`correcao`, `seguranca`, `testes`, `simplicidade` and `motor-concorrencia`; `--personas auto` (default) lets the router
pick, and `--reviewer-model` sets their model.

```compare
before:
  title: What the review can do
  items:
    - Veto an attempt with a confirmed `blocker` or `major` finding (file and line)
after:
  title: What it cannot do
  items:
    - Approve alone; the check and the gate still decide
    - Prove independence; it shares `~/.claude.json` with the agents
```

A mute or invalid reviewer equals no `--review`. `--no-review` turns it off even when the profile turns it on.

## Runtime acceptance

The check judges the code; `--accept` judges the **result running** (the screen opens, the service answers):

```sh
collie work task add "Login screen" --spec docs/specs/login.md \
  --check "swift test --filter LoginTests" \
  --accept "scripts/accept/login.sh" --accept-timeout 900
```

Order in an attempt: check, gate, acceptance, opinion. The command stays in the work's state and is never read from the
worktree. `--accept-timeout` defaults to 600 s, at most 1800. A failure counts as a failed attempt, with up to 64 KB of
its output in the next attempt's note.

## From a PRD to tasks

```steps
items:
  - title: Keep the PRD (owner)
    command: collie work prd add prd.md --origin "LIN-123" --terminal <shepherd>
    result: An immutable copy (up to 1 MiB, mode 0444) and its sha256 in the active work.
  - title: Write the plan (Shepherd)
    command: collie work plan lint docs/plan-x
    result: "The `factory-plan` skill writes `waves.md` and `tasks/*.md`; the linter refuses with file and line and prints the package's sha256."
  - title: Approve the plan (owner)
    command: collie work plan apply docs/plan-x --approve <sha256> --terminal <shepherd>
    result: Creates the tasks, each wave needing the one before. It never starts the loop.
```

The linter refuses a task with no runnable check, a check that only greps or lists the task's own file, a card over
1500 characters, a cycle in `needs` and a task with no test cited. If one byte changes, the hash changes.

## Auto-land

```steps
items:
  - title: Mark the paddock (owner only)
    command: collie paddock factory my-paddock on
    result: "Refused unless the profile is valid with `static` and `judge` at 1 or more. Never by MCP or an agent terminal."
  - title: Run with the land
    command: collie work run --max 6 --auto-land
    result: "The card says `AUTO-LAND no fim` with the gate, the CI and the local merge."
```

`--auto-land` needs a factory paddock, a committed profile with a `gate`, and review on. When every task is done, the
loop checks in order, stopping at the first failure: the paddock is still factory, the daily cap, no file that judges the
land was edited, the gate on HEAD, a clean review of each task, the acceptance, the local CI (`factory.autoland.ci`,
else `scripts/ci/run-tests.sh`, 1800 s), a clean tree, an unmoved base, nobody else working. Then `paddock land` by
merge.

Each failure has its own `stopReason`: `landGateRed`, `landReviewVeto`, `landAcceptRed`, `landCiRed`, `landDirty`,
`landBaseMoved`, `landConflict`, `landNotFactory`, `landDailyCap`, `landNothing`. When it stops without landing, the
attempt's commits become a patch in `work-loops/<work>/discarded/` (recover with `git am`) and their tasks reopen.

### Queue and caps

- `--auto-land-max N` (default 1, at most 5): how many works one execution lands.
- `--queue`: you approve the work now and it waits in the paddock's queue; a chain runs it after a land.
- `factory.guardrails.autoLandPerDay` (1 to 20, default 3): lands per 24 h, from a record the daemon keeps.

Every `--auto-land` execution ends with a markdown summary written once in the daemon's folder
(`work-loops/<work>/autoland/…md`, mode 0444): times, `stopReason`, base before and after, who approved and who vetoed,
and the line to revert, as text.

## Bait and ratchet

`collie factory bait list|report` reads a catalog of known-bad changes and the capture rate per layer and persona.
`collie factory ratchet check|update|raise <name>` runs a measure whose baseline only goes down; `raise` needs a
`--reason`.

## Known limits

- A reviewer is a probabilistic veto: it can approve a justified bug. The gate, the CI and the acceptance are the hard
  checks.
- `factory.guardrails.destructive` is a warning only; it blocks nothing.
- A `work stop` between the last attempt and the land leaves the task done with its commit in the paddock.
- With `--parallel` above 1, a commit made after the integration is not reviewed again.

---
title: "Loop"
description: "Run a work's open tasks unattended: a fresh agent per attempt, and a check, never the agent, decides."
---

The loop (`collie work run`) runs the open tasks of a work with nobody watching. Each attempt is a fresh agent in the
paddock, and what decides whether a task passed is a shell command you wrote: the task's **check**. The agent never
grades itself. Nothing starts until you approve the list of tasks and checks on a card in the app.

Use it when the work splits into tasks you can judge with a command: a test filter, a build, a script that exits 0. If
you cannot write the check, the task is not ready for the loop. For the pitch, see [/features/loop](/features/loop).

## How it connects

The loop sits on top of the [work log](/docs/features/work-log): it runs the tasks of the Shepherd's active work, and
it writes its state, notes and journal back into that work. It needs a [paddock](/docs/concepts/paddocks-and-worktrees),
because each attempt resets the paddock's worktree, and it runs every agent and check under the paddock's strict
[sandbox](/docs/features/sandbox). With `--parallel` it uses temporary worktrees, the same mechanism as
[fields](/docs/features/fields). The [factory](/docs/features/factory) adds review, a profile and the auto-land on top.

## Start a loop

```steps
items:
  - title: Ask the Shepherd in words
    command: "/collie:loop add a dark mode toggle to settings"
    result: The Shepherd splits the request, writes a spec and proposes a check per task, and shows it all in the chat.
  - title: Add each task
    command: collie work task add "Toggle" --spec docs/specs/toggle.md --check "npm test -- toggle"
    result: The spec is a project file; the check is kept in the work record, not in the repo.
  - title: Run it
    command: collie work run --max 6 --gate "npm run lint"
    result: Returns `awaiting approval` at once. A card in the app shows the paddock, the limits and each task with its check.
  - title: Approve on the card
    result: Only **Permitir** starts the loop. Denying, or no answer in 10 minutes, tells the Shepherd that nothing ran.
```

`/collie:loop` only teaches the agent the procedure. It reaches Claude terminals (a `collie` plugin passed with
`--plugin-dir`) and Cursor terminals. Codex has no such command: ask for the loop in words.

## What happens in an attempt

1. A fresh agent named `<work>-<task>-t<n>` opens in the paddock with the spec path and the rules of the attempt.
2. When its turn ends with a commit, the optional `--precheck` runs (up to 180 s). If it fails, the same agent gets the
   last 40 lines of output once and tries again.
3. The agent is dismissed. Then the check runs in the worktree, then the gate (`--gate`), then the runtime acceptance
   (`--accept` on the task, if any).
4. The attempt **passes** only with check exit 0, gate exit 0 (if set), a new commit on the same branch and no dirty
   tracked file.
5. If it fails, the reason and the tail of the check's output become a note the next agent reads, the attempt becomes a
   patch in `<root>/work-loops/<work>/<task>-<n>.patch`, and the worktree goes back to the starting commit. After
   `--tries` failures the task is deferred.

The check, the gate and the loop's git run under the loop's own strict profile, with only toolchain variables (`PATH`,
`HOME`, `LANG`, `DEVELOPER_DIR`…). They never receive tokens or `SSH_AUTH_SOCK`.

### The agent cannot rewrite its judge

The check lives in the work record, so the agent never edits it. A check or gate that calls a script of the repository
counts only if the attempt did not change that script: the loop fails an attempt that alters a path the gate runs, or a
path written in full in the command that already existed. Since 0.3.0 it also records `node_modules/.bin`, `.venv/bin`
and `venv/bin` before the first attempt and refuses a runner that changed there, unless the spec cites an install.

## Limits

```stats
items:
  - value: 30
    label: "`--max`, attempts in all (required)"
  - value: 10
    label: "`--tries`, per task (default 3)"
  - value: 14 400 s
    label: "`--timeout`, one turn (default 3600)"
  - value: 43 200 s
    label: "`--budget`, turns and checks (default 14 400)"
```

These are hard ceilings. There is no token cost limit. `work run` also refuses when a task has no check, when the
paddock already has a loop, when another agent of the paddock is working, or when a tracked file is modified.

## Useful flags

| Flag | What it does |
|---|---|
| `--gate "<cmd>"` | Runs after every check that passed; common to all tasks (lint, build). |
| `--precheck "<cmd>"` | Fast command at the end of each turn with a commit, before the check. |
| `--parallel <n>` | Up to 4 tasks at once, each in a lane; only tasks with non-overlapping `--scope`. |
| `--escalate agent:model,…` | Attempt `n` uses entry `min(n, k)`: cheap first, stronger after failures. |
| `--notify task\|end` | `end` (default) tells the Shepherd only of a deferred task, a stop and the end. |
| `--review` | Opinion by personas on each attempt (preview, see [factory](/docs/features/factory)). |

Per task, `collie work task add` takes `--scope`, `--needs`, `--evidence "<glob>"`, `--accept`, `--green-ok`, `--agent`
and `--model`. The full list is in the [CLI reference](/docs/reference/cli).

## Parallel lanes

With `--parallel` above 1, each ready task runs in a **lane**: a temporary worktree (`.collie/paddocks/lane-…`, branch
`collie/lane/…`) cut from the paddock's HEAD. A lane writes only its own branch. One integrator merges a passed lane
into the paddock's branch (no fast-forward) and **runs the gate again** on the merged tree. A conflict or a broken gate
undoes the merge and retries the task in a new lane.

```callout
kind: warning
title: Scope decides who runs together, not what the agent touches
body: "A task without `--scope` is exclusive and runs alone. Tasks that all touch the same file (`Package.swift`, an index) conflict at integration. A new lane has no build cache: every attempt pays a cold build."
```

## Watch and stop

- `collie work status` shows `em laço: <task> (tentativa 2/3)`, and with lanes one line per lane.
- `collie work status --events [N]` shows the loop's journal (default 20, at most 100).
- `collie work wait --since <version>` answers when the work changes or the loop ends (default 600 s, at most 3600). Use
  it instead of waiting for a typed notice: the notice is a hint and may not arrive.
- `collie work stop` stops after the current attempt's verdict (forced after 300 s); `--now` drops the attempt.
- In the app, the **Trabalho** (Work) panel and the "LAÇOS" section of the side panel show the running loop.

Restarting the daemon stops the loop; `collie work run` again continues from the next open task.

## Trust a paddock

"Sempre neste cercado" on the approval card trusts loops of that paddock: later loops start without a card and the
Shepherd gets a notice with the tasks and checks. Only the app turns it on or off (Preferences › "Laços", **Revogar**).
Every other limit still applies.

## Pitfalls

- A check that already passes before the task proves nothing. `work run` refuses it unless the task has `--green-ok` (a
  refactoring).
- `swift build` does not compile tests. Use `swift build --build-tests` as the precheck.
- A dirty tree stops the loop and nothing is reset. Commit or stash your own changes before `work run`.
- The tasks of a loop are the ones open at `run`; a task added later waits for the next loop.

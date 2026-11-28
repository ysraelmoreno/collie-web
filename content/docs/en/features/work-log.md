---
title: "Work log"
description: "What each agent is doing, kept by the daemon: tasks, jobs, notes and commits, plus the Trabalho panel, status questions and summaries."
---

The work log is the daemon's record of what each terminal is doing. Per terminal there is one active **work** with its
tasks, jobs (subagents and background shells), notes and commits. Claude terminals fill it on their own through hooks;
any agent can also write to it with `collie work …`. You read it in the **Trabalho** (Work) panel, with
`collie work status`, or as a summary that costs no tokens.

Use it to see where an agent stands without asking it, to hand a session over to the next one, and as the base for the
[loop](/docs/features/loop), which runs the open tasks of a work.

## How it connects

- The [loop](/docs/features/loop) and the [factory](/docs/features/factory) run on a work's tasks and write their
  state, journal and patches into it.
- When a work closes, its summary goes to [memory](/docs/features/memory) as an unreviewed decision.
- Reach follows [leashes](/docs/concepts/shepherd-and-terminals): a terminal sees only its own work; a Shepherd also sees
  the works of terminals leashed to it (`--terminal`); the app sees everything.
- The Claude hooks that feed it are described in [agent hooks](/docs/internals/agent-hooks).

## The data

The daemon keeps it in `<root>/work/` (`work.json`, mode 0600, and `work-archive.jsonl`).

| State of | Values |
|---|---|
| Task | `open`, `inProgress`, `done`, `deferred` (with a reason), `abandoned` |
| Job | `running`, `finished`, `gone`, `unknown` |
| Work | active or closed (by `merge`, `agent:<terminal>` or `app`); one active per terminal |

A job is `gone` only when confirmed (the terminal died, or the process no longer exists). With no signal for 30 minutes
a `running` job becomes `unknown`; a later end signal still finishes it.

```stats
items:
  - value: 500
    label: tasks per work
  - value: 200
    label: jobs, notes and commits per work
  - value: 200
    label: closed works kept
```

Past these limits the excess goes to `work-archive.jsonl`; nothing is deleted. Only `work.clear-history`, a command
reserved to the app, deletes closed works and the archive.

## How a work opens and closes

**Implicit work.** With no active work, the first hook that carries tasks or a job opens one named
`"<terminal name> — YYYY-MM-DD"`, with the terminal's paddock and branch. `collie work task add` and `collie work note`
also open one.

**Closed by merge.** A work closes by itself (1) when its paddock is landed (not in `pr` mode, which is not integrated
yet), or (2) at a Stop hook, when there was a commit since the work opened and the branch is an ancestor of the target
(the paddock's `baseBranch`, or the pasture's branch). A work with no branch never closes by itself.

**Codex and shell** have no hooks: they use only the explicit commands.

## Commands

```sh
collie work start "Login screen"          # one active work per terminal
collie work task add "Form validation"    # also opens a work if none is active
collie work task defer "Form validation" "waiting for the API"
collie work note --decision "Keep the old endpoint until 1.0"
collie work status                        # tasks by state, jobs, recent notes
collie work done --reason "merged by hand"
```

`task defer` and `task drop` need a reason; `task reopen [--keep-tries]` puts a deferred or dropped task back where it
was. `collie work list [--closed]` and `collie work get <id>` read works; `work reopen` reopens the last one closed. See
the [CLI reference](/docs/reference/cli) for every flag.

## The Trabalho panel

The **Trabalho** plug-in (right dock) shows, per work of the workspace: title, terminal · branch, count tags by state,
tasks and jobs on click, and an alert icon when a job is `gone`/`unknown` or an approval is pending. The "…" menu of a
work has **Recolocar no trilho** and **Fechar…**; closed works stay collapsed, with "Reabrir". While a loop runs, the
same menu has **Parar laço**.

### Status questions cost no tokens

The buttons "Onde estamos", "O que travou" and "O que está rodando" are answered by the daemon from the record, without
touching the agent. Typed text counts only as an exact phrase (no accents or capitals: `onde estamos`, `status`,
`o que travou`, `rodando`…), with at most filler words at the end (`agora`, `por favor`, `pf`…). Anything else may be an
instruction and goes to the agent unchanged.

### Chat routing

`@name` sends the rest of the text to that terminal. Without `@`, with a work selected, it goes to the work's Shepherd
(else the work's terminal). Without `@` and without a work: "Escolha um trabalho ou comece com @nome.". A message is
delivered after the agent has been quiet for 2 s.

### Approvals

Permission prompts (from Claude's `Notification` hook and from the screen: `Do you want to …?` with `1. Yes`, `(y/n)`…)
become cards. Approving or denying types only if **the same prompt is still on screen** and no key arrived since;
otherwise nothing is typed. While an approval is pending, the chat does not type into the terminal.

### Put back on track

**Recolocar no trilho** (or `collie work rerail`) types into the agent a block with only the live state: tasks in
progress and open, running jobs and the 5 newest decisions, at most 2000 characters. It is refused while an approval is
pending.

## Summaries

`collie work summary [--id <work>] [--natural]` builds a summary **from the record only**: "Feito", "Para depois",
"Em aberto" (or "Não feito" when closed) and "Onde parou". In the panel, the exact word `resumo` in the chat does the
same. `--natural` asks the on-device model for a plain-language rewrite; it needs macOS 26 with Apple Intelligence on,
runs on the machine with no network, and falls back to the record after 10 s.

A message that starts with `?` goes to that local assistant, which only **reads** the record and never reaches a
terminal.

`collie work history` reads the immutable summaries of your paddock's closed works (default 20, at most 50), and
`collie work usage` shows the tokens per attempt as a relative index, never money.

```callout
kind: note
title: Hook payload fields are assumptions
body: "The names of the Claude hook payload fields are not yet verified against real payloads. The parser is tolerant, but if a terminal's tasks never show up, check `~/Library/Logs/Collie/hooks.log`."
```

## Pitfalls

- A work with no branch never closes by merge: close it with `collie work done`.
- The panel's status phrases must be exact. "onde estamos com o login" goes to the agent and spends tokens.
- After a daemon restart, a closing already saved to memory can be saved again (the "already saved" mark lives in the
  daemon's memory).

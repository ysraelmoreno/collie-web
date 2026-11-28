---
title: "Agent hooks"
description: "What Collie writes for each Claude, Cursor and Codex terminal, and what the agent sends back."
---

An agent in Collie is the same CLI you run in any terminal: `claude`, `cursor-agent` or `codex`. Collie does not patch it. It starts it with a few extra flags that point to files the daemon writes for that terminal: a settings file with hooks, an MCP config, a plug-in folder. The hooks call `collie hook <name>`, which reports to the [daemon](/docs/internals/daemon-and-socket) and, for some events, prints text back into the agent's context.

This is how `ask` knows a turn ended, how the work log fills up without the agent typing commands, how memory reaches the prompt, and how plug-ins see the files an agent wrote. Nothing is written to `~/.claude`, `~/.cursor` or your repository.

## Claude terminals

A Claude terminal is started through `$SHELL -lc` with:

```sh
claude [--model '<m>'] --settings '<root>/hooks/<id>.claude.json' \
  --mcp-config '<root>/hooks/<id>.mcp.json' \
  [--plugin-dir '<dir>']…
```

| Flag | Points to | What is in it |
|---|---|---|
| `--settings` | `hooks/<id>.claude.json` | The hooks below, a `statusLine`, and, under the Collie sandbox, Claude's own sandbox off and the terminal's files folder as an extra directory. |
| `--mcp-config` | `hooks/<id>.mcp.json` | One stdio server, `collie mcp`. No token in the file: the server inherits `COLLIE_TOKEN` from the agent's environment. |
| `--plugin-dir` | `sandbox/<id>/plugin/…` | The `/collie:loop` command and the terminal's procedures as skills. Only passed when `claude --help` lists the flag. |

Folders are 0700 and files 0600. `--model` is added only when you picked a model and the command does not already have one. A custom command whose program is `claude` gets the same wiring. Your own MCP servers stay: `--mcp-config` adds `collie` to them.

```callout
kind: warning
title: A server of yours named collie
body: "Without `--strict-mcp-config`, Claude Code adds the servers from `--mcp-config` to yours. If your own config already has a server called `collie`, which one wins was not verified. Rename yours."
```

### The hooks

| Event | Command | Timeout (s) | What it does |
|---|---|---|---|
| `SessionStart` | `collie hook claude-session-start` | 5 | Prints the orientation and the memory index. |
| `UserPromptSubmit` | `collie hook claude-prompt` | 5 | Prints memories and messages relevant to this prompt. |
| `PostToolUse` | `collie hook claude-tool` | 8 | Feeds the work log; sends written files to plug-ins. |
| `Stop` | `collie hook claude-stop` | 12 | Ends the turn for `ask`; may block with a plug-in's reason. |
| `SubagentStop` | `collie hook claude-subagent-stop` | 5 | Closes the subagent's job in the work log. |
| `PreCompact` | `collie hook claude-precompact` | 5 | Captures the conversation so far for the curator. |
| `SessionEnd` | `collie hook claude-session-end` | 5 | Same capture; queues memory proposals. |
| `Notification` | `collie hook claude-notification` | 5 | A permission dialog becomes a pending approval in the app. |

None has a matcher, so `PostToolUse` fires on every tool call; the work-log parser ignores the tools it does not know. The `statusLine` runs `collie hook claude-statusline`, which records the plan's rate limits and then runs your own `statusLine` from `~/.claude/settings.json` with the same input.

## What a hook may do

A hook never fails and never delays the agent beyond its timeout. Errors go to `~/Library/Logs/Collie/hooks.log`, one stamped line each, and the agent sees nothing. A hook needs `COLLIE_SOCKET`, `COLLIE_TERMINAL_ID` and `COLLIE_TOKEN`; without them it logs and does nothing. Payloads over 64 KiB are dropped with a log line.

Only three hooks print anything:

- **SessionStart and UserPromptSubmit** print `additionalContext`: the text the agent reads.
- **Stop** may print a `block` decision (from a plug-in, or the request to record what it learned) or a `systemMessage` (the large-context notice).

The rest only report to the daemon.

## What reaches the context

```tabs
tabs:
  - label: Session start
    body: "The **orientation** first, at most 1500 characters: the terminal and paddock names, leashed peers, the panels it reaches, the sandbox line, and for a Shepherd how to delegate, open panels and run a loop. Then pinned memories and the memory index, in 4096 bytes not counting the orientation."
  - label: Each prompt
    body: "One 2048-byte budget, in order: retracted memories, rules pushed to this terminal, lot board posts addressed to it, your comments on its pages, memories relevant to the prompt, hits from ingested docs."
  - label: After compaction
    body: "On a `compact` or `resume` start, the active work (open tasks, last notes) and the board's latest handoff and status posts come before the memory index, in the same 4096 bytes."
```

Everything injected is scrubbed of known secrets first. How memories are chosen is in [Memory](/docs/features/memory); what the curator does with the captured conversation is in [Memory curator](/docs/internals/curator).

## How a turn ends

`collie ask` waits for the other agent's turn to end. There are two ways to know.

- **By hook.** Claude's `Stop` hook sends `turn.completed`, which closes the waiting ask with the agent's last message. The first time a terminal sends one, Collie marks it as hook-capable, and from then on it waits only for the hook.
- **By silence.** Terminals without a turn hook end a turn after 2 s with no output. That is the shell, and Cursor, with extra rules below.

Codex has a hook for this: it is started with `-c 'notify=["<collie>","hook","codex-notify"]'`, and `agent-turn-complete` becomes `turn.completed`.

## Cursor terminals

The preset runs:

```sh
exec cursor-agent [--sandbox disabled --trust] --plugin-dir '<root>/hooks/<id>.cursor/collie' [--model '<m>']
```

`--sandbox disabled --trust` is added only under the Collie sandbox, so Cursor does not stop at "Workspace Trust Required"; in a free terminal the dialog stays, and trusting the repository is your call. Without `cursor-agent` on `PATH`, creating the terminal fails at once.

The plug-in folder holds:

| File | Purpose |
|---|---|
| `hooks/hooks.json` | `sessionStart` → `collie hook cursor-session-start`; `preToolUse` and `postToolUse` → `collie hook cursor-tool`. |
| `.mcp.json` | The `collie` server, with environment variables by name only (`${env:COLLIE_TOKEN}`), never their values. |
| `commands/collie:loop.md` | The `/collie:loop` command. |
| `rules/collie-delegate.mdc` | Shepherds only: an always-applied rule to hand work to the summoned terminal and wait. |

Cursor gets the orientation at session start, capped with the memory at 9000 bytes. It has no turn hook, so a turn ends by silence, except while the footer `ctrl+c to stop` is on screen or a tool is running (from `preToolUse` to `postToolUse`, at most 10 min). The answer is read from the screen; a cut answer says to run `collie check <name> --screen`. Cursor's MCP client drops calls at about 60 s, so over MCP a blocking `ask` becomes `--no-wait` and `wait` is capped at 50 s.

## Codex terminals

Codex has no session-start or prompt hook: no orientation, no memory injection. Read lot posts with `collie lot board` and comments with `collie comment list`. The `collie` MCP server is off for Codex; with `COLLIE_CODEX_MCP=1` in the daemon's environment it is passed with `-c mcp_servers.collie.*`. That key was not verified against an installed `codex`.

## Plug-in hooks

An installed plug-in can declare the `edit` and `stop` events. After a write tool (`Write`, `Edit`, `MultiEdit`, `NotebookEdit`), `claude-tool` sends the files to the plug-ins; at `Stop`, they get the files of the whole turn. Each plug-in's helper runs once per event, in parallel, in its own sandbox (reads the project, writes only its data folder, no network), with 3 s for all of them.

```compare
before:
  title: guide
  items:
    - "Text returned to the agent as context"
    - "At most 2000 characters per plug-in, 4000 in all"
    - "Dropped at `stop`"
after:
  title: block
  items:
    - "On edit, Claude gets a `block` decision with the reason"
    - "On stop, the turn does not end: the agent reads the reason"
    - "Any block wins over guides"
```

A helper that fails, times out or answers invalid JSON is skipped. Cursor gets `edit` through `postToolUse`, where a block arrives as context, and `stop` once per turn after it goes quiet. The API is in [Plug-ins](/docs/features/plugins).

## Environment of an agent terminal

| Variable | Value |
|---|---|
| `COLLIE_SOCKET` | `<root>/run/collied.sock` |
| `COLLIE_TERMINAL_ID`, `COLLIE_TERMINAL_NAME` | This terminal |
| `COLLIE_TOKEN` | This terminal's token |
| `COLLIE_WORKSPACE_ID` | The workspace |
| `COLLIE_SHEPHERD` | `1` for a Shepherd (only changes the MCP tool list; the daemon checks the role itself) |
| `COLLIE_PADDOCK_NAME`, `COLLIE_PADDOCK_PATH`, `COLLIE_BRANCH_NAME` | When the terminal is in a paddock |
| `TERM_PROGRAM` | `Collie` |

The base is your interactive shell's environment: the daemon runs `$SHELL -ilc` (5 s timeout, cached 10 min, redone when an rc file changes) so `nvm`'s `node` and your `PATH` work. `COLLIE_ENV_CAPTURE=1` is set during that capture, so your `.zshrc` can skip slow parts. Collie's keys win, and `collie` comes first on `PATH`. The Shell preset does not use the capture.

## Related

- [Daemon and socket](/docs/internals/daemon-and-socket): where the hooks report to.
- [Work log](/docs/features/work-log): what the tool and subagent hooks record.
- [CLI reference](/docs/reference/cli): `collie hook` and the commands agents call.

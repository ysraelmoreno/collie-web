---
title: "How it connects"
description: "The app, the collied service, the collie CLI in each terminal, hooks and leashes: the path of one request."
---

Collie is three programs that talk over one Unix socket. The **service** (`collied`) owns the state and the terminals. The **app** draws the canvas and is the only admin. The **CLI** (`collie`), on every terminal's `PATH`, is how agents ask the service for anything. Leashes, paddocks, memory and panels are all rules the service applies to those requests.

This page follows one request from an agent to the service and back, and shows where each feature hooks in. The deep versions are in [Daemon and socket](/docs/internals/daemon-and-socket) and [Agent hooks](/docs/internals/agent-hooks).

## The three parts

```text
 Collie.app (canvas, panels, cards)          admin: the only one
        │
        ▼
 collied  ── LaunchAgent dev.collie.daemon
   │  ~/Library/Application Support/Collie   workspaces, memory, artifacts, work…
   │  run/collied.sock                       the socket every request goes through
   │
   ├── terminal "lead"   (Claude, Shepherd)  COLLIE_TOKEN, collie on PATH, MCP collie
   ├── terminal "api"    (Claude)            sandbox profile of its own
   └── terminal "notes"  (Shell)
```

- **`collied`** runs under launchd, so it lives on when you close the app. It starts the terminals' processes, keeps their output, holds the workspace (terminals, leashes, paddocks, panels), and runs git, the memory curator and the loop.
- **The app** connects to the same socket to show and change all of that. Settings, sandbox grants, plug-in installs and `pr` lands are admin, and the service accepts admin only from the signed app itself.
- **`collie`** is a thin client: it turns `collie ask api "…"` into a request with the terminal's identity and sends it. Over MCP, the `collie` server of a Claude terminal sends the same requests.

## One request, end to end

Here is what happens when the Shepherd `lead` runs `collie ask api "Add tax to the cart total"`:

```steps
items:
  - title: The CLI builds the request
    result: Command `ask`, the arguments, the current folder, and the terminal's `COLLIE_TERMINAL_ID` and `COLLIE_TOKEN` from its environment.
  - title: It goes over the socket
    result: "`<data>/run/collied.sock` (or `COLLIE_SOCKET`). No service: the CLI exits with code 3."
  - title: The service checks who is asking
    result: The token must match that terminal's record. A bad one is refused as invalid credentials.
  - title: It resolves the target within the leashes
    result: "`api` must be leashed to `lead` directly. Otherwise: not found, or no connection."
  - title: It delivers the prompt
    result: The text is typed into `api`'s terminal, as if you had typed it.
  - title: It waits for the end of the turn
    result: Claude's Stop hook, Codex's notify, a `collie reply`, or idleness for the others.
  - title: The reply goes back
    result: The CLI prints it in `lead`'s terminal; `--no-wait` returns an id instead and types the reply in later.
```

Every command follows the same shape. What changes is the rule the service applies at step 4: Shepherd-only commands check the mark, paddock commands check who created the paddock, panel commands check that the panel is reachable.

A command the running service does not know yet (an app updated but a service not restarted) answers "restart the service to use this".

## Where hooks come in

Agents do not only call Collie; Collie also listens to them. A Claude terminal is launched with Collie's hooks in its `--settings`, each one a `collie hook …` command that talks to the same socket:

| Claude event | What Collie does with it |
|---|---|
| SessionStart | prints the orientation and the memory index into the session |
| UserPromptSubmit | adds lot-board messages, page comments and relevant memories to the prompt |
| PostToolUse, SubagentStop | records tasks, jobs and commits in the [work log](/docs/features/work-log); runs plug-in `edit` hooks |
| PreCompact, SessionEnd | keeps the work log, triggers memory capture |
| Stop | ends the turn (`turn.completed`), answers the pending `ask`, runs plug-in `stop` hooks |

Hooks never fail the agent: errors go to `~/Library/Logs/Collie/hooks.log`. Cursor gets a smaller set through a plug-in of its own; Codex has only its end-of-turn notify, and shell terminals have none. That is why memory injection and orientation are Claude-first.

## Where each concept lives

| Concept | What it is to the service |
|---|---|
| Terminal | a record (name, preset, folder, paddock, lot, sandbox) plus a process and a token |
| Leash | an edge between two records; the only source of reach |
| Shepherd | a flag on a terminal record, set by you in the app (or by `--shepherd`) |
| Paddock | a record plus a git worktree and branch (or just a folder) |
| Sandbox | a Seatbelt profile generated per terminal at launch |
| Panel | a record the app hosts; reached by leash on the canvas, by anyone in a dock |
| Memory | files in `.collie/memory` per repository, plus a global and per-lot store |
| Work | a per-terminal record of tasks, jobs, notes and commits |

## What survives what

- **Closing the app:** nothing stops. Terminals and loops keep running in the service; the canvas reconnects when you open it again.
- **Restarting the service** (after an update, or **Reiniciar serviço**): the open terminals close. The workspace, paddocks, memory and work are on disk and come back.
- **Updating the app:** the old service keeps running until you restart it. Hooks and the MCP server already come from the new version.

## Related

- [Shepherd and terminals](/docs/concepts/shepherd-and-terminals): the rules applied at step 4.
- [Paddocks and worktrees](/docs/concepts/paddocks-and-worktrees)
- [Sandbox](/docs/features/sandbox): what the per-terminal profile closes.
- [CLI reference](/docs/reference/cli): every command.

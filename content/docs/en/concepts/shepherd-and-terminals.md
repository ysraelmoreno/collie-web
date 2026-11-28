---
title: "Shepherd and terminals"
description: "Terminals, presets, the Shepherd mark and leashes: who can reach whom, and how agents talk."
---

Everything an agent does in Collie happens in a **terminal**: a node on the canvas with a process, a name, a folder and a sandbox. Some terminals are marked **Shepherd** ("Pastor"), which lets them create other terminals and wire them together. The only thing that decides who can talk to whom is the **leash** ("guia"), a line between two nodes.

Read this page when you want to know why a command was refused, or how to shape a team of agents. For a first run, see [your first agent](/docs/getting-started/first-agent).

## Terminals and presets

A terminal runs one preset:

| Preset | Runs | Notes |
|---|---|---|
| Claude | `claude` | MCP `collie`, orientation, hooks and memory injection |
| Codex | `codex` | No session-start hook: no orientation, no injection |
| Cursor | `cursor-agent` | Your Cursor plan and login; Collie never sees the credential |
| Shell | `zsh` | Your own shell, reads its own rc files |
| Próprio ("custom") | your command | Any command line you give it |

Each terminal has a token of its own (`COLLIE_TOKEN`). Every `collie` command it runs carries that token, and the service checks it against the terminal record: an agent can act only as itself.

A terminal also belongs to at most one paddock (or the Pasture) and at most one lot. Neither gives reach: a [lot](/docs/features/memory) groups terminals for memory and a board, a [paddock](/docs/concepts/paddocks-and-worktrees) gives a folder and a branch.

## Leashes are the permission

A terminal reaches exactly the terminals that are leashed to it, directly. There is no transitivity: if A is leashed to B and B to C, A does not reach C. Only sandboxed terminals take part. A **free terminal** ("Terminal livre", no sandbox) is never reached by any leash and reaches nobody.

The same rule covers panels. A canvas panel (Browser, Device, Design…) is reachable by the terminals leashed to it; a panel in a dock is reachable by every terminal. Tools for panels a terminal cannot reach are hidden from its MCP list.

Leashes come from three places:

- You drag from the ring in a node's title bar to another node.
- `collie summon` leashes the new terminal to the Shepherd that summoned it (and to the `--connect` targets).
- A Shepherd runs `collie leash a b` for two terminals both leashed to it, or `collie unleash a b` to cut one.

## What any terminal can do

Within its leashes, every sandboxed terminal can:

```sh
collie list                      # agents leashed to you
collie ask <name> "<prompt>"     # send a prompt and wait for the reply (--no-wait: an id at once)
collie ask result [<id>]         # a --no-wait reply, or your recent asks
collie wait <name>               # until that agent ends its turn
collie check <name>              # its recent output (--lines, --screen)
collie reply "<text>"            # answer the ask you were sent (up to 8 KiB)
```

It also opens its own browsers for testing (up to 8, headless unless `--visible`) and Previews, reads and writes memory, keeps its [work log](/docs/features/work-log) and asks you for sandbox access with `collie access request`. A blocked access becomes a card in the app: ask, don't work around it.

The reply of an `ask` is the target's last message when its turn ends: a Claude hook, a `collie reply`, or idleness for agents with no end-of-turn hook (shell, Cursor). `collie reply` with no ask waiting says to use `collie notify` instead.

## What only a Shepherd can do

The **Pastor** checkbox in the terminal sheet marks a Shepherd: "Pode chamar agentes, abrir painéis e criar cercados. Só alcança quem estiver ligado a ele por guia." ("It can call agents, open panels and create paddocks. It only reaches what is leashed to it.")

| Command | Does |
|---|---|
| `summon <name>` | creates a terminal leashed to you (`--preset`, `--model`, `--paddock`, `--cwd`, `--connect`) |
| `dismiss <name>` | kills a terminal leashed to you |
| `leash` / `unleash` / `leash request` | wires terminals you reach; asks you for one it doesn't |
| `notify "<text>"` | a notification to you (up to 2000 characters) |
| `paddock create / land / delete` | paddocks (land and delete: only the one it created) |
| `panel open / close / move` | any panel type, on the canvas or a dock |
| `lot create`, `herd apply`, `work run` | lots, herds and loops (a loop still needs your approval card) |

From a terminal that is not a Shepherd these are refused ("'summon' is Shepherd-only"); for `summon` the message adds a hint to ask whoever summoned it, or you, for the mark.

`summon` with no `--preset` gives the new terminal the Shepherd's own preset, which is what "open a terminal" means. It refuses a free terminal as the summoner. `--model` switches a Claude (or Cursor) agent's model at launch; `collie model <name> <model>` switches a running Claude agent's.

## Sub-Shepherds

A Shepherd can summon another Shepherd with `collie summon <name> --shepherd`, to split work in a tree: a strong model divides, a sub-Shepherd coordinates its part with cheaper workers.

- **Reach** stays leash-only. The sub-Shepherd reaches what it summons and the Shepherd above it; the top Shepherd does not reach the grandchildren.
- **Depth:** at most 2 below a Shepherd you marked in the app. A third `--shepherd` is refused with the depth in the message.
- **Ceiling:** a sub-Shepherd keeps at most 6 terminals it summoned; the seventh is refused.
- **Paddock:** it stays in its summoner's paddock. `--paddock` and `paddock create` are refused.
- **Dismissal** cascades: everything it summoned goes first, then it. Only the Shepherd that summoned it may dismiss it; a Shepherd you marked is never dismissed by an agent.

A sub-Shepherd answers upward with `collie reply` or `collie lot post`, never with a blocking `ask`.

## Asks with a gate

An `ask` can be judged by a command instead of by the target's own word:

```sh
collie ask api "Make the cart total include tax" --check "npm test -- cart" --tries 3
```

When `api` ends its turn, the service runs the check in `api`'s folder, under `api`'s sandbox and without any `COLLIE_*` variable. If it passes, the ask returns the reply with `check: {status: "passed"}`. If it fails, `api` gets the last 40 lines of output and another turn, up to `--tries` (default 3, at most 10). An attempt that changes a file the check names is failed without running the check, so the agent cannot approve itself. The check and an optional `--spec` stay in the service, never in the repository.

This is the single-task version of the [loop](/docs/features/loop), which runs a whole list of tasks this way with a fresh agent per attempt.

## The app is the admin

Nothing an agent runs is "admin". Settings, sandbox grants, the sandbox mode, plug-in installs and `pr` lands are the app's (yours). The service accepts admin requests only from the signed Collie app and refuses the admin token from inside any Collie terminal. [Daemon and socket](/docs/internals/daemon-and-socket) has the details and the limits of that check.

## Related

- [How it connects](/docs/concepts/how-it-connects): the path of one `collie ask`.
- [Best practices](/docs/guides/best-practices): team shapes that work.
- [Fields](/docs/features/fields): parallel agents in one paddock, each in its own worktree.
- The [Shepherd post](/features/shepherd).

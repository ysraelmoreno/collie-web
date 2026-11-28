---
title: "Your first agent"
description: "A Shepherd terminal that summons other agents, hands them work and reads their replies."
---

An agent in Collie is a terminal on the canvas running an agent CLI: Claude Code, Codex, Cursor or a command of your own. Any terminal can work alone. The useful setup is one **Shepherd** ("Pastor"): a terminal you mark as such, that calls other agents, gives them a task and gets the answer back. You talk to one; it coordinates the rest.

This page creates a Shepherd, has it summon a worker and ask it something, and shows how to read and end what it started. The [Shepherd and terminals](/docs/concepts/shepherd-and-terminals) page explains the rules behind each step.

## Create the Shepherd

```steps
items:
  - title: Open the new terminal sheet
    result: Right-click on the canvas, or ⌘K → **Novo terminal** ("New terminal").
  - title: Pick the agent
    result: One card per preset — **Claude**, **Codex**, **Cursor**, **Shell** (`zsh`) or **Próprio** ("custom", your own command).
  - title: Name it and pick its folder
    result: The **Pasta** ("Folder") is your project. In a paddock, the folder is the paddock's worktree.
  - title: Check Pastor
    result: "\"Pode chamar agentes, abrir painéis e criar cercados\": it can call agents, open panels and create paddocks, and reaches only what is leashed to it."
  - title: Create it
    result: "**Criar terminal** (\"Create terminal\"). The node shows the **Pastor** tag."
```

Leave **Terminal livre (sem sandbox)** ("free terminal, no sandbox") off. A free terminal sees and changes everything you can, and no leash reaches it: it cannot summon, and nobody can ask it anything. It is only for your own work.

Claude Code may ask whether to trust the folder the first time. The node then shows that it needs attention: answer in the terminal.

## What the Shepherd knows

A Claude terminal starts with two things from Collie:

- An MCP server named `collie`, so the agent calls Collie's tools directly. It inherits the terminal's own token; the tools for panels it cannot reach stay hidden.
- A short orientation at session start (and again after a compaction): that it runs inside Collie, its terminal and paddock names, its peers and the panels it reaches. A Shepherd also learns `collie summon`, `collie panel open|close|move` and `collie leash`.

Codex has no session-start hook, so it gets no orientation. Tell it about `collie` in your first prompt. The details are in [Agent hooks](/docs/internals/agent-hooks).

## Delegate a task

Ask the Shepherd in plain words. For example, in the Shepherd's terminal:

> Open a terminal called `reader`, have it read the README and tell me in three lines what this project does.

The Shepherd turns that into commands like these:

```sh
collie summon reader
collie ask reader "Read README.md and summarise the project in three lines."
```

`summon` creates the terminal, already leashed to the Shepherd, in the Shepherd's paddock and folder, with the Shepherd's own preset unless it passes `--preset`. You see a new node on the canvas with a leash line to the Shepherd. A first prompt can go along: `collie summon reader "Read README.md"` sends it without waiting for a reply.

`ask` types the prompt into `reader` and waits until its turn ends, then returns the reply. The default timeout is 30 minutes (`--timeout` in seconds).

## Don't wait in a loop

For longer tasks, the Shepherd should not sit inside a command. Use `--no-wait`:

```sh
collie ask reader "Write the missing tests for src/cart.ts" --no-wait
# → returns an ask id at once; the reply is typed into the Shepherd's terminal when it is idle
collie ask result <id>   # the reply, or the list of your recent asks without an id
collie wait reader       # block until reader ends its turn; at once if it is idle
```

A Cursor Shepherd takes a message only when its turn ends: if it sleeps or polls inside a command, the reply never reaches it. It should end its turn, or block on `collie wait <name>`.

## See what is going on

```sh
collie list                 # agents leashed to you: name, preset, running|stopped, shepherd
collie list --all           # also your paddock's terminals not leashed to you
collie check reader         # the last 200 lines of reader's output (--lines N)
collie check reader --screen  # the screen as drawn now
```

In the **Trilho** ("Rail") layout, the side panel shows the agent tree: the Shepherd and the terminals leashed to it, with a badge for pending cards.

## End it

```sh
collie dismiss reader
```

`dismiss` kills a terminal leashed to the Shepherd. Asks the dismissed terminal still owed fail with "Terminal 'reader' was dismissed before answering this ask: ask its replacement", and `dismiss` returns their ids in `failedAsks`. In the app, **Encerrar ramo…** ("End branch") on a node removes it together with everything it summoned.

## Leash by hand

Leashes are the only permission between terminals: a terminal reaches exactly the terminals and panels it is leashed to. To leash two nodes yourself, drag from the small ring in a node's title bar to the other node. A Shepherd can leash two terminals that are both leashed to it with `collie leash a b`, and ask you for one it does not reach with `collie leash request <name> --reason "…"`, which shows a bar over the Shepherd's node with **Conectar** ("Connect") and **Recusar** ("Decline").

## Next

- [Shepherd and terminals](/docs/concepts/shepherd-and-terminals): reach, sub-Shepherds, `ask --check`.
- [Best practices](/docs/guides/best-practices): how to split work between agents.
- The [Shepherd feature post](/features/shepherd), for the short version.

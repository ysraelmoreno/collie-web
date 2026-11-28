---
title: "CLI"
description: "Every collie command at v0.3.1, by group, with who may run it."
---

`collie` is the command line that agents and you use to talk to the [daemon](/docs/internals/daemon-and-socket). Inside a Collie terminal it is first on `PATH` and already carries the terminal's token. Most commands are also MCP tools for Claude terminals, named with `_` instead of spaces (`collie work status` is `work_status`).

This page lists the commands of v0.3.1. The CLI's own help is the source of every flag: `collie --help`, `collie <group> --help`, `collie <command> --help`.

## Conventions

```sh
collie [--json] <command> [args]
collie mcp
```

- **Groups chain.** `collie work task add`, `collie design system list`, `collie lot board`.
- **`--json`** prints the raw result. Without it, a few commands print text (`list`, `check`, `paddock list`, `model`); the rest print JSON anyway.
- **`--`** ends the flags: everything after it is literal.
- **Who.** Each table says who may run the command. *Any* is any terminal (within its leashes) or the app. *Shepherd* is a terminal marked as Shepherd; others get `'<cmd>' is Shepherd-only`. *App* is yours: the app (some also accept your own CLI in a terminal outside Collie), never an agent.

| Exit code | Meaning |
|---|---|
| `0` | Done (also for help). |
| `1` | The daemon or the command refused. Also: `factory doctor` below `--min`, a refused `work plan lint`, a `factory ratchet check` that changed. |
| `2` | Usage error: unknown command or flag, missing argument. The usage line goes to stderr. |
| `3` | The daemon is not running ("daemon não está rodando (collied)"). |

Errors go to stderr prefixed with `collie: `. A command the daemon does not know yet says `<command>: reinicie o serviço para usar isto`: restart the service.

## Agents and terminals

| Command | What it does | Who |
|---|---|---|
| `collie list [--all]` | Agents leashed to you; `--all` adds your paddock's other terminals and how to reach them. | Any |
| `collie ask <target> <prompt>… [--no-wait] [--timeout <s>] [--raw]` | Sends a prompt and waits for the reply (default 1800 s). `--no-wait` returns an ask id; the reply is typed into your terminal when you are idle. | Any |
| `collie ask … --check <cmd> [--spec <file>] [--tries <n>] [--check-timeout <s>] [--green-ok]` | The daemon runs the check when the target ends its turn; the ask ends only when it passes. Tries default 3 (up to 10), check timeout 600 s. `--green-ok` allows a check that already passes. | Any |
| `collie ask result [<id>]` | The reply of a `--no-wait` ask; without an id, your recent asks. | Any |
| `collie wait <target> [--timeout <s>]` | Waits for the agent's turn to end; at once if it is idle. | Any |
| `collie reply <message>…` | Answers the ask you were sent (up to 8 KiB). | Any |
| `collie check <target> [--lines <n>] [--screen]` | Recent output (default 200 lines); `--screen` is the screen as drawn now. | Any |
| `collie model <target> <model> [--wait] [--timeout <s>]` | Switches a Claude agent's model (`opus`, `sonnet`, `haiku` or an id). | Any, on a leashed target |
| `collie open [<url-or-app>] [--app <app>]` | Opens an http(s) or mailto URL, or an app: the sandbox's `open`. CLI only. | Any |
| `collie events [--since <n>] [--panel <panel>]` | Recent plug-in events from the panels you reach. | Any |
| `collie summon <name> [--preset …] [--model …] [--cwd …] [--paddock …] [--shepherd] [--field \| --no-field] [--connect <a,b>] [<prompt>…]` | Starts an agent leashed to you. Without `--preset` it gets yours. | Shepherd |
| `collie dismiss <target>` | Ends an agent leashed to you (a sub-Shepherd with everything it summoned). | Shepherd |
| `collie leash <a> <b>` / `collie unleash <a> <b>` | Leashes or unleashes two agents both leashed to you. | Shepherd |
| `collie leash request <target> [--reason …]` | Asks you for a leash: a card in the app. | Shepherd |
| `collie notify <message>…` | A notification to the user (up to 2000 characters). | Shepherd |

`summon --shepherd` makes a sub-Shepherd (up to 6 terminals of its own, depth 2). See [Shepherd and terminals](/docs/concepts/shepherd-and-terminals).

## Fields

CLI only. Fields are a preview since 0.3.0; see [Fields](/docs/features/fields).

| Command | What it does | Who |
|---|---|---|
| `collie field list` | Your paddock's fields: agent, branch, base, commits, state. | Shepherd |
| `collie field land <name>` | Merges a field onto the paddock's branch and runs the gate again; waits up to 10 min for the paddock to be free. | Shepherd that summoned it |
| `collie field drop <name> [--keep-branch]` | Removes the worktree; without `--keep-branch`, keeps the code as a patch and deletes the branch. | Shepherd that summoned it |

## Paddocks

| Command | What it does | Who |
|---|---|---|
| `collie paddock list` | Every paddock: name, path, branch. | Any |
| `collie paddock status <name> [working\|blocked\|review\|idle\|done]` | Reads or sets the paddock's status. | Any |
| `collie paddock create <name> [--folder <path>]` | A new paddock (a worktree, or a plain folder). | Shepherd |
| `collie paddock land <name> [--mode merge\|squash\|rebase\|pr] [--message …]` | Lands it on its base branch. `pr` is yours only. | Shepherd that created it |
| `collie paddock delete <name> [--force]` | Deletes it. | Shepherd that created it |
| `collie paddock factory <name> on\|off` | The factory mark. Needs a committed `collie-work.json` with `static` and `judge` at 1 or more. | App |

`paddock create --factory` and `--repo` are yours only. See [Paddocks and worktrees](/docs/concepts/paddocks-and-worktrees).

## Panels

| Command | What it does | Who |
|---|---|---|
| `collie panel open <plugin> [--name …] [--placement dock.left\|dock.right\|dock.bottom\|canvas\|headless] [--visible] [--url …] [--storage isolated\|workspace\|global] [--serial …] [--file …] [--artifact …] [--paddock …] [--connect …]` | Opens a panel. A terminal that is not a Shepherd opens only browser panels (up to 8, headless unless `--visible`) and previews (up to 8). | Any (see left) |
| `collie panel close <name>` | Closes it. | Any, own panels |
| `collie panel move <name> <placement> [--paddock …]` | Moves it. | Any, own panels |
| `collie panel list` | Panels you reach. | Any |

## Work log

A terminal works on its own work; a Shepherd also on the works of terminals leashed to it (`--terminal <name>`). See [Work log](/docs/features/work-log).

| Command | What it does | Who |
|---|---|---|
| `collie work start <title>… [--branch …]` | Opens a work. | Any |
| `collie work done [--reason …]` / `collie work reopen [--id …]` | Closes or reopens. | Any |
| `collie work task add <title>… [--spec <file>] [--check <cmd> \| --area <a,b>] [--accept <cmd>] [--accept-timeout <s>] [--evidence <glob>] [--scope <glob,…>] [--needs <id,…>] [--agent claude\|cursor\|codex] [--model …] [--green-ok]` | Adds a task. For the loop: a spec and a check. | Any |
| `collie work task done\|reopen <task>…` | Marks done; requeues a deferred or dropped task (`--keep-tries`). | Any |
| `collie work task defer\|drop <task> <reason>…` | Defers or drops, with the reason. | Any |
| `collie work note <text>… [--decision]` | A note, or a decision. | Any |
| `collie work status [--all] [--events [<n>]]` | The active work; `--events` adds the loop's journal (20 by default, up to 100). | Any |
| `collie work wait [--since <v>] [--timeout <s>]` | Waits for a change in the work (default 600 s, up to 3600). | Any |
| `collie work list [--closed]` / `collie work get <id>` | Lists or reads works. | Any |
| `collie work summary [--id …] [--natural]` | What a work did, from the log. `--natural` asks the on-device model to rewrite it. | Any |
| `collie work usage [--limit <n>]` / `collie work history [--limit <n>] [--id …]` | Token index per work; closed works of your paddock. | Any |
| `collie work handoff` | The last loop's handoff. | Any |
| `collie work config` | What `collie-work.json` resolves to. Runs nothing. CLI only. | Any |
| `collie work prd show [--id …]` / `collie work plan lint <dir>` | The kept PRD; checks a plan package (exit 1 if refused). | Any |
| `collie work rerail` | Types the work's live state back into an agent. | Shepherd, app |

### The loop

| Command | What it does | Who |
|---|---|---|
| `collie work run --max <n> [--tries <n>] [--timeout <s>] [--budget <s>] [--gate <cmd>] [--precheck <cmd>] [--parallel <n>] [--notify task\|end] [--preset … \| --model … \| --command … \| --escalate agent:model,…]` | Runs the open tasks unattended, after your card in the app. | Shepherd |
| `collie work run … [--review \| --no-review] [--personas …] [--reviewer-model …] [--auto-land] [--auto-land-max <n>] [--queue]` | Review by personas, auto-land, queue. Preview. | Shepherd |
| `collie work stop [--now]` | Stops after the current attempt's verdict; `--now` at once. | Shepherd |

Ceilings: `--max` up to 30, `--tries` 10, `--timeout` 14 400 s, `--budget` 43 200 s, `--parallel` 4, `--auto-land-max` 5. Defaults from `collie-work.json`: see [collie-work.json](/docs/reference/collie-work-json). The flow is in [Loop](/docs/features/loop).

### Yours only

`collie work prd add <file> [--origin …] [--replace]` and `collie work plan apply <dir> --approve <sha256>` (CLI, never MCP). `work clear-history`, `work chat …` and `work approvals` / `work approve` are the app's.

## Factory

CLI only, preview since 0.2.0. See [Factory](/docs/features/factory).

| Command | What it does | Who |
|---|---|---|
| `collie factory doctor [--min 0-3]` | Scores the profile's layers (static, judge, verification, review, prose, guardrails) from 0 to 3; exit 1 below `--min` (default 1). | Any |
| `collie factory bait list` / `collie factory bait report` | The catalog of known-bad changes and the capture rate per layer and persona. | Any |
| `collie factory ratchet check\|update <name>` | A measure whose baseline only goes down. `check` exits 1 when it changed. | Any |
| `collie factory ratchet raise <name> --reason <text>` | Raises the baseline, with a written reason (1 to 200 characters). | Any |

## Memory and lots

See [Memory](/docs/features/memory).

| Command | What it does | Who |
|---|---|---|
| `collie memory search <query>… [--limit <n>] [--lot …] [--all] [--inactive]` | Searches your lot, project and global (up to 50). | Any |
| `collie memory save --kind decision\|map\|pitfall --subject … --title … [<body>…] [--path …] [--scope lot\|project\|paddock\|global]` | Saves a memory. | Any |
| `collie memory get <id>` / `collie memory list [--kind …] [--status …]` | Reads one; lists. | Any |
| `collie memory flag <id> --useful\|--wrong\|--outdated [<reason>…]` | Judges an injected memory. `--wrong` and `--outdated` send it to the [curator](/docs/internals/curator). | Any |
| `collie memory supersede <id> --by <id>` / `collie memory promote <id>` | Retires a stale memory for a newer one; moves a lot memory to the project. | Any |
| `collie memory doc-search <query>…` | Searches ingested docs. | Any |
| `collie memory context` / `collie memory checklist` / `collie memory task <task>…` | Session summary; pitfall checklist; rules and memories for a task. | Any |
| `collie memory enforce <id> [--by <file>] [--clear]` | Marks a memory as enforced by a check. | Any |
| `collie memory stats [--since 7d\|24h\|2w\|<date>] [--project …] [--lot …] [--terminal …]` | Usage, maintenance, curator cost. | Any |
| `collie memory trust <id>` | Trusts a memory edited outside Collie. CLI only. | Any |

The app has the rest: `memory review`, `pin`, `unpin`, `restore`, `doc-add`, `capture`, `curator`, `digest`, `consolidate`, `cleanup`, `purge`.

| Command | What it does | Who |
|---|---|---|
| `collie lot create <name> [--goal …] [--members …]` / `collie lot join --lot …` | Creates or joins a lot. | Shepherd |
| `collie lot leave` / `collie lot list` / `collie lot get [--lot …]` | Leaves; lists; reads. | Any |
| `collie lot post --kind handoff\|question\|status\|answer <text>… [--to <name>] [--ref …]` | Posts to the lot's board. | Any |
| `collie lot board [--since …] [--kind …] [--limit <n>]` | Reads the board. | Any |

## Herds

| Command | What it does | Who |
|---|---|---|
| `collie herd list` / `collie herd get <id>` | Saved herds. | Shepherd, app |
| `collie herd apply <id> --name <name> [--paddock true\|false]` | Applies a herd: everything it creates is leashed to you. | Shepherd, app |
| `collie herd save <name> --terminals <a,b,c> [--panels …]` | Saves terminals and panels as a herd. | Shepherd, app |

Removing, importing and exporting are the app's. See [Herds](/docs/features/herds).

## Sandbox, files and comments

| Command | What it does | Who |
|---|---|---|
| `collie access request <path> [--read] [--write] [--reason …]` | Asks you for access to a path: a card in the app. Never work around a block. | Any terminal |
| `collie access list` | Your grants. | Any terminal |
| `collie comment list [--artifact …] [--path …] [--open]` / `collie comment reply <id> <text>…` | Your comments on the agent's pages; its reply (up to 4000 characters). | Any |
| `collie font add <family> [--weights 400,700] [--italic]` / `collie font list` | Fonts for pages and designs. | Any |

Granting, denying and revoking access, `comment add` and `font remove` are the app's. See [Sandbox](/docs/features/sandbox).

## Panel plug-ins

Every panel command takes `[--panel <name>]`; without it, the only panel of that kind you reach. `--out` paths are written by `collie` relative to its own folder.

```tabs
tabs:
  - label: browser
    body: "`navigate <url>`, `snapshot`, `click <ref>`, `hover <ref>`, `fill <ref> <text>`, `type <text>`, `key <key>`, `scroll [--ref] [--dy]`, `eval <js>`, `text`, `wait [--text] [--selector] [--timeout]`, `screenshot [--full-page] [--clip x,y,w,h] [--ref] [--out]`, `console [--lines]`, `resize [--width] [--height] [--reset]`, `emulate [--color-scheme] [--reduced-motion]`, `reload [--hard]`, `storage clear|set|get`, `init-script add|list|clear`. See [Browser](/docs/features/browser)."
  - label: device
    body: "`list`, `screenshot [--out]`, `ui [--all]`, `screen [--ocr | --no-ocr] [--region]`, `wait [--text] [--gone] [--stable] [--then]`, `find <text> [--role] [--scroll] [--then]`, `tap [<x> <y>] [--ref] [--text] [--id] [--then]`, `swipe <x1> <y1> <x2> <y2> [--ms]`, `text <text>`, `key <key>`, `logcat [--lines] [--grep]`, `install <path>`, `launch <package>`. See [Devices](/docs/features/devices)."
  - label: network
    body: "`attach [--serial]`, `detach`, `status`, `list [--limit] [--host]`, `get <id>`, `curl <id>`, `clear`, `rule-add`, `rule-list`, `rule-remove|rule-enable|rule-disable <id>`, `rule-clear`. See [Network](/docs/features/network)."
  - label: design
    body: "`files`, `new <name>`, `run <command> [--params]`, `batch`, `inspect [--node] [--depth]`, `screenshot [--node] [--out]`, `export --format html|css|react|figcraft`, `help [<query>]`, `prefer artifact|figcraft|ask`, and `design system list|create|publish|history|use|undo|revert|tokens|bind|style|place|mode` (most need `--reason`). See [Design and artifacts](/docs/features/design-and-artifacts)."
  - label: artifact
    body: "`list`, `get <id>`, `add --path`, `new <kind> [<name>]`, `export <id> --format pptx|pdf`, `move <ids> --folder`, `folders`, `libs`, `import-claude [<urls>]`, `import <id>`. Diagram: `diagram get|set|mermaid|export|screenshot`. Preview: `preview get|screenshot`."
```

## Apps of the paddock

| Command | What it does | Who |
|---|---|---|
| `collie app list` / `collie app attach <id>` | Paddock apps; opens one in a panel. | Any |
| `collie app new <id> [--name …]` / `collie app adopt <id> --url http://127.0.0.1:<port> [--start …] [--cmd name=METHOD:/path,…]` | Starts a new app or adopts a local service ([Paddock apps](/docs/features/apps)). | Any |
| `collie app context <id>` / `collie app snapshot <id>` / `collie app event <seq>` / `collie app logs <id> [--lines <n>]` | What the app shows, its events, its log. | Any |
| `collie app approve <id> --paddock …` | Approves an app. | App |

## Plug-ins

| Command | What it does | Who |
|---|---|---|
| `collie plugin list` / `collie plugin specs` | Installed plug-ins; their commands. | Any |
| `collie plugin install --path <folder>` / `install-catalog <id> --version …` / `catalog [--refresh]` / `uninstall\|enable\|disable <id>` | Install and manage. | App |
| `collie plugin validate <folder>` | Checks a plug-in folder as an install and the curated catalog would. Exit 0 prints `ok` and the `TeamIdentifier`, exit 1 one reason per line. Runs without the daemon. | Any |
| `collie plugin tree-hash <folder>` / `catalog-keygen` / `catalog-sign` / `catalog-verify` | Tools for publishing a catalog. Run without the daemon. | Any |

See [Plug-ins](/docs/features/plugins).

## Infrastructure

| Command | What it does |
|---|---|
| `collie mcp` | The MCP server (stdio) of a Claude terminal. |
| `collie hook <name>` | Hook entry points: `claude-session-start`, `claude-prompt`, `claude-tool`, `claude-stop`, `claude-subagent-stop`, `claude-precompact`, `claude-session-end`, `claude-notification`, `claude-statusline`, `cursor-session-start`, `cursor-tool`, `codex-notify`, `generic-stop`. Always exits 0. See [Agent hooks](/docs/internals/agent-hooks). |

The `admin …`, `android …`, `design engine …` and `app update …` groups are the app's: spawning and restarting terminals, the sandbox mode, data export and import, phone pairing, the Android SDK, the design engine and app updates. An agent gets "the admin token can't be used from inside a Collie terminal".

## Environment

| Variable | Used for |
|---|---|
| `COLLIE_SOCKET` | Socket path. Default `~/Library/Application Support/Collie/run/collied.sock`. |
| `COLLIE_TOKEN`, `COLLIE_TERMINAL_ID` | The terminal's credentials, set in every Collie terminal. |
| `COLLIE_ADMIN_TOKEN_FILE` | Where your own CLI reads the admin token. Default `<root>/admin.token`. |
| `COLLIE_MCP_POLL_MS` | How often `collie mcp` checks for new tools (default 10 000). |

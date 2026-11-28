---
title: "Plug-ins"
description: "Third-party panels and agent commands without rebuilding Collie, plus agent hooks that guide or block a turn."
---

A plug-in adds a panel and agent commands to Collie without rebuilding it. In this phase a plug-in is **web UI only**: a
folder with a `collie-plugin.json` manifest and a `ui/` page that runs in a locked web view, with no network and no
access to the project. A plug-in can also declare **agent hooks**: a small helper that sees the files an agent wrote and
answers with guidance or a block.

Use one when a team needs a panel Collie does not have (notes, a checklist, a project dashboard) or wants a rule enforced
on every agent edit. The overview is at [/features/plugins](/features/plugins).

## Install

Installing is **yours alone**: agents cannot install, enable, disable or remove plug-ins.

- In the app, Preferences → "Plug-ins" → **"Instalar de uma pasta…"**, which shows the commands and what the plug-in may do before you
  confirm.
- Or `collie plugin install --path <folder>`, run outside a Collie terminal. Replacing an installed id needs
  `--replace`.

```steps
items:
  - title: Copy and lock
    result: "The folder goes to `<root>/plugins/<id>/<version>/`, read only (files 0444, folders 0555)."
  - title: Pin
    result: "Its SHA-256 is recorded in `installed.json`."
  - title: Check at every start
    result: "The daemon hashes the folder again; a changed folder does not load and shows \"conteúdo alterado desde a instalação; instale de novo\"."
```

The folder cannot have symbolic or hard links or special files, more than 5,000 entries or more than 64 MiB in total.

## Layout and manifest

```
collie-plugin.json   manifest
ui/index.html        the page (any .html under ui/)
ui/…                 its scripts, styles, images, fonts
LICENSE
```

```json collie-plugin.json
{
  "apiVersion": 1,
  "id": "notas",
  "name": "Notas",
  "version": "0.1.0",
  "placements": ["dock.right", "dock.left", "dock.bottom", "canvas"],
  "defaultPlacement": "dock.right",
  "ui": "ui/index.html",
  "commands": [
    { "name": "add", "summary": "Add a note", "runs": "ui",
      "params": [{ "name": "text", "type": "rest", "required": true, "positional": true, "help": "Note text" }] }
  ],
  "events": ["notas.changed"],
  "stateKeys": []
}
```

- `id` matches `[a-z][a-z0-9-]{1,31}` and cannot be a built-in plug-in id (`browser`, `design`…) or the first word of a
  Collie command (`panel`, `artifact`…). It names the commands: `collie notas add "buy coffee"`, or MCP `notas_add`.
- Up to 64 commands, each with `runs: "ui"`, a `timeout` of 1–300 s (default 30) and typed `params` (`string`, `int`,
  `flag`, `rest`). `outputFile: true` makes the result a file handed to the caller, with `--out`.
- `apiVersion` above 1 gets "precisa de um Collie mais novo". Unknown keys are ignored.

A full working example ships in the repository as `Examples/plugins/notas`.

## Who reaches the commands

An agent reaches a plug-in's commands only when it is **leashed to a panel of that plug-in**, the same rule as for
built-in panels ([Shepherd and terminals](/docs/concepts/shepherd-and-terminals)). The panel opens like Collie's own:
from the palette, with `collie panel open <id>`, or in a herd. The agent orientation never names external plug-ins; a
Shepherd sees one line, `collie plugin list`.

## The page

The page is served from `collie-plugin://<id>/…`, and only files under `ui/` are reachable. Every network load is
blocked (`http(s)`, `ws(s)`, `file`, WebRTC), camera and microphone are denied, and web storage is not persistent. The
page never sees the agent's request, terminal ids, tokens or Collie's paths: only each command's arguments.

| Call | What it does |
|---|---|
| `collie.onCommand(async (name, args) => result)` | Handles agent commands; the result is JSON up to 1 MiB, a throw is the agent's error |
| `collie.emit(event, payload)` | Sends a declared event, payload up to 64 KiB |
| `collie.state.get()` / `set(obj)` | Panel state up to 256 KiB, kept across restarts and updates |
| `collie.files.output(name, base64)` | Writes an output file up to 16 MiB for an `outputFile` command |
| `collie.theme` | `{scheme, tokens}`; tokens are also CSS variables on `:root` |

Installing a new version reloads open panels. Removing or disabling one fails a command in flight with `unavailable`. A
page whose process dies reloads, up to 3 times.

## Agent hooks

With `helper` and `hooks`, a plug-in receives Claude agents' events and answers them. The install shows first what it may
do, and a new version that asks for more needs a new confirmation.

```json collie-plugin.json
{ "helper": "bin/vizinho",
  "hooks": ["edit", "stop"],
  "permissions": { "project": "read" } }
```

The helper gets one JSON event on stdin and answers one JSON on stdout:

```tabs
tabs:
  - label: Event
    lang: json
    code: |
      { "apiVersion": 1, "event": "edit", "project": "/abs/worktree",
        "files": ["Sources/X/FooPanel.swift"], "agent": "claude", "paddock": "name" }
  - label: Answer
    lang: json
    code: |
      { "guide": "text for the agent" }
      { "block": "the reason and the root cause to fix" }
```

- `edit` fires after an agent's write tool; `guide` reaches the agent as context, `block` as a tool block.
- `stop` fires at the end of a turn, with the files written in it; `block` prevents the end of the turn once.
- The plug-in gets only paths, never the user's request or the conversation. Text is capped at 2,000 characters per
  plug-in, 4,000 in total.

```callout
kind: note
title: Fail open, in a sandbox
body: The helper reads the project and its own folder, writes only to `<root>/plugins-data/<id>/`, and has no network or home access. One process per event, 3 s for all plug-ins together. A timeout, a non-zero exit or bad JSON is ignored; the agent never sees a helper error.
```

Claude terminals get hooks directly. Cursor terminals reach them too: a Cursor `Write` becomes an `edit` event (a block
arrives as context, since the tool already ran), and the `stop` is generated when an `ask` ends by idleness. See [Agent hooks](/docs/internals/agent-hooks).

### Vizinho

**Vizinho** is the example hook plug-in (`Examples/plugins/vizinho`, built with `scripts/build-vizinho-plugin.sh`, not
bundled). When an agent writes a file, it looks at sibling files of the same kind (same folder, extension and type
suffix) and, if nearly all of them follow a shape the new file does not, tells the agent and names a model file. At the
end of a turn it proposes near-unanimous conventions as fences in `propostas.json`, in its data folder; you approve one by
copying it to `cercas.json` in the same folder. Only approved fences block a turn; files that already broke a fence are
tolerated until fixed.

## The catalog

```callout
kind: status
title: Phase 1, unused until a catalog is published
body: "The signed catalog shipped in 0.3.0, but no catalog is published yet. The commands and the app's \"Descobrir\" tab are there for when one is."
```

`collie plugin catalog [--refresh]` lists the catalog and `collie plugin install-catalog <id> --version <v>` installs or
updates (both the user's). The daemon accepts a catalog only with a valid Ed25519 signature and a sequence number not
lower than the last one; it is stale after 30 days. A package is checked by SHA-256 and by its tree hash, and a recalled
version is turned off, even when it came from a folder. A plug-in by another author shows "<author> · revisado pelo
Collie" on its card.

Before submitting, `collie plugin validate <folder>` refuses what an install would refuse plus the catalog's rules (an
empty `permissions.network`, a helper signed as `dev.collie.plugin.<id>`). Exit 0 prints `ok`; exit 1 prints one reason
per line.

## How it connects

- Panels and leashes: [Shepherd and terminals](/docs/concepts/shepherd-and-terminals).
- Hook events and how Claude and Cursor deliver them: [Agent hooks](/docs/internals/agent-hooks).
- A herd can open a plug-in's panel and carry its `stateKeys` ([Herds](/docs/features/herds)).
- The helper's sandbox is stricter than a terminal's ([Sandbox](/docs/features/sandbox)).
- Paddock apps reuse the same manifest, from the project instead of an install: [Paddock apps](/docs/features/apps).

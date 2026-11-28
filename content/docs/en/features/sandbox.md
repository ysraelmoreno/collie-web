---
title: "Sandbox"
description: "Every terminal runs inside a macOS sandbox profile: what it closes, what it leaves open, and how to grant access."
---

Every Collie terminal, agents and plain shells alike, runs inside a macOS sandbox (Seatbelt, `sandbox-exec`). The daemon
writes one profile per terminal, and it covers the whole process tree the terminal starts. It is a **file** boundary:
it decides what the agent can read and write. It is not a network boundary, and it does not protect you from what runs
outside it (a free terminal, Terminal.app, your own tools).

Read this page before you choose a sandbox mode, before you open a free terminal, and whenever an agent tells you a write
was blocked. For the sales pitch, see [/features/sandbox](/features/sandbox).

## Two modes

The mode is set in Preferences, under "Modo do sandbox" ("Sandbox mode"), and only the app can change it (never a
terminal). A change applies to terminals started afterwards: a running terminal keeps the mode it started with until it
restarts.

```compare
before:
  title: "Aberto (padrão)"
  items:
    - The agent reads and writes everything in your account
    - No access cards, no project limit for `summon --cwd`, herds and paddocks
    - Only Collie's own internals stay closed
after:
  title: "Estrito"
  items:
    - Writes only in the project and the tools' work folders
    - Secrets and browser profiles closed, even for reading
    - Blocked writes become a card you answer
```

**Open ("Aberto (padrão)") is the default.** A workspace whose stored mode is unknown falls back to strict: the app fails
closed.

```callout
kind: warning
title: What open mode means
body: In open mode an agent, or a malicious text it reads (prompt injection), can read your keys and tokens and change or delete anything in your account. What it writes and you later run outside the sandbox (a shell rc, a LaunchAgent, a binary on your `PATH`, a git hook) runs with no sandbox at all.
```

Even in open mode, Collie keeps its own things closed: the data folder and `admin.token` (no read, no write, except the
files Collie generates for that terminal), the `Collie.app` bundle and the `dev.collie.*` LaunchAgents (no write),
signals to processes outside the sandbox (no `kill` on the daemon or the app), `launchctl` and `/usr/bin/open` by path,
and the daemon's socket, reached only through `collie` with the terminal's own token.

## What strict mode closes

- **Writes outside the project.** The project is the first ancestor of the terminal's folder that has a `.git` (found
  without running git, never above your `$HOME`); in a paddock, the paddock's worktree. The terminal also writes in the
  tools' work folders: temp files, build and package caches, the agent's own state. If the terminal's folder is `~`
  itself, the project is your whole home folder; the new-terminal sheet warns about it.
- **Never writable**, whatever the project: shell rc files (`.zshrc`, `.zprofile`, `.bashrc`…), `~/.gitconfig` and
  `~/.config/git`, `~/.config/gh`, `~/.npmrc`/`.yarnrc`, `~/Library/Preferences`, `~/Library/LaunchAgents`,
  `~/Applications`, Collie's app and data folder.
- **The agents' global config** (`~/.claude`, `~/.codex`, `~/.cursor`, except their state folders and `~/.claude.json`)
  is read only. A write there shows the normal card, and only your click opens it.
- **Secrets, no read or write:** `~/.ssh`, `~/.aws`, `~/.netrc`, `~/.git-credentials`, `~/.pypirc`,
  `~/.docker/config.json`, `~/.gnupg` and browser profiles (Chrome, Chromium, Edge, Brave, Vivaldi, Arc, Opera,
  Firefox, Safari, Cookies). Git over SSH still works through `SSH_AUTH_SOCK`, without reading the keys. Signing commits
  with gpg stops working; signing with ssh through the agent works.
- **Nested `.git`.** No `.git` can be written in a subfolder of the project, because your git and IDE, outside the
  sandbox, would run its config. Clone in `/tmp`. Exceptions: `.build/` and `Carthage/Checkouts/` at the project root.
- **Git hooks and config:** `.git/hooks`, `.git/config`, `.git/info/attributes` and `commondir`. Commits, branches and
  the usual operations work.

Reading is free outside the secrets, the browser profiles, `~/Library/{Mail,Messages,Containers,Group Containers}` and
Collie's data folder. A blocked read never becomes a card.

## Granting access

When an agent hits a write outside the project that can be granted, it gets the error at once and the terminal's node
shows a card: the agent tried to write or delete a path, with **"Liberar este caminho"** (this path), **"Liberar a
pasta"** (its folder) and **"Negar"** (deny), plus a "para o lote" option that covers the lot's current and future
terminals. Nothing opens without your click.

The agent can also ask first, which is the polite path:

```sh
collie access request ~/Documents/shared-assets --write --reason "copy the exported icons"
collie access list   # what you opened to this terminal and its lot
```

The reason is scrubbed of secrets and shown on the same card. A `--read` request shows no card: the answer says reading
is already free, or why that path is never opened.

```steps
items:
  - title: Agent hits a blocked write
    result: The tool call fails and a card shows on the terminal's node.
  - title: You click a grant
    result: The terminal restarts with the wider sandbox.
  - title: The conversation resumes
    result: "Claude resumes with `--continue` (only if there was a conversation); Codex and Cursor reopen."
```

The process that was running is lost; the conversation is not. Grants are saved, show in the terminal's popover and in
the lot's "Liberados" tab, and **"Revogar"** restarts the terminals they reached. Some paths are never opened by a click,
whatever the mode: Collie's data and token, secrets, `.git/hooks`, `.git/config`, any `.git`, `~/Library` as a whole and
its Keychains, Mail, Messages, Cookies, Safari and Containers, and the folders that hold Collie's app.

## `open` and the tool shims

Inside a terminal, `open` is `collie open <url|app>`: the daemon runs it outside the sandbox, but only for http(s) and
mailto URLs and for installed apps (`/Applications`, `~/Applications`, Xcode's; `open -a Simulator` works). Scripts,
`.command` files, executables, documents, folders and apps the agent built are refused.

The terminal's `PATH` has shims for `swift`, `swift-build`, `swift-test`, `xcrun swift` and `xcodebuild` that add
`--disable-sandbox` and `-IDEPackageSupportDisableManifestSandbox=YES`, because the SwiftPM and Xcode sandboxes do not
nest inside Seatbelt. Calling the tool by its absolute path, or from a shell other than zsh, brings the nesting error
back. For the same reason Collie starts Claude with `sandbox.enabled=false`, Codex with `--sandbox danger-full-access`
and cursor-agent with `--sandbox disabled`: Collie's sandbox is the one that confines them.

## Free terminal

In the new-terminal sheet, "Terminal livre (sem sandbox)" is for your own work. Only you create one, only from the app;
agents, `summon` and herds never do. It has no leashes, stays out of lots and carries a "livre" mark on its node. It
runs as your user with no protection at all.

## Risks that stay open

These are accepted on purpose, and none of them is a boundary. A deliberately hostile agent can run code outside the
sandbox through any of them.

- `osascript` / Apple Events and the Docker socket stay open (automation and containers depend on them).
- The Keychain: `/usr/bin/security` runs and `~/Library/Keychains` is writable, so Claude can keep its login.
- `~/.config/gh` is readable, so `git push` over HTTPS works, and so does any agent with your GitHub login.
- `~/.claude.json` is writable: an agent could plant a global MCP server there.
- `launchctl` and `open` are blocked only by path; a copy of the binary runs.
- Writable caches (`~/.npm`, `~/.cache`, `~/.cargo/registry`, DerivedData) hold code that runs outside.
- Project config and scripts (`.claude/settings.json`, `.mcp.json`, `package.json`, Makefile…) run outside the sandbox
  when you run them.
- Memory is shared: what a sandboxed agent saves in `~/.claude/projects` or with `collie memory save` can reach a free
  terminal's prompt. Review memories before trusting them there (see [Memory](/docs/features/memory)).

```callout
kind: note
body: Review what an agent changed, including new gitlinks in `git diff --cached`, before running your own tools in the project. Real isolation needs the agents under another macOS user.
```

## How it connects

- Terminals and paddocks: the project root comes from the terminal's folder or its paddock's worktree, see
  [Paddocks and worktrees](/docs/concepts/paddocks-and-worktrees). A field's sandbox is its own lane worktree
  ([Fields](/docs/features/fields)).
- The sandbox is not a network boundary. Captured traffic in the [Network](/docs/features/network) panel is gated by the
  leash instead.
- Plug-in helpers run in a sandbox of their own, stricter than a terminal's ([Plug-ins](/docs/features/plugins)).
- The admin token and the signed app: [Daemon and socket](/docs/internals/daemon-and-socket).

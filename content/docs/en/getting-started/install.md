---
title: "Install"
description: "Download the signed app, put it in /Applications and let it install its background service."
---

Collie is a macOS app with three parts: the app with the canvas, a background service called `collied`, and the `collie` command line that agents use from inside their terminals. You install one `.app`; the app installs the service, and every terminal it opens already has `collie` on its `PATH`.

This page covers the download, the first launch, updates and building from source. When Collie is running, go on to [your first paddock](/docs/getting-started/first-paddock) or straight to [your first agent](/docs/getting-started/first-agent).

## Requirements

- macOS 15 or later, on Apple Silicon. There is no Intel build.
- At least one agent CLI you already use and are logged in to: Claude Code (`claude`), Codex (`codex`) or Cursor (`cursor-agent`). Collie does not install them and never stores their credentials. A plain shell (`zsh`) works without any of them.
- Optional, for the device panels: `adb` for Android, Xcode 26+ and AXe for the iOS Simulator. See [Devices](/docs/features/devices).

## Download and move to Applications

```steps
items:
  - title: Download the dmg
    command: https://github.com/ysraelmoreno/collie/releases/latest/download/Collie.dmg
    result: The latest release, signed with Developer ID and notarized by Apple, so Gatekeeper opens it normally.
  - title: Drag Collie.app to /Applications
    result: Do this **before** the first launch.
  - title: Open Collie
    result: The app asks to install its background service. Click **Continuar** ("Continue").
```

The service has to start from `/Applications`. `collied` runs under launchd, and if the app sits in `~/Documents`, `~/Desktop` or `~/Downloads`, macOS's folder permission (TCC) blocks it. The app detects this and says so: "Mova o Collie.app para /Applications…" ("Move Collie.app to /Applications").

```callout
kind: note
title: Why a background service
body: The consent sheet says it plainly — `collied` keeps your terminals alive even with the app closed. Quit the app and the agents keep working; open it again and the canvas reconnects to them.
```

If you click **Sair** ("Quit") on that sheet, nothing is installed and the app closes.

## What gets installed where

| What | Where |
|---|---|
| The app | `/Applications/Collie.app` |
| The service | LaunchAgent `dev.collie.daemon`, running `collied` |
| Collie's data | `~/Library/Application Support/Collie` (workspaces, memory, artifacts, herds…) |
| Logs | `~/Library/Logs/Collie/` |

Inside a repository, Collie also uses a `.collie/` folder: `.collie/paddocks/` for paddock worktrees and `.collie/memory/` for the project memory. The paddocks folder is added to the repository's local git exclude, so it never shows up in `git status`.

## Agents see your shell's environment

Agents start with the environment of your interactive shell. The service runs `$SHELL -ilc` once (it reads `.zshrc`, so `node` from nvm and your `PATH` work), with a 5-second timeout, and keeps the result for 10 minutes. When a shell rc file changes, the capture runs again before the next launch.

If your `.zshrc` has slow parts, skip them during the capture: Collie sets `COLLIE_ENV_CAPTURE=1` while it runs.

```sh .zshrc
if [ -z "$COLLIE_ENV_CAPTURE" ]; then
  # slow things that agents don't need
fi
```

Collie's own variables win over yours, and `collie` always comes first on the agent's `PATH`.

## Updating

Since 0.2.3 the app updates itself through Sparkle: it checks the release feed, downloads the dmg, verifies its signature and Apple team, installs and relaunches. If an agent is mid-turn, the relaunch waits for you ("Atualizar mesmo assim" / "Depois"). In **Preferências › Atualizações** ("Preferences › Updates") you have **Procurar agora** ("Check now") and the automatic check switch.

The service keeps running the old version until it restarts, so open terminals are not killed by an update. The app shows a notice with **Reiniciar serviço** ("Restart service"); restarting closes the open terminals, and Collie never does it by itself. From a shell:

```sh
launchctl kickstart -k gui/$(id -u)/dev.collie.daemon
```

Builds you make yourself (not signed by the release team) never update themselves.

## Coming from Orq

Collie used to be called Orq. Quit `Orq.app` (and any `orqd`) first, then open Collie: it moves `~/Library/Application Support/Orq` to `…/Collie` with a single rename, leaves a symlink behind, and replaces the old LaunchAgent. Opening Collie the first time restarts the service, so open terminals close.

```callout
kind: warning
title: Do not open Orq.app again
body: The old app can still start `orqd` over the same data and drop Collie's terminals. Once you have checked that Collie works, delete `/Applications/Orq.app`.
```

## Building from source

You need macOS 15 and Swift 6.2. The scripts download pinned versions and check each file's SHA-256.

```sh
scripts/fetch-weblibs.sh   # required: offline page libraries
scripts/bundle-app.sh      # builds build/Collie.app
```

Optional scripts each turn on one feature: `fetch-fonts.sh` (Space Grotesk and DM Mono), `fetch-scrcpy-server.sh` (Android video), `build-drawio.sh` (Diagram panel), `build-figcraft.sh` (Design engine; needs `rustup` with the `wasm32-unknown-unknown` target) and `make-signing-cert.sh` (a stable local signature, so macOS keeps folder permissions between builds). Copy `build/Collie.app` to `/Applications` before the first launch, as above.

Run `swift test` outside a Collie terminal: the sandbox tests use `sandbox-exec`, which cannot open a sandbox inside another.

## Next

- [Your first paddock](/docs/getting-started/first-paddock): an isolated branch for one piece of work.
- [Your first agent](/docs/getting-started/first-agent): a Shepherd that delegates.
- [How it connects](/docs/concepts/how-it-connects): app, service, CLI and terminals.

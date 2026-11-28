---
title: "Daemon and socket"
description: "collied owns every terminal; the app, the CLI and the MCP server all talk to it over one Unix socket."
---

Collie is three programs. `collied` is the daemon: it owns the terminals, the paddocks, the memory, the work log and the loops. The app (`Collie.app`) draws the canvas. `collie` is the command line that agents and you run. The app and the CLI never talk to each other. Both talk to `collied` over a Unix socket.

Read this page when you want to know why terminals keep running after you quit the app, why a command says the service must be restarted, or what an agent can and cannot do with its token. For how the pieces look from the canvas, see [How it connects](/docs/concepts/how-it-connects).

## The daemon

`collied` runs as a LaunchAgent with the label `dev.collie.daemon`. The app writes the plist to `~/Library/LaunchAgents/dev.collie.daemon.plist` and loads it. The plist sets `RunAtLoad` and `KeepAlive`, so launchd starts the daemon at login and starts it again if it exits. Its output goes to `~/Library/Logs/Collie/collied.log`.

Because the terminals live in the daemon and not in the app, quitting the app leaves them running. Opening the app again reattaches to them.

The daemon takes three arguments, and refuses any other with exit code 2:

| Argument | What it does |
|---|---|
| `--root <path>` | Data folder. The default is `~/Library/Application Support/Collie`. |
| `--no-terminal-sandbox` | Starts terminals without the sandbox. For developing Collie only; the choice is logged at start. |
| `--workspace <uuid>` | Workspace to load. Without it, the last one saved in `<root>/default-workspace`. |

```callout
kind: warning
title: Install before first use
body: "Copy `Collie.app` to `/Applications` before you open it. launchd runs the daemon from inside the bundle, and an app in `~/Documents`, `~/Desktop` or `~/Downloads` makes the daemon hang on the macOS folder permission (TCC). The app warns when it detects this."
```

### The data folder

Everything the daemon keeps is under the root, which it sets to mode 0700 at start:

| Path | Contents |
|---|---|
| `run/collied.sock` | The socket (0600, in a 0700 folder). |
| `run/terminals/<id>.pid` | One pidfile per running terminal, for cleanup after a crash. |
| `admin.token` | The app's token (0600). Rewritten at every start. |
| `workspaces/<uuid>/` | Canvas, terminals, paddocks. `terminals/` holds the scrollback spill. |
| `hooks/` | Per-terminal settings, MCP config and plug-in folders for agents. See [Agent hooks](/docs/internals/agent-hooks). |
| `work/`, `memory/`, `lots/`, `herds/`, `curator/` | Work log, memory, lots, herds, the curator's queue. |

Logs are not under the root: they are in `~/Library/Logs/Collie/`.

## The socket

The socket is `<root>/run/collied.sock`. When the daemon starts and finds the file, it tries to connect: if something answers, it stops with "daemon already running"; if the connection is refused, the file is stale and is removed.

### Wire format

The protocol is newline-delimited JSON: one object per line, no length prefix. A normal request is one line in, one line out, then the connection closes. A request may be up to 4 MiB; a larger one gets `invalidArgs` "request too large". A connection has 30 seconds.

```json request
{"v":1,"id":"7f3c","terminalId":"…","token":"…","command":"list","args":{},"cwd":"/Users/me/project"}
```

```json response
{"v":1,"id":"7f3c","ok":true,"result":{}}
```

A failed response carries `error` with a `code`, a `message` and, sometimes, `retryAfter`. The codes are `unauthorized`, `notFound`, `notConnected`, `notRunning`, `ambiguous`, `invalidArgs`, `timeout`, `deadlock`, `notShepherd`, `tooMany`, `unsupportedVersion`, `daemonUnavailable`, `unavailable`, `conflict` and `internal`.

`v` is the protocol version, today `1`. Any other value is refused with `unsupportedVersion`.

### Streams

Commands that start with `ui.` turn the connection into a stream. They are the app's: attaching to a terminal (`ui.attach`), workspace events, the device panels, the usage numbers. The first line is the normal response; after it, each line is a frame with a type in `t` and binary data in base64 in `d`. A terminal stream starts with a `replay` frame (the scrollback), then `out` frames as the terminal writes.

The daemon sends the replay and subscribes in one step, so no output is lost or repeated between them. If a client falls more than 4 MiB behind, the daemon sends `overflow` and cuts the stream; the app reattaches by itself and keeps up to 64 KiB of your typing while it does.

## Tokens and who may do what

Every request carries a token. There are two kinds.

- **Terminal token.** Each terminal gets its own random token when it starts, in `COLLIE_TOKEN`, with its id in `COLLIE_TERMINAL_ID` and the socket path in `COLLIE_SOCKET`. Tokens live only in the daemon's memory and are revoked when it stops.
- **Admin token.** The app's. 32 random bytes, regenerated at every start and written to `admin.token`.

The CLI picks the token by itself. Inside a Collie terminal it uses the terminal's. Commands that only the app may run (`admin.*`, `ui.*`, and a few groups such as `android.*`) need the admin token, and inside a terminal the CLI refuses before reading the file: "the admin token can't be used from inside a Collie terminal".

The file alone is not enough. A daemon running from the signed `Collie.app` accepts the admin token only from the app itself: it reads the code hash (cdhash) of the process on the other end of the socket and compares it with `Contents/MacOS/Collie`. Anything else gets:

```text
admin commands are only accepted from the Collie app: use the app (comandos de admin só pelo app Collie)
```

An old copy of the app still open after you replaced it in place is refused until you reopen it. The daemon also refuses the admin token from any process inside a terminal's session, or started by the daemon (git hooks, usage providers).

```callout
kind: warning
title: Not isolation between processes of the same user
body: "A process that can stop and restart the daemon, or run another daemon on the same data, gets admin. The [sandbox](/docs/features/sandbox) narrows this but leaves exits open (`osascript`, Keychain). Real isolation needs the agents under another macOS user."
```

### Reach

A terminal token reaches only what is leashed to it. The router answers in three ways when a name does not resolve:

| Code | When |
|---|---|
| `notFound` | No terminal has that name ("Terminal 'x' not found"). |
| `notConnected` | It exists but is not leashed to you ("No connection to 'x'."), with a hint: a Shepherd can ask for the leash, anyone else is told only the user can leash it. |
| `ambiguous` | Two reachable terminals share the name. |

A terminal without the sandbox reaches nothing, and nothing reaches it. Commands marked for Shepherds answer `notShepherd` to other terminals. See [Shepherd and terminals](/docs/concepts/shepherd-and-terminals).

## Terminals inside the daemon

Each terminal is a pseudo-terminal opened by the daemon and started in its own session. The daemon keeps the last 1 MiB of output in memory, which is what a reattach replays, and spills the rest to `workspaces/<ws>/terminals/<id>-<ms>.log` (0600), up to 128 MiB per launch. Spill files are deleted at every start and stay out of the data backup.

## Restarts and updates

The daemon never restarts by itself. When you replace the app, the old `collied` keeps running. The app compares the build of the daemon it is talking to with the one in its bundle, and if they differ it shows:

> O serviço do Collie está desatualizado (versão anterior ainda rodando). Reiniciar agora? Os terminais abertos serão encerrados.

with **Reiniciar serviço** and **Depois**. The manual way is the same command the button runs:

```sh
launchctl kickstart -k gui/$(id -u)/dev.collie.daemon
```

What a restart does:

```steps
items:
  - title: Stop
    result: "The daemon stops the socket, cancels loops, stops devices and app services, sends `SIGHUP` to every terminal and `SIGKILL` 2 s later to what is left, then revokes all tokens."
  - title: Clean up
    result: "At start, process groups left by a crashed daemon (from `run/terminals/*.pid`) get the same treatment. They are never adopted again: their terminal died with the old daemon."
  - title: Reload
    result: "Terminals come back from `workspace.json` as records without a process (`stopped`). Running jobs are marked `gone` and loops are stopped; `collie work run` again continues from the next open task."
```

A CLI newer than the daemon may send a command the daemon does not know. The CLI turns "Unknown command" into `<command>: reinicie o serviço para usar isto`: restart the service and try again.

When the socket is missing or refuses connections, every command fails with `daemonUnavailable` "daemon não está rodando (collied)". Look in `~/Library/Logs/Collie/collied.log`.

## The MCP server

`collie mcp` is the MCP server each Claude terminal gets (see [Agent hooks](/docs/internals/agent-hooks)). It speaks JSON-RPC 2.0 over stdio and forwards each `tools/call` to the socket with the same token as the CLI: an MCP tool can do exactly what the matching command can. Every 10 seconds (`COLLIE_MCP_POLL_MS` changes it) it checks the plug-in commands and the panels the terminal reaches, and sends `notifications/tools/list_changed` when they changed.

## Phone access

The daemon also has a remote gateway for the phone (Preferences, "Celular"). It is off by default and listens only after you pair a device there; turning it on is an app-only command.

## Related

- [Agent hooks](/docs/internals/agent-hooks): what the daemon writes for each agent and what comes back.
- [Memory curator](/docs/internals/curator): the background job queue inside the daemon.
- [CLI reference](/docs/reference/cli): every command that goes over this socket.

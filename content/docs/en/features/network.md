---
title: "Network"
description: "Capture an Android emulator's HTTP(S) traffic and answer requests with map rules you approve."
---

The **"Rede"** (Network) panel captures the HTTP(S) requests an Android emulator makes: method, host, path, status, size
and time, with headers and bodies for each one. It can also answer a request in the server's place: a map rule returns a
response you wrote, or cuts the connection, and the server is never called.

Use it when a screen breaks and the cause is probably in a request (a missing field, a 500, a slow reply), and when you
want to test the app against a response the backend cannot give you yet. For the overview, see
[/features/network](/features/network).

## Requirements

- **mitmproxy.** The proxy is `mitmdump`, and it is not bundled. Install it with `brew install --cask mitmproxy`, or point
  `COLLIE_MITMDUMP` at the binary. Without it, attaching fails with "mitmdump not found".
- **An Android emulator with a rootable image.** Only emulators are captured (serials that start with `emulator-`), not
  physical devices or the iOS Simulator. The image must accept `adb root`: a "Google APIs" or AOSP image, or the
  `collie-lite` AVD. Google Play images and production builds are refused, and the error says which image to use. See
  [Devices](/docs/features/devices) for emulators and `collie-lite`.

## Open the panel and attach

In the app, **"Abrir painel…" → "Rede"**; a Shepherd can run `collie panel open network`. In the panel, pick the
emulator and click **"Interceptar"**; **"Parar"** stops it. From a terminal:

```sh
collie network attach            # the only emulator online, or --serial emulator-5554
collie network status            # {attached, serial, port, flows}
collie network detach
```

`attach` starts one mitmdump per emulator, installs its CA certificate on the device and points the emulator's proxy at
it. Every step checks before it acts, so attaching an attached emulator only repairs what is missing, and detaching a
clean one changes nothing.

```callout
kind: warning
title: adb root restarts adbd
body: "If the emulator was not root yet, `attach` runs `adb root`, which restarts adbd. That drops every `adb reverse` and ends an open Device panel's screen session; the next viewer starts a new one."
```

## The leash is the permission

Captured traffic carries tokens and cookies, so a terminal reads it only if it is leashed to a Network panel. Without a
leash every `collie network …` fails with "No network panel reachable. Open one with `panel open network`." The app
needs no leash. Leashes are explained in [Shepherd and terminals](/docs/concepts/shepherd-and-terminals).

## Read the traffic

```sh
collie network list --limit 20 --host api.example.com
collie network get <flow-id>      # one flow, headers and bodies, decoded when possible
collie network curl <flow-id>     # the request as a cURL command
collie network clear        # forget the captured flows
```

`list` returns `{id, method, host, path, status, size, durationMs, state}` per flow, oldest first; `--limit` keeps the
newest N (default 100). Flows live in memory only. The panel keeps the newest 2,000 flows and up to 256 MiB of them,
and drops the oldest first.

## Map rules

A map rule says what to match and what to answer:

- **Match:** `--method`, `--host` (a glob, `*.example.com`), `--path` (a glob without the query, `/v1/pdp*`) and
  `--query k=v` (repeatable).
- **Answer:** `--status` (100–599, default 200), `--header "Name: value"` (repeatable; `content-encoding` and
  `content-length` are refused), `--body` or `--body-file`, `--delay` in ms (0–60000), or `--drop` to cut the
  connection (with `--delay`, a timeout).
- **`--from <flow>`** starts from a captured response (status, headers, decoded body); the other flags override it.

```sh
collie network rule-add --name checkout-ok --method POST --path "/v2/checkout" \
  --from <flow-id> --status 200
collie network rule-list
collie network rule-disable <rule-id>
```

The **first enabled rule that matches wins**. In the panel, **"Mapear"** on a flow's detail opens the same form
("Mapear esta resposta"), with "Responder com…" or "Cortar a conexão".

```steps
items:
  - title: The agent adds a rule
    command: collie network rule-add --path "/v2/checkout" --from <flow-id> --status 200
    result: The rule is born off, and a card shows in the app.
  - title: You answer the card
    result: "**Permitir** turns it on; **Negar**, or no answer in 120 s, leaves it off."
  - title: The app gets the mapped response
    result: The server is never called for that request.
```

A terminal's rule always waits for your OK, and so does `rule-enable` on a rule that is off. Denied, the command fails
with "the user did not allow map rule '<id>'; it stays off". The card shows two lines: the request and the response
(status, size, delay).

`--body-file` must be a regular file inside your project, at most 5 MiB, not a symbolic or hard link; it is read when the
rule is saved. Rules are global to the Mac (`<root>/network/rules.json`), not per emulator, and all of them come back
**off** when Collie opens.

## Pitfalls

- A filter on `--host` matches text the host contains; a rule's `--host` is a glob. `api.example.com` as a rule matches
  only that exact host.
- A rule that does not fire: check `rule-list` for an earlier enabled rule that matches first.
- While a session runs, the daemon checks it every 5 s: it restarts a dead mitmdump and repairs a lost `adb reverse` or a
  CA gone after a reboot. At daemon start, a crashed daemon's leftovers are undone so the emulator gets its network
  back, and a daemon that stops detaches every emulator first.

## How it connects

- The emulator comes from the [Devices](/docs/features/devices) panel; the agent reads the screen there and the traffic
  here.
- The leash rule is the same as for `collie device …` and the other panels
  ([Shepherd and terminals](/docs/concepts/shepherd-and-terminals)).
- The terminal [sandbox](/docs/features/sandbox) is a file boundary, not a network one: capture is gated by the leash.
- Every command: [CLI reference](/docs/reference/cli).

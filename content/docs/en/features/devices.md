---
title: "Devices"
description: "Android devices, emulators and iOS Simulators on the canvas, driven by agents with collie device."
---

The **"Dispositivo"** (Device) panel shows the screen of an Android device or emulator, or of an iOS Simulator, on the
canvas, with mouse and keyboard. Agents drive the same device with `collie device …`: they read the screen as groups of
elements with refs, tap, swipe, type, read the log and install apps. The daemon runs these commands, through `adb` on
Android and `simctl` and AXe on iOS.

Use it to let an agent check a mobile change on a real screen, reproduce a bug from a report, or walk a flow end to end.
The overview is at [/features/devices](/features/devices), and the light emulator at
[/features/emulator](/features/emulator).

## Set up Android

```steps
items:
  - title: Install adb
    command: brew install --cask android-platform-tools
  - title: Connect a device or start an emulator
    command: adb devices
    result: "On a phone, turn on Developer options → USB debugging and accept the Mac's key. The device shows as `device`."
  - title: Open the panel
    command: collie panel open device --serial <serial>
    result: "In the app, \"Abrir painel…\" → \"Dispositivo\". Without `--serial`, the only device online."
```

The screen is scrcpy video. In the panel, click or drag is a touch, scrolling scrolls, and the keyboard types when the
panel has focus (accents too). The bar has "Voltar", "Início" and "Recentes" (Back, Home, Recents). With no device the
panel shows the state and **"Reconectar"**.

**No Android SDK yet?** Preferences → Android installs it without Android Studio: **"Instalar"** first fetches the
Temurin JDK (if there is no 17+) and the Command-line Tools, then shows Google's licenses for you to read and accept
(**"Recusar"** downloads nothing more), then platform-tools, the emulator and a system image. An Android Studio SDK
already on the Mac is reused.

## Emulators and `collie-lite`

Installed emulators that are off show in `collie device list` as `avd:<name>` with `state: "off"`. Opening a panel on
one boots it and waits for the boot (up to 3 minutes). The emulator runs in its own session: Collie never shuts it down,
and closing the panel or stopping the service leaves it on.

For Macs with little CPU and RAM, `collie device lite create` (app only) creates the `collie-lite` AVD: 720×1280, 1.5 GB,
2 cores, no camera, audio or sensors, host GPU. It needs the Command-line Tools and a `google_apis` arm64 image already
installed; Collie downloads nothing for it. In Preferences → Android, **"Criar emulador leve"** does the same and
**"Remover"** deletes it.

## Set up the iOS Simulator

1. Xcode 26+ with an iOS runtime (`xcrun simctl list devices` lists simulators).
2. AXe: `brew install cameroncooke/axe/axe` (tested with AXe 1.8.0).
3. "Abrir painel…" → "Dispositivo": simulators show as `iPhone 16e — iOS 26.3`, the ones that are off with
   "(desligado)". Opening one boots it (up to about 2 minutes). A Shepherd: `collie panel open device --serial <UDID>`.

The bar has "Início" and "Bloquear" (Home, Lock). The same `collie device …` commands work, with coordinates in
**points**, not pixels; `collie device list` shows `platform: "ios"` and the UDID as `serial`.

## Reading the screen

A terminal reaches a device only through a leash to its panel on the canvas; a panel in a dock serves every terminal.

```sh
collie device screen          # the screen in groups, with refs
collie device ui              # the raw tree, labelled or clickable nodes
collie device find "Checkout" --scroll
collie device screenshot      # a PNG, to look at, not to parse
```

Start with `device screen`: title, tabs (`*` on the selected one), actions, fields, content, floating buttons and what
changed since the last read, each item `{ref, label, role, state}`. Use `device ui` when the grouping hides something,
and `screenshot` only when neither shows the element. On Android, `--ocr` also reads the screenshot's text, and runs by
itself when the tree is poor; `--region x1,y1,x2,y2` limits it.

`find "<text>"` returns `{found, ref, label, role, center, clickable}`. With `--scroll` it swipes from 75% to 35% of the
height and looks again, until it finds the element, the tree stops changing, or `--max` swipes (default 8, up to 30).

## Acting

```sh
collie device tap --ref e3 --then screen
collie device tap --text "Open Deals" --then ui
collie device swipe 540 1800 540 600
collie device text "hello"
collie device key Back
collie device wait --text "Combos" --timeout 15
collie device launch com.example.app
collie device logcat --lines 100 --grep MyApp
```

```compare
before:
  title: Two calls
  items:
    - "`tap --ref e3`"
    - "`screen`"
after:
  title: One call
  items:
    - "`tap --ref e3 --then screen`"
```

`--then ui` or `--then screen` works on `tap`, `swipe`, `text`, `key` and `launch`: it waits 400 ms (`--settle 0-3000`,
or `--settle stable` for two equal dumps, up to 5 s) and returns the new screen with updated refs. `tap --text` and
`--id` find the element in a fresh dump, so no `ui` call is needed first; with several matches pick one with `--nth`.
`wait` waits for `--text` to show (`--gone`: to go) or for `--stable`; a bare `--timeout` number is seconds, default 10,
and above 60 s it waits 60 s.

## The Android helper

`collie-helper.apk`, in the bundle, runs as an accessibility service and reads the screen in tens of milliseconds instead
of the ~2 s of `uiautomator dump`. `tap --text|--id|--ref` becomes a semantic click and `wait --stable` waits on events.
The emulator gets it by itself on the panel's first `device` action. A **physical device only on opt-in**:
`collie device helper install --serial <id>` (app only). `collie device helper status` says
`ready|starting|fallback|off` and why.

```callout
kind: note
title: Privacy
body: An accessibility service reads everything on screen while it is on. The helper accepts only the `adb forward`, masks passwords, has no internet permission, and nothing leaves the device. Any failure falls back to `uiautomator`.
```

## Limits

- No audio. `device text` types ASCII only, and on Android cannot type a literal `%s`; type accents in the panel.
- An ANR is not an event (only crashes from logcat's crash buffer).
- iOS: simulator only, no physical iPhone; a drag is one swipe on release (no multitouch); video and input depend on AXe
  keeping up with Xcode, so an Xcode update can break them until a new AXe ships.

## How it connects

- The emulator's HTTP(S) traffic: [Network](/docs/features/network).
- The same refs loop for web pages: [Browser](/docs/features/browser).
- Leashes and who reaches which panel: [Shepherd and terminals](/docs/concepts/shepherd-and-terminals).
- `open -a Simulator` works from a sandboxed terminal through `collie open` ([Sandbox](/docs/features/sandbox)).

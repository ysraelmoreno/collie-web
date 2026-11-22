---
title: "Agents that can see the phone"
date: 2026-11-22
summary: "What we are changing in how Collie agents talk to Android and iOS devices, and where we think mobile development is going."
draft: false
---

A phone on the canvas is only useful if the agent can use it. Today it can. But it is slow, and cheaper models get lost. This post is about what we are changing, and where we think mobile work is heading.

Two parts. The first is facts: what ships, what is on `main`, what is still in progress. The second is opinion, and it says so.

## Where it stands today

Released since 0.1.0:

- A **Dispositivo** (Device) panel. Android runs through scrcpy and adb. The iOS Simulator runs through AXe and simctl.
- The same `collie device` commands for both: `ui`, `screenshot`, `tap`, `swipe`, `text`, `key`.
- `collie-lite`, a light Android emulator Collie creates for small Macs. Powered-off emulators show up in `collie device list` as `avd:<name>`, and opening their panel boots them.
- Android SDK setup from **Preferências → Android**, no Android Studio needed.
- A screen drawn inside a frame for the kind of device (phone, foldable, tablet, modern iPhone, iPhone with a home button, iPad), picked automatically (0.1.8). Small panels and physical devices show no frame.

The flow is the one from the [Devices post](/features/devices): the agent reads the UI tree, taps by ref, takes a screenshot. You watch it in the panel.

It works. The problem is cost.

## What we measured

We tried a cheaper agent model on a simple task: navigate between a few screens of an app, from the first screen to a third one, through a button and a menu.

It failed to finish the task the way we wanted. It ended up writing Python scripts to "read" the PNG from `collie device screenshot`.

On an Android emulator we timed one step:

```stats
items:
  - value: 2.2–3.3 s
    label: "`collie device ui`"
    note: 4 samples
  - value: 0.1 s
    label: "`collie device tap --ref`"
```

Almost all of a see → act step was the UI dump. And the tree had 49 to 67 lines, most of them layout containers with only an id. An icon-only button showed up as a `Button` with just a resource id, no text. Search for it by text and you find nothing.

Our hypothesis, not yet confirmed: that model does not get images back from tools at all. So the screenshot was useless to it, and the tree was too noisy.

## What changed on main

```callout
kind: status
title: On main, not released
body: "Everything in this section is merged on `main`. The latest tag is v0.1.9 and none of it is in a release yet."
```

### A smaller tree

`collie device ui` now returns only useful nodes: the ones with a label, or the clickable ones. `collie device ui --all` gives you the full tree for debugging. Refs stay the same in both, so `e4` is the same node either way.

### Act and look in one call

`tap`, `swipe`, `text`, `key` and `launch` take `--then ui`. The daemon acts, waits, dumps the screen and returns it, with fresh refs. One call per step instead of two.

```compare
before:
  title: Two calls
  items:
    - "`collie device tap --ref e3`"
    - "`collie device ui`"
after:
  title: One call
  items:
    - "`collie device tap --ref e3 --then ui`"
```

### Tap by label

You no longer need a ref first. `tap --text` finds the node by its label (or `--id` by resource id), on a fresh dump:

```sh
collie device tap --text "Settings" --then ui
```

If several nodes match, you get a list and pick one with `--nth N`.

### See the screen as a human would

`collie device screen` groups the tree: title, tabs (the selected one marked with `*`), actions, fields, content, floating buttons, and what changed since the last call. It returns text, plus items with `ref`, `label`, `role` and `state`. `ui` stays the raw view for when the grouping hides something.

### Find and wait

- `collie device find "X"` locates an element on screen. Add `--scroll` and it swipes and looks again until it finds it, until the tree stops changing (end of the list), or until `--max` (default 8).
- `collie device wait --text "Settings"` waits for text to appear. `--gone` waits for it to vanish. `--stable` waits for the screen to settle. This replaces `sleep` followed by another `ui`. With the helper (below), `--stable` follows the screen's own events: it is stable once none arrives for `--quiet` ms (default 300). Without the helper, it compares two identical dumps.
- `tap --text` and `find` understand `+`, `x`, `☰`, `<` and `>`, and the id of a button with no label (`configuration_fab` is read as "configuration fab"). When nothing matches, `find` lists the clickable ids with no label.

### A resident reader on Android

The slow part was `uiautomator`, not adb. So on `main` a small accessibility service on the device, `collie-helper.apk`, reads the screen instead.

```tabs
tabs:
  - label: Android
    lang: sh
    code: |
      collie device helper status
      collie device helper install
  - label: iOS Simulator
    body: "No helper: it is an Android accessibility service. The screen is read through AXe, as before. `collie device helper` does not apply."
```

An emulator gets the helper on its own, on the panel's first device command. A physical phone gets it only after `collie device helper install`, because the service reads the whole screen. `collie device helper status` says what the commands read the screen with (`helper` or `uiautomator`), and why. If the helper fails, the commands fall back to `uiautomator` and Collie tries again later. They never fail because of the helper.

In a proof of concept on one Android emulator, a screen read dropped from about 2,050 ms to 4 to 120 ms once warm, with the same 55 nodes. The first read took 523 to 650 ms, and one read right after a screen change took 1.58 s. It is one device and one screen, not a benchmark.

```stats
from: ~2,050 ms
to: 4–120 ms
label: Reading the screen on an Android emulator
note: Proof of concept, one device, one screen. Warm reads; the first one takes 523–650 ms.
```

### OCR when the tree does not help

Some screens give the accessibility tree nothing to say: a canvas, a game, an image. On `main`, `collie device screen` then reads the screenshot, on Android and iOS. Those items show as `(ocr)`, with refs `o1`…. `--ocr` forces it, `--no-ocr` turns it off, and `--region x1,y1,x2,y2` limits the area. `find` and `tap --text` that match nothing in the tree try OCR and tap the center of the text box. There is no click confirmation, so follow it with `--then screen`.

In our Android corpus (16 screens, one emulator), the trigger fired on all 8 screens with no accessible text and on none of the 5 good ones. On the iOS Simulator fixture, OCR found every expected text. Both are small, synthetic corpora, so read them as "it works on our fixtures".

### Smaller things

- `--timing` on `ui` and `screen` returns time per step (adb, parse, grouping), so we can measure without a stopwatch.
- `collie device launch` opens the app's first LAUNCHER activity instead of using monkey.

The agent's built-in guidance was updated to teach this loop: look with `device screen`, act with `--then`, screenshot only if nothing else shows the element.

## What is still in progress

Be honest about the edges:

- **Speed on iOS.** The helper is Android-only. On the Simulator the screen is still read the way it was, and we have not published numbers for the new commands there.
- **Speed on real Android phones.** The numbers above come from an emulator. A physical phone needs `collie device helper install`, and we have not published timings for one.
- **OCR.** Our corpora are small and mostly synthetic. Real apps with an empty tree (Flutter, games, opaque WebViews) are what we still need to try. Light text over a wallpaper was the weak case.

```callout
kind: warning
title: Proof
body: We have not published numbers for the cheaper-model task after these changes. Until we do, treat this as "built", not "solved".
```
- **Limits that are still true.** No audio. `device text` types ASCII only. iOS means Simulator only, not a physical iPhone.

## Where we think this goes

```callout
kind: vision
title: A view, not a roadmap
body: Everything below is opinion. No dates, no promises.
```

### The loop moves closer to the code

Today, mobile testing mostly happens after the code. You build, you open the app, you tap through, you look. We think the agent that writes the change should be the one that checks it, on the same machine, on a real screen, before it says "done".

That needs the device to be a normal tool for the agent, like the compiler or the test runner. Not a special setup. This is why we care about one call per step and about a short, readable screen description.

### Perception belongs near the device

A cheap agent should not plan every scroll. The less work the model does per screen, the cheaper the loop gets. We lean toward putting repetitive pieces (scroll until found, wait until settled, group the tree) into the tool and leaving the agent one-line decisions.

> "Go to the settings screen and find the notifications option." That should be a sentence, not a script.

### Emulators are the common case

A light emulator next to an editor, a browser and a few agents should be normal on a small Mac. Real devices matter, but most checks do not need one.

### What we are unsure about

Will accessibility trees be enough? Compose and custom views give us poor labels. Screenshots with vision may need to come back for some apps. We don't know yet.

And trust. An agent tapping through your app is only as good as your sense of what it did. Watching it in a panel is our answer for now. It may not be enough when five agents run at once.

## Try it

With the Collie build from `main`, boot the light emulator and let an agent drive it.

```steps
items:
  - title: Open the light emulator
    command: collie panel open device --serial avd:collie-lite
    result: The emulator boots and gets the helper on its first device command.
  - title: Check how the screen is read
    command: collie device helper status
    result: "`helper` when it is ready, `uiautomator` with the reason when it is not."
  - title: Read the screen
    command: collie device screen
  - title: Tap by label and look again
    command: collie device tap --text "Sign in" --then screen
  - title: Read the pixels when the tree is empty
    command: collie device screen --ocr
    result: Items found by OCR show as `(ocr)`.
```

If you are on a release build, the first step and `collie device ui` already work. The rest arrives with the next release.

Related: [Devices](/features/devices), [Emulator](/features/emulator).

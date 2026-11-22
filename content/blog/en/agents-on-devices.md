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

The flow is the one from the [Devices post](/features/devices): the agent reads the UI tree, taps by ref, takes a screenshot. You watch it in the panel.

It works. The problem is cost.

## What we measured

We tried a cheaper agent model on a simple task: navigate between a few screens of an app, from the first screen to a third one, through a button and a menu.

It failed to finish the task the way we wanted. It ended up writing Python scripts to "read" the PNG from `collie device screenshot`.

On an Android emulator we timed one step:

| Step | Time |
|---|---|
| `collie device ui` | 2.2 to 3.3 s (4 samples) |
| `collie device tap --ref` | 0.1 s |

Almost all of a see → act step was the UI dump. And the tree had 49 to 67 lines, most of them layout containers with only an id. An icon-only button showed up as a `Button` with just a resource id, no text. Search for it by text and you find nothing.

Our hypothesis, not yet confirmed: that model does not get images back from tools at all. So the screenshot was useless to it, and the tree was too noisy.

## What changed on main

None of this is in a release yet. The latest tag is v0.1.9. It is merged on `main`.

### A smaller tree

`collie device ui` now returns only useful nodes: the ones with a label, or the clickable ones. `collie device ui --all` gives you the full tree for debugging. Refs stay the same in both, so `e4` is the same node either way.

### Act and look in one call

`tap`, `swipe`, `text`, `key` and `launch` take `--then ui`. The daemon acts, waits, dumps the screen and returns it, with fresh refs. One call per step instead of two.

```sh
collie device tap --ref e3 --then ui
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
- `collie device wait --text "Settings"` waits for text to appear. `--gone` waits for it to vanish. `--stable` waits for two identical dumps. This replaces `sleep` followed by another `ui`.

### Smaller things

- `--timing` on `ui` and `screen` returns time per step (adb, parse, grouping), so we can measure without a stopwatch.
- `collie device launch` opens the app's first LAUNCHER activity instead of using monkey.
- The device panel now draws a frame by device kind (phone, foldable, tablet, iPhone, iPad).

The agent's built-in guidance was updated to teach this loop: look with `device screen`, act with `--then`, screenshot only if nothing else shows the element.

## What is still in progress

Be honest about the edges:

- **Speed.** The dump still takes about 2.7 to 3 s on Android, because the time is in `uiautomator` itself. We tried dumping through `/dev/tty` instead of a file. It saved roughly 5 to 10%, with a lot of noise. A persistent session (a resident helper on Android, something batched on iOS) is under evaluation. Nothing is decided.
- **iOS.** The compact tree and the screen grouping touch the iOS code path. The faster dump and the launch fix are Android-only. We have not measured the new commands on the Simulator the way we did on the emulator.
- **Proof.** We have not published numbers for the cheaper-model task after these changes. Until we do, treat this as "built", not "solved".
- **Limits that are still true.** No audio. `device text` types ASCII only. iOS means Simulator only, not a physical iPhone.

## Where we think this goes

Everything below is a view, not a roadmap. No dates, no promises.

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

With the Collie build from `main`, boot the light emulator and let an agent drive it:

```sh
collie panel open device --serial avd:collie-lite
collie device screen
collie device tap --text "Sign in" --then screen
```

If you are on a release build, the first line and `collie device ui` already work. The rest arrives with the next release.

Related: [Devices](/features/devices), [Emulator](/features/emulator).

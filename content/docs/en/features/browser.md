---
title: "Browser"
description: "A real WebKit page that agents drive with collie browser, on the canvas or headless, up to 8 per terminal."
---

The **Browser** panel is a `WKWebView` that agents drive with `collie browser …`: they read the page as a tree of
element refs, click, type, resize the viewport, emulate dark mode and take screenshots. It is how an agent checks a web
change in a real page instead of guessing from the code. The overview lives at [/features/browser](/features/browser).

There are two ways to get one: a panel on the canvas that you and the agent share, or a test browser a terminal opens for
itself, headless if it wants.

## Test browsers

Any terminal, not only the Shepherd, can open its own browsers, up to **8 per terminal**. Past that the command fails
with `tooMany` ("at most 8 open browsers per terminal; close one with `panel close`").

```tabs
tabs:
  - label: Headless
    lang: sh
    code: |
      collie panel open browser --url http://localhost:3000
  - label: Visible
    lang: sh
    code: |
      collie panel open browser --url http://localhost:3000 --visible
  - label: Notes
    body: "Headless has no canvas node and no dock, but the page really runs: animations, timers, trusted input, screenshots. `--visible` puts a normal panel on the canvas, in the terminal's paddock."
```

Either way the panel is born with a leash to the terminal that opened it. A headless browser is visible in
`collie panel list` (`placement: "headless"`) only to that terminal, the app and a Shepherd leashed to it. It closes
when the terminal is removed or its process exits, and its screenshots go with it. A terminal that is not a Shepherd can
close and move only the browsers it opened. A Shepherd can also ask for `--placement headless`.

## Driving the page

```sh
collie browser navigate http://localhost:3000/login
collie browser snapshot           # compact tree with refs e1, e2, ...
collie browser fill e4 "ana@example.com"
collie browser click e7
collie browser wait --text "Welcome" --timeout 20
collie browser text               # visible text
collie browser console --lines 50
```

Start with `snapshot`: it is the page as refs, the same idea as `collie device ui`. Act on refs, then read again.

| Command | What it does |
|---|---|
| `click <ref>` | A real mouse click when the page is in a window; the reply says `trusted: true` |
| `hover <ref>` | Moves the pointer; `:hover` applies when the page is in a window |
| `fill <ref> <text>` / `type <text>` | Fill an input / type into the focused element (up to 1024 characters) |
| `key <key>` | `Enter`, `Tab`, `Shift+Tab`, `Escape`, `ArrowDown`, `Meta+a`… `Meta+c/x/v` are refused (no clipboard) |
| `scroll` | `--ref` into view, or `--dy` pixels |
| `wait` | `--text` or `--selector`; `--timeout` in seconds, default 10, max 120 |
| `eval <js>` | Evaluate JavaScript in the page |
| `reload [--hard]` | `--hard` revalidates everything with the origin |
| `console` | Recent console lines (default 100, max 500) |

With more than one panel in reach, add `--panel <name>`.

## Viewport, media and screenshots

`resize --width <px> [--height <px>]` (200–4096) sets the page's viewport; the panel keeps its size and shows the page
scaled to fit. `--reset` goes back to filling the panel. `emulate --color-scheme light|dark|system` and
`--reduced-motion reduce|no-preference|system` hold until changed. Reduced motion rewrites the stylesheets it can read;
the reply lists the ones it could not (`uncoveredSheets`, cross-origin) and closed shadow roots.

```sh
collie browser screenshot --full-page --out shots/home.png
collie browser screenshot --ref e12          # crop to one element
collie browser screenshot --clip 0,0,390,800 # x,y,w,h in viewport CSS px
```

`--out` is written by the `collie` process, relative to its current folder; the daemon itself writes only in
`<root>/screens`.

```callout
kind: warning
title: Full-page captures
body: "`--full-page` tiles the document by viewport height, up to 16384 px. Content that grows during the capture (lazy, infinite) is cut at the height measured at the start, and `position: fixed` or `sticky` elements repeat in every tile."
```

## Storage and init scripts

`storage clear [--local] [--session] [--cookies]` empties this panel's data store only (none of the flags: all). An
isolated panel loses all its cookies; a workspace or global panel loses only the current site's. `storage set --key K
--value V` and `get --key K` use `localStorage` and need a page with an origin, not `about:blank`.

`init-script add --js <js>` runs JavaScript at document start, before the page's scripts, on every later load of this
panel (up to 64 KiB, at most 32 scripts). It does not run on the current page and is not saved: it lasts until the panel
closes. `init-script list` and `clear [--id ID]` manage them. Use it to stub a date, a feature flag or a fetch before the
app boots.

## Responsive QA in parallel

Three browsers, one per width, each in the background:

```sh
for w in 360 768 1280; do
  collie panel open browser --name qa-$w --url http://localhost:3000
  collie browser resize --panel qa-$w --width $w --height 800 &
done; wait
collie browser emulate --panel qa-360 --color-scheme dark --reduced-motion reduce
for w in 360 768 1280; do
  collie browser screenshot --panel qa-$w --full-page --out shots/home-$w.png &
done; wait
```

Close them with `collie panel close qa-360`, or leave them: they close when the terminal exits.

## How it connects

- Leashes decide which panels a terminal reaches ([Shepherd and terminals](/docs/concepts/shepherd-and-terminals)).
- Artifacts open in the Browser at `collie-artifact://app/<id>/v<N>/index.html`, and a tester compares
  `collie preview screenshot` with the Browser ([Design and artifacts](/docs/features/design-and-artifacts)).
- Mobile apps use the same "read refs, act, read again" loop in [Devices](/docs/features/devices).
- All flags: [CLI reference](/docs/reference/cli).

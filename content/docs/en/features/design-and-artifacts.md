---
title: "Design and artifacts"
description: "Where agents design first, the Design panel and design systems, and the versioned HTML pages Collie keeps as artifacts."
---

Collie gives agents two places to design a screen before it becomes code, and one place to keep the result. A **Prévia**
(Preview) page is plain HTML/CSS/JS in your project, reloaded live. A **Design** panel is a FigCraft file, edited by you
and by agents in the same session. Either way, the page you keep is an **artifact**: a versioned HTML page with a
thumbnail, a folder and comments.

This page explains how these pieces fit. For the overviews, see [/features/design](/features/design),
[/features/artifacts](/features/artifacts) and [/features/diagram](/features/diagram).

## Where to design first

The workspace preference **"Onde desenhar"** (Preferences) tells the Shepherd where UI work is designed before code:

| Value | What the Shepherd does |
|---|---|
| `artifact` (default) | Writes a page in a Prévia with `collie artifact new prototype <name>` |
| `figcraft` | Designs in a Design panel (FigCraft) |
| `ask` | Asks you once |

The app or a Shepherd on the pasture sets it with `collie design prefer artifact|figcraft|ask`; any terminal reads it
with `collie design prefer`. If a Design panel is already leashed to the Shepherd, that one is used first. The built-in
"Feature com design" herd (Shepherd, designer, interface and tester) follows the preference too
([Herds](/docs/features/herds)).

## Prévia pages

```sh
collie artifact new prototype checkout --title "Checkout"
collie panel open preview --file docs/pages/checkout/index.html
collie preview screenshot --full-page --out shots/checkout.png
```

`collie artifact new deck|dashboard|doc|prototype [name]` writes a starter page in `docs/pages/<name>/index.html` (name in
`a-z0-9-`, up to 48; it never overwrites) and opens a Prévia on it. Tokens come from the active design system, Light and
Dark under `[data-theme]`; with none, the page uses default tokens and `warnings` says so.

- `deck`: 16:9 slides (←/→/space). `dashboard`: indicators, an SVG chart of a `data` array, a table. `doc`: a document
  with a fixed table of contents. `prototype`: a phone app shell with a list, tabs and a sheet.
- Any terminal can open up to 8 Prévias, always on a file inside its project. A change to the page, or to another file
  in its folder, reloads it in under a second and keeps the scroll. The header has "Recarregar" and
  `Página | Claro | Escuro`.
- The page reads only files of its own project folder, no symbolic links out, no dot paths (`.env`, `.git/`,
  `.collie/`), up to 8 MB each. **The network is blocked** (http/https/ws, WebRTC). `collie preview get` returns the
  page's last 20 errors.

### Offline libraries and fonts

Since pages have no network, the app ships pinned libraries served at `collie-lib://lib/<name>@<version>/<file>`: React
18.3.1 and ReactDOM 18.3.1 (UMD), htm 3.1.1, Chart.js 4.4.9 and Lucide 0.469.0. `collie artifact libs` lists them. There
is no Babel in the page, so use `htm` instead of JSX:

```html index.html
<div id="root"></div>
<script src="collie-lib://lib/react@18.3.1/react.production.min.js"></script>
<script src="collie-lib://lib/react-dom@18.3.1/react-dom.production.min.js"></script>
<script src="collie-lib://lib/htm@3.1.1/htm.umd.js"></script>
<script>
  const html = htm.bind(React.createElement);
  ReactDOM.createRoot(document.getElementById("root")).render(html`<h1>Hello</h1>`);
</script>
```

Fonts come from `collie-lib://fonts/css?family=…`. Space Grotesk and DM Mono ship with Collie; `collie font add
"<Family>" [--weights 400,700]` downloads a Google Fonts family once, through the daemon, never the page. Only the font
name and the download go to Google. The preference "Baixar fontes do Google Fonts" turns that off.

## Comments

In a Prévia, you pin a comment on a point or element of the page: **"Comentários (n)"** → **"Fixar comentário"**, click,
write, **"Enviar"**. It goes to the terminal that owns the page (the one that opened the Prévia). Your undelivered
messages enter that terminal's next prompt once, fenced and marked as data, not orders. The agent answers with
`collie comment reply <id> "<text>"` and reads with `collie comment list [--open]`. Only you create and resolve comments;
an agent never does. Comments live in Collie's data, never in the project, so nothing goes to git and a sandboxed agent
cannot forge one. Codex has no prompt hook: it reads with `comment list`.

## The Design panel

The Design panel is FigCraft embedded: the daemon runs a local server (only `127.0.0.1`) and the panel shows its web UI,
while agents edit the same file from the CLI. In the app, **"Abrir painel…" → "Design"**, then pick a file or type a
name under "Novo arquivo…". If the engine is not installed, the panel offers the download.

```sh
collie design files
collie design help node            # figcraft command ids and their params
collie design batch --file steps.json --label "Checkout header"
collie design inspect --depth 2
collie design screenshot --out shots/frame.png
collie design export --format html
```

`run <command> --params '{…}'` runs one FigCraft command; `batch` runs a list as **one undo step, all or nothing**.
Commands never act on your selection: they name layers by id. Files live on the local server, not in git;
`export --format figcraft` gives a `.figcraft` file (refused for a file that uses design systems; export html, css or
react instead).

## Design systems

A design system is a design file with variables (tokens, with modes), styles and components, published in versions. One
can be the workspace's **active** system, and each paddock can have its own. In the app, **"Abrir painel…" → "Design
Systems"**; every change asks for a **reason**, kept in the history and as a decision in [Memory](/docs/features/memory).

```sh
collie design system list
collie design system create brand --reason "new brand"
collie design system use brand --paddock checkout --reason "try the new brand"
collie design system tokens
collie design system bind --variable color/primary --field fill --ids 12,14
```

Swapping the active system rewires that scope's files by name (variables by collection, name and type; styles by name
and type; components by name). What has no match stays on the old system and shows in `unmatched`. `undo` toggles
between the last two systems of a scope. `publish` and `revert` from a terminal need a leash to the system's Design
panel. The swap is not transactional across files: the result comes per file.

## Artifacts

An artifact is an HTML page kept in versions under `<root>/artifacts/<id>/`. Two kinds:

- **Exports.** Every `collie design export --format html [--node <id>]` becomes one, after a post-processor (semantic
  tags, CSS reset, tokens with Light/Dark under `[data-theme]`, inline SVG, basic responsive layout). Exporting the same
  file and node again is the next version. Status: `current`, `stale` (the design changed after the export), `missing`,
  `unknown`.
- **Pages agents hand in.** `collie artifact add <page.html|folder|.zip> [--root <folder>] [--title] [--folder]`
  keeps a page (`.html`/`.htm` up to 8 MB; with `--root`, up to 2000 files and 64 MiB) and starts importing it as an
  editable design screen in the background.

On `add`, known CDN scripts (React, ReactDOM, Chart.js, Lucide, htm on unpkg, jsDelivr or cdnjs) and Google Fonts links
are rewritten to `collie-lib://` in the copy; the original stays intact. What is still remote is listed in
`needsNetwork` and the panel marks it "precisa de rede".

### Import as a design screen

The import opens the page in an invisible web view (1440 px wide by default, `--width 320-3840`), reads the DOM and the
computed styles, and the daemon turns them into one FigCraft batch: a new design file with frames (flex and grid become
auto layout and grid), styled text, images and SVGs. With an active design system, solid colors equal to a system color
variable are bound to it. **The app must be open**, the network is blocked, and it reads up to 3000 elements, as the page loads (no clicks, no scrolling). The
result is an approximation to keep editing, not a pixel copy: pseudo-elements, `transform`, animations, `sticky`,
iframes and video do not come in.

### Folders and decks

- `--folder Cliente/Landing/v2` (up to 3 levels) on `add` and `new`; an agent's default is its lot's name.
  `collie artifact move <id>… --folder <path>` moves several at once, to a folder that exists; creating, renaming and
  removing folders is the app's.
- A slides page (`.slide` or `[data-slide]` elements) exports with the app open:
  `collie artifact export <id> --format pptx|pdf [--out <file>]`. A hidden `<aside>` in a slide becomes the speaker
  note. The `.pptx` loses gradients (first color), shadows, `clip-path`, pseudo-element content and web fonts; the
  `warnings` list says which.

```callout
kind: warning
body: "Every artifact shares the `collie-artifact://app` origin in the Browser, so an agent's HTML can read other local artifacts."
```

## From claude.ai

`collie artifact import-claude <links…>` (up to 50) does not download anything itself: it returns a recipe for a Claude
Code terminal that is already logged in to read each link with its own Artifact tool and hand the files back with
`artifact add --source <link>`. Collie never keeps claude.ai credentials. The same link again is the next version. In the
Artifacts panel, **"Importar do Claude…"** sends the request to a Claude terminal and shows each link waiting, imported
or failed.

## How it connects

- Pages open in the [Browser](/docs/features/browser) at `collie-artifact://app/<id>/v<N>/index.html`.
- The "Feature com design" herd wires designer, interface and tester around a page ([Herds](/docs/features/herds)).
- Each design system change is a decision in [Memory](/docs/features/memory).
- Preview pages are confined to the project like the terminal's [sandbox](/docs/features/sandbox).

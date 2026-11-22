# Blog blocks

Reference for writing blog posts (`content/blog/{en,pt}/<slug>.md`) with component blocks. Source of truth: `src/lib/blocks.ts`. Design: `docs/superpowers/specs/2026-11-22-blog-blocks-design.md`.

## How it works

A block is a fenced code block whose **info string is the block name** and whose **body is YAML**:

````md
```callout
kind: note
body: Text here.
```
````

- Any other info string (`ts`, `sh`, `md content/x.md`) stays a normal code block. An unknown name (`callouts`) also stays a normal code block, so a typo shows up as code, not as an error. Check the rendered page.
- Text fields accept inline Markdown (`` `code` ``, `**bold**`, `[link](/x)`). Raw HTML is escaped.
- An invalid block **fails `npm run build`** with `<locale>/<slug>.md:<line> <block>.<field>: <message>`. `<line>` is the fence line, counted in the body (after the frontmatter). The admin preview shows the same message in place of the block and renders the rest.
- Unknown keys are errors. Strings must not be empty. A YAML string with `:` or a leading `` ` ``, `*`, `[`, `"` needs quotes.
- Write each locale's blocks in that locale. `command` and `code` stay as typed.
- Plain Markdown also works and is styled: tables, `>` quotes (a last line `> — Source` becomes the attribution), images (`![alt](/x.jpg "Caption")`), `---`, links.

## `callout`

For "in progress", "on main, not released" and "this is opinion".

```yaml
kind: status        # note | status | vision | warning  (required)
title: On main, not released   # optional
body: Merged on `main`. The latest tag is v0.1.9.   # required
```

| `kind` | Use for |
|---|---|
| `note` | an aside or a definition |
| `status` | where something stands (released, on main, in progress) |
| `vision` | opinion and direction, clearly marked as such |
| `warning` | a limit or a risk |

## `stats`

2 to 4 big numbers, or one before → after pair. Use one form, not both.

```yaml
items:              # 2–4
  - value: 2.2–3.3 s        # string or number (required)
    label: "`collie device ui`"   # required
    note: 4 samples          # optional
  - value: 0.1 s
    label: "`collie device tap --ref`"
```

```yaml
from: 2.05 s        # string or number (required)
to: 4–120 ms        # string or number (required)
label: Reading the screen   # required
note: One emulator, proof of concept   # optional
```

## `steps`

A numbered sequence. `command` is shown as typed (not Markdown); `result` is inline Markdown, shown after `→`.

```yaml
items:              # at least 1
  - title: Open the panel        # required
    command: collie panel open device --serial avd:collie-lite   # optional
    result: The emulator boots.  # optional
  - title: Read the screen
    command: collie device screen
```

## `compare`

Two columns, "before" and "after". Each side has a `title` and at least one item.

```yaml
before:
  title: Two calls
  items:
    - "`tap --ref e3`"
    - "`ui`"
after:
  title: One call
  items:
    - "`tap --ref e3 --then ui`"
```

## `tabs`

Interactive (keyboard: arrow keys). 2 to 6 tabs. Each tab has a `label` and **exactly one** of `code` (with optional `lang`) or `body` (inline Markdown).

```yaml
tabs:
  - label: Android
    lang: sh
    code: |
      collie device launch com.example.app
  - label: iOS
    lang: sh
    code: |
      collie device launch com.example.app
  - label: Notes
    body: Only commands that work on both belong in a shared tab.
```

## Writing rules for posts

- Say a thing exists only if it is released or on `main` with evidence. Mark main-only work with a `status` callout or the words "on main, not released".
- Mark opinion as opinion (`vision` callout or a "view, not a roadmap" line).
- Use the app's exact labels and commands. Use generic examples ("Settings"), never screen or button names from third-party apps.
- Keep `draft: false` only on posts ready to publish; drafts stay out of the site and sitemap.

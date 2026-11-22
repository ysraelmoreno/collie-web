# Blog Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Styled plain Markdown (table, quote, image) plus five component blocks (`callout`, `stats`, `steps`, `compare`, `tabs`) written as fenced YAML blocks in blog posts.

**Architecture:** `src/lib/blocks.ts` turns a post body into `Segment[]` using the shared `md` (marked) instance's lexer: fenced code whose language is a catalog name becomes a validated block, everything else is re-rendered to HTML. `PostBody` renders segments: HTML via `Prose`, blocks via React components (`tabs` is a client component). Build uses strict mode (invalid block throws → build fails); the admin preview uses lenient mode (invalid block → error segment).

**Tech Stack:** Next 16.4.5 (read `node_modules/next/dist/docs/` before Next APIs), React 19, Tailwind 4, `marked` (installed), `yaml` (new), `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-22-blog-blocks-design.md`
**Design:** collie-web file, page "Blog" (`502511173633`), section "Blocks" (`541165879299`). Frame ids (1440 Dark / 1440 Light / 390 Dark / 390 Light) are in project memory `ade80e4d` (`collie memory get ade80e4d`). Implementers need the design panel `design-3` leashed.

## Global Constraints

- Fence info string = component name; body = YAML. Normal languages (`ts`, `sh`, `md path`) render as today's code block.
- Unknown name → normal code block.
- Strict (build): invalid YAML/schema throws `Error("<file>:<line> <block>.<field>: <message>")`. Lenient (admin preview): same text in an error segment.
- Block text fields accept inline Markdown (`md.parseInline`), rendered at parse time.
- No MDX, no arbitrary HTML/JS from posts. Site stays `output: "export"`.
- `md` is already exported from `src/lib/blog.ts`; only Task 1 edits its renderer.

## Review Focus

1. YAML with a tab or bad indent → strict throws with file + line; lenient shows error, rest of post renders. (Task 2 tests.)
2. `stats` with 1 or 5 items → error naming `stats.items` (2–4). (Task 2 test.)
3. ```` ```ts ```` and ```` ```md content/x.md ```` still render the existing code block with label. (Task 2 test.)
4. Inline Markdown in a block field with `<script>` → escaped, not executed. (Task 2 test.)
5. Line numbers point at the fence line of the bad block (1-based, counted in the body). (Task 2 test.)

---

### Task 1: Prose plain elements (terminal dev-prose)

**Files:** Modify `src/lib/blog.ts` (renderer only), `src/components/blog/Prose.tsx`. Test: `src/lib/blog.test.ts`.

- [ ] **Step 1: Failing tests:** `image with title renders figure`: `renderMarkdown('![a](/x.jpg "Cap")')` contains `<figure data-image>`, `<img src="/x.jpg" alt="a"`, `<figcaption>Cap</figcaption>`. `quote attribution`: `renderMarkdown("> Text\n>\n> — Who")` contains `<cite>Who</cite>` inside the blockquote. `table wrapped`: a GFM table renders inside `<div data-table>`.
- [ ] **Step 2:** `npm test` → those fail.
- [ ] **Step 3:** Add `image`, `blockquote` (last paragraph starting with `— ` becomes `<cite>`) and `table` renderer overrides to `md`. Code-block figures keep their current markup; scope new CSS by `data-image` / `data-table` so they don't collide with `[&_figure]` code styles.
- [ ] **Step 4:** Style per Prose frames: table (surface header, row borders, left-aligned, `code` cells without pill bg, horizontal scroll inside the wrapper on 390), quote cite, figure + caption, hr, link.
- [ ] **Step 5:** `npm test`, `npm run typecheck`, `npm run lint`; compare `/blog/agents-on-devices` table against Prose frames 1440/390 Dark/Light.
- [ ] **Step 6: Commit** `feat(blog): style tables, quotes and images`.

### Task 2: Block parser + validators (terminal dev-blocks)

**Files:** Create `src/lib/blocks.ts` (relative imports only, so `node --test` runs it), `src/lib/blocks.test.ts`. `npm i yaml`.

**Interfaces (produces):**
```ts
type Inline = string; // HTML from md.parseInline (escaped)
type CalloutKind = "note" | "status" | "vision" | "warning";
type Block =
  | { name: "callout"; kind: CalloutKind; title?: Inline; body: Inline }
  | { name: "stats"; items: { value: string; label: Inline; note?: Inline }[] }
  | { name: "stats"; from: string; to: string; label: Inline; note?: Inline }
  | { name: "steps"; items: { title: Inline; command?: string; result?: Inline }[] }
  | { name: "compare"; before: { title: Inline; items: Inline[] }; after: { title: Inline; items: Inline[] } }
  | { name: "tabs"; tabs: { label: string; lang?: string; code?: string; body?: Inline }[] };
type Segment = { kind: "html"; html: string } | { kind: "block"; block: Block } | { kind: "error"; message: string; line: number };
const BLOCK_NAMES: readonly string[];
function toSegments(body: string, opts: { strict: boolean; file?: string }): Segment[];
```
Field rules from the spec: `stats.items` 2–4; `steps.items` ≥1; `tabs.tabs` 2–6, each with exactly one of `code`/`body`; `compare` items ≥1 each; unknown keys → error.

- [ ] **Step 1: Failing tests** in `src/lib/blocks.test.ts`: `plain markdown is one html segment`; `normal code fence unchanged` (`ts` and `md content/x.md` produce html equal to `renderMarkdown` of the same text); `unknown name stays code`; `callout parses` (kind + inline `**b**` → `<strong>`); `stats items 2–4` (1 and 5 items → strict throws matching `/stats\.items/`); `stats from/to`; `tabs needs code or body`; `bad yaml strict throws with line` (body with 3 lines of text then a broken block → message matches `/:4 /`); `lenient yields error segment and keeps rest`; `inline html escaped` (`<script>` in a callout body → no `<script` in output).
- [ ] **Step 2:** `npm test` → fail.
- [ ] **Step 3:** Implement with `md.lexer(body)`; walk tokens, accumulate non-block tokens and flush with `md.parser`; line = 1 + newlines in the `raw` of preceding tokens. Parse YAML with `yaml`'s `parse`; escape inline input before `md.parseInline` (or use a renderer that escapes HTML tokens).
- [ ] **Step 4:** `npm test`, typecheck, lint pass.
- [ ] **Step 5: Commit** `feat(blog): markdown block parser and validators`.

### Task 3: Block components + wiring (terminal dev-blocks, after Task 2; after Task 1 is committed for Prose)

**Files:** Create `src/components/blog/blocks/{Callout,Stats,Steps,Compare,Tabs,BlockError}.tsx`, `src/components/blog/PostBody.tsx`. Modify `src/components/blog/BlogPost.tsx`, `src/app/(en)/admin/actions.ts` (`previewMarkdown` returns `Segment[]`, lenient), `src/components/admin/Editor.tsx` (render `PostBody`).

**Interfaces:** `<PostBody segments={Segment[]} />` — client-safe (imports no `node:` modules). `Tabs` is `"use client"`, keyboard accessible (arrow keys, `role="tablist"`). BlogPost calls `toSegments(post.body, { strict: true, file: "<locale>/<slug>.md" })`.

- [ ] **Step 1:** Components per frames (1440/390, Dark/Light). `BlockError` per the error frame (admin only).
- [ ] **Step 2:** Wire BlogPost and admin preview. Delete `renderMarkdown` callers that no longer need it (keep the function if tests use it).
- [ ] **Step 3:** Temp post with all five blocks + one broken block: admin preview shows the error inline; `npm run build` fails with `file:line block.field`. Fix the block → build passes. Delete the temp post.
- [ ] **Step 4:** Compare each block with its frames in the browser panel (production preview on its own port; don't fight another terminal's `next dev`).
- [ ] **Step 5: Commit** `feat(blog): block components in posts and admin preview`.

### Task 4: Catalog doc + rewrite the devices post (terminal writer, after Task 3)

**Files:** Create `docs/blog-blocks.md` (one example per block, field rules). Modify `content/blog/{en,pt}/agents-on-devices.md`.

- [ ] **Step 1:** Write the catalog doc from `src/lib/blocks.ts`.
- [ ] **Step 2:** Rewrite the post with `stats` (timing), `callout` (in progress / vision), `tabs` where Android/iOS differ, `steps` for "Try it". Update facts that changed on main since (Android `collie-helper.apk`, OCR, `wait --stable` — see `src/i18n/changelog.ts` "On main"), marked as on main, not released. Keep `draft: false`.
- [ ] **Step 3:** `npm run build` passes; check both locales in the browser.
- [ ] **Step 4: Commit** `docs(blog): blocks catalog and devices post with blocks`.

### Task 5: QA (dev-blocks)

- [ ] `npm test && npm run typecheck && npm run lint && npm run build`; screenshots of the post and admin preview 1440/390 Dark/Light into `docs/qa/blog/blocks/`, taken after the last UI commit. Commit `docs(qa): blog blocks screenshots`.

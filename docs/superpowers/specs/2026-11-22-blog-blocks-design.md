# Blog blocks (Markdown + components) — design

## Intent
Posts look like plain text where they should be structured (e.g. the timing table in "Agents that can see the phone"). Owner wants richer, partly interactive posts that both he and the writer agent can author, without leaving Markdown.

## Goals
- Plain Markdown elements (table, quote, image, hr) styled to the DS in `Prose`.
- A small catalog of components written as fenced blocks inside the `.md`.
- Same rendering on the site and in the admin preview.
- Writer agent can author blocks from a short catalog reference.

## Non-goals
- MDX or JSX in posts. Arbitrary HTML/JS from posts.
- A block editor in the admin (blocks are typed as text).
- Charts library (add later if a post needs it).

## Anti-goals
- A malformed block silently shipping broken. Build must fail on an invalid block.
- Posts that are unreadable outside the site (GitHub, plain editor).

## Approaches
- **Markdown + fenced blocks (picked).** ` ```<component> ` with a YAML body, validated per component, rendered by a `marked` extension into React components. Readable anywhere, LLM-friendly, unknown blocks degrade to code.
- MDX. Full power, but posts become code: one bad tag breaks the build, admin preview needs MDX compile. Rejected.
- Own JSON block format. Great validation, bad to write and review by hand, needs a block editor. Rejected.

## Decided
- Syntax: fence info string = component name; body = YAML. Code blocks with a normal language (`ts`, `sh`, `md path`) keep working as today.
- Unknown component name → rendered as a normal code block.
- Invalid YAML or schema → build error naming file, line and field; admin preview shows the same error inline instead of the block.
- Text fields inside blocks accept inline Markdown (`code`, **bold**, links).
- Interactive blocks are client components; site stays a static export.

## Catalog v1 (proposed)
1. `callout` — `kind: note | status | vision | warning`, optional `title`, `body`. For "in progress" and "this is opinion" sections.
2. `stats` — 2–4 big numbers: `items: [{value, label, note?}]`, optional `from`/`to` pair to show a before → after.
3. `steps` — numbered sequence: `items: [{title, command?, result?}]`.
4. `compare` — two columns: `before: {title, items[]}`, `after: {title, items[]}`.
5. `tabs` (interactive) — `tabs: [{label, lang?, code? | body?}]`, e.g. Android | iOS commands.

## Builder's calls
- YAML parser: add `yaml` (small, no deps).
- Schemas: hand-written validators per component (no zod) unless they grow.
- Catalog reference for the writer: `docs/blog-blocks.md` with one example per block.

## Design (designer, before code)
- Prose: table, quote, image + caption, hr, inline link — 1440/390, Dark/Light.
- Each catalog block — 1440/390, Dark/Light, plus the inline error state (admin).
- Page "Blog" in the collie-web file, next to the existing post frames.

## Follow-up
- Rewrite "Agents that can see the phone" with `stats` (the timing), `callout` (in progress / vision) and `tabs` where Android/iOS differ.

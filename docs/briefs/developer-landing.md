# Brief — Developer, phase 2: build the landing

The owner APPROVED the landing screen. Build it in the existing Next.js project (your setup from phase 1).

## Source of truth (design panel `design-1`, file `collie-web`, now leashed to you)
- Page `Landing`:
  - 34359738376 EN 1440 · Dark   / 34359738929 EN 1440 · Light
  - 34359738608 PT-BR 1440 · Dark / 34359739161 PT-BR 1440 · Light
  - 34359738840 EN mobile 390 · Dark / 34359739393 · Light
- Page `Brand`: logo, tokens, type scale, components.
- Read it with `collie design inspect --panel design-1 --node <id> --depth N`, `collie design screenshot --panel design-1 --node <id>`, and `collie design export --panel design-1 --format react|html --node <id>` as reference only (do not paste generated code; write clean components).
- Tokens: `collie design run variable.export --panel design-1 --params '{"format":"css"}'` → replace `src/app/tokens.css` (keep the names Tailwind reads, or update the Tailwind theme). Dark is default; Light applies via `@media (prefers-color-scheme: light)`.
- figcraft uses Inter/Menlo stand-ins: code uses Manrope 500/800 and DM Mono (already set up).
- Also read the spec: docs/superpowers/specs/2026-10-22-collie-landing-design.md, and AGENTS.md (Next 16: read node_modules/next/dist/docs before writing code).

## Build
- Sections in order: Nav, Hero, Pain strip ("Today"), three pillars (Design / Memory / Devices), How it works, Build it, Final CTA, Footer. Copy from the frames into `src/i18n/en.ts` and `pt.ts` — no hard-coded strings in components.
- Canvas illustrations in HTML/CSS/SVG, `aria-hidden`. Below 1024px use a simplified illustration (the full one becomes ~6px text). Motion: slow dashed-leash drift + one-time typing in the Shepherd terminal; none under `prefers-reduced-motion`.
- PT hero H1: it wraps to 4 lines at 1440 in the design. Use a fluid size (`clamp`) so it fits 3 lines on desktop; do not change the copy.
- Build it block: copyable commands with a Copy button (client component, small). Add one muted optional line: the Design panel also needs `scripts/build-figcraft.sh` (~10 min).
- Links: GitHub = https://github.com/ysraelmoreno/collie ; "Read the docs" = the README on GitHub. Nav anchors to section ids. No "Download", no invented numbers.
- Accessible: landmarks, one h1, real buttons/links, visible focus, AA contrast in both themes; no horizontal scroll at 360px.

## Verify before reporting
- `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` all green.
- Run the site (`npm run preview` or `npx serve out`), open it with `collie panel`? No — ask me (Shepherd) for a browser panel if you need one; otherwise compare by screenshots you can take yourself.
- Small Conventional Commits, each ending with:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  No push.

## Report
What you built, commands + results, the local URL to preview, anything that differs from the frames and why.

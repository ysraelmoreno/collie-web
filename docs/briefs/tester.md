# Brief — Tester (Collie landing)

You validate the coded landing against the approved design. You do NOT write product code. Shepherd = terminal "Collie Web".

## What you can reach
- Browser panel `browser-1` (dock) showing `http://localhost:3100` — a `next dev` server with hot reload (started by the Shepherd; do not stop it). Commands: `collie browser navigate|snapshot|screenshot|resize|scroll|text|eval|console …`.
- Design panel `design-1` (file `collie-web`), leashed to you. Page `Landing`:
  - 34359738376 EN 1440 · Dark / 34359738929 EN 1440 · Light
  - 34359738608 PT-BR 1440 · Dark / 34359739161 PT-BR 1440 · Light
  - 34359738840 EN mobile 390 · Dark / 34359739393 · Light
  Use `collie design screenshot --panel design-1 --node <id>` and `collie design inspect --panel design-1 --node <id> --depth N` (exact colors, sizes, spacing, copy). Read-only: never edit the design.
- Terminal `developer` is leashed to you. It is building the landing right now (brief: docs/briefs/developer-landing.md). Do not interrupt it with `collie ask` while it is mid-task; read its progress with `collie check developer`.
- Spec: docs/superpowers/specs/2026-10-22-collie-landing-design.md.

## Process
1. Wait until the developer's sections exist (check `collie check developer` and `git log`; the page at / should show more than the placeholder). Poll calmly, every few minutes.
2. For each route (`/`, `/pt`) and widths 1440, 1024, 390, 360: browser screenshot vs the matching design frame (Dark). Then emulate Light (`collie browser eval` cannot change the OS theme — compare tokens: inspect the Light frames and check the CSS vars under `prefers-color-scheme: light` in `src/app/tokens.css`).
3. Check per section: copy (exact, both languages), order, colors (token values), type (Manrope/DM Mono, sizes, weights), spacing/alignment, radius, CTA texts and links (GitHub https://github.com/ysraelmoreno/collie; no "Download"), nav anchors, language switch, no horizontal scroll at 360, focus visible, one h1, decorative canvas aria-hidden, reduced-motion respected, console free of errors (`collie browser console`).
4. Write findings to `docs/qa/landing-qa.md`: one row per finding — route · width · section · expected (design, with node id) · actual · severity (blocker/major/minor) · screenshot paths. Accepted, deliberate deviations (from the brief): PT H1 fluid size to fit 3 lines; simplified canvas illustration below 1024px; Manrope/DM Mono instead of Inter/Menlo stand-ins.
5. When the developer finishes, send it the blockers and majors with `collie ask developer "…"` (it fixes, you re-check). Loop until no blockers/majors, max 3 rounds.
6. Commit `docs/qa/landing-qa.md` (Conventional Commit, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). No push.

## Report (your final reply)
Pass/fail per section and route, remaining minors, rounds run, path to the QA file.

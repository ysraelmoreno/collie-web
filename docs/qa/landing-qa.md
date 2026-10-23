# Landing QA — Collie

Date: 2026-10-23 · Tester (Claude) · Build: `npm run preview` static export at http://localhost:4173 (commit `57d4020`).

Design source: panel `design-1`, file `collie-web`, page `Landing`
(EN 1440 Dark `34359738376` / Light `34359738929`, PT-BR 1440 Dark `34359738608` / Light `34359739161`,
EN 390 Dark `34359738840` / Light `34359739393`).

## Method

- Headless Chromium (Playwright 1.60) at 1440, 1024, 390, 360 for `/` and `/pt`, in both `prefers-color-scheme: dark` and
  `light` (16 runs). The `browser-1` panel was not used for widths: its viewport does not follow `collie browser resize`.
- Copy: every text node of the exported design frames (EN and PT) searched in the rendered DOM.
- Type/colour: computed styles of 16 key elements vs the CSS of the design export; token values vs `variable.export`.
- Also checked: section order, nav anchors, CTA links, language switch, landmarks, headings, focus outline (Tab ×6),
  `aria-hidden` on canvases, horizontal scroll, console errors, `prefers-reduced-motion`, `<html lang>`, hreflang, canonical.
- Screenshots: `docs/qa/shots/` (`design/` = frames, `r1/` = round 1 full pages, `cmp/` = side by side, design left).
  Only the ones cited in Findings are committed (~11 MB for the full set).

## Result — round 1: no blockers, no majors

| Section | `/` (EN) | `/pt` (PT-BR) |
|---|---|---|
| Nav | pass | pass |
| Hero | pass | pass (H1 3 lines at 1440, accepted) |
| Pain strip ("Today") | pass | pass |
| Pillars (Design / Memory / Devices) | pass | pass |
| How it works | pass | pass |
| Build it | pass (minor at ≤390) | pass (minor at ≤390) |
| Final CTA | pass | pass |
| Footer | pass | pass |

Global checks, all routes × widths × themes:

- Copy: 0 strings missing vs the frames, both languages. No "Download"/"Baixar".
- Tokens: Dark and Light CSS vars equal the design system export (`--color-accent` #6E9BFF / #2F6BFF, bg, fg, surface, muted, on-accent…).
- Fonts: Manrope (UI), DM Mono (code). Sizes/line-heights match the design (H2 44/52, body 18/28, eyebrow 12/16 +0.12em,
  command 13/22, step title 24/32, buttons 16/22, nav/footer 15/22).
- Links: GitHub CTAs and nav button → `https://github.com/ysraelmoreno/collie`; "Read the docs" → `…/collie#readme`;
  nav anchors `#product #design #memory #devices` exist; EN → `/`, PT → `/pt`, active one has `aria-current="page"`.
- One `h1` per page; landmarks header / nav[Main] / nav[Language] / main / footer; headings in order.
- Focus visible: 2px solid accent outline on every tabbed element.
- No horizontal scroll at 360 (scrollWidth = viewport) on both routes.
- Canvas illustrations `aria-hidden="true"`; no decorative terminal text exposed to AT.
- `prefers-reduced-motion: reduce`: no running animations (normal: `leash-drift 4s`, one-time `type`).
- Console: no errors or warnings.
- `<html lang>` `en` / `pt-BR`; hreflang en, pt-BR, x-default; canonical per route.

## Findings

| # | Route | Width | Section | Expected (design) | Actual | Severity | Screenshot |
|---|---|---|---|---|---|---|---|
| 1 | `/`, `/pt` | 360, 390 | Build it | Commands fully readable (frame `34359738376`, desktop only) | Long lines (`git clone https://github.com/…`, `cp -R build/Collie.app /Applications/`) clipped; the `pre` scrolls horizontally (`overflow-x: auto`) but has no `tabindex`, so keyboard users on older browsers cannot scroll it. Copy button works. | minor | `cmp/pt-360-dark-strip.png` |
| 2 | `/`, `/pt` | 1024 | Hero, Pillars | Spec: hero stacks *below* 1024px | Stacks at 1024–1279 (developer's choice); canvases stay at full size and left-aligned, leaving ~1/3 of the row empty on the right (hero canvas 660px in a 896px column). Looks unbalanced, not broken. | minor | `cmp/en-1024-dark-strip.png` |
| 3 | `/` | 1440 | Hero | H1 64px / 68px (`34359738376`) | 62.75px / 67.1px — the fluid `clamp` meant for PT also shrinks EN slightly. | minor | `r1/en-1440-dark.png` |
| 4 | `/`, `/pt` | 360 | Pillar Design | Six swatches in one row (`34359738840`) | Sixth swatch wraps to a second row. | minor | `cmp/pt-360-dark-strip.png` |

## Accepted deviations (not findings)

From the brief: PT H1 fluid size to fit 3 lines; simplified canvas illustration below 1024px; Manrope/DM Mono instead of
Inter/Menlo. From the developer's report (agreed): Light uses accent-soft for accent-coloured text (contrast); Manrope
800/700/500 instead of Inter 700/600/400; memory lines 12px; EN|PT switch kept on mobile (spec asks for it visible);
canvases zoomed 0.8 at 1280–1439. The 390 mobile frame shows Hero → Design pillar; the code also keeps "Today" between them,
matching desktop order and the spec.

Note: Playwright full-page captures show the hero Shepherd terminal empty (the capture restarts the one-time typing). In a
normal viewport all five lines are typed within ~4s — verified by DOM width over time; not a bug.

## Rounds

1 validation round. No blockers or majors, so no fix round was sent to the developer.

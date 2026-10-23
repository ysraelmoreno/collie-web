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

1 validation round. No blockers or majors; the developer fixed the four minors anyway (see Round 2).

## Round 2

Build: commits `033ed4c`, `0833aba` (static preview on 4173). Same Playwright run, now 1440 / 1280 / 1024 / 390 / 360 ×
`/`, `/pt` × Dark / Light (20 runs), plus focus on every interactive element.

### Round 1 findings

| # | Result | Evidence |
|---|---|---|
| 1 Build it clipped at ≤390 | **fixed.** The `pre` has `tabIndex=0`, `role="region"`, a localized label ("Build commands" / "Comandos de build") and an inset accent focus ring (offset −2px); it scrolls by keyboard. | report.json `extra.pre` |
| 2 1024 stacked, canvases left-aligned | **fixed.** Hero and pillars are side by side from 1024: canvases zoom 0.6 at 1024–1279, 0.8 at 1280–1439, 1 at 1440. Layout balanced, nothing stacks above 1024. | `cmp/r2-en-1024-dark-hero.png`, `cmp/r2-en-1024-dark-pillar.png` |
| 3 EN H1 62.75px at 1440 | **fixed.** 64px / 68.48px, 3 lines. PT 56.4px, 3 lines (accepted fluid size). | report.json `extra.h1` |
| 4 Swatches wrap at 360 | **fixed.** 6 swatches in 1 row at every width. | report.json `extra.swatches` |

### Asked to check

- **1024 canvas at zoom 0.6:** illustration text renders at ~7.2px (9.6px at 1280). It is `aria-hidden` and decorative; the
  cards, leashes and colours still read clearly, and the trade (no empty third of the row) is worth it. Accepted, not a finding.
- **`:focus-visible` in `@layer base`:** all interactive elements tabbed in order (16 at ≥768: logo, 4 anchors, EN, PT,
  GitHub, 2 hero CTAs, Copy, commands region, 2 final CTAs, footer logo, footer GitHub; 12 at 360 where anchors are hidden).
  Every one shows a 2px solid accent outline (#6E9BFF dark, #2F6BFF light), offset 2px (−2px on the commands region).
  Note: buttons use `transition-colors`, which in Tailwind v4 also animates `outline-color`, so the ring fades in over 150ms
  from the text colour. Not a defect (final state verified after 250ms), just why an instant computed-style read shows
  `on-accent`. Evidence: `r2/focus-cta-dark.png`.

### Regression

No regressions. Copy 0 missing (EN, PT), one `h1`, no horizontal scroll (360–1440), canvases `aria-hidden`, no console
errors or warnings, reduced motion stops all animation, tokens unchanged.

### Rounds

2 rounds. No blockers, majors or minors open.

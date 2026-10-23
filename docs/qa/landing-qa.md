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

## Round 3 — ThemeToggle

Build: commit `6d80462`, `npm run build` then the static preview on 4173. Design: DS v4, set `64424509483`
(Theme=Dark|Light × State=Default|Hover|Focus) and the Nav `actions` frames of the six Landing screens
(desktop `34359738392`, `34359738945`, `34359738624`, `34359739177`: EN|PT · 12 · toggle · 12 · GitHub; mobile
`64424509539`, `64424509555`: toggle · 8 · GitHub).

Method: Playwright 1.60 headless, 360 / 390 / 768 / 1024 / 1440 × `/`, `/pt` × system Dark / Light (20 runs), plus
behaviour, first-paint and contrast scripts. The Collie browser panel was not used: its viewport stays at the dock width,
it cannot emulate `prefers-color-scheme`, and no panel was open during this round.

### 1. Visual — pass

- 40×40, `border-radius: 12px`, one 20px SVG with `stroke-width: 1.75`, round caps. Sun in Dark, moon in Light, all 20 runs.
- Default: icon `muted` (#8C95B8 / #646B86), no fill. Hover: icon `fg`, fill `surface-2` (#262A33 / #ECE9E2).
  Focus (keyboard): 2px solid `accent` outline, offset 0 (= design "outside stroke"), icon `fg`. A mouse click does not
  show the ring (`:focus-visible` false).
- Position: between EN|PT and GitHub; gaps 12 / 12 at ≥1024, 8 / 8 below 640. Evidence: `r3/nav-all.png`, `r3/focus-*.png`.

### 2. Behaviour — pass

- No saved choice: follows `prefers-color-scheme`, live (system flip updates colours, icon and label).
- Click toggles and stores `localStorage.theme`; reload keeps it; a system change does not override a saved choice;
  the choice carries across `/` ↔ `/pt`; clearing storage goes back to the system theme.
- Keyboard: Enter and Space toggle.
- aria-label follows the state: EN "Switch to light theme" / "Switch to dark theme", PT "Mudar para tema claro" /
  "Mudar para tema escuro".
- No flash: with the saved choice opposite to the system and JS delayed 300ms, `body` already has the saved theme's
  background at DOMContentLoaded and on the first animation frame (inline script in `<head>`, before `<body>`).

### 3. Light contrast (AA)

117 text nodes per page in Light (explicit choice and system, EN and PT). Every non-decorative text passes except one:

- `text-secondary` #5A5D66 on bg 5.88; `muted` #646B86 on bg 4.71, on surface 5.26; `accent-soft` #4A5BD6 on bg 4.99,
  on memory 4.59, on surface-2 4.61; `success` #0F7A55 on surface 5.34. Non-text: toggle icon 4.71, focus ring
  (accent on bg) 4.02 — both ≥ 3:1.
- **`on-accent` #FFFFFF on `accent` #2F6BFF = 4.499:1** — the primary CTA labels ("Get started on GitHub" /
  "Começar no GitHub", hero and final CTA, 16px / 700, not large text) are just under 4.5:1.
- Below 4.5 but inside `aria-hidden` illustrations (incidental text, exempt): panel tags `muted` on `surface-2` 4.34;
  the canvas "Copy" `accent` on `surface-2` 3.71; the EN|PT separator (`aria-hidden`).

Dark (explicit choice over a Light system) has no failures; the lowest real pair is `muted` on `surface-2` 4.86.

### 4. Nav regressions — pass

- Section links only from 1024; wordmark `zoom: 0.85` and GitHub padding 16px below 640 (22px from 640).
- One row, no overlap, no horizontal scroll at every width / theme / locale; no console errors.

### Findings

| # | Route | Width | Section | Expected (design) | Actual | Severity | Screenshot |
|---|---|---|---|---|---|---|---|
| 5 | `/`, `/pt` | all | Hero + Final CTA, Light | AA 4.5:1 for 16px/700 labels (DS v3 `on-accent` was added for this) | White on #2F6BFF = 4.499:1. Fails AA by a hair, now that Light is user-selectable. Fix in the DS token: Light accent #2E6AFE gives 4.56 (#2D69FD 4.62), visually identical; accent stays ≥ 3:1 for the focus ring. | major | `r3/full-en-explicit.png` |
| 6 | `/`, `/pt` | 768 | Nav | One gap value per breakpoint (12 desktop, 8 mobile) | EN\|PT → toggle 8px, toggle → GitHub 12px (inner `md:gap-3`, outer `lg:gap-3`). Uneven at 640–1023. | minor | `r3/nav-all.png` |

Notes (not findings): before hydration the static HTML always says "Switch to light theme" / "Mudar para tema claro";
React fixes it on hydration, so a light-theme visitor's screen reader could hear the wrong label for a few ms. Light
hover fill in the set screenshot renders dark because the set sits in a Dark-mode frame; the token (`surface-2`) is right.

### Rounds

Round 3: 1 major (#5, design-system token), 1 minor (#6). Not yet sent to the developer/designer.

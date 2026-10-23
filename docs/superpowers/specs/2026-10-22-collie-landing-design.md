# Collie landing page — design

Date: 2026-10-22 · Owner: Ysrael Moreno

## Intent

Collie (https://github.com/ysraelmoreno/collie, MIT) is a macOS 15 app + daemon (`collied`) + CLI (`collie`) that puts AI agent
terminals (Claude Code, Codex) on one infinite canvas next to plugin panels: Design (embedded figcraft), Device (iOS Simulator /
Android), Browser, Artifacts, Work log. Agents share project memory, edit the same versioned design system and drive emulators.

The landing page exists so a visitor leaves thinking **"I need this."**

**Audience:** solo devs and product teams who already use coding agents daily.

**The pain the page names (from the owner):**
1. *Scattered design* — every Claude conversation produces a loose artifact; no single source, no tokens, no versions.
2. *No memory between agents* — each agent starts from zero; you become the glue re-explaining context.

**Promise:** one canvas where agents, design and devices share the same context.

## Goals

- First fold makes the product legible: headline + a stylised canvas showing a Shepherd terminal, a Design panel, a Simulator and
  a Memory card connected by dashed leashes (approved mockup "A — Canvas escuro", file `collie-landing` in the Collie design panel).
- Name the pain, then show the three pillars, then how it works, then a CTA.
- Two languages: English and Brazilian Portuguese, same content.
- Built through the Collie design process: design system in Collie → full screen in figcraft using it → Next.js code from it.

## Non-goals

- Not documentation. Install details beyond the build commands stay in the README.
- No blog, pricing, auth, analytics, newsletter, or CMS.
- No downloadable binary: the repo has **no releases** today.

## Anti-goals (failure even if it "works")

- Claiming a download that does not exist ("Download for macOS").
- Generic AI-SaaS look (purple gradients, glassy blobs). It must look like the app: calm dark ink, off-white, one blue accent.
- Inventing features or numbers (stars, users, testimonials).

## Page structure (approved)

1. **Nav:** `collie` wordmark (herd mark from `Resources/AppIcon.svg`), anchors Product / Design / Memory / Devices, language
   switch (EN | PT), GitHub button.
2. **Hero (direction A, dark):** eyebrow `OPEN SOURCE · macOS 15`; H1 "One canvas. All your agents. One shared context." /
   "Um canvas. Todos os seus agentes. Um só contexto."; subcopy; primary CTA **"Get started on GitHub"** / "Começar no GitHub"
   (links to the repo), secondary "Read the docs" (README anchor); a mono command line hint. Right side: the canvas illustration.
   Motion: dashed leashes drift slowly; Shepherd terminal types its lines once. Respect `prefers-reduced-motion`.
3. **Pain strip:** the "Today" collage from mockup B — tilted loose cards (`artifact_v3.html`, `hero-final-FINAL.fig`,
   `chat #12: "remember the token?"`, `terminal 4 — codex`, `simulator.app`) with one line of copy.
4. **Three pillars**, each a text block + a crop of the canvas:
   - **Design, centralised:** embedded figcraft; versioned design system whose tokens agents read (`collie design system tokens`);
     HTML/React export becomes a versioned artifact.
   - **Shared memory:** decisions and closed work become project memory; any agent searches it before re-reading code.
   - **Live devices:** iOS Simulator / Android on the canvas; agents tap, screenshot, read logcat.
5. **How it works:** 3 steps — Shepherd (lead agent that summons and leashes others), Paddocks (isolated worktree/branch per task),
   Herds (saved teams you re-apply).
6. **Build it:** copyable block: `git clone …`, `swift build`, `scripts/bundle-app.sh`, copy `build/Collie.app` to
   `/Applications` (README warns it must live there).
7. **Final CTA + footer:** MIT, macOS 15, GitHub link.

## Design system (Collie)

To be created with `collie design system create collie-web` and published (not done yet). Mockups A and B already exist in design file `collie-landing` (panel `design-2`); A is approved. Contents:

- **Collection `Tokens`, modes Dark (default) and Light.** Colours from the app (`Sources/CollieTheme/Palette.swift`, icon):
  ink `#15171C`, paper `#F4F2ED`, accent `#6E9BFF`, accent-soft `#93A4FF`, muted `#8C95B8`, surface `#1F232B`,
  surface-2 `#262A33`, border `#2E323B`, memory `#1E2647` / `#262E52`, success `#6EE7B7`, warn `#A14A06`.
  Numbers: radius 8/12/20, spacing scale 4–96.
- **Text styles:** Display, H2, H3, Body, Small, Mono, Eyebrow (mono, uppercase, tracked).
- **Components:** Button (primary/secondary), Panel card (title bar + tag), Memory card, Step, Code block, Nav.
- **Identity (owner's decision, 2026-10-22):** logo = **Herd** mark (C arc + 3 dots + accent dot, `brand-source/project/Herd.dc.html`,
  same as `Resources/AppIcon.svg`); wordmark `collie` in Manrope 800, letter-spacing -0.03em. Accent `#6E9BFF` on dark,
  `#2F6BFF` on light. Source canvas: https://claude.ai/artifact/FQ5E12kYdzn8svAkDeoYsL (local copy in `brand-source/`).
- Fonts: **Manrope** (UI, 500/800) and DM Mono (code). figcraft lacks them, so the design file may use Inter/Menlo as
  stand-ins; the code uses the real fonts.

**Approval gate (owner's decision):** the full `Landing` screen in figcraft is shown to the owner and approved before any Next.js code is written.

Then a page `Landing` in `collie-landing` (1440 wide, desktop) built from those components and variables; a 390-wide mobile
frame for the hero and one pillar.

## Code — how it gets made

- Next.js (App Router) + TypeScript + Tailwind CSS, static export-friendly (no server features needed).
- Tokens from the design system exported (`variable.export --format css`) into `app/tokens.css` as CSS custom properties; Tailwind
  theme reads those variables.
- Fonts via `next/font/google` (Manrope, DM Mono).
- i18n: `/` serves English, `/pt` serves Brazilian Portuguese; one dictionary file per language; no auto-detection, a visible EN | PT switch *(my call: works with static export, no redirect needed)*.
  `<html lang>` set per route; `hreflang` alternates.
- Dark theme only on the page *(my call: the brand is dark-first; Light mode exists in the design system for the future)*.
- Canvas illustration built in HTML/CSS/SVG (not an image) so it stays crisp and translatable.
- Responsive: hero stacks below 1024px; canvas illustration scales down; no horizontal scroll at 360px.
- Accessibility: semantic landmarks, decorative canvas `aria-hidden`, visible focus, contrast AA.
- Site URL comes from one config value (`NEXT_PUBLIC_SITE_URL`, placeholder `https://collie.dev`) used for canonical, `hreflang`, Open Graph and sitemap *(my call: domain not decided yet)*.
- Project lives in `/Users/ysraelmoreno/Documents/codes/collie-web`.

## Left to the builder

- Exact component breakdown and file layout.
- Copy polish within the meanings above (both languages).
- Animation details within "slow, calm, reduced-motion safe".
- Deploy target (not in scope; static output works anywhere).

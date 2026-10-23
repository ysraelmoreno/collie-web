# Brief — Developer (Collie landing)

You are the Developer for the Collie landing page. Shepherd = terminal "Collie Web". Scope right now: **project setup and configuration only.** The owner must approve the figcraft Landing screen (Designer is building it) before page sections are coded, so do not build the landing sections yet.

## Read first
- Spec: docs/superpowers/specs/2026-10-22-collie-landing-design.md (section "Code — how it gets made").
- Identity: brand-source/project/Herd.dc.html (logo = Herd mark), Manrope + DM Mono.

## Do
1. `git init` in /Users/ysraelmoreno/Documents/codes/collie-web (keep `docs/`, `brand-source/`). Branch `main`.
2. Scaffold Next.js (latest stable, App Router, TypeScript, Tailwind, ESLint, `src/` dir, npm). The folder is not empty: scaffold in a temp dir and move files in, or use flags that allow it; do not delete docs/ or brand-source/.
3. Config:
   - Static-export friendly (`output: "export"` in next.config).
   - i18n by route: `/` = English, `/pt` = Brazilian Portuguese. Dictionaries `src/i18n/en.ts` and `src/i18n/pt.ts` with a shared type; small helper to pick one. Correct `<html lang>` per route, `hreflang` alternates, canonical.
   - `NEXT_PUBLIC_SITE_URL` (placeholder `https://collie.dev`) in `.env.example`, used by metadata, Open Graph, `sitemap.ts`, `robots.ts`.
   - Fonts: `next/font/google` Manrope (500, 800) and DM Mono, exposed as CSS variables.
   - Tokens: `src/app/tokens.css` with CSS custom properties (dark default) from the spec's palette; Tailwind theme reads them. When the Designer publishes the `collie-web` design system, tokens will be re-exported from it (`variable.export --format css`) — leave a note where they go.
   - Logo: `src/components/Logo.tsx` (inline SVG Herd mark, `currentColor` + accent var) and favicon/app icon from it (`src/app/icon.svg`).
   - Placeholder pages for `/` and `/pt` showing only the logo, wordmark and the language switch, so the setup is verifiable.
   - Prettier, `npm run lint`, `npm run typecheck`, `npm run build` all green. Short README with scripts.
4. Commit in small logical commits (Conventional Commits). End each commit message with:
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Do not push; there is no remote.

## Reporting
- Save setup decisions with `collie memory save` (kind decision / map).
- Reply when done with: what's configured, commands run with their results, anything skipped.

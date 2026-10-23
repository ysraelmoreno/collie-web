# collie-web

Landing page for [Collie](https://github.com/ysraelmoreno/collie). Next.js (App Router) + TypeScript + Tailwind CSS, built as a static export (`out/`).

## Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Dev server on http://localhost:3000            |
| `npm run build`     | Static export to `out/`                        |
| `npm run preview`   | Serve `out/` on http://localhost:4173          |
| `npm run lint`      | ESLint                                         |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`      |
| `npm run format`    | Prettier write (`format:check` to verify only) |

## Config

- `NEXT_PUBLIC_SITE_URL` (see `.env.example`, default `https://collie.dev`): base for canonical, `hreflang`, Open Graph, `sitemap.xml`, `robots.txt`.

## Layout

- `/` English, `/pt` Brazilian Portuguese. Each has its own root layout (`src/app/(en)`, `src/app/(pt)`) so `<html lang>` is right without redirects.
- Copy lives in `src/i18n/en.ts` and `src/i18n/pt.ts` (`pt` is typed by `en`'s shape).
- Tokens: `src/app/tokens.css` (CSS variables, mapped to Tailwind in `globals.css`). To be replaced by the `collie-web` design system export.
- Logo: `src/components/Logo.tsx` (Herd mark); favicon `src/app/icon.svg`.
- Specs and briefs: `docs/`. Brand source: `brand-source/`.

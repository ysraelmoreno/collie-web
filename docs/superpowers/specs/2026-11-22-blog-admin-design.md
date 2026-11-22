# Blog + local admin — design

## Intent
Owner wants a public `/blog` on collie-web and a way to write posts without hand-editing TS files. Single author (the owner). Design first, owner reviews frames before code.

## Goals
- `/blog` (EN) and `/pt/blog` (PT): index + post page, same look as the rest of the site (DS collie-web v2).
- Local admin at `localhost:3000/admin`: list posts, create/edit with live preview, save as Markdown.
- Site stays a static export on Vercel.

## Non-goals
- No auth, no database, no hosted admin, no multi-author.
- No comments, tags pages, RSS (add later if asked).

## Anti-goals
- `/admin` or any write endpoint reachable on the published site.
- Admin that commits/pushes on its own — git stays manual.

## Constraints
- `next.config.ts` uses `output: "export"`: no server at runtime. Admin write path must only exist in `next dev` and must not break `next build`.
- Bilingual site: EN at `/`, PT at `/pt`.
- UI/copy changes go through the designer (design panel) before code.

## Approaches
- **A. Local admin (picked).** Admin runs only in `next dev`, writes `.md` to disk; owner commits/pushes. Simplest, nothing exposed.
- B. Hosted admin at `/admin` using GitHub API with a personal token in the browser. Publish from anywhere; token in browser is the risk. Possible later migration — same `.md` format.
- C. Decap/Sveltia CMS. Less code, but not the Collie look and needs an OAuth proxy. Rejected.

## Decided
- Posts: `content/blog/{en,pt}/<slug>.md`. A post may exist in one language only; language switch falls back to the blog index.
- Frontmatter: `title`, `date` (YYYY-MM-DD), `summary`, `draft` (bool), optional `cover`.
- Drafts never appear in the build; admin shows them.

## Builder's calls (proposed)
- Markdown renderer: add one small lib (e.g. `marked`) rather than hand-rolling a parser.
- Dev-only gating of `/admin` and its write handler (e.g. excluded from build / `notFound()` outside dev).
- Nav gets a "Blog" link (design decides placement).

## Screens for the designer
1. `/blog` index — list of posts (title, date, summary), empty state.
2. `/blog/<slug>` post — reading layout, code blocks, images.
3. Admin list — posts by language, draft/published badge, "New post".
4. Admin editor — frontmatter fields + Markdown editor, side-by-side preview, Save, draft toggle.
Desktop 1440 and mobile 390 for public pages; admin desktop only. Dark and light.

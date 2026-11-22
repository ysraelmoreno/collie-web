# Blog + Local Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Public `/blog` + `/pt/blog` built from Markdown files in the repo, plus a dev-only `/admin` that edits those files.

**Architecture:** Posts are `content/blog/{en,pt}/<slug>.md` read with `node:fs` at build time by server components (site stays `output: "export"`). One pure module `src/lib/blog.ts` parses/serializes frontmatter and lists posts. Admin pages use the `.dev.tsx` page extension, which `next.config.ts` only enables in development, and `output: "export"` is only set for production builds, so the admin's save Server Action exists in `next dev` and nowhere else.

**Tech Stack:** Next 16.4.5 (App Router — read `node_modules/next/dist/docs/` before using any API), React 19, Tailwind 4, `marked` (new dep), Node 24 `node --test` (native TS type stripping) for the one test file.

**Spec:** `docs/superpowers/specs/2026-11-22-blog-admin-design.md`
**Design:** collie-web design file, page "Blog" (id `502511173633`). Frames: Index 1440 Dark `502511174879` / Light `502511175472`; Index empty `502511175109`; Index 390 Dark `502511175122` / Light `502511175867`; Index PT 390 `502511175148`; Post 1440 Dark `502511175382` / Light `502511175771`; Post 390 Dark `502511175431` / Light `502511175927`; Admin list Dark `502511175164` / Light `502511175553`; Admin editor Dark `502511175280` / Light `502511175669`. The implementer needs a design panel leashed to it to inspect frames.

## Global Constraints

- Posts path: `content/blog/{en,pt}/<slug>.md`. Frontmatter keys: `title`, `date` (YYYY-MM-DD), `summary`, `draft` (bool), optional `cover`.
- Drafts never appear in the build (pages, `generateStaticParams`, sitemap). Admin shows them.
- `/admin` and any write path must not exist in `next build` output (`out/`).
- Admin never commits or pushes.
- EN at `/blog`, PT at `/pt/blog`. A post may exist in one language only; the EN|PT switch on a post whose other-language file is missing points to that language's blog index.
- Copy and layout come from the frames; reuse existing `Nav`, `Footer`, `Container`, `Mono` components and tokens. Don't invent UI labels.
- Slug regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.

## Review Focus

1. Admin save with slug `../x` or `a/b` → rejected, nothing written outside `content/blog/<locale>/`. (Task 1 test `rejects bad slugs`; Task 4 action calls `assertSlug`.)
2. `content/blog/pt/` missing entirely → PT index renders the empty state, build doesn't crash. (Task 1 test `missing dir yields []`.)
3. Draft post → not in `generateStaticParams`, index or sitemap. (Task 1 test `drafts hidden by default`; Task 5 grep on `out/`.)
4. Post only in EN → `/pt/blog/<slug>` not generated; EN post's PT switch goes to `/pt/blog`. (Task 3 step.)
5. Title/summary containing `:` or quotes → round-trips through serialize/parse unchanged. (Task 1 test `round-trips colons and quotes`.)

---

### Task 1: Blog data module

**Files:**
- Create: `src/lib/blog.ts`
- Test: `src/lib/blog.test.ts`
- Modify: `package.json` (add `marked`, add script `"test": "node --test src/**/*.test.ts"`)

**Interfaces:**
- Produces (relative imports only inside this file, so `node --test` runs it without the `@/` alias):
  - `type BlogLocale = "en" | "pt"`
  - `type BlogMeta = { title: string; date: string; summary: string; draft: boolean; cover?: string }`
  - `type BlogPost = BlogMeta & { slug: string; locale: BlogLocale; body: string }`
  - `assertSlug(slug: string): void` — throws on regex mismatch.
  - `parsePost(source: string): { meta: BlogMeta; body: string }`
  - `serializePost(meta: BlogMeta, body: string): string`
  - `listPosts(locale: BlogLocale, opts?: { drafts?: boolean; root?: string }): BlogPost[]` — sorted by `date` desc; `root` defaults to `path.join(process.cwd(), "content/blog")`.
  - `getBlogPost(locale, slug, opts?: { drafts?: boolean; root?: string }): BlogPost | undefined`
  - `blogPostPath(root: string, locale, slug): string` — calls `assertSlug`, returns `root/locale/slug.md`.
  - `renderMarkdown(body: string): string` — `marked.parse(body, { async: false })`.
  - `readingMinutes(body: string): number` — `max(1, round(words / 220))`.

- [ ] **Step 1: Write failing tests** in `src/lib/blog.test.ts` (`node:test` + `node:assert/strict`, temp dir via `fs.mkdtempSync`):
  - `round-trips colons and quotes`: meta `{title: 'A: "b"', date: "2026-11-22", summary: "x: y", draft: true, cover: "/blog/a.jpg"}` → `parsePost(serializePost(meta, "## Hi\n"))` deep-equals `{meta, body: "## Hi\n"}`.
  - `parses draft false and missing cover`: frontmatter without `cover` → `meta.cover === undefined`, `draft === false`.
  - `drafts hidden by default`: two files, one `draft: true` → `listPosts("en", {root}).length === 1`, with `{drafts: true}` → 2.
  - `sorted by date desc`: dates `2026-11-01`, `2026-11-20` → first is `2026-11-20`.
  - `missing dir yields []`: `listPosts("pt", {root})` with no `pt/` dir → `[]`.
  - `rejects bad slugs`: `assertSlug` throws for `"../x"`, `"a/b"`, `"A"`, `""`; passes `"why-markdown"`.
- [ ] **Step 2:** `npm i marked` and add the `test` script. Run `npm test` → FAIL (module missing).
- [ ] **Step 3: Implement `src/lib/blog.ts`.** Frontmatter is `---\n` key/value lines `---\n`; serialize every string value with `JSON.stringify` (handles `:` and quotes), parse values with `JSON.parse` when they start with `"`, else raw (`true`/`false` → bool). No YAML lib.
- [ ] **Step 4:** `npm test` → all pass. `npm run typecheck` → clean.
- [ ] **Step 5: Commit** `feat(blog): markdown post data module`.

### Task 2: Paths, copy, nav link, sitemap

**Files:**
- Modify: `src/i18n/index.ts` (add `blogPath`, `blogPostPaths`), `src/i18n/en.ts` + `src/i18n/pt.ts` (`nav.links.blog` and a `blog` block), `src/components/landing/Nav.tsx`, `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `listPosts` (Task 1).
- Produces:
  - `blogPath: Record<Locale, string> = { en: "/blog", pt: "/pt/blog" }`
  - `blogPostPaths(slug: string, available: Locale[]): Record<Locale, string>` — `/blog/<slug>` per locale; a locale not in `available` maps to `blogPath[locale]`.
  - Dictionary `blog` block: `meta {title, description}`, `eyebrow`, `title`, `lead`, `read`, `empty {title, body, …links}`, `posted`, `readingTime`, `minutes(n)`, `allPosts`, `next`. Copy taken verbatim from the frames (EN from 1440 frames, PT from `502511175148`; PT strings the frames lack are translated in the tone of `pt.ts`).
  - `Nav` `current` type gains `"blog"`; `pages` gains `["blog", t.links.blog, blogPath[locale]]` after changelog.

- [ ] **Step 1:** Add the above. Sitemap appends `blogPath` and, per published post, only the locales that have it (don't emit `/pt/blog/x` when PT file is missing).
- [ ] **Step 2:** `npm run typecheck` + `npm run lint` clean; `npm run dev`, landing nav shows "Blog" after "Changelog" at ≥lg.
- [ ] **Step 3: Commit** `feat(blog): paths, copy and nav link`.

### Task 3: Public pages

**Files:**
- Create: `src/components/blog/BlogIndex.tsx`, `src/components/blog/BlogPost.tsx`, `src/components/blog/Prose.tsx` (wrapper with the article typography for rendered HTML — also used by the admin preview)
- Create: `src/app/(en)/blog/page.tsx`, `src/app/(en)/blog/[slug]/page.tsx`, `src/app/(pt)/pt/blog/page.tsx`, `src/app/(pt)/pt/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `listPosts`, `getBlogPost`, `renderMarkdown`, `readingMinutes` (Task 1); `blogPath`, `blogPostPaths`, `pageMetadata`, dictionary `blog` (Task 2).
- Produces: `<Prose html={string} />` (used by Task 4).

- [ ] **Step 1:** Routes mirror `src/app/(en)/features/[slug]/page.tsx`: `dynamicParams = false`, `generateStaticParams = () => listPosts(locale).map(p => ({ slug: p.slug }))`, metadata via `pageMetadata(locale, blogPostPaths(slug, available), {title: `${title} — Collie`, description: summary})`. Index metadata from `blog.meta`.
- [ ] **Step 2:** `BlogIndex` per frames: head (Mono eyebrow, h1, lead), list rows (mono date, title, summary, "Read →"), empty state card when `listPosts` is `[]`. `Nav current="blog" switchPaths={blogPath}`.
- [ ] **Step 3:** `BlogPost` per frames: breadcrumb `BLOG / <date>`, h1, summary lead, 220px left rail (posted, reading time, ← All posts) + 64px gap + 720px article, footer row "← All posts" / "Next: <older post>" (omit Next on the oldest). `switchPaths = blogPostPaths(slug, localesThatHaveThisSlug)`. Code blocks in `Prose` match the DS "Code block" look (no Copy button — ponytail, add if asked).
- [ ] **Step 4:** Add a temp `content/blog/en/hello.md` (draft false) + `content/blog/pt` absent. `npm run build` passes; `out/blog/hello.html` exists, `out/pt/blog/hello.html` doesn't, `out/pt/blog.html` shows the empty state; EN post's PT switch href is `/pt/blog`. Delete the temp file.
- [ ] **Step 5:** Compare 1440/390 Dark/Light against the frames in the browser panel; fix spacing/type.
- [ ] **Step 6: Commit** `feat(blog): /blog index and post pages`.

### Task 4: Dev-only admin

**Files:**
- Modify: `next.config.ts`
- Create: `src/app/admin/page.dev.tsx`, `src/app/admin/[locale]/[slug]/page.dev.tsx` (edit; slug `new` = create), `src/app/admin/actions.ts` (`"use server"`), `src/components/admin/Editor.tsx` (`"use client"`), `src/components/admin/AdminHeader.tsx`

**Interfaces:**
- Consumes: `listPosts`, `getBlogPost`, `serializePost`, `blogPostPath`, `assertSlug`, `renderMarkdown` (Task 1); `Prose` (Task 3).
- Produces: `savePost(input: { locale: BlogLocale; slug: string; originalSlug?: string; meta: BlogMeta; body: string }): Promise<{ ok: true } | { ok: false; error: string }>`.

- [ ] **Step 1:** Read `node_modules/next/dist/docs/` on `pageExtensions`, `output: "export"` and Server Actions. Then in `next.config.ts`: `const dev = process.env.NODE_ENV === "development"`; `output: dev ? undefined : "export"`; `pageExtensions: dev ? ["dev.tsx", "tsx", "ts"] : ["tsx", "ts"]`. If the docs show this breaks something, stop and report instead of improvising.
- [ ] **Step 2:** `savePost`: throws unless `NODE_ENV === "development"`; `assertSlug(slug)`; validate `date` matches `^\d{4}-\d{2}-\d{2}$` and `title` non-empty; refuse to overwrite another existing file when `slug !== originalSlug`; write `serializePost` to `blogPostPath`; on rename delete the old file. Return `{ok:false,error}` instead of throwing for validation errors.
- [ ] **Step 3:** List page per frames: `AdminHeader` (Wordmark, ADMIN badge, "localhost:3000 · dev only", View site ↗, ThemeToggle), EN/PT tabs as links (`?locale=pt`), "New post", table (title, `slug.md`, date, Draft/Published badge — Draft `color/warn-text` = `--color-warn`, Published `color/success`), footer line with dir, count, drafts.
- [ ] **Step 4:** Editor per frames: fields Title, Slug, Date, Language (read-only), Summary, Cover; Markdown textarea with line-number gutter; live preview via `renderMarkdown` inside `<Prose>`; Draft switch; "Unsaved changes" when dirty; Save calls `savePost`, shows error text from the result. `beforeunload` guard while dirty.
- [ ] **Step 5:** Manual check in `npm run dev`: create post, edit, rename slug, toggle draft — files appear/change under `content/blog/en/`; slug `../x` shows an error and writes nothing.
- [ ] **Step 6:** `npm run build` → `out/admin*` does not exist; `grep -r savePost out/` finds nothing.
- [ ] **Step 7: Commit** `feat(blog): dev-only admin editor`.

### Task 5: Final verification

- [ ] **Step 1:** `npm test && npm run typecheck && npm run lint && npm run build` all pass.
- [ ] **Step 2:** With the writer's draft posts present: they are absent from `out/` and `out/sitemap.xml`.
- [ ] **Step 3:** Screenshots of `/blog`, a post, `/admin`, editor at 1440 and 390, Dark/Light → `docs/qa/blog/`.
- [ ] **Step 4: Commit** `docs(qa): blog screenshots`.

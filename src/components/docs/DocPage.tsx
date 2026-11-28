import { notFound } from "next/navigation";
import { PostBody } from "@/components/blog/PostBody";
import { Footer } from "@/components/landing/Closing";
import { Nav } from "@/components/landing/Nav";
import { Container } from "@/components/landing/ui";
import { Toc } from "@/components/posts/Toc";
import {
  docPaths,
  docsPath,
  getDictionary,
  pageMetadata,
  type Locale,
} from "@/i18n";
import { docsNav } from "@/i18n/docs-nav";
import { assertDocs, docMeta, docNeighbors, docSlugs, getDoc } from "@/lib/docs";
import { DocsSidebar } from "./DocsSidebar";

/** `/docs` (no slug) renders the first nav page; its canonical is that page. */
const resolve = (slug?: string[]) => slug?.join("/") ?? docSlugs()[0];

export function docsStaticParams() {
  assertDocs(); // fail the build early: missing locale, page outside the nav
  return [{ slug: [] }, ...docSlugs().map((s) => ({ slug: s.split("/") }))];
}

export function docMetadata(locale: Locale, slug?: string[]) {
  const s = resolve(slug);
  if (!docSlugs().includes(s)) return {};
  const { title, description } = docMeta(locale, s);
  return pageMetadata(locale, docPaths(s), {
    title: `${title} — Collie Docs`,
    description,
  });
}

export function DocPage({ locale, slug }: { locale: Locale; slug?: string[] }) {
  const s = resolve(slug);
  if (!docSlugs().includes(s)) notFound();
  const t = getDictionary(locale).docs;
  const { meta, segments, toc } = getDoc(locale, s);
  const group = docsNav.find((g) => g.pages.includes(s))!;
  const { prev, next } = docNeighbors(s);
  const sidebar = <DocsSidebar locale={locale} current={s} label={t.label} />;
  const mono =
    "font-mono text-xs leading-4 tracking-[0.12em] text-text-secondary uppercase";

  return (
    <>
      <Nav locale={locale} current="docs" switchPaths={docPaths(s)} />
      {/* Mobile: Menu opens the sidebar as a left drawer (native popover: top layer, light dismiss, no JS) */}
      <div className="flex items-center gap-3 border-y border-border px-6 py-3 lg:hidden">
        <button
          type="button"
          popoverTarget="docs-drawer"
          className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2 text-[15px] leading-[22px] font-bold"
        >
          <span aria-hidden="true">≡</span>
          {t.menu}
        </button>
        <p className={`min-w-0 truncate ${mono}`}>
          {group.title[locale]} / {meta.title}
        </p>
      </div>
      <div
        id="docs-drawer"
        popover="auto"
        className="fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-80 max-w-[85vw] overflow-y-auto border-r border-border bg-bg px-4 pb-8 text-fg backdrop:bg-ink/55"
      >
        <div className="mb-5 flex items-center justify-between border-b border-border py-4">
          <p className={mono.replace("text-text-secondary", "text-fg")}>
            {t.eyebrow}
          </p>
          <button
            type="button"
            popoverTarget="docs-drawer"
            popoverTargetAction="hide"
            aria-label={t.close}
            className="flex size-9 items-center justify-center rounded-sm border border-border text-lg"
          >
            ×
          </button>
        </div>
        {sidebar}
      </div>
      <Container className="pb-16 lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-12 lg:pb-24 xl:grid-cols-[248px_minmax(0,720px)_200px]">
        <aside className="sticky top-0 hidden max-h-screen self-start overflow-y-auto border-r border-border py-10 pr-6 lg:block">
          {sidebar}
        </aside>
        <main className="min-w-0 pt-6 lg:pt-10">
          <p className={`hidden flex-wrap gap-2 lg:flex ${mono}`}>
            <a href={docsPath[locale]} className="hover:text-fg">
              {t.eyebrow}
            </a>
            <span aria-hidden="true">/</span>
            <span>{group.title[locale]}</span>
            <span aria-hidden="true">/</span>
            <span>{meta.title}</span>
          </p>
          {meta.status === "preview" && (
            <p className="font-mono text-xs leading-4 tracking-[0.12em] text-accent-text lg:mt-3">
              {t.preview}
              {meta.since && ` · ${meta.since}`}
            </p>
          )}
          <h1 className="mt-2 text-[34px] leading-[40px] font-extrabold tracking-[-0.03em] lg:text-[44px] lg:leading-[48px]">
            {meta.title}
          </h1>
          <p className="mt-3 mb-10 text-[17px] leading-[26px] text-text-secondary lg:text-xl lg:leading-[30px]">
            {meta.description}
          </p>
          <article className="[&_h2]:scroll-mt-6 [&_h3]:scroll-mt-6">
            <PostBody segments={segments} />
          </article>
          {(prev || next) && (
            <nav className="mt-16 grid gap-4 sm:grid-cols-2">
              {[
                [prev, t.prev, "← ", ""],
                [next, t.next, "", " →"],
              ].map(([p, label, before, after], i) =>
                p ? (
                  <a
                    key={i}
                    href={docPaths(p)[locale]}
                    className={`flex flex-col gap-1 rounded-md border border-border bg-surface p-4 hover:border-accent-text ${i ? "sm:col-start-2 sm:text-right" : ""}`}
                  >
                    <span className={mono}>
                      {before}
                      {label}
                      {after}
                    </span>
                    <span className="text-[15px] leading-[22px] font-bold">
                      {docMeta(locale, p).title}
                    </span>
                  </a>
                ) : null,
              )}
            </nav>
          )}
        </main>
        <div className="hidden pt-10 xl:block">
          {toc.length > 0 && <Toc label={t.onThisPage} items={toc} />}
        </div>
      </Container>
      <Footer locale={locale} />
    </>
  );
}

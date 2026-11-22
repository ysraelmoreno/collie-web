import { notFound } from "next/navigation";
import { Footer } from "@/components/landing/Closing";
import { Nav } from "@/components/landing/Nav";
import { Container } from "@/components/landing/ui";
import { Mono } from "@/components/posts/parts";
import {
  blogPath,
  blogPostPaths,
  getDictionary,
  locales,
  pageMetadata,
  type Locale,
} from "@/i18n";
import { getBlogPost, listPosts, readingMinutes } from "@/lib/blog";
import { toSegments } from "@/lib/blocks";
import { formatDate } from "./date";
import { PostBody } from "./PostBody";

const availableIn = (slug: string): Locale[] =>
  locales.filter((l) => getBlogPost(l, slug));

/**
 * `output: "export"` rejects an empty generateStaticParams, so a locale with no
 * published posts gets one placeholder slug; BlogPost 404s it (no real post is "_").
 */
export function blogStaticParams(locale: Locale) {
  const params = listPosts(locale).map((p) => ({ slug: p.slug }));
  return params.length ? params : [{ slug: "_" }];
}

export function blogPostMetadata(locale: Locale, slug: string) {
  const post = getBlogPost(locale, slug);
  if (!post) return {};
  return pageMetadata(locale, blogPostPaths(slug, availableIn(slug)), {
    title: `${post.title} — Collie`,
    description: post.summary,
  });
}

export function BlogPost({ locale, slug }: { locale: Locale; slug: string }) {
  const post = getBlogPost(locale, slug);
  if (!post) notFound();
  const t = getDictionary(locale).blog;
  const date = formatDate(post.date, locale);
  const minutes = t.minutes(readingMinutes(post.body));
  // Listed newest first: the next-older post is the one after this.
  const all = listPosts(locale);
  const older = all[all.findIndex((p) => p.slug === slug) + 1];
  const back = (
    <a
      href={blogPath[locale]}
      className="text-[15px] leading-[22px] text-accent-text hover:underline"
    >
      {t.allPosts}
    </a>
  );

  return (
    <>
      <Nav
        locale={locale}
        current="blog"
        switchPaths={blogPostPaths(slug, availableIn(slug))}
      />
      <main>
        <Container className="flex flex-col gap-4 pt-10 pb-8 lg:gap-5 lg:pt-[72px] lg:pb-12">
          <p className="flex flex-wrap gap-2 font-mono text-xs leading-4 tracking-[0.12em] text-text-secondary uppercase">
            <a
              href={blogPath[locale]}
              className="text-accent-text hover:underline"
            >
              {t.eyebrow}
            </a>
            <span aria-hidden="true">/</span>
            <span className="lg:hidden">
              {date} · {minutes}
            </span>
            <span className="max-lg:hidden">{date}</span>
          </p>
          <h1 className="text-[40px] leading-[44px] font-extrabold tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
            {/* the frame ends the post title with a period */}
            {post.title}
            {/[.!?…]$/.test(post.title) ? "" : "."}
          </h1>
          <p className="max-w-[820px] text-[17px] leading-[26px] text-text-secondary lg:text-xl lg:leading-[30px]">
            {post.summary}
          </p>
        </Container>
        <Container className="pb-16 lg:grid lg:grid-cols-[220px_minmax(0,720px)] lg:gap-16 lg:pb-24">
          <aside className="hidden flex-col gap-5 self-start pt-1 lg:flex">
            <div className="flex flex-col gap-1.5 border-l-2 border-border pl-[14px]">
              <Mono className="text-text-secondary">{t.posted}</Mono>
              <p className="text-[15px] leading-[22px]">{date}</p>
            </div>
            <div className="flex flex-col gap-1.5 border-l-2 border-border pl-[14px]">
              <Mono className="text-text-secondary">{t.readingTime}</Mono>
              <p className="text-[15px] leading-[22px]">{minutes}</p>
            </div>
            {back}
          </aside>
          <article className="min-w-0">
            <PostBody
              segments={toSegments(post.body, {
                strict: true,
                file: `content/blog/${locale}/${slug}.md`,
              })}
            />
            <div className="mt-12 flex flex-col items-start gap-3 border-t border-border pt-8 lg:mt-16 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              {back}
              {older && (
                <a
                  href={blogPostPaths(older.slug, [locale])[locale]}
                  className="text-[15px] leading-[22px] text-text-secondary hover:text-fg"
                >
                  {t.next(older.title)}
                </a>
              )}
            </div>
          </article>
        </Container>
      </main>
      <Footer locale={locale} />
    </>
  );
}

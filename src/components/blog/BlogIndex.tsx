import { Footer } from "@/components/landing/Closing";
import { Nav } from "@/components/landing/Nav";
import { Container } from "@/components/landing/ui";
import { Mono } from "@/components/posts/parts";
import {
  blogPath,
  blogPostPaths,
  changelogPath,
  featuresPath,
  getDictionary,
  pageMetadata,
  type Locale,
} from "@/i18n";
import { listPosts } from "@/lib/blog";
import { formatDate } from "./date";

export const blogIndexMetadata = (locale: Locale) =>
  pageMetadata(locale, blogPath, getDictionary(locale).blog.meta);

export function BlogIndex({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).blog;
  const posts = listPosts(locale);
  return (
    <>
      <Nav locale={locale} current="blog" switchPaths={blogPath} />
      <main>
        <Container className="flex flex-col gap-4 pt-10 pb-8 lg:gap-5 lg:pt-[72px] lg:pb-16">
          <Mono>{t.eyebrow}</Mono>
          <h1 className="text-[40px] leading-[44px] font-extrabold tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
            {t.title}
          </h1>
          <p className="max-w-[800px] text-[17px] leading-[26px] text-text-secondary lg:text-xl lg:leading-[30px]">
            {t.lead}
          </p>
        </Container>
        <Container className="pb-16 lg:pb-24">
          {posts.length === 0 ? (
            <div className="flex max-w-[760px] flex-col gap-3 rounded-md border border-border bg-surface p-6 lg:p-12">
              <Mono className="text-text-secondary">{t.empty.eyebrow}</Mono>
              <h2 className="text-[22px] leading-[30px] font-bold">
                {t.empty.title}
              </h2>
              <p className="text-base leading-[26px] text-text-secondary lg:text-lg lg:leading-7">
                {t.empty.body}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[15px] leading-[22px] text-accent-text">
                <a href={changelogPath[locale]} className="hover:underline">
                  {t.empty.changelog}
                </a>
                <a href={featuresPath[locale]} className="hover:underline">
                  {t.empty.features}
                </a>
              </div>
            </div>
          ) : (
            <ul className="border-b border-border">
              {posts.map((p) => (
                <li key={p.slug} className="border-t border-border">
                  <a
                    href={blogPostPaths(p.slug, [locale])[locale]}
                    className="group flex flex-col gap-2 py-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-x-0 lg:gap-y-2 lg:py-8"
                  >
                    <time
                      dateTime={p.date}
                      className="font-mono text-xs leading-4 tracking-[0.12em] text-text-secondary uppercase lg:pt-[7px]"
                    >
                      {formatDate(p.date, locale)}
                    </time>
                    <div className="flex min-w-0 flex-col gap-2">
                      <h2 className="text-xl leading-7 font-bold group-hover:text-accent-text lg:text-[22px] lg:leading-[30px]">
                        {p.title}
                      </h2>
                      <p className="max-w-[720px] text-base leading-6 text-text-secondary lg:text-lg lg:leading-7">
                        {p.summary}
                      </p>
                      <span className="text-[15px] leading-[22px] text-accent-text">
                        {t.read}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
      <Footer locale={locale} />
    </>
  );
}

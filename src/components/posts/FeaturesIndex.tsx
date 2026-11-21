import { Footer } from "@/components/landing/Closing";
import { Nav } from "@/components/landing/Nav";
import { Container } from "@/components/landing/ui";
import { featuresPath, pageMetadata, postPaths, type Locale } from "@/i18n";
import { postsFor, postsUi } from "@/i18n/posts";
import { Mono, Thumb } from "./parts";

export const indexMetadata = (locale: Locale) =>
  pageMetadata(locale, featuresPath, postsUi[locale].meta);

/** /features: 3 equal-height cards per row on desktop, a compact row (thumb + text) on phones. */
export function FeaturesIndex({ locale }: { locale: Locale }) {
  const ui = postsUi[locale];
  return (
    <>
      <Nav locale={locale} current="features" switchPaths={featuresPath} />
      <main>
        <Container className="flex flex-col gap-4 pt-10 pb-8 lg:pt-[72px] lg:pb-12">
          <Mono>{ui.eyebrow}</Mono>
          <h1 className="text-[40px] leading-[44px] font-extrabold tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
            {ui.title}
          </h1>
          <p className="max-w-[800px] text-base leading-[25px] text-text-secondary lg:text-lg lg:leading-7">
            {ui.lead}
          </p>
        </Container>
        <Container className="pb-16 lg:pb-24">
          <ul className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {postsFor(locale).map((p) => (
              <li key={p.slug} className="flex">
                <a
                  href={postPaths(p.slug)[locale]}
                  className="flex flex-1 items-center gap-4 overflow-hidden rounded-md border border-border bg-surface p-2.5 hover:border-accent-text md:flex-col md:items-stretch md:gap-0 md:p-0"
                >
                  <Thumb
                    mediaId={p.mediaId}
                    className="w-24 shrink-0 rounded-sm md:w-auto md:rounded-none md:border-b md:border-border"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2 md:p-5">
                    <Mono>{p.eyebrow}</Mono>
                    <h2 className="text-[15px] leading-[22px] font-bold md:text-xl md:leading-7 md:tracking-[-0.01em]">
                      {p.title}
                    </h2>
                    <p className="hidden text-[15px] leading-[22px] text-text-secondary md:block">
                      {p.lead}
                    </p>
                    <span className="mt-auto hidden pt-1 text-[15px] leading-[22px] text-accent-text md:block">
                      {ui.read}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </main>
      <Footer locale={locale} />
    </>
  );
}

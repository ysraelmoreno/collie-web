import { Rich, Tag } from "./parts";
import { Tabs } from "./Tabs";
import { Footer } from "@/components/landing/Closing";
import { Nav } from "@/components/landing/Nav";
import { Command, Container, Eyebrow, Lead } from "@/components/landing/ui";
import { nextPath, type Locale } from "@/i18n";
import { changelog } from "@/i18n/changelog";

export function ChangelogNext({ locale }: { locale: Locale }) {
  const t = changelog[locale];
  const n = t.next;
  return (
    <>
      <Nav locale={locale} current="changelog" switchPaths={nextPath} />
      <main>
        <Container className="pt-10 pb-16 lg:pt-[72px] lg:pb-24">
          <header className="flex flex-col gap-3 pb-3">
            <Eyebrow>{n.eyebrow}</Eyebrow>
            <h1 className="text-[40px] leading-[44px] font-extrabold tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
              {n.title}
            </h1>
            <div className="max-w-[800px]">
              <Lead>{n.lead}</Lead>
            </div>
          </header>

          <Tabs locale={locale} current="next" className="mb-4 lg:mb-10" />

          {n.groups.map((g) => (
            <section
              key={g.id}
              id={g.id}
              aria-labelledby={`${g.id}-title`}
              className="grid gap-4 border-t border-border py-8 first-of-type:border-t-0 lg:grid-cols-[220px_1fr] lg:gap-12"
            >
              <div className="lg:sticky lg:top-6 lg:self-start">
                <h2
                  id={`${g.id}-title`}
                  className="text-2xl leading-8 font-extrabold tracking-[-0.01em]"
                >
                  {g.name}
                </h2>
                <p className="mt-1.5 text-sm leading-5 text-text-secondary">
                  {g.desc}
                </p>
              </div>
              <ul className="grid gap-3 lg:grid-cols-2">
                {g.items.map((i) => (
                  <li
                    key={i.title}
                    className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface p-5"
                  >
                    <div>
                      <Tag>{t.areas[i.area].name}</Tag>
                    </div>
                    <h3 className="text-lg leading-6 font-extrabold">
                      {i.title}
                    </h3>
                    <p className="text-[15px] leading-[22px] text-text-secondary">
                      <Rich text={i.body} />
                    </p>
                    {i.cmd && (
                      <div className="mt-1 rounded-md bg-surface-2 px-3.5 py-3">
                        <Command {...i.cmd} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Container>
      </main>
      <Footer locale={locale} />
    </>
  );
}

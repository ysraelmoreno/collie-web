import { existsSync } from "node:fs";
import { join } from "node:path";
import { AreaFilter } from "./AreaFilter";
import { Rich, Tag } from "./parts";
import { Tabs } from "./Tabs";
import { FeatureVideo } from "@/components/landing/FeatureVideo";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Closing";
import { Command, Container, Eyebrow, Lead } from "@/components/landing/ui";
import {
  AREA_CLIP,
  changelog,
  type AreaId,
  type ChangelogCopy,
  type Item,
  type Kind,
} from "@/i18n/changelog";
import type { Locale } from "@/i18n";

const KINDS: Kind[] = ["new", "imp", "fix"];

const kindStyle: Record<Kind, string> = {
  new: "border-accent-text text-accent-text",
  imp: "border-success text-success",
  fix: "border-warn text-warn",
};

// ponytail: checked at build (static export). A clip not recorded yet just leaves the card as text.
const hasClip = (clip?: string) =>
  !!clip &&
  [clip, `${clip}-light`].every((f) =>
    ["mp4", "jpg"].every((ext) =>
      existsSync(join(process.cwd(), "public/features", `${f}.${ext}`)),
    ),
  );

const dateLabel = (iso: string, locale: Locale) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (locale === "en")
    return d.toLocaleDateString("en-US", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const month = d
    .toLocaleDateString("pt-BR", { timeZone: "UTC", month: "short" })
    .replace(".", "");
  return `${d.getUTCDate()} ${month} ${d.getUTCFullYear()}`;
};

export function Changelog({ locale }: { locale: Locale }) {
  const t: ChangelogCopy = changelog[locale];
  const used = new Set(t.releases.flatMap((r) => r.items.map((i) => i.area)));
  const areaIds = (Object.keys(t.areas) as AreaId[]).filter((a) => used.has(a));
  const latest = t.releases[0].v;

  const group = (items: Item[], k: Kind) => {
    const rows = items.filter((i) => i.k === k);
    if (!rows.length) return null;
    return (
      <section key={k} data-group className="mt-8">
        <h3 className="mb-3 font-mono text-xs leading-4 tracking-[0.12em] text-text-secondary uppercase">
          {t.kinds[k]}
        </h3>
        <ul className="grid gap-2.5">
          {rows.map((i) => (
            <li
              key={i.t}
              data-item
              data-area={i.area}
              className="grid gap-0.5 text-[15px] leading-6 sm:grid-cols-[120px_1fr] sm:gap-3"
            >
              <span className="font-mono text-xs leading-6 text-text-secondary">
                {t.areas[i.area].name}
              </span>
              <span className="min-w-0">
                <Rich text={i.t} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <>
      <Nav locale={locale} current="changelog" />
      <main>
        <Container className="pt-10 pb-16 lg:pt-[72px] lg:pb-24">
          <header className="flex flex-col gap-3 pb-3">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h1 className="text-[40px] leading-[44px] font-extrabold tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
              {t.title}
            </h1>
            <div className="max-w-[800px]">
              <Lead>{t.lead}</Lead>
            </div>
          </header>

          <Tabs locale={locale} current="versions" className="mb-3" />

          <AreaFilter
            label={t.filterLabel}
            all={t.all}
            areas={areaIds.map((id) => ({ id, name: t.areas[id].name }))}
          />

          <div id="changelog">
            {t.releases.map((r) => (
              <article
                key={r.v}
                id={`v${r.v}`}
                aria-labelledby={`v${r.v}-title`}
                className="grid gap-4 border-t border-border py-10 lg:grid-cols-[220px_1fr] lg:gap-12"
              >
                <div className="lg:sticky lg:top-6 lg:self-start">
                  <p className="text-[32px] leading-none font-extrabold tracking-[-0.02em]">
                    <a href={`#v${r.v}`} className="rounded-sm">
                      {r.v}
                    </a>
                  </p>
                  <p className="mt-1.5 font-mono text-[13px] leading-5 text-text-secondary">
                    <time dateTime={r.date}>{dateLabel(r.date, locale)}</time>
                  </p>
                  {r.v === latest && (
                    <p className="mt-2.5">
                      <Tag className={kindStyle.new}>{t.latest}</Tag>
                    </p>
                  )}
                </div>
                <div className="min-w-0">
                  <h2
                    id={`v${r.v}-title`}
                    className="text-2xl leading-8 font-extrabold tracking-[-0.01em]"
                  >
                    {r.headline}
                  </h2>
                  {r.highlights.map((h) => {
                    const clip = AREA_CLIP[h.area];
                    return (
                      <div
                        key={h.title}
                        data-area={h.area}
                        className={`mt-5 grid gap-4 rounded-lg border border-border bg-surface p-4 lg:gap-6 lg:p-5 ${hasClip(clip) ? "lg:grid-cols-[1fr_1.25fr] lg:items-center" : ""}`}
                      >
                        <div className="min-w-0">
                          <Tag>{t.areas[h.area].name}</Tag>
                          <h3 className="mt-2.5 text-xl leading-7 font-extrabold">
                            {h.title}
                          </h3>
                          <p className="mt-1.5 text-[15px] leading-6 text-text-secondary">
                            {h.body}
                          </p>
                          {h.cmd && (
                            <div className="mt-3 rounded-sm border border-border bg-bg px-3 py-2.5">
                              <Command {...h.cmd} />
                            </div>
                          )}
                        </div>
                        {hasClip(clip) && (
                          <FeatureVideo id={clip!} label={t.clipAlt(h.title)} />
                        )}
                      </div>
                    );
                  })}
                  {KINDS.map((k) => group(r.items, k))}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </main>
      <Footer locale={locale} />
    </>
  );
}

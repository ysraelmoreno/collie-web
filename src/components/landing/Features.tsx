import { getDictionary, type Locale } from "@/i18n";
import { FeatureVideo } from "./FeatureVideo";
import { Command, Container, Eyebrow, H2, LearnMore, Lead } from "./ui";

/** Sections 04–11: one per feature, all from `t.features` (docs/prd/00-overview.md). */
export function Features({ locale }: { locale: Locale }) {
  const { features } = getDictionary(locale);

  return (
    <div id="features">
      {features.map((f, i) => (
        <section
          key={f.id}
          id={f.id}
          aria-labelledby={`${f.id}-title`}
          className="pt-12 pb-16 lg:py-16"
        >
          <Container
            className={`flex flex-col gap-6 lg:items-center lg:gap-10 xl:gap-16 ${i % 2 ? "lg:flex-row-reverse" : "lg:flex-row"}`}
          >
            <div className="flex min-w-0 flex-col gap-4 lg:w-[38%] lg:max-w-[480px] lg:shrink-0">
              <Eyebrow>{f.eyebrow}</Eyebrow>
              <H2 id={`${f.id}-title`}>{f.title}</H2>
              <Lead>{f.body}</Lead>
              <ul className="flex flex-col gap-1 font-mono text-[13px] leading-5 text-text-secondary">
                {f.bullets.map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
              <Command {...f.command} />
              <LearnMore locale={locale} slug={f.id} />
            </div>
            <FeatureVideo id={f.id} label={f.mediaAlt} />
          </Container>
        </section>
      ))}
    </div>
  );
}

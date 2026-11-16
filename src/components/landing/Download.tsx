import { getDictionary, type Locale } from "@/i18n";
import { DOWNLOAD_PATH, RELEASES_LATEST_URL } from "@/lib/site";
import { LatestVersion } from "./LatestVersion";
import { ButtonLink, Container, Eyebrow, H2, Lead } from "./ui";

export function Download({ locale }: { locale: Locale }) {
  const d = getDictionary(locale).download;
  return (
    <section
      id="download"
      aria-labelledby="download-title"
      className="py-16 lg:py-24"
    >
      <Container className="flex flex-col gap-8 xl:flex-row xl:items-center xl:gap-16">
        <div className="flex flex-col gap-4 xl:w-[480px] xl:shrink-0">
          <Eyebrow>{d.eyebrow}</Eyebrow>
          <H2 id="download-title">{d.title}</H2>
          <Lead>{d.body}</Lead>
          <div className="flex flex-col gap-3 sm:items-start">
            <ButtonLink href={DOWNLOAD_PATH} primary>
              {d.button}
            </ButtonLink>
            <LatestVersion label={d.latest} />
            <a
              href={RELEASES_LATEST_URL}
              className="text-[15px] leading-[22px] text-fg hover:text-accent-text"
            >
              {d.allVersions}
            </a>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="overflow-hidden rounded-md border border-border bg-surface">
            <div className="bg-surface-2 px-4 py-[10px] font-mono text-xs leading-[22px] text-text-secondary">
              {d.stepsLabel}
            </div>
            <ol className="flex list-inside list-decimal flex-col gap-3 p-5 text-base leading-[25px] text-fg marker:font-mono marker:text-accent-text">
              {d.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <p className="font-mono text-xs leading-[19px] text-muted">
            {d.requirements}
          </p>
        </div>
      </Container>
    </section>
  );
}

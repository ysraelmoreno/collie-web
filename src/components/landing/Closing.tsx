import { Logo, Wordmark } from "@/components/Logo";
import { getDictionary, localePath, type Locale } from "@/i18n";
import { GITHUB_URL, README_URL } from "@/lib/site";
import { ButtonLink, Container, H2 } from "./ui";

export function FinalCta({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section aria-labelledby="cta-title" className="py-20 lg:py-[120px]">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Logo size={80} />
        <H2 id="cta-title">{t.cta.title}</H2>
        <p className="max-w-[620px] text-base leading-[25px] text-text-secondary lg:text-lg lg:leading-7">
          {t.cta.body}
        </p>
        <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href={GITHUB_URL} primary>
            {t.hero.primary}
          </ButtonLink>
          <ButtonLink href={README_URL}>{t.hero.secondary}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).footer;
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col items-center gap-6 py-7 md:flex-row md:justify-between">
        <a href={localePath[locale]} className="rounded-sm">
          <Wordmark />
        </a>
        <p className="text-center text-[15px] leading-[22px] text-text-secondary md:text-left md:whitespace-nowrap">
          {t.meta}
          <span className="hidden md:inline"> · </span>
          <span className="block md:inline">{t.builtWith}</span>
        </p>
        <a
          href={GITHUB_URL}
          className="whitespace-nowrap text-[15px] leading-[22px] text-fg hover:text-accent-text"
        >
          {t.github}
        </a>
      </Container>
    </footer>
  );
}

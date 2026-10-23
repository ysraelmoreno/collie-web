import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Wordmark } from "@/components/Logo";
import { getDictionary, localePath, type Locale } from "@/i18n";
import { GITHUB_URL } from "@/lib/site";
import { ButtonLink, Container } from "./ui";

export function Nav({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).nav;
  const links = [
    ["product", t.links.product],
    ["design", t.links.design],
    ["memory", t.links.memory],
    ["devices", t.links.devices],
  ] as const;

  return (
    <header>
      <Container className="flex min-h-[72px] items-center gap-6 py-[14px] lg:py-3">
        <a href={localePath[locale]} className="rounded-sm">
          <Wordmark />
        </a>
        <nav aria-label={t.label} className="mx-auto hidden md:block">
          <ul className="flex gap-9 text-[15px] leading-[22px] text-text-secondary">
            {links.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="hover:text-fg">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-5 md:ml-0">
          <LanguageSwitch locale={locale} />
          <ButtonLink href={GITHUB_URL}>{t.github}</ButtonLink>
        </div>
      </Container>
    </header>
  );
}

import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  blogPath,
  changelogPath,
  docsPath,
  featuresPath,
  getDictionary,
  localePath,
  type Locale,
} from "@/i18n";
import { DOWNLOAD_PATH, GITHUB_URL } from "@/lib/site";
import { ButtonLink, Container } from "./ui";

/** Off the landing page (`current` set), the section anchors link back to it. */
export function Nav({
  locale,
  current,
  switchPaths,
}: {
  locale: Locale;
  current?: "changelog" | "features" | "blog" | "docs";
  /** Where the EN|PT switch points; defaults to the changelog (or home). */
  switchPaths?: Record<Locale, string>;
}) {
  const { nav: t, theme } = getDictionary(locale);
  const base = current ? localePath[locale] : "";
  const links = [
    ["product", t.links.product],
    ["design", t.links.design],
    ["memory", t.links.memory],
    ["devices", t.links.devices],
  ] as const;
  // Page links after the section anchors; the current page gets aria-current.
  const pages = [
    ["features", t.links.features, featuresPath[locale]],
    ["docs", t.links.docs, docsPath[locale]],
    ["changelog", t.links.changelog, changelogPath[locale]],
    ["blog", t.links.blog, blogPath[locale]],
  ] as const;

  return (
    <header>
      <Container className="flex min-h-[72px] items-center gap-3 py-[14px] lg:gap-6 lg:py-3">
        {/* ponytail: zoom keeps EN|PT, theme and GitHub on one row at 360px */}
        <a
          href={localePath[locale]}
          className="shrink-0 rounded-sm max-sm:[zoom:0.85]"
        >
          <Wordmark />
        </a>
        <nav aria-label={t.label} className="mx-auto hidden lg:block">
          <ul className="flex gap-5 xl:gap-9 text-[15px] leading-[22px] text-text-secondary">
            {links.map(([id, label]) => (
              <li key={id}>
                <a href={`${base}#${id}`} className="hover:text-fg">
                  {label}
                </a>
              </li>
            ))}
            {pages.map(([id, label, href]) => (
              <li key={id}>
                <a
                  href={href}
                  aria-current={current === id ? "page" : undefined}
                  className="hover:text-fg aria-[current=page]:text-fg"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:gap-3 lg:ml-0">
          {/* ponytail: hidden below sm, the hero CTA sits right under the nav there */}
          <a
            href={DOWNLOAD_PATH}
            className="hidden text-[15px] leading-[22px] text-text-secondary hover:text-fg sm:mr-3 sm:inline"
          >
            {t.download}
          </a>
          <LanguageSwitch
            locale={locale}
            paths={switchPaths ?? (current ? changelogPath : localePath)}
          />
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle {...theme} />
            <ButtonLink href={GITHUB_URL} className="max-sm:px-4">
              {t.github}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </header>
  );
}

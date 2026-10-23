import { Fragment } from "react";
import { getDictionary, localePath, locales, type Locale } from "@/i18n";

// Plain <a>: each locale has its own root layout, so switching is a full load anyway.
export function LanguageSwitch({ locale }: { locale: Locale }) {
  return (
    <nav
      aria-label={getDictionary(locale).languageSwitch.label}
      className="font-mono text-sm"
    >
      {locales.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span aria-hidden="true" className="px-2 text-muted">
              |
            </span>
          )}
          <a
            href={localePath[l]}
            hrefLang={getDictionary(l).meta.lang}
            aria-current={l === locale ? "page" : undefined}
            className="text-muted hover:text-paper aria-[current=page]:text-paper"
          >
            {l.toUpperCase()}
          </a>
        </Fragment>
      ))}
    </nav>
  );
}

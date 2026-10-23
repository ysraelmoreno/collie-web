import { Fragment } from "react";
import { getDictionary, localePath, locales, type Locale } from "@/i18n";

// Plain <a>: each locale has its own root layout, so switching is a full load anyway.
export function LanguageSwitch({ locale }: { locale: Locale }) {
  return (
    <nav
      aria-label={getDictionary(locale).languageSwitch.label}
      className="font-mono text-sm leading-[22px]"
    >
      {locales.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span aria-hidden="true" className="px-1.5 text-border">
              |
            </span>
          )}
          <a
            href={localePath[l]}
            hrefLang={getDictionary(l).meta.lang}
            aria-current={l === locale ? "page" : undefined}
            className="text-muted hover:text-fg aria-[current=page]:text-fg"
          >
            {l.toUpperCase()}
          </a>
        </Fragment>
      ))}
    </nav>
  );
}

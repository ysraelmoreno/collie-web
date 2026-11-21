import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { changelog } from "./changelog";
import { en, type Dictionary } from "./en";
import { pt } from "./pt";

export type { Dictionary };

export const locales = ["en", "pt"] as const;
export type Locale = (typeof locales)[number];

const dictionaries: Record<Locale, Dictionary> = { en, pt };

export const getDictionary = (locale: Locale) => dictionaries[locale];

// `/` is English, `/pt` is Brazilian Portuguese. No detection, no redirect.
export const localePath: Record<Locale, string> = { en: "/", pt: "/pt" };

export const changelogPath: Record<Locale, string> = {
  en: "/changelog",
  pt: "/pt/changelog",
};

export const nextPath: Record<Locale, string> = {
  en: "/changelog/next",
  pt: "/pt/changelog/next",
};

const alternates = (paths: Record<Locale, string>) => ({
  en: absoluteUrl(paths.en),
  "pt-BR": absoluteUrl(paths.pt),
  "x-default": absoluteUrl(paths.en),
});

export const hreflangAlternates = alternates(localePath);
export const changelogAlternates = alternates(changelogPath);
export const nextAlternates = alternates(nextPath);

export function localeMetadata(
  locale: Locale,
  page: "home" | "changelog" | "next" = "home",
): Metadata {
  const { ogLocale } = getDictionary(locale).meta;
  const { title, description } =
    page === "home"
      ? getDictionary(locale).meta
      : page === "next"
        ? changelog[locale].next.meta
        : changelog[locale].meta;
  const paths = { home: localePath, changelog: changelogPath, next: nextPath }[
    page
  ];
  const languages = {
    home: hreflangAlternates,
    changelog: changelogAlternates,
    next: nextAlternates,
  }[page];
  const url = absoluteUrl(paths[locale]);
  return {
    metadataBase: new URL(absoluteUrl("/")),
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      type: "website",
      siteName: "Collie",
      url,
      title,
      description,
      locale: ogLocale,
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => getDictionary(l).meta.ogLocale),
    },
  };
}

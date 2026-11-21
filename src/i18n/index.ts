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

const alternates = (paths: Record<Locale, string>) => ({
  en: absoluteUrl(paths.en),
  "pt-BR": absoluteUrl(paths.pt),
  "x-default": absoluteUrl(paths.en),
});

export const hreflangAlternates = alternates(localePath);
export const changelogAlternates = alternates(changelogPath);

export function localeMetadata(
  locale: Locale,
  page: "home" | "changelog" = "home",
): Metadata {
  const { ogLocale } = getDictionary(locale).meta;
  const { title, description } =
    page === "home" ? getDictionary(locale).meta : changelog[locale].meta;
  const paths = page === "home" ? localePath : changelogPath;
  const url = absoluteUrl(paths[locale]);
  return {
    metadataBase: new URL(absoluteUrl("/")),
    title,
    description,
    alternates: {
      canonical: url,
      languages: page === "home" ? hreflangAlternates : changelogAlternates,
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

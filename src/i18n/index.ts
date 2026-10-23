import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { en, type Dictionary } from "./en";
import { pt } from "./pt";

export type { Dictionary };

export const locales = ["en", "pt"] as const;
export type Locale = (typeof locales)[number];

const dictionaries: Record<Locale, Dictionary> = { en, pt };

export const getDictionary = (locale: Locale) => dictionaries[locale];

// `/` is English, `/pt` is Brazilian Portuguese. No detection, no redirect.
export const localePath: Record<Locale, string> = { en: "/", pt: "/pt" };

export const hreflangAlternates = {
  en: absoluteUrl(localePath.en),
  "pt-BR": absoluteUrl(localePath.pt),
  "x-default": absoluteUrl(localePath.en),
};

export function localeMetadata(locale: Locale): Metadata {
  const { meta } = getDictionary(locale);
  const url = absoluteUrl(localePath[locale]);
  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url, languages: hreflangAlternates },
    openGraph: {
      type: "website",
      siteName: "Collie",
      url,
      title: meta.title,
      description: meta.description,
      locale: meta.ogLocale,
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => getDictionary(l).meta.ogLocale),
    },
  };
}

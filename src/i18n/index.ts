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

export const featuresPath: Record<Locale, string> = {
  en: "/features",
  pt: "/pt/features",
};

export const blogPath: Record<Locale, string> = {
  en: "/blog",
  pt: "/pt/blog",
};

export const docsPath: Record<Locale, string> = {
  en: "/docs",
  pt: "/pt/docs",
};

/** Docs pages share their slug across locales. */
export const docPaths = (slug: string): Record<Locale, string> => ({
  en: `${docsPath.en}/${slug}`,
  pt: `${docsPath.pt}/${slug}`,
});

/** A locale without this post falls back to its blog index. */
export const blogPostPaths = (
  slug: string,
  available: Locale[],
): Record<Locale, string> => ({
  en: available.includes("en") ? `${blogPath.en}/${slug}` : blogPath.en,
  pt: available.includes("pt") ? `${blogPath.pt}/${slug}` : blogPath.pt,
});

export const postPaths = (slug: string): Record<Locale, string> => ({
  en: `${featuresPath.en}/${slug}`,
  pt: `${featuresPath.pt}/${slug}`,
});

export const alternates = (paths: Record<Locale, string>) => ({
  en: absoluteUrl(paths.en),
  "pt-BR": absoluteUrl(paths.pt),
  "x-default": absoluteUrl(paths.en),
});

export function localeMetadata(
  locale: Locale,
  page: "home" | "changelog" | "next" = "home",
): Metadata {
  const { title, description } =
    page === "home"
      ? getDictionary(locale).meta
      : page === "next"
        ? changelog[locale].next.meta
        : changelog[locale].meta;
  const paths = { home: localePath, changelog: changelogPath, next: nextPath }[
    page
  ];
  return pageMetadata(locale, paths, { title, description });
}

/** Canonical, hreflang and Open Graph for one page in one locale. */
export function pageMetadata(
  locale: Locale,
  paths: Record<Locale, string>,
  { title, description }: { title: string; description: string },
): Metadata {
  const { ogLocale } = getDictionary(locale).meta;
  const url = absoluteUrl(paths[locale]);
  return {
    metadataBase: new URL(absoluteUrl("/")),
    title,
    description,
    alternates: {
      canonical: url,
      languages: alternates(paths),
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

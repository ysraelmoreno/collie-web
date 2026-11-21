import type { MetadataRoute } from "next";
import {
  alternates,
  changelogPath,
  featuresPath,
  localePath,
  locales,
  nextPath,
  postPaths,
  type Locale,
} from "@/i18n";
import { postSlugs } from "@/i18n/posts";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const page = (paths: Record<Locale, string>) =>
  locales.map((locale) => ({
    url: absoluteUrl(paths[locale]),
    alternates: { languages: alternates(paths) },
  }));

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    localePath,
    changelogPath,
    nextPath,
    featuresPath,
    ...postSlugs.map(postPaths),
  ].flatMap(page);
}

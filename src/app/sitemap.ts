import type { MetadataRoute } from "next";
import {
  alternates,
  blogPath,
  blogPostPaths,
  changelogPath,
  featuresPath,
  localePath,
  locales,
  nextPath,
  postPaths,
  type Locale,
} from "@/i18n";
import { postSlugs } from "@/i18n/posts";
import { listPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const page = (
  paths: Record<Locale, string>,
  available: readonly Locale[] = locales,
) =>
  available.map((locale) => ({
    url: absoluteUrl(paths[locale]),
    // hreflang only when every locale has the page
    ...(available.length === locales.length && {
      alternates: { languages: alternates(paths) },
    }),
  }));

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    localePath,
    changelogPath,
    nextPath,
    featuresPath,
    blogPath,
    ...postSlugs.map(postPaths),
  ].flatMap((paths) => page(paths));

  // A blog post is listed only in the locales that have its file.
  const bySlug = new Map<string, Locale[]>();
  for (const locale of locales)
    for (const { slug } of listPosts(locale))
      bySlug.set(slug, [...(bySlug.get(slug) ?? []), locale]);
  const posts = [...bySlug].flatMap(([slug, available]) =>
    page(blogPostPaths(slug, available), available),
  );

  return [...pages, ...posts];
}

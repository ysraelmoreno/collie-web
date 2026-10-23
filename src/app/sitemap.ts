import type { MetadataRoute } from "next";
import { hreflangAlternates, localePath, locales } from "@/i18n";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: absoluteUrl(localePath[locale]),
    alternates: { languages: hreflangAlternates },
  }));
}

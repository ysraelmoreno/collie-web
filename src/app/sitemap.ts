import type { MetadataRoute } from "next";
import {
  changelogAlternates,
  changelogPath,
  hreflangAlternates,
  localePath,
  locales,
} from "@/i18n";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...locales.map((locale) => ({
      url: absoluteUrl(localePath[locale]),
      alternates: { languages: hreflangAlternates },
    })),
    ...locales.map((locale) => ({
      url: absoluteUrl(changelogPath[locale]),
      alternates: { languages: changelogAlternates },
    })),
  ];
}

import type { Locale } from "@/i18n";

const MONTHS = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  pt: [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ],
};

/** "2026-11-22" → "Nov 22, 2026" (EN) / "22 nov 2026" (PT). */
export function formatDate(date: string, locale: Locale) {
  const [y, m, d] = date.split("-").map(Number);
  const mon = MONTHS[locale][m - 1];
  return locale === "en" ? `${mon} ${d}, ${y}` : `${d} ${mon} ${y}`;
}

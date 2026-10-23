import "@/app/globals.css";
import { dmMono, manrope } from "@/app/fonts";
import { getDictionary, type Locale } from "@/i18n";

/** Shared <html>/<body> for the per-locale root layouts. */
export function RootDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={getDictionary(locale).meta.lang}
      className={`${manrope.variable} ${dmMono.variable} antialiased`}
    >
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}

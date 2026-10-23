import "@/app/globals.css";
import { dmMono, manrope } from "@/app/fonts";
import { getDictionary, type Locale } from "@/i18n";
import { THEME_KEY } from "@/lib/site";

// Applies the saved theme before first paint (no flash); ThemeToggle writes it.
const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

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
      // The inline script may set data-theme before hydration.
      suppressHydrationWarning
    >
      {/* App Router root layout: a plain <head> is right here (next/head is Pages-only). */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}

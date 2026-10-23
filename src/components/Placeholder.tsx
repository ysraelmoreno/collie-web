import { getDictionary, type Locale } from "@/i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import { Logo } from "./Logo";

// ponytail: setup check only; replaced by the landing sections once the figcraft screen is approved.
export function Placeholder({ locale }: { locale: Locale }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4">
      <h1 className="flex items-center gap-4">
        <Logo size={64} />
        <span className="text-6xl leading-none font-extrabold tracking-[-0.03em]">
          collie
        </span>
      </h1>
      <p className="text-muted">{getDictionary(locale).placeholder.status}</p>
      <LanguageSwitch locale={locale} />
    </main>
  );
}

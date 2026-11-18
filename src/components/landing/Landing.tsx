import type { Locale } from "@/i18n";
import { BuildIt } from "./BuildIt";
import { FinalCta, Footer } from "./Closing";
import { Download } from "./Download";
import { Features } from "./Features";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Nav } from "./Nav";
import { Pain } from "./Pain";
import { Pillars } from "./Pillars";

export function Landing({ locale }: { locale: Locale }) {
  return (
    <>
      <Nav locale={locale} />
      <main>
        <Hero locale={locale} />
        <Pain locale={locale} />
        <Pillars locale={locale} />
        <Features locale={locale} />
        <HowItWorks locale={locale} />
        <Download locale={locale} />
        <BuildIt locale={locale} />
        <FinalCta locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}

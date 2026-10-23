import { getDictionary, type Locale } from "@/i18n";
import { Container, Eyebrow, H2 } from "./ui";

export function HowItWorks({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).how;
  return (
    <section aria-labelledby="how-title" className="py-16 lg:py-24">
      <Container className="flex flex-col gap-6 lg:gap-10">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <H2 id="how-title">{t.title}</H2>
        <ol className="grid gap-10 md:grid-cols-3">
          {t.steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span className="font-mono text-sm leading-[22px] text-accent-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-2xl leading-8 font-bold tracking-[-0.01em]">
                {step.title}
              </h3>
              <p className="text-base leading-[25px] text-text-secondary lg:text-lg lg:leading-7">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

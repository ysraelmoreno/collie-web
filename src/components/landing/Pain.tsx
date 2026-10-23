import { getDictionary, type Locale } from "@/i18n";
import { Container, Eyebrow, H2, Lead } from "./ui";

// Loose cards from the design frame: left as % of the 1312px collage, top px, tilt.
const layout = [
  { left: "7%", top: 54, rotate: 4 },
  { left: "32%", top: 45, rotate: -3 },
  { left: "58%", top: 65, rotate: 2 },
  { left: "14.4%", top: 184, rotate: -2.5 },
  { left: "47.4%", top: 186, rotate: 3.5 },
  { left: "76.9%", top: 176, rotate: -4 },
];

export function Pain({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).pain;
  return (
    <section
      id="product"
      aria-labelledby="product-title"
      className="py-16 lg:py-24"
    >
      <Container className="flex flex-col gap-6 lg:gap-8">
        <Eyebrow soft>{t.eyebrow}</Eyebrow>
        <H2 id="product-title">{t.title}</H2>
        <div className="max-w-[760px]">
          <Lead>{t.body}</Lead>
        </div>
        <div
          aria-hidden="true"
          className="flex flex-wrap justify-center gap-4 rounded-lg border border-border bg-surface px-4 py-8 lg:relative lg:block lg:h-[300px] lg:p-0"
        >
          {t.cards.map((card, i) => (
            <span
              key={card}
              style={{
                left: layout[i].left,
                top: layout[i].top,
                rotate: `${layout[i].rotate}deg`,
              }}
              className="static rounded-sm border border-border bg-surface-2 px-[18px] py-[14px] font-mono text-sm leading-[22px] whitespace-nowrap text-fg lg:absolute"
            >
              {card}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}

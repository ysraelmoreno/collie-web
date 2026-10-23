import type { CSSProperties } from "react";
import { getDictionary, type Locale } from "@/i18n";
import { GITHUB_URL, README_URL } from "@/lib/site";
import {
  Canvas,
  Lines,
  MemoryCard,
  PanelCard,
  Phone,
  Placed,
  sideZoom,
} from "./canvas";
import { ButtonLink, Container } from "./ui";

export function Hero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const h = t.hero;
  // Fluid H1: the longest line fits the copy column (Manrope 800 measures ~0.49em per glyph).
  const fit = {
    "--chars": Math.max(...h.title.map((line) => line.length)),
  } as CSSProperties;

  return (
    <section className="pt-10 pb-14 lg:pt-[72px] lg:pb-24">
      <Container className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-8">
        <div className="@container flex min-w-0 flex-col gap-5 lg:gap-6 lg:max-w-[620px] lg:flex-1">
          <p className="font-mono text-xs leading-4 tracking-[0.12em] text-accent-text">
            {h.eyebrow}
          </p>
          <h1
            style={fit}
            className="text-[clamp(40px,calc(100cqi/(var(--chars)*0.5)),64px)] leading-[1.07] font-extrabold tracking-[-0.03em]"
          >
            {h.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="text-base leading-[25px] text-text-secondary lg:text-lg lg:leading-7">
            {h.body}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={GITHUB_URL} primary>
              {h.primary}
            </ButtonLink>
            <ButtonLink href={README_URL}>{h.secondary}</ButtonLink>
          </div>
          <p className="hidden font-mono text-[13px] leading-[22px] text-muted lg:block">
            {h.hint}
          </p>
        </div>

        <Canvas
          width={660}
          height={540}
          className={sideZoom}
          leashes={[
            "M364 124 C380 124 380 150 396 150",
            "M150 224 L150 272",
            "M300 224 C300 290 400 290 400 330",
          ]}
        >
          <Placed x={24} y={24} w={340} h={200}>
            <PanelCard name="shepherd" tag="claude">
              <Lines lines={h.shepherd} typing />
            </PanelCard>
          </Placed>
          <Placed x={396} y={64} w={260} h={214} fullOnly>
            <PanelCard
              name="design-2"
              tag="figcraft"
              bodyClassName="gap-[10px] p-4"
            >
              <div className="h-16 rounded-sm bg-surface-2" />
              <div className="h-2 w-[150px] rounded-[4px] bg-border" />
              <div className="h-2 w-[110px] rounded-[4px] bg-border" />
              <div className="h-6 w-[72px] rounded-[6px] bg-accent" />
            </PanelCard>
          </Placed>
          <Placed x={40} y={272} w={236} h={244} fullOnly>
            <PanelCard
              name="portfolio-ios"
              tag="device"
              bodyClassName="px-4 py-[14px]"
            >
              <Phone w={118} h={180} />
            </PanelCard>
          </Placed>
          <Placed x={330} y={330} w={326}>
            <MemoryCard {...t.memoryCard} />
          </Placed>
        </Canvas>
      </Container>
    </section>
  );
}

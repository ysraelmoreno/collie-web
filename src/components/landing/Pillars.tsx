import { getDictionary, type Locale } from "@/i18n";
import {
  Canvas,
  Lines,
  MemoryCard,
  PanelCard,
  Phone,
  Placed,
  sideZoom,
} from "./canvas";
import { Command, Container, Eyebrow, H2, Lead } from "./ui";

function Pillar({
  id,
  copy,
  reverse,
  children,
}: {
  id: string;
  copy: { eyebrow: string; title: string; body: string; command: string };
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="pt-12 pb-16 lg:py-16"
    >
      <Container
        className={`flex flex-col gap-4 lg:gap-10 xl:items-center xl:gap-16 ${reverse ? "xl:flex-row-reverse" : "xl:flex-row"}`}
      >
        <div className="flex min-w-0 flex-col gap-4 xl:max-w-[480px] xl:flex-1">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <H2 id={`${id}-title`}>{copy.title}</H2>
          <Lead>{copy.body}</Lead>
          <Command>{copy.command}</Command>
        </div>
        {children}
      </Container>
    </section>
  );
}

const swatches = [
  "bg-accent",
  "bg-accent-soft",
  "bg-paper",
  "bg-surface-2",
  "bg-memory",
  "bg-success",
];

export function Pillars({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const { design, memory, devices } = t.pillars;

  return (
    <>
      <Pillar id="design" copy={design}>
        <Canvas width={768} height={420} className={sideZoom} leashes={[]}>
          <Placed x={40} y={40} w={420} h={290}>
            <PanelCard
              name="collie-web"
              tag="design system"
              bodyClassName="gap-[14px] p-4"
            >
              <div className="flex flex-wrap gap-[10px]">
                {swatches.map((bg) => (
                  <span
                    key={bg}
                    className={`size-10 rounded-sm border border-border ${bg}`}
                  />
                ))}
              </div>
              <p className="text-2xl leading-8 font-bold tracking-[-0.01em] whitespace-pre">
                {design.specimen}
              </p>
              <div className="font-mono text-xs leading-[19px]">
                <p className="whitespace-pre-wrap text-muted">{design.scale}</p>
                <p className="text-success">{design.published}</p>
              </div>
            </PanelCard>
          </Placed>
          <Placed x={330} y={200} w={400}>
            <div className="overflow-hidden rounded-md border border-border bg-surface font-mono">
              <div className="flex justify-between bg-surface-2 px-4 py-[10px] text-xs leading-[22px]">
                <span className="text-muted">codex</span>
                <span className="text-accent">{t.copy.idle}</span>
              </div>
              <pre className="overflow-hidden p-5 text-sm leading-[22px] text-fg">
                {design.tokens.join("\n")}
              </pre>
            </div>
          </Placed>
        </Canvas>
      </Pillar>

      <Pillar id="memory" copy={memory} reverse>
        <Canvas
          width={768}
          height={420}
          className={sideZoom}
          leashes={[
            "M360 115 C390 115 390 180 412 180",
            "M360 305 C390 305 390 240 412 240",
          ]}
        >
          <Placed x={40} y={40} w={320} h={150}>
            <PanelCard name="shepherd" tag="claude">
              <Lines lines={memory.shepherd} />
            </PanelCard>
          </Placed>
          <Placed x={40} y={230} w={320} h={150}>
            <PanelCard name="api" tag="codex">
              <Lines lines={memory.api} />
            </PanelCard>
          </Placed>
          <Placed x={412} y={130} w={330}>
            <MemoryCard {...t.memoryCard} />
          </Placed>
        </Canvas>
      </Pillar>

      <Pillar id="devices" copy={devices}>
        <Canvas
          width={768}
          height={420}
          className={sideZoom}
          leashes={["M410 185 L460 185"]}
        >
          <Placed x={40} y={70} w={370} h={230}>
            <PanelCard name="qa" tag="claude">
              <Lines lines={devices.qa} />
            </PanelCard>
          </Placed>
          <Placed x={460} y={30} w={260} h={360}>
            <PanelCard name="pixel-8" tag="device">
              <Phone w={150} h={270} />
            </PanelCard>
          </Placed>
        </Canvas>
      </Pillar>
    </>
  );
}

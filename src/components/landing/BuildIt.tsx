import { getDictionary, type Locale } from "@/i18n";
import { CopyButton } from "./CopyButton";
import { Container, Eyebrow, H2, Lead } from "./ui";

export function BuildIt({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const b = t.build;
  return (
    <section
      id="build"
      aria-labelledby="build-title"
      className="py-16 lg:py-24"
    >
      <Container className="flex flex-col gap-8 xl:flex-row xl:items-center xl:gap-16">
        <div className="flex flex-col gap-4 xl:w-[480px] xl:shrink-0">
          <Eyebrow>{b.eyebrow}</Eyebrow>
          <H2 id="build-title">{b.title}</H2>
          <Lead>{b.body}</Lead>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="overflow-hidden rounded-md border border-border bg-surface font-mono">
            <div className="flex items-center justify-between bg-surface-2 px-4 py-[10px]">
              <span className="text-xs leading-[22px] text-text-secondary">
                {b.terminal}
              </span>
              <CopyButton
                text={b.commands.join("\n")}
                idle={t.copy.idle}
                done={t.copy.done}
              />
            </div>
            <pre className="overflow-x-auto p-5 text-sm leading-[22px] text-fg">
              <code>
                {b.commands.map((cmd) => (
                  <span key={cmd} className="block">
                    <span aria-hidden="true" className="select-none">
                      ${" "}
                    </span>
                    {cmd}
                  </span>
                ))}
              </code>
            </pre>
          </div>
          <p className="font-mono text-xs leading-[19px] text-muted">
            {b.note}
          </p>
        </div>
      </Container>
    </section>
  );
}

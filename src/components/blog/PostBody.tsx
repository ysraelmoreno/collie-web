import type { Segment } from "@/lib/blocks";
import { BlockError } from "./blocks/BlockError";
import { Callout } from "./blocks/Callout";
import { Compare } from "./blocks/Compare";
import { Stats } from "./blocks/Stats";
import { Steps } from "./blocks/Steps";
import { Tabs } from "./blocks/Tabs";
import { Prose } from "./Prose";

/** Client-safe: imports only types from blocks.ts (which pulls in node:fs). */
export function PostBody({ segments }: { segments: Segment[] }) {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {segments.map((s, i) => {
        if (s.kind === "html") return <Prose key={i} html={s.html} />;
        if (s.kind === "error")
          return <BlockError key={i} message={s.message} />;
        const b = s.block;
        switch (b.name) {
          case "callout":
            return <Callout key={i} block={b} />;
          case "stats":
            return <Stats key={i} block={b} />;
          case "steps":
            return <Steps key={i} block={b} />;
          case "compare":
            return <Compare key={i} block={b} />;
          case "tabs":
            return <Tabs key={i} block={b} />;
        }
      })}
    </div>
  );
}

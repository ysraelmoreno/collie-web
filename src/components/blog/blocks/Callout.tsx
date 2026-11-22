import type { Block } from "@/lib/blocks";
import { Html } from "./Html";

const kinds = {
  note: {
    bar: "border-accent",
    dot: "bg-accent",
    text: "text-accent-text",
    bg: "bg-surface",
  },
  status: {
    bar: "border-success",
    dot: "bg-success",
    text: "text-success",
    bg: "bg-surface",
  },
  vision: {
    bar: "border-accent",
    dot: "bg-accent-soft",
    text: "text-accent-soft",
    bg: "bg-memory",
  },
  warning: {
    bar: "border-warn",
    dot: "bg-warn",
    text: "text-warn",
    bg: "bg-surface",
  },
};

export function Callout({
  block,
}: {
  block: Extract<Block, { name: "callout" }>;
}) {
  const k = kinds[block.kind];
  return (
    <aside
      className={`flex flex-col gap-2 rounded-md border-l-[3px] ${k.bar} ${k.bg} px-5 py-4`}
    >
      <p
        className={`flex items-center gap-2 font-mono text-xs leading-4 tracking-[0.12em] uppercase ${k.text}`}
      >
        <span aria-hidden="true" className={`size-1.5 rounded-full ${k.dot}`} />
        {block.kind}
      </p>
      {block.title && (
        <Html
          as="p"
          html={block.title}
          className="text-lg leading-7 font-semibold text-fg"
        />
      )}
      <Html
        as="p"
        html={block.body}
        className="text-base leading-6 text-text-secondary"
      />
    </aside>
  );
}

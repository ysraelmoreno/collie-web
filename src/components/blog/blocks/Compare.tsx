import type { Block } from "@/lib/blocks";
import { Html } from "./Html";

type Side = { title: string; items: string[] };

function Col({
  label,
  side,
  className,
}: {
  label: string;
  side: Side;
  className: string;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border bg-surface p-5 ${className}`}
    >
      <p className="font-mono text-xs leading-4 tracking-[0.12em] uppercase text-text-secondary">
        {label}
      </p>
      <Html
        as="p"
        html={side.title}
        className="text-lg leading-7 font-semibold text-fg"
      />
      <ul className="flex flex-col gap-2 text-base leading-6 text-text-secondary">
        {side.items.map((it, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden="true" className="text-text-secondary">
              —
            </span>
            <Html html={it} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Compare({
  block,
}: {
  block: Extract<Block, { name: "compare" }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Col label="Before" side={block.before} className="border-border" />
      <Col
        label="After"
        side={block.after}
        className="border-accent [&>p:first-child]:text-accent-text [&_li>span]:text-accent-text"
      />
    </div>
  );
}

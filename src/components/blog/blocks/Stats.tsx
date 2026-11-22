import type { Block } from "@/lib/blocks";
import { Html } from "./Html";

const card =
  "flex flex-col gap-2 rounded-lg border border-border bg-surface p-5";
const cols = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function Stats({ block }: { block: Extract<Block, { name: "stats" }> }) {
  if ("items" in block) {
    return (
      <div
        className={`grid grid-cols-1 gap-4 ${cols[block.items.length as 2 | 3 | 4]}`}
      >
        {block.items.map((it, i) => (
          <div key={i} className={card}>
            <p className="text-[32px] leading-10 font-extrabold tracking-[-0.02em] text-fg">
              {it.value}
            </p>
            <Html
              as="p"
              html={it.label}
              className="text-base leading-6 font-medium text-fg"
            />
            {it.note && (
              <Html
                as="p"
                html={it.note}
                className="font-mono text-xs leading-[18px] text-text-secondary"
              />
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`${card} gap-3 p-7`}>
      <p className="flex items-center gap-4 text-[40px] leading-[48px] font-extrabold tracking-[-0.02em]">
        <span className="text-text-secondary">{block.from}</span>
        <span aria-label="to" className="text-accent-text">
          →
        </span>
        <span className="text-fg">{block.to}</span>
      </p>
      <Html
        as="p"
        html={block.label}
        className="text-base leading-6 font-medium text-fg"
      />
      {block.note && (
        <Html
          as="p"
          html={block.note}
          className="font-mono text-xs leading-[18px] text-text-secondary"
        />
      )}
    </div>
  );
}

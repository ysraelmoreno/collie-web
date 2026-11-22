import type { Block } from "@/lib/blocks";
import { Html } from "./Html";

export function Steps({ block }: { block: Extract<Block, { name: "steps" }> }) {
  return (
    <ol className="flex flex-col">
      {block.items.map((it, i) => (
        <li key={i} className="relative flex gap-5 pb-6 last:pb-0">
          {i < block.items.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-8 bottom-0 left-[13px] w-px bg-border"
            />
          )}
          <span
            aria-hidden="true"
            className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-accent bg-bg font-mono text-xs text-accent-text"
          >
            {i + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Html
              as="p"
              html={it.title}
              className="text-lg leading-7 font-semibold text-fg"
            />
            {it.command && (
              <pre className="overflow-x-auto rounded-md bg-surface px-4 py-[10px] font-mono text-sm leading-[22px] whitespace-pre-wrap text-fg">
                <span
                  aria-hidden="true"
                  className="mr-3 text-text-secondary select-none"
                >
                  $
                </span>
                {it.command}
              </pre>
            )}
            {it.result && (
              <p className="flex gap-2 text-base leading-6 text-text-secondary">
                <span aria-hidden="true" className="text-accent-text">
                  →
                </span>
                <Html html={it.result} />
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

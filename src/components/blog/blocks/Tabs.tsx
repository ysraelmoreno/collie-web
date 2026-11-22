"use client";

import { useRef, useState } from "react";
import type { Block } from "@/lib/blocks";
import { Html } from "./Html";

export function Tabs({ block }: { block: Extract<Block, { name: "tabs" }> }) {
  const [i, setI] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = block.tabs.length;
  const tab = block.tabs[i];

  function onKey(e: React.KeyboardEvent) {
    const next =
      e.key === "ArrowRight"
        ? (i + 1) % n
        : e.key === "ArrowLeft"
          ? (i + n - 1) % n
          : null;
    if (next === null) return;
    e.preventDefault();
    setI(next);
    refs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border bg-surface-2 pr-4">
          <div role="tablist" onKeyDown={onKey} className="flex gap-5 px-4">
            {block.tabs.map((t, j) => (
              <button
                key={j}
                ref={(el) => {
                  refs.current[j] = el;
                }}
                role="tab"
                id={`tab-${j}`}
                aria-selected={j === i}
                tabIndex={j === i ? 0 : -1}
                onClick={() => setI(j)}
                className={`-mb-px border-b-2 py-[10px] text-sm leading-[22px] font-medium ${j === i ? "border-accent text-fg" : "border-transparent text-text-secondary hover:text-fg"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab.lang && (
            <span className="font-mono text-xs text-text-secondary">
              {tab.lang}
            </span>
          )}
        </div>
        {tab.code !== undefined && (
          <pre
            role="tabpanel"
            aria-labelledby={`tab-${i}`}
            className="p-5 font-mono text-sm leading-[22px] break-words whitespace-pre-wrap text-fg"
          >
            <code>{tab.code.replace(/\n$/, "")}</code>
          </pre>
        )}
      </div>
      {tab.body !== undefined && (
        <Html
          as="p"
          html={tab.body}
          className="text-base leading-6 text-text-secondary"
        />
      )}
    </div>
  );
}

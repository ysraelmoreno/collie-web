import type { CSSProperties } from "react";
import type { TermLine } from "@/i18n/en";

/*
 * Canvas illustrations (decorative, aria-hidden).
 * From lg up they are the absolute layout of the design frames; below lg the
 * same cards stack in a simple column (the full canvas would shrink to ~6px
 * text), leashes are dropped and `fullOnly` items are hidden.
 */

// Between xl and 1440 the side-by-side canvases are zoomed so copy keeps its width.
export const sideZoom = "xl:max-[1439px]:[zoom:0.8]";

type Vars = CSSProperties & Record<`--${string}`, string>;

export function Canvas({
  width,
  height,
  leashes,
  className = "",
  children,
}: {
  width: number;
  height: number;
  /** SVG path data in canvas coordinates. */
  leashes: string[];
  className?: string;
  children: React.ReactNode;
}) {
  const style: Vars = { "--w": `${width}px`, "--h": `${height}px` };
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`flex w-full flex-col items-start gap-4 rounded-lg border border-border p-4 select-none lg:relative lg:block lg:h-(--h) lg:w-(--w) lg:shrink-0 lg:p-0 ${className}`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="pointer-events-none absolute inset-0 hidden size-full lg:block"
      >
        {leashes.map((d) => (
          <path
            key={d}
            d={d}
            className="leash"
            fill="none"
            stroke="var(--color-accent-soft)"
            strokeOpacity={0.8}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="5 6"
          />
        ))}
      </svg>
      {children}
    </div>
  );
}

export function Placed({
  x,
  y,
  w,
  h,
  fullOnly,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  fullOnly?: boolean;
  children: React.ReactNode;
}) {
  const style: Vars = {
    "--x": `${x}px`,
    "--y": `${y}px`,
    "--w": `${w}px`,
    "--h": h ? `${h}px` : "auto",
  };
  return (
    <div
      style={style}
      className={`w-full max-w-(--w) lg:absolute lg:top-(--y) lg:left-(--x) lg:h-(--h) lg:w-(--w) ${fullOnly ? "hidden lg:block" : ""}`}
    >
      {children}
    </div>
  );
}

export function PanelCard({
  name,
  tag,
  bodyClassName = "gap-2 p-4",
  children,
}: {
  name: string;
  tag: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface">
      <div className="flex items-center gap-2 bg-surface-2 px-[14px] py-[10px] font-mono">
        <span className="size-2 rounded-full bg-accent" />
        <span className="text-[13px] leading-[18px] text-fg">{name}</span>
        <span className="ml-auto text-xs leading-4 text-muted">{tag}</span>
      </div>
      <div className={`flex flex-1 flex-col ${bodyClassName}`}>{children}</div>
    </div>
  );
}

/** Terminal lines; with `typing`, commands type in once and outputs follow. */
export function Lines({
  lines,
  typing,
}: {
  lines: TermLine[];
  typing?: boolean;
}) {
  // Start time of each line: commands take 35ms per char, outputs a beat.
  const delays = lines.reduce<number[]>(
    (acc, line, i) => [
      ...acc,
      i === 0
        ? 600
        : acc[i - 1] +
          (lines[i - 1].out ? 450 : lines[i - 1].text.length * 35 + 250),
    ],
    [],
  );
  return (
    <div className="flex flex-col font-mono text-xs leading-[19px]">
      {lines.map((line, i) => {
        const chars = line.text.length;
        const style: Vars = {
          "--chars": `${chars}`,
          "--delay": `${delays[i]}ms`,
        };
        return (
          <div
            key={line.text}
            style={typing ? style : undefined}
            className={`${line.out ? "pl-[2ch] text-success" : "text-fg"} ${
              typing ? (line.out ? "appear" : "typed") : ""
            }`}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
}

export function MemoryCard({
  eyebrow,
  entries,
}: {
  eyebrow: string;
  entries: string[];
}) {
  return (
    <div className="flex flex-col gap-[10px] rounded-md border border-memory-2 bg-memory p-[18px] font-mono">
      <p className="text-xs leading-4 tracking-[0.12em] text-accent-soft">
        {eyebrow}
      </p>
      {entries.map((entry) => (
        <p
          key={entry}
          className="text-xs leading-[21px] whitespace-pre-wrap text-fg"
        >
          {entry}
        </p>
      ))}
    </div>
  );
}

/** Stylised phone screen; colours stay paper/ink in both themes, like the app. */
export function Phone({ w, h }: { w: number; h: number }) {
  return (
    <div
      style={{ width: w, height: h }}
      className="mx-auto flex flex-col gap-2 rounded-[20px] bg-paper px-[10px] pt-[18px] pb-[10px]"
    >
      <div className="h-[10px] rounded-[5px] bg-ink" />
      <div className="h-[60px] rounded-sm bg-white" />
      <div className="h-2 w-4/5 rounded-[4px] bg-muted" />
      <div className="h-2 w-3/5 rounded-[4px] bg-muted" />
      <div className="h-[22px] rounded-[6px] bg-accent" />
    </div>
  );
}

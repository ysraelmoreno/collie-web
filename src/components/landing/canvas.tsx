import type { CSSProperties } from "react";
import type { TermLine } from "@/i18n/en";

/*
 * Canvas illustrations (decorative, aria-hidden).
 * From lg up they are the absolute layout of the design frames; below lg the
 * same cards stack in a simple column (the full canvas would shrink to ~6px
 * text), leashes are dropped and `fullOnly` items are hidden.
 */

// Below 1440 the side-by-side canvases are zoomed so copy keeps its width.
export const sideZoom = "lg:max-xl:[zoom:0.6] xl:max-[1439px]:[zoom:0.8]";

type Vars = CSSProperties & Record<`--${string}`, string>;

/** Start time (ms) of a one-pass hero cue; see the canvas motion in globals.css. */
export const cue = (ms: number): Vars => ({ "--delay": `${ms}ms` });

export function Canvas({
  width,
  height,
  leashes,
  className = "",
  children,
}: {
  width: number;
  height: number;
  /** SVG path data in canvas coordinates; `lit` (ms) lights a leash up once. */
  leashes: (string | { d: string; lit: number })[];
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
        {leashes.map((leash) => {
          const { d, lit } =
            typeof leash === "string" ? { d: leash, lit: undefined } : leash;
          return (
            <path
              key={d}
              d={d}
              style={lit === undefined ? undefined : cue(lit)}
              className={lit === undefined ? "leash" : "leash lit"}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="5 6"
            />
          );
        })}
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

/**
 * Terminal lines: the user's prompt, the collie commands the agent runs, their
 * output and the agent's reply. With `cues` (ms per line) they play in once:
 * the prompt types char by char, later lines appear on their cue.
 */
export function Lines({ lines, cues }: { lines: TermLine[]; cues?: number[] }) {
  return (
    <div className="flex flex-col gap-[6px]">
      {lines.map((line, i) => {
        const at = cues?.[i];
        if (line.kind === "prompt") {
          return (
            <div
              key={line.text}
              className="flex gap-2 rounded-sm bg-surface-2 px-[10px] py-[6px] text-[13px] leading-5"
            >
              <span className="font-mono text-accent-text">›</span>
              <span className="text-fg">
                {at === undefined
                  ? line.text
                  : [...line.text].map((char, c) => (
                      <span key={c} className="appear" style={cue(at + c * 35)}>
                        {char}
                      </span>
                    ))}
              </span>
            </div>
          );
        }
        const kind = {
          call: "font-mono text-[11px] leading-[17px] text-muted lg:text-xs lg:leading-[19px]",
          out: "pl-[2ch] font-mono text-[11px] leading-[17px] whitespace-pre-wrap text-success lg:text-xs lg:leading-[19px]",
          reply: "text-[13px] leading-5 text-fg",
        }[line.kind];
        return (
          <div
            key={line.text}
            style={at === undefined ? undefined : cue(at)}
            className={`${kind} ${at === undefined ? "" : line.kind === "reply" ? "fade-in" : "appear"}`}
          >
            {line.kind === "call" ? `↳ ${line.text}` : line.text}
          </div>
        );
      })}
    </div>
  );
}

export function MemoryCard({
  eyebrow,
  entries,
  className = "",
  style,
}: {
  eyebrow: string;
  entries: string[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`${className} flex flex-col gap-[10px] rounded-md border border-memory-2 bg-memory p-[18px] font-mono`}
    >
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
export function Phone({
  w,
  h,
  card = 60,
  ctaClassName = "",
  style,
  className = "",
}: {
  w: number;
  h: number;
  /** Height of the white card on screen. */
  card?: number;
  ctaClassName?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      style={{ ...style, width: w, height: h }}
      className={`mx-auto flex flex-col gap-2 rounded-[20px] bg-paper px-[10px] pt-[18px] pb-[10px] ${className}`}
    >
      <div className="h-[10px] rounded-[5px] bg-ink" />
      <div style={{ height: card }} className="rounded-sm bg-white" />
      <div className="h-2 w-4/5 rounded-[4px] bg-muted" />
      <div className="h-2 w-3/5 rounded-[4px] bg-muted" />
      <div className={`h-[22px] rounded-[6px] bg-accent ${ctaClassName}`} />
    </div>
  );
}

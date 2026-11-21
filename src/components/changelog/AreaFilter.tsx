"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Area chips for #changelog. Hides rows with the `hidden` attribute (no dependency, no
 * re-render of the server markup). Hidden until hydration: without JS the page shows everything.
 */
export function AreaFilter({
  label,
  all,
  areas,
}: {
  label: string;
  all: string;
  areas: { id: string; name: string }[];
}) {
  const [active, setActive] = useState("all");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.hidden = false;
  }, []);

  function pick(area: string) {
    setActive(area);
    const root = document.getElementById("changelog");
    if (!root) return;
    const q = (sel: string) => root.querySelectorAll<HTMLElement>(sel);
    q("[data-area]").forEach((el) => {
      el.hidden = area !== "all" && el.dataset.area !== area;
    });
    q("[data-group]").forEach((el) => {
      el.hidden = !el.querySelector("[data-area]:not([hidden])");
    });
    q("article").forEach((el) => {
      el.hidden = !el.querySelector("[data-item]:not([hidden])");
    });
  }

  return (
    <div
      ref={ref}
      hidden
      role="group"
      aria-label={label}
      className="mb-10 flex flex-wrap gap-2 font-mono text-xs leading-4"
    >
      {[{ id: "all", name: all }, ...areas].map((a) => (
        <button
          key={a.id}
          type="button"
          aria-pressed={active === a.id}
          onClick={() => pick(a.id)}
          className="cursor-pointer rounded-full border border-border px-3 py-1.5 hover:bg-surface-2 aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
        >
          {a.name}
        </button>
      ))}
    </div>
  );
}

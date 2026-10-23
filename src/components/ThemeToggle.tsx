"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "@/lib/site";

type Theme = "dark" | "light";

const CHANGE = "themechange";
const lightQuery = "(prefers-color-scheme: light)";

function current(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "dark" || set === "light") return set;
  return matchMedia(lightQuery).matches ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const mq = matchMedia(lightQuery);
  mq.addEventListener("change", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** Icon shown by CSS (globals.css) so it is right before hydration; label follows the store. */
export function ThemeToggle({
  toLight,
  toDark,
}: {
  toLight: string;
  toDark: string;
}) {
  const theme = useSyncExternalStore(subscribe, current, () => "dark");

  function toggle() {
    const next: Theme = current() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage blocked: the choice lasts for this page only.
    }
    window.dispatchEvent(new Event(CHANGE));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? toLight : toDark}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:text-fg focus-visible:outline-offset-0"
    >
      <svg {...iconProps} className="theme-sun">
        <circle cx="10" cy="10" r="2.875" />
        <path d="M10 1.4v2.2M10 16.4v2.2M1.4 10h2.2M16.4 10h2.2M3.92 3.92l1.55 1.55M14.53 14.53l1.55 1.55M3.92 16.08l1.55-1.55M14.53 5.47l1.55-1.55" />
      </svg>
      <svg {...iconProps} className="theme-moon">
        <path d="M16.2 11.6A6.6 6.6 0 0 1 8.4 3.8a6.6 6.6 0 1 0 7.8 7.8Z" />
      </svg>
    </button>
  );
}

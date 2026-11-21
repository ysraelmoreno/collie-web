import { changelog } from "@/i18n/changelog";
import { changelogPath, nextPath, type Locale } from "@/i18n";

/** Plain links (no JS): each tab is its own URL, and EN/PT keep the same tab. */
export function Tabs({
  locale,
  current,
  className = "",
}: {
  locale: Locale;
  current: "versions" | "next";
  className?: string;
}) {
  const t = changelog[locale];
  const tabs = [
    ["versions", t.tabs.versions, changelogPath[locale], t.releases.length],
    [
      "next",
      t.tabs.next,
      nextPath[locale],
      t.next.groups.reduce((n, g) => n + g.items.length, 0),
    ],
  ] as const;
  return (
    <nav
      aria-label={t.tabs.label}
      className={`flex gap-1 border-b border-border pt-2 font-mono text-[13px] ${className}`}
    >
      {tabs.map(([id, label, href, count]) => (
        <a
          key={id}
          href={href}
          aria-current={id === current ? "page" : undefined}
          className="-mb-px rounded-t-sm border-b-2 border-transparent px-3.5 py-2.5 text-text-secondary hover:text-fg aria-[current=page]:border-accent-text aria-[current=page]:text-fg"
        >
          {label}
          <span className="ml-1.5 text-[11px] text-text-secondary">
            {count}
          </span>
        </a>
      ))}
    </nav>
  );
}

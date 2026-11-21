"use client";

import { useEffect, useState } from "react";

/** "On this page": plain anchors; the section at the top of the screen gets the accent line. */
export function Toc({
  label,
  items,
}: {
  label: string;
  items: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    // ponytail: last section to cross the top 30% wins; fine for a handful of sections
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const { id } of items) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items]);

  return (
    <nav
      aria-label={label}
      className="sticky top-6 hidden self-start pt-1 lg:block"
    >
      <p className="pb-3 pl-3.5 font-mono text-xs leading-4 tracking-[0.12em] text-text-secondary uppercase">
        {label}
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map(({ id, title }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={id === active ? "location" : undefined}
              className="block border-l-2 border-border py-1.5 pl-3.5 text-[15px] leading-[22px] text-text-secondary hover:text-fg aria-[current=location]:border-accent-text aria-[current=location]:text-fg"
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

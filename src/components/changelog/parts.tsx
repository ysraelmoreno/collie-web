/** `backticks` in copy become inline code. */
export function Rich({ text }: { text: string }) {
  return text.split("`").map((part, i) =>
    i % 2 ? (
      <code
        key={i}
        className="rounded-[4px] bg-surface-2 px-[5px] py-px font-mono text-[0.88em] [overflow-wrap:anywhere]"
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}

export function Tag({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-px font-mono text-[11px] leading-4 tracking-[0.06em] whitespace-nowrap uppercase ${className || "border-border text-text-secondary"}`}
    >
      {children}
    </span>
  );
}

const inlineCode =
  "[&_code]:rounded-[4px] [&_code]:bg-surface-2 [&_code]:px-[5px] [&_code]:font-mono [&_code]:text-[0.875em] [&_a]:text-accent-text [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-fg";

/** `html` is inline Markdown already escaped by toSegments (src/lib/blocks.ts). */
export function Html({
  html,
  as: Tag = "span",
  className = "",
}: {
  html: string;
  as?: "span" | "p" | "div";
  className?: string;
}) {
  return (
    <Tag
      className={`${inlineCode} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

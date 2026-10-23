"use client";

import { useState } from "react";

export function CopyButton({
  text,
  idle,
  done,
}: {
  text: string;
  idle: string;
  done: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure origin or denied): the commands stay selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="rounded-sm px-1 font-mono text-xs leading-[22px] text-accent-text hover:text-fg"
    >
      {copied ? done : idle}
    </button>
  );
}

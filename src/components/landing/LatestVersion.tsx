"use client";

import { useEffect, useState } from "react";
import { LATEST_RELEASE_API } from "@/lib/site";

/** Tag of the latest GitHub release; renders nothing until (or unless) it loads. */
export function LatestVersion({ label }: { label: string }) {
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(LATEST_RELEASE_API, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => {
        if (typeof r?.tag_name === "string") setTag(r.tag_name);
      })
      // No release yet, offline or rate limited: the button still links to the releases page.
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  if (!tag) return null;
  return (
    <p className="font-mono text-xs leading-[19px] text-muted">
      {label} {tag}
    </p>
  );
}

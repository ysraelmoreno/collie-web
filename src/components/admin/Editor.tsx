"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { previewMarkdown, savePost } from "@/app/(en)/admin/actions";
import { PostBody } from "@/components/blog/PostBody";
import type { Segment } from "@/lib/blocks";
import type { BlogLocale } from "@/lib/blog";

type Fields = {
  title: string;
  slug: string;
  date: string;
  summary: string;
  cover: string;
  draft: boolean;
  body: string;
};

const input =
  "w-full rounded-md border border-border bg-surface px-4 py-3 text-[15px] leading-[22px] text-fg outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex flex-col gap-2 text-[15px] leading-[22px] text-muted ${className ?? ""}`}
    >
      {label}
      {children}
    </label>
  );
}

export function Editor({
  locale,
  originalSlug,
  initial,
  initialSegments,
}: {
  locale: BlogLocale;
  originalSlug?: string;
  initial: Fields;
  initialSegments: Segment[];
}) {
  const [f, setF] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [orig, setOrig] = useState(originalSlug);
  const [segments, setSegments] = useState(initialSegments);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(f) !== JSON.stringify(saved);
  const set = <K extends keyof Fields>(k: K, v: Fields[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (f.body === saved.body && segments === initialSegments) return;
    let live = true;
    const t = setTimeout(() => {
      previewMarkdown(f.body).then((s) => live && setSegments(s));
    }, 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
    // segments/saved only gate the first run; re-render on body change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.body]);

  function save() {
    setError("");
    start(async () => {
      const res = await savePost({
        locale,
        slug: f.slug,
        originalSlug: orig,
        meta: {
          title: f.title,
          date: f.date,
          summary: f.summary,
          draft: f.draft,
          ...(f.cover ? { cover: f.cover } : {}),
        },
        body: f.body,
      });
      if (!res.ok) return setError(res.error);
      setSaved(f);
      setOrig(f.slug);
      // Keep the URL in step with the slug (also turns /new into the real post).
      history.replaceState(null, "", `/admin/${locale}/${f.slug}`);
    });
  }

  const lines = f.body.split("\n").length;

  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-[1312px] items-end justify-between gap-6 px-6 py-6 lg:px-0">
          <div>
            <Link
              href={`/admin?locale=${locale}`}
              className="block text-[15px] leading-[22px] text-accent"
            >
              ← Posts
            </Link>
            <div className="mt-1.5 flex items-center gap-3">
              <h1 className="text-[22px] leading-[30px] font-extrabold tracking-[-0.02em]">
                {f.title || "New post"}
              </h1>
              {f.draft && (
                <span className="rounded-sm border border-warn px-2 py-0.5 font-mono text-[11px] tracking-wider text-warn">
                  DRAFT
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5">
            {error && (
              <span role="alert" className="text-[14px] text-warn">
                {error}
              </span>
            )}
            {dirty && (
              <span className="flex items-center gap-2 text-[15px] text-muted">
                <span className="size-2 rounded-full bg-warn" />
                Unsaved changes
              </span>
            )}
            <label className="flex cursor-pointer items-center gap-2.5 text-[15px] leading-[22px]">
              <input
                type="checkbox"
                role="switch"
                checked={f.draft}
                onChange={(e) => set("draft", e.target.checked)}
                className="relative h-[22px] w-10 cursor-pointer appearance-none rounded-full bg-surface-2 transition-colors before:absolute before:top-[3px] before:left-[3px] before:size-4 before:rounded-full before:bg-fg before:transition-transform checked:bg-accent checked:before:translate-x-[18px] checked:before:bg-on-accent"
              />
              Draft
            </label>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="rounded-md bg-accent px-[22px] py-3 text-base leading-[26px] font-semibold text-on-accent disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1312px] gap-4 px-6 pt-6 pb-16 lg:px-0">
        <div className="grid gap-4 md:grid-cols-[1fr_300px_180px_220px]">
          <Field label="Title">
            <input
              className={input}
              value={f.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field label="Slug">
            <input
              className={`${input} font-mono`}
              value={f.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
          </Field>
          <Field label="Date">
            <input
              className={`${input} font-mono`}
              value={f.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </Field>
          <Field label="Language">
            <input
              className={`${input} font-mono`}
              readOnly
              value={`${locale.toUpperCase()} · content/blog/${locale}`}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_360px]">
          <Field label="Summary">
            <input
              className={input}
              value={f.summary}
              onChange={(e) => set("summary", e.target.value)}
            />
          </Field>
          <Field label="Cover (optional)">
            <input
              className={`${input} font-mono`}
              value={f.cover}
              placeholder="/blog/cover.jpg"
              onChange={(e) => set("cover", e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-2 grid gap-4 md:grid-cols-2">
          <section className="flex h-[680px] flex-col overflow-hidden rounded-md border border-border bg-surface">
            <div className="flex justify-between bg-surface-2 px-4 py-3 font-mono text-[12px] tracking-wider text-muted">
              <span>MARKDOWN</span>
              <span>{f.slug || "new"}.md</span>
            </div>
            <div className="flex flex-1 overflow-auto font-mono text-[13px] leading-[22px]">
              <div
                aria-hidden
                className="select-none py-5 pr-4 pl-3 text-right text-muted"
              >
                {Array.from({ length: lines }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                aria-label="Markdown"
                spellCheck={false}
                wrap="off"
                style={{ height: lines * 22 + 56 }}
                value={f.body}
                onChange={(e) => set("body", e.target.value)}
                className="min-w-0 flex-1 resize-none overflow-x-auto overflow-y-hidden bg-transparent py-5 pr-5 text-fg outline-none"
              />
            </div>
          </section>
          <section className="flex h-[680px] flex-col overflow-hidden rounded-md border border-border bg-bg">
            <div className="flex justify-between bg-surface-2 px-4 py-3 font-mono text-[12px] tracking-wider text-muted">
              <span>PREVIEW</span>
              <span>same styles as /blog</span>
            </div>
            <div className="flex-1 overflow-auto p-8">
              <h2 className="text-[32px] leading-10 font-extrabold tracking-[-0.03em]">
                {f.title}
              </h2>
              <p className="mt-5 text-[18px] leading-7 text-muted">
                {f.summary}
              </p>
              <div className="mt-5">
                <PostBody segments={segments} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

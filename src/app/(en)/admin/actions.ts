"use server";

import fs from "node:fs";
import path from "node:path";
import {
  assertSlug,
  blogPostPath,
  serializePost,
  type BlogLocale,
  type BlogMeta,
} from "@/lib/blog";
import { toSegments, type Segment } from "@/lib/blocks";

export type SaveInput = {
  locale: BlogLocale;
  slug: string;
  originalSlug?: string;
  meta: BlogMeta;
  body: string;
};

export type SaveResult = { ok: true } | { ok: false; error: string };

/** Writes a post to content/blog. Dev only: the admin routes are not in the build. */
export async function savePost(input: SaveInput): Promise<SaveResult> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("savePost is only available in next dev");
  }
  const { locale, slug, originalSlug, meta, body } = input;
  if (locale !== "en" && locale !== "pt") {
    return { ok: false, error: "Invalid language." };
  }
  try {
    assertSlug(slug);
    if (originalSlug) assertSlug(originalSlug);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
    return { ok: false, error: "Date must be YYYY-MM-DD." };
  }
  if (!meta.title.trim()) return { ok: false, error: "Title is required." };

  const root = path.join(process.cwd(), "content/blog");
  const file = blogPostPath(root, locale, slug);
  if (slug !== originalSlug && fs.existsSync(file)) {
    return { ok: false, error: `${slug}.md already exists.` };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, serializePost(meta, body));
  if (originalSlug && originalSlug !== slug) {
    fs.rmSync(blogPostPath(root, locale, originalSlug), { force: true });
  }
  return { ok: true };
}

/** Live preview. blog.ts imports node:fs, so the client can't call renderMarkdown directly. */
export async function previewMarkdown(body: string): Promise<Segment[]> {
  return toSegments(body, { strict: false });
}

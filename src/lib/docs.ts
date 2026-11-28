import fs from "node:fs";
import path from "node:path";
import { docsNav } from "../i18n/docs-nav.ts";
import { md, parseFrontmatter, slugifyHeading } from "./blog.ts";
import { toSegments, type Segment } from "./blocks.ts";

export { slugifyHeading };

type Locale = "en" | "pt";
const LOCALES: Locale[] = ["en", "pt"];

export type DocMeta = {
  title: string;
  description: string;
  status?: "preview";
  since?: string;
};
export type TocItem = { id: string; title: string; depth: 2 | 3 };
export type Doc = { meta: DocMeta; segments: Segment[]; toc: TocItem[] };
type Opts = { root?: string };

const defaultRoot = () => path.join(process.cwd(), "content/docs");
const file = (locale: Locale, slug: string) => `${locale}/${slug}.md`;

export const docSlugs = (): string[] => docsNav.flatMap((g) => g.pages);

export function docNeighbors(slug: string): { prev?: string; next?: string } {
  const all = docSlugs();
  const i = all.indexOf(slug);
  if (i < 0) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

function readMeta(source: string) {
  const { raw, body } = parseFrontmatter(source);
  // File line where the body starts, so block errors point into the .md file.
  const firstLine = source.split("\n").length - body.split("\n").length + 1;
  const meta: DocMeta = {
    title: String(raw.title ?? "").trim(),
    description: String(raw.description ?? "").trim(),
  };
  if (raw.status === "preview") meta.status = "preview";
  if (raw.since) meta.since = String(raw.since);
  return { meta, body, firstLine };
}

/** Frontmatter only (sidebar and prev/next labels). */
export const docMeta = (locale: Locale, slug: string, opts: Opts = {}) =>
  readMeta(
    fs.readFileSync(
      path.join(opts.root ?? defaultRoot(), file(locale, slug)),
      "utf8",
    ),
  ).meta;

// Inline Markdown in a heading, shown as plain text in "On this page".
const plainHeading = (t: string) =>
  t.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[`*_~]/g, "");

export function getDoc(locale: Locale, slug: string, opts: Opts = {}): Doc {
  if (!docSlugs().includes(slug)) throw new Error(`Unknown doc: ${slug}`);
  const rel = file(locale, slug);
  const { meta, body, firstLine } = readMeta(
    fs.readFileSync(path.join(opts.root ?? defaultRoot(), rel), "utf8"),
  );
  const toc: TocItem[] = [];
  for (const t of md.lexer(body))
    if (t.type === "heading" && (t.depth === 2 || t.depth === 3))
      toc.push({
        id: slugifyHeading(t.text),
        title: plainHeading(t.text),
        depth: t.depth,
      });
  const dup = toc.find((x, i) => toc.findIndex((y) => y.id === x.id) !== i);
  if (dup) throw new Error(`${rel}: duplicate heading anchor #${dup.id}`);
  return {
    meta,
    segments: toSegments(body, { strict: true, file: rel, firstLine }),
    toc,
  };
}

/** Throws with every problem at once: missing locale file, file outside the nav, empty title/description. */
export function assertDocs(opts: Opts = {}): void {
  const root = opts.root ?? defaultRoot();
  const slugs = docSlugs();
  const problems: string[] = [];
  for (const locale of LOCALES) {
    for (const slug of slugs) {
      const rel = file(locale, slug);
      const abs = path.join(root, rel);
      if (!fs.existsSync(abs)) {
        problems.push(`${rel} missing`);
        continue;
      }
      const { meta } = readMeta(fs.readFileSync(abs, "utf8"));
      if (!meta.title) problems.push(`${rel}: empty title`);
      if (!meta.description) problems.push(`${rel}: empty description`);
    }
    const dir = path.join(root, locale);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir, { recursive: true }) as string[]) {
      if (!f.endsWith(".md")) continue;
      const slug = f.slice(0, -3).split(path.sep).join("/");
      if (!slugs.includes(slug))
        problems.push(`${file(locale, slug)} not in src/i18n/docs-nav.ts`);
    }
  }
  if (problems.length)
    throw new Error(`content/docs:\n  ${problems.join("\n  ")}`);
}

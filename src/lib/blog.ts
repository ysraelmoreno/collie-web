import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

export type BlogLocale = "en" | "pt";
export type BlogMeta = {
  title: string;
  date: string;
  summary: string;
  draft: boolean;
  cover?: string;
};
export type BlogPost = BlogMeta & {
  slug: string;
  locale: BlogLocale;
  body: string;
};
type Opts = { drafts?: boolean; root?: string };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const defaultRoot = () => path.join(process.cwd(), "content/blog");

export function assertSlug(slug: string): void {
  if (!SLUG.test(slug))
    throw new Error(`Invalid slug: ${JSON.stringify(slug)}`);
}

export function blogPostPath(root: string, locale: BlogLocale, slug: string) {
  assertSlug(slug);
  return path.join(root, locale, `${slug}.md`);
}

// Frontmatter: `key: value` lines; strings are JSON-quoted so `:` and quotes survive.
export function parsePost(source: string): { meta: BlogMeta; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!m) throw new Error("Missing frontmatter");
  const raw: Record<string, string | boolean> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    raw[key] = v.startsWith('"')
      ? JSON.parse(v)
      : v === "true"
        ? true
        : v === "false"
          ? false
          : v;
  }
  const meta: BlogMeta = {
    title: String(raw.title ?? ""),
    date: String(raw.date ?? ""),
    summary: String(raw.summary ?? ""),
    draft: raw.draft === true,
  };
  if (typeof raw.cover === "string" && raw.cover) meta.cover = raw.cover;
  return { meta, body: m[2].replace(/^\r?\n/, "") };
}

export function serializePost(meta: BlogMeta, body: string): string {
  const lines = [
    `title: ${JSON.stringify(meta.title)}`,
    `date: ${meta.date}`,
    `summary: ${JSON.stringify(meta.summary)}`,
    `draft: ${meta.draft}`,
  ];
  if (meta.cover) lines.push(`cover: ${JSON.stringify(meta.cover)}`);
  return `---\n${lines.join("\n")}\n---\n\n${body}`;
}

export function listPosts(locale: BlogLocale, opts: Opts = {}): BlogPost[] {
  const dir = path.join(opts.root ?? defaultRoot(), locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.slice(0, -3);
      const { meta, body } = parsePost(
        fs.readFileSync(path.join(dir, f), "utf8"),
      );
      return { ...meta, slug, locale, body };
    })
    .filter((p) => opts.drafts || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPost(locale: BlogLocale, slug: string, opts: Opts = {}) {
  return listPosts(locale, opts).find((p) => p.slug === slug);
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Fenced code gets the design's header: ```lang file/name.ext → label is the file name, else the language.
const md = new Marked({
  renderer: {
    code({ text, lang }) {
      const [language, ...file] = (lang ?? "").trim().split(/\s+/);
      const label = file.join(" ") || language;
      const head = label ? `<div data-code-label>${esc(label)}</div>` : "";
      return `<figure data-code>${head}<pre><code>${esc(text)}</code></pre></figure>`;
    },
  },
});

export function renderMarkdown(body: string): string {
  return md.parse(body, { async: false });
}

export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

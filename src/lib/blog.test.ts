import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  assertSlug,
  listPosts,
  parsePost,
  renderMarkdown,
  serializePost,
  type BlogMeta,
} from "./blog.ts";

function tmpRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "blog-"));
}

function write(root: string, locale: string, slug: string, src: string) {
  fs.mkdirSync(path.join(root, locale), { recursive: true });
  fs.writeFileSync(path.join(root, locale, `${slug}.md`), src);
}

const post = (date: string, draft: boolean) =>
  `---\ntitle: "T ${date}"\ndate: ${date}\nsummary: "s"\ndraft: ${draft}\n---\n\nbody\n`;

test("round-trips colons and quotes", () => {
  const meta: BlogMeta = {
    title: 'A: "b"',
    date: "2026-11-22",
    summary: "x: y",
    draft: true,
    cover: "/blog/a.jpg",
  };
  assert.deepEqual(parsePost(serializePost(meta, "## Hi\n")), {
    meta,
    body: "## Hi\n",
  });
});

test("parses draft false and missing cover", () => {
  const { meta } = parsePost(post("2026-11-22", false));
  assert.equal(meta.cover, undefined);
  assert.equal(meta.draft, false);
  assert.equal(meta.date, "2026-11-22");
});

test("drafts hidden by default", () => {
  const root = tmpRoot();
  write(root, "en", "a", post("2026-11-01", false));
  write(root, "en", "b", post("2026-11-02", true));
  assert.equal(listPosts("en", { root }).length, 1);
  assert.equal(listPosts("en", { root, drafts: true }).length, 2);
});

test("sorted by date desc", () => {
  const root = tmpRoot();
  write(root, "en", "old", post("2026-11-01", false));
  write(root, "en", "new", post("2026-11-20", false));
  assert.equal(listPosts("en", { root })[0].date, "2026-11-20");
});

test("missing dir yields []", () => {
  assert.deepEqual(listPosts("pt", { root: tmpRoot() }), []);
});

test("rejects bad slugs", () => {
  for (const bad of ["../x", "a/b", "A", ""]) {
    assert.throws(() => assertSlug(bad), bad);
  }
  assert.doesNotThrow(() => assertSlug("why-markdown"));
});

test("code block header: filename wins over language, escapes html", () => {
  const md = "```md content/blog/en/a.md\n<b>&\n```\n";
  const html = renderMarkdown(md);
  assert.match(html, /data-code-label>content\/blog\/en\/a\.md</);
  assert.match(html, /&lt;b&gt;&amp;/);
  assert.match(renderMarkdown("```ts\nx\n```"), /data-code-label>ts</);
  assert.doesNotMatch(renderMarkdown("```\nx\n```"), /data-code-label/);
});

test("image with title renders figure", () => {
  const html = renderMarkdown('![a](/x.jpg "Cap")');
  assert.match(html, /<figure data-image>/);
  assert.match(html, /<img src="\/x\.jpg" alt="a"/);
  assert.match(html, /<figcaption>Cap<\/figcaption>/);
  assert.doesNotMatch(renderMarkdown("![a](/x.jpg)"), /figcaption/);
});

test("quote attribution", () => {
  const html = renderMarkdown("> Text\n>\n> — Who");
  assert.match(
    html,
    /<blockquote>[\s\S]*<cite>Who<\/cite>[\s\S]*<\/blockquote>/,
  );
  assert.doesNotMatch(renderMarkdown("> Text — not last"), /<cite>/);
});

test("table wrapped", () => {
  const html = renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |");
  assert.match(html, /<div data-table><table>[\s\S]*<\/table>\s*<\/div>/);
});

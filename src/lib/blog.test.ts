import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  assertSlug,
  listPosts,
  parsePost,
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

import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "./blog.ts";
import { toSegments, type Segment } from "./blocks.ts";

const strict = { strict: true, file: "en/x.md" };
const lenient = { strict: false, file: "en/x.md" };
const blocks = (s: Segment[]) =>
  s.flatMap((x) => (x.kind === "block" ? [x.block] : []));

test("plain markdown is one html segment", () => {
  const s = toSegments("# Hi\n\ntext", strict);
  assert.equal(s.length, 1);
  assert.equal(s[0].kind, "html");
});

test("normal code fence unchanged", () => {
  for (const src of [
    "```ts\nlet a = 1\n```\n",
    "```md content/x.md\n# x\n```\n",
  ]) {
    const s = toSegments(src, strict);
    assert.deepEqual(s, [{ kind: "html", html: renderMarkdown(src) }]);
  }
});

test("unknown name stays code", () => {
  const src = "```widget\na: 1\n```\n";
  assert.deepEqual(toSegments(src, strict), [
    { kind: "html", html: renderMarkdown(src) },
  ]);
});

test("callout parses", () => {
  const s = toSegments(
    "```callout\nkind: note\ntitle: T\nbody: some **b** text\n```\n",
    strict,
  );
  const [b] = blocks(s);
  assert.equal(b.name, "callout");
  if (b.name === "callout") {
    assert.equal(b.kind, "note");
    assert.match(b.body, /<strong>b<\/strong>/);
  }
});

test("stats items 2–4", () => {
  const mk = (n: number) =>
    "```stats\nitems:\n" +
    Array.from({ length: n }, (_, i) => `  - value: "${i}"\n    label: l`).join(
      "\n",
    ) +
    "\n```\n";
  for (const n of [1, 5])
    assert.throws(() => toSegments(mk(n), strict), /stats\.items/);
  assert.equal(blocks(toSegments(mk(2), strict)).length, 1);
});

test("stats from/to", () => {
  const [b] = blocks(
    toSegments("```stats\nfrom: 8s\nto: 1s\nlabel: Round trip\n```\n", strict),
  );
  assert.deepEqual(b.name === "stats" && "from" in b && [b.from, b.to], [
    "8s",
    "1s",
  ]);
});

test("steps, compare and tabs parse", () => {
  const src = [
    "```steps\nitems:\n  - title: One\n    command: collie x\n```",
    "```compare\nbefore:\n  title: Before\n  items: [a]\nafter:\n  title: After\n  items: [b]\n```",
    "```tabs\ntabs:\n  - label: Android\n    lang: sh\n    code: adb\n  - label: iOS\n    body: text\n```",
  ].join("\n\n");
  assert.deepEqual(
    blocks(toSegments(src, strict)).map((b) => b.name),
    ["steps", "compare", "tabs"],
  );
});

test("tabs needs code or body", () => {
  const src = "```tabs\ntabs:\n  - label: A\n  - label: B\n    code: x\n```\n";
  assert.throws(() => toSegments(src, strict), /tabs\.tabs\[0\]/);
  const both =
    "```tabs\ntabs:\n  - {label: A, code: x, body: y}\n  - {label: B, code: x}\n```\n";
  assert.throws(() => toSegments(both, strict), /tabs\.tabs\[0\]/);
});

test("unknown key is an error", () => {
  assert.throws(
    () => toSegments("```callout\nkind: note\nbody: x\nfoo: 1\n```\n", strict),
    /callout\.foo/,
  );
});

test("bad yaml strict throws with line", () => {
  const src = "one\ntwo\nthree\n```callout\nkind: [oops\n```\n";
  assert.throws(() => toSegments(src, strict), /en\/x\.md:4 /);
  const tab = "```callout\nkind:\tnote\n```\n";
  assert.throws(() => toSegments(tab, strict), /:1 callout/);
});

test("lenient yields error segment and keeps rest", () => {
  const src = "before\n\n```stats\nitems: []\n```\n\nafter\n";
  const s = toSegments(src, lenient);
  assert.deepEqual(
    s.map((x) => x.kind),
    ["html", "error", "html"],
  );
  const e = s[1];
  assert.ok(
    e.kind === "error" && e.line === 3 && /stats\.items/.test(e.message),
  );
});

test("inline html escaped", () => {
  const [b] = blocks(
    toSegments(
      '```callout\nkind: note\nbody: "<script>alert(1)</script> `ok`"\n```\n',
      strict,
    ),
  );
  assert.ok(
    b.name === "callout" &&
      !b.body.includes("<script") &&
      b.body.includes("<code>ok</code>"),
  );
});

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  assertDocs,
  docNeighbors,
  docSlugs,
  getDoc,
  slugifyHeading,
} from "./docs.ts";

const doc = (body = "Intro.\n") =>
  `---\ntitle: "Fields"\ndescription: "d"\nstatus: preview\nsince: 0.3.0\n---\n\n${body}`;

function write(root: string, rel: string, src: string) {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), src);
}

/** Every nav page in both locales. */
function fullRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "docs-"));
  for (const l of ["en", "pt"])
    for (const s of docSlugs()) write(root, `${l}/${s}.md`, doc());
  return root;
}

test("complete tree passes", () => {
  assert.doesNotThrow(() => assertDocs({ root: fullRoot() }));
});

test("missing locale file fails with its path", () => {
  const root = fullRoot();
  fs.rmSync(path.join(root, "pt/features/fields.md"));
  assert.throws(() => assertDocs({ root }), /pt\/features\/fields\.md missing/);
});

test("file outside the nav fails", () => {
  const root = fullRoot();
  write(root, "en/features/ghost.md", doc());
  assert.throws(
    () => assertDocs({ root }),
    /en\/features\/ghost\.md not in src\/i18n\/docs-nav\.ts/,
  );
});

test("empty title fails", () => {
  const root = fullRoot();
  write(
    root,
    "en/features/fields.md",
    '---\ntitle: ""\ndescription: "d"\n---\n',
  );
  assert.throws(
    () => assertDocs({ root }),
    /en\/features\/fields\.md: empty title/,
  );
});

test("toc and heading anchors", () => {
  const root = fullRoot();
  write(
    root,
    "pt/features/fields.md",
    doc("Intro.\n\n## Sandbox e rede\n\ntexto\n\n#### fundo\n"),
  );
  const d = getDoc("pt", "features/fields", { root });
  assert.deepEqual(d.toc, [
    { id: "sandbox-e-rede", title: "Sandbox e rede", depth: 2 },
  ]);
  const html = d.segments
    .map((s) => (s.kind === "html" ? s.html : ""))
    .join("");
  assert.match(html, /<h2 id="sandbox-e-rede">Sandbox e rede<\/h2>/);
  assert.deepEqual(d.meta, {
    title: "Fields",
    description: "d",
    status: "preview",
    since: "0.3.0",
  });
});

test("slugifyHeading drops accents and punctuation", () => {
  assert.equal(
    slugifyHeading("Ação: `collie loop`, já!"),
    "acao-collie-loop-ja",
  );
});

test("duplicate anchors fail", () => {
  const root = fullRoot();
  write(root, "en/features/fields.md", doc("## A\n\n## A\n"));
  assert.throws(() => getDoc("en", "features/fields", { root }), /#a/);
});

test("invalid block fails with file and line", () => {
  const root = fullRoot();
  write(
    root,
    "pt/features/fields.md",
    doc("Intro.\n\n```callout\nkind: nope\nbody: x\n```\n"),
  );
  assert.throws(
    () => getDoc("pt", "features/fields", { root }),
    /pt\/features\/fields\.md:10 callout\.kind/,
  );
});

test("neighbors", () => {
  const [first, second] = docSlugs();
  assert.deepEqual(docNeighbors(first), { prev: undefined, next: second });
  assert.equal(docNeighbors(docSlugs().at(-1)!).next, undefined);
});

import { parse } from "yaml";
import { Marked, type Token, type Tokens } from "marked";
import { md } from "./blog.ts";

export type Inline = string; // HTML from inline Markdown, raw HTML escaped
export type CalloutKind = "note" | "status" | "vision" | "warning";
export type Block =
  | { name: "callout"; kind: CalloutKind; title?: Inline; body: Inline }
  | { name: "stats"; items: { value: string; label: Inline; note?: Inline }[] }
  | { name: "stats"; from: string; to: string; label: Inline; note?: Inline }
  | {
      name: "steps";
      items: { title: Inline; command?: string; result?: Inline }[];
    }
  | {
      name: "compare";
      before: { title: Inline; items: Inline[] };
      after: { title: Inline; items: Inline[] };
    }
  | {
      name: "tabs";
      tabs: { label: string; lang?: string; code?: string; body?: Inline }[];
    };
export type Segment =
  | { kind: "html"; html: string }
  | { kind: "block"; block: Block }
  | { kind: "error"; message: string; line: number };

export const BLOCK_NAMES: readonly string[] = [
  "callout",
  "stats",
  "steps",
  "compare",
  "tabs",
];

class FieldError extends Error {
  field: string;
  constructor(field: string, msg: string) {
    super(msg);
    this.field = field;
  }
}
const fail = (field: string, msg: string): never => {
  throw new FieldError(field, msg);
};

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function obj(v: unknown, at: string, keys: string[]): Obj {
  if (!isObj(v)) return fail(at, "must be a mapping");
  for (const k of Object.keys(v))
    if (!keys.includes(k)) fail(`${at}.${k}`, "unknown key");
  return v;
}
function str(v: unknown, at: string, num = false): string {
  if (typeof v === "string" && v.trim()) return v;
  if (num && typeof v === "number") return String(v);
  return fail(at, "must be a non-empty string");
}
const optStr = (o: Obj, k: string, at: string, num = false) =>
  o[k] === undefined ? undefined : str(o[k], `${at}.${k}`, num);
function list(v: unknown, at: string, min: number, max = Infinity): unknown[] {
  if (!Array.isArray(v)) return fail(at, "must be a list");
  if (v.length < min || v.length > max)
    fail(
      at,
      max === Infinity
        ? `needs at least ${min}`
        : `needs ${min}–${max} entries`,
    );
  return v;
}

// Raw HTML is shown as text, so inline Markdown can't inject tags. Escaping in the
// renderer (not the source) keeps `a > b` in a code span from showing `&gt;`.
const escHtml = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const safe = new Marked({ renderer: { html: ({ text }) => escHtml(text) } });
const inline = (s: string): string => safe.parseInline(s, { async: false });
const il = (v: unknown, at: string) => inline(str(v, at));
const optIl = (o: Obj, k: string, at: string) =>
  o[k] === undefined ? undefined : il(o[k], `${at}.${k}`);

const KINDS: CalloutKind[] = ["note", "status", "vision", "warning"];

function validate(name: string, data: unknown): Block {
  switch (name) {
    case "callout": {
      const o = obj(data, name, ["kind", "title", "body"]);
      const kind = o.kind as CalloutKind;
      if (!KINDS.includes(kind))
        fail("callout.kind", `must be one of ${KINDS.join(", ")}`);
      return {
        name,
        kind,
        title: optIl(o, "title", name),
        body: il(o.body, "callout.body"),
      };
    }
    case "stats": {
      const o = obj(data, name, ["items", "from", "to", "label", "note"]);
      if (o.items !== undefined) {
        if (
          o.from !== undefined ||
          o.to !== undefined ||
          o.label !== undefined ||
          o.note !== undefined
        )
          fail("stats.items", "can't be combined with from/to");
        const items = list(o.items, "stats.items", 2, 4).map((it, i) => {
          const at = `stats.items[${i}]`;
          const x = obj(it, at, ["value", "label", "note"]);
          return {
            value: str(x.value, `${at}.value`, true),
            label: il(x.label, `${at}.label`),
            note: optIl(x, "note", at),
          };
        });
        return { name, items };
      }
      return {
        name,
        from: str(o.from, "stats.from", true),
        to: str(o.to, "stats.to", true),
        label: il(o.label, "stats.label"),
        note: optIl(o, "note", name),
      };
    }
    case "steps": {
      const o = obj(data, name, ["items"]);
      const items = list(o.items, "steps.items", 1).map((it, i) => {
        const at = `steps.items[${i}]`;
        const x = obj(it, at, ["title", "command", "result"]);
        return {
          title: il(x.title, `${at}.title`),
          command: optStr(x, "command", at),
          result: optIl(x, "result", at),
        };
      });
      return { name, items };
    }
    case "compare": {
      const o = obj(data, name, ["before", "after"]);
      const side = (k: "before" | "after") => {
        const at = `compare.${k}`;
        const s = obj(o[k], at, ["title", "items"]);
        return {
          title: il(s.title, `${at}.title`),
          items: list(s.items, `${at}.items`, 1).map((v, i) =>
            il(v, `${at}.items[${i}]`),
          ),
        };
      };
      return { name, before: side("before"), after: side("after") };
    }
    default: {
      const o = obj(data, name, ["tabs"]);
      const tabs = list(o.tabs, "tabs.tabs", 2, 6).map((t, i) => {
        const at = `tabs.tabs[${i}]`;
        const x = obj(t, at, ["label", "lang", "code", "body"]);
        if ((x.code === undefined) === (x.body === undefined))
          fail(at, "needs exactly one of code or body");
        return {
          label: str(x.label, `${at}.label`),
          lang: optStr(x, "lang", at),
          code: optStr(x, "code", at),
          body: optIl(x, "body", at),
        };
      });
      return { name: "tabs", tabs };
    }
  }
}

export function toSegments(
  body: string,
  opts: { strict: boolean; file?: string; firstLine?: number },
): Segment[] {
  const tokens = md.lexer(body);
  const out: Segment[] = [];
  let pending: Token[] = [];
  let line = opts.firstLine ?? 1;
  const flush = () => {
    if (!pending.length) return;
    const list = Object.assign(pending, { links: tokens.links });
    out.push({ kind: "html", html: md.parser(list) });
    pending = [];
  };
  for (const t of tokens) {
    const name =
      t.type === "code" ? ((t as Tokens.Code).lang ?? "").trim() : "";
    if (BLOCK_NAMES.includes(name)) {
      flush();
      try {
        let data: unknown;
        try {
          data = parse((t as Tokens.Code).text);
        } catch (e) {
          fail(name, `invalid YAML: ${(e as Error).message.split("\n")[0]}`);
        }
        out.push({ kind: "block", block: validate(name, data) });
      } catch (e) {
        if (!(e instanceof FieldError)) throw e;
        const message = `${opts.file ?? "post"}:${line} ${e.field}: ${e.message}`;
        if (opts.strict) throw new Error(message);
        out.push({ kind: "error", message, line });
      }
    } else pending.push(t);
    line += (t.raw.match(/\n/g) ?? []).length;
  }
  flush();
  return out;
}

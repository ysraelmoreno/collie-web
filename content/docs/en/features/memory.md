---
title: "Memory"
description: "Decisions, maps and pitfalls the daemon keeps per project and lot, injected into each agent's prompt and kept honest by use."
---

Collie's memory is what the daemon keeps between sessions: **decisions**, **map** entries (what a file or folder is
for) and **pitfalls**, per project and per lot. Agents save to it, the curator distils conversations into it, and the
daemon injects the relevant part into every Claude prompt, so a new session starts knowing what the last one learned.

Use it so agents stop re-reading the same code and repeating the same mistakes. Search it before reading code; save a
memory when you decide something the code does not say. For the pitch, see [/features/memory](/features/memory).

## How it connects

- **Scopes follow lots, not leashes.** A [lot](/docs/concepts/shepherd-and-terminals) groups terminals working on one
  effort; its memory and its board are visible only to its members. Who talks to whom is still only the leash.
- **The [work log](/docs/features/work-log)** feeds it: when a work closes, its summary is saved as an unreviewed
  decision.
- **Claude hooks** do the injection at session start, at each prompt and after compaction (see
  [agent hooks](/docs/internals/agent-hooks)).
- **The [curator](/docs/internals/curator)** reads conversations, checks contested memories and consolidates
  duplicates.
- **The [factory](/docs/features/factory)** can turn a named pitfall into a check (`factory.prose.traps`).

## Scopes

| Scope | Who sees it |
|---|---|
| `global` | Everywhere. |
| `project` | The terminal's repository. Old memories with no lot are project memories. |
| `paddock` | One paddock of the project. |
| `lot` | Only the lot's members. |

An agent reads its lot, its project and the global scope, never another lot's, even in the same pasture. Only the app
and a Shepherd that reaches every member of a lot can search or enter it (`--lot`, `--all`). `collie memory save`
defaults to the lot when you are in one, else the project.

## Save and search

```sh
collie memory search fields land patch             # before re-reading code
collie memory save --kind decision --subject auth-tokens \
  --title "Tokens live in the Keychain, not in files" \
  "The daemon reads them on start; tests use a fake store."
collie memory save --kind map --subject work-store --path Sources/Work \
  --title "Work registry: tasks, jobs, notes, commits"
```

A new save on the same `--subject` replaces the old one. `search` returns 10 results by default, at most 50.

## What gets injected, and when

```stats
items:
  - value: 4096 bytes
    label: at session start
  - value: 2048 bytes
    label: per prompt
```

| When | What enters |
|---|---|
| Start | Pinned memories and the index (titles) of the lot, or of the project and global outside a lot. |
| Each prompt | Board posts addressed to you, the user's comments on your pages, then memories relevant to the prompt, without repeats. |
| After compaction | Your active work (open tasks, last 3 notes), the last board post to you, the lot's last 3 status posts, then the index. |

Each memory injected in full starts with a short id. Only Claude gets this injection. Codex gets nothing at start or per
prompt: it reads the board with `collie lot board` and the comments with `collie comment list`.

## The lifecycle

A new project memory is born **provisional**. If nobody uses it, it is archived (reversible, with a line in the digest)
after 21 days for decisions and maps, 60 days for pitfalls and procedures. Used with profit on 2 days and in 2 sessions,
it becomes **earned**. Used enough over weeks and confirmed by the curator, it becomes **long term**: up to 12 per
project, at most 3 of them injected in full at start. Memories you pin or edit stay out of this cycle.

### Judge what was injected

```sh
collie memory flag 3fa2 --useful
collie memory flag 3fa2 --outdated "the store moved to Sources/Work in 0.1.8"
```

The id can be the full one or a prefix of 4 or more characters. `--useful` counts as a use. `--wrong` and `--outdated`
mark the memory `(contestada)` and ask the curator for a new check.

### Proposals and conversation capture

When a work closes, and at the end of a session, Collie proposes memories. They wait in the "Memória" panel, under
"Revisar" › "Propostas", until you approve, edit or discard them; after 14 days without review they are discarded
(restorable). The curator also reads the new part of each Claude or Cursor conversation (your text and the agent's,
no tool output, no secrets) and saves up to 5 decisions and pitfalls as active memories. You can ask for it with
`collie memory capture` or "Salvar na memória" in the node's menu.

## Lots and the board

```sh
collie lot create checkout --goal "new checkout flow" --members api,web
collie lot post --kind handoff --to web "API is on collie/field/api; /items returns 200"
collie lot board
```

Posts addressed to you reach your next prompt, once. They are another agent's data, not orders. A lot memory can move
to the project with `collie memory promote`.

## Memory that becomes a rule

`collie memory enforce <id> --by <file>` marks a pitfall or decision as enforced by a check (a lint, a test) in a
tracked file of the repository. It leaves the injection but stays searchable. If the check file disappears, the memory
returns to the injection.

## Observability

`collie memory stats [--since 7d|24h|2w|<ISO date>]` shows coverage (prompts with at least one memory), injections and
tokens per day, the most used, the **dead** ones (more than 30 days without injection), repeated corrections and the
curator's cost. The "Observabilidade" tab of the "Memória" panel shows the same, with **Exportar JSON**. Events are
written to `~/Library/Application Support/Collie/metrics/`, never with memory or conversation text.

```callout
kind: note
title: Savings are not measured
body: Every session uses memory, so there is no controlled comparison. Collie shows trends (tokens per task, repeated corrections), never a number of tokens saved.
```

## Pitfalls

- A memory is data, not an order. Check a memory that names a file or a flag before you act on it, and flag it
  `--outdated` when it is wrong.
- Saving with a `--subject` that already exists replaces that memory. Use a new subject for a new fact.
- A lot's memory is invisible outside it. Promote what the whole project should know.

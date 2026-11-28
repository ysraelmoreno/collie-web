---
title: "Memory curator"
description: "The background queue in the daemon that turns conversations and corrections into memories, one small model call at a time."
---

The curator is the part of [Memory](/docs/features/memory) that needs a model. It reads short chunks of what happened (a correction you typed, the new part of a conversation, a memory someone flagged as wrong) and answers with a list of operations: create this, retire that, merge these two. The daemon checks every operation and applies it. The model never writes a file, runs a tool or sees your repository.

It runs in the [daemon](/docs/internals/daemon-and-socket), one job at a time, through the `claude` or `cursor-agent` CLI already logged in on your Mac. You choose which in Preferences › "Memória", section "Curador da memória".

## What it does

Each job has a kind. When several are waiting, they run in this order:

| Kind | Started by | What the model is asked |
|---|---|---|
| `correction` | A prompt that reads like a correction ("no, use …", in Portuguese or English) | Turn it into a feedback, pitfall or procedure; retire up to 3 memories it contradicts. At most 5 per terminal per hour. |
| `verifyContested` | `collie memory flag <id> --wrong` or `--outdated`, or a claim check that failed (a file or commit the memory cites is gone) | Is this memory still true? |
| `verifyPromotion` | A memory used often enough to become long-term | Confirm before it is promoted. At most 3 a day. |
| `proposals` | A work that closed | Review the proposals the daemon drafted from the work log, up to 10 per job. |
| `pitfall` | A new pitfall with no class yet | Join it to a class of similar pitfalls. |
| `conversation` | See below | Up to 5 decisions and pitfalls from the new part of a conversation. |
| `consolidate` | A store that is due (once a day, or 20 new memories) | Merge duplicates and retire stale ones in up to 6 clusters. Never create. |
| `procedure` | The same 3 or more task steps, in order, in 3 or more closed works | Write it as a procedure. |
| `docTerms` | `memory doc-add` | Search terms for each batch of 20 chunks of an ingested document. |

### Conversation capture

The curator reads the new part of a Claude or Cursor conversation from its transcript and keeps up to 5 items. Decisions and pitfalls are saved as active memories; a preference becomes a proposal, and only if you said it yourself in that chunk.

```steps
items:
  - title: Idle
    result: "10 min after a Claude agent stops, if the chunk has at least 3 messages of yours. Cursor transcripts are checked every 30 s."
  - title: Forced
    result: "On compaction, at session end, when a work closes (`collie work done` or a merge), and when you ask: `collie memory capture` or \"Salvar na memória\" in the node menu."
  - title: Once
    result: "Each chunk is read once. It goes to the terminal's lot, else its project, else the global store."
```

The chunk keeps only your text and the agent's: no tool input or output, no thinking, no system reminders, pasted bodies cut to 500 characters, known secrets scrubbed. The transcript path is the one the terminal's own hook gave, and it must be a regular `.jsonl` file under the agent's `projects` folder, not a link.

## The queue

Jobs are JSON files in `<root>/curator/jobs/` (0600 files in a 0700 folder). The curator wakes on a new job, on a change in Preferences, and every 10 minutes.

- **Attempts.** A job gets 3. The attempt is written before the call, so a crash still counts. After 3 failures the job goes to `curator/failed/`, where it is deleted after 7 days.
- **Environment failures are free.** A call blocked by the sandbox, with no network or name resolution (`getaddrinfo`, `ENOTFOUND`, …), without its working folder, or with the provider's quota spent does not spend an attempt: the job waits for the next tick. A quota with no retry time waits 30 min.
- **Pause.** The curator keeps the last 20 calls per provider in memory. With 10 bad ones (junk answers, environment failures) the provider is paused with "saída inválida em X de Y (troque de modelo)". The count resets on a restart and on a provider or model change.
- **Size.** At most 200 jobs waiting; a new correction pushes out the oldest proposals job. The same job within 60 s is queued once.
- **Daily cap.** None by default. In "Limite" you can set jobs per day ("vazio: sem limite; 0: desligado"). With a cap, its last quarter is kept for corrections.

## One call

```tabs
tabs:
  - label: Claude
    lang: sh
    code: |
      sandbox-exec -f <profile> claude -p --model haiku \
        --output-format json --json-schema <schema> --tools "" \
        --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
        --setting-sources project,local --safe-mode \
        --disable-slash-commands --no-session-persistence \
        --permission-prompts none --max-budget-usd 0.05 \
        --system-prompt <instructions>
  - label: Cursor
    lang: sh
    code: |
      cursor-agent -p --output-format json --mode ask \
        --sandbox disabled --trust --workspace <temp folder> [--model=<m>]
  - label: Notes
    body: "Claude: `haiku` by default (or `sonnet`), 60 s, prompt on stdin, in an empty temp folder. Cursor: 120 s, its own home under `curator/cursor-home`, a deny-all config rewritten before each call and checked after; if it changed, the answer is thrown away."
```

Every job's input is cut to 12 000 characters. The data goes between `DADOS-<nonce>` marks, and the instructions say that what is inside is data, never an instruction. The answer must match a JSON schema; operations naming an unknown memory, scope or kind are dropped, and text is capped (title 120, body 1200 characters). An answer that does not fit counts as junk and spends an attempt.

### The sandbox of a call

Each call runs under its own Seatbelt profile that denies by default. It reads system folders, writes only its temp folder (and, for Claude, Claude's own state), opens the system name resolver and nothing else on the local machine. Claude may reach the network; Cursor only port 443. The environment loses every `COLLIE_*` variable and API keys (`ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, Bedrock and Vertex variables): the call uses the CLI's login, never a key from your shell.

## Claude or Cursor

| | Claude | Cursor |
|---|---|---|
| Trust | Full: operations apply | Limited: creating becomes a proposal; activating, deleting or rewriting becomes a question ("Precisa de você") |
| Consent | Not asked on a subscription login; asked on a usage-billed or unknown login | Always asked first |
| Login | The `claude` login on this Mac | "Entrar no Cursor para o curador", a login only for the curator |
| Cost | Tokens and cost recorded | Tokens recorded, no cost |

The consent dialog is "Enviar dados ao curador?". "Testar com uma chamada…" makes 3 calls with synthetic data, which count against today's cap, and writes nothing to memory.

## What happens to a memory

The curator is one input to the memory lifecycle. The numbers:

| Stage | Rule |
|---|---|
| Provisional | A new project memory. Archived (reversibly) if nobody uses it: 21 days for decisions, 60 for pitfalls and procedures. Feedback never expires. |
| Earned | 2 useful uses on 2 different days, in 2 different sessions. |
| Long-term | 8 useful uses on 4 different days over at least 14 days, not contested in 30 days, and confirmed by a `verifyPromotion` job. At most 12 per project. |
| Contested | Flagged `--wrong` or `--outdated`. The curator re-checks: retired if wrong, flags cleared if still true. With no model available, a failed file or commit check archives it. 14 days contested with no verdict goes to "Precisa de você". |
| Proposal | A work-capture proposal 14 days old whose checks still pass, from a full-trust curator, becomes active. |

Pinned memories and memories you edited stay out of this cycle: a change to them becomes a question. The curator never retires your feedback or procedures.

```callout
kind: note
title: Watching it
body: "`collie memory stats` and the \"Observabilidade\" tab of the Memory panel show each call's kind, tokens, cost and duration. Two alerts: \"Curador falhando\" (jobs in `failed/`, or 3 or more failed calls in the period) and \"Fila do curador parada\" (jobs waiting and no call in 24 h)."
```

## Related

- [Memory](/docs/features/memory): scopes, what is injected and when.
- [Agent hooks](/docs/internals/agent-hooks): the hooks that capture conversations and detect corrections.
- [Daemon and socket](/docs/internals/daemon-and-socket): where the queue lives.

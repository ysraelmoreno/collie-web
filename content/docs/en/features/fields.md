---
title: "Fields"
description: "Each agent in its own worktree inside the paddock; a passing check lands it."
status: preview
since: 0.3.0
---

A field gives one summoned agent its own git worktree inside a paddock. The agent works and commits there, on its own
branch, without touching the paddock's tree or another agent's files. The work comes back through one integrator per
paddock: by itself when an `ask --check` passes, or when the Shepherd runs `collie field land`.

Use fields when a Shepherd runs several agents on the same paddock at once and you want each to build and commit alone.
For one agent at a time, the paddock is enough. For the pitch, see [/features/fields](/features/fields).

## How it connects

A field is a worktree cut from a [paddock](/docs/concepts/paddocks-and-worktrees), so it needs a git paddock (not a
folder paddock). It uses the same machinery as the [loop's lanes](/docs/features/loop#parallel-lanes): a temporary
worktree that writes only its own branch, and an integrator that merges one branch at a time. The two do not mix: no
field is cut while a loop in lanes runs in the paddock. The agent runs under the strict
[sandbox](/docs/features/sandbox) of its field, and the defaults live in
[`collie-work.json`](/docs/reference/collie-work-json).

## Summon an agent into a field

```steps
items:
  - title: Summon with --field
    command: collie summon api --field "add the /items endpoint, with tests"
    result: "A worktree at `<repo>/.collie/paddocks/field-api`, branch `collie/field/api`, cut from the paddock's HEAD."
  - title: Give it a task with a check
    command: collie ask api "finish /items" --check "npm test -- items"
    result: When the check passes, the field's land is queued and the ask ends.
  - title: Or land it yourself
    command: collie field land api
    result: Merged into the paddock's branch, and the gate runs again.
```

The agent's orientation tells it: `Field "<name>" (branch collie/field/<name>): commite aqui; o Pastor integra.`

### Refusals

`--field` is refused without the terminal sandbox, for a shell, with `--paddock`, `--cwd` or `--shepherd`, outside a git
paddock, with a loop in lanes (`work run --parallel` above 1) running in the paddock, or when the paddock already has
`fields.max` live fields (the message gives the number). The name is the agent's: `a-z`, `0-9` and `-`, up to 40
characters.

## The states

`collie field list` shows each field's name, agent, branch, base, commits and state:

| State | Meaning |
|---|---|
| `working` | The agent is working; nothing to land yet. |
| `ready` | At the end of a turn there are commits past the base; the Shepherd gets `collie field land <name>`. |
| `landing` | The integrator is merging it. |
| `landed` | Merged into the paddock's branch. |
| `conflict` | The merge or the gate failed; undone, with a patch. |
| `behind` | After a land, the field could not move onto the new HEAD yet; it tries again at the next turn's end. |

After a land, the field's branch is rebased onto the paddock's new HEAD, only when its agent is out of a turn and its
tracked tree is clean. A change made meanwhile is never discarded.

## Land, drop and dismiss

**`field land <name>`** waits up to 10 minutes for the paddock to be clean and free. Then it answers `waiting` with the
reason and the field stays `ready`. On a conflict or a broken gate the merge is undone, the code is saved in
`<root>/fields/<name>-<n>.patch` (mode 0600) and the state becomes `conflict`.

**`field drop <name> [--keep-branch]`** dismisses the agent and removes the worktree. Without `--keep-branch`, the code is
kept as a patch and the branch deleted.

**Dismissing the agent** (`collie dismiss`, "Encerrar ramo", the cascade) writes what is not committed (tracked and
untracked, not ignored) to `<root>/fields/<name>-wip.patch`, removes the worktree and **keeps the branch**. The Shepherd
gets a line with the branch and the patch.

```callout
kind: note
title: Only judged code lands
body: "An `ask --check` lands the commit the check judged, and only while it is still the tip of `collie/field/<name>` with the field's HEAD on that branch. A field moved after the check, or with a detached HEAD, is skipped."
```

## Project default

```json collie-work.json
{
  "fields": { "default": true, "max": 4 }
}
```

With `default: true`, `collie summon` uses a field wherever `--field` would be accepted; `--no-field` summons without
one. `max` is from 1 to 8 (default 4). The file counts only **as committed at the paddock's HEAD**: an agent that edits it
in its tree turns nothing on.

## Who can do what

`field list`, `field land` and `field drop` are CLI commands for the Shepherd that summoned the agent; they are not
offered over MCP, and the app does not show fields yet. The Shepherd learns `summon --field` and `field list|land|drop`
in its orientation only when it fits the orientation's limit.

## Pitfalls

- A field's first build is cold: there is no build folder in the new worktree.
- Two fields that touch the same file conflict at land, like two lanes. Split the work by area.
- A field without its agent (the agent was dismissed) cannot be landed by `field land`: integrate
  `collie/field/<name>` by hand, or run `collie field drop <name>`.
- A field's agent writes its own tree, the objects and only `collie/field/<name>`. The paddock, the lanes and the
  other fields stay closed to it.

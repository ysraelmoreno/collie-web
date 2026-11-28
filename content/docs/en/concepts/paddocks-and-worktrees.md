---
title: "Paddocks and worktrees"
description: "The Pasture, paddocks as git worktrees, folder paddocks, land, and where fields and loop lanes fit."
---

Collie isolates work with git worktrees. Your repository's own checkout is the **Pasture** ("Pasto"). Each **paddock** ("cercado") is a second worktree of the same repository, on its own branch, in `.collie/paddocks/<name>`. Agents in a paddock edit and commit there; your checkout does not change until you land the paddock.

This page explains the model and the rules around it. To make one step by step, see [your first paddock](/docs/getting-started/first-paddock).

## The layout

```text
~/code/shop/                     Pasture: your checkout, on main
├── .git/                        one object store for every worktree
└── .collie/
    ├── memory/                  project memory (committed, travels with lands)
    └── paddocks/                listed in .git/info/exclude
        ├── checkout/            paddock: branch collie/checkout, base main
        └── search/              paddock: branch collie/search, base main
```

A worktree shares the repository's objects, so a paddock costs a checkout of the files, not a clone. It does not share build folders: the first build in a new paddock is cold.

Collie records each paddock with its name, the repository root, its path, its branch, its **base branch** (the branch the repository was on when the paddock was created) and who created it. The base branch is where a land goes.

## The Pasture

On the canvas, the Pasture holds the terminals and panels that are in no paddock. In the **Trilho** ("Rail") layout it is not a fixed entry: it shows only while it holds something, when it is selected, or when there is no paddock. In **Compacta** it is always the "Pasto" chip.

Deleting a paddock sends its canvas panels to the Pasture; its stopped terminal records leave the paddock and point back to the repository root.

## Why the sandbox cares

In the strict sandbox mode a terminal writes only inside its **project**, and in a paddock the project is the paddock's worktree. A terminal in `checkout` cannot write to your Pasture checkout or to `search`. That is what makes two agents in two paddocks safe in parallel: not good manners, but the file boundary. In the open mode (the default), agents write anywhere in your account; see [Sandbox](/docs/features/sandbox).

Agents also commit in the paddock as usual. Nothing in a paddock touches `.git/hooks` or `.git/config`: those stay closed in strict mode, and none of the git commands Collie runs itself run hooks.

## Folder paddocks

A paddock can also be any folder, git or not: turn off **Isolar numa branch (worktree)** in the sheet, pick a non-git folder, or run `collie paddock create <name> --folder <path>`. Agents work in the folder in place. A folder paddock has no branch, so no land, no PR and no work log closing on merge; deleting it removes only Collie's record.

Use it for a folder outside git (notes, a design export) or when you want agents in your checkout on purpose.

## Landing

A land integrates the paddock's branch into its base branch, in the Pasture. The modes are **Merge** (`--no-ff`, the default), **Squash**, **Rebase** and **Abrir PR** ("Open PR": push and `gh pr create`, yours alone). Before it starts, Collie requires:

- no uncommitted changes in the paddock;
- no uncommitted changes in the Pasture (memory files aside);
- the Pasture on the paddock's base branch.

The paddock's `.collie/memory` is committed first (`collie: memory`), so memory lands with the code. On a conflict Collie lists the files, aborts the merge and leaves both branches as they were.

A land also closes the [work](/docs/features/work-log) that was open on that branch (not a `pr` land, which is not integrated yet).

## One paddock, several agents

Several terminals can share one paddock: a Shepherd and the workers it summons land there by default. They share one worktree, so two agents editing the same files at once will step on each other. Three ways to split that work:

| Need | Use |
|---|---|
| Separate efforts, separate branches | one paddock each |
| Several agents on one effort, in parallel | [fields](/docs/features/fields) (preview, 0.3.0): `collie summon <name> --field` gives each agent its own worktree `.collie/paddocks/field-<name>` on `collie/field/<name>`, cut from the paddock's HEAD; `collie field land <name>` merges it back into the paddock |
| A list of tasks with checks | the [loop](/docs/features/loop): `collie work run --parallel <n>` (up to 4) runs each task in a temporary lane worktree and integrates them one at a time |

A field's sandbox is strict and its own: it writes its tree and its branch, and the paddock, the other fields and the lanes stay closed.

## Who can do what

| Action | Who |
|---|---|
| List paddocks | any managed terminal (names, paths and branches of all) |
| Create | a Shepherd, inside its project; or you in the app |
| Set status | you, the creating Shepherd, or a terminal in the paddock |
| Land (merge, squash, rebase) / delete | you, or the Shepherd that created it |
| Land as PR | you only |
| Mark it "Cercado fábrica" (factory paddock) | you only, never an agent ([Factory](/docs/features/factory)) |

A sub-Shepherd cannot create paddocks: it stays in its summoner's.

## Repositories from the Orq era

A repository that already has `.orq/` keeps using it, and its new paddocks go in `.orq/paddocks/`. Old paddocks in `.orq/floors` or `.collie/floors`, and branches named `orq/<name>`, still work and land normally. New repositories use `.collie/` and `collie/<name>`.

## Related

- [How it connects](/docs/concepts/how-it-connects)
- [Shepherd and terminals](/docs/concepts/shepherd-and-terminals)
- [Best practices](/docs/guides/best-practices): when to open a paddock, and how small to land.

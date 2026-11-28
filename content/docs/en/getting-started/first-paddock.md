---
title: "Your first paddock"
description: "An isolated branch in its own worktree, where agents work without touching your checkout."
---

A paddock ("cercado" in the app) is where one piece of work happens. In a git repository it is a worktree of its own, on its own branch, so the agents in it can edit, build and commit without touching the checkout you work in. When the work is done, you land the paddock back onto the branch it came from.

Make one paddock per effort: a feature, a bug, an experiment. Everything outside any paddock lives in the **Pasture** ("Pasto"): terminals and panels you opened straight on the canvas. The [concepts page](/docs/concepts/paddocks-and-worktrees) explains the model; this page is the hands-on version.

## Create it in the app

```steps
items:
  - title: Open the new paddock sheet
    result: The **+** in the rail, or ⌘K → **Novo cercado…** ("New paddock").
  - title: Name it
    result: Letters, digits and `-`, up to 40 characters. The sheet shows the name it will be created with.
  - title: Pick the folder
    result: "**Escolher pasta…** (\"Choose folder\") — your repository."
  - title: Keep the worktree switch on
    result: In a git folder, **Isolar numa branch (worktree)** ("Isolate in a branch") is on by default. Click **Criar** ("Create").
```

For a repository at `~/code/shop` and a paddock named `checkout`, Collie runs the equivalent of:

```sh
git worktree add -b collie/checkout ~/code/shop/.collie/paddocks/checkout <current branch>
```

So you get:

| | |
|---|---|
| Folder | `<repo>/.collie/paddocks/checkout` |
| Branch | `collie/checkout` |
| Base branch | the branch the repository was on when you created it |

The repository's HEAD must be on a branch: a detached HEAD is refused. The name must be new, and so must the branch `collie/<name>`.

Turn the switch off, or pick a folder that is not a git repository, and you get a **folder paddock**: agents work in that folder directly, with no branch. A folder paddock has no land and no PR, and deleting it removes only Collie's record, never the folder.

## Put a terminal in it

With the paddock selected in the rail, create a terminal (right-click on the canvas, or ⌘K → **Novo terminal**). The sheet's **Cercado** field shows the paddock; the terminal's folder is the paddock's worktree. Its sandbox follows: in strict mode, the terminal writes only inside that worktree.

Try it with a plain shell first:

```sh
pwd                      # …/.collie/paddocks/checkout
git branch --show-current  # collie/checkout
```

A Shepherd can also create paddocks for you, and its summoned agents land in its paddock by default. See [your first agent](/docs/getting-started/first-agent).

## Status

Each paddock has a status, shown as a dot with its own shape in the rail: **Trabalhando** (working), **Bloqueado** (blocked), **Em revisão** (in review), **Ocioso** (idle) and **Concluído** (done). It is computed from its terminals; set by hand from the paddock's **Status** menu, it holds until that changes. An agent in the paddock can set it too:

```sh
collie paddock status checkout review
```

## Land it

When the work is committed, land the paddock from its **Land** menu. Four modes:

| Mode | What it does |
|---|---|
| **Merge** | `git merge --no-ff` of `collie/checkout` into the base branch (default) |
| **Squash** | one squashed commit on the base branch |
| **Rebase** | rebases the paddock onto the base, then fast-forwards |
| **Abrir PR** ("Open PR") | pushes the branch to `origin` and runs `gh pr create`; needs a remote and the `gh` CLI |

Before merging, Collie checks that the paddock has no uncommitted changes, that your main checkout has none either, and that the main checkout is on the base branch. A conflict lists the conflicted files and aborts the merge, so nothing is left half-merged.

```callout
kind: note
title: Memory travels with the land
body: "If the paddock's `.collie/memory` changed, Collie commits only those files (`collie: memory`) before the merge, so what the agents learned lands with the code."
```

## Delete it

**Excluir…** ("Delete") in the paddock's menu removes the worktree and the branch. Collie refuses while a terminal in the paddock is running, and refuses a branch that is not merged into the base unless you force it. A deleted paddock's panels move to the Pasture.

## From a Shepherd

The same actions as commands, for a Shepherd terminal:

```sh
collie paddock create checkout                 # worktree off the Shepherd's repository
collie paddock create notes --folder docs/notes  # folder paddock
collie paddock list
collie paddock land checkout --mode squash --message "Checkout flow"
collie paddock delete checkout
```

Who may do what:

- Any managed terminal can list paddocks.
- Only a Shepherd creates them, and only inside its own project (any existing folder, if its terminal started in the open sandbox mode).
- Only the Shepherd that created a paddock (or you, in the app) lands or deletes it.
- A `pr` land pushes to a remote, so it is yours alone: an agent is refused.

## Next

- [Paddocks and worktrees](/docs/concepts/paddocks-and-worktrees): base branch, Pasture, folder paddocks and fields.
- [Your first agent](/docs/getting-started/first-agent): put a Shepherd to work in the paddock.

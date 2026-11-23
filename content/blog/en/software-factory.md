---
title: "A software factory you can trust"
date: 2026-11-23
summary: "Why we think development is heading toward software factories, what keeps quality up when agents do the work, and what Collie already does to make one easy to set up."
draft: false
---

By "software factory" we mean this: an approved idea goes in, and tested, reviewed code comes out, ready to land. Agents do the steps in between, and a person only steps in when something goes wrong. It is not a person watching an agent type.

Most of what we build in Collie now points that way. This post covers why, what keeps the output good, and where Collie stands.

Two parts, like the last post. The first is facts: what ships, what is on `main`, what is only designed. The second is opinion, and it says so.

## Why a factory, and not a better chat

An agent that writes code is no longer the hard part. The hard part is everything around it: splitting the work, checking it, reviewing it, merging it, and knowing whether it actually did what was asked.

Today a person does most of that by hand. We counted it on our own repository, where Collie is built with Collie. On each wave of work, the owner stepped in about five times:

1. Writing or approving the plan and splitting it into tasks.
2. Approving the loop card.
3. Reviewing the diff.
4. Landing it and starting the next wave.
5. Checking by hand that the result works, because the check tests the spec, not the result.

Each of those steps waits for a person. Agents get faster, but the work doesn't go faster than the person in the middle.

```stats
items:
  - value: ~5
    label: Owner touches per wave
    note: Collie repository, 2026-11-22
  - value: 1
    label: The goal
    note: Approving the plan
```

## Fast is easy. Quality is the problem

Running agents without a person is easy. What's hard is still trusting the result afterwards.

An agent will happily report "done". It can weaken a test until it passes, edit the script that judges it, or fix the spec instead of the code. A factory that trusts the agent's word just produces mistakes faster.

So our rule is simple: **the agent that does the work never controls what judges it.** Checks run outside the agent's control. What they read comes from the committed version, not from what the agent just changed. And when nothing can decide, the factory stops and calls you. On a doubt it stops, and never guesses.

```callout
kind: note
title: The factory is only as strong as its checks
body: Collie can keep the judge isolated. It cannot make a weak check strong. A gate that only compiles lets a lot through, and we would rather show you that than hide it.
```

## What Collie already does

Released, from v0.1.4 to v0.1.9:

### A loop that runs tasks on its own

`collie work run` runs a list of tasks. Each task has a spec and a check. You approve the list once on a card, with limits. Every attempt starts a fresh agent, and the check decides when a task is done, not the agent.

```sh
collie work run --max 10
```

### A gate the agent cannot rewrite

`--gate "<cmd>"` runs a gate (lint, build, tests) after each task's check. An attempt that rewrites a script the gate runs fails. An approved task keeps its **evidence**, shown in the status, the panel and the notice.

Since v0.1.9, a `collie-work.json` at the project root declares the gate, a fast `precheck`, named `areas` and a `smoke` command. The loop reads the committed version, never the working tree, and fails an attempt that edits the file.

```sh
collie work config
```

### Parallel, but one merge at a time

`--parallel <n>` (up to 4) runs each task in its own lane, a temporary worktree. Tasks declare what they touch (`--scope`) and what they depend on (`--needs`); only tasks that don't overlap run together. They merge one at a time, and the gate runs again after each merge.

```sh
collie work run --parallel 2
```

### A loop that explains itself

Every loop that stops records why. `collie work wait` answers when the work changes, `work status --events` shows the journal, and a closed work leaves an immutable summary (`collie work history`) with its full timeline and the tokens of each attempt. The loop stops at the model's usage limit without spending an attempt.

That record is what makes a factory auditable. You can always see what happened, in what order, and what it cost.

### Mistakes become rules

Collie's memory keeps the pitfalls agents fall into. A pitfall can be **enforced by a check** (`collie memory enforce`), and recurring pitfalls without a check show up as candidates. Once a check enforces it, it no longer needs to be explained to the next agent in prose.

Plug-ins can join in too. With agent hooks (`edit`, `stop`), the sample **Vizinho** plug-in reads what sibling files do and proposes the conventions almost every file follows as **fences**. The ones you approve block the end of a turn that breaks them.

## What is on main

```callout
kind: status
title: On main, not released
body: "Merged on `main`. The latest tag is v0.1.9, and this is not in a release yet."
```

### Review by personas

`collie work run --review` adds a review to each attempt, done by a separate agent with a clean context. Each reviewer plays a persona, and each persona is a plain Markdown file in the project: `correcao` (correctness), `testes` (tests), `seguranca` (security), `simplicidade` (simplicity) and `motor-concorrencia` (engine and concurrency).

The review is an **opinion, not an approval**. It can't pass a task on its own. Only a confirmed `blocker` or `major` finding, with a file and a line, fails the attempt. If the reviewer says nothing or gives an invalid answer, the attempt counts as having no review. It does not count as a yes.

We tested it with a **bait task**: a spec that asked for a known bug (a divisor of `len(xs) + 1`). The check passed it. The `correcao` reviewer vetoed it with a `[major]` finding pointing to the file and line, and the second attempt fixed it. That is one test of one bug. It shows the mechanism works, and it doesn't measure how good the reviewer is.

## What is designed, not built

```callout
kind: warning
title: Designed, not built
body: Everything in this section is a written design. Names and commands may change before anything ships.
```

What's left takes the owner out of the remaining steps, and makes it easy to set up the same thing in a project that isn't Collie.

- **Result check.** An acceptance command per task (`--accept`), which runs after the review. The agent can't change it. It could be a scenario on a device, in the browser or in an app. It closes the gap between "the spec passed" and "it works".
- **Automatic land, only in factory paddocks.** Only you can mark a paddock as a factory, and an agent can't. Inside one, when gate, review and acceptance are all green, the loop lands and starts the next work. It **never pushes**: the end notice says "ready to push".
- **Plans from anywhere.** Jira, Linear, a GitHub issue or a file: the source doesn't matter. Collie takes the plan as text and drafts the tasks with their checks. You approve it once.
- **A factory profile.** One versioned file per project, layer by layer: static checks, runtime verification, review, guardrails, and pitfalls still written as prose.
- **`/collie:factory init`.** It detects the stack (`package.json`, `Package.swift`, `pyproject.toml`, `Cargo.toml`, `go.mod`…), asks a few questions, writes the profile and the check scripts, and runs a small pilot task to show the full cycle.
- **`collie factory doctor`.** A read-only score per layer, from 0 to 3, with the evidence and the next step. It doesn't use an LLM to score. A gate that only compiles is marked weak.
- **`collie factory bait`.** It plants a known defect in a throwaway copy of the repository, never the real one, runs the normal cycle and records which layer caught it. A bait that gets through lowers that layer's score.
- **A generic ratchet.** "This number can only go down", for any linter or for the list of skipped tests, with a reason required to raise it.

The idea behind the last three: a weak factory looks like a strong one until it breaks. The doctor and the bait show how strong yours is before that happens.

## Where we think this goes

```callout
kind: vision
title: A view, not a roadmap
body: Everything below is opinion. No dates, no promises.
```

### The person moves to the edges

People won't disappear from software. They'll move to where judgment matters: deciding what to build and why, and handling what the factory can't. What we expect to automate is the *how*. The *what* stays with people.

### Checks become the product

If agents write most of the code, the most valuable thing in a repository is what judges it: tests, gates, acceptance scenarios, the rules that came out of past mistakes. We think teams will spend more time on those and less on the code itself.

### Cheap models, strong judges

A factory that is well judged can let a cheaper model do the mechanical work, and switch to a better one only when an attempt fails. A strong judge is what makes that cheap. Without it, every mistake costs a person's time.

### What we are unsure about

Will reviewers just approve everything? A reviewer that approves everything looks just like a good one. Baits are our answer, and we don't know yet how often they will need to run.

Most prose isn't code. Of 802 memories in our own repository, 2 were enforced by a check when we counted. Some pitfalls will never become a check, and a factory still has to live with that.

And push. We keep it manual. A push on `main` publishes a release, and we think that decision should stay with a person for a long time.

## Try it

With a release build, the loop, the gate and the parallel lanes already work. With a build from `main`, add the review.

```steps
items:
  - title: Declare the gate for the project
    command: collie work config
    result: "Shows what `collie-work.json` resolves to, and runs nothing."
  - title: Run the tasks, two at a time, behind the gate
    command: collie work run --parallel 2
  - title: Wait for the loop to change state
    command: collie work wait
  - title: Read what happened
    command: collie work history
    result: Full timeline and tokens per attempt.
  - title: Add the persona review (main)
    command: collie work run --review
    result: Only a confirmed blocker or major finding fails an attempt.
```

Related: [Loop](/features/loop), [Memory](/features/memory).

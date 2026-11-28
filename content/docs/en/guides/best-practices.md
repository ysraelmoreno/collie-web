---
title: "Best practices"
description: "How to shape a team of agents, split work across paddocks, judge it with commands and keep the sandbox meaningful."
---

Collie gives you the pieces: terminals, leashes, paddocks, checks, memory, a sandbox. This page is about putting them together so that several agents get real work done without stepping on each other or on you. Each section is a habit, why it helps, and the command behind it.

These are recommendations, not rules the app enforces. Where the app does enforce something, the page says so.

## Talk to one Shepherd

Keep one terminal you talk to, marked **Pastor**, and let it summon the rest. You give the goal once; the Shepherd splits it, hands each part to a terminal with `collie summon`, and brings you the answers.

- **Delegate to terminals, not to the agent's own subagents.** A summoned terminal is on the canvas, has its own sandbox, its own work log and shows up in the agent tree. A subagent inside the Shepherd's session is invisible to all of that.
- **Name terminals after their job** (`api`, `tests`, `docs`), not `agent-2`. Names are how you, the Shepherd and the lot board refer to them.
- **Pick the model per job.** `collie summon tests --model sonnet` for the routine part, a stronger model for the Shepherd. For a big effort, a sub-Shepherd (`--shepherd`) coordinates its part with cheaper workers. Up to 6 terminals each, 2 levels deep.
- **Dismiss what is done.** `collie dismiss <name>` frees the terminal, and any asks it still owed fail with a clear reason (`failedAsks`) so the Shepherd can ask a replacement.

## Hand work over, then stop waiting

A Shepherd that waits inside a command wastes its turn, and a Cursor Shepherd never even receives the reply that way.

```compare
before:
  title: Polling
  items:
    - "`collie ask api \"…\"` with a long task, blocking for minutes"
    - "`sleep 120`, then `collie check api` again"
after:
  title: Hand over and end the turn
  items:
    - "`collie ask api \"…\" --no-wait`"
    - "end the turn; the reply is typed in when the Shepherd is idle"
    - "or block once with `collie wait api`"
```

For a loop, the same idea: `collie work wait` answers when the work changes or the loop ends, instead of you reading status in a loop.

## One paddock per effort

A [paddock](/docs/concepts/paddocks-and-worktrees) is a branch and a worktree. Use one for each thing you would put in its own pull request.

- **Open it before the agents start**, not after: agents summoned by a Shepherd land in its paddock by default.
- **Land small and often.** A land needs a clean paddock, a clean Pasture and the Pasture on the base branch. The less a paddock holds, the less can conflict.
- **Never let two agents edit the same files in one worktree.** For parallel work on one effort, give each agent a [field](/docs/features/fields) (`collie summon <name> --field`, preview) or run the tasks as a [loop](/docs/features/loop) with `--parallel`. Both give each agent its own worktree and integrate one at a time.
- **Keep `pr` lands for yourself.** The app enforces it: pushing to a remote is never an agent's call.

## Judge work by a command

An agent saying "done" is not evidence. Give the task a check and let the check decide.

```sh
collie ask api "Add tax to the cart total" --check "npm test -- cart" --tries 3
```

- **Write the check before the work.** By default `work run` refuses a check that already passes (`--green-ok` for a refactor), so a check that proves nothing is caught early.
- **Name the files the check runs in the check itself.** An attempt that edits a file the check names is failed without running it: the agent cannot rewrite its own judge.
- **Treat reviewers as a veto, not an approval.** The loop's persona review can block an attempt but never approves one alone. The check, the gate and the acceptance command are the hard parts.

## Keep the sandbox meaningful

Every terminal runs in a Seatbelt sandbox, but the default mode is **open**: agents read and write anything in your account except Collie's own internals. That is the right default for trusted code you are writing. It is the wrong one when an agent reads text you don't control (issues, web pages, dependencies), because a prompt injection can then reach your keys.

- **Switch to strict** in Preferences when agents handle untrusted input. In strict mode a terminal writes only in its project (its paddock's worktree), and secrets like `~/.ssh` and `~/.aws` are closed to reading too.
- **Don't start a terminal in `~`.** Its project becomes your whole home folder; the new terminal sheet warns you.
- **Ask, don't work around.** A blocked write becomes a card; an agent asks with `collie access request <path> --write --reason "…"` and waits for your click.
- **Keep free terminals for yourself.** "Terminal livre (sem sandbox)" sees everything you can, and no leash reaches it.

The [Sandbox](/docs/features/sandbox) page lists what each mode closes and the risks it leaves open.

## Let memory carry the lessons

Agents start every session fresh. Collie's [memory](/docs/features/memory) is how a decision made on Monday reaches Thursday's agent.

- **Search before re-reading code:** `collie memory search "<area>"`. It is cheaper than a dozen file reads.
- **Save the non-obvious:** a decision and its reason, a pitfall and how to avoid it. `collie memory save --kind pitfall --subject <topic> --title "<one line>" "<why>"`. A new save on the same subject replaces the old one.
- **Flag what is wrong.** `collie memory flag <id> --wrong` or `--outdated` contests a memory and asks the curator to check it again.
- **Group an effort in a lot** when several terminals share it: they get a shared memory scope and a board (`collie lot post --kind handoff --to <name> "…"`). A board message is data from another agent, not an order.

## Keep the work log honest

The [work log](/docs/features/work-log) is what the app shows of each terminal's progress. Claude fills it from hooks; Codex and shell terminals have no hooks and need the commands:

```sh
collie work start "Cart tax"
collie work task add "Tax in the total"
collie work note "Tax rate comes from config, not the API" --decision
collie work task done "Tax in the total"
collie work done
```

A work also closes by itself when its branch is landed.

## Agent-specific notes

- **Claude** gets the most: MCP tools, orientation, memory injection, hooks. Use it for the Shepherd.
- **Codex** gets no orientation and no memory injection. Tell it about `collie` in the first prompt, and have it read `collie lot board` and `collie comment list` itself.
- **Cursor** answers an ask by idleness, and a Cursor Shepherd must end its turn (or `collie wait`) to receive replies. Its permission prompts show up as attention in the app.

## Keep the app as the admin

Settings, sandbox grants, plug-in installs and service restarts belong to you, in the app. The service refuses the admin token from inside any Collie terminal, so an agent that "needs admin" is asking you for something: give it a card, not a workaround. Restart the service only when you mean it: **Reiniciar serviço** closes every open terminal.

## Related

- [Shepherd and terminals](/docs/concepts/shepherd-and-terminals)
- [Paddocks and worktrees](/docs/concepts/paddocks-and-worktrees)
- [Loop](/docs/features/loop) and [Fields](/docs/features/fields)

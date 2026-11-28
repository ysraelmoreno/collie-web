---
title: "Herds"
description: "Ready-made teams: terminals with presets and roles, panels, leashes and a paddock, applied all or nothing."
---

A herd is a team you can apply in one step: terminals (each with a preset, an initial prompt and a position), panels,
the leashes between them and, if you want, a paddock. Collie ships three herds and lets you save the canvas, or a
selection of it, as a new one.

Use a herd when you set up the same team again and again: a Shepherd with a backend, an interface and a reviewer, or an
investigator and a tester for a bug. Applying it is all or nothing: if any step fails, what it created is undone.

## How it connects

Every terminal a herd creates is [leashed](/docs/concepts/shepherd-and-terminals) to the Shepherd of the herd (or to the
Shepherd that applied it), so the team can talk from the first prompt. A herd that asks for a paddock creates one
([paddocks](/docs/concepts/paddocks-and-worktrees)), and the terminals start inside it. Panels are the same panels you
open by hand: Design, Browser and the rest. Herds you save are part of the data backup.

## The built-in herds

| Herd | Team | Panels | Paddock |
|---|---|---|---|
| "Feature fullstack" | Shepherd, backend, interface and reviewer | Design and Browser | Yes |
| "Feature com design" | Shepherd, designer, interface and tester | Design and Browser | Yes |
| "Investigar bug" | Shepherd, investigator and the one who writes the failing test | none | No |

Each terminal comes with a role written as its first prompt (in Portuguese, as the app ships it). Built-in herds cannot
be replaced or removed.

## Save a herd

From the canvas menu or ⌘K: "Salvar canvas como rebanho…" or, with items selected, "Salvar seleção como rebanho…". Only
allowed state goes in:

- from the Design panel, the file and its storage;
- from the Browser panel, the http(s) address (without user and password, with a warning when it has `?…` parameters)
  and its storage.

Device panels and other plug-ins are skipped, with a warning. Never saved: terminal history, tokens, Design links,
environment variables, absolute paths and `cwd`.

## Apply a herd

```steps
items:
  - title: Open the herds sheet
    result: "⌘K › \"Aplicar rebanho…\", the REBANHOS section of the side panel, or \"Aplicar rebanho aqui…\" on the canvas."
  - title: Read the preview
    result: "It lists everything that will be created, with each command and each prompt. **Aplicar** stays disabled until you scroll to the end (\"role até o fim da prévia\")."
  - title: Name it and apply
    result: "\"Nome (obrigatório)\" is the prefix of what it creates; \"Criar cercado\" and \"Pasta\" choose the paddock and the folder. Enter never applies."
```

Applied from the app, the team is born in the paddock on screen; if the herd asks for a paddock, a new one is created
and the app moves to it. A herd that asks for a paddock in a pasture without git creates a folder paddock instead, and
the herd's `folder` field can pick another folder inside the project.

### All or nothing

If any step fails, or a terminal stops on a question (such as trusting the folder), what this application created is
undone: terminals and panels. The paddock is removed only if it has no commits, no uncommitted changes, no ignored files
(build, `.env`) and no terminal left in it; otherwise it stays, with a warning. Design files it created also stay. If the
service goes down during the application, what was already created stays: remove it by hand.

## From a Shepherd

```sh
collie herd list
collie herd apply feature-fullstack --name checkout --paddock true
collie herd save my-team --terminals api,web,review --panels design
```

A Shepherd always applies in its own paddock and its own folder; everything it creates is leashed to it, under the
same rules as `paddock create` and `panel open`. `herd save` takes `--roles` (a JSON object of terminal name to initial
prompt) and `--wantsPaddock`. Removing, importing and exporting are the app's only.

## The `.collieherd` file

**Exportar…** and **Importar…** in the herds sheet move a herd as a JSON file with `format: 1`.

```stats
items:
  - value: 256 KiB
    label: per file
  - value: 20
    label: terminals
  - value: 20
    label: panels
```

Terminals are from 320×200 to 4000×4000 (panels from 200×200), positions up to 100000. Unknown fields are ignored.

```callout
kind: warning
title: An imported herd is not trusted
body: "The trust screen shows each command (`preset: custom`) and each prompt before saving, and importing creates nothing until you apply. Apply sends the digest of the preview: if the herd changed since, the daemon refuses."
```

If a saved herd with the same id exists, the screen offers **Substituir**.

## Pitfalls

- A herd saves roles and layout, not state: no terminal history, no conversation. Write the role so a fresh agent can
  start from it.
- Device panels do not travel in a herd. Open them after applying.
- **Remover** sets a saved herd aside in `herds/.removed`; it is not deleted.

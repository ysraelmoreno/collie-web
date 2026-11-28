# Brief — escritores do /docs

Contexto: `docs/superpowers/specs/2026-11-28-docs-design.md` e `docs/superpowers/plans/2026-11-28-docs.md` (leia os dois;
a tabela "Páginas" do plano diz quais arquivos são seus). Tom e formato: docs do Next.js/NestJS — explica o que é, como
se liga ao resto, como funciona por baixo, exemplo real, armadilhas. Não é texto de venda (isso é `/features`).

## Fonte da verdade

App em `~/Documents/codes/my-orchestrator-memory`, **tag `v0.3.1`**, só leitura com `git show v0.3.1:<arquivo>` (o `main`
local divergiu; não leia a árvore de trabalho). Ordem: `docs/referencia.md` (seção do seu tema), `CHANGELOG.md`,
`docs/fabrica/`, `docs/plugins/`, depois confira cada comando, flag, rótulo e limite em `Sources/` (ex.:
`Sources/CollieCLI/Commands.swift`). O que não está no código da tag não entra. Spec de design descreve intenção, não
comportamento: não cite como fato. O hook rtk filtra saída: use `rtk proxy git …` e `/usr/bin/grep` para ver tudo.

## Arquivos

- `content/docs/en/<group>/<page>.md` e `content/docs/pt/<group>/<page>.md`, mesmo caminho, os dois.
- Frontmatter exato:

```md
---
title: "Fields"
description: "Each agent in its own worktree; a passing check lands it."
status: preview
since: 0.3.0
---
```

  `status: preview` e `since` só quando a funcionalidade é prévia (o CHANGELOG diz). Strings entre aspas (JSON).
- Corpo sem `# Título` (o layout mostra o `title`). Comece com 1–2 parágrafos do que é e quando usar. Depois `##`/`###`
  (eles viram o "Nesta página"; títulos curtos).
- Blocos permitidos: os de `docs/blog-blocks.md` (`callout`, `steps`, `tabs`, `compare`, `stats`), regras daquele
  arquivo (YAML, chaves desconhecidas são erro, `:` pede aspas). Código: cerca com linguagem (```sh) ou nome de arquivo
  (```json collie-work.json).
- Links internos: EN `/docs/<group>/<page>`, PT `/pt/docs/<group>/<page>`; post de funcionalidade `/features/<slug>`
  (`/pt/features/<slug>`). Ligue as páginas entre si: "como se conecta" é parte do pedido.
- Tamanho: o que o tema pede. Página de funcionalidade ~600–1500 palavras por idioma; `reference/cli` pode ser longa
  (tabela por grupo de comandos).
- PT: rótulos de UI exatamente como no app; EN: traduza o texto, mas rótulo de UI fica com o nome real do app entre
  aspas na primeira menção, se ele só existir em PT. Nomes próprios (Vizinho, field, Pastor/Shepherd conforme o app)
  como o app usa.

## Regras

- Só crie os seus arquivos. Não edite código, nav, nem página de outro escritor.
- Não rode `npm run build` nem `tsc` (o Shepherd roda, um por vez). Sem commit.
- Ao terminar, responda: lista de arquivos, palavras por idioma por página e, por página, "comando/flag/limite →
  arquivo:linha na v0.3.1".

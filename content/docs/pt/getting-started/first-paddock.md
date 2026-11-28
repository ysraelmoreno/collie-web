---
title: "Primeiro cercado"
description: "Uma branch isolada numa worktree própria, onde os agentes trabalham sem mexer no seu checkout."
---

Um cercado é onde um trabalho acontece. Num repositório git ele é uma worktree própria, numa branch própria, então os agentes dentro dele editam, compilam e commitam sem tocar no checkout em que você trabalha. Quando o trabalho termina, você integra (land) o cercado de volta na branch de onde ele saiu.

Faça um cercado por esforço: uma feature, um bug, um experimento. O que fica fora de qualquer cercado vive no **Pasto**: terminais e painéis que você abriu direto no canvas. A [página de conceitos](/pt/docs/concepts/paddocks-and-worktrees) explica o modelo; esta é a versão mão na massa.

## Criar no app

```steps
items:
  - title: Abra a folha de novo cercado
    result: O **+** no trilho, ou ⌘K → **Novo cercado…**.
  - title: Dê um nome
    result: Letras, números e `-`, até 40 caracteres. A folha mostra o nome com que ele será criado.
  - title: Escolha a pasta
    result: "**Escolher pasta…** — o seu repositório."
  - title: Deixe a worktree ligada
    result: Numa pasta git, **Isolar numa branch (worktree)** vem ligado. Clique **Criar**.
```

Para um repositório em `~/code/loja` e um cercado chamado `checkout`, o Collie roda o equivalente a:

```sh
git worktree add -b collie/checkout ~/code/loja/.collie/paddocks/checkout <branch atual>
```

E você fica com:

| | |
|---|---|
| Pasta | `<repo>/.collie/paddocks/checkout` |
| Branch | `collie/checkout` |
| Branch base | a branch em que o repositório estava quando você criou o cercado |

O HEAD do repositório precisa estar numa branch: HEAD destacado é recusado. O nome tem de ser novo, e a branch `collie/<nome>` também.

Desligue a chave, ou escolha uma pasta que não é repositório git, e você tem um **cercado de pasta**: os agentes trabalham direto nela, sem branch. Cercado de pasta não tem land nem PR, e excluí-lo remove só o registro do Collie, nunca a pasta.

## Pôr um terminal nele

Com o cercado selecionado no trilho, crie um terminal (clique direito no canvas, ou ⌘K → **Novo terminal**). O campo **Cercado** da folha mostra o cercado; a pasta do terminal é a worktree dele. O sandbox acompanha: no modo estrito, o terminal só escreve dentro dessa worktree.

Teste primeiro com um shell simples:

```sh
pwd                        # …/.collie/paddocks/checkout
git branch --show-current  # collie/checkout
```

Um Pastor também cria cercados por você, e os agentes que ele convoca nascem no cercado dele. Veja o [primeiro agente](/pt/docs/getting-started/first-agent).

## Status

Cada cercado tem um status, mostrado no trilho como um ponto com forma própria: **Trabalhando**, **Bloqueado**, **Em revisão**, **Ocioso** e **Concluído**. Ele é calculado pelos terminais; posto à mão no menu **Status** do cercado, vale até isso mudar. Um agente do cercado também pode mudar:

```sh
collie paddock status checkout review
```

## Integrar (land)

Com o trabalho commitado, integre o cercado pelo menu **Land**. Quatro modos:

| Modo | O que faz |
|---|---|
| **Merge** | `git merge --no-ff` de `collie/checkout` na branch base (padrão) |
| **Squash** | um commit único na branch base |
| **Rebase** | faz rebase do cercado sobre a base e depois fast-forward |
| **Abrir PR** | faz push da branch para o `origin` e roda `gh pr create`; precisa de remote e da CLI `gh` |

Antes do merge, o Collie confere que o cercado não tem alterações não commitadas, que o seu checkout principal também não, e que ele está na branch base. Um conflito lista os arquivos em conflito e aborta o merge, então nada fica pela metade.

```callout
kind: note
title: A memória vai junto no land
body: "Se o `.collie/memory` do cercado mudou, o Collie commita só esses arquivos (`collie: memory`) antes do merge, e o que os agentes aprenderam entra junto com o código."
```

## Excluir

**Excluir…** no menu do cercado remove a worktree e a branch. O Collie recusa enquanto algum terminal do cercado está rodando, e recusa uma branch que não foi integrada na base, a não ser que você force. Os painéis de um cercado excluído vão para o Pasto.

## Por um Pastor

As mesmas ações como comandos, para um terminal Pastor:

```sh
collie paddock create checkout                   # worktree do repositório do Pastor
collie paddock create notas --folder docs/notas  # cercado de pasta
collie paddock list
collie paddock land checkout --mode squash --message "Fluxo de checkout"
collie paddock delete checkout
```

Quem pode o quê:

- Todo terminal gerenciado lista os cercados.
- Só um Pastor cria, e só dentro do próprio projeto (qualquer pasta existente, se o terminal dele começou no modo aberto do sandbox).
- Só o Pastor que criou o cercado (ou você, no app) integra ou exclui.
- O land `pr` faz push para um remote, então é só seu: um agente é recusado.

## Próximos passos

- [Cercados e worktrees](/pt/docs/concepts/paddocks-and-worktrees): branch base, Pasto, cercados de pasta e fields.
- [Primeiro agente](/pt/docs/getting-started/first-agent): ponha um Pastor para trabalhar no cercado.

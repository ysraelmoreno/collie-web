---
title: "Cercados e worktrees"
description: "O Pasto, cercados como worktrees do git, cercados de pasta, o land, e onde entram fields e faixas do laço."
---

O Collie isola o trabalho com worktrees do git. O checkout do seu repositório é o **Pasto**. Cada **cercado** é uma segunda worktree do mesmo repositório, numa branch própria, em `.collie/paddocks/<nome>`. Os agentes de um cercado editam e commitam ali; o seu checkout não muda até você integrar (land) o cercado.

Esta página explica o modelo e as regras em volta dele. Para criar um passo a passo, veja o [primeiro cercado](/pt/docs/getting-started/first-paddock).

## A estrutura

```text
~/code/loja/                     Pasto: o seu checkout, na main
├── .git/                        um só armazenamento de objetos para todas as worktrees
└── .collie/
    ├── memory/                  memória do projeto (commitada, vai junto nos lands)
    └── paddocks/                listada em .git/info/exclude
        ├── checkout/            cercado: branch collie/checkout, base main
        └── busca/               cercado: branch collie/busca, base main
```

Uma worktree compartilha os objetos do repositório, então um cercado custa um checkout dos arquivos, não um clone. Ela não compartilha as pastas de build: o primeiro build num cercado novo é frio.

O Collie registra cada cercado com o nome, a raiz do repositório, o caminho, a branch, a **branch base** (a branch em que o repositório estava quando o cercado foi criado) e quem o criou. A branch base é para onde vai o land.

## O Pasto

No canvas, o Pasto guarda os terminais e painéis que não estão em nenhum cercado. Na disposição **Trilho** ele não é um item fixo: aparece só enquanto guarda algo, quando está selecionado, ou quando não há cercado. Na **Compacta** ele é sempre o chip "Pasto".

Excluir um cercado manda os painéis de canvas dele para o Pasto; os registros dos terminais parados saem do cercado e voltam a apontar para a raiz do repositório.

## Por que o sandbox importa

No modo estrito do sandbox um terminal só escreve dentro do seu **projeto**, e num cercado o projeto é a worktree do cercado. Um terminal em `checkout` não escreve no seu checkout do Pasto nem em `busca`. É isso que deixa dois agentes em dois cercados seguros em paralelo: não boas maneiras, mas a fronteira de arquivos. No modo aberto (o padrão), os agentes escrevem em qualquer lugar da sua conta; veja [Sandbox](/pt/docs/features/sandbox).

Os agentes também commitam no cercado normalmente. Nada num cercado mexe em `.git/hooks` ou `.git/config`: eles ficam fechados no modo estrito, e nenhum git que o próprio Collie roda executa hooks.

## Cercados de pasta

Um cercado também pode ser qualquer pasta, git ou não: desligue **Isolar numa branch (worktree)** na folha, escolha uma pasta sem git, ou rode `collie paddock create <nome> --folder <caminho>`. Os agentes trabalham na pasta, no lugar. Um cercado de pasta não tem branch, então não tem land, nem PR, nem fechamento do trabalho por merge; excluí-lo remove só o registro do Collie.

Use para uma pasta fora do git (notas, um export de design) ou quando você quer os agentes no seu checkout de propósito.

## O land

Um land integra a branch do cercado na branch base, no Pasto. Os modos são **Merge** (`--no-ff`, o padrão), **Squash**, **Rebase** e **Abrir PR** (push e `gh pr create`, só seu). Antes de começar, o Collie exige:

- nenhuma alteração não commitada no cercado;
- nenhuma alteração não commitada no Pasto (fora os arquivos de memória);
- o Pasto na branch base do cercado.

O `.collie/memory` do cercado é commitado antes (`collie: memory`), e a memória entra junto com o código. Num conflito, o Collie lista os arquivos, aborta o merge e deixa as duas branches como estavam.

O land também fecha o [trabalho](/pt/docs/features/work-log) que estava aberto naquela branch (não um land `pr`, que ainda não foi integrado).

## Um cercado, vários agentes

Vários terminais podem dividir um cercado: um Pastor e os agentes que ele convoca nascem nele por padrão. Eles dividem uma worktree, então dois agentes editando os mesmos arquivos ao mesmo tempo vão se atropelar. Três jeitos de dividir esse trabalho:

| Precisa de | Use |
|---|---|
| Esforços separados, branches separadas | um cercado para cada |
| Vários agentes num esforço, em paralelo | [fields](/pt/docs/features/fields) (prévia, 0.3.0): `collie summon <nome> --field` dá a cada agente uma worktree própria `.collie/paddocks/field-<nome>` em `collie/field/<nome>`, cortada do HEAD do cercado; `collie field land <nome>` integra de volta no cercado |
| Uma lista de tarefas com checks | o [laço](/pt/docs/features/loop): `collie work run --parallel <n>` (até 4) roda cada tarefa numa faixa (worktree temporária) e integra uma de cada vez |

O sandbox de um field é estrito e só dele: grava a própria árvore e a própria branch, e o cercado, os outros fields e as faixas ficam fechados.

## Quem pode o quê

| Ação | Quem |
|---|---|
| Listar cercados | todo terminal gerenciado (nomes, caminhos e branches de todos) |
| Criar | um Pastor, dentro do projeto dele; ou você no app |
| Mudar o status | você, o Pastor criador ou um terminal do cercado |
| Land (merge, squash, rebase) / excluir | você, ou o Pastor que o criou |
| Land como PR | só você |
| Marcar como "Cercado fábrica" | só você, nunca um agente ([Fábrica](/pt/docs/features/factory)) |

Um sub-Pastor não cria cercados: fica no de quem o convocou.

## Repositórios da época do Orq

Um repositório que já tem `.orq/` continua usando essa pasta, e os cercados novos dele vão para `.orq/paddocks/`. Cercados antigos em `.orq/floors` ou `.collie/floors`, e branches `orq/<nome>`, seguem funcionando e se integram normalmente. Repositórios novos usam `.collie/` e `collie/<nome>`.

## Veja também

- [Como tudo se liga](/pt/docs/concepts/how-it-connects)
- [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals)
- [Boas práticas](/pt/docs/guides/best-practices): quando abrir um cercado e de que tamanho integrar.

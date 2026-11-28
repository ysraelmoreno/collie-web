---
title: "Primeiro agente"
description: "Um terminal Pastor que convoca outros agentes, entrega o trabalho e lê as respostas."
---

Um agente no Collie é um terminal no canvas rodando uma CLI de agente: Claude Code, Codex, Cursor ou um comando seu. Qualquer terminal trabalha sozinho. O arranjo útil é um **Pastor**: um terminal que você marca como tal, que chama outros agentes, entrega a tarefa e recebe a resposta. Você fala com um; ele coordena os demais.

Esta página cria um Pastor, faz ele convocar um agente e perguntar algo a ele, e mostra como acompanhar e encerrar o que ele abriu. A página [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals) explica as regras por trás de cada passo.

## Criar o Pastor

```steps
items:
  - title: Abra a folha de novo terminal
    result: Clique direito no canvas, ou ⌘K → **Novo terminal**.
  - title: Escolha o agente
    result: Um cartão por preset — **Claude**, **Codex**, **Cursor**, **Shell** (`zsh`) ou **Próprio** (o seu comando).
  - title: Dê um nome e escolha a pasta
    result: A **Pasta** é o seu projeto. Num cercado, a pasta é a worktree do cercado.
  - title: Marque Pastor
    result: "\"Pode chamar agentes, abrir painéis e criar cercados. Só alcança quem estiver ligado a ele por guia.\""
  - title: Crie
    result: "**Criar terminal**. O nó mostra a etiqueta **Pastor**."
```

Deixe **Terminal livre (sem sandbox)** desligado. Um terminal livre vê e altera tudo o que você pode, e nenhuma guia chega a ele: ele não convoca ninguém, e ninguém pergunta nada a ele. É só para o seu próprio trabalho.

O Claude Code pode pedir para confiar na pasta na primeira vez. O nó então indica que precisa de atenção: responda no terminal.

## O que o Pastor sabe

Um terminal Claude começa com duas coisas do Collie:

- Um servidor MCP chamado `collie`, para o agente chamar as ferramentas do Collie direto. Ele herda o token do próprio terminal; as ferramentas de painéis que o terminal não alcança ficam ocultas.
- Uma orientação curta no início da sessão (e de novo depois de uma compactação): que ele roda no Collie, o nome do terminal e do cercado, os peers e os painéis que alcança. O Pastor também aprende `collie summon`, `collie panel open|close|move` e `collie leash`.

O Codex não tem hook de início de sessão, então não recebe orientação. Conte a ele sobre o `collie` no primeiro prompt. Os detalhes estão em [Hooks dos agentes](/pt/docs/internals/agent-hooks).

## Delegar uma tarefa

Peça ao Pastor em palavras normais. Por exemplo, no terminal do Pastor:

> Abra um terminal chamado `leitor`, peça para ele ler o README e me diga em três linhas o que este projeto faz.

O Pastor transforma isso em comandos como estes:

```sh
collie summon leitor
collie ask leitor "Leia o README.md e resuma o projeto em três linhas."
```

O `summon` cria o terminal já ligado por guia ao Pastor, no cercado e na pasta do Pastor, com o preset do próprio Pastor, a não ser que ele passe `--preset`. Você vê um nó novo no canvas com a linha da guia até o Pastor. Um primeiro prompt pode ir junto: `collie summon leitor "Leia o README.md"` envia sem esperar resposta.

O `ask` digita o prompt no `leitor` e espera o turno dele terminar; então devolve a resposta. O timeout padrão é de 30 min (`--timeout` em segundos).

## Não espere em laço

Em tarefas longas, o Pastor não deve ficar parado dentro de um comando. Use `--no-wait`:

```sh
collie ask leitor "Escreva os testes que faltam em src/cart.ts" --no-wait
# → devolve um id na hora; a resposta é digitada no terminal do Pastor quando ele estiver ocioso
collie ask result <id>   # a resposta; sem id, a lista dos seus asks recentes
collie wait leitor       # bloqueia até o leitor terminar o turno; na hora se ele estiver ocioso
```

Um Pastor Cursor só recebe mensagem quando o turno dele termina: se ele dorme ou faz polling dentro de um comando, a resposta nunca chega. Ele deve encerrar o turno, ou bloquear em `collie wait <nome>`.

## Ver o que está acontecendo

```sh
collie list                   # agentes ligados a você: nome, preset, running|stopped, shepherd
collie list --all             # também os terminais do seu cercado sem guia até você
collie check leitor           # as últimas 200 linhas da saída do leitor (--lines N)
collie check leitor --screen  # a tela como está desenhada agora
```

Na disposição **Trilho**, o painel lateral mostra a árvore de agentes: o Pastor e os terminais ligados a ele, com um selo para cartões pendentes.

## Encerrar

```sh
collie dismiss leitor
```

O `dismiss` encerra um terminal ligado ao Pastor. Os asks que o terminal dispensado ainda devia falham com "Terminal 'leitor' was dismissed before answering this ask: ask its replacement", e o `dismiss` devolve os ids em `failedAsks`. No app, **Encerrar ramo…** num nó remove ele junto com tudo o que ele convocou.

## Ligar por guia à mão

As guias são a única permissão entre terminais: um terminal alcança exatamente os terminais e painéis ligados a ele. Para ligar dois nós você mesmo, arraste do pequeno anel na barra de título de um nó até o outro. Um Pastor liga dois terminais que já estão ligados a ele com `collie leash a b`, e pede a você um que ele não alcança com `collie leash request <nome> --reason "…"`, que mostra uma faixa sobre o nó do Pastor com **Conectar** e **Recusar**.

## Próximos passos

- [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals): alcance, sub-Pastores, `ask --check`.
- [Boas práticas](/pt/docs/guides/best-practices): como dividir o trabalho entre agentes.
- O [post do Pastor](/pt/features/shepherd), para a versão curta.

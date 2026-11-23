---
title: "Uma fábrica de software em que dá para confiar"
date: 2026-11-23
summary: "Por que achamos que o desenvolvimento caminha para fábricas de software, o que mantém a qualidade quando agentes fazem o trabalho, e o que o Collie já faz para facilitar montar uma."
draft: false
---

Por "fábrica de software" queremos dizer isto: entra uma ideia aprovada e sai código testado, revisado e pronto para entrar. Agentes fazem os passos do meio, e uma pessoa só entra quando algo dá errado. Não é uma pessoa assistindo um agente digitar.

Quase tudo o que construímos no Collie agora aponta para isso. Este post fala do porquê, do que mantém o resultado bom e de onde o Collie está.

Duas partes, como no último post. A primeira é fato: o que está numa versão, o que está na `main`, o que só está desenhado. A segunda é opinião, e diz que é.

## Por que uma fábrica, e não um chat melhor

O agente que escreve código já não é a parte difícil. A parte difícil é tudo em volta: quebrar o trabalho, conferir, revisar, integrar e saber se ele fez de fato o que foi pedido.

Hoje uma pessoa faz quase tudo isso à mão. Contamos no nosso próprio repositório, onde o Collie é feito com o Collie. A cada onda de trabalho, o dono entrava umas cinco vezes:

1. Escrevendo ou aprovando o plano e quebrando em tarefas.
2. Aprovando o cartão do laço.
3. Revisando o diff.
4. Fazendo o land e começando a próxima onda.
5. Conferindo à mão se o resultado funciona, porque o check testa o spec, não o resultado.

Cada um desses passos espera uma pessoa. Os agentes ficam mais rápidos, mas o trabalho não anda mais rápido que a pessoa no meio.

```stats
items:
  - value: ~5
    label: Toques do dono por onda
    note: Repositório do Collie, 2026-11-22
  - value: 1
    label: A meta
    note: Aprovar o plano
```

## Rápido é fácil. O problema é a qualidade

Rodar agentes sem uma pessoa é fácil. Difícil é continuar confiando no resultado depois.

Um agente diz "pronto" sem problema nenhum. Ele pode enfraquecer um teste até passar, editar o script que o julga ou mudar o spec em vez do código. Uma fábrica que confia na palavra do agente só produz erro mais rápido.

Por isso nossa regra é simples: **o agente que faz o trabalho nunca controla o que o julga.** Os checks rodam fora do controle do agente. O que eles leem vem da versão commitada, não do que o agente acabou de mudar. E quando nada consegue decidir, a fábrica para e chama você. Na dúvida, ela para, e nunca chuta.

```callout
kind: note
title: A fábrica é tão forte quanto os checks
body: O Collie consegue manter o juiz isolado. Ele não consegue tornar forte um check fraco. Um gate que só compila deixa muita coisa passar, e preferimos mostrar isso a esconder.
```

## O que o Collie já faz

Em versões, da v0.1.4 à v0.1.9:

### Um laço que roda as tarefas sozinho

`collie work run` roda uma lista de tarefas. Cada tarefa tem um spec e um check. Você aprova a lista uma vez num cartão, com limites. Cada tentativa começa com um agente novo, e quem decide se a tarefa terminou é o check, não o agente.

```sh
collie work run --max 10
```

### Um gate que o agente não consegue reescrever

`--gate "<cmd>"` roda um gate (lint, build, testes) depois do check de cada tarefa. A tentativa que reescreve um script que o gate roda falha. A tarefa aprovada guarda a **evidência**, que aparece no status, no painel e no aviso.

Desde a v0.1.9, um `collie-work.json` na raiz do projeto declara o gate, um `precheck` rápido, `areas` com nome e um comando de `smoke`. O laço lê a versão commitada, nunca a árvore de trabalho, e falha a tentativa que edita o arquivo.

```sh
collie work config
```

### Em paralelo, mas um merge de cada vez

`--parallel <n>` (até 4) roda cada tarefa na sua raia, um worktree temporário. As tarefas dizem o que tocam (`--scope`) e do que dependem (`--needs`); só rodam juntas as que não se sobrepõem. Elas entram uma de cada vez, e o gate roda de novo depois de cada merge.

```sh
collie work run --parallel 2
```

### Um laço que se explica

Todo laço que para guarda o motivo. `collie work wait` responde quando o trabalho muda, `work status --events` mostra o diário, e um trabalho fechado deixa um resumo imutável (`collie work history`) com a linha do tempo inteira e os tokens de cada tentativa. O laço para no limite de uso do modelo sem gastar tentativa.

É esse registro que torna uma fábrica auditável. Você sempre consegue ver o que aconteceu, em que ordem e quanto custou.

### Erro vira regra

A memória do Collie guarda as armadilhas em que os agentes caem. Uma armadilha pode ser **imposta por um check** (`collie memory enforce`), e as armadilhas recorrentes sem check aparecem como candidatas. Depois que um check impõe a armadilha, ela não precisa mais ser explicada em prosa para o próximo agente.

Plug-ins também entram nisso. Com os ganchos de agente (`edit`, `stop`), o plug-in de exemplo **Vizinho** lê o que os arquivos irmãos fazem e propõe como **cercas** as convenções que quase todo arquivo segue. As que você aprova bloqueiam o fim de um turno que as quebra.

## O que está na main

```callout
kind: status
title: Na main, fora de versão
body: "Já está na `main`. A última tag é a v0.1.9, e isto ainda não está numa versão."
```

### Revisão por personas

`collie work run --review` acrescenta uma revisão a cada tentativa, feita por outro agente, com contexto limpo. Cada revisor faz o papel de uma persona, e cada persona é um arquivo Markdown simples no projeto: `correcao`, `testes`, `seguranca`, `simplicidade` e `motor-concorrencia`.

A revisão é um **parecer, não uma aprovação**. Ela não aprova uma tarefa sozinha. Só um achado `blocker` ou `major` confirmado, com arquivo e linha, falha a tentativa. Se o revisor não diz nada ou dá uma resposta inválida, a tentativa conta como sem revisão. Isso não conta como um sim.

Testamos com uma **tarefa-isca**: um spec que pedia um bug conhecido (um divisor `len(xs) + 1`). O check deixou passar. O revisor `correcao` vetou com um achado `[major]` apontando arquivo e linha, e a segunda tentativa corrigiu. É um teste de um bug. Mostra que o mecanismo funciona, mas não mede o quanto o revisor é bom.

## O que está desenhado, não construído

```callout
kind: warning
title: Desenhado, não construído
body: Tudo nesta seção é um desenho escrito. Nomes e comandos podem mudar antes de qualquer coisa entrar numa versão.
```

O que falta tira o dono dos passos que sobraram, e facilita montar a mesma coisa num projeto que não é o Collie.

- **Verificação do resultado.** Um comando de aceite por tarefa (`--accept`), que roda depois da revisão. O agente não consegue mudá-lo. Pode ser um cenário num aparelho, no navegador ou num app. Fecha a distância entre "o spec passou" e "funciona".
- **Land automático, só em cercados fábrica.** Só você marca um cercado como fábrica, e um agente não consegue. Dentro dele, quando gate, revisão e aceite estão verdes, o laço faz o land e começa o próximo trabalho. Ele **nunca faz push**: o aviso de fim diz "pronto para push".
- **Planos de qualquer lugar.** Jira, Linear, uma issue do GitHub ou um arquivo: a origem não importa. O Collie recebe o plano como texto e rascunha as tarefas com os checks. Você aprova uma vez.
- **Um perfil de fábrica.** Um arquivo versionado por projeto, camada por camada: checks estáticos, verificação em runtime, revisão, guardrails e armadilhas que ainda estão em prosa.
- **`/collie:factory init`.** Descobre a stack (`package.json`, `Package.swift`, `pyproject.toml`, `Cargo.toml`, `go.mod`…), faz algumas perguntas, grava o perfil e os scripts de check, e roda uma pequena tarefa piloto para mostrar o ciclo inteiro.
- **`collie factory doctor`.** Uma nota por camada, de 0 a 3, só lendo, com a evidência e o próximo passo. Não usa LLM para dar a nota. Um gate que só compila é marcado como fraco.
- **`collie factory bait`.** Planta um defeito conhecido numa cópia descartável do repositório, nunca no real, roda o ciclo normal e registra qual camada pegou. Uma isca que passa baixa a nota daquela camada.
- **Uma catraca genérica.** "Este número só pode diminuir", para qualquer linter ou para a lista de testes pulados, com motivo obrigatório para subir.

A ideia por trás dos três últimos: uma fábrica fraca parece forte até quebrar. O doctor e a isca mostram quão forte é a sua antes disso.

## Para onde achamos que isso vai

```callout
kind: vision
title: Uma visão, não um roadmap
body: Tudo abaixo é opinião. Sem datas, sem promessas.
```

### A pessoa vai para as pontas

As pessoas não vão sumir do software. Elas vão para onde o julgamento importa: decidir o que construir e por quê, e cuidar do que a fábrica não dá conta. O que esperamos automatizar é o *como*. O *quê* fica com as pessoas.

### Os checks viram o produto

Se os agentes escrevem a maior parte do código, o mais valioso de um repositório é o que o julga: testes, gates, cenários de aceite, as regras que saíram de erros passados. Achamos que os times vão gastar mais tempo nisso e menos no código em si.

### Modelos baratos, juízes fortes

Uma fábrica bem julgada pode deixar um modelo mais barato fazer o trabalho mecânico, e trocar por um melhor só quando uma tentativa falha. É um juiz forte que deixa isso barato. Sem ele, cada erro custa o tempo de uma pessoa.

### Do que ainda não temos certeza

Os revisores vão aprovar tudo? Um revisor que aprova tudo parece igual a um bom. As iscas são a nossa resposta, e ainda não sabemos com que frequência elas vão precisar rodar.

A maior parte da prosa não é código. Das 802 memórias do nosso repositório, 2 eram impostas por um check quando contamos. Algumas armadilhas nunca vão virar check, e uma fábrica ainda precisa conviver com isso.

E o push. Continuamos fazendo à mão. Um push na `main` publica uma versão, e achamos que essa decisão deve ficar com uma pessoa por muito tempo.

## Experimente

Numa versão publicada, o laço, o gate e as raias paralelas já funcionam. Com um build da `main`, acrescente a revisão.

```steps
items:
  - title: Declare o gate do projeto
    command: collie work config
    result: "Mostra no que o `collie-work.json` se resolve, sem rodar nada."
  - title: Rode as tarefas, duas de cada vez, atrás do gate
    command: collie work run --parallel 2
  - title: Espere o laço mudar de estado
    command: collie work wait
  - title: Leia o que aconteceu
    command: collie work history
    result: Linha do tempo inteira e tokens por tentativa.
  - title: Acrescente a revisão por personas (main)
    command: collie work run --review
    result: Só um achado blocker ou major confirmado falha uma tentativa.
```

Relacionados: [Laço](/pt/features/loop), [Memória](/pt/features/memory).

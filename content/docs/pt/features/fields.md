---
title: "Fields"
description: "Cada agente na própria worktree dentro do cercado; um check que passa o integra."
status: preview
since: 0.3.0
---

Um field dá a um agente convocado a própria worktree git dentro de um cercado. O agente trabalha e commita ali, no
próprio branch, sem tocar a árvore do cercado nem os arquivos de outro agente. O trabalho volta por um único integrador
por cercado: sozinho, quando um `ask --check` passa, ou quando o Pastor roda `collie field land`.

Use fields quando um Pastor põe vários agentes no mesmo cercado ao mesmo tempo e você quer que cada um compile e commite
sozinho. Para um agente por vez, o cercado basta. A apresentação está em [/pt/features/fields](/pt/features/fields).

## Como se conecta

Um field é uma worktree cortada de um [cercado](/pt/docs/concepts/paddocks-and-worktrees), então precisa de um cercado
git (não um cercado de pasta). Usa o mesmo mecanismo das [faixas do laço](/pt/docs/features/loop#faixas-em-paralelo): uma
worktree temporária que só grava o próprio branch e um integrador que faz o merge de um branch por vez. Os dois não
convivem: nenhum field é cortado enquanto um laço em faixas roda no cercado. O agente roda sob o
[sandbox](/pt/docs/features/sandbox) estrito do field, e os padrões ficam no
[`collie-work.json`](/pt/docs/reference/collie-work-json).

## Convocar um agente num field

```steps
items:
  - title: Convocar com --field
    command: collie summon api --field "criar o endpoint /itens, com testes"
    result: "Uma worktree em `<repo>/.collie/paddocks/field-api`, branch `collie/field/api`, cortada do HEAD do cercado."
  - title: Dar uma tarefa com check
    command: collie ask api "terminar /itens" --check "npm test -- itens"
    result: Quando o check passa, o land do field entra na fila e o ask termina.
  - title: Ou integrar você mesmo
    command: collie field land api
    result: Merge no branch do cercado, e o portão roda de novo.
```

A orientação do agente diz: `Field "<nome>" (branch collie/field/<nome>): commite aqui; o Pastor integra.`

### Recusas

`--field` é recusado sem o sandbox de terminais, para shell, com `--paddock`, `--cwd` ou `--shepherd`, fora de um
cercado git, com um laço em faixas (`work run --parallel` acima de 1) rodando no cercado, ou quando o cercado já tem
`fields.max` fields vivos (a mensagem dá o número). O nome é o do agente: `a-z`, `0-9` e `-`, até 40 caracteres.

## Os estados

`collie field list` mostra nome, agente, branch, base, commits e estado de cada field:

| Estado | Significado |
|---|---|
| `working` | O agente está trabalhando; ainda nada para integrar. |
| `ready` | No fim de um turno há commits além da base; o Pastor recebe `collie field land <nome>`. |
| `landing` | O integrador está fazendo o merge. |
| `landed` | Integrado no branch do cercado. |
| `conflict` | O merge ou o portão falhou; desfeito, com patch. |
| `behind` | Depois de um land, o field ainda não passou para o HEAD novo; tenta de novo no fim do próximo turno. |

Depois de um land, o branch do field é rebaseado no HEAD novo do cercado, só com o agente fora de um turno e a árvore
rastreada limpa. Uma mudança feita nesse meio-tempo nunca é descartada.

## Integrar, descartar e dispensar

**`field land <nome>`** espera até 10 minutos o cercado ficar limpo e livre. Depois responde `waiting` com o motivo e o
field fica `ready`. Com conflito ou portão quebrado, o merge é desfeito, o código fica em `<raiz>/fields/<nome>-<n>.patch`
(modo 0600) e o estado vira `conflict`.

**`field drop <nome> [--keep-branch]`** dispensa o agente e tira a worktree. Sem `--keep-branch`, o código fica num patch
e o branch é apagado.

**Dispensar o agente** (`collie dismiss`, "Encerrar ramo", a cascata) grava o que não foi commitado (rastreado e não
rastreado, sem ignorados) em `<raiz>/fields/<nome>-wip.patch`, tira a worktree e **mantém o branch**. O Pastor recebe uma
linha com o branch e o patch.

```callout
kind: note
title: Só código julgado é integrado
body: "Um `ask --check` integra o commit que o check julgou, e só enquanto ele é a ponta de `collie/field/<nome>` com o HEAD do field nesse branch. Um field que andou depois do check, ou com HEAD solto, é pulado."
```

## Padrão do projeto

```json collie-work.json
{
  "fields": { "default": true, "max": 4 }
}
```

Com `default: true`, o `collie summon` usa field onde `--field` seria aceito; `--no-field` convoca sem. `max` vai de 1 a 8
(padrão 4). O arquivo só conta **como está commitado no HEAD do cercado**: um agente que o edita na própria árvore não
liga nada.

## Quem pode o quê

`field list`, `field land` e `field drop` são comandos da CLI para o Pastor que convocou o agente; não estão no MCP, e o
app ainda não mostra fields. O Pastor aprende `summon --field` e `field list|land|drop` na orientação só quando cabe no
limite dela.

## Armadilhas

- O primeiro build de um field é frio: a worktree nova não tem pasta de build.
- Dois fields que mexem no mesmo arquivo conflitam no land, como duas faixas. Divida o trabalho por área.
- Um field sem agente (o agente foi dispensado) não é integrado por `field land`: integre `collie/field/<nome>` à mão
  ou rode `collie field drop <nome>`.
- O agente do field grava a própria árvore, os objetos e só `collie/field/<nome>`. O cercado, as faixas e os outros
  fields ficam fechados para ele.

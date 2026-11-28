---
title: "Navegador"
description: "Uma página WebKit de verdade que os agentes dirigem com collie browser, no canvas ou headless, até 8 por terminal."
---

O painel **Navegador** (Browser) é um `WKWebView` que os agentes dirigem com `collie browser …`: leem a página como uma
árvore de refs de elementos, clicam, digitam, mudam o viewport, emulam o modo escuro e tiram screenshots. É assim que um
agente confere uma mudança web numa página de verdade, em vez de adivinhar pelo código. A visão geral está em
[/pt/features/browser](/pt/features/browser).

Há dois jeitos de ter um: um painel no canvas que você e o agente compartilham, ou um navegador de teste que o terminal
abre para si, headless se quiser.

## Navegadores de teste

Qualquer terminal, não só o Pastor, abre os seus próprios navegadores, até **8 por terminal**. Além disso o comando falha
com `tooMany` ("at most 8 open browsers per terminal; close one with `panel close`").

```tabs
tabs:
  - label: Headless
    lang: sh
    code: |
      collie panel open browser --url http://localhost:3000
  - label: Visível
    lang: sh
    code: |
      collie panel open browser --url http://localhost:3000 --visible
  - label: Notas
    body: "O headless não tem nó no canvas nem doca, mas a página roda de verdade: animações, timers, entrada confiável, screenshots. `--visible` põe um painel normal no canvas, no cercado do terminal."
```

Nos dois casos o painel já nasce com uma guia até o terminal que o abriu. Um navegador headless aparece em
`collie panel list` (`placement: "headless"`) só para esse terminal, para o app e para um Pastor com guia até ele. Ele
fecha quando o terminal é removido ou o processo dele sai, e os screenshots dele vão junto. Um terminal que não é Pastor
fecha e move só os navegadores que abriu. O Pastor também pode pedir `--placement headless`.

## Dirigir a página

```sh
collie browser navigate http://localhost:3000/login
collie browser snapshot           # árvore compacta com refs e1, e2, ...
collie browser fill e4 "ana@example.com"
collie browser click e7
collie browser wait --text "Bem-vinda" --timeout 20
collie browser text               # texto visível
collie browser console --lines 50
```

Comece pelo `snapshot`: é a página em refs, a mesma ideia do `collie device ui`. Aja sobre refs e leia de novo.

| Comando | O que faz |
|---|---|
| `click <ref>` | Um clique de mouse de verdade quando a página está numa janela; a resposta diz `trusted: true` |
| `hover <ref>` | Move o ponteiro; o `:hover` vale quando a página está numa janela |
| `fill <ref> <texto>` / `type <texto>` | Preenche um campo / digita no elemento em foco (até 1024 caracteres) |
| `key <tecla>` | `Enter`, `Tab`, `Shift+Tab`, `Escape`, `ArrowDown`, `Meta+a`… `Meta+c/x/v` são recusados (sem área de transferência) |
| `scroll` | `--ref` até aparecer, ou `--dy` pixels |
| `wait` | `--text` ou `--selector`; `--timeout` em segundos, padrão 10, máximo 120 |
| `eval <js>` | Avalia JavaScript na página |
| `reload [--hard]` | `--hard` revalida tudo com a origem |
| `console` | Linhas recentes do console (padrão 100, máximo 500) |

Com mais de um painel ao alcance, acrescente `--panel <nome>`.

## Viewport, mídia e screenshots

`resize --width <px> [--height <px>]` (200–4096) define o viewport da página; o painel mantém o tamanho e mostra a página
reduzida para caber. `--reset` volta a preencher o painel. `emulate --color-scheme light|dark|system` e
`--reduced-motion reduce|no-preference|system` valem até mudar. O movimento reduzido reescreve as folhas de estilo que
consegue ler; a resposta lista as que não conseguiu (`uncoveredSheets`, de outra origem) e os shadow roots fechados.

```sh
collie browser screenshot --full-page --out shots/home.png
collie browser screenshot --ref e12          # recorta um elemento
collie browser screenshot --clip 0,0,390,800 # x,y,w,h em px CSS do viewport
```

O `--out` é gravado pelo processo `collie`, relativo à pasta atual dele; o daemon só escreve em `<root>/screens`.

```callout
kind: warning
title: Captura da página inteira
body: "`--full-page` divide o documento em blocos da altura do viewport, até 16384 px. Conteúdo que cresce durante a captura (lazy, infinito) é cortado na altura medida no início, e elementos `position: fixed` ou `sticky` se repetem em cada bloco."
```

## Storage e scripts de início

`storage clear [--local] [--session] [--cookies]` esvazia só o armazenamento deste painel (sem flags: tudo). Um painel
isolado perde todos os cookies; um painel de workspace ou global perde só os do site atual. `storage set --key K
--value V` e `get --key K` usam o `localStorage` e precisam de uma página com origem, não `about:blank`.

`init-script add --js <js>` roda JavaScript no início do documento, antes dos scripts da página, em todo carregamento
seguinte deste painel (até 64 KiB, no máximo 32 scripts). Não roda na página atual e não é salvo: dura até o painel
fechar. `init-script list` e `clear [--id ID]` os gerenciam. Use para fixar uma data, uma feature flag ou um fetch antes
de o app subir.

## QA responsivo em paralelo

Três navegadores, um por largura, cada um em segundo plano:

```sh
for w in 360 768 1280; do
  collie panel open browser --name qa-$w --url http://localhost:3000
  collie browser resize --panel qa-$w --width $w --height 800 &
done; wait
collie browser emulate --panel qa-360 --color-scheme dark --reduced-motion reduce
for w in 360 768 1280; do
  collie browser screenshot --panel qa-$w --full-page --out shots/home-$w.png &
done; wait
```

Feche com `collie panel close qa-360`, ou deixe: eles fecham quando o terminal sai.

## Como se conecta

- As guias decidem quais painéis um terminal alcança ([Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals)).
- Artifacts abrem no Navegador em `collie-artifact://app/<id>/v<N>/index.html`, e um tester compara
  `collie preview screenshot` com o Navegador ([Design e artifacts](/pt/docs/features/design-and-artifacts)).
- Apps de celular usam o mesmo ciclo "ler refs, agir, ler de novo" em [Dispositivos](/pt/docs/features/devices).
- Todas as flags: [Referência da CLI](/pt/docs/reference/cli).

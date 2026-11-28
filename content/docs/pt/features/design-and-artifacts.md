---
title: "Design e artifacts"
description: "Onde os agentes desenham primeiro, o painel Design e os design systems, e as páginas HTML versionadas que o Collie guarda como artifacts."
---

O Collie dá aos agentes dois lugares para desenhar uma tela antes de ela virar código, e um lugar para guardar o
resultado. Uma página na **Prévia** é HTML/CSS/JS comum no seu projeto, recarregado ao vivo. Um painel **Design** é um
arquivo do FigCraft, editado por você e pelos agentes na mesma sessão. Nos dois casos, a página que fica é um
**artifact**: uma página HTML versionada, com miniatura, pasta e comentários.

Esta página explica como essas peças se encaixam. As visões gerais estão em [/pt/features/design](/pt/features/design),
[/pt/features/artifacts](/pt/features/artifacts) e [/pt/features/diagram](/pt/features/diagram).

## Onde desenhar primeiro

A preferência **Onde desenhar** do workspace (Preferências) diz ao Pastor onde o trabalho de interface é desenhado antes
do código:

| Valor | O que o Pastor faz |
|---|---|
| `artifact` (padrão) | Escreve uma página numa Prévia com `collie artifact new prototype <nome>` |
| `figcraft` | Desenha num painel Design (FigCraft) |
| `ask` | Pergunta uma vez |

O app ou um Pastor do pasto muda com `collie design prefer artifact|figcraft|ask`; qualquer terminal lê com
`collie design prefer`. Se já houver um painel Design ligado ao Pastor, ele é usado primeiro. O rebanho de fábrica
**Feature com design** (Pastor, designer, interface e tester) também segue a preferência
([Rebanhos](/pt/docs/features/herds)).

## Páginas na Prévia

```sh
collie artifact new prototype checkout --title "Checkout"
collie panel open preview --file docs/pages/checkout/index.html
collie preview screenshot --full-page --out shots/checkout.png
```

`collie artifact new deck|dashboard|doc|prototype [nome]` escreve uma página inicial em `docs/pages/<nome>/index.html`
(nome em `a-z0-9-`, até 48; nunca sobrescreve) e abre uma Prévia nela. Os tokens vêm do design system ativo, Light e Dark
em `[data-theme]`; sem um, a página usa os tokens padrão e `warnings` avisa.

- `deck`: slides 16:9 (←/→/espaço). `dashboard`: indicadores, gráfico SVG de um array `data` e tabela. `doc`: documento
  com sumário fixo. `prototype`: casca de app de celular com lista, abas e uma folha.
- Qualquer terminal abre até 8 Prévias, sempre num arquivo dentro do projeto dele. Uma mudança na página, ou em outro
  arquivo da pasta dela, a recarrega em menos de 1 s mantendo a rolagem. O cabeçalho tem **Recarregar** e
  `Página | Claro | Escuro`.
- A página só lê arquivos da própria pasta do projeto, sem links simbólicos para fora e sem caminhos com ponto (`.env`,
  `.git/`, `.collie/`), até 8 MB cada. **A rede fica bloqueada** (http/https/ws, WebRTC). `collie preview get` devolve os
  últimos 20 erros da página.

### Bibliotecas e fontes offline

Como as páginas não têm rede, o app traz bibliotecas fixadas servidas em `collie-lib://lib/<nome>@<versão>/<arquivo>`:
React 18.3.1 e ReactDOM 18.3.1 (UMD), htm 3.1.1, Chart.js 4.4.9 e Lucide 0.469.0. `collie artifact libs` as lista. Não há
Babel na página, então use `htm` em vez de JSX:

```html index.html
<div id="root"></div>
<script src="collie-lib://lib/react@18.3.1/react.production.min.js"></script>
<script src="collie-lib://lib/react-dom@18.3.1/react-dom.production.min.js"></script>
<script src="collie-lib://lib/htm@3.1.1/htm.umd.js"></script>
<script>
  const html = htm.bind(React.createElement);
  ReactDOM.createRoot(document.getElementById("root")).render(html`<h1>Olá</h1>`);
</script>
```

As fontes vêm de `collie-lib://fonts/css?family=…`. Space Grotesk e DM Mono vêm com o Collie; `collie font add
"<Família>" [--weights 400,700]` baixa uma família do Google Fonts uma vez, pelo daemon, nunca pela página. Só o nome da
fonte e o download vão ao Google. A preferência **Baixar fontes do Google Fonts** desliga isso.

## Comentários

Na Prévia você fixa um comentário num ponto ou elemento da página: **Comentários (n)** → **Fixar comentário**, clique,
escreva, **Enviar**. Ele vai para o terminal dono da página (o que abriu a Prévia). As suas mensagens ainda não entregues
entram uma vez no próximo prompt desse terminal, cercadas e marcadas como dados, não ordens. O agente responde com
`collie comment reply <id> "<texto>"` e lê com `collie comment list [--open]`. Só você cria e resolve comentários; um
agente nunca. Eles ficam nos dados do Collie, nunca no projeto: nada vai para o git e um agente em sandbox não consegue
forjar um. O Codex não tem o gancho do prompt: lê com `comment list`.

## O painel Design

O painel Design é o FigCraft embutido: o daemon roda um servidor local (só `127.0.0.1`) e o painel mostra a UI web dele,
enquanto os agentes editam o mesmo arquivo pela CLI. No app, **Abrir painel… → Design**, depois escolha um arquivo ou
digite um nome em **Novo arquivo…**. Se o motor não estiver instalado, o painel oferece o download.

```sh
collie design files
collie design help node            # ids dos comandos do figcraft e parâmetros
collie design batch --file passos.json --label "Cabeçalho do checkout"
collie design inspect --depth 2
collie design screenshot --out shots/frame.png
collie design export --format html
```

`run <comando> --params '{…}'` roda um comando do FigCraft; `batch` roda uma lista como **um passo de desfazer, tudo ou
nada**. Os comandos nunca agem sobre a sua seleção: nomeiam as camadas por id. Os arquivos ficam no servidor local, não
no git; `export --format figcraft` gera um `.figcraft` (recusado num arquivo que usa design systems; exporte html, css ou
react).

## Design systems

Um design system é um arquivo de design com variáveis (tokens, com modos), estilos e componentes, publicado em versões.
Um deles pode ser o **ativo** do workspace, e cada cercado pode ter o seu. No app, **Abrir painel… → Design Systems**;
toda alteração pede um **motivo**, guardado no histórico e como decisão na [Memória](/pt/docs/features/memory).

```sh
collie design system list
collie design system create marca --reason "marca nova"
collie design system use marca --paddock checkout --reason "testar a marca nova"
collie design system tokens
collie design system bind --variable color/primary --field fill --ids 12,14
```

Trocar o sistema ativo religa os arquivos daquele escopo por nome (variáveis por coleção, nome e tipo; estilos por nome
e tipo; componentes por nome). O que não casa continua no sistema anterior e aparece em `unmatched`. `undo` alterna entre
os dois últimos sistemas do escopo. `publish` e `revert` por um terminal exigem uma guia até o painel Design do sistema. A
troca não é transacional entre arquivos: o resultado vem por arquivo.

## Artifacts

Um artifact é uma página HTML guardada em versões em `<root>/artifacts/<id>/`. Dois tipos:

- **Exports.** Todo `collie design export --format html [--node <id>]` vira um, depois de um pós-processador (tags
  semânticas, reset de CSS, tokens com Light/Dark em `[data-theme]`, SVG inline, layout responsivo básico). Exportar de
  novo o mesmo arquivo e nó gera a versão seguinte. Status: `current`, `stale` (o design mudou depois do export),
  `missing`, `unknown`.
- **Páginas entregues pelos agentes.** `collie artifact add <página.html|pasta|.zip> [--root <pasta>] [--title]
  [--folder]` guarda uma página (`.html`/`.htm` até 8 MB; com `--root`, até 2000 arquivos e 64 MiB) e começa a importá-la
  como tela editável de design em segundo plano.

No `add`, scripts de CDNs conhecidas (React, ReactDOM, Chart.js, Lucide, htm no unpkg, jsDelivr ou cdnjs) e links do
Google Fonts são trocados por `collie-lib://` na cópia; o original fica intacto. O que continuar remoto é listado em
`needsNetwork` e o painel marca **precisa de rede**.

### Importar como tela de design

A importação abre a página numa web view invisível (1440 px de largura por padrão, `--width 320-3840`), lê o DOM e os
estilos calculados, e o daemon transforma isso num único batch do FigCraft: um arquivo de design novo com frames (flex e
grid viram auto layout e grid), textos com estilo, imagens e SVGs. Com um design system ativo, cores sólidas iguais a
uma variável de cor do sistema são ligadas a ela. **O app precisa estar aberto**, a rede fica bloqueada e são lidos até
3000 elementos, no estado em que a página carrega (sem cliques, sem rolagem). O resultado é uma aproximação para
continuar editando, não uma cópia pixel a pixel: pseudo-elementos, `transform`, animações, `sticky`, iframes e vídeo não
entram.

### Pastas e decks

- `--folder Cliente/Landing/v2` (até 3 níveis) no `add` e no `new`; o padrão de um agente é o nome do seu lote.
  `collie artifact move <id>… --folder <caminho>` move vários de uma vez, para uma pasta que já existe; criar, renomear e
  remover pastas é do app.
- Uma página de slides (elementos `.slide` ou `[data-slide]`) exporta com o app aberto:
  `collie artifact export <id> --format pptx|pdf [--out <arquivo>]`. Um `<aside>` escondido no slide vira a nota do
  apresentador. O `.pptx` perde gradientes (fica a primeira cor), sombras, `clip-path`, o conteúdo de pseudo-elementos e
  as fontes da web; a lista `warnings` diz quais.

```callout
kind: warning
body: "Todos os artifacts compartilham a origem `collie-artifact://app` no Navegador, então o HTML de um agente pode ler outros artifacts locais."
```

## Do claude.ai

`collie artifact import-claude <links…>` (até 50) não baixa nada por conta própria: devolve uma receita para um terminal
Claude Code já logado ler cada link com a própria ferramenta Artifact e entregar os arquivos com
`artifact add --source <link>`. O Collie nunca guarda credenciais do claude.ai. O mesmo link de novo é a próxima versão.
No painel Artifacts, **Importar do Claude…** manda o pedido para um terminal Claude e mostra cada link aguardando,
importado ou com falha.

## Como se conecta

- As páginas abrem no [Navegador](/pt/docs/features/browser) em `collie-artifact://app/<id>/v<N>/index.html`.
- O rebanho Feature com design liga designer, interface e tester em torno de uma página
  ([Rebanhos](/pt/docs/features/herds)).
- Cada mudança de design system é uma decisão na [Memória](/pt/docs/features/memory).
- As páginas da Prévia ficam presas ao projeto, como o [sandbox](/pt/docs/features/sandbox) do terminal.

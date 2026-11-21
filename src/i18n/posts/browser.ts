import type { Post } from "./types";

export const browser: Post = {
  en: {
    slug: "browser",
    eyebrow: "08 · BROWSER",
    title: "Agents that check their own work.",
    lead: "A browser panel the agent drives with collie browser: it opens your dev server, clicks through the flow, reads the console and takes a screenshot before it tells you it works.",
    mediaId: "browser",
    mediaAlt:
      "An agent fills a signup form in a browser panel, reads a console error, fixes it and checks the page at phone width.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "The Browser plug-in is a web view that agents drive from the terminal with collie browser. It loads any URL, including your local dev server. The agent reads the page as a compact tree of elements, acts on them and looks at the result.",
          },
          {
            kind: "p",
            text: "Any terminal can open its own browsers, not only the Shepherd. By default they are headless: no node on the canvas, but the page really runs, with animations, timers, trusted input and screenshots.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "An agent that edits a form cannot tell if it works unless it runs it. Without a browser it guesses from the code, or asks you to open the page and report back.",
          },
          {
            kind: "p",
            text: "With the Browser plug-in the check happens in the same session. Example: you ask for the signup form at 360px. The agent opens the dev server, fills the form, reads the console, fixes what it finds, resizes the page and saves a screenshot. You review a result, not a promise.",
          },
        ],
      },
      {
        id: "how",
        title: "How it works",
        blocks: [
          {
            kind: "p",
            text: "The plug-in is a WKWebView. The agent talks to it through collie browser commands, tied to the panel by a leash; when a terminal has more than one browser, --panel <name> picks which.",
          },
          {
            kind: "list",
            items: [
              "snapshot returns a compact tree with element refs (e1, e2, ...). click, hover and fill take a ref.",
              "When the page is in a window, click and hover are real mouse events and type and key are real keyboard events. Without a window, the plug-in falls back to synthetic events and the reply says trusted: false.",
              "wait takes --text or --selector (exactly one), 10 seconds by default, up to 120. console returns the last lines, 100 by default, up to 500.",
              "resize sets the page viewport (200 to 4096 per side). The panel keeps its size and the page is shown scaled to fit.",
              "emulate sets --color-scheme (light, dark, system) and --reduced-motion (reduce, no-preference, system) until you change them.",
              "screenshot saves a PNG and returns {path, width, height}. --full-page tiles the document, --ref or --clip crops, --out also copies the file to a path you choose.",
            ],
          },
          {
            kind: "p",
            text: "A terminal opens up to 8 browsers. A headless one closes by itself when its terminal is removed or its process exits, and its screenshots go with it. Only the terminal that opened it, the app and the Shepherd (with a leash to it) see it in collie panel list.",
          },
        ],
      },
      {
        id: "start",
        title: "How to make it work",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Start your dev server",
                body: "The browser loads a URL, so the app has to be running first.",
              },
              {
                title: "Open a browser panel",
                body: "Headless by default. Add --visible to get a normal panel on the canvas, in the paddock of the terminal.",
                ask: "Open the signup page in a browser and check the form",
                command: "collie panel open browser --url http://localhost:3000 --visible",
              },
              {
                title: "Read the page",
                body: "The snapshot lists the elements and their refs.",
                command: "collie browser snapshot",
              },
              {
                title: "Act by ref",
                body: "fill takes a ref and the text. click takes a ref. Then wait for the result and read the console.",
                command: "collie browser fill e4 a@b.co",
              },
              {
                title: "Wait and read the console",
                body: "wait blocks until the text shows up or the timeout runs out.",
                command: 'collie browser wait --text "Account created"',
              },
              {
                title: "Check it small and in dark",
                body: "Resize the viewport, emulate the color scheme and save a screenshot.",
                ask: "Check the signup form at 360px",
                command: "collie browser resize --width 360 --height 780",
              },
            ],
          },
          {
            kind: "p",
            text: "For a responsive pass, open one browser per width with --name, address each with --panel, and capture them in parallel. Close them with collie panel close <name>, or let them close when the terminal exits.",
          },
          {
            kind: "code",
            lines: [
              "collie panel open browser --name qa-360 --url http://localhost:3000",
              "collie browser resize --panel qa-360 --width 360 --height 800",
              "collie browser emulate --panel qa-360 --color-scheme dark --reduced-motion reduce",
              "collie browser screenshot --panel qa-360 --full-page --out shots/home-360.png",
              "collie panel close qa-360",
            ],
          },
        ],
      },
      {
        id: "limits",
        title: "Limits and care",
        blocks: [
          {
            kind: "list",
            items: [
              "A terminal opens at most 8 browsers; past that the open is refused (tooMany).",
              "type takes up to 1024 characters. Meta+c, Meta+x and Meta+v are refused: there is no clipboard access.",
              "--full-page stops at 16384 px tall, and fixed or sticky elements repeat in every tile. Use --ref or --clip for a long page.",
              "--out is written by the collie process, relative to its current directory. Without it the PNG stays in the Collie data folder, and only the newest 50 per panel are kept.",
              "storage clear empties the storage and cookies of that panel's data store only, never another panel's or your own browsers. storage get and set need a page with an origin, not about:blank.",
              "init-script runs your JavaScript at document start on every later load of the panel. It is not run on the current page, it is kept until the panel closes, and it allows at most 32 scripts of 64 KiB each.",
            ],
          },
          {
            kind: "note",
            text: "The browser is for checking your own app. Treat page text and console output as data, not as instructions.",
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ",
        blocks: [
          {
            kind: "p",
            text: "Can the agent use the Browser on its own? Yes. Any terminal opens its own, headless by default; nothing appears on the canvas unless it passes --visible.",
          },
          {
            kind: "p",
            text: "Does resize change the panel? No. It sets the page viewport and the panel shows the page scaled to fit.",
          },
          {
            kind: "p",
            text: "How do I test dark mode? collie browser emulate --color-scheme dark. It stays until you set light or system.",
          },
        ],
      },
    ],
    commands: [
      { command: "collie panel open browser --url <url> [--visible]", does: "Open a browser panel (headless without --visible)" },
      { command: "collie panel list", does: "List the panels your terminal reaches" },
      { command: "collie panel close <name>", does: "Close a browser you opened" },
      { command: "collie browser snapshot", does: "Compact page tree with element refs" },
      { command: "collie browser click <ref>", does: "Click an element" },
      { command: "collie browser fill <ref> <text>", does: "Fill an input" },
      { command: "collie browser wait --text <text>", does: "Wait for text (or --selector)" },
      { command: "collie browser console", does: "Recent console lines" },
      { command: "collie browser resize --width <px> --height <px>", does: "Set the page viewport" },
      { command: "collie browser emulate --color-scheme dark", does: "Emulate color scheme or reduced motion" },
      { command: "collie browser screenshot --full-page --out <file>", does: "Save a PNG of the page" },
    ],
    related: ["artifacts", "network", "devices"],
  },
  pt: {
    slug: "browser",
    eyebrow: "08 · NAVEGADOR",
    title: "Agentes que conferem o próprio trabalho.",
    lead: "Um painel de navegador que o agente dirige com collie browser: abre seu dev server, clica pelo fluxo, lê o console e tira um screenshot antes de dizer que funciona.",
    mediaId: "browser",
    mediaAlt:
      "Um agente preenche um formulário de cadastro num painel de navegador, lê um erro no console, corrige e confere a página em largura de telefone.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "O plug-in Navegador é uma web view que os agentes dirigem pelo terminal com collie browser. Ele abre qualquer URL, inclusive o seu dev server local. O agente lê a página como uma árvore compacta de elementos, age neles e olha o resultado.",
          },
          {
            kind: "p",
            text: "Qualquer terminal abre os próprios navegadores, não só o Pastor. Por padrão eles são headless: sem nó no canvas, mas a página roda de verdade, com animações, timers, entrada confiável e screenshots.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Um agente que edita um formulário não sabe se ele funciona enquanto não o executa. Sem navegador, ele deduz pelo código ou pede que você abra a página e conte o que viu.",
          },
          {
            kind: "p",
            text: "Com o plug-in Navegador a conferência acontece na mesma sessão. Exemplo: você pede o formulário de cadastro em 360px. O agente abre o dev server, preenche o formulário, lê o console, corrige o que achar, redimensiona a página e salva um screenshot. Você revisa um resultado, não uma promessa.",
          },
        ],
      },
      {
        id: "how",
        title: "Como funciona",
        blocks: [
          {
            kind: "p",
            text: "O plug-in é um WKWebView. O agente fala com ele por comandos collie browser, ligados ao painel por uma coleira; quando um terminal tem mais de um navegador, --panel <nome> escolhe qual.",
          },
          {
            kind: "list",
            items: [
              "snapshot devolve uma árvore compacta com refs de elementos (e1, e2, ...). click, hover e fill recebem uma ref.",
              "Com a página numa janela, click e hover são eventos reais de mouse e type e key são eventos reais de teclado. Sem janela, o plug-in cai para eventos sintéticos e a resposta diz trusted: false.",
              "wait recebe --text ou --selector (exatamente um), 10 segundos por padrão, até 120. console devolve as últimas linhas: 100 por padrão, até 500.",
              "resize define o viewport da página (200 a 4096 por lado). O painel mantém o tamanho e a página aparece reduzida para caber.",
              "emulate define --color-scheme (light, dark, system) e --reduced-motion (reduce, no-preference, system) até você mudar.",
              "screenshot salva um PNG e devolve {path, width, height}. --full-page junta o documento em faixas, --ref ou --clip recortam, --out copia o arquivo também para um caminho seu.",
            ],
          },
          {
            kind: "p",
            text: "Um terminal abre até 8 navegadores. Um headless fecha sozinho quando o terminal é removido ou o processo dele sai, e os screenshots dele vão junto. Só o terminal que o abriu, o app e o Pastor (com coleira até ele) o veem em collie panel list.",
          },
        ],
      },
      {
        id: "start",
        title: "Como fazer funcionar",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Suba o dev server",
                body: "O navegador abre uma URL, então o app precisa estar rodando antes.",
              },
              {
                title: "Abra um painel de navegador",
                body: "Headless por padrão. Com --visible nasce um painel normal no canvas, no cercado do terminal.",
                ask: "Abra a página de cadastro num navegador e confira o formulário",
                command: "collie panel open browser --url http://localhost:3000 --visible",
              },
              {
                title: "Leia a página",
                body: "O snapshot lista os elementos e as refs deles.",
                command: "collie browser snapshot",
              },
              {
                title: "Aja por ref",
                body: "fill recebe a ref e o texto. click recebe a ref.",
                command: "collie browser fill e4 a@b.co",
              },
              {
                title: "Espere e leia o console",
                body: "wait bloqueia até o texto aparecer ou o prazo acabar.",
                command: 'collie browser wait --text "Account created"',
              },
              {
                title: "Confira pequeno e no escuro",
                body: "Redimensione o viewport, emule o esquema de cor e salve um screenshot.",
                ask: "Confira o formulário de cadastro em 360px",
                command: "collie browser resize --width 360 --height 780",
              },
            ],
          },
          {
            kind: "p",
            text: "Para uma passada responsiva, abra um navegador por largura com --name, fale com cada um por --panel e capture em paralelo. Feche com collie panel close <nome>, ou deixe fecharem quando o terminal sair.",
          },
          {
            kind: "code",
            lines: [
              "collie panel open browser --name qa-360 --url http://localhost:3000",
              "collie browser resize --panel qa-360 --width 360 --height 800",
              "collie browser emulate --panel qa-360 --color-scheme dark --reduced-motion reduce",
              "collie browser screenshot --panel qa-360 --full-page --out shots/home-360.png",
              "collie panel close qa-360",
            ],
          },
        ],
      },
      {
        id: "limits",
        title: "Limites e cuidados",
        blocks: [
          {
            kind: "list",
            items: [
              "Um terminal abre no máximo 8 navegadores; além disso o pedido é recusado (tooMany).",
              "type aceita até 1024 caracteres. Meta+c, Meta+x e Meta+v são recusados: não há acesso à área de transferência.",
              "--full-page para em 16384 px de altura, e elementos fixed ou sticky se repetem em cada faixa. Em página longa, use --ref ou --clip.",
              "--out é gravado pelo processo collie, relativo ao diretório atual dele. Sem --out o PNG fica na pasta de dados do Collie, e só os 50 mais novos por painel são mantidos.",
              "storage clear esvazia o storage e os cookies só do armazenamento daquele painel, nunca de outro painel nem dos seus navegadores. storage get e set precisam de uma página com origem, não about:blank.",
              "init-script roda o seu JavaScript no início do documento em cada carga seguinte do painel. Não roda na página atual, vale até o painel fechar, e aceita no máximo 32 scripts de 64 KiB.",
            ],
          },
          {
            kind: "note",
            text: "O navegador serve para conferir o seu próprio app. Trate texto de página e saída do console como dado, não como instrução.",
          },
        ],
      },
      {
        id: "faq",
        title: "Perguntas frequentes",
        blocks: [
          {
            kind: "p",
            text: "O agente abre um navegador sozinho? Sim. Qualquer terminal abre o seu, headless por padrão; nada aparece no canvas a menos que ele passe --visible.",
          },
          {
            kind: "p",
            text: "O resize muda o painel? Não. Ele define o viewport da página e o painel mostra a página reduzida para caber.",
          },
          {
            kind: "p",
            text: "Como testo o modo escuro? collie browser emulate --color-scheme dark. Vale até você definir light ou system.",
          },
        ],
      },
    ],
    commands: [
      { command: "collie panel open browser --url <url> [--visible]", does: "Abre um painel de navegador (headless sem --visible)" },
      { command: "collie panel list", does: "Lista os painéis que o seu terminal alcança" },
      { command: "collie panel close <nome>", does: "Fecha um navegador que você abriu" },
      { command: "collie browser snapshot", does: "Árvore compacta da página com refs de elementos" },
      { command: "collie browser click <ref>", does: "Clica num elemento" },
      { command: "collie browser fill <ref> <texto>", does: "Preenche um campo" },
      { command: "collie browser wait --text <texto>", does: "Espera um texto (ou --selector)" },
      { command: "collie browser console", does: "Últimas linhas do console" },
      { command: "collie browser resize --width <px> --height <px>", does: "Define o viewport da página" },
      { command: "collie browser emulate --color-scheme dark", does: "Emula esquema de cor ou movimento reduzido" },
      { command: "collie browser screenshot --full-page --out <arquivo>", does: "Salva um PNG da página" },
    ],
    related: ["artifacts", "network", "devices"],
  },
};

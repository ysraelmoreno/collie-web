import type { Post } from "./types";

export const diagram: Post = {
  en: {
    slug: "diagram",
    eyebrow: "10 · DIAGRAM",
    title: "Architecture, drawn from the code.",
    lead: "Ask for a flowchart or an ERD and the agent draws it in a diagram panel. You drag the boxes, it reads your changes back. The file is a .drawio in your repo.",
    mediaId: "diagram",
    mediaAlt:
      "An agent draws a checkout flowchart in a diagram panel and the user drags one of the boxes.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "The Diagram plug-in is a light editor for flowcharts, swimlanes, ERD and UML, on the canvas next to the terminal. The editor is a pinned, embedded copy of draw.io and runs offline: no request leaves your machine.",
          },
          {
            kind: "p",
            text: "The diagram is a .drawio file in your project. You edit it by hand in the panel and the agent edits the same file with collie diagram.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "Architecture diagrams go stale because drawing them is a separate job, in a separate tool, saved somewhere else.",
          },
          {
            kind: "p",
            text: "Here the agent that just read your checkout code draws it, and the file lands in the repo. You move a box that is in the wrong place, and the agent reads the corrected diagram back. Example: you ask for the checkout flow, it draws Cart, Payment and Order, and you drag the Retry box where it belongs.",
          },
        ],
      },
      {
        id: "how",
        title: "How it works",
        blocks: [
          {
            kind: "list",
            items: [
              "The file. collie panel open diagram --file <path.drawio> opens it, always inside the project. The default is docs/diagrams/<panel>.drawio. It is versioned in git like any file.",
              "By hand. The panel saves on every change, and reloads when the file changes on disk.",
              "By the agent. get returns the current file, its XML and its pages. mermaid turns Mermaid text into editable shapes, placed below what is already there. set replaces the whole XML.",
              "Out. export writes a PNG or an SVG. screenshot saves a picture of the panel.",
            ],
          },
          {
            kind: "p",
            text: "set is refused if you edited the diagram in the last 2 seconds, so the agent never overwrites what you are doing. mermaid and export accept --page <name> to pick a page of the file.",
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
                title: "Open a diagram panel",
                body: "Point it at a .drawio path inside the project. Without --file the app uses docs/diagrams/<panel>.drawio.",
                command:
                  "collie panel open diagram --file docs/diagrams/checkout.drawio",
              },
              {
                title: "Ask for the diagram",
                body: "The agent reads the code and draws it from Mermaid text.",
                ask: "Draw the checkout flow from the code",
                command:
                  'collie diagram mermaid "flowchart LR; Cart --> Payment --> Order"',
              },
              {
                title: "Adjust by hand",
                body: "Drag boxes and edit labels in the panel. It saves on every change.",
              },
              {
                title: "Let the agent read it back",
                body: "get returns the file path, the XML and the pages.",
                ask: "Read my changes and update the flow",
                command: "collie diagram get",
              },
              {
                title: "Export a picture",
                body: "A PNG or SVG for a doc or a PR.",
                command:
                  "collie diagram export --format svg --out docs/diagrams/checkout.svg",
              },
              {
                title: "Commit it",
                body: "The file is yours: review the diff and commit it like any other.",
              },
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
              "The diagram must be a .drawio file inside the project.",
              "export only does png and svg.",
              "The agent writes the diagram; it does not commit it. The commit is yours.",
              "draw.io and diagrams.net are trademarks of JGraph. The embedded editor is Apache-2.0.",
            ],
          },
          {
            kind: "note",
            text: "Check what the agent drew against the code. A diagram that looks right can still leave a branch out.",
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ",
        blocks: [
          {
            kind: "p",
            text: "Does it need the network? No. The editor is embedded and pinned, and runs offline.",
          },
          {
            kind: "p",
            text: "Can I open a diagram I already have? Yes. Put the .drawio file in the project and open it with --file.",
          },
          {
            kind: "p",
            text: "What if I am editing while the agent writes? set is refused if you edited in the last 2 seconds. Try again in a moment.",
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie panel open diagram --file <path.drawio>",
        does: "Open a diagram panel on a file in the project",
      },
      {
        command: 'collie diagram mermaid "<text>" [--page <name>]',
        does: "Draw from Mermaid, as editable shapes",
      },
      { command: "collie diagram get", does: "Current file, XML and pages" },
      {
        command: "collie diagram set --xml <xml> | --from <file>",
        does: "Replace the whole diagram",
      },
      {
        command:
          "collie diagram export --format png|svg [--page <name>] [--out <file>]",
        does: "Export a PNG or SVG",
      },
      {
        command: "collie diagram screenshot [--out <file>]",
        does: "Picture of the panel",
      },
    ],
    related: ["artifacts", "design", "shepherd"],
  },
  pt: {
    slug: "diagram",
    eyebrow: "10 · DIAGRAMA",
    title: "Arquitetura, desenhada a partir do código.",
    lead: "Peça um fluxograma ou um ERD e o agente desenha num painel de diagrama. Você arrasta as caixas, ele lê suas mudanças. O arquivo é um .drawio no seu repo.",
    mediaId: "diagram",
    mediaAlt:
      "Um agente desenha o fluxograma do checkout num painel de diagrama e o usuário arrasta uma das caixas.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "O plug-in Diagrama é um editor leve de fluxogramas, raias, ERD e UML, no canvas ao lado do terminal. O editor é uma cópia embutida e fixada do draw.io e roda offline: nenhuma requisição sai da sua máquina.",
          },
          {
            kind: "p",
            text: "O diagrama é um arquivo .drawio do seu projeto. Você edita à mão no painel e o agente edita o mesmo arquivo com collie diagram.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Diagramas de arquitetura ficam velhos porque desenhar é outro trabalho, em outra ferramenta, salvo em outro lugar.",
          },
          {
            kind: "p",
            text: "Aqui o agente que acabou de ler o código do checkout desenha o fluxo, e o arquivo cai no repo. Você move uma caixa que está no lugar errado, e o agente lê o diagrama corrigido. Exemplo: você pede o fluxo de checkout, ele desenha Cart, Payment e Order, e você arrasta a caixa Retry para onde deve ficar.",
          },
        ],
      },
      {
        id: "how",
        title: "Como funciona",
        blocks: [
          {
            kind: "list",
            items: [
              "O arquivo. collie panel open diagram --file <caminho.drawio> abre o arquivo, sempre dentro do projeto. O padrão é docs/diagrams/<painel>.drawio. Ele é versionado no git como qualquer arquivo.",
              "À mão. O painel salva a cada mudança e recarrega quando o arquivo muda no disco.",
              "Pelo agente. get devolve o arquivo atual, o XML e as páginas. mermaid transforma texto Mermaid em formas editáveis, colocadas abaixo do que já existe. set troca o XML inteiro.",
              "Para fora. export grava um PNG ou um SVG. screenshot salva uma imagem do painel.",
            ],
          },
          {
            kind: "p",
            text: "set é recusado se você editou o diagrama nos últimos 2 segundos, então o agente nunca sobrescreve o que você está fazendo. mermaid e export aceitam --page <nome> para escolher uma página do arquivo.",
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
                title: "Abra um painel de diagrama",
                body: "Aponte para um caminho .drawio dentro do projeto. Sem --file o app usa docs/diagrams/<painel>.drawio.",
                command:
                  "collie panel open diagram --file docs/diagrams/checkout.drawio",
              },
              {
                title: "Peça o diagrama",
                body: "O agente lê o código e desenha a partir de texto Mermaid.",
                ask: "Desenhe o fluxo de checkout a partir do código",
                command:
                  'collie diagram mermaid "flowchart LR; Cart --> Payment --> Order"',
              },
              {
                title: "Ajuste à mão",
                body: "Arraste caixas e edite rótulos no painel. Ele salva a cada mudança.",
              },
              {
                title: "Deixe o agente reler",
                body: "get devolve o caminho do arquivo, o XML e as páginas.",
                ask: "Leia minhas mudanças e atualize o fluxo",
                command: "collie diagram get",
              },
              {
                title: "Exporte uma imagem",
                body: "Um PNG ou SVG para um doc ou um PR.",
                command:
                  "collie diagram export --format svg --out docs/diagrams/checkout.svg",
              },
              {
                title: "Faça o commit",
                body: "O arquivo é seu: revise o diff e faça o commit como qualquer outro.",
              },
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
              "O diagrama precisa ser um arquivo .drawio dentro do projeto.",
              "export só faz png e svg.",
              "O agente escreve o diagrama; ele não faz o commit. O commit é seu.",
              "draw.io e diagrams.net são marcas da JGraph. O editor embutido é Apache-2.0.",
            ],
          },
          {
            kind: "note",
            text: "Confira o que o agente desenhou contra o código. Um diagrama com cara de certo ainda pode deixar um ramo de fora.",
          },
        ],
      },
      {
        id: "faq",
        title: "Perguntas frequentes",
        blocks: [
          {
            kind: "p",
            text: "Precisa de rede? Não. O editor é embutido e fixado, e roda offline.",
          },
          {
            kind: "p",
            text: "Posso abrir um diagrama que já tenho? Pode. Ponha o arquivo .drawio no projeto e abra com --file.",
          },
          {
            kind: "p",
            text: "E se eu estiver editando enquanto o agente escreve? set é recusado se você editou nos últimos 2 segundos. Tente de novo em instantes.",
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie panel open diagram --file <caminho.drawio>",
        does: "Abre um painel de diagrama num arquivo do projeto",
      },
      {
        command: 'collie diagram mermaid "<texto>" [--page <nome>]',
        does: "Desenha a partir de Mermaid, em formas editáveis",
      },
      { command: "collie diagram get", does: "Arquivo atual, XML e páginas" },
      {
        command: "collie diagram set --xml <xml> | --from <arquivo>",
        does: "Troca o diagrama inteiro",
      },
      {
        command:
          "collie diagram export --format png|svg [--page <nome>] [--out <arquivo>]",
        does: "Exporta um PNG ou SVG",
      },
      {
        command: "collie diagram screenshot [--out <arquivo>]",
        does: "Imagem do painel",
      },
    ],
    related: ["artifacts", "design", "shepherd"],
  },
};

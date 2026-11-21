import type { Post } from "./types";

export const artifacts: Post = {
  en: {
    slug: "artifacts",
    eyebrow: "09 · ARTIFACTS",
    title: "Point at it. The agent fixes it.",
    lead: "Agents start decks, dashboards, docs and prototypes from templates themed with your tokens. Pin a comment on the preview and it lands in the agent's next prompt.",
    mediaId: "artifacts",
    mediaAlt:
      "A comment pinned on a preview page reaches the agent, which fixes the page; the user then resolves the comment.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "An artifact page is an HTML page the agent builds inside your project and you look at in a Preview panel. collie artifact new writes a starting page from one of four templates, already using the tokens of your active design system in Light and Dark.",
          },
          {
            kind: "p",
            text: "On the Preview you pin a comment on a spot of the page. It reaches the agent in its next prompt, and the agent answers in the conversation.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "Feedback on a page is usually a sentence like \"the middle card, make it stand out\". Typed into a chat, the agent has to guess which card you mean.",
          },
          {
            kind: "p",
            text: "Here you click the card and write the note. The comment is tied to that spot, and the agent sees it with your next prompt. Example: you ask for the pricing page as a prototype, pin \"Make this plan the highlighted one\" on the middle plan, and the agent edits the page and replies.",
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
              "Templates. deck is 16:9 slides (left and right arrows, or space). dashboard has indicators, an SVG chart from a data array and a table. doc is a document with a fixed table of contents. prototype is a phone app shell with a list, tabs and a sheet.",
              "Where it lives. artifact new writes docs/pages/<name>/index.html, a file in your project, and opens a Preview on it. The name uses a-z, 0-9 and hyphens, up to 48 characters, and an existing page is never overwritten.",
              "Offline. Local pages have no network. React 18.3.1 with ReactDOM, htm 3.1.1, Chart.js 4.4.9 and Lucide 0.469.0 ship with the app, pinned by version. Pages load them from collie-lib:// URLs. Lucide icons come in every template, Chart.js in dashboard, React and htm in prototype.",
              "Live reload. The Preview reloads in under a second when the page changes on disk, keeping the scroll. The header has Reload and a Page, Light, Dark switch.",
              "Comments. In the Preview header, Comments opens the drawer: Pin comment, click a spot, write, Send. The terminal that opened the Preview receives it.",
            ],
          },
          {
            kind: "p",
            text: "The agent reads your pending comments in its next prompt, once, marked as data and not as orders, one per line, cut at 1200 bytes. It answers with collie comment reply <id> \"<text>\", and the reply shows in the Preview conversation. collie comment list [--open] shows its comments with the full text.",
          },
          {
            kind: "p",
            text: "Comments are stored in the Collie data folder, never in the project, so nothing goes to git and a sandboxed agent cannot forge one from you.",
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
                title: "Pick a design system (optional)",
                body: "The templates take their tokens from the active design system. Without one, the page uses default tokens and warnings says so.",
              },
              {
                title: "Ask for a page",
                body: "The agent writes the page and opens a Preview on it.",
                ask: "Draft the pricing page as a prototype",
                command: "collie artifact new prototype pricing",
              },
              {
                title: "Pin a comment",
                body: "In the Preview, open Comments, click Pin comment, click the spot, write and Send.",
              },
              {
                title: "Let the agent reply",
                body: "It sees the comment in its next prompt, edits the page and answers with comment reply.",
                command: 'collie comment reply 1 "Done, Pro is highlighted"',
              },
              {
                title: "Resolve it",
                body: "Only you resolve or reopen a comment, from the drawer.",
              },
              {
                title: "Export a deck",
                body: "A slides page becomes an editable .pptx or a PDF. Register the page with artifact add, then export by its id (artifact list shows it). The app must be open.",
                ask: "Export the deck as PowerPoint",
                command: "collie artifact export <id> --format pptx --out deck.pptx",
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
              "Only you create comments, send follow-ups and resolve or reopen them. An agent only replies.",
              "Comment limits: 2000 characters per message of yours, 4000 per reply, 500 comments per page, 200 messages per conversation.",
              "The Preview reads files only from the project folder, up to 8 MB each, with no symlinks pointing out and no dot paths such as .env or .git. The network is blocked.",
              "A change made in place inside a subfolder is not seen by live reload. Use Reload.",
              "A deck export needs .slide elements, or [data-slide] if there are none. A bare section does not count. Without slides the export says: page has no slides.",
              "The .pptx loses some things, listed in warnings: a gradient becomes its first color, box-shadow and clip-path are dropped, ::before and ::after content is dropped, web fonts are not embedded, transform, filter and animations are not exported, and line breaks can change in PowerPoint.",
              "The PDF has one 960 x 540 pt page per slide, with selectable text and printed backgrounds.",
              "Pages from artifact new are plain project files and are not versioned by Collie. Versions and folders apply to registered artifacts.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ",
        blocks: [
          {
            kind: "p",
            text: "Can I bring a page from claude.ai? Yes. collie artifact import-claude <links> hands the agent the recipe: a logged-in Claude Code terminal reads each link with its own Artifact tool and registers the page. Collie never stores your claude.ai credentials.",
          },
          {
            kind: "p",
            text: "Do pages work offline? Yes. Libraries come from collie-lib:// and fonts from the app or from families you downloaded with collie font add.",
          },
          {
            kind: "p",
            text: "Which terminal gets my comment? The one that opened the Preview. If it no longer exists, the single terminal leashed to it. Otherwise nobody, so leash one.",
          },
        ],
      },
    ],
    commands: [
      { command: "collie artifact new deck|dashboard|doc|prototype [name]", does: "Write a template page in docs/pages and open a Preview" },
      { command: "collie preview get", does: "Page file, URL and the last 20 page errors" },
      { command: "collie preview screenshot [--full-page] [--out <file>]", does: "Screenshot of the Preview" },
      { command: "collie comment list [--open]", does: "The comments addressed to this terminal" },
      { command: 'collie comment reply <id> "<text>"', does: "Answer a comment" },
      { command: "collie artifact export <id> --format pptx|pdf [--out <file>]", does: "Export a slides page" },
      { command: "collie artifact libs", does: "List the offline libraries" },
      { command: "collie artifact import-claude <links>", does: "Import claude.ai artifacts" },
    ],
    related: ["design", "browser", "diagram"],
  },
  pt: {
    slug: "artifacts",
    eyebrow: "09 · ARTIFACTS",
    title: "Aponte. O agente corrige.",
    lead: "Agentes começam decks, dashboards, docs e protótipos por modelos com os seus tokens. Fixe um comentário na prévia e ele chega no próximo prompt do agente.",
    mediaId: "artifacts",
    mediaAlt:
      "Um comentário fixado numa prévia chega ao agente, que corrige a página; o usuário então resolve o comentário.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "Uma página de artifact é uma página HTML que o agente monta dentro do seu projeto e que você vê num painel Prévia. collie artifact new escreve uma página inicial a partir de um de quatro modelos, já com os tokens do design system ativo em Light e Dark.",
          },
          {
            kind: "p",
            text: "Na Prévia você fixa um comentário num ponto da página. Ele chega ao agente no próximo prompt, e o agente responde na conversa.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Feedback sobre uma página costuma ser uma frase como \"o cartão do meio, faz ele se destacar\". Digitada num chat, o agente precisa adivinhar de qual cartão você fala.",
          },
          {
            kind: "p",
            text: "Aqui você clica no cartão e escreve a nota. O comentário fica preso àquele ponto, e o agente o vê no próximo prompt. Exemplo: você pede a página de preços como protótipo, fixa \"Make this plan the highlighted one\" no plano do meio, e o agente edita a página e responde.",
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
              "Modelos. deck são slides 16:9 (setas ← e → ou espaço). dashboard tem indicadores, um gráfico SVG de um array data e uma tabela. doc é um documento com sumário fixo. prototype é uma casca de app de celular com lista, abas e uma folha.",
              "Onde fica. artifact new grava docs/pages/<nome>/index.html, um arquivo do seu projeto, e abre uma Prévia nele. O nome usa a-z, 0-9 e hífen, até 48 caracteres, e uma página existente nunca é sobrescrita.",
              "Offline. Páginas locais não têm rede. React 18.3.1 com ReactDOM, htm 3.1.1, Chart.js 4.4.9 e Lucide 0.469.0 vêm no app, fixados por versão. As páginas os carregam por URLs collie-lib://. Ícones Lucide vêm em todos os modelos, Chart.js no dashboard, React e htm no prototype.",
              "Recarga ao vivo. A Prévia recarrega em menos de 1 s quando a página muda no disco, mantendo a rolagem. O cabeçalho tem Recarregar e a chave Página, Claro, Escuro.",
              "Comentários. No cabeçalho da Prévia, Comentários abre a gaveta: Fixar comentário, clique no ponto, escreva, Enviar. Quem recebe é o terminal que abriu a Prévia.",
            ],
          },
          {
            kind: "p",
            text: "O agente lê seus comentários pendentes no próximo prompt, uma vez, marcados como dados e não como ordens, um por linha, com o texto cortado em 1200 bytes. Ele responde com collie comment reply <id> \"<texto>\", e a resposta aparece na conversa da Prévia. collie comment list [--open] mostra os comentários dele com o texto completo.",
          },
          {
            kind: "p",
            text: "Os comentários ficam na pasta de dados do Collie, nunca no projeto: nada vai para o git e um agente em sandbox não consegue forjar um comentário seu.",
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
                title: "Escolha um design system (opcional)",
                body: "Os modelos pegam os tokens do design system ativo. Sem um, a página usa tokens padrão e warnings avisa.",
              },
              {
                title: "Peça uma página",
                body: "O agente escreve a página e abre uma Prévia nela.",
                ask: "Faça um protótipo da página de preços",
                command: "collie artifact new prototype pricing",
              },
              {
                title: "Fixe um comentário",
                body: "Na Prévia, abra Comentários, clique em Fixar comentário, clique no ponto, escreva e Enviar.",
              },
              {
                title: "Deixe o agente responder",
                body: "Ele vê o comentário no próximo prompt, edita a página e responde com comment reply.",
                command: 'collie comment reply 1 "Done, Pro is highlighted"',
              },
              {
                title: "Resolva",
                body: "Só você resolve ou reabre um comentário, pela gaveta.",
              },
              {
                title: "Exporte um deck",
                body: "Uma página de slides vira um .pptx editável ou um PDF. Registre a página com artifact add e exporte pelo id (artifact list mostra). O app precisa estar aberto.",
                ask: "Exporte o deck para PowerPoint",
                command: "collie artifact export <id> --format pptx --out deck.pptx",
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
              "Só você cria comentários, manda continuações e resolve ou reabre. O agente só responde.",
              "Limites dos comentários: 2000 caracteres por mensagem sua, 4000 por resposta, 500 comentários por página, 200 mensagens por conversa.",
              "A Prévia só lê arquivos da pasta do projeto, até 8 MB cada, sem links simbólicos para fora e sem caminhos com ponto como .env ou .git. A rede fica bloqueada.",
              "Uma mudança feita no lugar numa subpasta não é vista pela recarga ao vivo. Use Recarregar.",
              "O export de deck precisa de elementos .slide, ou [data-slide] se não houver nenhum. Um section solto não conta. Sem slides o export responde: page has no slides.",
              "O .pptx perde algumas coisas, listadas em warnings: gradiente vira a primeira cor, box-shadow e clip-path somem, o conteúdo de ::before e ::after some, fontes da web não vão embutidas, transform, filter e animações não entram, e a quebra de linha pode mudar no PowerPoint.",
              "O PDF tem uma página de 960 x 540 pt por slide, com texto selecionável e fundos impressos.",
              "Páginas de artifact new são arquivos comuns do projeto e o Collie não as versiona. Versões e pastas valem para artifacts registrados.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "Perguntas frequentes",
        blocks: [
          {
            kind: "p",
            text: "Dá para trazer uma página do claude.ai? Dá. collie artifact import-claude <links> entrega ao agente a receita: um terminal Claude Code já logado lê cada link com a ferramenta Artifact dele e registra a página. O Collie nunca guarda suas credenciais do claude.ai.",
          },
          {
            kind: "p",
            text: "As páginas funcionam offline? Sim. As bibliotecas vêm de collie-lib:// e as fontes do app ou de famílias baixadas com collie font add.",
          },
          {
            kind: "p",
            text: "Qual terminal recebe meu comentário? O que abriu a Prévia. Se ele não existe mais, o único terminal ligado a ela por coleira. Senão ninguém, então ligue um.",
          },
        ],
      },
    ],
    commands: [
      { command: "collie artifact new deck|dashboard|doc|prototype [nome]", does: "Grava uma página-modelo em docs/pages e abre uma Prévia" },
      { command: "collie preview get", does: "Arquivo da página, URL e os últimos 20 erros da página" },
      { command: "collie preview screenshot [--full-page] [--out <arquivo>]", does: "Screenshot da Prévia" },
      { command: "collie comment list [--open]", does: "Os comentários endereçados a este terminal" },
      { command: 'collie comment reply <id> "<texto>"', does: "Responde a um comentário" },
      { command: "collie artifact export <id> --format pptx|pdf [--out <arquivo>]", does: "Exporta uma página de slides" },
      { command: "collie artifact libs", does: "Lista as bibliotecas offline" },
      { command: "collie artifact import-claude <links>", does: "Importa artifacts do claude.ai" },
    ],
    related: ["design", "browser", "diagram"],
  },
};

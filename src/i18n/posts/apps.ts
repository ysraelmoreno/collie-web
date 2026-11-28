import type { Post } from "./types";

export const apps: Post = {
  en: {
    slug: "apps",
    eyebrow: "05 · APPS",
    title: "Adopt the tools you already have.",
    lead: "Point Collie at a local tool and it becomes a live panel on the canvas. Your agents call its actions and read its events, right where you work.",
    mediaId: "apps",
    mediaAlt:
      "A local tool on localhost is adopted with one command and becomes a panel on the canvas that the agent can call.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "A paddock app is a tool of yours, a small web server on your own machine, tied to one paddock. It has two faces. For you, it is a live panel on the canvas. For the agent, its actions are commands, its events are notices, and what you are looking at in the panel is context.",
          },
          {
            kind: "p",
            text: "`collie app adopt` ties a tool that already exists. You do not write a manifest by hand.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "Most teams have an internal viewer: a metrics page, a log reader, an analytics dashboard. The agent cannot see it, and you copy and paste between it and the chat.",
          },
          {
            kind: "p",
            text: "Example: you have a metrics viewer on port 8767. After adopting it, you ask the agent to show the recent errors. It calls the viewer's `errors` action itself, and the same errors are on your canvas.",
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
              "`collie app adopt <id> --url http://127.0.0.1:<port>` writes `.collie/apps/<id>/collie-plugin.json` in the paddock: a v2 manifest. The commands come from `--cmd`, from the tool's own `collie.json`, or from its OpenAPI document (up to 40 operations).",
              "The URL must be loopback: `127.0.0.1`, `[::1]` or `localhost`, with a port and no path.",
              "Adopting asks you to approve on a card. An agent can write the app; only you approve it. Collie pins the manifest's SHA-256, so a changed manifest asks again.",
              'With `--start "<cmd>"` (and `--cwd`), the daemon starts the tool and supervises it. `--health <path>` sets a health path. `collie app logs <id>` shows what the service printed.',
              "After you approve, the agent runs `collie app attach <id>`. That opens the panel in the paddock, tied to the agent, and the app's commands become its tools. They are called as `collie <id> <command>`.",
              "Commands that use POST, PUT or DELETE ask you to confirm on every call. GET commands do not.",
              "Events: with `--events <path>` the daemon reads the tool's SSE stream. By default an event is recorded, not typed into the agent. The agent reads it with `collie app event <seq>`. With `--notify`, each event also arrives as a notice.",
              "`collie app context <id>` returns what you are looking at in the panel. `collie app snapshot <id>` returns the page as rendered now.",
            ],
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
                title: "Have the tool serving on loopback",
                body: "A local web UI on 127.0.0.1. If you want Collie to start it, pass `--start` and `--cwd` in the next step.",
              },
              {
                title: "Adopt it",
                body: "Name the actions with `--cmd name=METHOD:/path`, comma-separated. If the tool has a `collie.json` or an OpenAPI document, you can leave `--cmd` out. The `errors` command and its path below are an example; use your tool's own.",
                ask: "Attach our metrics viewer and show the recent errors",
                command:
                  'collie app adopt metrics --url http://127.0.0.1:8767 --cmd "errors=GET:/api/errors"',
              },
              {
                title: "Approve on the card",
                body: "The card shows the app, its address and its commands. Approve it once.",
              },
              {
                title: "Attach",
                body: "The agent opens the panel and gets the commands.",
                command: "collie app attach metrics",
              },
              {
                title: "Call an action",
                body: "The command name is the app id plus the action name.",
                command: "collie metrics errors",
              },
              {
                title: "Check on it",
                body: "`collie app list` shows each app and whether you approved it. `collie app logs metrics` shows the tool's output.",
                command: "collie app list",
              },
            ],
          },
        ],
      },
      {
        id: "limits",
        title: "Limits and cautions",
        blocks: [
          {
            kind: "list",
            items: [
              "Loopback only. Adopt refuses any other address.",
              "An agent never approves an app. If you change the manifest, you approve again. To adopt again with other parameters, pass `--replace`, and you approve again.",
              "Write actions (POST, PUT, DELETE) ask every time. That is on purpose: use a GET action for a demo.",
              "A discovered action list is capped: OpenAPI gives at most 40 commands, and paths with templates such as `/items/{id}` are skipped.",
              "Reply data, event data and page data come from the app. The agent treats them as data, never as instructions.",
              "The panel page itself runs without network and without access to your project.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Can an agent create a new app from scratch?",
                body: "Yes. `collie app new <id>` scaffolds a manifest and a page in `.collie/apps/<id>/` and asks you to approve it. Then the agent edits it and attaches.",
              },
              {
                title:
                  "Why did my agent get no notice when the tool had an event?",
                body: "By default, events are only recorded. Adopt with `--notify` to have each one typed in as a notice.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie app adopt <id> --url http://127.0.0.1:<port>",
        does: "Ties a local tool to the paddock and asks you to approve it",
      },
      {
        command: "collie app attach <id>",
        does: "Opens the app's panel, tied to the agent; its commands become tools",
      },
      {
        command: "collie <id> <command>",
        does: "Calls one of the app's actions",
      },
      {
        command: "collie app list",
        does: "Lists the paddock's apps and whether you approved them",
      },
      {
        command: "collie app logs <id>",
        does: "Shows the end of what the app's service printed",
      },
      {
        command: "collie app event <seq>",
        does: "Reads the body of an app event",
      },
      {
        command: "collie app context <id>",
        does: "Reads what you are looking at in the panel",
      },
      {
        command: "collie app snapshot <id>",
        does: "Reads the page as rendered in the panel",
      },
    ],
    related: ["shepherd", "sandbox"],
  },
  pt: {
    slug: "apps",
    eyebrow: "05 · APPS",
    title: "Adote as ferramentas que você já tem.",
    lead: "Aponte o Collie para uma ferramenta local e ela vira um painel vivo no canvas. Seus agentes chamam as ações dela e leem os eventos, ali onde você trabalha.",
    mediaId: "apps",
    mediaAlt:
      "Uma ferramenta local em localhost é adotada com um comando e vira um painel no canvas que o agente consegue chamar.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "Um app do cercado é uma ferramenta sua, um servidor web pequeno na sua máquina, ligada a um cercado. Ele tem duas faces. Para você, é um painel vivo no canvas. Para o agente, as ações são comandos, os eventos são avisos e o que você está olhando no painel é contexto.",
          },
          {
            kind: "p",
            text: "`collie app adopt` liga uma ferramenta que já existe. Você não escreve o manifesto à mão.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Quase todo time tem um visualizador interno: uma página de métricas, um leitor de logs, um painel de analytics. O agente não enxerga isso, e você copia e cola entre a ferramenta e o chat.",
          },
          {
            kind: "p",
            text: "Exemplo: você tem um visualizador de métricas na porta 8767. Depois de adotá-lo, você pede ao agente os erros recentes. Ele chama a ação `errors` do visualizador por conta própria, e os mesmos erros aparecem no seu canvas.",
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
              "`collie app adopt <id> --url http://127.0.0.1:<porta>` grava `.collie/apps/<id>/collie-plugin.json` no cercado: um manifesto v2. Os comandos vêm de `--cmd`, do `collie.json` da própria ferramenta ou do documento OpenAPI dela (até 40 operações).",
              "A URL precisa ser loopback: `127.0.0.1`, `[::1]` ou `localhost`, com porta e sem caminho.",
              "Adotar pede a sua aprovação num cartão. Um agente pode escrever o app; só você aprova. O Collie fixa o SHA-256 do manifesto, então um manifesto alterado pede de novo.",
              'Com `--start "<cmd>"` (e `--cwd`), o daemon sobe a ferramenta e a supervisiona. `--health <caminho>` define um caminho de saúde. `collie app logs <id>` mostra o que o serviço imprimiu.',
              "Depois que você aprova, o agente roda `collie app attach <id>`. Isso abre o painel no cercado, ligado ao agente, e os comandos do app viram ferramentas dele. Eles são chamados como `collie <id> <comando>`.",
              "Comandos com POST, PUT ou DELETE pedem a sua confirmação a cada chamada. Os GET não pedem.",
              "Eventos: com `--events <caminho>` o daemon lê o stream SSE da ferramenta. Por padrão, o evento é só gravado, não digitado no agente. O agente o lê com `collie app event <seq>`. Com `--notify`, cada evento também chega como aviso.",
              "`collie app context <id>` devolve o que você está olhando no painel. `collie app snapshot <id>` devolve a página como está renderizada agora.",
            ],
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
                title: "Tenha a ferramenta servindo em loopback",
                body: "Uma interface web local em 127.0.0.1. Se quiser que o Collie a suba, passe `--start` e `--cwd` no próximo passo.",
              },
              {
                title: "Adote",
                body: "Nomeie as ações com `--cmd nome=MÉTODO:/caminho`, separadas por vírgula. Se a ferramenta tem um `collie.json` ou um documento OpenAPI, você pode omitir o `--cmd`. O comando `errors` e o caminho abaixo são um exemplo; use os da sua ferramenta.",
                ask: "Ligue nosso visualizador de métricas e mostre os erros recentes",
                command:
                  'collie app adopt metrics --url http://127.0.0.1:8767 --cmd "errors=GET:/api/errors"',
              },
              {
                title: "Aprove no cartão",
                body: "O cartão mostra o app, o endereço e os comandos. Aprove uma vez.",
              },
              {
                title: "Ligue",
                body: "O agente abre o painel e recebe os comandos.",
                command: "collie app attach metrics",
              },
              {
                title: "Chame uma ação",
                body: "O nome do comando é o id do app mais o nome da ação.",
                command: "collie metrics errors",
              },
              {
                title: "Confira",
                body: "`collie app list` mostra cada app e se você o aprovou. `collie app logs metrics` mostra a saída da ferramenta.",
                command: "collie app list",
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
              "Só loopback. O adopt recusa qualquer outro endereço.",
              "Um agente nunca aprova um app. Se você muda o manifesto, aprova de novo. Para adotar de novo com outros parâmetros, passe `--replace`, e você aprova de novo.",
              "Ações de escrita (POST, PUT, DELETE) pedem confirmação toda vez. É de propósito: para uma demonstração, use uma ação GET.",
              "A lista de ações descobertas tem teto: o OpenAPI dá no máximo 40 comandos, e caminhos com template, como `/items/{id}`, são ignorados.",
              "Resposta, evento e página vêm do app. O agente os trata como dado, nunca como instrução.",
              "A página do painel roda sem rede e sem acesso ao seu projeto.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "Perguntas frequentes",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Um agente pode criar um app do zero?",
                body: "Pode. `collie app new <id>` cria um manifesto e uma página em `.collie/apps/<id>/` e pede a sua aprovação. Depois o agente edita e liga.",
              },
              {
                title:
                  "Por que o agente não recebeu aviso quando a ferramenta teve um evento?",
                body: "Por padrão, os eventos só são gravados. Adote com `--notify` para que cada um seja digitado como aviso.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie app adopt <id> --url http://127.0.0.1:<porta>",
        does: "Liga uma ferramenta local ao cercado e pede a sua aprovação",
      },
      {
        command: "collie app attach <id>",
        does: "Abre o painel do app, ligado ao agente; os comandos viram ferramentas",
      },
      { command: "collie <id> <comando>", does: "Chama uma ação do app" },
      {
        command: "collie app list",
        does: "Lista os apps do cercado e se você os aprovou",
      },
      {
        command: "collie app logs <id>",
        does: "Mostra o fim do que o serviço do app imprimiu",
      },
      {
        command: "collie app event <seq>",
        does: "Lê o corpo de um evento do app",
      },
      {
        command: "collie app context <id>",
        does: "Lê o que você está olhando no painel",
      },
      {
        command: "collie app snapshot <id>",
        does: "Lê a página como renderizada no painel",
      },
    ],
    related: ["shepherd", "sandbox"],
  },
};

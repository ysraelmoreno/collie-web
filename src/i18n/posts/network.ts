import type { Post } from "./types";

export const network: Post = {
  en: {
    slug: "network",
    eyebrow: "06 · NETWORK",
    title: "Intercept every request your app makes.",
    lead: "The Network panel captures the HTTP(S) traffic of an Android emulator. Your agent reads the request that failed, then answers it with a rule of its own to test the fix, once you approve.",
    mediaId: "network",
    mediaAlt:
      "The Network panel lists the emulator’s requests; the agent finds the one that returned 500, proposes a rule that answers it with 200, the owner approves on a card, and the app receives the mapped response.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "The **Rede** (Network) panel shows the HTTP(S) requests an Android emulator makes: method, host, path, status, size and time. Open one to see its headers and bodies.",
          },
          {
            kind: "p",
            text: "It also lets you answer a request in the server's place. A map rule returns a response you wrote, or cuts the connection, and the server is never called.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "When a screen breaks, the cause is often in a request: a missing field, a 500, a slow reply. Without the traffic, the agent guesses.",
          },
          {
            kind: "p",
            text: 'Example: the Pay button shows "Payment failed". The agent lists the flows, finds `POST /v2/checkout` with status 500, opens it and reads the cause. Then it adds a rule that answers 200 and you try the screen again, without touching the backend.',
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
              "`collie network attach` starts a proxy (mitmdump) for one emulator, installs its certificate on the device and sets the emulator's proxy. There is one proxy per emulator.",
              "Each captured request becomes a flow, kept in memory. The panel keeps the newest 2,000 flows (and up to 256 MiB) and drops the oldest.",
              'The leash is the permission. A terminal reads the traffic only if it is tied to a Network panel. Without one, the command fails with "No network panel reachable" and tells you to open one. Captured traffic carries tokens and cookies, so this is on purpose.',
              "`collie network list` returns `{id, method, host, path, status, size, durationMs, state}` for each flow, oldest first. `get` opens one with headers and bodies, decoded when possible. `curl` returns the request as a cURL command.",
              "A map rule says what to match (method, host, path, query) and what to answer (status, headers, body, delay) or `--drop` to cut the connection. The first enabled rule that matches wins.",
              "`--from <id>` starts the rule from the response of a captured flow: its status, headers and decoded body. Your flags override it.",
              "A rule created by an agent is born off. It turns on only when you click **Permitir** (Allow) on a card. **Negar** (Deny) or no answer: it stays off and the call fails.",
              "A flow answered by a rule is marked as mapped (the panel shows **mapeado** (mapped) with the rule's name), so nobody debugs a mock thinking it is the real server.",
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
                title: "Run a rootable emulator",
                body: "Capture works on emulators only (serial `emulator-…`), and the image must allow `adb root`: Google APIs or AOSP. Google Play images refuse it. The collie-lite emulator works.",
              },
              {
                title: "Open the **Rede** panel and tie it to the agent",
                body: "A terminal needs a leash to the panel.",
                command: "collie panel open network",
              },
              {
                title: "Attach",
                body: "With one emulator online, no argument is needed. With several, pass `--serial`.",
                command: "collie network attach",
              },
              {
                title: "Use the app, then read the traffic",
                body: "List the flows, optionally filtered by host. Then open the one that failed.",
                ask: "Why does checkout fail?",
                command: "collie network list --host api.example.com",
              },
              {
                title: "Open a flow",
                body: "Headers, bodies and status of flow 3. `collie network curl 3` gives the request as cURL.",
                command: "collie network get 3",
              },
              {
                title: "Answer it with a rule",
                body: "Start from the captured response and override what you need. A card asks you to allow it.",
                ask: "Make checkout succeed so I can test the app",
                command: `collie network rule-add --from 3 --status 200 --body '{"ok":true}'`,
              },
              {
                title: "Clean up",
                body: "Turn the rule off, remove it, or stop capturing.",
                command: "collie network rule-disable <id>",
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
              "Only the attached emulator's traffic. Not your Mac's.",
              "At most 100 rules in total. A rule's body is at most 5 MiB, its status is between 100 and 599 and its delay between 0 and 60,000 ms. `content-encoding` and `content-length` headers are refused.",
              "`--body-file` is read once, when you create the rule, and must be a file inside your project.",
              "Rules are global to the Mac, not per paddock. They come back off each time the daemon starts.",
              "When the last Network panel closes, every capture stops and the emulator is restored.",
            ],
          },
          {
            kind: "note",
            text: "An agent can remove or disable a rule at once. Only turning one on needs your OK.",
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
                title: "Can I slow a request down or make it time out?",
                body: "Yes. `--delay <ms>` waits first, and `--drop` cuts the connection. With both, `--drop` becomes a timeout.",
              },
              {
                title: "Can I match only some requests?",
                body: "Yes. `--method`, `--host` (a glob such as `*.example.com`), `--path` (a glob, no query) and `--query k=v` narrow the match. A rule with no match at all matches every request.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie panel open network",
        does: "Opens the Network panel, tied to the agent",
      },
      {
        command: "collie network attach",
        does: "Starts capturing an emulator",
      },
      { command: "collie network list", does: "Lists captured flows" },
      {
        command: "collie network get <id>",
        does: "Shows one flow with headers and bodies",
      },
      {
        command: "collie network curl <id>",
        does: "Returns the flow's request as cURL",
      },
      {
        command: "collie network rule-add --from <id> …",
        does: "Creates a rule that answers in the server's place",
      },
      { command: "collie network rule-list", does: "Lists the rules in order" },
      {
        command: "collie network rule-enable <id> / rule-disable <id>",
        does: "Turns a rule on or off",
      },
      {
        command: "collie network rule-remove <id> / rule-clear",
        does: "Deletes one rule or all of them",
      },
      { command: "collie network clear", does: "Forgets the captured flows" },
      {
        command: "collie network detach",
        does: "Stops capturing and restores the emulator",
      },
    ],
    related: ["emulator", "devices"],
  },
  pt: {
    slug: "network",
    eyebrow: "06 · REDE",
    title: "Intercepte cada requisição do seu app.",
    lead: "O painel Rede captura o tráfego HTTP(S) de um emulador Android. Seu agente lê a requisição que falhou e a responde com uma regra própria para testar a correção, depois que você aprova.",
    mediaId: "network",
    mediaAlt:
      "O painel Rede lista as requisições do emulador; o agente acha a que voltou 500, propõe uma regra que responde 200, o dono aprova num cartão e o app recebe a resposta mapeada.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "O painel Rede mostra as requisições HTTP(S) de um emulador Android: método, host, caminho, status, tamanho e tempo. Abra uma para ver os cabeçalhos e os corpos.",
          },
          {
            kind: "p",
            text: "Ele também responde uma requisição no lugar do servidor. Uma regra de mapeamento devolve a resposta que você escreveu, ou corta a conexão, e o servidor nem é chamado.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Quando uma tela quebra, a causa costuma estar numa requisição: um campo faltando, um 500, uma resposta lenta. Sem o tráfego, o agente adivinha.",
          },
          {
            kind: "p",
            text: 'Exemplo: o botão Pagar mostra "Payment failed". O agente lista os fluxos, acha `POST /v2/checkout` com status 500, abre e lê a causa. Depois cria uma regra que responde 200 e você testa a tela de novo, sem mexer no backend.',
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
              "`collie network attach` sobe um proxy (mitmdump) para um emulador, instala o certificado dele no aparelho e configura o proxy do emulador. Há um proxy por emulador.",
              "Cada requisição capturada vira um fluxo, guardado em memória. O painel guarda os 2.000 fluxos mais novos (e até 256 MiB) e descarta os mais antigos.",
              'A guia é a permissão. Um terminal só lê o tráfego se estiver ligado a um painel Rede. Sem um, o comando falha com "No network panel reachable" e manda abrir um. O tráfego capturado carrega tokens e cookies, então isso é de propósito.',
              "`collie network list` devolve `{id, method, host, path, status, size, durationMs, state}` de cada fluxo, do mais antigo ao mais novo. `get` abre um com cabeçalhos e corpos, decodificados quando possível. `curl` devolve a requisição como comando cURL.",
              "Uma regra de mapeamento diz o que casar (método, host, caminho, query) e o que responder (status, cabeçalhos, corpo, atraso), ou `--drop` para cortar a conexão. A primeira regra ligada que casa vence.",
              "`--from <id>` parte da resposta de um fluxo capturado: o status, os cabeçalhos e o corpo decodificado. As suas flags sobrescrevem.",
              "A regra criada por um agente nasce desligada. Ela só liga quando você clica em **Permitir** num cartão. Negar ou não responder: continua desligada e a chamada falha.",
              'Um fluxo atendido por regra fica marcado como mapeado ("mapeado" no painel), para ninguém depurar um mock achando que é o servidor real.',
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
                title: "Rode um emulador com root",
                body: "A captura funciona só em emuladores (serial `emulator-…`), e a imagem precisa permitir `adb root`: Google APIs ou AOSP. Imagens Google Play recusam. O emulador collie-lite serve.",
              },
              {
                title: "Abra o painel Rede e ligue-o ao agente",
                body: "Um terminal precisa de uma guia até o painel.",
                command: "collie panel open network",
              },
              {
                title: "Anexe",
                body: "Com um emulador online, não precisa de argumento. Com vários, passe `--serial`.",
                command: "collie network attach",
              },
              {
                title: "Use o app e leia o tráfego",
                body: "Liste os fluxos, se quiser filtrando por host. Depois abra o que falhou.",
                ask: "Por que o checkout falha?",
                command: "collie network list --host api.example.com",
              },
              {
                title: "Abra um fluxo",
                body: "Cabeçalhos, corpos e status do fluxo 3. `collie network curl 3` dá a requisição como cURL.",
                command: "collie network get 3",
              },
              {
                title: "Responda com uma regra",
                body: "Parta da resposta capturada e sobrescreva o que precisar. Um cartão pede a sua permissão.",
                ask: "Faça o checkout passar para eu testar o app",
                command: `collie network rule-add --from 3 --status 200 --body '{"ok":true}'`,
              },
              {
                title: "Limpe",
                body: "Desligue a regra, remova-a, ou pare a captura.",
                command: "collie network rule-disable <id>",
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
              "Só o tráfego do emulador anexado. Não o do seu Mac.",
              "No máximo 100 regras no total. O corpo de uma regra tem até 5 MiB, o status fica entre 100 e 599 e o atraso entre 0 e 60.000 ms. Cabeçalhos `content-encoding` e `content-length` são recusados.",
              "`--body-file` é lido uma vez, quando você cria a regra, e precisa ser um arquivo dentro do seu projeto.",
              "As regras são globais do Mac, não por cercado. Elas voltam desligadas a cada início do daemon.",
              "Quando o último painel Rede fecha, toda captura para e o emulador é restaurado.",
            ],
          },
          {
            kind: "note",
            text: "Um agente remove ou desliga uma regra na hora. Só ligar precisa do seu OK.",
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
                title:
                  "Dá para deixar uma requisição lenta ou fazê-la dar timeout?",
                body: "Dá. `--delay <ms>` espera antes, e `--drop` corta a conexão. Com os dois, o `--drop` vira um timeout.",
              },
              {
                title: "Dá para casar só algumas requisições?",
                body: "Dá. `--method`, `--host` (um glob como `*.example.com`), `--path` (um glob, sem query) e `--query k=v` restringem o casamento. Uma regra sem nenhum filtro casa com toda requisição.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie panel open network",
        does: "Abre o painel Rede, ligado ao agente",
      },
      {
        command: "collie network attach",
        does: "Começa a capturar um emulador",
      },
      { command: "collie network list", does: "Lista os fluxos capturados" },
      {
        command: "collie network get <id>",
        does: "Mostra um fluxo com cabeçalhos e corpos",
      },
      {
        command: "collie network curl <id>",
        does: "Devolve a requisição do fluxo como cURL",
      },
      {
        command: "collie network rule-add --from <id> …",
        does: "Cria uma regra que responde no lugar do servidor",
      },
      {
        command: "collie network rule-list",
        does: "Lista as regras, em ordem",
      },
      {
        command: "collie network rule-enable <id> / rule-disable <id>",
        does: "Liga ou desliga uma regra",
      },
      {
        command: "collie network rule-remove <id> / rule-clear",
        does: "Apaga uma regra ou todas",
      },
      { command: "collie network clear", does: "Esquece os fluxos capturados" },
      {
        command: "collie network detach",
        does: "Para a captura e restaura o emulador",
      },
    ],
    related: ["emulator", "devices"],
  },
};

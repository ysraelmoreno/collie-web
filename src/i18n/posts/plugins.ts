import type { Post } from "./types";

export const plugins: Post = {
  en: {
    slug: "plugins",
    eyebrow: "13 · PLUG-INS",
    title: "Panels and hooks you install yourself.",
    lead: "A plug-in adds a panel, agent commands or agent hooks to Collie without rebuilding it. Only you install one, and the install shows what it may do first.",
    mediaId: "plugins",
    mediaAlt:
      "An agent writes a file and a plug-in hook answers with the shape its sibling files follow.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "A plug-in is a folder with a `collie-plugin.json` manifest and a `ui/` page. It can be three things: a **panel** that opens like Collie's own, **commands** agents call as `collie <id> <cmd>`, and **agent hooks** (`edit`, `stop`) served by a small `helper` program.",
          },
          {
            kind: "p",
            text: "Since 0.3.0 there is also a signed catalog and a **Descobrir** (Discover) tab to install from it. No catalog has been published yet, so today you install from a folder.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "Each team has a tool or a rule Collie will never ship. A plug-in lets you add it without waiting for a release, while the agents get it the same way they get built-in panels.",
          },
          {
            kind: "p",
            text: "Hooks go further: a project pattern written as text in a memory or a CLAUDE.md is easy to ignore. A hook answers the agent at the moment it edits a file, and can block the end of a turn that breaks a rule you approved.",
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
              "**Panel.** The page runs in a locked web view with no network, no camera, no microphone and no access to the project. It talks to Collie only through `window.collie`, and it sees only the arguments of each command, never the agent's request or tokens.",
              "**Commands.** An agent reaches a plug-in's commands only when it is leashed to a panel of that plug-in, the same rule as for built-in panels. The agent orientation never names external plug-ins; a Shepherd sees one line: `collie plugin list`.",
              "**Hooks.** With `helper` and `hooks`, Claude terminals send the plug-in two events: `edit` (the files an agent just wrote) and `stop` (the files of the turn). The helper answers with `guide` (context for the agent) or `block`. It gets only paths, never the request or the conversation.",
              "**Helper sandbox.** It reads the project and its own folder, writes only its data folder, and has no network. One process per event, 3 s for all plug-ins together. A timeout, a bad exit or bad JSON is ignored: the agent never sees a helper error.",
              '**Permissions.** The manifest may ask for `{"project": "read"}` (or `"none"`) and an empty `network` list. The install shows what the plug-in may do before you confirm. A new version that asks for more needs a new confirmation, with the new lines marked.',
              "**Install.** The folder is copied to `<root>/plugins/<id>/<version>/`, read only, and its SHA-256 is pinned. The daemon hashes it again at every start; a changed folder is not loaded. Agents cannot install, enable, disable or remove plug-ins.",
            ],
          },
          {
            kind: "p",
            text: "**Vizinho** is the example of hooks. When an agent writes a file, it says what the sibling files of the same kind do (imports, a paired test) and names a model file. It also mines conventions nearly every file follows and writes them as proposals (`propostas.json`). The ones you copy into `cercas.json` become fences, and a turn that breaks one is blocked at its end. Vizinho lives in `Examples/plugins/vizinho` and is built with `scripts/build-vizinho-plugin.sh`; it is not bundled.",
          },
          {
            kind: "p",
            text: "**Marketplace, phase 1 (0.3.0).** The daemon accepts a catalog only with a valid Ed25519 signature and a sequence number at least the last one; after 30 days it is stale. Installing checks the SHA-256 of the package and of its tree. A plug-in whose publisher is not Collie shows `<author> · revisado pelo Collie` on its card, and its confirmation says the author is not Collie. A version recalled in the catalog is turned off.",
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
                title: "Get a plug-in folder",
                body: "A folder with `collie-plugin.json`, `ui/` and, for hooks, `bin/<name>`. `Examples/plugins/notas` is a minimal panel.",
              },
              {
                title: "Validate it (for authors)",
                body: "Refuses what an install would refuse, plus the catalog's rules: `permissions.network` empty and the helper a Mach-O signed as `dev.collie.plugin.<id>`. Exit 0 prints `ok` and the `TeamIdentifier`; exit 1 prints one reason per line.",
                command: "collie plugin validate ./my-plugin",
              },
              {
                title: "Install it yourself",
                body: "In Preferences › Plug-ins › **Instalar de uma pasta…** (Install from a folder), or from a shell outside a Collie terminal. Read what it may do before you confirm. Add `--replace` to replace an installed one.",
                command: "collie plugin install --path ./my-plugin",
              },
              {
                title: "Open its panel and leash it",
                body: "Open it from the palette or with `collie panel open <id>`, then leash the agent to the panel so it reaches the commands.",
              },
              {
                title: "Check what is installed",
                body: "Lists each plug-in with its version, whether it is enabled, errors, commands, hooks and permissions.",
                command: "collie plugin list",
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
              "No plug-in catalog has been published yet. The **Descobrir** tab and `collie plugin install-catalog` stay unused until one is.",
              "Hooks reach Claude terminals only, not Cursor or Codex.",
              "A `stop` block stops the end of a turn once; a continued Stop is never blocked again. Hook text is cut at 2,000 characters per plug-in, 4,000 in all.",
              "Phase 1 panels are web UI only: no network allow-list, no project write. Those wait for later phases.",
              "A folder can hold no links or special files, at most 5,000 entries and 64 MiB.",
            ],
          },
          {
            kind: "note",
            text: "Installing is yours alone. An agent can ask you for a plug-in, but it can never install one.",
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
                title: "Can a plug-in read my conversation?",
                body: "No. A panel sees only command arguments; a helper sees only file paths and the event.",
              },
              {
                title: "What if the installed folder changes?",
                body: "The daemon hashes it at every start. A changed folder is not loaded and asks you to install it again.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie plugin install --path <folder>",
        does: "Installs a plug-in from a folder (you only, outside a terminal)",
      },
      {
        command: "collie plugin list",
        does: "Lists installed plug-ins, their hooks and permissions",
      },
      {
        command: "collie plugin validate <folder>",
        does: "Checks a plug-in against the install and catalog rules",
      },
      {
        command: "collie plugin catalog [--refresh]",
        does: "Shows the signed catalog the daemon accepted",
      },
      {
        command: "collie plugin install-catalog <id> --version <v>",
        does: "Installs or updates a plug-in from the catalog",
      },
      { command: "collie panel open <id>", does: "Opens a plug-in's panel" },
    ],
    related: ["shepherd", "sandbox", "memory"],
  },
  pt: {
    slug: "plugins",
    eyebrow: "13 · PLUG-INS",
    title: "Painéis e ganchos que você mesmo instala.",
    lead: "Um plug-in acrescenta ao Collie um painel, comandos de agente ou ganchos de agente, sem recompilar. Só você instala, e a instalação mostra antes o que ele pode fazer.",
    mediaId: "plugins",
    mediaAlt:
      "Um agente grava um arquivo e o gancho de um plug-in responde com a forma que os arquivos irmãos seguem.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "Um plug-in é uma pasta com o manifesto `collie-plugin.json` e uma página em `ui/`. Ele pode ser três coisas: um **painel** que abre como os do Collie, **comandos** que os agentes chamam como `collie <id> <cmd>` e **ganchos de agente** (`edit`, `stop`) atendidos por um pequeno programa, o `helper`.",
          },
          {
            kind: "p",
            text: "Desde a 0.3.0 existe também um catálogo assinado e a aba **Descobrir** para instalar dele. Nenhum catálogo foi publicado ainda, então hoje a instalação é por pasta.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Todo time tem uma ferramenta ou uma regra que o Collie nunca vai trazer. Com um plug-in você a acrescenta sem esperar uma versão nova, e os agentes a recebem do mesmo jeito que recebem os painéis do Collie.",
          },
          {
            kind: "p",
            text: "Os ganchos vão além: um padrão do projeto escrito como texto numa memória ou num CLAUDE.md é fácil de ignorar. O gancho responde ao agente na hora em que ele edita um arquivo e pode bloquear o fim de um turno que quebra uma regra que você aprovou.",
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
              "**Painel.** A página roda numa web view trancada, sem rede, sem câmera, sem microfone e sem acesso ao projeto. Ela fala com o Collie só por `window.collie` e vê só os argumentos de cada comando, nunca o pedido do agente nem tokens.",
              "**Comandos.** Um agente só alcança os comandos de um plug-in quando está ligado por guia a um painel dele, a mesma regra dos painéis do Collie. A orientação do agente nunca cita plug-ins externos; o Pastor vê uma linha: `collie plugin list`.",
              "**Ganchos.** Com `helper` e `hooks`, os terminais Claude mandam dois eventos ao plug-in: `edit` (os arquivos que o agente acabou de gravar) e `stop` (os arquivos do turno). O helper responde com `guide` (contexto para o agente) ou `block`. Ele recebe só caminhos, nunca o pedido nem a conversa.",
              "**Sandbox do helper.** Lê o projeto e a própria pasta, grava só na sua pasta de dados e não tem rede. Um processo por evento, 3 s para todos os plug-ins juntos. Estouro de tempo, saída diferente de 0 ou JSON inválido são ignorados: o agente nunca vê erro do helper.",
              '**Permissões.** O manifesto pode pedir `{"project": "read"}` (ou `"none"`) e uma lista `network` vazia. A instalação mostra o que o plug-in pode fazer antes de você confirmar. Uma versão nova que pede mais exige nova confirmação, com as linhas novas marcadas.',
              "**Instalação.** A pasta é copiada para `<raiz>/plugins/<id>/<versão>/`, somente leitura, com o SHA-256 fixado. O daemon confere o hash de novo a cada início; pasta alterada não carrega. Agentes não instalam, ligam, desligam nem removem plug-ins.",
            ],
          },
          {
            kind: "p",
            text: "O **Vizinho** é o exemplo de ganchos. Quando um agente grava um arquivo, ele diz o que os arquivos irmãos do mesmo tipo fazem (imports, teste pareado) e aponta um arquivo modelo. Ele também garimpa convenções que quase todo arquivo segue e as grava como propostas (`propostas.json`). As que você copia para `cercas.json` viram cercas, e o turno que quebra uma delas é bloqueado no fim. O Vizinho fica em `Examples/plugins/vizinho` e é montado com `scripts/build-vizinho-plugin.sh`; não vem junto com o app.",
          },
          {
            kind: "p",
            text: "**Marketplace, fase 1 (0.3.0).** O daemon só aceita um catálogo com assinatura Ed25519 válida e número de sequência pelo menos igual ao último; depois de 30 dias ele fica velho. A instalação confere o SHA-256 do pacote e da árvore. Um plug-in cujo autor não é o Collie mostra `<autor> · revisado pelo Collie` no cartão, e a confirmação diz que o autor não é o Collie. Uma versão recolhida no catálogo é desligada.",
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
                title: "Tenha a pasta do plug-in",
                body: "Uma pasta com `collie-plugin.json`, `ui/` e, para ganchos, `bin/<nome>`. O `Examples/plugins/notas` é um painel mínimo.",
              },
              {
                title: "Valide (para quem escreve plug-ins)",
                body: "Recusa o que a instalação recusaria, mais as regras do catálogo: `permissions.network` vazio e o helper um Mach-O assinado como `dev.collie.plugin.<id>`. Exit 0 imprime `ok` e o `TeamIdentifier`; exit 1 imprime um motivo por linha.",
                command: "collie plugin validate ./meu-plugin",
              },
              {
                title: "Instale você mesmo",
                body: "Em Preferências › Plug-ins › **Instalar de uma pasta…**, ou num shell fora de um terminal do Collie. Leia o que ele pode fazer antes de confirmar. Com `--replace`, substitui um já instalado.",
                command: "collie plugin install --path ./meu-plugin",
              },
              {
                title: "Abra o painel e ligue por guia",
                body: "Abra pela paleta ou com `collie panel open <id>` e ligue o agente ao painel para ele alcançar os comandos.",
              },
              {
                title: "Confira o que está instalado",
                body: "Lista cada plug-in com versão, se está ligado, erros, comandos, ganchos e permissões.",
                command: "collie plugin list",
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
              "Nenhum catálogo de plug-ins foi publicado ainda. A aba **Descobrir** e o `collie plugin install-catalog` ficam sem uso até sair um.",
              "Os ganchos chegam só a terminais Claude, não a Cursor nem Codex.",
              "Um `block` no `stop` impede o fim do turno uma vez; um Stop continuado nunca é bloqueado de novo. O texto do gancho é cortado em 2.000 caracteres por plug-in, 4.000 somados.",
              "Os painéis da fase 1 são só interface web: sem lista de rede liberada, sem escrita no projeto. Isso fica para as próximas fases.",
              "A pasta não pode ter links nem arquivos especiais, no máximo 5.000 entradas e 64 MiB.",
            ],
          },
          {
            kind: "note",
            text: "Instalar é só com você. Um agente pode pedir um plug-in, mas nunca instala.",
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
                title: "Um plug-in lê a minha conversa?",
                body: "Não. O painel vê só os argumentos dos comandos; o helper vê só caminhos de arquivo e o evento.",
              },
              {
                title: "E se a pasta instalada mudar?",
                body: "O daemon confere o hash a cada início. Pasta alterada não carrega e pede para instalar de novo.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie plugin install --path <pasta>",
        does: "Instala um plug-in de uma pasta (só você, fora de um terminal)",
      },
      {
        command: "collie plugin list",
        does: "Lista os plug-ins instalados, ganchos e permissões",
      },
      {
        command: "collie plugin validate <pasta>",
        does: "Confere um plug-in contra as regras da instalação e do catálogo",
      },
      {
        command: "collie plugin catalog [--refresh]",
        does: "Mostra o catálogo assinado que o daemon aceitou",
      },
      {
        command: "collie plugin install-catalog <id> --version <v>",
        does: "Instala ou atualiza um plug-in do catálogo",
      },
      {
        command: "collie panel open <id>",
        does: "Abre o painel de um plug-in",
      },
    ],
    related: ["shepherd", "sandbox", "memory"],
  },
};

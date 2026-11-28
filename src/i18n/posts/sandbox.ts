import type { Post } from "./types";

export const sandbox: Post = {
  en: {
    slug: "sandbox",
    eyebrow: "11 · SANDBOX",
    title: "Agents ask to leave the paddock.",
    lead: "Agent terminals run under the macOS sandbox. In strict mode, a write outside the project is blocked and becomes a card: the agent says why, and you allow or deny it.",
    mediaId: "sandbox",
    mediaAlt:
      "In strict mode a write outside the project is blocked; the agent requests access and the owner allows it on a card.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "Every Collie terminal runs inside a macOS sandbox (Seatbelt): one profile per terminal, covering its whole process tree. It is a file boundary, not a network one.",
          },
          {
            kind: "p",
            text: "There are two modes. Open is the default. Strict limits where a terminal can write and turns a blocked write into a card you decide on.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "An agent that can write anywhere in your account can also be steered there by text it reads, a prompt injection. Strict mode keeps its writes in the project and puts the exceptions in front of you.",
          },
          {
            kind: "p",
            text: "Example: in strict mode the agent needs to update a lint config in ~/dotfiles. The write is blocked with Operation not permitted. The agent asks with a reason, a card appears on its terminal node, and you click Allow this path or Deny.",
          },
        ],
      },
      {
        id: "how",
        title: "How it works",
        blocks: [
          {
            kind: "p",
            text: "The mode is global. In Preferences, Sandbox mode picks Open (default) or Strict. A change applies to terminals opened afterwards; running ones keep the mode they started with until they restart. Only the app changes it, never a terminal.",
          },
          {
            kind: "list",
            items: [
              "Open. The agent reads and writes everything in your account, including keys and tokens. There are no access cards, and collie access request answers that access is already granted. What stays closed is what belongs to Collie: its data folder and admin token, the Collie.app bundle and its LaunchAgents, signals to processes outside the sandbox, and its socket.",
              "Strict, writes. The terminal writes only in the project (the nearest ancestor with a .git, never above your home; in a paddock, the paddock's worktree) and in tool work folders such as temp files and build caches.",
              "Strict, reads. Free, except secrets, browser profiles and some Library folders, which never open.",
              "Strict, secrets. Neither read nor write: ~/.ssh, ~/.aws, ~/.netrc, ~/.git-credentials and similar, and browser profiles. Git over SSH keeps working through the ssh-agent.",
              "Never writable. Shell rc files, ~/.gitconfig, ~/.config/git, ~/.npmrc, the Collie app and its data folder, nested .git folders, and .git/hooks and .git/config.",
            ],
          },
          {
            kind: "p",
            text: 'When a strict terminal is blocked on a write that can be allowed, the agent gets the error at once and the terminal node shows a card: "Agent X tried to write path", with Allow this path, Allow the folder and Deny, plus a "for the batch" option. Nothing is allowed without your click. Allowing restarts the terminal with a wider sandbox and, in Claude, resumes the conversation. Granted paths stay saved, and Revoke restarts the terminals they reached.',
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
                title: "Choose the mode",
                body: "Open Preferences and set Sandbox mode to Strict. It applies to terminals opened from now on.",
              },
              {
                title: "Open a terminal in the project",
                body: "The project is the nearest folder with a .git. If the terminal's folder is your home, the project is your whole home folder.",
              },
              {
                title: "Let the agent hit a block",
                body: "A write outside the project fails with Operation not permitted.",
              },
              {
                title: "The agent asks, with a reason",
                body: "The reason is cleaned of secrets and shown on the same card. If a card is already open for that folder, the request joins it.",
                ask: "Update the shared config in ~/dotfiles",
                command:
                  'collie access request ~/dotfiles --write --reason "shared lint config"',
              },
              {
                title: "Decide on the card",
                body: "Allow this path, Allow the folder, or Deny. The terminal restarts when you allow.",
              },
              {
                title: "Revoke when done",
                body: "Granted paths show in the terminal popover and in the batch's Granted tab. Revoke takes the access back and restarts the terminals it reached.",
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
              "It limits files, not the network. The network stays open.",
              "Open is the default, and in Open an agent, or text it reads, can read your keys and tokens and write or delete anything in your account.",
              "Whatever an agent writes and you, or a free terminal, run later runs without a sandbox: a shell rc, a LaunchAgent, a binary on your PATH, a git hook or config.",
              'A free terminal (Terminal.app, or "Free terminal (no sandbox)" in the new-terminal sheet) is not protected at all.',
              "Some doors stay open in strict mode on purpose: osascript and Apple Events, the Docker socket, the Keychain, and the GitHub login in ~/.config/gh. A deliberately malicious agent can run code outside the sandbox through them.",
              "One click never allows: the Collie data folder and token, secrets, .git/hooks and .git/config, any .git, ~/Library as a whole, the Collie app, and the files that are never writable. Those requests show a card with only Deny.",
              "A read request shows no card. The answer says reading is already free, or why that path never opens.",
              "Seatbelt is an API Apple marks as deprecated but still ships. If it leaves macOS, the sandbox stops working and Collie will have to change mechanism.",
              "Real isolation needs the agents under another macOS user.",
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
            text: "Why did I get no card? You are probably in Open mode, where there is nothing to block. Or the path is one that never opens, or a read, which never shows a card.",
          },
          {
            kind: "p",
            text: "Does the autonomous loop use this? Yes. The check and git of the loop run under the paddock's strict profile, created at run and deleted at the end.",
          },
          {
            kind: "p",
            text: "Does Allow keep my agent's work? The running process is lost, the conversation is not. In Claude it resumes with --continue if one existed.",
          },
        ],
      },
    ],
    commands: [
      {
        command: 'collie access request <path> --write [--reason "..."]',
        does: "Ask the owner for write access to a path (strict mode)",
      },
      {
        command: "collie open <url|app>",
        does: "Open a URL or an installed app outside the sandbox",
      },
    ],
    related: ["loop", "shepherd", "apps"],
  },
  pt: {
    slug: "sandbox",
    eyebrow: "11 · SANDBOX",
    title: "Agentes pedem para sair do cercado.",
    lead: "Terminais de agente rodam sob o sandbox do macOS. No modo estrito, uma escrita fora do projeto é bloqueada e vira um cartão: o agente diz por quê, e você permite ou nega.",
    mediaId: "sandbox",
    mediaAlt:
      "No modo estrito, uma escrita fora do projeto é bloqueada; o agente pede acesso e o dono permite num cartão.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "Todo terminal do Collie roda dentro de um sandbox do macOS (Seatbelt): um perfil por terminal, que cobre a árvore inteira de processos. É uma fronteira de arquivos, não de rede.",
          },
          {
            kind: "p",
            text: "Há dois modos. Aberto é o padrão. Estrito limita onde o terminal escreve e transforma uma escrita bloqueada num cartão que você decide.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Um agente que escreve em qualquer lugar da sua conta também pode ser empurrado até lá por um texto que ele lê, o prompt injection. O modo estrito mantém as escritas dele no projeto e põe as exceções na sua frente.",
          },
          {
            kind: "p",
            text: "Exemplo: no modo estrito o agente precisa atualizar uma config de lint em ~/dotfiles. A escrita é bloqueada com Operation not permitted. O agente pede, com um motivo, um cartão aparece no nó do terminal dele, e você clica em Liberar este caminho ou Negar.",
          },
        ],
      },
      {
        id: "how",
        title: "Como funciona",
        blocks: [
          {
            kind: "p",
            text: "O modo é global. Em Preferências, Modo do sandbox escolhe entre Aberto (padrão) e Estrito. A mudança vale para terminais abertos depois; os que já rodam ficam com o modo com que começaram até reiniciarem. Só o app muda o modo, nunca um terminal.",
          },
          {
            kind: "list",
            items: [
              "Aberto. O agente lê e escreve tudo na sua conta, inclusive chaves e tokens. Não há cartões de acesso, e collie access request responde que o acesso já está liberado. Continua fechado o que é do Collie: a pasta de dados e o token de admin, o bundle Collie.app e os LaunchAgents dele, sinais para processos fora do sandbox e o socket.",
              "Estrito, escrita. O terminal escreve só no projeto (o primeiro ancestral com .git, nunca acima do seu home; num cercado, a worktree do cercado) e nas pastas de trabalho das ferramentas, como temporários e caches de build.",
              "Estrito, leitura. Livre, menos segredos, perfis de navegador e algumas pastas de Library, que nunca abrem.",
              "Estrito, segredos. Nem leitura nem escrita: ~/.ssh, ~/.aws, ~/.netrc, ~/.git-credentials e semelhantes, e perfis de navegador. O git por SSH segue funcionando pelo ssh-agent.",
              "Nunca gravável. Os rc do shell, ~/.gitconfig, ~/.config/git, ~/.npmrc, o app do Collie e a pasta de dados dele, .git aninhado, e .git/hooks e .git/config.",
            ],
          },
          {
            kind: "p",
            text: 'Quando um terminal estrito é bloqueado numa escrita que pode ser liberada, o agente recebe o erro na hora e o nó do terminal mostra um cartão: "Agente X tentou escrever caminho", com Liberar este caminho, Liberar a pasta e Negar, e a opção "para o lote". Nada é liberado sem o seu clique. Liberar reinicia o terminal com um sandbox mais largo e, no Claude, retoma a conversa. Os caminhos liberados ficam salvos, e Revogar reinicia os terminais que eles alcançavam.',
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
                title: "Escolha o modo",
                body: "Abra Preferências e ponha Modo do sandbox em Estrito. Vale para terminais abertos daqui em diante.",
              },
              {
                title: "Abra um terminal no projeto",
                body: "O projeto é a pasta mais próxima com .git. Se a pasta do terminal for o seu home, o projeto é o home inteiro.",
              },
              {
                title: "Deixe o agente esbarrar num bloqueio",
                body: "Uma escrita fora do projeto falha com Operation not permitted.",
              },
              {
                title: "O agente pede, com um motivo",
                body: "O motivo é limpo de segredos e aparece no mesmo cartão. Se já houver um cartão aberto para aquela pasta, o pedido se soma a ele.",
                ask: "Atualize a config compartilhada em ~/dotfiles",
                command:
                  'collie access request ~/dotfiles --write --reason "shared lint config"',
              },
              {
                title: "Decida no cartão",
                body: "Liberar este caminho, Liberar a pasta ou Negar. O terminal reinicia quando você libera.",
              },
              {
                title: "Revogue quando acabar",
                body: "Os liberados aparecem no popover do terminal e na aba Liberados do lote. Revogar tira o acesso e reinicia os terminais que ele alcançava.",
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
              "Limita arquivos, não a rede. A rede continua aberta.",
              "Aberto é o padrão, e no Aberto um agente, ou um texto que ele lê, pode ler suas chaves e tokens e gravar ou apagar qualquer coisa na sua conta.",
              "O que um agente gravar e você, ou um terminal livre, executar depois roda sem sandbox: um rc do shell, um LaunchAgent, um binário no PATH, um hook ou config do git.",
              'Um terminal livre (o Terminal.app, ou "Terminal livre (sem sandbox)" na folha de novo terminal) não tem proteção nenhuma.',
              "Algumas portas ficam abertas no modo estrito de propósito: osascript e Apple Events, o socket do Docker, o Keychain e o login do GitHub em ~/.config/gh. Um agente mal-intencionado de propósito roda código fora do sandbox por elas.",
              "Um clique nunca libera: a pasta de dados e o token do Collie, segredos, .git/hooks e .git/config, qualquer .git, ~/Library inteiro, o app do Collie e o que nunca é gravável. Esses pedidos mostram um cartão só com Negar.",
              "Um pedido de leitura não mostra cartão. A resposta diz que a leitura já é livre, ou por que aquele caminho nunca abre.",
              "O Seatbelt é uma API que a Apple marca como obsoleta mas que ainda distribui. Se sair do macOS, o sandbox para de funcionar e o Collie terá de trocar de mecanismo.",
              "Isolamento de verdade exige os agentes sob outro usuário do macOS.",
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
            text: "Por que não apareceu cartão? Provavelmente você está no modo Aberto, onde não há o que bloquear. Ou o caminho é um que nunca abre, ou é uma leitura, que nunca mostra cartão.",
          },
          {
            kind: "p",
            text: "O laço autônomo usa isso? Usa. O check e o git do laço rodam sob o perfil estrito do cercado, criado no run e apagado no fim.",
          },
          {
            kind: "p",
            text: "Liberar perde o trabalho do agente? O processo em andamento se perde, a conversa não. No Claude ela retoma com --continue, se já havia uma.",
          },
        ],
      },
    ],
    commands: [
      {
        command: 'collie access request <caminho> --write [--reason "..."]',
        does: "Pede ao dono escrita num caminho (modo estrito)",
      },
      {
        command: "collie open <url|app>",
        does: "Abre uma URL ou um app instalado fora do sandbox",
      },
    ],
    related: ["loop", "shepherd", "apps"],
  },
};

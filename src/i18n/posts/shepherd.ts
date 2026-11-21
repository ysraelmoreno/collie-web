import type { Post } from "./types";

export const shepherd: Post = {
  en: {
    slug: "shepherd",
    eyebrow: "00 · BASICS",
    title: "A shepherd, paddocks and herds.",
    lead: "A lead agent summons the others, leashes them to the work and checks their output. Every task gets its own paddock, and a herd saves a team to use again.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "Collie has three base ideas. The Shepherd is an agent terminal you mark as **Pastor** (Shepherd): it can summon agents, open panels and create paddocks. A paddock is a workspace for one task, usually a git worktree with its own branch. A herd is a saved team of terminals and panels you can apply again.",
          },
          {
            kind: "p",
            text: "A leash is what ties them together. A Shepherd only reaches the terminals and panels that are leashed to it.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it matters",
        blocks: [
          {
            kind: "p",
            text: "With several agents on one repository, they step on each other's files and you become the router between them. The Shepherd takes that job: it creates a paddock for the task, summons a designer and a tester into it, asks them for work and reads what they did.",
          },
          {
            kind: "p",
            text: "When the work is done, you land the paddock back onto its base branch. When the team worked well, you save it as a herd and apply it on the next project.",
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
              "Shepherd: tick **Pastor** when you create or edit a terminal. A terminal that is not a Shepherd cannot summon, leash or create paddocks.",
              "Leash: collie summon <name> creates an agent already leashed to you (--preset, --cwd, --paddock, --model, --connect, and a first prompt). collie leash a b ties two agents that are both leashed to you, and collie unleash removes it. To reach a terminal you do not reach, collie leash request <name> shows a card in the app and you decide.",
              "Talking: collie list shows who you reach. collie ask <name> \"…\" sends a prompt and waits for the reply, or returns an id with --no-wait (collie ask result <id>). collie check <name> reads its output, and --screen shows the screen as drawn now. collie dismiss <name> kills an agent leashed to you.",
              "Paddock: collie paddock create <name> makes a git worktree off your repository (name: a-z, 0-9 and -). With --folder it works in place on an existing folder, git or not. Branches created by Collie are named collie/<name>. A terminal outside any paddock sits in the Pasture, which is not a paddock.",
              "Paddock lifecycle: collie paddock status shows it, collie paddock land <name> brings it back onto its base branch (merge, squash or rebase), and collie paddock delete removes the worktree and branch. Anyone can list paddocks. Creating is for Shepherds. Landing and deleting are for the Shepherd that created it, or you. Landing as a pull request (pr) is only for you.",
              "Herd: a herd has terminals (preset, initial prompt, position), panels, leashes and, if you want, a paddock. A Shepherd runs collie herd list, collie herd apply <id> --name <name> and collie herd save <name> --terminals a,b,c. Applying is all or nothing: if a step fails, what was created is undone.",
              "Who is the admin: you, in the app. Agents only use their own terminal's token, so the things that need you (leash requests, loop approvals, access to a folder) show up as cards.",
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
                title: "Install Collie",
                body: "Download the signed .dmg and drag Collie.app to Applications. It needs macOS 15 or later on a Mac with Apple silicon. The collied daemon only runs with the app in /Applications.",
              },
              {
                title: "Create a Shepherd",
                body: "In the app, click **Novo terminal** (New terminal), pick an agent preset and tick **Pastor**. It can then summon agents, open panels and create paddocks, and it reaches only who is leashed to it.",
              },
              {
                title: "Give the task a paddock",
                body: "Ask the Shepherd in plain words. It creates a git worktree and a branch for the task.",
                ask: "Create a paddock for the new sign-in screen",
                command: "collie paddock create signin",
              },
              {
                title: "Summon the team",
                body: "Each summoned agent is leashed to the Shepherd and works in its paddock. The first prompt is sent without waiting for a reply.",
                ask: "Summon a designer and a tester",
                command: "collie summon designer --preset claude",
              },
              {
                title: "Ask and read",
                body: "The Shepherd sends work and reads the answer.",
                ask: "Ask the designer to draw the screen",
                command: "collie ask designer \"Draw the sign-in screen\"",
              },
              {
                title: "Land it",
                body: "When the work is done, bring the paddock back onto its base branch.",
                command: "collie paddock land signin --mode merge",
              },
              {
                title: "Save the team as a herd",
                body: "The next project starts from the same team. Applying it from the app first shows a preview with every command and prompt.",
                command: "collie herd save signin-team --terminals designer,tester",
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
              "A Shepherd only reaches what is leashed to it. A free terminal (no sandbox) has no leashes, and none reaches it.",
              "A folder paddock has no branch, so no land, no pull request and no merge close. Deleting it removes only Collie's record, never the folder.",
              "Undoing a failed herd apply removes terminals and panels it created. The paddock is only removed if it has no commits, no uncommitted changes, no ignored files and no terminal left in it. Design files it created stay, with a warning. If the service crashes mid-apply, what was created stays and you remove it by hand.",
              "A saved herd never stores terminal history, tokens, Design links, environment variables, absolute paths or cwd. **Dispositivo** (Device) panels and other plug-ins are skipped with a warning.",
              "A .collieherd file is JSON, up to 256 KiB, 20 terminals and 20 panels. An imported file is not trusted: you see every command and prompt before saving it, and nothing is created until you apply it.",
              "Import, export and remove for herds are app only.",
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
            text: "Does every terminal need to be a Shepherd? No. Most are not. A Shepherd summons and leashes the others, and they work in its paddock.",
          },
          {
            kind: "p",
            text: "Can a Shepherd run a loop? Yes, with your approval. See the Loop post.",
          },
        ],
      },
    ],
    commands: [
      { command: "collie list", does: "List the agents you reach (--all adds your paddock's other terminals)." },
      { command: "collie summon <name> [--preset …] [--paddock …] \"<first prompt>\"", does: "Spawn an agent leashed to you." },
      { command: "collie ask <name> \"<prompt>\"", does: "Send a prompt and wait for the reply (--no-wait returns an id)." },
      { command: "collie check <name> [--screen]", does: "Read an agent's recent output, or its screen." },
      { command: "collie leash <a> <b>", does: "Leash two agents that are both leashed to you." },
      { command: "collie leash request <name> --reason \"…\"", does: "Ask you, with a card, to leash a terminal the Shepherd does not reach." },
      { command: "collie dismiss <name>", does: "Kill an agent leashed to you." },
      { command: "collie paddock create <name> [--folder <path>]", does: "Create a paddock: a git worktree, or an existing folder." },
      { command: "collie paddock land <name> [--mode merge|squash|rebase]", does: "Land the paddock back onto its base branch." },
      { command: "collie paddock delete <name>", does: "Delete a paddock's worktree and branch." },
      { command: "collie herd save <name> --terminals a,b,c", does: "Save terminals (and panels) you reach as a herd." },
      { command: "collie herd apply <id> --name <name>", does: "Apply a herd, all or nothing." },
    ],
    related: ["loop", "memory", "sandbox"],
  },
  pt: {
    slug: "shepherd",
    eyebrow: "00 · CONCEITOS",
    title: "Um pastor, cercados e rebanhos.",
    lead: "Um agente líder chama os outros, liga cada um ao trabalho e confere o que entregaram. Cada tarefa ganha o seu cercado, e um rebanho guarda uma equipe para usar de novo.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "O Collie tem três ideias de base. O Pastor é um terminal de agente que você marca como Pastor: ele chama agentes, abre painéis e cria cercados. Um cercado é um espaço de trabalho para uma tarefa, em geral uma worktree do git com branch própria. Um rebanho é uma equipe salva de terminais e painéis que você aplica de novo.",
          },
          {
            kind: "p",
            text: "A coleira é o que liga tudo. Um Pastor só alcança os terminais e painéis que estão ligados a ele por coleira.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Com vários agentes num repositório, eles pisam nos arquivos uns dos outros e você vira o roteador entre eles. O Pastor assume esse papel: cria um cercado para a tarefa, chama um designer e um tester para dentro dele, pede o trabalho e lê o que fizeram.",
          },
          {
            kind: "p",
            text: "Quando o trabalho acaba, você integra (land) o cercado de volta na branch base. Quando a equipe funcionou bem, você a salva como rebanho e aplica no próximo projeto.",
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
              "Pastor: marque Pastor ao criar ou editar um terminal. Um terminal que não é Pastor não chama agentes, não faz coleira e não cria cercado.",
              "Coleira: collie summon <nome> cria um agente já ligado a você (--preset, --cwd, --paddock, --model, --connect, e um primeiro prompt). collie leash a b liga dois agentes que já estão ligados a você, e collie unleash desfaz. Para alcançar um terminal que você não alcança, collie leash request <nome> mostra um cartão no app e você decide.",
              "Conversa: collie list mostra quem você alcança. collie ask <nome> \"…\" envia um prompt e espera a resposta, ou devolve um id com --no-wait (collie ask result <id>). collie check <nome> lê a saída, e --screen mostra a tela como está desenhada agora. collie dismiss <nome> encerra um agente ligado a você.",
              "Cercado: collie paddock create <nome> cria uma worktree do git a partir do seu repositório (nome: a-z, 0-9 e -). Com --folder ele trabalha direto numa pasta existente, git ou não. As branches criadas pelo Collie se chamam collie/<nome>. Um terminal fora de qualquer cercado fica no Pasto, que não é um cercado.",
              "Ciclo do cercado: collie paddock status mostra o cercado, collie paddock land <nome> traz de volta para a branch base (merge, squash ou rebase), e collie paddock delete remove a worktree e a branch. Qualquer um lista cercados. Criar é só de Pastor. Integrar e excluir é do Pastor que criou, ou seu. Integrar como pull request (pr) é só seu.",
              "Rebanho: um rebanho tem terminais (preset, prompt inicial, posição), painéis, coleiras e, se quiser, um cercado. Um Pastor roda collie herd list, collie herd apply <id> --name <nome> e collie herd save <nome> --terminals a,b,c. Aplicar é tudo ou nada: se um passo falha, o que foi criado é desfeito.",
              "Quem é o admin: você, no app. Os agentes só usam o token do próprio terminal, então o que precisa de você (pedido de coleira, aprovação de laço, acesso a uma pasta) aparece como cartão.",
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
                title: "Instale o Collie",
                body: "Baixe o .dmg assinado e arraste o Collie.app para Applications. Ele pede macOS 15 ou superior num Mac com Apple silicon. O daemon collied só roda com o app em /Applications.",
              },
              {
                title: "Crie um Pastor",
                body: "No app, crie um terminal novo, escolha um preset de agente e marque Pastor. Ele passa a chamar agentes, abrir painéis e criar cercados, e só alcança quem estiver ligado a ele por coleira.",
              },
              {
                title: "Dê um cercado à tarefa",
                body: "Peça ao Pastor em linguagem natural. Ele cria uma worktree do git e uma branch para a tarefa.",
                ask: "Crie um cercado para a nova tela de login",
                command: "collie paddock create login",
              },
              {
                title: "Chame a equipe",
                body: "Cada agente chamado fica ligado ao Pastor e trabalha no cercado dele. O primeiro prompt é enviado sem esperar resposta.",
                ask: "Chame um designer e um tester",
                command: "collie summon designer --preset claude",
              },
              {
                title: "Peça e leia",
                body: "O Pastor manda o trabalho e lê a resposta.",
                ask: "Peça ao designer para desenhar a tela",
                command: "collie ask designer \"Desenhe a tela de login\"",
              },
              {
                title: "Integre",
                body: "Quando o trabalho acabar, traga o cercado de volta para a branch base.",
                command: "collie paddock land login --mode merge",
              },
              {
                title: "Salve a equipe como rebanho",
                body: "O próximo projeto começa da mesma equipe. Aplicar pelo app mostra antes uma prévia com cada comando e cada prompt.",
                command: "collie herd save equipe-login --terminals designer,tester",
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
              "Um Pastor só alcança o que está ligado a ele por coleira. Um terminal livre (sem sandbox) não tem coleiras, e nenhuma o alcança.",
              "Um cercado de pasta não tem branch, então não tem land, nem pull request, nem fechamento por merge. Excluí-lo remove só o registro do Collie, nunca a pasta.",
              "Desfazer um aplicar de rebanho que falhou remove os terminais e painéis que ele criou. O cercado só é removido se não tem commits, alterações não commitadas, arquivos ignorados nem terminal dentro. Arquivos de design criados ficam, com aviso. Se o serviço cair no meio da aplicação, o que já foi criado fica e você remove à mão.",
              "Um rebanho salvo nunca guarda histórico de terminal, tokens, links do Design, variáveis de ambiente, caminhos absolutos nem cwd. Painéis de dispositivo e de outros plug-ins são pulados, com aviso.",
              "Um arquivo .collieherd é JSON, de até 256 KiB, 20 terminais e 20 painéis. Um arquivo importado não é confiável: você vê cada comando e cada prompt antes de guardar, e nada é criado até você aplicar.",
              "Importar, exportar e remover rebanhos é só pelo app.",
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
            text: "Todo terminal precisa ser Pastor? Não. A maioria não é. O Pastor chama e liga os outros, e eles trabalham no cercado dele.",
          },
          {
            kind: "p",
            text: "Um Pastor pode rodar um laço? Pode, com a sua aprovação. Veja o post do Laço.",
          },
        ],
      },
    ],
    commands: [
      { command: "collie list", does: "Lista os agentes que você alcança (--all inclui os outros terminais do cercado)." },
      { command: "collie summon <nome> [--preset …] [--paddock …] \"<primeiro prompt>\"", does: "Cria um agente ligado a você." },
      { command: "collie ask <nome> \"<prompt>\"", does: "Envia um prompt e espera a resposta (--no-wait devolve um id)." },
      { command: "collie check <nome> [--screen]", does: "Lê a saída recente de um agente, ou a tela dele." },
      { command: "collie leash <a> <b>", does: "Liga dois agentes que já estão ligados a você." },
      { command: "collie leash request <nome> --reason \"…\"", does: "Pede a você, num cartão, para ligar um terminal que o Pastor não alcança." },
      { command: "collie dismiss <nome>", does: "Encerra um agente ligado a você." },
      { command: "collie paddock create <nome> [--folder <pasta>]", does: "Cria um cercado: uma worktree do git, ou uma pasta existente." },
      { command: "collie paddock land <nome> [--mode merge|squash|rebase]", does: "Integra o cercado de volta na branch base." },
      { command: "collie paddock delete <nome>", does: "Exclui a worktree e a branch de um cercado." },
      { command: "collie herd save <nome> --terminals a,b,c", does: "Salva terminais (e painéis) que você alcança como rebanho." },
      { command: "collie herd apply <id> --name <nome>", does: "Aplica um rebanho, tudo ou nada." },
    ],
    related: ["loop", "memory", "sandbox"],
  },
};

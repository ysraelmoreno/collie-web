import type { Post } from "./types";

export const memory: Post = {
  en: {
    slug: "memory",
    eyebrow: "02 · MEMORY",
    title: "Memory every agent shares.",
    lead: "Decisions, map entries and pitfalls become project memory. Agents search it before re-reading your code, and Collie injects what is relevant into their prompts.",
    mediaId: "memory",
    mediaAlt: "The Memory panel on the canvas.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "Collie keeps a memory for your project. Each entry is a decision (why we chose X), a map entry (where something lives) or a pitfall (what went wrong before). Agents save to it and search it with the collie CLI.",
          },
          {
            kind: "p",
            text: "It lives in three scopes: global (everywhere), project (the terminal's repository) and lot (a group of terminals with one goal, visible only to its members). Memories from before lots existed belong to the project.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it matters",
        blocks: [
          {
            kind: "p",
            text: "Every new agent starts from zero, so you re-explain the same things: which token is primary, that /v1 is frozen, why sessions use JWT. Memory keeps those answers where every agent can find them, including the ones you open next month.",
          },
          {
            kind: "list",
            items: [
              "Before re-reading code, an agent runs collie memory search.",
              "A pitfall saved once is injected the next time a prompt touches it.",
              "You review what Collie proposes, so the memory stays yours.",
            ],
          },
        ],
      },
      {
        id: "how",
        title: "How it works",
        blocks: [
          {
            kind: "p",
            text: "An agent writes with collie memory save --kind decision|map|pitfall --subject <key> --title <summary> and reads with collie memory search. Saving again on the same subject replaces the old entry.",
          },
          {
            kind: "p",
            text: "Collie also injects memory for Claude agents (Codex does not get this injection yet). At session start it adds pinned memories and an index of titles, up to 4096 bytes. On each prompt it adds the memories relevant to that prompt, up to 2048 bytes, without repeating. After compaction it re-adds the agent's active work and the index.",
          },
          {
            kind: "list",
            items: [
              "Isolation: an agent reads its own lot, its project and global. Another lot is out of reach, even in the same paddock. Only you and a Shepherd that reaches every member of a lot can search it (--lot, --all).",
              "Proposals: when a piece of work closes, and when a session ends, Collie proposes memories. They wait in **Revisar → Propostas** (Review → Proposals) until you approve, edit or discard them. After 14 days without review they become discarded (you can restore them). Nothing is deleted on its own.",
              "Lifecycle: a new project memory is provisional and is archived after 21 days if nobody uses it. Used in 2 days and 2 different sessions, it becomes earned. Long-term memories (up to 12 per project) enter whole at session start. Pinned or edited memories never age out on their own.",
              "Judging: each memory injected in full starts with a short id. The agent judges it with collie memory flag <id> --useful, --wrong or --outdated. Wrong and outdated mark it contested and ask the curator to check it again.",
              "Conversation capture: after a task, the curator reads the new part of the Claude conversation (only your text and the agent's, no tool output, no secrets, up to 12,000 characters) and saves up to 5 decisions and pitfalls as active. A preference of yours becomes a proposal, only if you said it yourself. Only Claude has a transcript, so Codex is not captured.",
              "Lot board: each lot has a board for notes between its members (collie lot board, collie lot post). Notes addressed to you arrive in your next prompt, once, as data and not as orders.",
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
                title: "Start a Claude agent in a project",
                body: "Memory is injected into Claude terminals. Inside a git repository, the project memory is that repository's.",
              },
              {
                title: "Search before reading code",
                body: "Ask the agent, or run it yourself in a terminal that belongs to the project.",
                ask: "How do we handle sessions?",
                command: 'collie memory search "sessions"',
              },
              {
                title: "Save a decision",
                body: "kind is decision, map or pitfall. The subject is the topic key, and a new save on it replaces the old one. The scope defaults to your lot when you are in one, otherwise the project.",
                ask: "Remember that /v1 is frozen",
                command:
                  'collie memory save --kind pitfall --subject api-v1 --title "/v1 is frozen" "Add new routes to /v2."',
              },
              {
                title: "Judge what was injected",
                body: "When a memory helped, say so. When it is wrong or out of date, flag it and say why.",
                command:
                  'collie memory flag <id> --outdated "the API moved to /v2"',
              },
              {
                title: "Review proposals and watch the numbers",
                body: "In the app, open the **Memória** (Memory) panel and its **Revisar** tab. collie memory stats summarizes coverage, injections, dead memories and repeated corrections; add --json for machine output.",
                command: "collie memory stats --since 7d",
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
              "Injection at session start, on prompts and after compaction is Claude only. Codex reads notes with collie lot board and comments with collie comment list.",
              "Collie does not measure savings. It shows trends (tokens per finished task, repeated corrections, searches per task) and says there is no controlled comparison.",
              "Memory a sandboxed agent saves with --scope project or --scope global is injected into free terminals of that project (or of all, for global). Check it in **Revisar** before you trust it in a free terminal.",
              "Capture reads each stretch once and counts against the curator's daily limit. When the limit is hit, it waits for the next day.",
              "A lot memory can be moved to the project with collie memory promote <id>.",
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
            text: "Does a closed task become memory? Yes, as a proposal. When a piece of work closes, Collie stores its summary as an unreviewed decision, and you approve or discard it. An empty piece of work is not stored.",
          },
          {
            kind: "p",
            text: "Can I search documents too? Yes. collie memory doc-search searches reference documents you ingested in the app (md, txt, pdf). Ingesting is app only.",
          },
        ],
      },
    ],
    commands: [
      {
        command: 'collie memory search "<words>"',
        does: "Search memory before re-reading code (--limit, --all, --inactive).",
      },
      {
        command:
          "collie memory save --kind decision|map|pitfall --subject <key> --title <summary>",
        does: "Save an entry; same subject replaces the old one.",
      },
      {
        command: "collie memory flag <id> --useful|--wrong|--outdated",
        does: "Judge a memory that was injected.",
      },
      {
        command: "collie memory promote <id>",
        does: "Move a lot memory to the project.",
      },
      {
        command: "collie memory stats [--since 7d] [--json]",
        does: "Coverage, injections, dead memories and trends.",
      },
      {
        command: 'collie memory doc-search "<words>"',
        does: "Search the documents you ingested.",
      },
      { command: "collie lot board", does: "Read the lot's board of notes." },
      {
        command:
          "collie lot post --kind handoff|question|status|answer --to <name>",
        does: "Post a note to a member of the lot.",
      },
    ],
    related: ["loop", "shepherd", "design"],
  },
  pt: {
    slug: "memory",
    eyebrow: "02 · MEMÓRIA",
    title: "Memória que todo agente compartilha.",
    lead: "Decisões, entradas de mapa e armadilhas viram a memória do projeto. Os agentes buscam nela antes de reler o código, e o Collie injeta o que é relevante nos prompts.",
    mediaId: "memory",
    mediaAlt: "O painel Memória no canvas.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "O Collie guarda uma memória do seu projeto. Cada entrada é uma decisão (por que escolhemos X), uma entrada de mapa (onde algo mora) ou uma armadilha (o que já deu errado). Os agentes salvam e buscam nela pela CLI collie.",
          },
          {
            kind: "p",
            text: "Ela existe em três escopos: global (vale em todo lugar), projeto (o repositório do terminal) e lote (um grupo de terminais com um objetivo, visível só aos membros). Memórias de antes dos lotes são do projeto.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Todo agente novo começa do zero, e você explica de novo as mesmas coisas: qual token é o primário, que /v1 está congelada, por que as sessões usam JWT. A memória guarda essas respostas onde qualquer agente acha, inclusive os que você abrir no mês que vem.",
          },
          {
            kind: "list",
            items: [
              "Antes de reler código, o agente roda collie memory search.",
              "Uma armadilha salva uma vez é injetada na próxima vez que um prompt tocar nela.",
              "Você revisa o que o Collie propõe, então a memória continua sendo sua.",
            ],
          },
        ],
      },
      {
        id: "how",
        title: "Como funciona",
        blocks: [
          {
            kind: "p",
            text: "O agente escreve com collie memory save --kind decision|map|pitfall --subject <chave> --title <resumo> e lê com collie memory search. Salvar de novo no mesmo assunto substitui a entrada antiga.",
          },
          {
            kind: "p",
            text: "O Collie também injeta memória nos agentes Claude (o Codex ainda não recebe essa injeção). No início da sessão entram as memórias fixadas e um índice de títulos, até 4096 bytes. A cada prompt entram as memórias relevantes a ele, até 2048 bytes, sem repetir. Depois de compactar, voltam o trabalho ativo do agente e o índice.",
          },
          {
            kind: "list",
            items: [
              "Isolamento: um agente lê o próprio lote, o próprio projeto e o global. Outro lote fica fora do alcance, mesmo no mesmo cercado. Só você e um Pastor que alcança todos os membros de um lote podem buscar nele (--lot, --all).",
              "Propostas: quando um trabalho fecha, e no fim de uma sessão, o Collie propõe memórias. Elas esperam em Revisar → Propostas até você aprovar, editar ou descartar. Depois de 14 dias sem revisão viram descartadas (dá para restaurar). Nada é apagado sozinho.",
              "Ciclo de vida: uma memória de projeto nova nasce provisória e é arquivada em 21 dias se ninguém a usa. Usada em 2 dias e 2 sessões diferentes, vira ganha. As de longo prazo (até 12 por projeto) entram inteiras no início da sessão. Memórias fixadas ou editadas por você nunca envelhecem sozinhas.",
              "Julgar: cada memória injetada por inteiro começa com um id curto. O agente a julga com collie memory flag <id> --useful, --wrong ou --outdated. Wrong e outdated a marcam como contestada e pedem uma nova checagem ao curador.",
              "Captura da conversa: ao fim de uma tarefa, o curador lê o trecho novo da conversa do Claude (só o seu texto e o do agente, sem saída de ferramentas, sem segredos, até 12 000 caracteres) e guarda até 5 decisões e armadilhas como ativas. Uma preferência sua vira proposta, só se foi você que a disse. Só o Claude tem transcrição, então o Codex não é capturado.",
              "Quadro do lote: cada lote tem um quadro de recados entre os membros (collie lot board, collie lot post). Recados endereçados a você chegam no próximo prompt, uma vez, como dados e não como ordens.",
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
                title: "Abra um agente Claude num projeto",
                body: "A memória é injetada nos terminais Claude. Dentro de um repositório git, a memória do projeto é a desse repositório.",
              },
              {
                title: "Busque antes de ler código",
                body: "Peça ao agente, ou rode você mesmo num terminal que pertence ao projeto.",
                ask: "Como a gente trata sessões?",
                command: 'collie memory search "sessões"',
              },
              {
                title: "Salve uma decisão",
                body: "kind é decision, map ou pitfall. O subject é a chave do assunto, e um novo save nele substitui o antigo. O escopo padrão é o seu lote, se você está em um, senão o projeto.",
                ask: "Guarde que a /v1 está congelada",
                command:
                  'collie memory save --kind pitfall --subject api-v1 --title "/v1 está congelada" "Novas rotas vão na /v2."',
              },
              {
                title: "Julgue o que foi injetado",
                body: "Quando uma memória ajudou, diga. Quando está errada ou velha, marque e explique por quê.",
                command:
                  'collie memory flag <id> --outdated "a API passou para /v2"',
              },
              {
                title: "Revise as propostas e olhe os números",
                body: "No app, abra o painel Memória e Revisar. collie memory stats resume cobertura, injeções, memórias mortas e correções repetidas; com --json sai para máquina.",
                command: "collie memory stats --since 7d",
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
              "A injeção no início da sessão, nos prompts e depois de compactar é só do Claude. O Codex lê os recados com collie lot board e os comentários com collie comment list.",
              "O Collie não mede economia. Ele mostra tendências (tokens por tarefa concluída, correções repetidas, buscas por tarefa) e avisa que não há comparação controlada.",
              "Memória que um agente em sandbox salva com --scope project ou --scope global é injetada nos terminais livres daquele projeto (ou de todos, no global). Revise em Revisar antes de confiar nela num terminal livre.",
              "A captura lê cada trecho uma vez e conta no limite diário do curador. Atingido o limite, ela espera o dia seguinte.",
              "Uma memória de lote pode ir para o projeto com collie memory promote <id>.",
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
            text: "Um trabalho fechado vira memória? Vira, como proposta. Quando um trabalho fecha, o Collie guarda o resumo dele como uma decisão não revisada, e você aprova ou descarta. Um trabalho vazio não é guardado.",
          },
          {
            kind: "p",
            text: "Dá para buscar em documentos também? Dá. collie memory doc-search busca nos documentos de referência que você ingeriu no app (md, txt, pdf). Ingerir é só pelo app.",
          },
        ],
      },
    ],
    commands: [
      {
        command: 'collie memory search "<palavras>"',
        does: "Busca na memória antes de reler código (--limit, --all, --inactive).",
      },
      {
        command:
          "collie memory save --kind decision|map|pitfall --subject <chave> --title <resumo>",
        does: "Salva uma entrada; o mesmo assunto substitui a antiga.",
      },
      {
        command: "collie memory flag <id> --useful|--wrong|--outdated",
        does: "Julga uma memória que foi injetada.",
      },
      {
        command: "collie memory promote <id>",
        does: "Move uma memória de lote para o projeto.",
      },
      {
        command: "collie memory stats [--since 7d] [--json]",
        does: "Cobertura, injeções, memórias mortas e tendências.",
      },
      {
        command: 'collie memory doc-search "<palavras>"',
        does: "Busca nos documentos que você ingeriu.",
      },
      { command: "collie lot board", does: "Lê o quadro de recados do lote." },
      {
        command:
          "collie lot post --kind handoff|question|status|answer --to <nome>",
        does: "Posta um recado para um membro do lote.",
      },
    ],
    related: ["loop", "shepherd", "design"],
  },
};

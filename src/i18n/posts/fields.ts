import type { Post } from "./types";

export const fields: Post = {
  en: {
    slug: "fields",
    eyebrow: "14 · FIELDS",
    title: "A worktree for each agent, inside the paddock.",
    lead: "A field gives one summoned agent its own git worktree inside a paddock, so several agents build at once without touching each other's files. One integrator brings the work back. Preview since 0.3.0.",
    mediaId: "fields",
    mediaAlt:
      "A Shepherd summons two agents into fields of one paddock; a passing check lands each field back onto the paddock's branch.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "`collie summon <name> --field` creates an agent that works in its own worktree, cut from the paddock's HEAD, on the branch `collie/field/<name>`. The paddock stays the place where work comes together; the field is where one agent works alone.",
          },
          {
            kind: "p",
            text: "The work comes back in two ways: by itself when an `ask --check` passes, or when the Shepherd runs `collie field land`.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "Agents that share one worktree share one build folder and one index. One agent's half-written file breaks another's build, and a commit can pick up someone else's change.",
          },
          {
            kind: "p",
            text: "Example: four tasks in parallel, one agent each. With `--field`, each agent has its own tree and its own build, commits only to its branch, and the Shepherd integrates the branches one at a time.",
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
              "**Where.** The field lives at `<repo>/.collie/paddocks/field-<name>`, on `collie/field/<name>`. The name is the agent's (`a-z`, `0-9`, `-`). The daemon's own git creates and removes it; agents never make worktrees.",
              "**Sandbox.** A field has its own strict sandbox, like a loop lane: the agent writes its own tree, the git objects and only its own branch. The paddock, the lanes and the other fields stay closed. Its first build is cold.",
              "**One integrator per paddock.** Fields and the loop share one queue. A land merges the field into the paddock's branch and runs the gate again. It waits up to 10 minutes for the paddock to be clean and free; after that it answers `waiting` with the reason and the field stays `ready`.",
              "**Conflict or broken gate.** The land is undone and the field's code is kept as `<root>/fields/<name>-<n>.patch` (mode 0600), with the state `conflict`.",
              '**Automatic return.** `collie ask <name> "…" --check "<cmd>"` to a field\'s agent: when the check passes, its field\'s land is queued after the ask.',
              "**Dismiss.** Dismissing the agent saves what was not committed (tracked and untracked, not ignored) as `<name>-wip.patch`, removes the worktree and **keeps the branch**. `collie field drop <name>` then deletes the branch, keeping a patch first. Nothing in a field is lost by mistake.",
              '**Orientation.** The agent is told: `Field "<name>" (branch collie/field/<name>): commite aqui; o Pastor integra.` (commit here; the Shepherd integrates; the app\'s messages are in Portuguese).',
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
                title: "Open a Shepherd in a git paddock",
                body: "Fields need a sandboxed agent and a paddock that is a git worktree.",
              },
              {
                title: "Summon the agent into a field",
                body: "The first prompt is optional. Not with `--paddock`, `--cwd` or `--shepherd`.",
                ask: "Summon a backend agent in its own field",
                command:
                  'collie summon backend --field "Add the /health endpoint"',
              },
              {
                title: "Give it work with a check",
                body: "When the check passes, the field lands by itself.",
                command:
                  'collie ask backend "Add the /health endpoint" --check "npm test"',
              },
              {
                title: "See the fields",
                body: "Shows name, agent, branch, base, commits and state of each field of your paddock.",
                command: "collie field list",
              },
              {
                title: "Land by hand when there is no check",
                body: "Only the Shepherd that summoned the agent can land or drop its field.",
                command: "collie field land backend",
              },
              {
                title: "Make it the project's default (optional)",
                body: "In the `collie-work.json` committed at the paddock's HEAD (the working tree does not count). `max` goes from 1 to 8, default 4. `collie summon <name> --no-field` skips the field.",
                command: '"fields": {"default": true, "max": 4}',
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
              "`--field` is refused without the sandbox, for a shell, with `--paddock`, `--cwd` or `--shepherd`, outside a git paddock, or when `fields.max` fields are already alive (the message gives the number).",
              "Fields and a loop with lanes (`work run --parallel` over 1) do not run in the same paddock at once.",
              "`field list`, `land` and `drop` are CLI only for now; the app does not show fields yet.",
              "Each field pays for its own cold build.",
            ],
          },
          {
            kind: "note",
            text: "A field lands onto the paddock's branch, not onto your base. Landing the paddock is still `collie paddock land`.",
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
                title: "What if two lands of the same field start together?",
                body: "One integrates; the other is skipped because a land of that field is already running.",
              },
              {
                title: "I dropped a field by mistake. Is the code gone?",
                body: "No. Dismissing keeps the branch and a patch of what was not committed; `field drop` keeps a patch of the commits before it deletes the branch. `--keep-branch` keeps the branch too.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie summon <name> --field [prompt]",
        does: "Summons an agent into its own field",
      },
      {
        command: "collie summon <name> --no-field",
        does: "No field, even with fields.default on",
      },
      {
        command: 'collie ask <name> "…" --check "<cmd>"',
        does: "Asks with a check; a pass lands the field",
      },
      {
        command: "collie field list",
        does: "Lists the paddock's fields and their state",
      },
      {
        command: "collie field land <name>",
        does: "Merges a field into the paddock's branch",
      },
      {
        command: "collie field drop <name> [--keep-branch]",
        does: "Removes a field's worktree, keeping a patch",
      },
    ],
    related: ["shepherd", "loop", "factory"],
  },
  pt: {
    slug: "fields",
    eyebrow: "14 · FIELDS",
    title: "Uma worktree para cada agente, dentro do cercado.",
    lead: "Um field dá a um agente convocado a própria worktree git dentro de um cercado, para vários agentes compilarem ao mesmo tempo sem mexer nos arquivos uns dos outros. Um integrador traz o trabalho de volta. Prévia desde a 0.3.0.",
    mediaId: "fields",
    mediaAlt:
      "Um Pastor convoca dois agentes em fields de um cercado; um check que passa integra cada field de volta no branch do cercado.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "`collie summon <nome> --field` cria um agente que trabalha na própria worktree, cortada do HEAD do cercado, no branch `collie/field/<nome>`. O cercado continua sendo onde o trabalho se junta; o field é onde um agente trabalha sozinho.",
          },
          {
            kind: "p",
            text: "O trabalho volta de dois jeitos: sozinho, quando um `ask --check` passa, ou quando o Pastor roda `collie field land`.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Agentes que dividem uma worktree dividem uma pasta de build e um índice. O arquivo pela metade de um quebra o build do outro, e um commit pode levar a mudança de outra pessoa.",
          },
          {
            kind: "p",
            text: "Exemplo: quatro tarefas em paralelo, um agente para cada. Com `--field`, cada agente tem a sua árvore e o seu build, commita só no seu branch, e o Pastor integra os branches um de cada vez.",
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
              "**Onde.** O field fica em `<repo>/.collie/paddocks/field-<nome>`, no `collie/field/<nome>`. O nome é o do agente (`a-z`, `0-9`, `-`). Quem cria e remove é o git do próprio daemon; agente nunca faz worktree.",
              "**Sandbox.** O field tem sandbox estrito próprio, como uma faixa do laço: o agente grava a própria árvore, os objetos do git e só o próprio branch. O cercado, as faixas e os outros fields ficam fechados. O primeiro build é frio.",
              "**Um integrador por cercado.** Fields e laço dividem uma fila. O land faz o merge do field no branch do cercado e roda o portão de novo. Ele espera até 10 minutos o cercado ficar limpo e livre; depois responde `waiting` com o motivo e o field fica `ready`.",
              "**Conflito ou portão quebrado.** O land é desfeito e o código do field fica guardado em `<raiz>/fields/<nome>-<n>.patch` (modo 0600), com estado `conflict`.",
              '**Volta automática.** `collie ask <nome> "…" --check "<cmd>"` para o agente de um field: quando o check passa, o land do field entra na fila depois do ask.',
              "**Dispensa.** Dispensar o agente grava o que não foi commitado (rastreado e não rastreado, sem ignorados) em `<nome>-wip.patch`, tira a worktree e **mantém o branch**. Depois, `collie field drop <nome>` apaga o branch, guardando um patch antes. Nada de um field se perde por engano.",
              '**Orientação.** O agente recebe: `Field "<nome>" (branch collie/field/<nome>): commite aqui; o Pastor integra.`',
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
                title: "Abra um Pastor num cercado git",
                body: "Fields precisam de agente com sandbox e de um cercado que seja worktree git.",
              },
              {
                title: "Convoque o agente num field",
                body: "O primeiro prompt é opcional. Não vale com `--paddock`, `--cwd` nem `--shepherd`.",
                ask: "Convoque um agente de backend no próprio field",
                command:
                  'collie summon backend --field "Crie o endpoint /health"',
              },
              {
                title: "Dê o trabalho com um check",
                body: "Quando o check passa, o field é integrado sozinho.",
                command:
                  'collie ask backend "Crie o endpoint /health" --check "npm test"',
              },
              {
                title: "Veja os fields",
                body: "Mostra nome, agente, branch, base, commits e estado de cada field do seu cercado.",
                command: "collie field list",
              },
              {
                title: "Integre à mão quando não há check",
                body: "Só o Pastor que convocou o agente integra ou descarta o field dele.",
                command: "collie field land backend",
              },
              {
                title: "Deixe como padrão do projeto (opcional)",
                body: "No `collie-work.json` commitado no HEAD do cercado (a árvore de trabalho não conta). `max` vai de 1 a 8, padrão 4. `collie summon <nome> --no-field` pula o field.",
                command: '"fields": {"default": true, "max": 4}',
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
              "O `--field` é recusado sem sandbox, para shell, com `--paddock`, `--cwd` ou `--shepherd`, fora de um cercado git ou quando já há `fields.max` fields vivos (a mensagem dá o número).",
              "Fields e um laço em faixas (`work run --parallel` acima de 1) não rodam no mesmo cercado ao mesmo tempo.",
              "`field list`, `land` e `drop` são só pela CLI por enquanto; o app ainda não mostra fields.",
              "Cada field paga o próprio build a frio.",
            ],
          },
          {
            kind: "note",
            text: "O field é integrado no branch do cercado, não na sua base. Integrar o cercado continua sendo `collie paddock land`.",
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
                title: "E se dois lands do mesmo field começarem juntos?",
                body: "Um integra; o outro é pulado porque já há um land daquele field rodando.",
              },
              {
                title: "Descartei um field por engano. Perdi o código?",
                body: "Não. A dispensa mantém o branch e um patch do que não foi commitado; o `field drop` guarda um patch dos commits antes de apagar o branch. Com `--keep-branch`, o branch também fica.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie summon <nome> --field [prompt]",
        does: "Convoca um agente no próprio field",
      },
      {
        command: "collie summon <nome> --no-field",
        does: "Sem field, mesmo com fields.default ligado",
      },
      {
        command: 'collie ask <nome> "…" --check "<cmd>"',
        does: "Pede com check; se passar, integra o field",
      },
      {
        command: "collie field list",
        does: "Lista os fields do cercado e o estado de cada um",
      },
      {
        command: "collie field land <nome>",
        does: "Faz o merge de um field no branch do cercado",
      },
      {
        command: "collie field drop <nome> [--keep-branch]",
        does: "Tira a worktree de um field, guardando um patch",
      },
    ],
    related: ["shepherd", "loop", "factory"],
  },
};

import type { Post } from "./types";

export const loop: Post = {
  en: {
    slug: "loop",
    eyebrow: "04 · LOOP",
    title: "Work that runs while you sleep.",
    lead: "Give each task a check, approve the list once, and Collie runs a fresh agent per attempt until the check passes. The check decides, not the agent.",
    mediaId: "loop",
    mediaAlt:
      "A loop runs three tasks: a failed attempt is replaced by a fresh agent until each check passes.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "`collie work run` runs the open tasks of a work, with nobody watching. Each task has a check: a shell command. Exit 0 means the task passed.",
          },
          {
            kind: "p",
            text: "Every attempt is a new agent. The agent never says it is done. The check does.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "An agent that grades its own work stops early or loops forever. A loop with an outside judge fixes that: the task is done when a command you chose says so.",
          },
          {
            kind: "p",
            text: "Example: three tasks, each with its own test command. You approve the list, leave, and come back to a summary: how many tasks finished and how many were deferred.",
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
              "You list tasks. Each one has a spec (a Markdown file in your project) and a check. Both live in the work record, not in the repo, so the agent cannot edit the check that judges it.",
              "`collie work run` returns at once with `awaiting approval`. A card in the app shows the paddock, the limits and every task with its check. Only **Permitir** (Allow) starts the loop. **Negar** (Deny), or no answer in 10 minutes, tells the Shepherd that nothing ran.",
              "Each attempt starts a fresh agent in the paddock. The agent is dismissed before the check runs.",
              "A task passes when the check exits 0, the gate (if you set one) exits 0, there is a new commit on the same branch, and no tracked file is dirty.",
              "If it fails, the reason and the tail of the check output become a work note, so the next agent reads it. What the attempt did is saved as a patch and the worktree goes back to the starting commit. After `--tries` failures the task is deferred.",
              "The check and the loop's git run under the paddock's strict sandbox. The check gets only toolchain variables (PATH, HOME, LANG…), never tokens or `SSH_AUTH_SOCK`.",
              'When the loop ends, the Shepherd gets a `[collie] Laço de "…" terminou: …` notice (the app\'s messages are in Portuguese). To wait for it, use `collie work wait` and read `collie work status`.',
            ],
          },
          {
            kind: "p",
            text: 'The **Trabalho** (Work) panel shows a tag under the terminal like `em laço: <task> (tentativa 2/3) · 4/10 no total`. While the loop runs, the "…" menu has **Parar laço** (Stop loop), which is the same as `collie work stop`.',
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
                title: "Open a Shepherd inside a paddock",
                body: "The loop runs only for a Shepherd with the sandbox, on a work that lives in a paddock. In a Claude or Cursor terminal, `/collie:loop <request>` teaches the agent the whole procedure. Codex has no such command: ask for the loop in words.",
                ask: "Run the open tasks until the tests pass",
              },
              {
                title:
                  "Break the request into tasks, each with a spec and a check",
                body: "The agent writes a spec file and proposes a check for each task, shows everything in the chat, and waits for your answer before it adds anything.",
                command:
                  'collie work task add "Fix login redirect" --spec docs/specs/login-redirect.md --check "npm test"',
              },
              {
                title: "Start the loop",
                body: "`--max` is required. The tree must be clean and no other agent may be working in the paddock.",
                command: "collie work run --max 10",
              },
              {
                title: "Approve on the card",
                body: "Read the paddock, the limits and each check, then click **Permitir**.",
              },
              {
                title: "Follow it, or leave",
                body: "`collie work status` shows the current task and attempt. Add `--events` for the last events of the loop. `collie work wait` returns when something changes or the loop ends.",
                command: "collie work status --events",
              },
              {
                title: "Stop when you want",
                body: "The loop ends after the verdict of the attempt in progress. Stopping the daemon does not spend the attempt in progress.",
                command: "collie work stop",
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
              "Hard limits: `--max` is required and at most 30 attempts in total; `--tries` at most 10; `--timeout` (one turn) at most 14,400 s; `--budget` (turns plus checks) at most 43,200 s; one check at most 1,800 s. There is no limit on token cost.",
              "`work run` refuses when an open task has no check, when a loop is already running in the paddock, when another agent of the paddock is working, or when a tracked file is modified.",
              "The task list is fixed when you run: a task added later waits for the next `work run`.",
              "If the Shepherd that started the loop disappears, the loop stops. Restarting the daemon also stops it; run `collie work run` again to continue from the next open task.",
              "A check or gate that calls a script from the repo only counts if the task does not change that script. The loop fails an attempt that changes it.",
              "`--parallel <n>` (up to 4) runs tasks in separate lanes. Tasks need a `--scope` that does not overlap, and each lane pays for its own cold build. Tasks that touch the same file conflict and are retried.",
            ],
          },
          {
            kind: "note",
            text: "**Sempre neste cercado** (Always in this paddock) is a switch only the app can turn on. With it on, `work run` in that paddock starts without a card and the Shepherd gets a notice with the tasks and checks. The limits, the sandbox and the clean-tree rule still apply.",
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
                title: "What if the agent breaks the check?",
                body: "It cannot edit it: the check is in the work record, not in the repo. An attempt that changes a script the check or gate runs is failed.",
              },
              {
                title: "What happens to a failed attempt?",
                body: "Its patch is saved, the worktree goes back to the starting commit, and the failure becomes a work note for the next agent.",
              },
              {
                title: "Can I bring back a deferred task?",
                body: "Yes: `collie work task reopen <task>` puts it back in the queue with the same spec and check. Tries go back to zero unless you pass `--keep-tries`.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "/collie:loop <request>",
        does: "Teaches a Claude or Cursor Shepherd the loop procedure",
      },
      {
        command:
          'collie work task add <title> --spec <file.md> --check "<cmd>"',
        does: "Adds a task with its spec and check",
      },
      {
        command: "collie work run --max <n>",
        does: "Asks for approval, then runs the open tasks",
      },
      {
        command: "collie work status --events",
        does: "Shows the loop state and its latest events",
      },
      {
        command: "collie work wait",
        does: "Waits for a change or the end of the loop",
      },
      {
        command: "collie work stop",
        does: "Ends after the verdict of the current attempt",
      },
      {
        command: "collie work task reopen <task>",
        does: "Puts a deferred task back in the queue",
      },
    ],
    related: ["sandbox", "shepherd"],
  },
  pt: {
    slug: "loop",
    eyebrow: "04 · LAÇO",
    title: "Trabalho que roda sem você.",
    lead: "Dê um check a cada tarefa, aprove a lista uma vez e o Collie roda um agente novo por tentativa até o check passar. Quem decide é o check, não o agente.",
    mediaId: "loop",
    mediaAlt:
      "Um laço roda três tarefas: uma tentativa que falha dá lugar a um agente novo até cada check passar.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "`collie work run` roda as tarefas abertas de um trabalho, sem ninguém olhando. Cada tarefa tem um check: um comando de shell. Exit 0 quer dizer que passou.",
          },
          {
            kind: "p",
            text: "Cada tentativa é um agente novo. O agente nunca declara que acabou. Quem declara é o check.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Um agente que corrige o próprio trabalho para cedo demais ou não para. Um laço com juiz de fora resolve isso: a tarefa acaba quando um comando que você escolheu diz que acabou.",
          },
          {
            kind: "p",
            text: "Exemplo: três tarefas, cada uma com o seu comando de teste. Você aprova a lista, sai, e volta para um resumo: quantas tarefas terminaram e quantas foram adiadas.",
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
              "Você lista as tarefas. Cada uma tem um spec (um arquivo Markdown do projeto) e um check. Os dois ficam no registro do trabalho, não no repo: o agente não edita o check que o julga.",
              "`collie work run` volta na hora com `awaiting approval`. Um cartão no app mostra o cercado, os limites e cada tarefa com o seu check. Só **Permitir** inicia o laço. Negar, ou nenhuma resposta em 10 minutos, avisa o Pastor que nada rodou.",
              "Cada tentativa abre um agente novo no cercado. O agente é dispensado antes de o check rodar.",
              "A tarefa passa quando o check sai com 0, o portão (se houver) sai com 0, existe um commit novo na mesma branch e nenhum arquivo rastreado está sujo.",
              "Se falha, o motivo e o fim da saída do check viram uma nota do trabalho, que o próximo agente lê. O que a tentativa fez vira um patch e a worktree volta ao commit inicial. Depois de `--tries` falhas, a tarefa é adiada.",
              "O check e o git do laço rodam sob o sandbox estrito do cercado. O check recebe só as variáveis do toolchain (PATH, HOME, LANG…), nunca tokens nem `SSH_AUTH_SOCK`.",
              'Quando o laço termina, o Pastor recebe o aviso `[collie] Laço de "…" terminou: …`. Para esperar, use `collie work wait` e leia o `collie work status`.',
            ],
          },
          {
            kind: "p",
            text: 'O painel Trabalho mostra uma tag sob o terminal, como `em laço: <tarefa> (tentativa 2/3) · 4/10 no total`. Enquanto o laço roda, o menu "…" tem **Parar laço**, igual a `collie work stop`.',
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
                title: "Abra um Pastor dentro de um cercado",
                body: "O laço roda só para um Pastor com sandbox, num trabalho que vive num cercado. Num terminal Claude ou Cursor, `/collie:loop <pedido>` ensina o procedimento inteiro ao agente. O Codex não tem esse comando: peça o laço em palavras.",
                ask: "Rode as tarefas abertas até os testes passarem",
              },
              {
                title: "Quebre o pedido em tarefas, cada uma com spec e check",
                body: "O agente escreve um arquivo de spec e propõe um check para cada tarefa, mostra tudo no chat e espera a sua resposta antes de adicionar qualquer coisa.",
                command:
                  'collie work task add "Corrigir redirect do login" --spec docs/specs/login-redirect.md --check "npm test"',
              },
              {
                title: "Inicie o laço",
                body: "`--max` é obrigatório. A árvore precisa estar limpa e nenhum outro agente pode estar trabalhando no cercado.",
                command: "collie work run --max 10",
              },
              {
                title: "Aprove no cartão",
                body: "Leia o cercado, os limites e cada check, e clique em **Permitir**.",
              },
              {
                title: "Acompanhe, ou saia",
                body: "`collie work status` mostra a tarefa e a tentativa atuais. Com `--events`, traz os últimos eventos do laço. `collie work wait` responde quando algo muda ou o laço termina.",
                command: "collie work status --events",
              },
              {
                title: "Pare quando quiser",
                body: "O laço termina depois do veredito da tentativa em curso. Parar o daemon não gasta a tentativa em curso.",
                command: "collie work stop",
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
              "Limites duros: `--max` é obrigatório e vai até 30 tentativas no total; `--tries` até 10; `--timeout` (um turno) até 14.400 s; `--budget` (turnos mais checks) até 43.200 s; um check até 1.800 s. Não há limite de custo em tokens.",
              "`work run` recusa quando falta check em alguma tarefa aberta, quando já há um laço no cercado, quando outro agente do cercado está trabalhando ou quando há arquivo rastreado modificado.",
              "A lista de tarefas fica fixa no `run`: uma tarefa adicionada depois espera o próximo `work run`.",
              "Se o Pastor que iniciou o laço sumir, o laço para. Reiniciar o daemon também para; rode `collie work run` de novo para continuar da próxima tarefa aberta.",
              "Um check ou portão que chama um script do repositório só vale se a tarefa não altera esse script. O laço reprova a tentativa que o altera.",
              "`--parallel <n>` (até 4) roda tarefas em faixas separadas. As tarefas precisam de um `--scope` que não se sobreponha, e cada faixa paga a sua compilação a frio. Tarefas que mexem no mesmo arquivo conflitam e são refeitas.",
            ],
          },
          {
            kind: "note",
            text: '"Sempre neste cercado" é uma chave que só o app liga. Ligada, o `work run` desse cercado começa sem cartão e o Pastor recebe um aviso com as tarefas e os checks. Os limites, o sandbox e a regra da árvore limpa continuam valendo.',
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
                title: "E se o agente mexer no check?",
                body: "Ele não consegue: o check fica no registro do trabalho, não no repo. A tentativa que altera um script que o check ou o portão executa é reprovada.",
              },
              {
                title: "O que acontece com uma tentativa que falhou?",
                body: "O patch dela é guardado, a worktree volta ao commit inicial e a falha vira uma nota do trabalho para o próximo agente.",
              },
              {
                title: "Dá para trazer de volta uma tarefa adiada?",
                body: "Dá: `collie work task reopen <tarefa>` devolve a tarefa à fila com o mesmo spec e check. As tentativas voltam a zero, a não ser que você passe `--keep-tries`.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "/collie:loop <pedido>",
        does: "Ensina o procedimento do laço a um Pastor Claude ou Cursor",
      },
      {
        command:
          'collie work task add <título> --spec <arquivo.md> --check "<cmd>"',
        does: "Adiciona uma tarefa com spec e check",
      },
      {
        command: "collie work run --max <n>",
        does: "Pede aprovação e roda as tarefas abertas",
      },
      {
        command: "collie work status --events",
        does: "Mostra o estado do laço e os últimos eventos",
      },
      {
        command: "collie work wait",
        does: "Espera uma mudança ou o fim do laço",
      },
      {
        command: "collie work stop",
        does: "Termina depois do veredito da tentativa atual",
      },
      {
        command: "collie work task reopen <tarefa>",
        does: "Devolve uma tarefa adiada à fila",
      },
    ],
    related: ["sandbox", "shepherd"],
  },
};

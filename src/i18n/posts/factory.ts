import type { Post } from "./types";

export const factory: Post = {
  en: {
    slug: "factory",
    eyebrow: "12 · FACTORY",
    title: "A loop that lands its own work.",
    lead: "The factory turns the loop into a line: a project profile, reviewers that can veto, a check of the running result, and a local merge when every condition passes. It never pushes. Preview since 0.2.0.",
    mediaId: "factory",
    mediaAlt:
      "A factory paddock runs a loop: each attempt passes the check, the gate and a persona review, then the paddock lands locally by merge.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "The factory is the loop (`collie work run`) with more judges and one more step. A `factory` block in `collie-work.json` sets the review and the guardrails, `collie factory doctor` scores the setup, and `--auto-land` merges the paddock into its base when everything is green.",
          },
          {
            kind: "p",
            text: "It is a **preview**. The land is a local `--no-ff` merge. Nothing pushes, opens a PR or tags: what leaves your machine is still your call.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "A loop already runs tasks until their checks pass. You still had to read each result, merge it and start the next one. The factory moves that last mile into fixed rules, so a work can go from approved tasks to a merged paddock while you are away.",
          },
          {
            kind: "p",
            text: "Example: you approve a PRD, the Shepherd turns it into a plan, you approve the plan's hash, and the loop runs with `--auto-land`. You come back to a merged paddock and a summary, or to a stop with the exact condition that failed.",
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
              "**Profile.** The `factory` block lives in `collie-work.json`: `factory.review` (personas, threshold), `factory.guardrails` (`budgetSeconds` and `maxTries` become the defaults of `--budget` and `--tries`; `autoLandPerDay`, 1 to 20, default 3) and `factory.autoland` (`ci`, `timeoutSeconds`). `work run` reads it from the base commit, never from the agent's tree. A flag wins over the profile, the profile over the default, and `work status` says where each value came from. The `factory-init` Shepherd skill builds a first profile from Swift, Node or Python models.",
              "**Doctor.** `collie factory doctor` scores six layers (static, judge, verification, review, prose, guardrails) from 0 to 3, with evidence and a next action. It is read only and exits 1 when a layer is below `--min` (default 1).",
              "**Review by personas.** With `work run --review`, fresh reviewer terminals give each attempt an opinion. The personas are correção, segurança, testes, simplicidade and motor-concorrência. A blocker or major finding vetoes. A review never approves alone: the check and the gate decide.",
              "**Runtime acceptance.** `work task add --accept <cmd>` keeps a shell command in the work's state. It runs after the check and the gate and judges the running result (the screen opens, the service answers). Exit 0 means accepted.",
              "**Cercado fábrica** (factory paddock). A mark only the owner sets: the app's switch, `collie paddock create --factory` or `collie paddock factory <name> on|off`. Never MCP, never an agent terminal. Turning it on needs a valid profile with static and judge at 1 or more.",
              "**Auto-land.** When every task is done, the loop checks the gate on HEAD, a clean review of each task, the acceptance, the local CI (`factory.autoland.ci`, else `scripts/ci/run-tests.sh`), a clean tree and an unmoved base. Then it runs `paddock land` by merge. Each failure stops with its own `stopReason` (`landGateRed`, `landReviewVeto`, `landAcceptRed`, `landCiRed`, `landDirty`, `landBaseMoved`, `landConflict`…) and notifies the owner.",
              "**When it stops without landing**, the attempt's commits become a patch outside the agent's tree (`git am` to recover) and their tasks go back to the queue. The base is never touched.",
              "**Immutable summary.** Every `--auto-land` run writes one markdown summary in the daemon's own folder, mode 0444, secrets scrubbed: times, `stopReason`, base before and after, who approved and who vetoed, and the line to revert. `collie work summary` and the app card show it.",
            ],
          },
          {
            kind: "p",
            text: "Two tools keep the factory honest over time. `collie factory bait list|report` reads a catalog of known-bad changes and the capture rate per layer and persona. `collie factory ratchet check|update|raise` keeps a measure whose baseline only goes down; raising it needs a written reason.",
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
                title: "Write and commit the profile",
                body: "Auto-land needs a committed `collie-work.json` with a `gate` and a `factory.review` block. Ask the Shepherd to build it.",
                ask: "Set up the factory profile for this project",
              },
              {
                title: "Run the doctor",
                body: "Fix what it points at until static and judge reach 1.",
                command: "collie factory doctor",
              },
              {
                title: "Mark the paddock",
                body: "Only you can do this, in the app or in your own shell.",
                command: "collie paddock factory my-paddock on",
              },
              {
                title: "Feed it a plan (optional)",
                body: "`work prd add` keeps an immutable copy of the PRD (owner only). The `factory-plan` skill writes a plan package. `work plan lint` refuses weak tasks and prints the package's sha256; `work plan apply` creates the tasks only with that hash, and never starts the loop.",
                command:
                  "collie work plan apply docs/plan-x --approve <sha256>",
              },
              {
                title: "Add acceptance where it matters",
                body: "`--accept-timeout` defaults to 600 s, at most 1,800 s.",
                command:
                  'collie work task add "Login screen" --spec docs/specs/login.md --check "npm test" --accept "scripts/accept/login.sh"',
              },
              {
                title: "Run with auto-land and approve the card",
                body: "The card says the run ends in a local merge, with no push. `--queue` leaves an approved work waiting in the paddock; `--auto-land-max` (default 1, at most 5) lets one run land several in turn.",
                command: "collie work run --max 6 --auto-land",
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
              "`--auto-land` is refused when the paddock is not a factory paddock, the committed profile has no `gate`, or the review is off.",
              "A reviewer is a probabilistic veto: it can approve a justified bug. The gate, the CI and the acceptance command are the hard checks.",
              "`factory.guardrails.destructive` is a warning only; it blocks nothing.",
              "A `work stop` between the last attempt and the land leaves the task done with its commit in the paddock.",
              "With `--parallel` over 1, a commit made after the integration is not re-reviewed.",
              "Acceptance scripts for `collie device`, a browser or an app service are examples, not a framework.",
            ],
          },
          {
            kind: "note",
            text: "The factory never pushes, opens a PR or tags. After a land, you review and push.",
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
                title: "Can the agent change the rules that judge it?",
                body: "The profile is read from the base commit. An attempt that touches `collie-work.json`, the CI or a script the gate or CI cites fails the land with `landGateRed`.",
              },
              {
                title: "Is there a daily limit?",
                body: "Yes: `factory.guardrails.autoLandPerDay` (default 3) counts lands per paddock over 24 h. Reopening the work does not reset it.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie factory doctor [--min <n>]",
        does: "Scores the factory's six layers, read only",
      },
      {
        command: "collie paddock factory <name> on|off",
        does: "Marks or unmarks a factory paddock (owner only)",
      },
      {
        command: "collie work prd add <file> --origin <text>",
        does: "Keeps an immutable PRD in the work (owner only)",
      },
      {
        command: "collie work plan lint <dir>",
        does: "Checks a plan package and prints its sha256",
      },
      {
        command: "collie work plan apply <dir> --approve <sha256>",
        does: "Creates the tasks from an approved plan",
      },
      {
        command:
          'collie work task add <title> --check "<cmd>" --accept "<cmd>"',
        does: "Adds a task with a runtime acceptance",
      },
      {
        command: "collie work run --max <n> --review",
        does: "Runs the loop with persona review",
      },
      {
        command: "collie work run --max <n> --auto-land",
        does: "Runs the loop and lands the paddock locally",
      },
      { command: "collie work summary", does: "Shows the run's summary" },
    ],
    related: ["loop", "fields", "memory"],
  },
  pt: {
    slug: "factory",
    eyebrow: "12 · FÁBRICA",
    title: "Um laço que integra o próprio trabalho.",
    lead: "A fábrica transforma o laço numa linha: um perfil do projeto, revisores que vetam, um aceite do resultado rodando e um merge local quando todas as condições passam. Nunca faz push. Prévia desde a 0.2.0.",
    mediaId: "factory",
    mediaAlt:
      "Um cercado fábrica roda um laço: cada tentativa passa pelo check, pelo portão e pelo parecer das personas, e o cercado é integrado por merge local.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "A fábrica é o laço (`collie work run`) com mais juízes e um passo a mais. Um bloco `factory` no `collie-work.json` define a revisão e os limites, o `collie factory doctor` dá nota à montagem e o `--auto-land` faz o merge do cercado na base quando tudo está verde.",
          },
          {
            kind: "p",
            text: "É uma **prévia**. O land é um merge local `--no-ff`. Nada faz push, abre PR ou cria tag: o que sai do seu computador continua sendo decisão sua.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "O laço já roda as tarefas até os checks passarem. Mesmo assim, você precisava ler cada resultado, fazer o merge e começar o próximo. A fábrica leva esse último trecho para regras fixas: um trabalho vai de tarefas aprovadas a cercado integrado enquanto você está fora.",
          },
          {
            kind: "p",
            text: "Exemplo: você aprova um PRD, o Pastor o transforma num plano, você aprova o hash do plano e o laço roda com `--auto-land`. Você volta e encontra o cercado integrado e um resumo, ou uma parada com a condição exata que falhou.",
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
              "**Perfil.** O bloco `factory` fica no `collie-work.json`: `factory.review` (personas, limiar), `factory.guardrails` (`budgetSeconds` e `maxTries` viram o padrão de `--budget` e `--tries`; `autoLandPerDay`, de 1 a 20, padrão 3) e `factory.autoland` (`ci`, `timeoutSeconds`). O `work run` lê o perfil do commit base, nunca da árvore do agente. A flag vence o perfil, o perfil vence o padrão, e o `work status` diz de onde veio cada valor. A skill de Pastor `factory-init` monta um primeiro perfil a partir dos modelos de Swift, Node ou Python.",
              "**Doctor.** O `collie factory doctor` dá nota de 0 a 3 a seis camadas (static, judge, verification, review, prose, guardrails), com evidência e próximo passo. É só leitura e sai com 1 quando alguma camada fica abaixo de `--min` (padrão 1).",
              "**Parecer por personas.** Com `work run --review`, terminais revisores novos dão um parecer sobre cada tentativa. As personas são correção, segurança, testes, simplicidade e motor-concorrência. Um achado blocker ou major veta. O parecer nunca aprova sozinho: quem decide são o check e o portão.",
              "**Aceite em runtime.** O `work task add --accept <cmd>` guarda um comando de shell no estado do trabalho. Ele roda depois do check e do portão e julga o resultado rodando (a tela abre, o serviço responde). Exit 0 quer dizer aceito.",
              "**Cercado fábrica.** Uma marca que só o dono põe: o interruptor no app, `collie paddock create --factory` ou `collie paddock factory <nome> on|off`. Nunca por MCP, nunca por terminal de agente. Ligar exige perfil válido com static e judge em 1 ou mais.",
              "**Auto-land.** Quando todas as tarefas terminam, o laço confere o portão no HEAD, a revisão limpa de cada tarefa, o aceite, o CI local (`factory.autoland.ci`, senão `scripts/ci/run-tests.sh`), a árvore limpa e a base parada. Aí roda `paddock land` por merge. Cada falha para com o seu `stopReason` (`landGateRed`, `landReviewVeto`, `landAcceptRed`, `landCiRed`, `landDirty`, `landBaseMoved`, `landConflict`…) e avisa o dono.",
              "**Quando para sem integrar**, os commits da tentativa viram um patch fora da árvore do agente (recupere com `git am`) e as tarefas deles voltam à fila. A base nunca é tocada.",
              "**Resumo imutável.** Toda execução com `--auto-land` grava um resumo em markdown na pasta do próprio daemon, modo 0444, sem segredos: horários, `stopReason`, base antes e depois, quem aprovou e quem vetou, e a linha para reverter. O `collie work summary` e o cartão do app mostram o mesmo texto.",
            ],
          },
          {
            kind: "p",
            text: "Duas ferramentas mantêm a fábrica honesta com o tempo. `collie factory bait list|report` lê um catálogo de mudanças ruins conhecidas (as iscas) e a taxa de captura por camada e por persona. `collie factory ratchet check|update|raise` guarda uma medida cuja base só desce (a catraca); subir exige um motivo por escrito.",
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
                title: "Escreva e commite o perfil",
                body: "O auto-land precisa de um `collie-work.json` commitado com `gate` e um bloco `factory.review`. Peça ao Pastor para montar.",
                ask: "Monte o perfil de fábrica deste projeto",
              },
              {
                title: "Rode o doctor",
                body: "Corrija o que ele apontar até static e judge chegarem a 1.",
                command: "collie factory doctor",
              },
              {
                title: "Marque o cercado",
                body: "Só você faz isso, no app ou no seu próprio shell.",
                command: "collie paddock factory meu-cercado on",
              },
              {
                title: "Entre com um plano (opcional)",
                body: "O `work prd add` guarda uma cópia imutável do PRD (só o dono). A skill `factory-plan` escreve o pacote do plano. O `work plan lint` recusa tarefas fracas e imprime o sha256 do pacote; o `work plan apply` só cria as tarefas com esse hash e nunca inicia o laço.",
                command:
                  "collie work plan apply docs/plano-x --approve <sha256>",
              },
              {
                title: "Ponha aceite onde importa",
                body: "O `--accept-timeout` tem padrão de 600 s, até 1.800 s.",
                command:
                  'collie work task add "Tela de login" --spec docs/specs/login.md --check "npm test" --accept "scripts/accept/login.sh"',
              },
              {
                title: "Rode com auto-land e aprove o cartão",
                body: "O cartão diz que a execução termina num merge local, sem push. O `--queue` deixa um trabalho aprovado esperando no cercado; o `--auto-land-max` (padrão 1, até 5) deixa uma execução integrar vários em sequência.",
                command: "collie work run --max 6 --auto-land",
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
              "O `--auto-land` é recusado quando o cercado não é fábrica, o perfil commitado não tem `gate` ou a revisão está desligada.",
              "O revisor é um veto probabilístico: pode aprovar um bug bem justificado. Os checks duros são o portão, o CI e o comando de aceite.",
              "O `factory.guardrails.destructive` é só aviso; não bloqueia nada.",
              "Um `work stop` entre a última tentativa e o land deixa a tarefa feita, com o commit no cercado.",
              "Com `--parallel` acima de 1, um commit feito depois da integração não é revisado de novo.",
              "Scripts de aceite para `collie device`, navegador ou serviço de app são exemplos, não um framework.",
            ],
          },
          {
            kind: "note",
            text: "A fábrica nunca faz push, abre PR ou cria tag. Depois do land, você revisa e dá o push.",
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
                title: "O agente pode mudar as regras que o julgam?",
                body: "O perfil é lido do commit base. Uma tentativa que mexe no `collie-work.json`, no CI ou num script que o portão ou o CI citam reprova o land com `landGateRed`.",
              },
              {
                title: "Tem limite por dia?",
                body: "Tem: `factory.guardrails.autoLandPerDay` (padrão 3) conta os lands do cercado em 24 h. Reabrir o trabalho não zera a conta.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie factory doctor [--min <n>]",
        does: "Dá nota às seis camadas da fábrica, só leitura",
      },
      {
        command: "collie paddock factory <nome> on|off",
        does: "Liga ou desliga o cercado fábrica (só o dono)",
      },
      {
        command: "collie work prd add <arquivo> --origin <texto>",
        does: "Guarda um PRD imutável no trabalho (só o dono)",
      },
      {
        command: "collie work plan lint <pasta>",
        does: "Confere um pacote de plano e imprime o sha256",
      },
      {
        command: "collie work plan apply <pasta> --approve <sha256>",
        does: "Cria as tarefas de um plano aprovado",
      },
      {
        command:
          'collie work task add <título> --check "<cmd>" --accept "<cmd>"',
        does: "Adiciona uma tarefa com aceite em runtime",
      },
      {
        command: "collie work run --max <n> --review",
        does: "Roda o laço com parecer das personas",
      },
      {
        command: "collie work run --max <n> --auto-land",
        does: "Roda o laço e integra o cercado localmente",
      },
      { command: "collie work summary", does: "Mostra o resumo da execução" },
    ],
    related: ["loop", "fields", "memory"],
  },
};

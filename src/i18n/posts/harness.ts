import type { Post } from "./types";

// Source: my-orchestrator-memory, branch feat/trust-roadmap (not in a release yet): docs/referencia.md
// "Harness fora de laço", docs/feature-map.md (h1-h6, i1, hb1-hb5), Sources/CollieCore/Harness*.swift,
// Sources/CollieDaemonKit/Harness*.swift, WorkConfigCommands.swift (explain output), Commands.swift.
export const harness: Post = {
  en: {
    slug: "harness",
    eyebrow: "15 · HARNESS",
    title: "Rules your agents follow outside the loop.",
    lead: "The harness turns the checks and guardrails you commit in `collie-work.json` into hooks that Claude, Cursor and git respect in an ordinary session, with no loop running. In development: not in a release yet.",
    mediaId: "harness",
    mediaAlt:
      "An agent tries a force push and is refused by a guardrail; a plain push asks for the gate first; after collie harness check gate passes, the push goes through.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "A `harness` key in the project's `collie-work.json`: a check at the start of the session, a fast check on each edit, a check at the end of the turn, a gate on commit, and guardrails on commands and paths. Each rule has a mode: `advisory` warns the agent, `ask` asks you, `block` refuses.",
          },
          {
            kind: "p",
            text: "The rules come from the version **committed** at HEAD. An agent that edits the file does not loosen the rule in the same session.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "The loop's `gate`, `precheck`, `smoke` and `areas` only apply inside `collie work run`. In an ordinary session the agent depended on remembering to run the checks, and nothing stopped it from pushing, deleting a folder or editing the lint script that judged it.",
          },
          {
            kind: "p",
            text: "Example: you write `git push*` needs the `gate`. The agent asks to push, the hook refuses with \"rode `collie harness check gate` antes\" (run it first), the agent runs the check, and only a pass on that same tree lets the push through.",
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
              "**Layers.** `precheck` runs when the session starts and only adds context. `edit` runs a check on the touched files that match `paths` (default 5 s, up to 10 rules). `turnEnd` runs at the end of the turn; `\"areas\"` runs the areas of the changed files plus the `smoke` (default 120 s). `commit` runs the gate on commit.",
              "**Guardrails.** `deny` is a glob over the normalized command (`git push*`), matched in every segment (`&&`, `;`, `|`, `sh -c`, `env`, `sudo`, `$(…)`…); the most severe verdict wins. A command that cannot be parsed fails closed. `protect` lists paths the agent does not edit. `requireBefore` lets a command through only after a check (`gate`, `smoke` or an area).",
              "**Built-in rules.** Always on, outside the file: `--no-verify`, `git -c core.hooksPath`, `git config … core.hooksPath`, `GIT_CONFIG_*`, `GIT_DIR`, clearing the git environment and git aliases are `block`. `collie-work.json` and `.collie/**` are protected by default.",
              "**Claude.** Each Claude terminal gets `PreToolUse` (`Bash`, `Edit`, `Write`, `MultiEdit`) and `Stop` hooks that ask the daemon. The `Stop` can block the end of the turn at most 3 times in a row.",
              "**Cursor.** The Cursor plug-in adds `preToolUse`, which refuses like Claude's. Cursor has no end-of-turn hook: when the daemon sees it idle with changed files, it runs `turnEnd` and types the result as the next message (at most 3 per session), so `block` there counts as `advisory`.",
              "**Git.** The daemon writes `pre-commit` and `pre-push` hooks per terminal, outside the worktree (mode 0555), and points git at them through the terminal's environment, never `.git/config`. Your own repository hooks still run after them.",
              "**Evidence.** `collie harness check <name>` runs the committed check in the terminal's sandbox and records the result with a hash of the tree. Editing after the check asks for it again.",
              "**Baseline.** The first harness a paddock reads is pinned outside the worktree. A HEAD as strict or stricter becomes the new base by itself; a looser one is ignored with a warning until the owner adopts it (`harness.adopt`, admin only; the app has no button for it yet).",
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
                title: "Write a harness from a preset",
                body: "In your own terminal, not in a Collie one. `minimo` denies `git push*`, `*--no-verify*` and `rm -rf*` and protects `collie-work.json` and `scripts/ci/**`. `estrito` adds the gate on commit and before push (define `gate` first). `semgrep` gates the commit with `semgrep --error`. `--print` shows it without writing.",
                command: "collie harness init --preset minimo",
              },
              {
                title: "Commit the file",
                body: "Nothing applies until `collie-work.json` is committed. A looser rule committed later only applies once the owner adopts the new base.",
                command: "git add collie-work.json && git commit -m \"harness\"",
              },
              {
                title: "Test a command against the rules",
                body: "Any terminal can ask. It says which rule hit, the mode, the message and the check `requireBefore` asks for, plus what each layer can block in Claude and in Cursor. It runs nothing.",
                ask: "Would a force push be refused here?",
                command: 'collie harness explain "git push --force origin main"',
              },
              {
                title: "Run the check the rule asks for",
                body: "From the agent's terminal. Exits 1 when the check fails.",
                command: "collie harness check gate",
              },
              {
                title: "Check the git hooks",
                body: "Reports a hooks folder that is missing, unreadable or writable (git would fail open).",
                command: "collie harness doctor",
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
              "Still in development, on a branch of the app. Commands and fields can change before the release.",
              "`ask` has no card in the app yet: for now it refuses, like `block`.",
              "Git hooks hold a cooperative agent. `--no-verify` and friends are refused only by the built-in rules in Claude's `PreToolUse`; a real push is only stopped for sure by branch protection on the remote.",
              "With a loop running in the paddock, or with no `harness` key, the hooks let everything through.",
              "No agent command changes the harness. Only you do, by committing the file; `harness init` refuses inside a Collie terminal.",
            ],
          },
          {
            kind: "note",
            text: "Everything starts as `advisory`. Turn a rule into `block` once you have seen what it catches.",
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
                title: "Can the agent edit collie-work.json to get through?",
                body: "No. It is protected by default, and the hooks read the committed version, not the working tree. A looser commit is ignored until the owner adopts it.",
              },
              {
                title: "Does it slow every tool call?",
                body: "`edit` checks are meant to be fast (default timeout 5 s). Heavy checks belong in `turnEnd` or `commit`.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie harness init [--preset minimo|estrito|semgrep] [--print]",
        does: "Writes a ready-made harness into collie-work.json",
      },
      {
        command: 'collie harness explain "<command>"',
        does: "Shows which rule a command hits, without running it",
      },
      {
        command: "collie harness check <gate|smoke|area>",
        does: "Runs a committed check and records the pass",
      },
      {
        command: "collie harness doctor",
        does: "Checks the terminal's git hooks folder",
      },
      {
        command: "collie work config",
        does: "Lists the committed harness",
      },
    ],
    related: ["factory", "sandbox", "loop"],
  },
  pt: {
    slug: "harness",
    eyebrow: "15 · HARNESS",
    title: "Regras que seus agentes seguem fora do laço.",
    lead: "A harness transforma os checks e guardrails que você commita no `collie-work.json` em hooks que o Claude, o Cursor e o git respeitam numa sessão comum, sem laço rodando. Em desenvolvimento: ainda não está numa versão.",
    mediaId: "harness",
    mediaAlt:
      "Um agente tenta um push forçado e é recusado por um guardrail; um push comum pede o gate antes; depois que collie harness check gate passa, o push sai.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "Uma chave `harness` no `collie-work.json` do projeto: um check no início da sessão, um check rápido a cada edição, um check no fim do turno, um gate no commit e guardrails sobre comandos e caminhos. Cada regra tem um modo: `advisory` avisa o agente, `ask` pergunta a você, `block` recusa.",
          },
          {
            kind: "p",
            text: "As regras vêm da versão **commitada** em HEAD. Um agente que edita o arquivo não afrouxa a regra na mesma sessão.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "O `gate`, o `precheck`, o `smoke` e as `areas` do laço só valem dentro do `collie work run`. Numa sessão comum o agente dependia de lembrar de rodar os checks, e nada o impedia de dar push, apagar uma pasta ou editar o script de lint que o julgava.",
          },
          {
            kind: "p",
            text: "Exemplo: você escreve que `git push*` exige o `gate`. O agente pede o push, o hook recusa com \"rode `collie harness check gate` antes\", o agente roda o check, e só um check aprovado naquela mesma árvore deixa o push passar.",
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
              "**Camadas.** O `precheck` roda no início da sessão e só dá contexto. O `edit` roda um check nos arquivos tocados que batem com `paths` (padrão 5 s, até 10 regras). O `turnEnd` roda no fim do turno; `\"areas\"` roda as áreas dos arquivos alterados mais o `smoke` (padrão 120 s). O `commit` roda o gate no commit.",
              "**Guardrails.** `deny` é um glob sobre o comando normalizado (`git push*`), casado em cada segmento (`&&`, `;`, `|`, `sh -c`, `env`, `sudo`, `$(…)`…); vale o veredito mais severo. Comando que não dá para analisar cai no fail-closed. `protect` lista caminhos que o agente não edita. `requireBefore` só deixa um comando passar depois de um check (`gate`, `smoke` ou uma área).",
              "**Regras embutidas.** Sempre ligadas, fora do arquivo: `--no-verify`, `git -c core.hooksPath`, `git config … core.hooksPath`, `GIT_CONFIG_*`, `GIT_DIR`, apagar o ambiente do git e aliases de git são `block`. `collie-work.json` e `.collie/**` são protegidos por padrão.",
              "**Claude.** Cada terminal Claude ganha os hooks `PreToolUse` (`Bash`, `Edit`, `Write`, `MultiEdit`) e `Stop`, que perguntam ao daemon. O `Stop` segura o fim do turno no máximo 3 vezes seguidas.",
              "**Cursor.** O plug-in do Cursor acrescenta o `preToolUse`, que recusa como o do Claude. O Cursor não tem hook de fim de turno: quando o daemon o vê ocioso com arquivos alterados, roda o `turnEnd` e digita o resultado como a próxima mensagem (no máximo 3 por sessão), então `block` ali vale como `advisory`.",
              "**Git.** O daemon escreve hooks `pre-commit` e `pre-push` por terminal, fora da worktree (modo 0555), e aponta o git para eles pelo ambiente do terminal, nunca pelo `.git/config`. Os hooks do seu repositório continuam rodando depois.",
              "**Evidência.** `collie harness check <nome>` roda o check commitado no sandbox do terminal e grava o resultado com um hash da árvore. Editar depois do check pede de novo.",
              "**Linha de base.** A primeira harness que um cercado lê fica fixada fora da worktree. Um HEAD igual ou mais estrito vira a base sozinho; um mais frouxo é ignorado com aviso até o dono adotá-lo (`harness.adopt`, só admin; o app ainda não tem botão para isso).",
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
                title: "Escreva uma harness a partir de um preset",
                body: "No seu terminal, não num do Collie. `minimo` nega `git push*`, `*--no-verify*` e `rm -rf*` e protege `collie-work.json` e `scripts/ci/**`. `estrito` acrescenta o gate no commit e antes do push (defina o `gate` antes). `semgrep` põe `semgrep --error` no commit. `--print` mostra sem gravar.",
                command: "collie harness init --preset minimo",
              },
              {
                title: "Commite o arquivo",
                body: "Nada vale até o `collie-work.json` ser commitado. Uma regra mais frouxa commitada depois só vale quando o dono adota a nova base.",
                command: "git add collie-work.json && git commit -m \"harness\"",
              },
              {
                title: "Teste um comando contra as regras",
                body: "Qualquer terminal pode perguntar. Diz qual regra bateu, o modo, a mensagem e o check que o `requireBefore` exige, mais o que cada camada consegue bloquear no Claude e no Cursor. Não executa nada.",
                ask: "Um push forçado seria recusado aqui?",
                command: 'collie harness explain "git push --force origin main"',
              },
              {
                title: "Rode o check que a regra pede",
                body: "No terminal do agente. Sai com 1 quando o check falha.",
                command: "collie harness check gate",
              },
              {
                title: "Confira os hooks de git",
                body: "Acusa a pasta de hooks ausente, ilegível ou gravável (o git falharia aberto).",
                command: "collie harness doctor",
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
              "Ainda em desenvolvimento, num branch do app. Comandos e campos podem mudar antes da versão.",
              "O `ask` ainda não tem cartão no app: por enquanto recusa, como o `block`.",
              "Os hooks de git seguram um agente cooperativo. `--no-verify` e afins só são recusados pelas regras embutidas no `PreToolUse` do Claude; um push de verdade só é barrado com certeza pela proteção de branch no remoto.",
              "Com um laço rodando no cercado, ou sem a chave `harness`, os hooks deixam tudo passar.",
              "Nenhum comando de agente muda a harness. Só você, commitando o arquivo; o `harness init` recusa dentro de um terminal do Collie.",
            ],
          },
          {
            kind: "note",
            text: "Tudo começa `advisory`. Passe uma regra para `block` depois de ver o que ela pega.",
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
                title: "O agente pode editar o collie-work.json para passar?",
                body: "Não. Ele é protegido por padrão, e os hooks leem a versão commitada, não a árvore de trabalho. Um commit mais frouxo é ignorado até o dono adotá-lo.",
              },
              {
                title: "Isso deixa cada chamada de ferramenta lenta?",
                body: "Os checks de `edit` são pensados para ser rápidos (timeout padrão de 5 s). Check pesado vai no `turnEnd` ou no `commit`.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie harness init [--preset minimo|estrito|semgrep] [--print]",
        does: "Grava uma harness pronta no collie-work.json",
      },
      {
        command: 'collie harness explain "<comando>"',
        does: "Mostra qual regra um comando pega, sem executá-lo",
      },
      {
        command: "collie harness check <gate|smoke|área>",
        does: "Roda um check commitado e grava a aprovação",
      },
      {
        command: "collie harness doctor",
        does: "Confere a pasta de hooks de git do terminal",
      },
      {
        command: "collie work config",
        does: "Lista a harness commitada",
      },
    ],
    related: ["factory", "sandbox", "loop"],
  },
};

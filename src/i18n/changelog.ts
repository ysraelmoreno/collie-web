import type { Locale } from ".";

// Copy for /changelog and /pt/changelog. In item text, `backticks` mark inline code.
// Clips: public/features/<clip>.{mp4,jpg} (+ -light). A missing file shows the card as text only.

export type AreaId =
  | "app"
  | "loop"
  | "memory"
  | "network"
  | "apps"
  | "sandbox"
  | "agents"
  | "design"
  | "updates"
  | "plugins";

export type Kind = "new" | "imp" | "fix";

export type Highlight = {
  area: AreaId;
  title: string;
  body: string;
  /** What the user asks, then the command the agent runs. */
  cmd?: { prompt: string; command: string };
};

export type Item = { k: Kind; area: AreaId; t: string };

export type Release = {
  v: string;
  /** ISO date, formatted per locale on the page. */
  date: string;
  headline: string;
  highlights: Highlight[];
  items: Item[];
};

type Area = { name: string; desc: string };

export type NextGroup = {
  id: "main" | "planned";
  name: string;
  desc: string;
  items: Highlight[];
};

export type ChangelogCopy = {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  lead: string;
  filterLabel: string;
  all: string;
  latest: string;
  kinds: Record<Kind, string>;
  clipAlt: (title: string) => string;
  areas: Record<AreaId, Area>;
  releases: Release[];
  tabs: { label: string; versions: string; next: string };
  next: {
    meta: { title: string; description: string };
    eyebrow: string;
    title: string;
    lead: string;
    groups: NextGroup[];
  };
};

/** Area → clip name. Areas without one (agents) have no clip. */
export const AREA_CLIP: Partial<Record<AreaId, string>> = {
  app: "trilho",
  loop: "loop",
  memory: "memory",
  network: "network",
  apps: "apps",
  sandbox: "sandbox",
  design: "design",
  updates: "updates",
};

const en: ChangelogCopy = {
  meta: {
    title: "Changelog — Collie",
    description:
      "What changed in each Collie release: what is new, improved and fixed, from v0.1.0 on.",
  },
  eyebrow: "CHANGELOG",
  title: "What changed in Collie.",
  lead: "Each version: what is new, improved and fixed. Newest first.",
  filterLabel: "Filter by area",
  all: "All",
  latest: "Latest",
  kinds: { new: "New", imp: "Improved", fix: "Fixed" },
  clipAlt: (title) => `Clip: ${title}`,
  areas: {
    app: {
      name: "Window and Rail",
      desc: "The main window: canvas, Rail, terminal cards and Preferences.",
    },
    loop: {
      name: "Loop",
      desc: "Tasks with a check that run on their own, a fresh agent per attempt.",
    },
    memory: {
      name: "Memory",
      desc: "What agents remember between sessions, and the curator that looks after it.",
    },
    network: {
      name: "Network",
      desc: "The Network panel: intercept, map and delay traffic.",
    },
    apps: {
      name: "Paddock apps",
      desc: "Local tools adopted as paddock apps.",
    },
    sandbox: { name: "Sandbox", desc: "What each agent can read and write." },
    agents: {
      name: "Agents",
      desc: "The Shepherd, terminals and the conversation between them.",
    },
    design: {
      name: "Design",
      desc: "The design panel and the figcraft engine.",
    },
    updates: { name: "Updates", desc: "How Collie updates itself." },
    plugins: {
      name: "Plug-ins",
      desc: "Plug-ins that hook into the agent's work.",
    },
  },
  tabs: {
    label: "Changelog sections",
    versions: "Versions",
    next: "What's coming",
  },
  next: {
    meta: {
      title: "What's coming — Collie",
      description: "What is planned for the next Collie versions.",
    },
    eyebrow: "CHANGELOG",
    title: "What's coming to Collie.",
    lead: "What is planned for Collie. No dates: it ships when it is ready.",
    groups: [
      {
        id: "planned",
        name: "Planned",
        desc: "Designed, not built yet. May change.",
        items: [
          {
            area: "plugins",
            title: "Plug-in marketplace",
            body: "Find, install, update and withdraw plug-ins from a signed catalog, without picking a folder. Only you install or remove them. Later, third-party plug-ins reviewed by the owner.",
          },
          {
            area: "app",
            title: "Import a terminal theme",
            body: "Bring in a Ghostty or iTerm theme, with the terminal's ANSI colors.",
          },
        ],
      },
    ],
  },
  releases: [
    {
      v: "0.2.0",
      date: "2026-11-25",
      headline:
        "The software factory, in preview: review, acceptance and automatic land.",
      highlights: [
        {
          area: "loop",
          title: "Factory paddock and automatic land (preview)",
          body: "Mark a paddock as a factory (only you can) and `collie work run --auto-land` integrates the work locally once the gate, the review, the acceptance and the local CI pass. It never pushes or opens a PR. Each failure stops with its own reason and calls you. Preview: validated end to end in a throwaway repository, across 10 scenarios (green land, red gate, red acceptance, a queue, the daily cap, a moved base, a stop during the land).",
          cmd: {
            prompt: "Run the approved work and land it if everything passes",
            command: "collie work run --auto-land",
          },
        },
        {
          area: "loop",
          title: "Review by personas",
          body: "Each attempt gets an opinion from fresh reviewer terminals playing personas (correctness, tests, security, simplicity, concurrency). A confirmed `blocker` or `major` finding vetoes; the review never approves on its own.",
          cmd: {
            prompt: "Run the tasks with a review of each attempt",
            command: "collie work run --review",
          },
        },
        {
          area: "agents",
          title: "Agents that see the phone",
          body: "`collie device screen` describes the screen in groups, `tap --text … --then screen` acts and looks in one call, `find --scroll` and `wait --stable` replace scripts and sleeps. On Android a small helper reads the screen in milliseconds, and OCR covers screens with an empty tree.",
          cmd: {
            prompt: "Tap Settings and show the screen",
            command: 'collie device tap --text "Settings" --then screen',
          },
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: "Factory paddock: `collie paddock create --factory` or `paddock factory <name> on|off`, a switch in the app and a badge in the Rail; never set by an agent.",
        },
        {
          k: "new",
          area: "loop",
          t: "`--auto-land` (preview): lands locally after gate, review, acceptance, local CI, a clean tree and an unmoved base; each failure has its own `stopReason`; never a push.",
        },
        {
          k: "new",
          area: "loop",
          t: "`--queue`, `--auto-land-max` and a daily cap of lands; the factory doctor must still pass before each next work.",
        },
        {
          k: "new",
          area: "loop",
          t: "Runtime acceptance: `collie work task add --accept <cmd>` judges the running result after the check and the gate.",
        },
        {
          k: "new",
          area: "loop",
          t: "PRD entry: `collie work prd add`, `work plan lint` (refuses tasks with no runnable check) and `work plan apply --approve <sha256>`.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work run --review` with personas, `--personas`, `--reviewer-model`; a mute reviewer records its cause and is retried once.",
        },
        {
          k: "new",
          area: "loop",
          t: "`factory` block in `collie-work.json`, applied from the base commit; `work status` says where each value came from.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie factory doctor` (a score from 0 to 3 per layer), `factory ratchet` and `factory bait`; the `factory-init` skill with Swift, Node and Python models.",
        },
        {
          k: "new",
          area: "loop",
          t: "Every `--auto-land` run leaves an immutable summary: who approved, who vetoed, base before and after, and what was not done.",
        },
        {
          k: "new",
          area: "loop",
          t: "`--escalate agent:model,…` picks the attempt's agent and model by its number; `work stop --now` drops the attempt in course.",
        },
        {
          k: "new",
          area: "agents",
          t: 'A Shepherd can summon a sub-Shepherd (`summon --shepherd`); the agent tree nests it with the "Pastor" seal and "Encerrar ramo…" (Close branch).',
        },
        {
          k: "new",
          area: "agents",
          t: "`collie ask --check <cmd> --tries N`: the ask only ends when the check passes; a check that already passes before the task is refused.",
        },
        {
          k: "new",
          area: "agents",
          t: "Device: `screen`, `find --scroll`, `wait --stable`, `--then ui|screen`, `tap --text`, OCR on Android and iOS, and a device frame in the panel.",
        },
        {
          k: "new",
          area: "agents",
          t: "Android accessibility helper (`collie device helper`): screen reads in milliseconds, with a fallback to `uiautomator`.",
        },
        {
          k: "new",
          area: "plugins",
          t: "Cursor tool events reach the plug-in contract, so Vizinho and its fences also work in Cursor terminals.",
        },
        {
          k: "imp",
          area: "agents",
          t: "Cursor: `summon --model` and `--trust`; a custom command that runs `cursor-agent` is treated as Cursor everywhere.",
        },
        {
          k: "imp",
          area: "agents",
          t: "No reply notice after the asker already read the answer with `ask result`; Cursor ask and wait through MCP no longer time out at 60 s.",
        },
        {
          k: "imp",
          area: "loop",
          t: "Review text, notes and notices are scrubbed of secrets before they reach you.",
        },
        {
          k: "fix",
          area: "agents",
          t: "A Cursor prompt is confirmed as sent, and an unsent prompt is no longer read as idle.",
        },
        {
          k: "fix",
          area: "memory",
          t: "The curator no longer promotes pitfalls taken from scratch files to the project memory.",
        },
        {
          k: "fix",
          area: "loop",
          t: "An auto-land that stops without integrating saves the attempt's commits as a patch and reopens their tasks, so they never ride into another work's land.",
        },
        {
          k: "fix",
          area: "loop",
          t: "A spent daily cap is refused at `work run`, before any agent or review is paid for.",
        },
      ],
    },
    {
      v: "0.1.9",
      date: "2026-11-21",
      headline: "A loop config per project, and faster checks.",
      highlights: [
        {
          area: "loop",
          title: "Loop config in the project",
          body: "A `collie-work.json` at the project root declares the loop's gate, a fast precheck, named areas and a smoke command. The loop reads the committed version, never the working tree, and fails an attempt that edits the file.",
          cmd: {
            prompt: "Show what the project's loop config resolves to",
            command: "collie work config",
          },
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: "`collie-work.json`: gate, `precheck`, `areas`, `smoke` and a `full` gate per project; `collie work config` shows what it resolves to and runs nothing.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work run --precheck <cmd>` runs a fast check in the agent's own session, so a compile error costs a nudge instead of an attempt.",
        },
        {
          k: "new",
          area: "agents",
          t: "The large-context advice reads the Shepherd's real context size, and at the end of a loop the daemon writes a handoff for the next turn (`collie work handoff`).",
        },
        {
          k: "new",
          area: "loop",
          t: "The immutable summary keeps each attempt's token counts; `collie work usage` also reads closed works.",
        },
        {
          k: "imp",
          area: "loop",
          t: "Attempts reuse one build folder per loop instead of compiling cold each time.",
        },
        {
          k: "imp",
          area: "memory",
          t: "Near-duplicate memories no longer enter the same injection; only the best of each group does.",
        },
        {
          k: "fix",
          area: "apps",
          t: "An app panel opened while the service was still starting stayed blank; now it says it is starting and loads on its own.",
        },
        {
          k: "fix",
          area: "app",
          t: "The terminal title bar buttons (full screen included) did nothing on the canvas at zoom other than 100%.",
        },
        {
          k: "fix",
          area: "sandbox",
          t: "Parallel loop lanes no longer raise sandbox access cards that restarted the lane's agent.",
        },
      ],
    },
    {
      v: "0.1.8",
      date: "2026-11-21",
      headline: "Parallel loops, agent hooks for plug-ins and custom themes.",
      highlights: [
        {
          area: "loop",
          title: "Parallel loop",
          body: "Up to 4 tasks at once, each in its own worktree. Tasks declare what they touch and what they need; they merge one at a time and the gate runs again after each merge. Every loop that stops says why.",
          cmd: {
            prompt: "Run the tasks, two at a time",
            command: "collie work run --parallel 2",
          },
        },
        {
          area: "plugins",
          title: "Agent hooks and Vizinho",
          body: "A plug-in declares hooks (`edit`, `stop`) and a helper that answers the agent, as guidance or a block, in its own sandbox with no network. The sample Vizinho plug-in says what sibling files do and turns conventions you approve into fences.",
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: "`collie work run --parallel <n>` (at most 4): each task in a lane, merged one at a time, gate again after each merge; `work task add --scope --needs`.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work wait` answers when the work changes; `work status --events` shows the loop journal; every stop records its reason.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work history` reads an immutable summary of each closed work; `work usage` shows tokens per attempt.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work task reopen` puts a deferred task back in the queue; loop agents are named after their task.",
        },
        {
          k: "new",
          area: "app",
          t: "Loops section in the Rail with the running loop, and a See all modal with tasks and the last 20 closed works.",
        },
        {
          k: "new",
          area: "app",
          t: "Custom themes: a gallery and an editor (List and JSON) in Preferences › Appearance; a theme is a JSON file that reloads on save.",
        },
        {
          k: "new",
          area: "app",
          t: "Multi-select on the canvas and side panel (⌘-click, ⇧-click, rectangle); the middle button pans the canvas.",
        },
        {
          k: "new",
          area: "app",
          t: "What Collie does: an info icon opens 17 cards, one per feature, with how to call it.",
        },
        {
          k: "new",
          area: "app",
          t: "Dropping files or an image on a terminal pastes their paths, so the agent attaches them.",
        },
        {
          k: "new",
          area: "plugins",
          t: "Agent hooks (`edit`, `stop`) for plug-ins, Claude terminals only; the sample Vizinho plug-in with fences.",
        },
        {
          k: "imp",
          area: "loop",
          t: "The loop stops at the model's usage limit without spending an attempt; default model for loop agents in Preferences › Loops.",
        },
        {
          k: "imp",
          area: "loop",
          t: "A turn that ends early with no commit gets a nudge; after a daemon crash, the commit already made is kept.",
        },
        {
          k: "imp",
          area: "agents",
          t: "The Shepherd hears only when a task is deferred or a loop ends (`--notify end`), and is told once when its session grows large.",
        },
        {
          k: "imp",
          area: "memory",
          t: "The Stop hook asks for memories at most every 20 minutes, and never during a loop.",
        },
        {
          k: "imp",
          area: "updates",
          t: "The installer DMG has a background and positioned icons.",
        },
        {
          k: "fix",
          area: "loop",
          t: "Gate leftovers go to a quarantine in `.git` instead of being deleted; a task no longer stays in progress after an out-of-phase event.",
        },
        {
          k: "fix",
          area: "agents",
          t: "An orphaned `collie work wait` no longer hides a Shepherd that is editing.",
        },
      ],
    },
    {
      v: "0.1.7",
      date: "2026-11-20",
      headline: "Rail: paddocks in a column, agents in a tree.",
      highlights: [
        {
          area: "app",
          title: "Rail",
          body: "A new window layout: paddocks in a column, a context panel with the agent tree, and Canvas/Preferences tabs. Preferences open as a tab in the window itself.",
        },
      ],
      items: [
        {
          k: "new",
          area: "app",
          t: "Rail: a column of paddocks, a context panel with the agent tree, Canvas/Preferences tabs.",
        },
        {
          k: "new",
          area: "memory",
          t: "Cursor terminals: memory reads the transcript and captures as it grows.",
        },
        {
          k: "imp",
          area: "memory",
          t: "The curator has no daily limit by default; the limit is now your choice.",
        },
        {
          k: "fix",
          area: "app",
          t: "The Pasture disappears from the Rail while it is empty.",
        },
        {
          k: "fix",
          area: "memory",
          t: "Curator with claude: the sandbox profile now fits what a real run needs (USER, dyld, temp folder).",
        },
      ],
    },
    {
      v: "0.1.6",
      date: "2026-11-19",
      headline: "Loop with a gate, evidence and trust per paddock.",
      highlights: [
        {
          area: "loop",
          title: "Gate and evidence in the loop",
          body: "A gate command judges each task after its check, and the evidence for an approved task shows up in the status, the panel and the notice.",
          cmd: {
            prompt: "Run the tasks, but only approve if the build passes",
            command: 'collie work run --gate "npm run build"',
          },
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: 'Loop gate: `collie work run --gate "<cmd>"`.',
        },
        {
          k: "new",
          area: "loop",
          t: "Evidence for an approved task in the status, the panel and the loop notice.",
        },
        {
          k: "new",
          area: "loop",
          t: '"Always in this paddock" on the loop card; a Loops page in Preferences.',
        },
        {
          k: "new",
          area: "memory",
          t: "A trap or decision can be enforced by a check (enforcedBy); recurring traps without a check become rule candidates.",
        },
        {
          k: "imp",
          area: "loop",
          t: "The status says what the loop is doing (agent, check, gate); the summary shows the numbers and reverted commits.",
        },
        {
          k: "imp",
          area: "agents",
          t: "The Shepherd hears about each loop task when it finishes.",
        },
        {
          k: "fix",
          area: "agents",
          t: "The daemon no longer crashes when a terminal exits in the middle of a model switch.",
        },
        {
          k: "fix",
          area: "loop",
          t: "The loop no longer waits for the Shepherd to go idle before moving on.",
        },
      ],
    },
    {
      v: "0.1.5",
      date: "2026-11-18",
      headline: "Choose who curates your memory.",
      highlights: [
        {
          area: "memory",
          title: "A memory curator of your choice",
          body: "The curator reviews what agents saved. Now you choose who does it (Claude or Cursor), give consent and test it first, in Preferences.",
        },
      ],
      items: [
        {
          k: "new",
          area: "memory",
          t: "Choose, consent to and test the curator provider in Preferences.",
        },
        {
          k: "new",
          area: "memory",
          t: "Cursor provider for the curator, isolated and with no tools.",
        },
        {
          k: "fix",
          area: "memory",
          t: "The curator finds claude in known folders even without PATH, and says when the problem is the environment.",
        },
        {
          k: "fix",
          area: "memory",
          t: "The model id is validated; Cursor always runs in the sandbox.",
        },
      ],
    },
    {
      v: "0.1.4",
      date: "2026-11-18",
      headline: "An autonomous loop and a curator for memory.",
      highlights: [
        {
          area: "loop",
          title: "Autonomous loop",
          body: "Give each task a spec and a check, approve the list on a card with limits and let it run. A fresh agent per attempt; the check decides when it is done.",
          cmd: {
            prompt: "Run the open tasks until the tests pass",
            command: "collie work run --max 10",
          },
        },
        {
          area: "network",
          title: "Network trusts what macOS trusts",
          body: "The Network panel checks the destination server against the macOS trust bundle and respects your mitmproxy configuration.",
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: "`collie work run` and `work stop`; tasks with a spec and a check; approval on a card.",
        },
        {
          k: "new",
          area: "loop",
          t: "`/collie:loop` in Claude and Cursor terminals; the Work panel shows the state and lets you stop.",
        },
        {
          k: "new",
          area: "memory",
          t: "Memory curator with its own sandbox (deny by default) and a provenance record.",
        },
        {
          k: "new",
          area: "memory",
          t: "Precision next to coverage, use with evidence, provisional validity per type.",
        },
        {
          k: "new",
          area: "memory",
          t: "Maps whose file changed since the anchor commit are contested.",
        },
        {
          k: "new",
          area: "app",
          t: "Preferences › Memory: Cursor memory preference and Trust; a memory badge on Cursor cards.",
        },
        {
          k: "new",
          area: "network",
          t: "The macOS trust bundle on every mitmdump start.",
        },
        {
          k: "fix",
          area: "memory",
          t: "Injected memory is labeled as data, escaped and cleaned; curator verdicts fail closed.",
        },
        {
          k: "fix",
          area: "network",
          t: "Gives the cause when `adb root` is refused.",
        },
      ],
    },
    {
      v: "0.1.3",
      date: "2026-11-17",
      headline: "Sandbox explains why detection is off.",
      highlights: [
        {
          area: "sandbox",
          title: "Detection that explains itself",
          body: "When sandbox detection is off, the tag says why and how to fix it. Without admin rights it becomes a single notice instead of a red tag.",
        },
      ],
      items: [
        {
          k: "imp",
          area: "sandbox",
          t: "The watcher says why detection is off; the tag names the reason and the fix.",
        },
        {
          k: "imp",
          area: "sandbox",
          t: "Without admin: a single toast, not a fixed red tag.",
        },
      ],
    },
    {
      v: "0.1.2",
      date: "2026-11-17",
      headline: "Collie updates itself.",
      highlights: [
        {
          area: "updates",
          title: "Updates inside the app",
          body: "Collie checks, downloads and verifies the new version, swaps the app and reopens. The previous version is kept.",
        },
      ],
      items: [
        {
          k: "new",
          area: "updates",
          t: "Updates page and install sheet in Preferences.",
        },
        {
          k: "new",
          area: "updates",
          t: "The daemon checks, downloads and verifies the dmg, swaps the app, keeps the previous version and reopens.",
        },
        {
          k: "new",
          area: "agents",
          t: "A restart hint when a command does not exist in the old daemon.",
        },
        {
          k: "imp",
          area: "agents",
          t: "The Shepherd delegates with `collie summon`, not with its own subagents.",
        },
      ],
    },
    {
      v: "0.1.1",
      date: "2026-11-17",
      headline: "Design engine out of the dmg.",
      highlights: [
        {
          area: "design",
          title: "Design engine on demand",
          body: "The design engine no longer ships in the dmg. The design panel offers the download, and Collie downloads, verifies and installs it in Preferences › Design and sandbox.",
        },
      ],
      items: [
        {
          k: "new",
          area: "design",
          t: "Download, verify and install the design engine in Preferences › Design and sandbox.",
        },
        {
          k: "new",
          area: "design",
          t: "The design panel offers the download when the engine is missing.",
        },
      ],
    },
    {
      v: "0.1.0",
      date: "2026-11-16",
      headline: "First downloadable version.",
      highlights: [
        {
          area: "apps",
          title: "Adopt your tools",
          body: "A local tool becomes a paddock app, with a picker (--pick), a notice (--notify) and queries (last, since=last, match).",
          cmd: {
            prompt: "Use my mock server as an app",
            command: "collie app adopt --pick",
          },
        },
      ],
      items: [
        {
          k: "new",
          area: "apps",
          t: "`collie app adopt` with `--pick`, `--notify` and query mode.",
        },
        {
          k: "new",
          area: "agents",
          t: "`collie reply`, a verified sender and waiting in the deadlock graph.",
        },
        {
          k: "new",
          area: "network",
          t: "Network panel: local map, response delay and drop, with `collie network rule-*`.",
        },
      ],
    },
  ],
};

const pt: ChangelogCopy = {
  meta: {
    title: "Changelog — Collie",
    description:
      "O que mudou em cada versão do Collie: o que entrou, melhorou e foi corrigido, da v0.1.0 em diante.",
  },
  eyebrow: "CHANGELOG",
  title: "O que mudou no Collie.",
  lead: "Cada versão, o que entrou, melhorou e foi corrigido. Do mais novo para o mais antigo.",
  filterLabel: "Filtrar por área",
  all: "Tudo",
  latest: "Mais recente",
  kinds: { new: "Novo", imp: "Melhorado", fix: "Corrigido" },
  clipAlt: (title) => `Clipe: ${title}`,
  areas: {
    app: {
      name: "Janela e Trilho",
      desc: "A janela principal: canvas, Trilho, cartões de terminal e Preferências.",
    },
    loop: {
      name: "Laço",
      desc: "Tarefas com check rodando sozinhas, um agente novo por tentativa.",
    },
    memory: {
      name: "Memória",
      desc: "O que os agentes lembram entre sessões e o curador que cuida disso.",
    },
    network: {
      name: "Rede",
      desc: "Painel Rede: interceptar, mapear e atrasar tráfego.",
    },
    apps: {
      name: "Apps do cercado",
      desc: "Ferramentas locais adotadas como apps do cercado.",
    },
    sandbox: {
      name: "Sandbox",
      desc: "O que cada agente pode ler e escrever.",
    },
    agents: {
      name: "Agentes",
      desc: "Pastor, terminais e a conversa entre eles.",
    },
    design: { name: "Design", desc: "Painel de design e o motor figcraft." },
    updates: { name: "Atualizações", desc: "Como o Collie se atualiza." },
    plugins: {
      name: "Plug-ins",
      desc: "Plug-ins que entram no trabalho do agente.",
    },
  },
  tabs: { label: "Seções do changelog", versions: "Versões", next: "Em breve" },
  next: {
    meta: {
      title: "Em breve — Collie",
      description: "O que está planejado para as próximas versões do Collie.",
    },
    eyebrow: "CHANGELOG",
    title: "O que vem no Collie.",
    lead: "O que está planejado para o Collie. Sem datas: entra quando estiver pronto.",
    groups: [
      {
        id: "planned",
        name: "Planejado",
        desc: "Desenhado, ainda não construído. Pode mudar.",
        items: [
          {
            area: "plugins",
            title: "Marketplace de plug-ins",
            body: "Achar, instalar, atualizar e recolher plug-ins por um catálogo assinado, sem escolher pasta. Só você instala ou remove. Depois, plug-ins de terceiros revisados pelo dono.",
          },
          {
            area: "app",
            title: "Importar tema de terminal",
            body: "Trazer um tema do Ghostty ou do iTerm, com as cores ANSI do terminal.",
          },
        ],
      },
    ],
  },
  releases: [
    {
      v: "0.2.0",
      date: "2026-11-25",
      headline:
        "A fábrica de software, em prévia: revisão, aceite e land automático.",
      highlights: [
        {
          area: "loop",
          title: "Cercado fábrica e land automático (prévia)",
          body: "Marque um cercado como fábrica (só você consegue) e `collie work run --auto-land` integra o trabalho localmente quando gate, revisão, aceite e CI local passam. Nunca faz push nem abre PR. Cada falha para com o próprio motivo e chama você. Prévia: validado de ponta a ponta num repositório descartável, em 10 cenários (land verde, gate vermelho, aceite vermelho, fila, limite diário, base que andou, parada durante o land).",
          cmd: {
            prompt: "Rode o trabalho aprovado e faça o land se tudo passar",
            command: "collie work run --auto-land",
          },
        },
        {
          area: "loop",
          title: "Revisão por personas",
          body: "Cada tentativa recebe um parecer de terminais revisores novos, no papel de personas (correção, testes, segurança, simplicidade, concorrência). Um achado `blocker` ou `major` confirmado veta; a revisão nunca aprova sozinha.",
          cmd: {
            prompt: "Rode as tarefas com revisão de cada tentativa",
            command: "collie work run --review",
          },
        },
        {
          area: "agents",
          title: "Agentes que enxergam o celular",
          body: "`collie device screen` descreve a tela em grupos, `tap --text … --then screen` age e olha numa chamada só, `find --scroll` e `wait --stable` substituem scripts e sleeps. No Android, um pequeno helper lê a tela em milissegundos, e o OCR cobre telas com a árvore vazia.",
          cmd: {
            prompt: "Toque em Configurações e mostre a tela",
            command: 'collie device tap --text "Configurações" --then screen',
          },
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: "Cercado fábrica: `collie paddock create --factory` ou `paddock factory <name> on|off`, um interruptor no app e um selo no Trilho; nunca ligado por um agente.",
        },
        {
          k: "new",
          area: "loop",
          t: "`--auto-land` (prévia): land local depois de gate, revisão, aceite, CI local, árvore limpa e base parada; cada falha tem seu `stopReason`; nunca faz push.",
        },
        {
          k: "new",
          area: "loop",
          t: "`--queue`, `--auto-land-max` e um limite diário de lands; o doutor da fábrica precisa continuar passando antes de cada próximo trabalho.",
        },
        {
          k: "new",
          area: "loop",
          t: "Aceite em runtime: `collie work task add --accept <cmd>` julga o resultado rodando, depois do check e do gate.",
        },
        {
          k: "new",
          area: "loop",
          t: "Entrada por PRD: `collie work prd add`, `work plan lint` (recusa tarefa sem check executável) e `work plan apply --approve <sha256>`.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work run --review` com personas, `--personas`, `--reviewer-model`; um revisor mudo registra a causa e tenta de novo uma vez.",
        },
        {
          k: "new",
          area: "loop",
          t: "Bloco `factory` no `collie-work.json`, aplicado a partir do commit base; `work status` diz de onde veio cada valor.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie factory doctor` (nota de 0 a 3 por camada), `factory ratchet` e `factory bait`; a skill `factory-init` com modelos para Swift, Node e Python.",
        },
        {
          k: "new",
          area: "loop",
          t: "Toda execução com `--auto-land` deixa um resumo imutável: quem aprovou, quem vetou, base antes e depois, e o que não foi feito.",
        },
        {
          k: "new",
          area: "loop",
          t: "`--escalate agent:model,…` escolhe o agente e o modelo da tentativa pelo número dela; `work stop --now` descarta a tentativa em curso.",
        },
        {
          k: "new",
          area: "agents",
          t: 'Um Pastor pode convocar um sub-Pastor (`summon --shepherd`); a árvore de agentes o aninha com o selo "Pastor" e "Encerrar ramo…".',
        },
        {
          k: "new",
          area: "agents",
          t: "`collie ask --check <cmd> --tries N`: o ask só termina quando o check passa; um check que já passa antes da tarefa é recusado.",
        },
        {
          k: "new",
          area: "agents",
          t: "Dispositivo: `screen`, `find --scroll`, `wait --stable`, `--then ui|screen`, `tap --text`, OCR no Android e no iOS, e moldura de aparelho no painel.",
        },
        {
          k: "new",
          area: "agents",
          t: "Helper de acessibilidade no Android (`collie device helper`): leitura da tela em milissegundos, com volta ao `uiautomator`.",
        },
        {
          k: "new",
          area: "plugins",
          t: "Os eventos de ferramenta do Cursor chegam ao contrato de plug-in, e o Vizinho e as cercas também valem em terminais Cursor.",
        },
        {
          k: "imp",
          area: "agents",
          t: "Cursor: `summon --model` e `--trust`; um comando custom que roda `cursor-agent` é tratado como Cursor em todo lugar.",
        },
        {
          k: "imp",
          area: "agents",
          t: "Sem aviso de resposta depois de o asker já ter lido com `ask result`; ask e wait do Cursor pelo MCP não estouram mais os 60 s.",
        },
        {
          k: "imp",
          area: "loop",
          t: "Textos de revisão, notas e avisos passam por limpeza de segredos antes de chegar a você.",
        },
        {
          k: "fix",
          area: "agents",
          t: "O prompt no Cursor é confirmado como enviado, e um prompt não enviado não é mais lido como ocioso.",
        },
        {
          k: "fix",
          area: "memory",
          t: "O curador não promove mais para a memória do projeto armadilhas tiradas de arquivos descartáveis.",
        },
        {
          k: "fix",
          area: "loop",
          t: "Um auto-land que para sem integrar guarda os commits da tentativa num patch e reabre as tarefas, para eles nunca entrarem no land de outro trabalho.",
        },
        {
          k: "fix",
          area: "loop",
          t: "Um limite diário esgotado é recusado já no `work run`, antes de pagar qualquer agente ou revisão.",
        },
      ],
    },
    {
      v: "0.1.9",
      date: "2026-11-21",
      headline: "Configuração do laço por projeto, e checks mais rápidos.",
      highlights: [
        {
          area: "loop",
          title: "Configuração do laço no projeto",
          body: "Um `collie-work.json` na raiz do projeto declara o gate do laço, um precheck rápido, áreas com nome e um comando de smoke. O laço lê a versão commitada, nunca a árvore de trabalho, e falha a tentativa que edita o arquivo.",
          cmd: {
            prompt:
              "Mostre no que a configuração do laço deste projeto se resolve",
            command: "collie work config",
          },
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: "`collie-work.json`: gate, `precheck`, `areas`, `smoke` e um gate `full` por projeto; `collie work config` mostra no que se resolve, sem rodar nada.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work run --precheck <cmd>` roda um check rápido na sessão do próprio agente, e um erro de compilação custa um toque em vez de uma tentativa.",
        },
        {
          k: "new",
          area: "agents",
          t: "O aviso de contexto grande lê o tamanho real do contexto do Pastor, e no fim de um laço o daemon grava uma passagem para o próximo turno (`collie work handoff`).",
        },
        {
          k: "new",
          area: "loop",
          t: "O resumo imutável guarda os tokens de cada tentativa; `collie work usage` também lê trabalhos fechados.",
        },
        {
          k: "imp",
          area: "loop",
          t: "As tentativas reaproveitam uma pasta de build por laço em vez de compilar do zero a cada vez.",
        },
        {
          k: "imp",
          area: "memory",
          t: "Memórias quase duplicadas não entram mais juntas na mesma injeção; só a melhor de cada grupo.",
        },
        {
          k: "fix",
          area: "apps",
          t: "Um painel de app aberto com o serviço ainda subindo ficava em branco; agora diz que está iniciando e carrega sozinho.",
        },
        {
          k: "fix",
          area: "app",
          t: "Os botões da barra de título do terminal (tela cheia incluída) não faziam nada no canvas fora do zoom de 100%.",
        },
        {
          k: "fix",
          area: "sandbox",
          t: "As raias do laço paralelo não pedem mais cartões de acesso do sandbox, que reiniciavam o agente da raia.",
        },
      ],
    },
    {
      v: "0.1.8",
      date: "2026-11-21",
      headline: "Laço em paralelo, ganchos de agente para plug-ins e temas.",
      highlights: [
        {
          area: "loop",
          title: "Laço em paralelo",
          body: "Até 4 tarefas ao mesmo tempo, cada uma num worktree próprio. As tarefas dizem o que tocam e do que dependem; entram uma de cada vez e o gate roda de novo depois de cada merge. Todo laço que para diz por quê.",
          cmd: {
            prompt: "Rode as tarefas, duas de cada vez",
            command: "collie work run --parallel 2",
          },
        },
        {
          area: "plugins",
          title: "Ganchos de agente e Vizinho",
          body: "Um plug-in declara ganchos (`edit`, `stop`) e um helper que responde ao agente, como orientação ou bloqueio, no próprio sandbox e sem rede. O plug-in de exemplo Vizinho diz o que os arquivos irmãos fazem e transforma em cercas as convenções que você aprova.",
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: "`collie work run --parallel <n>` (até 4): cada tarefa numa raia, merge uma de cada vez, gate de novo depois de cada merge; `work task add --scope --needs`.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work wait` responde quando o trabalho muda; `work status --events` mostra o diário do laço; toda parada guarda o motivo.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work history` lê o resumo imutável de cada trabalho fechado; `work usage` mostra os tokens por tentativa.",
        },
        {
          k: "new",
          area: "loop",
          t: "`collie work task reopen` devolve à fila uma tarefa adiada; os agentes do laço levam o nome da tarefa.",
        },
        {
          k: "new",
          area: "app",
          t: "Seção Laços no Trilho com o laço rodando, e um modal Ver tudo com as tarefas e os últimos 20 trabalhos fechados.",
        },
        {
          k: "new",
          area: "app",
          t: "Temas personalizados: galeria e editor (Lista e JSON) em Preferências › Aparência; o tema é um arquivo JSON que recarrega ao salvar.",
        },
        {
          k: "new",
          area: "app",
          t: "Seleção múltipla no canvas e no painel lateral (⌘-clique, ⇧-clique, retângulo); o botão do meio arrasta o canvas.",
        },
        {
          k: "new",
          area: "app",
          t: "O que o Collie faz: um ícone de info abre 17 cards, um por funcionalidade, com como chamar cada uma.",
        },
        {
          k: "new",
          area: "app",
          t: "Arrastar arquivos ou uma imagem para um terminal cola os caminhos, e o agente anexa.",
        },
        {
          k: "new",
          area: "plugins",
          t: "Ganchos de agente (`edit`, `stop`) para plug-ins, só em terminais Claude; plug-in de exemplo Vizinho com cercas.",
        },
        {
          k: "imp",
          area: "loop",
          t: "O laço para no limite de uso do modelo sem gastar tentativa; modelo padrão dos agentes do laço em Preferências › Laços.",
        },
        {
          k: "imp",
          area: "loop",
          t: "Um turno que termina cedo sem commit leva um toque; depois de uma queda do daemon, o commit já feito é mantido.",
        },
        {
          k: "imp",
          area: "agents",
          t: "O Pastor só é avisado quando uma tarefa é adiada ou um laço termina (`--notify end`), e ouve uma vez quando a sessão fica grande.",
        },
        {
          k: "imp",
          area: "memory",
          t: "O gancho Stop pede memórias no máximo a cada 20 minutos, e nunca durante um laço.",
        },
        {
          k: "imp",
          area: "updates",
          t: "O DMG de instalação tem fundo e ícones posicionados.",
        },
        {
          k: "fix",
          area: "loop",
          t: "Sobras do gate vão para uma quarentena dentro do `.git` em vez de serem apagadas; uma tarefa não fica mais em andamento por um evento fora de fase.",
        },
        {
          k: "fix",
          area: "agents",
          t: "Um `collie work wait` órfão não esconde mais um Pastor que está editando.",
        },
      ],
    },
    {
      v: "0.1.7",
      date: "2026-11-20",
      headline: "Trilho: cercados numa coluna, agentes numa árvore.",
      highlights: [
        {
          area: "app",
          title: "Trilho",
          body: "Nova disposição da janela: os cercados numa coluna, um painel de contexto com a árvore de agentes e abas Canvas/Preferências. As Preferências abrem como aba na própria janela.",
        },
      ],
      items: [
        {
          k: "new",
          area: "app",
          t: "Trilho: coluna de cercados, painel de contexto com a árvore de agentes, abas Canvas/Preferências.",
        },
        {
          k: "new",
          area: "memory",
          t: "Terminais Cursor: a memória lê o transcript e captura quando ele cresce.",
        },
        {
          k: "imp",
          area: "memory",
          t: "Curador sem limite diário por padrão; o limite passa a ser escolha sua.",
        },
        {
          k: "fix",
          area: "app",
          t: "O Pasto some do Trilho enquanto está vazio.",
        },
        {
          k: "fix",
          area: "memory",
          t: "Curador com claude: perfil do sandbox ajustado ao que uma execução real precisa (USER, dyld, pasta temporária).",
        },
      ],
    },
    {
      v: "0.1.6",
      date: "2026-11-19",
      headline: "Laço com gate, evidência e confiança por cercado.",
      highlights: [
        {
          area: "loop",
          title: "Gate e evidência no laço",
          body: "Um comando de gate julga cada tarefa depois do check, e a evidência da tarefa aprovada aparece no status, no painel e no aviso.",
          cmd: {
            prompt: "Rode as tarefas, mas só aprove se o build passar",
            command: 'collie work run --gate "npm run build"',
          },
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: 'Gate do laço: `collie work run --gate "<cmd>"`.',
        },
        {
          k: "new",
          area: "loop",
          t: "Evidência da tarefa aprovada no status, no painel e no aviso do laço.",
        },
        {
          k: "new",
          area: "loop",
          t: '"Sempre neste cercado" no cartão do laço; página Laços nas Preferências.',
        },
        {
          k: "new",
          area: "memory",
          t: "Uma armadilha ou decisão pode ser garantida por um check (enforcedBy); armadilhas recorrentes sem check viram candidatas a regra.",
        },
        {
          k: "imp",
          area: "loop",
          t: "O status diz o que o laço está fazendo (agente, check, gate); o resumo mostra os números e commits revertidos.",
        },
        {
          k: "imp",
          area: "agents",
          t: "O Pastor fica sabendo de cada tarefa do laço quando ela termina.",
        },
        {
          k: "fix",
          area: "agents",
          t: "O daemon não cai mais quando um terminal é encerrado no meio de uma troca de modelo.",
        },
        {
          k: "fix",
          area: "loop",
          t: "O laço não espera mais o Pastor ficar ocioso para seguir.",
        },
      ],
    },
    {
      v: "0.1.5",
      date: "2026-11-18",
      headline: "Escolha quem cura sua memória.",
      highlights: [
        {
          area: "memory",
          title: "Curador de memória à sua escolha",
          body: "O curador revisa o que os agentes guardaram. Agora você escolhe quem faz isso (Claude ou Cursor), dá o consentimento e testa antes, nas Preferências.",
        },
      ],
      items: [
        {
          k: "new",
          area: "memory",
          t: "Escolher, consentir e testar o provedor do curador nas Preferências.",
        },
        {
          k: "new",
          area: "memory",
          t: "Provedor Cursor para o curador, isolado e sem ferramentas.",
        },
        {
          k: "fix",
          area: "memory",
          t: "O curador acha o claude em pastas conhecidas mesmo sem PATH, e diz quando o problema é o ambiente.",
        },
        {
          k: "fix",
          area: "memory",
          t: "O id do modelo é validado; o Cursor sempre roda em sandbox.",
        },
      ],
    },
    {
      v: "0.1.4",
      date: "2026-11-18",
      headline: "Laço autônomo e um curador para a memória.",
      highlights: [
        {
          area: "loop",
          title: "Laço autônomo",
          body: "Dê um spec e um check a cada tarefa, aprove a lista num cartão com limites e deixe rodar. Um agente novo por tentativa; o check decide quando acabou.",
          cmd: {
            prompt: "Rode as tarefas abertas até os testes passarem",
            command: "collie work run --max 10",
          },
        },
        {
          area: "network",
          title: "Rede confia no que o macOS confia",
          body: "O painel Rede verifica o servidor de destino com o bundle de confiança do macOS e respeita a sua configuração do mitmproxy.",
        },
      ],
      items: [
        {
          k: "new",
          area: "loop",
          t: "`collie work run` e `work stop`; tarefas com spec e check; aprovação num cartão.",
        },
        {
          k: "new",
          area: "loop",
          t: "`/collie:loop` em terminais Claude e Cursor; painel Work mostra o estado e permite parar.",
        },
        {
          k: "new",
          area: "memory",
          t: "Curador de memória com sandbox próprio (nega por padrão) e registro de procedência.",
        },
        {
          k: "new",
          area: "memory",
          t: "Precisão ao lado da cobertura, uso com evidência, validade provisória por tipo.",
        },
        {
          k: "new",
          area: "memory",
          t: "Mapas cujo arquivo mudou desde o commit âncora são contestados.",
        },
        {
          k: "new",
          area: "app",
          t: "Preferências › Memória: preferência de memória do Cursor e Confiar; selo de memória nos cartões Cursor.",
        },
        {
          k: "new",
          area: "network",
          t: "Bundle de confiança do macOS em todo início do mitmdump.",
        },
        {
          k: "fix",
          area: "memory",
          t: "Memória injetada vai rotulada como dado, escapada e limpa; veredictos do curador falham fechado.",
        },
        {
          k: "fix",
          area: "network",
          t: "Diz a causa quando o `adb root` é recusado.",
        },
      ],
    },
    {
      v: "0.1.3",
      date: "2026-11-17",
      headline: "Sandbox explica por que a detecção está desligada.",
      highlights: [
        {
          area: "sandbox",
          title: "Detecção que se explica",
          body: "Quando a detecção do sandbox está desligada, a tag diz o motivo e como resolver. Sem admin, vira um aviso único em vez de uma tag vermelha.",
        },
      ],
      items: [
        {
          k: "imp",
          area: "sandbox",
          t: "O watcher diz por que a detecção está desligada; a tag nomeia o motivo e a correção.",
        },
        {
          k: "imp",
          area: "sandbox",
          t: "Sem admin: um toast único, não uma tag vermelha fixa.",
        },
      ],
    },
    {
      v: "0.1.2",
      date: "2026-11-17",
      headline: "O Collie se atualiza sozinho.",
      highlights: [
        {
          area: "updates",
          title: "Atualizações dentro do app",
          body: "O Collie checa, baixa e verifica a nova versão, troca o app e reabre. A versão anterior fica guardada.",
        },
      ],
      items: [
        {
          k: "new",
          area: "updates",
          t: "Página Atualizações e folha de instalação nas Preferências.",
        },
        {
          k: "new",
          area: "updates",
          t: "O daemon checa, baixa e verifica o dmg, troca o app, guarda a versão anterior e reabre.",
        },
        {
          k: "new",
          area: "agents",
          t: "Dica de reiniciar quando um comando não existe no daemon antigo.",
        },
        {
          k: "imp",
          area: "agents",
          t: "O Pastor delega com `collie summon`, não com subagentes próprios.",
        },
      ],
    },
    {
      v: "0.1.1",
      date: "2026-11-17",
      headline: "Motor de design fora do dmg.",
      highlights: [
        {
          area: "design",
          title: "Motor de design sob demanda",
          body: "O motor de design não vem mais no dmg. O painel de design oferece o download, e o Collie baixa, verifica e instala em Preferências › Desenho e sandbox.",
        },
      ],
      items: [
        {
          k: "new",
          area: "design",
          t: "Baixe, verifique e instale o motor de design em Preferências › Desenho e sandbox.",
        },
        {
          k: "new",
          area: "design",
          t: "O painel de design oferece o download quando o motor falta.",
        },
      ],
    },
    {
      v: "0.1.0",
      date: "2026-11-16",
      headline: "Primeira versão baixável.",
      highlights: [
        {
          area: "apps",
          title: "Adote suas ferramentas",
          body: "Uma ferramenta local vira app do cercado, com escolha (--pick), aviso (--notify) e consultas (last, since=last, match).",
          cmd: {
            prompt: "Use o meu servidor de mocks como app",
            command: "collie app adopt --pick",
          },
        },
      ],
      items: [
        {
          k: "new",
          area: "apps",
          t: "`collie app adopt` com `--pick`, `--notify` e modo consulta.",
        },
        {
          k: "new",
          area: "agents",
          t: "`collie reply`, remetente verificado e espera no grafo de impasse.",
        },
        {
          k: "new",
          area: "network",
          t: "Painel Rede: map local, atraso e queda de respostas, com `collie network rule-*`.",
        },
      ],
    },
  ],
};

export const changelog: Record<Locale, ChangelogCopy> = { en, pt };

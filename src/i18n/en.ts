/** A terminal line in a canvas illustration; `out` lines are command output. */
export type TermLine = { text: string; out?: boolean };

export const en = {
  meta: {
    lang: "en",
    ogLocale: "en_US",
    title: "Collie — one canvas for all your agents",
    description:
      "One canvas where your coding agents, design and devices share the same context. Open source, macOS 15.",
  },
  languageSwitch: {
    label: "Language",
  },
  theme: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  nav: {
    label: "Main",
    links: {
      product: "Product",
      design: "Design",
      memory: "Memory",
      devices: "Devices",
    },
    github: "GitHub",
  },
  hero: {
    eyebrow: "OPEN SOURCE · macOS 15",
    title: ["One canvas.", "All your agents.", "One shared context."],
    body: "Collie puts your Claude Code and Codex terminals on one infinite canvas, next to your design system, live simulators and a project memory every agent can read.",
    primary: "Get started on GitHub",
    secondary: "Read the docs",
    hint: '$ collie ask designer "use the primary token on the CTA"',
    shepherd: [
      { text: '› collie memory search "tokens"' },
      { text: "3 decisions found", out: true },
      { text: '› collie ask designer "build the hero"' },
      { text: "designer: done · screenshot ✓", out: true },
      { text: "› collie device tap --ref e3" },
    ] as TermLine[],
  },
  memoryCard: {
    eyebrow: "PROJECT MEMORY",
    entries: [
      "• primary = #6E9BFF  (decision, v4)",
      "• hero uses the tab bar  (screen)",
      "• API on /v2 since 12/10  (pitfall)",
    ],
  },
  pain: {
    eyebrow: "TODAY",
    title: "Your agents forget. Your design scatters.",
    body: "Every conversation leaves another loose file, and every new agent starts from zero. You end up as the glue, re-explaining context.",
    cards: [
      "artifact_v3.html",
      "hero-final-FINAL.fig",
      'chat #12: "remember the token?"',
      "terminal 4 — codex",
      "simulator.app",
      "tokens-old.css",
    ],
  },
  pillars: {
    design: {
      eyebrow: "01 · DESIGN",
      title: "Design, centralised.",
      body: "Design lives in an embedded figcraft panel. One versioned design system holds the tokens your agents read, and every HTML or React export becomes a versioned artifact instead of a loose file.",
      command: "$ collie design system tokens",
      published: "v4 · published · 3 files use it",
      specimen: "Aa  Manrope 800 / 500",
      scale: "radius 8 · 12 · 20   space 4 → 96",
      tokens: [
        "$ collie design system tokens",
        "color/accent    #6E9BFF   v4",
        "radius/md       12        v4",
      ],
    },
    memory: {
      eyebrow: "02 · MEMORY",
      title: "Memory every agent shares.",
      body: "Decisions and finished work become project memory. Any agent searches it before re-reading your code, so nobody starts from zero. Including you.",
      command: '$ collie memory search "auth"',
      shepherd: [
        { text: '› collie memory search "auth"' },
        { text: "decision: sessions use JWT (v3)", out: true },
      ] as TermLine[],
      api: [
        { text: '› collie memory search "v2"' },
        { text: "pitfall: /v1 is frozen", out: true },
      ] as TermLine[],
    },
    devices: {
      eyebrow: "03 · DEVICES",
      title: "Live devices on the canvas.",
      body: "iOS Simulator and Android run right next to your terminals. Agents tap, take screenshots and read logcat on their own, then report back.",
      command: "$ collie device screenshot",
      qa: [
        { text: "› collie device tap --ref e3" },
        { text: 'tapped "Sign in"', out: true },
        { text: "› collie device screenshot" },
        { text: "saved screen-12.png", out: true },
        { text: "› collie device logcat --grep crash" },
        { text: "0 matches", out: true },
      ] as TermLine[],
    },
  },
  how: {
    eyebrow: "HOW IT WORKS",
    title: "A shepherd, paddocks and herds.",
    steps: [
      {
        title: "Shepherd",
        body: "A lead agent summons the others, leashes them to the work and checks their output.",
      },
      {
        title: "Paddocks",
        body: "Every task gets its own git worktree and branch. Land it when it is done.",
      },
      {
        title: "Herds",
        body: "Save a team of agents and roles. Apply it again on the next project.",
      },
    ],
  },
  build: {
    eyebrow: "BUILD IT",
    title: "Build it from source.",
    body: "There is no packaged release yet. Collie needs macOS 15 and Swift 6.2, and the app must live in /Applications before its first run.",
    terminal: "Terminal",
    commands: [
      "git clone https://github.com/ysraelmoreno/collie",
      "cd collie",
      "swift build",
      "scripts/bundle-app.sh",
      "cp -R build/Collie.app /Applications/",
    ],
    commandsLabel: "Build commands",
    note: "Optional: the Design panel also needs scripts/build-figcraft.sh (~10 min).",
  },
  copy: {
    idle: "Copy",
    done: "Copied",
  },
  cta: {
    title: "Give your agents one canvas.",
    body: "Open source under the MIT license. Clone it, build it, and put your agents on the same page.",
  },
  footer: {
    meta: "MIT License · macOS 15",
    github: "GitHub ↗",
  },
};

export type Dictionary = typeof en;

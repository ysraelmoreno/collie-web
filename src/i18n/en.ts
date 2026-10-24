/**
 * A line in a canvas terminal: the user's natural-language prompt, the collie
 * command the agent runs for it, that command's output, or the agent's reply.
 */
export type TermLine = {
  text: string;
  kind: "prompt" | "call" | "out" | "reply";
};

/** Pillar caption: what the user asks and the command the agent runs. */
export type PromptCommand = { prompt: string; command: string };

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
    hint: {
      prompt: "Use the primary token on the CTA",
      command: 'collie ask designer "CTA → primary"',
    } as PromptCommand,
    shepherd: [
      {
        text: "Use the new primary token on the hero and check it on the iPhone",
        kind: "prompt",
      },
      { text: 'collie memory search "primary token"', kind: "call" },
      { text: 'collie ask designer "CTA → primary"', kind: "call" },
      { text: "collie device screenshot", kind: "call" },
      {
        text: "Done. The hero CTA now uses primary (#6E9BFF) and looks right on the iPhone.",
        kind: "reply",
      },
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
      command: {
        prompt: "Which tokens does the CTA use?",
        command: "collie design system tokens",
      } as PromptCommand,
      published: "v6 · published · 3 files use it",
      specimen: "Aa  Manrope 800 / 500",
      scale: "radius 8 · 12 · 20   space 4 → 96",
      shepherd: [
        { text: "Which tokens does the CTA use?", kind: "prompt" },
        { text: "collie design system tokens", kind: "call" },
        { text: "color/accent    #6E9BFF   v6", kind: "out" },
        { text: "radius/md       12        v6", kind: "out" },
      ] as TermLine[],
    },
    memory: {
      eyebrow: "02 · MEMORY",
      title: "Memory every agent shares.",
      body: "Decisions and finished work become project memory. Any agent searches it before re-reading your code, so nobody starts from zero. Including you.",
      command: {
        prompt: "How do we handle sessions?",
        command: 'collie memory search "sessions"',
      } as PromptCommand,
      shepherd: [
        { text: "How do we handle sessions?", kind: "prompt" },
        { text: 'collie memory search "sessions"', kind: "call" },
        { text: "decision: sessions use JWT (v3)", kind: "out" },
      ] as TermLine[],
      api: [
        { text: "Can I add a route to /v1?", kind: "prompt" },
        { text: 'collie memory search "v1"', kind: "call" },
        { text: "pitfall: /v1 is frozen", kind: "out" },
      ] as TermLine[],
    },
    devices: {
      eyebrow: "03 · DEVICES",
      title: "Live devices on the canvas.",
      body: "iOS Simulator and Android run right next to your terminals. Agents tap, take screenshots and read logcat on their own, then report back.",
      command: {
        prompt: "Sign in on the Pixel and take a screenshot",
        command: "collie device ui",
      } as PromptCommand,
      qa: [
        { text: "Sign in on the Pixel and take a screenshot", kind: "prompt" },
        { text: "collie device ui", kind: "call" },
        { text: 'e3  Button "Sign in"', kind: "out" },
        { text: "collie device tap --ref e3", kind: "call" },
        { text: 'tapped "Sign in"', kind: "out" },
        { text: "collie device screenshot", kind: "call" },
        { text: "saved screen-12.png", kind: "out" },
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
    builtWith: "This site was built with Collie",
    github: "GitHub ↗",
  },
};

export type Dictionary = typeof en;

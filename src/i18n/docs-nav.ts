export type DocNavGroup = {
  id: string;
  title: Record<"en" | "pt", string>;
  /** `"<group>/<page>"`; the page title comes from its frontmatter. */
  pages: string[];
};

/** Sidebar order (plan's page table), the same in both locales. Every page needs en and pt files. */
export const docsNav: DocNavGroup[] = [
  {
    id: "getting-started",
    title: { en: "Getting started", pt: "Começando" },
    pages: [
      "getting-started/install",
      "getting-started/first-paddock",
      "getting-started/first-agent",
    ],
  },
  {
    id: "concepts",
    title: { en: "Concepts", pt: "Conceitos" },
    pages: [
      "concepts/shepherd-and-terminals",
      "concepts/paddocks-and-worktrees",
      "concepts/how-it-connects",
    ],
  },
  {
    id: "guides",
    title: { en: "Guides", pt: "Guias" },
    pages: ["guides/best-practices"],
  },
  {
    id: "features",
    title: { en: "Features", pt: "Funcionalidades" },
    pages: [
      "features/loop",
      "features/work-log",
      "features/factory",
      "features/fields",
      "features/memory",
      "features/herds",
      "features/sandbox",
      "features/network",
      "features/browser",
      "features/devices",
      "features/design-and-artifacts",
      "features/plugins",
      "features/apps",
    ],
  },
  {
    id: "internals",
    title: { en: "Internals", pt: "Por baixo" },
    pages: [
      "internals/daemon-and-socket",
      "internals/agent-hooks",
      "internals/curator",
    ],
  },
  {
    id: "reference",
    title: { en: "Reference", pt: "Referência" },
    pages: ["reference/cli", "reference/collie-work-json"],
  },
];

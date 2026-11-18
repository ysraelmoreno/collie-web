import type { FeatureCopy, Lang } from "./types";

export const artifacts: Record<Lang, FeatureCopy> = {
  en: {
    id: "artifacts",
    eyebrow: "09 · ARTIFACTS",
    title: "Point at it. The agent fixes it.",
    body: "Agents start decks, dashboards, docs and prototypes from templates themed with your tokens. Pin a comment on the preview and it lands in the agent’s next prompt.",
    bullets: [
      "Four templates, themed Light and Dark",
      "Comments pinned to a spot on the page",
      "Decks export to editable PowerPoint or PDF",
    ],
    command: {
      prompt: "Draft the pricing page as a prototype",
      command: "collie artifact new prototype pricing",
    },
    mediaAlt:
      "A comment pinned on a preview page reaches the agent, which fixes the page; the user then resolves the comment.",
  },
  pt: {
    id: "artifacts",
    eyebrow: "09 · ARTIFACTS",
    title: "Aponte. O agente corrige.",
    body: "Agentes começam decks, dashboards, docs e protótipos por modelos com os seus tokens. Fixe um comentário na prévia e ele chega no próximo prompt do agente.",
    bullets: [
      "Quatro modelos, com tema Light e Dark",
      "Comentários fixados num ponto da página",
      "Decks exportam para PowerPoint editável ou PDF",
    ],
    command: {
      prompt: "Faça um protótipo da página de preços",
      command: "collie artifact new prototype pricing",
    },
    mediaAlt:
      "Um comentário fixado numa prévia chega ao agente, que corrige a página; o usuário então resolve o comentário.",
  },
};

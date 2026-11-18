import type { FeatureCopy, Lang } from "./types";

export const diagram: Record<Lang, FeatureCopy> = {
  en: {
    id: "diagram",
    eyebrow: "10 · DIAGRAM",
    title: "Architecture, drawn from the code.",
    body: "Ask for a flowchart, an ERD or a sequence and the agent draws it in a diagram panel. You drag the boxes, it reads your changes back. The file lives in your repo.",
    bullets: [
      "Flowcharts, swimlanes, ERD and UML",
      "Agents write it from Mermaid",
      "A .drawio file, versioned with the code",
    ],
    command: {
      prompt: "Draw the checkout flow from the code",
      command: "collie diagram mermaid",
    },
    mediaAlt:
      "An agent draws a checkout flowchart in a diagram panel and the user drags one of the boxes.",
  },
  pt: {
    id: "diagram",
    eyebrow: "10 · DIAGRAMA",
    title: "Arquitetura, desenhada a partir do código.",
    body: "Peça um fluxograma, um ERD ou uma sequência e o agente desenha num painel de diagrama. Você arrasta as caixas, ele lê suas mudanças. O arquivo mora no seu repo.",
    bullets: [
      "Fluxogramas, raias, ERD e UML",
      "Agentes escrevem a partir de Mermaid",
      "Um arquivo .drawio, versionado com o código",
    ],
    command: {
      prompt: "Desenhe o fluxo de checkout a partir do código",
      command: "collie diagram mermaid",
    },
    mediaAlt:
      "Um agente desenha o fluxograma do checkout num painel de diagrama e o usuário arrasta uma das caixas.",
  },
};

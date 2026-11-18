import type { FeatureCopy, Lang } from "./types";

export const apps: Record<Lang, FeatureCopy> = {
  en: {
    id: "apps",
    eyebrow: "05 · APPS",
    title: "Adopt the tools you already have.",
    body: "Point Collie at a local tool and it becomes a live panel on the canvas. Your agents call its actions and hear its events, right where you work.",
    bullets: [
      "One command, no manifest to write",
      "Actions become agent tools, events become notices",
      "An agent can propose an app; only you approve it",
    ],
    command: {
      prompt: "Attach our metrics viewer and show the recent errors",
      command: "collie app adopt metrics --url http://127.0.0.1:8767",
    },
    mediaAlt:
      "A local tool on localhost is adopted with one command and becomes a panel on the canvas that the agent can call.",
  },
  pt: {
    id: "apps",
    eyebrow: "05 · APPS",
    title: "Adote as ferramentas que você já tem.",
    body: "Aponte o Collie para uma ferramenta local e ela vira um painel vivo no canvas. Seus agentes chamam as ações dela e ouvem os eventos, ali onde você trabalha.",
    bullets: [
      "Um comando, sem manifesto para escrever",
      "Ações viram ferramentas do agente, eventos viram avisos",
      "Um agente pode propor um app; só você aprova",
    ],
    command: {
      prompt: "Ligue nosso visualizador de métricas e mostre os erros recentes",
      command: "collie app adopt metrics --url http://127.0.0.1:8767",
    },
    mediaAlt:
      "Uma ferramenta local em localhost é adotada com um comando e vira um painel no canvas que o agente consegue chamar.",
  },
};

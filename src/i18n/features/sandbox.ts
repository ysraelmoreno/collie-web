import type { FeatureCopy, Lang } from "./types";

export const sandbox: Record<Lang, FeatureCopy> = {
  en: {
    id: "sandbox",
    eyebrow: "11 · SANDBOX",
    title: "Agents ask to leave the paddock.",
    body: "Agent terminals run under the macOS sandbox. In strict mode, a write outside the project is blocked and becomes a card: the agent says why, and you allow or deny it.",
    bullets: [
      "Open (default) or strict, set in Preferences",
      "Nothing is granted without your click; revoke anytime",
      "It limits files, not the network",
    ],
    command: {
      prompt: "Update the shared config in ~/dotfiles",
      command: "collie access request ~/dotfiles --write",
    },
    mediaAlt:
      "In strict mode a write outside the project is blocked; the agent requests access and the owner allows it on a card.",
  },
  pt: {
    id: "sandbox",
    eyebrow: "11 · SANDBOX",
    title: "Agentes pedem para sair do cercado.",
    body: "Terminais de agente rodam sob o sandbox do macOS. No modo estrito, uma escrita fora do projeto é bloqueada e vira um cartão: o agente diz por quê, e você permite ou nega.",
    bullets: [
      "Aberto (padrão) ou estrito, nas Preferências",
      "Nada é liberado sem o seu clique; revogue quando quiser",
      "Limita arquivos, não a rede",
    ],
    command: {
      prompt: "Atualize a config compartilhada em ~/dotfiles",
      command: "collie access request ~/dotfiles --write",
    },
    mediaAlt:
      "No modo estrito, uma escrita fora do projeto é bloqueada; o agente pede acesso e o dono permite num cartão.",
  },
};

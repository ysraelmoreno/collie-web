import type { FeatureCopy, Lang } from "./types";

export const network: Record<Lang, FeatureCopy> = {
  en: {
    id: "network",
    eyebrow: "06 · NETWORK",
    title: "Intercept every request your app makes.",
    body: "The Network panel captures the emulator’s HTTP(S) traffic. Your agent reads the request that failed, then answers it with a rule of its own to test the fix, once you approve.",
    bullets: [
      "Requests and responses from the attached emulator",
      "Any flow as curl, or as a rule that answers in the server’s place",
      "An agent’s rule waits for your OK; mapped flows are marked",
    ],
    command: {
      prompt: "Make checkout succeed so I can test the app",
      command: `collie network rule-add --from 3 --status 200 --body '{"ok":true}'`,
    },
    mediaAlt:
      "The Network panel lists the emulator’s requests; the agent finds the one that returned 500, proposes a rule that answers it with 200, the owner approves on a card, and the app receives the mapped response.",
  },
  pt: {
    id: "network",
    eyebrow: "06 · REDE",
    title: "Intercepte cada requisição do seu app.",
    body: "O painel Rede captura o tráfego HTTP(S) do emulador. Seu agente lê a requisição que falhou e a responde com uma regra própria para testar a correção, depois que você aprova.",
    bullets: [
      "Requisições e respostas do emulador anexado",
      "Qualquer fluxo como curl, ou como regra que responde no lugar do servidor",
      "A regra de um agente espera o seu OK; fluxos mapeados ficam marcados",
    ],
    command: {
      prompt: "Faça o checkout passar para eu testar o app",
      command: `collie network rule-add --from 3 --status 200 --body '{"ok":true}'`,
    },
    mediaAlt:
      "O painel Rede lista as requisições do emulador; o agente acha a que voltou 500, propõe uma regra que responde 200, o dono aprova num cartão e o app recebe a resposta mapeada.",
  },
};

import type { FeatureCopy, Lang } from "./types";

export const browser: Record<Lang, FeatureCopy> = {
  en: {
    id: "browser",
    eyebrow: "08 · BROWSER",
    title: "Agents that check their own work.",
    body: "A browser panel sits next to the terminal. The agent opens your dev server, clicks through the flow, reads the console and screenshots the result before telling you it works.",
    bullets: [
      "Click and fill by element ref, wait for text",
      "Console and storage, readable by the agent",
      "Resize the page to check 360px without leaving the canvas",
    ],
    command: {
      prompt: "Check the signup form at 360px",
      command: "collie browser snapshot",
    },
    mediaAlt:
      "An agent fills a signup form in a browser panel, reads a console error, fixes it and checks the page at phone width.",
  },
  pt: {
    id: "browser",
    eyebrow: "08 · NAVEGADOR",
    title: "Agentes que conferem o próprio trabalho.",
    body: "Um painel de navegador fica ao lado do terminal. O agente abre seu dev server, clica pelo fluxo, lê o console e tira um screenshot antes de dizer que funciona.",
    bullets: [
      "Clica e preenche por ref, espera por texto",
      "Console e storage, legíveis pelo agente",
      "Redimensiona a página para checar 360px sem sair do canvas",
    ],
    command: {
      prompt: "Confira o formulário de cadastro em 360px",
      command: "collie browser snapshot",
    },
    mediaAlt:
      "Um agente preenche um formulário de cadastro num painel de navegador, lê um erro no console, corrige e confere a página em largura de telefone.",
  },
};

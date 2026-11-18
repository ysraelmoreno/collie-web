import type { FeatureCopy, Lang } from "./types";

export const loop: Record<Lang, FeatureCopy> = {
  en: {
    id: "loop",
    eyebrow: "04 · LOOP",
    title: "Work that runs while you sleep.",
    body: "Give each task a check and approve the list once. Collie runs a fresh agent per attempt, and the check decides when a task is done. Not the agent.",
    bullets: [
      "A fresh agent per attempt",
      "You approve tasks, checks and limits on a card",
      "Runs in a paddock, under the strict sandbox",
    ],
    command: {
      prompt: "Run the open tasks until the tests pass",
      command: "collie work run --max 10",
    },
    mediaAlt:
      "A loop runs three tasks: a failed attempt is replaced by a fresh agent until each check passes.",
  },
  pt: {
    id: "loop",
    eyebrow: "04 · LAÇO",
    title: "Trabalho que roda sem você.",
    body: "Dê um check a cada tarefa e aprove a lista uma vez. O Collie roda um agente novo por tentativa, e é o check que decide quando a tarefa acabou. Não o agente.",
    bullets: [
      "Um agente novo por tentativa",
      "Você aprova tarefas, checks e limites num cartão",
      "Roda num cercado, sob o sandbox estrito",
    ],
    command: {
      prompt: "Rode as tarefas abertas até os testes passarem",
      command: "collie work run --max 10",
    },
    mediaAlt:
      "Um laço roda três tarefas: uma tentativa que falha dá lugar a um agente novo até cada check passar.",
  },
};

import type { FeatureCopy, Lang } from "./types";

export const emulator: Record<Lang, FeatureCopy> = {
  en: {
    id: "emulator",
    eyebrow: "07 · EMULATOR",
    title: "An emulator your Mac can afford.",
    body: "Collie creates a light Android emulator and boots it straight into a panel. No Android Studio window, no setup tour: ask for a device and it is on the canvas.",
    bullets: [
      "collie-lite: 720×1280, 1.5 GB, 2 cores",
      "Opening the panel boots the emulator",
      "Android and the iOS Simulator, side by side",
    ],
    command: {
      prompt: "Boot the light emulator and open the app",
      command: "collie panel open device --serial avd:collie-lite",
    },
    mediaAlt:
      "An emulator that was off boots inside a device panel on the canvas, next to an iOS Simulator.",
  },
  pt: {
    id: "emulator",
    eyebrow: "07 · EMULADOR",
    title: "Um emulador que cabe no seu Mac.",
    body: "O Collie cria um emulador Android leve e o liga direto num painel. Sem janela do Android Studio, sem tour de setup: peça um aparelho e ele está no canvas.",
    bullets: [
      "collie-lite: 720×1280, 1,5 GB, 2 núcleos",
      "Abrir o painel liga o emulador",
      "Android e Simulador iOS, lado a lado",
    ],
    command: {
      prompt: "Ligue o emulador leve e abra o app",
      command: "collie panel open device --serial avd:collie-lite",
    },
    mediaAlt:
      "Um emulador desligado liga dentro de um painel de dispositivo no canvas, ao lado de um Simulador iOS.",
  },
};

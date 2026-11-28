import type { Post } from "./types";

export const emulator: Post = {
  en: {
    slug: "emulator",
    eyebrow: "07 · EMULATOR",
    title: "An emulator your Mac can afford.",
    lead: "Collie creates a light Android emulator and boots it straight into a panel. No Android Studio window, no setup tour: ask for a device and it is on the canvas.",
    mediaId: "emulator",
    mediaAlt:
      "An emulator that was off boots inside a device panel on the canvas, next to an iOS Simulator.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "`collie-lite` is an Android emulator (an AVD) that Collie creates for Macs with little CPU and RAM. It is 720×1280, with 1.5 GB of RAM and 2 cores, and it has no camera, audio or sensors. It uses the host GPU.",
          },
          {
            kind: "p",
            text: "It lives in the **Dispositivo** (Device) panel, on the canvas, next to the iOS Simulator.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it exists",
        blocks: [
          {
            kind: "p",
            text: "A full emulator next to an editor, a browser and a few agents can slow a small Mac to a crawl. The light one trims what an app test rarely needs.",
          },
          {
            kind: "p",
            text: "Example: you ask the agent to boot the light emulator and open the app. It opens a panel, the emulator boots into it, and you see the screen on the canvas.",
          },
        ],
      },
      {
        id: "how",
        title: "How it works",
        blocks: [
          {
            kind: "list",
            items: [
              "`collie device lite create` makes the `collie-lite` AVD with `avdmanager`. It needs the Android SDK Command-line Tools and a `google_apis` arm64 system image already installed. Collie does not download anything for it and does not write the AVD by hand. It is for the app/admin only, writes only to `~/.android/avd/collie-lite*`, and running it again just re-applies the settings without erasing data.",
              'Emulators that are installed but off show up in `collie device list` as `avd:<name>` with `state: "off"`.',
              "Opening the panel of one boots it and waits for the boot, up to 3 minutes. `collie panel open device --serial avd:collie-lite` does the same.",
              "When it starts, Collie adds `-no-audio -no-boot-anim -no-metrics`.",
              "The emulator runs in its own session, so stopping or restarting the Collie service does not take it down. Collie never shuts it down: closing the panel, or stopping the service, leaves it on.",
              "In **Preferências → Android** (Preferences → Android), the app can install the SDK without Android Studio. It installs the Temurin JDK (if you have none at 17 or newer) and the Command-line Tools. Then it shows you the Google licenses to read and accept, and only then installs platform-tools, the emulator and a system image. An SDK that Android Studio already installed is reused, and only what is missing is installed.",
            ],
          },
        ],
      },
      {
        id: "start",
        title: "How to make it work",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Install the Android SDK",
                body: 'In **Preferências → Android**, click **Instalar** (Install). Read and accept the licenses when they appear (**Recusar**, Decline, downloads nothing in the second phase). The sizes with "~" are estimates, and you need twice that much free disk.',
              },
              {
                title: "Create the light emulator",
                body: "With everything ready, click **Criar emulador leve** (Create light emulator) in the same place. The button **Remover** (Remove) deletes it (the command is `collie device lite remove`).",
              },
              {
                title: "Check it is there",
                body: "The emulator is off, so it appears as `avd:collie-lite`.",
                command: "collie device list",
              },
              {
                title: "Ask for the device",
                body: "The panel opens and the emulator boots into it.",
                ask: "Boot the light emulator and open the app",
                command: "collie panel open device --serial avd:collie-lite",
              },
              {
                title: "Put an iOS Simulator next to it",
                body: "Open a second **Dispositivo** panel with the simulator's UDID. This needs Xcode 26+ with an iOS runtime, and AXe.",
                command: "collie panel open device --serial <UDID>",
              },
            ],
          },
        ],
      },
      {
        id: "limits",
        title: "Limits and cautions",
        blocks: [
          {
            kind: "list",
            items: [
              "Creating `collie-lite` needs the Command-line Tools and a `google_apis` arm64 image. Without them it fails; Collie will not download either one for the command.",
              "No audio. `device.text` types ASCII only.",
              "Boot waits up to 3 minutes.",
              "Collie never turns an emulator off. If you want it off, turn it off yourself.",
              "The iOS Simulator is a simulator only (no physical iPhone). It depends on AXe following Xcode: an Xcode update can break it until a new AXe comes out.",
              "If the tools are in a non-default place, `COLLIE_AVDMANAGER`, `COLLIE_JAVA_HOME` and `COLLIE_EMULATOR` point to them.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Can an agent create the emulator?",
                body: "No. `collie device lite create` is only for the app or admin. You click **Criar emulador leve**; the agent then boots it.",
              },
              {
                title: "Does it work for network capture?",
                body: "Yes. `collie-lite` is a Google APIs image, which allows the root access that capture needs. See the Network post.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie device lite create",
        does: "Creates the collie-lite AVD (app/admin only)",
      },
      {
        command: "collie device lite remove",
        does: "Deletes the collie-lite AVD",
      },
      {
        command: "collie device list",
        does: "Lists devices, including off emulators as avd:<name>",
      },
      {
        command: "collie panel open device --serial avd:collie-lite",
        does: "Boots the emulator into a Device panel",
      },
      {
        command: "collie panel open device --serial <UDID>",
        does: "Opens an iOS Simulator in a Device panel",
      },
    ],
    related: ["devices", "network"],
  },
  pt: {
    slug: "emulator",
    eyebrow: "07 · EMULADOR",
    title: "Um emulador que cabe no seu Mac.",
    lead: "O Collie cria um emulador Android leve e o liga direto num painel. Sem janela do Android Studio, sem tour de setup: peça um aparelho e ele está no canvas.",
    mediaId: "emulator",
    mediaAlt:
      "Um emulador desligado liga dentro de um painel de dispositivo no canvas, ao lado de um Simulador iOS.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "O `collie-lite` é um emulador Android (um AVD) que o Collie cria para Macs com pouca CPU e RAM. Tem 720×1280, 1,5 GB de RAM e 2 núcleos, e não tem câmera, áudio nem sensores. Usa a GPU do host.",
          },
          {
            kind: "p",
            text: "Ele vive no painel Dispositivo, no canvas, ao lado do Simulador iOS.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Um emulador completo ao lado de um editor, um navegador e alguns agentes pode deixar um Mac pequeno lento. O leve corta o que um teste de app raramente usa.",
          },
          {
            kind: "p",
            text: "Exemplo: você pede ao agente para ligar o emulador leve e abrir o app. Ele abre um painel, o emulador liga dentro dele e você vê a tela no canvas.",
          },
        ],
      },
      {
        id: "how",
        title: "Como funciona",
        blocks: [
          {
            kind: "list",
            items: [
              "`collie device lite create` cria o AVD `collie-lite` pelo `avdmanager`. Precisa do Android SDK Command-line Tools e de uma imagem de sistema `google_apis` arm64 já instalada. O Collie não baixa nada para isso nem escreve o AVD à mão. É só do app/admin, escreve apenas em `~/.android/avd/collie-lite*`, e rodar de novo só reaplica a configuração, sem apagar os dados.",
              'Emuladores instalados e desligados aparecem em `collie device list` como `avd:<nome>`, com `state: "off"`.',
              "Abrir o painel de um liga o emulador e espera o boot, por até 3 minutos. `collie panel open device --serial avd:collie-lite` faz o mesmo.",
              "Ao subir, o Collie acrescenta `-no-audio -no-boot-anim -no-metrics`.",
              "O emulador roda em sessão própria, então parar ou reiniciar o serviço do Collie não o derruba. O Collie nunca o desliga: fechar o painel ou parar o serviço o deixa ligado.",
              "Em Preferências → Android, o app instala o SDK sem Android Studio. Ele instala o JDK Temurin (se você não tem um 17 ou mais novo) e o Command-line Tools. Depois mostra as licenças do Google para você ler e aceitar, e só então instala platform-tools, o emulador e uma imagem de sistema. Um SDK que o Android Studio já instalou é reaproveitado, e só o que falta é instalado.",
            ],
          },
        ],
      },
      {
        id: "start",
        title: "Como fazer funcionar",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Instale o Android SDK",
                body: 'Em Preferências → Android, clique em **Instalar**. Leia e aceite as licenças quando aparecerem (**Recusar** não baixa nada da segunda fase). Os tamanhos com "~" são estimativas, e você precisa do dobro disso livre em disco.',
              },
              {
                title: "Crie o emulador leve",
                body: "Com tudo pronto, clique em **Criar emulador leve**, no mesmo lugar. O botão **Remover** o apaga (o comando é `collie device lite remove`).",
              },
              {
                title: "Confira que ele está lá",
                body: "O emulador está desligado, então aparece como `avd:collie-lite`.",
                command: "collie device list",
              },
              {
                title: "Peça o aparelho",
                body: "O painel abre e o emulador liga dentro dele.",
                ask: "Ligue o emulador leve e abra o app",
                command: "collie panel open device --serial avd:collie-lite",
              },
              {
                title: "Ponha um Simulador iOS ao lado",
                body: "Abra um segundo painel Dispositivo com o UDID do simulador. Precisa do Xcode 26+ com um runtime iOS, e do AXe.",
                command: "collie panel open device --serial <UDID>",
              },
            ],
          },
        ],
      },
      {
        id: "limits",
        title: "Limites e cuidados",
        blocks: [
          {
            kind: "list",
            items: [
              "Criar o `collie-lite` precisa do Command-line Tools e de uma imagem `google_apis` arm64. Sem eles, falha; o Collie não baixa nenhum dos dois para esse comando.",
              "Sem áudio. `device.text` digita só ASCII.",
              "O boot espera até 3 minutos.",
              "O Collie nunca desliga um emulador. Se quiser desligado, desligue você.",
              "O Simulador iOS é só simulador (iPhone físico não). Ele depende de o AXe acompanhar o Xcode: uma atualização do Xcode pode quebrá-lo até sair um AXe novo.",
              "Se as ferramentas estão fora do lugar padrão, `COLLIE_AVDMANAGER`, `COLLIE_JAVA_HOME` e `COLLIE_EMULATOR` apontam onde elas estão.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "Perguntas frequentes",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Um agente pode criar o emulador?",
                body: "Não. `collie device lite create` é só do app ou do admin. Você clica em **Criar emulador leve**; o agente então o liga.",
              },
              {
                title: "Serve para a captura de rede?",
                body: "Serve. O `collie-lite` é uma imagem Google APIs, que permite o acesso root que a captura precisa. Veja o post de Rede.",
              },
            ],
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie device lite create",
        does: "Cria o AVD collie-lite (só app/admin)",
      },
      { command: "collie device lite remove", does: "Apaga o AVD collie-lite" },
      {
        command: "collie device list",
        does: "Lista os aparelhos, com emuladores desligados como avd:<nome>",
      },
      {
        command: "collie panel open device --serial avd:collie-lite",
        does: "Liga o emulador num painel Dispositivo",
      },
      {
        command: "collie panel open device --serial <UDID>",
        does: "Abre um Simulador iOS num painel Dispositivo",
      },
    ],
    related: ["devices", "network"],
  },
};

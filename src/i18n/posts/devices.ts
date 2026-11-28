import type { Post } from "./types";

export const devices: Post = {
  en: {
    slug: "devices",
    eyebrow: "03 · DEVICES",
    title: "Live devices on the canvas.",
    lead: "An Android device or an iOS Simulator shows up as a panel next to your terminals. Agents tap, type, take screenshots and read the UI with collie device.",
    mediaId: "devices",
    mediaAlt:
      "An agent reads the UI of an Android screen, taps Sign in by its reference and takes a screenshot, all from its terminal.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "The **Dispositivo** (Device) panel shows a screen on the canvas, and you drive it with mouse and keyboard. For Android, the video comes from scrcpy and the commands run through adb. For the iOS Simulator, video and input come from AXe and the commands run through simctl. The daemon runs the commands.",
          },
          {
            kind: "p",
            text: "The same collie device commands work for both. An agent that is leashed to the panel can look at the screen, act on it and report back.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it matters",
        blocks: [
          {
            kind: "p",
            text: "Checking a change on a phone usually means you: build, open the app, tap through, take a screenshot, paste it into a chat. With the device on the canvas, the agent does that loop itself.",
          },
          {
            kind: "p",
            text: "Example: you ask for a sign-in on the Pixel and a screenshot. The agent reads the UI tree, finds the Sign in button by its ref, taps it and takes the screenshot. You watch it happen in the panel.",
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
              "Reading the screen: collie device ui returns the UI tree with refs (e1, e2, …). collie device screenshot saves a PNG and returns its path, width and height.",
              "Acting: tap takes coordinates or --ref e3. swipe, text and key (Back, Enter, Home… or a keycode) cover the rest. logcat, install and launch appear in the Android examples.",
              "Reach: a terminal needs a leash to the panel on the canvas. A panel in a dock is reachable by every terminal.",
              "Panel input: click or drag is touch, scroll is scroll, and the keyboard works with the panel focused. Android has **Voltar** (Back), **Início** (Home) and **Recentes** (Recents) in the bar. iOS has **Início** and **Bloquear** (Lock).",
              'iOS coordinates are in points, not pixels. collie device list shows platform: "ios", the UDID as the serial, and the state (booted or shutdown).',
              "Powered-off Android emulators show up in collie device list as avd:<name> with state off. Opening the panel of one boots it and waits for the boot, up to 3 minutes. Collie never turns an emulator off.",
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
                title: "Android: install adb",
                body: "Then turn on Developer options → USB debugging, connect by USB and accept the Mac's key (or use an emulator). adb devices must list the device as device.",
                command: "brew install --cask android-platform-tools",
              },
              {
                title: "Android: fetch the scrcpy server (source builds)",
                body: "If you build Collie from source, download the pinned scrcpy server (v5.0.1, checked by SHA-256) before bundling. Without it the panel shows an error.",
                command:
                  "scripts/fetch-scrcpy-server.sh && scripts/bundle-app.sh",
              },
              {
                title: "iOS Simulator: Xcode and AXe",
                body: "You need Xcode 26+ with an iOS runtime installed. xcrun simctl list devices must list simulators. Then install AXe (tested with 1.8.0).",
                command: "brew install cameroncooke/axe/axe",
              },
              {
                title: "Open the panel",
                body: "In the app: **Abrir painel…** (Open panel…) → **Dispositivo** and pick the device. A powered-off simulator is booted when you open its panel (it can take up to about 2 minutes). Or ask a Shepherd. Without --serial it opens the only online device.",
                ask: "Open the Pixel on the canvas",
                command: "collie panel open device --serial <serial>",
              },
              {
                title: "Let the agent drive it",
                body: "The agent reads the UI, taps by ref and takes a screenshot.",
                ask: "Sign in on the Pixel and take a screenshot",
                command: "collie device ui",
              },
              {
                title: "Tap a control and capture the result",
                body: "Use the ref the UI tree gave you.",
                command: "collie device tap --ref e3",
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
              "No audio.",
              "device text types ASCII only. On Android it is the platform's input text, so it cannot type a literal %s. Accents and %s go through the panel's keyboard. On iOS it types a US keyboard (ASCII).",
              "iOS: simulator only. A physical iPhone is not supported. A drag becomes a single swipe when you release, with no multitouch. The bar has no volume or Siri buttons.",
              "AXe uses private frameworks, so an Xcode update can break video and input until a new AXe comes out.",
              "On Android, an ANR does not become an event. Only crashes from logcat's crash buffer do.",
              "Herds skip device panels (and other plug-ins) when you save one, with a warning.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ",
        blocks: [
          {
            kind: "p",
            text: "Can a Mac with little CPU and RAM run an emulator? There is a light emulator (collie-lite) for that. Creating it is done in the app, not by an agent. See the emulator post.",
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie panel open device --serial <serial|UDID>",
        does: "Open a **Dispositivo** panel (the only online device without --serial).",
      },
      {
        command: "collie device list",
        does: "List devices: serial, state, model, product, panels.",
      },
      {
        command: "collie device screenshot",
        does: "Save a PNG; returns path, width and height.",
      },
      { command: "collie device ui", does: "UI tree with refs (e1, e2, …)." },
      {
        command: "collie device tap 540 1200",
        does: "Tap at coordinates; or collie device tap --ref e3.",
      },
      {
        command: "collie device swipe 540 1800 540 600",
        does: "Swipe between two points.",
      },
      {
        command: 'collie device text "hello"',
        does: "Type text (ASCII only).",
      },
      {
        command: "collie device key Back",
        does: "Press a key (Enter, Home… or a keycode).",
      },
      {
        command: "collie device logcat --lines 100 --grep MyApp",
        does: "Read the Android log.",
      },
      {
        command: "collie device install app.apk",
        does: "Install an APK on Android.",
      },
      {
        command: "collie device launch com.example.app",
        does: "Launch an Android app.",
      },
    ],
    related: ["emulator", "browser", "network"],
  },
  pt: {
    slug: "devices",
    eyebrow: "03 · DISPOSITIVOS",
    title: "Dispositivos ao vivo no canvas.",
    lead: "Um Android ou um Simulador iOS aparece como painel ao lado dos seus terminais. Os agentes tocam, digitam, tiram screenshots e leem a UI com collie device.",
    mediaId: "devices",
    mediaAlt:
      "Um agente lê a interface de uma tela Android, toca em Sign in pela referência e tira um screenshot, tudo do terminal dele.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "O painel Dispositivo mostra uma tela no canvas, e você a controla com mouse e teclado. No Android, o vídeo vem do scrcpy e os comandos rodam pelo adb. No Simulador iOS, vídeo e entrada vêm do AXe e os comandos rodam pelo simctl. Quem roda os comandos é o daemon.",
          },
          {
            kind: "p",
            text: "Os mesmos comandos collie device valem para os dois. Um agente ligado ao painel por uma coleira olha a tela, age nela e relata de volta.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Conferir uma mudança no celular costuma ser trabalho seu: compilar, abrir o app, navegar, tirar um print, colar num chat. Com o dispositivo no canvas, o agente faz esse ciclo sozinho.",
          },
          {
            kind: "p",
            text: "Exemplo: você pede para entrar no Pixel e tirar um screenshot. O agente lê a árvore de UI, acha o botão Sign in pelo ref, toca e tira o screenshot. Você assiste no painel.",
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
              "Ler a tela: collie device ui devolve a árvore de UI com refs (e1, e2, …). collie device screenshot grava um PNG e devolve o caminho, a largura e a altura.",
              "Agir: tap aceita coordenadas ou --ref e3. swipe, text e key (Back, Enter, Home… ou um keycode) cobrem o resto. logcat, install e launch aparecem nos exemplos do Android.",
              "Alcance: um terminal precisa de uma coleira até o painel no canvas. Um painel na doca vale para todos os terminais.",
              "Entrada no painel: clique ou arrastar é toque, rolagem é scroll, e o teclado funciona com o painel em foco. O Android tem Voltar, Início e Recentes na barra. O iOS tem Início e Bloquear.",
              'No iOS as coordenadas são em pontos, não em pixels. collie device list mostra platform: "ios", o UDID como serial e o estado (booted ou shutdown).',
              "Emuladores Android desligados aparecem em collie device list como avd:<nome> com state off. Abrir o painel de um liga o emulador e espera o boot, até 3 minutos. O Collie nunca desliga um emulador.",
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
                title: "Android: instale o adb",
                body: "Depois ative Opções do desenvolvedor → Depuração USB, conecte por USB e aceite a chave do Mac (ou use um emulador). adb devices precisa listar o aparelho como device.",
                command: "brew install --cask android-platform-tools",
              },
              {
                title:
                  "Android: baixe o servidor do scrcpy (build do código-fonte)",
                body: "Se você compila o Collie do código-fonte, baixe o servidor do scrcpy fixado (v5.0.1, conferido por SHA-256) antes de gerar o app. Sem ele o painel mostra erro.",
                command:
                  "scripts/fetch-scrcpy-server.sh && scripts/bundle-app.sh",
              },
              {
                title: "Simulador iOS: Xcode e AXe",
                body: "Você precisa do Xcode 26+ com um runtime iOS instalado. xcrun simctl list devices precisa listar simuladores. Depois instale o AXe (testado com a 1.8.0).",
                command: "brew install cameroncooke/axe/axe",
              },
              {
                title: "Abra o painel",
                body: "No app: Abrir painel… → Dispositivo e escolha o aparelho. Um simulador desligado é ligado quando você abre o painel dele (pode levar até uns 2 minutos). Ou peça a um Pastor. Sem --serial ele abre o único aparelho online.",
                ask: "Abra o Pixel no canvas",
                command: "collie panel open device --serial <serial>",
              },
              {
                title: "Deixe o agente dirigir",
                body: "O agente lê a UI, toca pelo ref e tira um screenshot.",
                ask: "Entre no Pixel e tire um screenshot",
                command: "collie device ui",
              },
              {
                title: "Toque num controle e capture o resultado",
                body: "Use o ref que a árvore de UI deu.",
                command: "collie device tap --ref e3",
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
              "Sem áudio.",
              "device text só digita ASCII. No Android é o input text da plataforma, então não digita um %s literal. Acentos e %s, digite pelo painel. No iOS digita um teclado US (ASCII).",
              "iOS: só simulador. iPhone físico não é suportado. Um arrasto vira um único swipe ao soltar, sem multitoque. A barra não tem botões de volume nem de Siri.",
              "O AXe usa frameworks privados, então uma atualização do Xcode pode quebrar vídeo e entrada até sair um AXe novo.",
              "No Android, um ANR não vira evento. Só crashes do buffer de crash do logcat.",
              "Rebanhos pulam painéis de dispositivo (e os demais plug-ins) ao salvar, com um aviso.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "Perguntas frequentes",
        blocks: [
          {
            kind: "p",
            text: "Um Mac com pouca CPU e RAM roda emulador? Existe um emulador leve (collie-lite) para isso. Quem o cria é o app, não um agente. Veja o post do emulador.",
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie panel open device --serial <serial|UDID>",
        does: "Abre um painel Dispositivo (sem --serial, o único aparelho online).",
      },
      {
        command: "collie device list",
        does: "Lista os aparelhos: serial, estado, modelo, produto, painéis.",
      },
      {
        command: "collie device screenshot",
        does: "Grava um PNG; devolve caminho, largura e altura.",
      },
      {
        command: "collie device ui",
        does: "Árvore de UI com refs (e1, e2, …).",
      },
      {
        command: "collie device tap 540 1200",
        does: "Toca nas coordenadas; ou collie device tap --ref e3.",
      },
      {
        command: "collie device swipe 540 1800 540 600",
        does: "Desliza entre dois pontos.",
      },
      {
        command: 'collie device text "ola mundo"',
        does: "Digita texto (só ASCII).",
      },
      {
        command: "collie device key Back",
        does: "Aperta uma tecla (Enter, Home… ou um keycode).",
      },
      {
        command: "collie device logcat --lines 100 --grep MyApp",
        does: "Lê o log do Android.",
      },
      {
        command: "collie device install app.apk",
        does: "Instala um APK no Android.",
      },
      {
        command: "collie device launch com.example.app",
        does: "Abre um app Android.",
      },
    ],
    related: ["emulator", "browser", "network"],
  },
};

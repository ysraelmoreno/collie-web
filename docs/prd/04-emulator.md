# PRD 04 — Seção 07 · Emulator (emulador leve)

Leia antes: [00-overview.md](00-overview.md). `id`: `emulator`.

## O que é (fatos: `docs/referencia.md` § Dispositivos Android / Emulador leve / Simulador iOS; specs
`2026-11-14-lite-emulator-design.md`, `2026-11-14-android-setup-design.md`)

- `collie device lite create` cria o AVD **`collie-lite`**: 720×1280, 1,5 GB de RAM, 2 núcleos, sem câmera, áudio nem
  sensores, GPU do host. Feito para Macs com pouca CPU e RAM.
- Emuladores desligados aparecem em `collie device list` como `avd:<nome>`; abrir o painel **liga o emulador** e espera
  o boot: `collie panel open device --serial avd:collie-lite`.
- O app instala o que falta do Android SDK (platform-tools, emulador, imagem), pedindo as licenças a você.
- Android (adb/scrcpy) e Simulador iOS no mesmo painel Dispositivo.

Não repetir o pilar 03 (tocar, screenshot, logcat). Aqui o assunto é: **ter um aparelho sem sair do canvas e sem
derreter o Mac**.

## O que falar

| | EN | PT-BR |
|---|---|---|
| Eyebrow | `07 · EMULATOR` | `07 · EMULADOR` |
| H2 | An emulator your Mac can afford. | Um emulador que cabe no seu Mac. |
| Lead | Collie creates a light Android emulator and boots it straight into a panel. No Android Studio window, no setup tour: ask for a device and it is on the canvas. | O Collie cria um emulador Android leve e o liga direto num painel. Sem janela do Android Studio, sem tour de setup: peça um aparelho e ele está no canvas. |
| Bullets | collie-lite: 720×1280, 1.5 GB, 2 cores · Opening the panel boots the emulator · Android and the iOS Simulator, side by side | collie-lite: 720×1280, 1,5 GB, 2 núcleos · Abrir o painel liga o emulador · Android e Simulador iOS, lado a lado |
| Prompt | Boot the light emulator and open the app | Ligue o emulador leve e abra o app |
| Command | `collie panel open device --serial avd:collie-lite` | igual |

## GIF `emulator` — "do zero ao aparelho"

Cena: terminal `shepherd · claude` à esquerda; à direita, área vazia do canvas. Um medidor pequeno `CPU / RAM` no
canto superior direito.

1. **"No device yet."** `↳ collie device list` → `[{serial:"avd:collie-lite",state:"off"}]` (saída real é JSON).
2. **"Ask for one."** `↳ collie panel open device --serial avd:collie-lite`; nasce um `PanelCard` `collie-lite ·
   device` com a tela preta e "booting…" + barra de progresso.
3. **"It boots into a panel."** Tela acende (home simples), guia tracejada liga ao terminal; medidor mostra
   `1.5 GB · 2 cores` estável (barras baixas, verdes).
4. **"Right next to iOS."** Um segundo painel `iPhone 16e · iOS Sim` (`collie panel open device --serial <UDID>`) entra ao lado; os dois telefones lado a lado.

Nota: `collie device lite create` é só do app/admin e exige cmdline-tools e imagem `google_apis` arm64; o GIF parte do `collie-lite` já criado.

Poster: batida 4.

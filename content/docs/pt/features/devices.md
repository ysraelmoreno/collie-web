---
title: "Dispositivos"
description: "Aparelhos e emuladores Android e Simuladores iOS no canvas, dirigidos pelos agentes com collie device."
---

O painel **Dispositivo** mostra a tela de um aparelho ou emulador Android, ou de um Simulador iOS, no canvas, com mouse e
teclado. Os agentes dirigem o mesmo aparelho com `collie device …`: leem a tela em grupos de elementos com refs, tocam,
deslizam, digitam, leem o log e instalam apps. Quem roda esses comandos é o daemon, pelo `adb` no Android e pelo
`simctl` e o AXe no iOS.

Use para um agente conferir uma mudança mobile numa tela de verdade, reproduzir um bug de um relato ou percorrer um fluxo
de ponta a ponta. A visão geral está em [/pt/features/devices](/pt/features/devices), e o emulador leve em
[/pt/features/emulator](/pt/features/emulator).

## Preparar o Android

```steps
items:
  - title: Instale o adb
    command: brew install --cask android-platform-tools
  - title: Conecte um aparelho ou ligue um emulador
    command: adb devices
    result: "No celular, ative Opções do desenvolvedor → Depuração USB e aceite a chave do Mac. O aparelho aparece como `device`."
  - title: Abra o painel
    command: collie panel open device --serial <serial>
    result: "No app, **Abrir painel… → Dispositivo**. Sem `--serial`, o único aparelho online."
```

A tela é vídeo do scrcpy. No painel, clicar ou arrastar é toque, rolar é scroll e o teclado digita com o painel em foco
(acentos inclusive). A barra tem **Voltar**, **Início** e **Recentes**. Sem aparelho, o painel mostra o estado e
**Reconectar**.

**Ainda sem o SDK do Android?** Em Preferências → Android o app o instala sem Android Studio: **Instalar** primeiro baixa
o JDK Temurin (se não houver um 17+) e o Command-line Tools, depois mostra as licenças do Google para você ler e aceitar
(**Recusar** não baixa mais nada) e então platform-tools, emulador e uma imagem de sistema. Um SDK do Android Studio já
existente é reaproveitado.

## Emuladores e o `collie-lite`

Emuladores instalados e desligados aparecem em `collie device list` como `avd:<nome>`, com `state: "off"`. Abrir o painel
de um o liga e espera o boot (até 3 minutos). O emulador roda em sessão própria: o Collie nunca o desliga, e fechar o
painel ou parar o serviço o deixa ligado.

Para Macs com pouca CPU e RAM, `collie device lite create` (só o app) cria o AVD `collie-lite`: 720×1280, 1,5 GB, 2
núcleos, sem câmera, áudio nem sensores, GPU do host. Precisa do Command-line Tools e de uma imagem `google_apis` arm64
já instalada; o Collie não baixa nada para ele. Em Preferências → Android, **Criar emulador leve** faz o mesmo e
**Remover** o apaga.

## Preparar o Simulador iOS

1. Xcode 26+ com um runtime iOS (`xcrun simctl list devices` lista os simuladores).
2. AXe: `brew install cameroncooke/axe/axe` (testado com o AXe 1.8.0).
3. **Abrir painel… → Dispositivo**: os simuladores aparecem como `iPhone 16e — iOS 26.3`, e os desligados com
   `(desligado)`. Abrir um o liga (até ~2 minutos). Um Pastor: `collie panel open device --serial <UDID>`.

A barra tem **Início** e **Bloquear**. Os mesmos comandos `collie device …` valem, com coordenadas em **pontos**, não
pixels; `collie device list` mostra `platform: "ios"` e o UDID como `serial`.

## Ler a tela

Um terminal só alcança um aparelho por uma guia até o painel dele no canvas; um painel na doca vale para todos.

```sh
collie device screen          # a tela em grupos, com refs
collie device ui              # a árvore crua, nós com rótulo ou clicáveis
collie device find "Finalizar" --scroll
collie device screenshot      # um PNG, para olhar, não para analisar
```

Comece por `device screen`: título, abas (`*` na selecionada), ações, campos, conteúdo, botões flutuantes e o que mudou
desde a última leitura, cada item `{ref, label, role, state}`. Use `device ui` quando o agrupamento esconder algo, e
`screenshot` só quando nenhum dos dois mostrar o elemento. No Android, `--ocr` também lê o texto do screenshot, e roda
sozinho quando a árvore é pobre; `--region x1,y1,x2,y2` limita a área.

`find "<texto>"` devolve `{found, ref, label, role, center, clickable}`. Com `--scroll` ele desliza de 75% a 35% da
altura e procura de novo, até achar, até a árvore parar de mudar ou até `--max` deslizes (padrão 8, até 30).

## Agir

```sh
collie device tap --ref e3 --then screen
collie device tap --text "Ver ofertas" --then ui
collie device swipe 540 1800 540 600
collie device text "ola mundo"
collie device key Back
collie device wait --text "Combos" --timeout 15
collie device launch com.example.app
collie device logcat --lines 100 --grep MyApp
```

```compare
before:
  title: Duas chamadas
  items:
    - "`tap --ref e3`"
    - "`screen`"
after:
  title: Uma chamada
  items:
    - "`tap --ref e3 --then screen`"
```

`--then ui` ou `--then screen` vale em `tap`, `swipe`, `text`, `key` e `launch`: espera 400 ms (`--settle 0-3000`, ou
`--settle stable` para dois dumps iguais, até 5 s) e devolve a tela nova com os refs atualizados. `tap --text` e `--id`
acham o elemento num dump novo, então não precisa de `ui` antes; com vários resultados, escolha com `--nth`. O `wait`
espera o `--text` aparecer (`--gone`: sumir) ou o `--stable`; um número puro em `--timeout` é em segundos, padrão 10, e
acima de 60 s ele espera 60 s.

## O helper do Android

O `collie-helper.apk`, no bundle, roda como serviço de acessibilidade e lê a tela em dezenas de milissegundos, em vez
dos ~2 s do `uiautomator dump`. `tap --text|--id|--ref` vira clique semântico e `wait --stable` espera por eventos. O
emulador recebe o helper sozinho na primeira ação `device` do painel. **Aparelho físico só com opt-in**:
`collie device helper install --serial <id>` (só o app). `collie device helper status` diz
`ready|starting|fallback|off` e por quê.

```callout
kind: note
title: Privacidade
body: Um serviço de acessibilidade lê todo o conteúdo da tela enquanto está ligado. O helper só aceita o `adb forward`, mascara senhas, não tem permissão de internet e nada sai do aparelho. Qualquer falha volta para o `uiautomator`.
```

## Limites

- Sem áudio. `device text` digita só ASCII e, no Android, não digita `%s` literal; acentos, digite pelo painel.
- Um ANR não vira evento (só crashes do buffer de crash do logcat).
- iOS: só simulador, sem iPhone físico; um arrasto vira um swipe ao soltar (sem multitoque); vídeo e entrada dependem de
  o AXe acompanhar o Xcode, então uma atualização do Xcode pode quebrá-los até sair um AXe novo.

## Como se conecta

- O tráfego HTTP(S) do emulador: [Rede](/pt/docs/features/network).
- O mesmo ciclo de refs para páginas web: [Navegador](/pt/docs/features/browser).
- Guias e quem alcança qual painel: [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals).
- `open -a Simulator` funciona num terminal com sandbox pelo `collie open` ([Sandbox](/pt/docs/features/sandbox)).

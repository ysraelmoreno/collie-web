---
title: "Agentes que enxergam o celular"
date: 2026-11-22
summary: "O que estamos mudando na conversa entre agentes do Collie e dispositivos Android e iOS, e para onde achamos que o desenvolvimento mobile vai."
draft: false
---

Um celular no canvas só serve se o agente consegue usá-lo. Hoje consegue. Mas é lento, e modelos mais baratos se perdem. Este post fala do que estamos mudando e de para onde achamos que o trabalho mobile caminha.

São duas partes. A primeira é fato: o que foi lançado, o que está na `main`, o que ainda está em andamento. A segunda é opinião, e avisa isso.

## Onde estamos hoje

Lançado desde a 0.1.0:

- Um painel **Dispositivo**. O Android roda por scrcpy e adb. O Simulador iOS roda por AXe e simctl.
- Os mesmos comandos `collie device` para os dois: `ui`, `screenshot`, `tap`, `swipe`, `text`, `key`.
- O `collie-lite`, um emulador Android leve que o Collie cria para Macs pequenos. Emuladores desligados aparecem em `collie device list` como `avd:<nome>`, e abrir o painel de um deles o liga.
- Configuração do Android SDK em **Preferências → Android**, sem precisar do Android Studio.
- A tela desenhada dentro de uma moldura conforme o tipo de aparelho (celular, dobrável, tablet, iPhone moderno, iPhone com botão home, iPad), escolhida automaticamente. Esta está na `main`, ainda não lançada. Painéis pequenos e aparelhos físicos não mostram moldura.

O fluxo é o do [post de Dispositivos](/pt/features/devices): o agente lê a árvore de UI, toca pelo ref, tira um screenshot. Você assiste no painel.

Funciona. O problema é o custo.

## O que medimos

Testamos um modelo de agente mais barato numa tarefa simples: navegar entre algumas telas de um app, da primeira até uma terceira, passando por um botão e um menu.

Ele não conseguiu fazer do jeito que queríamos. Acabou escrevendo scripts em Python para "ler" o PNG do `collie device screenshot`.

Num emulador Android, cronometramos um passo:

```stats
items:
  - value: 2,2 a 3,3 s
    label: "`collie device ui`"
    note: 4 amostras
  - value: 0,1 s
    label: "`collie device tap --ref`"
```

Quase todo o tempo de um passo ver → agir era o dump da UI. E a árvore tinha de 49 a 67 linhas, a maioria containers de layout só com id. Um botão só com ícone aparecia como `Button` com apenas um resource id, sem texto. Quem busca por texto não acha nada.

Nossa hipótese, ainda não confirmada: esse modelo nem recebe imagem de volta das ferramentas. Então o screenshot não servia, e a árvore era barulhenta demais.

## O que mudou na main

```callout
kind: status
title: Na main, ainda não lançado
body: "Tudo nesta seção está integrado na `main`. A última tag é a v0.1.9, e nada disso está numa versão lançada."
```

### Uma árvore menor

`collie device ui` agora devolve só os nós úteis: os que têm rótulo ou são clicáveis. `collie device ui --all` traz a árvore inteira, para depurar. Os refs são os mesmos nos dois, então `e4` é o mesmo nó em qualquer um.

### Agir e olhar numa chamada só

`tap`, `swipe`, `text`, `key` e `launch` aceitam `--then ui`. O daemon age, espera, lê a tela e devolve, com refs novos. Uma chamada por passo, não duas.

```compare
before:
  title: Duas chamadas
  items:
    - "`collie device tap --ref e3`"
    - "`collie device ui`"
after:
  title: Uma chamada
  items:
    - "`collie device tap --ref e3 --then ui`"
```

### Tocar pelo rótulo

Não precisa mais de um ref antes. `tap --text` acha o nó pelo rótulo (ou `--id` pelo resource id), num dump novo:

```sh
collie device tap --text "Settings" --then ui
```

Se mais de um nó casa, você recebe uma lista e escolhe com `--nth N`.

### Ver a tela como uma pessoa veria

`collie device screen` agrupa a árvore: título, abas (a selecionada marcada com `*`), ações, campos, conteúdo, botões flutuantes e o que mudou desde a última chamada. Devolve texto, mais itens com `ref`, `label`, `role` e `state`. O `ui` continua sendo a visão crua, para quando o agrupamento esconder algo.

### Achar e esperar

- `collie device find "X"` localiza um elemento na tela. Com `--scroll`, ele desliza e procura de novo até achar, até a árvore parar de mudar (fim da lista) ou até `--max` (padrão 8).
- `collie device wait --text "Settings"` espera o texto aparecer. `--gone` espera sumir. `--stable` espera a tela se acalmar. Isso troca `sleep` seguido de outro `ui`. Com o helper (abaixo), `--stable` acompanha os eventos da própria tela: ela está estável quando nenhum evento chega por `--quiet` ms (padrão 300). Sem o helper, ele compara dois dumps iguais.
- `tap --text` e `find` entendem `+`, `x`, `☰`, `<` e `>`, e o id de um botão sem rótulo (`configuration_fab` é lido como "configuration fab"). Quando nada casa, o `find` lista os ids clicáveis sem rótulo.

### Um leitor residente no Android

A parte lenta era o `uiautomator`, não o adb. Então, na `main`, um pequeno serviço de acessibilidade no aparelho, o `collie-helper.apk`, lê a tela no lugar dele.

```tabs
tabs:
  - label: Android
    lang: sh
    code: |
      collie device helper status
      collie device helper install
  - label: Simulador iOS
    body: "Sem helper: ele é um serviço de acessibilidade do Android. A tela é lida pelo AXe, como antes. `collie device helper` não se aplica."
```

Um emulador recebe o helper sozinho, no primeiro comando de dispositivo do painel. Um celular físico só o recebe depois de `collie device helper install`, porque o serviço lê a tela inteira. `collie device helper status` diz com o que os comandos estão lendo a tela (`helper` ou `uiautomator`) e por quê. Se o helper falha, os comandos voltam para o `uiautomator` e o Collie tenta de novo mais tarde. Eles nunca falham por causa do helper.

Numa prova de conceito em um emulador Android, a leitura da tela caiu de cerca de 2.050 ms para 4 a 120 ms, já aquecida, com os mesmos 55 nós. A primeira leitura levou de 523 a 650 ms, e uma leitura logo depois de trocar de tela levou 1,58 s. É um aparelho e uma tela, não um benchmark.

```stats
from: ~2.050 ms
to: 4 a 120 ms
label: Leitura da tela num emulador Android
note: Prova de conceito, um aparelho, uma tela. Leituras aquecidas; a primeira leva 523 a 650 ms.
```

### OCR quando a árvore não ajuda

Algumas telas não dão nada à árvore de acessibilidade: um canvas, um jogo, uma imagem. Na `main`, o `collie device screen` então lê o screenshot, no Android e no iOS. Esses itens aparecem como `(ocr)`, com refs `o1`…. `--ocr` força, `--no-ocr` desliga e `--region x1,y1,x2,y2` limita a área. `find` e `tap --text` que não casam nada na árvore tentam o OCR e tocam no centro da caixa do texto. Não há confirmação do toque, então siga com `--then screen`.

No nosso corpus Android (16 telas, um emulador), o gatilho disparou nas 8 telas sem texto acessível e em nenhuma das 5 boas. No fixture do Simulador iOS, o OCR achou todos os textos esperados. Os dois corpora são pequenos e sintéticos, então leia como "funciona nos nossos fixtures".

### Coisas menores

- `--timing` em `ui` e `screen` devolve o tempo de cada etapa (adb, parse, agrupamento), para medir sem cronômetro.
- `collie device launch` abre a primeira activity LAUNCHER do app, em vez de usar o monkey.

A orientação embutida do agente foi atualizada para ensinar esse ciclo: olhar com `device screen`, agir com `--then`, tirar screenshot só se nada mais mostra o elemento.

## O que ainda está em andamento

Sem esconder as pontas:

- **Velocidade no iOS.** O helper é só Android. No Simulador a tela continua sendo lida como antes, e não publicamos números dos comandos novos por lá.
- **Velocidade em celulares Android reais.** Os números acima vêm de um emulador. Um celular físico precisa de `collie device helper install`, e não publicamos tempos de um.
- **OCR.** Nossos corpora são pequenos e quase todos sintéticos. Apps reais com árvore vazia (Flutter, jogos, WebViews opacas) são o que ainda falta testar. Texto claro sobre papel de parede foi o caso fraco.

```callout
kind: warning
title: Prova
body: Ainda não publicamos números da tarefa com o modelo mais barato depois dessas mudanças. Até lá, leia como "construído", não como "resolvido".
```
- **Limites que continuam valendo.** Sem áudio. `device text` digita só ASCII. No iOS, só Simulador, não iPhone físico.

## Para onde achamos que isso vai

```callout
kind: vision
title: Uma visão, não um roadmap
body: Tudo daqui para baixo é opinião. Sem datas, sem promessas.
```

### O ciclo chega mais perto do código

Hoje o teste mobile acontece, em geral, depois do código. Você compila, abre o app, navega, olha. Achamos que o agente que escreve a mudança deve ser o que a confere, na mesma máquina, numa tela de verdade, antes de dizer "pronto".

Para isso o dispositivo precisa ser uma ferramenta normal do agente, como o compilador ou o runner de testes. Não uma montagem especial. É por isso que nos importamos com uma chamada por passo e com uma descrição de tela curta e legível.

### A percepção fica perto do dispositivo

Um agente barato não deveria planejar cada rolagem. Quanto menos o modelo faz por tela, mais barato fica o ciclo. Nossa inclinação é pôr as partes repetitivas (rolar até achar, esperar estabilizar, agrupar a árvore) na ferramenta, e deixar ao agente decisões de uma linha.

> "Vá para a tela de configurações e ache a opção de notificações." Isso deveria ser uma frase, não um script.

### Emulador é o caso comum

Um emulador leve ao lado de um editor, um navegador e alguns agentes deveria ser normal num Mac pequeno. Aparelho real importa, mas a maioria das conferências não precisa de um.

### O que ainda não sabemos

A árvore de acessibilidade vai bastar? Compose e views customizadas dão rótulos ruins. Screenshot com visão pode ter de voltar para alguns apps. Ainda não sabemos.

E confiança. Um agente tocando no seu app só vale tanto quanto sua noção do que ele fez. Assistir no painel é nossa resposta por enquanto. Pode não bastar com cinco agentes ao mesmo tempo.

## Experimente

Com o build do Collie vindo da `main`, ligue o emulador leve e deixe um agente dirigir.

```steps
items:
  - title: Abra o emulador leve
    command: collie panel open device --serial avd:collie-lite
    result: O emulador liga e recebe o helper no primeiro comando de dispositivo.
  - title: Veja com o que a tela está sendo lida
    command: collie device helper status
    result: "`helper` quando está pronto, `uiautomator` com o motivo quando não está."
  - title: Leia a tela
    command: collie device screen
  - title: Toque pelo rótulo e olhe de novo
    command: collie device tap --text "Sign in" --then screen
  - title: Leia os pixels quando a árvore está vazia
    command: collie device screen --ocr
    result: Os itens achados pelo OCR aparecem como `(ocr)`.
```

Se você está num build lançado, o primeiro passo e o `collie device ui` já funcionam. O resto chega na próxima versão.

Relacionados: [Dispositivos](/pt/features/devices), [Emulador](/pt/features/emulator).

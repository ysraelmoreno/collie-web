---
title: "Agentes que enxergam o celular"
date: 2026-11-22
summary: "O que estamos mudando na conversa entre agentes do Collie e dispositivos Android e iOS, e para onde achamos que o desenvolvimento mobile vai."
draft: true
---

Um celular no canvas só serve se o agente consegue usá-lo. Hoje consegue. Mas é lento, e modelos mais baratos se perdem. Este post fala do que estamos mudando e de para onde achamos que o trabalho mobile caminha.

São duas partes. A primeira é fato: o que foi lançado, o que está na `main`, o que ainda está em andamento. A segunda é opinião, e avisa isso.

## Onde estamos hoje

Lançado desde a 0.1.0:

- Um painel **Dispositivo**. O Android roda por scrcpy e adb. O Simulador iOS roda por AXe e simctl.
- Os mesmos comandos `collie device` para os dois: `ui`, `screenshot`, `tap`, `swipe`, `text`, `key`.
- O `collie-lite`, um emulador Android leve que o Collie cria para Macs pequenos. Emuladores desligados aparecem em `collie device list` como `avd:<nome>`, e abrir o painel de um deles o liga.
- Configuração do Android SDK em **Preferências → Android**, sem precisar do Android Studio.

O fluxo é o do [post de Dispositivos](/pt/features/devices): o agente lê a árvore de UI, toca pelo ref, tira um screenshot. Você assiste no painel.

Funciona. O problema é o custo.

## O que medimos

Testamos um modelo de agente mais barato numa tarefa simples: navegar entre algumas telas de um app, da primeira até uma terceira, passando por um botão e um menu.

Ele não conseguiu fazer do jeito que queríamos. Acabou escrevendo scripts em Python para "ler" o PNG do `collie device screenshot`.

Num emulador Android, cronometramos um passo:

| Passo | Tempo |
|---|---|
| `collie device ui` | 2,2 a 3,3 s (4 amostras) |
| `collie device tap --ref` | 0,1 s |

Quase todo o tempo de um passo ver → agir era o dump da UI. E a árvore tinha de 49 a 67 linhas, a maioria containers de layout só com id. Um botão só com ícone aparecia como `Button` com apenas um resource id, sem texto. Quem busca por texto não acha nada.

Nossa hipótese, ainda não confirmada: esse modelo nem recebe imagem de volta das ferramentas. Então o screenshot não servia, e a árvore era barulhenta demais.

## O que mudou na main

Nada disso está numa versão lançada ainda. A última tag é a v0.1.9. Está integrado na `main`.

### Uma árvore menor

`collie device ui` agora devolve só os nós úteis: os que têm rótulo ou são clicáveis. `collie device ui --all` traz a árvore inteira, para depurar. Os refs são os mesmos nos dois, então `e4` é o mesmo nó em qualquer um.

### Agir e olhar numa chamada só

`tap`, `swipe`, `text`, `key` e `launch` aceitam `--then ui`. O daemon age, espera, lê a tela e devolve, com refs novos. Uma chamada por passo, não duas.

```sh
collie device tap --ref e3 --then ui
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
- `collie device wait --text "Settings"` espera o texto aparecer. `--gone` espera sumir. `--stable` espera dois dumps iguais. Isso troca `sleep` seguido de outro `ui`.

### Coisas menores

- `--timing` em `ui` e `screen` devolve o tempo de cada etapa (adb, parse, agrupamento), para medir sem cronômetro.
- `collie device launch` abre a primeira activity LAUNCHER do app, em vez de usar o monkey.
- O painel de dispositivo agora desenha uma moldura conforme o tipo de aparelho (celular, dobrável, tablet, iPhone, iPad).

A orientação embutida do agente foi atualizada para ensinar esse ciclo: olhar com `device screen`, agir com `--then`, tirar screenshot só se nada mais mostra o elemento.

## O que ainda está em andamento

Sem esconder as pontas:

- **Velocidade.** O dump ainda leva de 2,7 a 3 s no Android, porque o tempo é do próprio `uiautomator`. Testamos fazer o dump por `/dev/tty` em vez de arquivo. Ganhou uns 5 a 10%, com muito ruído. Uma sessão persistente (um auxiliar residente no Android, algo em lote no iOS) está em avaliação. Nada decidido.
- **iOS.** A árvore compacta e o agrupamento da tela passam pelo código do iOS. O dump mais rápido e o conserto do launch são só Android. Não medimos os comandos novos no Simulador como fizemos no emulador.
- **Prova.** Ainda não publicamos números da tarefa com o modelo mais barato depois dessas mudanças. Até lá, leia como "construído", não como "resolvido".
- **Limites que continuam valendo.** Sem áudio. `device text` digita só ASCII. No iOS, só Simulador, não iPhone físico.

## Para onde achamos que isso vai

Tudo daqui para baixo é uma visão, não um roadmap. Sem datas, sem promessas.

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

Com o build do Collie vindo da `main`, ligue o emulador leve e deixe um agente dirigir:

```sh
collie panel open device --serial avd:collie-lite
collie device screen
collie device tap --text "Sign in" --then screen
```

Se você está num build lançado, a primeira linha e o `collie device ui` já funcionam. O resto chega na próxima versão.

Relacionados: [Dispositivos](/pt/features/devices), [Emulador](/pt/features/emulator).

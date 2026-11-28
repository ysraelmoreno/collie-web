---
title: "Daemon e socket"
description: "O collied é dono de todos os terminais; o app, a CLI e o servidor MCP falam com ele por um único socket Unix."
---

O Collie são três programas. O `collied` é o daemon: é dono dos terminais, dos cercados, da memória, do registro de trabalho e dos laços. O app (`Collie.app`) desenha o canvas. O `collie` é a linha de comando que os agentes e você usam. O app e a CLI nunca falam entre si: os dois falam com o `collied` por um socket Unix.

Leia esta página para entender por que os terminais continuam rodando depois que você fecha o app, por que um comando pede para reiniciar o serviço ou o que um agente pode e não pode fazer com o token dele. Para ver as peças do ponto de vista do canvas, veja [Como tudo se liga](/pt/docs/concepts/how-it-connects).

## O daemon

O `collied` roda como LaunchAgent com o rótulo `dev.collie.daemon`. O app grava o plist em `~/Library/LaunchAgents/dev.collie.daemon.plist` e o carrega. O plist liga `RunAtLoad` e `KeepAlive`: o launchd sobe o daemon no login e o sobe de novo se ele sair. A saída vai para `~/Library/Logs/Collie/collied.log`.

Como os terminais vivem no daemon e não no app, fechar o app não os encerra. Ao abrir o app de novo, ele se reconecta a eles.

O daemon aceita três argumentos e recusa qualquer outro com código de saída 2:

| Argumento | O que faz |
|---|---|
| `--root <caminho>` | Pasta de dados. O padrão é `~/Library/Application Support/Collie`. |
| `--no-terminal-sandbox` | Sobe os terminais sem sandbox. Só para desenvolver o Collie; a escolha fica no log da partida. |
| `--workspace <uuid>` | Workspace a carregar. Sem ele, o último guardado em `<root>/default-workspace`. |

```callout
kind: warning
title: Instale antes do primeiro uso
body: "Copie o `Collie.app` para `/Applications` antes de abri-lo. O launchd roda o daemon de dentro do bundle, e um app em `~/Documents`, `~/Desktop` ou `~/Downloads` faz o daemon travar na permissão de pastas do macOS (TCC). O app avisa quando detecta isso."
```

### A pasta de dados

Tudo o que o daemon guarda fica sob a raiz, que ele deixa em modo 0700 ao iniciar:

| Caminho | Conteúdo |
|---|---|
| `run/collied.sock` | O socket (0600, numa pasta 0700). |
| `run/terminals/<id>.pid` | Um pidfile por terminal rodando, para limpar depois de uma queda. |
| `admin.token` | O token do app (0600). Regravado a cada início. |
| `workspaces/<uuid>/` | Canvas, terminais, cercados. Em `terminals/` fica o excedente do histórico. |
| `hooks/` | Configurações, MCP e pastas de plug-in de cada terminal de agente. Veja [Ganchos dos agentes](/pt/docs/internals/agent-hooks). |
| `work/`, `memory/`, `lots/`, `herds/`, `curator/` | Registro de trabalho, memória, lotes, rebanhos, a fila do curador. |

Os logs não ficam na raiz: ficam em `~/Library/Logs/Collie/`.

## O socket

O socket é `<root>/run/collied.sock`. Quando o daemon inicia e encontra o arquivo, ele tenta conectar: se algo responde, para com "daemon already running"; se a conexão é recusada, o arquivo é velho e é removido.

### Formato

O protocolo é JSON delimitado por quebra de linha: um objeto por linha, sem prefixo de tamanho. Um pedido comum é uma linha que entra, uma que sai, e a conexão fecha. Um pedido pode ter até 4 MiB; maior que isso recebe `invalidArgs` "request too large". Uma conexão tem 30 segundos.

```json pedido
{"v":1,"id":"7f3c","terminalId":"…","token":"…","command":"list","args":{},"cwd":"/Users/eu/projeto"}
```

```json resposta
{"v":1,"id":"7f3c","ok":true,"result":{}}
```

Uma resposta com falha traz `error` com `code`, `message` e, às vezes, `retryAfter`. Os códigos são `unauthorized`, `notFound`, `notConnected`, `notRunning`, `ambiguous`, `invalidArgs`, `timeout`, `deadlock`, `notShepherd`, `tooMany`, `unsupportedVersion`, `daemonUnavailable`, `unavailable`, `conflict` e `internal`.

`v` é a versão do protocolo, hoje `1`. Qualquer outro valor é recusado com `unsupportedVersion`.

### Fluxos

Comandos que começam com `ui.` transformam a conexão num fluxo. São do app: conectar a um terminal (`ui.attach`), eventos do workspace, os painéis de dispositivo, os números de uso. A primeira linha é a resposta normal; depois dela, cada linha é um quadro com o tipo em `t` e os dados binários em base64 em `d`. O fluxo de um terminal começa com um quadro `replay` (o histórico) e segue com quadros `out` conforme o terminal escreve.

O daemon envia o replay e assina o fluxo num passo só, então nada se perde nem se repete entre os dois. Se um cliente fica mais de 4 MiB para trás, o daemon envia `overflow` e corta o fluxo; o app se reconecta sozinho e guarda até 64 KiB do que você digitar enquanto isso.

## Tokens e quem pode o quê

Todo pedido leva um token. Há dois tipos.

- **Token do terminal.** Cada terminal recebe um token aleatório próprio ao iniciar, em `COLLIE_TOKEN`, com o id em `COLLIE_TERMINAL_ID` e o caminho do socket em `COLLIE_SOCKET`. Os tokens vivem só na memória do daemon e são revogados quando ele para.
- **Token de admin.** O do app. 32 bytes aleatórios, gerados de novo a cada início e gravados em `admin.token`.

A CLI escolhe o token sozinha. Dentro de um terminal do Collie, usa o do terminal. Comandos que só o app pode rodar (`admin.*`, `ui.*` e alguns grupos, como `android.*`) pedem o token de admin, e dentro de um terminal a CLI recusa antes de ler o arquivo: "the admin token can't be used from inside a Collie terminal".

O arquivo sozinho não basta. Um daemon que roda de dentro do `Collie.app` assinado só aceita o token de admin vindo do próprio app: ele lê o hash do código (cdhash) do processo do outro lado do socket e compara com o de `Contents/MacOS/Collie`. Qualquer outro recebe:

```text
admin commands are only accepted from the Collie app: use the app (comandos de admin só pelo app Collie)
```

Uma cópia antiga do app ainda aberta depois de você substituí-lo no lugar é recusada até ser reaberta. O daemon também recusa o token de admin de qualquer processo dentro da sessão de um terminal, ou iniciado pelo daemon (hooks do git, provedores de uso).

```callout
kind: warning
title: Não isola processos do mesmo usuário
body: "Um processo que consiga parar e reiniciar o daemon, ou rodar outro daemon sobre os mesmos dados, obtém admin. O [sandbox](/pt/docs/features/sandbox) estreita isso, mas deixa saídas abertas (`osascript`, Keychain). Isolamento de verdade exige os agentes sob outro usuário do macOS."
```

### Alcance

Um token de terminal alcança só o que está ligado a ele por guia. Quando um nome não resolve, o roteador responde de três jeitos:

| Código | Quando |
|---|---|
| `notFound` | Nenhum terminal tem esse nome ("Terminal 'x' not found"). |
| `notConnected` | Existe, mas não está ligado a você por guia ("No connection to 'x'."), com uma dica: um Pastor pode pedir a guia; os demais leem que só o usuário pode ligá-la. |
| `ambiguous` | Dois terminais alcançáveis têm o mesmo nome. |

Um terminal sem sandbox não alcança nada, e nada o alcança. Comandos de Pastor respondem `notShepherd` aos outros terminais. Veja [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals).

## Os terminais dentro do daemon

Cada terminal é um pseudoterminal aberto pelo daemon e iniciado numa sessão própria. O daemon guarda em memória o último 1 MiB de saída, que é o que uma reconexão reenvia, e grava o resto em `workspaces/<ws>/terminals/<id>-<ms>.log` (0600), até 128 MiB por execução. Esses arquivos são apagados a cada início e ficam fora do backup dos dados.

## Reinício e atualização

O daemon nunca reinicia sozinho. Quando você substitui o app, o `collied` antigo continua rodando. O app compara o build do daemon com que está falando com o do seu bundle e, se forem diferentes, mostra:

> O serviço do Collie está desatualizado (versão anterior ainda rodando). Reiniciar agora? Os terminais abertos serão encerrados.

com **Reiniciar serviço** e **Depois**. O jeito manual é o mesmo comando que o botão roda:

```sh
launchctl kickstart -k gui/$(id -u)/dev.collie.daemon
```

O que um reinício faz:

```steps
items:
  - title: Para
    result: "O daemon fecha o socket, cancela os laços, para dispositivos e serviços de app, manda `SIGHUP` a todos os terminais e `SIGKILL` 2 s depois ao que sobrou, e revoga todos os tokens."
  - title: Limpa
    result: "Ao iniciar, grupos de processos deixados por um daemon que caiu (de `run/terminals/*.pid`) recebem o mesmo tratamento. Nunca são adotados de novo: o terminal deles morreu com o daemon antigo."
  - title: Recarrega
    result: "Os terminais voltam do `workspace.json` como registros sem processo (`stopped`). Jobs rodando viram `gone` e os laços param; `collie work run` de novo continua da próxima tarefa aberta."
```

Uma CLI mais nova que o daemon pode mandar um comando que o daemon não conhece. A CLI troca o "Unknown command" por `<comando>: reinicie o serviço para usar isto`: reinicie o serviço e tente de novo.

Quando o socket não existe ou recusa conexões, todo comando falha com `daemonUnavailable` "daemon não está rodando (collied)". Veja `~/Library/Logs/Collie/collied.log`.

## O servidor MCP

`collie mcp` é o servidor MCP que cada terminal Claude recebe (veja [Ganchos dos agentes](/pt/docs/internals/agent-hooks)). Ele fala JSON-RPC 2.0 por stdio e repassa cada `tools/call` ao socket com o mesmo token da CLI: uma ferramenta MCP pode exatamente o que o comando correspondente pode. A cada 10 segundos (`COLLIE_MCP_POLL_MS` muda o intervalo) ele confere os comandos de plug-in e os painéis que o terminal alcança, e manda `notifications/tools/list_changed` quando mudaram.

## Acesso pelo celular

O daemon também tem um gateway remoto para o celular (Preferências, "Celular"). Vem desligado e só escuta depois que você pareia um aparelho ali; ligá-lo é um comando só do app.

## Veja também

- [Ganchos dos agentes](/pt/docs/internals/agent-hooks): o que o daemon grava para cada agente e o que volta.
- [Curador da memória](/pt/docs/internals/curator): a fila de jobs em segundo plano dentro do daemon.
- [Referência da CLI](/pt/docs/reference/cli): todos os comandos que passam por este socket.

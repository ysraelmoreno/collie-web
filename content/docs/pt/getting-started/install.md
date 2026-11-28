---
title: "Instalar"
description: "Baixe o app assinado, coloque em /Applications e deixe ele instalar o serviço em segundo plano."
---

O Collie é um app de macOS com três partes: o app com o canvas, um serviço em segundo plano chamado `collied` e a linha de comando `collie`, que os agentes usam de dentro dos terminais. Você instala um `.app`; o app instala o serviço, e todo terminal que ele abre já tem o `collie` no `PATH`.

Esta página cobre o download, o primeiro uso, as atualizações e o build a partir do código. Com o Collie rodando, siga para o [primeiro cercado](/pt/docs/getting-started/first-paddock) ou direto para o [primeiro agente](/pt/docs/getting-started/first-agent).

## Requisitos

- macOS 15 ou mais novo, em Apple Silicon. Não há build para Intel.
- Pelo menos uma CLI de agente que você já usa e em que já fez login: Claude Code (`claude`), Codex (`codex`) ou Cursor (`cursor-agent`). O Collie não instala nenhuma e nunca guarda as credenciais delas. Um shell simples (`zsh`) funciona sem nenhuma.
- Opcional, para os painéis de dispositivo: `adb` para Android; Xcode 26+ e AXe para o Simulador iOS. Veja [Dispositivos](/pt/docs/features/devices).

## Baixar e mover para Aplicativos

```steps
items:
  - title: Baixe o dmg
    command: https://github.com/ysraelmoreno/collie/releases/latest/download/Collie.dmg
    result: A última versão, assinada com Developer ID e notarizada pela Apple; o Gatekeeper abre normalmente.
  - title: Arraste o Collie.app para /Applications
    result: Faça isso **antes** do primeiro uso.
  - title: Abra o Collie
    result: O app pede para instalar o serviço em segundo plano. Clique **Continuar**.
```

O serviço precisa partir de `/Applications`. O `collied` roda pelo launchd, e se o app estiver em `~/Documents`, `~/Desktop` ou `~/Downloads`, a permissão de pastas do macOS (TCC) trava o serviço. O app detecta e avisa: "Mova o Collie.app para /Applications…".

```callout
kind: note
title: Por que um serviço em segundo plano
body: A folha de consentimento diz direto — o `collied` mantém seus terminais vivos mesmo com o app fechado. Feche o app e os agentes continuam trabalhando; abra de novo e o canvas se reconecta a eles.
```

Se você clicar **Sair** nessa folha, nada é instalado e o app fecha.

## O que fica onde

| O quê | Onde |
|---|---|
| O app | `/Applications/Collie.app` |
| O serviço | LaunchAgent `dev.collie.daemon`, que roda o `collied` |
| Os dados do Collie | `~/Library/Application Support/Collie` (workspaces, memória, artifacts, rebanhos…) |
| Logs | `~/Library/Logs/Collie/` |

Dentro de um repositório, o Collie também usa uma pasta `.collie/`: `.collie/paddocks/` para as worktrees dos cercados e `.collie/memory/` para a memória do projeto. A pasta de cercados entra no exclude local do git do repositório, então nunca aparece no `git status`.

## Os agentes veem o ambiente do seu shell

Os agentes começam com o ambiente do seu shell interativo. O serviço roda `$SHELL -ilc` uma vez (lê o `.zshrc`, então o `node` do nvm e o seu `PATH` valem), com timeout de 5 s, e guarda o resultado por 10 min. Quando um rc do shell muda, a captura é refeita antes do próximo lançamento.

Se o seu `.zshrc` tem trechos lentos, pule-os durante a captura: o Collie define `COLLIE_ENV_CAPTURE=1` enquanto ela roda.

```sh .zshrc
if [ -z "$COLLIE_ENV_CAPTURE" ]; then
  # coisas lentas de que os agentes não precisam
fi
```

As variáveis do Collie vencem as suas, e o `collie` vem sempre primeiro no `PATH` do agente.

## Atualizar

Desde a 0.2.3 o app se atualiza pelo Sparkle: confere o feed da release, baixa o dmg, verifica a assinatura e o time da Apple, instala e reabre. Se um agente está no meio de um turno, a reabertura espera você ("Atualizar mesmo assim" / "Depois"). Em **Preferências › Atualizações** ficam **Procurar agora** e a chave de verificação automática.

O serviço continua rodando a versão antiga até ser reiniciado, então uma atualização não mata os terminais abertos. O app mostra um aviso com **Reiniciar serviço**; reiniciar fecha os terminais abertos, e o Collie nunca faz isso sozinho. Pelo shell:

```sh
launchctl kickstart -k gui/$(id -u)/dev.collie.daemon
```

Builds feitos por você (não assinados pelo time da release) nunca se atualizam sozinhos.

## Vindo do Orq

O Collie se chamava Orq. Feche o `Orq.app` (e qualquer `orqd`) antes e abra o Collie: ele move `~/Library/Application Support/Orq` para `…/Collie` com um único `rename`, deixa um symlink no lugar e troca o LaunchAgent antigo. A primeira abertura do Collie reinicia o serviço, então os terminais abertos fecham.

```callout
kind: warning
title: Não abra o Orq.app de novo
body: O app antigo ainda sabe subir o `orqd` sobre os mesmos dados e derrubar os terminais do Collie. Depois de conferir que o Collie funciona, apague `/Applications/Orq.app`.
```

## Compilar do código

Precisa de macOS 15 e Swift 6.2. Os scripts baixam versões fixadas e conferem o SHA-256 de cada arquivo.

```sh
scripts/fetch-weblibs.sh   # obrigatório: bibliotecas offline das páginas
scripts/bundle-app.sh      # gera build/Collie.app
```

Os opcionais ligam um recurso cada: `fetch-fonts.sh` (Space Grotesk e DM Mono), `fetch-scrcpy-server.sh` (vídeo do Android), `build-drawio.sh` (painel Diagrama), `build-figcraft.sh` (motor do Design; precisa do `rustup` com o alvo `wasm32-unknown-unknown`) e `make-signing-cert.sh` (assinatura local estável, para o macOS manter as permissões de pastas entre builds). Copie o `build/Collie.app` para `/Applications` antes do primeiro uso, como acima.

Rode o `swift test` fora de um terminal do Collie: os testes de sandbox usam `sandbox-exec`, que não abre um sandbox dentro de outro.

## Próximos passos

- [Primeiro cercado](/pt/docs/getting-started/first-paddock): uma branch isolada para um trabalho.
- [Primeiro agente](/pt/docs/getting-started/first-agent): um Pastor que delega.
- [Como tudo se liga](/pt/docs/concepts/how-it-connects): app, serviço, CLI e terminais.

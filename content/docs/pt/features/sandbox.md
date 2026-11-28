---
title: "Sandbox"
description: "Todo terminal roda num perfil de sandbox do macOS: o que ele fecha, o que deixa aberto e como liberar acesso."
---

Todo terminal do Collie, agentes e shells, roda dentro de um sandbox do macOS (Seatbelt, `sandbox-exec`). O daemon gera
um perfil por terminal, e ele cobre a árvore inteira de processos que o terminal abre. É uma fronteira de **arquivos**:
decide o que o agente lê e escreve. Não é uma fronteira de rede e não protege você do que roda fora dele (um terminal
livre, o Terminal.app, as suas ferramentas).

Leia esta página antes de escolher o modo do sandbox, antes de abrir um terminal livre e sempre que um agente disser que
uma escrita foi bloqueada. A apresentação da funcionalidade está em [/pt/features/sandbox](/pt/features/sandbox).

## Dois modos

O modo fica em Preferências, em "Modo do sandbox", e só o app o muda (nunca um terminal). A mudança vale para terminais
abertos depois: um terminal que já roda fica com o modo com que começou, até reiniciar.

```compare
before:
  title: "Aberto (padrão)"
  items:
    - O agente lê e escreve tudo na sua conta
    - Sem cartões de acesso e sem limite de projeto para `summon --cwd`, rebanhos e cercados
    - Só os internos do Collie continuam fechados
after:
  title: "Estrito"
  items:
    - Escrita só no projeto e nas pastas de trabalho das ferramentas
    - Segredos e perfis de navegador fechados, até para leitura
    - Escrita bloqueada vira um cartão que você responde
```

**"Aberto (padrão)" é o padrão.** Um workspace com um modo gravado desconhecido cai no estrito: o app falha fechado.

```callout
kind: warning
title: O que o modo aberto significa
body: No modo aberto, um agente, ou um texto malicioso que ele leia (prompt injection), pode ler as suas chaves e tokens e alterar ou apagar qualquer coisa na sua conta. O que ele gravar e você executar depois fora do sandbox (um rc do shell, um LaunchAgent, um binário no `PATH`, um hook do git) roda sem sandbox nenhum.
```

Mesmo no modo aberto, o Collie mantém fechado o que é dele: a pasta de dados e o `admin.token` (nem leitura nem escrita,
menos os arquivos que o Collie gera para aquele terminal), o bundle `Collie.app` e os LaunchAgents `dev.collie.*` (sem
escrita), sinais para processos fora do sandbox (sem `kill` no daemon ou no app), `launchctl` e `/usr/bin/open` pelo
caminho, e o socket do daemon, alcançado só pelo `collie` com o token do próprio terminal.

## O que o modo estrito fecha

- **Escrita fora do projeto.** O projeto é o primeiro ancestral da pasta do terminal que tem `.git` (procurado sem rodar
  o git, nunca acima do seu `$HOME`); num cercado, a worktree do cercado. O terminal também escreve nas pastas de
  trabalho das ferramentas: temporários, caches de build e de pacotes, o estado do próprio agente. Se a pasta do
  terminal for o próprio `~`, o projeto é toda a sua pasta pessoal; a folha de novo terminal avisa.
- **Nunca gravável**, qualquer que seja o projeto: os rc do shell (`.zshrc`, `.zprofile`, `.bashrc`…), `~/.gitconfig` e
  `~/.config/git`, `~/.config/gh`, `~/.npmrc`/`.yarnrc`, `~/Library/Preferences`, `~/Library/LaunchAgents`,
  `~/Applications`, o app e a pasta de dados do Collie.
- **A configuração global dos agentes** (`~/.claude`, `~/.codex`, `~/.cursor`, menos as pastas de estado deles e o
  `~/.claude.json`) fica só leitura. Uma escrita ali mostra o cartão normal, e só o seu clique a abre.
- **Segredos, nem leitura nem escrita:** `~/.ssh`, `~/.aws`, `~/.netrc`, `~/.git-credentials`, `~/.pypirc`,
  `~/.docker/config.json`, `~/.gnupg` e os perfis de navegador (Chrome, Chromium, Edge, Brave, Vivaldi, Arc, Opera,
  Firefox, Safari, Cookies). O git por SSH continua funcionando pelo `SSH_AUTH_SOCK`, sem ler as chaves. Assinar commits
  com gpg deixa de funcionar; assinar por ssh com o agente funciona.
- **`.git` aninhado.** Nenhum `.git` pode ser escrito em subpastas do projeto, porque o seu git e a sua IDE, fora do
  sandbox, rodariam a configuração dele. Clone em `/tmp`. Exceções: `.build/` e `Carthage/Checkouts/` na raiz do projeto.
- **Hooks e config do git:** `.git/hooks`, `.git/config`, `.git/info/attributes` e `commondir`. Commit, branch e as
  operações normais funcionam.

A leitura é livre fora dos segredos, dos perfis de navegador, de `~/Library/{Mail,Messages,Containers,Group Containers}`
e da pasta de dados do Collie. Uma leitura bloqueada nunca vira cartão.

## Liberar acesso

Quando o agente esbarra numa escrita fora do projeto que pode ser liberada, ele recebe o erro na hora e o nó do terminal
mostra um cartão: o agente tentou escrever ou apagar um caminho, com **Liberar este caminho**, **Liberar a pasta** e
**Negar**, e a opção "para o lote", que vale para os terminais atuais e futuros do lote. Nada abre sem o seu clique.

O agente também pode pedir antes, que é o caminho educado:

```sh
collie access request ~/Documents/shared-assets --write --reason "copiar os ícones exportados"
collie access list   # o que você liberou para este terminal e o lote dele
```

O motivo é limpo de segredos e aparece no mesmo cartão. Um pedido `--read` não mostra cartão: a resposta diz que a
leitura já é livre, ou por que aquele caminho nunca é liberado.

```steps
items:
  - title: O agente esbarra numa escrita bloqueada
    result: A ferramenta falha e um cartão aparece no nó do terminal.
  - title: Você clica em liberar
    result: O terminal reinicia com o sandbox mais largo.
  - title: A conversa continua
    result: "O Claude retoma com `--continue` (só se já havia conversa); Codex e Cursor reabrem."
```

O processo em andamento se perde; a conversa não. Os liberados ficam salvos, aparecem no popover do terminal e na aba
"Liberados" do lote, e **Revogar** reinicia os terminais que ele alcançava. Alguns caminhos nunca abrem por clique, em
nenhum modo: os dados e o token do Collie, segredos, `.git/hooks`, `.git/config`, qualquer `.git`, `~/Library` inteiro e
as pastas Keychains, Mail, Messages, Cookies, Safari e Containers dele, e as pastas que contêm o app do Collie.

## `open` e os atalhos das ferramentas

Dentro de um terminal, `open` é `collie open <url|app>`: o daemon o executa fora do sandbox, mas só para URLs http(s) e
mailto e para apps instalados (`/Applications`, `~/Applications`, os do Xcode; `open -a Simulator` funciona). Scripts,
`.command`, executáveis, documentos, pastas e apps construídos pelo agente são recusados.

O `PATH` do terminal tem atalhos de `swift`, `swift-build`, `swift-test`, `xcrun swift` e `xcodebuild` que acrescentam
`--disable-sandbox` e `-IDEPackageSupportDisableManifestSandbox=YES`, porque os sandboxes do SwiftPM e do Xcode não
aninham dentro do Seatbelt. Chamar a ferramenta pelo caminho absoluto, ou de um shell que não seja o zsh, traz o erro de
aninhamento de volta. Pelo mesmo motivo o Collie liga o Claude com `sandbox.enabled=false`, o Codex com
`--sandbox danger-full-access` e o cursor-agent com `--sandbox disabled`: quem os confina é o sandbox do Collie.

## Terminal livre

Na folha de novo terminal, "Terminal livre (sem sandbox)" é para o seu trabalho. Só você cria um, só pelo app; agente,
`summon` e rebanho nunca criam. Ele não tem guias, fica fora dos lotes e leva a marca "livre" no nó. Roda como o seu
usuário, sem proteção nenhuma.

## Riscos que continuam abertos

Foram aceitos de propósito, e nenhum é uma fronteira. Um agente mal-intencionado consegue rodar código fora do sandbox
por qualquer um deles.

- `osascript` / Apple Events e o socket do Docker seguem abertos (automação e containers dependem deles).
- Keychain: o `/usr/bin/security` roda e `~/Library/Keychains` é gravável, para o Claude manter o login.
- `~/.config/gh` é legível, para o `git push` por HTTPS funcionar, e qualquer agente pode usar o seu login do GitHub.
- `~/.claude.json` é gravável: um agente poderia plantar ali um servidor MCP global.
- `launchctl` e `open` são bloqueados só pelo caminho; uma cópia do binário roda.
- Os caches graváveis (`~/.npm`, `~/.cache`, `~/.cargo/registry`, DerivedData) guardam código que roda fora.
- Configuração e scripts do projeto (`.claude/settings.json`, `.mcp.json`, `package.json`, Makefile…) rodam fora do
  sandbox quando você os executa.
- A memória é compartilhada: o que um agente com sandbox salva em `~/.claude/projects` ou com `collie memory save` pode
  chegar ao prompt de um terminal livre. Revise as memórias antes de confiar nelas ali (veja
  [Memória](/pt/docs/features/memory)).

```callout
kind: note
body: Revise o que o agente mudou, incluindo gitlinks novos em `git diff --cached`, antes de rodar as suas próprias ferramentas no projeto. Isolamento de verdade exige os agentes sob outro usuário do macOS.
```

## Como se conecta

- Terminais e cercados: a raiz do projeto vem da pasta do terminal ou da worktree do cercado, veja
  [Cercados e worktrees](/pt/docs/concepts/paddocks-and-worktrees). O sandbox de um field é a worktree da faixa dele
  ([Fields](/pt/docs/features/fields)).
- O sandbox não é fronteira de rede. O tráfego capturado no painel [Rede](/pt/docs/features/network) é protegido pela
  guia.
- Os helpers de plug-in rodam num sandbox próprio, mais fechado que o de um terminal ([Plug-ins](/pt/docs/features/plugins)).
- O token de admin e o app assinado: [Daemon e socket](/pt/docs/internals/daemon-and-socket).

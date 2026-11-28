---
title: "Plug-ins"
description: "Painéis e comandos de terceiros sem recompilar o Collie, mais ganchos de agente que orientam ou bloqueiam um turno."
---

Um plug-in acrescenta um painel e comandos de agente ao Collie sem recompilá-lo. Nesta fase um plug-in é **só interface
web**: uma pasta com o manifesto `collie-plugin.json` e uma página em `ui/` que roda numa web view trancada, sem rede e
sem acesso ao projeto. Um plug-in também pode declarar **ganchos de agente**: um helper pequeno que vê os arquivos que um
agente escreveu e responde com orientação ou bloqueio.

Use quando o time precisa de um painel que o Collie não tem (notas, checklist, painel do projeto) ou quer uma regra
aplicada a toda edição dos agentes. A visão geral está em [/pt/features/plugins](/pt/features/plugins).

## Instalar

Instalar é **só seu**: os agentes não instalam, ligam, desligam nem removem plug-ins.

- No app, Preferências → Plug-ins → **Instalar de uma pasta…**, que mostra antes os comandos e o que o plug-in pode fazer.
- Ou `collie plugin install --path <pasta>`, rodado fora de um terminal do Collie. Substituir um id já instalado pede
  `--replace`.

```steps
items:
  - title: Copiar e trancar
    result: "A pasta vai para `<root>/plugins/<id>/<versão>/`, somente leitura (arquivos 0444, pastas 0555)."
  - title: Fixar
    result: "O SHA-256 dela fica registrado em `installed.json`."
  - title: Conferir a cada início
    result: "O daemon calcula o hash de novo; uma pasta alterada não carrega e mostra \"conteúdo alterado desde a instalação; instale de novo\"."
```

A pasta não pode ter links simbólicos ou hard links, arquivos especiais, mais de 5.000 entradas nem mais de 64 MiB no
total.

## Estrutura e manifesto

```
collie-plugin.json   manifesto
ui/index.html        a página (qualquer .html em ui/)
ui/…                 scripts, estilos, imagens, fontes
LICENSE
```

```json collie-plugin.json
{
  "apiVersion": 1,
  "id": "notas",
  "name": "Notas",
  "version": "0.1.0",
  "placements": ["dock.right", "dock.left", "dock.bottom", "canvas"],
  "defaultPlacement": "dock.right",
  "ui": "ui/index.html",
  "commands": [
    { "name": "add", "summary": "Add a note", "runs": "ui",
      "params": [{ "name": "text", "type": "rest", "required": true, "positional": true, "help": "Note text" }] }
  ],
  "events": ["notas.changed"],
  "stateKeys": []
}
```

- `id` segue `[a-z][a-z0-9-]{1,31}` e não pode ser o id de um plug-in do Collie (`browser`, `design`…) nem a primeira
  palavra de um comando do Collie (`panel`, `artifact`…). Ele nomeia os comandos: `collie notas add "comprar café"`, ou
  o MCP `notas_add`.
- Até 64 comandos, cada um com `runs: "ui"`, `timeout` de 1–300 s (padrão 30) e `params` tipados (`string`, `int`,
  `flag`, `rest`). `outputFile: true` faz do resultado um arquivo entregue a quem chamou, com `--out`.
- `apiVersion` acima de 1 recebe "precisa de um Collie mais novo". Chaves desconhecidas são ignoradas.

Um exemplo completo vem no repositório em `Examples/plugins/notas`.

## Quem alcança os comandos

Um agente só alcança os comandos de um plug-in quando tem **uma guia até um painel desse plug-in**, a mesma regra dos
painéis do Collie ([Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals)). O painel abre como os do Collie:
pela paleta, com `collie panel open <id>` ou num rebanho. A orientação dos agentes nunca cita plug-ins externos; o Pastor
vê uma linha, `collie plugin list`.

## A página

A página é servida de `collie-plugin://<id>/…`, e só os arquivos em `ui/` são alcançáveis. Toda carga de rede é
bloqueada (`http(s)`, `ws(s)`, `file`, WebRTC), câmera e microfone são negados e o armazenamento web não persiste. A
página nunca vê o pedido do agente, ids de terminal, tokens nem caminhos do Collie: só os argumentos de cada comando.

| Chamada | O que faz |
|---|---|
| `collie.onCommand(async (name, args) => result)` | Trata os comandos dos agentes; o resultado é JSON de até 1 MiB, um throw vira o erro do agente |
| `collie.emit(event, payload)` | Envia um evento declarado, payload de até 64 KiB |
| `collie.state.get()` / `set(obj)` | Estado do painel de até 256 KiB, mantido entre reinícios e atualizações |
| `collie.files.output(name, base64)` | Grava um arquivo de saída de até 16 MiB para um comando `outputFile` |
| `collie.theme` | `{scheme, tokens}`; os tokens também viram variáveis CSS em `:root` |

Instalar uma versão nova recarrega os painéis abertos. Remover ou desligar faz um comando em andamento falhar com
`unavailable`. Uma página cujo processo morre recarrega, até 3 vezes.

## Ganchos de agente

Com `helper` e `hooks`, um plug-in recebe os eventos dos agentes e os responde. A instalação mostra antes o que ele pode
fazer, e uma versão nova que pede mais exige nova confirmação.

```json collie-plugin.json
{ "helper": "bin/vizinho",
  "hooks": ["edit", "stop"],
  "permissions": { "project": "read" } }
```

O helper recebe um evento JSON no stdin e responde um JSON no stdout:

```tabs
tabs:
  - label: Evento
    lang: json
    code: |
      { "apiVersion": 1, "event": "edit", "project": "/abs/worktree",
        "files": ["Sources/X/FooPanel.swift"], "agent": "claude", "paddock": "nome" }
  - label: Resposta
    lang: json
    code: |
      { "guide": "texto para o agente" }
      { "block": "motivo e a causa raiz a atacar" }
```

- `edit` dispara depois de uma ferramenta de escrita do agente; `guide` chega ao agente como contexto, `block` como
  bloqueio da ferramenta.
- `stop` dispara no fim do turno, com os arquivos escritos nele; `block` impede o fim do turno uma vez.
- O plug-in recebe só caminhos, nunca o pedido do usuário nem a conversa. O texto vai até 2.000 caracteres por plug-in,
  4.000 somados.

```callout
kind: note
title: Falha aberta, num sandbox
body: O helper lê o projeto e a própria pasta, escreve só em `<root>/plugins-data/<id>/` e não tem rede nem acesso ao home. Um processo por evento, 3 s para todos os plug-ins juntos. Estouro, saída diferente de zero ou JSON inválido são ignorados; o agente nunca vê erro do helper.
```

Terminais Claude recebem os ganchos direto. Terminais Cursor também: um `Write` do Cursor vira o evento `edit` (um
bloqueio chega como contexto, porque a ferramenta já rodou), e o `stop` é gerado quando um `ask` fecha por ociosidade.
Veja [Ganchos de agente](/pt/docs/internals/agent-hooks).

### Vizinho

O **Vizinho** é o plug-in de exemplo com ganchos (`Examples/plugins/vizinho`, gerado com
`scripts/build-vizinho-plugin.sh`, fora do bundle). Quando um agente escreve um arquivo, ele olha os arquivos irmãos do
mesmo tipo (mesma pasta, extensão e sufixo de tipo) e, se quase todos seguem uma forma que o arquivo novo não segue,
avisa o agente e cita um arquivo modelo. No fim do turno ele propõe convenções quase unânimes como cercas em
`propostas.json`, na pasta de dados dele; você aprova uma copiando-a para `cercas.json` na mesma pasta. Só as cercas
aprovadas bloqueiam um turno; arquivos que já quebravam uma cerca ficam tolerados até serem corrigidos.

## O catálogo

```callout
kind: status
title: Fase 1, sem uso até um catálogo ser publicado
body: "O catálogo assinado saiu na 0.3.0, mas nenhum catálogo foi publicado ainda. Os comandos e a aba **Descobrir** do app estão lá para quando houver."
```

`collie plugin catalog [--refresh]` lista o catálogo e `collie plugin install-catalog <id> --version <v>` instala ou
atualiza (os dois só do usuário). O daemon aceita um catálogo só com assinatura Ed25519 válida e número de sequência não
menor que o do último; ele fica velho depois de 30 dias. Um pacote é conferido por SHA-256 e pelo hash da árvore, e uma
versão recolhida é desligada, mesmo se veio de uma pasta. Um plug-in de outro autor mostra
"<autor> · revisado pelo Collie" no cartão.

Antes de enviar, `collie plugin validate <pasta>` recusa o que uma instalação recusaria, mais as regras do catálogo
(`permissions.network` vazio, helper assinado como `dev.collie.plugin.<id>`). Saída 0 imprime `ok`; saída 1 imprime um
motivo por linha.

## Como se conecta

- Painéis e guias: [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals).
- Os eventos dos ganchos e como Claude e Cursor os entregam: [Ganchos de agente](/pt/docs/internals/agent-hooks).
- Um rebanho pode abrir o painel de um plug-in e levar os `stateKeys` dele ([Rebanhos](/pt/docs/features/herds)).
- O sandbox do helper é mais fechado que o de um terminal ([Sandbox](/pt/docs/features/sandbox)).

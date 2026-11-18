# PRD 02 — Seção 05 · Apps (adotar ferramentas)

Leia antes: [00-overview.md](00-overview.md). `id`: `apps`.

## O que é (fatos: specs `2026-11-08-paddock-apps-design.md` e `2026-11-15-app-adopt-and-generative-ui-design.md`,
comandos `app.adopt|new|attach|list|context|snapshot|event|logs` em `Sources/`)

- Um **app do cercado** é uma ferramenta local sua (um servidor web em loopback) ligada a um cercado, com duas faces:
  para você, um painel vivo no canvas; para o agente, as ações do app como ferramentas, seus eventos como avisos e o
  contexto (o que você selecionou).
- `collie app adopt <id> --url http://127.0.0.1:<porta> --start "<cmd>"` liga uma ferramenta que **já existe**, sem
  escrever manifesto à mão. Descobre comandos por `collie.json` ou OpenAPI quando há.
- O agente pode escrever o manifesto; **só o dono aprova** (cartão, manifesto fixado por SHA-256; mudou, pede de novo).
- Só loopback (127.0.0.1). O daemon sobe e supervisiona o serviço.

**Correções (verificadas em `Commands.swift`):** o comando de um app é `<id>.<cmd>` (`collie metrics.errors`), não `collie metrics clear`; depois do `adopt` o agente roda `collie app attach <id>`; comandos POST/PUT/DELETE pedem confirmação do dono a cada chamada, por isso o GIF usa um comando GET (`errors`) em vez de "limpar o log".

Antes de escrever a copy final: confira a assinatura real de `app adopt` em `Sources/` (flags) e ajuste o comando.
Generative UI (fase 2 do spec) **não entra**.

## O que falar

Mensagem: a ferramenta interna que você já tem vira painel no canvas e ferramenta do agente com um comando.

| | EN | PT-BR |
|---|---|---|
| Eyebrow | `05 · APPS` | `05 · APPS` |
| H2 | Adopt the tools you already have. | Adote as ferramentas que você já tem. |
| Lead | Point Collie at a local tool and it becomes a live panel on the canvas. Your agents call its actions and hear its events, right where you work. | Aponte o Collie para uma ferramenta local e ela vira um painel vivo no canvas. Seus agentes chamam as ações dela e ouvem os eventos, ali onde você trabalha. |
| Bullets | One command, no manifest to write · Actions become agent tools, events become notices · An agent can propose an app; only you approve it | Um comando, sem manifesto para escrever · Ações viram ferramentas do agente, eventos viram avisos · Um agente pode propor um app; só você aprova |
| Prompt | Attach our metrics viewer and show the recent errors | Ligue nosso visualizador de métricas e mostre os erros recentes |
| Command | `collie app adopt metrics --url http://127.0.0.1:8767` | igual |

## GIF `apps` — "de localhost a painel"

Cena: canvas com um terminal `shepherd · claude` à esquerda; à direita, espaço vazio onde o painel vai nascer.

1. **"You already have a local tool."** Um chip solto `localhost:8767 · metrics viewer` flutua fora do canvas.
2. **"One command adopts it."** Terminal digita `collie app adopt metrics --url http://127.0.0.1:8767`; aparece o
   cartão `Approve app "metrics"? 3 commands · loopback only` → **Approve**.
3. **"It becomes a live panel."** O chip vira um `PanelCard` `metrics · app` com uma lista de eventos chegando; guia
   tracejada liga terminal e painel.
4. **"And a tool for your agents."** Terminal: `↳ collie app attach metrics` / `ok`, depois `› Show the recent errors` / `↳ collie metrics.errors` /
   `2 errors`; as linhas de erro do painel ficam em destaque.

Poster: batida 3 (painel + guia).

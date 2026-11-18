# PRD 03 — Seção 06 · Network (interceptar e mapear tráfego)

Leia antes: [00-overview.md](00-overview.md). `id`: `network`.

## O que é (fatos: `Sources/CollieNetwork`, `Sources/ColliePlugins/NetworkPanel.swift`, comandos
`network.attach|detach|status|list|get|flow|curl|clear`)

- O painel **Rede** captura o tráfego HTTP(S) do emulador Android anexado (um proxy por aparelho).
- O agente lista os fluxos, abre um (cabeçalhos, corpo, status, tempo) e o reexporta como `curl` para reproduzir.
- A guia é a permissão: só o terminal preso a um painel de rede o lê.
- Limites que não podem ser escondidos: só o tráfego do emulador anexado (não o do Mac); app com certificate pinning
  fica invisível.

- **Map local** (decisão do Shepherd, 2026-11-18: entra): `collie network rule-add [--from <id>] [--method] [--host]
  [--path] [--query] [--status] [--header] [--body|--body-file] [--delay] [--drop] [--name] [--disabled]` responde no
  lugar do servidor. `--from <id>` parte da resposta de um fluxo capturado; as flags sobrescrevem. A primeira regra
  ligada que casa vence. **A regra de um terminal espera o OK do dono num cartão.** `rule-list|rule-remove|rule-enable|
  rule-disable|rule-clear` completam. O painel tem aba Regras e marca o fluxo atendido por regra ("mapeado · nome");
  o servidor não é chamado.
- Fora: atraso/queda existem (`--delay`, `--drop`) mas não aparecem no GIF.

Verificado: `network list` devolve `{id,method,host,path,status,size,durationMs,state}`; flags de `rule-add` conferidas com `collie network --help`.

## O que falar

Mensagem: o agente vê o que o app realmente mandou e recebeu, e para de adivinhar por que a tela quebrou.

| | EN | PT-BR |
|---|---|---|
| Eyebrow | `06 · NETWORK` | `06 · REDE` |
| H2 | Intercept every request your app makes. | Intercepte cada requisição do seu app. |
| Lead | The Network panel captures the emulator’s HTTP(S) traffic. Your agent reads the request that failed, then answers it with a rule of its own to test the fix, once you approve. | O painel Rede captura o tráfego HTTP(S) do emulador. Seu agente lê a requisição que falhou e a responde com uma regra própria para testar a correção, depois que você aprova. |
| Bullets | Requests, responses and WebSockets from the attached emulator · Any flow as curl, or as a rule that answers in the server’s place · An agent’s rule waits for your OK; mapped flows are marked | Requisições, respostas e WebSockets do emulador anexado · Qualquer fluxo como curl, ou como regra que responde no lugar do servidor · A regra de um agente espera o seu OK; fluxos mapeados ficam marcados |
| Prompt | Make checkout succeed so I can test the app | Faça o checkout passar para eu testar o app |
| Command | `collie network rule-add --from 3 --status 200 --body '{"ok":true}'` | igual |

Limites a não esconder: só o tráfego do emulador anexado; app com certificate pinning fica invisível.

## GIF `network` — "ache o 500 e responda no lugar"

Cena: telefone `pixel-8 · device` (esq.), painel `network` (meio), terminal `qa · claude` (dir.). Guias: device → network → qa.

1. **"The app talks. Collie listens."** Toque em Pay; linhas: `GET /v2/cart 200 84ms`, `GET /v2/user 200 61ms`,
   `POST /v2/checkout 500 912ms` (500 em aviso). Telefone: "Payment failed".
2. **"The agent finds the 500."** `› Why does checkout fail?` / `↳ collie network list` / `↳ collie network get 3` /
   `500 · missing currency`; a linha 500 destaca.
3. **"A rule answers instead. You approve."** `↳ collie network rule-add --from 3 --status 200 --body '{"ok":true}'`,
   "waiting for the owner"; cartão `Allow network rule?` → Allow; pílula `1 rule on · fix-currency`.
4. **"The app gets the mapped answer."** Novo Pay: linha `POST /v2/checkout 200 mapped`; telefone "Order placed ✓";
   agente: "Cause: missing currency. The app copes with a 200."

Poster: 11 s (batida 4). Entregue: `public/features/network.{mp4,jpg,gif}`, render por `scripts/capture-gif.sh network 11`.

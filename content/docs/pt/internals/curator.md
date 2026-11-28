---
title: "Curador da memória"
description: "A fila em segundo plano do daemon que transforma conversas e correções em memórias, uma chamada pequena de modelo por vez."
---

O curador é a parte da [Memória](/pt/docs/features/memory) que precisa de um modelo. Ele lê trechos curtos do que aconteceu (uma correção que você digitou, a parte nova de uma conversa, uma memória que alguém marcou como errada) e responde com uma lista de operações: crie isto, retire aquilo, junte estas duas. O daemon confere cada operação e a aplica. O modelo nunca grava arquivo, nunca roda ferramenta e nunca vê o seu repositório.

Ele roda no [daemon](/pt/docs/internals/daemon-and-socket), um job por vez, pela CLI `claude` ou `cursor-agent` que já tem login no seu Mac. Você escolhe qual em Preferências › "Memória", seção "Curador da memória".

## O que ele faz

Cada job tem um tipo. Quando vários esperam, rodam nesta ordem:

| Tipo | Quem dispara | O que se pede ao modelo |
|---|---|---|
| `correction` | Um prompt com cara de correção ("não, use …", em português ou inglês) | Transformar em feedback, armadilha ou procedimento; retirar até 3 memórias que ele contradiz. No máximo 5 por terminal por hora. |
| `verifyContested` | `collie memory flag <id> --wrong` ou `--outdated`, ou uma checagem que falhou (um arquivo ou commit citado pela memória sumiu) | Esta memória ainda é verdade? |
| `verifyPromotion` | Uma memória usada o bastante para virar longo prazo | Confirmar antes da promoção. No máximo 3 por dia. |
| `proposals` | Um trabalho que fechou | Revisar as propostas que o daemon montou do registro de trabalho, até 10 por job. |
| `pitfall` | Uma armadilha nova sem classe | Juntá-la a uma classe de armadilhas parecidas. |
| `conversation` | Veja abaixo | Até 5 decisões e armadilhas da parte nova de uma conversa. |
| `consolidate` | Um acervo na hora (uma vez por dia, ou 20 memórias novas) | Juntar duplicadas e retirar as velhas em até 6 grupos. Nunca criar. |
| `procedure` | Os mesmos 3 ou mais passos de tarefa, na mesma ordem, em 3 ou mais trabalhos fechados | Escrever como procedimento. |
| `docTerms` | `memory doc-add` | Termos de busca para cada lote de 20 trechos de um documento ingerido. |

### Captura da conversa

O curador lê a parte nova de uma conversa do Claude ou do Cursor pela transcrição e guarda até 5 itens. Decisões e armadilhas viram memórias ativas; uma preferência vira proposta, e só se foi você quem a disse naquele trecho.

```steps
items:
  - title: Ociosidade
    result: "10 min depois que um agente Claude para, se o trecho tem ao menos 3 mensagens suas. As transcrições do Cursor são conferidas a cada 30 s."
  - title: Forçada
    result: "Ao compactar, no fim da sessão, quando um trabalho fecha (`collie work done` ou merge) e quando você pede: `collie memory capture` ou \"Salvar na memória\" no menu do nó."
  - title: Uma vez
    result: "Cada trecho é lido uma vez. Vai para o lote do terminal, senão para o projeto, senão para o global."
```

O trecho guarda só o seu texto e o do agente: nada de entrada ou saída de ferramenta, de raciocínio ou de lembretes do sistema; textos colados são cortados em 500 caracteres e segredos conhecidos são escondidos. O caminho da transcrição é o que o gancho do próprio terminal informou, e precisa ser um `.jsonl` comum dentro da pasta `projects` do agente, não um link.

## A fila

Os jobs são arquivos JSON em `<root>/curator/jobs/` (arquivos 0600 numa pasta 0700). O curador acorda com um job novo, com uma mudança nas Preferências e a cada 10 minutos.

- **Tentativas.** Um job tem 3. A tentativa é gravada antes da chamada, então uma queda também conta. Depois de 3 falhas o job vai para `curator/failed/`, onde é apagado depois de 7 dias.
- **Falha do ambiente não conta.** Uma chamada barrada pelo sandbox, sem rede ou sem resolução de nomes (`getaddrinfo`, `ENOTFOUND`, …), sem a pasta de trabalho, ou com a cota do provedor gasta não gasta tentativa: o job espera a próxima volta. Uma cota sem prazo de retorno espera 30 min.
- **Pausa.** O curador guarda em memória as últimas 20 chamadas de cada provedor. Com 10 ruins (respostas inválidas, falhas do ambiente), o provedor é pausado com "saída inválida em X de Y (troque de modelo)". A conta zera num reinício e quando você troca de provedor ou de modelo.
- **Tamanho.** No máximo 200 jobs esperando; uma correção nova tira o job de propostas mais antigo. O mesmo job em até 60 s entra uma vez só.
- **Limite diário.** Nenhum por padrão. Em "Limite" você define jobs por dia ("vazio: sem limite; 0: desligado"). Com limite, o último quarto fica reservado às correções.

## Uma chamada

```tabs
tabs:
  - label: Claude
    lang: sh
    code: |
      sandbox-exec -f <perfil> claude -p --model haiku \
        --output-format json --json-schema <schema> --tools "" \
        --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
        --setting-sources project,local --safe-mode \
        --disable-slash-commands --no-session-persistence \
        --permission-prompts none --max-budget-usd 0.05 \
        --system-prompt <instruções>
  - label: Cursor
    lang: sh
    code: |
      cursor-agent -p --output-format json --mode ask \
        --sandbox disabled --trust --workspace <pasta temporária> [--model=<m>]
  - label: Notas
    body: "Claude: `haiku` por padrão (ou `sonnet`), 60 s, prompt pelo stdin, numa pasta temporária vazia. Cursor: 120 s, uma home própria em `curator/cursor-home`, uma configuração que nega tudo regravada antes de cada chamada e conferida depois; se mudou, a resposta é descartada."
```

A entrada de todo job é cortada em 12 000 caracteres. Os dados vão entre marcas `DADOS-<nonce>`, e as instruções dizem que o que está dentro é dado, nunca instrução. A resposta precisa seguir um schema JSON; operações que citam memória, escopo ou tipo desconhecido são descartadas, e o texto tem teto (título 120, corpo 1200 caracteres). Uma resposta fora do formato conta como inválida e gasta uma tentativa.

### O sandbox de uma chamada

Cada chamada roda sob um perfil Seatbelt próprio que nega por padrão. Ela lê as pastas do sistema, grava só a sua pasta temporária (e, no Claude, o estado do próprio Claude), abre o resolvedor de nomes do sistema e nada mais da máquina local. O Claude pode acessar a rede; o Cursor, só a porta 443. O ambiente perde todas as variáveis `COLLIE_*` e as chaves de API (`ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, variáveis de Bedrock e Vertex): a chamada usa o login da CLI, nunca uma chave do seu shell.

## Claude ou Cursor

| | Claude | Cursor |
|---|---|---|
| Confiança | Total: as operações se aplicam | Limitada: criar vira proposta; ativar, apagar ou reescrever vira pergunta ("Precisa de você") |
| Consentimento | Não é pedido com login de assinatura; é pedido com login cobrado por uso ou não reconhecido | Sempre pedido antes |
| Login | O login do `claude` deste Mac | "Entrar no Cursor para o curador", um login só do curador |
| Custo | Tokens e custo registrados | Tokens registrados, sem custo |

O diálogo de consentimento é "Enviar dados ao curador?". "Testar com uma chamada…" faz 3 chamadas com dados sintéticos, que contam no limite de hoje, e não grava nada na memória.

## O que acontece com uma memória

O curador é uma das entradas do ciclo de vida da memória. Os números:

| Etapa | Regra |
|---|---|
| Provisória | Uma memória de projeto nova. Arquivada (de forma reversível) se ninguém a usa: 21 dias para decisões, 60 para armadilhas e procedimentos. Feedback nunca vence. |
| Ganha | 2 usos com proveito em 2 dias diferentes, em 2 sessões diferentes. |
| Longo prazo | 8 usos com proveito em 4 dias diferentes ao longo de pelo menos 14 dias, sem contestação em 30 dias, e confirmada por um job `verifyPromotion`. No máximo 12 por projeto. |
| Contestada | Marcada `--wrong` ou `--outdated`. O curador checa de novo: retirada se está errada, marcas limpas se ainda vale. Sem modelo disponível, uma checagem de arquivo ou commit que falha a arquiva. 14 dias contestada sem veredito vai para "Precisa de você". |
| Proposta | Uma proposta da captura de trabalho com 14 dias, cujas checagens ainda passam, vinda de um curador de confiança total, vira ativa. |

Memórias fixadas e memórias que você editou ficam fora desse ciclo: uma mudança nelas vira pergunta. O curador nunca retira os seus feedbacks nem os seus procedimentos.

```callout
kind: note
title: Acompanhar
body: "`collie memory stats` e a aba \"Observabilidade\" do painel Memória mostram o tipo, os tokens, o custo e a duração de cada chamada. Dois alertas: \"Curador falhando\" (jobs em `failed/`, ou 3 ou mais chamadas com erro no período) e \"Fila do curador parada\" (jobs esperando e nenhuma chamada em 24 h)."
```

## Veja também

- [Memória](/pt/docs/features/memory): escopos, o que é injetado e quando.
- [Ganchos dos agentes](/pt/docs/internals/agent-hooks): os ganchos que capturam conversas e detectam correções.
- [Daemon e socket](/pt/docs/internals/daemon-and-socket): onde a fila mora.

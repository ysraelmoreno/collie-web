---
title: "Rede"
description: "Capture o tráfego HTTP(S) de um emulador Android e responda requisições com regras de mapeamento que você aprova."
---

O painel **Rede** captura as requisições HTTP(S) de um emulador Android: método, host, caminho, status, tamanho e tempo,
com cabeçalhos e corpos de cada uma. Ele também responde uma requisição no lugar do servidor: uma regra de mapeamento
devolve uma resposta que você escreveu, ou corta a conexão, e o servidor nunca é chamado.

Use quando uma tela quebra e a causa provavelmente está numa requisição (um campo faltando, um 500, uma resposta lenta),
e quando você quer testar o app contra uma resposta que o backend ainda não dá. A visão geral está em
[/pt/features/network](/pt/features/network).

## Requisitos

- **mitmproxy.** O proxy é o `mitmdump`, que não vem no bundle. Instale com `brew install --cask mitmproxy`, ou aponte
  `COLLIE_MITMDUMP` para o binário. Sem ele, o attach falha com "mitmdump not found".
- **Um emulador Android com imagem que aceita root.** Só emuladores são capturados (serial começando com `emulator-`),
  não aparelhos físicos nem o Simulador iOS. A imagem precisa aceitar `adb root`: uma imagem "Google APIs" ou AOSP, ou o
  AVD `collie-lite`. Imagens com Google Play e builds de produção são recusadas, e o erro diz qual imagem usar. Veja
  [Dispositivos](/pt/docs/features/devices) para emuladores e o `collie-lite`.

## Abrir o painel e interceptar

No app, **Abrir painel… → Rede**; um Pastor pode rodar `collie panel open network`. No painel, escolha o emulador e
clique **Interceptar**; **Parar** encerra. Por um terminal:

```sh
collie network attach            # o único emulador online, ou --serial emulator-5554
collie network status            # {attached, serial, port, flows}
collie network detach
```

O `attach` sobe um mitmdump por emulador, instala o certificado da CA dele no aparelho e aponta o proxy do emulador para
ele. Cada passo confere antes de agir: um attach num emulador já interceptado só repara o que falta, e um detach num
emulador limpo não muda nada.

```callout
kind: warning
title: adb root reinicia o adbd
body: "Se o emulador ainda não era root, o `attach` roda `adb root`, que reinicia o adbd. Isso derruba todo `adb reverse` e encerra a sessão de tela de um painel Dispositivo aberto; o próximo a olhar começa uma nova."
```

## A guia é a permissão

O tráfego capturado carrega tokens e cookies, então um terminal só o lê se tiver uma guia até um painel Rede. Sem guia,
todo `collie network …` falha com "No network panel reachable. Open one with `panel open network`." O app não precisa
de guia. As guias estão explicadas em [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals).

## Ler o tráfego

```sh
collie network list --limit 20 --host api.example.com
collie network get <flow-id>     # um fluxo, com cabeçalhos e corpos, decodificados quando possível
collie network curl <flow-id>    # a requisição como comando cURL
collie network clear             # esquece os fluxos capturados
```

O `list` devolve `{id, method, host, path, status, size, durationMs, state}` por fluxo, do mais antigo ao mais novo;
`--limit` fica com os N mais novos (padrão 100). Os fluxos ficam só na memória. O painel guarda os 2.000 fluxos mais
novos, até 256 MiB deles, e descarta os mais antigos primeiro.

## Regras de mapeamento

Uma regra diz o que casar e o que responder:

- **Casar:** `--method`, `--host` (um glob, `*.example.com`), `--path` (um glob sem a query, `/v1/pdp*`) e
  `--query k=v` (repetível).
- **Responder:** `--status` (100–599, padrão 200), `--header "Nome: valor"` (repetível; `content-encoding` e
  `content-length` são recusados), `--body` ou `--body-file`, `--delay` em ms (0–60000), ou `--drop` para cortar a
  conexão (com `--delay`, um timeout).
- **`--from <fluxo>`** parte de uma resposta capturada (status, cabeçalhos, corpo decodificado); as outras flags
  sobrescrevem.

```sh
collie network rule-add --name checkout-ok --method POST --path "/v2/checkout" \
  --from <flow-id> --status 200
collie network rule-list
collie network rule-disable <rule-id>
```

**A primeira regra ligada que casa vence.** No painel, **Mapear** no detalhe de um fluxo abre o mesmo formulário
("Mapear esta resposta"), com "Responder com…" ou "Cortar a conexão".

```steps
items:
  - title: O agente cria uma regra
    command: collie network rule-add --path "/v2/checkout" --from <flow-id> --status 200
    result: A regra nasce desligada, e um cartão aparece no app.
  - title: Você responde o cartão
    result: "**Permitir** a liga; **Negar**, ou nenhuma resposta em 120 s, a deixa desligada."
  - title: O app recebe a resposta mapeada
    result: O servidor nunca é chamado para aquela requisição.
```

A regra de um terminal sempre espera o seu ok, e o `rule-enable` numa regra desligada também. Negada, o comando falha com
"the user did not allow map rule '<id>'; it stays off". O cartão mostra duas linhas: a requisição e a resposta (status,
tamanho, atraso).

O `--body-file` precisa ser um arquivo comum dentro do seu projeto, até 5 MiB, sem link simbólico nem hard link; ele é
lido quando a regra é salva. As regras são globais no Mac (`<root>/network/rules.json`), não por emulador, e todas
voltam **desligadas** quando o Collie abre.

## Armadilhas

- O filtro `--host` do `list` casa texto contido no host; o `--host` de uma regra é um glob. `api.example.com` numa
  regra casa só esse host exato.
- Regra que não dispara: confira no `rule-list` se uma regra ligada anterior casa primeiro.
- Enquanto uma sessão roda, o daemon a confere a cada 5 s: reinicia um mitmdump que caiu e repara um `adb reverse`
  perdido ou uma CA que sumiu depois de reiniciar o aparelho. Na partida do daemon, o que um daemon que caiu deixou para
  trás é desfeito, para o emulador ter a rede de volta, e um daemon que para desliga a captura de todo emulador antes.

## Como se conecta

- O emulador vem do painel [Dispositivos](/pt/docs/features/devices); o agente lê a tela ali e o tráfego aqui.
- A regra da guia é a mesma do `collie device …` e dos outros painéis
  ([Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals)).
- O [sandbox](/pt/docs/features/sandbox) dos terminais é fronteira de arquivos, não de rede: a captura é protegida pela
  guia.
- Todos os comandos: [Referência da CLI](/pt/docs/reference/cli).

# PRD 09 — Posts por funcionalidade (`/features/<slug>`)

Status: em execução (2026-11-21). Dono: Shepherd (terminal "Collie Web").

## Problema

A landing mostra cada funcionalidade em uma seção curta (título, 3 bullets, um comando, um clipe). Quem quer usar não
acha em lugar nenhum: o que é de verdade, pra que serve, por que existe, como funciona por dentro e o passo a passo
pra fazer funcionar.

## Meta

Um post por funcionalidade, EN e PT-BR, Dark e Light, 360 a 1440 px. Cada seção da landing ganha link "Saiba mais →"
para o post. Índice em `/features`.

Rotas: `/features`, `/features/<slug>`, `/pt/features`, `/pt/features/<slug>`. Static export (`generateStaticParams`),
metadata, `hreflang`, canonical e sitemap como o Changelog já faz.

Não metas: busca, comentários, MDX, CMS, clipes novos, mudar seções da landing além do link.

## Os 12 posts

| slug | Funcionalidade | Clipe (`public/features/<id>`) |
|---|---|---|
| `design` | 01 Design (painel figcraft, design system, export) | `design` |
| `memory` | 02 Memória do projeto | `memory` |
| `devices` | 03 Dispositivos (iOS Simulator, Android) | — |
| `loop` | 04 Laço (`collie work run`) | `loop` |
| `apps` | 05 Apps / adotar ferramentas locais | `apps` |
| `network` | 06 Captura de rede | `network` |
| `emulator` | 07 Emulador leve | `emulator` |
| `browser` | 08 Navegador | `browser` |
| `artifacts` | 09 Artifacts com comentários | `artifacts` |
| `diagram` | 10 Diagramas | `diagram` |
| `sandbox` | 11 Sandbox | `sandbox` |
| `shepherd` | Pastor, cercados e rebanhos (conceitos base) | — |

## Estrutura fixa de cada post

Contrato de dados: `src/i18n/posts/types.ts`. Um arquivo por post: `src/i18n/posts/<slug>.ts` exportando
`Record<Lang, PostCopy>`. As seções vêm sempre nesta ordem (`id` fixo, título livre):

1. `what` — **O que é.** Duas ou três frases, sem jargão interno não explicado.
2. `why` — **Pra que e por quê.** O problema que resolve, o que muda no dia a dia. Exemplo concreto.
3. `how` — **Como funciona.** O mecanismo real: quem faz o quê (dono, Pastor, agente, app, daemon), onde os dados
   ficam, o que é aprovado num cartão.
4. `start` — **Como fazer funcionar.** Passo a passo numerado (`steps`), cada passo com o pedido em linguagem natural
   e/ou o comando real. Pré-requisitos primeiro.
5. `limits` — **Limites e cuidados.** O que não faz, limites duros, armadilhas.
6. `faq` — opcional, 2 a 4 perguntas.

`related`: 2 ou 3 slugs. `commands`: tabela curta dos comandos usados no post (comando + o que faz).

## Regras de conteúdo

- **Só fatos verificados.** Fonte da verdade: `docs/referencia.md` e `Sources/` em
  `/Users/ysraelmoreno/Documents/codes/my-orchestrator-memory` (só leitura). Comando, flag, saída ou limite que não
  está lá não entra. Na dúvida, não escreva. Os PRDs 01–08 têm seções "Correções da verificação": respeite-as.
- Termos do produto: Pastor/Shepherd, cercado/paddock, rebanho/herd, coleira/leash (ver memórias "Termos Rail e
  Pasture mantidos" e "Plug-in Vizinho mantém o nome próprio").
- Tom da landing: frases curtas, voz ativa, sem marketing vazio, sem estatística inventada, sem "revolucionário".
- PT-BR natural (não tradução literal). Os dois idiomas com o mesmo conteúdo.
- Nada de dado real de terceiros, projeto privado, token ou e-mail nos exemplos.
- Tamanho alvo: 600 a 1000 palavras por idioma.

## Design

Designer faz no painel de design (arquivo `collie-web`, design system `collie-web` ativo): template do post (1440 e
390, Dark e Light, EN), índice `/features`, e o link "Saiba mais →" numa seção da landing. Dono aprova antes do código.

## Definition of Done

- 12 posts × 2 idiomas, build estático verde (`npm run lint`, `typecheck`, `build`).
- Cada fato de comando conferido contra a fonte (redator lista o trecho de `referencia.md` que sustenta cada comando
  no relatório).
- Links da landing e do índice funcionando nos dois idiomas; sitemap inclui as 26 rotas novas.
- Screenshots 1440/390 Dark/Light de um post e do índice batendo com o frame.

# PRD 00 — Landing: mostrar tudo que o Collie faz

Status: em execução (2026-11-18). Dono: Shepherd (terminal "Collie Web").

## Problema

A landing só mostra três pilares (Design, Memória, Dispositivos) e o trio Pastor/Cercados/Rebanhos. O Collie hoje
faz bem mais: laço autônomo, adoção de ferramentas locais, captura de rede, emulador leve, navegador, artifacts com
comentários, diagramas e sandbox. Quem chega no site não descobre nada disso.

## Meta

Oito seções novas, uma por funcionalidade, cada uma com texto curto, o par "pedido → comando" e um GIF que mostra o
recurso acontecendo. EN (`/`) e PT-BR (`/pt`), Dark e Light, 360px a 1440px.

Não metas: página por feature, docs, blog, vídeo com áudio, mudar Hero/Pain/pilares 01–03/Download/Build.

## Ordem da página

Nav · Hero · Pain · Pilares 01–03 (existentes) · **Features 04–11 (novas, `<div id="features">`)** · How it works ·
Download · Build it · CTA · Footer.

| # | id | Seção | PRD |
|---|---|---|---|
| 04 | `loop` | Laço autônomo | [01-loop.md](01-loop.md) |
| 05 | `apps` | Adotar ferramentas (apps do cercado) | [02-apps-adopt.md](02-apps-adopt.md) |
| 06 | `network` | Rede (interceptar tráfego) | [03-network.md](03-network.md) |
| 07 | `emulator` | Emulador leve | [04-emulator.md](04-emulator.md) |
| 08 | `browser` | Navegador | [05-browser.md](05-browser.md) |
| 09 | `artifacts` | Artifacts, Prévia e comentários | [06-artifacts.md](06-artifacts.md) |
| 10 | `diagram` | Diagrama | [07-diagram.md](07-diagram.md) |
| 11 | `sandbox` | Sandbox | [08-sandbox.md](08-sandbox.md) |

Nav: um link novo "Features" / "Recursos" → `#features` (entre Devices e Download).

## Estrutura de cada seção

Mesmo layout do `Pillar` atual (`src/components/landing/Pillars.tsx`): coluna de texto (máx. 480px) + mídia 768×480,
alternando lado a cada seção (04 mídia à direita, 05 à esquerda, …). Abaixo de `lg` empilha: texto, depois mídia.

Texto, nesta ordem:
1. Eyebrow mono: `04 · LOOP`.
2. H2: uma frase, benefício, termina em ponto. Máx. ~32 caracteres (PT pode ir a ~38).
3. Lead: 2 frases, máx. 240 caracteres. O que é + o que o usuário ganha. Sem adjetivo vazio, sem número inventado.
4. 3 bullets curtos (mono 13px, `·` na frente): fatos verificáveis do produto.
5. `Command`: o que o usuário pede (`›`) e o comando `collie` que o agente roda (`↳`).

Mídia: `<video autoplay muted loop playsinline poster>` com o MP4 do GIF, dentro de uma moldura `rounded-lg border
border-border`. `prefers-reduced-motion`: sem autoplay, mostra o poster com `controls`. `aria-label` = `mediaAlt`.

## Contrato de implementação (o que cada agente de feature entrega)

A seção é **dados**: um componente genérico (`Features.tsx`, do Shepherd) renderiza todas. O agente de feature
não toca em componentes compartilhados, `en.ts`, `pt.ts`, `Landing.tsx` nem `Nav.tsx`.

1. **Copy** em `src/i18n/features/<id>.ts`:

```ts
import type { FeatureCopy } from "./types";
import type { Locale } from "@/i18n";

export const loop: Record<Locale, FeatureCopy> = {
  en: { id: "loop", eyebrow: "04 · LOOP", title: "…", body: "…", bullets: ["…", "…", "…"],
        command: { prompt: "…", command: "collie …" }, mediaAlt: "…" },
  pt: { … },
};
```

2. **Composição do GIF** em `media/<id>/index.html` (HyperFrames + GSAP, timeline pausada, determinística). Modelo:
   `media/_template/index.html`. Referência de estilo anterior:
   `/Users/ysraelmoreno/Documents/codes/my-orchestrator-memory/docs/videos/collie-gifs/cercado/index.html`.
3. **Renders** em `public/features/` (Dark; mais `<id>-light.mp4` e `<id>-light.jpg` com `THEME=light`): `<id>.mp4` (H.264, sem áudio, ≤ 1,2 MB), `<id>.jpg` (poster: o quadro final
   ou o mais legível), `<id>.gif` (960px de largura, 15 fps, ≤ 3 MB; usado no README e redes).
4. Copiar `<id>.mp4` e `<id>.jpg` também para `docs/pages/features-preview/media/` (a Prévia lê de lá).
5. **Sem commit.** O Shepherd integra e commita. Não rodar `collie ask` para o Shepherd no meio (deadlock): termine e
   relate.

## Regras dos GIFs

- 1280×800 (16:10), 8 a 12 s, loop limpo (último segundo parado, volta ao estado inicial sem pulo de layout).
- Tokens da landing (Dark): fundo `#15171C`, superfície `#1F232B`, superfície-2 `#262A33`, borda `#2E323B`, texto
  `#F4F2ED`, secundário `#8C95B8`, accent `#6E9BFF`, accent-soft `#93A4FF`, sucesso `#6EE7B7`, aviso `#FFB86B`.
  Manrope 500/800 para UI, DM Mono para terminal. Fundo com grade de pontos do canvas.
- Linguagem visual = canvas do Collie: cartões de terminal (`nome · tag`), painéis, guias tracejadas (leashes),
  cartão de aprovação do dono. Mesma gramática de `src/components/landing/canvas.tsx`.
- Todo GIF conta **uma** história em 3 ou 4 batidas, com legenda numerada embaixo (como o GIF "cercado").
- Texto dentro do GIF em inglês (um só render para os dois idiomas), mínimo 22px no quadro de 1280.
- Só comandos e saídas que existem. Fonte da verdade: `docs/referencia.md` e `Sources/` em
  `/Users/ysraelmoreno/Documents/codes/my-orchestrator-memory` (só leitura). Na dúvida, não mostre.
- Nada de dado real de terceiros, nomes de projetos privados, tokens ou e-mails.

Render: `scripts/capture-gif.sh <id> [segundo-do-poster]` (~40 s), e de novo com `THEME=light` na frente para o clipe
Light (mesmo segundo de poster). As cores vêm dos tokens de `:root`; `media/_theme.js` os troca em `?theme=light`. Cor
fixa só no que não muda com o tema (tela de telefone, página de exemplo); em tween do GSAP use `css("--token")`. Captura os quadros num painel Navegador headless do
Collie e gera `public/features/<id>.{mp4,jpg,gif}` com ffmpeg. O `npx hyperframes render` **não funciona** num terminal
do Collie (o Chrome dele morre no sandbox); `npx hyperframes lint` funciona. A composição precisa de
`window.__timelines.main` (timeline GSAP pausada) e `data-duration` no elemento `[data-composition-id]`. A captura usa
`seek()`, que não dispara callbacks (`onComplete`, `call`): toda mudança visível tem que ser tween.

## Verificação (Definition of Done)

- `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` verdes.
- Dev env (`next dev -p 3100`): `/` e `/pt` mostram as 8 seções, vídeo toca em loop, sem scroll horizontal em 360px,
  Light e Dark legíveis, foco visível, um único `h1`.
- Cada comando citado confere com a referência do Collie.
- Página não passa de ~8 MB de mídia no total; vídeos com `preload="none"` + poster fora da primeira dobra.

## Riscos e decisões

- **Rede:** captura/inspeção/`curl` **e** regras de map (`network rule-add|rule-list|rule-enable…`: resposta fabricada,
  atraso, queda) estão no CLI. A seção 06 mostra os dois: ler o fluxo que falhou e trocar a resposta. Regra criada por
  agente só vale depois do OK do dono.
- **Adotar:** `app.adopt` existe no código; o spec de Generative UI (fase 2) não entra.
- **Emulador:** já existe o pilar 03 Devices. A seção 07 fala só do que é novo: emulador leve, boot de AVD e setup
  do Android pelo app.
- GIFs são composições desenhadas, não gravação de tela. Motivo: reprodutível, leve, sem dado real.

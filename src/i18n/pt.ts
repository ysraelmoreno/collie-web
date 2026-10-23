import { en, type Dictionary } from "./en";

export const pt: Dictionary = {
  meta: {
    lang: "pt-BR",
    ogLocale: "pt_BR",
    title: "Collie — um canvas para todos os seus agentes",
    description:
      "Um canvas onde seus agentes de código, o design e os dispositivos compartilham o mesmo contexto. Open source, macOS 15.",
  },
  languageSwitch: {
    label: "Idioma",
  },
  theme: {
    toLight: "Mudar para tema claro",
    toDark: "Mudar para tema escuro",
  },
  nav: {
    label: "Principal",
    links: {
      product: "Produto",
      design: "Design",
      memory: "Memória",
      devices: "Dispositivos",
    },
    github: "GitHub",
  },
  hero: {
    eyebrow: "OPEN SOURCE · macOS 15",
    title: ["Um canvas.", "Todos os seus agentes.", "Um só contexto."],
    body: "O Collie coloca seus terminais do Claude Code e do Codex num canvas infinito, ao lado do seu design system, de simuladores rodando e de uma memória de projeto que todo agente lê.",
    primary: "Começar no GitHub",
    secondary: "Ler a documentação",
    hint: '$ collie ask designer "aplica o token primary no CTA"',
    shepherd: [
      { text: '› collie memory search "tokens"' },
      { text: "3 decisões encontradas", out: true },
      { text: '› collie ask designer "monta o hero"' },
      { text: "designer: feito · screenshot ✓", out: true },
      { text: "› collie device tap --ref e3" },
    ],
  },
  memoryCard: {
    eyebrow: "MEMÓRIA DO PROJETO",
    entries: [
      "• primary = #6E9BFF  (decisão, v4)",
      "• hero usa a tab bar  (tela)",
      "• API em /v2 desde 12/10  (armadilha)",
    ],
  },
  pain: {
    eyebrow: "HOJE",
    title: "Seus agentes esquecem. Seu design se espalha.",
    body: "Cada conversa deixa mais um arquivo solto, e cada agente novo começa do zero. Você vira a cola, explicando o contexto de novo.",
    cards: [
      "artifact_v3.html",
      "hero-final-FINAL.fig",
      'chat #12: "lembra do token?"',
      "terminal 4 — codex",
      "simulator.app",
      "tokens-old.css",
    ],
  },
  pillars: {
    design: {
      eyebrow: "01 · DESIGN",
      title: "Design centralizado.",
      body: "O design vive num painel figcraft embutido. Um design system versionado guarda os tokens que seus agentes leem, e todo export HTML ou React vira um artefato versionado, não um arquivo solto.",
      command: "$ collie design system tokens",
      published: "v4 · published · 3 files use it",
      specimen: en.pillars.design.specimen,
      scale: en.pillars.design.scale,
      tokens: en.pillars.design.tokens,
    },
    memory: {
      eyebrow: "02 · MEMÓRIA",
      title: "Uma memória que todo agente divide.",
      body: "Decisões e trabalho concluído viram memória do projeto. Qualquer agente busca nela antes de reler seu código, e ninguém começa do zero. Nem você.",
      command: '$ collie memory search "auth"',
      shepherd: [
        { text: '› collie memory search "auth"' },
        { text: "decisão: sessões usam JWT (v3)", out: true },
      ],
      api: [
        { text: '› collie memory search "v2"' },
        { text: "armadilha: /v1 está congelada", out: true },
      ],
    },
    devices: {
      eyebrow: "03 · DISPOSITIVOS",
      title: "Dispositivos vivos no canvas.",
      body: "Simulador iOS e Android rodam ao lado dos seus terminais. Os agentes tocam, tiram screenshots e leem o logcat sozinhos, e depois contam o que viram.",
      command: "$ collie device screenshot",
      qa: [
        { text: "› collie device tap --ref e3" },
        { text: 'tocou em "Entrar"', out: true },
        { text: "› collie device screenshot" },
        { text: "salvo screen-12.png", out: true },
        { text: "› collie device logcat --grep crash" },
        { text: "0 ocorrências", out: true },
      ],
    },
  },
  how: {
    eyebrow: "COMO FUNCIONA",
    title: "Um pastor, paddocks e rebanhos.",
    steps: [
      {
        title: "Pastor",
        body: "Um agente líder chama os outros, prende cada um ao trabalho e confere o que entregaram.",
      },
      {
        title: "Paddocks",
        body: "Cada tarefa ganha sua própria worktree e branch no git. Quando terminar, é só integrar.",
      },
      {
        title: "Rebanhos",
        body: "Salve um time de agentes e papéis. Aplique de novo no próximo projeto.",
      },
    ],
  },
  build: {
    eyebrow: "COMPILE",
    title: "Compile a partir do código.",
    body: "Ainda não há release empacotada. O Collie precisa de macOS 15 e Swift 6.2, e o app tem que ficar em /Applications antes do primeiro uso.",
    terminal: "Terminal",
    commands: en.build.commands,
    commandsLabel: "Comandos de build",
    note: "Opcional: o painel Design também precisa de scripts/build-figcraft.sh (~10 min).",
  },
  copy: {
    idle: "Copiar",
    done: "Copiado",
  },
  cta: {
    title: "Dê um só canvas aos seus agentes.",
    body: "Código aberto sob licença MIT. Clone, compile e coloque seus agentes na mesma página.",
  },
  footer: {
    meta: "Licença MIT · macOS 15",
    builtWith: "Este site foi construído com Collie",
    github: "GitHub ↗",
  },
};

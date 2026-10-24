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
    hint: {
      prompt: "Use o token primary no CTA",
      command: en.hero.hint.command,
    },
    shepherd: [
      {
        text: "Use o novo token primary no hero e confira no iPhone",
        kind: "prompt",
      },
      en.hero.shepherd[1],
      en.hero.shepherd[2],
      en.hero.shepherd[3],
      {
        text: "Pronto. O CTA do hero agora usa o primary (#6E9BFF) e está certo no iPhone.",
        kind: "reply",
      },
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
      command: {
        prompt: "Quais tokens o CTA usa?",
        command: en.pillars.design.command.command,
      },
      published: en.pillars.design.published,
      specimen: en.pillars.design.specimen,
      scale: en.pillars.design.scale,
      shepherd: [
        { text: "Quais tokens o CTA usa?", kind: "prompt" },
        ...en.pillars.design.shepherd.slice(1),
      ],
    },
    memory: {
      eyebrow: "02 · MEMÓRIA",
      title: "Uma memória que todo agente divide.",
      body: "Decisões e trabalho concluído viram memória do projeto. Qualquer agente busca nela antes de reler seu código, e ninguém começa do zero. Nem você.",
      command: {
        prompt: "Como tratamos as sessões?",
        command: en.pillars.memory.command.command,
      },
      shepherd: [
        { text: "Como tratamos as sessões?", kind: "prompt" },
        en.pillars.memory.shepherd[1],
        { text: "decisão: sessões usam JWT (v3)", kind: "out" },
      ],
      api: [
        { text: "Posso criar uma rota na /v1?", kind: "prompt" },
        en.pillars.memory.api[1],
        { text: "armadilha: /v1 está congelada", kind: "out" },
      ],
    },
    devices: {
      eyebrow: "03 · DISPOSITIVOS",
      title: "Dispositivos vivos no canvas.",
      body: "Simulador iOS e Android rodam ao lado dos seus terminais. Os agentes tocam, tiram screenshots e leem o logcat sozinhos, e depois contam o que viram.",
      command: {
        prompt: "Entre no Pixel e tire um screenshot",
        command: en.pillars.devices.command.command,
      },
      qa: [
        { text: "Entre no Pixel e tire um screenshot", kind: "prompt" },
        en.pillars.devices.qa[1],
        { text: 'e3  Button "Entrar"', kind: "out" },
        en.pillars.devices.qa[3],
        { text: 'tocou em "Entrar"', kind: "out" },
        en.pillars.devices.qa[5],
        { text: "salvo screen-12.png", kind: "out" },
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

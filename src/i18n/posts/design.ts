import type { Post } from "./types";

export const design: Post = {
  en: {
    slug: "design",
    eyebrow: "01 · DESIGN",
    title: "Design, centralised.",
    lead: "A design panel, a versioned design system and every export kept as an artifact. You and your agents edit the same file in the same session.",
    mediaId: "design",
    mediaAlt: "A Design panel on the canvas showing a sign-in frame.",
    sections: [
      {
        id: "what",
        title: "What it is",
        blocks: [
          {
            kind: "p",
            text: "The Design panel is figcraft, an open-source design editor, embedded in Collie. The Collie daemon runs a figcraft server on your machine (127.0.0.1 only) and the panel shows its web UI live. Agents edit the same file through the CLI, in the same session.",
          },
          {
            kind: "p",
            text: "On top of it sit design systems: a design file with variables (tokens, with modes), styles and components, published in versions. One of them is the active one, and your agents read its tokens instead of guessing colors.",
          },
        ],
      },
      {
        id: "why",
        title: "Why it matters",
        blocks: [
          {
            kind: "p",
            text: "Without a shared source, design scatters: a loose HTML file here, a token pasted in a chat there, and every new agent starts without them. You end up re-explaining the primary color.",
          },
          {
            kind: "p",
            text: "Here the design lives in one panel. You ask the agent for a sign-in screen, watch it appear in the panel, and fix a detail by hand in the same file. The tokens come from the design system, and the export is versioned.",
          },
          {
            kind: "list",
            items: [
              "Agents read tokens with collie design system tokens, not from a screenshot.",
              "Each export to HTML becomes a versioned artifact, not a loose file.",
              "Every design system change is saved as a decision in project memory.",
            ],
          },
        ],
      },
      {
        id: "how",
        title: "How it works",
        blocks: [
          {
            kind: "p",
            text: "The panel and the agents talk to the same local figcraft server. An agent reaches a panel through a leash, so its design commands (collie design …) act on the panel it is leashed to. With more than one panel, pass --panel <name>.",
          },
          {
            kind: "list",
            items: [
              "Edit: files, new <name>, run <command> --params '{…}', batch --commands '[…]' (one undo step, all or nothing), inspect, screenshot and help [search].",
              "Export: export --format html|css|react|figcraft. The HTML export is post-processed (reset, tokens with Light and Dark modes, responsive layout) and saved as an artifact. Exporting the same file and node again creates the next version of that artifact.",
              "Design systems: collie design system list, history, create, publish, use, undo and revert. Switching matches by name: variables by collection, name and type; styles by name and type; components and variants by name. What does not match stays on the previous system and is reported as unmatched.",
              "Scope: one active design system per workspace, and a paddock can have its own. Every change needs a --reason, and it is saved as a decision in Memory.",
            ],
          },
          {
            kind: "p",
            text: "For interface work, the Shepherd designs first where your Where to design preference says: artifact (the default), figcraft or ask. You change it in Preferences, or a Shepherd runs collie design prefer artifact|figcraft|ask.",
          },
        ],
      },
      {
        id: "start",
        title: "How to make it work",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Build the Design engine (source builds)",
                body: "If you build Collie from source, the panel needs the figcraft engine. It needs rustup with the wasm target, and the first build takes about 10 minutes. Then bundle the app again.",
                command: "scripts/build-figcraft.sh && scripts/bundle-app.sh",
              },
              {
                title: "Open a Design panel",
                body: "In the app: **Abrir painel…** (Open panel…) → **Design**, then pick a file or type a name under **Novo arquivo…** (New file…) and click **Criar** (Create). Or ask a Shepherd. It creates the file if it does not exist.",
                ask: "Open a Design panel for the sign-in screen",
                command: "collie panel open design --file sign-in",
              },
              {
                title: "Ask the agent to design",
                body: "The agent edits the file through collie design. To see which commands the editor accepts, it runs help.",
                ask: "Draw the sign-in screen with an email field and a primary button",
                command: "collie design help",
              },
              {
                title: "Create and publish a design system",
                body: "Every change needs a reason. Use the **Design Systems** panel in the app (**Abrir painel…** → **Design Systems**) or the commands. Publishing from a terminal needs a leash to the system's Design panel.",
                command:
                  'collie design system create collie-web --reason "first tokens"',
              },
              {
                title: "Read the tokens and export",
                body: "Agents read the active system's tokens, and the HTML export lands in the Artifacts panel as a versioned artifact.",
                ask: "Which tokens does the CTA use?",
                command: "collie design system tokens",
              },
            ],
          },
        ],
      },
      {
        id: "limits",
        title: "Limits and cautions",
        blocks: [
          {
            kind: "list",
            items: [
              "Design files live in the local server's storage, not in git. export --format figcraft produces a .figcraft file, and it is refused on a file that uses design systems (it would carry the library links). Export html, css or react instead.",
              "The panel uses WebGPU when WebKit offers an adapter and WebGL2 otherwise. COLLIE_DESIGN_GPU=webgl|webgpu forces one.",
              "Switching is not transactional across files: a failure does not undo the others, and the result comes per file.",
              "Revert creates a new version and marks the system. Before the next publish, edit the file back or use --force.",
              "The figcraft web UI does not operate libraries. Switch, publish and revert from the Design Systems panel or the commands.",
              "Backups carry the Design links. Treat the export as a password.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ",
        blocks: [
          {
            kind: "p",
            text: "Who can switch a design system? In the workspace, you in the app or a Shepherd in the Pasture. In a paddock, you, the Shepherd that created it, or a Shepherd inside a paddock you created.",
          },
          {
            kind: "p",
            text: "Can I undo a switch? Yes. collie design system undo toggles between the last two systems of the scope. For an older one, use **Histórico** (History) in the Design Systems panel, or use.",
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie panel open design --file <name>",
        does: "Open a Design panel on a file; creates it if missing.",
      },
      { command: "collie design files", does: "List design files." },
      { command: "collie design new <name>", does: "Create a design file." },
      {
        command: "collie design run <command> --params '{…}'",
        does: "Run one editor command.",
      },
      {
        command: "collie design batch --commands '[…]'",
        does: "Run several commands as one undo step.",
      },
      { command: "collie design inspect", does: "Inspect the file." },
      {
        command: "collie design screenshot",
        does: "Take a screenshot of the design.",
      },
      { command: "collie design help [search]", does: "List editor commands." },
      {
        command: "collie design export --format html",
        does: "Export as a versioned artifact (also css, react, figcraft).",
      },
      {
        command: "collie design system tokens",
        does: "Read the active system's tokens.",
      },
      {
        command:
          "collie design system list|history|create|publish|use|undo|revert",
        does: "Manage design systems; each change needs --reason.",
      },
      {
        command: "collie design prefer artifact|figcraft|ask",
        does: "Set where the Shepherd designs first.",
      },
    ],
    related: ["artifacts", "diagram", "memory"],
  },
  pt: {
    slug: "design",
    eyebrow: "01 · DESIGN",
    title: "Design, centralizado.",
    lead: "Um painel de design, um design system versionado e cada export guardado como artifact. Você e seus agentes editam o mesmo arquivo, na mesma sessão.",
    mediaId: "design",
    mediaAlt: "Um painel Design no canvas mostrando um frame de login.",
    sections: [
      {
        id: "what",
        title: "O que é",
        blocks: [
          {
            kind: "p",
            text: "O painel Design é o figcraft, um editor de design open source, embutido no Collie. O daemon do Collie roda um servidor figcraft na sua máquina (só em 127.0.0.1) e o painel mostra a UI web dele ao vivo. Os agentes editam o mesmo arquivo pela CLI, na mesma sessão.",
          },
          {
            kind: "p",
            text: "Por cima ficam os design systems: um arquivo de design com variáveis (tokens, com modos), estilos e componentes, publicado em versões. Um deles é o ativo, e seus agentes leem os tokens dele em vez de chutar cores.",
          },
        ],
      },
      {
        id: "why",
        title: "Pra que serve",
        blocks: [
          {
            kind: "p",
            text: "Sem uma fonte compartilhada, o design se espalha: um HTML solto aqui, um token colado num chat ali, e todo agente novo começa sem nada disso. Você vira quem explica de novo qual é a cor primária.",
          },
          {
            kind: "p",
            text: "Aqui o design mora num painel só. Você pede uma tela de login ao agente, vê ela aparecer no painel e ajusta um detalhe à mão, no mesmo arquivo. Os tokens vêm do design system e o export é versionado.",
          },
          {
            kind: "list",
            items: [
              "O agente lê os tokens com collie design system tokens, não de um print.",
              "Cada export para HTML vira um artifact versionado, não um arquivo solto.",
              "Toda mudança de design system vira uma decisão na memória do projeto.",
            ],
          },
        ],
      },
      {
        id: "how",
        title: "Como funciona",
        blocks: [
          {
            kind: "p",
            text: "O painel e os agentes falam com o mesmo servidor figcraft local. Um agente alcança um painel por uma coleira, então os comandos de design dele (collie design …) agem no painel a que ele está ligado. Com mais de um painel, passe --panel <nome>.",
          },
          {
            kind: "list",
            items: [
              "Editar: files, new <nome>, run <comando> --params '{…}', batch --commands '[…]' (um passo de desfazer, tudo ou nada), inspect, screenshot e help [busca].",
              "Exportar: export --format html|css|react|figcraft. O export HTML passa por um pós-processador (reset de CSS, tokens com os modos Light e Dark, layout responsivo) e é guardado como artifact. Exportar de novo o mesmo arquivo e nó cria a versão seguinte do mesmo artifact.",
              "Design systems: collie design system list, history, create, publish, use, undo e revert. A troca casa por nome: variáveis por coleção, nome e tipo; estilos por nome e tipo; componentes e variantes por nome. O que não casa continua no sistema anterior e aparece como unmatched.",
              "Escopo: um design system ativo por workspace, e um cercado pode ter o seu. Toda mudança exige um --reason e vira uma decisão na Memória.",
            ],
          },
          {
            kind: "p",
            text: "Em trabalho de interface, o Pastor desenha antes onde a sua preferência Onde desenhar manda: artifact (o padrão), figcraft ou ask. Você muda em Preferências, ou um Pastor roda collie design prefer artifact|figcraft|ask.",
          },
        ],
      },
      {
        id: "start",
        title: "Como fazer funcionar",
        blocks: [
          {
            kind: "steps",
            items: [
              {
                title: "Compile o motor do Design (build do código-fonte)",
                body: "Se você compila o Collie do código-fonte, o painel precisa do motor figcraft. Ele pede o rustup com o alvo wasm, e a primeira compilação leva uns 10 minutos. Depois gere o app de novo.",
                command: "scripts/build-figcraft.sh && scripts/bundle-app.sh",
              },
              {
                title: "Abra um painel Design",
                body: "No app: Abrir painel… → Design, escolha um arquivo ou digite um nome em Novo arquivo… e clique Criar. Ou peça a um Pastor. Ele cria o arquivo se não existir.",
                ask: "Abra um painel Design para a tela de login",
                command: "collie panel open design --file login",
              },
              {
                title: "Peça ao agente para desenhar",
                body: "O agente edita o arquivo pelo collie design. Para ver quais comandos o editor aceita, ele roda help.",
                ask: "Desenhe a tela de login com um campo de e-mail e um botão primário",
                command: "collie design help",
              },
              {
                title: "Crie e publique um design system",
                body: "Toda mudança exige um motivo. Use o painel Design Systems no app (Abrir painel… → Design Systems) ou os comandos. Publicar por um terminal exige uma coleira até o painel Design do sistema.",
                command:
                  'collie design system create collie-web --reason "primeiros tokens"',
              },
              {
                title: "Leia os tokens e exporte",
                body: "Os agentes leem os tokens do sistema ativo, e o export HTML cai no painel Artifacts como um artifact versionado.",
                ask: "Quais tokens o CTA usa?",
                command: "collie design system tokens",
              },
            ],
          },
        ],
      },
      {
        id: "limits",
        title: "Limites e cuidados",
        blocks: [
          {
            kind: "list",
            items: [
              "Os arquivos de design ficam no armazenamento do servidor local, não no git. export --format figcraft gera um arquivo .figcraft, e é recusado num arquivo que usa design systems (levaria os links das bibliotecas). Exporte html, css ou react.",
              "O painel usa WebGPU quando o WebKit tem um adaptador e WebGL2 caso contrário. COLLIE_DESIGN_GPU=webgl|webgpu força um dos dois.",
              "A troca entre arquivos não é transacional: uma falha não desfaz os outros, e o resultado vem por arquivo.",
              "Revert cria uma versão nova e marca o sistema. Antes da próxima publicação, edite o arquivo de volta ou use --force.",
              "A UI web do figcraft não opera bibliotecas. Troque, publique e volte pelo painel Design Systems ou pelos comandos.",
              "O backup leva os links do Design. Trate o arquivo exportado como uma senha.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "Perguntas frequentes",
        blocks: [
          {
            kind: "p",
            text: "Quem pode trocar o design system? No workspace, você no app ou um Pastor no Pasto. Num cercado, você, o Pastor que o criou, ou um Pastor dentro de um cercado criado por você.",
          },
          {
            kind: "p",
            text: "Dá para desfazer uma troca? Dá. collie design system undo alterna entre os dois últimos sistemas do escopo. Para um mais antigo, use o Histórico do painel ou use.",
          },
        ],
      },
    ],
    commands: [
      {
        command: "collie panel open design --file <nome>",
        does: "Abre um painel Design num arquivo; cria se não existir.",
      },
      { command: "collie design files", does: "Lista os arquivos de design." },
      {
        command: "collie design new <nome>",
        does: "Cria um arquivo de design.",
      },
      {
        command: "collie design run <comando> --params '{…}'",
        does: "Roda um comando do editor.",
      },
      {
        command: "collie design batch --commands '[…]'",
        does: "Roda vários comandos como um passo de desfazer.",
      },
      { command: "collie design inspect", does: "Inspeciona o arquivo." },
      {
        command: "collie design screenshot",
        does: "Tira um screenshot do design.",
      },
      {
        command: "collie design help [busca]",
        does: "Lista os comandos do editor.",
      },
      {
        command: "collie design export --format html",
        does: "Exporta como artifact versionado (também css, react, figcraft).",
      },
      {
        command: "collie design system tokens",
        does: "Lê os tokens do sistema ativo.",
      },
      {
        command:
          "collie design system list|history|create|publish|use|undo|revert",
        does: "Gerencia design systems; toda mudança exige --reason.",
      },
      {
        command: "collie design prefer artifact|figcraft|ask",
        does: "Define onde o Pastor desenha primeiro.",
      },
    ],
    related: ["artifacts", "diagram", "memory"],
  },
};

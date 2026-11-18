# PRD 08 — Seção 11 · Sandbox

Leia antes: [00-overview.md](00-overview.md). `id`: `sandbox`.

## O que é (fatos: `docs/referencia.md` § Sandbox dos terminais; spec `2026-10-23-agent-sandbox-design.md`)

- Todo terminal de agente roda sob o sandbox do macOS (Seatbelt). Dois modos: **aberto** (padrão) e **estrito**.
- Uma escrita bloqueada vira um **cartão** para o dono; o agente pede com
  `collie access request <caminho> --write --reason "…"`. Nada é liberado sem o seu clique; dá para liberar "para o
  lote" e **Revogar** depois.
- O sandbox não bloqueia a rede e **não** protege do que roda fora dele (um terminal livre, o Terminal.app). Diga isso:
  é honestidade de produto, não letra miúda.
- O laço autônomo roda sempre sob o perfil estrito do cercado.

Releia a seção inteira da referência antes da copy final: o que exatamente cada modo permite ler/escrever. Não
prometa "seguro" nem "isolado" sem qualificar.

## O que falar

Mensagem: o agente trabalha no projeto dele; para sair de lá, pede, e você decide com um clique.

| | EN | PT-BR |
|---|---|---|
| Eyebrow | `11 · SANDBOX` | `11 · SANDBOX` |
| H2 | Agents stay in their paddock. | Agentes ficam no cercado deles. |
| Lead | Every agent terminal runs under the macOS sandbox. A write outside its project is blocked and becomes a card: the agent says why, and you allow or deny it. | Todo terminal de agente roda sob o sandbox do macOS. Uma escrita fora do projeto é bloqueada e vira um cartão: o agente diz por quê, e você permite ou nega. |
| Bullets | Open or strict mode, per terminal · Nothing is granted without your click; revoke anytime · It limits files, not the network | Modo aberto ou estrito, por terminal · Nada é liberado sem o seu clique; revogue quando quiser · Limita arquivos, não a rede |
| Prompt | Update the shared config in ~/dotfiles | Atualize a config compartilhada em ~/dotfiles |
| Command | `collie access request ~/dotfiles --write` | igual |

## GIF `sandbox` — "bloqueado, pedido, permitido"

Cena: à esquerda uma árvore de arquivos com duas áreas: `project/` dentro de um contorno tracejado (o cercado) e
`~/dotfiles/` fora. Terminal `dev · claude` à direita.

1. **"Agents write inside their project."** Terminal edita `project/src/app.ts`; o arquivo pisca verde ✓.
2. **"Outside is blocked."** Terminal tenta `~/dotfiles/gitconfig`; o arquivo pisca em aviso com um cadeado;
   terminal: `write blocked by sandbox`.
3. **"The agent asks, with a reason."** `↳ collie access request ~/dotfiles --write --reason "shared lint config"`;
   cartão do dono: `Allow dev to write ~/dotfiles? "shared lint config"` com **Allow** / **Deny**.
4. **"You decide. You can revoke."** Cursor clica **Allow**; o cadeado abre, o arquivo fica ✓; aparece um chip
   `Granted · Revoke` ao lado.

Poster: batida 3 (cartão de aprovação aberto).

## Correções da verificação (2026-11-18, contra `docs/referencia.md` e `Sources/`)

- **O modo é global, não por terminal.** "Modo do sandbox" fica em Preferências e vale para o Collie inteiro; cada
  terminal guarda o modo com que começou. Bullet 1 virou "Open (default) or strict, set in Preferences".
- **Bloqueio e cartão só existem no modo estrito.** No aberto (padrão) o agente escreve em qualquer pasta, não há
  cartão e `collie access request` responde que o acesso já está liberado. Lead, H2 e mediaAlt agora dizem
  "strict mode"; o GIF mostra um chip `strict` no cabeçalho. H2: "Agents ask to leave the paddock." (a versão
  anterior prometia o que só vale no estrito).
- **Texto do cartão (app, em PT):** "Agente *X* tentou **escrever** `caminho`", "Motivo do agente: …", botões
  **Liberar este caminho** / **Liberar a pasta** / **Negar**, e "para o lote". No GIF (EN): `Agent dev tried to
  write ~/dotfiles`, `Reason: shared lint config`, **Allow this path** / **Deny**. O PRD dizia `Allow dev to write …`
  com Allow/Deny: não existe.
- **Erro do bloqueio:** é o do Seatbelt, `Operation not permitted`, não `write blocked by sandbox`.
- **Allow reinicia o terminal** (o grant reinicia os terminais que ele alcança): não mostrar o agente "continuando"
  na mesma sessão. Chip `Granted · Revoke` (no app: **Revogar**) está certo.
- `~/dotfiles` não está na lista "nunca gravável" (rc do shell, `~/.gitconfig`, `~/.config/git`…): é liberável.
  Use `eslint.config.js`, não `gitconfig`.
- Pendente: composição `media/sandbox/` copiada do template, ainda sem roteiro nem render (ver relatório).

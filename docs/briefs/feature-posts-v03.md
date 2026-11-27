# Brief — 3 posts novos em /features (factory, plugins, fields)

Siga `docs/prd/09-feature-posts.md` inteiro (estrutura fixa, regras de conteúdo, tom, tamanho). Contrato:
`src/i18n/posts/types.ts`. Modelo de estilo: `src/i18n/posts/shepherd.ts` e `src/i18n/posts/loop.ts`.

Fonte da verdade: o repo do app em `~/Documents/codes/my-orchestrator-memory`, **na tag `v0.3.1`** (só leitura, com
`git show v0.3.1:<arquivo>`; o `main` local divergiu do remoto, não leia a árvore de trabalho). Comece pelo
`CHANGELOG.md` da tag (seções 0.1.x de plug-ins, 0.2.0, 0.3.0), depois `docs/referencia.md`, `docs/fabrica/` e
`docs/superpowers/roadmap/2026-11-25-fields/`, e confira cada comando/flag em `Sources/`. Comando, flag, rótulo ou limite que
não está lá não entra.

| slug | eyebrow EN / PT | mediaId | Conteúdo |
|---|---|---|---|
| `factory` | `12 · FACTORY` / `12 · FÁBRICA` | `factory` | A fábrica (prévia, 0.2.0): `collie-work.json` com bloco `factory`, `collie factory doctor` (camadas 0–3, `--min`), revisão por personas (`work run --review`, `--personas`), aceite em runtime (`work task add --accept`), "Cercado fábrica" (só o dono marca), auto-land local (`--auto-land`, `--queue`, `--auto-land-max`, `autoLandPerDay`, `stopReason`s), resumo imutável, iscas e catraca, entrada por PRD (`work prd`, `work plan lint`, `work plan apply`). Nunca faz push. Limites conhecidos da 0.2.0. |
| `plugins` | `13 · PLUG-INS` / `13 · PLUG-INS` | `plugins` | Plug-ins: o que um plug-in pode ser (painéis, ganchos de agente `edit`/`stop`, helper), o plug-in Vizinho e as cercas, permissões e instalação, o marketplace fase 1 (0.3.0: aba "Descobrir", catálogo assinado, autor de terceiros "revisado pelo Collie", `collie plugin validate`). Deixe claro que ainda não há catálogo publicado. `collie plugin list`. |
| `fields` | `14 · FIELDS` / `14 · FIELDS` | `fields` | Fields (prévia, 0.3.0): `collie summon <nome> --field`, worktree `collie/field/<nome>` dentro do cercado, integrador único por cercado, `ask --check` que passa faz o land, `collie field list|land|drop`, `fields.max` no `collie-work.json`, sandbox próprio, não convive com `work run --parallel > 1`. Use "field" também no PT (termo do app). |

`related`: 2–3 slugs existentes ou entre os novos (ex.: factory → loop, fields, memory).

## Entrega
1. `src/i18n/posts/factory.ts`, `plugins.ts`, `fields.ts`, cada um exportando `Post` com `en` e `pt`.
2. **Não** edite `index.ts` nem nenhum outro arquivo (o Shepherd integra).
3. `npx tsc --noEmit -p .` verde com os arquivos novos (importe-os num arquivo temporário fora de `src/` se precisar, e
   apague depois).
4. Sem commit. Responda com: os 3 arquivos, contagem de palavras por idioma e, por post, a lista "comando → arquivo:linha
   da fonte" que sustenta cada comando citado.

# Brief — clipes dos posts novos de /features (v0.2.0 a v0.3.1)

Três clipes para três posts novos em `/features`: `factory`, `plugins`, `fields`. Mesmo pipeline e mesmas regras dos clipes
das features: leia `docs/prd/00-overview.md` (seções "Contrato de implementação" e "Regras dos GIFs") e use
`media/loop/index.html` e `media/shepherd/index.html` como referência de estilo. Comece copiando `media/_template/` para
`media/<id>/`.

Fonte da verdade do produto: o repo do app em `~/Documents/codes/my-orchestrator-memory`, **na tag `v0.3.1`**
(`git show v0.3.1:<arquivo>`; o `main` local divergiu do remoto, não use a árvore de trabalho). `CHANGELOG.md` da tag,
seções 0.2.0 e 0.3.0. Use os nomes reais da UI e dos comandos. Nada inventado: se não achar o rótulo no código, use o do
CHANGELOG. Dados de exemplo (nomes de tarefa, arquivos, números) podem ser ilustrativos.

| id | Versão | O que mostrar | Legendas (EN, uma por batida) |
|---|---|---|---|
| `factory` | 0.2.0 (prévia) | Terminal roda `collie work run --review --auto-land`. Uma tentativa recebe parecer de personas (`correção`, `testes`, `segurança`): um achado `[major] file:line` veta, a próxima tentativa passa. Depois a sequência do land, cada item ficando verde: gate on HEAD → review → acceptance (`--accept`) → CI → clean tree → base unmoved → `landed`. Termina com o aviso "ready to push" (nunca faz push). | 1 Each attempt, reviewed by personas. · 2 Gate, review and acceptance, in order. · 3 Landed locally. Ready to push. |
| `plugins` | 0.1.x + 0.3.0 | Aba "Descobrir" do app (marketplace) com cartões de plug-in; um cartão de outro autor mostra "<autor> · revisado pelo Collie"; clicar instala, a confirmação diz "O autor é <autor>, não o Collie. O Collie revisou esta versão."; o plug-in aparece instalado. Uma batida com o Vizinho propondo uma cerca (convenção dos arquivos irmãos) que o dono aprova. Rótulos da UI em português, como no app. | 1 Plug-ins from a signed catalog. · 2 Every author, named before install. · 3 Rules your agents follow. |
| `fields` | 0.3.0 (prévia) | Terminal do Pastor roda `collie summon api --field`; aparece um worktree próprio (`collie/field/api`) dentro do cercado; o agente trabalha; `collie ask api "…" --check` passa e o field entra pelo integrador (land); `collie field list` mostra o estado. | 1 Each agent, its own worktree. · 2 A passing check lands it. · 3 One integrator per paddock. |

## Entrega por clipe
1. `media/<id>/index.html`, `meta.json`, `hyperframes.json` (copiados do template e ajustados). Use os tokens via
   `../_theme.js` para o Light funcionar. Duração de 10 a 12 s, loop limpo.
2. Render Dark e Light, **um clipe por vez** (nunca dois renders em paralelo): `scripts/capture-gif.sh <id>` e
   `THEME=light scripts/capture-gif.sh <id>`. Saída em `public/features/`: `<id>.mp4`, `<id>.jpg`, `<id>.gif`,
   `<id>-light.mp4`, `<id>-light.jpg`. Limites do PRD 00.
3. Abra o poster e uns 3 quadros do meio de cada um e confira: nada cortado, legível, loop limpo, Light sem cor do Dark.

## Regras
- Só toque em `media/factory|plugins|fields/` e `public/features/factory*|plugins*|fields*`.
- Sem commit. Ao terminar, responda com: arquivos, tamanhos, duração de cada clipe, e o que ficou de fora.

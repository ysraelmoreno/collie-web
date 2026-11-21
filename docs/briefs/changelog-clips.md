# Brief — clipes do CHANGELOG

Quatro clipes novos para os destaques do changelog (`docs/pages/changelog/index.html`, opção A). Mesmo pipeline e mesmas
regras dos clipes das features: leia `docs/prd/00-overview.md` (seções "Contrato de implementação" e "Regras dos GIFs") e
use `media/loop/index.html` como referência de estilo. Comece copiando `media/_template/` para `media/<id>/`.

Fonte da verdade do produto: o repo `ysraelmoreno/collie` (`gh api`, `gh repo clone` no scratchpad). Use os nomes reais da
UI (rótulos, títulos de página, comandos). Nada inventado: se não achar o rótulo no código, use o do changelog.

| id | Versão | O que mostrar | Legendas (EN, uma por batida) |
|---|---|---|---|
| `trilho` | 0.1.7 | Janela com o Trilho: coluna de cercados à esquerda (PaddockRail), clicar num cercado mostra o painel de contexto com a árvore de agentes (Shepherd → terminais), troca da aba Canvas para Preferências na mesma janela. Commits: `feat(app): AgentTree…`, `PaddockRail…`, `ContextPanel…`, `abas Canvas/Preferências…` | 1 Paddocks in one column. · 2 Each paddock, its agent tree. · 3 Preferences in a tab, same window. |
| `memory` | 0.1.4–0.1.7 | Um terminal começa e recebe as memórias do projeto (rotuladas como dado); o curador revisa um registro novo e mantém com evidência; o painel Memória mostra precisão ao lado de cobertura. | 1 Agents start already knowing. · 2 The curator reviews what stays. · 3 Precision next to coverage. |
| `updates` | 0.1.2 | Preferências › Atualizações mostra uma versão nova; a folha de instalação passa por baixar → verificar → trocar o app → reabrir; a versão anterior fica guardada. | 1 A new version, inside the app. · 2 Downloaded and verified. · 3 Swapped and relaunched. |
| `design` | 0.1.1 | Painel de design sem motor oferece o download; Preferências › Desenho e sandbox baixa, verifica e instala o motor figcraft; o painel volta pronto com um frame. | 1 The design engine, on demand. · 2 Downloaded, verified, installed. · 3 The panel is ready. |

## Entrega por clipe
1. `media/<id>/index.html`, `meta.json`, `hyperframes.json` (copiados do template e ajustados). Use os tokens via
   `../_theme.js` para o Light funcionar.
2. Render Dark e Light: `scripts/capture-gif.sh <id>` e `THEME=light scripts/capture-gif.sh <id>`. Saída em
   `public/features/`: `<id>.mp4`, `<id>.jpg`, `<id>.gif`, `<id>-light.mp4`, `<id>-light.jpg`. Limites do PRD 00.
3. Copie `<id>.mp4`, `<id>.jpg`, `<id>-light.mp4`, `<id>-light.jpg` para `docs/pages/changelog/media/`.
4. Abra os quadros (o poster e uns 3 do meio) e confira: nada cortado, legível, loop limpo, Light sem cor do Dark.

## Regras
- Só toque em `media/<seus ids>/`, `public/features/<seus ids>*` e `docs/pages/changelog/media/<seus ids>*`.
- Sem commit. Ao terminar, relate: arquivos, tamanhos, duração, e o que ficou de fora.

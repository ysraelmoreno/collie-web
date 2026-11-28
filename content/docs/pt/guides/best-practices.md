---
title: "Boas práticas"
description: "Como montar uma equipe de agentes, dividir o trabalho em cercados, julgar com comandos e manter o sandbox útil."
---

O Collie dá as peças: terminais, guias, cercados, checks, memória, um sandbox. Esta página é sobre juntar as peças para que vários agentes entreguem trabalho de verdade sem pisar uns nos outros, nem em você. Cada seção é um hábito, por que ele ajuda e o comando por trás.

São recomendações, não regras que o app impõe. Onde o app impõe algo, a página diz.

## Fale com um Pastor

Tenha um terminal com quem você fala, marcado como **Pastor**, e deixe ele convocar o resto. Você dá o objetivo uma vez; o Pastor divide, entrega cada parte a um terminal com `collie summon` e traz as respostas.

- **Delegue para terminais, não para os subagentes do próprio agente.** Um terminal convocado está no canvas, tem sandbox próprio, registro de trabalho próprio e aparece na árvore de agentes. Um subagente dentro da sessão do Pastor é invisível para tudo isso.
- **Dê aos terminais o nome do trabalho** (`api`, `testes`, `docs`), não `agente-2`. É pelo nome que você, o Pastor e o quadro do lote se referem a eles.
- **Escolha o modelo por trabalho.** `collie summon testes --model sonnet` para a parte rotineira, um modelo mais forte para o Pastor. Num esforço grande, um sub-Pastor (`--shepherd`) coordena a sua parte com agentes mais baratos. Até 6 terminais cada, 2 níveis de profundidade.
- **Dispense o que terminou.** `collie dismiss <nome>` libera o terminal, e os asks que ele ainda devia falham com um motivo claro (`failedAsks`), para o Pastor perguntar a um substituto.

## Entregue o trabalho e pare de esperar

Um Pastor que espera dentro de um comando desperdiça o turno, e um Pastor Cursor nem recebe a resposta desse jeito.

```compare
before:
  title: Polling
  items:
    - "`collie ask api \"…\"` com uma tarefa longa, bloqueado por minutos"
    - "`sleep 120`, depois `collie check api` de novo"
after:
  title: Entregar e encerrar o turno
  items:
    - "`collie ask api \"…\" --no-wait`"
    - "encerre o turno; a resposta é digitada quando o Pastor estiver ocioso"
    - "ou bloqueie uma vez com `collie wait api`"
```

Num laço, a mesma ideia: `collie work wait` responde quando o trabalho muda ou o laço termina, em vez de você ler o status em laço.

## Um cercado por esforço

Um [cercado](/pt/docs/concepts/paddocks-and-worktrees) é uma branch e uma worktree. Use um para cada coisa que iria num pull request próprio.

- **Abra antes de os agentes começarem**, não depois: os agentes convocados por um Pastor nascem no cercado dele.
- **Integre pequeno e com frequência.** Um land pede cercado limpo, Pasto limpo e o Pasto na branch base. Quanto menos um cercado guarda, menos pode dar conflito.
- **Nunca deixe dois agentes editarem os mesmos arquivos numa worktree.** Para trabalho em paralelo num esforço, dê a cada agente um [field](/pt/docs/features/fields) (`collie summon <nome> --field`, prévia) ou rode as tarefas como um [laço](/pt/docs/features/loop) com `--parallel`. Os dois dão a cada agente uma worktree própria e integram um de cada vez.
- **Guarde o land `pr` para você.** O app impõe: fazer push para um remote nunca é decisão de um agente.

## Julgue o trabalho por um comando

Um agente dizendo "pronto" não é evidência. Dê à tarefa um check e deixe o check decidir.

```sh
collie ask api "Inclua o imposto no total do carrinho" --check "npm test -- cart" --tries 3
```

- **Escreva o check antes do trabalho.** Por padrão o `work run` recusa um check que já passa (`--green-ok` para refatoração), então um check que não prova nada é pego cedo.
- **Nomeie no próprio check os arquivos que ele roda.** Uma tentativa que edita um arquivo que o check nomeia é reprovada sem rodar: o agente não reescreve o próprio juiz.
- **Trate revisores como veto, não como aprovação.** A revisão por personas do laço bloqueia uma tentativa, mas nunca aprova sozinha. O check, o gate e o comando de aceite são as partes duras.

## Mantenha o sandbox útil

Todo terminal roda num sandbox Seatbelt, mas o modo padrão é **aberto**: os agentes leem e escrevem qualquer coisa na sua conta, menos os internos do Collie. É o padrão certo para código confiável que você está escrevendo. É o errado quando um agente lê texto que você não controla (issues, páginas da web, dependências), porque um prompt injection pode então chegar às suas chaves.

- **Mude para estrito** nas Preferências quando os agentes lidam com entrada não confiável. No modo estrito um terminal só escreve no projeto (a worktree do cercado), e segredos como `~/.ssh` e `~/.aws` ficam fechados também para leitura.
- **Não comece um terminal em `~`.** O projeto vira a sua pasta pessoal inteira; a folha de novo terminal avisa.
- **Peça, não contorne.** Uma escrita bloqueada vira um cartão; o agente pede com `collie access request <caminho> --write --reason "…"` e espera o seu clique.
- **Terminais livres são para você.** O "Terminal livre (sem sandbox)" vê tudo o que você vê, e nenhuma guia chega a ele.

A página [Sandbox](/pt/docs/features/sandbox) lista o que cada modo fecha e os riscos que ficam abertos.

## Deixe a memória levar as lições

Os agentes começam cada sessão do zero. A [memória](/pt/docs/features/memory) do Collie é como uma decisão de segunda-feira chega ao agente de quinta.

- **Busque antes de reler o código:** `collie memory search "<área>"`. Sai mais barato que uma dúzia de leituras de arquivo.
- **Guarde o que não é óbvio:** uma decisão e o motivo, uma armadilha e como evitá-la. `collie memory save --kind pitfall --subject <assunto> --title "<uma linha>" "<por quê>"`. Um save novo no mesmo assunto substitui o antigo.
- **Marque o que está errado.** `collie memory flag <id> --wrong` ou `--outdated` contesta uma memória e pede ao curador uma nova checagem.
- **Agrupe um esforço num lote** quando vários terminais o dividem: eles ganham um escopo de memória comum e um quadro (`collie lot post --kind handoff --to <nome> "…"`). Um recado do quadro é dado de outro agente, não uma ordem.

## Mantenha o registro de trabalho honesto

O [registro de trabalho](/pt/docs/features/work-log) é o que o app mostra do andamento de cada terminal. O Claude preenche pelos hooks; Codex e terminais shell não têm hooks e precisam dos comandos:

```sh
collie work start "Imposto no carrinho"
collie work task add "Imposto no total"
collie work note "A alíquota vem da configuração, não da API" --decision
collie work task done "Imposto no total"
collie work done
```

Um trabalho também fecha sozinho quando a branch dele é integrada.

## Notas por agente

- **Claude** recebe mais: ferramentas MCP, orientação, injeção de memória, hooks. Use para o Pastor.
- **Codex** não recebe orientação nem injeção de memória. Conte a ele sobre o `collie` no primeiro prompt e peça que leia `collie lot board` e `collie comment list` por conta própria.
- **Cursor** responde um ask por ociosidade, e um Pastor Cursor precisa encerrar o turno (ou usar `collie wait`) para receber respostas. Os pedidos de permissão dele aparecem como atenção no app.

## Mantenha o app como admin

Preferências, liberações do sandbox, instalação de plug-ins e reinício do serviço são seus, no app. O serviço recusa o token de admin vindo de dentro de qualquer terminal do Collie, então um agente que "precisa de admin" está pedindo algo a você: dê um cartão, não um atalho. Reinicie o serviço só quando quiser: **Reiniciar serviço** fecha todos os terminais abertos.

## Veja também

- [Pastor e terminais](/pt/docs/concepts/shepherd-and-terminals)
- [Cercados e worktrees](/pt/docs/concepts/paddocks-and-worktrees)
- [Laço](/pt/docs/features/loop) e [Fields](/pt/docs/features/fields)

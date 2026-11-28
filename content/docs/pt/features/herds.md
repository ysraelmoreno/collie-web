---
title: "Rebanhos"
description: "Equipes prontas: terminais com preset e papel, painéis, guias e um cercado, aplicados por inteiro ou nada."
---

Um rebanho é uma equipe que você aplica de uma vez: terminais (cada um com preset, prompt inicial e posição), painéis,
as guias entre eles e, se quiser, um cercado. O Collie vem com três rebanhos e deixa você salvar o canvas, ou uma seleção
dele, como um rebanho novo.

Use um rebanho quando monta a mesma equipe várias vezes: um Pastor com backend, interface e revisor, ou um investigador
e alguém de testes para um bug. Aplicar é tudo ou nada: se qualquer passo falha, o que foi criado é desfeito.

## Como se conecta

Cada terminal que um rebanho cria fica [ligado por guia](/pt/docs/concepts/shepherd-and-terminals) ao Pastor do rebanho
(ou ao Pastor que o aplicou), então a equipe já conversa no primeiro prompt. Um rebanho que pede cercado cria um
([cercados](/pt/docs/concepts/paddocks-and-worktrees)), e os terminais nascem dentro dele. Os painéis são os mesmos que
você abre à mão: Design, Navegador e os demais. Os rebanhos salvos entram no backup dos dados.

## Os rebanhos de fábrica

| Rebanho | Equipe | Painéis | Cercado |
|---|---|---|---|
| "Feature fullstack" | Pastor, backend, interface e revisor | Design e Navegador | Sim |
| "Feature com design" | Pastor, designer, interface e tester | Design e Navegador | Sim |
| "Investigar bug" | Pastor, investigador e quem escreve o teste que falha | nenhum | Não |

Cada terminal vem com um papel escrito como primeiro prompt. Os rebanhos de fábrica não podem ser substituídos nem
removidos.

## Salvar um rebanho

No menu do canvas ou no ⌘K: "Salvar canvas como rebanho…" ou, com itens selecionados, "Salvar seleção como rebanho…".
Só entra o estado permitido:

- do painel Design, o arquivo e o armazenamento;
- do painel Navegador, o endereço http(s) (sem usuário e senha, com aviso quando tem parâmetros `?…`) e o armazenamento.

Painéis de dispositivo e os demais plug-ins são pulados, com aviso. Nunca vão para o rebanho: histórico de terminal,
tokens, links do Design, variáveis de ambiente, caminhos absolutos e `cwd`.

## Aplicar um rebanho

```steps
items:
  - title: Abra a folha de rebanhos
    result: "⌘K › \"Aplicar rebanho…\", a seção REBANHOS do painel lateral ou \"Aplicar rebanho aqui…\" no canvas."
  - title: Leia a prévia
    result: "Ela lista tudo que será criado, com cada comando e cada prompt. **Aplicar** só libera depois de rolar até o fim (\"role até o fim da prévia\")."
  - title: Dê o nome e aplique
    result: "\"Nome (obrigatório)\" é o prefixo do que será criado; \"Criar cercado\" e \"Pasta\" escolhem o cercado e a pasta. Enter nunca aplica."
```

Aplicada pelo app, a equipe nasce no cercado que está na tela; se o rebanho pede cercado, um novo é criado e o app vai
para ele. Um rebanho que pede cercado num pasto sem git cria um cercado de pasta, e o campo `folder` do rebanho escolhe
outra pasta dentro do projeto.

### Tudo ou nada

Se qualquer passo falha, ou um terminal fica parado numa pergunta (como confiar na pasta), o que esta aplicação criou é
desfeito: terminais e painéis. O cercado só é removido se não tem commits, alterações não commitadas, arquivos ignorados
(build, `.env`) nem terminal nele; senão fica, com aviso. Arquivos de design criados também ficam. Se o serviço cair
durante a aplicação, o que já foi criado fica: remova à mão.

## Pelo Pastor

```sh
collie herd list
collie herd apply feature-fullstack --name checkout --paddock true
collie herd save minha-equipe --terminals api,web,revisor --panels design
```

Um Pastor aplica sempre no próprio cercado e na própria pasta; tudo que ele cria fica ligado por guia a ele, com as regras
de `paddock create` e `panel open`. O `herd save` aceita `--roles` (um objeto JSON de nome do terminal para prompt
inicial) e `--wantsPaddock`. Remover, importar e exportar são só do app.

## O arquivo `.collieherd`

**Exportar…** e **Importar…**, na folha de rebanhos, levam um rebanho como arquivo JSON com `format: 1`.

```stats
items:
  - value: 256 KiB
    label: por arquivo
  - value: 20
    label: terminais
  - value: 20
    label: painéis
```

Terminais de 320×200 a 4000×4000 (painéis a partir de 200×200), posições até 100000. Campos desconhecidos são ignorados.

```callout
kind: warning
title: Um rebanho importado não é confiável
body: "A tela de confiança mostra cada comando (`preset: custom`) e cada prompt antes de guardar, e importar não cria nada até você aplicar. O aplicar envia o resumo (digest) da prévia: se o rebanho mudou desde então, o daemon recusa."
```

Se já existe um rebanho salvo com o mesmo id, a tela oferece **Substituir**.

## Armadilhas

- Um rebanho guarda papéis e layout, não estado: nada de histórico de terminal nem de conversa. Escreva o papel para um
  agente novo começar dele.
- Painéis de dispositivo não viajam num rebanho. Abra-os depois de aplicar.
- **Remover** tira um rebanho salvo da lista e o guarda em `herds/.removed`; ele não é apagado.

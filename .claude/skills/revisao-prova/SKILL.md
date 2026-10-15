---
name: revisao-prova
description: Prepara o Caderno visual para a prova de uma matéria no fim do módulo - audita todas as aulas, preenche lacunas, reforça os destaques "cai na prova", cartões e cola, e monta um plano de estudo. Use quando a pessoa falar de prova, revisão, "estudar pro fim do módulo", "juntar tudo", "o que cai", ou pedir um resumo geral de uma matéria.
---

# Revisão para a prova

A página `/<modulo>/<materia>/revisao` já junta sozinha: `<p class="prova">` de cada
`conteudo.html`, `> [!prova]` das notas, os `cartoes` e a `cola` de cada `revisao.js` e todos os
glossários. Esta skill garante que esse material esteja completo e certo.

## 1. Levantar

Para cada aula da matéria (`src/aulas/<modulo>/<materia>/*`), leia `meta.json`, `conteudo.html`,
`revisao.js` e `notas/`. Anote:

- tópicos sem nenhum `<p class="prova">` ou cartão;
- `> [!prova]` e `> [!professor]` das notas que ainda não viraram texto (use a skill `integrar-notas`);
- `> [!duvida]` sem resposta;
- informação da prova que a pessoa trouxer (formato, conteúdo, peso, data, provas antigas).

## 2. Completar

- Cada tópico importante tem pelo menos 1 destaque `prova` e 1 cartão.
- Cartões no formato de pergunta de prova: definição, "por que", aplicação, comparação entre
  conceitos de aulas diferentes. 8–15 por aula.
- Cola: uma linha por conceito, só o essencial para relembrar.
- Responda as dúvidas abertas no próprio `.md` (abaixo do callout) e avise a pessoa.
- Se houver provas antigas ou lista de exercícios, crie um arquivo `notas/exercicios.md` com
  enunciados e resolução passo a passo, ou uma figura passo a passo para os mais difíceis.

## 3. Plano de estudo

Entregue na conversa (não no site, a menos que a pessoa peça):

- ordem de revisão das aulas, do que mais cai para o que menos cai;
- o que treinar fazendo (exercícios) e o que basta reler;
- se houver data, distribua por dias.

## 4. Conferir

Build sem erro e abrir `/<modulo>/<materia>/revisao` no `npm run dev`: contagem de destaques,
cartões e termos coerente, cartões abrindo, glossário com busca.

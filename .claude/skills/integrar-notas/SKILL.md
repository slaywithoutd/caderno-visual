---
name: integrar-notas
description: Leva o que aconteceu na aula presencial para dentro da página da aula no Caderno visual - anotações do professor, slides, fotos do quadro. Use quando a pessoa disser que colocou arquivos em notas/, mandar anotações ou slides da aula, ou pedir para "atualizar a aula com o que o professor falou", "integrar as notas", "o professor disse que cai X".
---

# Integrar notas da aula

Ao comparar material presencial, siga `.claude/skills/auditar-cobertura/SKILL.md` e atualize
`cobertura.json`. Uma aula pode acrescentar tópicos que o autoestudo não continha. Integre em
Leitura e Consulta quando ambos existirem; só anexar o PDF não corrige uma omissão no texto.

Há dois níveis. Faça o primeiro sempre; o segundo quando a pessoa pedir para integrar.

## Nível 1: guardar o material bruto (sem reescrever a aula)

Pasta: `src/aulas/<modulo>/<materia>/<aula>/notas/`.

- Anotações em texto viram `notas/AAAA-MM-DD-assunto.md` (ou o nome que a pessoa der), com
  frontmatter `titulo` e `data`. Mantenha as palavras dela; só organize em bullets e títulos.
- O que o professor enfatizou: `> [!professor] …`. O que vai cair: `> [!prova] …`.
  Dúvidas que ficaram: `> [!duvida] …`.
- Slides (PDF) e fotos: copie para `notas/` com nomes curtos sem espaço (`slides-aula-03.pdf`,
  `quadro-1.jpg`). PDFs aparecem embutidos; fotos não citadas no markdown viram galeria.
- Se a pessoa mandar só uma frase ("ele disse que cai bombeamento"), acrescente ao `.md` do dia.

A seção "Da aula" aparece sozinha na página quando `notas/` tem arquivo.

## Nível 2: integrar ao texto da aula

Leia todo o `notas/` (markdown, o texto dos PDFs com a skill de PDF, e as fotos) e compare com
`conteudo.html`, `glossario.js` e `revisao.js`.

1. **O que é novo** (assunto que os autoestudos não cobriam): crie bullets ou uma seção nova no
   ponto lógico do texto, com `<div class="src"><span class="bk">Aula presencial · DD/MM</span></div>`
   (ou dentro da seção existente, com a mesma marcação). Se virar seção, adicione em `meta.secoes`.
2. **O que muda o que já está escrito** (notação diferente, outro exemplo, correção): ajuste o
   texto e avise a pessoa do que mudou. Se a notação do professor for diferente da dos vídeos,
   prefira a do professor (é a da prova) e cite a outra.
3. **Ênfase do professor**: identifique como aula presencial. Use `<p class="prova">` apenas se houver indicação explícita de cobrança, não por ser um tema mencionado.
4. Termos novos → `glossario.js` (confira antes no glossário global se já existem; rode `npm run checar`). Perguntas que o professor fez ou exemplos de prova → `revisao.js`.
5. Se o professor usou um conceito que o caderno ainda não explica, crie uma caixa **Base** (ver `CLAUDE.md`).
6. Exemplo resolvido no quadro que ajuda a entender → considere uma figura passo a passo.
7. Não apague os arquivos de `notas/`: eles são o registro original.

## Depois de um encontro de Computação

1. Leia o PDF dos slides inteiro (extraia o texto de todas as páginas e confira visualmente diagramas e
   tabelas). Preencha `cobertura.json` página por página; fonte que era `indisponivel` passa a `integral`.
2. Reescreva a seção `encontro` com o encontro real: caminho curto na ordem dos slides, as cinco ideias
   do resumo, o quiz do slide com as respostas, as armadilhas e o Desafio. Troque o quiz autoral pelo real.
3. Compare os exercícios e a aplicação ao projeto dos slides com as seções `exercicios` e `projeto`:
   o que o professor fez entra com atribuição; o treino autoral que sobrar continua marcado como autoral.
4. Procure nos slides o que eles anunciam para o próximo encontro e leve para a aula seguinte agora.
5. Releia a aula procurando erros factuais que os slides corrigem (edição do livro, números).

## Conferir

Build sem erro, abrir a aula no `npm run dev`, checar a seção "Da aula" e a revisão da matéria
(`/<modulo>/<materia>/revisao`). Resuma para a pessoa o que entrou e onde.

---
name: integrar-notas
description: Leva o que aconteceu na aula presencial para dentro da página da aula no Caderno visual - anotações do professor, slides, fotos do quadro. Use quando a pessoa disser que colocou arquivos em notas/, mandar anotações ou slides da aula, ou pedir para "atualizar a aula com o que o professor falou", "integrar as notas", "o professor disse que cai X".
---

# Integrar notas da aula

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
3. **Ênfase do professor**: vire `<p class="prova">` no ponto certo do texto (além do callout).
4. Termos novos → `glossario.js`. Perguntas que o professor fez ou exemplos de prova → `revisao.js`.
5. Exemplo resolvido no quadro que ajuda a entender → considere uma figura passo a passo.
6. Não apague os arquivos de `notas/`: eles são o registro original.

## Conferir

Build sem erro, abrir a aula no `npm run dev`, checar a seção "Da aula" e a revisão da matéria
(`/<modulo>/<materia>/revisao`). Resuma para a pessoa o que entrou e onde.

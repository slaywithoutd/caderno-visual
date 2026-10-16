---
name: ajustar-visual
description: Muda o visual ou o comportamento do Caderno visual em todas as aulas de uma vez (cores, fontes, espaçamentos, sidebar, figuras, controles, glossário, home). Use quando a pessoa pedir ajuste de design, reclamar de algo feio/estranho/desalinhado, ou quiser um componente novo reaproveitável.
---

# Ajustar visual

Regra principal: mudança de visual se faz **uma vez**, nas peças compartilhadas, e vale para todas
as aulas. Nunca edite o `conteudo.html` de cada aula para corrigir aparência.

## Onde mexer

| O quê | Arquivo |
|---|---|
| cores, fontes, espaçamentos, qualquer estilo | `src/styles/global.css` (tokens no `:root`; tema escuro logo abaixo) |
| estrutura da página da aula (ordem das seções geradas, rodapé) | `src/pages/[modulo]/[materia]/[aula].astro` |
| sidebar, popover, cabeçalho comum | `src/layouts/Aula.astro`, `src/layouts/Base.astro` |
| home | `src/pages/index.astro` |
| página de revisão (matéria e eixo) | `src/components/RevisaoPagina.astro` (rotas em `src/pages/[modulo]/[materia]/revisao*`) |
| figura passo a passo (controles, hover, passos) | `src/lib/stepfig.js` |
| animação em loop | `src/lib/loop.js` |
| glossário e popover | `src/lib/glossary.js` |
| desenho de autômatos | `src/lib/machine.js` |
| callouts das notas | `src/lib/callouts.mjs` |
| regra dos 80% visível para animar | `fracaoVisivel` e `VISIVEL_MIN` em `src/lib/dom.js` |
| glossário coletivo | `src/pages/glossario.astro` |
| modo leitura (óculos) e sua animação | `src/lib/oculos.js` + bloco "modo leitura" no fim de `global.css` |

Componente novo reaproveitável: crie em `src/lib/` (JS) ou `src/components/` (Astro), estilo em
`global.css`, e documente o markup em `CLAUDE.md` (seção "Vocabulário do conteudo.html").

## Cuidados

- Respeite as "Decisões de design" do `CLAUDE.md`. Se o pedido contradiz uma delas, faça o que a
  pessoa pediu agora e atualize a lista.
- Toda cor sai de um token e funciona nos dois temas (claro e escuro).
- Layout: coluna principal `--mw` (3/4) + margem; abaixo de 1100px vira uma coluna; nada pode
  rolar para o lado em 400px.
- Se mudar classes usadas no `conteudo.html`, procure e atualize em todas as aulas
  (`src/aulas/**/conteudo.html`) e no `CLAUDE.md`.

## Conferir

Build sem erro. No `npm run dev`, abra a home, **todas** as aulas e uma página de revisão, em
desktop (1440px) e celular (400px), claro e escuro, com e sem o modo leitura (botão de óculos). Mostre à pessoa um antes/depois em uma frase.

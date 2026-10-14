# Caderno visual

Autoestudos de todas as matérias em formato de post: texto curto, desenhos na margem, figuras
passo a passo e animações em loop. Cada matéria é uma área; cada aula vira uma página; a home lista tudo.

Site: https://slaywithoutd.github.io/caderno-visual/

## Rodar

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/
```

O deploy no GitHub Pages roda sozinho a cada push na `main` (`.github/workflows/deploy.yml`), com `BASE_PATH=/caderno-visual`.

## Estrutura

```
src/
  data/aulas.js              áreas e aulas (home + sidebar)
  layouts/Base.astro         <head>, fontes, CSS global
  layouts/Aula.astro         sidebar flutuante, sumário, popover do glossário
  pages/index.astro          home com a lista de aulas
  pages/<area>/<slug>.astro  página de cada aula
  aulas/<area>/<slug>/
    conteudo.html            texto da aula (HTML puro)
    figuras.js               figuras passo a passo da aula
    loops.js                 animações em loop da aula
    glossario.js             termos do glossário
  lib/
    stepfig.js               figura passo a passo (anima com o mouse em cima)
    loop.js                  animação em loop: frame(t), t ∈ [0,1)
    machine.js               desenho de autômatos em SVG
    glossary.js              glossário, termos clicáveis e popover
    chrome.js                sumário ativo, progresso, sidebar no celular
```

## Dois tipos de animação

- **Passo a passo** (`StepFig`): para processos com estados discretos que o leitor quer
  controlar (derivação, simulação de AP). Notas surgem na margem a cada passo.
- **Em loop** (`loop`): para mostrar uma ideia sem controles, como um gif. A função de desenho
  recebe só `t ∈ [0,1)`, então o fim emenda no começo; pausa fora da tela e respeita
  "reduzir movimento".

## Adicionar uma aula

1. Crie `src/aulas/<area>/<slug>/` com `conteudo.html`, `figuras.js`, `loops.js` e `glossario.js`.
2. Copie `src/pages/lfa/01-conceitos.astro` para `src/pages/<area>/<slug>.astro` e troque os imports.
3. Adicione a aula em `src/data/aulas.js` (e a área, se for uma matéria nova).

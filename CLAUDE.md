# Caderno visual

Site pessoal de estudos (Astro, estático, GitHub Pages) da dona do repo, estudante do Inteli.
Cada aula de cada matéria vira um post: texto curto em bullets, desenhos na margem, figuras
passo a passo, animações em loop e glossário. Serve para estudar no lugar dos autoestudos
(vídeos e leituras) e, no fim do módulo, para revisar para a prova.

- Site: https://slaywithoutd.github.io/caderno-visual/
- Repo: github.com/slaywithoutd/caderno-visual (público). Deploy automático a cada push na `main`.
- Idioma de tudo (texto, código, commits): português do Brasil.

## Skills do projeto (`.claude/skills/`)

| Skill | Quando usar |
|---|---|
| `nova-aula` | Chegaram transcrições/links/PDFs de autoestudos: criar a página de uma aula nova. |
| `integrar-notas` | Depois da aula presencial: levar anotações, slides e fotos de `notas/` para dentro da aula. |
| `revisao-prova` | Fim do módulo: auditar as aulas de uma matéria e deixar a revisão pronta para a prova. |
| `ajustar-visual` | Mudar o visual ou o comportamento de todas as aulas de uma vez. |
| `publicar` | Build, commit, push e conferir o deploy no Pages. |

## Estrutura

```
src/data/estrutura.js            módulos e matérias (m8: comp, mat, negocios, ux, lideranca)
src/aulas/<modulo>/<materia>/<aula>/
  meta.json                      título, resumo, tópicos, seções do sumário, fontes   (obrigatório)
  conteudo.html                  texto da aula, só as seções de conteúdo               (obrigatório)
  index.js                       importa figuras.js e loops.js (roda no navegador)
  figuras.js                     figuras passo a passo (StepFig) e widgets
  loops.js                       animações em loop
  glossario.js                   termos do glossário (export default {...})
  revisao.js                     export const cartoes = [[p, r]], cola = [[tópico, resumo]]
  notas/                         material da aula presencial: *.md, *.pdf, fotos
src/pages/index.astro            home: módulos → matérias → aulas
src/pages/[modulo]/[materia]/[aula].astro     página de qualquer aula (não precisa copiar)
src/pages/[modulo]/[materia]/revisao.astro    revisão da matéria (gerada)
src/lib/                         peças reaproveitáveis (stepfig, loop, machine, glossary, catalogo…)
src/styles/global.css            todo o visual (tokens no topo)
```

A página da aula monta sozinha, depois do `conteudo.html`: **Revisão rápida** (de `revisao.js`),
**Da aula** (de `notas/`, só aparece se houver arquivo), **Glossário** e **Fontes** (de `meta.json`).
Não escreva essas seções no `conteudo.html`. O sumário da sidebar é `meta.secoes` + essas extras.

Slug da aula: `NN-assunto-curto` (ex.: `02-automatos-finitos`). `numero` em `meta.json` = `NN`.

## meta.json

```json
{
  "numero": "02",
  "titulo": "Autômatos finitos",
  "tema": "Linguagens Formais e Autômatos",
  "resumo": "Uma frase com o que a aula cobre.",
  "topicos": ["AFD", "AFN", "Minimização"],
  "secoes": [["afd", "Autômato finito determinístico"], ["afn", "Não determinismo"]],
  "fontes": [
    { "tipo": "Vídeo", "titulo": "Nome do vídeo", "url": "https://…", "duracao": "34 min", "secao": "afd" },
    { "tipo": "Livro", "titulo": "Menezes, cap. 3 (p. 70–80)", "secao": "afn" }
  ],
  "observacao": "Opcional: nota de rodapé (notação adotada, ressalvas)."
}
```

`secoes[i][0]` é o `id` de um `<section class="chap">` do `conteudo.html`, na mesma ordem.

## Vocabulário do conteudo.html

Cada seção:

```html
<section class="chap" id="afd">
 <div class="prose">
  <span class="num">01</span>
  <h2>Título da seção</h2>
  <div class="src"><a class="vd" href="URL" target="_blank" rel="noopener">Vídeo · Nome ↗</a></div>
  <p>Parágrafo curto.</p>
  <ul class="b"><li><b>Termo</b>: explicação curta.</li></ul>
 </div>
 <!-- figura passo a passo aqui, fora do .prose -->
 <div class="prose">…continua…</div>
</section>
<hr class="sep">
```

- Fonte do livro: `<span class="bk">Menezes · cap. 2 · p. 54–58</span>` dentro de `.src`.
- Caixas: `<div class="def key"><span class="lab">Definição · X</span>…</div>`; `.def.warn` para erros comuns/pegadinhas; `.def` neutro para dicas.
- Fórmula em destaque: `<div class="formula">L(G) = { w ∈ T* | S ⇒⁺ w }</div>`.
- Tabela: `<div class="tbl prose"><table>…</table></div>`.
- **Cai na prova**: `<p class="prova">frase curta e direta</p>`. Vai também para a revisão da matéria. Use 3 a 6 por aula, só no que realmente cai.
- Variáveis de gramática: `<span class="v">S</span>`; terminais: `<span class="t">a</span>`.
- Termos do glossário viram link sozinhos (primeira ocorrência por seção). Não marque à mão.

### Desenho de margem (estático)

Dentro de um `.prose`, **antes** do parágrafo que ele ilustra. Ocupa a coluna da direita (1/4).

```html
<aside class="mn" aria-hidden="true"><svg viewBox="0 0 240 140">…</svg>Legenda de uma linha.</aside>
```

Classes de SVG: formas `k` (neutro), `s` (traço), `ac`/`acf` (destaque azul), `am` (âmbar), `bl` (azul),
`gr` (verde), `rd` (vermelho); texto `tm` (pequeno, apagado), `ta`, `tb`, `tam`, `st` (alinhado à esquerda).
Setas: `marker-end="url(#mnarrow)"`. Largura do viewBox sempre 240.

### Animação em loop (sem controles, tipo gif)

Para uma ideia que se entende vendo acontecer (algo girando, enchendo, ramificando).

```html
<aside class="mn loop" data-loop="pilha" data-ms="8000" data-still="0.4" aria-hidden="true"><span class="loop-tag">em loop</span><svg></svg>Legenda.</aside>
```

Em `loops.js`: `montar.pilha = (svg) => { /* desenha uma vez */ return (t) => { /* atualiza por t ∈ [0,1) */ }; }`.
Use `fatia`, `ease`, `lerp`, `clamp01` de `src/lib/loop.js`. O quadro em `t` deve depender só de `t`
(assim o loop emenda). `data-still` é o quadro mostrado para quem pede menos movimento.

### Figura passo a passo (com controles)

Para processos com estados discretos que o leitor quer controlar: derivações, simulações, provas.

```html
<figure class="fig" id="fig-afd">
  <div class="fig-head"><span class="fig-title">Figura 3 · Título</span><div class="fig-tabs"></div></div>
  <div class="fig-body">
    <div class="fig-stage"><svg id="afd-svg" viewBox="0 0 640 300"></svg></div>
    <div class="fig-side"><div class="lab">Passo a passo</div><ol class="fig-notes"></ol></div>
  </div>
  <div class="fig-ctrl"></div>
</figure>
```

Em `figuras.js`: `new StepFig(document.getElementById('fig-afd'), { notes: ['html do passo 1', …], render(k) { … }, speed: 1800 })`.
Autômatos: `drawMachine(svg, { states:[{id,x,y,start,accept}], edges:[{from,to,labels:[{text,k}],bend}] })`.
Veja os exemplos da aula `m8/comp/01-conceitos`.

## glossario.js

```js
export default {
  chave: { t: 'Título (sigla)', m: ['formas', 'que viram link'], d: 'Definição em 1–2 frases.',
           a: 'como se fosse (analogia, opcional)', x: 'pra ir além (opcional)', see: ['outra-chave'] },
};
```

Toda chave em `see` precisa existir. `m` em minúsculas, do mais específico ao mais geral. Evite formas
curtas demais que casam com palavras comuns.

## notas/ (material da aula presencial)

Markdown no estilo Obsidian. Frontmatter opcional `titulo` e `data`. Callouts viram blocos:
`> [!prova]`, `> [!professor]`, `> [!duvida]`, `> [!dica]`, `> [!atencao]`. `[!prova]` vai para a revisão.
PDFs aparecem embutidos; imagens não citadas no markdown viram galeria.

## Como escrever

- Parágrafos de até 3 linhas; o resto em bullets. Uma ideia por bullet.
- Escreva como uma pessoa que domina o assunto explicando para colega. Frases diretas, voz ativa.
- Sem travessão para apartes, sem "não é X, é Y", sem "vale notar", sem emoji.
- Toda seção diz de qual fonte veio (`.src`). O conteúdo precisa cobrir **tudo** o que as fontes cobrem:
  ao terminar, confira item por item contra as transcrições/capítulos.
- Notação matemática com caracteres Unicode (Σ, ε, ⇒, ⊊, aⁿbⁿ), não LaTeX.

## Decisões de design (não desfazer sem a dona pedir)

- Visual limpo de post técnico (Medium/ByteByteGo): fundo claro, IBM Plex Sans/Mono, cor só nos diagramas.
- Sidebar flutuante presa à esquerda, sem fundo, sem barra de rolagem visível; mostra só a aula atual.
- Texto na coluna de 3/4; a margem de 1/4 recebe desenhos, loops e os passos das figuras.
- Figuras sem caixa. Barra de controles (play, ‹, ›, reiniciar, progresso) **acima** da figura.
- Figura passo a passo anima só com o mouse em cima e avança na hora em que ele entra.
- Passos surgem um por vez; a coluna de passos tem a altura da figura e rola por dentro.

## Verificar

```bash
npm run dev                                         # http://localhost:4321
MSYS_NO_PATHCONV=1 BASE_PATH=/caderno-visual npx astro build   # igual ao CI (no Git Bash do Windows)
```

Templates `.astro`: evite `x > 0 &&` e `<object>` dentro de expressões (quebra o compilador);
calcule booleanos no frontmatter.

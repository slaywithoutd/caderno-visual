import { S, H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* ============ Fig 1: três sintaxes concretas, uma sintaxe abstrata ============ */
(function () {
  const root = document.getElementById('fig-ast');
  if (!root) return;
  const pre = document.getElementById('ast-codigo'), svg = document.getElementById('ast-svg');
  const linhas = [
    ['x = a + 2;', 'Mini'],
    ['x := a + 2', 'Pascal'],
    ['(setq x (+ a 2))', 'Lisp'],
    ['let y = 3 in …', 'OCL'],
    ['y = 3', 'OCL'],
  ];
  const lns = linhas.map(([c, l]) => { const s = H('span', { class: 'ln' }, `${esc(c.padEnd(18))}<span style="color:var(--muted)">// ${l}</span>`); pre.appendChild(s); return s; });

  /* árvore: nós retangulares (mesmo visual da árvore Σ* da aula 01) */
  const gE = S('g', null, svg), gN = S('g', null, svg);
  const no = (x, y, txt, w = 70) => {
    const g = S('g', { class: 'wnode anim hide' }, gN);
    S('rect', { x: x - w / 2, y: y - 15, width: w, height: 30, rx: 7 }, g);
    S('text', { x, y }, g, txt);
    return g;
  };
  const aresta = (x1, y1, x2, y2) => S('line', { x1, y1: y1 + 15, x2, y2: y2 - 15, class: 'sv-edge anim hide' }, gE);
  const atr = no(180, 30, 'Atribuição', 100), vx = no(90, 110, 'x', 44), soma = no(270, 110, 'Soma', 70), va = no(220, 190, 'a', 44), dois = no(320, 190, '2', 44);
  const e1 = aresta(180, 30, 90, 110), e2 = aresta(180, 30, 270, 110), e3 = aresta(270, 110, 220, 190), e4 = aresta(270, 110, 320, 190);
  const ocl1 = no(95, 110, 'Atribuição(y, 3)', 150), ocl2 = no(265, 110, 'Igualdade(y, 3)', 150);
  const duvida = S('text', { x: 180, y: 40, class: 'sv-muted anim hide', 'text-anchor': 'middle' }, svg, 'o mesmo "y = 3", dois nós possíveis');
  const nota = S('text', { x: 180, y: 222, class: 'sv-muted', 'text-anchor': 'middle' }, svg, '');

  const notes = [
    'Cinco linhas em quatro linguagens. As três primeiras dão a mesma ordem: guarde <code>a + 2</code> em <code>x</code>.',
    'Na Mini, <code>x = a + 2;</code>. O <code>=</code> e o <code>;</code> dizem que é uma atribuição e que ela acabou. Na árvore, isso vira o tipo do nó: <i>Atribuição</i>.',
    'A atribuição tem dois filhos: quem recebe (<code>x</code>) e o valor (uma <i>Soma</i>).',
    'A soma tem dois filhos, <code>a</code> e <code>2</code>. Repare: não há nó para <code>=</code>, <code>+</code> ou <code>;</code>. Eles viraram o tipo dos nós ou sumiram.',
    'Em Pascal, <code>x := a + 2</code>: outra pontuação, sem ponto e vírgula. A árvore é a mesma.',
    'Em Lisp, <code>(setq x (+ a 2))</code>: parênteses em toda parte e o operador antes. A árvore ainda é a mesma. A sintaxe abstrata é o que as três têm em comum.',
    'Agora a OCL. Dentro do <code>let</code>, <code>y = 3</code> atribui; numa expressão, <code>y = 3</code> compara. O mesmo texto pode virar dois nós, e só o contexto decide: é o que a diretriz 23 manda evitar.',
  ];
  const arvore = [atr, vx, soma, va, dois, e1, e2, e3, e4];
  new StepFig(root, { notes, speed: 2200, render(k) {
    lns.forEach((l, i) => {
      l.classList.toggle('cur', (k >= 1 && k <= 3 && i === 0) || (k === 4 && i === 1) || (k === 5 && i === 2) || (k === 6 && i >= 3));
      l.style.opacity = i >= 3 && k < 6 ? 0.45 : 1;
    });
    const vis = (el, on) => el.classList.toggle('hide', !on);
    const comArvore = k >= 1 && k <= 5;
    vis(atr, comArvore); vis(vx, comArvore && k >= 2); vis(soma, comArvore && k >= 2); vis(e1, comArvore && k >= 2); vis(e2, comArvore && k >= 2);
    vis(va, comArvore && k >= 3); vis(dois, comArvore && k >= 3); vis(e3, comArvore && k >= 3); vis(e4, comArvore && k >= 3);
    arvore.forEach((n) => n.classList.toggle('hl', k >= 4 && k <= 5));
    vis(ocl1, k === 6); vis(ocl2, k === 6); vis(duvida, k === 6);
    ocl1.classList.toggle('new', k === 6); ocl2.classList.toggle('new', k === 6);
    nota.textContent = k >= 3 && k <= 5 ? 'Atribuição(x, Soma(a, 2))' : '';
  } });
})();

/* ============ Fig 2: a especificação da Mini, parte por parte ============ */
(function () {
  const root = document.getElementById('fig-spec');
  if (!root) return;
  const chips = document.getElementById('spec-partes'), dir = document.getElementById('spec-dir'), pre = document.getElementById('spec-texto');
  const partes = [
    ['Propósito', 'diretrizes 1–3',
`Quem escreve: estudantes começando a programar.
Quem revisa: o professor, na correção.
Uso: traduzir para Python e rodar.
Fica de fora: tudo o que não for conta ou decisão.`],
    ['Realização', 'diretrizes 4–7',
`Textual (rápida de construir com ANTLR).
Expressões e comandos com a forma de C e Python.
Tipos: inteiro e booleano, sem conversão automática.`],
    ['Conteúdo', 'diretrizes 8–13',
`atribuição    x = expr;
decisão       se (...) { } senao { }
repetição     enquanto (...) { }   (só esta)
saída         escreva(expr);`],
    ['Léxico', 'diretrizes 15, 16, 18 e 23',
`IDENT     [a-z][a-z0-9_]*   (menos palavras-chave)
INTEIRO   [0-9]+
palavras  se senao enquanto escreva verdadeiro falso
OPREL     == != < <= > >=
OPSOMA    + -          OPMUL  * /
=  ;  (  )  {  }
descarta  espaços e // comentário até o fim da linha`],
    ['Sintaxe', 'EBNF · diretriz 24',
`programa = { comando } ;
comando  = atribuicao | se | enquanto | escreva ;
se       = "se" "(" expr ")" bloco [ "senao" bloco ] ;
bloco    = "{" { comando } "}" ;
expr     = soma [ OPREL soma ] ;
soma     = termo { OPSOMA termo } ;
termo    = fator { OPMUL fator } ;
fator    = "(" expr ")" | IDENT | INTEIRO | ...`],
    ['Semântica', 'o que a gramática não confere',
`1. Variável só é lida depois de receber valor.
2. Condição de se e enquanto é booleana.
3. + - * / < > só entre inteiros.
4. == e != entre valores do mesmo tipo.
5. escreva mostra o valor e pula linha.`],
    ['Exemplos', 'testes do compilador',
`ok         n = 5; f = 1;
           enquanto (n > 1) { f = f * n; n = n - 1; }
           escreva(f);                 // 120
léxico     x = 2 @ 3;
sintático  x = 3 + ;
semântico  escreva(y);                 // y sem valor`],
  ];
  const cs = partes.map(([nome]) => { const c = H('span', { class: 'tk' }, nome); chips.appendChild(c); return c; });
  const notes = [
    'Uma especificação tem partes que dependem umas das outras. Comece pelo que a linguagem é para, termine pelos exemplos.',
    'Propósito: quem escreve, quem revisa e para que serve (diretrizes 1 e 2). O que não serve ao uso fica de fora (3).',
    'Realização: textual e copiando a forma de linguagens conhecidas, inclusive o sistema de tipos (4, 6 e 7).',
    'Conteúdo: quatro comandos e um só jeito de repetir (8 a 12). Se a lista crescer, desconfie.',
    'Léxico: cada token com seu padrão. <code>=</code> e <code>==</code> são tokens diferentes (23), e comentários são permitidos (18).',
    'Sintaxe: a gramática em EBNF, com um nível por operador. As chaves marcam o bloco, então a indentação não muda nada (24).',
    'Semântica: as regras que a GLC não consegue conferir, uma por linha. Elas viram a análise semântica.',
    'Exemplos: um programa válido e um erro de cada fase. Eles viram os primeiros testes do compilador.',
  ];
  new StepFig(root, { notes, speed: 2600, render(k) {
    cs.forEach((c, i) => { c.classList.toggle('on', i === k - 1); c.classList.toggle('past', i < k - 1); });
    if (k === 0) { dir.textContent = 'especificação da Mini'; pre.textContent = partes.map(([n]) => `## ${n}`).join('\n'); return; }
    const [nome, d, texto] = partes[k - 1];
    dir.textContent = `${nome} · ${d}`;
    pre.textContent = texto;
  } });
})();

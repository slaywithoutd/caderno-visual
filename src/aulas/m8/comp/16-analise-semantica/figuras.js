import { S, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Peças comuns: nó (retângulo com texto), aresta e rótulo de atributo. Cores só por token. */
const COR = { h: 'var(--amber)', s: 'var(--green)', e: 'var(--red)', n: 'var(--muted)' };
function no(g, x, y, txt) {
  const w = Math.max(30, txt.length * 9 + 16);
  const n = S('g', { class: 'wnode' }, g);
  S('rect', { x: x - w / 2, y: y - 13, width: w, height: 26, rx: 6 }, n);
  S('text', { x, y }, n, txt);
  return n;
}
function aresta(g, a, b) {
  return S('line', { x1: a[0], y1: a[1] + 13, x2: b[0], y2: b[1] - 13, class: 'sv-edge' }, g);
}
function rotulo(g, x, y, ancora) {
  return S('text', { x, y: y + 4, class: 'sv-muted anim hide', 'text-anchor': ancora || 'middle', style: 'font-weight:600' }, g, '');
}
function pinta(el, cor) { el.style.fill = COR[cor] || ''; }
function liga(el, cor) { el.style.stroke = cor ? COR[cor] : ''; el.style.strokeWidth = cor ? '2.4' : ''; }

/* ============ Fig 1: soma dos dígitos de 34, só sintetizado × com herdado ============ */
(function () {
  const root = document.getElementById('fig-digitos');
  if (!root) return;
  const svg = document.getElementById('dig-svg');
  const gE = S('g', null, svg), gN = S('g', null, svg), gT = S('g', null, svg);
  S('text', { x: 150, y: 10, class: 'sv-muted', 'text-anchor': 'middle' }, gT, 'N → N₁ num | num');
  S('text', { x: 470, y: 10, class: 'sv-muted', 'text-anchor': 'middle' }, gT, 'N → num X ;  X → num X₁ | ε');
  /* esquerda */
  const P = { N: [150, 44], N1: [90, 114], n4: [210, 114], n3: [90, 184] };
  /* direita */
  const Q = { N: [430, 44], n3: [370, 114], X: [490, 114], n4: [430, 184], X1: [550, 184], eps: [550, 254] };
  const eL = { N1: aresta(gE, P.N, P.N1), n4: aresta(gE, P.N, P.n4), n3: aresta(gE, P.N1, P.n3) };
  const eR = { n3: aresta(gE, Q.N, Q.n3), X: aresta(gE, Q.N, Q.X), n4: aresta(gE, Q.X, Q.n4), X1: aresta(gE, Q.X, Q.X1), eps: aresta(gE, Q.X1, Q.eps) };
  no(gN, ...P.N, 'N'); no(gN, ...P.N1, 'N₁'); no(gN, ...P.n4, 'num'); no(gN, ...P.n3, 'num');
  no(gN, ...Q.N, 'N'); no(gN, ...Q.n3, 'num'); no(gN, ...Q.X, 'X'); no(gN, ...Q.n4, 'num'); no(gN, ...Q.X1, 'X₁'); no(gN, ...Q.eps, 'ε');
  /* rótulos: [elemento, texto, cor, passo em que aparece] */
  const R = [
    [rotulo(gT, 210, 140), 'v = 4', 'n', 0], [rotulo(gT, 90, 210), 'v = 3', 'n', 0],
    [rotulo(gT, 60, 114, 'end'), 'N₁.v = 3', 's', 1], [rotulo(gT, 120, 44, 'end'), 'N.v = 3 + 4 = 7', 's', 2],
    [rotulo(gT, 370, 140), 'v = 3', 'n', 3], [rotulo(gT, 430, 210), 'v = 4', 'n', 3],
    [rotulo(gT, 516, 106, 'start'), 'X.h = 3', 'h', 4], [rotulo(gT, 576, 176, 'start'), 'X₁.h = 7', 'h', 5],
    [rotulo(gT, 576, 194, 'start'), 'X₁.s = 7', 's', 6], [rotulo(gT, 516, 124, 'start'), 'X.s = 7', 's', 7],
    [rotulo(gT, 460, 44, 'start'), 'N.v = 7', 's', 8],
  ];
  R.forEach(([el, t, c]) => { el.textContent = t; pinta(el, c); });
  /* arestas acesas em cada passo: [aresta, cor] */
  const A = [[], [[eL.n3, 's']], [[eL.N1, 's'], [eL.n4, 's']], [], [[eR.X, 'h']], [[eR.X1, 'h']], [[eR.eps, 's']], [[eR.X1, 's']], [[eR.X, 's']]];
  const notes = [
    'À esquerda, <code>N → N₁ num</code>, com recursão à esquerda: o 3 fica mais fundo. As folhas já trazem <code>num.v</code> do léxico (intrínseco).',
    '<code>N₁ → num</code>: <code>N₁.v = num.v = 3</code>. O valor sobe do filho para o pai: sintetizado.',
    '<code>N → N₁ num</code>: <code>N.v = N₁.v + num.v = 3 + 4 = 7</code>. Tudo subiu, nada precisou vir de cima: S-atribuído.',
    'À direita, sem recursão à esquerda: <code>N → num X</code>, <code>X → num X₁ | ε</code>. A descida lê o 3 antes de saber o que vem depois.',
    '<code>X.h = num.v</code>: o 3 desce para X como herdado. Ele vem do irmão à esquerda, o num.',
    '<code>X₁.h = X.h + num.v = 3 + 4 = 7</code>. O herdado continua descendo, já com a soma.',
    '<code>X₁ → ε</code>: <code>X₁.s = X₁.h = 7</code>. No fim, o herdado vira sintetizado.',
    '<code>X.s = X₁.s</code>: o 7 sobe sem mudar.',
    '<code>N.v = X.s = 7</code>. Mesma resposta por outro caminho: desce somando, sobe copiando. L-atribuído, o que a descida recursiva consegue fazer.',
  ];
  new StepFig(root, { notes, speed: 2200, render(k) {
    R.forEach(([el, , , p]) => el.classList.toggle('hide', p > k));
    [...Object.values(eL), ...Object.values(eR)].forEach((e) => liga(e, null));
    A[k].forEach(([e, c]) => liga(e, c));
  } });
})();

/* ============ Fig 2: pilha de tabelas no exercício do let ============ */
(function () {
  const root = document.getElementById('fig-letin');
  if (!root) return;
  const linhas = ['let x = 2, y = 3 in', '  let x = x + 1,', '      y = let z = 3, x = 4 in x + y + z', '  in x + y'];
  const prog = document.getElementById('li-prog');
  const pilhaEl = document.getElementById('li-pilha');
  const busca = document.getElementById('li-busca');
  const G = 'global { }';
  const P = [
    { l: -1, p: [G], b: '', n: 'O construtor de <code>Escopos</code> já empilha o escopo global, vazio.' },
    { l: 0, p: [G, 'T1 { x: 2 }'], b: 'declarar x: não está no topo → insere em T1', n: 'O primeiro <code>let</code> chama <code>criarNovoEscopo()</code>: T1 vai para o topo. <code>x = 2</code> confere só o topo e insere.' },
    { l: 0, p: [G, 'T1 { x: 2, y: 3 }'], b: 'declarar y → insere em T1', n: '<code>y = 3</code> entra em T1. O corpo depois do <code>in</code> é outro <code>let</code>.' },
    { l: 1, p: [G, 'T1 { x: 2, y: 3 }', 'T2 { x: 3 }'], b: 'x + 1:  x → T2? não · T1: 2  ⇒  3', n: 'O segundo <code>let</code> empilha T2. Em <code>x = x + 1</code>, a expressão roda antes da declaração: o x é achado em T1, vale 2, e o novo x = 3 entra em T2.' },
    { l: 2, p: [G, 'T1 { x: 2, y: 3 }', 'T2 { x: 3 }', 'T3 { z: 3, x: 4 }'], b: 'y ainda não existe em T2', n: 'Para declarar y, primeiro calcula a expressão dele, que é outro <code>let</code>: T3 recebe z = 3 e x = 4.' },
    { l: 2, p: [G, 'T1 { x: 2, y: 3 }', 'T2 { x: 3 }', 'T3 { z: 3, x: 4 }'], b: 'x → T3: 4\ny → T3? não · T2? não · T1: 3\nz → T3: 3\n4 + 3 + 3 = 10', n: '<code>x + y + z</code>. O x está no topo. O y não está em T3 nem em T2, porque o y do meio ainda está sendo calculado, e é achado em T1. Dá 10.' },
    { l: 2, p: [G, 'T1 { x: 2, y: 3 }', 'T2 { x: 3, y: 10 }'], b: 'abandonarEscopo(): sai T3 inteira', n: 'O let interno acabou: <code>abandonarEscopo()</code> tira T3 de uma vez. Agora sim, y = 10 entra em T2.' },
    { l: 3, p: [G, 'T1 { x: 2, y: 3 }', 'T2 { x: 3, y: 10 }'], b: 'x → T2: 3\ny → T2: 10\n3 + 10 = 13', n: '<code>in x + y</code>: os dois são achados no topo, T2. O x = 2 e o y = 3 de T1 estão sombreados.' },
    { l: -1, p: [G], b: 'resultado: 13', n: 'Os dois <code>let</code> terminam e desempilham T2 e T1. Sobra o global, como no começo, e o programa vale 13.' },
  ];
  new StepFig(root, { notes: P.map((p) => p.n), speed: 2600, render(k) {
    const p = P[k];
    prog.innerHTML = linhas.map((t, i) => (i === p.l ? '<b>' + esc(t) + '</b>' : esc(t))).join('\n');
    pilhaEl.innerHTML = '';
    p.p.forEach((t, i) => {
      const c = document.createElement('span');
      c.className = 'tk ' + (i === p.p.length - 1 ? 'on' : 'past');
      c.textContent = t;
      pilhaEl.appendChild(c);
    });
    busca.textContent = p.b || ' ';
  } });
})();

/* ============ Fig 3: tipos em pós-ordem em a = a + b + 1 ============ */
(function () {
  const root = document.getElementById('fig-tipos');
  if (!root) return;
  const svg = document.getElementById('ti-svg');
  const gE = S('g', null, svg), gN = S('g', null, svg), gT = S('g', null, svg);
  const P = { eq: [320, 36], a1: [200, 106], mo: [440, 106], mi: [370, 176], um: [520, 176], a2: [300, 246], b: [440, 246] };
  aresta(gE, P.eq, P.a1); aresta(gE, P.eq, P.mo); aresta(gE, P.mo, P.mi); aresta(gE, P.mo, P.um); aresta(gE, P.mi, P.a2); aresta(gE, P.mi, P.b);
  const N = { eq: no(gN, ...P.eq, '='), a1: no(gN, ...P.a1, 'a'), mo: no(gN, ...P.mo, '+'), mi: no(gN, ...P.mi, '+'), um: no(gN, ...P.um, '1'), a2: no(gN, ...P.a2, 'a'), b: no(gN, ...P.b, 'b') };
  const T = {
    a2: rotulo(gT, 300, 274), b: rotulo(gT, 440, 274), mi: rotulo(gT, 396, 176, 'start'), um: rotulo(gT, 520, 204),
    mo: rotulo(gT, 466, 106, 'start'), eq: rotulo(gT, 346, 36, 'start'), a1: rotulo(gT, 200, 134),
  };
  const msg = S('text', { x: 10, y: 292, class: 'sv-muted', 'text-anchor': 'start', style: 'font-weight:600' }, gT, '');
  const tab = S('text', { x: 10, y: 14, class: 'sv-muted', 'text-anchor': 'start' }, gT, 'tabela: a → int · b → real');
  /* cada passo: tipos visíveis { nó: [texto, cor] }, nó em foco, mensagem */
  const P1 = { a2: ['int', 's'] };
  const P2 = { ...P1, b: ['real', 's'] };
  const P3 = { ...P2, mi: ['invalido', 'e'] };
  const P4 = { ...P3, um: ['int', 's'] };
  const P5 = { ...P4, mo: ['invalido', 'e'] };
  const P6 = { ...P5, a1: ['int (lugar)', 'n'], eq: ['nada a conferir', 'n'] };
  const P7 = { a2: ['int → real', 'h'], b: ['real', 's'], mi: ['real', 's'], um: ['int → real', 'h'], mo: ['real', 's'], a1: ['int (lugar)', 'n'], eq: ['erro', 'e'] };
  const M = "linha 1: '+' entre int e real";
  const passos = [
    [{}, null, '', 'A árvore de <code>a = a + b + 1;</code>, com a soma da esquerda embaixo. A verificação anda em pós-ordem: os filhos antes do pai.'],
    [P1, 'a2', '', 'Folha <code>a</code>: <code>buscar</code> na pilha de tabelas acha <code>a → int</code>.'],
    [P2, 'b', '', 'Folha <code>b</code>: real.'],
    [P3, 'mi', M, 'O <code>+</code> de baixo recebe int e real. Sem conversão, é erro: a mensagem sai com a linha, e o nó devolve <code>invalido</code>.'],
    [P4, 'um', M, 'Folha <code>1</code>: literal inteiro, int.'],
    [P5, 'mo', M, 'O <code>+</code> de cima recebe inválido e int. Como um filho já é inválido, devolve inválido sem nova mensagem.'],
    [P6, 'eq', M, 'No <code>=</code>, a expressão é inválida: não compara com o tipo de <code>a</code>. Fica uma mensagem só para o programa inteiro.'],
    [P7, 'eq', "linha 1: 'a' é int e recebe uma expressão real", 'Com coerção (<code>SemanticoComConversao</code>): o <code>a</code> e o <code>1</code> ganham nós int_para_real, as duas somas ficam real e o erro passa para o <code>=</code>, porque real em int perderia a parte decimal.'],
  ];
  new StepFig(root, { notes: passos.map((p) => p[3]), speed: 2400, render(k) {
    const [tipos, foco, m] = passos[k];
    Object.entries(T).forEach(([id, el]) => {
      const t = tipos[id];
      el.classList.toggle('hide', !t);
      if (t) { el.textContent = t[0]; pinta(el, t[1]); }
    });
    Object.entries(N).forEach(([id, g]) => g.classList.toggle('new', id === foco));
    msg.textContent = m;
    pinta(msg, 'e');
    tab.textContent = 'tabela: a → int · b → real';
  } });
})();

import { S } from '../../../../lib/dom.js';
import { loop, ease, clamp01, fatia, lerp } from '../../../../lib/loop.js';

/* Animações em loop da aula 16. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1): o quadro depende só de t, então o loop emenda. */
const montar = {};

/* herda: soma dos dígitos de 34 sem recursão à esquerda. O valor desce como herdado (âmbar)
   até o ε e volta como sintetizado (verde). */
montar.herda = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 176');
  const Y = { N: 22, X: 70, X1: 118, e: 158 };
  const XC = 96;
  S('line', { x1: XC, y1: Y.N + 12, x2: XC, y2: Y.X - 12, class: 's' }, svg);
  S('line', { x1: XC, y1: Y.X + 12, x2: XC, y2: Y.X1 - 12, class: 's' }, svg);
  S('line', { x1: XC, y1: Y.X1 + 12, x2: XC, y2: Y.e - 10, class: 's' }, svg);
  S('line', { x1: XC - 8, y1: Y.N + 10, x2: 44, y2: 44, class: 's' }, svg);
  S('line', { x1: XC - 8, y1: Y.X + 10, x2: 44, y2: 92, class: 's' }, svg);
  [['N', Y.N], ['X', Y.X], ['X₁', Y.X1]].forEach(([t, y]) => {
    S('circle', { cx: XC, cy: y, r: 12, class: 'k' }, svg);
    S('text', { x: XC, y }, svg, t);
  });
  S('text', { x: XC, y: Y.e }, svg, 'ε');
  S('text', { x: 34, y: 50, class: 'tm' }, svg, 'num 3');
  S('text', { x: 34, y: 98, class: 'tm' }, svg, 'num 4');
  const bola = S('circle', { cx: XC + 30, cy: Y.N, r: 7, class: 'am' }, svg);
  const val = S('text', { x: XC + 46, y: Y.N, class: 'st' }, svg, '');
  return (t) => {
    let y, txt, verde;
    if (t < 0.5) {
      const f = ease(clamp01((t - 0.04) / 0.42));
      y = lerp(Y.X, Y.e, f);
      txt = y < Y.X1 ? 'h = 3' : (y < Y.e - 2 ? 'h = 3 + 4 = 7' : 's = h = 7');
      verde = y >= Y.e - 2;
    } else {
      const f = ease(clamp01((t - 0.54) / 0.4));
      y = lerp(Y.e, Y.N, f);
      txt = y > Y.N + 2 ? 's = 7' : 'N.v = 7';
      verde = true;
    }
    bola.setAttribute('cy', y);
    val.setAttribute('y', y);
    val.textContent = txt;
    bola.setAttribute('class', verde ? 'gr' : 'am');
    val.setAttribute('class', verde ? 'st' : 'st tam');
  };
};

/* pilha: a pilha de tabelas de { int x; { real y; { int x; … x … } } }.
   Empilha ao entrar, a busca de x para no topo, e cada saída tira a tabela inteira. */
montar.pilha = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 176');
  const tabelas = ['global { x: int }', 'B1 { y: real }', 'B2 { x: int }'];
  const quadros = [
    { n: 1, leg: 'escopo global' },
    { n: 2, leg: 'entra no bloco: empilha B1' },
    { n: 3, leg: 'entra de novo: empilha B2' },
    { n: 3, busca: true, leg: 'buscar x: o topo já tem' },
    { n: 2, leg: 'sai de B2: a tabela inteira sai' },
    { n: 1, leg: 'sai de B1: o global continua igual' },
  ];
  const caixas = tabelas.map((t, i) => {
    const g = S('g', null, svg);
    const y = 120 - i * 38;
    S('rect', { x: 40, y, width: 160, height: 30, rx: 6, class: i === 0 ? 'k' : 'bl' }, g);
    S('text', { x: 120, y: y + 15, style: 'font-size:11px' }, g, t);
    return g;
  });
  const seta = S('path', { d: 'M222 54 H204', class: 's', 'marker-end': 'url(#mnarrow)' }, svg);
  const achou = S('text', { x: 222, y: 40, class: 'tam' }, svg, 'x');
  const leg = S('text', { x: 120, y: 166, class: 'tm' }, svg, '');
  S('text', { x: 20, y: 14, class: 'tm st' }, svg, 'topo');
  return (t) => {
    const [k, f] = fatia(t, quadros.length);
    const q = quadros[k];
    caixas.forEach((g, i) => {
      const antes = i < (quadros[(k + quadros.length - 1) % quadros.length].n);
      const agora = i < q.n;
      let op = agora ? 1 : 0;
      if (agora && !antes) op = ease(clamp01(f / 0.35));
      if (!agora && antes) op = 1 - ease(clamp01(f / 0.35));
      g.style.opacity = op;
    });
    const b = q.busca ? ease(clamp01(f / 0.3)) : 0;
    seta.style.opacity = b;
    achou.style.opacity = b;
    leg.textContent = q.leg;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

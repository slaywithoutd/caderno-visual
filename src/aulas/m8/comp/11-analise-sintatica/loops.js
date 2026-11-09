import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, clamp01, fatia } from '../../../../lib/loop.js';

/* Animações em loop da aula 11. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada só a partir de t ∈ [0,1). */
const montar = {};

/* direcoes: a mesma árvore nasce da raiz (descendente) e das folhas (ascendente) */
montar.direcoes = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  const arv = (ox) => {
    const pos = [[ox + 50, 26], [ox + 26, 70], [ox + 74, 70], [ox + 12, 112], [ox + 40, 112], [ox + 74, 112]];
    const pais = [null, 0, 0, 1, 1, 2];
    const ar = pais.map((p, i) => (p === null ? null : S('line', { x1: pos[p][0], y1: pos[p][1], x2: pos[i][0], y2: pos[i][1], class: 's' }, svg)));
    const nos = pos.map(([x, y], i) => S('circle', { cx: x, cy: y, r: 9, class: i < 3 ? 'bl' : 'k' }, svg));
    return { ar, nos };
  };
  const desc = arv(4), asc = arv(124);
  S('text', { x: 54, y: 142, class: 'tm' }, svg, 'descendente');
  S('text', { x: 174, y: 142, class: 'tm' }, svg, 'ascendente');
  const nivelDesc = [0, 1, 1, 2, 2, 2], nivelAsc = [2, 1, 1, 0, 0, 0];
  return (t) => {
    const cresc = clamp01(t / 0.75) * 3; /* 0..3 níveis */
    const some = t > 0.9 ? 1 - (t - 0.9) / 0.1 : 1;
    [[desc, nivelDesc], [asc, nivelAsc]].forEach(([a, niv]) => {
      a.nos.forEach((n, i) => { const o = clamp01(cresc - niv[i]) * some; n.style.opacity = ease(o); });
      a.ar.forEach((e, i) => { if (!e) return; const o = clamp01(cresc - Math.max(niv[i], niv[[null, 0, 0, 1, 1, 2][i]]) ) * some; e.style.opacity = ease(o); });
    });
  };
};

/* espiar: a lente cresce de 1 a 4 tokens até separar as duas portas */
montar.espiar = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  const toks = ['a', '*', 'b', '+', 'c', '$'];
  toks.forEach((s, i) => { S('rect', { x: 6 + i * 38, y: 10, width: 32, height: 26, rx: 5, class: 'k' }, svg); S('text', { x: 22 + i * 38, y: 23 }, svg, s); });
  const lente = S('rect', { x: 3, y: 6, width: 38, height: 34, rx: 7, class: 'am', style: 'fill-opacity:.25' }, svg);
  const rot = S('text', { x: 120, y: 56, class: 'tam' }, svg, '');
  const porta = (x, txt) => { const r = S('rect', { x, y: 70, width: 100, height: 40, rx: 8, class: 'k' }, svg); S('text', { x: x + 50, y: 90 }, svg, txt); return r; };
  const p1 = porta(10, 'E → T + E'), p2 = porta(130, 'E → T');
  S('text', { x: 120, y: 132, class: 'tm' }, svg, 'T consome a * b nas duas');
  return (t) => {
    const [k, f] = fatia(t, 5);
    const n = Math.min(4, k + 1);
    const alvo = 38 * n;
    lente.setAttribute('width', lerp(38 * Math.max(1, n - 1), alvo, ease(clamp01(f / 0.3))));
    rot.textContent = k < 4 ? `k = ${n}: ${n < 4 ? 'as duas ainda servem' : 'o + decide'}` : 'k = 4: o + decide';
    const decidiu = k >= 3;
    p1.setAttribute('class', decidiu ? 'gr' : 'k');
    p2.setAttribute('class', decidiu ? 'rd' : 'k');
  };
};

/* shiftreduce: S → S + n | n lendo n + n */
montar.shiftreduce = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  const passos = [
    [['$'], ['n', '+', 'n', '$'], 'início'],
    [['$', 'n'], ['+', 'n', '$'], 'shift'],
    [['$', 'S'], ['+', 'n', '$'], 'reduce S → n'],
    [['$', 'S', '+'], ['n', '$'], 'shift'],
    [['$', 'S', '+', 'n'], ['$'], 'shift'],
    [['$', 'S'], ['$'], 'reduce S → S + n'],
    [['$', 'S'], ['$'], 'aceita'],
  ];
  S('text', { x: 6, y: 14, class: 'tm st' }, svg, 'pilha');
  S('text', { x: 6, y: 82, class: 'tm st' }, svg, 'entrada');
  const pilha = [0, 1, 2, 3].map((i) => { const r = S('rect', { x: 6 + i * 34, y: 22, width: 30, height: 28, rx: 5, class: 'k' }, svg); const tx = S('text', { x: 21 + i * 34, y: 36 }, svg, ''); return { r, tx }; });
  const ent = [0, 1, 2, 3].map((i) => { const r = S('rect', { x: 6 + i * 34, y: 90, width: 30, height: 28, rx: 5, class: 'k' }, svg); const tx = S('text', { x: 21 + i * 34, y: 104 }, svg, ''); return { r, tx }; });
  const acao = S('text', { x: 120, y: 140, class: 'tam' }, svg, '');
  return (t) => {
    const [k, f] = fatia(t, passos.length);
    const [p, e, a] = passos[k];
    pilha.forEach((c, i) => { const s = p[i]; c.r.style.opacity = s ? 1 : 0; c.tx.textContent = s || ''; c.r.setAttribute('class', s === 'S' ? 'bl' : 'k'); });
    ent.forEach((c, i) => { const s = e[i]; c.r.style.opacity = s ? 1 : 0; c.tx.textContent = s || ''; c.r.setAttribute('class', i === 0 && s ? 'am' : 'k'); });
    acao.textContent = a;
    acao.style.opacity = clamp01(f / 0.15);
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

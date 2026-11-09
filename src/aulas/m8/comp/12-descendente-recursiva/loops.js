import { S } from '../../../../lib/dom.js';
import { loop, ease, clamp01, fatia } from '../../../../lib/loop.js';

/* Animações em loop da aula 12. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). */
const montar = {};

/* esquerda: o while de soma() em 2 − 1 − 1. A cada volta, a árvore que existe vira o filho da esquerda. */
montar.esquerda = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 160');
  S('text', { x: 120, y: 12, class: 'tm' }, svg, 'esq = termo(); while atual == "−": …');
  const no = (g, x, y, txt, op) => {
    S('circle', { cx: x, cy: y, r: 13, class: op ? 'bl' : 'k' }, g);
    S('text', { x, y, class: op ? 'tb' : '' }, g, txt);
  };
  const liga = (g, x1, y1, x2, y2) => S('line', { x1, y1: y1 + 13, x2, y2: y2 - 13, class: 's' }, g);
  const quadros = [
    { leg: 'antes do while: esq = 2', d(g) { no(g, 120, 70, '2'); } },
    { leg: '1ª volta: esq = (−, 2, 1)', d(g) {
      liga(g, 120, 44, 80, 96); liga(g, 120, 44, 160, 96);
      no(g, 120, 44, '−', true); no(g, 80, 96, '2'); no(g, 160, 96, '1');
    } },
    { leg: '2ª volta: a árvore anterior desce', d(g) {
      liga(g, 150, 34, 100, 78); liga(g, 150, 34, 196, 78); liga(g, 100, 78, 64, 122); liga(g, 100, 78, 136, 122);
      no(g, 150, 34, '−', true); no(g, 100, 78, '−', true); no(g, 196, 78, '1'); no(g, 64, 122, '2'); no(g, 136, 122, '1');
    } },
  ].map((q) => { const g = S('g', null, svg); q.d(g); q.g = g; return q; });
  const leg = S('text', { x: 120, y: 152, class: 'tam' }, svg, '');
  return (t) => {
    const [k, f] = fatia(t, 3);
    quadros.forEach((q, i) => {
      const entra = ease(clamp01(f / 0.2)), sai = 1 - ease(clamp01((f - 0.85) / 0.15));
      q.g.style.opacity = i === k ? Math.min(entra, sai) : 0;
    });
    leg.textContent = quadros[k].leg;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

import { S } from '../../../../lib/dom.js';
import { loop, ease, clamp01, lerp } from '../../../../lib/loop.js';

/* Animações em loop da aula 01 de Matemática. Cada uma é montada num <aside data-loop="nome">
   do consulta.html e redesenhada a partir de t ∈ [0, 1). */
const montar = {};
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/* relogio: são 10h; o ponteiro anda 5 horas e para no 3 (15 = 1·12 + 3) */
montar.relogio = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 190');
  const cx = 120, cy = 82, r = 66;
  S('circle', { cx, cy, r, class: 'k' }, svg);
  for (let h = 1; h <= 12; h++) {
    const a = (h / 12) * 2 * Math.PI - Math.PI / 2;
    S('text', { x: cx + (r - 13) * Math.cos(a), y: cy + (r - 13) * Math.sin(a), class: 'tm' }, svg, String(h));
  }
  const arco = S('path', { class: 'ac', d: '' }, svg);
  const ponteiro = S('line', { x1: cx, y1: cy, x2: cx, y2: cy - 40, class: 'ac' }, svg);
  S('circle', { cx, cy, r: 3.5, class: 'acf' }, svg);
  const leg = S('text', { x: 120, y: 168, class: 'tam' }, svg, '');
  const leg2 = S('text', { x: 120, y: 183, class: 'tm' }, svg, '');
  const angulo = (h) => (h / 12) * 2 * Math.PI - Math.PI / 2;
  return (t) => {
    const p = ease(clamp01((t - 0.15) / 0.45));       // 0 → 1 enquanto anda as 5 horas
    const h = 10 + 5 * p;
    const a = angulo(h);
    ponteiro.setAttribute('x2', cx + 40 * Math.cos(a));
    ponteiro.setAttribute('y2', cy + 40 * Math.sin(a));
    const a0 = angulo(10), ra = 28;
    const grande = 5 * p > 6 ? 1 : 0;
    arco.setAttribute('d', p > 0.01 ? `M${cx + ra * Math.cos(a0)} ${cy + ra * Math.sin(a0)} A${ra} ${ra} 0 ${grande} 1 ${cx + ra * Math.cos(a)} ${cy + ra * Math.sin(a)}` : '');
    const andadas = Math.round(5 * p);
    leg.textContent = t < 0.15 ? 'agora: 10h' : t < 0.62 ? `10h + ${andadas}h` : '10 + 5 = 15 → 3h';
    leg2.textContent = t < 0.62 ? '' : '15 = 1·12 + 3, então 15 ≡ 3 (mod 12)';
  };
};

/* cesar: o anel de dentro gira K = 3 casas e volta; o A de fora fica sobre o D */
montar.cesar = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 228');
  const cx = 120, cy = 112, ro = 96, ri = 72, passo = 360 / 26;
  S('circle', { cx, cy, r: ro + 10, class: 'k' }, svg);
  S('circle', { cx, cy, r: ri + 10, class: 'bl' }, svg);
  S('circle', { cx, cy, r: ri - 12, class: 'k' }, svg);
  const pos = (i, r) => { const a = (i * passo - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  for (let i = 0; i < 26; i++) { const [x, y] = pos(i, ro); S('text', { x, y, style: 'font-size:11px' }, svg, ABC[i]); }
  const dentro = S('g', {}, svg);
  for (let i = 0; i < 26; i++) { const [x, y] = pos(i, ri); S('text', { x, y, class: 'tb', style: 'font-size:11px' }, dentro, ABC[i]); }
  S('path', { d: `M${cx} ${cy - ro - 22} L${cx - 5} ${cy - ro - 30} L${cx + 5} ${cy - ro - 30} Z`, class: 'am' }, svg);
  const leg = S('text', { x: cx, y: cy - 8, class: 'tam' }, svg, '');
  const leg2 = S('text', { x: cx, y: cy + 10, class: 'tm' }, svg, '');
  return (t) => {
    const ida = ease(clamp01((t - 0.08) / 0.32)), volta = ease(clamp01((t - 0.72) / 0.22));
    const K = lerp(0, 3, ida) - lerp(0, 3, volta);
    dentro.setAttribute('transform', `rotate(${-K * passo} ${cx} ${cy})`);
    const k = Math.round(K);
    leg.textContent = `K = ${k}`;
    leg2.textContent = `A → ${ABC[k]}`;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

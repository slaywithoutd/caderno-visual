import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). O quadro depende só de t, para o loop emendar. */
const montar = {};

/* Microcrédito em grupo (Grameen): o crédito passa ao próximo membro à medida que os anteriores pagam */
montar.grupo = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  const N = 5, cx = 120, cy = 66, r = 50;
  S('rect', { class: 'bl', x: cx - 22, y: cy - 12, width: 44, height: 24, rx: 5 }, svg);
  S('text', { x: cx, y: cy + 4 }, svg, 'banco');
  const membros = Array.from({ length: N }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    const x = cx + r * Math.cos(a) * 1.6, y = cy + r * Math.sin(a);
    const c = S('circle', { class: 'k', cx: x, cy: y, r: 11 }, svg);
    S('text', { class: 'tm', x, y: y + 4 }, svg, String(i + 1));
    return { x, y, c };
  });
  const moeda = S('circle', { class: 'am', r: 5 }, svg);
  const legenda = S('text', { class: 'tm', x: 120, y: 144 }, svg, '');
  return (t) => {
    /* cada membro ocupa 1/N do ciclo: 0–.35 recebe, .35–.65 usa, .65–1 paga de volta */
    const fase = t * N, i = Math.min(N - 1, Math.floor(fase)), u = fase - i;
    membros.forEach((m, j) => m.c.setAttribute('class', j < i ? 'gr' : j === i ? (u < 0.65 ? 'am' : 'gr') : 'k'));
    const m = membros[i];
    let p;
    if (u < 0.35) p = ease(clamp01(u / 0.35));
    else if (u < 0.65) p = 1;
    else p = 1 - ease(clamp01((u - 0.65) / 0.35));
    moeda.setAttribute('cx', lerp(cx, m.x, p));
    moeda.setAttribute('cy', lerp(cy, m.y, p));
    legenda.textContent = u < 0.35 ? `membro ${i + 1} recebe o empréstimo` : u < 0.65 ? `membro ${i + 1} investe no negócio` : `membro ${i + 1} paga: vez do próximo`;
  };
};

/* O capital que gira (YSB): o mesmo dinheiro vai a um negócio, volta e vai ao seguinte */
montar.capital = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  S('rect', { class: 'acf', x: 6, y: 52, width: 70, height: 34, rx: 6 }, svg);
  S('text', { x: 41, y: 66 }, svg, 'YSB');
  S('text', { class: 'tm', x: 41, y: 79 }, svg, 'fundo');
  const NEG = ['negócio A', 'negócio B', 'negócio C'];
  const caixas = NEG.map((n, i) => {
    const y = 6 + i * 48;
    const c = S('rect', { class: 'k', x: 150, y, width: 84, height: 32, rx: 6 }, svg);
    S('text', { x: 192, y: y + 20 }, svg, n);
    S('path', { class: 's', d: `M78 69 L146 ${y + 16}`, style: 'stroke-dasharray:3 3;opacity:.5' }, svg);
    return { c, x: 192, y: y + 16 };
  });
  const moeda = S('circle', { class: 'am', r: 6 }, svg);
  const conta = S('text', { class: 'tm', x: 41, y: 104 }, svg, '');
  const leg = S('text', { class: 'tm', x: 120, y: 146 }, svg, '');
  return (t) => {
    /* três rodadas iguais: ida (.0–.3), negócio opera (.3–.6), volta (.6–.9), pausa (.9–1) */
    const fase = t * 3, i = Math.min(2, Math.floor(fase)), u = fase - i;
    const alvo = caixas[i];
    let p;
    if (u < 0.3) p = ease(clamp01(u / 0.3));
    else if (u < 0.6) p = 1;
    else if (u < 0.9) p = 1 - ease(clamp01((u - 0.6) / 0.3));
    else p = 0;
    moeda.setAttribute('cx', lerp(41, alvo.x - 30, p));
    moeda.setAttribute('cy', lerp(69, alvo.y, p));
    caixas.forEach((c, j) => c.c.setAttribute('class', j < i || (j === i && u >= 0.6) ? 'gr' : j === i ? 'am' : 'k'));
    const pagos = i + (u >= 0.9 ? 1 : 0);
    conta.textContent = `financiou ${i + 1}`;
    leg.textContent = u < 0.3 ? 'empréstimo sai' : u < 0.6 ? 'o negócio vende e paga parcelas' : u < 0.9 ? 'o dinheiro volta ao fundo' : `${pagos} pago(s), mesmo dinheiro`;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

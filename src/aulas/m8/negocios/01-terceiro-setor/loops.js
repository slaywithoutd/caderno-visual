import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). Diferente das figuras passo a passo, não têm controles. */
const montar = {};

/* Uma fonte de recursos × quatro fontes: o mesmo corte de uma delas derruba a missão inteira ou um quarto dela */
montar.fontes = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  const base = 112, alt = 80;
  S('text', { class: 'tm', x: 60, y: 14 }, svg, 'uma fonte');
  S('text', { class: 'tm', x: 180, y: 14 }, svg, 'quatro fontes');
  S('line', { class: 's', x1: 20, y1: base, x2: 220, y2: base }, svg);
  const unica = S('rect', { class: 'bl', x: 44, width: 32, rx: 3 }, svg);
  const partes = [0, 1, 2, 3].map(() => S('rect', { class: 'bl', x: 164, width: 32, rx: 2 }, svg));
  const aviso = S('text', { class: 'tm', x: 120, y: 132 }, svg, '');
  const missaoA = S('text', { x: 60, y: 130 }, svg, '');
  const missaoB = S('text', { x: 180, y: 130 }, svg, '');
  return (t) => {
    /* 0 a .25 tudo normal · .25 a .45 o corte · .45 a .75 segura · .75 a .95 recupera · resto normal */
    const queda = t < 0.25 ? 0 : t < 0.45 ? ease(clamp01((t - 0.25) / 0.2)) : t < 0.75 ? 1 : t < 0.95 ? 1 - ease(clamp01((t - 0.75) / 0.2)) : 0;
    const h1 = lerp(alt, 0, queda);
    unica.setAttribute('y', base - h1);
    unica.setAttribute('height', Math.max(0, h1));
    unica.setAttribute('class', queda > 0.05 ? 'rd' : 'bl');
    partes.forEach((r, i) => {
      const h = i === 3 ? lerp(alt / 4, 0, queda) : alt / 4;
      r.setAttribute('y', base - (i + 1) * (alt / 4) + (i === 3 ? (alt / 4 - h) : 0));
      r.setAttribute('height', Math.max(0, h) - (h > 1 ? 1 : 0));
      r.setAttribute('class', i === 3 && queda > 0.05 ? 'rd' : 'bl');
    });
    missaoA.textContent = `missão ${Math.round((1 - queda) * 100)}%`;
    missaoB.textContent = `missão ${Math.round((1 - queda / 4) * 100)}%`;
    aviso.textContent = queda > 0.05 ? 'corte no orçamento' : '';
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

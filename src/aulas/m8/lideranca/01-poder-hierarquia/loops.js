import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). Diferente das figuras passo a passo, não têm controles. */
const montar = {};

/* Junta de campo em corte, duas vezes: a fresta abre na ignição; o anel quente cresce junto e veda,
   o frio demora e o gás passa enquanto ele não alcança a parede */
montar.vedacao = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  const cena = (x0, titulo) => {
    S('text', { class: 'tm', x: x0 + 50, y: 12 }, svg, titulo);
    S('rect', { class: 'k', x: x0, y: 24, width: 34, height: 100 }, svg);
    const direita = S('rect', { class: 'k', y: 24, width: 34, height: 100 }, svg);
    const anel = S('ellipse', { cx: x0 + 50, cy: 74, ry: 9 }, svg);
    const gas = S('path', { class: 'rd', style: 'fill:none;stroke-width:3;stroke-linecap:round' }, svg);
    return { x0, direita, anel, gas };
  };
  const quente = cena(10, 'anel quente');
  const frio = cena(130, 'anel frio (2 °C)');
  const legenda = S('text', { class: 'tm', x: 120, y: 142 }, svg, '');
  return (t) => {
    /* 0 a .15 fechada · .15 a .3 abre (ignição) · .3 a .75 aberta · .75 a .9 fecha · resto fechada */
    const ab = t < 0.15 ? 0 : t < 0.3 ? ease(clamp01((t - 0.15) / 0.15)) : t < 0.75 ? 1 : t < 0.9 ? 1 - ease(clamp01((t - 0.75) / 0.15)) : 0;
    const fresta = lerp(32, 44, ab);
    [[quente, 1], [frio, 0.22]].forEach(([c, rapidez]) => {
      c.direita.setAttribute('x', c.x0 + 34 + fresta);
      /* o anel quente acompanha quase na hora; o frio cresce devagar desde que a junta abre */
      const alvo = fresta / 2;
      const atraso = c === quente ? alvo : Math.min(alvo, 16 + Math.max(0, t - 0.15) * rapidez * 40);
      const rx = Math.max(8, atraso);
      c.anel.setAttribute('cx', c.x0 + 34 + fresta / 2);
      c.anel.setAttribute('rx', rx);
      const vaza = alvo - rx > 1;
      c.anel.setAttribute('class', vaza ? 'rd' : 'gr');
      const xg = c.x0 + 34 + fresta - 3;
      c.gas.setAttribute('d', vaza ? `M${xg} 120 L${xg} 28` : '');
    });
    legenda.textContent = ab > 0.05 ? 'junta aberta: o gás passa onde o anel não chega' : 'junta fechada';
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

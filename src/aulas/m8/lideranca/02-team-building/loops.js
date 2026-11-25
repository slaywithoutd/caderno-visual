import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). Diferente das figuras passo a passo, não têm controles. */
const montar = {};

/* Dinâmica Valores: a barra encolhe de 53 para 20, 10, 5 e 3; no fim volta a 53, e o loop emenda */
montar.funil = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 120');
  const etapas = [53, 20, 10, 5, 3];
  const legendas = ['a lista: 53 valores', 'escolha os 20 que são você', 'tire 10', 'tire mais 5', 'fique com os 3 que importam'];
  const marcas = etapas.map((n, i) => S('text', { class: 'tm', x: 28 + i * 46, y: 14 }, svg, String(n)));
  S('rect', { class: 'k', x: 14, y: 36, width: 212, height: 30, rx: 4 }, svg);
  const barra = S('rect', { class: 'am', y: 36, height: 30, rx: 4 }, svg);
  const numero = S('text', { class: 'tb', x: 120, y: 52 }, svg, '');
  const legenda = S('text', { class: 'tm', x: 120, y: 92 }, svg, '');
  return (t) => {
    const fase = Math.min(4, Math.floor(t * 5));
    const local = t * 5 - fase;
    const atual = etapas[fase], prox = etapas[(fase + 1) % 5];
    /* 70% parado na etapa, 30% encolhendo para a próxima */
    const n = lerp(atual, prox, ease(clamp01((local - 0.7) / 0.3)));
    const w = (212 * n) / 53;
    barra.setAttribute('x', 120 - w / 2);
    barra.setAttribute('width', w);
    numero.textContent = String(Math.round(n));
    legenda.textContent = legendas[fase];
    marcas.forEach((m, i) => m.setAttribute('style', i === fase ? 'font-weight:600;fill:var(--fg)' : ''));
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, clamp01, fatia } from '../../../../lib/loop.js';

/* Animações em loop da aula 09. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). */
const montar = {};

/* geradores: o mesmo modelo passa, um de cada vez, por três geradores e vira três produtos */
montar.geradores = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  S('rect', { x: 4, y: 46, width: 74, height: 58, rx: 8, class: 'bl' }, svg);
  S('text', { x: 41, y: 66, class: 'tb' }, svg, 'modelo');
  S('text', { x: 41, y: 86, class: 'tm' }, svg, 'escrito 1 vez');
  const saidas = [['web', 22], ['celular', 75], ['docs', 128]].map(([nome, y]) => {
    S('path', { d: `M78 75 C110 75 110 ${y} 150 ${y}`, class: 's' }, svg);
    const r = S('rect', { x: 152, y: y - 15, width: 82, height: 30, rx: 7, class: 'k' }, svg);
    S('text', { x: 193, y }, svg, nome);
    return { r, y };
  });
  S('text', { x: 114, y: 146, class: 'tm' }, svg, 'troca o gerador, mantém o modelo');
  const ponto = S('circle', { r: 6, class: 'am' }, svg);
  const rot = S('text', { x: 114, y: 8, class: 'tam' }, svg, '');
  return (t) => {
    const [k, f] = fatia(t, 3);
    const p = ease(clamp01(f / 0.6)), s = saidas[k];
    /* ponto sobre a curva de Bézier do modelo até a saída k */
    const u = 1 - p, x = u * u * u * 78 + 3 * u * u * p * 110 + 3 * u * p * p * 110 + p * p * p * 150;
    const y = u * u * u * 75 + 3 * u * u * p * 75 + 3 * u * p * p * s.y + p * p * p * s.y;
    ponto.setAttribute('cx', x); ponto.setAttribute('cy', y);
    ponto.style.opacity = f < 0.75 ? 1 : lerp(1, 0, clamp01((f - 0.75) / 0.2));
    saidas.forEach((o, i) => o.r.setAttribute('class', i === k && f > 0.55 ? 'gr' : 'k'));
    rot.textContent = `gerador ${k + 1}`;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

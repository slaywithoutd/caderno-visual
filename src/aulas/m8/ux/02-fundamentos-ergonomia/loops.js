import { S } from '../../../../lib/dom.js';
import { loop, ease, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). */
const montar = {};

/* Lei de Fitts: o mesmo movimento em dois alvos. Fase rápida até perto do alvo, fase lenta de correção.
   Escala 3 px por mm. Tempos proporcionais a MT com a = 0,2 s e b = 0,15 s/bit (ilustrativos). */
montar.fitts = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  const X0 = 22, MM = 3;
  const faixas = [
    { y: 40, D: 30, W: 18, id: '1,42 bits', mt: '0,41 s', dur: 0.41 / 0.57 * 0.62 },
    { y: 104, D: 40, W: 9, id: '2,44 bits', mt: '0,57 s', dur: 0.62 },
  ].map((f) => {
    const cx = X0 + f.D * MM, w = f.W * MM;
    S('path', { class: 's', d: `M10 ${f.y} H230`, style: 'stroke-dasharray:3 3' }, svg);
    const alvo = S('rect', { class: 'am', x: cx - w / 2, y: f.y - 14, width: w, height: 28, rx: 3 }, svg);
    S('text', { class: 'tm', x: 196, y: f.y - 22 }, svg, f.id);
    const rel = S('text', { x: 196, y: f.y + 26 }, svg, '');
    const dedo = S('circle', { class: 'acf', cx: X0, cy: f.y, r: 5 }, svg);
    return { ...f, cx, alvo, rel, dedo };
  });
  S('text', { class: 'tm', x: 120, y: 142 }, svg, 'alvo grande e perto · pequeno e longe');
  /* posição ao longo do movimento: 90% do caminho na primeira metade do tempo, o resto devagar */
  const rapido = (x) => 1 - (1 - x) * (1 - x);
  const pos = (u) => (u < 0.45 ? 0.9 * rapido(u / 0.45) : 0.9 + 0.1 * ease((u - 0.45) / 0.55));
  return (t) => {
    const inicio = 0.08;
    faixas.forEach((f) => {
      const u = clamp01((t - inicio) / f.dur);
      const p = clamp01(pos(u));
      f.dedo.setAttribute('cx', X0 + (f.cx - X0) * p);
      const chegou = u >= 1;
      f.alvo.setAttribute('class', chegou ? 'gr' : 'am');
      f.rel.textContent = chegou ? f.mt : t < inicio ? '' : '…';
    });
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

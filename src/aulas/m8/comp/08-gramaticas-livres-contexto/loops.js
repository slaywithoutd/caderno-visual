import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula 08. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). */
const montar = {};

/* meio: P → aP | Pb | ε. A cadeia cresce, o P fica sempre entre os a e os b e some no fim */
montar.meio = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 120');
  const formas = [['P', ''], ['aP', 'P → aP'], ['aaP', 'P → aP'], ['aaPb', 'P → Pb'], ['aaPbb', 'P → Pb'], ['aaPbbb', 'P → Pb'], ['aabbb', 'P → ε']];
  const W = 26, cx = 120;
  const cells = [...Array(6)].map(() => { const g = S('g', null, svg); const r = S('rect', { x: -11, y: -13, width: 22, height: 26, rx: 5 }, g); const t = S('text', { x: 0, y: 1 }, g, ''); return { g, r, t }; });
  const regra = S('text', { x: cx, y: 82, class: 'tam' }, svg, '');
  const nota = S('text', { x: cx, y: 104, class: 'tm' }, svg, '');
  return (t) => {
    const p = t * formas.length, k = Math.min(formas.length - 1, Math.floor(p)), f = ease(clamp01((p - k) / 0.35));
    const [w, r] = formas[k], ant = formas[Math.max(0, k - 1)][0];
    const x0 = cx - (w.length * W) / 2 + W / 2, xa = cx - (ant.length * W) / 2 + W / 2;
    cells.forEach((c, i) => {
      const ch = w[i];
      if (!ch) { c.g.style.opacity = 0; return; }
      c.g.style.opacity = 1;
      c.g.setAttribute('transform', `translate(${lerp(xa + i * W, x0 + i * W, f)},44)`);
      c.r.setAttribute('class', ch === 'P' ? 'bl' : ch === 'a' ? 'am' : 'gr');
      c.t.textContent = ch;
      c.t.setAttribute('class', ch === 'P' ? 'tb' : '');
    });
    regra.textContent = r ? `⇒ ${r}` : 'começa em P';
    nota.textContent = k === formas.length - 1 ? 'aⁿbᵐ: nenhum b antes de um a' : 'a à esquerda do P, b à direita';
  };
};

/* enxerto: a subárvore de E (triângulo de dentro) é trocada por uma cópia da árvore; α e β crescem juntos */
montar.enxerto = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 170');
  const tris = [0, 1, 2].map(() => {
    const g = S('g', null, svg);
    const p = S('path', { class: 'bl' }, g);
    const e = S('text', { class: 'tb' }, g, 'E');
    return { g, p, e };
  });
  const base = S('text', { x: 120, y: 150, style: 'font-size:12px' }, svg, '');
  const lab = S('text', { x: 120, y: 166, class: 'tm' }, svg, '');
  const palavras = ['d', 'd+(d)', 'd+(d+(d))'];
  return (t) => {
    const p = t * 3, k = Math.min(2, Math.floor(p)), f = ease(clamp01((p - k) / 0.4));
    tris.forEach((tr, i) => {
      const vis = i < k ? 1 : i === k ? f : 0;
      const topo = 10 + i * 34, meia = 96 - i * 26, fundo = 138;
      tr.p.setAttribute('d', `M120 ${topo} L${120 - meia} ${fundo} H${120 + meia} Z`);
      tr.p.style.opacity = i === 0 ? 1 : vis;
      tr.p.style.fillOpacity = 0.35 + i * 0.2;
      tr.e.setAttribute('x', 120); tr.e.setAttribute('y', topo + 14);
      tr.e.style.opacity = i === 0 ? 1 : vis;
    });
    base.textContent = palavras[k];
    lab.textContent = k === 0 ? 'k = 0: E gera x = d' : `k = ${k}: α = d+(  e  β = ) repetidos ${k} vez${k > 1 ? 'es' : ''}`;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

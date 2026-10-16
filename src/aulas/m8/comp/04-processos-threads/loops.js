import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, fatia, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula 04. Cada uma é montada num <aside data-loop="nome"> do conteúdo
   e redesenhada a partir de t ∈ [0,1). Não têm controles. */
const montar = {};

/* linha do tempo que vai sendo revelada por um cursor: segs = [faixa, x0, x1, classe, rótulo] */
function linhaDoTempo(svg, faixas, segs, x0, larg, total) {
  const esc = (u) => x0 + (u / total) * larg;
  faixas.forEach(([nome, y]) => {
    S('line', { class: 's', x1: x0, y1: y, x2: x0 + larg, y2: y, style: 'stroke-dasharray:2 3' }, svg);
    S('text', { class: 'tm st', x: 2, y }, svg, nome);
  });
  const R = segs.map(([y, a, b, cls, lab, trac]) => {
    const r = S('rect', { class: cls, x: esc(a), y: y - 10, width: 0, height: 20, rx: 3 }, svg);
    if (trac) r.setAttribute('stroke-dasharray', '3 2');
    const t = lab ? S('text', { class: 'tm', x: (esc(a) + esc(b)) / 2, y }, svg, lab) : null;
    return { r, t, a: esc(a), b: esc(b) };
  });
  const cur = S('line', { x1: x0, x2: x0, y1: faixas[0][1] - 18, y2: faixas[faixas.length - 1][1] + 14, style: 'stroke:var(--amber);stroke-width:1.5' }, svg);
  return (u) => { /* u ∈ [0,1]: fração revelada */
    const x = x0 + u * larg;
    R.forEach((s) => {
      const w = Math.max(0, Math.min(s.b, x) - s.a);
      s.r.setAttribute('width', w);
      s.r.style.opacity = w > 0 ? 1 : 0;
      if (s.t) s.t.style.opacity = x > (s.a + s.b) / 2 ? 1 : 0;
    });
    cur.setAttribute('x1', x); cur.setAttribute('x2', x);
  };
}

/* multiprogramação: A, B e C alternam CPU e E/S; a faixa da CPU fica sempre ocupada */
montar.multiprog = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 170');
  const Y = { A: 24, B: 54, C: 84, CPU: 128 };
  const segs = [
    [Y.A, 0, 30, 'bl', ''], [Y.A, 30, 80, 'k', 'E/S', 1], [Y.A, 90, 120, 'bl', ''], [Y.A, 120, 170, 'k', 'E/S', 1], [Y.A, 180, 200, 'bl', ''],
    [Y.B, 30, 60, 'am', ''], [Y.B, 60, 110, 'k', 'E/S', 1], [Y.B, 120, 150, 'am', ''], [Y.B, 150, 200, 'k', 'E/S', 1],
    [Y.C, 60, 90, 'gr', ''], [Y.C, 90, 140, 'k', 'E/S', 1], [Y.C, 150, 180, 'gr', ''], [Y.C, 180, 200, 'k', 'E/S', 1],
    [Y.CPU, 0, 30, 'bl', 'A'], [Y.CPU, 30, 60, 'am', 'B'], [Y.CPU, 60, 90, 'gr', 'C'], [Y.CPU, 90, 120, 'bl', 'A'],
    [Y.CPU, 120, 150, 'am', 'B'], [Y.CPU, 150, 180, 'gr', 'C'], [Y.CPU, 180, 200, 'bl', 'A'],
  ];
  const quadro = linhaDoTempo(svg, [['A', Y.A], ['B', Y.B], ['C', Y.C], ['CPU', Y.CPU]], segs, 30, 205, 200);
  S('line', { class: 's', x1: 0, y1: 104, x2: 240, y2: 104 }, svg);
  const nota = S('text', { class: 'tm', x: 132, y: 160 }, svg, '');
  return (t) => {
    const u = clamp01(t / 0.88);
    quadro(u);
    nota.textContent = u >= 1 ? 'CPU ocupada o tempo todo' : 'quem espera E/S cede a CPU';
  };
};

/* espaço de endereçamento: heap sobe a cada alocação, pilha de execução desce a cada chamada */
montar.enderecos = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 210');
  const x = 60, w = 100, topo = 8, base = 200;
  S('rect', { class: 'k', x, y: topo, width: w, height: base - topo, rx: 4 }, svg);
  S('rect', { class: 'gr', x, y: 172, width: w, height: 28, rx: 3 }, svg);
  S('text', { x: x + w / 2, y: 186 }, svg, 'código');
  S('rect', { class: 'bl', x, y: 150, width: w, height: 22, rx: 3 }, svg);
  S('text', { x: x + w / 2, y: 161 }, svg, 'dados');
  const heap = [0, 1, 2, 3].map((i) => S('rect', { class: 'am', x: x + 4, y: 150 - (i + 1) * 15, width: w - 8, height: 13, rx: 2 }, svg));
  const pilha = [0, 1, 2, 3, 4].map((i) => {
    const r = S('rect', { class: 'acf', x: x + 4, y: topo + 2 + i * 15, width: w - 8, height: 13, rx: 2 }, svg);
    const t = S('text', { class: 'tm', x: x + w / 2, y: topo + 8.5 + i * 15 }, svg, ['main', 'soma', 'ler', 'conv', 'aux'][i]);
    return { r, t };
  });
  S('text', { class: 'tm st', x: x + w + 6, y: 186 }, svg, 'só leitura');
  S('text', { class: 'tm st', x: x + w + 6, y: 161 }, svg, 'globais');
  const hl = S('text', { class: 'tam st', x: x + w + 6, y: 120 }, svg, 'heap ↑');
  const pl = S('text', { class: 'ta st', x: x + w + 6, y: 40 }, svg, 'pilha de');
  const pl2 = S('text', { class: 'ta st', x: x + w + 6, y: 53 }, svg, 'execução ↓');
  S('text', { class: 'tm', x: 30, y: base - 4 }, svg, '0x0');
  S('text', { class: 'tm', x: 30, y: topo + 6 }, svg, 'alto');
  const livre = S('text', { class: 'tm', x: x + w / 2, y: 100 }, svg, 'livre');
  const P = [1, 2, 3, 4, 5, 4, 3, 2, 3, 4, 3, 2, 1];
  const Hh = [1, 1, 2, 2, 3, 3, 4, 4, 4, 3, 3, 2, 1];
  return (t) => {
    const [k, p] = fatia(t, P.length);
    const k2 = (k + 1) % P.length, e = ease(clamp01((p - 0.6) / 0.4));
    const np = lerp(P[k], P[k2], e), nh = lerp(Hh[k], Hh[k2], e);
    pilha.forEach((f, i) => { const o = clamp01(np - i); f.r.style.opacity = o; f.t.style.opacity = o; });
    heap.forEach((r, i) => { r.style.opacity = clamp01(nh - i); });
    livre.style.opacity = 0.9;
    hl.setAttribute('y', 150 - nh * 15 + 4); pl.setAttribute('y', topo + np * 15 - 2); pl2.setAttribute('y', topo + np * 15 + 11);
  };
};

/* temporizador: a cada volta, interrupção e preempção; o processo vai para o fim da fila */
montar.relogio = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 170');
  const cx = 44, cy = 62, r = 30;
  S('circle', { class: 'k', cx, cy, r }, svg);
  S('circle', { cx, cy, r: 3, style: 'fill:var(--muted)' }, svg);
  const ponteiro = S('line', { x1: cx, y1: cy, x2: cx, y2: cy - r + 6, style: 'stroke:var(--fg);stroke-width:2;stroke-linecap:round' }, svg);
  S('text', { class: 'tm', x: cx, y: cy + r + 12 }, svg, 'temporizador');
  const raio = S('text', { class: 'tam', x: cx, y: 14 }, svg, 'interrupção!');
  S('rect', { class: 'k', x: 120, y: 24, width: 110, height: 52, rx: 8 }, svg);
  S('text', { class: 'tm', x: 175, y: 34 }, svg, 'CPU');
  S('text', { class: 'tm st', x: 104, y: 112 }, svg, 'prontos:');
  const SLOT = { cpu: [175, 56], f0: [126, 140], f1: [168, 140], f2: [210, 140] };
  const cores = ['bl', 'am', 'gr'];
  const procs = ['A', 'B', 'C'].map((n, i) => {
    const g = S('g', null, svg);
    S('rect', { class: cores[i], x: -16, y: -12, width: 32, height: 24, rx: 5 }, g);
    S('text', { x: 0, y: 0 }, g, n);
    return g;
  });
  const pos = (g, [x, y]) => g.setAttribute('transform', `translate(${x},${y})`);
  return (t) => {
    const [k, p] = fatia(t, 3);
    ponteiro.setAttribute('transform', `rotate(${p * 360} ${cx} ${cy})`);
    const e = ease(clamp01((p - 0.86) / 0.14));
    raio.style.opacity = p > 0.84 ? 1 : 0;
    const ordem = [k, (k + 1) % 3, (k + 2) % 3]; /* cpu, fila 0, fila 1 */
    const lerpP = (a, b) => [lerp(a[0], b[0], e), lerp(a[1], b[1], e)];
    pos(procs[ordem[0]], lerpP(SLOT.cpu, SLOT.f1));
    pos(procs[ordem[1]], lerpP(SLOT.f0, SLOT.cpu));
    pos(procs[ordem[2]], lerpP(SLOT.f1, SLOT.f0));
  };
};

/* CPU-bound × I/O-bound: rajadas longas de CPU × rajadas curtas e muita espera */
montar.cpuio = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 130');
  const Y1 = 26, Y2 = 84;
  S('text', { class: 'tm st', x: 2, y: Y1 - 18 }, svg, 'CPU-bound');
  S('text', { class: 'tm st', x: 2, y: Y2 - 18 }, svg, 'I/O-bound');
  const segs = [
    [Y1, 0, 80, 'bl', 'CPU'], [Y1, 80, 96, 'k', '', 1], [Y1, 96, 182, 'bl', 'CPU'], [Y1, 182, 200, 'k', '', 1],
    [Y2, 0, 10, 'bl', ''], [Y2, 10, 58, 'k', 'E/S', 1], [Y2, 58, 68, 'bl', ''], [Y2, 68, 118, 'k', 'E/S', 1],
    [Y2, 118, 128, 'bl', ''], [Y2, 128, 176, 'k', 'E/S', 1], [Y2, 176, 186, 'bl', ''], [Y2, 186, 200, 'k', '', 1],
  ];
  const quadro = linhaDoTempo(svg, [['', Y1], ['', Y2]], segs, 10, 225, 200);
  const nota = S('text', { class: 'tm', x: 120, y: 120 }, svg, '');
  return (t) => {
    const u = clamp01(t / 0.88);
    quadro(u);
    nota.textContent = u >= 1 ? 'azul = usando a CPU · tracejado = E/S' : '';
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

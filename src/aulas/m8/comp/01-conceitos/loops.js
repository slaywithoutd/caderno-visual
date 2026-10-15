import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, fatia, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula 01. Cada uma é montada num <aside data-loop="nome"> do conteúdo
   e redesenhada a partir de t ∈ [0,1). Diferente das figuras passo a passo, não têm controles. */
const montar = {};

/* AFD só lembra o estado: lê a, a, a… e gira em q0 → q1 → q2 sem saber quantos leu */
montar.memoria = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 200');
  const N = 9;
  const cells = [...Array(N)].map((_, i) => {
    const g = S('g', null, svg);
    S('rect', { class: 'k', x: 12 + i * 24, y: 6, width: 20, height: 22, rx: 4 }, g);
    S('text', { x: 22 + i * 24, y: 17 }, g, 'a');
    return g;
  });
  const cont = S('text', { x: 120, y: 46, class: 'tm' }, svg, '');
  const P = [[60, 100], [180, 100], [120, 170]];
  [[0, 1], [1, 2], [2, 0]].forEach(([a, b]) => {
    const [x1, y1] = P[a], [x2, y2] = P[b], d = Math.hypot(x2 - x1, y2 - y1);
    S('line', { class: 's', x1: x1 + (x2 - x1) / d * 21, y1: y1 + (y2 - y1) / d * 21, x2: x2 - (x2 - x1) / d * 23, y2: y2 - (y2 - y1) / d * 23, 'marker-end': 'url(#mnarrow)' }, svg);
  });
  const st = P.map(([x, y], i) => { const c = S('circle', { class: 'k', cx: x, cy: y, r: 19 }, svg); S('text', { x, y }, svg, 'q' + i); return c; });
  const tok = S('circle', { r: 5, style: 'fill:var(--amber)' }, svg);
  return (t) => {
    const [k, p] = fatia(t, N + 1);
    const lidos = Math.min(N, k + (p > 0.5 ? 1 : 0));
    cells.forEach((g, i) => { g.style.opacity = i < lidos ? 0.35 : 1; g.firstChild.setAttribute('class', i === k && k < N ? 'am' : 'k'); });
    const de = k % 3, para = (k + 1) % 3, q = k < N ? ease(clamp01((p - 0.25) / 0.6)) : 0;
    const [x1, y1] = P[de], [x2, y2] = P[k < N ? para : de];
    tok.setAttribute('cx', lerp(x1, x2, q)); tok.setAttribute('cy', lerp(y1, y2, q));
    const atual = q > 0.5 ? para : de;
    st.forEach((c, i) => c.setAttribute('class', i === (k < N ? atual : de) ? 'am' : 'k'));
    cont.textContent = `leu ${lidos} a · lembra só: q${k < N ? atual : de}`;
  };
};

/* bombeamento: o corredor passa por x, dá i voltas no laço y e sai por z, sempre chegando em L */
montar.bombeia = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 140');
  const cx = 112, cy = 62, r = 26, base = cy + r;
  S('path', { class: 'bl', style: 'fill:none;stroke-width:3', d: `M12 ${base} H${cx}` }, svg);
  S('circle', { class: 'am', style: 'fill:none;stroke-width:3', cx, cy, r }, svg);
  S('path', { class: 'gr', style: 'fill:none;stroke-width:3', d: `M${cx} ${base} H214` }, svg);
  S('text', { class: 'tb', x: 60, y: base + 16 }, svg, 'x');
  S('text', { class: 'tam', x: cx, y: cy }, svg, 'y');
  S('text', { x: 170, y: base + 16, style: 'fill:var(--green);font-weight:600' }, svg, 'z');
  const flag = S('text', { x: 226, y: base, style: 'fill:var(--green);font-weight:700' }, svg, '✓');
  const tok = S('circle', { r: 6, style: 'fill:var(--fg)' }, svg);
  const lab = S('text', { x: 120, y: 12 }, svg, '');
  const lab2 = S('text', { class: 'tm', x: 120, y: 132 }, svg, '');
  const X = cx - 12, Z = 214 - cx, C = 2 * Math.PI * r;
  const fases = [0, 1, 2, 3].map((i) => X + i * C + Z);
  const pausa = 120, total = fases.reduce((a, b) => a + b + pausa, 0);
  return (t) => {
    let d = t * total, i = 0;
    while (d > fases[i] + pausa) { d -= fases[i] + pausa; i++; }
    let x, y;
    if (d <= X) { x = 12 + d; y = base; }
    else if (d <= X + i * C) { const a = ((d - X) / C) * 2 * Math.PI; x = cx + r * Math.sin(-a); y = cy + r * Math.cos(a); }
    else { x = Math.min(214, cx + (d - X - i * C)); y = base; }
    tok.setAttribute('cx', x); tok.setAttribute('cy', y);
    const chegou = d >= fases[i];
    flag.style.opacity = chegou ? 1 : 0.25;
    lab.textContent = `i = ${i}:  x ${'y '.repeat(i)}z`;
    lab2.textContent = chegou ? 'continua em L ✓' : i === 0 ? 'pula o laço' : `volta ${Math.min(i, Math.max(1, Math.ceil((d - X) / C)))} de ${i}`;
  };
};

/* pilha: lê aaabbb; cada a empilha um prato, cada b tira um */
montar.pilha = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 190');
  const w = 'aaabbb', n = w.length, x0 = 42;
  const cells = [...w].map((c, i) => { S('rect', { class: 'k', x: x0 + i * 26, y: 4, width: 24, height: 24, rx: 4 }, svg); return S('text', { x: x0 + 12 + i * 26, y: 16 }, svg, c); });
  const head = S('path', { d: 'M0 0 l-5 8 h10 z', style: 'fill:var(--amber)' }, svg);
  S('path', { class: 's', d: 'M82 70 V178 H158 V70' }, svg);
  S('rect', { class: 'k', x: 88, y: 154, width: 64, height: 18, rx: 4 }, svg);
  S('text', { class: 'tm', x: 120, y: 163 }, svg, '$');
  const pratos = [0, 1, 2].map(() => { const g = S('g', null, svg); S('rect', { class: 'bl', x: 88, y: 0, width: 64, height: 18, rx: 4 }, g); S('text', { x: 120, y: 9 }, g, 'A'); return g; });
  const acao = S('text', { x: 200, y: 110, class: 'tam' }, svg, '');
  const fim = S('text', { x: 120, y: 54, class: 'tm' }, svg, '');
  const yTopo = (k) => 154 - (k + 1) * 21;
  return (t) => {
    const [k, p] = fatia(t, n + 2);
    const lendo = Math.min(k, n);
    cells.forEach((c, i) => { c.parentNode && (c.style.opacity = i < lendo || (i === k && p > 0.6) ? 0.35 : 1); });
    const hx = x0 + 12 + Math.min(lendo, n - 1) * 26 + (k < n ? 0 : 26);
    head.setAttribute('transform', `translate(${hx},32)`);
    head.style.opacity = k < n ? 1 : 0;
    const e = ease(clamp01(p / 0.7));
    pratos.forEach((g, j) => {
      let vis = 0, y = yTopo(j);
      if (k < 3) { if (j < k) vis = 1; else if (j === k) { vis = e; y = lerp(60, yTopo(j), e); } }
      else if (k < n) { const tirados = k - 3; const altura = 2 - tirados; if (j < altura) vis = 1; else if (j === altura) { vis = 1 - e; y = lerp(yTopo(j), 50, e); } }
      g.setAttribute('transform', `translate(0,${y})`); g.style.opacity = vis;
    });
    acao.textContent = k < 3 ? 'push A' : k < n ? 'pop A' : '';
    fim.textContent = k >= n ? 'sobrou só o $ → aceita' : '';
  };
};

/* não determinismo: o AP chuta o meio de "abba" em todo lugar; só um ramo acerta */
montar.ramos = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 200');
  const w = 'abba', x0 = 70;
  [...w].forEach((c, i) => { S('rect', { class: 'k', x: x0 + i * 26, y: 4, width: 24, height: 24, rx: 4 }, svg); S('text', { x: x0 + 12 + i * 26, y: 16 }, svg, c); });
  const corte = S('line', { class: 'ac', x1: 0, y1: 0, x2: 0, y2: 34, 'stroke-dasharray': '3 3' }, svg);
  const raiz = [24, 120];
  S('circle', { class: 'k', cx: raiz[0], cy: raiz[1], r: 9 }, svg);
  const ramos = [0, 1, 2, 3, 4].map((k) => {
    const y = 52 + k * 34, ok = k === 2;
    const g = S('g', null, svg);
    const ln = S('path', { class: 's', d: `M${raiz[0] + 9} ${raiz[1]} C 90 ${raiz[1]}, 110 ${y}, 170 ${y}` }, g);
    const len = ln.getTotalLength ? ln.getTotalLength() : 160;
    ln.style.strokeDasharray = len; ln.dataset.len = len;
    S('text', { class: 'tm', x: 140, y: y - 9 }, g, `meio em ${k}`);
    const fim = S('text', { x: 186, y, style: `font-weight:700;fill:var(--${ok ? 'green' : 'red'})` }, g, ok ? '✓' : '✗');
    return { g, ln, len, fim, ok };
  });
  const nota = S('text', { class: 'tm', x: 120, y: 196 }, svg, '');
  return (t) => {
    const [k, p] = fatia(t, 6);
    const kk = Math.min(k, 4);
    corte.setAttribute('transform', `translate(${x0 - 1 + kk * 26},0)`);
    corte.style.opacity = k < 5 ? 1 : 0;
    ramos.forEach((r, i) => {
      const prog = i < k ? 1 : i === k ? ease(clamp01(p / 0.7)) : 0;
      r.ln.style.strokeDashoffset = r.len * (1 - prog);
      r.ln.setAttribute('class', prog >= 1 ? (r.ok ? 'ac' : 's') : 's');
      r.fim.style.opacity = prog >= 1 ? 1 : 0;
      r.g.style.opacity = i <= k ? (prog >= 1 && !r.ok && k >= 5 ? 0.4 : 1) : 0.15;
    });
    nota.textContent = k >= 5 ? 'basta um ramo aceitar' : `chuta: meio na posição ${kk}`;
  };
};

/* AFD que aceita palavras terminadas em a: lê "baba" letra por letra */
montar.afd = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 200');
  const w = 'baba', x0 = 72;
  const cells = [...w].map((c, i) => { const g = S('g', null, svg); S('rect', { class: 'k', x: x0 + i * 26, y: 4, width: 24, height: 24, rx: 4 }, g); S('text', { x: x0 + 12 + i * 26, y: 16 }, g, c); return g; });
  const P = { q0: [64, 112], q1: [176, 112] };
  S('path', { class: 's', d: 'M14 112 H40', 'marker-end': 'url(#mnarrow)' }, svg);
  S('path', { class: 's', d: 'M84 102 Q120 78 154 102', 'marker-end': 'url(#mnarrow)' }, svg);
  S('text', { class: 'tm', x: 120, y: 80 }, svg, 'a');
  S('path', { class: 's', d: 'M156 124 Q120 148 86 124', 'marker-end': 'url(#mnarrow)' }, svg);
  S('text', { class: 'tm', x: 120, y: 150 }, svg, 'b');
  S('path', { class: 's', d: 'M54 92 C40 58 88 58 74 92', 'marker-end': 'url(#mnarrow)' }, svg);
  S('text', { class: 'tm', x: 64, y: 58 }, svg, 'b');
  S('path', { class: 's', d: 'M166 92 C152 58 200 58 186 92', 'marker-end': 'url(#mnarrow)' }, svg);
  S('text', { class: 'tm', x: 176, y: 58 }, svg, 'a');
  const est = {};
  for (const [q, [x, y]] of Object.entries(P)) {
    est[q] = S('circle', { class: 'k', cx: x, cy: y, r: 20 }, svg);
    if (q === 'q1') S('circle', { class: 's', cx: x, cy: y, r: 15 }, svg);
    S('text', { x, y }, svg, q);
  }
  const head = S('path', { d: 'M0 0 l-5 8 h10 z', style: 'fill:var(--amber)' }, svg);
  const nota = S('text', { class: 'tm', x: 120, y: 186 }, svg, '');
  const caminho = ['q0', 'q0', 'q1', 'q0', 'q1'];
  return (t) => {
    const [k, p] = fatia(t, w.length + 2);
    const lidas = Math.min(k, w.length);
    cells.forEach((g, i) => { g.style.opacity = i < lidas ? 0.35 : 1; g.firstChild.setAttribute('class', i === k && k < w.length ? 'am' : 'k'); });
    head.setAttribute('transform', `translate(${x0 + 12 + Math.min(k, w.length - 1) * 26},32)`);
    head.style.opacity = k < w.length ? 1 : 0;
    const atual = caminho[k < w.length && p > 0.5 ? k + 1 : lidas];
    Object.entries(est).forEach(([q, c]) => c.setAttribute('class', q === atual ? (k >= w.length ? 'gr' : 'am') : 'k'));
    nota.textContent = k >= w.length ? 'terminou em q1 (final): aceita' : `lendo "${w[k]}" em ${caminho[k]}`;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

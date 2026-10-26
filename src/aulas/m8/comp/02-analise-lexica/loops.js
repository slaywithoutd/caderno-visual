import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, fatia, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula 02. Cada uma é montada num <aside data-loop="nome"> do conteúdo
   e redesenhada a partir de t ∈ [0,1). */
const montar = {};

/* passada: a fita anda do carretel da esquerda para o da direita sob a cabeça; depois rebobina */
montar.vhs = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 130');
  const reels = [[50, 52], [190, 52]].map(([x, y]) => {
    S('circle', { class: 'k', cx: x, cy: y, r: 30 }, svg);
    const g = S('g', null, svg);
    [0, 120, 240].forEach((a) => S('line', { class: 's', x1: x, y1: y, x2: x + 26 * Math.cos(a * Math.PI / 180), y2: y + 26 * Math.sin(a * Math.PI / 180) }, g));
    S('circle', { class: 'am', cx: x, cy: y, r: 6 }, svg);
    return { g, x, y };
  });
  S('line', { class: 's', x1: 50, y1: 82, x2: 190, y2: 82 }, svg);
  S('rect', { class: 'bl', x: 108, y: 84, width: 24, height: 12, rx: 3 }, svg);
  const prog = 'LER x  SE x > 1 ENTAO …';
  const txt = S('text', { x: 120, y: 112, class: 'tm' }, svg, '');
  const lab = S('text', { x: 120, y: 8, class: 'tam' }, svg, '');
  return (t) => {
    const play = t < 0.72, p = play ? t / 0.72 : 1 - (t - 0.72) / 0.28;
    reels.forEach((r) => r.g.setAttribute('transform', `rotate(${p * 720} ${r.x} ${r.y})`));
    const n = Math.round(p * prog.length);
    txt.textContent = 'lido: ' + prog.slice(0, n);
    lab.textContent = play ? 'passada: do começo ao fim' : 'rebobinando…';
  };
};

/* esteira: lexemas entram na caixa do léxico; saem tokens, espaço e comentário caem fora */
montar.esteira = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 190');
  const itens = [['SE', '<SE>'], ['␣', null], ['x', '<Var,x>'], ['<', '<OpRel,<>'], ['10', '<NumInt,10>'], ['␣', null], ['%obs', null]];
  S('rect', { class: 'bl', x: 92, y: 20, width: 56, height: 46, rx: 8 }, svg);
  S('text', { x: 120, y: 43, class: 'tb' }, svg, 'léxico');
  S('line', { class: 's', x1: 4, y1: 72, x2: 90, y2: 72 }, svg);
  S('text', { x: 46, y: 84, class: 'tm' }, svg, 'caracteres');
  S('text', { x: 196, y: 12, class: 'tm' }, svg, 'tokens');
  S('rect', { class: 'k', x: 98, y: 156, width: 44, height: 26, rx: 4, 'stroke-dasharray': '3 3' }, svg);
  S('text', { x: 120, y: 169, class: 'tm' }, svg, 'ignora');
  const lex = S('text', { x: 0, y: 60, style: 'font-weight:600' }, svg, '');
  const outs = itens.filter((i) => i[1]).map((i) => { const g = S('g', null, svg); S('rect', { class: 'k', x: 158, y: 0, width: 78, height: 20, rx: 4 }, g); S('text', { x: 197, y: 10, class: 'tm' }, g, i[1]); return g; });
  return (t) => {
    const [k, p] = fatia(t, itens.length + 1);
    let saidos = 0;
    for (let j = 0; j < Math.min(k, itens.length); j++) if (itens[j][1]) saidos++;
    if (k < itens.length) {
      const [l, tk] = itens[k];
      lex.textContent = l;
      const e = ease(clamp01(p / 0.5));
      if (p < 0.5) { lex.setAttribute('x', lerp(14, 120, e)); lex.setAttribute('y', 60); lex.style.opacity = 1; }
      else if (!tk) { const f = ease(clamp01((p - 0.5) / 0.4)); lex.setAttribute('x', 120); lex.setAttribute('y', lerp(60, 168, f)); lex.style.opacity = 1 - f * 0.6; }
      else lex.style.opacity = 0;
      const atual = tk ? saidos : -1;
      outs.forEach((g, j) => {
        let vis = j < saidos ? 1 : 0, y = 24 + j * 26;
        if (j === atual && p >= 0.5) { const f = ease(clamp01((p - 0.5) / 0.4)); vis = f; g.setAttribute('transform', `translate(${lerp(-60, 0, f)},${y})`); }
        else g.setAttribute('transform', `translate(0,${y})`);
        g.style.opacity = vis;
      });
    } else {
      lex.style.opacity = 0;
      outs.forEach((g, j) => { g.setAttribute('transform', `translate(0,${24 + j * 26})`); g.style.opacity = 1 - ease(clamp01((p - 0.6) / 0.4)); });
    }
  };
};

/* buffer duplo: o ponteiro dá duas voltas; cada metade é recarregada quando ele entra nela */
montar.buffer = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 120');
  const chunks = ['ENQUA', 'NTO x', '>1 IN', 'ICIO '];
  const X = (i) => 8 + i * 22 + (i >= 5 ? 10 : 0);
  const halves = [0, 1].map((h) => { const r = S('rect', { class: 'k', x: X(h * 5) - 3, y: 34, width: 5 * 22 + 4, height: 30, rx: 5 }, svg); const tx = S('text', { x: X(h * 5) + 53, y: 22, class: 'tm' }, svg, `metade ${h + 1}`); return { r, tx }; });
  const cells = [...Array(10)].map((_, i) => S('text', { x: X(i) + 10, y: 49 }, svg, ''));
  const tri = S('path', { d: 'M0 0 l-5 8 h10 z', style: 'fill:var(--amber)' }, svg);
  const lab = S('text', { x: 120, y: 98, class: 'tam' }, svg, '');
  const lab2 = S('text', { x: 120, y: 114, class: 'tm' }, svg, '');
  return (t) => {
    const p = t * 20, i = Math.floor(p), idx = i % 10, fase = Math.floor(i / 5);
    /* fase 0: metade 1 = c0, metade 2 = c3 (velha); 1: c0 / c1; 2: c2 / c1; 3: c2 / c3 */
    const h1 = fase < 2 ? 0 : 2, h2 = fase === 0 ? 3 : fase < 3 ? 1 : 3;
    cells.forEach((c, j) => { const ch = (j < 5 ? chunks[h1] : chunks[h2])[j % 5]; c.textContent = ch === ' ' ? '␣' : ch; c.style.opacity = j < 5 ? 1 : (fase === 0 ? 0.35 : 1); });
    const novo = (i % 5 === 0) && (p - i) < 0.6 ? (idx === 0 ? 0 : 1) : -1;
    halves.forEach((h, j) => h.r.setAttribute('class', novo === j ? 'am' : 'k'));
    tri.setAttribute('transform', `translate(${X(idx) + 10},68)`);
    lab.textContent = novo >= 0 ? `recarrega a metade ${novo + 1}` : '';
    lab2.textContent = `ponteiro = ${idx}${idx === 0 && i > 0 ? ' (deu a volta)' : ''}`;
  };
};

/* maior casamento: as duas regras crescem sobre a entrada; vence a mais longa, ou a primeira no empate */
montar.guloso = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  const W = 17;
  const cells = [...Array(13)].map((_, i) => S('text', { x: 10 + i * W, y: 26, style: 'font-size:12px' }, svg, ''));
  const bars = [['PALAVRA_CHAVE', 'am', 50], ['VARIAVEL', 'bl', 84]].map(([n, cls, y]) => {
    const r = S('rect', { class: cls, x: 2, y, width: 0, height: 18, rx: 4 }, svg);
    S('text', { x: 4, y: y - 8, class: 'tm st' }, svg, n);
    const c = S('text', { x: 0, y: y + 9, class: 'tm st' }, svg, '');
    return { r, c };
  });
  const veredito = S('text', { x: 120, y: 132, class: 'ta' }, svg, '');
  const casos = [{ w: 'ALGORITMObla', pc: 9, v: 12, msg: 'VARIAVEL vence: 12 > 9' }, { w: 'ALGORITMO bla', pc: 9, v: 9, msg: 'empate em 9: vence a 1ª regra' }];
  return (t) => {
    const fase = t < 0.5 ? 0 : 1, p = (t % 0.5) / 0.5, C = casos[fase];
    cells.forEach((c, i) => { const ch = C.w[i] || ''; c.textContent = ch === ' ' ? '␣' : ch; });
    const g = ease(clamp01(p / 0.6));
    [[C.pc, 0], [C.v, 1]].forEach(([n, j]) => { const len = n * g; bars[j].r.setAttribute('width', len * W); bars[j].c.setAttribute('x', len * W + 6); bars[j].c.textContent = p > 0.6 ? String(n) : ''; });
    veredito.textContent = p > 0.68 ? C.msg : '';
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

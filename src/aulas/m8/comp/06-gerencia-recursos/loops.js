import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, fatia, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula 06. Cada uma é montada num <aside data-loop="nome"> do conteúdo
   e redesenhada a partir de t ∈ [0,1). O quadro depende só de t, então o fim emenda no começo. */
const montar = {};

/* efeito comboio: um cpu-bound longo ocupa a CPU e os io-bound curtos esperam atrás */
montar.comboio = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  S('line', { class: 's', x1: 4, y1: 92, x2: 236, y2: 92 }, svg);
  S('line', { class: 's', x1: 4, y1: 58, x2: 236, y2: 58 }, svg);
  const gate = S('rect', { class: 'acf', x: 160, y: 50, width: 44, height: 50, rx: 6, style: 'fill:none' }, svg);
  S('text', { class: 'ta', x: 182, y: 40 }, svg, 'CPU');
  const barra = S('rect', { x: 160, y: 104, width: 0, height: 5, rx: 2, style: 'fill:var(--blue)' }, svg);
  const cam = S('g', null, svg);
  S('rect', { class: 'bl', x: 0, y: 64, width: 62, height: 22, rx: 4 }, cam);
  S('text', { x: 31, y: 75, style: 'font-size:10px' }, cam, 'cpu-bound');
  const carros = [0, 1, 2].map(() => { const g = S('g', null, svg); S('rect', { class: 'am', x: 0, y: 66, width: 18, height: 18, rx: 4 }, g); return g; });
  const msg = S('text', { class: 'tm', x: 120, y: 130 }, svg, '');
  const msg2 = S('text', { class: 'tam', x: 120, y: 144 }, svg, '');
  return (t) => {
    /* caminhão: entra (0–0.1), roda (0.1–0.55), sai (0.55–0.62) */
    let cx, op = 1;
    if (t < 0.1) { cx = lerp(4, 151, ease(t / 0.1)); op = clamp01(t / 0.04); }
    else if (t < 0.55) cx = 151;
    else { const p = clamp01((t - 0.55) / 0.07); cx = lerp(151, 200, ease(p)); op = 1 - p; }
    cam.setAttribute('transform', `translate(${cx},0)`);
    cam.style.opacity = op;
    barra.setAttribute('width', t >= 0.1 && t < 0.55 ? 44 * clamp01((t - 0.1) / 0.45) : 0);
    /* carros: chegam e esperam na fila; depois passam pela CPU rápido, um por vez */
    let esperando = 0;
    carros.forEach((g, i) => {
      const chega = 0.12 + i * 0.05, fila = 130 - i * 24, vez = 0.58 + i * 0.1;
      let x = fila, o = 1;
      if (t < chega) { x = 4; o = 0; }
      else if (t < chega + 0.06) { const p = (t - chega) / 0.06; x = lerp(4, fila, ease(p)); o = p; }
      else if (t < vez) esperando++;
      else {
        const p = clamp01((t - vez) / 0.1);
        if (p < 0.3) x = lerp(fila, 173, ease(p / 0.3));
        else if (p < 0.75) x = 173;
        else { x = lerp(173, 215, ease((p - 0.75) / 0.25)); o = 1 - (p - 0.75) / 0.25; }
      }
      g.setAttribute('transform', `translate(${x},0)`);
      g.style.opacity = o;
    });
    gate.setAttribute('class', t >= 0.1 && t < 0.55 ? 'bl' : 'acf');
    gate.style.fill = 'none';
    msg.textContent = t < 0.55 ? 'surto longo na CPU' : t < 0.92 ? 'os curtos passam em instantes' : '';
    msg2.textContent = esperando ? `io-bound esperando: ${esperando}` : '';
  };
};

/* múltiplas filas com realimentação: o cpu-bound desce, o io-bound fica em cima */
montar.mlfq = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 190');
  const Y = [30, 82, 134];
  const rot = ['q = 8', 'q = 16', 'FCFS'];
  Y.forEach((y, i) => {
    S('rect', { class: 'k', x: 40, y: y - 15, width: 140, height: 30, rx: 6 }, svg);
    S('text', { class: 'tm st', x: 2, y }, svg, `fila ${i}`);
    S('text', { class: 'tm', x: 156, y }, svg, rot[i]);
  });
  S('rect', { class: 'gr', x: 196, y: 15, width: 40, height: 30, rx: 6 }, svg);
  S('text', { class: 'tm', x: 216, y: 30 }, svg, 'E/S');
  const az = S('circle', { r: 9, style: 'fill:var(--blue-soft);stroke:var(--blue);stroke-width:2' }, svg);
  const am = S('circle', { r: 9, style: 'fill:var(--amber-soft);stroke:var(--amber);stroke-width:2' }, svg);
  const arcoAz = S('path', { style: 'fill:none;stroke:var(--blue);stroke-width:3' }, svg);
  const msg = S('text', { class: 'tm', x: 120, y: 172 }, svg, '');
  const arco = (cx, cy, p) => { if (p <= 0) return ''; const a = Math.min(p, 0.999) * 2 * Math.PI, r = 14; return `M${cx} ${cy - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${cx + r * Math.sin(a)} ${cy - r * Math.cos(a)}`; };
  return (t) => {
    /* azul: roda o quantum inteiro (arco enche) e desce; no fim, aging o leva de volta ao topo */
    const fases = [[0, 0.22, 0], [0.22, 0.27, 'd01'], [0.27, 0.52, 1], [0.52, 0.57, 'd12'], [0.57, 0.86, 2], [0.86, 1, 'up']];
    let ax = 80, ay = Y[0], p = 0, txt = '';
    for (const [a, b, f] of fases) {
      if (t < a || t >= b) continue;
      const u = (t - a) / (b - a);
      if (typeof f === 'number') { ay = Y[f]; p = u; txt = f < 2 ? 'azul gasta o quantum inteiro…' : 'lá embaixo: fatias maiores'; }
      else if (f === 'd01') { ay = lerp(Y[0], Y[1], ease(u)); txt = '…e desce uma fila'; }
      else if (f === 'd12') { ay = lerp(Y[1], Y[2], ease(u)); txt = '…e desce de novo'; }
      else { ay = lerp(Y[2], Y[0], ease(u)); txt = 'aging: esperou demais, sobe'; }
    }
    az.setAttribute('cx', ax); az.setAttribute('cy', ay);
    arcoAz.setAttribute('d', arco(ax, ay, p));
    /* âmbar: surto curto na fila 0, vai para a E/S, volta; três vezes por ciclo */
    const [, u] = fatia(t, 3);
    let mx, my = Y[0];
    if (u < 0.25) mx = 120;
    else if (u < 0.45) { mx = lerp(120, 216, ease((u - 0.25) / 0.2)); }
    else if (u < 0.8) mx = 216;
    else mx = lerp(216, 120, ease((u - 0.8) / 0.2));
    am.setAttribute('cx', mx); am.setAttribute('cy', my);
    msg.textContent = txt || 'âmbar bloqueia antes: fica em cima';
  };
};

/* thrashing: utilização da CPU contra o número de processos na memória */
montar.thrashing = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 190');
  const x0 = 30, y0 = 150, W = 196, Hh = 120;
  S('line', { class: 's', x1: x0, y1: y0, x2: x0 + W, y2: y0, 'marker-end': 'url(#mnarrow)' }, svg);
  S('line', { class: 's', x1: x0, y1: y0, x2: x0, y2: y0 - Hh - 8, 'marker-end': 'url(#mnarrow)' }, svg);
  S('text', { class: 'tm', x: 128, y: 166 }, svg, 'nº de processos na memória');
  S('text', { class: 'tm st', x: 2, y: 14 }, svg, 'utilização da CPU');
  const f = (u) => (u < 0.62 ? 0.95 * (1 - Math.pow(1 - u / 0.62, 2)) : 0.95 * Math.exp(-Math.pow((u - 0.62) / 0.17, 2) * 1.6) + 0.04);
  let d = '';
  for (let i = 0; i <= 60; i++) { const u = i / 60; d += `${i ? 'L' : 'M'}${x0 + u * W} ${y0 - f(u) * Hh}`; }
  const curva = S('path', { class: 'ac', d }, svg);
  const zona = S('rect', { x: x0 + 0.68 * W, y: y0 - Hh, width: 0.32 * W, height: Hh, style: 'fill:var(--red-soft);stroke:none' }, svg);
  svg.insertBefore(zona, curva);
  const tz = S('text', { x: x0 + 0.84 * W, y: y0 - Hh + 14, style: 'fill:var(--red);font-weight:600;font-size:11px' }, svg, 'thrashing');
  const pt = S('circle', { r: 5, style: 'fill:var(--amber)' }, svg);
  const lab = S('text', { class: 'tm', x: 128, y: 184 }, svg, '');
  return (t) => {
    /* 0–0.85: o SO vai colocando processos; 0.85–1: suspende vários e volta ao começo */
    const u = t < 0.85 ? t / 0.85 : lerp(1, 0, ease((t - 0.85) / 0.15));
    pt.setAttribute('cx', x0 + u * W); pt.setAttribute('cy', y0 - f(u) * Hh);
    const dentro = u > 0.68;
    zona.style.opacity = dentro ? 1 : 0.25; tz.style.opacity = dentro ? 1 : 0.3;
    const n = Math.max(1, Math.round(1 + u * 11));
    lab.textContent = t >= 0.85 ? 'SO suspende processos' : dentro ? `${n} processos: molduras de menos, só paginando` : `${n} processos: CPU cada vez mais ocupada`;
  };
};

/* alocação encadeada x indexada num disco de 32 blocos */
montar.arquivos = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 190');
  const C = 8, bw = 26, bh = 22, gx = 8, gy = 28;
  const pos = (b) => [gx + (b % C) * (bw + 2) + bw / 2, gy + Math.floor(b / C) * (bh + 4) + bh / 2];
  const OUT = [5, 9, 12, 16, 22, 27, 30];
  const blocos = [];
  for (let b = 0; b < 32; b++) {
    const [x, y] = pos(b);
    const r = S('rect', { class: 'k', x: x - bw / 2, y: y - bh / 2, width: bw, height: bh, rx: 3, style: OUT.includes(b) ? 'fill:var(--surface2)' : '' }, svg);
    blocos.push(r);
  }
  const ARQ = [3, 10, 6, 17, 25], IDX = 0;
  const num = ARQ.map((b, i) => { const [x, y] = pos(b); return S('text', { x, y, style: 'font-size:11px' }, svg, ''); });
  const tIdx = S('text', { x: pos(IDX)[0], y: pos(IDX)[1], style: 'font-size:10px' }, svg, '');
  const gSetas = S('g', null, svg);
  const titulo = S('text', { class: 'ta', x: 120, y: 12 }, svg, '');
  const msg = S('text', { class: 'tm', x: 120, y: 148 }, svg, '');
  const msg2 = S('text', { class: 'tm', x: 120, y: 166 }, svg, '');
  const seta = (a, b, op) => { const [x1, y1] = pos(a), [x2, y2] = pos(b); const d = Math.hypot(x2 - x1, y2 - y1); S('line', { class: 'ac', x1: x1 + (x2 - x1) / d * 10, y1: y1 + (y2 - y1) / d * 8, x2: x2 - (x2 - x1) / d * 12, y2: y2 - (y2 - y1) / d * 10, 'marker-end': 'url(#mnarrow)', style: `opacity:${op}` }, gSetas); };
  return (t) => {
    gSetas.innerHTML = '';
    const enc = t < 0.5, u = enc ? t / 0.5 : (t - 0.5) / 0.5;
    titulo.textContent = enc ? 'encadeada' : 'indexada (i-node)';
    blocos.forEach((r, b) => {
      const doArq = ARQ.includes(b), eIdx = !enc && b === IDX;
      r.setAttribute('class', eIdx ? 'acf' : doArq ? 'am' : 'k');
    });
    tIdx.textContent = enc ? '' : 'idx';
    if (enc) {
      /* percorre a corrente: um bloco por vez */
      const k = Math.min(ARQ.length - 1, Math.floor(u * (ARQ.length + 1)));
      ARQ.forEach((b, i) => { num[i].textContent = i <= k ? i + 1 : ''; blocos[b].style.strokeWidth = i === k ? 3 : ''; });
      for (let i = 0; i < k; i++) seta(ARQ[i], ARQ[i + 1], 1);
      msg.textContent = `leituras para chegar ao bloco ${k + 1}: ${k + 1}`;
      msg2.textContent = 'cada bloco guarda onde está o próximo';
    } else {
      const op = clamp01(u / 0.3);
      ARQ.forEach((b, i) => { num[i].textContent = i + 1; blocos[b].style.strokeWidth = u > 0.5 && i === 4 ? 3 : ''; });
      ARQ.forEach((b) => seta(IDX, b, op));
      msg.textContent = u > 0.5 ? 'bloco 5: lê o índice e vai direto' : 'o índice guarda todos os ponteiros';
      msg2.textContent = 'acesso direto em 2 leituras';
    }
  };
};

/* polling x DMA: quem gasta a CPU para trazer um bloco do dispositivo */
montar.dma = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 190');
  const cx = 8, dx = 168, mx = 88;
  S('rect', { class: 'k', x: cx, y: 30, width: 64, height: 40, rx: 6 }, svg); S('text', { x: cx + 32, y: 50 }, svg, 'CPU');
  S('rect', { class: 'k', x: dx, y: 30, width: 64, height: 40, rx: 6 }, svg); S('text', { class: 'tm', x: dx + 32, y: 50 }, svg, 'dispositivo');
  S('rect', { class: 'k', x: mx, y: 112, width: 64, height: 40, rx: 6 }, svg); S('text', { class: 'tm', x: mx + 32, y: 132 }, svg, 'memória');
  const dmaBox = S('rect', { class: 'k', x: mx, y: 34, width: 64, height: 32, rx: 6, style: 'stroke-dasharray:3 3' }, svg);
  const dmaTxt = S('text', { class: 'tm', x: mx + 32, y: 50 }, svg, 'DMA');
  const titulo = S('text', { class: 'ta', x: 120, y: 12 }, svg, '');
  const barraFundo = S('rect', { class: 'k', x: cx, y: 76, width: 64, height: 8, rx: 3 }, svg);
  const barra = S('rect', { x: cx, y: 76, width: 0, height: 8, rx: 3 }, svg);
  const balao = S('text', { class: 'tam', x: 120, y: 26 }, svg, '');
  const byte = S('rect', { x: 0, y: 0, width: 10, height: 10, rx: 2, style: 'fill:var(--amber)' }, svg);
  const irq = S('text', { x: 40, y: 98, style: 'fill:var(--red);font-weight:700;font-size:11px' }, svg, 'IRQ!');
  const msg = S('text', { class: 'tm', x: 120, y: 172 }, svg, '');
  const msg2 = S('text', { class: 'tm', x: 120, y: 186 }, svg, '');
  void barraFundo;
  return (t) => {
    const poll = t < 0.5, u = poll ? t / 0.5 : (t - 0.5) / 0.5;
    titulo.textContent = poll ? 'polling' : 'DMA';
    dmaBox.setAttribute('class', poll ? 'k' : 'acf'); dmaBox.style.opacity = poll ? 0.3 : 1; dmaTxt.style.opacity = poll ? 0.3 : 1;
    if (poll) {
      /* a CPU pergunta "pronto?" em laço; depois copia cada palavra ela mesma */
      const [k, p] = fatia(u, 8);
      barra.setAttribute('width', 64 * u); barra.style.fill = 'var(--red)';
      balao.textContent = k < 4 && p < 0.6 ? 'pronto?' : '';
      if (k < 4) { byte.style.opacity = 0; }
      else {
        byte.style.opacity = 1;
        const x = p < 0.5 ? lerp(dx + 27, cx + 27, ease(p / 0.5)) : lerp(cx + 27, mx + 27, ease((p - 0.5) / 0.5));
        const y = p < 0.5 ? 45 : lerp(45, 127, ease((p - 0.5) / 0.5));
        byte.setAttribute('x', x); byte.setAttribute('y', y);
      }
      irq.style.opacity = 0;
      msg.textContent = 'CPU presa: pergunta e copia';
      msg2.textContent = 'cada palavra passa pela CPU';
    } else {
      /* a CPU roda outro processo; o DMA leva o bloco e interrompe no fim */
      barra.setAttribute('width', 64 * u); barra.style.fill = 'var(--green)';
      balao.textContent = u < 0.12 ? 'copie 4 KB' : '';
      byte.style.opacity = u > 0.12 && u < 0.85 ? 1 : 0;
      const p = clamp01((u - 0.12) / 0.7);
      byte.setAttribute('width', 22);
      byte.setAttribute('x', p < 0.4 ? lerp(dx + 21, mx + 21, ease(p / 0.4)) : mx + 21);
      byte.setAttribute('y', p < 0.4 ? 45 : lerp(45, 127, ease((p - 0.4) / 0.6)));
      irq.style.opacity = u > 0.85 ? 1 : 0;
      msg.textContent = 'CPU livre: roda outro processo';
      msg2.textContent = 'uma interrupção só, no fim';
    }
    if (poll) byte.setAttribute('width', 10);
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

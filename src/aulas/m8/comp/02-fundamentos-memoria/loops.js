import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, fatia, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula 02. Cada uma é montada num <aside data-loop="nome"> do conteúdo
   e redesenhada a partir de t ∈ [0,1): o quadro depende só de t, então o fim emenda no começo. */
const montar = {};

/* clock: a onda quadrada passa pela linha "agora"; a cada subida o registrador soma 1 */
montar.clock = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 170');
  const N = 8, P = 44, base = 70, alto = 34, x0 = 120;
  const clip = 'cl' + Math.random().toString(36).slice(2, 7);
  const cp = S('clipPath', { id: clip }, S('defs', null, svg));
  S('rect', { x: 8, y: 20, width: 224, height: 64 }, cp);
  /* subida da onda em x = x0 + j·P (quando o deslocamento é 0) */
  let d = '';
  for (let j = -4; j <= 5; j++) {
    const x = x0 + j * P;
    d += `${j === -4 ? 'M' : 'L'}${x},${base} L${x},${base - alto} L${x + P / 2},${base - alto} L${x + P / 2},${base} `;
  }
  const g = S('g', { 'clip-path': `url(#${clip})` }, svg);
  const onda = S('path', { d, class: 'ac', style: 'stroke-width:2.2' }, g);
  S('line', { x1: x0, x2: x0, y1: 22, y2: 82, class: 's', 'stroke-dasharray': '3 3' }, svg);
  S('text', { class: 'tm', x: x0, y: 12 }, svg, 'agora');
  const ciclo = S('text', { class: 'tm st', x: 8, y: 98 }, svg, '');
  const reg = S('rect', { class: 'bl', x: 110, y: 110, width: 100, height: 30, rx: 6 }, svg);
  S('text', { class: 'tm st', x: 8, y: 125 }, svg, 'registrador');
  const val = S('text', { x: 160, y: 125, class: 'tb' }, svg, '0');
  S('text', { class: 'tm', x: 120, y: 160 }, svg, '3 GHz → 1 ciclo = 0,33 ns');
  return (t) => {
    const q = t * N, k = Math.floor(q), fr = q - k;
    onda.setAttribute('transform', `translate(${-fr * P},0)`);
    ciclo.textContent = `ciclo ${k + 1} de ${N}`;
    val.textContent = String(k);
    reg.setAttribute('class', fr < 0.18 ? 'am' : 'bl');
  };
};

/* frequência de clock e número de núcleos de processamento ao longo dos anos (valores aproximados) */
montar.multicore = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 180');
  const X = (a) => 24 + (a - 1990) / 30 * 184, Yg = (g) => 140 - g / 5 * 110, Yc = (c) => 140 - c / 16 * 110;
  const CLK = [[1990, 0.03], [1993, 0.07], [1995, 0.15], [1997, 0.3], [1999, 0.6], [2000, 1.0], [2002, 2.2], [2004, 3.4], [2005, 3.6], [2008, 3.2], [2012, 3.5], [2016, 4.0], [2020, 4.3]];
  const COR = [[1990, 1], [2005, 1], [2006, 2], [2008, 4], [2013, 6], [2017, 8], [2020, 16]];
  S('line', { class: 's', x1: 20, x2: 216, y1: 140, y2: 140 }, svg);
  [1990, 2000, 2010, 2020].forEach((a) => S('text', { class: 'tm', x: X(a), y: 152 }, svg, String(a)));
  S('line', { class: 's', x1: X(2005), x2: X(2005), y1: 24, y2: 140, 'stroke-dasharray': '2 4' }, svg);
  const parede = S('text', { class: 'tm', x: X(2005), y: 16 }, svg, 'parede de potência');
  const lc = S('polyline', { class: 'ac', style: 'stroke-width:2.4;fill:none' }, svg);
  const ln = S('polyline', { class: 'am', style: 'stroke-width:2.4;fill:none' }, svg);
  const ano = S('text', { class: 'tm st', x: 32, y: 30 }, svg, '');
  const lg1 = S('text', { class: 'ta st', x: 4, y: 168 }, svg, 'clock (até 5 GHz)');
  const lg2 = S('text', { class: 'tam st', x: 130, y: 168 }, svg, 'núcleos (até 16)');
  lg1.style.fontSize = '10.5px'; lg2.style.fontSize = '10.5px';
  const ate = (dados, a, Y) => {
    const pts = [];
    for (let i = 0; i < dados.length; i++) {
      const [x, v] = dados[i];
      if (x <= a) pts.push([X(x), Y(v)]);
      else { const [x0, v0] = dados[i - 1]; const p = (a - x0) / (x - x0); pts.push([X(a), Y(lerp(v0, v, p))]); break; }
    }
    return pts.map((p) => p.join(',')).join(' ');
  };
  return (t) => {
    const a = lerp(1990, 2020, clamp01(t / 0.85));
    lc.setAttribute('points', ate(CLK, a, Yg));
    ln.setAttribute('points', ate(COR, a, Yc));
    ano.textContent = String(Math.round(a));
    parede.style.opacity = a >= 2005 ? 1 : 0.2;
  };
};

/* localidade: soma += a[i] percorre a memória (espacial) e reusa soma e o código (temporal) */
montar.localidade = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 200');
  S('text', { class: 'tm st', x: 6, y: 10 }, svg, 'for (i = 0; i < 8; i++)');
  S('text', { class: 'tm st', x: 18, y: 26 }, svg, 'soma += a[i];');
  const cel = [...Array(8)].map((_, i) => {
    const r = S('rect', { class: 'k', x: 12 + i * 27, y: 52, width: 25, height: 26, rx: 4 }, svg);
    S('text', { class: 'tm', x: 24.5 + i * 27, y: 65 }, svg, `a${i}`);
    return r;
  });
  S('path', { class: 's', d: 'M12 84 V90 H117 V84' }, svg); S('text', { class: 'tm', x: 64, y: 100 }, svg, 'bloco 1');
  S('path', { class: 's', d: 'M120 84 V90 H225 V84' }, svg); S('text', { class: 'tm', x: 172, y: 100 }, svg, 'bloco 2');
  const soma = S('rect', { class: 'k', x: 20, y: 120, width: 80, height: 28, rx: 5 }, svg);
  S('text', { x: 60, y: 134 }, svg, 'soma');
  const cod = S('rect', { class: 'k', x: 130, y: 120, width: 90, height: 28, rx: 5 }, svg);
  S('text', { x: 175, y: 134 }, svg, 'código');
  const ev = S('text', { x: 120, y: 40, class: 'tam' }, svg, '');
  const n1 = S('text', { class: 'tm', x: 120, y: 168 }, svg, '');
  const n2 = S('text', { class: 'tm', x: 120, y: 186 }, svg, '');
  return (t) => {
    const [k, p] = fatia(t, 9);
    const i = Math.min(k, 7), fim = k === 8;
    /* a[j] está no bloco ⌊j/4⌋; um bloco entra na cache quando o primeiro elemento dele é pedido */
    cel.forEach((r, j) => {
      const naCache = Math.floor(j / 4) <= Math.floor(i / 4);
      r.setAttribute('class', !fim && j === i ? 'am' : naCache ? 'acf' : 'k');
    });
    const pulso = !fim && p < 0.55;
    soma.setAttribute('class', pulso ? 'am' : 'k');
    cod.setAttribute('class', pulso ? 'am' : 'k');
    ev.textContent = fim ? '' : i % 4 === 0 ? `a${i}: miss → traz o bloco` : `a${i}: hit (veio no bloco)`;
    n1.textContent = 'espacial: vizinhos vêm no bloco';
    n2.textContent = k === 0 ? 'temporal: soma e código' : 'temporal: soma e código, hit';
  };
};

/* pirâmide da hierarquia: um pedido desce até achar o dado e volta */
montar.piramide = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 210');
  const NIV = [['registr.', '0,3 ns'], ['L1', '1 ns'], ['L2', '4 ns'], ['L3', '15 ns'], ['DRAM', '80 ns'], ['SSD', '100 µs']];
  const cx = 92, h = 24, gap = 4;
  const yN = (i) => 8 + i * (h + gap);
  const formas = NIV.map(([nome, lat], i) => {
    const w = 60 + i * 23;
    const r = S('rect', { class: 'k', x: cx - w / 2, y: yN(i), width: w, height: h, rx: 4 }, svg);
    S('text', { x: cx, y: yN(i) + h / 2, class: 'tm', style: 'fill:var(--fg)' }, svg, nome);
    S('text', { x: 208, y: yN(i) + h / 2, class: 'tm' }, svg, lat);
    return r;
  });
  S('text', { class: 'tm', x: 208, y: 196 }, svg, 'latência');
  S('text', { class: 'tm', x: cx, y: 196 }, svg, 'maior e mais lento ↓');
  const bola = S('circle', { r: 6, style: 'fill:var(--amber)' }, svg);
  const nota = S('text', { class: 'tam', x: 120, y: 182 }, svg, '');
  const ALVO = [1, 3, 4];
  return (t) => {
    const [fase, p] = fatia(t, 3);
    const alvo = ALVO[fase];
    let pos;
    if (p < 0.45) pos = lerp(0, alvo, ease(p / 0.45));
    else if (p < 0.6) pos = alvo;
    else if (p < 0.92) pos = lerp(alvo, 0, ease((p - 0.6) / 0.32));
    else pos = 0;
    bola.setAttribute('cx', cx + 42 + alvo * 3);
    bola.setAttribute('cy', yN(0) + h / 2 + pos * (h + gap));
    const desceu = p < 0.6 ? pos : alvo;
    formas.forEach((r, i) => {
      let c = 'k';
      if (i >= 1 && i < alvo && i <= desceu + 0.01) c = 'rd';
      if (i === alvo && p >= 0.4 && p < 0.92) c = 'gr';
      r.setAttribute('class', c);
    });
    nota.textContent = p >= 0.4 ? `achou na ${NIV[alvo][0]}: ≈ ${NIV[alvo][1]}` : '';
  };
};

/* write-back: as escritas ficam na cache e marcam o bloco como sujo; a memória só é atualizada na saída */
montar.writeback = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 190');
  S('rect', { class: 'bl', x: 6, y: 14, width: 64, height: 34, rx: 6 }, svg);
  S('text', { x: 38, y: 31 }, svg, 'CPU');
  S('text', { class: 'tm st', x: 96, y: 8 }, svg, 'cache');
  const lin = S('rect', { class: 'k', x: 96, y: 14, width: 138, height: 34, rx: 6 }, svg);
  const vC = S('text', { x: 140, y: 31 }, svg, '');
  const dBox = S('rect', { class: 'k', x: 186, y: 20, width: 40, height: 22, rx: 4 }, svg);
  const dT = S('text', { class: 'tm', x: 206, y: 31 }, svg, '');
  S('text', { class: 'tm st', x: 96, y: 112 }, svg, 'memória');
  const mem = S('rect', { class: 'k', x: 96, y: 118, width: 138, height: 34, rx: 6 }, svg);
  const vM = S('text', { x: 165, y: 135 }, svg, '');
  S('line', { class: 's', x1: 165, y1: 50, x2: 165, y2: 116, 'marker-end': 'url(#mnarrow)' }, svg);
  const pac = S('circle', { r: 5, style: 'fill:var(--amber)' }, svg);
  const nota = S('text', { class: 'tm', x: 120, y: 176 }, svg, '');
  const QUAD = [
    { c: 'X = 3', d: 0, m: 'X = 3', n: 'bloco limpo: cache = memória' },
    { c: 'X = 5', d: 1, m: 'X = 3', n: 'escreve 5: só na cache, dirty = 1', ida: 'cpu' },
    { c: 'X = 5', d: 1, m: 'X = 3', n: 'memória desatualizada, e tudo bem', velha: true },
    { c: 'X = 7', d: 1, m: 'X = 3', n: 'escreve 7: nada vai para a memória', ida: 'cpu', velha: true },
    { c: 'X = 7', d: 1, m: 'X = 7', n: 'o bloco vai sair: sujo, então grava', ida: 'mem' },
    { c: 'Y = 9', d: 0, m: 'X = 7', n: 'entra outro bloco, limpo' },
  ];
  return (t) => {
    const [k, p] = fatia(t, QUAD.length);
    const q = QUAD[k], e = ease(clamp01(p / 0.5));
    const mostraNovo = !q.ida || p > 0.5;
    const ant = QUAD[(k + QUAD.length - 1) % QUAD.length];
    vC.textContent = q.ida === 'cpu' && !mostraNovo ? ant.c : q.c;
    dT.textContent = 'D=' + (q.ida === 'cpu' && !mostraNovo ? ant.d : q.d);
    dBox.setAttribute('class', (q.ida === 'cpu' && !mostraNovo ? ant.d : q.d) ? 'am' : 'k');
    vM.textContent = q.ida === 'mem' && !mostraNovo ? ant.m : q.m;
    mem.setAttribute('class', q.velha ? 'rd' : q.ida === 'mem' && mostraNovo ? 'gr' : 'k');
    lin.setAttribute('class', q.ida === 'cpu' && mostraNovo ? 'am' : 'k');
    if (q.ida === 'cpu') { pac.style.opacity = p < 0.5 ? 1 : 0; pac.setAttribute('cx', lerp(70, 100, e)); pac.setAttribute('cy', 31); }
    else if (q.ida === 'mem') { pac.style.opacity = p < 0.5 ? 1 : 0; pac.setAttribute('cx', 165); pac.setAttribute('cy', lerp(50, 116, e)); }
    else pac.style.opacity = 0;
    nota.textContent = q.n;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

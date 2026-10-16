import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, fatia, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula 03. Cada uma é montada num <aside data-loop="nome"> do conteúdo
   e redesenhada a partir de t ∈ [0,1): o quadro depende só de t, então o fim emenda no começo. */
const montar = {};
const ESTAGIOS = ['IF', 'ID', 'EX', 'MEM', 'WB'];
const CORES = ['bl', 'am', 'gr', 'rd', 'acf'];

/* lavanderia: 3 cargas × 3 etapas, uma de cada vez (9 h) ou sobrepostas (5 h) */
montar.lavanderia = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 176');
  const x0 = 40, u = 21; /* 1 hora = 21 px; 9 horas = 189 px */
  const fase = ['bl', 'am', 'gr'];
  S('text', { class: 'tm st', x: 0, y: 8 }, svg, 'uma de cada vez');
  S('text', { class: 'tm st', x: 0, y: 96 }, svg, 'em pipeline');
  const barras = [];
  /* sequencial: carga c, etapa e começa em 3c + e; pipeline: começa em c + e */
  for (let c = 0; c < 3; c++) {
    for (let e = 0; e < 3; e++) {
      const ys = 18 + c * 20, yp = 106 + c * 20;
      barras.push({ ini: 3 * c + e, r: S('rect', { class: fase[e], x: x0 + (3 * c + e) * u, y: ys, width: 0, height: 14, rx: 2 }, svg) });
      barras.push({ ini: c + e, r: S('rect', { class: fase[e], x: x0 + (c + e) * u, y: yp, width: 0, height: 14, rx: 2 }, svg) });
    }
    S('text', { class: 'tm', x: 22, y: 25 + c * 20 }, svg, 'c' + (c + 1));
    S('text', { class: 'tm', x: 22, y: 113 + c * 20 }, svg, 'c' + (c + 1));
  }
  const cursor = S('line', { class: 'ac', x1: x0, y1: 12, x2: x0, y2: 170, 'stroke-dasharray': '3 3' }, svg);
  const relogio = S('text', { class: 'tam', x: 200, y: 96 }, svg, '');
  const fimS = S('text', { class: 'tm', x: 214, y: 84 }, svg, '9 h');
  const fimP = S('text', { class: 'tm', x: 166, y: 148 }, svg, '5 h');
  return (t) => {
    const h = clamp01(t / 0.85) * 9; /* 0..9 horas; o resto do tempo fica parado no fim */
    barras.forEach((b) => b.r.setAttribute('width', Math.max(0, Math.min(1, h - b.ini)) * u - (h - b.ini >= 1 ? 1 : 0)));
    cursor.setAttribute('x1', x0 + h * u); cursor.setAttribute('x2', x0 + h * u);
    relogio.textContent = `${Math.floor(h)} h`;
    fimP.style.opacity = h >= 5 ? 1 : 0; fimS.style.opacity = h >= 9 ? 1 : 0;
  };
};

/* caixas dos 5 estágios, usadas por fluxo e bolha */
function estagios(svg, y) {
  const cx = ESTAGIOS.map((_, i) => 26 + i * 47);
  ESTAGIOS.forEach((s, i) => {
    S('rect', { class: 'k', x: cx[i] - 21, y, width: 42, height: 40, rx: 6 }, svg);
    S('text', { class: 'tm', x: cx[i], y: y - 9 }, svg, s);
  });
  return cx;
}

/* fluxo: instruções entrando uma por ciclo; cada uma anda um estágio por ciclo */
montar.fluxo = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 130');
  const y = 40, cx = estagios(svg, y);
  const N = 10; /* período em ciclos */
  const fichas = [...Array(N)].map((_, j) => {
    const g = S('g', null, svg);
    S('circle', { class: CORES[j % 5], cx: 0, cy: 0, r: 14 }, g);
    S('text', { x: 0, y: 0, style: 'font-size:11px' }, g, 'i' + (j + 1));
    return g;
  });
  const leg = S('text', { class: 'tm', x: 120, y: 112 }, svg, '');
  return (t) => {
    const tau = t * N, c = Math.floor(tau), p = tau - c;
    const m = ease(clamp01((p - 0.6) / 0.4)); /* anda no fim de cada ciclo */
    fichas.forEach((g, j) => {
      const est = (((c - j) % N) + N) % N; /* estágio no ciclo c (0..N-1) */
      const pos = est + m;
      const vis = est <= 4;
      const xi = pos <= 4 ? lerp(cx[Math.floor(pos)], cx[Math.min(4, Math.floor(pos) + 1)], pos - Math.floor(pos)) : cx[4] + (pos - 4) * 47;
      const x = est === N - 1 ? cx[0] : est === 4 ? cx[4] : xi;
      g.setAttribute('transform', `translate(${x},${y + 20})`);
      g.style.opacity = est === N - 1 ? m : vis ? (est === 4 ? 1 - m : 1) : 0;
    });
    leg.textContent = `ciclo ${c + 1}: 5 instruções em andamento`;
  };
};

/* bolha: a 3ª de cada grupo depende da 2ª; ela espera 1 ciclo em ID e uma bolha segue no lugar */
montar.bolha = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 140');
  const y = 40, cx = estagios(svg, y);
  const P = 6; /* a cada 6 ciclos entram 5 instruções e 1 bolha */
  const R = [0, 1, 3, 4, 5]; /* ciclo (dentro do período) em que a instrução r entra em EX */
  const exIn = (n) => 6 * Math.floor(n / 5) + R[((n % 5) + 5) % 5];
  /* estágio da instrução n no ciclo c: IF quando exIn(n-2) <= c < exIn(n-1), ID quando exIn(n-1) <= c < exIn(n) */
  const estagio = (n, c) => {
    const e = exIn(n);
    if (c >= e) return 2 + (c - e);
    if (c >= exIn(n - 1)) return 1;
    if (c >= exIn(n - 2)) return 0;
    return -1;
  };
  const NF = 12;
  const fichas = [...Array(NF)].map(() => {
    const g = S('g', null, svg);
    const ci = S('circle', { class: 'bl', cx: 0, cy: 0, r: 14 }, g);
    const tx = S('text', { x: 0, y: 0, style: 'font-size:11px' }, g, '');
    return { g, ci, tx };
  });
  const bolhas = [0, 1].map(() => { const g = S('g', null, svg); S('circle', { class: 's', cx: 0, cy: 0, r: 14, 'stroke-dasharray': '3 3' }, g); S('text', { class: 'tm', x: 0, y: 0 }, g, 'nop'); return g; });
  const leg = S('text', { class: 'tm', x: 120, y: 104 }, svg, '');
  const leg2 = S('text', { class: 'tam', x: 120, y: 122 }, svg, '');
  const xDe = (pos) => { if (pos < 0) return cx[0] - 47 * (0 - pos); if (pos > 4) return cx[4] + 47 * (pos - 4); const a = Math.floor(pos); return lerp(cx[a], cx[Math.min(4, a + 1)], pos - a); };
  return (t) => {
    const tau = t * 2 * P, c = Math.floor(tau), p = tau - c, m = ease(clamp01((p - 0.6) / 0.4));
    const base = 5 * Math.floor(c / P) - 3;
    fichas.forEach((f, i) => {
      const n = base + i, a = estagio(n, c), b = estagio(n, c + 1);
      const pos = a < 0 ? 0 : a >= 4 ? 4 : lerp(a, b, m);
      f.g.setAttribute('transform', `translate(${xDe(pos)},${y + 20})`);
      f.g.style.opacity = a < 0 && b < 0 ? 0 : a < 0 ? m : a > 4 ? 0 : a === 4 ? 1 - m : 1;
      const r = ((n % 5) + 5) % 5;
      f.ci.setAttribute('class', r === 2 ? 'am' : r === 1 ? 'acf' : 'bl');
      f.tx.textContent = 'i' + (r + 1);
    });
    bolhas.forEach((g, k) => {
      const q = Math.floor(c / P) - k, nasc = 6 * q + 2; /* a bolha entra em EX no ciclo 6q + 2 */
      const a = c >= nasc ? 2 + (c - nasc) : -9, b = c + 1 >= nasc ? 2 + (c + 1 - nasc) : -9;
      const pos = a < 0 ? 2 : a >= 4 ? 4 : lerp(a, b, m);
      g.setAttribute('transform', `translate(${xDe(pos)},${y + 20})`);
      g.style.opacity = a < 0 ? (b >= 0 ? m : 0) : a > 4 ? 0 : a === 4 ? 1 - m : 1;
    });
    const r = c % P;
    leg.textContent = `ciclo ${c + 1}`;
    leg2.textContent = r === 1 ? 'i3 em ID precisa de i2: espera' : r === 2 ? 'i3 parada em ID · bolha em EX' : '';
  };
};

/* CDB: Load1 transmite o valor; só quem espera a etiqueta Load1 copia */
montar.cdb = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 176');
  const est = [
    { x: 46, nome: 'Add1', q: 'Load1' },
    { x: 124, nome: 'Mult1', q: 'Load2' },
    { x: 200, nome: 'Mult2', q: 'Load1' },
  ];
  est.forEach((e) => {
    S('rect', { class: 'k', x: e.x - 34, y: 14, width: 68, height: 52, rx: 6 }, svg);
    S('text', { class: 'tm', x: e.x, y: 26 }, svg, e.nome);
    e.box = S('rect', { class: 'am', x: e.x - 28, y: 38, width: 56, height: 20, rx: 4 }, svg);
    e.t = S('text', { x: e.x, y: 48, style: 'font-size:11px' }, svg, 'Qj=' + e.q);
    e.fio = S('line', { class: 's', x1: e.x, y1: 66, x2: e.x, y2: 138 }, svg);
  });
  S('line', { class: 'ac', x1: 4, y1: 140, x2: 236, y2: 140, style: 'stroke-width:3' }, svg);
  S('text', { class: 'ta', x: 220, y: 156 }, svg, 'CDB');
  const pacote = S('g', null, svg);
  S('rect', { class: 'gr', x: -30, y: -11, width: 60, height: 22, rx: 11 }, pacote);
  S('text', { x: 0, y: 0, style: 'font-size:10.5px' }, pacote, 'Load1 = 7');
  const nota = S('text', { class: 'tm', x: 120, y: 170 }, svg, '');
  return (t) => {
    const anda = clamp01((t - 0.08) / 0.5), x = lerp(30, 212, ease(anda));
    pacote.setAttribute('transform', `translate(${x},140)`);
    pacote.style.opacity = t < 0.08 ? 0 : t > 0.92 ? 0 : 1;
    est.forEach((e) => {
      const pegou = e.q === 'Load1' && x >= e.x && t < 0.94;
      const ignorou = e.q !== 'Load1' && Math.abs(x - e.x) < 30;
      e.box.setAttribute('class', pegou ? 'gr' : 'am');
      e.t.textContent = pegou ? 'Vj=7' : 'Qj=' + e.q;
      e.fio.setAttribute('class', pegou && x - e.x < 40 ? 'ac' : 's');
      if (ignorou) e.box.style.opacity = 0.5; else e.box.style.opacity = 1;
    });
    nota.textContent = t < 0.08 ? 'Load1 terminou' : t < 0.6 ? 'transmite valor + etiqueta' : 'Add1 e Mult2 copiaram; Mult1 ignorou';
  };
};

/* superescalar × VLIW: quem decide o que vai junto */
montar.multi = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 200');
  S('text', { class: 'tm st', x: 0, y: 8 }, svg, 'superescalar: o hardware decide');
  S('text', { class: 'tm st', x: 0, y: 108 }, svg, 'VLIW: o compilador já decidiu');
  /* superescalar: 2 vagas; grupos emitidos por ciclo (letra minúscula repetida = depende da anterior) */
  const GS = [['a', 'b'], ['c'], ['d', 'e'], ['f', 'g']];
  const dep = { c: 'd depende de c' };
  const fila = 'abcdefg'.split('');
  const filaG = fila.map((l, i) => { const g = S('g', null, svg); S('rect', { class: 'k', x: 0, y: 0, width: 18, height: 18, rx: 3 }, g); S('text', { x: 9, y: 9, style: 'font-size:10px' }, g, l); return g; });
  const vagasS = [0, 1].map((v) => S('rect', { class: 's', x: 150 + v * 40, y: 30, width: 34, height: 26, rx: 4, 'stroke-dasharray': '3 3' }, svg));
  const emitS = [0, 1].map((v) => { const g = S('g', null, svg); S('rect', { class: 'bl', x: 150 + v * 40, y: 30, width: 34, height: 26, rx: 4 }, g); return { g, t: S('text', { x: 167 + v * 40, y: 43 }, g, '') }; });
  const msgS = S('text', { class: 'tam', x: 120, y: 78 }, svg, '');
  /* VLIW: pacotes de 3 vagas com nops */
  const PK = [['a', 'b', 'nop'], ['c', 'nop', 'nop'], ['d', 'e', 'nop'], ['f', 'g', 'nop']];
  const pacotes = PK.map((pk) => {
    const g = S('g', null, svg);
    pk.forEach((o, i) => { S('rect', { class: o === 'nop' ? 'k' : 'gr', x: i * 26, y: 0, width: 24, height: 24, rx: 3 }, g); S('text', { class: o === 'nop' ? 'tm' : '', x: i * 26 + 12, y: 12, style: o === 'nop' ? 'font-size:8.5px' : 'font-size:11px' }, g, o); });
    return g;
  });
  S('line', { class: 's', x1: 150, y1: 120, x2: 150, y2: 176, 'stroke-dasharray': '3 3' }, svg);
  S('text', { class: 'tm', x: 196, y: 186 }, svg, 'executa');
  const msgV = S('text', { class: 'tam', x: 120, y: 196 }, svg, '');
  return (t) => {
    const [k, p] = fatia(t, GS.length);
    const m = ease(clamp01(p / 0.35));
    /* fila do superescalar: instruções ainda não emitidas, deslizando */
    const emitidas = GS.slice(0, k).flat().length;
    filaG.forEach((g, i) => {
      const idx = i - emitidas;
      const naVez = GS[k].includes(fila[i]);
      if (i < emitidas) { g.style.opacity = 0; return; }
      const xf = 4 + idx * 20, xv = 150 + GS[k].indexOf(fila[i]) * 40 + 8;
      const x = naVez ? lerp(xf, xv, m) : xf, y = naVez ? lerp(34, 34, m) : 34;
      g.setAttribute('transform', `translate(${x},${y})`);
      g.style.opacity = naVez && m >= 1 ? 0 : 1;
    });
    emitS.forEach((e, v) => { const l = GS[k][v]; e.g.style.opacity = l && m >= 1 ? 1 : 0; e.t.textContent = l || ''; });
    vagasS.forEach((r, v) => r.setAttribute('class', !GS[k][v] && m >= 1 ? 'rd' : 's'));
    msgS.textContent = GS[k].length === 1 ? `ciclo ${k + 1}: ${dep[GS[k][0]] || 'só 1 cabe'}, emite 1` : `ciclo ${k + 1}: emite 2`;
    /* VLIW: pacotes andando da esquerda para a coluna de execução */
    pacotes.forEach((g, i) => {
      const d = i - k; /* 0 = executando agora */
      g.setAttribute('transform', `translate(${Math.max(2, Math.min(160, lerp(158 - (d + 1) * 86, 158 - d * 86, m)))},${136})`);
      g.style.opacity = d < -1 || d > 1 ? 0 : d === -1 ? 1 - clamp01(m * 3) : d === 1 ? m : 1;
    });
    const nops = PK[k].filter((o) => o === 'nop').length;
    msgV.textContent = `pacote ${k + 1}: ${3 - nops} operações, ${nops} nop`;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

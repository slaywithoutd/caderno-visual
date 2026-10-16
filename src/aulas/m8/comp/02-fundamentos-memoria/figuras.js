import { S, H } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* ---------- utilitários de desenho desta aula ---------- */
const nf = (x, d = 2) => x.toLocaleString('pt-BR', { maximumFractionDigits: d });
const COR = {
  k: 'fill:var(--surface);stroke:var(--line2)',
  mut: 'fill:var(--surface2);stroke:var(--line)',
  hl: 'fill:var(--amber-soft);stroke:var(--amber)',
  ok: 'fill:var(--green-soft);stroke:var(--green)',
  bad: 'fill:var(--red-soft);stroke:var(--red)',
  bl: 'fill:var(--blue-soft);stroke:var(--blue)',
  foco: 'fill:var(--surface);stroke:var(--amber)',
};
function caixa(p, x, y, w, h, cor = 'k', rx = 6) {
  const fino = cor === 'k' || cor === 'mut';
  return S('rect', { x, y, width: Math.max(0, w), height: h, rx, style: `${COR[cor]};stroke-width:${fino ? 1.3 : 2}` }, p);
}
function tx(p, x, y, s, o = {}) {
  const st = [];
  if (o.fill) st.push('fill:' + o.fill);
  if (o.w) st.push('font-weight:' + o.w);
  if (o.size) st.push('font-size:' + o.size + 'px');
  return S('text', { x, y, class: o.m ? 'sv-muted' : 'sv-text', 'text-anchor': o.a || 'middle', 'dominant-baseline': 'central', style: st.join(';') }, p, s);
}
/* pontas de seta (cinza, âmbar, verde, vermelha); recriadas porque o svg é redesenhado a cada passo */
function marcas(svg) {
  const defs = S('defs', null, svg);
  const id = 'm' + Math.random().toString(36).slice(2, 7);
  [['', 'var(--muted)'], ['a', 'var(--amber)'], ['g', 'var(--green)'], ['r', 'var(--red)']].forEach(([s, c]) => {
    const mk = S('marker', { id: id + s, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
    S('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:' + c }, mk);
  });
  return id;
}
function seta(p, id, d, cor = '') {
  const c = { '': 'var(--line2)', a: 'var(--amber)', g: 'var(--green)', r: 'var(--red)' }[cor];
  return S('path', { d, style: `fill:none;stroke:${c};stroke-width:${cor ? 2.2 : 1.4}`, 'marker-end': `url(#${id}${cor})` }, p);
}
/* abas de cenário (como na aula 01): cada aba troca as notas e a função de desenho da mesma StepFig */
function abas(root, cenarios, speed) {
  const tabs = root.querySelector('.fig-tabs');
  let fig = null;
  function carregar(key) {
    const c = cenarios[key];
    tabs.querySelectorAll('.btn').forEach((b) => b.classList.toggle('sel', b.dataset.k === key));
    if (!fig) fig = new StepFig(root, { notes: c.notes, render: c.render, speed });
    else { fig.stop(); fig.render = c.render; fig.setSteps(c.notes); }
  }
  Object.keys(cenarios).forEach((k) => {
    const b = H('button', { class: 'btn sm' }, cenarios[k].label); b.dataset.k = k;
    b.addEventListener('click', () => { carregar(k); fig.play(); });
    tabs.appendChild(b);
  });
  carregar(Object.keys(cenarios)[0]);
}

/* ============ Figura 1: equação da CPU ============ */
(function () {
  const root = document.getElementById('fig-cpu'); if (!root) return;
  const svg = document.getElementById('cpu-svg'), cap = document.getElementById('cpu-cap');

  /* uma linha "nome: IC × CPI × Tc = tempo" com barra de tempo embaixo */
  function linha(y, nome, o, show, hl, tmax) {
    const T = o.ic * o.cpi / (o.f * 1e9);
    tx(svg, 14, y + 18, nome, { a: 'start', w: 600 });
    caixa(svg, 112, y, 122, 36, hl.ic ? 'hl' : 'k'); tx(svg, 173, y + 18, 'IC = ' + o.icTxt);
    tx(svg, 246, y + 18, '×', { m: 1 });
    caixa(svg, 258, y, 100, 36, hl.cpi ? 'hl' : 'k'); tx(svg, 308, y + 18, 'CPI = ' + nf(o.cpi));
    tx(svg, 370, y + 18, '×', { m: 1 });
    caixa(svg, 382, y, 122, 36, hl.tc ? 'hl' : 'k'); tx(svg, 443, y + 18, show.tc ? 'Tc = ' + nf(1 / o.f, 3) + ' ns' : 'f = ' + nf(o.f) + ' GHz');
    tx(svg, 516, y + 18, '=', { m: 1 });
    caixa(svg, 528, y, 104, 36, hl.res || 'k'); tx(svg, 580, y + 18, show.res ? nf(T, 3) + ' s' : '?', { w: show.res ? 600 : 400 });
    if (show.ciclos) tx(svg, 112, y + 54, `ciclos = IC × CPI = ${nf(o.ic * o.cpi / 1e9)} ${o.ic * o.cpi >= 2e9 ? 'bilhões' : 'bilhão'}`, { a: 'start', m: 1 });
    if (show.res) {
      caixa(svg, 112, y + 68, 420 * T / tmax, 14, 'bl', 3);
      tx(svg, 112 + 420 * T / tmax + 8, y + 75, nf(T, 3) + ' s', { a: 'start', m: 1 });
    }
    return T;
  }
  const A = { ic: 1e9, icTxt: '1 bilhão', cpi: 1.5, f: 2 }, B = { ic: 1e9, icTxt: '1 bilhão', cpi: 2.5, f: 3 };
  const ANT = { ic: 1e9, icTxt: '1 bilhão', cpi: 1.7, f: 2 }, DEP = { ic: 0.8e9, icTxt: '0,8 bilhão', cpi: 1.9, f: 2 };

  const dois = {
    label: 'Dois processadores',
    notes: [
      'Mesmo programa, mesma ISA: <b>IC = 1 bilhão</b> de instruções nas duas máquinas. A tem clock de 2 GHz e CPI 1,5. B tem clock de 3 GHz e CPI 2,5. Qual termina antes?',
      'Converta frequência em tempo de ciclo: <code>Tc = 1 / f</code>. A: 1 / (2 × 10⁹) = <b>0,5 ns</b>. B: 1 / (3 × 10⁹) ≈ <b>0,333 ns</b>.',
      'Ciclos totais = IC × CPI. A: 1,5 bilhão de ciclos. B: 2,5 bilhões.',
      'Tempo = ciclos × Tc. A: 1,5 × 10⁹ × 0,5 ns = <b>0,75 s</b>. B: 2,5 × 10⁹ × 0,333 ns ≈ <b>0,833 s</b>.',
      'A é 0,833 / 0,75 ≈ <b>1,11 vez mais rápido</b>, com clock 33% menor. O CPI alto de B comeu a vantagem do clock.',
    ],
    render(k) {
      svg.innerHTML = '';
      const show = { tc: k >= 1, ciclos: k >= 2, res: k >= 3 };
      const hl = { ic: k === 2, cpi: k === 2, tc: k === 1, res: k === 3 ? 'hl' : null };
      linha(24, 'A · 2 GHz', A, show, { ...hl, res: k >= 4 ? 'ok' : hl.res }, 0.85);
      linha(150, 'B · 3 GHz', B, show, hl, 0.85);
      cap.textContent = ['T = IC × CPI × Tc  ·  Tc = 1 / f', 'A: Tc = 0,5 ns   ·   B: Tc ≈ 0,333 ns', 'A: 1,5 × 10⁹ ciclos   ·   B: 2,5 × 10⁹ ciclos',
        'A: 0,75 s   ·   B: 0,833 s', 'speedup de A sobre B = 0,833 / 0,75 ≈ 1,11'][k];
    },
  };

  const MIX = [{ n: 'aritméticas', fr: 0.5, cpi: 1 }, { n: 'memória', fr: 0.3, cpi: 2 }, { n: 'branches', fr: 0.2, cpi: 3 }];
  const mix = {
    label: 'CPI por tipo de instrução',
    notes: [
      'Um programa com três classes de instrução. A <b>largura</b> de cada faixa é a fração das instruções; a <b>altura</b> é o CPI da classe. A área de cada faixa é a contribuição dela para o CPI médio.',
      'Aritméticas: 50% das instruções × CPI 1 = <b>0,5</b>.',
      'Acessos à memória: 30% × CPI 2 = <b>0,6</b>.',
      'Branches: 20% × CPI 3 = <b>0,6</b>. Somando: CPI = 0,5 + 0,6 + 0,6 = <b>1,7</b>, a altura média da figura (linha tracejada).',
      'Uma cache melhor baixa o CPI dos acessos à memória de 2 para 1,5: contribuição 0,3 × 1,5 = 0,45 e CPI = <b>1,55</b>. Mesmo IC e mesmo clock, então o speedup é 1,7 / 1,55 ≈ <b>1,10</b>.',
    ],
    render(k) {
      svg.innerHTML = '';
      const x0 = 70, W = 540, base = 236, U = 58;
      for (let v = 0; v <= 3; v++) {
        S('line', { x1: x0, x2: x0 + W, y1: base - v * U, y2: base - v * U, style: 'stroke:var(--line);stroke-dasharray:' + (v ? '2 4' : '0') }, svg);
        tx(svg, x0 - 10, base - v * U, String(v), { a: 'end', m: 1 });
      }
      tx(svg, 14, 40, 'CPI', { a: 'start', m: 1 });
      let cum = 0;
      MIX.forEach((c, i) => {
        const cpi = k >= 4 && i === 1 ? 1.5 : c.cpi;
        const x = x0 + cum * W, w = c.fr * W, h = cpi * U;
        const cor = k === 0 ? 'mut' : i + 1 === k || (k === 4 && i === 1) ? 'hl' : k > i ? 'bl' : 'mut';
        caixa(svg, x + 1, base - h, w - 2, h, cor, 3);
        tx(svg, x + w / 2, base + 16, `${c.n} · ${Math.round(c.fr * 100)}%`, { m: 1 });
        tx(svg, x + w / 2, base - h - 12, 'CPI ' + nf(cpi), { m: 1 });
        if (k > i || (k === 4)) tx(svg, x + w / 2, base - h / 2, nf(c.fr * cpi) + '', { w: 600 });
        cum += c.fr;
      });
      if (k >= 3) {
        const media = (cpi) => S('line', { x1: x0, x2: x0 + W, y1: base - cpi * U, y2: base - cpi * U, style: 'stroke:var(--accent);stroke-width:2;stroke-dasharray:6 4' }, svg);
        if (k === 3) { media(1.7); tx(svg, x0 + 6, base - 1.7 * U - 11, 'CPI médio 1,7', { a: 'start', fill: 'var(--accent)', w: 600 }); }
        else { S('line', { x1: x0, x2: x0 + W, y1: base - 1.7 * U, y2: base - 1.7 * U, style: 'stroke:var(--line2);stroke-dasharray:3 4' }, svg); media(1.55); tx(svg, x0 + 6, base - 1.7 * U - 11, 'CPI médio: 1,7 → 1,55', { a: 'start', fill: 'var(--accent)', w: 600 }); }
      }
      cap.textContent = ['CPI = Σ (ICᵢ / IC) × CPIᵢ', 'CPI = 0,5 × 1 + …', 'CPI = 0,5 + 0,3 × 2 + …', 'CPI = 0,5 + 0,6 + 0,6 = 1,7',
        'CPI = 0,5 + 0,45 + 0,6 = 1,55  ·  speedup = 1,7 / 1,55 ≈ 1,10'][k];
    },
  };

  const comp = {
    label: 'Compilador novo',
    notes: [
      'Um compilador novo gera <b>20% menos instruções</b>, mas troca algumas simples por outras mais lentas: o CPI sobe de 1,7 para 1,9. O clock continua 2 GHz (Tc = 0,5 ns). Vale a pena?',
      'Antes: 1 × 10⁹ × 1,7 × 0,5 ns = <b>0,85 s</b>.',
      'Depois: 0,8 × 10⁹ × 1,9 × 0,5 ns = <b>0,76 s</b>.',
      'Speedup 0,85 / 0,76 ≈ <b>1,12</b>. O CPI piorou e o programa ficou mais rápido: só o produto dos três fatores decide.',
    ],
    render(k) {
      svg.innerHTML = '';
      linha(24, 'antes', ANT, { tc: true, res: k >= 1 }, { ic: k === 0 || k === 1, cpi: k === 0 || k === 1, res: k === 1 ? 'hl' : null }, 0.9);
      linha(150, 'depois', DEP, { tc: true, res: k >= 2 }, { ic: k === 0 || k === 2, cpi: k === 0 || k === 2, res: k === 2 ? 'hl' : k === 3 ? 'ok' : null }, 0.9);
      cap.textContent = ['IC cai 20%, CPI sobe de 1,7 para 1,9', 'T_antes = 10⁹ × 1,7 × 0,5 ns = 0,85 s', 'T_depois = 0,8 × 10⁹ × 1,9 × 0,5 ns = 0,76 s', 'speedup = 0,85 / 0,76 ≈ 1,12'][k];
    },
  };

  abas(root, { dois, mix, comp }, 2600);
})();

/* ============ Figura 2: Lei de Amdahl ============ */
(function () {
  const root = document.getElementById('fig-amdahl'); if (!root) return;
  const svg = document.getElementById('am-svg'), cap = document.getElementById('am-cap');
  const fI = document.getElementById('am-f'), sI = document.getElementById('am-s');
  const fV = document.getElementById('am-fv'), sV = document.getElementById('am-sv');
  const sDe = (v) => Math.pow(10, v / 100), vDe = (s) => Math.round(Math.log10(s) * 100);
  let cur = { f: 0.4, s: 10 };

  function desenhar() {
    const { f, s } = cur;
    const Sg = 1 / ((1 - f) + f / s), lim = 1 / (1 - f);
    fV.textContent = nf(f); sV.textContent = nf(s, 1);
    svg.innerHTML = '';
    /* barras de tempo: antes e depois */
    const X0 = 70, W = 540;
    tx(svg, 10, 22, 'antes', { a: 'start', m: 1 });
    caixa(svg, X0, 10, W * (1 - f), 24, 'mut', 3); caixa(svg, X0 + W * (1 - f), 10, W * f, 24, 'bl', 3);
    if (W * (1 - f) > 70) tx(svg, X0 + W * (1 - f) / 2, 22, `1 − f = ${nf(1 - f)}`, { m: 1 });
    if (W * f > 50) tx(svg, X0 + W * (1 - f) + W * f / 2, 22, `f = ${nf(f)}`, { m: 1 });
    tx(svg, 10, 58, 'depois', { a: 'start', m: 1 });
    caixa(svg, X0, 46, W * (1 - f), 24, 'mut', 3); caixa(svg, X0 + W * (1 - f), 46, Math.max(W * f / s, 2), 24, 'hl', 3);
    const fim = X0 + W * (1 - f) + W * f / s;
    const rot = `f/s = ${nf(f / s, 3)} → total ${nf(1 - f + f / s, 3)} do tempo antigo`;
    if (fim < 300) tx(svg, fim + 8, 58, rot, { a: 'start', fill: 'var(--amber)', w: 600 });
    else tx(svg, X0 + W, 84, rot, { a: 'end', fill: 'var(--amber)', w: 600 });

    /* gráfico S × s (s em escala log de 1 a 100) */
    const gx0 = 70, gx1 = 610, gy0 = 100, gy1 = 340;
    const topo = Math.max(2, Math.min(lim, 100) * 1.12);
    const passo = [0.5, 1, 2, 5, 10, 20, 25, 50].find((p) => topo / p <= 6) || 50;
    const ymax = Math.ceil(topo / passo) * passo;
    const X = (v) => gx0 + (gx1 - gx0) * Math.log10(v) / 2, Y = (v) => gy1 - (gy1 - gy0) * v / ymax;
    for (let v = 0; v <= ymax + 1e-9; v += passo) {
      S('line', { x1: gx0, x2: gx1, y1: Y(v), y2: Y(v), style: 'stroke:var(--line);stroke-dasharray:' + (v ? '2 4' : '0') }, svg);
      tx(svg, gx0 - 8, Y(v), nf(v, 1), { a: 'end', m: 1 });
    }
    [1, 2, 5, 10, 20, 50, 100].forEach((v) => { S('line', { x1: X(v), x2: X(v), y1: gy1, y2: gy1 + 5, style: 'stroke:var(--line2)' }, svg); tx(svg, X(v), gy1 + 16, String(v), { m: 1 }); });
    tx(svg, gx1, gy1 + 32, 's (speedup da parte melhorada, escala log)', { a: 'end', m: 1 });
    tx(svg, 14, gy0 - 14, 'S global', { a: 'start', m: 1 });
    /* ideal S = s */
    const sIdeal = Math.min(100, ymax);
    let di = '';
    for (let i = 0; i <= 60; i++) { const v = Math.pow(sIdeal, i / 60); di += (i ? 'L' : 'M') + X(v).toFixed(1) + ',' + Y(v).toFixed(1); }
    S('path', { d: di, style: 'fill:none;stroke:var(--line2);stroke-dasharray:3 4' }, svg);
    if (X(sIdeal) < 480) tx(svg, X(sIdeal) + 8, Y(sIdeal) + 4, 'ideal: S = s', { a: 'start', m: 1 });
    else tx(svg, X(sIdeal) - 8, Y(sIdeal) + 16, 'ideal: S = s', { a: 'end', m: 1 });
    /* teto */
    if (lim <= ymax) {
      S('line', { x1: gx0, x2: gx1, y1: Y(lim), y2: Y(lim), style: 'stroke:var(--amber);stroke-width:1.6;stroke-dasharray:7 5' }, svg);
      tx(svg, gx1, Y(lim) - 10, `teto 1 / (1 − f) = ${nf(lim)}`, { a: 'end', fill: 'var(--amber)', w: 600 });
    }
    /* curva */
    let d = '';
    for (let i = 0; i <= 120; i++) { const v = Math.pow(10, 2 * i / 120); d += (i ? 'L' : 'M') + X(v).toFixed(1) + ',' + Y(1 / ((1 - f) + f / v)).toFixed(1); }
    S('path', { d, style: 'fill:none;stroke:var(--accent);stroke-width:2.6' }, svg);
    S('circle', { cx: X(s), cy: Y(Sg), r: 7, style: 'fill:var(--amber);stroke:var(--surface);stroke-width:2' }, svg);
    tx(svg, X(s) + (s > 40 ? -12 : 12), Y(Sg) + 18, `S = ${nf(Sg)}`, { a: s > 40 ? 'end' : 'start', w: 600 });
    cap.textContent = `S = 1 / ((1 − ${nf(f)}) + ${nf(f)} / ${nf(s, 1)}) = 1 / (${nf(1 - f)} + ${nf(f / s, 3)}) = 1 / ${nf(1 - f + f / s, 3)} = ${nf(Sg)}   ·   teto ${nf(lim)}`;
  }

  const P = [{ f: 0.4, s: 10 }, { f: 0.4, s: 100 }, { f: 0.2, s: 10 }, { f: 0.5, s: 1.6 }, { f: 0.9, s: 10 }, { f: 0.95, s: 8 }, { f: 0.95, s: 8 }];
  const notes = [
    'Exemplo do livro: o servidor web passa <b>40%</b> do tempo calculando (f = 0,4) e ganha um processador <b>10×</b> mais rápido (s = 10). Barra de cima: o tempo antes; de baixo: depois. S = 1 / (0,6 + 0,04) = <b>1,56</b>.',
    'Com s = 100 a parte azul quase some, mas a cinza (60%) fica. S = 1 / (0,6 + 0,004) ≈ <b>1,66</b>, colado no teto 1 / 0,6 = <b>1,67</b>.',
    'Raiz quadrada em ponto flutuante: 20% do tempo (f = 0,2), 10× mais rápida. S = 1 / (0,8 + 0,02) ≈ <b>1,22</b>.',
    'Todo o ponto flutuante: 50% do tempo (f = 0,5), só 1,6× mais rápido. S = 1 / (0,5 + 0,3125) ≈ <b>1,23</b>. Melhorar pouco o caso comum rende tanto quanto melhorar muito o caso raro.',
    'f = 0,9 e s = 10: S = 1 / (0,1 + 0,09) ≈ <b>5,26</b>. O teto sobe para 10: quanto maior f, mais vale acelerar aquela parte.',
    'Processadores paralelos: 95% do programa se divide (f = 0,95) entre 8 processadores (s = 8). S = 1 / (0,05 + 0,119) ≈ <b>5,9</b>. O teto é <b>20</b>, nem com mil processadores passa disso.',
    'Agora é com você: arraste f e s. A curva sempre achata no teto 1 / (1 − f); só aumentar f levanta o teto.',
  ];
  const fig = new StepFig(root, { notes, speed: 3000, render(k) {
    cur = { ...P[k] }; fI.value = Math.round(cur.f * 100); sI.value = vDe(cur.s); desenhar();
  } });
  const mexeu = () => { fig.stop(); fig.hold = true; cur = { f: fI.value / 100, s: sDe(+sI.value) }; desenhar(); };
  fI.addEventListener('input', mexeu); sI.addEventListener('input', mexeu);
})();

/* ============ Figura 3: cache de 4 linhas ============ */
(function () {
  const root = document.getElementById('fig-cache'); if (!root) return;
  const svg = document.getElementById('cache-svg'), cap = document.getElementById('cache-cap');
  const SEQ = [6, 4, 0, 1, 0, 4, 0, 2, 6, 4];
  const HIT = 1, PEN = 20;
  const bin = (v, n) => (n ? v.toString(2).padStart(n, '0') : '');

  function simular(c) {
    const sets = [...Array(c.sets)].map(() => [...Array(c.ways)].map(() => ({ v: 0, tag: null, b: null, uso: -1 })));
    const vistos = new Set(), fa = [], passos = [];
    SEQ.forEach((b, t) => {
      const s = b % c.sets, tag = Math.floor(b / c.sets), set = sets[s];
      let w = set.findIndex((l) => l.v && l.tag === tag);
      const hit = w >= 0;
      /* cache totalmente associativa de 4 linhas (LRU) só para classificar o miss */
      const fi = fa.indexOf(b), fahit = fi >= 0;
      if (fahit) fa.splice(fi, 1); fa.push(b); if (fa.length > 4) fa.shift();
      const tipo = hit ? null : !vistos.has(b) ? 'compulsório' : fahit ? 'de conflito' : 'de capacidade';
      vistos.add(b);
      let vitima = null;
      if (!hit) {
        w = set.findIndex((l) => !l.v);
        if (w < 0) { w = set.reduce((m, l, i) => (l.uso < set[m].uso ? i : m), 0); vitima = set[w].b; }
        Object.assign(set[w], { v: 1, tag, b });
      }
      set[w].uso = t;
      passos.push({ b, s, tag, hit, w, tipo, vitima, snap: sets.map((x) => x.map((l) => ({ ...l }))) });
    });
    return passos;
  }

  const CFG = {
    direto: { label: 'Mapeamento direto', sets: 4, ways: 1, ib: 2,
      intro: 'Cache de <b>mapeamento direto</b> com 4 linhas. O bloco b vai para a linha <code>b mod 4</code>: os 2 bits da direita do número do bloco são o índice; os 2 da esquerda, a tag. As linhas começam vazias (V = 0).',
      fecho: 'Os blocos 0 e 4 caem os dois na linha 0 e ficam se expulsando: misses de conflito em sequência. Troque para a aba "2 vias" e veja quantos somem.' },
    duas: { label: '2 vias', sets: 2, ways: 2, ib: 1,
      intro: '<b>Associativa em conjunto de 2 vias</b>: as 4 linhas formam 2 conjuntos de 2. O bloco b vai para o conjunto <code>b mod 2</code> (1 bit de índice) e pode ocupar qualquer uma das 2 vias. A tag tem 3 bits. Substituição LRU: sai o usado há mais tempo.',
      fecho: 'Com 2 vias, os blocos 0 e 4 cabem juntos no conjunto 0 e os conflitos do mapeamento direto viram hits. Ainda sobra um conflito no fim, porque 0, 2, 4 e 6 (todos pares) disputam o mesmo conjunto de 2 lugares.' },
    total: { label: 'Totalmente associativa', sets: 1, ways: 4, ib: 0,
      intro: '<b>Totalmente associativa</b>: um conjunto só, com 4 vias. Não há índice; a tag é o número inteiro do bloco (4 bits) e é comparada com as 4 linhas ao mesmo tempo. Substituição LRU.',
      fecho: 'Sobraram só misses compulsórios e um de capacidade. Em troca, cada acesso compara 4 tags ao mesmo tempo: na prática o hit time seria maior.' },
  };

  function cenario(c) {
    const P = simular(c), tb = 4 - c.ib;
    const lugar = c.ways > 1 ? 'conjunto' : 'linha';
    const notes = [c.intro];
    P.forEach((p) => {
      let t = `Pede o bloco <b>${p.b}</b> = <code>${bin(p.b, 4)}</code>.`;
      t += c.ib ? ` Índice <code>${bin(p.s, c.ib)}</code> → ${lugar} ${p.s}.` : ' Procura nas 4 linhas.';
      if (p.hit) t += ` Tag <code>${bin(p.tag, tb)}</code> encontrada com V = 1: <b class="ok">hit</b>.`;
      else {
        t += ` Nenhuma linha válida com tag <code>${bin(p.tag, tb)}</code>: <b class="bad">miss ${p.tipo}</b>.`;
        if (p.tipo === 'compulsório') t += ' É o primeiro pedido desse bloco.';
        if (p.tipo === 'de conflito') t += ` O bloco ${p.b} já esteve aqui e saiu por disputar o mesmo ${lugar}; uma cache totalmente associativa de 4 linhas ainda o teria.`;
        if (p.tipo === 'de capacidade') t += ` Desde o último pedido dele vieram 4 outros blocos diferentes, e só cabem 4: nenhuma organização de 4 linhas o guardaria.`;
        t += p.vitima != null ? ` Sai o bloco ${p.vitima}${c.ways > 1 ? ' (o usado há mais tempo)' : ''}.` : ' A linha estava vazia.';
      }
      notes.push(t);
    });
    const hits = P.filter((p) => p.hit).length, m = (10 - hits) / 10;
    notes.push(`Resultado: <b>${hits} hits</b> em 10 pedidos, miss rate ${10 - hits}/10 = ${nf(m)}. Com hit time de ${HIT} ciclo e miss penalty de ${PEN}: AMAT = 1 + ${nf(m)} × ${PEN} = <b>${nf(HIT + m * PEN)} ciclos</b>. ${c.fecho}`);

    function render(k) {
      svg.innerHTML = '';
      const ult = k >= 1 && k <= 10 ? P[k - 1] : null;
      const snap = k === 0 ? null : P[Math.min(k, 10) - 1].snap;
      /* sequência de pedidos */
      tx(svg, 14, 23, 'pedidos', { a: 'start', m: 1 });
      SEQ.forEach((b, i) => {
        const cor = i + 1 === k ? (P[i].hit ? 'ok' : 'bad') : i + 1 < k ? (P[i].hit ? 'ok' : 'bad') : 'k';
        const r = caixa(svg, 100 + i * 53, 10, 44, 26, cor);
        if (i + 1 < k) r.style.opacity = 0.55;
        if (i + 1 === k) r.setAttribute('style', r.getAttribute('style') + ';stroke-width:3');
        tx(svg, 122 + i * 53, 23, String(b), { w: i + 1 === k ? 700 : 400 });
      });
      /* endereço do bloco */
      tx(svg, 14, 70, 'número do bloco (4 bits)', { a: 'start', m: 1 });
      const bits = ult ? bin(ult.b, 4) : '????';
      [...bits].forEach((ch, i) => {
        const ehTag = i < tb;
        caixa(svg, 14 + i * 42, 84, 36, 36, ult ? (ehTag ? 'bl' : 'hl') : 'mut');
        tx(svg, 32 + i * 42, 102, ch, { w: 600 });
      });
      if (tb) tx(svg, 14 + tb * 21 - 3, 132, 'tag', { fill: 'var(--blue)', w: 600 });
      if (c.ib) tx(svg, 14 + tb * 42 + c.ib * 21 - 3, 132, 'índice', { fill: 'var(--amber)', w: 600 });
      if (ult) {
        tx(svg, 14, 158, `bloco ${ult.b} = ${bin(ult.b, 4)}₂`, { a: 'start' });
        tx(svg, 14, 180, c.ib ? `índice ${bin(ult.s, c.ib)}₂ = ${ult.s} → ${lugar} ${ult.s}` : 'sem índice: olha as 4 linhas', { a: 'start', m: 1 });
        tx(svg, 14, 200, `tag ${bin(ult.tag, tb)}₂`, { a: 'start', m: 1 });
        tx(svg, 14, 236, ult.hit ? 'HIT' : 'MISS', { a: 'start', w: 700, size: 22, fill: ult.hit ? 'var(--green)' : 'var(--red)' });
        if (!ult.hit) tx(svg, 84, 236, ult.tipo, { a: 'start', fill: 'var(--red)' });
        if (ult.vitima != null) tx(svg, 14, 262, `sai o bloco ${ult.vitima}`, { a: 'start', m: 1 });
      } else if (k === 0) {
        tx(svg, 14, 160, c.ib ? `${c.ib} bit${c.ib > 1 ? 's' : ''} de índice, ${tb} de tag` : `0 bits de índice, ${tb} de tag`, { a: 'start', m: 1 });
      }
      const feitos = Math.min(k, 10), hitsAte = P.slice(0, feitos).filter((p) => p.hit).length;
      if (k > 0) tx(svg, 14, 300, `hits ${hitsAte} · misses ${feitos - hitsAte}`, { a: 'start', w: 600 });
      /* a cache */
      const cx = 300;
      tx(svg, cx, 62, c.ways > 1 ? 'conj.' : 'linha', { a: 'start', m: 1 });
      const cV = cx + (c.ways > 1 ? 120 : 70), cT = cx + (c.ways > 1 ? 180 : 130), cC = cx + 262;
      tx(svg, cV, 62, 'V', { m: 1 }); tx(svg, cT, 62, 'tag', { m: 1 }); tx(svg, cC, 62, 'conteúdo', { m: 1 });
      for (let r = 0; r < 4; r++) {
        const s = Math.floor(r / c.ways), w = r % c.ways, y = 76 + r * 52 + s * (c.ways > 1 && c.sets > 1 ? 8 : 0);
        const l = snap ? snap[s][w] : { v: 0 };
        let cor = 'k';
        if (ult && ult.s === s) cor = 'foco';
        if (ult && ult.s === s && ult.w === w) cor = ult.hit ? 'ok' : 'bad';
        caixa(svg, cx, y, 330, 44, cor);
        if (w === 0 || c.ways === 1) tx(svg, cx + 12, y + 22, c.ways === 4 ? '0' : String(c.ways > 1 ? s : r), { a: 'start', w: 600 });
        if (c.ways > 1) tx(svg, cx + 40, y + 22, 'via ' + w, { a: 'start', m: 1 });
        tx(svg, cV, y + 22, String(l.v ? 1 : 0), { m: !l.v });
        tx(svg, cT, y + 22, l.v ? bin(l.tag, tb) : '—', { m: !l.v });
        tx(svg, cC, y + 22, l.v ? 'bloco ' + l.b : 'vazia', { m: !l.v, w: l.v ? 600 : 400 });
      }
      const m2 = (feitos - hitsAte) / Math.max(1, feitos);
      cap.innerHTML = k === 0 ? 'sequência: 6, 4, 0, 1, 0, 4, 0, 2, 6, 4  ·  hit time = 1 ciclo, miss penalty = 20 ciclos'
        : k <= 10 ? `até aqui: ${feitos} pedidos, miss rate ${feitos - hitsAte}/${feitos} = ${nf(m2)}`
          : `AMAT = 1 + ${nf(m)} × 20 = ${nf(1 + m * 20)} ciclos`;
    }
    return { label: c.label, notes, render };
  }

  abas(root, { direto: cenario(CFG.direto), duas: cenario(CFG.duas), total: cenario(CFG.total) }, 2400);
})();

/* ============ Figura 4: tradução de endereço com TLB ============ */
(function () {
  const root = document.getElementById('fig-vm'); if (!root) return;
  const svg = document.getElementById('vm-svg'), cap = document.getElementById('vm-cap');
  const PT0 = { 0: { v: 1, f: 5 }, 1: { v: 0 }, 2: { v: 1, f: 3 }, 3: { v: 1, f: 7 }, 4: { v: 0, disco: true }, 5: { v: 1, f: 0 }, 6: { v: 1, f: 1 }, 7: { v: 0 } };
  const RAM0 = ['pág. 5', 'pág. 6', 'outro proc.', 'pág. 2', 'outro proc.', 'pág. 0', 'livre', 'pág. 3'];
  const T0 = [{ vpn: 6, f: 1 }, { vpn: 0, f: 5 }], T1 = [{ vpn: 2, f: 3 }, { vpn: 0, f: 5 }], T2 = [{ vpn: 2, f: 3 }, { vpn: 4, f: 6 }];
  /* estado de cada passo */
  const E = [
    { va: null, tlb: T0 },
    { va: '2A3C', tlb: T0 },
    { va: '2A3C', tlb: T0, tlbMiss: true },
    { va: '2A3C', tlb: T0, tlbMiss: true, pt: 'ok', walk: true },
    { va: '2A3C', tlb: T1, tlbNova: 0, pt: 'ok', walk: true, pa: true },
    { va: '2F00', tlb: T1, tlbHit: 0, pa: true },
    { va: '4010', tlb: T1, tlbMiss: true },
    { va: '4010', tlb: T1, tlbMiss: true, pt: 'bad', walk: true, falta: true },
    { va: '4010', tlb: T2, tlbNova: 1, pt: 'ok', walk: true, pa: true, carregou: true },
  ];
  const notes = [
    'Páginas de <b>4 KiB</b>: o offset tem 12 bits (3 dígitos hexa). Endereços virtuais de 16 bits: o primeiro dígito hexa é a <b>página virtual</b> (VPN). A TLB tem 2 entradas; a tabela de páginas, uma linha por página virtual, fica na RAM.',
    'O programa pede <code>0x2A3C</code>. Corte: VPN = <b>2</b>, offset = <b>A3C</b>. Só a VPN será traduzida.',
    'Procura a VPN 2 na TLB: as entradas guardam 6 e 0. <b class="bad">TLB miss</b>.',
    'Lê a linha 2 da tabela de páginas, <b>na memória</b> (um acesso a mais): V = 1, moldura <b>3</b>.',
    'Guarda 2 → 3 na TLB (sai a entrada mais antiga, a da VPN 6). Endereço físico = moldura 3 + offset A3C = <code>0x3A3C</code>. O offset passou sem mudar.',
    'Agora <code>0x2F00</code>: VPN 2 de novo. Está na TLB: <b class="ok">TLB hit</b>, sem ler a tabela. Endereço físico <code>0x3F00</code>. Localidade: mesma página, outro byte.',
    'Agora <code>0x4010</code>: VPN 4, offset 010. A TLB guarda 2 e 0: <b class="bad">TLB miss</b>.',
    'Linha 4 da tabela: <b>V = 0</b>. A página não está na RAM, está no SSD: <b class="bad">page fault</b>. O processador interrompe o programa e chama o sistema operacional.',
    'O sistema operacional traz a página do SSD para a moldura livre 6, atualiza a tabela e a TLB e repete o acesso: <code>0x4010</code> vira o endereço físico <code>0x6010</code>. Custos típicos: TLB hit, menos de 1 ciclo; TLB miss, dezenas de ciclos; page fault, milhões de ciclos.',
  ];
  const caps = ['endereço virtual = VPN (4 bits) | offset (12 bits)', '0x2A3C → VPN 2 | offset A3C', 'TLB: 6 ≠ 2, 0 ≠ 2 → miss',
    'tabela[2] = (V = 1, moldura 3)', 'físico = 3 | A3C = 0x3A3C', '0x2F00 → TLB[2] = 3 → 0x3F00', '0x4010 → VPN 4 | offset 010 → TLB miss',
    'tabela[4]: V = 0 → page fault', 'tabela[4] = (V = 1, moldura 6) → 0x6010'];

  new StepFig(root, { notes, speed: 2600, render(k) {
    const e = E[k];
    svg.innerHTML = '';
    const id = marcas(svg);
    const vpn = e.va ? parseInt(e.va[0], 16) : null, off = e.va ? e.va.slice(1) : null;
    const PT = JSON.parse(JSON.stringify(PT0)); const RAM = RAM0.slice();
    if (e.carregou) { PT[4] = { v: 1, f: 6 }; RAM[6] = 'pág. 4'; }
    const fr = vpn != null && PT[vpn].v ? PT[vpn].f : null;
    /* endereço virtual */
    tx(svg, 20, 14, 'endereço virtual', { a: 'start', m: 1 });
    caixa(svg, 20, 26, 56, 44, e.va ? 'bl' : 'mut'); tx(svg, 48, 42, e.va ? e.va[0] : 'VPN', { w: 600, m: !e.va });
    caixa(svg, 76, 26, 120, 44, e.va ? 'k' : 'mut'); tx(svg, 136, 42, e.va ? off : 'offset', { m: !e.va });
    tx(svg, 48, 60, '4 bits', { m: 1, size: 10 }); tx(svg, 136, 60, '12 bits', { m: 1, size: 10 });
    if (e.va) tx(svg, 196, 88, '0x' + e.va, { a: 'end', w: 600 });
    /* TLB */
    const tX = 250;
    tx(svg, tX + 80, 12, 'TLB', { w: 600 });
    tx(svg, tX + 40, 30, 'VPN', { m: 1 }); tx(svg, tX + 120, 30, 'moldura', { m: 1 });
    e.tlb.forEach((t, i) => {
      let cor = 'k';
      if (e.tlbMiss) cor = 'bad';
      if (e.tlbHit === i) cor = 'ok';
      if (e.tlbNova === i) cor = 'hl';
      caixa(svg, tX, 40 + i * 30, 160, 26, cor);
      tx(svg, tX + 40, 53 + i * 30, String(t.vpn)); tx(svg, tX + 120, 53 + i * 30, String(t.f));
    });
    /* tabela de páginas */
    tx(svg, tX + 80, 128, 'tabela de páginas', { w: 600 });
    tx(svg, tX + 26, 146, 'VPN', { m: 1 }); tx(svg, tX + 78, 146, 'V', { m: 1 }); tx(svg, tX + 130, 146, 'moldura', { m: 1 });
    const rowY = (i) => 156 + i * 23;
    for (let i = 0; i < 8; i++) {
      const l = PT[i]; let cor = 'k';
      if (e.pt && i === vpn) cor = e.pt;
      caixa(svg, tX, rowY(i), 160, 20, cor, 4);
      tx(svg, tX + 26, rowY(i) + 10, String(i), { size: 12 });
      tx(svg, tX + 78, rowY(i) + 10, String(l.v), { size: 12, m: !l.v });
      tx(svg, tX + 130, rowY(i) + 10, l.v ? String(l.f) : l.disco ? 'no SSD' : '—', { size: 12, m: !l.v });
    }
    /* endereço físico */
    const pX = 460;
    tx(svg, pX, 14, 'endereço físico', { a: 'start', m: 1 });
    const temPa = e.pa && fr != null;
    caixa(svg, pX, 26, 56, 40, temPa ? 'ok' : 'mut'); tx(svg, pX + 28, 46, temPa ? String(fr) : 'moldura', { w: 600, m: !temPa, size: temPa ? 14 : 11 });
    caixa(svg, pX + 56, 26, 120, 40, temPa ? 'k' : 'mut'); tx(svg, pX + 116, 46, temPa ? off : 'offset', { m: !temPa });
    if (temPa) tx(svg, pX + 176, 88, '0x' + fr.toString(16).toUpperCase() + off, { a: 'end', w: 600, fill: 'var(--green)' });
    /* RAM */
    tx(svg, pX + 88, 128, 'RAM (molduras)', { w: 600 });
    for (let i = 0; i < 8; i++) {
      const alvo = temPa && i === fr;
      caixa(svg, pX + 20, rowY(i), 136, 20, alvo ? 'ok' : RAM[i] === 'livre' ? 'mut' : 'k', 4);
      tx(svg, pX + 34, rowY(i) + 10, String(i), { size: 12, m: 1 });
      tx(svg, pX + 96, rowY(i) + 10, RAM[i], { size: 12, m: !alvo });
    }
    /* SSD e sistema operacional */
    caixa(svg, 20, 308, 170, 34, e.falta ? 'bad' : e.carregou ? 'hl' : 'mut');
    tx(svg, 105, 325, 'SSD: página 4', { m: !(e.falta || e.carregou) });
    if (e.falta || e.carregou) { caixa(svg, 20, 266, 170, 34, 'hl'); tx(svg, 105, 283, 'sistema operacional', { w: 600 }); }
    /* setas */
    if (e.va && k >= 2) seta(svg, id, `M196 46 L${tX - 4} ${e.tlbHit != null ? 53 : 62}`, e.tlbHit != null ? 'g' : e.tlbMiss && !e.walk ? 'r' : '');
    if (e.walk) seta(svg, id, `M48 72 C48 ${rowY(vpn) + 10} 180 ${rowY(vpn) + 10} ${tX - 4} ${rowY(vpn) + 10}`, e.pt === 'bad' ? 'r' : 'a');
    if (temPa && e.tlbHit != null) seta(svg, id, `M${tX + 162} 53 L${pX - 4} 46`, 'g');
    if (temPa && e.walk) seta(svg, id, `M${tX + 162} ${rowY(vpn) + 10} C${tX + 190} ${rowY(vpn) + 10} ${tX + 180} 56 ${pX - 4} 56`, 'a');
    if (temPa) seta(svg, id, `M${pX + 28} 68 C${pX + 6} 110 ${pX + 6} ${rowY(fr) + 10} ${pX + 18} ${rowY(fr) + 10}`, 'g');
    if (e.falta) seta(svg, id, `M${tX - 2} ${rowY(4) + 12} C215 ${rowY(4) + 30} 215 325 ${194} 325`, 'r');
    if (e.carregou) seta(svg, id, `M190 334 C330 352 ${pX - 10} 352 ${pX + 18} ${rowY(6) + 14}`, 'a');
    cap.textContent = caps[k];
  } });
})();

import { S, H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';
import { drawMachine } from '../../../../lib/machine.js';

/* Figuras da aula 03. Cores dos diagramas por estilo inline com os tokens do global.css
   (as classes k/bl/am… do CLAUDE.md valem só dentro dos desenhos de margem). */
const COR = {
  k: 'fill:var(--surface);stroke:var(--line2)',
  bl: 'fill:var(--blue-soft);stroke:var(--blue)',
  am: 'fill:var(--amber-soft);stroke:var(--amber)',
  gr: 'fill:var(--green-soft);stroke:var(--green)',
  rd: 'fill:var(--red-soft);stroke:var(--red)',
  ac: 'fill:var(--accent-soft);stroke:var(--accent)',
};
const TX = 'font-family:var(--f-mono);font-size:12px;fill:var(--fg);text-anchor:middle;dominant-baseline:central';
const txt = (p, x, y, s, extra = '') => S('text', { x, y, style: TX + (extra ? ';' + extra : '') }, p, s);
const caixa = (p, x, y, w, h, cor, extra = '') => S('rect', { x, y, width: w, height: h, rx: 5, style: COR[cor] + ';stroke-width:1.3' + (extra ? ';' + extra : '') }, p);
const marcadores = (svg) => {
  const id = 'a' + Math.random().toString(36).slice(2, 7);
  const defs = S('defs', null, svg);
  const mk = (nome, cor) => { const m = S('marker', { id: id + nome, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs); S('path', { d: 'M0,0 L10,5 L0,10 z', style: `fill:var(--${cor})` }, m); };
  mk('ok', 'green'); mk('bad', 'red'); mk('neu', 'muted');
  return (k) => `url(#${id}${k})`;
};

/* ============ Fig 1: aceleração ideal × real ============ */
(function () {
  const $ = (id) => document.getElementById(id);
  const k = $('ac-k'), o = $('ac-o'), s = $('ac-s'), svg = $('ac-svg'), out = $('ac-out'), ver = $('ac-ver');
  if (!svg) return;
  const L = 1000, KMAX = 16;
  /* barras do ciclo (topo) */
  const escala = 0.44; /* px por ps */
  txt(svg, 4, 16, 'sem pipeline: 1 ciclo', 'text-anchor:start;fill:var(--muted)');
  caixa(svg, 170, 6, L * escala, 20, 'bl');
  txt(svg, 170 + L * escala / 2, 16, '1000 ps de lógica');
  txt(svg, 4, 46, 'com pipeline: 1 ciclo', 'text-anchor:start;fill:var(--muted)');
  const bLog = caixa(svg, 170, 36, 10, 20, 'bl'), bOv = caixa(svg, 170, 36, 10, 20, 'rd');
  const tCiclo = txt(svg, 180, 46, '', 'text-anchor:start');
  /* gráfico */
  const gx = 60, gy = 74, gw = 560, gh = 150, X = (kk) => gx + ((kk - 1) / (KMAX - 1)) * gw, Y = (v) => gy + gh - (v / KMAX) * gh;
  S('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, class: 'sv-edge' }, svg);
  S('line', { x1: gx, y1: gy, x2: gx, y2: gy + gh, class: 'sv-edge' }, svg);
  for (let kk = 2; kk <= KMAX; kk += 2) S('text', { x: X(kk), y: gy + gh + 14, class: 'sv-muted', 'text-anchor': 'middle' }, svg, kk);
  for (let v = 0; v <= KMAX; v += 4) S('text', { x: gx - 8, y: Y(v) + 4, class: 'sv-muted', 'text-anchor': 'end' }, svg, v + '×');
  S('text', { x: gx + gw, y: gy + gh + 30, class: 'sv-muted', 'text-anchor': 'end' }, svg, 'número de stages k');
  S('line', { x1: X(1), y1: Y(1), x2: X(KMAX), y2: Y(KMAX), style: 'stroke:var(--muted);stroke-width:1.5;stroke-dasharray:5 4' }, svg);
  S('text', { x: X(KMAX) - 4, y: Y(KMAX) - 8, class: 'sv-muted', 'text-anchor': 'end' }, svg, 'ideal = k');
  const curva = S('path', { style: 'fill:none;stroke:var(--accent);stroke-width:2.5' }, svg);
  const ponto = S('circle', { r: 6, style: 'fill:var(--accent);stroke:var(--bg);stroke-width:2' }, svg);
  const pIdeal = S('circle', { r: 4, style: 'fill:var(--muted)' }, svg);
  const rot = S('text', { class: 'sv-text', style: 'font-size:13px;font-weight:600;fill:var(--accent)' }, svg, '');
  const acel = (kk, ov, st) => L / ((L / kk + ov) * (1 + st));
  const f = (x, d = 2) => x.toFixed(d).replace('.', ',');
  function upd() {
    const K = +k.value, O = +o.value, ST = +s.value;
    $('ac-kv').textContent = K; $('ac-ov').textContent = O + ' ps'; $('ac-sv').textContent = f(ST);
    const ciclo = L / K + O, cpi = 1 + ST, porInstr = ciclo * cpi, A = L / porInstr, lat = K * ciclo;
    bLog.setAttribute('width', (L / K) * escala); bOv.setAttribute('x', 170 + (L / K) * escala); bOv.setAttribute('width', Math.max(0.01, O * escala));
    tCiclo.setAttribute('x', 176 + ciclo * escala); tCiclo.textContent = `${f(L / K, 0)} + ${O} = ${f(ciclo, 0)} ps`;
    let d = ''; for (let kk = 1; kk <= KMAX; kk++) d += (kk === 1 ? 'M' : 'L') + X(kk) + ' ' + Y(Math.min(KMAX, acel(kk, O, ST)));
    curva.setAttribute('d', d);
    ponto.setAttribute('cx', X(K)); ponto.setAttribute('cy', Y(A));
    pIdeal.setAttribute('cx', X(K)); pIdeal.setAttribute('cy', Y(K));
    rot.setAttribute('x', X(K) + (K > 12 ? -10 : 10)); rot.setAttribute('y', Y(A) + 18); rot.setAttribute('text-anchor', K > 12 ? 'end' : 'start');
    rot.textContent = f(A) + '×';
    const rows = [
      ['ciclo sem pipeline', '1000 ps (a instrução inteira num ciclo)'],
      ['ciclo com pipeline', `1000 / ${K} + ${O} = ${f(ciclo, 1)} ps`],
      ['CPI com pipeline', `1 + ${f(ST)} = ${f(cpi)}`],
      ['tempo médio por instrução', `${f(ciclo, 1)} × ${f(cpi)} = ${f(porInstr, 1)} ps`],
      ['speedup', `1000 / ${f(porInstr, 1)} = ${f(A)}×   (ideal: ${K}×)`],
      ['latência de uma instrução', `${K} × ${f(ciclo, 1)} = ${f(lat, 0)} ps   (sem pipeline: 1000 ps)`],
    ];
    out.innerHTML = rows.map((r) => `<span>${r[0]}</span><span>${r[1]}</span>`).join('');
    const pct = Math.round((A / K) * 100);
    ver.className = 'verdict ' + (pct >= 75 ? 'ok' : 'bad');
    ver.innerHTML = `Com ${K} stages, o pipeline chega a <b>${f(A)}×</b> dos ${K}× possíveis (${pct}% do ideal). ` +
      (O > 0 && K >= 10 ? 'O overhead já é uma fatia grande do ciclo: mais stages rendem pouco.' : ST > 0 ? 'Cada stall por instrução divide o ganho por (1 + stalls).' : 'Sem stalls, só o overhead separa o real do ideal.');
  }
  [k, o, s].forEach((e) => e.addEventListener('input', upd));
  upd();
})();

/* ============ Fig 2: diagrama de pipeline com hazard RAW ============ */
(function () {
  const root = document.getElementById('fig-pipe');
  if (!root) return;
  const svg = root.querySelector('svg.pipe'), tabs = root.querySelector('.fig-tabs'), cap = root.querySelector('.stage-cap');
  const CORES = { IF: 'bl', ID: 'k', EX: 'am', MEM: 'ac', WB: 'gr' };
  const RAWI = ['DADD R1, R2, R3', 'DSUB R4, R1, R5', 'AND  R6, R1, R7', 'OR   R8, R1, R9', 'XOR  R10, R1, R11'];
  const base5 = ['IF ID EX MEM WB', '- IF ID EX MEM WB', '- - IF ID EX MEM WB', '- - - IF ID EX MEM WB', '- - - - IF ID EX MEM WB'];
  /* cada linha: '-' = vazio, '*X' = parada no stage X. Setas: [linha, ciclo] → [linha, ciclo] (ciclos a partir de 1) */
  const CASOS = {
    ideal: {
      label: 'Ideal', instr: ['LD   R1, 0(R2)', 'DADD R3, R4, R5', 'DSUB R6, R7, R8', 'AND  R9, R10, R11', 'OR   R12, R13, R14'], rows: base5, setas: [],
      notas: [
        [0, 'Cinco instruções <b>sem dependência</b> entre si. Cada linha é uma instrução; cada coluna, um ciclo de clock.'],
        [1, 'Ciclo 1: a 1ª instrução entra em IF. O resto do pipeline está vazio.'],
        [2, 'Ciclo 2: a 1ª passa para ID e a 2ª entra em IF. Duas em andamento.'],
        [3, 'Ciclo 3: três em andamento. A cada ciclo entra uma nova.'],
        [4, 'Ciclo 4: quatro em andamento.'],
        [5, 'Ciclo 5: o pipeline está <b>cheio</b>, uma instrução em cada stage. A 1ª termina (WB).'],
        [6, 'Ciclo 6: a 2ª termina. Com o pipeline cheio, sai uma instrução por ciclo: CPI = 1.'],
        [7, 'Ciclo 7: o pipeline começa a esvaziar.'],
        [8, 'Ciclo 8: faltam duas.'],
        [9, 'Ciclo 9: a última termina. 5 instruções em 9 ciclos; n instruções levam n + 4. Sem pipeline seriam 5 × 5 = 25.'],
      ],
    },
    semtrat: {
      label: 'Sem tratamento', instr: RAWI, rows: base5,
      setas: [{ de: [0, 5], para: [1, 3], tipo: 'bad', ap: 5 }, { de: [0, 5], para: [2, 4], tipo: 'bad', ap: 5 }, { de: [0, 5], para: [3, 5], tipo: 'ok', ap: 5 }],
      notas: [
        [0, 'O DADD escreve R1 só no WB (ciclo 5). As quatro de baixo leem R1 em ID. Vamos ver o que cada uma lê.'],
        [1, 'Ciclo 1: DADD em IF.'],
        [2, 'Ciclo 2: DADD em ID, lendo R2 e R3. DSUB entra em IF.'],
        [3, 'Ciclo 3: DADD calcula R2 + R3 em EX. No mesmo ciclo, o DSUB lê R1 em ID e pega o valor <b>antigo</b>: o novo ainda não foi escrito.'],
        [4, 'Ciclo 4: o AND lê R1 em ID. Também o valor antigo.'],
        [5, 'Ciclo 5: o DADD escreve R1 na primeira metade do ciclo; o OR lê na segunda metade e pega o valor certo. As setas vermelhas apontam <b>para trás no tempo</b>: o dado seria necessário antes de existir.'],
        [6, 'Ciclo 6: o XOR lê R1 depois da escrita: certo.'],
        [7, 'Ciclo 7.'],
        [8, 'Ciclo 8.'],
        [9, 'Resultado: DSUB e AND calcularam com o R1 velho. Isso é um hazard <b>RAW</b> sem tratamento: o programa dá resposta errada.'],
      ],
    },
    stall: {
      label: 'Stall', instr: RAWI,
      rows: ['IF ID EX MEM WB', '- IF ID *ID *ID EX MEM WB', '- - IF *IF *IF ID EX MEM WB', '- - - - - IF ID EX MEM WB', '- - - - - - IF ID EX MEM WB'],
      setas: [{ de: [0, 5], para: [1, 5], tipo: 'ok', ap: 5 }],
      notas: [
        [0, 'Mesmo código, agora com <b>interlock</b>: o hardware detecta a dependência e segura a instrução até o dado estar no banco de registradores.'],
        [1, 'Ciclo 1: DADD em IF.'],
        [2, 'Ciclo 2: DADD em ID, DSUB em IF.'],
        [3, 'Ciclo 3: o DSUB chega em ID e precisa de R1, que o DADD (em EX) ainda não escreveu. O interlock detecta o RAW.'],
        [4, 'Ciclo 4: <b>stall</b>. O DSUB fica parado em ID e o AND, atrás dele, parado em IF. No EX entra uma bubble: um ciclo sem trabalho útil.'],
        [5, 'Ciclo 5: segundo stall. O DADD escreve R1 na primeira metade do ciclo e o DSUB lê na segunda. Dependência resolvida.'],
        [6, 'Ciclo 6: tudo volta a andar. O AND passa para ID e lê R1 já atualizado; o OR finalmente entra em IF.'],
        [7, 'Ciclo 7.'], [8, 'Ciclo 8.'], [9, 'Ciclo 9.'], [10, 'Ciclo 10.'],
        [11, 'Correto, mas 2 ciclos de stall: 5 instruções em 11 ciclos, em vez de 9.'],
      ],
    },
    fwd: {
      label: 'Forwarding', instr: RAWI, rows: base5,
      setas: [{ de: [0, 3], para: [1, 4], tipo: 'ok', ap: 4, fwd: true }, { de: [0, 4], para: [2, 5], tipo: 'ok', ap: 5, fwd: true }, { de: [0, 5], para: [3, 5], tipo: 'ok', ap: 5 }],
      notas: [
        [0, 'Mesmo código, com <b>forwarding</b>: fios que levam um resultado da saída de um stage direto para a ULA de quem precisa.'],
        [1, 'Ciclo 1: DADD em IF.'],
        [2, 'Ciclo 2: DADD em ID, DSUB em IF.'],
        [3, 'Ciclo 3: o DADD calcula R1 em EX. O valor já existe: fica no registrador de pipeline EX/MEM. O DSUB lê um R1 velho em ID, mas não vai usá-lo.'],
        [4, 'Ciclo 4: o forwarding leva o valor de <b>EX/MEM</b> para a entrada da ULA do DSUB. Ele calcula com o R1 certo, sem esperar.'],
        [5, 'Ciclo 5: o AND recebe R1 de <b>MEM/WB</b>, também por forwarding. O OR lê do banco de registradores (escrita na 1ª metade, leitura na 2ª).'],
        [6, 'Ciclo 6: o XOR lê R1 normalmente.'],
        [7, 'Ciclo 7.'], [8, 'Ciclo 8.'],
        [9, 'Nenhum stall: 9 ciclos, como no caso ideal. As setas verdes andam <b>para a frente</b> no tempo (ou ficam no mesmo ciclo), por isso funcionam.'],
      ],
    },
    load: {
      label: 'Load-use', instr: ['LD   R1, 0(R2)', 'DSUB R4, R1, R5', 'AND  R6, R1, R7', 'OR   R8, R1, R9'],
      rows: ['IF ID EX MEM WB', '- IF ID *ID EX MEM WB', '- - IF *IF ID EX MEM WB', '- - - - IF ID EX MEM WB'],
      setas: [{ de: [0, 4], para: [1, 5], tipo: 'ok', ap: 5, fwd: true }, { de: [0, 5], para: [2, 5], tipo: 'ok', ap: 5 }],
      notas: [
        [0, 'Agora quem produz R1 é um <b>load</b>. O dado só sai da memória no fim do stage MEM, um stage depois do EX.'],
        [1, 'Ciclo 1: LD em IF.'],
        [2, 'Ciclo 2: LD em ID, DSUB em IF.'],
        [3, 'Ciclo 3: o LD calcula o endereço (R2 + 0) em EX. O DSUB, em ID, vê que precisa de R1.'],
        [4, 'Ciclo 4: o LD lê a memória. Para o DSUB executar agora, precisaria do dado no começo deste ciclo, e ele só existe no fim. Forwarding não volta no tempo: o interlock segura o DSUB <b>1 ciclo</b>.'],
        [5, 'Ciclo 5: o dado lido está em MEM/WB e vai por forwarding para o EX do DSUB. O AND lê R1 do banco de registradores.'],
        [6, 'Ciclo 6.'], [7, 'Ciclo 7.'], [8, 'Ciclo 8.'],
        [9, 'Custo: 1 stall por load seguido de uso, mesmo com forwarding. O compilador tenta pôr uma instrução independente entre os dois.'],
      ],
    },
  };
  const parse = (r) => r.split(' ').map((c) => (c === '-' ? null : c[0] === '*' ? { s: c.slice(1), stall: true } : { s: c, stall: false }));
  let fig = null;
  function load(key) {
    const C = CASOS[key];
    tabs.querySelectorAll('.btn').forEach((b) => b.classList.toggle('sel', b.dataset.k === key));
    const rows = C.rows.map(parse), nC = Math.max(...rows.map((r) => r.length));
    const x0 = 176, cw = Math.min(52, (692 - x0) / nC), rh = 38, y0 = 30, W = x0 + nC * cw + 8, Hh = y0 + rows.length * rh + 8;
    svg.innerHTML = ''; svg.setAttribute('viewBox', `0 0 ${Math.max(W, 560)} ${Hh}`);
    const seta = marcadores(svg);
    const col = S('rect', { x: x0, y: 4, width: cw, height: Hh - 8, rx: 6, style: 'fill:var(--accent-soft);opacity:.55' }, svg);
    const heads = [];
    for (let c = 0; c < nC; c++) heads.push(S('text', { x: x0 + c * cw + cw / 2, y: 16, class: 'sv-muted', 'text-anchor': 'middle' }, svg, c + 1));
    const cel = [];
    rows.forEach((r, i) => {
      txt(svg, 4, y0 + i * rh + rh / 2 - 2, C.instr[i], 'text-anchor:start;font-size:12.5px');
      cel.push(r.map((c, j) => {
        if (!c) return null;
        const g = S('g', { class: 'anim' }, svg);
        caixa(g, x0 + j * cw + 2, y0 + i * rh + 3, cw - 4, rh - 12, c.stall ? 'rd' : CORES[c.s], c.stall ? 'stroke-dasharray:4 3' : '');
        txt(g, x0 + j * cw + cw / 2, y0 + i * rh + rh / 2 - 3, c.s, c.stall ? 'fill:var(--red);font-size:11px' : 'font-size:11.5px');
        g.dataset.c = j + 1; return g;
      }));
    });
    const setas = C.setas.map((a) => {
      const [ri, ci] = a.de, [rj, cj] = a.para;
      const mesmo = ci === cj;
      const x1 = x0 + (ci - 1) * cw + (mesmo ? cw / 2 : a.fwd ? cw - 4 : cw / 2), y1 = y0 + ri * rh + rh - 9;
      const x2 = x0 + (cj - 1) * cw + (mesmo ? cw / 2 : a.fwd ? 6 : cw / 2), y2 = y0 + rj * rh + 3;
      const cor = a.tipo === 'bad' ? 'red' : 'green';
      return S('path', { d: `M${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2 - 2}`, class: 'anim', style: `fill:none;stroke:var(--${cor});stroke-width:2.2`, 'marker-end': seta(a.tipo) }, svg);
    });
    const notes = C.notas.map((n) => n[1]);
    const render = (k) => {
      const shown = C.notas[k][0];
      cel.forEach((r) => r.forEach((g) => g && g.classList.toggle('hide', +g.dataset.c > shown)));
      heads.forEach((h, c) => (h.style.fontWeight = c + 1 === shown ? '700' : '400'));
      col.style.display = shown > 0 && shown <= nC && k < notes.length - 1 ? '' : 'none';
      col.setAttribute('x', x0 + (shown - 1) * cw);
      setas.forEach((s, i) => s.classList.toggle('hide', shown < C.setas[i].ap));
      const fim = k === notes.length - 1;
      const total = nC, stalls = rows.flat().filter((c) => c && c.stall && c.s === 'ID').length;
      cap.textContent = shown === 0 ? `${C.instr.length} instruções` : fim ? `${C.instr.length} instruções em ${total} ciclos` + (stalls ? ` · ${stalls} ciclo(s) de stall` : '') : `ciclo ${shown}`;
    };
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1700 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  Object.entries(CASOS).forEach(([key, C]) => { const b = H('button', { class: 'btn sm' }, C.label); b.dataset.k = key; b.addEventListener('click', () => { load(key); fig.play(); }); tabs.appendChild(b); });
  load('ideal');
})();

/* ============ Fig 3: preditor de 2 bits ============ */
(function () {
  const root = document.getElementById('fig-pred');
  if (!root) return;
  const svg = root.querySelector('svg.diag'), tabs = root.querySelector('.fig-tabs'), tape = root.querySelector('.tape'), trail = root.querySelector('.trail'), cap = root.querySelector('.stage-cap');
  const M2 = {
    states: [{ id: '3', label: '11', x: 90, y: 100 }, { id: '2', label: '10', x: 250, y: 100 }, { id: '1', label: '01', x: 410, y: 100 }, { id: '0', label: '00', x: 570, y: 100 }],
    edges: [
      { from: '3', to: '3', labels: [{ text: 'T', k: 0 }] }, { from: '3', to: '2', labels: [{ text: 'N', k: 0 }], bend: -34 }, { from: '2', to: '3', labels: [{ text: 'T', k: 0 }], bend: -34 },
      { from: '2', to: '1', labels: [{ text: 'N', k: 0 }], bend: -34 }, { from: '1', to: '2', labels: [{ text: 'T', k: 0 }], bend: -34 },
      { from: '1', to: '0', labels: [{ text: 'N', k: 0 }], bend: -34 }, { from: '0', to: '1', labels: [{ text: 'T', k: 0 }], bend: -34 }, { from: '0', to: '0', labels: [{ text: 'N', k: 0 }] },
    ],
    notas: { 3: 'prevê T (forte)', 2: 'prevê T (fraco)', 1: 'prevê N (fraco)', 0: 'prevê N (forte)' },
    prev: (q) => (+q >= 2 ? 'T' : 'N'),
    prox: (q, o) => String(o === 'T' ? Math.min(3, +q + 1) : Math.max(0, +q - 1)),
    nome: (q) => ({ 3: '11', 2: '10', 1: '01', 0: '00' }[q]),
  };
  const M1 = {
    states: [{ id: 'T', label: 'T', x: 220, y: 100 }, { id: 'N', label: 'N', x: 420, y: 100 }],
    edges: [{ from: 'T', to: 'T', labels: [{ text: 'T', k: 0 }] }, { from: 'T', to: 'N', labels: [{ text: 'N', k: 0 }], bend: -34 }, { from: 'N', to: 'T', labels: [{ text: 'T', k: 0 }], bend: -34 }, { from: 'N', to: 'N', labels: [{ text: 'N', k: 0 }] }],
    notas: { T: 'prevê T', N: 'prevê N' },
    prev: (q) => q, prox: (q, o) => o, nome: (q) => q,
  };
  const CASOS = {
    laco2: { label: 'Laço · 2 bits', M: M2, seq: 'TTTNTTTNTTTN', ini: '3', intro: 'Branch do fim de um laço que volta 3 vezes e sai (T T T N), executado 3 vezes. O preditor de 2 bits começa em <b>11</b> (forte tomado).' },
    laco1: { label: 'Laço · 1 bit', M: M1, seq: 'TTTNTTTNTTTN', ini: 'T', intro: 'O mesmo branch com um preditor de <b>1 bit</b>, que só lembra o último resultado. Começa em T.' },
    alt2: { label: 'Alternado · 2 bits', M: M2, seq: 'TNTNTNTNTNTN', ini: '2', intro: 'Um branch que alterna T, N, T, N. O preditor de 2 bits começa em <b>10</b>. Veja o que acontece.' },
  };
  let fig = null;
  function load(key) {
    const C = CASOS[key], M = C.M;
    tabs.querySelectorAll('.btn').forEach((b) => b.classList.toggle('sel', b.dataset.k === key));
    const D = drawMachine(svg, { states: M.states.map((s) => ({ ...s, start: s.id === C.ini })), edges: M.edges });
    M.states.forEach((s) => S('text', { x: s.x, y: 178, class: 'sv-muted', 'text-anchor': 'middle' }, svg, M.notas[s.id]));
    /* simula */
    const passos = []; let q = C.ini, erros = 0;
    for (const o of C.seq) { const p = M.prev(q), nq = M.prox(q, o), ok = p === o; if (!ok) erros++; passos.push({ q, p, o, nq, ok }); q = nq; }
    const cells = [...C.seq].map((c) => H('span', { class: 'cell' }, c));
    tape.innerHTML = ''; tape.append(...cells);
    const notes = [C.intro];
    passos.forEach((s, i) => {
      notes.push(`Branch ${i + 1}: no estado <b>${M.nome(s.q)}</b> a previsão é <b>${s.p}</b>; o branch foi <b>${s.o}</b>. ` +
        (s.ok ? '<b class="ok">Acertou.</b> ' : '<b class="bad">Errou.</b> ') + (s.q === s.nq ? `Fica em ${M.nome(s.nq)}.` : `Vai para ${M.nome(s.nq)}.`) +
        (key === 'laco2' && i === 4 ? ' Depois do erro da saída, ele ainda prevê T, e a nova volta do laço é T: <b>não erra de novo</b>.' : '') +
        (key === 'laco1' && i === 4 ? ' O bit tinha virado N na saída do laço: erra a primeira volta da execução seguinte.' : ''));
    });
    const tx = Math.round(((C.seq.length - erros) / C.seq.length) * 100);
    const fim = {
      laco2: `<b>${erros} erros em ${C.seq.length}</b> (acerto de ${tx}%): um erro por execução do laço, só na saída.`,
      laco1: `<b>${erros} erros em ${C.seq.length}</b> (acerto de ${tx}%): dois erros por execução do laço (na saída e na volta seguinte), menos na primeira.`,
      alt2: `<b>${erros} erros em ${C.seq.length}</b> (acerto de ${tx}%). Um contador não captura o padrão alternado. Um <b>preditor correlacionado</b>, que olha o resultado anterior, acertaria quase tudo.`,
    }[key];
    notes.push(fim);
    const render = (k) => {
      Object.values(D.states).forEach((g) => g.classList.remove('on', 'acc', 'rej'));
      Object.values(D.edges).forEach((g) => g.classList.remove('on'));
      const n = Math.min(k, passos.length);
      const atual = k === 0 ? C.ini : passos[n - 1].nq;
      if (k > 0 && k <= passos.length) {
        const s = passos[k - 1]; const e = D.edges[s.q + '>' + s.nq]; if (e) e.classList.add('on');
        D.states[atual].classList.add(s.ok ? 'acc' : 'rej');
      } else D.states[atual].classList.add('on');
      cells.forEach((c, i) => { c.className = 'cell' + (i < n - (k <= passos.length && k > 0 ? 1 : 0) ? ' done' : '') + (k > 0 && k <= passos.length && i === k - 1 ? ' head' : ''); });
      trail.innerHTML = passos.slice(0, n).map((s) => `<span class="q" style="border-color:var(--${s.ok ? 'green' : 'red'});color:var(--${s.ok ? 'green' : 'red'})">${s.p} ${s.ok ? '✓' : '✗'}</span>`).join('') || '<span class="muted">nenhuma ainda</span>';
      const errs = passos.slice(0, n).filter((s) => !s.ok).length;
      cap.textContent = `${n} branches · ${errs} erros` + (n ? ` · acerto ${Math.round(((n - errs) / n) * 100)}%` : '');
    };
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1500 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  Object.entries(CASOS).forEach(([key, C]) => { const b = H('button', { class: 'btn sm' }, C.label); b.dataset.k = key; b.addEventListener('click', () => { load(key); fig.play(); }); tabs.appendChild(b); });
  load('laco2');
})();

/* ============ Fig 4: escalonando e desenrolando o laço ============ */
(function () {
  const root = document.getElementById('fig-unroll');
  if (!root) return;
  const svg = root.querySelector('svg.lst'), tabs = root.querySelector('.fig-tabs'), cap = root.querySelector('.stage-cap');
  const ST = null; /* linha de stall: sem instrução */
  const CASOS = {
    orig: {
      label: 'Original', elem: 1,
      linhas: [
        ['L.D    F0, 0(R1)', 'carrega x[i]', 'Ciclo 1: carrega x[i] em F0.'],
        [ST, 'ADD.D espera o load (1 ciclo)', 'Ciclo 2: <b>stall</b>. O ADD.D precisa de F0, e load → operação de ponto flutuante pede 1 ciclo de espera.'],
        ['ADD.D  F4, F0, F2', 'soma s', 'Ciclo 3: soma s (que está em F2).'],
        [ST, 'S.D espera o ADD.D (2 ciclos)', 'Ciclo 4: <b>stall</b>. Operação de ponto flutuante → store pede 2 ciclos.'],
        [ST, '', 'Ciclo 5: segundo stall.'],
        ['S.D    F4, 0(R1)', 'guarda x[i]', 'Ciclo 6: guarda o resultado.'],
        ['DADDUI R1, R1, #-8', 'anda 8 bytes', 'Ciclo 7: R1 aponta para o elemento anterior.'],
        [ST, 'BNE espera o DADDUI (1 ciclo)', 'Ciclo 8: <b>stall</b>. O BNE compara o novo R1.'],
        ['BNE    R1, R2, Loop', 'volta se R1 ≠ R2', 'Ciclo 9: volta para o começo.'],
      ],
      fim: '<b>9 ciclos por elemento</b>. Só 3 instruções fazem o trabalho; 4 ciclos são stall e 2 são controle do laço.',
    },
    esc: {
      label: 'Escalonado', elem: 1,
      linhas: [
        ['L.D    F0, 0(R1)', 'carrega x[i]', 'Ciclo 1: carrega x[i].'],
        ['DADDUI R1, R1, #-8', 'subiu para o lugar do stall', 'Ciclo 2: o compilador subiu o DADDUI para o ciclo que seria stall. Ele não depende do L.D.'],
        ['ADD.D  F4, F0, F2', 'soma s', 'Ciclo 3: a soma. F0 já chegou.'],
        [ST, 'S.D espera o ADD.D', 'Ciclo 4: <b>stall</b>. Não há mais nada independente para pôr aqui.'],
        [ST, '', 'Ciclo 5: stall.'],
        ['S.D    F4, 8(R1)', 'deslocamento 8: R1 já mudou', 'Ciclo 6: guarda x[i]. O deslocamento virou <b>8</b>, porque R1 já foi decrementado no ciclo 2.'],
        ['BNE    R1, R2, Loop', 'sem stall: DADDUI foi cedo', 'Ciclo 7: o BNE não espera mais, o DADDUI foi há tempo.'],
      ],
      fim: '<b>7 ciclos por elemento</b>. Melhorou, mas ainda há 2 stalls: o corpo do laço é curto demais para esconder a espera do ADD.D.',
    },
    unr: {
      label: 'Desenrolado ×4', elem: 4,
      linhas: [
        ['L.D    F0, 0(R1)', 'elemento 1', 'Ciclo 1: carrega o 1º elemento em F0.'],
        ['L.D    F6, -8(R1)', 'elemento 2', 'Ciclo 2: o 2º, em <b>F6</b>. Cada cópia usa registradores próprios: é a renomeação feita pelo compilador.'],
        ['L.D    F10, -16(R1)', 'elemento 3', 'Ciclo 3: o 3º, em F10.'],
        ['L.D    F14, -24(R1)', 'elemento 4', 'Ciclo 4: o 4º, em F14.'],
        ['ADD.D  F4, F0, F2', '', 'Ciclo 5: a 1ª soma. O load de F0 terminou há 3 ciclos: nenhuma espera.'],
        ['ADD.D  F8, F6, F2', '', 'Ciclo 6: 2ª soma.'],
        ['ADD.D  F12, F10, F2', '', 'Ciclo 7: 3ª soma.'],
        ['ADD.D  F16, F14, F2', '', 'Ciclo 8: 4ª soma.'],
        ['S.D    F4, 0(R1)', '', 'Ciclo 9: guarda o 1º. O ADD.D dele foi no ciclo 5, a espera de 2 ciclos já passou.'],
        ['S.D    F8, -8(R1)', '', 'Ciclo 10: guarda o 2º.'],
        ['DADDUI R1, R1, #-32', 'uma vez para 4 elementos', 'Ciclo 11: R1 anda 4 elementos (32 bytes) de uma vez. Antes eram 4 DADDUI.'],
        ['S.D    F12, 16(R1)', '−16 + 32 = 16', 'Ciclo 12: guarda o 3º. Deslocamento corrigido para 16, porque R1 já andou 32.'],
        ['S.D    F16, 8(R1)', '−24 + 32 = 8', 'Ciclo 13: guarda o 4º.'],
        ['BNE    R1, R2, Loop', 'um branch para 4 elementos', 'Ciclo 14: um único branch para os 4 elementos.'],
      ],
      fim: '<b>14 ciclos para 4 elementos = 3,5 por elemento</b>, sem nenhum stall. Speedup de 9 / 3,5 ≈ 2,6 em relação ao original, com o mesmo hardware.',
    },
  };
  let fig = null;
  function load(key) {
    const C = CASOS[key];
    tabs.querySelectorAll('.btn').forEach((b) => b.classList.toggle('sel', b.dataset.k === key));
    const rh = 24, y0 = 26, Hh = y0 + C.linhas.length * rh + 6;
    svg.innerHTML = ''; svg.setAttribute('viewBox', `0 0 640 ${Hh}`);
    S('text', { x: 28, y: 14, class: 'sv-muted', 'text-anchor': 'middle' }, svg, 'ciclo');
    S('text', { x: 64, y: 14, class: 'sv-muted' }, svg, 'instrução');
    S('text', { x: 330, y: 14, class: 'sv-muted' }, svg, 'comentário');
    const gs = C.linhas.map(([ins, com], i) => {
      const g = S('g', { class: 'anim' }, svg), y = y0 + i * rh;
      caixa(g, 4, y + 1, 632, rh - 3, ins ? 'k' : 'rd', ins ? 'stroke:none;fill:' + (i % 2 ? 'var(--surface2)' : 'var(--surface)') : 'stroke-dasharray:4 3');
      txt(g, 28, y + rh / 2 - 1, String(i + 1), 'fill:var(--muted)');
      txt(g, 64, y + rh / 2 - 1, ins || 'stall', 'text-anchor:start;' + (ins ? '' : 'fill:var(--red);font-weight:600'));
      txt(g, 330, y + rh / 2 - 1, com, 'text-anchor:start;fill:var(--muted);font-size:11.5px');
      return g;
    });
    const notes = ['Laço <code>x[i] = x[i] + s</code> na versão <b>' + C.label.toLowerCase() + '</b>. Cada linha é um ciclo de clock.', ...C.linhas.map((l) => l[2]), C.fim];
    const render = (k) => {
      gs.forEach((g, i) => { g.classList.toggle('hide', i >= k); g.style.opacity = k > 0 && k <= gs.length && i < k - 1 ? '.6' : ''; });
      const n = Math.min(k, gs.length);
      cap.textContent = k === 0 ? `${C.elem} elemento(s) por volta` : `${n} ciclo(s) · ${C.linhas.slice(0, n).filter((l) => !l[0]).length} stall(s)` +
        (k > gs.length ? ` · ${gs.length} / ${C.elem} = ${(gs.length / C.elem).toFixed(2).replace('.', ',').replace(/,00$/, '')} ciclos por elemento` : '');
    };
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1300 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  Object.entries(CASOS).forEach(([key, C]) => { const b = H('button', { class: 'btn sm' }, C.label); b.dataset.k = key; b.addEventListener('click', () => { load(key); fig.play(); }); tabs.appendChild(b); });
  load('orig');
})();

/* ============ Fig 5: Tomasulo simplificado ============ */
(function () {
  const root = document.getElementById('fig-toma');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const PROG = [
    { txt: 'L.D F6, 32(R2)', d: 'F6', a: '32+R2' },
    { txt: 'L.D F2, 44(R3)', d: 'F2', a: '44+R3' },
    { txt: 'MUL.D F0, F2, F4', op: 'MUL', d: 'F0', j: 'F2', k: 'F4' },
    { txt: 'SUB.D F8, F2, F6', op: 'SUB', d: 'F8', j: 'F2', k: 'F6' },
    { txt: 'DIV.D F10, F0, F6', op: 'DIV', d: 'F10', j: 'F0', k: 'F6' },
    { txt: 'ADD.D F6, F8, F2', op: 'ADD', d: 'F6', j: 'F8', k: 'F2' },
  ];
  const RS = ['Load1', 'Load2', 'Add1', 'Add2', 'Add3', 'Mult1', 'Mult2'];
  const REGS = ['F0', 'F2', 'F4', 'F6', 'F8', 'F10'];
  const EV = [
    { n: 'Seis instruções de ponto flutuante (exemplo do livro). Nada foi emitido: os registradores têm os valores antigos e nenhum Qi.' },
    { issue: 0, rs: 'Load1', n: 'Emite <code>L.D F6, 32(R2)</code> no buffer <b>Load1</b>. O Qi de F6 vira Load1: quem precisar de F6 agora espera essa etiqueta, em vez de ler o registrador.' },
    { issue: 1, rs: 'Load2', n: 'Emite o segundo load em <b>Load2</b>. F2 passa a esperar Load2.' },
    { issue: 2, rs: 'Mult1', n: 'Emite <code>MUL.D F0, F2, F4</code> em <b>Mult1</b>. F4 está pronto: o valor é copiado para Vk. F2 não: Qj guarda a etiqueta Load2. F0 passa a esperar Mult1.' },
    { issue: 3, rs: 'Add1', n: 'Emite <code>SUB.D F8, F2, F6</code> em <b>Add1</b>. Os dois operandos estão pendentes: Qj = Load2 e Qk = Load1.' },
    { issue: 4, rs: 'Mult2', n: 'Emite <code>DIV.D F10, F0, F6</code> em <b>Mult2</b>. Espera Mult1 (F0) e Load1 (F6).' },
    { issue: 5, rs: 'Add2', n: 'Emite <code>ADD.D F6, F8, F2</code> em <b>Add2</b>. O Qi de F6 troca de Load1 para Add2. O DIV, que precisa do F6 antigo, já guardou a etiqueta Load1: a antidependência (WAR) entre DIV e ADD sumiu. Isso é a <b>renomeação</b>.' },
    { write: 'Load1', val: 'A', n: 'Load1 termina e põe no <b>CDB</b> o valor lido (chamado aqui de A). Add1 e Mult2, que esperavam Load1, copiam A. O registrador F6 <b>não</b> recebe A: o Qi dele aponta para Add2, e esse valor já é velho para F6 (sem WAW).' },
    { write: 'Load2', val: 'B', n: 'Load2 termina com o valor B. Mult1, Add1 e Add2 copiam B, e F2 é atualizado (o Qi dele era Load2).' },
    { exec: ['Mult1', 'Add1'], n: 'Mult1 e Add1 têm os dois operandos e começam a executar ao mesmo tempo, em unidades diferentes. No livro, a multiplicação leva 10 ciclos; a subtração, 2.' },
    { write: 'Add1', val: 'B−A', n: 'A subtração termina e transmite B−A. Add2 copia o valor e F8 é atualizado.' },
    { exec: ['Add2'], n: 'Add2 (o ADD.D, sexta instrução) executa enquanto o MUL.D, terceira, ainda está calculando.' },
    { write: 'Add2', val: '(B−A)+B', n: 'O ADD.D escreve F6 <b>antes</b> do MUL.D e do DIV.D terminarem: execução fora de ordem. O DIV continua com o A guardado em Vk, então o resultado dele não muda.' },
    { write: 'Mult1', val: 'B·R[F4]', n: 'A multiplicação termina: o valor vai pelo CDB para Mult2 (o DIV) e para F0.' },
    { exec: ['Mult2'], n: 'Mult2 tem os dois operandos e executa a divisão (40 ciclos no livro).' },
    { write: 'Mult2', val: 'B·R[F4]/A', n: 'A divisão termina e escreve F10. Ordem de término: L.D, L.D, SUB.D, ADD.D, MUL.D, DIV.D. Emitidas em ordem, terminadas fora de ordem, e o resultado é o mesmo da execução em ordem.' },
  ];
  function estado(k) {
    const ins = PROG.map(() => ({ rs: '', e: false, x: false, w: false }));
    const rs = Object.fromEntries(RS.map((r) => [r, null]));
    const reg = Object.fromEntries(REGS.map((r) => [r, { q: '', v: `R[${r}]` }]));
    let cdb = '';
    for (let i = 1; i <= k; i++) {
      const e = EV[i]; cdb = '';
      if (e.issue != null) {
        const p = PROG[e.issue], r = { op: p.op || 'LD', vj: '', vk: '', qj: '', qk: '', a: p.a || '', i: e.issue };
        if (p.j) { if (reg[p.j].q) r.qj = reg[p.j].q; else r.vj = reg[p.j].v; }
        if (p.k) { if (reg[p.k].q) r.qk = reg[p.k].q; else r.vk = reg[p.k].v; }
        rs[e.rs] = r; reg[p.d].q = e.rs; ins[e.issue].rs = e.rs; ins[e.issue].e = true;
      }
      if (e.exec) e.exec.forEach((t) => { ins[rs[t].i].x = true; });
      if (e.write) {
        const t = e.write, quem = [];
        ins[rs[t].i].x = true; ins[rs[t].i].w = true;
        for (const [nome, r] of Object.entries(rs)) {
          if (!r) continue;
          if (r.qj === t) { r.vj = e.val; r.qj = ''; quem.push(nome); }
          if (r.qk === t) { r.vk = e.val; r.qk = ''; if (!quem.includes(nome)) quem.push(nome); }
        }
        for (const [nome, g] of Object.entries(reg)) if (g.q === t) { g.v = e.val; g.q = ''; quem.push(nome); }
        rs[t] = null;
        cdb = `CDB: ${t} → ${e.val}   ·   recebem: ${quem.join(', ') || 'ninguém'}`;
      }
    }
    return { ins, rs, reg, cdb };
  }
  const td = (v, mudou, extra = '') => `<td style="font-family:var(--f-mono);font-size:.8rem;padding:5px 8px;${mudou ? 'background:var(--amber-soft);' : ''}${extra}">${esc(v)}</td>`;
  const th = (v) => `<th style="padding:5px 8px;font-size:.75rem">${v}</th>`;
  function render(k) {
    const E = estado(k), P = k > 0 ? estado(k - 1) : E;
    const ok = (b) => (b ? '✓' : '');
    $('tm-ins').innerHTML = '<table><thead><tr>' + ['Instrução', 'Estação', 'Emitida', 'Executa', 'Escreve'].map(th).join('') + '</tr></thead><tbody>' +
      PROG.map((p, i) => { const a = E.ins[i], b = P.ins[i]; const ex = a.x && !a.w ? '…' : ok(a.x); const exb = b.x && !b.w ? '…' : ok(b.x);
        return '<tr>' + td(p.txt, false) + td(a.rs, a.rs !== b.rs) + td(ok(a.e), a.e !== b.e) + td(ex, ex !== exb) + td(ok(a.w), a.w !== b.w) + '</tr>'; }).join('') + '</tbody></table>';
    $('tm-rs').innerHTML = '<table><thead><tr>' + ['Nome', 'Ocup.', 'Op', 'Vj', 'Vk', 'Qj', 'Qk', 'A'].map(th).join('') + '</tr></thead><tbody>' +
      RS.map((n) => { const a = E.rs[n], b = P.rs[n]; const f = (r, c) => (r ? r[c] : ''); const bus = !!a;
        const cell = (c) => td(f(a, c), f(a, c) !== f(b, c), c[0] === 'q' && f(a, c) ? 'color:var(--red)' : '');
        return `<tr style="${bus ? '' : 'opacity:.55'}">` + td(n, false, 'font-weight:600') + td(bus ? 'sim' : 'não', bus !== !!b) + cell('op') + cell('vj') + cell('vk') + cell('qj') + cell('qk') + cell('a') + '</tr>'; }).join('') + '</tbody></table>';
    $('tm-reg').innerHTML = '<table><thead><tr>' + th('') + REGS.map(th).join('') + '</tr></thead><tbody>' +
      '<tr>' + td('Qi', false, 'font-weight:600') + REGS.map((r) => td(E.reg[r].q, E.reg[r].q !== P.reg[r].q, 'color:var(--red)')).join('') + '</tr>' +
      '<tr>' + td('valor', false, 'font-weight:600') + REGS.map((r) => td(E.reg[r].v, E.reg[r].v !== P.reg[r].v)).join('') + '</tr></tbody></table>';
    $('tm-cdb').textContent = E.cdb || 'CDB: livre';
    $('tm-cdb').style.borderColor = E.cdb ? 'var(--accent)' : '';
  }
  new StepFig(root, { notes: EV.map((e) => e.n), render, speed: 2600 });
})();

/* ============ Fig 6: ROB, commit em ordem e exceção precisa ============ */
(function () {
  const root = document.getElementById('fig-rob');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const INS = [
    { txt: 'LD R1, 0(R2)', d: 'R1' },
    { txt: 'DADD R3, R1, R4', d: 'R3' },
    { txt: 'DDIV R5, R6, R7', d: 'R5' },
    { txt: 'DSUB R8, R9, R10', d: 'R8' },
    { txt: 'SD R8, 0(R11)', d: 'Mem[R11]' },
  ];
  const VIS = ['R1', 'R3', 'R5', 'R8', 'Mem[R11]'];
  /* cada passo: estado de cada entrada [estado, valor], cabeça, valores visíveis, nota */
  const A = 'antigo';
  const P = [
    { e: [], h: 0, v: [A, A, A, A, A], n: 'O ROB começa vazio. Entradas entram pelo fim, na ordem do programa, e saem pela <b>cabeça</b>, na mesma ordem. R7 vale 0: a divisão vai dar problema.' },
    { e: [['executando', ''], ['emitida', 'espera ROB1'], ['executando', '']], h: 0, v: [A, A, A, A, A], n: 'Emite as instruções 1 a 3, cada uma numa entrada do ROB. O LD teve um miss na cache e vai demorar. O DADD precisa de R1: espera a etiqueta ROB1.' },
    { e: [['executando', ''], ['emitida', 'espera ROB1'], ['executando', ''], ['executando', ''], ['emitida', 'espera ROB4']], h: 0, v: [A, A, A, A, A], n: 'Emite a 4 e a 5. O SD precisa do R8 calculado pela 4: espera ROB4.' },
    { e: [['executando', ''], ['emitida', 'espera ROB1'], ['executando', ''], ['pronta', 'R9−R10'], ['emitida', 'espera ROB4']], h: 0, v: [A, A, A, A, A], n: 'O DSUB (4) termina primeiro. O valor vai para a <b>entrada 4 do ROB</b>, não para R8: R8 continua com o valor antigo.' },
    { e: [['executando', ''], ['emitida', 'espera ROB1'], ['executando', ''], ['pronta', 'R9−R10'], ['pronta', 'R9−R10 → Mem']], h: 0, v: [A, A, A, A, A], n: 'O SD (5) tem endereço e dado prontos. Mesmo assim, <b>não escreve na memória</b>: store só grava no commit.' },
    { e: [['executando', ''], ['emitida', 'espera ROB1'], ['exceção', 'divisão por zero'], ['pronta', 'R9−R10'], ['pronta', 'R9−R10 → Mem']], h: 0, v: [A, A, A, A, A], n: 'O DDIV (3) detecta divisão por zero. Nada acontece ainda: a exceção fica <b>anotada</b> na entrada 3. Se houvesse um branch mal previsto antes dela, ela nem deveria existir.' },
    { e: [['pronta', 'Mem[R2]'], ['executando', ''], ['exceção', 'divisão por zero'], ['pronta', 'R9−R10'], ['pronta', 'R9−R10 → Mem']], h: 0, v: [A, A, A, A, A], n: 'O miss na cache acabou: o LD (1) termina, e o valor vai pelo CDB para o ROB e para o DADD, que começa a executar.' },
    { e: [['efetivada', 'Mem[R2]'], ['executando', ''], ['exceção', 'divisão por zero'], ['pronta', 'R9−R10'], ['pronta', 'R9−R10 → Mem']], h: 1, v: ['Mem[R2]', A, A, A, A], n: 'A cabeça (entrada 1) está pronta: <b>commit</b>. R1 recebe o valor no banco de registradores e a cabeça avança para a 2.' },
    { e: [['efetivada', 'Mem[R2]'], ['efetivada', 'R1+R4'], ['exceção', 'divisão por zero'], ['pronta', 'R9−R10'], ['pronta', 'R9−R10 → Mem']], h: 2, v: ['Mem[R2]', 'R1+R4', A, A, A], n: 'O DADD (2) termina e, como está na cabeça, faz commit em seguida: R3 é gravado. A cabeça chega à 3.' },
    { e: [['efetivada', 'Mem[R2]'], ['efetivada', 'R1+R4'], ['descartada', 'exceção!'], ['descartada', ''], ['descartada', '']], h: 2, v: ['Mem[R2]', 'R1+R4', A, A, A], n: 'A cabeça é a 3, que tem exceção. Agora sim ela é tratada: o processador <b>descarta a 3 e tudo depois dela</b> (4 e 5), guarda o endereço da 3 e chama o tratador de exceção do sistema operacional.' },
    { e: [['efetivada', 'Mem[R2]'], ['efetivada', 'R1+R4'], ['descartada', 'exceção!'], ['descartada', ''], ['descartada', '']], h: 2, v: ['Mem[R2]', 'R1+R4', A, A, A], n: '<b>Exceção precisa</b>: tudo antes da 3 foi gravado (R1, R3); nada da 3 em diante mudou (R5, R8 e a memória estão com os valores antigos), mesmo a 4 e a 5 tendo terminado antes. Um branch mal previsto é desfeito do mesmo jeito.' },
  ];
  const COR_EST = { emitida: 'var(--muted)', executando: 'var(--amber)', pronta: 'var(--green)', 'exceção': 'var(--red)', efetivada: 'var(--accent)', descartada: 'var(--muted)' };
  const tdc = (v, extra = '') => `<td style="font-family:var(--f-mono);font-size:.8rem;padding:5px 8px;${extra}">${esc(v)}</td>`;
  const th = (v) => `<th style="padding:5px 8px;font-size:.75rem">${v}</th>`;
  function render(k) {
    const s = P[k], prev = P[Math.max(0, k - 1)];
    $('rb-rob').innerHTML = '<table><thead><tr>' + ['', '#', 'Instrução', 'Estado', 'Destino', 'Valor'].map(th).join('') + '</tr></thead><tbody>' +
      INS.map((ins, i) => {
        const e = s.e[i], ep = prev.e[i];
        if (!e) return `<tr style="opacity:.35">${tdc('')}${tdc(String(i + 1))}${tdc('')}${tdc('livre')}${tdc('')}${tdc('')}</tr>`;
        const mud = k > 0 && (!ep || ep[0] !== e[0] || ep[1] !== e[1]);
        const desc = e[0] === 'descartada';
        const cab = i === s.h && !desc && k > 0 ? '▶ cabeça' : '';
        return `<tr style="${desc ? 'opacity:.5;text-decoration:line-through' : ''}">` + tdc(cab, 'color:var(--accent);font-weight:600;white-space:nowrap') + tdc(String(i + 1)) + tdc(ins.txt) +
          tdc(e[0], `color:${COR_EST[e[0]]};font-weight:600;${mud ? 'background:var(--amber-soft)' : ''}`) + tdc(ins.d) + tdc(e[1], mud ? 'background:var(--amber-soft)' : '') + '</tr>';
      }).join('') + '</tbody></table>';
    $('rb-reg').innerHTML = '<table><thead><tr>' + VIS.map(th).join('') + '</tr></thead><tbody><tr>' +
      VIS.map((r, i) => tdc(s.v[i], s.v[i] !== prev.v[i] ? 'background:var(--green-soft);font-weight:600' : s.v[i] === A ? 'color:var(--muted)' : '')).join('') + '</tr></tbody></table>';
    const efet = s.e.filter((e) => e && e[0] === 'efetivada').length, prontas = s.e.filter((e) => e && (e[0] === 'pronta' || e[0] === 'exceção')).length;
    $('rb-cap').textContent = k === P.length - 1 ? 'estado preciso: efetivadas 1 e 2 · descartadas 3, 4 e 5' : `${efet} efetivada(s) · ${prontas} terminada(s) esperando a vez de sair`;
  }
  new StepFig(root, { notes: P.map((p) => p.n), render, speed: 2600 });
})();

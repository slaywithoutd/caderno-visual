import { S, H } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figura com abas: cada aba devolve { notes, render } e reaproveita a mesma StepFig. */
function comAbas(root, abas, speed) {
  const tabs = root.querySelector('.fig-tabs');
  let fig = null, atual = 0;
  function carregar(i, tocar) {
    atual = i;
    const { notes, render } = abas[i].montar();
    tabs.querySelectorAll('.btn').forEach((b, j) => b.classList.toggle('sel', j === i));
    if (!fig) fig = new StepFig(root, { notes, render, speed });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); if (tocar) fig.play(); }
  }
  abas.forEach((a, i) => {
    const b = H('button', { class: 'btn sm' }, a.nome);
    b.addEventListener('click', () => carregar(i, true));
    tabs.appendChild(b);
  });
  carregar(0, false);
  return { recarregar: (tocar) => carregar(atual, tocar) };
}

/* setas coloridas para os desenhos das figuras */
function marcadores(svg) {
  const defs = S('defs', null, svg);
  const cores = { n: 'var(--muted)', r: 'var(--red)', a: 'var(--amber)', g: 'var(--green)', b: 'var(--blue)' };
  const pre = 'm' + Math.random().toString(36).slice(2, 7);
  for (const [k, c] of Object.entries(cores)) {
    const m = S('marker', { id: pre + k, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
    S('path', { d: 'M0,0 L10,5 L0,10 z', style: `fill:${c}` }, m);
  }
  return (k) => `url(#${pre}${k})`;
}
const COR = { A: 'var(--blue)', B: 'var(--amber)' };
const SUAVE = { A: 'var(--blue-soft)', B: 'var(--amber-soft)' };

/* ============ Fig 1: condição de corrida ============ */
(function () {
  const root = document.getElementById('fig-corrida');
  const svg = document.getElementById('corrida-svg'), cap = document.getElementById('corrida-cap');
  const ARIT = ['LOAD R1, saldo', 'ADD R1, R1, 1', 'STORE saldo, R1'];
  const MUT = ['P(mutex)', ...ARIT, 'V(mutex)'];
  const CEN = {
    sorte: {
      ins: ARIT, ops: ['A0', 'A1', 'A2', 'B0', 'B1', 'B2'],
      notes: [
        'Saldo começa em <b>100</b>. As duas threads vão executar <code>saldo = saldo + 1</code>, que vira três instruções de máquina. Cada thread tem o próprio registrador R1.',
        'A faz <b>LOAD</b>: copia 100 da memória para o R1 dela.',
        'A faz <b>ADD</b>: o R1 de A vira 101. A memória ainda tem 100.',
        'A faz <b>STORE</b>: grava 101 na memória.',
        'Só agora o escalonador troca para B. B faz <b>LOAD</b> e lê 101, o valor já atualizado.',
        'B soma: R1 de B = 102.',
        'B grava 102.',
        '<b class="ok">Deu certo</b>, mas por sorte: o escalonador não trocou de thread no meio. Nada no código garante isso.'
      ]
    },
    azar: {
      ins: ARIT, ops: ['A0', 'B0', 'A1', 'B1', 'A2', 'B2'],
      notes: [
        'Mesmo código, mesmo saldo inicial de <b>100</b>. Agora o escalonador troca de thread entre as instruções.',
        'A faz <b>LOAD</b>: R1 de A = 100.',
        'Troca! B faz <b>LOAD</b> antes de A gravar: R1 de B = 100 também. As duas já têm uma cópia velha.',
        'A soma: R1 de A = 101.',
        'B soma: R1 de B = 101.',
        'A grava 101.',
        'B grava 101 por cima. O depósito de A <b>sumiu</b>: é a <b>atualização perdida</b>.',
        '<b class="bad">Errado: saldo = 101</b>, esperado 102. É uma <b>condição de corrida</b>: o resultado depende de quando o escalonador trocou de thread.'
      ]
    },
    mutex: {
      ins: MUT, ops: ['A0', 'A1', 'A2', 'B0', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'],
      notes: [
        'Agora cada thread cerca as três instruções com <code>P(mutex)</code> e <code>V(mutex)</code>. O mutex começa livre. A região crítica são as três instruções do meio.',
        'A faz <b>P(mutex)</b>: estava livre, A pega e entra.',
        'A faz LOAD: R1 de A = 100.',
        'A soma: R1 de A = 101.',
        'Troca! B faz <b>P(mutex)</b>, mas o mutex está com A: <b>B bloqueia</b> e sai da CPU. Ela não chega no LOAD.',
        'A volta e grava 101.',
        'A faz <b>V(mutex)</b>: solta a trava e acorda B, que estava esperando. B fica com o mutex.',
        'B faz LOAD e lê 101, o valor certo.',
        'B soma: 102.',
        'B grava 102.',
        'B faz V(mutex) e solta a trava.',
        '<b class="ok">Certo: saldo = 102</b>, qualquer que seja a ordem do escalonador. A troca no meio ainda acontece, mas B não entra na região crítica até A sair.'
      ]
    }
  };
  const W = 200, X = { A: 24, B: 416 }, Y0 = 62;
  function montar(key) {
    const C = CEN[key];
    const n = C.ins.length, temMutex = key === 'mutex', DY = n > 3 ? 28 : 32;
    /* estados depois de cada operação */
    const est = [{ r: { A: null, B: null }, mem: 100, dono: null, bloq: { A: false, B: false }, pc: { A: 0, B: 0 } }];
    C.ops.forEach((op) => {
      const e = JSON.parse(JSON.stringify(est[est.length - 1]));
      const th = op[0], i = +op.slice(1), ins = C.ins[i];
      if (ins.startsWith('LOAD')) e.r[th] = e.mem;
      else if (ins.startsWith('ADD')) e.r[th] += 1;
      else if (ins.startsWith('STORE')) e.mem = e.r[th];
      else if (ins.startsWith('P(')) { if (e.dono === null) e.dono = th; else e.bloq[th] = true; }
      else if (ins.startsWith('V(')) { e.dono = null; const o = th === 'A' ? 'B' : 'A'; if (e.bloq[o]) { e.bloq[o] = false; e.dono = o; } }
      e.pc[th] = i + 1; e.op = { th, i, ins };
      est.push(e);
    });
    svg.innerHTML = '';
    const seta2 = marcadores(svg);
    const rows = { A: [], B: [] }, regs = {};
    for (const th of ['A', 'B']) {
      S('text', { x: X[th] + W / 2, y: 26, class: 'sv-text', 'text-anchor': 'middle', style: `fill:${COR[th]};font-weight:600` }, svg, 'Thread ' + th);
      C.ins.forEach((ins, i) => {
        const g = S('g', null, svg);
        const r = S('rect', { x: X[th], y: Y0 + i * DY - 13, width: W, height: 26, rx: 6, style: 'fill:var(--surface);stroke:var(--line2)' }, g);
        S('text', { x: X[th] + 12, y: Y0 + i * DY + 1, class: 'sv-text', 'dominant-baseline': 'central', style: 'font-size:13px' }, g, ins);
        rows[th].push({ g, r });
      });
      regs[th] = S('text', { x: X[th] + W / 2, y: Y0 + n * DY + 6, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, svg, '');
    }
    S('rect', { x: 255, y: 40, width: 130, height: 70, rx: 10, style: 'fill:var(--surface2);stroke:var(--line2)' }, svg);
    S('text', { x: 320, y: 58, class: 'sv-muted', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, svg, 'memória');
    const memT = S('text', { x: 320, y: 86, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central', style: 'font-size:18px;font-weight:600' }, svg, '');
    let lockR = null, lockT = null;
    if (temMutex) {
      lockR = S('rect', { x: 265, y: 128, width: 110, height: 40, rx: 8 }, svg);
      lockT = S('text', { x: 320, y: 148, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central', style: 'font-size:12.5px' }, svg, '');
    }
    const fio = S('path', { style: 'fill:none;stroke-width:2.2', 'marker-end': seta2('a') }, svg);
    S('text', { x: 20, y: 236, class: 'sv-muted' }, svg, 'ordem real de execução');
    const gT = S('g', null, svg);
    const notes = C.notes;
    const render = (k) => {
      const nOps = C.ops.length, kk = Math.min(k, nOps), e = est[kk];
      for (const th of ['A', 'B']) {
        rows[th].forEach(({ g, r }, i) => {
          const cur = e.op && kk === k && e.op.th === th && e.op.i === i && k <= nOps;
          const feito = i < e.pc[th];
          const bloq = e.bloq[th] && i === e.pc[th] - 1 + 0 && C.ins[i].startsWith('P(');
          let st = 'fill:var(--surface);stroke:var(--line2)';
          if (bloq) st = 'fill:var(--red-soft);stroke:var(--red);stroke-width:2';
          else if (cur) st = `fill:${SUAVE[th]};stroke:${COR[th]};stroke-width:2.2`;
          r.setAttribute('style', st);
          g.style.opacity = feito && !cur && !bloq ? 0.45 : 1;
        });
        const v = e.r[th];
        regs[th].textContent = `R1 de ${th} = ${v === null ? '?' : v}` + (e.bloq[th] ? '   (bloqueada)' : '');
      }
      memT.textContent = `saldo = ${e.mem}`;
      memT.style.fill = k > nOps ? (e.mem === 102 ? 'var(--green)' : 'var(--red)') : '';
      if (lockR) {
        lockR.setAttribute('style', e.dono ? `fill:${SUAVE[e.dono]};stroke:${COR[e.dono]};stroke-width:1.8` : 'fill:var(--green-soft);stroke:var(--green)');
        lockT.textContent = e.dono ? `mutex com ${e.dono}` : 'mutex livre';
      }
      /* seta entre memória e registrador no LOAD / STORE */
      fio.style.display = 'none';
      if (e.op && k <= nOps) {
        const th = e.op.th, ins = e.op.ins, ry = Y0 + n * DY + 6;
        const xr = th === 'A' ? X.A + W - 4 : X.B + 4, xm = th === 'A' ? 255 : 385;
        if (ins.startsWith('LOAD')) { fio.setAttribute('d', `M${xm},90 Q${(xm + xr) / 2},${ry} ${xr},${ry - 6}`); fio.style.display = ''; fio.style.stroke = COR[th]; fio.setAttribute('marker-end', seta2(th === 'A' ? 'b' : 'a')); }
        if (ins.startsWith('STORE')) { fio.setAttribute('d', `M${xr},${ry - 6} Q${(xm + xr) / 2},${ry} ${xm},92`); fio.style.display = ''; fio.style.stroke = COR[th]; fio.setAttribute('marker-end', seta2(th === 'A' ? 'b' : 'a')); }
      }
      /* linha do tempo */
      gT.innerHTML = '';
      const wC = Math.min(60, 600 / nOps);
      C.ops.slice(0, kk).forEach((op, j) => {
        const th = op[0], ins = C.ins[+op.slice(1)], x = 20 + j * (wC + 2);
        const bl = est[j + 1].bloq[th] && ins.startsWith('P(');
        S('rect', { x, y: 248, width: wC, height: 32, rx: 6, style: bl ? 'fill:var(--red-soft);stroke:var(--red)' : `fill:${SUAVE[th]};stroke:${COR[th]}` }, gT);
        S('text', { x: x + wC / 2, y: 258, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sv-text', style: 'font-size:11px;font-weight:600' }, gT, th);
        S('text', { x: x + wC / 2, y: 271, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sv-muted', style: 'font-size:10px' }, gT, ins.split(/[ (]/)[0]);
      });
      cap.innerHTML = k > nOps
        ? (e.mem === 102 ? 'saldo final = 102 ✓' : 'saldo final = 101 ✗  (esperado 102: um depósito perdido)')
        : `saldo na memória = ${e.mem}   ·   R1 de A = ${e.r.A ?? '?'}   ·   R1 de B = ${e.r.B ?? '?'}`;
    };
    return { notes, render };
  }
  comAbas(root, [
    { nome: 'Ordem com sorte', montar: () => montar('sorte') },
    { nome: 'Troca no meio', montar: () => montar('azar') },
    { nome: 'Com mutex', montar: () => montar('mutex') }
  ], 1900);
})();

/* ============ Fig 2: semáforo com valor e fila ============ */
(function () {
  const root = document.getElementById('fig-sem');
  const svg = document.getElementById('sem-svg'), trail = document.getElementById('sem-trail');
  const CEN = {
    cont: {
      s0: 2, ths: ['T1', 'T2', 'T3', 'T4'], dentro: 'usando o recurso (2 vagas)',
      ev: [['P', 'T1'], ['P', 'T2'], ['P', 'T3'], ['P', 'T4'], ['V', 'T1'], ['V', 'T2'], ['V', 'T3'], ['V', 'T4']],
      intro: 'Semáforo <b>contador</b> com <code>s = 2</code>: o recurso tem 2 instâncias (duas impressoras, por exemplo). Quatro threads vão querer usar. Esta figura usa a versão em que s pode ficar negativo.'
    },
    mutex: {
      s0: 1, ths: ['T1', 'T2', 'T3'], dentro: 'região crítica (1 por vez)',
      ev: [['P', 'T1'], ['P', 'T2'], ['P', 'T3'], ['V', 'T1'], ['V', 'T2'], ['V', 'T3']],
      intro: 'Semáforo <b>binário</b> (mutex) com <code>s = 1</code>: só uma thread por vez na região crítica.'
    },
    ordem: {
      s0: 0, ths: ['A', 'B'], dentro: 'passou do P',
      ev: [['P', 'B'], ['X', 'A'], ['V', 'A'], ['Y', 'B']],
      intro: 'Semáforo para <b>ordem</b>, começando em <code>s = 0</code>. Queremos que B só faça o trabalho Y depois que A terminar o trabalho X.'
    }
  };
  function montar(key) {
    const C = CEN[key];
    const est = [{ s: C.s0, st: Object.fromEntries(C.ths.map((t) => [t, 'fora'])), fila: [], dentro: [], saiu: [], log: [] }];
    const notes = [C.intro];
    C.ev.forEach(([op, t]) => {
      const e = JSON.parse(JSON.stringify(est[est.length - 1]));
      const s1 = e.s;
      let nota = '';
      if (op === 'P') {
        e.s -= 1;
        if (e.s < 0) { e.st[t] = 'fila'; e.fila.push(t); nota = `<b>${t} faz P(s)</b>: s vai de ${s1} para ${e.s}. Ficou negativo, então ${t} <b>bloqueia</b> e entra na fila. |s| = ${-e.s} = quantos esperam.`; }
        else { e.st[t] = 'dentro'; e.dentro.push(t); nota = `<b>${t} faz P(s)</b>: s vai de ${s1} para ${e.s}. Como não ficou negativo, ${t} passa.`; }
        e.log.push(`P(${t}) → s = ${e.s}`);
      } else if (op === 'V') {
        e.s += 1;
        e.dentro = e.dentro.filter((x) => x !== t);
        if (key === 'ordem') e.st[t] = 'saiu'; else { e.st[t] = 'saiu'; e.saiu.push(t); }
        if (e.s <= 0) {
          const w = e.fila.shift(); e.st[w] = 'dentro'; e.dentro.push(w);
          nota = `<b>${t} faz V(s)</b>: s vai de ${s1} para ${e.s}. Como s ≤ 0, havia alguém esperando: <b>${w} acorda</b> e passa, sem fazer P de novo.`;
        } else nota = `<b>${t} faz V(s)</b>: s vai de ${s1} para ${e.s}. Ninguém na fila; o valor só aumenta.`;
        if (key === 'ordem') nota = `<b>A faz V(s)</b> depois de terminar X: s vai de ${s1} para ${e.s}. Como s ≤ 0, havia alguém esperando: <b>B acorda</b>.`;
        e.log.push(`V(${t}) → s = ${e.s}`);
      } else if (op === 'X') {
        e.st[t] = 'trab'; nota = 'Enquanto B dorme, A faz o trabalho <b>X</b>. B não gasta CPU esperando.'; e.log.push('A faz X');
      } else if (op === 'Y') {
        e.st[t] = 'trab'; nota = 'B faz o trabalho <b>Y</b>. Não importa quem o escalonador rodou primeiro: Y vem sempre depois de X.'; e.log.push('B faz Y');
      }
      est.push(e); notes.push(nota);
    });
    const fim = est[est.length - 1];
    notes.push(key === 'ordem'
      ? 'Se A tivesse rodado primeiro, o V deixaria s = 1 e o P de B passaria direto, sem esperar. Em qualquer ordem, Y depois de X.'
      : `Fim: todas passaram e devolveram. <code>s = ${fim.s}</code>, o valor inicial. Repare que nenhuma thread girou esperando: quem não podia passar dormia na fila.`);
    est.push(fim);

    svg.innerHTML = '';
    S('text', { x: 95, y: 22, class: 'sv-muted', 'text-anchor': 'middle' }, svg, key === 'ordem' ? 'threads' : 'querem entrar');
    S('rect', { x: 20, y: 32, width: 150, height: 130, rx: 10, style: 'fill:none;stroke:var(--line2);stroke-dasharray:4 4' }, svg);
    S('rect', { x: 245, y: 40, width: 150, height: 110, rx: 12, style: 'fill:var(--surface2);stroke:var(--line2)' }, svg);
    S('text', { x: 320, y: 60, class: 'sv-muted', 'text-anchor': 'middle' }, svg, 'semáforo');
    const sT = S('text', { x: 320, y: 102, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sv-text', style: 'font-size:34px;font-weight:600' }, svg, '');
    const sN = S('text', { x: 320, y: 136, class: 'sv-muted', 'text-anchor': 'middle' }, svg, '');
    S('text', { x: 545, y: 22, class: 'sv-muted', 'text-anchor': 'middle' }, svg, C.dentro);
    S('rect', { x: 470, y: 32, width: 150, height: 130, rx: 10, style: 'fill:var(--green-soft);stroke:var(--green)' }, svg);
    S('text', { x: 250, y: 196, class: 'sv-muted' }, svg, 'fila de s (bloqueadas, sem usar CPU)');
    S('rect', { x: 245, y: 206, width: 375, height: 56, rx: 10, style: 'fill:var(--red-soft);stroke:var(--red);stroke-dasharray:4 3' }, svg);
    S('text', { x: 20, y: 196, class: 'sv-muted' }, svg, key === 'ordem' ? '' : 'já devolveram');
    const nos = {};
    C.ths.forEach((t, i) => {
      const g = S('g', { class: 'anim' }, svg);
      const c = S('circle', { cx: 0, cy: 0, r: 18 }, g);
      S('text', { x: 0, y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sv-text', style: 'font-size:13px;font-weight:600' }, g, t);
      nos[t] = { g, c, i };
    });
    const pos = (e, t) => {
      const st = e.st[t], i = nos[t].i;
      if (st === 'fora') return [60 + (i % 2) * 70, 66 + Math.floor(i / 2) * 60];
      if (st === 'dentro' || (st === 'trab' && key === 'ordem' && t === 'B')) { const j = Math.max(0, e.dentro.indexOf(t)); return [510 + (j % 2) * 70, 70 + Math.floor(j / 2) * 56]; }
      if (st === 'trab') return [60 + (i % 2) * 70, 66];
      if (st === 'fila') return [285 + e.fila.indexOf(t) * 56, 234];
      if (st === 'saiu') { if (key === 'ordem') return [60 + (i % 2) * 70, 66]; return [40 + e.saiu.indexOf(t) * 40, 234]; }
      return [0, 0];
    };
    const render = (k) => {
      const e = est[k];
      sT.textContent = `s = ${e.s}`;
      sT.style.fill = e.s < 0 ? 'var(--red)' : e.s === 0 ? 'var(--amber)' : 'var(--green)';
      sN.textContent = e.s < 0 ? `${-e.s} na fila` : e.s === 0 ? 'sem vaga' : `${e.s} vaga${e.s > 1 ? 's' : ''}`;
      C.ths.forEach((t) => {
        const [x, y] = pos(e, t), st = e.st[t];
        nos[t].g.setAttribute('transform', `translate(${x},${y})`);
        const sty = st === 'fila' ? 'fill:var(--red-soft);stroke:var(--red)' : st === 'dentro' || st === 'trab' ? 'fill:var(--blue-soft);stroke:var(--blue)' : st === 'saiu' ? 'fill:var(--surface);stroke:var(--line2)' : 'fill:var(--surface);stroke:var(--muted)';
        nos[t].c.setAttribute('style', sty + ';stroke-width:1.8');
        nos[t].g.style.opacity = st === 'saiu' && key !== 'ordem' ? 0.5 : 1;
      });
      trail.innerHTML = e.log.length ? e.log.map((l, i) => `<span class="q${i === e.log.length - 1 ? ' rep' : ''}">${l}</span>`).join('<span class="ar">→</span>') : `<span class="q">s = ${C.s0}</span>`;
    };
    return { notes, render };
  }
  comAbas(root, [
    { nome: 'Contador (s = 2)', montar: () => montar('cont') },
    { nome: 'Mutex (s = 1)', montar: () => montar('mutex') },
    { nome: 'Ordem (s = 0)', montar: () => montar('ordem') }
  ], 2000);
})();

/* ============ Fig 3: produtor/consumidor ============ */
(function () {
  const root = document.getElementById('fig-pc');
  const svg = document.getElementById('pc-svg'), cap = document.getElementById('pc-cap');
  const nIn = document.getElementById('pc-n'), nOut = document.getElementById('pc-nv');
  const ROTEIROS = {
    prod: (N) => 'p'.repeat(N + 1) + 'ccc',
    cons: () => 'cpppcccp',
    alt: () => 'pcppcpcc'
  };
  const INTRO = {
    prod: (N) => `O <b>produtor é mais rápido</b>: ele tenta produzir ${N + 1} itens antes de o consumidor rodar. O buffer tem N = ${N} posições. Começa: <code>vazio = ${N}</code>, <code>cheio = 0</code>, <code>mutex = 1</code>.`,
    cons: (N) => `O <b>consumidor é mais rápido</b>: ele chega antes de haver qualquer item. Buffer com N = ${N}. Começa: <code>vazio = ${N}</code>, <code>cheio = 0</code>, <code>mutex = 1</code>.`,
    alt: (N) => `Os dois se <b>alternam</b> em ritmo irregular. Buffer com N = ${N}. Começa: <code>vazio = ${N}</code>, <code>cheio = 0</code>, <code>mutex = 1</code>.`
  };
  function simular(N, roteiro) {
    let e = { buf: Array(N).fill(null), entra: 0, sai: 0, vazio: N, cheio: 0, pB: false, cB: false, item: 0, mud: null, sem: null, quem: null, acao: '' };
    const est = [e], notas = [];
    const fila = [...roteiro];
    const copia = (x) => ({ ...x, buf: x.buf.slice() });
    const poe = (x, n) => { x.item += 1; x.buf[x.entra] = x.item; x.mud = x.entra; n.push(`põe o item #${x.item} na posição ${x.entra}`); x.entra = (x.entra + 1) % N; };
    const tira = (x, n) => { const it = x.buf[x.sai]; x.buf[x.sai] = null; x.mud = x.sai; n.push(`tira o item #${it} da posição ${x.sai}`); x.sai = (x.sai + 1) % N; };
    while (fila.length) {
      const a = fila.shift();
      const x = copia(est[est.length - 1]); x.mud = null; x.sem = null; x.quem = a.toLowerCase();
      const n = [];
      if (a === 'p' || a === 'P') {
        if (a === 'p') {
          if (x.vazio === 0) { x.pB = true; x.sem = 'vazio'; est.push(x); notas.push(`Produtor faz <b>P(vazio)</b> com vazio = 0: o buffer está cheio. O produtor <b>bloqueia</b> e dorme na fila de vazio.`); continue; }
          x.vazio -= 1; n.push(`<b>P(vazio)</b>: vazio ${x.vazio + 1} → ${x.vazio}`);
        } else { x.pB = false; n.push('O produtor <b>acorda</b>: o P(vazio) dele termina agora'); }
        n.push('P(mutex)'); poe(x, n); n.push('V(mutex)');
        if (x.cB) { x.cB = false; fila.unshift('C'); n.push('<b>V(cheio)</b>: o consumidor estava dormindo, então ele é acordado (cheio continua 0)'); x.sem = 'cheio'; }
        else { x.cheio += 1; n.push(`<b>V(cheio)</b>: cheio ${x.cheio - 1} → ${x.cheio}`); x.sem = 'cheio'; }
        notas.push('Produtor: ' + n.join(', ') + '.');
      } else {
        if (a === 'c') {
          if (x.cheio === 0) { x.cB = true; x.sem = 'cheio'; est.push(x); notas.push(`Consumidor faz <b>P(cheio)</b> com cheio = 0: não há item. O consumidor <b>bloqueia</b> e dorme na fila de cheio, sem gastar CPU.`); continue; }
          x.cheio -= 1; n.push(`<b>P(cheio)</b>: cheio ${x.cheio + 1} → ${x.cheio}`);
        } else { x.cB = false; n.push('O consumidor <b>acorda</b>: o P(cheio) dele termina agora'); }
        n.push('P(mutex)'); tira(x, n); n.push('V(mutex)');
        if (x.pB) { x.pB = false; fila.unshift('P'); n.push('<b>V(vazio)</b>: o produtor estava dormindo, então ele é acordado (vazio continua 0)'); x.sem = 'vazio'; }
        else { x.vazio += 1; n.push(`<b>V(vazio)</b>: vazio ${x.vazio - 1} → ${x.vazio}`); x.sem = 'vazio'; }
        notas.push('Consumidor: ' + n.join(', ') + '.');
      }
      est.push(x);
    }
    return { est, notas };
  }
  function montar(key) {
    const N = +nIn.value; nOut.textContent = N;
    const { est, notas } = simular(N, ROTEIROS[key](N));
    const notes = [INTRO[key](N), ...notas, `Em todo passo sem ninguém no meio de uma operação, <code>vazio + cheio = ${N}</code>. Mude N no controle acima e rode de novo.`];
    est.push(est[est.length - 1]);
    svg.innerHTML = '';
    const seta = marcadores(svg);
    const box = (x, nome, cor) => { S('rect', { x, y: 62, width: 100, height: 60, rx: 10, style: `fill:var(--${cor}-soft);stroke:var(--${cor})` }, svg); S('text', { x: x + 50, y: 92, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sv-text', style: 'font-weight:600' }, svg, nome); };
    box(10, 'produtor', 'blue'); box(530, 'consumidor', 'amber');
    const stP = S('text', { x: 60, y: 142, 'text-anchor': 'middle', class: 'sv-muted' }, svg, '');
    const stC = S('text', { x: 580, y: 142, 'text-anchor': 'middle', class: 'sv-muted' }, svg, '');
    const x0 = 140, larg = 360, w = Math.min(60, larg / N - 6), passo = larg / N;
    const cel = [];
    for (let i = 0; i < N; i++) {
      const cx = x0 + passo * i + passo / 2;
      const r = S('rect', { x: cx - w / 2, y: 70, width: w, height: 46, rx: 6 }, svg);
      const t = S('text', { x: cx, y: 93, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sv-text', style: 'font-weight:600' }, svg, '');
      S('text', { x: cx, y: 128, 'text-anchor': 'middle', class: 'sv-muted', style: 'font-size:10px' }, svg, String(i));
      cel.push({ r, t, cx });
    }
    S('text', { x: 320, y: 20, 'text-anchor': 'middle', class: 'sv-muted' }, svg, `buffer circular, N = ${N}`);
    const pE = S('g', { class: 'anim' }, svg); S('path', { d: 'M0,0 l-6,10 h12 z', style: 'fill:var(--blue)' }, pE); S('text', { x: 0, y: 22, 'text-anchor': 'middle', class: 'sv-muted', style: 'fill:var(--blue)' }, pE, 'entra');
    const pS = S('g', { class: 'anim' }, svg); S('path', { d: 'M0,0 l-6,-10 h12 z', style: 'fill:var(--amber)' }, pS); S('text', { x: 0, y: -16, 'text-anchor': 'middle', class: 'sv-muted', style: 'fill:var(--amber)' }, pS, 'sai');
    S('line', { x1: 112, y1: 92, x2: 136, y2: 92, style: 'stroke:var(--muted);stroke-width:1.5', 'marker-end': seta('n') }, svg);
    S('line', { x1: 504, y1: 92, x2: 528, y2: 92, style: 'stroke:var(--muted);stroke-width:1.5', 'marker-end': seta('n') }, svg);
    const sems = {};
    [['vazio', 140], ['cheio', 265], ['mutex', 390]].forEach(([nm, x]) => {
      const r = S('rect', { x, y: 196, width: 110, height: 56, rx: 10 }, svg);
      S('text', { x: x + 55, y: 212, 'text-anchor': 'middle', class: 'sv-muted' }, svg, nm);
      const t = S('text', { x: x + 55, y: 236, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sv-text', style: 'font-size:20px;font-weight:600' }, svg, '');
      sems[nm] = { r, t };
    });
    const render = (k) => {
      const e = est[k];
      e.buf.forEach((v, i) => {
        const c = cel[i];
        c.t.textContent = v === null ? '' : '#' + v;
        const mud = e.mud === i && k < est.length - 1;
        c.r.setAttribute('style', v === null ? `fill:var(--surface);stroke:${mud ? 'var(--amber)' : 'var(--line2)'};stroke-width:${mud ? 2.4 : 1.4}` : `fill:var(--blue-soft);stroke:${mud ? 'var(--amber)' : 'var(--blue)'};stroke-width:${mud ? 2.4 : 1.4}`);
      });
      pE.setAttribute('transform', `translate(${cel[e.entra].cx},${152})`);
      pS.setAttribute('transform', `translate(${cel[e.sai].cx},${58})`);
      const val = { vazio: e.vazio, cheio: e.cheio, mutex: 1 };
      for (const nm of ['vazio', 'cheio', 'mutex']) {
        const hot = e.sem === nm && k < est.length - 1;
        const bloq = (nm === 'vazio' && e.pB) || (nm === 'cheio' && e.cB);
        sems[nm].r.setAttribute('style', bloq ? 'fill:var(--red-soft);stroke:var(--red);stroke-width:2' : hot ? 'fill:var(--amber-soft);stroke:var(--amber);stroke-width:2' : 'fill:var(--surface2);stroke:var(--line2)');
        sems[nm].t.textContent = val[nm] + (bloq ? '  ⏸' : '');
      }
      stP.textContent = e.pB ? 'dormindo em P(vazio)' : e.quem === 'p' && k > 0 && k < est.length - 1 ? 'acabou de produzir' : '';
      stC.textContent = e.cB ? 'dormindo em P(cheio)' : e.quem === 'c' && k > 0 && k < est.length - 1 ? 'acabou de consumir' : '';
      stP.style.fill = e.pB ? 'var(--red)' : ''; stC.style.fill = e.cB ? 'var(--red)' : '';
      cap.textContent = `vazio + cheio = ${e.vazio} + ${e.cheio} = ${e.vazio + e.cheio}   ·   itens no buffer: ${e.buf.filter((v) => v !== null).length} de ${N}`;
    };
    return { notes, render };
  }
  const ctl = comAbas(root, [
    { nome: 'Produtor mais rápido', montar: () => montar('prod') },
    { nome: 'Consumidor mais rápido', montar: () => montar('cons') },
    { nome: 'Alternando', montar: () => montar('alt') }
  ], 2200);
  nIn.addEventListener('input', () => ctl.recarregar(false));
})();

/* ============ Fig 4: grafo de alocação de recursos ============ */
(function () {
  const root = document.getElementById('fig-dl');
  const svg = document.getElementById('dl-svg'), cap = document.getElementById('dl-cap');
  /* posições em volta de uma elipse: x = 320 + 210 cos θ, y = 150 − 110 sin θ */
  const anel = (g) => [320 + 210 * Math.cos(g * Math.PI / 180), 150 - 110 * Math.sin(g * Math.PI / 180)];
  const CEN = {
    forma: {
      nos: { P1: anel(150), R2: anel(90), P2: anel(30), R3: anel(-30), P3: anel(-90), R1: anel(-150) },
      inst: { R1: 1, R2: 1, R3: 1 },
      passos: [
        { e: [], n: 'Três processos (círculos) e três recursos (quadrados), cada recurso com <b>uma</b> instância (um ponto).' },
        { e: ['R1>P1'], n: 'P1 pede R1, que está livre, e recebe. Aresta de <b>posse</b>: do recurso para o processo.' },
        { e: ['R1>P1', 'R2>P2'], n: 'P2 recebe R2.' },
        { e: ['R1>P1', 'R2>P2', 'R3>P3'], n: 'P3 recebe R3. Até aqui, tudo normal: cada um tem o seu.' },
        { e: ['R1>P1', 'R2>P2', 'R3>P3', 'P1>R2'], b: ['P1'], n: 'P1 pede R2 sem soltar R1 (<b>posse e espera</b>). R2 está com P2: P1 bloqueia. Aresta de <b>pedido</b>, tracejada, do processo para o recurso.' },
        { e: ['R1>P1', 'R2>P2', 'R3>P3', 'P1>R2', 'P2>R3'], b: ['P1', 'P2'], n: 'P2 pede R3, que está com P3: P2 bloqueia. Ainda não há volta fechada: P3 pode terminar e soltar R3.' },
        { e: ['R1>P1', 'R2>P2', 'R3>P3', 'P1>R2', 'P2>R3', 'P3>R1'], b: ['P1', 'P2', 'P3'], ciclo: ['P1>R2', 'R2>P2', 'P2>R3', 'R3>P3', 'P3>R1', 'R1>P1'], c: 'P1 → R2 → P2 → R3 → P3 → R1 → P1', n: 'P3 pede R1, que está com P1. Fechou: <b>ciclo no grafo</b>. Com uma instância por recurso, ciclo é deadlock.' },
        { e: ['R1>P1', 'R2>P2', 'R3>P3', 'P1>R2', 'P2>R3', 'P3>R1'], b: ['P1', 'P2', 'P3'], ciclo: ['P1>R2', 'R2>P2', 'P2>R3', 'R3>P3', 'P3>R1', 'R1>P1'], c: 'exclusão mútua ✓ · posse e espera ✓ · não preempção ✓ · espera circular ✓', n: 'As quatro condições de Coffman valem. Os três estão bloqueados e nenhum vai soltar o que tem. Só uma intervenção de fora (matar um, tirar um recurso) desfaz.' }
      ]
    },
    multi: {
      nos: { P1: anel(150), R1: anel(90), P2: anel(30), R2: anel(-60), P3: [600, 262] },
      inst: { R1: 1, R2: 2 },
      passos: [
        { e: [], n: 'Agora R2 tem <b>duas instâncias</b> (dois pontos). R1 tem uma.' },
        { e: ['R1>P2'], n: 'P2 recebe R1.' },
        { e: ['R1>P2', 'R2>P1'], n: 'P1 recebe uma instância de R2.' },
        { e: ['R1>P2', 'R2>P1', 'R2>P3'], n: 'P3 recebe a outra instância de R2. R2 esgotou.' },
        { e: ['R1>P2', 'R2>P1', 'R2>P3', 'P1>R1'], b: ['P1'], n: 'P1 pede R1, que está com P2: P1 bloqueia.' },
        { e: ['R1>P2', 'R2>P1', 'R2>P3', 'P1>R1', 'P2>R2'], b: ['P1', 'P2'], ciclo: ['P1>R1', 'R1>P2', 'P2>R2', 'R2>P1'], cor: 'a', c: 'P1 → R1 → P2 → R2 → P1', n: 'P2 pede R2: as duas instâncias estão ocupadas, P2 bloqueia. Há um <b>ciclo</b>: P1 → R1 → P2 → R2 → P1. Mas olhe P3: ele está fora do ciclo e não espera nada.' },
        { e: ['R1>P2', 'R2>P1', 'R2>P2', 'P1>R1'], b: ['P1'], f: ['P3'], n: 'P3 termina e devolve a instância de R2. Ela vai para P2, que estava esperando. O ciclo se desfez sozinho.' },
        { e: ['R1>P1', 'R2>P1'], f: ['P3', 'P2'], n: 'P2 termina e devolve R1 e R2. R1 vai para P1, que agora tem tudo de que precisa.' },
        { e: [], f: ['P3', 'P2', 'P1'], c: 'ciclo é necessário, mas não suficiente, quando há várias instâncias', n: 'Todos terminaram. Com várias instâncias por recurso, um ciclo no grafo indica <b>possível</b> deadlock, não certeza. É preciso ver se alguém de fora do ciclo pode liberar instâncias.' }
      ]
    },
    ordem: {
      nos: { P1: anel(150), R2: anel(90), P2: anel(30), R3: anel(-30), P3: anel(-90), R1: anel(-150) },
      inst: { R1: 1, R2: 1, R3: 1 },
      passos: [
        { e: [], n: 'Prevenção por <b>ordenação de recursos</b>: R1 &lt; R2 &lt; R3, e todo processo pede em ordem crescente. P3 precisa de R1 e R3, então tem de pedir R1 primeiro.' },
        { e: ['R1>P1'], n: 'P1 recebe R1.' },
        { e: ['R1>P1', 'R2>P2'], n: 'P2 recebe R2.' },
        { e: ['R1>P1', 'R2>P2', 'P1>R2'], b: ['P1'], n: 'P1 pede R2 (2 &gt; 1, ordem certa). Está com P2: P1 espera.' },
        { e: ['R1>P1', 'R2>P2', 'P1>R2', 'R3>P2'], b: ['P1'], n: 'P2 pede R3 (3 &gt; 2) e recebe: R3 está livre, porque P3 ainda não pegou nada.' },
        { e: ['R1>P1', 'R2>P2', 'P1>R2', 'R3>P2', 'P3>R1'], b: ['P1', 'P3'], n: 'P3 pede R1 primeiro, como manda a regra. Está com P1: P3 espera <b>sem segurar nada</b>. A volta P3 → … → P3 não fecha.' },
        { e: ['R1>P1', 'R2>P1', 'P3>R1'], b: ['P3'], f: ['P2'], n: 'P2 tem tudo, termina e devolve R2 e R3. R2 vai para P1.' },
        { e: ['R1>P3', 'R3>P3'], f: ['P2', 'P1'], n: 'P1 termina e devolve R1 e R2. P3 recebe R1 e depois pede e recebe R3.' },
        { e: [], f: ['P2', 'P1', 'P3'], c: 'quem segura Rᵢ só espera por Rⱼ com j > i: nenhuma volta fecha', n: 'Todos terminaram. Como cada um só espera por recursos de número maior do que os que segura, seguir as setas sempre sobe na numeração e nunca volta ao início: sem espera circular, sem deadlock.' }
      ]
    }
  };
  function montar(key) {
    const C = CEN[key];
    svg.innerHTML = '';
    const seta = marcadores(svg);
    const gE = S('g', null, svg), gN = S('g', null, svg);
    const nos = {};
    for (const [id, [x, y]] of Object.entries(C.nos)) {
      const g = S('g', null, gN);
      if (id[0] === 'P') {
        const c = S('circle', { cx: x, cy: y, r: 24 }, g);
        S('text', { x, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sv-text', style: 'font-weight:600' }, g, id);
        nos[id] = { g, c, x, y, r: 26 };
      } else {
        const q = C.inst[id], w = 30 + 16 * q;
        const c = S('rect', { x: x - w / 2, y: y - 20, width: w, height: 40, rx: 5, style: 'fill:var(--amber-soft);stroke:var(--amber);stroke-width:1.6' }, g);
        const dots = [];
        for (let i = 0; i < q; i++) dots.push([x - (q - 1) * 9 + i * 18, y + 4]);
        dots.forEach(([dx, dy]) => S('circle', { cx: dx, cy: dy, r: 4.5, style: 'fill:var(--amber)' }, g));
        S('text', { x, y: y > 150 ? y + 36 : y - 31, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sv-text', style: 'font-size:13px;font-weight:600' }, g, id);
        nos[id] = { g, c, x, y, r: 24, w, dots };
      }
    }
    /* até onde a seta anda dentro de um nó: raio do círculo ou borda do retângulo */
    const raio = (id, ux, uy) => id[0] === 'P' ? nos[id].r : Math.min(nos[id].w / 2 / Math.max(Math.abs(ux), 1e-3), 20 / Math.max(Math.abs(uy), 1e-3));
    const borda = (a, b) => {
      const A = nos[a], B = nos[b];
      const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const ra = raio(a, ux, uy), rb = raio(b, ux, uy) + 3;
      return [A.x + ux * ra, A.y + uy * ra, B.x - ux * rb, B.y - uy * rb];
    };
    const notes = C.passos.map((p) => p.n);
    const render = (k) => {
      const p = C.passos[k];
      gE.innerHTML = '';
      const ciclo = new Set(p.ciclo || []), cc = p.cor || 'r';
      p.e.forEach((ed) => {
        const [a, b] = ed.split('>');
        const [x1, y1, x2, y2] = borda(a, b);
        const pedido = a[0] === 'P', noC = ciclo.has(ed);
        const cor = noC ? (cc === 'r' ? 'var(--red)' : 'var(--amber)') : pedido ? 'var(--muted)' : 'var(--fg2)';
        S('line', { x1, y1, x2, y2, style: `stroke:${cor};stroke-width:${noC ? 3 : 1.8};${pedido ? 'stroke-dasharray:7 5' : ''}`, 'marker-end': seta(noC ? cc : 'n') }, gE);
      });
      const bl = new Set(p.b || []), fe = new Set(p.f || []);
      for (const [id, nd] of Object.entries(nos)) {
        if (id[0] !== 'P') continue;
        nd.c.setAttribute('style', fe.has(id) ? 'fill:var(--green-soft);stroke:var(--green);stroke-width:1.6' : bl.has(id) ? 'fill:var(--red-soft);stroke:var(--red);stroke-width:2' : 'fill:var(--blue-soft);stroke:var(--blue);stroke-width:1.6');
        nd.g.style.opacity = fe.has(id) ? 0.55 : 1;
      }
      cap.textContent = p.c || (bl.size ? `bloqueados: ${[...bl].join(', ')}` : ' ');
    };
    return { notes, render };
  }
  comAbas(root, [
    { nome: 'Deadlock se formando', montar: () => montar('forma') },
    { nome: 'Ciclo sem deadlock', montar: () => montar('multi') },
    { nome: 'Prevenção: ordem global', montar: () => montar('ordem') }
  ], 2300);
})();

/* ============ Fig 5: algoritmo do banqueiro ============ */
(function () {
  const root = document.getElementById('fig-bank');
  const tab = document.getElementById('bank-tab'), trail = document.getElementById('bank-trail');
  const ver = document.getElementById('bank-verdict'), cap = document.getElementById('bank-cap');
  const TOTAL = 10, ALOC = [3, 2, 2], MAX = [9, 4, 7];
  function montar(pedido) {
    const aloc = ALOC.slice(), max = MAX.slice();
    let disp = TOTAL - aloc.reduce((a, b) => a + b, 0);
    const passos = [];
    const foto = (o) => passos.push({ aloc: aloc.slice(), livre: o.livre, fim: (o.fim || []).slice(), ordem: (o.ordem || []).slice(), hl: o.hl, ok: o.ok, nota: o.nota, ver: o.ver });
    const prec = () => max.map((m, i) => m - aloc[i]);
    if (!pedido) {
      foto({ livre: disp, nota: `Estado atual, sem pedido novo. Total de ${TOTAL} instâncias. Disponível = ${TOTAL} − (${ALOC.join(' + ')}) = <b>${disp}</b>. Para cada processo, Precisa = Máximo − Alocado.` });
    } else {
      const [i, q] = pedido, P = prec();
      foto({ livre: disp, hl: i, nota: `<b>P${i + 1} pede ${q}</b>. Antes de tudo: ${q} ≤ Precisa de P${i + 1} (${P[i]}) e ${q} ≤ Disponível (${disp})? Sim, então o pedido é válido.` });
      aloc[i] += q; disp -= q;
      foto({ livre: disp, hl: i, nota: `<b>Finge que concedeu</b>: P${i + 1} passa a ter ${aloc[i]} (precisa ${max[i] - aloc[i]}); Disponível = ${disp + q} − ${q} = ${disp}. Agora testa se esse estado é seguro.` });
    }
    /* teste de segurança, sempre recomeçando do primeiro processo */
    const P = prec(), fim = [], ordem = [];
    let livre = disp;
    while (true) {
      const tent = [];
      let achou = -1;
      for (let i = 0; i < 3; i++) {
        if (fim.includes(i)) continue;
        if (P[i] <= livre) { achou = i; break; }
        tent.push(`P${i + 1} precisa ${P[i]} &gt; ${livre}, não cabe`);
      }
      if (achou < 0) {
        foto({ livre, fim, ordem, ver: 'bad', nota: `Livre = ${livre}. ${tent.join('; ')}. <b>Ninguém mais consegue terminar</b>: estado <b>inseguro</b>.` + (pedido ? ` O banqueiro <b>nega</b>: P${pedido[0] + 1} espera, e o estado volta ao de antes.` : '') });
        break;
      }
      const antes = livre; livre += aloc[achou]; fim.push(achou); ordem.push('P' + (achou + 1));
      foto({ livre, fim, ordem, hl: achou, ok: true, nota: `Livre = ${antes}. ${tent.length ? tent.join('; ') + '. ' : ''}<b>P${achou + 1} precisa ${P[achou]} ≤ ${antes}</b>: pode rodar até o fim e devolver o que tem. Livre = ${antes} + ${aloc[achou]} = <b>${livre}</b>.` });
      if (fim.length === 3) {
        foto({ livre, fim, ordem, ver: 'ok', nota: `Todos terminam: estado <b>seguro</b>, sequência ⟨${ordem.join(', ')}⟩.` + (pedido ? ` O banqueiro <b>concede</b> o pedido de verdade.` : '') });
        break;
      }
    }
    const notes = passos.map((p) => p.nota);
    const render = (k) => {
      const p = passos[k];
      const pr = max.map((m, i) => m - p.aloc[i]);
      let h = '<thead><tr><th>Processo</th><th>Alocado</th><th>Máximo</th><th>Precisa</th><th></th></tr></thead><tbody>';
      for (let i = 0; i < 3; i++) {
        const f = p.fim.includes(i), hl = p.hl === i;
        const st = hl ? (p.ok ? 'background:var(--green-soft)' : 'background:var(--amber-soft)') : f ? 'opacity:.45' : '';
        h += `<tr style="${st}"><td>P${i + 1}</td><td>${p.aloc[i]}</td><td>${max[i]}</td><td>${pr[i]}</td><td>${f ? 'terminou ✓' : ''}</td></tr>`;
      }
      h += `<tr><td colspan="5"><b>Livre = ${p.livre}</b></td></tr></tbody>`;
      tab.innerHTML = h;
      trail.innerHTML = p.ordem.length ? p.ordem.map((x) => `<span class="q">${x}</span>`).join('<span class="ar">→</span>') : '<span class="muted">nenhum ainda</span>';
      ver.className = 'verdict' + (p.ver ? ' ' + p.ver : '');
      ver.innerHTML = p.ver === 'ok' ? 'Estado seguro' + (pedido ? ': pedido concedido.' : '.') : p.ver === 'bad' ? 'Estado inseguro' + (pedido ? ': pedido negado, o processo espera.' : '.') : 'testando…';
      cap.textContent = pedido ? `pedido: P${pedido[0] + 1} quer mais ${pedido[1]}   ·   total = ${TOTAL}` : `total = ${TOTAL} instâncias   ·   sem pedido novo`;
    };
    return { notes, render };
  }
  comAbas(root, [
    { nome: 'Estado inicial', montar: () => montar(null) },
    { nome: 'P2 pede 2', montar: () => montar([1, 2]) },
    { nome: 'P1 pede 1', montar: () => montar([0, 1]) },
    { nome: 'P3 pede 2', montar: () => montar([2, 2]) }
  ], 2400);
})();

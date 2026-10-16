import { S, H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figuras da aula 06. As simulações (escalonar, alocar, substituir, disco) são funções puras;
   cada figura só desenha o resultado do passo k. */

const num = (x) => (Math.round(x * 100) / 100).toString().replace('.', ',');
const COR = { A: 'blue', B: 'amber', C: 'green', D: 'red' };
const cor = (p, forte) => (COR[p] ? `var(--${COR[p]}${forte ? '' : '-soft'})` : forte ? 'var(--line2)' : 'var(--surface2)');
/* liga um conjunto de botões de aba (.btn.sm) a uma função; devolve a função que marca a aba atual */
function abas(tabs, itens, aoEscolher) {
  const bs = itens.map(([k, rot]) => { const b = H('button', { class: 'btn sm' }, rot); b.dataset.k = k; b.addEventListener('click', () => aoEscolher(k, true)); tabs.appendChild(b); return b; });
  return (k) => bs.forEach((b) => b.classList.toggle('sel', b.dataset.k === k));
}

/* ============ Fig 1 · Gantt dos escalonadores ============ */
export function escalonar(P, alg, q = 2) {
  const rem = {}, first = {}, fim = {};
  P.forEach((p) => (rem[p.id] = p.burst));
  const by = (id) => P.find((p) => p.id === id);
  const pend = P.slice().sort((a, b) => a.chegada - b.chegada);
  let t = 0, cur = null, usado = 0, ready = [];
  const segs = [];
  while (P.some((p) => rem[p.id] > 0) && t < 500) {
    while (pend.length && pend[0].chegada <= t) ready.push(pend.shift().id);
    let novo = false;
    if (alg === 'rr' && cur && usado >= q) { ready.push(cur); cur = null; }
    if (alg === 'srtf' || alg === 'prio') {
      const key = (id) => (alg === 'srtf' ? rem[id] : by(id).prio);
      const cands = cur ? [cur, ...ready] : ready.slice();
      if (cands.length) {
        let best = cands[0];
        cands.forEach((c) => { if (key(c) < key(best)) best = c; });
        if (best !== cur) { if (cur) ready.push(cur); ready = ready.filter((x) => x !== best); cur = best; usado = 0; novo = true; }
      }
    } else if (!cur && ready.length) {
      let pick = ready[0];
      if (alg === 'sjf') ready.forEach((c) => { if (by(c).burst < by(pick).burst) pick = c; });
      ready = ready.filter((x) => x !== pick); cur = pick; usado = 0; novo = true;
    }
    const id = cur || '·';
    if (cur && first[cur] == null) first[cur] = t;
    const last = segs[segs.length - 1];
    if (last && last.p === id && !novo) last.fim = t + 1;
    else segs.push({ p: id, ini: t, fim: t + 1, fila: ready.slice(), rest: cur ? rem[cur] : 0 });
    if (cur) { rem[cur]--; usado++; if (rem[cur] === 0) { fim[cur] = t + 1; cur = null; } }
    t++;
  }
  const res = P.map((p) => ({ id: p.id, chegada: p.chegada, burst: p.burst, fim: fim[p.id], ta: fim[p.id] - p.chegada, w: fim[p.id] - p.chegada - p.burst, r: first[p.id] - p.chegada }));
  return { segs, res, total: t };
}

(function () {
  const root = document.getElementById('fig-gantt');
  if (!root) return;
  const P = [{ id: 'A', chegada: 0, burst: 6, prio: 3 }, { id: 'B', chegada: 1, burst: 3, prio: 2 }, { id: 'C', chegada: 2, burst: 8, prio: 1 }, { id: 'D', chegada: 3, burst: 2, prio: 4 }];
  const svg = document.getElementById('gantt-svg'), fila = document.getElementById('g-fila'), tab = document.getElementById('g-tab');
  const qIn = document.getElementById('g-q'), qV = document.getElementById('g-qv'), qBox = document.getElementById('g-qbox');
  const NOME = { fcfs: 'FCFS', sjf: 'SJF', srtf: 'SRTF', prio: 'Prioridade', rr: 'Round-robin' };
  const REGRA = {
    fcfs: 'FCFS: quem chegou antes roda até terminar. Não preemptivo.',
    sjf: 'SJF: quando a CPU fica livre, roda o menor surto entre os prontos. Não preemptivo.',
    srtf: 'SRTF: a cada chegada, roda quem tem o menor tempo restante, mesmo que precise preemptar.',
    prio: 'Prioridade preemptiva: roda sempre o pronto de menor número (mais importante).',
    rr: 'Round-robin: fila circular; cada um roda no máximo um quantum e volta para o fim da fila. Quem chega entra na fila antes de quem acabou de ser preemptado.',
  };
  let fig = null, alg = 'fcfs';
  const marcar = abas(root.querySelector('.fig-tabs'), Object.entries(NOME), (k, play) => { alg = k; carregar(); if (play) fig.play(); });

  function carregar() {
    const q = +qIn.value; qV.textContent = q;
    qBox.style.display = alg === 'rr' ? '' : 'none';
    marcar(alg);
    const R = escalonar(P, alg, q);
    const segs = R.segs, T = R.total;
    const x0 = 46, x1 = 624, sx = (x1 - x0) / T, X = (t) => x0 + t * sx;
    /* notas */
    const rem = {}; P.forEach((p) => (rem[p.id] = p.burst));
    const notes = [`Quatro processos: A chega em 0 (surto 6), B em 1 (3), C em 2 (8), D em 3 (2). ${REGRA[alg]}${alg === 'rr' ? ` Quantum q = ${q}.` : ''}`];
    segs.forEach((s, i) => {
      const prev = segs[i - 1];
      let n = `<b>t = ${s.ini}</b>: `;
      if (s.p === '·') n += 'ninguém pronto, CPU ociosa.';
      else {
        const p = P.find((x) => x.id === s.p);
        if (prev && prev.p !== '·' && rem[prev.p] > 0) {
          if (prev.p === s.p) n += `${s.p} esgotou o quantum, mas a fila está vazia: continua. `;
          else if (alg === 'rr') n += `${prev.p} esgotou o quantum e foi para o fim da fila (faltam ${rem[prev.p]}). `;
          else if (alg === 'srtf') n += `${prev.p} é preemptado (faltam ${rem[prev.p]}). `;
          else if (alg === 'prio') n += `chegou alguém mais importante: ${prev.p} é preemptado (faltam ${rem[prev.p]}). `;
        }
        if (prev && prev.p === s.p) { /* já explicado */ }
        else {
          n += `<b>${s.p}</b> entra na CPU: `;
          const outros = s.fila.length;
          if (alg === 'fcfs') n += `é o primeiro da fila (chegou em t = ${p.chegada}).`;
          if (alg === 'sjf') n += outros ? `tem o menor surto entre os prontos (${p.burst}).` : 'é o único pronto.';
          if (alg === 'srtf') n += outros ? `tem o menor tempo restante (${rem[s.p]}).` : `é o único pronto (faltam ${rem[s.p]}).`;
          if (alg === 'prio') n += outros ? `tem a maior prioridade entre os prontos (número ${p.prio}).` : 'é o único pronto.';
          if (alg === 'rr') n += `é o próximo da fila e pode rodar até ${q} unidade${q > 1 ? 's' : ''}.`;
        }
        rem[s.p] -= s.fim - s.ini;
        n += rem[s.p] === 0 ? ` Termina em t = ${s.fim}.` : ` Roda até t = ${s.fim}.`;
      }
      notes.push(n);
    });
    const soma = (k) => R.res.reduce((a, r) => a + r[k], 0);
    notes.push(`<b>Médias.</b> Espera = (${R.res.map((r) => r.w).join(' + ')}) / 4 = ${num(soma('w') / 4)}. Turnaround = (${R.res.map((r) => r.ta).join(' + ')}) / 4 = ${num(soma('ta') / 4)}. Resposta = (${R.res.map((r) => r.r).join(' + ')}) / 4 = ${num(soma('r') / 4)}.`);

    const render = (k) => {
      const ate = Math.min(k, segs.length);
      const tAgora = ate ? segs[ate - 1].fim : 0;
      const fin = k > segs.length;
      svg.innerHTML = '';
      /* chegadas */
      P.forEach((p) => { S('text', { x: X(p.chegada) + 2, y: 14, class: 'sv-muted', 'font-size': 11 }, svg, `${p.id}↓`); });
      S('text', { x: 4, y: 52, class: 'sv-muted', 'font-size': 11 }, svg, 'CPU');
      S('rect', { x: x0, y: 26, width: x1 - x0, height: 40, rx: 4, style: 'fill:none;stroke:var(--line);stroke-dasharray:3 3' }, svg);
      segs.slice(0, ate).forEach((s, i) => {
        const g = S('g', null, svg);
        S('rect', { x: X(s.ini), y: 26, width: (s.fim - s.ini) * sx, height: 40, style: `fill:${cor(s.p)};stroke:${cor(s.p, 1)};stroke-width:${i === ate - 1 && !fin ? 2.5 : 1.2}` }, g);
        S('text', { x: X(s.ini) + (s.fim - s.ini) * sx / 2, y: 47, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g, s.p);
      });
      /* eixo */
      for (let t = 0; t <= T; t++) {
        S('line', { x1: X(t), y1: 66, x2: X(t), y2: t % 5 === 0 ? 74 : 70, class: 'sv-edge' }, svg);
        if (t % (T > 24 ? 2 : 1) === 0) S('text', { x: X(t), y: 86, class: 'sv-muted', 'text-anchor': 'middle', 'font-size': 10 }, svg, t);
      }
      if (ate && !fin) S('line', { x1: X(tAgora), y1: 20, x2: X(tAgora), y2: 196, style: 'stroke:var(--accent);stroke-width:1.5;stroke-dasharray:4 3' }, svg);
      /* uma linha por processo: tracejado = esperando, cheio = rodando */
      P.forEach((p, i) => {
        const y = 108 + i * 22;
        S('text', { x: 4, y: y + 4, class: 'sv-muted', 'font-size': 11 }, svg, p.id);
        const r = R.res.find((x) => x.id === p.id);
        const fimVis = Math.min(tAgora, r.fim);
        if (fimVis > p.chegada) S('line', { x1: X(p.chegada), y1: y, x2: X(fimVis), y2: y, style: 'stroke:var(--line2);stroke-width:1.5;stroke-dasharray:3 3' }, svg);
        segs.slice(0, ate).filter((s) => s.p === p.id).forEach((s) => S('rect', { x: X(s.ini), y: y - 6, width: (s.fim - s.ini) * sx, height: 12, rx: 3, style: `fill:${cor(p.id, 1)}` }, svg));
        if (r.fim <= tAgora) S('text', { x: X(r.fim) + 4, y: y + 4, class: 'sv-muted', 'font-size': 10 }, svg, `fim ${r.fim}`);
      });
      S('text', { x: x1, y: 198, class: 'sv-muted', 'text-anchor': 'end', 'font-size': 10 }, svg, 'barra cheia = rodando · tracejado = esperando na fila');
      /* fila de prontos */
      const s = ate ? segs[ate - 1] : null;
      fila.innerHTML = !s || fin ? '<span class="muted">—</span>' : s.fila.length ? s.fila.map((id) => `<span class="q">${id}</span>`).join('<span class="ar">←</span>') : '<span class="muted">vazia</span>';
      /* tabela */
      const linhas = R.res.map((r) => { const ok = r.fim <= tAgora && ate; return `<tr><td>${r.id}</td><td>${r.chegada}</td><td>${r.burst}</td><td>${ok ? r.fim : ''}</td><td>${ok ? r.ta : ''}</td><td>${ok ? r.w : ''}</td><td>${ok ? r.r : ''}</td></tr>`; }).join('');
      const media = fin ? `<tr><td><b>média</b></td><td></td><td></td><td></td><td>${num(soma('ta') / 4)}</td><td>${num(soma('w') / 4)}</td><td>${num(soma('r') / 4)}</td></tr>` : '';
      tab.innerHTML = `<thead><tr><th>proc.</th><th>chegada</th><th>surto</th><th>término</th><th>turnaround</th><th>espera</th><th>resposta</th></tr></thead><tbody>${linhas}${media}</tbody>`;
    };
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1900 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  qIn.addEventListener('input', () => { if (alg === 'rr') carregar(); else qV.textContent = qIn.value; });
  carregar();
})();

/* ============ Fig 2 · first, best e worst-fit ============ */
export function alocar(estrategia) {
  const ini = [['SO', 8, 'so'], [null, 12], ['A', 8, 'p'], [null, 6], ['B', 6, 'p'], [null, 20], ['C', 4, 'p']];
  let end = 0;
  let blocos = ini.map(([nome, tam, tipo]) => { const b = { ini: end, tam, nome, tipo: tipo || 'livre' }; end += tam; return b; });
  const copia = () => blocos.map((b) => ({ ...b }));
  const buracos = () => blocos.filter((b) => b.tipo === 'livre');
  const livre = () => buracos().reduce((a, b) => a + b.tam, 0);
  const lista = () => buracos().map((b) => b.tam).join(', ');
  const passos = [{ blocos: copia(), nota: 'Memória de 64 KB. O SO ocupa 8 KB; A, B e C já estão carregados. Buracos (em ordem de endereço): <b>12, 6 e 20 KB</b>, 38 KB livres no total. Chegam quatro pedidos: 5, 12, 6 e 10 KB.', cap: `buracos: ${lista()} KB · livre: ${livre()} KB` }];
  const pedidos = [['P1', 5], ['P2', 12], ['P3', 6], ['P4', 10]];
  const REG = { first: 'o primeiro, a partir do endereço 0, em que cabe', best: 'o menor em que cabe', worst: 'o maior' };
  pedidos.forEach(([nome, tam], i) => {
    const cabem = buracos().filter((b) => b.tam >= tam);
    let alvo = null;
    if (cabem.length) {
      if (estrategia === 'first') alvo = cabem[0];
      if (estrategia === 'best') alvo = cabem.reduce((a, b) => (b.tam < a.tam ? b : a));
      if (estrategia === 'worst') alvo = cabem.reduce((a, b) => (b.tam > a.tam ? b : a));
    }
    if (alvo) {
      const antes = lista(), sobra = alvo.tam - tam;
      const idx = blocos.indexOf(alvo);
      const novo = { ini: alvo.ini, tam, nome, tipo: 'novo' };
      const resto = sobra ? [{ ini: alvo.ini + tam, tam: sobra, nome: null, tipo: 'livre' }] : [];
      blocos.splice(idx, 1, novo, ...resto);
      passos.push({ blocos: copia(), foco: nome, nota: `<b>${nome} pede ${tam} KB.</b> Buracos: ${antes}. ${estrategia}-fit escolhe ${REG[estrategia]}: o de ${alvo.tam} KB (endereço ${alvo.ini}). ${sobra ? `Sobra um buraco de ${sobra} KB.` : 'Coube exato, sem sobra.'}`, cap: `buracos: ${lista() || 'nenhum'} KB · livre: ${livre()} KB` });
    } else {
      passos.push({ blocos: copia(), falhou: nome, nota: `<b>${nome} pede ${tam} KB e não cabe.</b> Buracos: ${lista()} KB, nenhum com ${tam}. Mas o total livre é ${livre()} KB, mais que o pedido: isso é <b>fragmentação externa</b>.`, cap: `${nome} (${tam} KB) recusado · livre: ${livre()} KB em ${buracos().length} pedaços` });
      /* compactação */
      let e = 0; const ocup = blocos.filter((b) => b.tipo !== 'livre').map((b) => { const nb = { ...b, ini: e }; e += b.tam; return nb; });
      blocos = [...ocup, { ini: e, tam: 64 - e, nome: null, tipo: 'livre' }];
      passos.push({ blocos: copia(), nota: `<b>Compactação.</b> O SO move os processos para o começo da memória (precisa de relocação dinâmica e para tudo enquanto copia). Os buracos viram um só, de ${64 - e} KB.`, cap: `buracos: ${lista()} KB · livre: ${livre()} KB` });
      const alvo2 = buracos()[0];
      const idx = blocos.indexOf(alvo2);
      blocos.splice(idx, 1, { ini: alvo2.ini, tam, nome, tipo: 'novo' }, ...(alvo2.tam > tam ? [{ ini: alvo2.ini + tam, tam: alvo2.tam - tam, nome: null, tipo: 'livre' }] : []));
      passos.push({ blocos: copia(), foco: nome, nota: `Agora ${nome} cabe. O preço foi mover os processos de lugar (até ${e - 8} KB copiados).`, cap: `buracos: ${lista() || 'nenhum'} KB · livre: ${livre()} KB` });
    }
  });
  const sobras = buracos().map((b) => b.tam);
  passos.push({ blocos: copia(), nota: `<b>Fim.</b> ${passos.some((p) => p.falhou) ? `${estrategia}-fit precisou de compactação.` : `${estrategia}-fit atendeu os quatro pedidos sem compactar.`} Buracos que sobraram: ${sobras.join(', ') || 'nenhum'} KB.${estrategia === 'best' ? ' Repare como são pequenos: best-fit deixa sobras que quase nunca servem a ninguém.' : ''}`, cap: `buracos finais: ${sobras.join(', ') || 'nenhum'} KB` });
  return passos;
}

(function () {
  const root = document.getElementById('fig-aloc');
  if (!root) return;
  const svg = document.getElementById('aloc-svg'), cap = document.getElementById('aloc-cap');
  let fig = null;
  const marcar = abas(root.querySelector('.fig-tabs'), [['first', 'First-fit'], ['best', 'Best-fit'], ['worst', 'Worst-fit']], (k, play) => { carregar(k); if (play) fig.play(); });
  const x0 = 20, W = 600, sx = W / 64, X = (a) => x0 + a * sx;
  function carregar(est) {
    marcar(est);
    const passos = alocar(est);
    const render = (k) => {
      const p = passos[k];
      svg.innerHTML = '';
      S('text', { x: x0, y: 30, class: 'sv-muted' }, svg, 'memória física (KB)');
      p.blocos.forEach((b) => {
        const est2 = b.tipo === 'so' ? 'fill:var(--surface2);stroke:var(--line2)' : b.tipo === 'p' ? 'fill:var(--blue-soft);stroke:var(--blue)' : b.tipo === 'novo' ? 'fill:var(--amber-soft);stroke:var(--amber)' : 'fill:var(--surface);stroke:var(--line2);stroke-dasharray:4 3';
        const foco = b.nome && b.nome === p.foco;
        S('rect', { x: X(b.ini), y: 50, width: b.tam * sx, height: 80, style: est2 + (foco ? ';stroke-width:3' : ';stroke-width:1.2') }, svg);
        const cx = X(b.ini) + b.tam * sx / 2;
        if (b.tam * sx > 26) {
          S('text', { x: cx, y: 82, class: 'sv-text', 'text-anchor': 'middle', 'font-size': 13 }, svg, b.nome || 'livre');
          S('text', { x: cx, y: 102, class: 'sv-muted', 'text-anchor': 'middle', 'font-size': 11 }, svg, `${b.tam}`);
        } else S('text', { x: cx, y: 90, class: 'sv-muted', 'text-anchor': 'middle', 'font-size': 10 }, svg, b.tipo === 'livre' ? b.tam : b.nome);
        S('text', { x: X(b.ini), y: 146, class: 'sv-muted', 'text-anchor': 'middle', 'font-size': 10 }, svg, b.ini);
      });
      S('text', { x: X(64), y: 146, class: 'sv-muted', 'text-anchor': 'middle', 'font-size': 10 }, svg, 64);
      /* fila de pedidos */
      const feitos = new Set(passos.slice(0, k + 1).map((x) => x.foco).filter(Boolean));
      const falhou = new Set(passos.slice(0, k + 1).map((x) => x.falhou).filter(Boolean));
      [['P1', 5], ['P2', 12], ['P3', 6], ['P4', 10]].forEach(([n, t], i) => {
        const x = x0 + i * 120, ok = feitos.has(n), bad = falhou.has(n) && !ok;
        S('rect', { x, y: 178, width: 104, height: 34, rx: 6, style: ok ? 'fill:var(--amber-soft);stroke:var(--amber)' : bad ? 'fill:var(--red-soft);stroke:var(--red)' : 'fill:var(--surface);stroke:var(--line2)' }, svg);
        S('text', { x: x + 52, y: 199, class: 'sv-text', 'text-anchor': 'middle', 'font-size': 13 }, svg, `${n} · ${t} KB ${ok ? '✓' : bad ? '✗' : ''}`);
      });
      S('text', { x: x0 + 490, y: 199, class: 'sv-muted', 'font-size': 11 }, svg, 'pedidos');
      cap.innerHTML = esc(p.cap);
    };
    const notes = passos.map((p) => p.nota);
    if (!fig) fig = new StepFig(root, { notes, render, speed: 2400 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  carregar('first');
})();

/* ============ Fig 3 · tradução de endereço e page fault ============ */
(function () {
  const root = document.getElementById('fig-trad');
  if (!root) return;
  const svg = document.getElementById('trad-svg'), cap = document.getElementById('trad-cap');
  const caixa = (x, y, w, h, titulo) => {
    const g = S('g', null, svg);
    const r = S('rect', { x, y, width: w, height: h, rx: 8, style: 'fill:var(--surface);stroke:var(--line2);stroke-width:1.3' }, g);
    S('text', { x: x + 8, y: y + 16, class: 'sv-muted', 'font-size': 11 }, g, titulo);
    return { g, r };
  };
  const pinta = (r, c) => r.setAttribute('style', c ? `fill:var(--${c}-soft);stroke:var(--${c});stroke-width:2.2` : 'fill:var(--surface);stroke:var(--line2);stroke-width:1.3');
  const cpu = caixa(10, 10, 130, 70, 'CPU');
  const cpuTxt = S('text', { x: 75, y: 40, class: 'sv-text', 'text-anchor': 'middle', 'font-size': 13 }, svg, '');
  const split = S('g', null, svg);
  const tlb = caixa(10, 120, 130, 100, 'TLB (pág → mold.)');
  const tlbLin = [];
  const TLB0 = [['2', '7'], ['0', '4'], ['6', '1']];
  for (let i = 0; i < 4; i++) tlbLin.push(S('text', { x: 75, y: 148 + i * 18, class: 'sv-text', 'text-anchor': 'middle', 'font-size': 12 }, svg, ''));
  const so = caixa(10, 240, 130, 50, 'kernel do SO');
  const soTxt = S('text', { x: 75, y: 278, class: 'sv-muted', 'text-anchor': 'middle', 'font-size': 11 }, svg, '');
  const pt = caixa(190, 10, 170, 280, 'tabela de páginas');
  S('text', { x: 210, y: 42, class: 'sv-muted', 'font-size': 10 }, svg, 'pág');
  S('text', { x: 262, y: 42, class: 'sv-muted', 'font-size': 10 }, svg, 'moldura');
  S('text', { x: 330, y: 42, class: 'sv-muted', 'font-size': 10 }, svg, 'V');
  const PT = [['4', 1], ['—', 0], ['7', 1], ['—', 0], ['—', 0], ['—', 0], ['1', 1], ['—', 0]];
  const ptRow = PT.map((_, i) => {
    const y = 50 + i * 29;
    const r = S('rect', { x: 200, y, width: 150, height: 25, rx: 4, style: 'fill:none;stroke:var(--line)' }, svg);
    S('text', { x: 214, y: y + 13, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 12 }, svg, i);
    const m = S('text', { x: 280, y: y + 13, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 12 }, svg, '');
    const v = S('text', { x: 333, y: y + 13, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 12 }, svg, '');
    return { r, m, v };
  });
  const mem = caixa(410, 10, 220, 200, 'memória física');
  const MEM = ['SO', 'pág 6', 'outro proc.', 'livre', 'pág 0', 'outro proc.', 'outro proc.', 'pág 2'];
  const memRow = MEM.map((_, i) => {
    const y = 30 + i * 22;
    const r = S('rect', { x: 420, y, width: 200, height: 19, rx: 3, style: 'fill:var(--surface2);stroke:var(--line)' }, svg);
    S('text', { x: 430, y: y + 10, class: 'sv-muted', 'dominant-baseline': 'central', 'font-size': 10 }, svg, `mold. ${i}`);
    const t = S('text', { x: 560, y: y + 10, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 11 }, svg, '');
    return { r, t };
  });
  const disco = caixa(410, 230, 220, 60, 'disco (área de paginação)');
  S('text', { x: 520, y: 272, class: 'sv-text', 'text-anchor': 'middle', 'font-size': 12 }, svg, 'pág 5 · pág 1 · pág 3 …');
  /* setas */
  const seta = (d) => S('path', { d, class: 'anim hide', style: 'fill:none;stroke:var(--accent);stroke-width:2', 'marker-end': 'url(#mnarrow)' }, svg);
  const A = {
    cpuTlb: seta('M75 80 V116'),
    tlbPt: seta('M140 170 H186'),
    ptSo: seta('M190 230 Q160 250 144 262'),
    soDisco: seta('M140 282 Q275 304 406 272'),
    discoMem: seta('M600 230 C640 200 640 110 624 106'),
    ptMem: seta('M360 199 Q390 120 416 100'),
    tlbMem: seta('M140 135 C170 135 170 4 300 4 S400 60 416 100'),
  };
  const passos = [
    { a: [], c: 'end. virtual = 20 500', n: 'A CPU executa uma instrução que lê o endereço virtual <b>20 500</b>. Páginas de 4 KB = 4 096 bytes.' },
    { a: [], c: 'pág = 20 500 div 4 096 = 5 · desl = 20 500 mod 4 096 = 20', n: 'A MMU parte o endereço: página 5, deslocamento 20. Em binário são só os 12 bits de baixo (deslocamento) e o resto (página).', split: true },
    { a: ['cpuTlb'], c: 'TLB: procura pág 5 → miss', n: 'Primeiro a <b>TLB</b>, a cache de traduções. A página 5 não está lá: <b>TLB miss</b>.', tlb: 'red', split: true },
    { a: ['cpuTlb', 'tlbPt'], c: 'tabela[5] → V = 0 → page fault', n: 'A MMU vai à tabela de páginas, entrada 5: <b>bit de validade 0</b>. A página não está na memória. A MMU gera uma interrupção: <b>page fault</b>.', row: [5, 'red'], split: true },
    { a: ['ptSo', 'soDisco'], c: 'SO: processo → espera · moldura livre = 3 · lê pág 5 do disco', n: 'O SO assume. Coloca o processo em espera, acha uma moldura livre (a 3; se não houvesse, escolheria uma vítima, seção 7) e pede ao disco a página 5. A leitura leva milissegundos: enquanto isso, outro processo usa a CPU.', so: 'amber', row: [5, 'red'], disco: 'amber', split: true },
    { a: ['discoMem'], c: 'disco → moldura 3 · interrupção de fim de E/S', n: 'O disco termina e copia a página para a moldura 3. O controlador gera uma interrupção avisando que acabou.', disco: 'amber', mold3: 'amber', split: true },
    { a: [], c: 'tabela[5] = (moldura 3, V = 1) · processo → pronto', n: 'O SO atualiza a entrada 5: moldura 3, bit de validade 1. O processo volta para a fila de prontos.', row: [5, 'green'], fix: true, mold3: 'amber', so: 'amber', split: true },
    { a: ['cpuTlb', 'tlbPt'], c: 'reexecuta a instrução · TLB miss · tabela[5] = 3 · TLB recebe 5 → 3', n: 'Quando o processo volta a rodar, a <b>mesma instrução</b> é executada de novo. TLB miss outra vez, mas agora a tabela tem a tradução, e ela é copiada para a TLB.', row: [5, 'green'], fix: true, tlbFix: true, tlb: 'amber', split: true },
    { a: ['ptMem'], c: 'físico = 3 × 4 096 + 20 = 12 308', n: 'Endereço físico = moldura × tamanho da página + deslocamento = 3 × 4 096 + 20 = <b>12 308</b>. O byte é lido.', fix: true, tlbFix: true, mold3: 'green', split: true, row: [5, 'green'] },
    { a: ['cpuTlb', 'tlbMem'], c: 'end. 20 504 = (5, 24) → TLB hit → 12 312', n: 'Logo depois a instrução seguinte lê 20 504, mesma página. <b>TLB hit</b>: físico = 12 288 + 24 = 12 312, sem tocar na tabela nem no disco. É a localidade pagando a conta.', fix: true, tlbFix: true, tlb: 'green', mold3: 'green', prox: true },
  ];
  new StepFig(root, {
    notes: passos.map((p) => p.n), speed: 2600,
    render(k) {
      const p = passos[k];
      Object.entries(A).forEach(([n, el]) => el.classList.toggle('hide', !p.a.includes(n)));
      cpuTxt.textContent = p.prox ? 'lê 20 504' : 'lê 20 500';
      split.innerHTML = '';
      if (p.split || p.prox) {
        const [pg, d] = p.prox ? [5, 24] : [5, 20];
        S('rect', { x: 18, y: 52, width: 46, height: 22, rx: 4, style: 'fill:var(--amber-soft);stroke:var(--amber)' }, split);
        S('text', { x: 41, y: 63, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 11 }, split, `pág ${pg}`);
        S('rect', { x: 66, y: 52, width: 68, height: 22, rx: 4, style: 'fill:var(--blue-soft);stroke:var(--blue)' }, split);
        S('text', { x: 100, y: 63, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 11 }, split, `desl ${d}`);
      }
      const tl = p.tlbFix ? [...TLB0, ['5', '3']] : TLB0;
      tlbLin.forEach((t, i) => { t.textContent = tl[i] ? `${tl[i][0]} → ${tl[i][1]}` : ''; t.style.fontWeight = tl[i] && tl[i][0] === '5' ? 700 : 400; });
      pinta(cpu.r, k === 0 || k === 1 ? 'blue' : null);
      pinta(tlb.r, p.tlb || null);
      pinta(so.r, p.so || null);
      soTxt.textContent = p.so ? (k === 4 ? 'trata o page fault' : 'atualiza a tabela') : '';
      pinta(disco.r, p.disco || null);
      pinta(pt.r, null);
      ptRow.forEach((r, i) => {
        const [m, v] = i === 5 && p.fix ? ['3', 1] : PT[i];
        r.m.textContent = m; r.v.textContent = v;
        const c = p.row && p.row[0] === i ? p.row[1] : null;
        r.r.setAttribute('style', c ? `fill:var(--${c}-soft);stroke:var(--${c});stroke-width:2` : 'fill:none;stroke:var(--line)');
      });
      memRow.forEach((r, i) => {
        r.t.textContent = i === 3 ? (p.mold3 ? 'pág 5' : 'livre') : MEM[i];
        const c = i === 3 && p.mold3 ? p.mold3 : null;
        r.r.setAttribute('style', c ? `fill:var(--${c}-soft);stroke:var(--${c});stroke-width:2` : i === 3 ? 'fill:var(--surface);stroke:var(--line2);stroke-dasharray:3 3' : 'fill:var(--surface2);stroke:var(--line)');
      });
      cap.textContent = p.c;
    },
  });
})();

/* ============ Fig 4 · substituição de páginas ============ */
export function substituir(alg, refs, nf) {
  const fr = Array(nf).fill(null), carga = Array(nf).fill(-1), uso = Array(nf).fill(-1), R = Array(nf).fill(0);
  let ptr = 0, faltas = 0;
  const passos = [];
  refs.forEach((pg, i) => {
    let j = fr.indexOf(pg), nota = '', vit = -1;
    const falta = j < 0;
    const ptrAntes = ptr;
    if (!falta) {
      uso[j] = i; R[j] = 1;
      nota = `<b>${pg}</b> já está na moldura ${j}: hit.`;
      if (alg === 'lru') nota += ' Vira a usada mais recentemente.';
      if (alg === 'clock') nota += ' Bit de referência = 1.';
    } else {
      faltas++;
      const vazia = fr.indexOf(null);
      if (vazia >= 0 && alg !== 'clock') { j = vazia; nota = `<b>${pg}</b>: page fault. Moldura ${j} está livre.`; }
      else if (alg === 'clock') {
        const pulos = [];
        while (fr[ptr] !== null && R[ptr] === 1) { pulos.push(fr[ptr]); R[ptr] = 0; ptr = (ptr + 1) % nf; }
        j = ptr; vit = fr[j];
        nota = `<b>${pg}</b>: page fault. ` + (vit === null ? `Ponteiro na moldura ${j}, livre.` : `${pulos.length ? `Ponteiro dá segunda chance a ${pulos.join(', ')} (R vira 0). ` : ''}Moldura ${j} tem a ${vit} com R = 0: vítima.`);
        ptr = (ptr + 1) % nf;
      } else {
        let cand = 0;
        if (alg === 'fifo') { cand = carga.indexOf(Math.min(...carga)); nota = `<b>${pg}</b>: page fault. FIFO tira a ${fr[cand]}, a que entrou primeiro (na ref. ${carga[cand] + 1}).`; }
        if (alg === 'lru') { cand = uso.indexOf(Math.min(...uso)); nota = `<b>${pg}</b>: page fault. LRU tira a ${fr[cand]}, usada há mais tempo (ref. ${uso[cand] + 1}).`; }
        if (alg === 'opt') {
          const prox = fr.map((p) => { const k = refs.indexOf(p, i + 1); return k < 0 ? Infinity : k; });
          cand = prox.indexOf(Math.max(...prox));
          nota = `<b>${pg}</b>: page fault. Ótimo olha o futuro e tira a ${fr[cand]}, ${prox[cand] === Infinity ? 'que nunca mais será usada' : `que só volta na ref. ${prox[cand] + 1}`}.`;
        }
        j = cand; vit = fr[j];
      }
      fr[j] = pg; carga[j] = i; uso[j] = i; R[j] = 1;
    }
    passos.push({ i, pg, falta, j, vit, fr: fr.slice(), R: R.slice(), ptr, ptrAntes, faltas, nota });
  });
  return { passos, faltas };
}

(function () {
  const root = document.getElementById('fig-subst');
  if (!root) return;
  const svg = document.getElementById('subst-svg'), cap = document.getElementById('subst-cap');
  const fIn = document.getElementById('s-f'), fV = document.getElementById('s-fv'), sel = document.getElementById('s-str');
  const STR = [[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2], [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]];
  const NOME = { fifo: 'FIFO', lru: 'LRU', opt: 'Ótimo', clock: 'Relógio' };
  let alg = 'fifo', fig = null;
  const marcar = abas(root.querySelector('.fig-tabs'), Object.entries(NOME), (k, play) => { alg = k; carregar(); if (play) fig.play(); });
  function carregar() {
    marcar(alg);
    const nf = +fIn.value, refs = STR[+sel.value];
    fV.textContent = nf;
    const { passos, faltas } = substituir(alg, refs, nf);
    const todos = Object.keys(NOME).map((a) => `${NOME[a]} ${substituir(a, refs, nf).faltas}`).join(' · ');
    const notes = [`String de referências: <code>${refs.join(' ')}</code>, ${nf} moldura${nf > 1 ? 's' : ''}, começando vazias. ${alg === 'clock' ? 'O ponteiro do relógio começa na moldura 0. ' : ''}Cada coluna é uma referência; F marca page fault.`, ...passos.map((p) => p.nota)];
    let fim = `<b>Total: ${faltas} page faults</b> em ${refs.length} referências (taxa ${num(faltas / refs.length * 100)}%). Com ${nf} molduras: ${todos}.`;
    if (+sel.value === 0 && alg === 'fifo') fim += nf === 3 ? ' Agora mude para 4 molduras: o FIFO vai dar <b>mais</b> page faults (anomalia de Belady).' : nf === 4 ? ' Com 3 molduras eram 9: mais memória, mais page faults. Anomalia de Belady.' : '';
    if (+sel.value === 2 && alg === 'lru' && nf < 4) fim += ' Laço maior que a memória: LRU sempre tira justamente a próxima a ser usada.';
    notes.push(fim);
    const n = refs.length, x0 = 50, cw = Math.min(46, (630 - x0) / n), y0 = 54, rh = 30;
    const render = (k) => {
      svg.innerHTML = '';
      const ate = Math.min(k, n);
      refs.forEach((r, i) => {
        const x = x0 + i * cw;
        S('text', { x: x + cw / 2, y: 30, class: 'sv-text', 'text-anchor': 'middle', 'font-size': 14, style: i === ate - 1 && k <= n ? 'font-weight:700;fill:var(--accent)' : i >= ate ? 'opacity:.4' : '' }, svg, r);
      });
      S('text', { x: 4, y: 30, class: 'sv-muted', 'font-size': 10 }, svg, 'ref.');
      for (let m = 0; m < nf; m++) S('text', { x: 4, y: y0 + m * rh + rh / 2 + 4, class: 'sv-muted', 'font-size': 10 }, svg, `mold ${m}`);
      passos.slice(0, ate).forEach((p, i) => {
        const x = x0 + i * cw, atual = i === ate - 1 && k <= n;
        p.fr.forEach((pg, m) => {
          const y = y0 + m * rh;
          let st = 'fill:var(--surface);stroke:var(--line)';
          if (m === p.j && p.falta) st = 'fill:var(--amber-soft);stroke:var(--amber);stroke-width:' + (atual ? 2.4 : 1);
          else if (m === p.j && !p.falta) st = 'fill:var(--green-soft);stroke:var(--green);stroke-width:' + (atual ? 2.4 : 1);
          S('rect', { x: x + 2, y: y + 2, width: cw - 4, height: rh - 4, rx: 4, style: st }, svg);
          if (pg !== null) S('text', { x: x + cw / 2, y: y + rh / 2 + 1, class: 'sv-text', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 13 }, svg, pg);
          if (alg === 'clock' && atual && pg !== null) S('text', { x: x + cw - 6, y: y + 9, class: 'sv-muted', 'text-anchor': 'end', 'font-size': 9 }, svg, `R${p.R[m]}`);
        });
        if (alg === 'clock' && atual) S('text', { x: x + 4, y: y0 + p.ptr * rh + 11, style: 'fill:var(--accent);font-weight:700', 'font-size': 10 }, svg, '▸');
        if (p.falta) S('text', { x: x + cw / 2, y: y0 + nf * rh + 16, 'text-anchor': 'middle', 'font-size': 13, style: 'fill:var(--red);font-weight:700;font-family:var(--f-mono)' }, svg, 'F');
      });
      S('text', { x: 4, y: y0 + nf * rh + 16, class: 'sv-muted', 'font-size': 10 }, svg, 'fault');
      const fz = ate ? passos[ate - 1].faltas : 0;
      cap.innerHTML = k > n ? `${NOME[alg]}, ${nf} molduras: ${faltas} page faults · ${esc(todos)}` : `${NOME[alg]} · ${nf} molduras · page faults até agora: ${fz}`;
    };
    svg.setAttribute('viewBox', `0 0 640 ${y0 + nf * rh + 34}`);
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1500 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  fIn.addEventListener('input', carregar);
  sel.addEventListener('change', () => { carregar(); fig.play(); });
  carregar();
})();

/* ============ Fig 5 · escalonamento de disco ============ */
export function disco(alg, cab, fila, max = 199) {
  const mov = [];
  if (alg === 'fcfs') fila.forEach((c) => mov.push({ c, tipo: 'req' }));
  if (alg === 'sstf') {
    const resta = fila.slice(); let pos = cab;
    while (resta.length) { let b = 0; resta.forEach((c, i) => { if (Math.abs(c - pos) < Math.abs(resta[b] - pos)) b = i; }); pos = resta[b]; mov.push({ c: pos, tipo: 'req' }); resta.splice(b, 1); }
  }
  const acima = fila.filter((c) => c >= cab).sort((a, b) => a - b), abaixo = fila.filter((c) => c < cab).sort((a, b) => a - b);
  if (alg === 'scan') { acima.forEach((c) => mov.push({ c, tipo: 'req' })); if (abaixo.length) { mov.push({ c: max, tipo: 'ponta' }); abaixo.reverse().forEach((c) => mov.push({ c, tipo: 'req' })); } }
  if (alg === 'cscan') { acima.forEach((c) => mov.push({ c, tipo: 'req' })); if (abaixo.length) { mov.push({ c: max, tipo: 'ponta' }); mov.push({ c: 0, tipo: 'volta' }); abaixo.forEach((c) => mov.push({ c, tipo: 'req' })); } }
  let pos = cab, total = 0, semVolta = 0;
  mov.forEach((m) => { m.de = pos; m.d = Math.abs(m.c - pos); total += m.d; if (m.tipo !== 'volta') semVolta += m.d; m.acum = total; pos = m.c; });
  return { mov, total, semVolta };
}

(function () {
  const root = document.getElementById('fig-disco');
  if (!root) return;
  const svg = document.getElementById('disco-svg'), cap = document.getElementById('disco-cap');
  const CAB = 70, FILA = [130, 20, 95, 180, 40, 150, 75, 10];
  const NOME = { fcfs: 'FCFS', sstf: 'SSTF', scan: 'SCAN', cscan: 'C-SCAN' };
  const REGRA = {
    fcfs: 'FCFS: atende na ordem em que os pedidos chegaram.',
    sstf: 'SSTF: atende sempre o pedido mais perto da posição atual da cabeça.',
    scan: 'SCAN (elevador): sobe atendendo tudo no caminho até a ponta (199), depois desce.',
    cscan: 'C-SCAN: sobe atendendo até a ponta, volta direto para o 0 sem atender ninguém e sobe de novo.',
  };
  let fig = null;
  const marcar = abas(root.querySelector('.fig-tabs'), Object.entries(NOME), (k, play) => { carregar(k); if (play) fig.play(); });
  const x0 = 30, x1 = 620, X = (c) => x0 + c * (x1 - x0) / 199;
  function carregar(alg) {
    marcar(alg);
    const R = disco(alg, CAB, FILA);
    const n = R.mov.length, dy = Math.min(26, 220 / n), Y = (i) => 58 + i * dy;
    const notes = [`Cabeça no cilindro <b>${CAB}</b>, indo para cima. Fila: ${FILA.join(', ')}. ${REGRA[alg]}`];
    R.mov.forEach((m) => {
      if (m.tipo === 'req') notes.push(`${m.de} → <b>${m.c}</b>: ${m.d} cilindros. Acumulado: ${m.acum}.`);
      if (m.tipo === 'ponta') notes.push(`${m.de} → <b>${m.c}</b>: vai até a ponta do disco sem pedido lá (${m.d} cilindros). Acumulado: ${m.acum}.`);
      if (m.tipo === 'volta') notes.push(`Retorno ${m.de} → <b>0</b> sem atender ninguém (${m.d} cilindros). É rápido por não parar, mas o braço anda. Acumulado: ${m.acum}.`);
    });
    notes.push(alg === 'cscan' ? `<b>Total: ${R.total} cilindros</b> contando o retorno, ${R.semVolta} sem ele. Os livros variam em contar ou não a volta; o ganho do C-SCAN é a espera mais uniforme.` : `<b>Total: ${R.total} cilindros.</b> Compare: FCFS 720 · SSTF 280 · SCAN 318 · C-SCAN 368 (169 sem o retorno).`);
    const render = (k) => {
      svg.innerHTML = '';
      S('line', { x1: x0, y1: 34, x2: x1, y2: 34, class: 'sv-edge' }, svg);
      for (let c = 0; c <= 199; c += 20) { S('line', { x1: X(c), y1: 30, x2: X(c), y2: 38, class: 'sv-edge' }, svg); S('text', { x: X(c), y: 22, class: 'sv-muted', 'text-anchor': 'middle', 'font-size': 10 }, svg, c); }
      S('text', { x: X(199), y: 22, class: 'sv-muted', 'text-anchor': 'middle', 'font-size': 10 }, svg, 199);
      const ate = Math.min(k, n);
      const feitos = new Set(R.mov.slice(0, ate).filter((m) => m.tipo === 'req').map((m) => m.c));
      FILA.forEach((c) => S('circle', { cx: X(c), cy: 34, r: 5, style: feitos.has(c) ? 'fill:var(--green);stroke:var(--green)' : 'fill:var(--surface);stroke:var(--amber);stroke-width:2' }, svg));
      S('path', { d: `M${X(CAB)} 40 l-5 -9 h10 z`, style: 'fill:var(--accent)' }, svg);
      let px = X(CAB), py = 50;
      S('circle', { cx: px, cy: py, r: 4, style: 'fill:var(--accent)' }, svg);
      S('text', { x: px + 8, y: py + 4, class: 'sv-muted', 'font-size': 10 }, svg, CAB);
      R.mov.slice(0, ate).forEach((m, i) => {
        const nx = X(m.c), ny = Y(i + 1);
        S('line', { x1: px, y1: py, x2: nx, y2: ny, style: `stroke:var(--accent);stroke-width:${i === ate - 1 && k <= n ? 2.6 : 1.6}${m.tipo === 'volta' ? ';stroke-dasharray:5 4;opacity:.6' : ''}` }, svg);
        S('circle', { cx: nx, cy: ny, r: 4, style: m.tipo === 'req' ? 'fill:var(--green)' : 'fill:var(--muted)' }, svg);
        S('text', { x: nx + (nx > 560 ? -8 : 8), y: ny + 4, class: 'sv-muted', 'text-anchor': nx > 560 ? 'end' : 'start', 'font-size': 10 }, svg, m.c);
        px = nx; py = ny;
      });
      S('text', { x: 4, y: 296, class: 'sv-muted', 'font-size': 10 }, svg, '↓ tempo (um pedido por linha)');
      const parc = ate ? R.mov[ate - 1].acum : 0;
      cap.textContent = `${NOME[alg]} · cilindros percorridos: ${k > n ? R.total : parc}${alg === 'cscan' && k > n ? ` (${R.semVolta} sem o retorno)` : ''}`;
    };
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1600 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  carregar('fcfs');
})();

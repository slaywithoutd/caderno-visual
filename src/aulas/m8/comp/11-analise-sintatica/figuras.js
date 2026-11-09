import { S, H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figuras e widget da aula 11. Os ids estão no consulta.html. */

/* ---------- utilidades ---------- */
/* regras: [[cabeça, [corpo1, corpo2…]], …], cada corpo é uma lista de símbolos ([] = ε) */
function regrasHTML(el, regras) {
  el.innerHTML = '';
  regras.forEach(([A, corpos]) => {
    const ln = H('div', { class: 'ln' });
    ln.appendChild(H('span', null, `${esc(A)} →`));
    corpos.forEach((c, j) => {
      if (j) ln.appendChild(H('span', { class: 'bar' }, '|'));
      ln.appendChild(H('span', { class: 'alt', 'data-r': `${A}#${j}` }, esc(c.length ? c.join(' ') : 'ε')));
    });
    el.appendChild(ln);
  });
}
const acender = (el, lista) => el.querySelectorAll('.alt').forEach((a) => a.classList.toggle('on', lista.includes(a.dataset.r)));
const conj = (s) => (s && s.length ? `{ ${s.join(', ')} }` : '∅');

/* ============ Fig 1: árvore de 3 * 2 ^ 4 ^ 5 + 3, de cima para baixo ============ */
(function () {
  const root = document.getElementById('fig-cascata');
  if (!root) return;
  const regras = [
    ['expr', [['expr', 'op1', 'termo'], ['termo']]],
    ['termo', [['termo', 'op2', 'fator'], ['fator']]],
    ['fator', [['num', 'op3', 'fator'], ['num']]],
  ];
  regrasHTML(document.getElementById('cas-regras'), regras);
  const V = (s, b, k = []) => ({ s, v: true, b, k });
  const T = (s, b) => ({ s, v: false, b, k: [] });
  const f45 = V('fator', 7, [T('4', 7), T('^', 7), V('fator', 8, [T('5', 8)])]);
  const f2 = V('fator', 6, [T('2', 6), T('^', 6), f45]);
  const arv = V('expr', 0, [
    V('expr', 1, [V('termo', 3, [V('termo', 4, [V('fator', 5, [T('3', 5)])]), T('*', 4), f2])]),
    T('+', 1),
    V('termo', 1, [V('fator', 2, [T('3', 2)])]),
  ]);
  /* layout: folhas em fila, pai no meio dos filhos */
  let x = 0; const nos = [];
  (function lay(n, d) {
    n.d = d; nos.push(n);
    if (!n.k.length) { n.x = x++; return; }
    n.k.forEach((c) => lay(c, d + 1));
    n.x = (n.k[0].x + n.k[n.k.length - 1].x) / 2;
  })(arv, 0);
  const DX = 62, DY = 50, X0 = 34, Y0 = 20;
  const svg = document.getElementById('cas-svg');
  svg.setAttribute('viewBox', `0 0 ${X0 * 2 + (x - 1) * DX} ${Y0 * 2 + 6 * DY}`);
  const gE = S('g', null, svg), gN = S('g', null, svg);
  nos.forEach((n) => {
    n.cx = X0 + n.x * DX; n.cy = Y0 + n.d * DY;
    if (n.v) {
      const w = n.s.length * 8 + 18;
      n.g = S('g', { class: 'wnode anim hide' }, gN);
      S('rect', { x: n.cx - w / 2, y: n.cy - 13, width: w, height: 26, rx: 6 }, n.g);
      S('text', { x: n.cx, y: n.cy }, n.g, n.s);
    } else {
      n.g = S('text', { x: n.cx, y: n.cy + 5, class: 'sv-text anim hide', 'text-anchor': 'middle' }, gN, n.s);
    }
  });
  nos.forEach((n) => n.k.forEach((c) => { c.e = S('line', { x1: n.cx, y1: n.cy + 13, x2: c.cx, y2: c.cy - (c.v ? 13 : 10), class: 'sv-edge anim hide' }, gE); }));
  const marca = new Set([f45, ...f45.k, ...f45.k[2].k]);
  const hl = [[], ['expr#0'], ['termo#1', 'fator#1'], ['expr#1'], ['termo#0'], ['termo#1', 'fator#1'], ['fator#0'], ['fator#0'], ['fator#1'], []];
  const notes = [
    'A cadeia é <code>3 * 2 ^ 4 ^ 5 + 3</code>. Comece pela raiz, <code>expr</code>. Aqui <code>num</code> e <code>op1</code>, <code>op2</code>, <code>op3</code> aparecem direto como o token.',
    'Há um + na cadeia, e o + só nasce em <code>expr → expr op1 termo</code>. Se você escolhesse <code>expr → termo</code>, nenhum + caberia mais embaixo: beco sem saída.',
    'À direita do + sobra só o 3: <code>termo → fator</code> e <code>fator → num</code>.',
    'À esquerda não há mais +. Então <code>expr → termo</code>.',
    'Há um *, e ele só nasce em <code>termo → termo op2 fator</code>.',
    'Antes do * sobra o 3: <code>termo → fator → num</code>.',
    'Depois do *: <code>2 ^ 4 ^ 5</code>. A potência só nasce em <code>fator → num op3 fator</code>, com a recursão à direita: o 2 fica sozinho e o resto vai para o fator de baixo.',
    'De novo <code>fator → num op3 fator</code>: o 4, o ^ e um fator para o 5.',
    'Por fim <code>fator → num</code>: o 5. Em nenhum passo havia duas regras possíveis.',
    'Leia de baixo para cima: 4 ^ 5 primeiro (em destaque), depois 2 ^ (4 ^ 5), depois 3 * …, e só no fim + 3. Precedência e associatividade saem da forma da árvore.',
  ];
  const regEl = document.getElementById('cas-regras');
  new StepFig(root, { notes, speed: 2200, render(k) {
    acender(regEl, hl[k]);
    nos.forEach((n) => {
      const vis = n.b <= k;
      n.g.classList.toggle('hide', !vis);
      if (n.e) n.e.classList.toggle('hide', !vis);
      if (n.v) { n.g.classList.toggle('new', n.b === k && k > 0); n.g.classList.toggle('hl', k === 9 && marca.has(n)); }
    });
  } });
})();

/* ============ Fig 2: FIRST e FOLLOW passo a passo ============ */
(function () {
  const root = document.getElementById('fig-ff');
  if (!root) return;
  const regras = [
    ['E', [['T', 'E′']]], ['E′', [['+', 'T', 'E′'], []]], ['T', [['F', 'T′']]], ['T′', [['*', 'F', 'T′'], []]], ['F', [['(', 'E', ')'], ['id']]],
  ];
  const regEl = document.getElementById('ff-regras');
  regrasHTML(regEl, regras);
  const vars = ['E', 'E′', 'T', 'T′', 'F'];
  /* cada passo: [nota, regras acesas, conjunto, variável, elementos novos] */
  const passos = [
    ['A gramática de expressões sem recursão à esquerda. Primeiro o FIRST de cada variável, depois o FOLLOW.', [], null],
    ['<code>F → ( E ) | id</code>: os dois corpos começam com terminal. FIRST(F) = { (, id }.', ['F#0', 'F#1'], ['first', 'F', ['(', 'id']]],
    ['<code>T → F T′</code>: começa com F, que não some. FIRST(T) = FIRST(F).', ['T#0'], ['first', 'T', ['(', 'id']]],
    ['<code>E → T E′</code>: começa com T, que não some. FIRST(E) = FIRST(T).', ['E#0'], ['first', 'E', ['(', 'id']]],
    ['<code>E′ → + T E′ | ε</code>: um corpo começa com +, o outro é vazio. FIRST(E′) = { +, ε }.', ['E′#0', 'E′#1'], ['first', 'E′', ['+', 'ε']]],
    ['<code>T′ → * F T′ | ε</code>: FIRST(T′) = { *, ε }.', ['T′#0', 'T′#1'], ['first', 'T′', ['*', 'ε']]],
    ['Agora FOLLOW. E é a inicial: $ entra. E aparece em <code>F → ( E )</code> com ) depois: ) entra. FOLLOW(E) = { ), $ }.', ['F#0'], ['follow', 'E', [')', '$']]],
    ['E′ aparece no fim de <code>E → T E′</code>: tudo de FOLLOW(E) entra em FOLLOW(E′). (Em <code>E′ → + T E′</code> ele recebe o próprio FOLLOW, que não acrescenta nada.)', ['E#0', 'E′#0'], ['follow', 'E′', [')', '$']]],
    ['T vem antes de E′ em <code>E → T E′</code>: FIRST(E′) sem ε, o +, entra. Como E′ pode sumir, FOLLOW(E) também entra.', ['E#0', 'E′#0'], ['follow', 'T', ['+', ')', '$']]],
    ['T′ está no fim de <code>T → F T′</code>: FOLLOW(T′) recebe FOLLOW(T).', ['T#0', 'T′#0'], ['follow', 'T′', ['+', ')', '$']]],
    ['F vem antes de T′ em <code>T → F T′</code>: entra o * (FIRST(T′) sem ε) e, como T′ some, FOLLOW(T) inteiro.', ['T#0', 'T′#0'], ['follow', 'F', ['*', '+', ')', '$']]],
    ['Mais uma volta por todas as regras não muda nada: é o ponto fixo. Repare que nenhum FOLLOW tem ε e que todos os FIRST com ε vêm de regras vazias.', [], null],
  ];
  const tab = document.getElementById('ff-tab');
  tab.innerHTML = `<thead><tr><th></th><th>FIRST</th><th>FOLLOW</th></tr></thead><tbody>${vars.map((v) => `<tr><th>${v}</th><td data-c="first-${v}"></td><td data-c="follow-${v}"></td></tr>`).join('')}</tbody>`;
  new StepFig(root, { notes: passos.map((p) => p[0]), speed: 2400, render(k) {
    acender(regEl, passos[k][1]);
    tab.querySelectorAll('td').forEach((td) => { td.innerHTML = ''; td.style.background = ''; });
    passos.slice(0, k + 1).forEach((p, j) => {
      if (!p[2]) return;
      const [qual, v, el] = p[2];
      const td = tab.querySelector(`[data-c="${qual}-${v}"]`);
      td.innerHTML = j === k ? `<b>${esc(conj(el))}</b>` : esc(conj(el));
      if (j === k) td.style.background = 'var(--amber-soft)';
    });
  } });
})();

/* ============ Fig 3: preditivo LL(1) com pilha ============ */
(function () {
  const root = document.getElementById('fig-ll');
  if (!root) return;
  const terms = ['id', '+', '*', '(', ')', '$'], vars = ['E', 'E′', 'T', 'T′', 'F'];
  const M = {
    E: { id: ['T', 'E′'], '(': ['T', 'E′'] },
    'E′': { '+': ['+', 'T', 'E′'], ')': [], $: [] },
    T: { id: ['F', 'T′'], '(': ['F', 'T′'] },
    'T′': { '+': [], '*': ['*', 'F', 'T′'], ')': [], $: [] },
    F: { id: ['id'], '(': ['(', 'E', ')'] },
  };
  const corpo = (r) => (r.length ? r.join(' ') : 'ε');
  const tab = document.getElementById('ll-tab'), fita = document.getElementById('ll-fita'), well = document.getElementById('ll-pilha'),
    acao = document.getElementById('ll-acao'), cad = document.getElementById('ll-regras'), tabs = root.querySelector('.fig-tabs');
  tab.innerHTML = `<thead><tr><th></th>${terms.map((t) => `<th>${esc(t)}</th>`).join('')}</tr></thead><tbody>${vars.map((v) => `<tr><th>${v}</th>${terms.map((t) => `<td data-c="${v}|${t}" style="white-space:nowrap;padding:4px 6px;font-size:.78rem">${M[v][t] ? esc(`${v} → ${corpo(M[v][t])}`) : ''}</td>`).join('')}</tr>`).join('')}</tbody>`;
  function simular(entrada) {
    const w = [...entrada, '$']; let pilha = ['$', 'E'], i = 0; const passos = [], regras = [];
    passos.push({ pilha: pilha.slice(), i, cel: null, txt: 'início', regras: [], note: `Entrada <code>${esc(entrada.join(' '))} $</code>. A pilha começa com a variável inicial E em cima do $.` });
    for (let g = 0; g < 60; g++) {
      const X = pilha[pilha.length - 1], a = w[i];
      if (X === '$' && a === '$') { passos.push({ pilha: pilha.slice(), i, cel: null, txt: 'aceita', regras: regras.slice(), note: 'Topo $ e entrada $: aceita. As regras anotadas, nessa ordem, são a derivação mais à esquerda da cadeia.' }); break; }
      if (!vars.includes(X)) {
        if (X === a) { pilha.pop(); i++; passos.push({ pilha: pilha.slice(), i, cel: null, txt: `casa ${X}`, regras: regras.slice(), note: `Topo é o terminal <code>${esc(X)}</code>, igual ao token: desempilha e avança na entrada.` }); continue; }
        passos.push({ pilha: pilha.slice(), i, cel: null, txt: 'erro', regras: regras.slice(), erro: true, note: `Topo é o terminal <code>${esc(X)}</code> e o token é <code>${esc(a)}</code>: erro sintático.` }); break;
      }
      const r = M[X][a];
      if (!r) { passos.push({ pilha: pilha.slice(), i, cel: `${X}|${a}`, txt: 'erro', regras: regras.slice(), erro: true, note: `Topo <code>${esc(X)}</code>, token <code>${esc(a)}</code>: a célula M[${esc(X)}, ${esc(a)}] está vazia. Erro sintático, sem tentar mais nada.` }); break; }
      pilha.pop(); for (let j = r.length - 1; j >= 0; j--) pilha.push(r[j]);
      regras.push(`${X} → ${corpo(r)}`);
      passos.push({ pilha: pilha.slice(), i, cel: `${X}|${a}`, txt: `${X} → ${corpo(r)}`, regras: regras.slice(),
        note: `Topo <code>${esc(X)}</code>, token <code>${esc(a)}</code>: M[${esc(X)}, ${esc(a)}] = <code>${esc(X)} → ${esc(corpo(r))}</code>. Desempilha ${esc(X)} e empilha ${r.length ? 'o corpo ao contrário, com ' + esc(r[0]) + ' no topo' : 'nada (corpo vazio)'}.` });
    }
    return { w, passos };
  }
  const abas = [['id + id * id', ['id', '+', 'id', '*', 'id']], ['id + * id (erro)', ['id', '+', '*', 'id']]];
  let fig = null;
  function carregar(q) {
    tabs.querySelectorAll('.btn').forEach((b, j) => b.classList.toggle('sel', j === q));
    const { w, passos } = simular(abas[q][1]);
    fita.innerHTML = ''; const cells = w.map((t) => { const c = H('div', { class: 'cell' + (t === '$' ? ' endmark' : '') }, esc(t)); fita.appendChild(c); return c; });
    const render = (k) => {
      const p = passos[k];
      cells.forEach((c, j) => { c.classList.toggle('done', j < p.i); c.classList.toggle('head', j === p.i); });
      tab.querySelectorAll('td').forEach((td) => { td.style.background = td.dataset.c === p.cel ? (p.erro ? 'var(--red-soft)' : 'var(--amber-soft)') : ''; });
      well.innerHTML = '';
      p.pilha.slice().reverse().forEach((s) => well.appendChild(H('div', { class: 'sitem' + (s === '$' ? ' bottom' : '') }, esc(s))));
      acao.innerHTML = p.erro ? `<span class="bad">${esc(p.txt)}</span>` : p.txt === 'aceita' ? `<span class="ok">aceita</span>` : esc(p.txt);
      cad.innerHTML = p.regras.length ? p.regras.map((r, j) => (j === p.regras.length - 1 ? `<b>${esc(r)}</b>` : esc(r))).join(' · ') : 'regras aplicadas aparecem aqui';
    };
    const notes = passos.map((p) => p.note);
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1700 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  abas.forEach((a, q) => { const b = H('button', { class: 'btn sm' }, esc(a[0])); b.addEventListener('click', () => { carregar(q); fig.play(); }); tabs.appendChild(b); });
  carregar(0);
})();

/* ============ Fig 4: analisador LR com a tabela ============ */
(function () {
  const root = document.getElementById('fig-lr');
  if (!root) return;
  const regras = [null, ['E', ['E', '+', 'T']], ['E', ['T']], ['T', ['T', '*', 'F']], ['T', ['F']], ['F', ['(', 'E', ')']], ['F', ['id']]];
  const terms = ['id', '+', '*', '(', ')', '$'], nts = ['E', 'T', 'F'];
  const A = [
    { id: 's5', '(': 's4' }, { '+': 's6', $: 'acc' }, { '+': 'r2', '*': 's7', ')': 'r2', $: 'r2' }, { '+': 'r4', '*': 'r4', ')': 'r4', $: 'r4' },
    { id: 's5', '(': 's4' }, { '+': 'r6', '*': 'r6', ')': 'r6', $: 'r6' }, { id: 's5', '(': 's4' }, { id: 's5', '(': 's4' },
    { '+': 's6', ')': 's11' }, { '+': 'r1', '*': 's7', ')': 'r1', $: 'r1' }, { '+': 'r3', '*': 'r3', ')': 'r3', $: 'r3' }, { '+': 'r5', '*': 'r5', ')': 'r5', $: 'r5' },
  ];
  const G = [{ E: 1, T: 2, F: 3 }, {}, {}, {}, { E: 8, T: 2, F: 3 }, {}, { T: 9, F: 3 }, { F: 10 }, {}, {}, {}, {}];
  const tab = document.getElementById('lr-tab'), fita = document.getElementById('lr-fita'), pil = document.getElementById('lr-pilha'),
    acao = document.getElementById('lr-acao'), tabs = root.querySelector('.fig-tabs');
  const td = (c, t) => `<td data-c="${c}" style="padding:3px 6px;font-size:.78rem;text-align:center">${t || ''}</td>`;
  tab.innerHTML = `<thead><tr><th></th>${[...terms, ...nts].map((t) => `<th style="text-align:center;padding:4px 6px">${esc(t)}</th>`).join('')}</tr></thead><tbody>${A.map((linha, s) => `<tr><th style="padding:3px 6px">${s}</th>${terms.map((t) => td(`${s}|${t}`, linha[t])).join('')}${nts.map((n) => td(`${s}|${n}`, G[s][n])).join('')}</tr>`).join('')}</tbody>`;
  const corpo = (r) => r.join(' ');
  function simular(entrada) {
    const w = [...entrada, '$']; const est = [0], sim = []; let i = 0; const passos = [];
    passos.push({ est: est.slice(), sim: sim.slice(), i, cels: [], txt: 'início', note: `Entrada <code>${esc(entrada.join(' '))} $</code>. A pilha começa com o estado 0.` });
    for (let g = 0; g < 60; g++) {
      const s = est[est.length - 1], a = w[i], act = A[s][a];
      if (!act) { passos.push({ est: est.slice(), sim: sim.slice(), i, cels: [`${s}|${a}`], txt: 'erro', erro: true, note: `Estado ${s}, token <code>${esc(a)}</code>: célula vazia. Erro sintático.` }); break; }
      if (act === 'acc') { passos.push({ est: est.slice(), sim: sim.slice(), i, cels: [`${s}|${a}`], txt: 'aceita', note: `Estado ${s} com $: acc. A cadeia está na linguagem.` }); break; }
      if (act[0] === 's') {
        const t = +act.slice(1); est.push(t); sim.push(a); i++;
        passos.push({ est: est.slice(), sim: sim.slice(), i, cels: [`${s}|${a}`], txt: `shift ${t}`, note: `Estado ${s}, token <code>${esc(a)}</code>: ação ${act}. Empilha o estado ${t} e avança na entrada.` });
      } else {
        const j = +act.slice(1), [cab, rhs] = regras[j];
        est.splice(est.length - rhs.length); sim.splice(sim.length - rhs.length);
        const t = est[est.length - 1], novo = G[t][cab]; est.push(novo); sim.push(cab);
        passos.push({ est: est.slice(), sim: sim.slice(), i, cels: [`${s}|${a}`, `${t}|${cab}`], txt: `reduce ${cab} → ${corpo(rhs)}`,
          note: `Estado ${s}, token <code>${esc(a)}</code>: ação ${act}, regra ${j}: <code>${esc(cab)} → ${esc(corpo(rhs))}</code>. Desempilha ${rhs.length} estado${rhs.length > 1 ? 's' : ''}; o topo vira ${t}; transição[${t}, ${esc(cab)}] = ${novo}. A entrada não anda.` });
      }
    }
    return { w, passos };
  }
  const abas = [['id * id + id', ['id', '*', 'id', '+', 'id']], ['( id (erro)', ['(', 'id']]];
  let fig = null;
  function carregar(q) {
    tabs.querySelectorAll('.btn').forEach((b, j) => b.classList.toggle('sel', j === q));
    const { w, passos } = simular(abas[q][1]);
    fita.innerHTML = ''; const cells = w.map((t) => { const c = H('div', { class: 'cell' + (t === '$' ? ' endmark' : '') }, esc(t)); fita.appendChild(c); return c; });
    const render = (k) => {
      const p = passos[k];
      cells.forEach((c, j) => { c.classList.toggle('done', j < p.i); c.classList.toggle('head', j === p.i); });
      tab.querySelectorAll('td').forEach((x) => { const n = p.cels.indexOf(x.dataset.c); x.style.background = n < 0 ? '' : p.erro ? 'var(--red-soft)' : n === 0 ? 'var(--amber-soft)' : 'var(--blue-soft)'; });
      pil.innerHTML = `<span>estados</span><span>${p.est.join(' ')}</span><span>símbolos</span><span>${esc(p.sim.join(' ')) || '(vazio)'}</span>`;
      acao.innerHTML = p.erro ? `<span class="bad">erro</span>` : p.txt === 'aceita' ? `<span class="ok">aceita</span>` : esc(p.txt);
    };
    const notes = passos.map((p) => p.note);
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1800 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  abas.forEach((a, q) => { const b = H('button', { class: 'btn sm' }, esc(a[0])); b.addEventListener('click', () => { carregar(q); fig.play(); }); tabs.appendChild(b); });
  carregar(0);
})();

/* ============ Fig 5: autômato LR(0) da gramática do Thain ============ */
(function () {
  const root = document.getElementById('fig-slr');
  if (!root) return;
  regrasHTML(document.getElementById('slr-regras'), [['P', [['E']]], ['E', [['E', '+', 'T'], ['T']]], ['T', [['id', '(', 'E', ')'], ['id']]]]);
  const box = document.getElementById('slr-estados');
  const est = {
    0: [['P → ·E'], ['E → ·E + T', 'E → ·T', 'T → ·id ( E )', 'T → ·id'], 'id: s4 · E: g1 · T: g8'],
    1: [['P → E·', 'E → E· + T'], [], '+: s2 · $: aceita'],
    8: [['E → T·'], [], 'reduce E → T em +, ), $'],
    4: [['T → id· ( E )', 'T → id·'], [], '(: s5 · reduce T → id em +, ), $'],
    2: [['E → E +· T'], ['T → ·id ( E )', 'T → ·id'], 'id: s4 · T: g3'],
    3: [['E → E + T·'], [], 'reduce E → E + T em +, ), $'],
    5: [['T → id (· E )'], ['E → ·E + T', 'E → ·T', 'T → ·id ( E )', 'T → ·id'], 'id: s4 · E: g6 · T: g8'],
    6: [['T → id ( E· )', 'E → E· + T'], [], '): s7 · +: s2'],
    7: [['T → id ( E )·'], [], 'reduce T → id ( E ) em +, ), $'],
  };
  const ordem = [0, 1, 8, 4, 2, 3, 5, 6, 7];
  const cards = {};
  ordem.forEach((n) => {
    const c = H('div', { class: 'cfg', style: 'white-space:normal;font-size:.8rem;line-height:1.5' });
    c.innerHTML = `<div class="lbl">estado ${n}</div><div class="nucleo">${est[n][0].map(esc).join('<br>')}</div><div class="fecho" style="color:var(--muted)">${est[n][1].map(esc).join('<br>')}</div><div class="acoes" style="margin-top:4px;border-top:1px dashed var(--line2);padding-top:4px"><b>${esc(est[n][2])}</b></div>`;
    box.appendChild(c); cards[n] = c;
  });
  /* passo: [nota, estados visíveis até aqui (prefixo de ordem), estado atual, fechamento do 0 visível?] */
  const passos = [
    ['Acrescente a regra P → E. O estado 0 começa com o núcleo <code>P → ·E</code>: "espero um programa inteiro, não li nada".', 1, 0, false],
    ['Fechamento: o ponto está antes de E, então entram as regras de E com o ponto no começo. Em <code>E → ·T</code> o ponto está antes de T: entram as regras de T. Os itens novos aparecem em cinza.', 1, 0, true],
    ['Do estado 0, ande o ponto por cima de E: <code>P → E·</code> e <code>E → E· + T</code>. É o estado 1. Com $ à frente ele aceita; com +, segue.', 2, 1, true],
    ['Do 0 por T: <code>E → T·</code>, estado 8. Ponto no fim: um reduce.', 3, 8, true],
    ['Do 0 por id: <code>T → id· ( E )</code> e <code>T → id·</code>, estado 4. Aqui moram um shift (o () e um reduce: o conflito que a SLR resolve com FOLLOW(T).', 4, 4, true],
    ['Do 1 por +: <code>E → E +· T</code>, e o fechamento puxa as regras de T. Estado 2.', 5, 2, true],
    ['Do 2 por T: <code>E → E + T·</code>, estado 3. Do 2 por id o conjunto é o do estado 4, que já existe: a seta volta para ele.', 6, 3, true],
    ['Do 4 por (: <code>T → id (· E )</code>. O fechamento puxa E, e E puxa T. Estado 5.', 7, 5, true],
    ['Do 5 por E: <code>T → id ( E· )</code> e <code>E → E· + T</code>, estado 6. Do 5 por T cai no 8; por id, no 4.', 8, 6, true],
    ['Do 6 por ): <code>T → id ( E )·</code>, estado 7. Do 6 por + cai no 2. Nove estados, nenhum novo: o autômato está pronto.', 9, 7, true],
    ['Agora a tabela: transição por terminal vira shift, por variável vira goto, e cada item com o ponto no fim vira reduce nas colunas do FOLLOW da cabeça. FOLLOW(E) = FOLLOW(T) = { +, ), $ }. Nenhuma célula ficou com duas ações: a gramática é SLR.', 9, null, true],
  ];
  new StepFig(root, { notes: passos.map((p) => p[0]), speed: 2600, render(k) {
    const [, nvis, atual, fecho0] = passos[k];
    ordem.forEach((n, j) => {
      const c = cards[n];
      c.style.display = j < nvis ? '' : 'none';
      c.style.borderColor = n === atual ? 'var(--amber)' : '';
      c.style.background = n === atual ? 'var(--amber-soft)' : '';
      c.querySelector('.fecho').style.display = n === 0 && !fecho0 ? 'none' : '';
      c.querySelector('.acoes').style.display = k === passos.length - 1 ? '' : 'none';
    });
  } });
})();

/* ============ Widget: FIRST, FOLLOW e tabela LL(1) de qualquer gramática ============ */
(function () {
  const sel = document.getElementById('llw-sel'), txt = document.getElementById('llw-txt');
  if (!sel || !txt) return;
  const ffEl = document.getElementById('llw-ff'), tabEl = document.getElementById('llw-tab'), ver = document.getElementById('llw-ver');
  const exemplos = [
    ['Expressões sem recursão à esquerda', "E -> T E'\nE' -> + T E' | ε\nT -> F T'\nT' -> * F T' | ε\nF -> ( E ) | id"],
    ['Expressões com recursão à esquerda', 'E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id'],
    ['Else pendente (fatorado)', "S -> i E t S S' | a\nS' -> e S | ε\nE -> b"],
    ['Mogensen: T → R | a T c, R → ε | R b R', 'T -> R | a T c\nR -> ε | R b R'],
    ['Projeto (aula 08) transformada', "PROG -> CMD PROG'\nPROG' -> PROG | ε\nCMD -> IDENTIFICADOR ATRIBUICAO EXPR PONTOVIRGULA\nEXPR -> SOMA EXPR'\nEXPR' -> OPREL SOMA | ε\nSOMA -> TERMO SOMA'\nSOMA' -> OPSOMA TERMO SOMA' | ε\nTERMO -> FATOR TERMO'\nTERMO' -> OPMUL FATOR TERMO' | ε\nFATOR -> ABREPAR EXPR FECHAPAR | IDENTIFICADOR | INTEIRO"],
    ['Treino 4 (fatorada)', "S -> a S'\nS' -> S b | b"],
  ];
  exemplos.forEach(([n], j) => sel.appendChild(H('option', { value: j }, esc(n))));
  function ler(texto) {
    const regras = [], ordem = [];
    for (const linha of texto.split('\n')) {
      const l = linha.trim(); if (!l) continue;
      const m = l.match(/^(\S+)\s*(?:->|→|::=)\s*(.*)$/);
      if (!m) throw new Error(`Não entendi a linha: ${l}`);
      const A = m[1]; if (!ordem.includes(A)) ordem.push(A);
      m[2].split('|').forEach((alt) => regras.push([A, alt.trim().split(/\s+/).filter((s) => s && s !== 'ε' && s !== 'eps')]));
    }
    if (!regras.length) throw new Error('Escreva pelo menos uma regra.');
    return { regras, vars: ordem };
  }
  function calcular({ regras, vars }) {
    const isV = (s) => vars.includes(s);
    const terms = []; regras.forEach(([, c]) => c.forEach((s) => { if (!isV(s) && !terms.includes(s)) terms.push(s); }));
    const nul = {}, first = {}, follow = {};
    vars.forEach((v) => { nul[v] = false; first[v] = new Set(); follow[v] = new Set(); });
    const firstSeq = (seq) => { const r = new Set(); let tudo = true; for (const s of seq) { if (!isV(s)) { r.add(s); tudo = false; break; } first[s].forEach((x) => r.add(x)); if (!nul[s]) { tudo = false; break; } } return [r, tudo]; };
    let mudou = true;
    while (mudou) {
      mudou = false;
      for (const [A, c] of regras) {
        const [f, n] = firstSeq(c);
        if (n && !nul[A]) { nul[A] = true; mudou = true; }
        f.forEach((x) => { if (!first[A].has(x)) { first[A].add(x); mudou = true; } });
      }
    }
    follow[vars[0]].add('$');
    mudou = true;
    while (mudou) {
      mudou = false;
      for (const [A, c] of regras) c.forEach((B, i) => {
        if (!isV(B)) return;
        const [f, n] = firstSeq(c.slice(i + 1));
        f.forEach((x) => { if (!follow[B].has(x)) { follow[B].add(x); mudou = true; } });
        if (n) follow[A].forEach((x) => { if (!follow[B].has(x)) { follow[B].add(x); mudou = true; } });
      });
    }
    const cols = [...terms, '$'], M = {};
    vars.forEach((v) => { M[v] = {}; cols.forEach((t) => { M[v][t] = []; }); });
    for (const [A, c] of regras) {
      const [f, n] = firstSeq(c);
      const add = (t) => { const r = `${A} → ${c.length ? c.join(' ') : 'ε'}`; if (!M[A][t].includes(r)) M[A][t].push(r); };
      f.forEach(add); if (n) follow[A].forEach(add);
    }
    return { vars, cols, nul, first, follow, M };
  }
  const lista = (s, eps) => { const a = [...s]; if (eps) a.push('ε'); return a.length ? a.map(esc).join(', ') : '∅'; };
  function atualizar() {
    let r;
    try { r = calcular(ler(txt.value)); } catch (e) { ffEl.innerHTML = ''; tabEl.innerHTML = ''; ver.className = 'verdict bad'; ver.textContent = e.message; return; }
    const { vars, cols, nul, first, follow, M } = r;
    ffEl.innerHTML = `<div class="tbl" style="margin:0"><table><thead><tr><th>variável</th><th>anulável</th><th>FIRST</th><th>FOLLOW</th></tr></thead><tbody>${vars.map((v) => `<tr><th>${esc(v)}</th><td>${nul[v] ? 'sim' : 'não'}</td><td>${lista(first[v], nul[v])}</td><td>${lista(follow[v])}</td></tr>`).join('')}</tbody></table></div>`;
    let conflitos = 0;
    tabEl.innerHTML = `<div class="tbl" style="margin:0"><table><thead><tr><th></th>${cols.map((t) => `<th>${esc(t)}</th>`).join('')}</tr></thead><tbody>${vars.map((v) => `<tr><th>${esc(v)}</th>${cols.map((t) => { const c = M[v][t]; if (c.length > 1) conflitos++; return `<td style="white-space:nowrap;font-size:.78rem;padding:4px 6px;${c.length > 1 ? 'background:var(--red-soft)' : ''}">${c.map(esc).join('<br>')}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
    ver.className = 'verdict ' + (conflitos ? 'bad' : 'ok');
    ver.textContent = conflitos ? `Não é LL(1): ${conflitos} célula(s) com mais de uma regra (em vermelho).` : 'É LL(1): nenhuma célula tem duas regras. Células vazias são erro sintático.';
  }
  sel.addEventListener('change', () => { txt.value = exemplos[+sel.value][1]; atualizar(); });
  txt.addEventListener('input', atualizar);
  txt.value = exemplos[0][1]; atualizar();
})();

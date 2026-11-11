import { H, esc } from '../../../../lib/dom.js';
import { drawMachine } from '../../../../lib/machine.js';
import { ler, aceita, comparar, rastroAF, computacoesAP, palavras, mostra } from './motor.js';
import { exercicios, descrever } from './gabarito.js';
import { pyex, PREP, HARNESS } from './pyex.js';

const $ = (id) => document.getElementById(id);
const guarda = {
  get(k) { try { return localStorage.getItem('cv13:' + k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem('cv13:' + k, v); } catch { /* sem armazenamento */ } },
};

/* ---------- desenho de um autômato lido do texto ---------- */
function rotuloAP(t) { return `${t.le || 'ε'}, ${t.tira || 'ε'} → ${t.poe || 'ε'}`; }

function desenhar(svg, m, pos) {
  const estados = [...m.estados];
  if (!pos) {
    const n = estados.length, W = 600, Hh = 300;
    pos = {};
    if (n <= 5) estados.forEach((q, i) => { pos[q] = { x: 70 + i * ((W - 140) / Math.max(1, n - 1)), y: Hh / 2 }; });
    else estados.forEach((q, i) => { const a = Math.PI + (2 * Math.PI * i) / n; pos[q] = { x: W / 2 + 225 * Math.cos(a), y: Hh / 2 + 100 * Math.sin(a) }; });
  }
  const pares = new Map();
  for (const t of m.trans) {
    const k = `${t.de}>${t.para}`;
    if (!pares.has(k)) pares.set(k, []);
    const r = m.tipo === 'ap' ? rotuloAP(t) : (t.s || 'ε');
    if (!pares.get(k).includes(r)) pares.get(k).push(r);
  }
  const edges = [];
  for (const [k, labs] of pares) {
    const [from, to] = k.split('>');
    const volta = from !== to && pares.has(`${to}>${from}`);
    const texto = m.tipo === 'ap' ? labs : [labs.join(', ')];
    edges.push({ from, to, bend: volta ? 26 : (pos[from] && pos[to] && Math.abs(pos[from].y - pos[to].y) < 2 && Math.abs(estados.indexOf(from) - estados.indexOf(to)) > 1 ? 50 : 0), labels: texto.map((text) => ({ text, k: '' })) });
  }
  drawMachine(svg, {
    states: estados.map((q) => ({ id: q, x: pos[q].x, y: pos[q].y, start: q === m.inicial, accept: m.finais.has(q), loopDir: pos[q].y > 170 ? 'down' : 'up' })),
    edges,
  });
}

function desenharFixo(id, texto, tipo, pos, bends = {}) {
  const svg = $(id); if (!svg) return;
  const { m } = ler(texto, tipo);
  const pares = new Map();
  for (const t of m.trans) {
    const k = `${t.de}>${t.para}`;
    if (!pares.has(k)) pares.set(k, []);
    const r = tipo === 'ap' ? rotuloAP(t) : t.s;
    if (!pares.get(k).includes(r)) pares.get(k).push(r);
  }
  const edges = [...pares].map(([k, labs]) => {
    const [from, to] = k.split('>');
    return { from, to, bend: bends[k] || 0, labels: (tipo === 'ap' ? labs : [labs.join(', ')]).map((text) => ({ text, k: '' })) };
  });
  drawMachine(svg, {
    states: Object.entries(pos).map(([q, p]) => ({ id: q, x: p[0], y: p[1], start: q === m.inicial, accept: m.finais.has(q), loopDir: p[2] || 'up' })),
    edges,
  });
}

/* ---------- diagramas das seções ---------- */
const D2A = descrever.find((d) => d.id === 'd2a').texto;
desenharFixo('maq-d2a', D2A, 'afd',
  { q1: [60, 160], q2: [200, 80], q3: [200, 250, 'down'], q4: [470, 250, 'down'], q5: [470, 80] },
  { 'q4>q5': 18, 'q5>q4': 18, 'q2>q4': 30, 'q3>q5': 30 });

desenharFixo('maq-1101', exercicios.find((e) => e.id === 'l5d').resposta, 'afd',
  { q0: [60, 100], q1: [180, 100], q2: [300, 100], q3: [420, 100], q4: [540, 100] },
  { 'q1>q0': -34, 'q4>q2': -50, 'q3>q0': -110, 'q4>q0': -175 });

const AP1 = descrever.find((d) => d.id === 'dp1').texto;
desenharFixo('maq-ap1', AP1, 'ap', { q1: [130, 130], q2: [390, 130] });
desenharFixo('maq-p2a', exercicios.find((e) => e.id === 'p2a').resposta, 'ap', { q1: [110, 120], q2: [330, 120] });

/* ---------- computações do AP do exercício 1 ---------- */
function linhaComputacao(r, m) {
  const cfg = r.cam.map(([q, s, p]) => `(${q}, ${s || 'ε'}, ${p || 'ε'})`).join(' ⊢ ');
  const [q, s] = r.cam[r.cam.length - 1];
  const pq = r.aceita ? '<span class="ok">aceita</span>'
    : s ? '<span class="bad">para sem ler tudo</span>'
      : !m.finais.has(q) ? `<span class="bad">para: ${esc(q)} não é final</span>`
        : '<span class="bad">para com a pilha cheia</span>';
  return `<div class="cfg">${esc(cfg)} ${pq}</div>`;
}
(function () {
  const inp = $('cp-w'), out = $('cp-out'), pre = $('cp-pre'); if (!inp) return;
  const { m } = ler(AP1, 'ap');
  function run() {
    const w = inp.value.replace(/[^ab]/g, '');
    const cs = computacoesAP(m, w, 'ambos', 14);
    const ok = cs.some((r) => r.aceita);
    out.innerHTML = cs.map((r) => linhaComputacao(r, m)).join('') +
      `<p class="verdict ${ok ? 'ok' : 'bad'}">${mostra(w)} ${ok ? '∈' : '∉'} L(M): ${cs.length} computaç${cs.length > 1 ? 'ões' : 'ão'}, ${ok ? 'uma aceita' : 'nenhuma aceita'}.</p>`;
  }
  ['aba', 'aa', 'abb', 'baa', 'bab', 'baaaa'].forEach((w) => {
    const b = H('button', { class: 'btn sm', type: 'button' }, w);
    b.addEventListener('click', () => { inp.value = w; run(); });
    pre.appendChild(b);
  });
  inp.addEventListener('input', run); run();
})();

/* ---------- treino: escreva o autômato ---------- */
(function () {
  const sel = $('tr-ex'); if (!sel) return;
  const txt = $('tr-txt'), out = $('tr-out'), enun = $('tr-enun'), svg = $('tr-svg'), modoRow = $('tr-modo-row'), modo = $('tr-modo');
  const wIn = $('tr-w'), wOut = $('tr-w-out'), rastro = $('tr-rastro');
  const nomes = { afd: 'AFD', afn: 'AFN', ap: 'AP' };
  exercicios.forEach((e, i) => sel.appendChild(H('option', { value: i }, `${e.fonte === 'lista' ? 'lista' : 'autoral'} · ${nomes[e.tipo]} · ${esc(e.titulo)}`)));
  let ex = exercicios[0], m = null;

  const modelo = (e) => (e.tipo === 'ap' ? 'inicial q1\nfinais q2\n# de lê desempilha -> para empilha\n' : 'inicial q0\nfinais \n# de símbolo para\n');
  const inicial = (e) => guarda.get('af:' + e.id) || modelo(e);
  function carregar() {
    ex = exercicios[+sel.value];
    enun.innerHTML = `<b>${nomes[ex.tipo]}</b> sobre Σ = {${[...ex.alfabeto].join(', ')}}. ${esc(ex.titulo)}.`;
    modoRow.style.display = ex.tipo === 'ap' ? '' : 'none';
    txt.value = inicial(ex);
    out.className = 'answer'; out.textContent = 'Escreva o autômato e clique em Testar.';
    rastro.innerHTML = ''; wOut.textContent = '';
    atualizarDesenho();
  }
  function atualizarDesenho() {
    const r = ler(txt.value, ex.tipo); m = r.erros.length ? null : r.m;
    if (!m || !m.estados.size) { svg.innerHTML = ''; return r; }
    if (m.estados.size > 14) { svg.innerHTML = ''; return r; }
    desenhar(svg, m);
    return r;
  }
  function testar() {
    guarda.set('af:' + ex.id, txt.value);
    const r = atualizarDesenho();
    if (r.erros.length) { out.className = 'verdict bad'; out.innerHTML = '<b>O texto tem problema:</b><br>' + r.erros.map(esc).join('<br>'); return; }
    const max = ex.alfabeto.length === 2 ? (ex.tipo === 'ap' ? 9 : 10) : (ex.tipo === 'ap' ? 6 : 7);
    const c = comparar(r.m, ex.alvo, [...ex.alfabeto], max, modo.value);
    const fora = [...r.m.trans].flatMap((t) => [t.s, t.le].filter((x) => x && !ex.alfabeto.includes(x)));
    const avisoAlf = fora.length ? `<br><small>Atenção: símbolo fora do alfabeto: ${esc([...new Set(fora)].join(', '))}.</small>` : '';
    let avisoAFD = '';
    if (ex.tipo === 'afd') {
      const falta = [...r.m.estados].flatMap((q) => [...ex.alfabeto].filter((a) => !r.m.trans.some((t) => t.de === q && t.s === a)).map((a) => `δ(${q}, ${a})`));
      if (falta.length) avisoAFD = `<br><small>Seu AFD não é completo: falta ${esc(falta.slice(0, 6).join(', '))}${falta.length > 6 ? '…' : ''}. Na prova, desenhe o estado de erro ou diga que as setas que faltam vão para ele.</small>`;
    }
    if (!c.sobra.length && !c.falta.length) {
      out.className = 'verdict ok';
      out.innerHTML = `<b>Passou.</b> Acertou as ${c.total} palavras de comprimento até ${max}.${avisoAFD}${avisoAlf}`;
    } else {
      out.className = 'verdict bad';
      const lista = (xs) => xs.slice(0, 8).map((w) => `<code>${esc(mostra(w))}</code>`).join(' ');
      out.innerHTML = `<b>Errou ${c.sobra.length + c.falta.length} de ${c.total} palavras.</b>` +
        (c.sobra.length ? `<br>Aceita e não devia: ${lista(c.sobra)}` : '') +
        (c.falta.length ? `<br>Rejeita e devia aceitar: ${lista(c.falta)}` : '') +
        `<br><small>Rode uma delas abaixo para ver o caminho.</small>${avisoAFD}${avisoAlf}`;
      wIn.value = mostra((c.sobra[0] ?? c.falta[0]));
      rodarPalavra();
    }
  }
  function rodarPalavra() {
    const r = ler(txt.value, ex.tipo);
    if (r.erros.length) { wOut.textContent = ''; rastro.innerHTML = ''; return; }
    const w = wIn.value === 'ε' ? '' : wIn.value.trim();
    const ok = aceita(r.m, w, modo.value);
    wOut.innerHTML = `<b class="${ok ? 'ok' : 'bad'}">${ok ? 'aceita' : 'rejeita'}</b>; a linguagem pede: <b>${ex.alvo(w) ? 'aceitar' : 'rejeitar'}</b>`;
    if (ex.tipo === 'ap') {
      const cs = computacoesAP(r.m, w, modo.value, 16).sort((a, b) => b.aceita - a.aceita).slice(0, 8);
      rastro.innerHTML = cs.map((x) => linhaComputacao(x, r.m)).join('');
    } else {
      const passos = rastroAF(r.m, w);
      rastro.innerHTML = `<div class="cfg">${passos.map((p, i) => `${i ? `<span class="tm">${esc(w[i - 1])}</span> → ` : ''}{${esc(p.join(', '))}}`).join(' ')}</div>`;
    }
  }
  sel.addEventListener('change', carregar);
  $('tr-run').addEventListener('click', testar);
  $('tr-dica').addEventListener('click', () => { out.className = 'answer'; out.innerHTML = '<b>Dica.</b> ' + esc(ex.dica); });
  $('tr-resp').addEventListener('click', () => {
    if (!confirm('Mostrar uma resposta? O seu texto vai para a área de transferência antes, se o navegador deixar.')) return;
    try { navigator.clipboard?.writeText(txt.value); } catch { /* sem área de transferência */ }
    txt.value = ex.resposta; testar();
  });
  $('tr-limpa').addEventListener('click', () => { guarda.set('af:' + ex.id, ''); carregar(); });
  txt.addEventListener('input', () => { guarda.set('af:' + ex.id, txt.value); atualizarDesenho(); });
  modo.addEventListener('change', () => { if (ex.tipo === 'ap') testar(); });
  wIn.addEventListener('input', rodarPalavra);
  carregar();
})();

/* ---------- treino: qual é a linguagem? ---------- */
function tabelaHTML(m, alfabeto) {
  if (m.tipo === 'ap') {
    const linhas = m.trans.map((t) => `<tr><td>${t.de}</td><td>${t.le || 'ε'}</td><td>${t.tira || 'ε'}</td><td>(${t.para}, ${t.poe || 'ε'})</td></tr>`).join('');
    return `<div class="tbl prose"><table><thead><tr><th>estado</th><th>entrada</th><th>topo da pilha</th><th>transições</th></tr></thead><tbody>${linhas}</tbody></table></div>`;
  }
  const cols = [...alfabeto];
  const cel = (q, a) => {
    const ds = m.trans.filter((t) => t.de === q && t.s === a).map((t) => t.para);
    return m.tipo === 'afd' ? (ds[0] || '–') : (ds.length ? `{${ds.join(', ')}}` : '∅');
  };
  const linhas = [...m.estados].map((q) => `<tr><td>${q === m.inicial ? '→ ' : ''}${m.finais.has(q) ? '* ' : ''}${q}</td>${cols.map((a) => `<td>${cel(q, a)}</td>`).join('')}</tr>`).join('');
  return `<div class="tbl prose"><table><thead><tr><th>δ</th>${cols.map((a) => `<th>${a}</th>`).join('')}</tr></thead><tbody>${linhas}</tbody></table></div><p class="tm-status">→ inicial, * final</p>`;
}
(function () {
  const box = $('ds'); if (!box) return;
  descrever.forEach((d) => {
    const texto = d.texto ?? descrever.find((x) => x.id === d.base).texto.replace(/^finais.*$/m, 'finais ' + d.finais);
    const { m } = ler(texto, d.tipo);
    const el = H('details', { class: 'ds-item' });
    el.innerHTML = `<summary>${esc(d.titulo)}</summary>
      ${tabelaHTML(m, d.alfabeto)}
      <div class="wrow"><button class="btn sm" type="button">Palavras aceitas até ${d.alfabeto.length === 2 ? 6 : 4} símbolos</button></div>
      <div class="tks"></div>
      <details class="ds-resp"><summary>Uma resposta</summary><p>${esc(d.resposta)}</p></details>`;
    el.querySelector('button').addEventListener('click', () => {
      const ws = palavras([...d.alfabeto], d.alfabeto.length === 2 ? 6 : 4).filter((w) => aceita(m, w, 'ambos'));
      el.querySelector('.tks').innerHTML = ws.slice(0, 60).map((w) => `<span class="tk">${esc(mostra(w))}</span>`).join('') + (ws.length > 60 ? `<span class="tk eof">+${ws.length - 60}</span>` : '') + (ws.length ? '' : '<span class="tk eof">nenhuma</span>');
    });
    box.appendChild(el);
  });
})();

/* ---------- treino de código: Pyodide num worker (dá para matar um laço infinito) ---------- */
(function () {
  const sel = $('py-ex'); if (!sel) return;
  const txt = $('py-txt'), out = $('py-out'), enun = $('py-enun'), status = $('py-status'), btn = $('py-run');
  const CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  const FONTE = `importScripts('${CDN}pyodide.js');
let py = null;
self.onmessage = async (e) => {
  try {
    if (!py) { py = await loadPyodide({ indexURL: '${CDN}' }); }
    py.globals.set('_codigo', e.data.codigo);
    py.globals.set('_testes', e.data.testes);
    py.globals.set('_prep', e.data.prep);
    self.postMessage({ r: py.runPython(e.data.harness) });
  } catch (err) { self.postMessage({ falha: String(err) }); }
};`;
  let worker = null, carregado = false;
  const novoWorker = () => { worker = new Worker(URL.createObjectURL(new Blob([FONTE], { type: 'text/javascript' }))); carregado = false; };

  pyex.forEach((e, i) => sel.appendChild(H('option', { value: i }, esc(e.titulo))));
  let ex = pyex[0];
  function carregar() {
    ex = pyex[+sel.value];
    enun.innerHTML = ex.enunciado;
    txt.value = guarda.get('py:' + ex.id) ?? ex.inicio;
    out.className = 'answer'; out.textContent = 'Os resultados aparecem aqui.';
  }
  function mostrar(r) {
    if (r.sintaxe) { out.className = 'verdict bad'; out.innerHTML = `<b>Erro de sintaxe</b> na ${esc(r.sintaxe)}. No desafio, isto vale zero.`; return; }
    if (r.carga) { out.className = 'verdict bad'; out.innerHTML = `<b>O código quebrou ao carregar:</b> ${esc(r.carga)}`; return; }
    const ok = r.res.filter((t) => t[1]).length;
    out.className = 'verdict ' + (ok === r.res.length ? 'ok' : 'bad');
    out.innerHTML = `<b>${ok} de ${r.res.length} testes passaram.</b><ul class="b py-res">` + r.res.map(([nome, passou, obt, esp]) =>
      `<li><b class="${passou ? 'ok' : 'bad'}">${passou ? '✓' : '✗'}</b> ${esc(nome)}${passou ? '' : `<br><small>obtido: <code>${esc(obt)}</code> · esperado: <code>${esc(esp)}</code></small>`}</li>`).join('') + '</ul>';
  }
  function rodar() {
    guarda.set('py:' + ex.id, txt.value);
    if (!worker) novoWorker();
    btn.disabled = true;
    status.textContent = carregado ? 'rodando…' : 'baixando o Python (só na primeira vez)…';
    const limite = setTimeout(() => {
      worker.terminate(); worker = null; btn.disabled = false; status.textContent = '';
      out.className = 'verdict bad';
      out.innerHTML = carregado ? '<b>Estourou o tempo (10 s).</b> Provável laço infinito: um <code>while</code> que não avança ou um AP que empilha para sempre.' : '<b>Não deu para baixar o Python.</b> Confira a conexão e tente de novo.';
    }, carregado ? 10000 : 90000);
    worker.onmessage = (e) => {
      clearTimeout(limite); carregado = true; btn.disabled = false; status.textContent = '';
      if (e.data.falha) { out.className = 'verdict bad'; out.innerHTML = `<b>Falha ao rodar:</b> ${esc(e.data.falha)}`; return; }
      mostrar(JSON.parse(e.data.r));
    };
    worker.postMessage({ codigo: txt.value, testes: JSON.stringify(ex.testes), prep: PREP, harness: HARNESS });
  }
  txt.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { e.preventDefault(); const s = txt.selectionStart; txt.setRangeText('    ', s, txt.selectionEnd, 'end'); }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); rodar(); }
  });
  txt.addEventListener('input', () => guarda.set('py:' + ex.id, txt.value));
  sel.addEventListener('change', carregar);
  btn.addEventListener('click', rodar);
  $('py-resp').addEventListener('click', () => {
    if (!confirm('Mostrar uma resposta no lugar do seu código?')) return;
    try { navigator.clipboard?.writeText(txt.value); } catch { /* sem área de transferência */ }
    txt.value = ex.resposta; rodar();
  });
  $('py-zera').addEventListener('click', () => { txt.value = ex.inicio; guarda.set('py:' + ex.id, ex.inicio); out.className = 'answer'; out.textContent = 'Os resultados aparecem aqui.'; });
  carregar();
})();

/* ---------- relógio do simulado ---------- */
(function () {
  const t = $('sim-t'), go = $('sim-go'); if (!t) return;
  let resta = 3600, timer = null;
  const pinta = () => { t.textContent = `${String(Math.floor(resta / 60)).padStart(2, '0')}:${String(resta % 60).padStart(2, '0')}`; t.classList.toggle('fim', resta <= 480); };
  go.addEventListener('click', () => {
    if (timer) { clearInterval(timer); timer = null; go.textContent = 'Continuar'; return; }
    go.textContent = 'Pausar';
    timer = setInterval(() => { resta = Math.max(0, resta - 1); pinta(); if (!resta) { clearInterval(timer); timer = null; go.textContent = 'Acabou'; } }, 1000);
  });
  $('sim-zera').addEventListener('click', () => { clearInterval(timer); timer = null; resta = 3600; go.textContent = 'Começar'; pinta(); });
  pinta();
})();

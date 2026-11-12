/* Versão objetiva do Desafio 1: moldes desenhados, "qual máquina?", "qual é a linguagem?" e
   "construa o autômato". O motor (leitura do texto, simulação, comparação) é o da aula 13. */
import { H, esc } from '../../../../lib/dom.js';
import { drawMachine } from '../../../../lib/machine.js';
import { ler, aceita, comparar, rastroAF, computacoesAP, palavras, mostra } from '../13-desafio-automatos/motor.js';
import { classificar, leitura, construir, moldes } from './banco.js';

const $ = (id) => document.getElementById(id);
const guarda = {
  get(k) { try { return localStorage.getItem('cv14:' + k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem('cv14:' + k, v); } catch { /* sem armazenamento */ } },
};
const NOMES = { afd: 'AFD', afn: 'AFN', ap: 'AP' };
const MODOS = { ambos: 'estado final e pilha vazia (o da lista)', final: 'só estado final' };
const alfTxt = (a) => `{${[...a].join(', ')}}`;

/* ---------- desenho ----------
   Estados em linha (ordem dada ou a de aparição) ou em posições fixas. Arestas entre estados
   vizinhos com volta se afastam; arestas que pulam estados viram arcos (para frente por cima,
   para trás por baixo). */
const rotuloAP = (t) => `${t.le || 'ε'}, ${t.tira || 'ε'} → ${t.poe || 'ε'}`;
export function desenharItem(svg, m, { pos, ordem, bends = {}, vb } = {}) {
  if (vb) svg.setAttribute('viewBox', vb);
  const [, , W, Hh] = (svg.getAttribute('viewBox') || '0 0 600 260').split(/\s+/).map(Number);
  const estados = ordem || [...m.estados];
  let P = {};
  if (pos) P = Object.fromEntries(Object.entries(pos).map(([q, p]) => [q, { x: p[0], y: p[1], dir: p[2] || 'up' }]));
  else {
    const n = estados.length, y = Math.round(Hh * 0.62);
    estados.forEach((q, i) => { P[q] = { x: n === 1 ? W / 2 : 60 + i * ((W - 120) / (n - 1)), y, dir: 'up' }; });
  }
  [...m.estados].forEach((q, i) => { if (!P[q]) P[q] = { x: 60 + i * 60, y: Hh - 40, dir: 'down' }; });
  const idx = (q) => estados.indexOf(q);
  const pares = new Map();
  for (const t of m.trans) {
    const k = `${t.de}>${t.para}`;
    if (!pares.has(k)) pares.set(k, []);
    const r = m.tipo === 'ap' ? rotuloAP(t) : (t.s || 'ε');
    if (!pares.get(k).includes(r)) pares.get(k).push(r);
  }
  const edges = [...pares].map(([k, labs]) => {
    const [from, to] = k.split('>');
    let bend = 0;
    if (k in bends) bend = bends[k];
    else if (from !== to) {
      const mesmaLinha = Math.abs(P[from].y - P[to].y) < 2, d = Math.abs(idx(from) - idx(to));
      if (mesmaLinha && !pos && d > 1) bend = -(40 + 30 * (d - 2));
      else if (pares.has(`${to}>${from}`)) bend = 20;
    }
    return { from, to, bend, labels: (m.tipo === 'ap' ? labs : [labs.join(', ')]).map((text) => ({ text, k: '' })) };
  });
  drawMachine(svg, {
    states: Object.entries(P).filter(([q]) => m.estados.has(q)).map(([q, p]) => ({ id: q, x: p.x, y: p.y, start: q === m.inicial, accept: m.finais.has(q), loopDir: p.dir })),
    edges,
  });
}

function tabelaHTML(m, alfabeto) {
  if (m.tipo === 'ap') {
    const linhas = m.trans.map((t) => `<tr><td>${esc(t.de)}</td><td>${esc(t.le || 'ε')}</td><td>${esc(t.tira || 'ε')}</td><td>(${esc(t.para)}, ${esc(t.poe || 'ε')})</td></tr>`).join('');
    return `<div class="tbl prose"><table><thead><tr><th>estado</th><th>lê</th><th>topo</th><th>(vai para, empilha)</th></tr></thead><tbody>${linhas}</tbody></table></div>`;
  }
  const cols = [...alfabeto, ...(m.trans.some((t) => t.s === '') ? [''] : [])];
  const cel = (q, a) => {
    const ds = m.trans.filter((t) => t.de === q && t.s === a).map((t) => t.para);
    return m.tipo === 'afd' ? (ds[0] || '–') : (ds.length ? `{${ds.join(', ')}}` : '∅');
  };
  const linhas = [...m.estados].map((q) => `<tr><td>${q === m.inicial ? '→ ' : ''}${m.finais.has(q) ? '* ' : ''}${esc(q)}</td>${cols.map((a) => `<td>${esc(cel(q, a))}</td>`).join('')}</tr>`).join('');
  return `<div class="tbl prose"><table><thead><tr><th>δ</th>${cols.map((a) => `<th>${a || 'ε'}</th>`).join('')}</tr></thead><tbody>${linhas}</tbody></table></div><p class="tm-status">→ inicial · * final${m.tipo === 'afd' ? '' : ' · ∅ = o ramo morre'}</p>`;
}

function linhaComputacao(r, m) {
  const cfg = r.cam.map(([q, s, p]) => `(${q}, ${s || 'ε'}, ${p || 'ε'})`).join(' ⊢ ');
  const [q, s] = r.cam[r.cam.length - 1];
  const pq = r.aceita ? '<span class="ok">aceita</span>'
    : s ? '<span class="bad">para sem ler tudo</span>'
      : !m.finais.has(q) ? `<span class="bad">para: ${esc(q)} não é final</span>`
        : '<span class="bad">para com a pilha cheia</span>';
  return `<div class="cfg">${esc(cfg)} ${pq}</div>`;
}
function rastroHTML(m, w, modo) {
  if (m.tipo === 'ap') {
    const cs = computacoesAP(m, w, modo, 16).sort((a, b) => b.aceita - a.aceita).slice(0, 6);
    return cs.map((x) => linhaComputacao(x, m)).join('');
  }
  const passos = rastroAF(m, w);
  return `<div class="cfg">${passos.map((p, i) => `${i ? `<span class="tm">${esc(w[i - 1])}</span> → ` : ''}{${esc(p.join(', '))}}`).join(' ')}</div>`;
}

/* ---------- moldes nas seções ---------- */
document.querySelectorAll('[data-moldes]').forEach((fig) => {
  const tipo = fig.dataset.moldes;
  const grade = H('div', { class: 'moldes' });
  for (const mo of moldes[tipo]) {
    const { m } = ler(mo.texto, tipo);
    const card = H('div', { class: 'molde' });
    card.innerHTML = `<div class="molde-t">${esc(mo.t)}</div><svg role="img" aria-label="${esc(NOMES[tipo] + ' para ' + mo.t)}"></svg><div class="molde-leg">${esc(mo.leg)}</div>`;
    desenharItem(card.querySelector('svg'), m, mo);
    grade.appendChild(card);
  }
  fig.prepend(grade);
});

/* ---------- treino 1: qual máquina? ---------- */
(function () {
  const box = $('cl'); if (!box) return;
  const placar = $('cl-placar');
  const OPS = [['af', 'AFD / AFN (regular)'], ['ap', 'AP (não regular)'], ['nenhum', 'nenhum dos dois']];
  const ROT = Object.fromEntries(OPS);
  let feitos = {};
  try { feitos = JSON.parse(guarda.get('cl') || '{}'); } catch { feitos = {}; }
  const pinta = () => {
    const v = Object.values(feitos);
    placar.textContent = `${v.filter((x) => x === 1).length} certas de primeira, ${v.length} de ${classificar.length} respondidas`;
  };
  classificar.forEach((it, i) => {
    const li = H('li', { class: 'cl-item' });
    li.innerHTML = `<span class="cl-l">${esc(it.l)}</span><span class="cl-ops"></span><span class="cl-x"></span>`;
    const ops = li.querySelector('.cl-ops'), x = li.querySelector('.cl-x');
    OPS.forEach(([v, rot]) => {
      const b = H('button', { class: 'btn sm', type: 'button' }, rot);
      b.addEventListener('click', () => {
        const certo = v === it.r;
        b.classList.add(certo ? 'ok' : 'bad');
        if (!(i in feitos)) { feitos[i] = certo ? 1 : 0; guarda.set('cl', JSON.stringify(feitos)); pinta(); }
        if (certo) { ops.querySelectorAll('button').forEach((o) => { o.disabled = true; }); x.innerHTML = `<b class="ok">${esc(ROT[it.r])}.</b> ${esc(it.x)}`; }
        else x.innerHTML = `<b class="bad">Não.</b> Tente de novo.`;
      });
      ops.appendChild(b);
    });
    box.appendChild(li);
  });
  $('cl-zera').addEventListener('click', () => {
    feitos = {}; guarda.set('cl', '{}');
    box.querySelectorAll('button').forEach((b) => { b.disabled = false; b.classList.remove('ok', 'bad'); });
    box.querySelectorAll('.cl-x').forEach((x) => { x.innerHTML = ''; });
    pinta();
  });
  pinta();
})();

/* ---------- treino 2: qual é a linguagem? ---------- */
function embaralha(xs, semente) {
  let h = 0; for (const c of semente) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const a = xs.map((x, i) => [x, i]);
  for (let i = a.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
(function () {
  const sel = $('lt-ex'); if (!sel) return;
  const enun = $('lt-enun'), svg = $('lt-svg'), tab = $('lt-tab'), ops = $('lt-ops'), out = $('lt-out');
  const wIn = $('lt-w'), wOut = $('lt-w-out'), rastro = $('lt-rastro'), lista = $('lt-lista'), placar = $('lt-placar');
  let ok = {};
  try { ok = JSON.parse(guarda.get('lt') || '{}'); } catch { ok = {}; }
  const grupos = {};
  leitura.forEach((it, i) => {
    if (!grupos[it.tipo]) { grupos[it.tipo] = H('optgroup', { label: NOMES[it.tipo] }); sel.appendChild(grupos[it.tipo]); }
    grupos[it.tipo].appendChild(H('option', { value: i }, ''));
  });
  const rotular = () => [...sel.options].forEach((o) => { const it = leitura[+o.value]; o.textContent = `${ok[it.id] === 1 ? '✓ ' : ok[it.id] === 0 ? '· ' : ''}${it.titulo}`; });
  const pinta = () => { const v = Object.values(ok); placar.textContent = `${v.filter((x) => x === 1).length} de ${leitura.length} certas de primeira`; rotular(); };
  let it, m, modo;

  function carregar() {
    it = leitura[+sel.value]; modo = it.modo || 'ambos';
    m = ler(it.texto, it.tipo).m;
    enun.innerHTML = `<b>${NOMES[it.tipo]}</b> sobre Σ = ${esc(alfTxt(it.alf))}${it.tipo === 'ap' ? `. Critério de aceitação: <b>${esc(MODOS[modo])}</b>` : ''}. Qual é L(M)?`;
    svg.setAttribute('viewBox', it.vb || '0 0 600 260');
    desenharItem(svg, m, { pos: it.pos, ordem: it.ordem || undefined, bends: it.bends, vb: it.vb || '0 0 600 260' });
    tab.innerHTML = tabelaHTML(m, it.alf);
    out.className = 'answer'; out.innerHTML = 'Escreva a sua resposta no papel antes de escolher. Use a caixa de palavras para testar a sua hipótese.';
    wIn.value = ''; wOut.textContent = ''; rastro.innerHTML = ''; lista.innerHTML = '';
    ops.innerHTML = '';
    let errou = false;
    embaralha(it.ops, it.id).forEach(([[texto, f], i]) => {
      const b = H('button', { class: 'btn op', type: 'button' }, esc(texto));
      b.addEventListener('click', () => {
        if (i === 0) {
          b.classList.add('ok');
          ops.querySelectorAll('button').forEach((o) => { o.disabled = true; });
          out.className = 'verdict ok';
          out.innerHTML = `<b>Isso.</b> ${esc(it.exp)}`;
          if (!(it.id in ok)) { ok[it.id] = errou ? 0 : 1; guarda.set('lt', JSON.stringify(ok)); pinta(); }
          return;
        }
        errou = true;
        b.classList.add('bad'); b.disabled = true;
        const ws = palavras([...it.alf], it.alf.length === 2 ? 9 : 6);
        const w = ws.find((x) => aceita(m, x, modo) !== f(x));
        const ac = aceita(m, w, modo);
        out.className = 'verdict bad';
        out.innerHTML = `<b>Não.</b> Veja a palavra <code>${esc(mostra(w))}</code>: a opção diz que ela ${f(w) ? 'está' : 'não está'} em L, mas o autômato ${ac ? 'aceita' : 'rejeita'}. Rode ela na caixa abaixo para ver o caminho.`;
        wIn.value = mostra(w); rodar();
        if (!(it.id in ok)) { ok[it.id] = 0; guarda.set('lt', JSON.stringify(ok)); pinta(); }
      });
      ops.appendChild(b);
    });
  }
  function rodar() {
    const w = wIn.value === 'ε' ? '' : wIn.value.trim();
    if ([...w].some((c) => !it.alf.includes(c))) { wOut.innerHTML = `<span class="tm-status">use só ${esc(alfTxt(it.alf))}; ε para a vazia</span>`; rastro.innerHTML = ''; return; }
    const ac = aceita(m, w, modo);
    wOut.innerHTML = `<b class="${ac ? 'ok' : 'bad'}">${ac ? 'aceita' : 'rejeita'}</b>`;
    rastro.innerHTML = rastroHTML(m, w, modo);
  }
  sel.addEventListener('change', carregar);
  wIn.addEventListener('input', rodar);
  $('lt-prox').addEventListener('click', () => { sel.selectedIndex = (sel.selectedIndex + 1) % sel.options.length; carregar(); });
  $('lt-ant').addEventListener('click', () => { sel.selectedIndex = (sel.selectedIndex - 1 + sel.options.length) % sel.options.length; carregar(); });
  $('lt-aceitas').addEventListener('click', () => {
    const n = it.alf.length === 2 ? 5 : 3;
    const ws = palavras([...it.alf], n).filter((w) => aceita(m, w, modo));
    lista.innerHTML = `<span class="tm-status">aceitas até ${n} símbolos:</span> ` + (ws.length ? ws.slice(0, 48).map((w) => `<span class="tk">${esc(mostra(w))}</span>`).join('') + (ws.length > 48 ? `<span class="tk eof">+${ws.length - 48}</span>` : '') : '<span class="tk eof">nenhuma</span>');
  });
  $('lt-zera').addEventListener('click', () => { ok = {}; guarda.set('lt', '{}'); pinta(); carregar(); });
  pinta(); carregar();
})();

/* ---------- treino 3: construa o autômato ---------- */
(function () {
  const sel = $('ct-ex'); if (!sel) return;
  const txt = $('ct-txt'), out = $('ct-out'), enun = $('ct-enun'), svg = $('ct-svg'), modoRow = $('ct-modo-row'), modoSel = $('ct-modo');
  const wIn = $('ct-w'), wOut = $('ct-w-out'), rastro = $('ct-rastro'), resp = $('ct-resp-box'), btnPassos = $('ct-passos'), placar = $('ct-placar');
  const grupos = {};
  construir.forEach((e, i) => {
    if (!grupos[e.tipo]) { grupos[e.tipo] = H('optgroup', { label: NOMES[e.tipo] }); sel.appendChild(grupos[e.tipo]); }
    grupos[e.tipo].appendChild(H('option', { value: i }, ''));
  });
  const feito = (e) => guarda.get('ok:' + e.id) === '1';
  const rotular = () => {
    [...sel.options].forEach((o) => { const e = construir[+o.value]; o.textContent = `${feito(e) ? '✓ ' : ''}${'●'.repeat(e.nivel)}${'○'.repeat(3 - e.nivel)} ${e.fonte === 'lista' ? 'lista · ' : ''}${e.titulo.replace(/^[A-Z]{2,3} · /, '')}`; });
    placar.textContent = `${construir.filter(feito).length} de ${construir.length} passaram`;
  };
  let ex = construir[0], m = null;
  const modelo = (e) => (e.tipo === 'ap' ? 'inicial q0\nfinais q1\n# de lê desempilha -> para empilha\n' : 'inicial q0\nfinais \n# de símbolo para\n');
  function carregar() {
    ex = construir[+sel.value];
    enun.innerHTML = `<b>${NOMES[ex.tipo]}</b> sobre Σ = ${esc(alfTxt(ex.alfabeto))}: ${esc(ex.titulo.replace(/^[A-Z]{2,3} · /, ''))}.`;
    modoRow.style.display = ex.tipo === 'ap' ? '' : 'none';
    btnPassos.style.display = ex.passos ? '' : 'none';
    txt.value = guarda.get('af:' + ex.id) || modelo(ex);
    out.className = 'answer'; out.textContent = 'Escreva o autômato e clique em Testar.';
    rastro.innerHTML = ''; wOut.textContent = ''; wIn.value = ''; resp.innerHTML = ''; resp.hidden = true;
    atualizar();
  }
  function atualizar() {
    const r = ler(txt.value, ex.tipo); m = r.erros.length ? null : r.m;
    if (!m || !m.estados.size || m.estados.size > 12) svg.innerHTML = '';
    else desenharItem(svg, m, { vb: m.estados.size > 5 ? '0 0 760 280' : '0 0 600 260' });
    return r;
  }
  function testar() {
    guarda.set('af:' + ex.id, txt.value);
    const r = atualizar();
    if (r.erros.length) { out.className = 'verdict bad'; out.innerHTML = '<b>O texto tem problema:</b><br>' + r.erros.map(esc).join('<br>'); return; }
    const max = ex.alfabeto.length === 2 ? (ex.tipo === 'ap' ? 9 : 10) : (ex.tipo === 'ap' ? 6 : 7);
    const c = comparar(r.m, ex.alvo, [...ex.alfabeto], max, modoSel.value);
    const fora = r.m.trans.flatMap((t) => [t.s, t.le].filter((x) => x && !ex.alfabeto.includes(x)));
    const avisoAlf = fora.length ? `<br><small>Símbolo fora do alfabeto: ${esc([...new Set(fora)].join(', '))}.</small>` : '';
    let avisoAFD = '';
    if (ex.tipo === 'afd') {
      const falta = [...r.m.estados].flatMap((q) => [...ex.alfabeto].filter((a) => !r.m.trans.some((t) => t.de === q && t.s === a)).map((a) => `δ(${q}, ${a})`));
      if (falta.length) avisoAFD = `<br><small>AFD incompleto: falta ${esc(falta.slice(0, 6).join(', '))}${falta.length > 6 ? '…' : ''}. Na prova, desenhe o estado de erro ou escreva que as setas que faltam vão para ele.</small>`;
    }
    if (!c.sobra.length && !c.falta.length) {
      guarda.set('ok:' + ex.id, '1'); rotular();
      out.className = 'verdict ok';
      out.innerHTML = `<b>Passou.</b> Acertou as ${c.total} palavras de comprimento até ${max}.${avisoAFD}${avisoAlf}`;
      return;
    }
    out.className = 'verdict bad';
    const lst = (xs) => xs.slice(0, 8).map((w) => `<code>${esc(mostra(w))}</code>`).join(' ');
    out.innerHTML = `<b>Errou ${c.sobra.length + c.falta.length} de ${c.total} palavras.</b>` +
      (c.sobra.length ? `<br>Aceita e não devia: ${lst(c.sobra)}` : '') +
      (c.falta.length ? `<br>Rejeita e devia aceitar: ${lst(c.falta)}` : '') +
      `<br><small>A primeira já está na caixa de baixo, com o caminho.</small>${avisoAFD}${avisoAlf}`;
    wIn.value = mostra(c.sobra[0] ?? c.falta[0]);
    rodar();
  }
  function rodar() {
    const r = ler(txt.value, ex.tipo);
    if (r.erros.length) { wOut.textContent = ''; rastro.innerHTML = ''; return; }
    const w = wIn.value === 'ε' ? '' : wIn.value.trim();
    const ac = aceita(r.m, w, modoSel.value);
    wOut.innerHTML = `<b class="${ac ? 'ok' : 'bad'}">${ac ? 'aceita' : 'rejeita'}</b>; a linguagem pede: <b>${ex.alvo(w) ? 'aceitar' : 'rejeitar'}</b>`;
    rastro.innerHTML = rastroHTML(r.m, w, modoSel.value);
  }
  sel.addEventListener('change', carregar);
  $('ct-run').addEventListener('click', testar);
  $('ct-dica').addEventListener('click', () => { out.className = 'answer'; out.innerHTML = '<b>O que lembrar.</b> ' + esc(ex.dica); });
  btnPassos.addEventListener('click', () => { out.className = 'answer'; out.innerHTML = '<b>Estrutura.</b> ' + esc(ex.passos); });
  $('ct-resp').addEventListener('click', () => {
    const { m: mr } = ler(ex.resposta, ex.tipo);
    resp.hidden = false;
    resp.innerHTML = `<div class="lbl">uma resposta (o seu texto continua lá em cima)</div><div class="maq"><svg viewBox="0 0 600 260" role="img" aria-label="Diagrama da resposta"></svg></div><pre><code>${esc(ex.resposta)}</code></pre>`;
    desenharItem(resp.querySelector('svg'), mr, { vb: mr.estados.size > 5 ? '0 0 760 280' : '0 0 600 260' });
  });
  $('ct-limpa').addEventListener('click', () => { guarda.set('af:' + ex.id, ''); carregar(); });
  $('ct-prox').addEventListener('click', () => { sel.selectedIndex = (sel.selectedIndex + 1) % sel.options.length; carregar(); });
  txt.addEventListener('input', () => { guarda.set('af:' + ex.id, txt.value); atualizar(); });
  txt.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); testar(); } });
  modoSel.addEventListener('change', () => { if (ex.tipo === 'ap') testar(); });
  wIn.addEventListener('input', rodar);
  rotular(); carregar();
})();

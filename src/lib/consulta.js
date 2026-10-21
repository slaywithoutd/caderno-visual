import { H } from './dom.js';

/* Barra de Definições do modo Consulta: busca que filtra enquanto digita, todos os termos da aula,
   cada um abre (details) com a definição curta, a fórmula (campo `f` do glossario.js) e "ver seção".
   Em telas pequenas, a lista entra no fluxo da página sem sobrepor o artigo. */
export function initDefinicoes() {
  const el = document.getElementById('defs-data');
  if (!el) return;
  const defs = JSON.parse(el.textContent);
  const lista = document.getElementById('defs-lista'), q = document.getElementById('defs-q'), vazio = document.getElementById('defs-vazio');
  const painel = document.getElementById('defs'), btn = document.getElementById('defs-btn'), fechar = document.getElementById('defs-fechar');
  const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

  const itens = defs.map((d) => {
    const it = H('details', { class: 'def-item', id: `def-${d.k}` });
    it.innerHTML = `<summary>${d.t}</summary><div class="def-corpo"><p>${d.d}</p>` +
      (d.f ? `<div class="def-f">${d.f}</div>` : '') +
      (d.sec ? `<a class="def-ir" href="#${d.sec}">ver seção →</a>` : '') + '</div>';
    it.dataset.busca = norm(`${d.t} ${d.m.join(' ')} ${d.d}`);
    it.dataset.nome = norm(`${d.t} ${d.m.join(' ')}`);
    it.dataset.titulo = norm(d.t);
    it.dataset.formas = d.m.map(norm).join('|');
    lista.appendChild(it);
    return it;
  });

  /* filtra enquanto digita; com um termo só (ou nome exato) ele já abre */
  q.addEventListener('input', () => {
    const t = norm(q.value.trim());
    let vis = [];
    itens.forEach((it) => { const ok = !t || it.dataset.busca.includes(t); it.hidden = !ok; if (ok) vis.push(it); });
    vazio.hidden = vis.length > 0;
    if (t) {
      /* abre o melhor candidato: título começando pela busca, depois uma das formas igual à busca, depois palavra igual */
      const exato = vis.find((it) => it.dataset.titulo.startsWith(t)) || vis.find((it) => it.dataset.formas.split('|').includes(t)) || vis.find((it) => it.dataset.nome.split(' ').includes(t));
      itens.forEach((it) => { it.open = false; });
      const alvo = vis.length === 1 ? vis[0] : exato;
      if (alvo) { alvo.open = true; alvo.scrollIntoView({ block: 'nearest' }); }
    }
  });
  q.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const aberto = itens.find((it) => !it.hidden && it.open) || itens.find((it) => !it.hidden);
    const ir = aberto && aberto.querySelector('.def-ir');
    if (ir) ir.click();
  });

  /* "ver seção": rola até a seção e destaca */
  const abrir = (expandido, focar = false) => {
    painel.hidden = !expandido;
    document.documentElement.classList.toggle('defs-recolhidas', !expandido);
    btn.setAttribute('aria-expanded', String(expandido));
    try { localStorage.setItem('caderno-definicoes-recolhidas', String(!expandido)); } catch {}
    if (focar) (expandido ? q : btn).focus();
  };
  let expandido = true;
  try { expandido = localStorage.getItem('caderno-definicoes-recolhidas') !== 'true'; } catch {}
  abrir(expandido);
  lista.addEventListener('click', (e) => {
    const a = e.target.closest('.def-ir');
    if (!a) return;
    const s = document.querySelector(a.getAttribute('href'));
    if (s) { s.classList.remove('cs-flash'); void s.offsetWidth; s.classList.add('cs-flash'); }
  });
  btn.addEventListener('click', () => abrir(true, true));
  fechar.addEventListener('click', () => abrir(false, true));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && painel.contains(document.activeElement)) abrir(false, true);
    /* "/" foca a busca, como em muitos sites de documentação */
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); abrir(true, true); }
  });

  /* destaca a seção ao chegar por link (#secao) */
  const destacar = () => { const s = location.hash && document.querySelector(`section.cs#${CSS.escape(location.hash.slice(1))}`); if (s) s.classList.add('cs-flash'); };
  addEventListener('hashchange', destacar); destacar();
}

/* Modo compacto do Consulta: cada seção mostra só o essencial (título, definição, "Em resumo", fórmula e
   "cai na prova"); o resto (como usar, pegadinhas, figuras, tabelas, desenhos) vai para um "Detalhes" que
   abre com um clique. As seções do encontro e do treino ficam abertas. Chegar a uma seção por link abre os
   detalhes dela. O botão do topo abre ou recolhe todos, e a escolha fica no navegador. */
const SEMPRE_ABERTAS = new Set(['encontro', 'treino']);
const VISIVEL = '.cs-def, .cs-resumo, .cs-formula, p.prova';
const PARTES = [
  ['.cs-uso', 'como usar'], ['.cs-pegadinhas', 'pegadinhas'], ['.cs-ponderada', 'ponderada'],
  ['figure.fig', 'figura'], ['aside.loop', 'animação'], ['aside.mn:not(.loop)', 'desenho'], ['.tbl', 'tabela'],
];
export function initCompacto() {
  const secoes = [...document.querySelectorAll('#aula-root section.cs')].filter((s) => !SEMPRE_ABERTAS.has(s.id));
  const todos = [];
  for (const sec of secoes) {
    const resto = [...sec.children].filter((el) => el.tagName !== 'H2' && !el.matches(VISIVEL));
    if (!resto.length) continue;
    const det = H('details', { class: 'cs-detalhes' });
    const tem = PARTES.filter(([sel]) => resto.some((el) => el.matches(sel) || el.querySelector(sel))).map(([, nome]) => nome);
    det.innerHTML = `<summary>Detalhes${tem.length ? ` <span>${tem.join(' · ')}</span>` : ''}</summary>`;
    sec.appendChild(det);
    resto.forEach((el) => det.appendChild(el));
    todos.push(det);
  }
  const botao = document.getElementById('cs-tudo');
  let abertos = false;
  try { abertos = localStorage.getItem('caderno-detalhes-abertos') === 'true'; } catch {}
  const aplicar = (sim, salvar) => {
    abertos = sim;
    todos.forEach((d) => { d.open = sim; });
    if (botao) { botao.textContent = sim ? 'Recolher os detalhes' : 'Abrir todos os detalhes'; botao.setAttribute('aria-pressed', String(sim)); }
    if (salvar) { try { localStorage.setItem('caderno-detalhes-abertos', String(sim)); } catch {} }
  };
  aplicar(abertos, false);
  botao?.addEventListener('click', () => aplicar(!abertos, true));
  const abrirAlvo = () => {
    const s = location.hash && document.querySelector(`section.cs#${CSS.escape(location.hash.slice(1))}`);
    const d = s && s.querySelector(':scope > details.cs-detalhes');
    if (d) d.open = true;
  };
  addEventListener('hashchange', abrirAlvo); abrirAlvo();
}

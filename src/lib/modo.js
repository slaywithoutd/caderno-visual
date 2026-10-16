/* Switch Leitura / Consulta.
   - A escolha fica em localStorage ('caderno-modo') e vale para todas as aulas.
   - Ao trocar dentro de uma aula, vai para o outro modo mantendo a posição:
     Leitura → Consulta: o primeiro termo do glossário visível na tela leva à seção dona dele
       (secaoDe); se não houver, a seção de Leitura atual leva à seção de Consulta que a cita (leituraDe).
     Consulta → Leitura: a seção de Consulta atual leva à primeira seção de Leitura dela (leituraDe).
   - Na home e em outras páginas, links com data-consulta apontam para o modo escolhido.
   O redirecionamento de quem já chega com o outro modo salvo é feito no <head> (layouts/Aula.astro). */
const CHAVE = 'caderno-modo';

export function modoSalvo() {
  try { return localStorage.getItem(CHAVE) || 'leitura'; } catch (e) { return 'leitura'; }
}
function salvar(m) { try { localStorage.setItem(CHAVE, m); } catch (e) { /* sem storage: vale só nesta página */ } }

/* a seção cujo topo passou da linha de leitura (200 px abaixo do topo da janela) */
function secaoAtual(seletor) {
  let atual = null;
  document.querySelectorAll(seletor).forEach((s) => { if (s.getBoundingClientRect().top < 200) atual = s; });
  return atual;
}

const norm = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const PARADAS = new Set(['como', 'que', 'uma', 'para', 'por', 'com', 'dos', 'das', 'num', 'numa', 'nos', 'nas', 'ele', 'ela', 'sao', 'mais', 'quem', 'acontece']);
const palavras = (s) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !PARADAS.has(w));

/* Escolhe a seção de Consulta para um trecho da Leitura: entre as seções que vieram do capítulo `chap`
   (data-leitura), a que mais compartilha palavras com o título do trecho (h2/h3 mais próximo), contando o
   título da seção e os nomes dos termos que moram nela (cfg.chaves). Empate: a primeira. */
export function secaoParaTrecho(cfg, chap, titulo) {
  const cands = Object.entries(cfg.leituraDe).filter(([, ids]) => ids.includes(chap)).map(([cs]) => cs);
  if (!cands.length) return '';
  /* títulos da Leitura costumam ser "geral: específico"; o que vem depois dos dois-pontos pesa o dobro */
  const [antes, depois = ''] = (titulo || '').split(/:(.*)/s);
  const ordem = [...palavras(antes), ...palavras(depois)];
  const extra = new Set(palavras(depois));
  const de = Object.fromEntries(cands.map((cs) => [cs, new Set(palavras(cfg.chaves?.[cs] || ''))]));
  /* palavra rara entre as candidatas pesa mais ("amat" vale mais que "cache", que está em quase todas) */
  const peso = (w) => (extra.has(w) ? 2 : 1) / cands.filter((cs) => de[cs].has(w)).length;
  let melhor = cands[0], nota = 0, pos = Infinity;
  for (const cs of cands) {
    const casadas = [...new Set(ordem)].filter((w) => de[cs].has(w));
    const n = casadas.reduce((t, w) => t + peso(w), 0);
    const p = casadas.length ? Math.min(...casadas.map((w) => ordem.indexOf(w))) : Infinity;
    /* empate: ganha quem casa a palavra que aparece primeiro no título */
    if (n > nota + 1e-9 || (Math.abs(n - nota) < 1e-9 && n > 0 && p < pos)) { melhor = cs; nota = n; pos = p; }
  }
  return melhor;
}

function alvoConsulta(cfg) {
  const s = secaoAtual('section.chap');
  if (!s) return '';
  let titulo = '';
  s.querySelectorAll('h2, h3').forEach((h) => { if (h.getBoundingClientRect().top < 200) titulo = h.textContent; });
  return secaoParaTrecho(cfg, s.id, titulo);
}

function alvoLeitura(cfg) {
  const s = secaoAtual('section.cs[id]');
  return (s && cfg.leituraDe[s.id] && cfg.leituraDe[s.id][0]) || '';
}

function atualizarLinks() {
  const m = modoSalvo();
  document.querySelectorAll('a[data-consulta]').forEach((a) => {
    if (!a.dataset.leitura) a.dataset.leitura = a.getAttribute('href');
    a.setAttribute('href', m === 'consulta' ? a.dataset.consulta : a.dataset.leitura);
  });
}

export function initModo() {
  const sw = document.querySelector('.modo-switch');
  if (!sw) return;
  const el = document.getElementById('modo-data');
  const cfg = el ? JSON.parse(el.textContent) : null;
  const marcar = (m) => sw.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === m)));
  /* numa aula, o botão marcado é o modo da página; fora dela, o modo salvo */
  marcar(cfg ? cfg.atual : modoSalvo());
  sw.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-modo]');
    if (!b || b.disabled) return;
    const m = b.dataset.modo;
    salvar(m); marcar(m); atualizarLinks();
    if (!cfg || m === cfg.atual) return;
    const hash = m === 'consulta' ? alvoConsulta(cfg) : alvoLeitura(cfg);
    location.href = (m === 'consulta' ? cfg.consulta : cfg.leitura) + (hash ? `#${hash}` : '');
  });
  atualizarLinks();
}

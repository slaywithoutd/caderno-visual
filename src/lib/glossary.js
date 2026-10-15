import { H, esc } from './dom.js';

/* Glossário: transforma termos do texto em botões com popover e monta a lista de cartões.
   G       todos os termos conhecidos (glossário global: um termo aprendido numa aula vale nas próximas)
   listar  chaves que aparecem como cartão nesta página (padrão: todas)
   global  link da página do glossário coletivo, usado quando o termo não está listado aqui
   Cada termo pode ter `origem: { rotulo, href }` (de qual aula veio), preenchido pelo catálogo. */
export function initGlossary(G, { listar = Object.keys(G), global = null } = {}) {
  const keys = Object.keys(G);
  const aqui = new Set(listar.filter((k) => G[k]));
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const sortKey = (k) => norm(G[k].t).replace(/^[^a-z]+/, '');
  const letterOf = (k) => (sortKey(k)[0] || '#').toUpperCase();
  const hrefDe = (k) => (aqui.has(k) || !global ? `#gl-${k}` : `${global}#gl-${k}`);
  const contador = document.getElementById('gl-count');
  if (contador) contador.textContent = aqui.size;

  /* lista de cartões */
  const list = document.getElementById('gl-list'), lettersEl = document.getElementById('gl-letters');
  const card = (k) => {
    const e = G[k]; const c = H('div', { class: 'gl-card', id: 'gl-' + k });
    c.innerHTML = `<div class="gl-term">${e.t}</div><div class="gl-def">${e.d}</div>` +
      (e.a ? `<div class="gl-analogy"><span class="gl-k">como se fosse</span>${e.a}</div>` : '') +
      (e.x ? `<div class="gl-deep"><span class="gl-k">pra ir além</span>${e.x}</div>` : '') +
      ((e.see && e.see.length) || e.origem ? `<div class="gl-see">${(e.see || []).filter((s) => G[s]).map((s) => `<a class="seebtn" href="${hrefDe(s)}">${G[s].t}</a>`).join('')}${e.origem ? `<a class="gl-origem" href="${e.origem.href}">${e.origem.rotulo}</a>` : ''}</div>` : '');
    c.dataset.search = norm(e.t + ' ' + e.m.join(' ') + ' ' + e.d); return c;
  };
  if (list) {
    const sorted = [...aqui].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    let curL = null, grid = null; const groups = [];
    sorted.forEach((k) => {
      const L = letterOf(k);
      if (L !== curL) {
        curL = L; const h = H('div', { class: 'gl-letter', id: 'gl-letra-' + L }, L); grid = H('div', { class: 'gl-grid' });
        list.append(h, grid); groups.push({ h, grid });
        lettersEl.appendChild(H('a', { href: '#gl-letra-' + L }, L));
      }
      grid.appendChild(card(k));
    });
    const search = document.getElementById('gl-search'), empty = document.getElementById('gl-empty');
    search.addEventListener('input', () => {
      const q = norm(search.value.trim()); let any = 0;
      groups.forEach((g) => { let n = 0; [...g.grid.children].forEach((c) => { const ok = !q || c.dataset.search.includes(q); c.hidden = !ok; if (ok) n++; }); g.h.hidden = !n; g.grid.hidden = !n; any += n; });
      empty.hidden = !!any;
    });
  }

  /* termos no texto: primeira ocorrência de cada termo por seção vira botão */
  const form2key = new Map(); keys.forEach((k) => G[k].m.forEach((f) => { if (!form2key.has(f.toLowerCase())) form2key.set(f.toLowerCase(), k); }));
  const forms = [...form2key.keys()].sort((a, b) => b.length - a.length).map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (forms.length) {
    const re = new RegExp('(?<![\\p{L}\\p{N}*⁺-])(' + forms.join('|') + ')(?![\\p{L}\\p{N}-])', 'giu');
    const SKIP = 'code,h1,h2,h3,figure,.src,.formula,button,a,.gterm,.num,.lab,.widget,.tbl,.cards,.cheat,#glossario,section.fontes,.mn,.kicker,footer,summary';
    document.querySelectorAll('section.chap').forEach((sec) => {
      if (sec.id === 'glossario' || sec.id === 'revisao') return;
      const seen = new Set(); const tw = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
      nodes.forEach((node) => {
        const txt = node.nodeValue; re.lastIndex = 0; let m, last = 0; const frag = document.createDocumentFragment(); let changed = false;
        while ((m = re.exec(txt))) {
          const k = form2key.get(m[1].toLowerCase()); if (!k || seen.has(k)) continue; seen.add(k); changed = true;
          frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
          const b = H('button', { class: 'gterm', type: 'button' }, esc(m[1])); b.dataset.g = k; frag.appendChild(b); last = m.index + m[1].length;
        }
        if (changed) { frag.appendChild(document.createTextNode(txt.slice(last))); node.parentNode.replaceChild(frag, node); }
      });
    });
  }

  /* popover */
  const pop = document.getElementById('pop'); let anchor = null;
  function openPop(k, el) {
    const e = G[k]; if (!e) return; anchor = el;
    pop.innerHTML = `<div class="p-term">${e.t}</div><div class="p-def">${e.d}</div>` + (e.a ? `<div class="p-a"><span class="gl-k">como se fosse</span>${e.a}</div>` : '') + (e.x ? `<div class="p-x"><span class="gl-k">pra ir além</span>${e.x}</div>` : '') +
      `<div class="p-foot">${(e.see || []).filter((s) => G[s]).map((s) => `<button class="seebtn" type="button" data-see="${s}">${G[s].t}</button>`).join('')}${e.origem && !aqui.has(k) ? `<a class="gl-origem" href="${e.origem.href}">${e.origem.rotulo}</a>` : ''}<a class="seebtn p-go" href="${hrefDe(k)}">abrir no glossário →</a></div>`;
    pop.classList.add('on'); document.querySelectorAll('.gterm.act').forEach((t) => t.classList.remove('act')); if (el.classList.contains('gterm')) el.classList.add('act');
    const r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight; const left = Math.min(Math.max(12, r.left), innerWidth - w - 12); let top = r.bottom + 8; if (top + h > innerHeight - 8 && r.top - h - 8 > 8) top = r.top - h - 8;
    pop.style.left = left + scrollX + 'px'; pop.style.top = top + scrollY + 'px';
  }
  function closePop() { pop.classList.remove('on'); document.querySelectorAll('.gterm.act').forEach((t) => t.classList.remove('act')); anchor = null; }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.gterm'); if (t) { e.stopPropagation(); if (anchor === t && pop.classList.contains('on')) closePop(); else openPop(t.dataset.g, t); return; }
    const s = e.target.closest('[data-see]'); if (s) { openPop(s.dataset.see, anchor || s); return; }
    if (e.target.closest('.p-go,.gl-origem')) { closePop(); return; }
    if (!e.target.closest('#pop')) closePop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); });
  /* destaca o cartão ao navegar */
  const destacar = () => { const c = location.hash.startsWith('#gl-') ? document.getElementById(location.hash.slice(1)) : null; if (c && c.classList.contains('gl-card')) { c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 1600); } };
  addEventListener('hashchange', destacar); destacar();
}

/* lê o JSON embutido pelo componente Glossario.astro e liga o glossário da página */
export function initGlossarioDaPagina() {
  const el = document.getElementById('gl-data');
  if (!el) return;
  const d = JSON.parse(el.textContent);
  initGlossary(d.termos, { listar: d.listar, global: d.global });
}

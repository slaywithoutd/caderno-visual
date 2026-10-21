/* Barras laterais ajustáveis: o sumário (esquerda) e as Definições (direita, só no modo Consulta).
   - Arrastar a borda interna muda a largura; dois cliques na borda voltam ao padrão.
   - Com o foco na borda, as setas ← → mudam a largura de 16 em 16 px.
   - O sumário recolhe com ‹ e volta com o botão "Sumário ›"; as Definições recolhem em lib/consulta.js.
   - Larguras e barras recolhidas ficam no navegador (localStorage) e valem para todas as aulas.
   O conteúdo se reajusta sozinho: figuras e desenhos de margem usam container queries (global.css). */
const LIMITES = { side: [180, 420], defs: [220, 560] };
const VARIAVEL = { side: '--side-w', defs: '--defs-w-aberta' };
const CHAVE = { side: 'caderno-side-w', defs: 'caderno-defs-w' };

const guardar = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, String(v)); } catch { /* sem storage: vale só nesta página */ } };

export function initPaineis() {
  const raiz = document.documentElement;
  const larguraAtual = (qual) => parseFloat(getComputedStyle(raiz).getPropertyValue(VARIAVEL[qual])) || LIMITES[qual][0];
  const aplicar = (qual, px) => {
    const [min, max] = LIMITES[qual];
    const v = Math.round(Math.min(max, Math.max(min, px)));
    raiz.style.setProperty(VARIAVEL[qual], `${v}px`);
    return v;
  };

  document.querySelectorAll('.puxador[data-painel]').forEach((p) => {
    const qual = p.dataset.painel;
    p.tabIndex = 0;
    p.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      p.setPointerCapture(e.pointerId);
      raiz.classList.add('arrastando');
      let v = null;
      const mover = (ev) => { v = aplicar(qual, qual === 'side' ? ev.clientX : innerWidth - ev.clientX); };
      const soltar = () => {
        p.removeEventListener('pointermove', mover);
        raiz.classList.remove('arrastando');
        if (v !== null) guardar(CHAVE[qual], v);
      };
      p.addEventListener('pointermove', mover);
      p.addEventListener('pointerup', soltar, { once: true });
      p.addEventListener('pointercancel', soltar, { once: true });
    });
    p.addEventListener('dblclick', () => { raiz.style.removeProperty(VARIAVEL[qual]); guardar(CHAVE[qual], null); });
    p.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      /* a seta aponta para onde a borda vai: no sumário, → alarga; nas Definições, ← alarga */
      const sinal = (e.key === 'ArrowRight' ? 1 : -1) * (qual === 'side' ? 1 : -1);
      guardar(CHAVE[qual], aplicar(qual, larguraAtual(qual) + 16 * sinal));
    });
  });

  const fechar = document.getElementById('side-fechar'), abrir = document.getElementById('side-btn');
  const recolher = (sim) => {
    raiz.classList.toggle('side-recolhida', sim);
    guardar('caderno-side-recolhida', sim);
    (sim ? abrir : fechar)?.focus();
  };
  fechar?.addEventListener('click', () => recolher(true));
  abrir?.addEventListener('click', () => recolher(false));
}

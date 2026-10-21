/* Barras laterais ajustáveis: o sumário (esquerda) e as Definições (direita, só no modo Consulta).
   - A coluna de texto NÃO se mexe: ela fica onde estaria com as barras no tamanho padrão.
     Mudar ou recolher uma barra só muda o espaço livre ao lado do texto.
   - O espaço livre vai para as imagens: --esq-livre e --dir-livre (px) deixam figuras passo a passo
     crescerem para os lados, e html.margem-livre põe os desenhos de margem fora do texto (global.css).
   - Arrastar a borda interna muda a largura, até encostar no texto; dois cliques voltam ao padrão.
     Com o foco na borda, as setas ← → mudam a largura de 16 em 16 px.
   - O sumário recolhe com ‹ e volta com "Sumário ›"; as Definições recolhem em lib/consulta.js.
   - Larguras e barras recolhidas ficam no navegador (localStorage) e valem para todas as aulas. */
const MINIMO = { side: 180, defs: 220 };
const VARIAVEL = { side: '--side-w', defs: '--defs-w-aberta' };
const CHAVE = { side: 'caderno-side-w', defs: 'caderno-defs-w' };
const FOLGA = 24;          /* respiro entre uma barra e o texto ou a imagem */
const EXTRA_MAX = 260;     /* quanto uma figura pode crescer para cada lado */
const MARGEM_DESENHO = 264; /* espaço que um desenho de margem (240 px) precisa fora do texto */

const guardar = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, String(v)); } catch { /* sem storage: vale só nesta página */ } };

export function initPaineis() {
  const raiz = document.documentElement;
  const largo = matchMedia('(min-width:1021px)');
  const conteudo = document.querySelector('.layout-consulta .content') || document.querySelector('.content');

  /* bordas do texto (sem o padding da coluna) */
  const bordasTexto = () => {
    const r = conteudo.getBoundingClientRect(), cs = getComputedStyle(conteudo);
    return { esq: r.left + parseFloat(cs.paddingLeft), dir: r.right - parseFloat(cs.paddingRight) };
  };
  const largura = (qual) => {
    if (qual === 'side' && raiz.classList.contains('side-recolhida')) return 0;
    if (qual === 'defs' && (raiz.classList.contains('defs-recolhidas') || !document.getElementById('defs'))) return 0;
    return document.getElementById(qual)?.getBoundingClientRect().width || 0;
  };
  const maximo = (qual) => {
    const b = bordasTexto();
    return Math.floor(qual === 'side' ? b.esq - FOLGA : innerWidth - b.dir - FOLGA);
  };

  /* espaço livre ao lado do texto, para as imagens */
  const medirLivre = () => {
    if (!conteudo || !largo.matches || raiz.classList.contains('lendo')) {
      raiz.style.setProperty('--esq-livre', '0px'); raiz.style.setProperty('--dir-livre', '0px');
      raiz.classList.toggle('margem-livre', false); return;
    }
    const b = bordasTexto();
    const esq = Math.max(0, b.esq - largura('side') - FOLGA);
    const dir = Math.max(0, innerWidth - b.dir - largura('defs') - FOLGA);
    raiz.style.setProperty('--esq-livre', `${Math.min(EXTRA_MAX, Math.floor(esq))}px`);
    raiz.style.setProperty('--dir-livre', `${Math.min(EXTRA_MAX, Math.floor(dir))}px`);
    raiz.classList.toggle('margem-livre', dir >= MARGEM_DESENHO);
  };

  const aplicar = (qual, px) => {
    const v = Math.round(Math.min(maximo(qual), Math.max(MINIMO[qual], px)));
    raiz.style.setProperty(VARIAVEL[qual], `${v}px`);
    medirLivre();
    return v;
  };
  /* uma largura salva maior que o espaço desta tela é reduzida até encostar no texto */
  const encaixar = () => {
    if (!largo.matches || !conteudo) return;
    for (const qual of ['side', 'defs']) {
      const el = document.getElementById(qual);
      if (el && largura(qual) > maximo(qual)) raiz.style.setProperty(VARIAVEL[qual], `${Math.max(MINIMO[qual], maximo(qual))}px`);
    }
    medirLivre();
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
    p.addEventListener('dblclick', () => { raiz.style.removeProperty(VARIAVEL[qual]); guardar(CHAVE[qual], null); encaixar(); });
    p.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      /* a seta aponta para onde a borda vai: no sumário, → alarga; nas Definições, ← alarga */
      const sinal = (e.key === 'ArrowRight' ? 1 : -1) * (qual === 'side' ? 1 : -1);
      guardar(CHAVE[qual], aplicar(qual, largura(qual) + 16 * sinal));
    });
  });

  const fechar = document.getElementById('side-fechar'), abrir = document.getElementById('side-btn');
  const recolher = (sim) => {
    raiz.classList.toggle('side-recolhida', sim);
    guardar('caderno-side-recolhida', sim);
    medirLivre();
    (sim ? abrir : fechar)?.focus();
  };
  fechar?.addEventListener('click', () => recolher(true));
  abrir?.addEventListener('click', () => recolher(false));

  /* recolher as Definições (lib/consulta.js) ou ligar os óculos muda a classe do <html>: remede.
     Só reage quando muda uma classe que importa; medirLivre também mexe na classe (margem-livre), e
     reagir a isso faria um laço infinito. classList.remove reescreve o atributo mesmo sem mudança, por isso
     medirLivre usa toggle(…, false). */
  const importa = () => ['lendo', 'side-recolhida', 'defs-recolhidas'].map((c) => raiz.classList.contains(c)).join();
  let antes = importa();
  new MutationObserver(() => { const agora = importa(); if (agora !== antes) { antes = agora; medirLivre(); } })
    .observe(raiz, { attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', encaixar);
  largo.addEventListener('change', encaixar);
  encaixar();
}

import { reduce } from './dom.js';

/* Modo leitura ("óculos"): amplia o texto e as figuras para ocupar a tela toda.
   O conteúdo recebe zoom (--z) e passa a ir de ponta a ponta; a sidebar some; desenhos de margem
   flutuam à direita e o texto contorna. A troca usa a View Transitions API: a tela atual fica
   embaçada fora das lentes e a tela ampliada aparece dentro delas, enquanto os óculos crescem do
   botão até uma lente cobrir a tela. Sem suporte (ou com menos movimento), troca direto. */
const CHAVE = 'caderno-lendo';
const raiz = document.documentElement;
const ligado = () => raiz.classList.contains('lendo');

export function zoomLeitura(largura = innerWidth) {
  return Math.min(2, Math.max(1.2, (largura - 48) / 900));
}

function ajustarZoom() { raiz.style.setProperty('--z', zoomLeitura().toFixed(3)); }

/* mantém na tela o mesmo trecho de texto ao trocar de modo */
function ancora() {
  const y = Math.min(140, innerHeight / 3);
  const el = [...document.querySelectorAll('.content h2, .content h3, .content p, .content li, .content figure')]
    .find((e) => { const r = e.getBoundingClientRect(); return r.bottom > y && r.height > 0; });
  return el ? { el, top: el.getBoundingClientRect().top } : null;
}

function aplicar(on, btn) {
  const a = ancora();
  raiz.classList.toggle('lendo', on);
  btn.setAttribute('aria-pressed', String(on));
  btn.title = on ? 'Tirar os óculos (sair do modo leitura)' : 'Colocar os óculos (modo leitura)';
  try { localStorage.setItem(CHAVE, on ? '1' : '0'); } catch {}
  if (a) window.scrollTo({ top: scrollY + a.el.getBoundingClientRect().top - a.top, behavior: 'instant' });
}

/* desenho dos óculos numa escala: lente direita centrada em (x, y) com raio r */
function lentes(x, y, r) {
  const g = r * 0.42, xl = x - 2 * r - g;
  const circ = (cx) => `M ${cx - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  return { clip: `${circ(xl)} ${circ(x)}`, xl, g };
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function animar(on, btn) {
  const b = btn.getBoundingClientRect();
  const W = innerWidth, H = innerHeight;
  const P0 = { x: b.left + b.width * 0.72, y: b.top + b.height / 2 };
  const r0 = b.width * 0.2;
  const P1 = { x: W / 2, y: H / 2 };
  const r1 = Math.hypot(W, H) / 2 + 24;
  const D = 1100;

  const estilo = document.createElement('style');
  document.head.appendChild(estilo);
  let svg, aro, ponte, haste;

  const vt = document.startViewTransition(() => {
    aplicar(on, btn);
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'oculos-anim');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '<path class="aro" /><path class="ponte" /><path class="haste" />';
    [aro, ponte, haste] = svg.children;
    document.body.appendChild(svg);
  });

  const quadro = (p) => {
    /* entrando: p vai de 0 a 1; saindo: o mesmo caminho ao contrário */
    const t = on ? p : 1 - p;
    const e = easeInOut(t);
    const r = r0 * Math.pow(r1 / r0, e);
    const x = P0.x + (P1.x - P0.x) * e, y = P0.y + (P1.y - P0.y) * e;
    const { clip, xl, g } = lentes(x, y, r);
    const w = Math.max(2.5, r * 0.09);
    aro.setAttribute('d', clip);
    aro.setAttribute('stroke-width', w);
    ponte.setAttribute('d', `M ${xl + r} ${y - r * 0.15} Q ${xl + r + g / 2} ${y - r * 0.42} ${x - r} ${y - r * 0.15}`);
    ponte.setAttribute('stroke-width', w * 0.8);
    haste.setAttribute('d', `M ${x + r} ${y - r * 0.2} L ${x + r * 1.9} ${y - r * 0.32} M ${xl - r} ${y - r * 0.2} L ${xl - r * 1.9} ${y - r * 0.32}`);
    haste.setAttribute('stroke-width', w * 0.8);
    const blur = (on ? Math.min(1, p * 2.2) : Math.max(0, 1 - p * 1.6)) * 5;
    /* a imagem nítida (modo leitura) é sempre a que fica dentro das lentes */
    estilo.textContent = on
      ? `::view-transition-new(root){clip-path:path('${clip}')}::view-transition-old(root){filter:blur(${blur.toFixed(2)}px)}`
      : `::view-transition-old(root){clip-path:path('${clip}');z-index:2}::view-transition-new(root){filter:blur(${blur.toFixed(2)}px)}`;
  };

  vt.ready.then(() => {
    /* mantém a transição viva durante D ms; o desenho é feito quadro a quadro abaixo */
    raiz.animate({ opacity: [1, 1] }, { duration: D, pseudoElement: '::view-transition-group(root)' });
    const t0 = performance.now();
    const passo = (agora) => {
      const p = Math.min(1, (agora - t0) / D);
      quadro(p);
      if (p < 1) requestAnimationFrame(passo);
    };
    quadro(0);
    requestAnimationFrame(passo);
  }).catch(() => {});
  vt.finished.finally(() => { estilo.remove(); svg?.remove(); });
}

export function initOculos() {
  const btn = document.getElementById('oculos');
  if (!btn) return;
  ajustarZoom();
  addEventListener('resize', ajustarZoom);
  btn.setAttribute('aria-pressed', String(ligado()));
  btn.addEventListener('click', () => {
    const on = !ligado();
    if (reduce || !document.startViewTransition) aplicar(on, btn);
    else animar(on, btn);
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && ligado() && !document.querySelector('#pop.on')) btn.click(); });
}

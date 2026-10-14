import { reduce } from './dom.js';

/* Animação em loop ("gif"): uma função pura do tempo.
   loop(el, ms, frame, still) chama frame(t) com t ∈ [0, 1) a cada quadro, só enquanto
   el está visível. Como o desenho depende apenas de t, o fim emenda no começo sem salto.
   Com "reduzir movimento" ligado, desenha um único quadro parado em t = still. */
const ativos = new Set();
let rodando = false;

function tick(agora) {
  for (const L of ativos) if (L.visivel) L.frame(((agora - L.t0) % L.ms) / L.ms);
  requestAnimationFrame(tick);
}

export function loop(el, ms, frame, still = 0.5) {
  if (reduce) { frame(still); return; }
  const L = { el, ms, frame, visivel: false, t0: performance.now() };
  ativos.add(L);
  frame(0);
  new IntersectionObserver(([e]) => { L.visivel = e.isIntersecting; }, { rootMargin: '80px' }).observe(el);
  if (!rodando) { rodando = true; requestAnimationFrame(tick); }
}

/* utilitários de tempo para montar linhas do tempo dentro de [0, 1) */
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
export const lerp = (a, b, p) => a + (b - a) * p;
/* em qual fatia de n partes iguais t está, e o progresso dentro dela */
export const fatia = (t, n) => { const k = Math.min(n - 1, Math.floor(t * n)); return [k, t * n - k]; };

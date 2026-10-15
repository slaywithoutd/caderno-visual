import { reduce, fracaoVisivel, VISIVEL_MIN } from './dom.js';

/* Animação em loop ("gif"): uma função pura do tempo.
   loop(el, ms, frame, still) chama frame(t) com t ∈ [0, 1). O relógio de cada loop só anda
   enquanto pelo menos 80% do elemento está na tela, então a animação começa do início quando
   você chega nela e para onde estava quando você sai. Como o desenho depende apenas de t, o fim
   emenda no começo sem salto. Com "reduzir movimento", desenha um único quadro em t = still. */
const ativos = new Set();
let rodando = false, ultimo = 0;

function tick(agora) {
  const dt = ultimo ? agora - ultimo : 0;
  ultimo = agora;
  for (const L of ativos) {
    const ver = fracaoVisivel(L.el) >= VISIVEL_MIN;
    if (!ver) continue;
    L.tempo += dt;
    L.frame((L.tempo % L.ms) / L.ms);
  }
  requestAnimationFrame(tick);
}

export function loop(el, ms, frame, still = 0.5) {
  if (reduce) { frame(still); return; }
  ativos.add({ el, ms, frame, tempo: 0 });
  frame(0);
  if (!rodando) { rodando = true; requestAnimationFrame(tick); }
}

/* utilitários de tempo para montar linhas do tempo dentro de [0, 1) */
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
export const lerp = (a, b, p) => a + (b - a) * p;
/* em qual fatia de n partes iguais t está, e o progresso dentro dela */
export const fatia = (t, n) => { const k = Math.min(n - 1, Math.floor(t * n)); return [k, t * n - k]; };

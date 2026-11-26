import { S } from '../../../../lib/dom.js';
import { loop, ease, clamp01, lerp } from '../../../../lib/loop.js';

/* Animações em loop da aula 02 de Matemática. Cada uma é montada num <aside data-loop="nome">
   do consulta.html e redesenhada a partir de t ∈ [0, 1). */
const montar = {};

/* pombos: 11 mensagens caem em 10 gavetas (os resumos 0 a 9); a 11ª tem de dividir uma gaveta */
montar.pombos = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 176');
  const gx = (i) => 14 + (i % 5) * 44, gy = (i) => 62 + Math.floor(i / 5) * 46;
  for (let i = 0; i < 10; i++) {
    S('rect', { x: gx(i), y: gy(i), width: 36, height: 38, rx: 4, class: 'k' }, svg);
    S('text', { x: gx(i) + 18, y: gy(i) + 30, class: 'tm' }, svg, String(i));
  }
  /* destino de cada mensagem: as 10 primeiras ocupam gavetas diferentes; a 11ª cai na 7 */
  const destino = [3, 8, 0, 5, 1, 9, 2, 7, 4, 6, 7];
  const bolas = destino.map((d, i) => S('circle', { r: 6, class: i === 10 ? 'am' : 'bl', cx: 120, cy: 18 }, svg));
  const leg = S('text', { x: 120, y: 168, class: 'tam' }, svg, '');
  return (t) => {
    let caidas = 0;
    destino.forEach((d, i) => {
      const ini = 0.04 + i * 0.065, p = ease(clamp01((t - ini) / 0.06));
      if (p >= 1) caidas++;
      const dx = gx(d) + 18 + (i === 10 ? 8 : 0) - (i === 7 ? 8 : 0);
      const dy = gy(d) + 14;
      bolas[i].setAttribute('cx', lerp(18 + i * 20.4, dx, p));
      bolas[i].setAttribute('cy', lerp(18, dy, p));
      bolas[i].style.opacity = t > 0.94 ? String(1 - (t - 0.94) / 0.06) : '1';
    });
    leg.textContent = caidas < 11 ? `${caidas} mensagens, 10 resumos` : '11ª mensagem: colisão no 7';
  };
};

/* aniversario: as pessoas chegam uma a uma; cada par novo é uma linha. 23 pessoas, 253 pares */
montar.aniversario = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 214');
  const cx = 120, cy = 92, r = 74, N = 23;
  const pos = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const linhas = S('g', { class: 'ani-linhas' }, svg);
  const segs = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < i; j++) {
    segs.push([j, i, S('line', { x1: pos[j][0], y1: pos[j][1], x2: pos[i][0], y2: pos[i][1], class: 's', style: 'opacity:0;stroke-width:.6' }, linhas)]);
  }
  const pts = pos.map(([x, y]) => S('circle', { cx: x, cy: y, r: 4, class: 'bl', style: 'opacity:0' }, svg));
  const leg = S('text', { x: 120, y: 190, class: 'tam' }, svg, '');
  const leg2 = S('text', { x: 120, y: 206, class: 'tm' }, svg, '');
  return (t) => {
    const q = Math.max(1, Math.min(N, Math.floor(clamp01(t / 0.8) * N) + 1));
    pts.forEach((p, i) => { p.style.opacity = i < q ? '1' : '0'; });
    segs.forEach(([j, i, el]) => { el.style.opacity = i < q ? '0.55' : '0'; });
    const pares = (q * (q - 1)) / 2;
    let sem = 1;
    for (let i = 0; i < q; i++) sem *= (365 - i) / 365;
    leg.textContent = `${q} pessoas, ${pares} pares`;
    leg2.textContent = `chance de repetir o dia: ${(1 - sem).toFixed(2).replace('.', ',')}`;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const fn = montar[el.dataset.loop];
  if (!fn) return;
  const svg = el.querySelector('svg');
  const frame = fn(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

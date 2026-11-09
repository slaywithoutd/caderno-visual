import { S } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figura 1: o ID de um botão pela forma de Shannon, passo a passo, no aparelho fictício.
   Escala: 8 px por mm. Cores por estilo inline com os tokens do global.css. */
const COR = {
  k: 'fill:var(--surface);stroke:var(--line2)',
  bl: 'fill:var(--blue-soft);stroke:var(--blue)',
  am: 'fill:var(--amber-soft);stroke:var(--amber)',
  gr: 'fill:var(--green-soft);stroke:var(--green)',
};
const TX = 'font-family:var(--f-mono);font-size:13px;fill:var(--fg);text-anchor:middle;dominant-baseline:central';
const txt = (p, x, y, s, extra = '') => S('text', { x, y, style: TX + (extra ? ';' + extra : '') }, p, s);
const caixa = (p, x, y, w, h, cor) => S('rect', { x, y, width: w, height: h, rx: 6, style: COR[cor] + ';stroke-width:1.4' }, p);
const linha = (p, d, cor = 'var(--muted)', extra = '') => S('path', { d, style: `fill:none;stroke:${cor};stroke-width:1.5${extra ? ';' + extra : ''}` }, p);
const seta2 = (p, d, cor) => S('path', { d, style: `fill:none;stroke:${cor};stroke-width:1.5`, 'marker-end': 'url(#fitts-seta)', 'marker-start': 'url(#fitts-seta)' }, p);

(function () {
  const raiz = document.getElementById('fig-fitts');
  const svg = document.getElementById('fitts-svg');
  if (!raiz || !svg) return;

  const defs = S('defs', null, svg);
  const mk = S('marker', { id: 'fitts-seta', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
  S('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:var(--muted)' }, mk);
  const palco = S('g', null, svg);

  const X0 = 90, Y = 80, MM = 8;
  /* desenha o ponto de partida, o alvo e as cotas D e W */
  function cena(D, W, cor) {
    const cx = X0 + D * MM, w = W * MM;
    linha(palco, `M40 ${Y} H600`, 'var(--line2)', 'stroke-dasharray:4 4');
    S('circle', { cx: X0, cy: Y, r: 9, style: COR.k + ';stroke-width:1.4' }, palco);
    txt(palco, X0, Y + 26, 'polegar', 'font-size:11px;fill:var(--muted)');
    caixa(palco, cx - w / 2, Y - 24, w, 48, cor);
    txt(palco, cx, Y - 36, 'botão', 'font-size:11px;fill:var(--muted)');
    seta2(palco, `M${X0} ${Y + 50} H${cx}`, 'var(--blue)');
    txt(palco, (X0 + cx) / 2, Y + 64, `D = ${D} mm (até o centro)`, 'font-size:12px;fill:var(--blue)');
    seta2(palco, `M${cx - w / 2} ${Y - 52} H${cx + w / 2}`, 'var(--amber)');
    txt(palco, cx, Y - 66, `W = ${W} mm`, 'font-size:12px;fill:var(--amber)');
  }
  /* régua em escala log₂ para mostrar onde cai 5,44 */
  function regua(v, cor) {
    const x = (n) => 120 + Math.log2(n) * 120, y = 236;
    linha(palco, `M${x(1)} ${y} H${x(8)}`, 'var(--fg)');
    [1, 2, 4, 8].forEach((n, i) => {
      linha(palco, `M${x(n)} ${y - 6} V${y + 6}`, 'var(--fg)');
      txt(palco, x(n), y + 20, String(n), 'font-size:12px');
      txt(palco, x(n), y - 20, `2${['⁰', '¹', '²', '³'][i]}`, 'font-size:11px;fill:var(--muted)');
    });
    S('circle', { cx: x(v), cy: y, r: 6, style: `fill:var(--${cor});stroke:none` }, palco);
    txt(palco, x(v), y + 40, `${String(v).replace('.', ',')} → ${Math.log2(v).toFixed(2).replace('.', ',')} bits`, `font-size:13px;font-weight:700;fill:var(--${cor})`);
  }
  const conta = (s, extra = '') => txt(palco, 320, 190, s, 'font-size:15px' + (extra ? ';' + extra : ''));

  new StepFig(raiz, {
    speed: 2600,
    notes: [
      'O polegar repousa no ponto da esquerda; o alvo é um botão de 9 mm. D vai do ponto de partida até o <b>centro</b> do alvo: 40 mm. W é a largura na direção do movimento.',
      'Divida D por W, na mesma unidade: 40 ÷ 9 ≈ 4,44. A unidade some; só a razão importa.',
      'Some 1: 5,44. Esse +1 é o que faz da fórmula a forma de Shannon e impede ID negativo.',
      'Tire o log na base 2. 5,44 fica entre 2² = 4 e 2³ = 8, perto de 2,44. ID ≈ 2,44 bits.',
      'Com a = 0,2 s e b = 0,15 s/bit (inventados para a conta), MT ≈ 0,2 + 0,15 × 2,44 ≈ 0,57 s. Sem a e b medidos, fique no ID.',
      'Redesenho: botão de 18 mm a 30 mm. log₂(30/18 + 1) = log₂(2,67) ≈ 1,42 bits. Cerca de 1 bit a menos; com os mesmos a e b, MT ≈ 0,41 s.',
    ],
    render(k) {
      palco.replaceChildren();
      if (k < 5) cena(40, 9, 'am'); else cena(30, 18, 'gr');
      if (k === 1) conta('D / W = 40 / 9 ≈ 4,44');
      if (k === 2) conta('D / W + 1 = 4,44 + 1 = 5,44');
      if (k === 3) { conta('ID = log₂(5,44)', 'fill:var(--muted)'); regua(5.44, 'amber'); }
      if (k === 4) {
        conta('MT = a + b · ID = 0,2 + 0,15 × 2,44 ≈ 0,57 s');
        txt(palco, 320, 222, 'a e b ilustrativos: na vida real, saem de medição', 'font-size:12px;fill:var(--muted)');
      }
      if (k === 5) { conta('ID = log₂(30/18 + 1) = log₂(2,67)', 'fill:var(--muted)'); regua(2.67, 'green'); }
    },
  });
})();

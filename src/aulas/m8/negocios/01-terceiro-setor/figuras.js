import { S } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figura da aula: como R$ 1,00 de demanda final vira R$ 1,41 de produção e o que a extração hipotética mede.
   Cores por estilo inline com os tokens do global.css (as classes k/bl/am… valem só nos desenhos de margem). */
const COR = {
  k: 'fill:var(--surface);stroke:var(--line2)',
  bl: 'fill:var(--blue-soft);stroke:var(--blue)',
  am: 'fill:var(--amber-soft);stroke:var(--amber)',
  gr: 'fill:var(--green-soft);stroke:var(--green)',
  rd: 'fill:var(--red-soft);stroke:var(--red)',
};
const TX = 'font-family:var(--f-mono);font-size:12px;fill:var(--fg);text-anchor:middle;dominant-baseline:central';
const txt = (p, x, y, s, extra = '') => S('text', { x, y, style: TX + (extra ? ';' + extra : '') }, p, s);
const caixa = (p, x, y, w, h, cor, extra = '') => S('rect', { x, y, width: w, height: h, rx: 5, style: COR[cor] + ';stroke-width:1.3' + (extra ? ';' + extra : '') }, p);
const seta = (p, d, cor = 'var(--muted)') => S('path', { d, style: `fill:none;stroke:${cor};stroke-width:1.6;stroke-linecap:round`, 'marker-end': 'url(#mult-seta)' }, p);

(function () {
  const raiz = document.getElementById('fig-mult');
  const svg = document.getElementById('mult-svg');
  if (!raiz || !svg) return;

  const defs = S('defs', null, svg);
  const mk = S('marker', { id: 'mult-seta', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
  S('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:var(--muted)' }, mk);
  const palco = S('g', null, svg);

  const FORN = ['Atividades imobiliárias', 'Atividades administrativas', 'Serviços profissionais', 'Intermediação financeira'];
  /* escala da barra de baixo: R$ 1,00 = 200 px */
  const U = 200;

  new StepFig(raiz, {
    speed: 2600,
    notes: [
      'As famílias gastam R$ 1,00 em educação do terceiro setor. Esse gasto é a <b>demanda final</b>.',
      'Para produzir, a escola compra insumos: imóveis, serviços administrativos, profissionais e financeiros. É consumo intermediário, e é demanda nova para esses setores.',
      'Esses setores também compram de outros (energia, transporte, comércio…). Cada rodada é menor que a anterior, mas a cadeia continua. Os valores por rodada não vêm do estudo: o desenho é só uma ilustração.',
      'Somando todas as rodadas, R$ 1,00 de demanda final vira R$ 1,41 de produção no país: o R$ 1,00 inicial mais R$ 0,41 de efeito indireto. Esse 1,41 é o <b>multiplicador</b> da Educação do terceiro setor.',
      'A <b>extração hipotética</b> faz o caminho contrário: tira a Educação do terceiro setor e soma a queda na cadeia inteira. Resultado: produção −0,60% (R$ 61,6 bi), valor adicionado −0,77% (R$ 39,5 bi) e ocupações −0,85% (864 mil).',
    ],
    render(k) {
      palco.replaceChildren();
      const fam = caixa(palco, 10, 96, 100, 50, 'bl');
      txt(palco, 60, 121, 'Famílias');
      const esc = caixa(palco, 170, 86, 140, 70, 'gr');
      txt(palco, 240, 110, 'Educação');
      txt(palco, 240, 130, '(terceiro setor)', 'font-size:11px;fill:var(--muted)');
      seta(palco, 'M112 121 H166');
      txt(palco, 139, 106, 'R$ 1,00', 'font-size:11px');

      if (k >= 1 && k <= 3) {
        FORN.forEach((n, i) => {
          const y = 14 + i * 56;
          caixa(palco, 380, y, 180, 38, 'am');
          txt(palco, 470, y + 19, n, 'font-size:11px');
          seta(palco, `M312 121 C346 121 346 ${y + 19} 376 ${y + 19}`);
        });
      }
      if (k >= 2 && k <= 3) {
        [0, 1, 2, 3].forEach((i) => {
          const y = 14 + i * 56;
          caixa(palco, 584, y + 5, 50, 28, 'k', 'stroke-dasharray:4 3');
          txt(palco, 609, y + 19, '…', 'fill:var(--muted)');
          seta(palco, `M562 ${y + 19} H582`);
        });
        txt(palco, 600, 246, 'a cadeia segue', 'font-size:11px;fill:var(--muted)');
      }
      if (k === 4) {
        [
          ['produção', '−0,60%', 'R$ 61,6 bi'],
          ['valor adicionado', '−0,77%', 'R$ 39,5 bi'],
          ['ocupações', '−0,85%', '864 mil'],
        ].forEach(([r, p, v], i) => {
          const y = 20 + i * 62;
          caixa(palco, 380, y, 250, 52, 'rd');
          txt(palco, 460, y + 17, r, 'font-size:11px;fill:var(--muted)');
          txt(palco, 460, y + 36, p, 'font-size:16px;font-weight:700');
          txt(palco, 570, y + 26, v, 'font-size:13px');
          seta(palco, `M312 121 C346 121 346 ${y + 26} 376 ${y + 26}`, 'var(--red)');
        });
        esc.setAttribute('style', COR.k + ';stroke-width:1.3;stroke-dasharray:5 4;opacity:.6');
        fam.setAttribute('style', fam.getAttribute('style') + ';opacity:.6');
      }

      /* barra de baixo: demanda inicial e efeito indireto */
      if (k <= 3) {
        const indireto = k >= 3 ? 0.41 : k === 2 ? 0.18 : 0;
        txt(palco, 10, 262, 'produção no país', 'text-anchor:start;font-size:11px;fill:var(--muted)');
        caixa(palco, 10, 272, U, 20, 'bl');
        txt(palco, 10 + U / 2, 282, 'R$ 1,00', 'font-size:11px');
        if (indireto) {
          caixa(palco, 10 + U, 272, Math.max(8, indireto * U), 20, 'am');
          if (k >= 3) txt(palco, 10 + U + (indireto * U) / 2, 282, '+0,41', 'font-size:11px');
        }
        if (k === 3) txt(palco, 10 + U + 0.41 * U + 12, 282, '= R$ 1,41', 'text-anchor:start;font-weight:700');
      }
    },
  });
})();

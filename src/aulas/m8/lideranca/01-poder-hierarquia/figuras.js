import { S } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figura da aula: a reunião de 27/01/1986, do "não lancem" dos engenheiros à recomendação assinada.
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
const caixa = (p, x, y, w, h, cor, extra = '') => S('rect', { x, y, width: w, height: h, rx: 6, style: COR[cor] + ';stroke-width:1.3' + (extra ? ';' + extra : '') }, p);
const seta = (p, d, cor, extra = '') => S('path', { d, style: `fill:none;stroke:var(--${cor});stroke-width:1.8;stroke-linecap:round` + (extra ? ';' + extra : ''), 'marker-end': `url(#reu-seta-${cor})` }, p);

(function () {
  const raiz = document.getElementById('fig-reuniao');
  const svg = document.getElementById('reuniao-svg');
  if (!raiz || !svg) return;

  const defs = S('defs', null, svg);
  ['green', 'red', 'amber', 'muted'].forEach((c) => {
    const mk = S('marker', { id: `reu-seta-${c}`, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
    S('path', { d: 'M0,0 L10,5 L0,10 z', style: `fill:var(--${c})` }, mk);
  });
  const palco = S('g', null, svg);

  /* atores: engenharia e gerência da Thiokol à esquerda, NASA à direita */
  const ator = (x, y, cor, nome, quem, apagado) => {
    const g = S('g', { style: apagado ? 'opacity:.35' : '' }, palco);
    caixa(g, x, y, 170, 56, cor);
    txt(g, x + 85, y + 20, nome, 'font-weight:600');
    txt(g, x + 85, y + 38, quem, 'font-size:11px;fill:var(--muted)');
    return g;
  };

  new StepFig(raiz, {
    speed: 2800,
    notes: [
      'Véspera do lançamento, depois de seis dias de adiamento. Previsão perto de 0 °C (fez 2 °C). O anel nunca fora testado no booster abaixo de 4 °C, e o voo mais frio até ali saíra a 12 °C.',
      'Os engenheiros da Thiokol, McDonald e Boisjoly, apresentam: perto de 0 °C não dá para garantir a vedação. Adiem até esquentar.',
      'Mulloy (NASA) responde com zombaria: "Quando vocês querem que eu lance? Em abril?". E vira a regra: agora os engenheiros têm de provar que o voo <b>não</b> é seguro. É a <b>inversão do ônus da prova</b>.',
      'A gerência da Thiokol se reúne 30 minutos a sós, longe dos engenheiros. Sem dado abaixo de 4 °C, ninguém consegue provar o perigo.',
      'Kilminster recomenda lançar. A NASA pede, pela primeira vez, a recomendação assinada. McDonald se recusa; Kilminster assina.',
      'O alerta não sai da sala: controle de voo e astronautas não sabem da objeção. Lançamento em 28/01, 11h38.',
    ],
    render(k) {
      palco.replaceChildren();
      ator(20, 20, 'gr', 'Engenharia Thiokol', 'McDonald, Boisjoly', k === 3);
      ator(20, 214, 'am', 'Gerência Thiokol', 'Kilminster', k < 3);
      ator(450, 117, 'bl', 'NASA', 'Mulloy', false);

      if (k === 0) {
        /* termômetro: três temperaturas numa escala de 0 a 14 °C */
        const y = (c) => 270 - c * 16;
        S('line', { x1: 320, y1: y(0), x2: 320, y2: y(14), style: 'stroke:var(--line2);stroke-width:8;stroke-linecap:round' }, palco);
        [[12, 'voo mais frio até então', 'k'], [4, 'menor temperatura testada', 'am'], [2, 'dia do lançamento', 'rd']].forEach(([c, r, cor]) => {
          S('circle', { cx: 320, cy: y(c), r: 7, style: COR[cor] + ';stroke-width:1.5' }, palco);
          txt(palco, 300, y(c), `${c} °C`, 'text-anchor:end;font-weight:600');
          txt(palco, 336, y(c), r, 'text-anchor:start;font-size:11px;fill:var(--muted)');
        });
      }
      if (k === 1) {
        seta(palco, 'M192 48 C320 48 380 100 446 132', 'green');
        txt(palco, 320, 40, '"adiem até esquentar"');
      }
      if (k === 2) {
        seta(palco, 'M446 140 C380 110 320 70 194 60', 'red');
        txt(palco, 330, 66, '"Em abril?"', 'fill:var(--red)');
        caixa(palco, 210, 150, 220, 70, 'k');
        txt(palco, 320, 170, 'provar que é seguro → lança', 'font-size:11px;text-decoration:line-through;fill:var(--muted)');
        txt(palco, 320, 198, 'provar que NÃO é seguro', 'font-size:11px;font-weight:600;fill:var(--red)');
      }
      if (k === 3) {
        S('rect', { x: 10, y: 200, width: 190, height: 84, rx: 10, style: 'fill:none;stroke:var(--amber);stroke-width:1.5;stroke-dasharray:6 4' }, palco);
        txt(palco, 300, 242, '30 min a sós', 'text-anchor:start;fill:var(--amber);font-weight:600');
        txt(palco, 300, 92, 'fora da conversa', 'text-anchor:start;font-size:11px;fill:var(--muted)');
      }
      if (k === 4) {
        seta(palco, 'M192 240 C320 240 380 190 446 160', 'amber');
        txt(palco, 330, 232, 'recomenda lançar', 'fill:var(--amber)');
        txt(palco, 330, 252, 'assinado: Kilminster', 'font-size:11px;fill:var(--muted)');
        txt(palco, 105, 96, 'McDonald não assina', 'fill:var(--red);font-weight:600');
      }
      if (k === 5) {
        caixa(palco, 240, 120, 160, 50, 'rd');
        txt(palco, 320, 138, '28/01 · 11h38', 'font-weight:600');
        txt(palco, 320, 156, 'lançamento', 'font-size:11px');
        seta(palco, 'M446 145 H404', 'red');
        caixa(palco, 470, 230, 150, 46, 'k');
        txt(palco, 545, 246, 'controle de voo', 'font-size:11px');
        txt(palco, 545, 262, 'e astronautas', 'font-size:11px');
        S('path', { d: 'M192 60 C260 60 300 230 466 250', style: 'fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:4 4' }, palco);
        txt(palco, 300, 214, '✕', 'font-size:20px;fill:var(--red)');
        txt(palco, 300, 232, 'alerta não chega', 'font-size:11px;fill:var(--muted)');
      }
    },
  });
})();

import { S } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figuras da aula: a pirâmide das cinco disfunções e o dilema do prisioneiro.
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

/* ---------- Figura 1: a pirâmide, de baixo para cima ---------- */
(function () {
  const raiz = document.getElementById('fig-piramide');
  const svg = document.getElementById('piramide-svg');
  if (!raiz || !svg) return;
  const palco = S('g', null, svg);

  const camadas = [
    ['confiança', 'ausência de confiança'],
    ['conflito produtivo', 'medo do conflito'],
    ['comprometimento', 'falta de comprometimento'],
    ['responsabilidade', 'fuga da responsabilidade'],
    ['resultados', 'falta de atenção aos resultados'],
  ];
  /* pirâmide à esquerda: ápice em (200, 20), base em y = 290 com meia largura 180 */
  const cx = 200, topo = 20, base = 290, meia = 180, alt = 54;
  const hw = (y) => (meia * (y - topo)) / (base - topo);

  new StepFig(raiz, {
    speed: 3200,
    notes: [
      '1 · <b>Ausência de confiança</b>, a base. Para a empresa de Lencioni, o medo de se mostrar vulnerável impede as pessoas de confiar umas nas outras. Sem confiança, diz o artigo, não se chega aos conflitos produtivos.',
      '2 · <b>Medo do conflito</b>. A vontade de manter uma harmonia artificial sufoca o debate de ideias, e é desse debate que saem as ideias novas.',
      '3 · <b>Falta de comprometimento</b>. Sem clareza nem adesão, o time não toma decisões que todos sustentam depois.',
      '4 · <b>Fuga da responsabilidade</b>. Para evitar desconforto, ninguém cobra do colega o comportamento e a entrega combinados.',
      '5 · <b>Falta de atenção aos resultados</b>. Metas individuais e status pessoal tiram o foco do resultado coletivo.',
      'Leia de baixo para cima: cada camada depende da anterior. Por isso, segundo o artigo, o team building se concentra em solidificar a confiança.',
    ],
    render(k) {
      palco.replaceChildren();
      camadas.forEach(([pos, neg], i) => {
        const yb = base - i * alt, yt = i === 4 ? topo : yb - alt;
        const pts = [[cx - hw(yb), yb], [cx + hw(yb), yb], [cx + hw(yt), yt], [cx - hw(yt), yt]].map((p) => p.join(',')).join(' ');
        const futura = k < 5 && i > k;
        const cor = k === 5 ? (i === 0 ? 'bl' : 'gr') : i === k ? 'am' : 'gr';
        S('polygon', { points: pts, style: futura ? 'fill:none;stroke:var(--line2);stroke-dasharray:4 4;opacity:.5' : COR[cor] + ';stroke-width:1.3' }, palco);
        const ym = i === 4 ? yb - 18 : yb - alt / 2;
        if (!futura) {
          txt(palco, cx, ym, String(i + 1), 'font-weight:600');
          txt(palco, 392, ym - (i === k ? 8 : 0), pos, 'text-anchor:start' + (i === k ? ';font-weight:600' : ''));
          if (i === k) txt(palco, 392, ym + 10, 'sem ela: ' + neg, 'text-anchor:start;font-size:11px;fill:var(--red)');
          S('line', { x1: cx + hw(ym) + 6, y1: ym, x2: 384, y2: ym, style: 'stroke:var(--line2);stroke-dasharray:2 3' }, palco);
        }
      });
      if (k === 5) txt(palco, cx, base - alt / 2 + 16, 'o team building mira aqui', 'font-size:11px;fill:var(--blue)');
    },
  });
})();

/* ---------- Figura 2: o dilema do prisioneiro ---------- */
(function () {
  const raiz = document.getElementById('fig-dilema');
  const svg = document.getElementById('dilema-svg');
  if (!raiz || !svg) return;
  const palco = S('g', null, svg);

  /* penas em anos: [você, colega]; chave = sua escolha + escolha do colega (c coopera, d compete) */
  const pena = { cc: [1, 1], cd: [10, 0], dc: [0, 10], dd: [5, 5] };
  const anos = (n) => (n === 0 ? 'livre' : n === 1 ? '1 ano' : `${n} anos`);
  const X = { c: 230, d: 430 }, Y = { c: 60, d: 160 }, W = 200, H = 100;

  new StepFig(raiz, {
    speed: 3000,
    notes: [
      'Dois suspeitos em salas separadas, sem poder combinar nada. Cada um escolhe: cooperar com o outro (ficar calado) ou competir (delatar o outro).',
      'As penas, em anos de prisão. Os dois calados: 1 ano cada. Um delata e o outro cala: quem delatou sai livre, quem calou pega 10. Os dois delatam: 5 anos cada.',
      'Pense como você. Se o colega cooperar: cooperando, você pega 1 ano; competindo, sai livre. Competir é melhor.',
      'Se o colega competir: cooperando, você pega 10; competindo, 5. Competir é melhor de novo.',
      'Seja qual for a escolha do outro, competir parece melhor. O colega faz a mesma conta, e os dois acabam com 5 anos.',
      'Se os dois tivessem cooperado, pegariam 1 ano cada. O que é racional para cada um sozinho deixa os dois pior: esse é o dilema.',
      'Numa equipe, cooperar é dividir o crédito e ajudar o colega; competir é buscar o próprio destaque. O que muda a conta é confiar que o outro também vai cooperar.',
    ],
    render(k) {
      palco.replaceChildren();
      txt(palco, X.c + W / 2, 40, 'colega coopera', 'font-weight:600');
      txt(palco, X.d + W / 2, 40, 'colega compete', 'font-weight:600');
      txt(palco, 120, Y.c + H / 2, 'você coopera', 'font-weight:600');
      txt(palco, 120, Y.d + H / 2, 'você compete', 'font-weight:600');
      /* destaque de cada passo: célula → cor */
      const realce = [{}, {}, { cc: 'k', dc: 'gr' }, { cd: 'k', dd: 'gr' }, { dd: 'rd' }, { cc: 'gr', dd: 'rd' }, { cc: 'gr', dd: 'rd' }][k];
      const apaga = (k === 2 && 'd') || (k === 3 && 'c') || '';
      ['c', 'd'].forEach((eu) => ['c', 'd'].forEach((ele) => {
        const chave = eu + ele, x = X[ele], y = Y[eu];
        const cor = realce[chave] || 'k';
        const fora = (apaga && ele === apaga) || (k >= 4 && !realce[chave]);
        caixa(palco, x, y, W, H, cor, fora ? 'opacity:.3' : '');
        if (k === 0) { txt(palco, x + W / 2, y + H / 2, '?', 'font-size:20px;fill:var(--muted)'); return; }
        const [v, c] = pena[chave];
        txt(palco, x + W / 2, y + 38, 'você: ' + anos(v), 'font-weight:600' + (fora ? ';opacity:.4' : ''));
        txt(palco, x + W / 2, y + 62, 'colega: ' + anos(c), 'font-size:11px;fill:var(--muted)' + (fora ? ';opacity:.4' : ''));
      }));
      if (k === 2) txt(palco, X.c + W / 2, 280, '0 anos < 1 ano: competir ganha', 'fill:var(--green)');
      if (k === 3) txt(palco, X.d + W / 2, 280, '5 anos < 10 anos: competir ganha', 'fill:var(--green)');
      if (k === 4) txt(palco, 430, 280, 'os dois competem: 5 e 5', 'fill:var(--red)');
      if (k === 5) txt(palco, 430, 280, 'cooperar: 1 e 1, melhor para os dois', 'fill:var(--green)');
      if (k === 6) txt(palco, 430, 280, 'cooperar = dividir crédito · competir = buscar destaque', 'font-size:11px');
    },
  });
})();

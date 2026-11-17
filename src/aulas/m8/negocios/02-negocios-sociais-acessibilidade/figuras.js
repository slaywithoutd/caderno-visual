import { S } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figuras da aula 02 de Negócios: a linha de corte do censo e o caminho de um negócio na Yunus Social Business.
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
const seta = (p, d, id, cor = 'var(--muted)') => S('path', { d, style: `fill:none;stroke:${cor};stroke-width:1.6;stroke-linecap:round`, 'marker-end': `url(#${id})` }, p);
const marcador = (svg, id) => {
  const defs = S('defs', null, svg);
  const mk = S('marker', { id, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
  S('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:var(--muted)' }, mk);
};

/* ---------- Figura 1 · linha de corte do Censo 2010 ---------- */
(function () {
  const raiz = document.getElementById('fig-corte');
  const svg = document.getElementById('corte-svg');
  if (!raiz || !svg) return;
  marcador(svg, 'corte-seta');
  const palco = S('g', null, svg);

  /* visão no Censo 2010, em milhões (Quadro 1 do PNTA) */
  const VISAO = [['não consegue', 0.53], ['grande dificuldade', 6.06], ['alguma dificuldade', 29.21]];
  const PX = 13.2; /* px por milhão: 29,21 mi ≈ 386 px */
  const X0 = 170;

  new StepFig(raiz, {
    speed: 2800,
    notes: [
      'O censo pergunta, para enxergar, ouvir e andar: você tem dificuldade permanente? A pessoa escolhe uma de quatro respostas.',
      'Os números da visão em 2010: 0,53 milhão não consegue enxergar, 6,06 milhões têm grande dificuldade e 29,21 milhões têm alguma dificuldade. Repare como a barra de baixo domina.',
      'Critério amplo, usado na divulgação de 2010: quem marcou pelo menos "alguma dificuldade" conta. Visão: 35,8 milhões. Somando todos os tipos, sem contar a mesma pessoa duas vezes: 45,6 milhões, 23,9% do país.',
      'A <b>linha de corte</b> do Grupo de Washington só conta "grande dificuldade" ou "não consegue". A barra de baixo sai da conta. Visão: 6,6 milhões (soma nossa). Total: 12,7 milhões, 6,7%.',
      'Quem sai é sobretudo quem tem dificuldade leve, comum na velhice: a parcela de idosos com deficiência cai de 63,4% para 23,5%. Com o corte, o Brasil fica comparável a outros países e as políticas são dimensionadas com o público que precisa de apoio.',
    ],
    render(k) {
      palco.replaceChildren();
      if (k === 0) {
        caixa(palco, 120, 30, 400, 56, 'bl');
        txt(palco, 320, 58, 'Tem dificuldade permanente de enxergar?', 'font-size:14px');
        const resp = ['nenhuma', 'alguma', 'grande', 'não consegue'];
        resp.forEach((r, i) => {
          const x = 40 + i * 145;
          caixa(palco, x, 150, 125, 44, i === 0 ? 'k' : 'am');
          txt(palco, x + 62, 172, r);
          seta(palco, `M320 88 C320 120 ${x + 62} 120 ${x + 62} 146`, 'corte-seta');
        });
        txt(palco, 320, 240, 'mesma pergunta para ouvir e para andar', 'font-size:11px;fill:var(--muted)');
        return;
      }
      txt(palco, 10, 18, 'Visão, Censo 2010 (milhões de pessoas)', 'text-anchor:start;font-size:11px;fill:var(--muted)');
      VISAO.forEach(([nome, v], i) => {
        const y = 40 + i * 50;
        const fora = k >= 3 && i === 2;
        const dentro = (k === 2) || (k >= 3 && i < 2);
        txt(palco, X0 - 10, y + 16, nome, 'text-anchor:end;font-size:12px' + (fora ? ';fill:var(--muted)' : ''));
        caixa(palco, X0, y, Math.max(4, v * PX), 32, fora ? 'k' : dentro ? 'am' : 'bl', fora ? 'stroke-dasharray:4 3;opacity:.5' : '');
        txt(palco, X0 + Math.max(4, v * PX) + 8, y + 16, v.toFixed(2).replace('.', ','), 'text-anchor:start' + (fora ? ';fill:var(--muted);text-decoration:line-through' : ''));
      });
      if (k === 2 || k === 3) {
        txt(palco, X0, 196, 'visão neste critério: ' + (k === 2 ? '35,8 mi' : '6,6 mi'), 'text-anchor:start;font-weight:700');
      }
      if (k >= 2) {
        const amplo = k === 2;
        caixa(palco, 10, 214, 200, 66, amplo ? 'am' : 'k', amplo ? '' : 'opacity:.6');
        txt(palco, 110, 234, 'critério amplo', 'font-size:11px;fill:var(--muted)');
        txt(palco, 110, 258, '45,6 mi · 23,9%', 'font-size:15px;font-weight:700');
        caixa(palco, 220, 214, 200, 66, amplo ? 'k' : 'gr', amplo ? 'opacity:.6' : '');
        txt(palco, 320, 234, 'linha de corte', 'font-size:11px;fill:var(--muted)');
        txt(palco, 320, 258, '12,7 mi · 6,7%', 'font-size:15px;font-weight:700');
      }
      if (k === 4) {
        caixa(palco, 430, 214, 200, 66, 'rd');
        txt(palco, 530, 234, 'idosos com deficiência', 'font-size:11px;fill:var(--muted)');
        txt(palco, 530, 258, '63,4% → 23,5%', 'font-size:15px;font-weight:700');
      }
    },
  });
})();

/* ---------- Figura 2 · caminho de um negócio na Yunus Social Business ---------- */
(function () {
  const raiz = document.getElementById('fig-ysb');
  const svg = document.getElementById('ysb-svg');
  if (!raiz || !svg) return;
  marcador(svg, 'ysb-seta');
  const palco = S('g', null, svg);

  const ETAPAS = [
    ['divulgação', 'workshops, eventos'],
    ['aceleração', '~3 meses, grátis'],
    ['mentoria', 'coaching, mercados'],
    ['preparo', 'investment readiness'],
    ['comitê', '4 critérios'],
    ['empréstimo', 'abaixo do mercado'],
    ['relatórios', 'KPIs, apoio'],
    ['pagamento', 'o dinheiro gira'],
  ];
  const pos = (i) => ({ x: 14 + (i % 4) * 156, y: i < 4 ? 30 : 140 });
  const W = 136, H = 58;

  /* rodapé de cada passo: o que medir ou o número que pesa */
  const RODAPE = [
    'Brasil: 251 negócios inscritos',
    'Brasil: 26 selecionados de 251 (cerca de 10%)',
    'apoio individual a quem foi selecionado',
    'conexão com a rede Grameen e com investidores',
    'equipe · impacto · escala · modelo de negócio',
    'longo prazo · carência de até 2 anos · até 25% de participação',
    'relatório mensal, trimestral e anual',
    'US$ 8,6 mi para 34 empresas desde 2011 · Brasil: nenhum',
  ];

  new StepFig(raiz, {
    speed: 2400,
    notes: [
      'Divulgação: workshops, conferências e eventos com parceiros locais atraem empreendedores. No Brasil, 251 negócios se inscreveram.',
      'Programa de <b>aceleração</b> de cerca de três meses, gratuito: workshops, palestras de líderes e teste de mercado do produto. No Brasil, 26 foram selecionados, cerca de 10%; no Haiti, 12 de 300 (4%).',
      'Mentoria individual (1-on-1 coaching) sobre estratégia, modelo de negócio e finanças, e acesso a mercados: distribuidores, clientes e um pacote de contabilidade, jurídico e marketing.',
      'Comunidade com outros negócios sociais e o grupo Grameen, e preparação para investimento (investment readiness): o negócio fica pronto para o comitê e conhece investidores.',
      'O comitê da YSB Funds escolhe com quatro critérios: equipe, profundidade e alcance do impacto, replicação e escala, maturidade do modelo de negócio.',
      'Empréstimo de longo prazo, abaixo do mercado, com até dois anos de carência e uma pequena participação minoritária, de até 25%. A YSB não doa.',
      'O negócio manda relatórios mensal, trimestral e anual com <b>KPIs</b> escolhidos junto com a YSB, que intervém com apoio jurídico, contábil e de processos quando há dificuldade.',
      'Quando o negócio paga, o dinheiro financia outro negócio ou volta aos credores filantrópicos até o valor nominal. Desde 2011: US$ 8,6 milhões para 34 empresas. No Brasil, até o artigo, nenhum negócio chegou aqui.',
    ],
    render(k) {
      palco.replaceChildren();
      ETAPAS.forEach(([nome, sub], i) => {
        const { x, y } = pos(i);
        const cor = i < k ? 'gr' : i === k ? 'am' : 'k';
        caixa(palco, x, y, W, H, cor, i > k ? 'opacity:.55' : '');
        txt(palco, x + W / 2, y + 22, nome, 'font-size:12px;font-weight:600');
        txt(palco, x + W / 2, y + 40, sub, 'font-size:10px;fill:var(--muted)');
        if (i < ETAPAS.length - 1) {
          const b = pos(i + 1);
          if (i === 3) seta(palco, `M${x + W / 2} ${y + H + 2} C${x + W / 2} 120 ${b.x + W / 2} 100 ${b.x + W / 2} ${b.y - 4}`, 'ysb-seta');
          else seta(palco, `M${x + W + 2} ${y + H / 2} H${b.x - 4}`, 'ysb-seta');
        }
      });
      if (k === 7) {
        const a = pos(7), b = pos(5);
        S('path', { d: `M${a.x + W / 2} ${a.y + H + 2} C${a.x + W / 2} 236 ${b.x + W / 2} 236 ${b.x + W / 2} ${b.y + H + 4}`, style: 'fill:none;stroke:var(--green);stroke-width:1.8;stroke-dasharray:5 4', 'marker-end': 'url(#ysb-seta)' }, palco);
        txt(palco, (a.x + b.x + W) / 2, 232, 'próximo negócio', 'font-size:11px;fill:var(--green)');
      }
      txt(palco, 320, 280, RODAPE[k], 'font-size:12px;font-weight:600');
    },
  });
})();

import { S } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figuras da aula 07. Cores por estilo inline com os tokens do global.css
   (as classes k/bl/am… valem só nos desenhos de margem). */
const COR = {
  k: 'fill:var(--surface);stroke:var(--line2)',
  bl: 'fill:var(--blue-soft);stroke:var(--blue)',
  am: 'fill:var(--amber-soft);stroke:var(--amber)',
  gr: 'fill:var(--green-soft);stroke:var(--green)',
  rd: 'fill:var(--red-soft);stroke:var(--red)',
  ac: 'fill:var(--accent-soft);stroke:var(--accent)',
};
const TX = 'font-family:var(--f-mono);font-size:12px;fill:var(--fg);text-anchor:middle;dominant-baseline:central';
const txt = (p, x, y, s, extra = '') => S('text', { x, y, style: TX + (extra ? ';' + extra : '') }, p, s);
const caixa = (p, x, y, w, h, cor, extra = '') => S('rect', { x, y, width: w, height: h, rx: 6, style: COR[cor] + ';stroke-width:1.3' + (extra ? ';' + extra : '') }, p);
function marcador(svg, id) {
  const defs = S('defs', null, svg);
  const mk = S('marker', { id, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
  S('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:var(--muted)' }, mk);
}
const seta = (p, d, id, extra = '') => S('path', { d, style: 'fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round' + (extra ? ';' + extra : ''), 'marker-end': `url(#${id})` }, p);

/* ---------- Figura 1 · da página carregada à permissão esquecida ---------- */
(function () {
  const raiz = document.getElementById('fig-conexao');
  const svg = document.getElementById('conexao-svg');
  if (!raiz || !svg) return;
  marcador(svg, 'cx-seta');
  const palco = S('g', null, svg);

  /* estado de cada passo: código chamado, resultado, seletor aberto, permissão, porta aberta, cabo ligado */
  const P = [
    { cod: ['getPorts()'], res: '[ ]', perm: false, aberta: false, cabo: true },
    { cod: ['requestPort({ filters:', '[{ usbVendorId: 0x2E8A }] })'], res: 'esperando a escolha…', seletor: true, clique: true, perm: false, aberta: false, cabo: true },
    { cod: ['requestPort(…)'], res: 'SerialPort (Pico)', perm: true, aberta: false, cabo: true },
    { cod: ['open({ baudRate: 115200 })'], res: 'readable e writable', perm: true, aberta: true, cabo: true },
    { cod: ['getPorts()', '(página recarregada)'], res: '[ SerialPort (Pico) ]', perm: true, aberta: false, cabo: true },
    { cod: ['evento disconnect'], res: 'readable = null', perm: true, aberta: false, cabo: false },
    { cod: ['forget()'], res: 'permissão apagada', perm: false, aberta: false, cabo: true },
  ];

  new StepFig(raiz, {
    speed: 2600,
    notes: [
      'A página carrega e chama <code>getPorts()</code>. Volta <code>[ ]</code>: este site ainda não recebeu porta nenhuma, mesmo com o Pico ligado.',
      'A pessoa clica em Conectar. Dentro dessa <b>ativação transitória</b>, a página chama <code>requestPort()</code> com o filtro 0x2E8A. O navegador abre o seletor e mostra só o Pico.',
      'A pessoa escolhe o Pico. A Promise cumpre com um <code>SerialPort</code>, e o navegador guarda a permissão para esta origem.',
      '<code>open({ baudRate: 115200 })</code> abre a porta. Agora existem <code>readable</code> (placa → página) e <code>writable</code> (página → placa).',
      'A página recarrega e a porta fecha junto. Mas a permissão ficou: <code>getPorts()</code> já devolve o Pico, sem clique e sem seletor.',
      'O cabo sai. O navegador dispara <code>disconnect</code> e, se a porta estava aberta, <code>readable</code> vira <code>null</code>. A permissão continua: quando o cabo voltar, vem <code>connect</code>.',
      '<code>forget()</code> devolve a permissão. Daqui em diante, só com um novo clique e o seletor.',
    ],
    render(k) {
      palco.replaceChildren();
      const p = P[k];
      txt(palco, 105, 14, 'página', 'font-weight:600');
      txt(palco, 320, 14, 'navegador', 'font-weight:600');
      txt(palco, 535, 14, 'placa', 'font-weight:600');

      /* página: a chamada e o resultado */
      caixa(palco, 10, 30, 190, 110, 'k');
      p.cod.forEach((l, i) => txt(palco, 105, 56 + i * 18, l, 'font-size:11px;fill:var(--accent)'));
      txt(palco, 105, 112, '→ ' + p.res, 'font-size:11.5px');
      if (p.clique) {
        caixa(palco, 60, 150, 90, 26, 'ac');
        txt(palco, 105, 163, 'Conectar', 'font-size:11.5px');
        txt(palco, 105, 188, 'clique', 'font-size:10.5px;fill:var(--muted)');
      }

      /* navegador: seletor (passo 2) e permissões da origem */
      if (p.seletor) {
        caixa(palco, 225, 30, 190, 120, 'k');
        txt(palco, 320, 46, 'escolha uma porta', 'font-size:10.5px;fill:var(--muted)');
        caixa(palco, 237, 60, 166, 26, 'ac');
        txt(palco, 320, 73, 'Pico · COM5', 'font-size:11.5px');
        caixa(palco, 237, 92, 166, 26, 'k', 'opacity:.45');
        txt(palco, 320, 105, 'Uno · fora do filtro', 'font-size:10.5px;fill:var(--muted)');
        txt(palco, 320, 134, 'Cancelar → NotFoundError', 'font-size:10px;fill:var(--muted)');
        seta(palco, 'M202,70 H222', 'cx-seta');
      }
      txt(palco, 320, 214, 'permissões desta origem', 'font-size:10.5px;fill:var(--muted)');
      caixa(palco, 225, 226, 190, 40, p.perm ? 'gr' : 'k', p.perm ? '' : 'stroke-dasharray:4 3');
      txt(palco, 320, 246, p.perm ? 'Pico · 0x2E8A : 0x000A' : '(nenhuma)', p.perm ? 'font-size:11.5px' : 'font-size:11px;fill:var(--muted)');

      /* placa: o Pico, com ou sem cabo */
      caixa(palco, 470, 40, 130, 70, p.cabo ? 'gr' : 'k', p.cabo ? '' : 'stroke-dasharray:5 4;opacity:.6');
      txt(palco, 535, 66, 'Pico', 'font-weight:600');
      txt(palco, 535, 88, 'RP2040 · USB CDC', 'font-size:10.5px;fill:var(--muted)');
      /* o cabo USB sai da placa e vai ao computador (página e navegador moram nele) */
      if (p.cabo) {
        S('path', { d: 'M535,110 V176 H432', style: 'fill:none;stroke:var(--line2);stroke-width:2' }, palco);
        caixa(palco, 418, 168, 16, 16, 'k');
        txt(palco, 483, 192, 'cabo USB', 'font-size:10.5px;fill:var(--muted)');
      } else {
        S('path', { d: 'M535,110 V150', style: 'fill:none;stroke:var(--line2);stroke-width:2;stroke-dasharray:4 3' }, palco);
        caixa(palco, 418, 168, 16, 16, 'k');
        txt(palco, 535, 168, 'cabo fora', 'font-size:11px;fill:var(--red)');
      }

      /* streams abertos */
      if (p.aberta) {
        seta(palco, 'M468,66 C430,66 430,92 204,92', 'cx-seta', 'stroke:var(--blue)');
        txt(palco, 320, 82, 'readable', 'font-size:11px;fill:var(--blue)');
        seta(palco, 'M204,124 C430,124 430,96 468,96', 'cx-seta', 'stroke:var(--amber)');
        txt(palco, 320, 136, 'writable', 'font-size:11px;fill:var(--amber)');
      }
    },
  });
})();

/* ---------- Figura 2 · o laço de leitura, volta por volta ---------- */
(function () {
  const raiz = document.getElementById('fig-leitura');
  const svg = document.getElementById('leitura-svg');
  if (!raiz || !svg) return;
  const palco = S('g', null, svg);

  const COD = [
    'while (port.readable) {',
    '  const reader = port.readable.getReader();',
    '  try {',
    '    while (true) {',
    '      const { value, done } = await reader.read();',
    '      if (done) break;',
    '      tratar(value);',
    '    }',
    '  } catch (erro) { … }',
    '  finally { reader.releaseLock(); }',
    '}',
  ];
  const CH1 = { b: ['6F', '6B'], s: '"ok"' };
  const CH2 = { b: ['0D', '0A', '54', '3D', '32'], s: '"\\r\\nT=2"' };
  /* estado de cada passo: linhas destacadas, readable, trava, chunks lidos, evento */
  const P = [
    { hl: [0, 1], rd: 'ReadableStream nº 1', trava: 'reader nº 1', ch: [], ev: '' },
    { hl: [4, 5, 6], rd: 'ReadableStream nº 1', trava: 'reader nº 1', ch: [CH1], ev: ['done: false', 'gr'] },
    { hl: [4, 6], rd: 'ReadableStream nº 1', trava: 'reader nº 1', ch: [CH1, CH2], ev: ['chunk de 5 bytes', 'gr'] },
    { hl: [4, 8, 9], rd: 'nº 1 com erro', trava: 'livre', ch: [CH1, CH2], ev: ['framing error', 'rd'] },
    { hl: [0, 1], rd: 'ReadableStream nº 2', trava: 'reader nº 2', ch: [CH1, CH2], ev: ['erro não fatal: segue', 'am'] },
    { hl: [4, 8, 9, 0], rd: 'null', trava: 'livre', ch: [CH1, CH2], ev: ['cabo saiu: erro fatal', 'rd'] },
    { hl: [4, 5, 9], rd: 'ReadableStream nº 2', trava: 'livre', ch: [CH1, CH2], ev: ['reader.cancel() → done: true', 'am'] },
  ];

  new StepFig(raiz, {
    speed: 2600,
    notes: [
      '<code>port.readable</code> existe, então o laço externo entra. <code>getReader()</code> cria o reader e trava o stream para ele.',
      '<code>read()</code> espera até chegar algo. Chega um chunk de 2 bytes, [0x6F, 0x6B] ("ok"). <code>done</code> é <code>false</code>: trata e volta ao <code>read()</code>.',
      'O próximo chunk tem 5 bytes, [0x0D, 0x0A, 0x54, 0x3D, 0x32]: o fim de uma linha e o começo da outra. O tamanho vem de quando os bytes chegaram, não da mensagem.',
      'Ruído no fio: <b>framing error</b>. <code>read()</code> lança a exceção, o <code>catch</code> trata e o <code>finally</code> solta a trava.',
      'Foi um erro não fatal: a porta criou outro <code>readable</code>. O laço externo vê que ele existe, cria um reader novo e a leitura segue.',
      'Agora o cabo sai: erro fatal. Exceção, <code>finally</code>, e <code>port.readable</code> é <code>null</code>. O laço externo termina.',
      'Outro jeito de sair: alguém chama <code>reader.cancel()</code>. O <code>read()</code> cumpre na hora com <code>done: true</code> e o <code>break</code> sai do laço interno. Sem uma flag, o externo criaria outro reader (veja Fechar a porta).',
    ],
    render(k) {
      palco.replaceChildren();
      const p = P[k];
      /* código */
      S('rect', { x: 6, y: 8, width: 382, height: 284, rx: 8, style: COR.k + ';stroke-width:1.2' }, palco);
      COD.forEach((l, i) => {
        const y = 30 + i * 24;
        if (p.hl.includes(i)) S('rect', { x: 12, y: y - 11, width: 370, height: 22, rx: 4, style: COR.ac + ';stroke-width:1' }, palco);
        txt(palco, 20, y, l, 'text-anchor:start;font-size:11.5px;white-space:pre');
      });
      /* estado */
      txt(palco, 412, 22, 'port.readable', 'text-anchor:start;font-size:10.5px;fill:var(--muted)');
      caixa(palco, 410, 30, 222, 30, p.rd === 'null' ? 'rd' : 'bl');
      txt(palco, 521, 45, p.rd, 'font-size:11.5px');
      txt(palco, 412, 76, 'trava do stream', 'text-anchor:start;font-size:10.5px;fill:var(--muted)');
      caixa(palco, 410, 84, 222, 30, p.trava === 'livre' ? 'k' : 'am');
      txt(palco, 521, 99, p.trava, 'font-size:11.5px');
      txt(palco, 412, 130, 'chunks lidos (value)', 'text-anchor:start;font-size:10.5px;fill:var(--muted)');
      p.ch.forEach((c, i) => {
        const y = 140 + i * 40;
        c.b.forEach((b, j) => {
          caixa(palco, 410 + j * 30, y, 27, 24, 'bl', 'rx:3');
          txt(palco, 410 + j * 30 + 13.5, y + 12, b, 'font-size:10.5px');
        });
        txt(palco, 410 + c.b.length * 30 + 6, y + 12, c.s, 'text-anchor:start;font-size:10.5px;fill:var(--muted)');
      });
      if (p.ev) {
        caixa(palco, 410, 244, 222, 34, p.ev[1]);
        txt(palco, 521, 261, p.ev[0], 'font-size:11.5px');
      }
    },
  });
})();

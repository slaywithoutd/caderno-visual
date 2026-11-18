import { S } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Figuras da aula 15. Cores por estilo inline com os tokens do global.css
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

/* ---------- Figura 1 · a montadora que trocou a ordem dos carros (exemplo de Petroni et al.) ---------- */
(function () {
  const raiz = document.getElementById('fig-sequencia');
  const svg = document.getElementById('sequencia-svg');
  if (!raiz || !svg) return;
  marcador(svg, 'sq-seta');
  const palco = S('g', null, svg);

  const PLANO = ['A', 'B', 'C', 'D'];
  const REAL = ['A', 'C', 'B', 'D'];
  /* estado de cada passo: ordem na linha, ordem dos kits, B parado, RFID, MES, kits errados, dados */
  const P = [
    { linha: PLANO, kits: PLANO, parado: false, rfid: false, mes: false, erro: false, dados: false },
    { linha: REAL, kits: PLANO, parado: true, rfid: false, mes: false, erro: false, dados: false },
    { linha: REAL, kits: PLANO, parado: true, rfid: false, mes: false, erro: true, dados: false },
    { linha: REAL, kits: PLANO, parado: true, rfid: true, mes: false, erro: false, dados: false },
    { linha: REAL, kits: REAL, parado: true, rfid: true, mes: true, erro: false, dados: false },
    { linha: REAL, kits: REAL, parado: false, rfid: true, mes: true, erro: false, dados: true },
  ];

  new StepFig(raiz, {
    speed: 2800,
    notes: [
      'O <b>PCP</b>, uma das funções do ERP, planeja o lote: carros A, B, C e D, nessa ordem. As estações seguintes separam os kits de peças do estoque seguindo esse plano.',
      'Um problema na estação 1 segura o carro B. A ordem real na linha vira A, C, B, D. O plano no sistema continua dizendo A, B, C, D.',
      'Sem CPS, ninguém avisa a tempo. A estação 2 entrega o kit de B quando quem chega é o C: atraso, ou a linha para para reorganizar.',
      'Com CPS: cada carroceria leva uma etiqueta <b>RFID</b> (camada física). Leitores ao longo da linha sabem onde cada carro está agora.',
      'As posições chegam ao <b>MES</b> em tempo real, e ele avisa todas as estações seguintes. Os kits são separados na ordem nova, A, C, B, D, e a linha não para.',
      'Tudo o que os leitores e as estações registram vai para um banco de dados grande, que alimenta o BI. O mesmo MES pode avisar fornecedores para entregas just in time.',
    ],
    render(k) {
      palco.replaceChildren();
      const p = P[k];

      /* camada cyber: PCP/ERP e MES */
      txt(palco, 12, 14, 'camada cyber', 'text-anchor:start;font-size:10.5px;fill:var(--muted)');
      caixa(palco, 10, 24, 200, 52, 'k');
      txt(palco, 110, 40, 'PCP (no ERP): plano', 'font-size:11px;fill:var(--muted)');
      txt(palco, 110, 60, PLANO.join('  '), 'font-weight:600;letter-spacing:2px');
      caixa(palco, 240, 24, 200, 52, p.mes ? 'ac' : 'k', p.mes ? '' : 'stroke-dasharray:4 3;opacity:.5');
      txt(palco, 340, 40, 'MES: posição real', 'font-size:11px;fill:var(--muted)');
      txt(palco, 340, 60, p.mes ? REAL.join('  ') : '?', 'font-weight:600;letter-spacing:2px');
      caixa(palco, 470, 24, 160, 52, p.dados ? 'bl' : 'k', p.dados ? '' : 'opacity:.35');
      txt(palco, 550, 40, 'banco de dados → BI', 'font-size:11px');
      txt(palco, 550, 60, p.dados ? 'fornecedores ↔ MES' : '', 'font-size:10.5px;fill:var(--muted)');

      /* camada física: a linha com três estações */
      txt(palco, 12, 108, 'camada física', 'text-anchor:start;font-size:10.5px;fill:var(--muted)');
      S('path', { d: 'M20,190 H620', style: 'stroke:var(--line2);stroke-width:3' }, palco);
      const est = [['estação 1', 110], ['estação 2 · kits', 330], ['estação 3', 540]];
      est.forEach(([nome, x]) => {
        caixa(palco, x - 70, 120, 140, 34, 'am', 'opacity:.85');
        txt(palco, x, 137, nome, 'font-size:11px');
      });
      /* carros na linha, da direita (primeiro) para a esquerda */
      p.linha.forEach((c, i) => {
        const x = 520 - i * 120;
        const parado = p.parado && c === 'B';
        caixa(palco, x, 172, 56, 36, parado ? 'rd' : 'gr');
        txt(palco, x + 28, 190, c, 'font-weight:600');
        if (p.rfid) {
          S('circle', { cx: x + 48, cy: 178, r: 4, style: 'fill:var(--accent)' }, palco);
          seta(palco, `M${x + 48},170 V${p.mes ? 82 : 160}`, 'sq-seta', p.mes ? 'stroke:var(--accent);stroke-dasharray:3 3' : 'stroke:var(--accent)');
        }
      });
      /* kits na estação 2 */
      txt(palco, 330, 236, 'kits separados para:', 'font-size:10.5px;fill:var(--muted)');
      p.kits.forEach((c, i) => {
        const x = 250 + i * 42;
        const errado = p.erro && p.kits[i] !== p.linha[i];
        caixa(palco, x, 248, 34, 26, errado ? 'rd' : 'k');
        txt(palco, x + 17, 261, c, 'font-size:11.5px');
      });
      if (p.erro) txt(palco, 520, 261, 'kit de B, carro C: parada', 'font-size:11px;fill:var(--red)');
      if (p.mes) seta(palco, 'M340,78 V116', 'sq-seta', 'stroke:var(--accent)');
    },
  });
})();

/* ---------- Figura 2 · um aperto da campainha, com e sem resposta ---------- */
(function () {
  const raiz = document.getElementById('fig-ack');
  const svg = document.getElementById('ack-svg');
  if (!raiz || !svg) return;
  marcador(svg, 'ak-seta');
  const palco = S('g', null, svg);

  /* estado de cada passo: botão, código em A, SPI, pacote no ar, ACK, FIFO de B, código em B, LED,
     monitores, linha do tempo (tentativas) e se o rádio B existe */
  const P = [
    { botao: false, codA: 'digitalRead → HIGH: return', codB: 'available() → false: return', mA: '', mB: '', rb: true },
    { botao: true, codA: 'write(&message, 32)', spi: true, codB: 'available() → false', mA: '', mB: '', rb: true },
    { botao: true, codA: 'write(): esperando ACK', ar: 'pacote', codB: 'available() → false', mA: '', mB: '', rb: true, tl: 1 },
    { botao: true, codA: 'write(): esperando ACK', ack: true, fifo: 1, codB: 'available() → false', mA: '', mB: '', rb: true, tl: 1 },
    { botao: true, codA: 'write() → true', fifo: 1, codB: 'available() → false', mA: 'ding dong 1: delivered', mB: '', rb: true, tl: 1 },
    { botao: false, codA: 'esperou soltar', fifo: 0, codB: 'read(); LED HIGH', led: true, mA: 'ding dong 1: delivered', mB: 'heard: ding dong 1', rb: true, tl: 1 },
    { botao: true, codA: 'write(): esperando ACK', ar: 'pacote', codB: '(sem rádio)', mA: '', mB: '', rb: false, tl: 3 },
    { botao: true, codA: 'write() → false', codB: '(sem rádio)', mA: 'ding dong 1: no answer', mB: '', rb: false, tl: 16 },
  ];

  new StepFig(raiz, {
    speed: 2600,
    notes: [
      'Ninguém apertou nada. A cada volta, o transmissor lê o botão (HIGH, solto) e sai do <code>loop()</code>; o receptor pergunta <code>available()</code>, ouve "não" e sai também. Os dois fazem polling.',
      'O botão desce: <code>digitalRead</code> devolve LOW. O sketch monta "ding dong 1" e chama <code>write()</code>. A RF24 baixa o CSN, passa os 32 bytes pelo SPI e pulsa o CE.',
      'O rádio A leva 130 µs para assentar e transmite: preâmbulo, endereço "00001", controle, 32 bytes e CRC. São 329 bits, 329 µs no ar a 1 Mbps.',
      'O rádio B confere endereço e CRC, guarda o payload na FIFO de recepção e devolve o <b>ACK</b>, sozinho, em hardware. O sketch de B ainda nem olhou.',
      'O ACK chega ao rádio A. <code>write()</code> devolve <code>true</code> e o monitor do transmissor mostra "ding dong 1: delivered".',
      'Na volta seguinte, <code>available()</code> do receptor dá <code>true</code>. <code>read()</code> tira o pacote da FIFO, o monitor mostra "heard: ding dong 1" e o LED acende por 300 ms.',
      'Agora sem o rádio B. O pacote sai e ninguém responde. O rádio A espera 1500 µs e transmite de novo, sem o sketch participar.',
      'Depois de 1 envio e 15 retransmissões, cerca de 28 ms, o rádio desiste. <code>write()</code> devolve <code>false</code> e o monitor mostra "ding dong 1: no answer".',
    ],
    render(k) {
      palco.replaceChildren();
      const p = P[k];

      /* placa A: botão, Uno, rádio */
      caixa(palco, 10, 20, 54, 34, p.botao ? 'am' : 'k');
      txt(palco, 37, 37, p.botao ? 'LOW' : 'botão', 'font-size:11px');
      caixa(palco, 10, 70, 150, 60, 'bl');
      txt(palco, 85, 86, 'Uno A · transmissor', 'font-size:11px;font-weight:600');
      txt(palco, 85, 110, p.codA, 'font-size:10.5px;fill:var(--accent)');
      caixa(palco, 176, 80, 70, 40, 'ac');
      txt(palco, 211, 100, 'rádio A');
      if (p.spi) { seta(palco, 'M160,100 H174', 'ak-seta', 'stroke:var(--accent)'); txt(palco, 167, 140, 'SPI · 32 B', 'font-size:10px;fill:var(--accent)'); }

      /* placa B: rádio, Uno, LED */
      caixa(palco, 394, 80, 70, 40, p.rb ? 'ac' : 'k', p.rb ? '' : 'stroke-dasharray:4 3;opacity:.5');
      txt(palco, 429, 100, p.rb ? 'rádio B' : 'sem rádio', p.rb ? '' : 'fill:var(--muted);font-size:11px');
      caixa(palco, 480, 70, 150, 60, 'bl');
      txt(palco, 555, 86, 'Uno B · receptor', 'font-size:11px;font-weight:600');
      txt(palco, 555, 110, p.codB, 'font-size:10.5px;fill:var(--accent)');
      caixa(palco, 576, 20, 54, 34, p.led ? 'gr' : 'k');
      txt(palco, 603, 37, p.led ? 'aceso' : 'LED', 'font-size:11px');
      /* FIFO de recepção de B: 3 lugares */
      txt(palco, 429, 140, 'FIFO RX', 'font-size:10px;fill:var(--muted)');
      [0, 1, 2].forEach((i) => caixa(palco, 400 + i * 20, 148, 16, 14, i < (p.fifo || 0) ? 'gr' : 'k'));

      /* o ar */
      if (p.ar) {
        seta(palco, 'M250,92 C300,70 340,70 390,92', 'ak-seta', 'stroke:var(--blue);stroke-width:2');
        txt(palco, 320, 62, p.rb ? 'pacote · 329 µs' : 'pacote · ninguém ouve', 'font-size:11px;fill:var(--blue)');
      }
      if (p.ack) {
        seta(palco, 'M390,110 C340,132 300,132 250,110', 'ak-seta', 'stroke:var(--green);stroke-width:2');
        txt(palco, 320, 140, 'ACK', 'font-size:11px;fill:var(--green);font-weight:600');
      }

      /* monitores seriais */
      caixa(palco, 10, 176, 300, 30, 'k');
      txt(palco, 160, 191, p.mA || 'monitor A', p.mA ? 'font-size:11px' : 'font-size:10.5px;fill:var(--muted)');
      caixa(palco, 330, 176, 300, 30, 'k');
      txt(palco, 480, 191, p.mB || 'monitor B', p.mB ? 'font-size:11px' : 'font-size:10.5px;fill:var(--muted)');

      /* linha do tempo das tentativas (16 no máximo) */
      txt(palco, 10, 230, 'tentativas de envio (1 + até 15 retransmissões, 1500 µs entre elas)', 'text-anchor:start;font-size:10.5px;fill:var(--muted)');
      for (let i = 0; i < 16; i++) {
        const feito = i < (p.tl || 0);
        const x = 10 + i * 38;
        caixa(palco, x, 244, 30, 20, feito ? (p.rb ? 'gr' : 'rd') : 'k', feito ? '' : 'opacity:.35');
      }
      if (p.tl === 16) txt(palco, 320, 284, '≈ 16 × 329 µs + 15 × 1500 µs ≈ 28 ms com o loop() parado', 'font-size:11px;fill:var(--red)');
      else if (p.tl === 1 && p.rb) txt(palco, 320, 284, 'uma tentativa bastou', 'font-size:11px;fill:var(--green)');
    },
  });
})();

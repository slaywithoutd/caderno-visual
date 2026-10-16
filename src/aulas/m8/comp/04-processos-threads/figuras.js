import { S, H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';
import { drawMachine } from '../../../../lib/machine.js';

/* ---------- utilitários de desenho (SVG das figuras, fora da margem) ---------- */
const COR = {
  bl: ['--blue-soft', '--blue'], am: ['--amber-soft', '--amber'], gr: ['--green-soft', '--green'],
  rd: ['--red-soft', '--red'], ac: ['--accent-soft', '--accent'], k: ['--surface', '--line2'], cz: ['--surface2', '--line2'],
};
const TRANS = 'transition:fill .3s,stroke .3s,opacity .35s,stroke-width .3s';
function caixa(p, x, y, w, h, tom = 'k', rx = 6) {
  const [f, s] = COR[tom];
  return S('rect', { x, y, width: w, height: h, rx, style: `fill:var(${f});stroke:var(${s});stroke-width:1.4;${TRANS}` }, p);
}
function pinta(r, tom, grosso = false) {
  const [f, s] = COR[tom];
  r.style.fill = `var(${f})`; r.style.stroke = `var(${s})`; r.style.strokeWidth = grosso ? '2.6' : '1.4';
}
function txt(p, x, y, s, { tam = 13, cor = '--fg', anc = 'middle', peso = 400, corpo = false } = {}) {
  return S('text', { x, y, 'text-anchor': anc, 'dominant-baseline': 'central',
    style: `fill:var(${cor});font-family:var(${corpo ? '--f-body' : '--f-mono'});font-size:${tam}px;font-weight:${peso};${TRANS}` }, p, s);
}
function marcador(svg) {
  const id = 'pt' + Math.random().toString(36).slice(2, 7);
  const defs = S('defs', null, svg);
  const mk = S('marker', { id, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, defs);
  S('path', { d: 'M0,0 L10,5 L0,10 z', style: 'fill:var(--muted)' }, mk);
  return `url(#${id})`;
}
function linha(p, d, seta, { cor = '--muted', larg = 1.5, tracejado = false } = {}) {
  const a = { d, style: `fill:none;stroke:var(${cor});stroke-width:${larg};${TRANS}` };
  if (seta) a['marker-end'] = seta;
  if (tracejado) a['stroke-dasharray'] = '5 4';
  return S('path', a, p);
}
const mostra = (el, on) => { el.style.opacity = on ? 1 : 0; };
const num = (x, d = 3) => x.toLocaleString('pt-BR', { maximumFractionDigits: d });

/* ============ Figura 1: syscall e interrupção ============ */
(function () {
  const root = document.getElementById('fig-syscall');
  if (!root) return;
  const svg = document.getElementById('sc-svg'), cap = document.getElementById('sc-cap');
  const seta = marcador(svg);
  const Y = { P: 40, Q: 92, N: 156, D: 222 }, A = 30;
  const faixas = [['P', 'processo P'], ['Q', 'processo Q'], ['N', 'kernel'], ['D', 'disco']];
  faixas.forEach(([k, nome]) => {
    S('line', { x1: 100, y1: Y[k], x2: 630, y2: Y[k], style: 'stroke:var(--line);stroke-width:1' }, svg);
    txt(svg, 8, Y[k], nome, { tam: 12, cor: '--muted', anc: 'start' });
  });
  S('line', { x1: 4, y1: 124, x2: 636, y2: 124, style: 'stroke:var(--line2);stroke-width:1.2', 'stroke-dasharray': '6 4' }, svg);
  txt(svg, 8, 115, 'modo usuário ↑', { tam: 10, cor: '--muted', anc: 'start' });
  txt(svg, 8, 134, 'modo kernel ↓', { tam: 10, cor: '--muted', anc: 'start' });
  /* [faixa, x0, x1, rótulo, tom, passo em que aparece, tracejado] */
  const SEG = [
    ['P', 100, 176, 'P calcula', 'bl', 0], ['P', 176, 206, 'read', 'am', 1],
    ['N', 206, 262, 'syscall', 'ac', 2], ['D', 262, 470, 'lendo o disco (ms)', 'gr', 3],
    ['P', 206, 520, 'P em espera', 'cz', 3, true], ['Q', 276, 470, 'Q calcula', 'bl', 4],
    ['N', 262, 276, '', 'ac', 4], ['N', 470, 530, 'tratador', 'rd', 5],
    ['P', 520, 572, 'pronto', 'cz', 6, true], ['Q', 530, 572, 'Q', 'bl', 6],
    ['N', 572, 588, '', 'ac', 7], ['P', 588, 630, 'P', 'bl', 7],
  ];
  const segs = SEG.map(([f, x0, x1, lab, tom, k, tr]) => {
    const g = S('g', null, svg);
    const r = caixa(g, x0, Y[f] - A / 2, x1 - x0, A, tom, 4);
    if (tr) r.setAttribute('stroke-dasharray', '4 3');
    if (lab) txt(g, (x0 + x1) / 2, Y[f], lab, { tam: 11.5 });
    return { g, r, k, tom };
  });
  /* setas verticais: [x, y0, y1, rótulo, passo] */
  const SET = [
    [206, Y.P + 16, Y.N - 17, 'trap', 1], [262, Y.N + 16, Y.D - 17, 'pedido', 3],
    [470, Y.D - 16, Y.N + 17, 'interrupção', 5], [588, Y.N - 16, Y.P + 17, 'retorna', 7],
  ];
  const setas = SET.map(([x, y0, y1, lab, k]) => {
    const g = S('g', null, svg);
    linha(g, `M${x} ${y0} V${y1}`, seta, { cor: '--fg2', larg: 1.6 });
    txt(g, x + 5, (y0 + y1) / 2 + (y1 > y0 ? -8 : 8), lab, { tam: 10.5, cor: '--fg2', anc: 'start' });
    return { g, k };
  });
  const cursor = S('line', { y1: 6, y2: 246, style: `stroke:var(--amber);stroke-width:1.5;${TRANS}`, 'stroke-dasharray': '2 3' }, svg);
  const XC = [176, 206, 262, 276, 470, 530, 572, 630];
  const caps = [
    'CPU em modo usuário · executando P',
    'P executa a instrução syscall → a CPU vai entrar no kernel',
    'CPU em modo kernel · o kernel atende o pedido de P',
    'P: executando → espera · o disco trabalha sozinho',
    'CPU em modo usuário · executando Q enquanto o disco lê',
    'interrupção do disco → CPU em modo kernel · tratador roda',
    'P: espera → pronto · Q continua de onde parou',
    'P volta à CPU · read() retorna com os dados',
  ];
  const notes = [
    'O processo <b>P</b> executa em modo usuário, fazendo contas. A faixa do kernel está vazia: o SO só roda quando alguém o chama.',
    'P precisa ler um arquivo e chama <code>read()</code>. A biblioteca põe o número do serviço e os argumentos em registradores e executa a instrução <code>syscall</code>.',
    'A CPU passa para <b>modo kernel</b> e salta para o ponto de entrada fixo do kernel. Ele confere o pedido: o arquivo existe? P tem permissão?',
    'O kernel manda o pedido ao controlador do disco e põe P em <b>espera</b>. O disco vai levar milissegundos, e não faz sentido a CPU esperar junto.',
    'O scheduler escolhe outro processo, <b>Q</b>, e a CPU volta ao modo usuário para executá-lo. Isso é multiprogramação: a CPU não fica parada durante a E/S de P.',
    'O disco termina e gera uma <b>interrupção</b>. A CPU para Q entre duas instruções, guarda PC e status, passa para modo kernel e roda o tratador de interrupção.',
    'O tratador copia os dados lidos, marca P como <b>pronto</b> e devolve a CPU. Q continua de onde parou, sem perceber nada.',
    'Quando chega a vez de P, o kernel o retoma: <code>read()</code> retorna com os dados e P segue em modo usuário, como se a leitura tivesse sido instantânea.',
  ];
  new StepFig(root, { notes, speed: 2300, render(k) {
    segs.forEach((s) => { mostra(s.g, s.k <= k); s.r.style.strokeWidth = s.k === k ? '2.6' : '1.4'; });
    setas.forEach((s) => { mostra(s.g, s.k <= k); });
    cursor.setAttribute('x1', XC[k]); cursor.setAttribute('x2', XC[k]);
    cap.textContent = caps[k];
  } });
})();

/* ============ Figura 2: diagrama de estados ============ */
(function () {
  const root = document.getElementById('fig-estados');
  if (!root) return;
  const svg = document.getElementById('est-svg');
  const D = drawMachine(svg, {
    states: [
      { id: 'novo', x: 70, y: 90 }, { id: 'pronto', x: 240, y: 90 },
      { id: 'exec', x: 440, y: 90, note: 'executando' }, { id: 'espera', x: 340, y: 232 },
      { id: 'fim', x: 590, y: 90, note: 'terminado', accept: true },
    ],
    edges: [
      { from: 'novo', to: 'pronto', labels: [{ text: 'admitido', k: 0 }] },
      { from: 'pronto', to: 'exec', labels: [{ text: 'escalonado', k: 0 }], bend: -34 },
      { from: 'exec', to: 'pronto', labels: [{ text: 'preempção', k: 0 }], bend: -34 },
      { from: 'exec', to: 'espera', labels: [{ text: 'pede E/S', k: 0 }] },
      { from: 'espera', to: 'pronto', labels: [{ text: 'E/S terminou', k: 0 }] },
      { from: 'exec', to: 'fim', labels: [{ text: 'exit', k: 0 }] },
    ],
  });
  Object.values(D.states).forEach((g) => { const t = g.querySelector('text'); if (t) t.style.fontSize = '11.5px'; });
  D.states.exec.querySelector('text').textContent = 'exec.';
  const prontos = document.getElementById('est-prontos'), cpu = document.getElementById('est-cpu');
  /* [estado de A, aresta, fila de prontos, na CPU, em espera] */
  const P = [
    ['novo', null, ['C'], 'B', []],
    ['pronto', 'novo>pronto', ['C', 'A'], 'B', []],
    ['pronto', null, ['A', 'B'], 'C', []],
    ['exec', 'pronto>exec', ['B'], 'A', ['C']],
    ['espera', 'exec>espera', [], 'B', ['C', 'A']],
    ['pronto', 'espera>pronto', ['A'], 'B', ['C']],
    ['exec', 'pronto>exec', ['B', 'C'], 'A', []],
    ['pronto', 'exec>pronto', ['C', 'A'], 'B', []],
    ['exec', 'pronto>exec', ['B'], 'A', ['C']],
    ['fim', 'exec>fim', [], 'B', ['C']],
    ['fim', null, [], 'B', ['C']],
  ];
  const notes = [
    'O usuário abre um programa. O SO cria o processo <b>A</b>: monta o PCB e reserva memória. Estado: <b>novo</b>. B está na CPU e C espera na fila.',
    'A é admitido e entra no <b>fim</b> da fila de prontos. Tem tudo para rodar; só falta a CPU.',
    'O quantum de B acaba e ele volta para a fila; C assume a CPU. A andou na fila, mas continua pronto.',
    'C pede E/S e vai para espera. O scheduler escolhe A, e o dispatcher carrega o contexto dele: <b>pronto → executando</b>.',
    'A chama <code>read()</code> para ler o disco. Ele mesmo pede para sair: <b>executando → espera</b>. B assume a CPU.',
    'O disco termina e manda uma interrupção. O tratador acorda A, que vai para a <b>fila de prontos</b>, e não direto para a CPU: B continua executando.',
    'B termina o quantum e vai para a fila; C, cuja E/S acabou, também está lá. A volta à CPU e continua na instrução seguinte ao <code>read()</code>.',
    'O temporizador avisa que o quantum de A acabou. <b>Preempção</b>: A volta para o fim da fila mesmo querendo continuar, e B assume.',
    'C executou e pediu E/S de novo; B teve a vez dele. A é escolhido mais uma vez.',
    'A chama <code>exit()</code>. O SO fecha os arquivos, libera a memória e, por fim, apaga o PCB. Estado: <b>terminado</b>.',
    'Repare no caminho de A: ele nunca foi de espera direto para executando, nem de pronto para espera. Toda entrada na CPU passa pela fila de prontos.',
  ];
  const chip = (p) => `<span class="q${p === 'A' ? ' rep' : ''}">${p}</span>`;
  new StepFig(root, { notes, speed: 2400, render(k) {
    const [st, ed, fila, naCpu, esp] = P[k];
    Object.values(D.states).forEach((g) => g.classList.remove('on', 'acc'));
    Object.values(D.edges).forEach((g) => g.classList.remove('on'));
    D.states[st].classList.add(st === 'fim' ? 'acc' : 'on');
    if (ed) D.edges[ed].classList.add('on');
    prontos.innerHTML = fila.length ? fila.map(chip).join('<span class="ar">←</span>') : '<span class="muted">vazia</span>';
    cpu.innerHTML = `<span class="q">CPU: ${naCpu === 'A' ? '<b>A</b>' : naCpu}</span><span class="ar">·</span><span class="q">espera: ${esp.length ? esp.map((p) => (p === 'A' ? '<b>A</b>' : p)).join(', ') : '—'}</span>`;
  } });
})();

/* ============ Figura 3: troca de contexto ============ */
(function () {
  const root = document.getElementById('fig-troca');
  if (!root) return;
  const svg = document.getElementById('tr-svg'), cap = document.getElementById('tr-cap');
  const seta = marcador(svg);
  /* linha do tempo da CPU */
  txt(svg, 20, 14, 'CPU ao longo do tempo', { tam: 11, cor: '--muted', anc: 'start' });
  const segA = caixa(svg, 20, 26, 250, 30, 'bl', 4); txt(svg, 145, 41, 'A executa', { tam: 12 });
  const segT = caixa(svg, 270, 26, 0, 30, 'rd', 4); const labT = txt(svg, 330, 41, 'troca', { tam: 12 });
  const segB = caixa(svg, 390, 26, 230, 30, 'am', 4); const labB = txt(svg, 505, 41, 'B executa', { tam: 12 });
  const tick = S('g', null, svg);
  linha(tick, 'M270 62 V80', null, { cor: '--red', larg: 1.6 });
  txt(tick, 276, 72, 'interrupção do temporizador', { tam: 10.5, cor: '--red', anc: 'start' });

  /* blocos: PCB A, CPU, PCB B */
  const CAMPOS = ['estado', 'PC', 'SP', 'R1', 'status', 'mapa'];
  function bloco(x, titulo, tom) {
    const g = S('g', null, svg);
    caixa(g, x, 100, 180, 206, tom, 8);
    txt(g, x + 90, 116, titulo, { tam: 12.5, peso: 600 });
    const linhas = {};
    CAMPOS.forEach((c, i) => {
      const y = 146 + i * 27;
      const fundo = caixa(g, x + 8, y - 11, 164, 22, 'k', 4);
      fundo.style.stroke = 'transparent';
      txt(g, x + 16, y, c, { tam: 11, cor: '--muted', anc: 'start' });
      const v = txt(g, x + 164, y, '', { tam: 12, anc: 'end' });
      linhas[c] = { fundo, v };
    });
    return { g, linhas };
  }
  const pa = bloco(20, 'PCB de A', 'bl'), cpuB = bloco(230, 'CPU (registradores)', 'cz'), pb = bloco(440, 'PCB de B', 'am');
  const salvar = S('g', null, svg); linha(salvar, 'M230 210 H204', seta, { cor: '--blue', larg: 2.2 }); txt(salvar, 217, 196, 'salva', { tam: 10.5, cor: '--blue' });
  const carregar = S('g', null, svg); linha(carregar, 'M440 210 H414', seta, { cor: '--amber', larg: 2.2 }); txt(carregar, 427, 196, 'carrega', { tam: 10.5, cor: '--amber' });
  const VA = { PC: '0x4A10', SP: '0x7FF0', R1: '731', mapa: 'tab. A' };
  const VB = { PC: '0x2C88', SP: '0x6E40', R1: '12', mapa: 'tab. B' };
  /* por passo: conteúdo de cada bloco e quais linhas destacar */
  function quadro(k) {
    const cpu = k <= 4 ? { ...VA, estado: '', status: k === 0 ? 'usuário' : 'kernel' } : { ...VB, estado: '', status: k === 7 ? 'usuário' : 'kernel', mapa: k >= 6 ? 'tab. B' : 'tab. A' };
    const a = k < 2 ? { estado: 'executando', PC: '(velho)', SP: '(velho)', R1: '(velho)', status: '(velho)', mapa: 'tab. A' } : { ...VA, estado: k < 3 ? 'executando' : 'pronto', status: 'usuário' };
    const b = { ...VB, estado: k < 5 ? 'pronto' : 'executando', status: 'usuário' };
    const hl = { 2: [['a', 'PC'], ['a', 'SP'], ['a', 'R1'], ['a', 'status']], 3: [['a', 'estado']], 4: [['b', 'estado']], 5: [['c', 'PC'], ['c', 'SP'], ['c', 'R1'], ['b', 'estado']], 6: [['c', 'mapa']], 7: [['c', 'status']], 1: [['c', 'status']] }[k] || [];
    return { cpu, a, b, hl };
  }
  const notes = [
    '<b>A</b> executa em modo usuário. Os registradores da CPU guardam o contexto de hardware de A: <code>PC = 0x4A10</code>, <code>R1 = 731</code>… O PCB de A ainda tem valores velhos, da última vez que ele saiu da CPU.',
    'O temporizador interrompe: o quantum de A acabou. A CPU passa para <b>modo kernel</b> e entra no tratador. Daqui em diante nenhum processo avança: começou o overhead.',
    'O kernel <b>salva</b> o contexto de hardware de A no PCB de A: PC, SP, registradores e status.',
    'Atualiza o estado de A no PCB, <b>executando → pronto</b>, e põe A no fim da fila de prontos.',
    'O scheduler escolhe o próximo da fila: <b>B</b>. O PCB de B tem o contexto salvo da última vez que B saiu da CPU.',
    'O dispatcher <b>carrega</b> o contexto de B do PCB para os registradores da CPU. Estado de B: executando.',
    'Troca o mapa de memória para o espaço de endereçamento de B (a tabela de páginas). A cache e a TLB ainda estão cheias de dados de A: os primeiros acessos de B vão dar miss.',
    'Volta ao modo usuário e salta para o PC de B, <code>0x2C88</code>. B continua exatamente de onde tinha parado. A faixa vermelha entre A e B é o overhead: alguns µs sem trabalho útil para ninguém.',
  ];
  const caps = [
    'modo usuário · A executando',
    'modo kernel · interrupção do temporizador',
    'salvar: registradores da CPU → PCB de A',
    'PCB de A: estado = pronto · A vai para a fila',
    'scheduler escolhe B',
    'carregar: PCB de B → registradores da CPU',
    'trocar o mapa de memória: tabela de páginas de B',
    'modo usuário · B executando · troca concluída',
  ];
  new StepFig(root, { notes, speed: 2400, render(k) {
    const q = quadro(k);
    const preenche = (blk, vals, id) => CAMPOS.forEach((c) => {
      const L = blk.linhas[c];
      L.v.textContent = vals[c] ?? '';
      L.v.style.fill = String(vals[c]).startsWith('(') ? 'var(--muted)' : 'var(--fg)';
      const on = q.hl.some(([b, f]) => b === id && f === c);
      pinta(L.fundo, on ? 'am' : 'k'); L.fundo.style.stroke = on ? 'var(--amber)' : 'transparent';
    });
    preenche(pa, q.a, 'a'); preenche(cpuB, q.cpu, 'c'); preenche(pb, q.b, 'b');
    cpuB.linhas.estado.v.textContent = k <= 4 ? 'de A' : 'de B';
    const largT = k === 0 ? 0 : Math.min(120, 20 + (k - 1) * 17);
    segT.setAttribute('width', largT); mostra(labT, k >= 3);
    mostra(segB, k >= 7); mostra(labB, k >= 7); mostra(tick, k >= 1);
    mostra(salvar, k === 2); mostra(carregar, k === 5);
    cap.textContent = caps[k];
  } });
})();

/* ============ Figura 4: quantum × custo da troca ============ */
(function () {
  const $ = (id) => document.getElementById(id);
  if (!$('fig-custo')) return;
  const QS = [0.25, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 50];
  const SS = [1, 5, 10, 20, 50, 100, 200, 500, 1000];
  const svg = $('cu-svg'), out = $('cu-out');
  const JANELA = 20, X0 = 20, LARG = 600;
  function upd() {
    const q = QS[+$('cu-q').value], sUs = SS[+$('cu-s').value], n = +$('cu-n').value, s = sUs / 1000;
    $('cu-qv').textContent = num(q); $('cu-sv').textContent = num(sUs); $('cu-nv').textContent = n;
    svg.innerHTML = '';
    txt(svg, X0, 12, '0 ms', { tam: 10.5, cor: '--muted', anc: 'start' });
    txt(svg, X0 + LARG, 12, `${JANELA} ms`, { tam: 10.5, cor: '--muted', anc: 'end' });
    let t = 0, i = 0;
    const esc = (ms) => (ms / JANELA) * LARG;
    while (t < JANELA) {
      const w = Math.min(esc(q), esc(JANELA - t));
      caixa(svg, X0 + esc(t), 30, Math.max(w, 0.8), 40, 'bl', 2);
      if (w > 28) txt(svg, X0 + esc(t) + w / 2, 50, `P${(i % n) + 1}`, { tam: 11 });
      t += q; i++;
      if (t >= JANELA) break;
      const ws = Math.min(esc(s), esc(JANELA - t));
      caixa(svg, X0 + esc(t), 30, Math.max(ws, 1.6), 40, 'rd', 1);
      t += s;
    }
    const util = q / (q + s), espera = (n - 1) * (q + s);
    txt(svg, X0, 92, `${i} fatias e ${Math.max(0, i - 1)} trocas nesta janela`, { tam: 11, cor: '--muted', anc: 'start' });
    const rows = [
      ['fração útil', `q / (q + s) = ${num(q)} / (${num(q)} + ${num(s, 3)}) = ${num(util * 100, 2)} %`],
      ['overhead', `s / (q + s) = ${num((1 - util) * 100, 2)} %`],
      ['trocas por segundo', `1000 / (q + s) ≈ ${num(1000 / (q + s), 0)}`],
      ['espera até a vez voltar', `(n − 1) × (q + s) = ${n - 1} × ${num(q + s, 3)} = ${num(espera, 3)} ms`],
    ];
    out.innerHTML = rows.map((r) => `<span>${r[0]}</span><span>${esc0(r[1])}</span>`).join('');
  }
  const esc0 = (x) => x.replace(/</g, '&lt;');
  ['cu-q', 'cu-s', 'cu-n'].forEach((id) => $(id).addEventListener('input', upd));
  upd();
})();

/* ============ Figura 5: processo com três threads ============ */
(function () {
  const root = document.getElementById('fig-threads');
  if (!root) return;
  const svg = document.getElementById('th-svg'), cap = document.getElementById('th-cap');
  const seta = marcador(svg);
  caixa(svg, 6, 6, 628, 318, 'cz', 12);
  txt(svg, 18, 20, 'processo · PID 4182 · editor de texto', { tam: 11, cor: '--muted', anc: 'start' });
  /* região compartilhada */
  const SH = [
    ['codigo', 18, 'código', ['teclado()', 'ortografia()', 'salvar()']],
    ['dados', 172, 'dados globais', ['texto = "…"', 'alterado = 1']],
    ['heap', 326, 'heap', ['documento', 'dicionário']],
    ['arqs', 480, 'arquivos abertos', ['3 relatorio.txt']],
  ];
  const sh = {};
  SH.forEach(([id, x, tit, linhas]) => {
    const g = S('g', null, svg);
    const r = caixa(g, x, 32, 142, 102, 'k', 6);
    txt(g, x + 71, 46, tit, { tam: 11.5, peso: 600 });
    const ls = linhas.map((l, i) => txt(g, x + 12, 70 + i * 22, l, { tam: 11.5, anc: 'start' }));
    sh[id] = { r, ls };
  });
  /* colunas das threads */
  const CORES = ['bl', 'am', 'gr'];
  const cols = [0, 1, 2].map((i) => {
    const x = 40 + i * 200, g = S('g', null, svg);
    caixa(g, x, 156, 160, 160, 'k', 8);
    txt(g, x + 80, 170, `thread T${i + 1}`, { tam: 12, peso: 600 });
    const tag = (y, s) => txt(g, x + 10, y, s, { tam: 10.5, cor: '--muted', anc: 'start' });
    tag(192, 'PC'); tag(214, 'registradores'); tag(238, 'pilha de execução');
    const pc = txt(g, x + 150, 192, '', { tam: 11.5, anc: 'end' });
    const regs = txt(g, x + 150, 214, '', { tam: 11.5, anc: 'end' });
    const pilha = [0, 1, 2].map((j) => caixa(g, x + 20, 280 - j * 18, 120, 16, CORES[i], 3));
    const pilhaT = [0, 1, 2].map((j) => txt(g, x + 80, 288 - j * 18, '', { tam: 10 }));
    const estT = txt(g, x + 80, 304, '', { tam: 10.5, peso: 600 });
    const fio = linha(svg, '', seta, { cor: CORES[i] === 'bl' ? '--blue' : CORES[i] === 'am' ? '--amber' : '--green', larg: 1.8 });
    return { g, x, pc, regs, pilha, pilhaT, estT, fio };
  });
  const FUN = [['main', 'teclado', 'ler_tecla'], ['ortografia', 'checar'], ['salvar', 'escrever']];
  const PCS = ['0x1040', '0x1188', '0x12A0'];
  const REGS = ['R1 = 97', 'R1 = 3', 'R1 = 512'];
  const EST = [['executando', '--amber'], ['pronto', '--muted'], ['espera (disco)', '--red']];
  const notes = [
    'Um processo <b>monothread</b>: um só fluxo de execução, com um PC, um conjunto de registradores e uma pilha de execução. O editor só faz uma coisa por vez.',
    'O programa cria uma segunda thread, <b>T2</b>, para conferir a ortografia. Ela ganha PC, registradores e pilha de execução só dela, e nenhum espaço de endereçamento novo.',
    'E uma terceira, <b>T3</b>, que salva o arquivo de tempos em tempos.',
    'As três executam o <b>mesmo código</b>, cada uma num ponto diferente: o PC de cada thread aponta para uma função.',
    '<b>Dados globais e heap</b> são um só para todas. Se T1 muda <code>texto</code>, T2 enxerga na hora, sem pedir nada ao SO. É a comunicação barata, e também o risco que a aula 05 resolve.',
    '<b>Arquivos abertos</b> também são do processo: T3 grava no mesmo <code>relatorio.txt</code> que foi aberto uma vez só.',
    'Cada <b>pilha de execução</b> guarda as chamadas de função daquela thread. Os três fluxos chamam funções diferentes ao mesmo tempo, então cada um precisa da sua.',
    'Cada thread tem <b>estado</b> próprio. T3 está em espera pelo disco, e o processo continua andando: T1 executa e T2 está pronta.',
    'Para o SO, criar T2 e T3 foi criar dois TCBs e duas pilhas de execução. Com dois subprocessos seriam dois PCBs e dois espaços de endereçamento inteiros, e a conversa entre eles passaria pelo SO.',
  ];
  const caps = [
    '1 thread · 1 PC · 1 pilha de execução',
    'T2: PC, registradores e pilha de execução novos · mesmo espaço de endereçamento',
    'T3 criada · nada novo na região compartilhada',
    'compartilhado: código',
    'compartilhado: dados globais e heap',
    'compartilhado: arquivos abertos',
    'de cada thread: pilha de execução (e SP)',
    'de cada thread: estado · T1 executando, T2 pronta, T3 em espera',
    'thread nova = TCB + pilha de execução · processo novo = PCB + espaço de endereçamento',
  ];
  new StepFig(root, { notes, speed: 2400, render(k) {
    const nT = k === 0 ? 1 : k === 1 ? 2 : 3;
    const hl = { 3: ['codigo'], 4: ['dados', 'heap'], 5: ['arqs'] }[k] || [];
    Object.entries(sh).forEach(([id, o]) => pinta(o.r, hl.includes(id) ? 'ac' : 'k', hl.includes(id)));
    cols.forEach((c, i) => {
      mostra(c.g, i < nT);
      c.pc.textContent = PCS[i]; c.regs.textContent = REGS[i];
      FUN[i].forEach((f, j) => { c.pilhaT[j].textContent = f; });
      c.pilha.forEach((r, j) => { mostra(r, j < FUN[i].length); r.style.strokeWidth = k === 6 ? '2.6' : '1.4'; });
      c.pilhaT.forEach((t, j) => mostra(t, j < FUN[i].length));
      const mostrarEst = k >= 7;
      c.estT.textContent = mostrarEst ? EST[i][0] : '';
      c.estT.style.fill = `var(${EST[i][1]})`;
      /* fio do PC até a linha do código */
      const yl = 70 + i * 22, alvoX = 18 + 142 - 8;
      c.fio.setAttribute('d', `M${c.x + 80} 156 C ${c.x + 80} 140, ${alvoX + 40} ${yl}, ${alvoX} ${yl}`);
      mostra(c.fio, i < nT && k === 3);
    });
    sh.codigo.ls.forEach((l, i) => { l.style.fontWeight = k === 3 && i < nT ? '600' : '400'; });
    cap.textContent = caps[k];
  } });
})();

/* ============ Figura 6: ULT × KLT com chamada bloqueante ============ */
(function () {
  const root = document.getElementById('fig-modelos');
  if (!root) return;
  const svg = document.getElementById('mo-svg'), cap = document.getElementById('mo-cap'), tabs = root.querySelector('.fig-tabs');
  const TX = { T1: 140, T2: 260, T3: 380, T4: 500 };
  const CORE = [{ x: 140, w: 150 }, { x: 350, w: 150 }];
  /* tom por estado: ex executando, pr pronto, bl bloqueado */
  const TOM = { ex: 'am', pr: 'k', bl: 'rd' };
  const MOD = {
    n1: {
      label: 'N:1 (ULT)', lib: true, K: { K: 320 },
      map: { T1: 'K', T2: 'K', T3: 'K', T4: 'K' },
      passos: [
        { th: {}, k: {}, cores: [null, null], cap: 'kernel vê 1 entidade (K) · 4 threads só na biblioteca',
          n: 'Modelo <b>N:1</b>: quatro threads de usuário criadas pela biblioteca. O kernel enxerga uma única entidade, K, e nem sabe que existem quatro threads.' },
        { th: { T1: 'ex' }, k: { K: 'ex' }, cores: ['T1', null], cap: 'core 1 ocioso: sem paralelismo',
          n: 'O kernel põe K para rodar no core 0, e a biblioteca escolhe T1. O core 1 fica <b>ocioso</b>: o kernel não tem outra entidade desse processo para pôr lá.' },
        { th: { T2: 'ex' }, k: { K: 'ex' }, cores: ['T2', null], cap: 'troca T1 → T2 feita pela biblioteca, sem syscall',
          n: 'A biblioteca troca T1 por T2 sem syscall: é só uma chamada de função, coisa de nanossegundos.' },
        { th: { T1: 'bl', T2: 'bl', T3: 'bl', T4: 'bl' }, k: { K: 'bl' }, cores: [null, null], cap: 'read() bloqueante em T2 → K em espera → processo inteiro parado',
          n: 'T2 chama <code>read()</code> no disco, uma <b>chamada bloqueante</b>. O kernel põe K em espera, e com ele o processo inteiro: T1, T3 e T4 estavam prontas e param também.' },
        { th: { T3: 'ex' }, k: { K: 'ex' }, cores: ['T3', null], cap: 'só depois da E/S a biblioteca volta a escolher threads',
          n: 'O disco termina, K volta a pronto e depois a executar. Só então a biblioteca pode escolher outra thread. Durante toda a leitura, o processo não avançou nada.' },
      ],
    },
    um: {
      label: '1:1 (KLT)', lib: false, K: { K1: 140, K2: 260, K3: 380, K4: 500 },
      map: { T1: 'K1', T2: 'K2', T3: 'K3', T4: 'K4' },
      passos: [
        { th: {}, k: {}, cores: [null, null], cap: 'cada thread é uma thread do kernel',
          n: 'Modelo <b>1:1</b>: cada thread que o programa cria é uma thread do kernel. O kernel vê e escalona as quatro.' },
        { th: { T1: 'ex', T2: 'ex' }, k: { K1: 'ex', K2: 'ex' }, cores: ['T1', 'T2'], cap: 'dois cores ocupados: paralelismo real',
          n: 'Com dois cores, o kernel põe T1 e T2 para rodar ao mesmo tempo: <b>paralelismo</b> real.' },
        { th: { T1: 'ex', T2: 'bl', T3: 'ex' }, k: { K1: 'ex', K2: 'bl', K3: 'ex' }, cores: ['T1', 'T3'], cap: 'read() bloqueante em T2 → só K2 em espera',
          n: 'T2 chama <code>read()</code> bloqueante. Só K2 vai para espera. O kernel coloca T3 no core 1, e o processo segue.' },
        { th: { T4: 'ex', T3: 'ex' }, k: { K4: 'ex', K3: 'ex' }, cores: ['T4', 'T3'], cap: 'cada troca entre threads passa pelo kernel (µs)',
          n: 'O preço: criar T1 a T4, e cada troca entre elas, passou pelo kernel. Cada operação custa microssegundos, contra nanossegundos numa biblioteca N:1.' },
      ],
    },
    mn: {
      label: 'M:N (híbrido)', lib: true, K: { K1: 200, K2: 440, K3: 320 },
      map: { T1: 'K1', T2: 'K1', T3: 'K2', T4: 'K2' },
      passos: [
        { th: {}, k: {}, cores: [null, null], esconde: ['K3'], cap: '4 threads de usuário sobre 2 threads do kernel',
          n: 'Modelo <b>M:N</b> (híbrido): quatro threads de usuário sobre duas threads do kernel. A biblioteca escolhe qual ULT roda em cada KLT; o kernel escolhe qual KLT roda em cada core.' },
        { th: { T1: 'ex', T3: 'ex' }, k: { K1: 'ex', K2: 'ex' }, cores: ['T1', 'T3'], esconde: ['K3'], cap: 'K1 e K2 nos dois cores: há paralelismo',
          n: 'Há paralelismo: K1 roda T1 no core 0 e K2 roda T3 no core 1.' },
        { th: { T1: 'bl', T3: 'ex' }, k: { K1: 'bl', K2: 'ex' }, cores: [null, 'T3'], esconde: ['K3'], cap: 'T1 bloqueia → K1 em espera; T2 ficaria sem KLT',
          n: 'T1 faz uma chamada bloqueante, e K1 vai para espera junto com ela. Sem ajuda, T2, que roda sobre K1, ficaria parada.' },
        { th: { T1: 'bl', T2: 'ex', T3: 'ex' }, k: { K1: 'bl', K2: 'ex', K3: 'ex' }, cores: ['T2', 'T3'], map: { T2: 'K3' }, cap: 'scheduler activations: kernel avisa, biblioteca usa K3',
          n: 'Com <b>scheduler activations</b>, o kernel avisa a biblioteca (upcall) e entrega uma nova KLT, K3. A biblioteca põe T2 nela, e os dois cores continuam ocupados.' },
        { th: { T2: 'ex', T3: 'ex' }, k: { K3: 'ex', K2: 'ex', K1: 'pr' }, cores: ['T2', 'T3'], map: { T2: 'K3' }, cap: 'flexível, mas com dois schedulers para coordenar',
          n: 'O custo é a complexidade: dois schedulers que precisam se entender. Linux e Windows ficaram com 1:1; o Go faz M:N no seu runtime, sobre threads 1:1 do SO.' },
      ],
    },
  };
  let fig = null;
  function montar(key) {
    const M = MOD[key];
    tabs.querySelectorAll('.btn').forEach((b) => b.classList.toggle('sel', b.dataset.k === key));
    svg.innerHTML = '';
    txt(svg, 8, 12, 'espaço do usuário (um processo)', { tam: 11, cor: '--muted', anc: 'start' });
    S('line', { x1: 4, y1: 152, x2: 636, y2: 152, style: 'stroke:var(--line2);stroke-width:1.2', 'stroke-dasharray': '6 4' }, svg);
    txt(svg, 8, 164, 'kernel', { tam: 11, cor: '--muted', anc: 'start' });
    txt(svg, 8, 250, 'hardware', { tam: 11, cor: '--muted', anc: 'start' });
    const gL = S('g', null, svg);
    if (M.lib) { caixa(svg, 100, 90, 440, 34, 'cz', 6); txt(svg, 320, 107, 'biblioteca de threads', { tam: 11.5, cor: '--muted' }); }
    const ths = {};
    Object.entries(TX).forEach(([t, x]) => { const c = S('circle', { cx: x, cy: 48, r: 20, style: `fill:var(--surface);stroke:var(--line2);stroke-width:1.4;${TRANS}` }, svg); txt(svg, x, 48, t, { tam: 12 }); ths[t] = c; });
    const ks = {};
    Object.entries(M.K).forEach(([k, x]) => { const g = S('g', null, svg); const r = caixa(g, x - 26, 178, 52, 34, 'k', 5); txt(g, x, 195, k, { tam: 12 }); ks[k] = { g, r, x }; });
    const cores = CORE.map((c, i) => { const r = caixa(svg, c.x, 262, c.w, 48, 'k', 6); txt(svg, c.x + c.w / 2, 276, `core ${i}`, { tam: 10.5, cor: '--muted' }); const t = txt(svg, c.x + c.w / 2, 294, '', { tam: 12, peso: 600 }); return { r, t, cx: c.x + c.w / 2 }; });
    const render = (k) => {
      const p = M.passos[k];
      const map = { ...M.map, ...(p.map || {}) };
      gL.innerHTML = '';
      Object.entries(map).forEach(([t, kk]) => {
        const ativo = p.th[t] === 'ex';
        linha(gL, `M${TX[t]} 68 L${ks[kk].x} 178`, null, { cor: ativo ? '--amber' : '--line2', larg: ativo ? 2.4 : 1.3 });
      });
      p.cores.forEach((t, i) => {
        if (!t) return;
        const kk = map[t];
        linha(gL, `M${ks[kk].x} 212 L${cores[i].cx} 262`, null, { cor: '--amber', larg: 2.4 });
      });
      Object.entries(ths).forEach(([t, c]) => { const [f, s] = COR[TOM[p.th[t] || 'pr']]; c.style.fill = `var(${f})`; c.style.stroke = `var(${s})`; c.style.strokeWidth = p.th[t] ? '2.4' : '1.4'; });
      Object.entries(ks).forEach(([kk, o]) => { pinta(o.r, TOM[p.k[kk] || 'pr'], !!p.k[kk]); mostra(o.g, !(p.esconde || []).includes(kk)); });
      cores.forEach((c, i) => { const t = p.cores[i]; c.t.textContent = t ? `${t} via ${map[t]}` : 'ocioso'; c.t.style.fill = t ? 'var(--fg)' : 'var(--muted)'; pinta(c.r, t ? 'am' : 'k', !!t); });
      cap.textContent = p.cap;
    };
    const notes = M.passos.map((p) => p.n);
    if (!fig) fig = new StepFig(root, { notes, render, speed: 2600 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  Object.entries(MOD).forEach(([k, M]) => {
    const b = H('button', { class: 'btn sm' }, esc(M.label)); b.dataset.k = k;
    b.addEventListener('click', () => { montar(k); fig.play(); });
    tabs.appendChild(b);
  });
  montar('n1');
})();

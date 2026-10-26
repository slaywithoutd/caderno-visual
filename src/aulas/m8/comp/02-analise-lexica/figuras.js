import { S, H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';
import { drawMachine } from '../../../../lib/machine.js';

/* ============ analisador léxico da Alguma (o mesmo da implementação manual do vídeo) ============
   Cascata de padrões, cada um tentando a partir de "ini". Devolve os tokens e, para cada um, as
   tentativas feitas (padrão, até onde leu, se casou). Usado pelas figuras 2 e 5 e pelo widget. */
const KW = ['DECLARACOES', 'ALGORITMO', 'INT', 'REAL', 'ATRIBUIR', 'A', 'LER', 'IMPRIMIR', 'SE', 'ENTAO', 'ENQUANTO', 'INICIO', 'FIM', 'E', 'OU'];
const sigla = (w) => w.length <= 3 ? w : w.slice(0, 3);
const isLetra = (c) => !!c && /[A-Za-zÀ-ÿ]/.test(c);
const isMin = (c) => !!c && /[a-zà-ÿ]/.test(c);
const isDig = (c) => !!c && /[0-9]/.test(c);
const isWs = (c) => c === ' ' || c === '\t' || c === '\r' || c === '\n';

/* cada padrão: (s, i) → { tok, fim (depois do retrocesso), leu (até onde o ponteiro foi) } ou { leu } se falhou */
const PADROES = [
  { nome: 'espaços e comentários', f(s, i) {
    let j = i;
    for (;;) {
      if (isWs(s[j])) { j++; continue; }
      if (s[j] === '%') { while (j < s.length && s[j] !== '\n') j++; if (j < s.length) j++; continue; }
      break;
    }
    return { skip: true, fim: j, leu: j }; } },
  { nome: 'fim', f(s, i) { return i >= s.length ? { tok: { t: 'Fim', c: 'eof', txt: '<EOF>' }, fim: i, leu: i } : { leu: i + 1 }; } },
  { nome: 'palavra-chave', f(s, i) {
    let j = i; while (isLetra(s[j])) j++;
    const w = s.slice(i, j), leu = Math.min(j + 1, s.length);
    return j > i && KW.includes(w) ? { tok: { t: 'PC', c: 'kw', txt: `<${sigla(w)}>` }, fim: j, leu } : { leu, why: j > i ? `"${w}" não está na lista de palavras-chave` : 'não começa com letra' }; } },
  { nome: 'variável', f(s, i) {
    if (!isMin(s[i])) return { leu: i + 1, why: 'não começa com letra minúscula' };
    let j = i + 1; while (isLetra(s[j]) || isDig(s[j])) j++;
    return { tok: { t: 'Var', c: 'id', txt: `<Var,${s.slice(i, j)}>` }, fim: j, leu: Math.min(j + 1, s.length) }; } },
  { nome: 'números', f(s, i) {
    let j = i; if (s[j] === '+' || s[j] === '-') j++;
    if (!isDig(s[j])) return { leu: j + 1, why: 'precisa de um dígito' };
    while (isDig(s[j])) j++;
    if (s[j] === '.') {
      if (!isDig(s[j + 1])) return { leu: j + 2, why: 'depois do ponto precisa de dígito' };
      j += 1; while (isDig(s[j])) j++;
      return { tok: { t: 'NumReal', c: 'nm', txt: `<NumReal,${s.slice(i, j)}>` }, fim: j, leu: Math.min(j + 1, s.length) };
    }
    return { tok: { t: 'NumInt', c: 'nm', txt: `<NumInt,${s.slice(i, j)}>` }, fim: j, leu: Math.min(j + 1, s.length) }; } },
  { nome: 'op. aritmético', f(s, i) { return '*/+-'.includes(s[i] || '#') ? { tok: { t: 'OpArit', c: 'op', txt: `<OpArit,${s[i]}>` }, fim: i + 1, leu: i + 1 } : { leu: i + 1 }; } },
  { nome: 'op. relacional', f(s, i) {
    const c = s[i], d = s[i + 1];
    if (c === '=') return { tok: { t: 'OpRel', c: 'op', txt: '<OpRel,=>' }, fim: i + 1, leu: i + 1 };
    if (c === '<') { if (d === '>' || d === '=') return { tok: { t: 'OpRel', c: 'op', txt: `<OpRel,<${d}>` }, fim: i + 2, leu: i + 2 };
      return { tok: { t: 'OpRel', c: 'op', txt: '<OpRel,<>' }, fim: i + 1, leu: Math.min(i + 2, s.length), ret: true }; }
    if (c === '>') { if (d === '=') return { tok: { t: 'OpRel', c: 'op', txt: '<OpRel,>=>' }, fim: i + 2, leu: i + 2 };
      return { tok: { t: 'OpRel', c: 'op', txt: '<OpRel,>>' }, fim: i + 1, leu: Math.min(i + 2, s.length), ret: true }; }
    return { leu: i + 1 }; } },
  { nome: 'delimitador', f(s, i) { return s[i] === ':' ? { tok: { t: 'Delim', c: 'op', txt: '<Delim>' }, fim: i + 1, leu: i + 1 } : { leu: i + 1 }; } },
  { nome: 'parênteses', f(s, i) { return s[i] === '(' || s[i] === ')' ? { tok: { t: 'Par', c: 'op', txt: `<${s[i]}>` }, fim: i + 1, leu: i + 1 } : { leu: i + 1 }; } },
  { nome: 'cadeia', f(s, i) {
    if (s[i] !== "'") return { leu: i + 1 };
    let j = i + 1;
    while (j < s.length && s[j] !== "'" && s[j] !== '\n') { if (s[j] === '\\') j++; j++; }
    if (s[j] !== "'") return { leu: Math.min(j + 1, s.length), why: 'a cadeia não fecha na mesma linha' };
    return { tok: { t: 'Cadeia', c: 'nm', txt: `<Cadeia,${s.slice(i, j + 1)}>` }, fim: j + 1, leu: j + 1 }; } },
];

function analisar(s) {
  const toks = []; let i = 0;
  for (let guard = 0; guard < 5000; guard++) {
    const tent = [];
    const ws = PADROES[0].f(s, i);
    if (ws.fim > i) toks.push({ skip: true, ini: i, fim: ws.fim, lex: s.slice(i, ws.fim) });
    i = ws.fim;
    let achou = null;
    for (const p of PADROES.slice(1)) {
      const r = p.f(s, i);
      tent.push({ nome: p.nome, leu: r.leu, ok: !!r.tok, why: r.why, ret: r.ret, fim: r.fim });
      if (r.tok) { achou = { ...r.tok, ini: i, fim: r.fim, lex: s.slice(i, r.fim), tent }; break; }
    }
    if (!achou) achou = { t: 'Erro', c: 'err', txt: `ERRO ${s[i]}`, ini: i, fim: i + 1, lex: s[i], tent, erro: true };
    toks.push(achou);
    if (achou.t === 'Fim') break;
    i = achou.fim;
  }
  return toks;
}

const linhaDe = (s, i) => s.slice(0, i).split('\n').length - 1;
/* código-fonte com cada lexema num <span>; skip vira texto apagado */
function fonteHTML(s, toks) {
  let out = '', i = 0;
  toks.forEach((t, k) => {
    if (t.t === 'Fim') return;
    if (t.ini > i) out += esc(s.slice(i, t.ini));
    /* trechos ignorados podem atravessar linhas: um <span> por linha para o HTML poder ser cortado em \n */
    out += t.skip ? t.lex.split('\n').map((p) => p ? `<span class="lx skip">${esc(p)}</span>` : '').join('\n') : `<span class="lx ${t.c}" data-k="${k}">${esc(t.lex)}</span>`;
    i = t.fim;
  });
  return out + esc(s.slice(i));
}

const FATORIAL = `:DECLARACOES
argumento:INT
fatorial:INT
:ALGORITMO
% Calcula o fatorial de um número inteiro
LER argumento
ATRIBUIR argumento A fatorial
SE argumento = 0 ENTAO ATRIBUIR 1 A fatorial
ENQUANTO argumento > 1
  INICIO
    ATRIBUIR fatorial * (argumento - 1) A fatorial
    ATRIBUIR argumento - 1 A argumento
  FIM
IMPRIMIR fatorial`;

document.getElementById('alg-prog').textContent = FATORIAL;

/* ============ Fig 1: uma linha atravessando o compilador ============ */
(function () {
  const fases = ['fonte', 'léxica', 'sintática', 'semântica', 'cód. intermediário', 'otimização', 'geração de código'];
  const fEl = document.getElementById('pipe-fases'), lbl = document.getElementById('pipe-lbl'), out = document.getElementById('pipe-out'), tab = document.getElementById('pipe-tab');
  const chips = fases.map((f) => { const b = H('span', { class: 'tk' }, f); fEl.appendChild(b); return b; });
  const code = (t) => `<pre class="code">${t}</pre>`;
  const tok = (t, c) => `<span class="tk ${c}">${esc(t)}</span>`;
  /* árvore: nós [rótulo, x, y, pai, destaque] */
  function arvore(nos) {
    const w = Math.max(...nos.map((n) => n[1])) + 70, h = Math.max(...nos.map((n) => n[2])) + 30;
    let svg = `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">`;
    nos.forEach((n) => { if (n[3] != null) { const p = nos[n[3]]; svg += `<line class="tedge" x1="${p[1]}" y1="${p[2] + 15}" x2="${n[1]}" y2="${n[2] - 15}"/>`; } });
    nos.forEach((n) => { svg += `<g class="tnode${n[4] ? ' exp' : (/^id|^\d|^60/.test(n[0]) ? ' term' : '')}"><circle cx="${n[1]}" cy="${n[2]}" r="${n[0].length > 3 ? 28 : 17}"/><text x="${n[1]}" y="${n[2]}" style="font-size:${n[0].length > 3 ? 11 : 15}px">${esc(n[0])}</text></g>`; });
    return svg + '</svg>';
  }
  const base = [['=', 160, 22], ['id,1', 70, 80, 0], ['+', 250, 80, 0], ['id,2', 170, 138, 2], ['*', 330, 138, 2], ['id,3', 250, 196, 4]];
  const T1 = arvore([...base, ['60', 410, 196, 4]]);
  const T2 = arvore([...base, ['inttofloat', 410, 196, 4, true], ['60', 410, 260, 6]]);
  const passos = [
    { l: 'fluxo de caracteres', o: code('posicao = inicial + taxa * 60'), t: false,
      n: 'O compilador recebe só uma sequência de caracteres: <code>p</code>, <code>o</code>, <code>s</code>, …, espaços inclusive. Ainda não sabe que existem "palavras".' },
    { l: 'fluxo de tokens', o: `<div class="tks">${[['<id,1>', 'id'], ['<=>', 'op'], ['<id,2>', 'id'], ['<+>', 'op'], ['<id,3>', 'id'], ['<*>', 'op'], ['<num,60>', 'nm']].map(([a, b]) => tok(a, b)).join('')}</div>`, t: true,
      n: '<b>Análise léxica</b>: agrupa os caracteres em lexemas e gera tokens. Os espaços somem. Cada identificador entra na <b>tabela de símbolos</b> e o token guarda só a posição dele (1, 2, 3).' },
    { l: 'árvore sintática', o: T1, t: true,
      n: '<b>Análise sintática</b>: usa o tipo dos tokens para montar a estrutura. A árvore deixa explícito que a multiplicação acontece antes da soma.' },
    { l: 'árvore anotada', o: T2, t: true,
      n: '<b>Análise semântica</b>: a tabela diz que <code>taxa</code> é real e <code>60</code> é inteiro. Insere uma conversão (<b>coerção</b>) <code>inttofloat</code>.' },
    { l: 'código de três endereços', o: code('t1 = inttofloat(60)\nt2 = id3 * t1\nt3 = id2 + t2\nid1 = t3'), t: true,
      n: '<b>Código intermediário</b>: no máximo um operador por instrução, com temporários <code>t1</code>, <code>t2</code>… Ainda não é código de nenhuma máquina.' },
    { l: 'código otimizado', o: code('t1 = id3 * 60.0\nid1 = id2 + t1'), t: true,
      n: '<b>Otimização</b>: a conversão de uma constante pode ser feita agora (60 → 60.0) e o temporário <code>t3</code> era desnecessário. Quatro instruções viram duas.' },
    { l: 'código de máquina', o: code('LDF  R2, id3\nMULF R2, R2, #60.0\nLDF  R1, id2\nADDF R1, R1, R2\nSTF  id1, R1'), t: true,
      n: '<b>Geração de código</b>: agora entram os detalhes da máquina (instruções disponíveis, registradores R1 e R2). A tabela de símbolos foi usada do começo ao fim.' },
  ];
  const tabela = '<span>1</span><span>posicao · real</span><span>2</span><span>inicial · real</span><span>3</span><span>taxa · real</span>';
  new StepFig(document.getElementById('fig-pipe'), { notes: passos.map((p) => p.n), speed: 2600, render(k) {
    chips.forEach((c, i) => { c.classList.toggle('on', i === k); c.classList.toggle('past', i < k); });
    lbl.textContent = passos[k].l; out.innerHTML = passos[k].o;
    tab.innerHTML = passos[k].t ? tabela : '<span>—</span><span class="muted">vazia</span>';
  } });
})();

/* ============ Fig 2: tokens do fatorial, linha por linha ============ */
(function () {
  const s = FATORIAL, toks = analisar(s);
  const src = document.getElementById('mao-src'), out = document.getElementById('mao-tks');
  const linhas = s.split('\n');
  /* fonte com cada linha num .ln */
  let html = fonteHTML(s, toks).split('\n').map((l, i) => `<span class="ln" data-l="${i}">${l || ' '}</span>`).join('');
  src.innerHTML = html;
  const lnEls = [...src.querySelectorAll('.ln')];
  const reais = toks.map((t, k) => ({ ...t, k })).filter((t) => !t.skip);
  reais.forEach((t) => { t.linha = t.t === 'Fim' ? linhas.length : linhaDe(s, t.ini); });
  const chips = reais.map((t) => H('span', { class: 'tk ' + t.c }, esc(t.txt)));
  const extra = {
    0: '<code>:</code> casa com o delimitador: <code>&lt;Delim&gt;</code>. <code>DECLARACOES</code> está na lista de palavras-chave: <code>&lt;DEC&gt;</code>. Para palavra-chave o tipo basta, não precisa guardar valor.',
    1: '<code>argumento</code> começa com minúscula: variável. Aqui o valor é necessário (depois alguém vai querer saber <b>qual</b> variável): <code>&lt;Var,argumento&gt;</code>. Não há espaço antes do <code>:</code>, e mesmo assim os tokens saem certos.',
    2: 'Mesma estrutura: <code>&lt;Var,fatorial&gt;</code>, <code>&lt;Delim&gt;</code>, <code>&lt;INT&gt;</code>.',
    3: 'Delimitador e a palavra-chave <code>ALGORITMO</code>.',
    4: 'Comentário: do <code>%</code> até o fim da linha. Nenhum token sai daqui.',
    5: '<code>argumento</code> de novo. O léxico <b>não sabe</b> que é a mesma variável da linha 2: só reconheceu o mesmo padrão outra vez.',
    6: '<code>A</code> sozinho também é palavra-chave (o "para" de "atribuir … a …").',
    7: '<code>=</code> é o operador de igualdade da Alguma; <code>0</code> e <code>1</code> são <code>&lt;NumInt&gt;</code>.',
    8: 'Para decidir que <code>&gt;</code> não é <code>&gt;=</code>, o analisador lê o espaço seguinte e o devolve (retrocesso).',
    9: 'Os espaços de indentação não geram nada.',
    10: 'Parênteses e operadores aritméticos: um token cada.',
    11: '<code>- 1</code> com espaço: o padrão de número tenta, vê o espaço depois do <code>-</code> e desiste. Sai <code>&lt;OpArit,-&gt;</code> e depois <code>&lt;NumInt,1&gt;</code>.',
    12: 'Fim do bloco.',
    13: 'Última linha. Depois dela o arquivo acaba e sai o token especial <code>&lt;EOF&gt;</code>.',
  };
  const notes = ['Lendo da esquerda para a direita, como uma fita única. A cada linha, os lexemas coloridos e os tokens que eles geram.',
    ...linhas.map((_, i) => extra[i] || '')];
  new StepFig(document.getElementById('fig-mao'), { notes, speed: 2000, render(k) {
    const L = k - 1;
    lnEls.forEach((e, i) => { e.classList.toggle('cur', i === L); e.classList.toggle('lit', i <= L); });
    out.innerHTML = '';
    reais.forEach((t, j) => { if (t.linha <= L || (t.t === 'Fim' && L >= linhas.length - 1)) { const c = chips[j]; c.classList.toggle('fresh', t.linha === L || (t.t === 'Fim' && L === linhas.length - 1)); out.appendChild(c); } });
  } });
})();

/* ============ widget: analisador da Alguma ao vivo ============ */
(function () {
  const inp = document.getElementById('lx-in'), src = document.getElementById('lx-src'), out = document.getElementById('lx-tks'), ans = document.getElementById('lx-ans'), pre = document.getElementById('lx-pre');
  const EX = [
    ['Fatorial', FATORIAL],
    ['Com @', 'LER argu@mento\nIMPRIMIR argumento'],
    ['== e maiúscula', 'SE x == 1 ENTAO\n  ATRIBUIR 2 A Fatorial'],
    ['Sem espaços', 'SE argumento<1000 ENTAO ATRIBUIR argumento-1 A x'],
    ['Cadeias e reais', "IMPRIMIR 'it\\'s ok'\nATRIBUIR 3.14 A pi\nATRIBUIR .5 A x"],
  ];
  let toks = [];
  function run() {
    const s = inp.value; toks = analisar(s);
    src.innerHTML = fonteHTML(s, toks); src.classList.add('lit');
    out.innerHTML = '';
    toks.forEach((t, k) => { if (t.skip) return; const b = H('button', { class: 'tk ' + t.c, type: 'button' }, esc(t.txt)); b.dataset.k = k; out.appendChild(b); });
    const nErr = toks.filter((t) => t.erro).length, n = toks.filter((t) => !t.skip).length;
    ans.innerHTML = nErr ? `${n} tokens, <b class="bad">${nErr} erro${nErr > 1 ? 's' : ''} léxico${nErr > 1 ? 's' : ''}</b>. Clique no token vermelho.` : `${n} tokens, nenhum erro léxico. Clique num token.`;
  }
  out.addEventListener('click', (e) => {
    const b = e.target.closest('.tk'); if (!b) return; const t = toks[+b.dataset.k];
    out.querySelectorAll('.tk').forEach((x) => x.classList.toggle('sel', x === b));
    src.querySelectorAll('.lx').forEach((x) => x.classList.toggle('sel', x.dataset.k === b.dataset.k));
    const tent = t.tent.map((x) => `${x.nome} ${x.ok ? '✓' : '✗'}`).join(' · ');
    ans.innerHTML = t.erro
      ? `<b class="bad">Erro léxico</b> em <code>${esc(t.lex)}</code> (linha ${linhaDe(inp.value, t.ini) + 1}): todos os padrões foram tentados e nenhum aceitou. <br><small>${tent}</small>`
      : `<code>${esc(t.lex || 'fim do arquivo')}</code> → <code>${esc(t.txt)}</code>, linha ${linhaDe(inp.value, t.ini) + 1}. <br><small>tentativas: ${tent}</small>`;
  });
  EX.forEach(([n, v], i) => { const b = H('button', { class: 'btn sm', type: 'button' }, n); b.addEventListener('click', () => { inp.value = v; pre.querySelectorAll('.btn').forEach((x) => x.classList.toggle('sel', x === b)); run(); }); pre.appendChild(b); if (!i) b.classList.add('sel'); });
  inp.value = FATORIAL; inp.addEventListener('input', run); run();
})();

/* ============ Fig 3: diagramas de transição ============ */
(function () {
  const L = (c) => isLetra(c), D = (c) => isDig(c);
  const vis = (c) => c === '⊣' ? 'fim da entrada' : c === ' ' ? 'espaço' : c === '\n' ? '\\n' : c;
  const M = {
    relop: { nome: 'Operadores relacionais', vb: '0 0 600 380', presets: ['<=', '<>', '<1', '>=', '>x', '='],
      states: [{ id: '0', x: 60, y: 190, start: true }, { id: '1', x: 220, y: 80 }, { id: '5', x: 220, y: 190, tok: 'OpRel =' }, { id: '6', x: 220, y: 300 },
        { id: '2', x: 420, y: 25, tok: 'OpRel <>' }, { id: '3', x: 420, y: 90, tok: 'OpRel <=' }, { id: '4', x: 420, y: 155, star: true, tok: 'OpRel <' },
        { id: '7', x: 420, y: 255, tok: 'OpRel >=' }, { id: '8', x: 420, y: 330, star: true, tok: 'OpRel >' }],
      tr: [['0', '1', '<', (c) => c === '<'], ['1', '2', '>', (c) => c === '>'], ['1', '3', '=', (c) => c === '='], ['1', '4', 'outro', () => true],
        ['0', '5', '=', (c) => c === '='], ['0', '6', '>', (c) => c === '>'], ['6', '7', '=', (c) => c === '='], ['6', '8', 'outro', () => true]] },
    num: { nome: 'Números inteiros e reais', vb: '0 0 600 330', presets: ['+12.5)', '42 ', '7.x', '.50', '-3'],
      states: [{ id: '0', x: 50, y: 160, start: true }, { id: '1', x: 110, y: 45 }, { id: '2', x: 260, y: 160 }, { id: '3', x: 390, y: 160 }, { id: '5', x: 510, y: 160 },
        { id: '4', x: 260, y: 285, star: true, tok: 'NumInt' }, { id: '6', x: 510, y: 285, star: true, tok: 'NumReal' }],
      tr: [['0', '1', '+, -', (c) => c === '+' || c === '-'], ['0', '2', 'dígito', D], ['1', '2', 'dígito', D], ['2', '2', 'dígito', D], ['2', '3', '.', (c) => c === '.'],
        ['2', '4', 'outro', () => true], ['3', '5', 'dígito', D], ['5', '5', 'dígito', D], ['5', '6', 'outro', () => true]] },
    id: { nome: 'Variáveis (identificadores)', vb: '0 0 600 200', presets: ['fat2)', 'x1 ', 'argumento:', '9a'],
      states: [{ id: '0', x: 80, y: 130, start: true }, { id: '1', x: 290, y: 130 }, { id: '2', x: 500, y: 130, star: true, tok: 'Var' }],
      tr: [['0', '1', 'letra', L], ['1', '1', 'letra, dígito', (c) => L(c) || D(c)], ['1', '2', 'outro', () => true]] },
    cad: { nome: 'Cadeias', vb: '0 0 600 280', presets: ["'ok'", "'it\\'s'x", "'abc"],
      states: [{ id: '0', x: 60, y: 110, start: true }, { id: '1', x: 250, y: 110, loopDir: 'down' }, { id: '2', x: 420, y: 30 }, { id: '3', x: 500, y: 150, tok: 'Cadeia' }],
      tr: [['0', '1', "'", (c) => c === "'"], ['1', '1', "≠ ' \\ \\n", (c) => c !== "'" && c !== '\\' && c !== '\n' && c !== '⊣'], ['1', '2', '\\', (c) => c === '\\'],
        ['2', '1', '≠ \\n', (c) => c !== '\n' && c !== '⊣'], ['1', '3', "'", (c) => c === "'"]], bends: { '1>2': -24, '2>1': -24 } },
  };
  const root = document.getElementById('fig-afd'), svg = root.querySelector('svg.diag'), tape = root.querySelector('.tape'), cfg = root.querySelector('.cfg'), bar = root.querySelector('.pda-in');
  const sel = H('select', { 'aria-label': 'Diagrama' }); Object.entries(M).forEach(([k, m]) => sel.appendChild(H('option', { value: k }, m.nome))); bar.appendChild(sel);
  const inp = H('input', { type: 'text', 'aria-label': 'Entrada', maxlength: '14', spellcheck: 'false' }); bar.appendChild(inp);
  const pre = H('span', { class: 'fig-tabs' }); bar.appendChild(pre);
  let fig = null, m = null, Dm = null;
  function setM(k) {
    m = M[k];
    const groups = {};
    m.tr.forEach(([a, b, lab], i) => { const g = a + '>' + b; (groups[g] = groups[g] || []).push({ text: lab, k: i }); });
    svg.setAttribute('viewBox', m.vb);
    Dm = drawMachine(svg, { states: m.states.map((s) => ({ ...s, label: s.id + (s.star ? '*' : ''), accept: !!s.tok })), edges: Object.entries(groups).map(([g, labels]) => { const [from, to] = g.split('>'); return { from, to, labels, bend: (m.bends && m.bends[g]) || 0 }; }) });
    m.states.forEach((s) => { if (s.tok) S('text', { x: s.x + 30, y: s.y + 4, class: 'sv-muted' }, svg, s.tok); });
    pre.innerHTML = '';
    m.presets.forEach((p) => { const b = H('button', { class: 'btn sm', type: 'button' }, esc(p)); b.addEventListener('click', () => { inp.value = p; run(true); }); pre.appendChild(b); });
    inp.value = m.presets[0]; run(false);
  }
  function run(auto) {
    const w = inp.value.replace(/\\n/g, '\n'), fita = [...w, '⊣'];
    const st = Object.fromEntries(m.states.map((s) => [s.id, s]));
    const path = [{ q: '0', pos: 0, tr: null }];
    let q = '0', pos = 0, fim = null;
    while (pos < fita.length) {
      const c = fita[pos];
      const ti = m.tr.findIndex(([a, , , f]) => a === q && f(c));
      if (ti < 0) { fim = { tipo: 'rej', c }; break; }
      q = m.tr[ti][1]; pos++;
      path.push({ q, pos, tr: ti, c });
      if (st[q].tok) { fim = { tipo: 'acc', star: st[q].star }; break; }
    }
    if (!fim) fim = { tipo: 'rej', c: '⊣' };
    const lex = fim.tipo === 'acc' ? w.slice(0, fim.star ? pos - 1 : pos) : '';
    const notes = path.map((p, k) => {
      if (!k) return `Começa no estado 0, com a cabeça no primeiro caractere de <code>${esc(w.replace(/\n/g, '\\n') || 'ε')}</code>.`;
      const [a, b, lab] = m.tr[p.tr];
      return `Lê <b>${esc(vis(p.c))}</b>: segue a seta <code>${esc(lab)}</code> de ${a} para ${b}.`;
    });
    const qf = st[q];
    notes.push(fim.tipo === 'acc'
      ? `<b class="ok">Reconheceu ${esc(qf.tok)}</b> com o lexema <code>${esc(lex)}</code>.` + (fim.star ? ` O estado tem <b>*</b>: o último caractere lido (<code>${esc(vis(path[path.length - 1].c))}</code>) não é do token, então o analisador <b>retrocede</b> e ele fica para o próximo.` : ' Sem asterisco: nada a devolver.')
      : `<b class="bad">Nenhuma seta</b> do estado ${q} aceita <code>${esc(vis(fim.c))}</code>. Este padrão não reconhece a entrada: na cascata, o analisador zera e tenta o próximo padrão.`);
    const render = (k) => {
      const done = k >= path.length, p = path[Math.min(k, path.length - 1)];
      Object.values(Dm.states).forEach((g) => g.classList.remove('on', 'acc', 'rej'));
      Object.values(Dm.edges).forEach((g) => { g.classList.remove('on'); g.querySelectorAll('tspan').forEach((t) => t.classList.remove('on')); });
      Dm.states[p.q].classList.add(done ? (fim.tipo === 'acc' ? 'acc' : 'rej') : 'on');
      if (p.tr != null && !done) { const [a, b] = m.tr[p.tr]; const g = Dm.edges[a + '>' + b]; g.classList.add('on'); g.querySelectorAll('tspan').forEach((t) => t.classList.toggle('on', +t.dataset.k === p.tr)); }
      const cab = done && fim.tipo === 'acc' && fim.star ? p.pos - 1 : p.pos;
      tape.innerHTML = '';
      fita.forEach((c, i) => tape.appendChild(H('span', { class: 'cell' + (c === '⊣' ? ' endmark' : '') + (i < cab ? ' done' : '') + (i === cab ? ' head' : '') + (done && fim.tipo === 'acc' && i < lex.length ? ' conf' : '') }, esc(c === ' ' ? '␣' : c === '\n' ? '↵' : c))));
      cfg.innerHTML = done ? (fim.tipo === 'acc' ? `<span class="ok">✓ ${esc(qf.tok)}</span>  lexema "${esc(lex)}"${fim.star ? '  · retrocede 1' : ''}` : '<span class="bad">✗ padrão não reconhecido</span>')
        : `estado ${p.q} · lido "${esc(w.slice(0, p.pos).replace(/\n/g, '\\n'))}"`;
    };
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1300 }); else { fig.stop(); fig.render = render; fig.setSteps(notes); if (auto) fig.play(); }
  }
  inp.addEventListener('change', () => run(true));
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(true); });
  sel.addEventListener('change', () => { setM(sel.value); fig.play(); });
  setM('relop');
})();

/* ============ Fig 4: buffer duplo ============ */
(function () {
  const svg = document.getElementById('buf-svg'), out = document.getElementById('buf-tks');
  const N = 5, X = (i) => (i < N ? 40 + i * 54 : 360 + (i - N) * 54), Y = 74;
  const arq = 'SE a<1 FIM';
  S('text', { x: 20, y: 18, class: 'sv-muted' }, svg, 'arquivo:');
  const arqT = [...arq, '⊣'].map((c, i) => S('text', { x: 98 + i * 16, y: 18, class: 'sv-text', style: 'font-size:15px' }, svg, c === ' ' ? '␣' : c));
  const halves = [0, 1].map((h) => { const g = S('g', { class: 'bufh' }, svg); S('rect', { x: X(h * N) - 8, y: Y - 34, width: 5 * 54 + 6, height: 96, rx: 10 }, g); S('text', { x: X(h * N), y: Y - 20, class: 'sv-muted' }, g, `metade ${h + 1}`); g.badge = S('text', { x: X(h * N) + 5 * 54 - 6, y: Y - 20, class: 'sv-muted', 'text-anchor': 'end' }, g, ''); return g; });
  const cells = [...Array(2 * N)].map((_, i) => { const g = S('g', { class: 'bufc' }, svg); S('rect', { x: X(i), y: Y - 6, width: 46, height: 46, rx: 7 }, g); g.t = S('text', { x: X(i) + 23, y: Y + 17 }, g, ''); S('text', { x: X(i) + 23, y: Y + 52, class: 'sv-muted', 'text-anchor': 'middle' }, svg, i); return g; });
  const ptr = S('g', { class: 'ptr' }, svg); S('path', { d: 'M0 0 l-8 12 h16 z', style: 'fill:var(--amber)' }, ptr); S('text', { x: 0, y: 28, class: 'sv-muted', 'text-anchor': 'middle', style: 'fill:var(--amber)' }, ptr, '* ponteiro');
  const ini = S('g', { class: 'ptr' }, svg); S('path', { d: 'M0 0 l-8 12 h16 z', style: 'fill:var(--blue)' }, ini); S('text', { x: 0, y: 28, class: 'sv-muted', 'text-anchor': 'middle', style: 'fill:var(--blue)' }, ini, '^ início');
  const H1 = 'SE a<', H2 = '1 FIM';
  /* cada passo: conteúdo das metades, ponteiro, início do lexema, quantos caracteres do arquivo já foram carregados, tokens, destaque */
  const P = [
    { h: [H1, '     '], p: 0, i: 0, car: 5, tk: [], fl: 0, n: 'O leitor carrega a <b>metade 1</b> com os 5 primeiros caracteres do arquivo. Ponteiro (<b>*</b>) e início do lexema (<b>^</b>) na posição 0.' },
    { h: [H1, '     '], p: 2, i: 2, car: 5, tk: ['<SE>'], n: 'Lê <code>S</code>, <code>E</code> e o espaço. O espaço não é letra: <b>retrocede</b> para 2 e confirma. Sai <code>&lt;SE&gt;</code>. O início do lexema vai até o ponteiro.' },
    { h: [H1, '     '], p: 3, i: 3, car: 5, tk: ['<SE>'], n: 'O espaço é lido e descartado: confirma sem gerar token.' },
    { h: [H1, '     '], p: 4, i: 4, car: 5, tk: ['<SE>', '<Var,a>'], n: 'Lê <code>a</code> e depois <code>&lt;</code>, que não é letra nem dígito. Retrocede para 4: <code>&lt;Var,a&gt;</code>.' },
    { h: [H1, H2], p: 5, i: 4, car: 10, tk: ['<SE>', '<Var,a>'], fl: 2, lex: [4], n: 'Lê <code>&lt;</code>. Ainda não dá para saber se é <code>&lt;</code>, <code>&lt;=</code> ou <code>&lt;&gt;</code>. O ponteiro entra na posição 5, começo da metade 2: a <b>metade 2 é carregada</b> com <code>1 FIM</code>. O lexema começa numa metade e o ponteiro está na outra.' },
    { h: [H1, H2], p: 5, i: 4, car: 10, tk: ['<SE>', '<Var,a>'], lex: [4], gone: true, n: 'Compare: com um <b>buffer único</b> de 5 posições, chegar ao fim teria recarregado o buffer inteiro e apagado o <code>&lt;</code>. O início do lexema se perderia. No buffer duplo ele continua na metade 1.' },
    { h: [H1, H2], p: 5, i: 5, car: 10, tk: ['<SE>', '<Var,a>', '<OpRel,<>'], n: 'Lê <code>1</code>: não é <code>=</code> nem <code>&gt;</code>. <b>Retrocede</b> (o ponteiro volta para 5, o <code>1</code> continua no buffer) e confirma <code>&lt;OpRel,&lt;&gt;</code>.' },
    { h: [H1, H2], p: 5, i: 5, car: 10, tk: ['<SE>', '<Var,a>', '<OpRel,<>'], bug: true, n: 'O bug do vídeo: se um padrão falha aqui e o ponteiro volta para a metade 1 (zerar), ao entrar de novo na metade 2 a versão ingênua <b>recarregaria a metade 2</b>, pulando 5 caracteres do arquivo. A correção guarda <code>bufferAtual</code>: só recarrega uma metade se a atual for a outra.' },
    { h: [H1, H2], p: 7, i: 7, car: 10, tk: ['<SE>', '<Var,a>', '<OpRel,<>', '<NumInt,1>'], n: 'Lê <code>1</code> e o espaço, retrocede: <code>&lt;NumInt,1&gt;</code>. O espaço seguinte é descartado.' },
    { h: ['⊣    ', H2], p: 0, i: 7, car: 11, tk: ['<SE>', '<Var,a>', '<OpRel,<>', '<NumInt,1>'], fl: 1, lex: [7, 8, 9], n: 'Lê <code>F</code>, <code>I</code>, <code>M</code>. O ponteiro passa do fim (posição 10) e <b>volta para 0</b>: lógica circular. A metade 1 é recarregada; como o arquivo acabou, recebe o marcador de fim (−1, aqui <code>⊣</code>).' },
    { h: ['⊣    ', H2], p: 0, i: 0, car: 11, tk: ['<SE>', '<Var,a>', '<OpRel,<>', '<NumInt,1>', '<FIM>'], n: 'O <code>⊣</code> não é letra: retrocede (de 1 para 0) e confirma <code>&lt;FIM&gt;</code>. O início do lexema estava em 7, na metade 2, e o ponteiro deu a volta.' },
    { h: ['⊣    ', H2], p: 0, i: 0, car: 11, tk: ['<SE>', '<Var,a>', '<OpRel,<>', '<NumInt,1>', '<FIM>', '<EOF>'], n: 'O padrão de fim lê o −1 e gera <code>&lt;EOF&gt;</code>. O arquivo de 10 caracteres passou inteiro por um buffer de 10 posições, com retrocessos, sem perder nada.' },
  ];
  new StepFig(document.getElementById('fig-buf'), { notes: P.map((p) => p.n), speed: 2300, render(k) {
    const st = P[k];
    cells.forEach((g, i) => { const c = st.h[i < N ? 0 : 1][i % N]; g.t.textContent = c === ' ' ? '␣' : c; g.classList.toggle('lex', (st.lex || []).includes(i)); g.classList.toggle('gone', !!st.gone && i === 4); g.classList.toggle('old', i < N ? false : st.h[1] === '     '); });
    halves.forEach((g, h) => { g.classList.toggle('flash', st.fl === h + 1 || (st.bug && h === 1)); g.badge.textContent = st.fl === h + 1 ? 'recarregada' : st.bug && h === 1 ? 'recarregar de novo?' : st.gone && h === 0 ? 'buffer único: apagado' : ''; });
    arqT.forEach((t, i) => t.style.opacity = i < st.car ? 1 : 0.3);
    const px = (i) => X(i) + 23;
    ptr.setAttribute('transform', `translate(${px(st.p)},${Y + 66})`);
    ini.setAttribute('transform', `translate(${px(st.i)},${Y + 66 + (st.i === st.p ? 34 : 0)})`);
    out.innerHTML = st.tk.map((t, j) => `<span class="tk ${t.startsWith('<Var') ? 'id' : t.startsWith('<Num') ? 'nm' : t.startsWith('<Op') ? '' : t === '<EOF>' ? 'eof' : 'kw'}${j === st.tk.length - 1 && (!P[k - 1] || P[k - 1].tk.length < st.tk.length) ? ' fresh' : ''}">${esc(t)}</span>`).join('');
  } });
})();

/* ============ Fig 5: cascata com zerar e confirmar ============ */
(function () {
  const root = document.getElementById('fig-cas'), tape = document.getElementById('cas-tape'), ord = document.getElementById('cas-ord'), cfg = document.getElementById('cas-cfg'), out = document.getElementById('cas-tks'), bar = root.querySelector('.pda-in');
  tape.classList.add('top');
  const nomes = PADROES.slice(1).map((p) => p.nome);
  const chips = nomes.map((n) => { const c = H('span', { class: 'tk' }, n); ord.appendChild(c); return c; });
  const inp = H('input', { type: 'text', 'aria-label': 'Entrada', maxlength: '24', spellcheck: 'false' }); bar.appendChild(inp);
  const pre = H('span', { class: 'fig-tabs' }); bar.appendChild(pre);
  let fig = null;
  function run(auto) {
    const s = inp.value, toks = analisar(s), passos = [];
    let feitos = [];
    toks.forEach((t) => {
      if (t.skip) { passos.push({ ws: t, feitos: feitos.slice() }); return; }
      t.tent.forEach((x, j) => passos.push({ t, j, x, feitos: feitos.slice() }));
      if (t.erro) passos.push({ t, err: true, feitos: feitos.slice() });
      feitos = [...feitos, t];
    });
    const notes = ['Ponteiro <b>*</b> (▲) e início do lexema <b>^</b> no começo. A cada token, <code>proximoToken()</code> tenta os padrões nesta ordem.'];
    passos.forEach((p) => {
      if (p.ws) { notes.push(`Espaços e comentários: lê <code>${esc(p.ws.lex.replace(/\n/g, '\\n'))}</code> e <b>confirma sem gerar token</b>.`); return; }
      if (p.err) { notes.push(`<b class="bad">Todos os padrões falharam</b> em <code>${esc(p.t.lex)}</code>: erro léxico. O analisador avisa e pula o caractere.`); return; }
      const x = p.x, lido = s.slice(p.t.ini, x.leu);
      notes.push(x.ok
        ? `<code>${x.nome}</code> casa com <code>${esc(p.t.lex || 'fim')}</code>${x.leu > x.fim ? ` (leu <code>${esc(lido)}</code> e <b>retrocedeu</b> ${x.leu - x.fim})` : ''}. <b>confirmar()</b>: ^ vai até o ponteiro. Sai <code>${esc(p.t.txt)}</code>.`
        : `<code>${x.nome}</code> leu <code>${esc(lido) || '(nada)'}</code> e falhou${x.why ? ` (${esc(x.why)})` : ''}. <b>zerar()</b>: o ponteiro volta para o ^.`);
    });
    const render = (k) => {
      const p = k === 0 ? null : passos[k - 1];
      const iniP = p ? (p.ws ? p.ws.ini : p.t.ini) : 0;
      let lidoAte = iniP, conf = false, ptrAt = iniP;
      if (p && p.ws) { lidoAte = p.ws.fim; ptrAt = p.ws.fim; conf = true; }
      else if (p && !p.err) { lidoAte = p.x.leu; conf = p.x.ok; ptrAt = p.x.ok ? p.x.fim : iniP; }
      tape.innerHTML = '';
      [...s, '⊣'].forEach((c, i) => {
        let cls = 'cell' + (c === '⊣' ? ' endmark' : '') + (c === ' ' ? ' sp' : '');
        if (i < iniP) cls += ' done';
        if (p && !p.err && i >= iniP && i < lidoAte) cls += conf && (p.ws || i < p.x.fim) ? ' conf' : ' lido';
        if (p && p.err && i === iniP) cls += ' lido';
        if (i === (conf ? ptrAt : iniP) && !(p && p.err)) cls += ' ini';
        if (i === ptrAt) cls += ' head';
        tape.appendChild(H('span', { class: cls }, esc(c === ' ' ? '␣' : c)));
      });
      chips.forEach((c, j) => { c.className = 'tk' + (p && !p.ws ? (p.err ? ' no' : j < p.j ? ' no' : j === p.j ? (p.x.ok ? ' ok' : ' try') : '') : ''); });
      cfg.innerHTML = !p ? 'pronto para a primeira chamada' : p.ws ? 'espaços / comentários → confirmar()' : p.err ? '<span class="bad">erro léxico</span>' : `${p.x.nome}() → ${p.x.ok ? '<span class="ok">token, confirmar()</span>' : '<span class="bad">null, zerar()</span>'}`;
      const lista = p ? (p.x && p.x.ok || p.err ? [...p.feitos, p.t] : p.feitos) : [];
      out.innerHTML = lista.map((t) => `<span class="tk ${t.c}">${esc(t.txt)}</span>`).join('');
    };
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1100 }); else { fig.stop(); fig.render = render; fig.setSteps(notes); if (auto) fig.play(); }
  }
  ['argumento<1000', 'argumento-1', 'ENQUANTO x>=10', 'LER x @'].forEach((p) => { const b = H('button', { class: 'btn sm', type: 'button' }, esc(p)); b.addEventListener('click', () => { inp.value = p; run(true); }); pre.appendChild(b); });
  inp.value = 'argumento<1000';
  inp.addEventListener('change', () => run(true));
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(true); });
  run(false);
})();

/* ============ widget: maior casamento e ordem das regras no ANTLR ============ */
(function () {
  const inp = document.getElementById('an-in'), out = document.getElementById('an-tks'), ans = document.getElementById('an-ans');
  const ordEl = document.getElementById('an-ord'), cadEl = document.getElementById('an-cad'), preEl = document.getElementById('an-pre');
  const CAD = {
    det: ["'\\'' ( ESC_SEQ | ~('\\''|'\\\\') )* '\\''  (determinística)", /'(?:\\'|[^'\\])*'/y],
    dot: ["'\\'' .* '\\''  (ganancioso, com aviso)", /'[\s\S]*'/y],
    lazy: ["'\\'' .*? '\\''  (não ganancioso)", /'[\s\S]*?'/y],
    nl: ["'\\'' ~('\\n')* '\\''  (ganancioso, sem aviso)", /'[^\n]*'/y],
  };
  Object.entries(CAD).forEach(([k, [t]]) => cadEl.appendChild(H('option', { value: k }, esc(t))));
  const regras = (cad) => [
    { n: 'PALAVRA_CHAVE', m: (s, i) => { let best = 0; KW.forEach((w) => { if (s.startsWith(w, i) && w.length > best) best = w.length; }); return best; } },
    { n: 'NUMINT', re: /[+-]?[0-9]+/y }, { n: 'NUMREAL', re: /[+-]?[0-9]+\.[0-9]+/y },
    { n: 'VARIAVEL', re: /[a-zA-Z][a-zA-Z0-9]*/y }, { n: 'CADEIA', re: CAD[cad][1] },
    { n: 'COMENTARIO', re: /%[^\n]*\n/y, skip: true }, { n: 'WS', re: /[ \t\r\n]/y, skip: true },
    { n: 'OP_REL', re: />=|<=|<>|>|<|=/y }, { n: 'OP_ARIT', re: /[*/+-]/y }, { n: 'DELIM', re: /:/y }, { n: 'ABREPAR', re: /\(/y }, { n: 'FECHAPAR', re: /\)/y },
  ];
  const casa = (r, s, i) => { if (r.m) return r.m(s, i); r.re.lastIndex = i; const x = r.re.exec(s); return x ? x[0].length : 0; };
  let ordem = 'pc', toks = [];
  function run() {
    const s = inp.value; let R = regras(cadEl.value);
    if (ordem === 'var') { const v = R.find((r) => r.n === 'VARIAVEL'); R = [v, ...R.filter((r) => r !== v)]; }
    toks = []; let i = 0;
    while (i < s.length && toks.length < 400) {
      const cand = R.map((r, o) => ({ n: r.n, len: casa(r, s, i), o, skip: r.skip })).filter((c) => c.len > 0);
      if (!cand.length) { toks.push({ n: 'erro', txt: s[i], cand, i }); i++; continue; }
      const max = Math.max(...cand.map((c) => c.len)), top = cand.filter((c) => c.len === max), win = top[0];
      if (!win.skip) toks.push({ n: win.n, txt: s.slice(i, i + max), cand, win, empate: top.length > 1, i });
      i += max;
    }
    out.innerHTML = '';
    toks.forEach((t, k) => {
      const c = t.n === 'erro' ? 'err' : t.n === 'PALAVRA_CHAVE' ? 'kw' : t.n === 'VARIAVEL' ? 'id' : /NUM|CADEIA/.test(t.n) ? 'nm' : '';
      const b = H('button', { class: 'tk ' + c, type: 'button' }, esc(t.n === 'erro' ? `erro: ${t.txt === '\n' ? '\\n' : t.txt}` : `<${t.n},${t.txt.replace(/\n/g, '↵')}>`)); b.dataset.k = k; out.appendChild(b);
    });
    ans.innerHTML = 'Clique num token para ver quais regras casaram e por que esta venceu.';
  }
  out.addEventListener('click', (e) => {
    const b = e.target.closest('.tk'); if (!b) return; const t = toks[+b.dataset.k];
    out.querySelectorAll('.tk').forEach((x) => x.classList.toggle('sel', x === b));
    if (t.n === 'erro') { ans.innerHTML = `<b class="bad">token recognition error</b>: nenhuma regra casa com <code>${esc(t.txt)}</code>. O ANTLR avisa e pula o caractere.`; return; }
    const lista = t.cand.filter((c) => !c.skip || c === t.win).map((c) => `<code>${c.n}</code> (${c.len})`).join(', ');
    const outras = t.cand.filter((c) => c !== t.win);
    ans.innerHTML = `Casaram a partir daqui: ${lista}. ` + (!outras.length ? `Só <code>${t.win.n}</code> casou.`
      : t.empate ? `<b>Empate</b> em ${t.win.len} caracteres: vence <code>${t.win.n}</code> porque vem <b>primeiro no arquivo</b>.`
      : `Vence <code>${t.win.n}</code> pelo <b>maior casamento</b> (${t.win.len} caracteres).`);
  });
  [['palavras-chave primeiro', 'pc'], ['VARIAVEL primeiro', 'var']].forEach(([n, v]) => { const b = H('button', { class: 'btn sm' + (v === ordem ? ' sel' : ''), type: 'button' }, n); b.addEventListener('click', () => { ordem = v; ordEl.querySelectorAll('.btn').forEach((x) => x.classList.toggle('sel', x === b)); run(); }); ordEl.appendChild(b); });
  const EX = [['ALGORITMO', 'ALGORITMO'], ['ALGORITMObla', 'ALGORITMObla'], ['ALGORITMO bla', 'ALGORITMO bla'], ['argumento-1', 'ATRIBUIR argumento-1 A x'],
    ['cadeias', "LER 'abcd' argumento 'defg'\nATRIBUIR argumento A fatorial 'hij'"]];
  EX.forEach(([n, v], i) => { const b = H('button', { class: 'btn sm' + (i === 1 ? ' sel' : ''), type: 'button' }, esc(n)); b.addEventListener('click', () => { inp.value = v; preEl.querySelectorAll('.btn').forEach((x) => x.classList.toggle('sel', x === b)); if (n === 'cadeias' && cadEl.value === 'det') { cadEl.value = 'dot'; } run(); }); preEl.appendChild(b); });
  inp.value = 'ALGORITMObla';
  inp.addEventListener('input', run); cadEl.addEventListener('change', run);
  run();
})();

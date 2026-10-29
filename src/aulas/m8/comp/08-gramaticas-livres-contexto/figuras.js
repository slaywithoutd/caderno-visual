import { S, H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* ============ árvores de derivação ============
   Uma gramática é { start, rules: { V: [[símbolos], …] } }; [] é a regra ε.
   seq é a lista de passos: [qual, alt], com qual = 'L' (variável mais à esquerda), 'R' (mais à direita)
   ou um índice entre as variáveis da cadeia. Guarda as cadeias e a árvore, com o passo em que cada nó nasce. */
function derivar(g, seq) {
  let id = 0;
  const isV = (s) => s in g.rules;
  const mk = (sym, born, depth, parent) => ({ id: id++, sym, born, depth, parent, kids: [] });
  const root = mk(g.start, 0, 0, null);
  let form = [root];
  const snaps = [{ form: form.slice(), exp: null, rule: null, fresh: new Set([root.id]) }];
  seq.forEach(([qual, alt], j) => {
    const vars = form.map((n, i) => [n, i]).filter(([n]) => isV(n.sym));
    const [node, idx] = qual === 'L' ? vars[0] : qual === 'R' ? vars[vars.length - 1] : vars[qual];
    const rhs = g.rules[node.sym][alt];
    const kids = rhs.length ? rhs.map((s) => mk(s, j + 1, node.depth + 1, node)) : [mk('ε', j + 1, node.depth + 1, node)];
    node.kids = kids;
    form = [...form.slice(0, idx), ...kids.filter((k) => k.sym !== 'ε'), ...form.slice(idx + 1)];
    snaps.push({ form: form.slice(), exp: node, rule: [node.sym, alt], fresh: new Set(kids.map((k) => k.id)) });
  });
  return { root, snaps, isV };
}

/* posição: folhas em fila, pai no meio dos filhos */
function posicionar(root, larg = () => 1) {
  let x = 0; const todos = [];
  (function lay(n) {
    todos.push(n);
    if (!n.kids.length) { const w = larg(n); n.x = x + w / 2; x += w; }
    else { n.kids.forEach(lay); n.x = (n.kids[0].x + n.kids[n.kids.length - 1].x) / 2; }
  })(root);
  return { todos, largura: x, prof: Math.max(...todos.map((n) => n.depth)) };
}

const ladoDireito = (r) => (r.length ? r.join('') : 'ε');
const cadeia = (f) => (f.length ? f.map((n) => n.sym).join('') : 'ε');

/* desenha a árvore com círculos (mesmo visual da aula 01) e devolve os elementos de cada nó */
function desenharArvore(svg, root) {
  const P = posicionar(root);
  const SX = 52, SY = 58, W = Math.max(P.largura * SX, 240), Hh = P.prof * SY + 48;
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
  svg.style.maxHeight = Math.min(Hh * 1.1, 400) + 'px';
  const off = (W - P.largura * SX) / 2;
  const px = (n) => off + n.x * SX, py = (n) => 24 + n.depth * SY;
  const gE = S('g', null, svg), gN = S('g', null, svg);
  P.todos.forEach((n) => {
    if (n.parent) n.e = S('line', { x1: px(n.parent), y1: py(n.parent) + 17, x2: px(n), y2: py(n) - 17, class: 'tedge anim' }, gE);
    n.g = S('g', { class: 'tnode anim' + (n.kids.length || /^[A-Z]$/.test(n.sym) ? ' isvar' : n.sym === 'ε' ? ' eps' : ' term') }, gN);
    n.c = S('circle', { cx: px(n), cy: py(n), r: 17 }, n.g);
    S('text', { x: px(n), y: py(n) }, n.g, n.sym);
  });
  return P.todos;
}

function regrasHTML(el, g) {
  el.innerHTML = '';
  for (const v in g.rules) {
    const ln = H('div', { class: 'ln' });
    ln.appendChild(H('span', { class: 'v' }, v));
    ln.appendChild(H('span', { class: 'bar' }, '→'));
    g.rules[v].forEach((r, i) => {
      if (i) ln.appendChild(H('span', { class: 'bar' }, '|'));
      const s = H('span', { class: 'alt' }, esc(ladoDireito(r))); s.dataset.r = v + i; ln.appendChild(s);
    });
    el.appendChild(ln);
  }
}

/* figura de derivação com abas: cada aba é uma derivação (gramática + passos) */
function figDerivacoes(rootId, abas) {
  const root = document.getElementById(rootId);
  const rulesEl = root.querySelector('.rules'), sform = root.querySelector('.sform'), chain = root.querySelector('.chain'),
    svg = root.querySelector('svg.tree'), tabs = root.querySelector('.fig-tabs');
  let fig = null;
  function carregar(k) {
    const a = abas[k], D = derivar(a.g, a.seq);
    tabs.querySelectorAll('.btn').forEach((b, j) => b.classList.toggle('sel', j === k));
    regrasHTML(rulesEl, a.g);
    const nos = desenharArvore(svg, D.root);
    const notes = D.snaps.map((s, i) => {
      if (i === 0) return a.intro;
      const [v, alt] = s.rule, antes = cadeia(D.snaps[i - 1].form), agora = cadeia(s.form);
      const vars = D.snaps[i - 1].form.filter((n) => D.isV(n.sym)).length;
      const onde = vars < 2 ? '' : a.seq[i - 1][0] === 'L' ? ' na variável mais à esquerda' : a.seq[i - 1][0] === 'R' ? ' na variável mais à direita' : ' numa variável do meio';
      let t = `Aplica <code>${v} → ${esc(ladoDireito(a.g.rules[v][alt]))}</code>${onde}: <code>${esc(antes)} ⇒ ${esc(agora)}</code>.`;
      if (a.extra && a.extra[i]) t += ' ' + a.extra[i];
      if (i === D.snaps.length - 1) t += ' ' + (a.final || '');
      return t;
    });
    const render = (i) => {
      const s = D.snaps[i];
      rulesEl.querySelectorAll('.alt').forEach((e) => e.classList.toggle('on', !!s.rule && e.dataset.r === s.rule[0] + s.rule[1]));
      sform.innerHTML = '';
      if (!s.form.length) sform.appendChild(H('span', { class: 'tok eps' }, 'ε'));
      s.form.forEach((n) => sform.appendChild(H('span', { class: 'tok' + (D.isV(n.sym) ? ' var' : '') + (s.fresh.has(n.id) && i > 0 ? ' fresh' : '') }, esc(n.sym))));
      chain.innerHTML = D.snaps.slice(0, i + 1).map((x, j) => (j === i ? `<b>${esc(cadeia(x.form))}</b>` : esc(cadeia(x.form)))).join(' ⇒ ');
      nos.forEach((n) => { const vis = n.born <= i; n.g.classList.toggle('hide', !vis); if (n.e) n.e.classList.toggle('hide', !vis); n.g.classList.toggle('exp', s.exp === n); });
    };
    if (!fig) fig = new StepFig(root, { notes, render, speed: 1800 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  abas.forEach((a, k) => { const b = H('button', { class: 'btn sm' }, a.label); b.addEventListener('click', () => { carregar(k); fig.play(); }); tabs.appendChild(b); });
  carregar(0);
}

/* ============ Fig 1: percurso em ordem ============ */
(function () {
  const g = { start: 'P', rules: { P: [[], ['0'], ['1'], ['0', 'P', '0'], ['1', 'P', '1']] } };
  const D = derivar(g, [['L', 4], ['L', 3], ['L', 3], ['L', 2]]);
  regrasHTML(document.getElementById('fr-regras'), g);
  const nos = desenharArvore(document.getElementById('fr-svg'), D.root);
  const lida = document.getElementById('fr-lida');
  /* ordem de visita (pré-ordem) e, para cada visita, as folhas já lidas */
  const visitas = [];
  (function ir(n) { visitas.push(n); n.kids.forEach(ir); })(D.root);
  const notes = ['A árvore pronta de <code>1001001</code>. Para ler a palavra, comece na raiz e vá visitando os filhos da esquerda para a direita.'];
  visitas.forEach((n) => {
    if (n.kids.length) notes.push(`Visita <code>${n.sym}</code>: ${n.kids.length > 1 ? `desce nos ${n.kids.length} filhos, um de cada vez, começando pelo primeiro` : 'desce no único filho'}.`);
    else {
      const lado = n.parent && n.parent.kids.indexOf(n) === n.parent.kids.length - 1 && n.parent.kids.length > 1 ? ' Último filho deste nó: o percurso sobe.' : '';
      notes.push(`Folha <code>${n.sym}</code>: entra na palavra.${lado}`);
    }
  });
  notes.push('Fim do percurso. A palavra é <code>1001001</code>, igual de trás para a frente: um palíndromo, como a gramática promete.');
  new StepFig(document.getElementById('fig-fronteira'), { notes, speed: 1300, render(k) {
    const ate = k === 0 ? -1 : Math.min(k - 1, visitas.length - 1);
    const lidas = visitas.slice(0, ate + 1).filter((n) => !n.kids.length);
    nos.forEach((n) => {
      n.g.classList.toggle('exp', k > 0 && k <= visitas.length && visitas[k - 1] === n);
      n.c.style.fill = lidas.includes(n) ? 'var(--green-soft)' : '';
    });
    lida.innerHTML = '';
    if (!lidas.length) lida.appendChild(H('span', { class: 'tok eps' }, '…'));
    lidas.forEach((n, j) => lida.appendChild(H('span', { class: 'tok' + (j === lidas.length - 1 && k <= visitas.length ? ' fresh' : '') }, esc(n.sym))));
  } });
})();

/* ============ Fig 2: ordens de derivação de ()() ============ */
(function () {
  const g = { start: 'S', rules: { S: [['S', 'S'], ['(', 'S', ')'], []] } };
  figDerivacoes('fig-ordem', [
    { label: 'pela esquerda', g, seq: [['L', 0], ['L', 1], ['L', 2], ['L', 1], ['L', 2]],
      intro: '<code>S → SS | (S) | ε</code>, derivando <code>()()</code> sempre pela variável mais à esquerda.',
      final: 'Guarde o formato da árvore e troque para a aba "pela direita".' },
    { label: 'pela direita', g, seq: [['R', 0], ['R', 1], ['R', 2], ['R', 1], ['R', 2]],
      intro: 'A mesma palavra, agora trocando sempre a variável mais à direita.',
      final: 'As cadeias do meio foram outras (S(S), S()…), mas a árvore é <i>a mesma</i> da aba anterior.' },
    { label: 'outra árvore', g, seq: [['L', 0], ['L', 0], ['L', 1], ['L', 2], ['L', 1], ['L', 2], ['L', 2]],
      intro: 'Ainda <code>()()</code>, mas usando S → SS duas vezes.',
      extra: { 7: 'O terceiro S vira ε.' },
      final: 'Mesma palavra, árvore diferente: agora é outra árvore, não só outra ordem. A gramática é ambígua.' },
  ]);
})();

/* ============ Fig 4: d+d*d, gramática ambígua e com níveis ============ */
(function () {
  const amb = { start: 'E', rules: { E: [['E', '+', 'E'], ['E', '*', 'E'], ['(', 'E', ')'], ['d']] } };
  const niv = { start: 'E', rules: { E: [['E', '+', 'T'], ['T']], T: [['T', '*', 'F'], ['F']], F: [['(', 'E', ')'], ['d']] } };
  const L = (alts) => alts.map((a) => ['L', a]);
  figDerivacoes('fig-prec', [
    { label: 'ambígua: + na raiz', g: amb, seq: L([0, 3, 1, 3, 3]),
      intro: 'Gramática ambígua <code>E → E+E | E*E | (E) | d</code>, começando pelo +.',
      final: 'O * ficou embaixo, dentro do segundo operando: d + (d*d).' },
    { label: 'ambígua: * na raiz', g: amb, seq: L([1, 0, 3, 3, 3]),
      intro: 'A mesma gramática e a mesma palavra, começando pelo *.',
      final: 'Agora o + ficou embaixo: (d+d) * d. Mesma palavra, outra árvore, outra conta.' },
    { label: 'um nível por operador', g: niv, seq: L([0, 1, 1, 1, 0, 1, 1, 1]),
      intro: 'Gramática com níveis: E soma termos, T multiplica fatores, F é d ou parênteses.',
      extra: { 3: 'O primeiro termo é só um fator.', 5: 'O * só pode nascer de um T, que está embaixo do +.' },
      final: 'Esta é a única árvore de d+d*d nesta gramática. d*d está embaixo de um T: é calculado antes da soma.' },
  ]);
})();

/* ============ Fig 3: do formato genérico à gramática ============ */
(function () {
  const COR = { a: 'var(--blue)', b: 'var(--amber)', c: 'var(--green)', d: 'var(--muted)' };
  const LS = [
    { label: 'L₁ · três 1', lang: 'w ∈ {0,1}* com pelo menos três 1', ex: '0110010',
      partes: [['0', 'a', 'T'], ['1', 'd', '1'], ['', 'a', 'T'], ['1', 'd', '1'], ['00', 'a', 'T'], ['1', 'd', '1'], ['0', 'a', 'T']],
      formato: 'α 1 β 1 γ 1 λ, com α, β, γ, λ quaisquer (inclusive vazios)',
      regras: ['S → T1T1T1T', 'T → 0T | 1T | ε'],
      der: 'S ⇒ T1T1T1T ⇒ 0T1T1T1T ⇒ 01T1T1T ⇒ 011T1T ⇒ 0110T1T ⇒ 01100T1T ⇒ 011001T ⇒ 0110010T ⇒ 0110010',
      porque: 'Os três 1 estão fixos na regra de S: toda palavra gerada tem pelo menos três. E qualquer palavra com três 1 se quebra em α1β1γ1λ, com cada pedaço saindo de um T.' },
    { label: 'L₃ · parênteses', lang: 'parênteses balanceados', ex: '(())()',
      partes: [['(', 'b', '('], ['()', 'a', 'S'], [')', 'b', ')'], ['()', 'c', 'S']],
      formato: '( α ) β: o primeiro ( casa com um ), α e β também balanceados',
      regras: ['S → (S) | SS | ε'],
      der: 'S ⇒ SS ⇒ (S)S ⇒ ((S))S ⇒ (())S ⇒ (())(S) ⇒ (())()',
      porque: '(S) põe o par em volta de uma balanceada; SS cola duas balanceadas. As duas regras preservam o balanceamento, e todo caso do formato é coberto por uma delas.' },
    { label: 'L₅ · aⁿb²ⁿbᵏc³ᵏ', lang: 'aⁿ b²ⁿ bᵏ c³ᵏ, n, k ≥ 0', ex: 'abbbccc',
      partes: [['a', 'a', 'X'], ['bb', 'a', 'X'], ['b', 'c', 'Y'], ['ccc', 'c', 'Y']],
      formato: 'aⁿb²ⁿ · bᵏc³ᵏ: duas partes que não se relacionam',
      regras: ['S → XY', 'X → aXbb | ε', 'Y → bYccc | ε'],
      der: 'S ⇒ XY ⇒ aXbbY ⇒ abbY ⇒ abbbYccc ⇒ abbbccc',
      porque: 'Cada a nasce junto com dois b (X); cada b do segundo grupo nasce com três c (Y). X vem antes de Y, então a ordem a, b, c se mantém.' },
    { label: 'L₆ · n ≠ m', lang: 'aⁿbᵐ com n ≠ m', ex: 'aaab',
      partes: [['a', 'a', 'casado'], ['aa', 'b', 'A'], ['b', 'a', 'casado']],
      formato: 'n > m: aᵐ · aⁿ⁻ᵐ · bᵐ (ou n < m: aⁿ · bᵐ⁻ⁿ · bⁿ)',
      regras: ['S → aSb | A | B', 'A → aA | a', 'B → bB | b'],
      der: 'S ⇒ aSb ⇒ aAb ⇒ aaAb ⇒ aaab',
      porque: 'aSb gera casado; ao sair por A sobra pelo menos um a, ao sair por B, pelo menos um b. As quantidades nunca ficam iguais, e todo par n ≠ m é alcançado.' },
  ];
  const root = document.getElementById('fig-construir'), tabs = root.querySelector('.fig-tabs');
  const lbl = document.getElementById('cons-lbl'), pal = document.getElementById('cons-pal'), reg = document.getElementById('cons-regras'), der = document.getElementById('cons-der');
  let fig = null;
  function carregar(k) {
    const L = LS[k];
    tabs.querySelectorAll('.btn').forEach((b, j) => b.classList.toggle('sel', j === k));
    const notes = [
      `A linguagem: ${esc(L.lang)}. Exemplo: <code>${esc(L.ex)}</code>.`,
      `Formato genérico: ${esc(L.formato)}. As cores mostram os pedaços na palavra de exemplo.`,
      'Cada pedaço vira uma variável feita de um bloco; a variável inicial cola os pedaços na ordem certa.',
      'Derivação da palavra de exemplo.',
      L.porque,
    ];
    const render = (i) => {
      lbl.textContent = i === 0 ? 'palavra de exemplo' : 'pedaços';
      pal.innerHTML = '';
      L.partes.forEach(([txt, cor, nome]) => {
        const s = H('span', { class: 'tok' }, (txt ? esc(txt) : 'ε') + (i >= 1 ? ` <small style="color:var(--muted)">${esc(nome)}</small>` : ''));
        if (i >= 1) s.style.borderColor = COR[cor];
        if (!txt && i === 0) return;
        pal.appendChild(s);
      });
      reg.style.display = i >= 2 ? '' : 'none';
      reg.innerHTML = L.regras.map((r) => `<div class="ln">${esc(r)}</div>`).join('');
      der.innerHTML = i >= 3 ? esc(L.der) : '';
    };
    if (!fig) fig = new StepFig(root, { notes, render, speed: 2400 });
    else { fig.stop(); fig.render = render; fig.setSteps(notes); }
  }
  LS.forEach((L, k) => { const b = H('button', { class: 'btn sm' }, L.label); b.addEventListener('click', () => { carregar(k); fig.play(); }); tabs.appendChild(b); });
  carregar(0);
})();

/* ============ Fig 5: árvore sintática de b = (y - 2) * z; ============
   Nó: [rótulo, filhos, passo em que os filhos aparecem]; folha: [tipo, lexema]. */
(function () {
  const T = (tipo, lex) => ({ tipo, lex });
  const V = (sym, passo, kids) => ({ sym, passo, kids });
  const arv = V('CMD', 1, [T('IDENTIFICADOR', 'b'), T('ATRIBUICAO', '='),
    V('EXPR', 2, [V('SOMA', 2, [V('TERMO', 3, [
      V('TERMO', 4, [V('FATOR', 4, [T('ABREPAR', '('),
        V('EXPR', 5, [V('SOMA', 5, [V('SOMA', 6, [V('TERMO', 6, [V('FATOR', 6, [T('IDENTIFICADOR', 'y')])])]), T('OPSOMA', '-'), V('TERMO', 7, [V('FATOR', 7, [T('INTEIRO', '2')])])])]),
        T('FECHAPAR', ')')])]),
      T('OPMUL', '*'), V('FATOR', 8, [T('IDENTIFICADOR', 'z')])])])]),
    T('PONTOVIRGULA', ';')]);
  /* liga pais, profundidade e passo de nascimento */
  (function ligar(n, d, pai, nasce) { n.depth = d; n.parent = pai; n.born = nasce; n.kids = n.kids || []; n.kids.forEach((k) => ligar(k, d + 1, n, n.passo)); })(arv, 0, null, 1);
  /* na árvore, o tipo vai abreviado para caber; os chips de cima mostram o nome inteiro */
  const SIGLA = { IDENTIFICADOR: 'ID', ATRIBUICAO: 'ATRIB', ABREPAR: 'ABRE', FECHAPAR: 'FECHA', INTEIRO: 'INT', PONTOVIRGULA: 'PV' };
  const sigla = (t) => SIGLA[t] || t;
  /* folhas com pelo menos a largura de uma variável (TERMO), para os nós de cima não encostarem */
  const largura = (n) => (n.tipo ? Math.max(sigla(n.tipo).length * 7.4 + 14, 66) : 66);
  const P = posicionar(arv, largura);
  const svg = document.getElementById('parse-svg'), SY = 40, W = P.largura, Hh = P.prof * SY + 50;
  svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
  svg.style.width = '100%';
  const px = (n) => n.x, py = (n) => 20 + n.depth * SY;
  const gE = S('g', null, svg), gN = S('g', null, svg);
  P.todos.forEach((n) => {
    if (n.parent) n.e = S('line', { x1: px(n.parent), y1: py(n.parent) + 11, x2: px(n), y2: py(n) - 12, class: 'tedge anim' }, gE);
    n.g = S('g', { class: 'anim' }, gN);
    if (n.tipo) {
      const w = Math.max(sigla(n.tipo).length * 7.4 + 8, 30);
      n.r = S('rect', { x: px(n) - w / 2, y: py(n) - 14, width: w, height: 34, rx: 5, style: 'fill:var(--surface);stroke:var(--green);stroke-width:1.3' }, n.g);
      S('text', { x: px(n), y: py(n) - 4, style: 'font-family:var(--f-mono);font-size:11px;text-anchor:middle;dominant-baseline:central;fill:var(--muted)' }, n.g, sigla(n.tipo));
      S('text', { x: px(n), y: py(n) + 10, style: 'font-family:var(--f-mono);font-size:15px;text-anchor:middle;dominant-baseline:central;fill:var(--fg)' }, n.g, n.lex);
    } else {
      const w = n.sym.length * 9 + 14;
      n.r = S('rect', { x: px(n) - w / 2, y: py(n) - 12, width: w, height: 24, rx: 12, style: 'fill:var(--blue-soft);stroke:var(--blue);stroke-width:1.4' }, n.g);
      S('text', { x: px(n), y: py(n), style: 'font-family:var(--f-mono);font-size:13px;font-weight:600;text-anchor:middle;dominant-baseline:central;fill:var(--blue)' }, n.g, n.sym);
    }
  });
  const folhas = P.todos.filter((n) => n.tipo);
  const tks = document.getElementById('parse-tks');
  const chips = folhas.map((f) => { const c = H('span', { class: 'tk' }, `${esc(f.tipo)} <b>${esc(f.lex)}</b>`); tks.appendChild(c); return c; });
  const notes = [
    'O léxico entregou estes 10 tokens. Para o sintático, só o tipo importa; o lexema vai junto para as fases seguintes. Na árvore os tipos aparecem abreviados: ID, ATRIB, ABRE, FECHA, INT, PV.',
    'O comando inteiro: <code>CMD → IDENTIFICADOR ATRIBUICAO EXPR PONTOVIRGULA</code>. Três tokens já estão na árvore; falta o que vem entre o = e o ;.',
    'Não há comparação nem soma no nível de fora: EXPR → SOMA e SOMA → TERMO.',
    'O * é o operador de fora: <code>TERMO → TERMO OPMUL FATOR</code>. A multiplicação fica no alto, então é a última conta.',
    'O primeiro operando do * é um fator entre parênteses: <code>FATOR → ABREPAR EXPR FECHAPAR</code>. É o único jeito de pôr uma soma embaixo de um *.',
    'Dentro dos parênteses, uma subtração: <code>SOMA → SOMA OPSOMA TERMO</code>.',
    'O y desce até FATOR → IDENTIFICADOR.',
    'O 2 desce até FATOR → INTEIRO.',
    'O z: FATOR → IDENTIFICADOR. Não sobrou variável sem filhos.',
    'Lendo as folhas em ordem sai exatamente a sequência de tokens: a linha está sintaticamente certa. A conta é (y − 2) primeiro, depois * z.',
  ];
  new StepFig(document.getElementById('fig-parse'), { notes, speed: 2200, render(k) {
    P.todos.forEach((n) => {
      const vis = k >= 1 && n.born <= k;
      n.g.classList.toggle('hide', !vis); if (n.e) n.e.classList.toggle('hide', !vis);
      if (!n.tipo) n.r.style.strokeWidth = n.passo === k ? '3' : '1.4';
    });
    chips.forEach((c, j) => { c.classList.toggle('ok', k >= 1 && folhas[j].born <= k); c.classList.toggle('fresh', folhas[j].born === k); });
  } });
})();

/* ============ widget: gerador de palavras ============
   Símbolos de um caractere: maiúscula é variável. Busca em largura por derivações mais à esquerda,
   podando cadeias com terminais demais ou cujo prefixo de terminais não serve. */
(function () {
  const GS = [
    ['A → 0A | ε', { A: ['0A', ''] }],
    ['palíndromos', { P: ['', '0', '1', '0P0', '1P1'] }],
    ['P → aP | Pb | ε', { P: ['aP', 'Pb', ''] }],
    ['P → aP | bP | ε', { P: ['aP', 'bP', ''] }],
    ['if/else', { S: ['SS', 'iS', 'iSeS', ''] }],
    ['S → TT | X', { S: ['TT', 'X'], T: ['0T', 'T0', '#'], X: ['0X00', '#'] }],
    ['tantos a quanto b', { S: ['aSbS', 'bSaS', ''] }],
    ['parênteses', { S: ['(S)', 'SS', ''] }],
    ['wwᴿ', { S: ['aSa', 'bSb', ''] }],
    ['aⁿbᵐ, n ≠ m', { S: ['aSb', 'A', 'B'], A: ['aA', 'a'], B: ['bB', 'b'] }],
    ['d+d*d com níveis', { E: ['E+T', 'T'], T: ['T*F', 'F'], F: ['(E)', 'd'] }],
  ];
  const isV = (c) => c >= 'A' && c <= 'Z';
  function busca(R, ini, N, alvo) {
    const pai = new Map([[ini, null]]), fila = [ini], palavras = [];
    let passos = 0;
    while (fila.length && passos < 40000) {
      const f = fila.shift(); passos++;
      const i = [...f].findIndex(isV);
      if (i < 0) { palavras.push(f); if (alvo != null && f === alvo) break; continue; }
      for (const r of R[f[i]] || []) {
        const nf = f.slice(0, i) + r + f.slice(i + 1);
        const term = [...nf].filter((c) => !isV(c)).length;
        if (term > N || nf.length > N + 6 || pai.has(nf)) continue;
        if (alvo != null) { const j = [...nf].findIndex(isV), pre = j < 0 ? nf : nf.slice(0, j); if (!alvo.startsWith(pre) || (j < 0 && nf !== alvo)) continue; }
        pai.set(nf, f); fila.push(nf);
      }
    }
    return { pai, palavras: [...new Set(palavras)].sort((x, y) => x.length - y.length || (x < y ? -1 : 1)) };
  }
  const caminho = (pai, w) => { const c = []; for (let x = w; x != null; x = pai.get(x)) c.unshift(x || 'ε'); return c; };
  const sel = document.getElementById('ger-sel'), regEl = document.getElementById('ger-regras'), nEl = document.getElementById('ger-n'),
    lista = document.getElementById('ger-lista'), inp = document.getElementById('ger-w'), ans = document.getElementById('ger-ans');
  GS.forEach(([nome], i) => sel.appendChild(H('option', { value: i }, esc(nome))));
  let atual = null;
  function mostrar(w) {
    const [, R] = GS[+sel.value], ini = Object.keys(R)[0];
    const r = busca(R, ini, w.length, w);
    if (r.pai.has(w) && ![...w].some(isV)) ans.innerHTML = `<code>${esc(w || 'ε')}</code> é gerada: <code>${caminho(r.pai, w).map(esc).join(' ⇒ ')}</code>`;
    else ans.innerHTML = `<code>${esc(w || 'ε')}</code> <span class="bad">não sai</span> desta gramática (busca até ${w.length} símbolos).`;
    lista.querySelectorAll('.tk').forEach((t) => t.classList.toggle('sel', t.dataset.w === w));
  }
  function gerar() {
    const [, R] = GS[+sel.value], ini = Object.keys(R)[0];
    regEl.innerHTML = Object.entries(R).map(([v, alts]) => `<div class="ln"><span class="v">${v}</span><span class="bar">→</span>${alts.map((a) => `<span class="alt">${esc(a || 'ε')}</span>`).join('<span class="bar">|</span>')}</div>`).join('');
    atual = busca(R, ini, +nEl.value, null);
    lista.innerHTML = '';
    atual.palavras.slice(0, 80).forEach((w) => { const b = H('button', { class: 'tk', type: 'button' }, esc(w || 'ε')); b.dataset.w = w; lista.appendChild(b); });
    if (atual.palavras.length > 80) lista.appendChild(H('span', { class: 'tk eof' }, `+${atual.palavras.length - 80}`));
    if (!atual.palavras.length) lista.appendChild(H('span', { class: 'tk eof' }, 'nenhuma palavra: a linguagem pode ser vazia ou só ter palavras maiores'));
    ans.textContent = `${atual.palavras.length} palavra${atual.palavras.length === 1 ? '' : 's'} de até ${nEl.value} símbolos. Clique numa para ver a derivação.`;
  }
  sel.addEventListener('change', () => { inp.value = ''; gerar(); });
  nEl.addEventListener('change', gerar);
  lista.addEventListener('click', (e) => { const b = e.target.closest('button.tk'); if (b) { inp.value = b.dataset.w; mostrar(b.dataset.w); } });
  inp.addEventListener('input', () => { const w = inp.value.replace(/\s|ε/g, ''); if (w.length > 12) { ans.textContent = 'Use até 12 símbolos.'; return; } mostrar(w); });
  gerar();
})();

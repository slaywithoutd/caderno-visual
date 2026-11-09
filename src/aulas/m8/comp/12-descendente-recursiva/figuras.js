import { H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Peças comuns às três figuras: uma fila de tokens (chips) e uma pilha de chamadas (topo em cima).
   Estados de um token: ok (verde), try (amarelo, o atual), no (riscado, descartado), err (vermelho). */
function fila(el, rotulos) {
  return rotulos.map((r) => { const c = H('span', { class: 'tk' }, esc(r)); el.appendChild(c); return c; });
}
function pintar(chips, estado) {
  chips.forEach((c, i) => { c.className = 'tk' + (estado[i] ? ' ' + estado[i] : ''); });
}
function empilhar(el, quadros) {
  el.innerHTML = '';
  if (!quadros.length) { el.appendChild(H('span', { class: 'tk eof' }, 'vazia')); return; }
  quadros.forEach((q, i) => el.appendChild(H('span', { class: 'tk ' + (i === quadros.length - 1 ? 'on' : 'past') }, esc(q))));
}
/* estado a partir de intervalos: { ok: [i, j], no: [...], err: k, cur: k } */
function estados(n, s) {
  const e = Array(n).fill('');
  const marca = (lista, cls) => (lista || []).forEach(([a, b]) => { for (let i = a; i <= b; i++) e[i] = cls; });
  marca(s.ok, 'ok'); marca(s.no, 'no');
  if (s.cur != null && s.cur < n) e[s.cur] = 'try';
  if (s.err != null) e[s.err] = 'err';
  return e;
}

/* ============ Fig 1: backtracking em c a d ============ */
(function () {
  const root = document.getElementById('fig-backtrack');
  if (!root) return;
  const tks = fila(document.getElementById('bt-tks'), ['c', 'a', 'd']);
  const regras = fila(document.getElementById('bt-regras'), ['S → c A d', 'A → a b', 'A → a']);
  const pilhaEl = document.getElementById('bt-pilha');
  /* r: estado de cada regra ('on' tentando, 'no' falhou, 'ok' deu certo) */
  const P = [
    { t: { cur: 0 }, r: ['on', '', ''], s: ['S()'], n: 'S só tem uma regra, <code>c A d</code>. O ponteiro da entrada está no <code>c</code>.' },
    { t: { ok: [[0, 0]], cur: 1 }, r: ['on', '', ''], s: ['S()'], n: 'match(<code>c</code>): casa. O ponteiro anda para o <code>a</code>.' },
    { t: { ok: [[0, 0]], cur: 1 }, r: ['on', 'on', ''], s: ['S()', 'A()  · guardou a posição 1'], n: 'S chama A. A guarda onde a entrada está (posição 1) e tenta a primeira regra, <code>a b</code>.' },
    { t: { ok: [[0, 1]], cur: 2 }, r: ['on', 'on', ''], s: ['S()', 'A()  · guardou a posição 1'], n: 'O <code>a</code> da regra casa com o <code>a</code> da entrada. O ponteiro vai para o <code>d</code>.' },
    { t: { ok: [[0, 1]], err: 2 }, r: ['on', 'no', ''], s: ['S()', 'A()  · guardou a posição 1'], n: 'A regra pede <code>b</code>, a entrada tem <code>d</code>. A alternativa falhou, mas ainda não é erro: há outra para tentar.' },
    { t: { ok: [[0, 0]], cur: 1 }, r: ['on', 'no', 'on'], s: ['S()', 'A()  · voltou para a posição 1'], n: 'Backtracking: o ponteiro volta para a posição guardada, e A tenta a próxima regra, <code>a</code>.' },
    { t: { ok: [[0, 1]], cur: 2 }, r: ['on', 'no', 'on'], s: ['S()', 'A()  · voltou para a posição 1'], n: 'O <code>a</code> casa de novo. O mesmo token foi lido duas vezes.' },
    { t: { ok: [[0, 2]] }, r: ['on', 'no', 'ok'], s: ['S()'], n: 'A termina e volta para S, que faz match(<code>d</code>): casa.' },
    { t: { ok: [[0, 2]] }, r: ['ok', 'no', 'ok'], s: [], n: 'S terminou e a entrada acabou: <code>cad</code> é aceita. Foram 5 comparações para 3 tokens. Um preditivo, com <code>A → a A′</code> e <code>A′ → b | ε</code>, faria 3 e nunca voltaria.' },
  ];
  new StepFig(root, { notes: P.map((p) => p.n), speed: 2200, render(k) {
    const p = P[k];
    pintar(tks, estados(3, p.t));
    regras.forEach((c, i) => { c.className = 'tk' + (p.r[i] ? ' ' + p.r[i] : ''); });
    empilhar(pilhaEl, p.s);
  } });
})();

/* ============ Fig 2: pilha de chamadas da Mini em x = 2 + 3 * y; ============
   Gerada a partir do traço do analisador Python da seção "analisador" (mesma ordem de chamadas e matches). */
(function () {
  const root = document.getElementById('fig-pilha');
  if (!root) return;
  const rot = ['IDENT x', '=', 'INTEIRO 2', 'OPSOMA +', 'INTEIRO 3', 'OPMUL *', 'IDENT y', ';', 'EOF'];
  const tks = fila(document.getElementById('pi-tks'), rot);
  const pilhaEl = document.getElementById('pi-pilha'), ret = document.getElementById('pi-ret');
  const base = ['programa', 'lista_comandos'];
  const at = [...base, 'comando', 'atribuicao'];
  const ate = (...q) => [...at, ...q];
  const P = [
    { c: 0, s: base, r: '', n: '<code>programa()</code> chama <code>lista_comandos()</code>. O token atual, IDENT, pode começar um comando, então o while entra.' },
    { c: 0, s: [...base, 'comando'], r: '', n: '<code>comando()</code> olha o tipo do atual: IDENT. Das quatro alternativas, só a atribuição começa assim.' },
    { c: 1, s: at, r: '', n: '<code>atribuicao()</code> faz <code>match(\'IDENT\')</code> e guarda o nome <code>x</code>. O atual passa a ser o <code>=</code>.' },
    { c: 2, s: at, r: '', n: '<code>match(\'=\')</code> consome o <code>=</code>. Falta <code>expr</code> e o <code>;</code>.' },
    { c: 2, s: ate('expr', 'soma', 'termo', 'fator'), r: '', n: 'atribuicao chama expr, que chama soma, que chama termo, que chama fator. Quatro quadros novos e nenhum token consumido: só descida.' },
    { c: 3, s: ate('expr', 'soma', 'termo'), r: '2', n: 'fator vê INTEIRO, faz match e devolve <code>2</code>. O quadro de fator sai da pilha.' },
    { c: 3, s: ate('expr', 'soma'), r: '2', n: 'termo: o atual é <code>+</code>, que não é OPMUL, então o while nem roda. termo devolve <code>2</code> para soma.' },
    { c: 4, s: ate('expr', 'soma', 'termo'), r: '2', n: 'soma: o atual é OPSOMA. <code>match(\'OPSOMA\')</code> consome o <code>+</code>, e soma chama termo de novo para o lado direito.' },
    { c: 5, s: ate('expr', 'soma', 'termo'), r: '3', n: 'termo chama fator, que consome o <code>3</code> e devolve <code>3</code>.' },
    { c: 6, s: ate('expr', 'soma', 'termo', 'fator'), r: '3', n: 'Agora o atual é OPMUL: o while de termo roda. <code>match(\'OPMUL\')</code> e chama fator.' },
    { c: 7, s: ate('expr', 'soma', 'termo'), r: 'y', n: 'fator consome <code>y</code> e devolve o nome.' },
    { c: 7, s: ate('expr', 'soma'), r: '(* 3 y)', n: 'termo: o atual é <code>;</code>. Sai do while e devolve <code>(* 3 y)</code>. A multiplicação ficou montada antes de o + ganhar o lado direito.' },
    { c: 7, s: at, r: '(+ 2 (* 3 y))', n: 'soma não vê outro OPSOMA e devolve <code>(+ 2 (* 3 y))</code>. expr não vê OPREL e devolve a mesma árvore.' },
    { c: 8, s: base, r: '(= x (+ 2 (* 3 y)))', n: 'atribuicao faz <code>match(\';\')</code> e devolve o nó da atribuição. comando repassa para lista_comandos.' },
    { c: 9, s: ['programa'], r: '(programa [(= x (+ 2 (* 3 y)))])', n: 'O atual é EOF: o while de lista_comandos para. programa faz <code>match(\'EOF\')</code> e devolve a AST inteira.' },
    { c: 9, s: [], r: '(programa [(= x (+ 2 (* 3 y)))])', n: 'A pilha chegou a 8 quadros, o caminho de programa até fator. Cada quadro foi um nó da árvore de derivação; na AST ficaram só os que têm significado.' },
  ];
  new StepFig(root, { notes: P.map((p) => p.n), speed: 2400, render(k) {
    const p = P[k];
    pintar(tks, estados(rot.length, { ok: p.c ? [[0, p.c - 1]] : [], cur: p.c }));
    empilhar(pilhaEl, p.s);
    ret.textContent = p.r || ' ';
  } });
})();

/* ============ Fig 3: modo pânico na Mini ============
   Entrada: x = 3 + ;  /  escreva(x y);  /  escreva(2);  (mesmas mensagens que o analisador Python imprime) */
(function () {
  const root = document.getElementById('fig-panico');
  if (!root) return;
  const rot = ['x', '=', '3', '+', ';', 'escreva', '(', 'x', 'y', ')', ';', 'escreva', '(', '2', ')', ';', 'EOF'];
  const tks = fila(document.getElementById('pa-tks'), rot);
  const pilhaEl = document.getElementById('pa-pilha'), errEl = document.getElementById('pa-erros');
  const base = ['programa', 'lista_comandos'];
  const E1 = "linha 1, coluna 9: esperava uma expressão, encontrei ';'";
  const E2 = "linha 2, coluna 11: esperava ')', encontrei 'y'";
  const P = [
    { t: { cur: 0 }, s: base, e: [], n: 'Três linhas, dois erros. <code>lista_comandos()</code> analisa um comando de cada vez, dentro de um <code>try</code>.' },
    { t: { ok: [[0, 3]], cur: 4 }, s: [...base, 'comando', 'atribuicao', 'expr', 'soma', 'termo', 'fator'], e: [], n: '<code>x = 3 +</code> foi consumido. Depois do +, soma chama termo e fator, e fator encontra <code>;</code> onde esperava uma expressão.' },
    { t: { no: [[0, 3]], err: 4 }, s: base, e: [E1], n: 'fator registra o erro e lança a exceção. Ela atravessa termo, soma, expr, atribuicao e comando: a pilha volta para lista_comandos, que captura. O comando inteiro se perde.' },
    { t: { no: [[0, 4]], cur: 5 }, s: base, e: [E1], n: '<code>sincronizar()</code> descarta o <code>;</code> e, como era um <code>;</code>, para logo depois dele. O atual, <code>escreva</code>, começa um comando.' },
    { t: { no: [[0, 4]], ok: [[5, 7]], err: 8 }, s: [...base, 'comando', 'escreva'], e: [E1, E2], n: '<code>escreva ( x</code> é consumido; expr devolve <code>x</code>, e escreva pede <code>)</code>. Vem <code>y</code>: segundo erro, registrado com linha e coluna.' },
    { t: { no: [[0, 10]], cur: 11 }, s: base, e: [E1, E2], n: 'Pânico de novo. A exceção volta para lista_comandos, e sincronizar descarta <code>y</code>, <code>)</code> e <code>;</code>, parando depois do <code>;</code>.' },
    { t: { no: [[0, 10]], ok: [[11, 15]], cur: 16 }, s: [...base, 'comando', 'escreva'], e: [E1, E2], n: '<code>escreva(2);</code> é analisado normalmente e vira <code>(escreva 2)</code>.' },
    { t: { no: [[0, 10]], ok: [[11, 16]] }, s: ['programa'], e: [E1, E2], n: 'EOF: fim. Dois erros, cada um no lugar certo, nenhum erro falso, e a AST <code>(programa [(escreva 2)])</code>. Sem o modo pânico, a análise pararia no primeiro.' },
  ];
  new StepFig(root, { notes: P.map((p) => p.n), speed: 2600, render(k) {
    const p = P[k];
    pintar(tks, estados(rot.length, p.t));
    empilhar(pilhaEl, p.s);
    errEl.textContent = p.e.length ? p.e.join('\n') : 'nenhum';
  } });
})();

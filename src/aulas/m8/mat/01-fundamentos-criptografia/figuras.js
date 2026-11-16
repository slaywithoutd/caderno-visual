import { S, H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';

/* Matemática · aula 01. Figura de Euclides com azulejos, desenhos de margem montados por código
   (x ↦ 3x e 2x mod 10, grade de Playfair) e dois widgets: quebra-César e laboratório da afim. */

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const mod = (a, n) => ((a % n) + n) % n;
const mdc = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const inv = (a, n) => { for (let x = 1; x < n; x++) if (mod(a * x, n) === 1) return x; return null; };
const soLetras = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().replace(/[^A-Z]/g, '');

/* ============ Fig 1: Euclides com azulejos, mdc(21, 15) ============ */
(function () {
  const root = document.getElementById('fig-euclides');
  if (!root) return;
  const svg = document.getElementById('eu-svg');
  const U = 13, X0 = 24, Y0 = 50;            // 1 unidade = 13 px; piso 21×15 = 273×195
  const ret = (x, y, w, h, cls, g) => S('rect', { x: X0 + x * U, y: Y0 + y * U, width: w * U, height: h * U, class: cls, rx: 2 }, g);
  const rot = (x, y, txt, cls, g) => S('text', { x: X0 + x * U, y: Y0 + y * U, class: cls || '' }, g, txt);
  const linhas = [
    ['(21, 15)', '21 = 1·15 + 6', '(15, 6)'],
    ['(15, 6)', '15 = 2·6 + 3', '(6, 3)'],
    ['(6, 3)', '6 = 2·3 + 0', '(3, 0)'],
  ];
  function quadro(k) {
    svg.innerHTML = '';
    const g = S('g', { class: 'eu' }, svg);
    S('text', { x: X0 + 10.5 * U, y: Y0 - 18, class: 'eu-cota' }, g, '21');
    S('text', { x: X0 - 12, y: Y0 + 7.5 * U, class: 'eu-cota' }, g, '15');
    ret(0, 0, 21, 15, 'eu-piso', g);
    if (k >= 1) { ret(0, 0, 15, 15, 'eu-q1', g); rot(7.5, 7.5, '15×15', 'eu-lab', g); }
    if (k === 1) ret(15, 0, 6, 15, 'eu-sobra', g);
    if (k >= 2) { ret(15, 0, 6, 6, 'eu-q2', g); ret(15, 6, 6, 6, 'eu-q2', g); rot(18, 3, '6×6', 'eu-lab', g); rot(18, 9, '6×6', 'eu-lab', g); }
    if (k === 2) ret(15, 12, 6, 3, 'eu-sobra', g);
    if (k >= 3) { ret(15, 12, 3, 3, 'eu-q3', g); ret(18, 12, 3, 3, 'eu-q3', g); }
    if (k >= 4) for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) ret(i * 3, j * 3, 3, 3, 'eu-az', g);
    /* tabela à direita */
    const tx = 330;
    S('text', { x: tx, y: 40, class: 'eu-th' }, g, 'par');
    S('text', { x: tx + 78, y: 40, class: 'eu-th' }, g, 'divisão');
    S('text', { x: tx + 228, y: 40, class: 'eu-th' }, g, 'novo par');
    linhas.forEach((l, i) => {
      if (i >= k) return;
      const y = 72 + i * 34;
      S('text', { x: tx, y, class: 'eu-td' }, g, l[0]);
      S('text', { x: tx + 78, y, class: 'eu-td' }, g, l[1]);
      S('text', { x: tx + 228, y, class: i === 2 ? 'eu-td eu-fim' : 'eu-td' }, g, l[2]);
    });
    if (k >= 4) {
      S('rect', { x: tx - 6, y: 196, width: 290, height: 40, rx: 8, class: 'eu-res' }, g);
      S('text', { x: tx + 139, y: 216, class: 'eu-td eu-fim' }, g, 'mdc(21, 15) = 3');
    }
    S('text', { x: X0, y: Y0 + 15 * U + 26, class: 'eu-leg' }, g,
      ['piso 21 × 15', 'cabe 1 quadrado de 15; sobra 6 × 15', 'na sobra cabem 2 de 6; sobra 6 × 3', 'cabem 2 de 3; não sobra nada', 'azulejo de lado 3 cobre o piso: 7 × 5 = 35'][k]);
  }
  new StepFig(root, {
    speed: 2400,
    notes: [
      'Piso de 21 por 15. Qual é o maior azulejo quadrado que cobre o piso sem cortar nenhum? O lado dele é o <b>mdc</b>.',
      'Corte o maior quadrado possível, 15×15. Sobra uma faixa 6×15. Em conta: 21 = 1·15 + 6, e o par vira (15, 6). Um azulejo que cobre o piso cobre a faixa, e vice-versa.',
      'Na faixa 6×15 cabem dois quadrados 6×6. Sobra 6×3: 15 = 2·6 + 3, par (6, 3).',
      'Na sobra 6×3 cabem dois quadrados 3×3 e não sobra nada: 6 = 2·3 + 0. O par (3, 0) tem b = 0 e o algoritmo para.',
      'O lado 3 divide todos os cortes, então ladrilha o piso inteiro: 7 azulejos por 5. mdc(21, 15) = 3. No slide 62, o mesmo raciocínio dá 4 para o piso 12×8.',
    ],
    render: quadro,
  });
})();

/* ============ Margem: x ↦ 3x e x ↦ 2x módulo 10 ============ */
(function () {
  const g = document.getElementById('mn-inv-3');
  if (!g) return;
  const x0 = 94, dx = 15.5;
  for (let x = 0; x < 10; x++) {
    const cx = x0 + x * dx;
    S('text', { x: cx, y: 12, class: 'tm' }, g, String(x));
    S('text', { x: cx, y: 40, class: 'tb' }, g, String((3 * x) % 10));
    S('line', { x1: cx, y1: 18, x2: cx, y2: 31, class: 's' }, g);
    S('text', { x: cx, y: 88, class: 'tm' }, g, String(x));
    const y = (2 * x) % 10;
    S('text', { x: cx, y: 116, class: y === 0 ? 'tam' : '' }, g, String(y));
    S('line', { x1: cx, y1: 94, x2: cx, y2: 107, class: 's' }, g);
  }
  S('text', { x: 158, y: 60, class: 'tm' }, g, 'todos de 0 a 9, uma vez: bijetora');
  S('text', { x: 158, y: 136, class: 'tm' }, g, 'só pares, 0 duas vezes: sem volta');
})();

/* ============ Margem: grade de Playfair com MONARCHY ============ */
(function () {
  const svg = document.getElementById('mn-playfair');
  if (!svg) return;
  const seq = [];
  for (const c of 'MONARCHY' + 'ABCDEFGHIKLMNOPQRSTUVWXYZ') if (!seq.includes(c)) seq.push(c);
  const L = 26, x0 = 55, y0 = 6;
  seq.forEach((c, i) => {
    const r = Math.floor(i / 5), k = i % 5;
    const chave = i < 8;
    S('rect', { x: x0 + k * L, y: y0 + r * L, width: L - 2, height: L - 2, rx: 3, class: chave ? 'bl' : 'k' }, svg);
    S('text', { x: x0 + k * L + (L - 2) / 2, y: y0 + r * L + (L - 2) / 2, class: chave ? 'tb' : '' }, svg, c === 'I' ? 'I/J' : c);
  });
  S('text', { x: 120, y: 150, class: 'tm' }, svg, 'S, E → L, I: cantos do retângulo');
})();

/* ============ Widget: quebra-César (frequência + força bruta) ============ */
(function () {
  const root = document.getElementById('quebra');
  if (!root) return;
  const ta = document.getElementById('qb-txt'), freq = document.getElementById('qb-freq'), lista = document.getElementById('qb-lista');
  function atualizar() {
    const t = soLetras(ta.value);
    freq.innerHTML = ''; lista.innerHTML = '';
    if (!t) { freq.textContent = 'Digite ou cole letras.'; return; }
    const cont = Array(26).fill(0);
    for (const c of t) cont[ABC.indexOf(c)]++;
    const top = cont.map((n, i) => [n, i]).filter(([n]) => n).sort((a, b) => b[0] - a[0]).slice(0, 6);
    const max = top[0][0];
    const barras = H('div', { class: 'qb-barras' });
    top.forEach(([n, i]) => {
      const b = H('div', { class: 'qb-b' });
      b.appendChild(H('span', { class: 'qb-n' }, String(n)));
      const barra = H('span', { class: 'qb-barra' }); barra.style.height = `${Math.max(6, (n / max) * 56)}px`;
      b.appendChild(barra);
      b.appendChild(H('span', { class: 'qb-l' }, `${ABC[i]} <small>${i}</small>`));
      barras.appendChild(b);
    });
    freq.appendChild(H('div', { class: 'muted' }, `${t.length} letras. As mais frequentes:`));
    freq.appendChild(barras);
    const m = top[0][1];
    const palpites = { [mod(m - 0, 26)]: 'veio do A', [mod(m - 4, 26)]: 'veio do E', [mod(m - 14, 26)]: 'veio do O' };
    freq.appendChild(H('div', {}, `Se a mais frequente (${ABC[m]} = ${m}) veio do A, K = ${m} − 0 = ${mod(m, 26)}. Do E: K = ${mod(m - 4, 26)}. Do O: K = ${mod(m - 14, 26)}.`));
    const curto = t.slice(0, 48);
    for (let k = 0; k < 26; k++) {
      const claro = [...curto].map((c) => ABC[mod(ABC.indexOf(c) - k, 26)]).join('');
      const li = H('div', { class: 'qb-linha' + (palpites[k] ? ' palpite' : '') });
      li.appendChild(H('span', { class: 'qb-k' }, `K = ${k}`));
      li.appendChild(H('span', { class: 'qb-t' }, esc(claro) + (t.length > 48 ? '…' : '')));
      if (palpites[k]) li.appendChild(H('span', { class: 'qb-p' }, palpites[k]));
      lista.appendChild(li);
    }
  }
  ta.addEventListener('input', atualizar);
  atualizar();
})();

/* ============ Widget: laboratório da afim ============ */
(function () {
  const root = document.getElementById('lab-afim');
  if (!root) return;
  const sa = document.getElementById('af-a'), sb = document.getElementById('af-b'), tx = document.getElementById('af-txt');
  const st = document.getElementById('af-status'), tab = document.getElementById('af-tab');
  for (let i = 0; i < 26; i++) { sa.appendChild(H('option', { value: i }, String(i))); sb.appendChild(H('option', { value: i }, String(i))); }
  sa.value = '7'; sb.value = '3'; tx.value = 'CASA';
  function atualizar() {
    const a = +sa.value, b = +sb.value, d = mdc(a, 26), ai = inv(a, 26);
    const E = (M) => mod(a * M + b, 26);
    if (ai != null) {
      st.innerHTML = `mdc(${a}, 26) = 1, então ${a}⁻¹ ≡ ${ai} (mod 26): ${a}·${ai} = ${a * ai} = ${Math.floor(a * ai / 26)}·26 + 1. A função é bijetora; a volta é M = ${ai}·(C − ${b}) mod 26.`;
      st.className = 'af-ok';
    } else {
      let par = null;
      for (let x = 0; x < 26 && !par; x++) for (let y = x + 1; y < 26; y++) if (E(x) === E(y)) { par = [x, y]; break; }
      st.innerHTML = `mdc(${a}, 26) = ${d} ≠ 1: ${a} não tem inverso e a função não é injetora. Contraexemplo: ${ABC[par[0]]} (${par[0]}) e ${ABC[par[1]]} (${par[1]}) viram a mesma letra, ${ABC[E(par[0])]} (${E(par[0])}).`;
      st.className = 'af-no';
    }
    const t = soLetras(tx.value).slice(0, 12);
    const linhas = [['letra'], ['M'], [`${a}·M`], [`${a}·M + ${b}`], ['mod 26'], ['C']];
    if (ai != null) linhas.push([`volta: ${ai}·(C − ${b})`], ['mod 26'], ['letra']);
    for (const c of t) {
      const M = ABC.indexOf(c), C = E(M);
      linhas[0].push(c); linhas[1].push(M); linhas[2].push(a * M); linhas[3].push(a * M + b); linhas[4].push(C); linhas[5].push(`<b>${ABC[C]}</b>`);
      if (ai != null) { const v = ai * (C - b); linhas[6].push(v); linhas[7].push(mod(v, 26)); linhas[8].push(ABC[mod(v, 26)]); }
    }
    tab.innerHTML = linhas.map((l) => `<tr><th>${l[0]}</th>${l.slice(1).map((x) => `<td>${x}</td>`).join('')}</tr>`).join('');
  }
  [sa, sb].forEach((s) => s.addEventListener('change', atualizar));
  tx.addEventListener('input', atualizar);
  atualizar();
})();

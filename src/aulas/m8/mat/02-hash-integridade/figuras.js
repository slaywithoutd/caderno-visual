import { S, H, esc } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';
import { sha512, hex16, IV } from './sha.js';

/* Matemática · aula 02. Figuras passo a passo (XOR de blocos, cadeia de brinquedo, HMAC de brinquedo,
   uma rodada do SHA-512 com os números de verdade de "abc") e o widget do efeito avalanche. */

const f = (h, m) => (3 * h + m) % 10;            // função de compactação de brinquedo dos slides
const enc = new TextEncoder();

/* ============ Fig 1: XOR de blocos (slide 16, Figura 11.5 do livro) ============ */
(function () {
  const root = document.getElementById('fig-xor');
  if (!root) return;
  const svg = document.getElementById('xor-svg');
  const CEL = 30;
  const xor = (a, b) => a.split('').map((c, i) => (c === b[i] ? '0' : '1')).join('');
  const rot = (a) => a.slice(1) + a[0];          // gira 1 bit para a esquerda
  function linha(g, x, y, bits, cls, op) {
    if (op) S('text', { x: x - 18, y: y + CEL / 2, class: 'xr-op' }, g, op);
    bits.split('').forEach((b, i) => {
      S('rect', { x: x + i * (CEL + 4), y, width: CEL, height: CEL, rx: 5, class: 'xr-cel ' + (cls || '') }, g);
      S('text', { x: x + i * (CEL + 4) + CEL / 2, y: y + CEL / 2, class: 'xr-bit' }, g, b);
    });
  }
  function regua(g, x, y) { S('line', { x1: x - 24, y1: y, x2: x + 4 * (CEL + 4), y2: y, class: 'xr-regua' }, g); }
  function painel(g, x, titulo, cls, linhas, resumo, nota) {
    S('text', { x: x + 66, y: 26, class: 'xr-tit ' + cls }, g, titulo);
    linhas.forEach(([bits, c, op], i) => linha(g, x, 44 + i * 40, bits, c, op));
    if (resumo) {
      const y = 44 + linhas.length * 40 + 8;
      regua(g, x, y - 4);
      linha(g, x, y + 4, resumo, 'xr-res');
      S('text', { x: x + 4 * (CEL + 4) + 10, y: y + 4 + CEL / 2, class: 'xr-lab' }, g, 'resumo');
    }
    if (nota) S('text', { x: x + 66, y: 286, class: 'xr-nota' }, g, nota);
  }
  const A = ['1011', '0110', '1100'];
  const ra = (bs) => bs.reduce((h, b) => xor(rot(h), b), '0000');   // XOR com rotação
  function quadro(k) {
    svg.innerHTML = '';
    const g = S('g', {}, svg);
    if (k <= 4) {
      const al = [[A[0], ''], [A[1], k >= 1 ? '' : 'xr-apag', '⊕'], [A[2], k >= 2 ? '' : 'xr-apag', '⊕']];
      const parcial = k === 0 ? null : k === 1 ? xor(A[0], A[1]) : xor(xor(A[0], A[1]), A[2]);
      painel(g, 60, 'Alice', 'xr-az', al, parcial, k === 1 ? 'parcial: 1011 ⊕ 0110 = 1101' : k >= 2 ? 'resumo 0001' : 'três blocos de 4 bits');
      if (k >= 3) {
        const forjado = xor(xor('1111', '0000'), '0001');
        const ml = [['1111', 'xr-ve'], ['0000', 'xr-ve', '⊕'], [k >= 4 ? forjado : '????', k >= 4 ? 'xr-am' : 'xr-apag', '⊕']];
        painel(g, 380, 'Mallory', 'xr-ver', ml, k >= 4 ? '0001' : null, k >= 4 ? 'bloco = 1111 ⊕ 0000 ⊕ 0001 = 1110' : 'escolhe 1111 e 0000 à vontade');
      }
    } else {
      S('text', { x: 320, y: 12, class: 'xr-lab' }, g, 'variante do livro: gire o resumo 1 bit, depois faça o XOR');
      const passos = [A[0], xor(rot(A[0]), A[1]), ra(A)];
      painel(g, 60, 'Alice', 'xr-az', [[A[0], ''], [A[1], '', '↻⊕'], [A[2], '', '↻⊕']], passos[2], 'estados: 1011 → 0001 → 1110');
      if (k >= 6) {
        const h2 = ra(['1111', '0000']);
        const bloco = xor(rot(h2), '1110');
        painel(g, 380, 'Mallory', 'xr-ver', [['1111', 'xr-ve'], ['0000', 'xr-ve', '↻⊕'], [bloco, 'xr-am', '↻⊕']], ra(['1111', '0000', bloco]), 'bloco = gira(1111) ⊕ 1110 = 0001');
      }
    }
  }
  new StepFig(root, {
    speed: 2600,
    notes: [
      'A Alice manda três blocos de 4 bits. O resumo é o <b>XOR</b> de todos eles, coluna por coluna.',
      'Primeiro bloco ⊕ segundo: 1011 ⊕ 0110 = 1101. Em cada coluna, bits diferentes dão 1 e iguais dão 0.',
      'Mais o terceiro: 1101 ⊕ 1100 = 0001. O resumo da mensagem da Alice é 0001.',
      'O Mallory quer outra mensagem com o mesmo resumo. Ele escolhe os dois primeiros blocos à vontade: 1111 e 0000.',
      'O último bloco ele calcula: 1111 ⊕ 0000 ⊕ 0001 = 1110. Somando tudo dá 0001 de novo. Mensagem nova, resumo igual, sem esforço.',
      'O livro melhora a função: antes de cada XOR, o resumo gira 1 bit para a esquerda. Agora a ordem dos blocos importa. Resumo da Alice: 1110.',
      'Mesmo assim o Mallory forja: depois de 1111 e 0000 o estado é 1111; ele escolhe o bloco gira(1111) ⊕ 1110 = 0001. Resumo 1110 de novo. Conta fácil de desfazer não serve para segurança.',
    ],
    render: quadro,
  });
})();

/* ============ Cadeia de brinquedo, usada nas figuras 2 e 3 ============ */
function cadeia(g, x0, y, iv, blocos, ate, opts = {}) {
  /* desenha IV → f → f → …; "ate" = quantos blocos já entraram */
  const W = opts.passo || 112;
  S('rect', { x: x0, y: y - 18, width: 44, height: 36, rx: 7, class: 'cd-iv' }, g);
  S('text', { x: x0 + 22, y, class: 'cd-num' }, g, String(iv));
  S('text', { x: x0 + 22, y: y + 32, class: 'cd-lab' }, g, opts.ivLab || 'IV');
  let h = iv, x = x0 + 44;
  blocos.forEach((m, i) => {
    const fx = x + 30, cls = i < ate ? '' : ' cd-apag';
    S('rect', { x: fx + 6, y: y - 78, width: 30, height: 30, rx: 6, class: 'cd-bloco' + (opts.marca === i ? ' cd-mal' : '') + cls }, g);
    S('text', { x: fx + 21, y: y - 63, class: 'cd-num' + cls }, g, String(m));
    S('line', { x1: fx + 21, y1: y - 48, x2: fx + 21, y2: y - 22, class: 'cd-seta' + cls, 'marker-end': 'url(#cd-ponta)' }, g);
    S('line', { x1: x + 2, y1: y, x2: fx - 2, y2: y, class: 'cd-seta' + cls, 'marker-end': 'url(#cd-ponta)' }, g);
    S('rect', { x: fx, y: y - 20, width: 42, height: 40, rx: 8, class: 'cd-f' + cls }, g);
    S('text', { x: fx + 21, y, class: 'cd-ftxt' + cls }, g, 'f');
    if (i < ate) {
      const novo = f(h, m), conta = 3 * h + m;
      S('line', { x1: fx + 44, y1: y, x2: fx + 70, y2: y, class: 'cd-seta', 'marker-end': 'url(#cd-ponta)' }, g);
      S('rect', { x: fx + 72, y: y - 18, width: 36, height: 36, rx: 7, class: 'cd-h' + (i === ate - 1 ? ' cd-novo' : '') + (opts.marca === i ? ' cd-mal' : '') }, g);
      S('text', { x: fx + 90, y, class: 'cd-num' }, g, String(novo));
      if (i === ate - 1) S('text', { x: Math.min(fx + 60, 552), y: y + 42, class: 'cd-conta' }, g,
        `3·${h} + ${m} = ${conta}` + (conta >= 10 ? ` = ${Math.floor(conta / 10)}·10 + ${novo}` : ''));
      h = novo;
    }
    x = fx + 108;
  });
  return h;
}
function pontaSeta(svg) {
  const defs = S('defs', {}, svg);
  const mk = S('marker', { id: 'cd-ponta', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
  S('path', { d: 'M0 0 L10 5 L0 10 z', class: 'cd-pontaf' }, mk);
}

/* ============ Fig 2: a cadeia de brinquedo, H(381) = 2 (slide 32) ============ */
(function () {
  const root = document.getElementById('fig-cadeia');
  if (!root) return;
  const svg = document.getElementById('cad-svg');
  function quadro(k) {
    svg.innerHTML = '';
    pontaSeta(svg);
    const g = S('g', {}, svg);
    S('text', { x: 20, y: 22, class: 'cd-tit' }, g, 'f(h, m) = (3h + m) mod 10, IV = 0, mensagem 381');
    const blocos = k >= 4 ? [3, 8, 1, 5] : [3, 8, 1];
    const fim = cadeia(g, 20, 160, 0, blocos, Math.min(k, 4), { passo: 112, marca: k >= 4 ? 3 : undefined });
    if (k === 3) S('text', { x: 20, y: 262, class: 'cd-res' }, g, 'H(381) = 2: o resumo é o último estado da cadeia');
    if (k >= 4) S('text', { x: 20, y: 262, class: 'cd-res cd-resmal' }, g, `quem vê o 2 calcula H(3815) = ${fim} sem saber o começo`);
  }
  new StepFig(root, {
    speed: 2400,
    notes: [
      'A cadeia começa no valor inicial IV = 0, fixo e público. Cada dígito de 381 é um bloco.',
      'Entra o bloco 3: f(0, 3) = 3·0 + 3 = 3. O estado agora é 3.',
      'Entra o 8: f(3, 8) = 3·3 + 8 = 17 = 1·10 + 7. Guarde só o resto: estado 7.',
      'Entra o 1: f(7, 1) = 3·7 + 1 = 22 = 2·10 + 2. Acabaram os blocos: H(381) = 2, o último estado.',
      'O perigo: o resumo publicado é o estado da cadeia. Quem vê o 2 põe mais um bloco e continua: f(2, 5) = 11 → 1. É o ataque da seção <a href="#extensao">pôr a chave na frente</a>.',
    ],
    render: quadro,
  });
})();

/* ============ Fig 3: HMAC de brinquedo, K1 = 4, K2 = 6, M = 25 (slides 59 e 60) ============ */
(function () {
  const root = document.getElementById('fig-hmac');
  if (!root) return;
  const svg = document.getElementById('hm-svg');
  function quadro(k) {
    svg.innerHTML = '';
    pontaSeta(svg);
    const g = S('g', {}, svg);
    const mal = k >= 6;
    const M = mal ? [3, 1] : [2, 5];
    S('text', { x: 20, y: 18, class: 'cd-tit' + (mal ? ' cd-resmal' : '') }, g, mal ? 'Mallory troca 25 por 31 e mantém a etiqueta 5' : 'HMAC(K, 25) = H(K2 ‖ H(K1 ‖ 25)), K1 = 4, K2 = 6');
    const ateDentro = mal ? 3 : Math.min(k + 1, 3);
    const dentro = cadeia(g, 20, 124, 0, [4, ...M], ateDentro, { ivLab: 'IV' });
    S('text', { x: 492, y: 116, class: 'cd-lab cd-esq' }, g, 'dentro: H(4 ‖ ' + M.join('') + ')');
    if (ateDentro === 3) S('text', { x: 492, y: 136, class: 'cd-lab cd-esq' }, g, `= ${dentro}, nunca publicado`);
    if (k >= 3) {
      const fora = cadeia(g, 20, 288, 0, [6, dentro], mal ? 2 : Math.min(k - 2, 2), { ivLab: 'IV' });
      S('text', { x: 356, y: 280, class: 'cd-lab cd-esq' }, g, `fora: H(6 ‖ ${dentro})`);
      if (k >= 4 && !mal) S('text', { x: 356, y: 302, class: 'cd-res' }, g, k === 5 ? 'Bob refaz, dá 5: aceita' : 'etiqueta = 5');
      if (mal) S('text', { x: 356, y: 302, class: 'cd-res cd-resmal' }, g, `${fora} ≠ 5: o Bob rejeita`);
    }
  }
  new StepFig(root, {
    speed: 2400,
    notes: [
      'Passada de dentro: a chave K1 = 4 vem na frente da mensagem 25. Entra o bloco 4: estado 4.',
      'Entra o 2: 3·4 + 2 = 14 = 1·10 + 4. Estado 4.',
      'Entra o 5: 3·4 + 5 = 17 = 1·10 + 7. O resumo de dentro é 7, e ele nunca é publicado.',
      'Passada de fora: agora a chave K2 = 6 vem na frente do 7. Entra o 6: estado 6.',
      'Entra o 7: 3·6 + 7 = 25 = 2·10 + 5. A etiqueta é 5. A Alice manda 25 e a etiqueta 5.',
      'O Bob, que tem K, refaz as duas passadas sobre o 25 que chegou e obtém 5: aceita.',
      'O Mallory troca 25 por 31. O Bob refaz: H(431) = 6 e H(66) = 4, que não é 5. Rejeita. Para acertar a etiqueta, o Mallory precisaria de K1 e K2.',
    ],
    render: quadro,
  });
})();

/* ============ Fig 4: o SHA-512 por dentro, com a mensagem "abc" (Stallings §11.5) ============ */
(function () {
  const root = document.getElementById('fig-sha');
  if (!root) return;
  const svg = document.getElementById('sha-svg');
  const r = sha512(enc.encode('abc'));
  const B = r.rastro[0];
  const NOMES = 'abcdefgh'.split('');
  const fmt = (x) => { const s = hex16(x); return s.slice(0, 8) + ' ' + s.slice(8); };
  function regs(g, x, y, vals, novos, titulo) {
    S('text', { x, y: y - 14, class: 'sh-th' }, g, titulo);
    vals.forEach((v, i) => {
      const yy = y + i * 26;
      const novo = novos.includes(i);
      S('rect', { x: x - 4, y: yy - 11, width: 210, height: 22, rx: 5, class: novo ? 'sh-novo' : 'sh-cx' }, g);
      S('text', { x: x + 6, y: yy, class: 'sh-nome' }, g, NOMES[i]);
      S('text', { x: x + 28, y: yy, class: 'sh-val' }, g, fmt(v));
    });
  }
  function caixa(g, x, y, linhas) {
    linhas.forEach((l, i) => S('text', { x, y: y + i * 22, class: l.startsWith('=') ? 'sh-val sh-dest' : 'sh-txt' }, g, l));
  }
  function quadro(k) {
    svg.innerHTML = '';
    const g = S('g', {}, svg);
    if (k === 0) {
      S('text', { x: 20, y: 30, class: 'sh-th' }, g, 'mensagem "abc" = 24 bits (a = 0x61, b = 0x62, c = 0x63)');
      const segs = [['24', 'abc', 'sh-novo', 60], ['1', '1', 'sh-am', 26], ['871 zeros', '0…0', 'sh-cx', 380], ['128 bits: tamanho = 24', '…011000', 'sh-am', 134]];
      let x = 20;
      segs.forEach(([lab, txt, cls, w]) => {
        S('rect', { x, y: 60, width: w, height: 40, rx: 4, class: cls }, g);
        S('text', { x: x + w / 2, y: 80, class: 'sh-mid' }, g, txt);
        S('text', { x: x + w / 2, y: 118, class: 'sh-lab' }, g, lab);
        x += w;
      });
      caixa(g, 20, 170, ['24 + 1 + 871 = 896: sobram exatamente 128 bits do bloco, o lugar do tamanho', '896 + 128 = 1.024 bits: um bloco só, M₁', 'O bloco é lido como 16 palavras de 64 bits, W₀ a W₁₅.']);
      return;
    }
    if (k === 1) {
      S('text', { x: 20, y: 26, class: 'sh-th' }, g, 'as 16 palavras do bloco (hexadecimal, 64 bits cada)');
      for (let t = 0; t < 16; t++) {
        const col = t < 8 ? 0 : 1, lin = t % 8;
        const x = 20 + col * 300, y = 58 + lin * 28;
        S('text', { x, y, class: 'sh-nome' }, g, `W${String(t).padStart(2, '0')}`);
        S('rect', { x: x + 40, y: y - 11, width: 200, height: 22, rx: 5, class: t === 0 || t === 15 ? 'sh-novo' : 'sh-cx' }, g);
        S('text', { x: x + 50, y, class: 'sh-val' }, g, fmt(B.W[t]));
      }
      caixa(g, 20, 300, ['W₀ começa com 61 62 63 80: as letras e o bit 1. W₁₅ = 18 em hexa = 24, o tamanho.']);
      return;
    }
    if (k === 2) {
      regs(g, 20, 50, IV, [], 'buffer inicial H₀ (a … h)');
      caixa(g, 270, 50, ['Cada registrador tem 64 bits: 8 × 64 = 512.', '', 'Os valores são os 64 primeiros bits da', 'parte fracionária da raiz quadrada', 'dos 8 primeiros primos:', '√2 = 1,6a09e667f3bcc908… → a', '√3 = 1,bb67ae8584caa73b… → b', '… até √19 → h']);
      return;
    }
    if (k === 3) {
      const R = B.rodadas[0];
      regs(g, 20, 50, IV, [0, 4], 'entrada da rodada 1');
      caixa(g, 260, 40, [
        'T1 = h + Ch(e, f, g) + Σ1(e) + W₀ + K₀',
        '= ' + fmt(R.T1),
        'T2 = Σ0(a) + Maj(a, b, c)',
        '= ' + fmt(R.T2),
        '',
        'toda soma é módulo 2⁶⁴',
        'Ch: onde e tem 1, pega f; onde tem 0, pega g',
        'Maj: o bit que aparece em 2 dos 3',
        'Σ: XOR de três rotações da palavra',
      ]);
      return;
    }
    if (k === 4 || k === 5 || k === 6) {
      const t = k === 4 ? 0 : k === 5 ? 1 : 79;
      const antes = t === 0 ? IV : B.rodadas[t - 1].regs;
      regs(g, 20, 50, antes, [], t === 0 ? 'antes (H₀)' : `antes da rodada ${t + 1}`);
      regs(g, 330, 50, B.rodadas[t].regs, [0, 4], `depois da rodada ${t + 1}`);
      for (let i = 0; i < 8; i++) {
        if (i === 3 || i === 7) continue;
        S('line', { x1: 232, y1: 50 + i * 26, x2: 322, y2: 50 + (i + 1) * 26, class: 'sh-seta' }, g);
      }
      caixa(g, 20, 280, ['a = T1 + T2 e e = d + T1 são novos; os outros seis só descem uma casa (b = a, c = b, …).', t === 79 ? 'Isto depois de 80 rodadas, cada uma com o seu Wₜ e o seu Kₜ.' : '']);
      return;
    }
    regs(g, 20, 50, B.rodadas[79].regs, [], 'saída da rodada 80');
    regs(g, 330, 50, B.H, [0, 1, 2, 3, 4, 5, 6, 7], 'H₁ = H₀ + saída (palavra a palavra)');
    caixa(g, 20, 280, ['Um bloco só: H₁ é o resumo. Leia as 8 palavras em sequência:', r.hex.slice(0, 64), r.hex.slice(64)]);
  }
  new StepFig(root, {
    speed: 3200,
    notes: [
      'A mensagem "abc" tem 24 bits. O <b>preenchimento</b> põe um bit 1, 871 zeros e o tamanho (24) em 128 bits: fecha um bloco de 1.024 bits.',
      'O bloco vira 16 palavras de 64 bits. As outras 64 palavras, W₁₆ a W₇₉, saem destas (seção da <a href="#sha512">rodada</a>).',
      'O buffer começa com H₀: oito palavras tiradas das raízes quadradas dos 8 primeiros primos. Ninguém escolheu esses números a dedo.',
      'Rodada 1: calcula T1 (mistura e, f, g, h, a palavra W₀ e a constante K₀) e T2 (mistura a, b, c).',
      'Depois da rodada 1: só a e e mudam de verdade. Os outros seis descem uma posição. Repare no 6a09… que era a e agora é b.',
      'A rodada 2 faz o mesmo com W₁ e K₁. O f6af… que acabou de nascer em a já desceu para b.',
      'Depois de 80 rodadas, nenhum registrador lembra o começo: cada bit da entrada já mexeu em todos.',
      'Por fim, soma a saída com o H₀ de entrada. Com um bloco só, H₁ é o resumo de "abc": ddaf35a1… O mesmo valor do exemplo do livro.',
    ],
    render: quadro,
  });
})();

/* ============ Widget: efeito avalanche (CASA × CASC, slide 13) ============ */
(function () {
  const root = document.getElementById('avalanche');
  if (!root) return;
  const a = document.getElementById('av-a'), b = document.getElementById('av-b'), alg = document.getElementById('av-alg');
  const saida = document.getElementById('av-saida'), grade = document.getElementById('av-grade');
  const bits = (hex) => hex.split('').map((c) => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
  async function resumo(txt, nome) {
    const dados = enc.encode(txt);
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest(nome, dados);
      return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
    }
    return nome === 'SHA-512' ? sha512(dados).hex : null;
  }
  async function atualizar() {
    const nome = alg.value;
    const [ha, hb] = await Promise.all([resumo(a.value, nome), resumo(b.value, nome)]);
    if (!ha || !hb) { saida.innerHTML = '<p class="muted">Este navegador não calcula o resumo aqui (precisa de https).</p>'; grade.innerHTML = ''; return; }
    const ba = bits(ha), bb = bits(hb);
    let dif = 0;
    for (let i = 0; i < ba.length; i++) if (ba[i] !== bb[i]) dif++;
    const marca = (h, o) => h.split('').map((c, i) => (c === o[i] ? esc(c) : `<mark>${esc(c)}</mark>`)).join('');
    saida.innerHTML = `<div class="av-hex">${marca(ha, hb)}</div><div class="av-hex">${marca(hb, ha)}</div>` +
      `<p><span class="resp">${dif} de ${ba.length} bits mudaram (${Math.round((100 * dif) / ba.length)}%).</span> ` +
      `<span class="muted">${ha.length} dígitos hexadecimais, ${ba.length / 8} bytes. Dígitos destacados: diferentes nos dois.</span></p>`;
    grade.innerHTML = '';
    for (let i = 0; i < ba.length; i++) grade.appendChild(H('span', { class: ba[i] !== bb[i] ? 'av-b av-dif' : 'av-b' }));
  }
  [a, b, alg].forEach((el) => el.addEventListener('input', atualizar));
  atualizar();
})();

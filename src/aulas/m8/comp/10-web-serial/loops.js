import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, clamp01, fatia } from '../../../../lib/loop.js';

/* Animações em loop da aula 07. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). */
const montar = {};

/* O quadro 8N1 de "A" (0x41) passando pelo fio: o receptor junta os bits, do menos significativo para o mais */
montar.quadro = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 130');
  const V = [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1]; /* repouso, start, b0…b7, stop, repouso */
  const ROT = ['', 'st', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'sp', ''];
  const x0 = 12, w = 18, alto = 34, baixo = 62;
  const y = (v) => (v ? alto : baixo);
  let d = `M${x0},${y(V[0])}`;
  V.forEach((v, i) => { d += ` V${y(v)} H${x0 + (i + 1) * w}`; });
  ROT.forEach((r, i) => { if (r) S('text', { class: 'tm', x: x0 + i * w + w / 2, y: 18 }, svg, r); });
  S('rect', { class: 'am', x: x0 + w, y: 26, width: w, height: 44, style: 'opacity:.35;stroke:none' }, svg);
  S('rect', { class: 'am', x: x0 + 10 * w, y: 26, width: w, height: 44, style: 'opacity:.35;stroke:none' }, svg);
  S('path', { class: 'ac', d }, svg);
  const valores = V.map((v, i) => S('text', { class: 'tm', x: x0 + i * w + w / 2, y: 80 }, svg, i === 0 || i === 11 ? '' : String(v)));
  const cursor = S('line', { class: 's', x1: x0, y1: 26, x2: x0, y2: 72, style: 'stroke:var(--accent);stroke-width:2' }, svg);
  S('text', { class: 'tm st', x: 6, y: 100 }, svg, 'recebido:');
  const rec = S('text', { class: 'st', x: 70, y: 100 }, svg, '');
  const fim = S('text', { class: 'ta', x: 120, y: 120 }, svg, '');
  return (t) => {
    const p = clamp01(t / 0.82);
    const x = x0 + p * V.length * w;
    cursor.setAttribute('x1', x); cursor.setAttribute('x2', x);
    const passou = Math.floor(p * V.length); /* células já lidas */
    valores.forEach((el, i) => { el.style.fill = i < passou ? 'var(--fg)' : 'var(--muted)'; el.style.fontWeight = i < passou ? '600' : '400'; });
    /* b0 está na célula 2, b7 na 9; o byte se escreve do b7 para o b0 */
    const bits = [];
    for (let j = 7; j >= 0; j--) bits.push(passou > 2 + j ? String(V[2 + j]) : '·');
    rec.textContent = bits.slice(0, 4).join('') + ' ' + bits.slice(4).join('');
    fim.textContent = t >= 0.82 ? '= 0x41 = "A"' : '';
  };
};

/* Duas linhas chegando em três chunks: o resto espera, cada "\n" solta uma linha */
montar.chunks = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 150');
  const CH = ['T=2', '3⏎T=2', '4⏎'];
  const DEPOIS = [
    { resto: 'T=2', linhas: [] },
    { resto: 'T=2', linhas: ['T=23'] },
    { resto: '', linhas: ['T=23', 'T=24'] },
  ];
  S('text', { class: 'tm st', x: 4, y: 10 }, svg, 'chega um chunk');
  S('text', { class: 'tm st', x: 4, y: 62 }, svg, 'resto (sem "\\n")');
  S('text', { class: 'tm st', x: 4, y: 104 }, svg, 'linhas prontas');
  const g = S('g', null, svg);
  const caixa = S('rect', { class: 'bl', y: 20, height: 24, rx: 4 }, g);
  const rot = S('text', { y: 32 }, g, '');
  const resto = S('rect', { class: 'am', x: 4, y: 72, height: 22, rx: 4 }, svg);
  const restoT = S('text', { class: 'st', x: 12, y: 83 }, svg, '');
  const linhas = [0, 1].map((i) => {
    const r = S('rect', { class: 'gr', x: 4 + i * 84, y: 114, width: 76, height: 24, rx: 4 }, svg);
    const tx = S('text', { x: 42 + i * 84, y: 126 }, svg, '');
    return { r, tx };
  });
  return (t) => {
    const [k, q] = fatia(t, 4);
    const largura = (s) => 18 + s.length * 8.5;
    /* estado mostrado: o de antes do chunk k até ele pousar, depois o de depois */
    let estado = { resto: '', linhas: [] };
    if (k < 3) {
      const pousou = q > 0.45;
      if (k > 0) estado = DEPOIS[k - 1];
      if (pousou) estado = DEPOIS[k];
      const s = CH[k], wd = largura(s);
      const x = lerp(-wd, 118 - wd / 2, ease(clamp01(q / 0.4)));
      caixa.setAttribute('x', x); caixa.setAttribute('width', wd);
      rot.setAttribute('x', x + wd / 2); rot.textContent = s;
      g.style.opacity = pousou ? String(1 - clamp01((q - 0.45) / 0.35) * 0.6) : '1';
    } else {
      estado = DEPOIS[2];
      g.style.opacity = '0';
    }
    const some = k === 3 ? clamp01((q - 0.6) / 0.35) : 0;
    resto.setAttribute('width', estado.resto ? largura(estado.resto) : 60);
    resto.style.opacity = estado.resto ? '1' : '.35';
    restoT.textContent = estado.resto || '(vazio)';
    linhas.forEach((l, i) => {
      const s = estado.linhas[i];
      l.r.style.opacity = s ? String(1 - some) : '0';
      l.tx.style.opacity = s ? String(1 - some) : '0';
      l.tx.textContent = s || '';
    });
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

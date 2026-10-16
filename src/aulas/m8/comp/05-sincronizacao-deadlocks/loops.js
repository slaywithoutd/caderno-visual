import { S } from '../../../../lib/dom.js';
import { loop, ease, lerp, fatia, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula 05. Cada uma é montada num <aside data-loop="nome"> e
   redesenhada só a partir de t ∈ [0,1), para o fim emendar no começo. */
const montar = {};

/* espera ocupada × bloqueio: a trava abre em t = 0.62; antes disso, uma gira e a outra dorme */
montar.espera = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 200');
  const faixa = (y, rot) => {
    S('text', { class: 'tm st', x: 4, y: y + 6 }, svg, rot);
    S('line', { class: 's', x1: 4, y1: y + 84, x2: 236, y2: y + 84, 'stroke-dasharray': '2 4' }, svg);
  };
  faixa(0, 'busy waiting'); faixa(100, 'bloqueio (semáforo)');
  const trava = [30, 130].map((y) => {
    const r = S('rect', { class: 'rd', x: 176, y: y - 18, width: 52, height: 40, rx: 6 }, svg);
    const t = S('text', { class: 'tm', x: 202, y: y + 2 }, svg, 'lock');
    return { r, t };
  });
  /* thread que gira */
  const g1 = S('g', null, svg);
  S('circle', { class: 'bl', cx: 0, cy: 0, r: 13 }, g1); S('text', { x: 0, y: 0 }, g1, 'A');
  const orb = S('circle', { r: 3.5, style: 'fill:var(--blue)' }, svg);
  /* thread que dorme */
  S('rect', { class: 'k', x: 34, y: 112, width: 60, height: 36, rx: 6, 'stroke-dasharray': '3 3' }, svg);
  S('text', { class: 'tm', x: 64, y: 160 }, svg, 'fila');
  const g2 = S('g', null, svg);
  const c2 = S('circle', { class: 'k', cx: 0, cy: 0, r: 13 }, g2); S('text', { x: 0, y: 0 }, g2, 'B');
  const zz = S('text', { class: 'tm', x: 0, y: 0 }, svg, 'z z');
  /* medidores de CPU */
  const cpu = [64, 164].map((y) => {
    S('rect', { class: 'k', x: 20, y: y + 2, width: 100, height: 8, rx: 3 }, svg);
    const b = S('rect', { x: 20, y: y + 2, width: 0, height: 8, rx: 3 }, svg);
    const t = S('text', { class: 'tm st', x: 126, y: y + 6 }, svg, '');
    return { b, t };
  });
  return (t) => {
    const abre = t >= 0.62, pa = ease(clamp01((t - 0.62) / 0.12)), sai = clamp01((t - 0.9) / 0.1);
    trava.forEach(({ r, t: tx }) => { r.setAttribute('class', abre ? 'gr' : 'rd'); tx.textContent = abre ? 'livre' : 'com C'; });
    /* A gira em volta do ponto até a trava abrir, depois entra */
    const ax = lerp(64, 202, pa), ay = 30;
    g1.setAttribute('transform', `translate(${ax},${ay})`);
    g1.style.opacity = 1 - sai;
    const ang = t * Math.PI * 2 * 14;
    orb.setAttribute('cx', ax + Math.cos(ang) * 20); orb.setAttribute('cy', ay + Math.sin(ang) * 20);
    orb.style.opacity = abre ? 0 : 1;
    /* B dorme na fila e é acordado pelo V */
    const bx = lerp(64, 202, pa), by = lerp(130, 130, pa);
    g2.setAttribute('transform', `translate(${bx},${by})`);
    g2.style.opacity = 1 - sai;
    c2.setAttribute('class', abre ? 'bl' : 'k');
    zz.setAttribute('x', 64 + 22); zz.setAttribute('y', 116 - 4 * Math.sin(t * 40));
    zz.style.opacity = abre ? 0 : 1;
    cpu[0].b.setAttribute('width', abre ? 30 : 100); cpu[0].b.setAttribute('style', `fill:var(--${abre ? 'blue' : 'red'})`);
    cpu[0].t.textContent = abre ? 'trabalho útil' : 'CPU 100% à toa';
    cpu[1].b.setAttribute('width', abre ? 30 : 0); cpu[1].b.setAttribute('style', 'fill:var(--blue)');
    cpu[1].t.textContent = abre ? 'trabalho útil' : 'CPU livre p/ outros';
  };
};

/* semáforo contador como placar de estacionamento: 3 vagas, 4 carros */
montar.estacionamento = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 200');
  S('rect', { class: 'k', x: 108, y: 18, width: 128, height: 96, rx: 8 }, svg);
  const VAGA = [[130, 66], [172, 66], [214, 66]];
  VAGA.forEach(([x, y]) => S('rect', { class: 's', x: x - 15, y: y - 26, width: 30, height: 52, rx: 3, 'stroke-dasharray': '3 3' }, svg));
  S('line', { class: 's', x1: 0, y1: 150, x2: 240, y2: 150 }, svg);
  S('line', { class: 's', x1: 0, y1: 176, x2: 240, y2: 176 }, svg);
  const cancela = S('line', { x1: 98, y1: 140, x2: 98, y2: 186, style: 'stroke-width:4;stroke-linecap:round' }, svg);
  const placarR = S('rect', { x: 8, y: 18, width: 86, height: 48, rx: 8 }, svg);
  S('text', { class: 'tm', x: 51, y: 30 }, svg, 'placar');
  const placar = S('text', { x: 51, y: 50, style: 'font-size:17px;font-weight:600' }, svg, '');
  const msg = S('text', { class: 'tm', x: 120, y: 196 }, svg, '');
  const P = { fora: [-30, 163, 0], fila: [64, 163, 1], v0: [...VAGA[0], 1], v1: [...VAGA[1], 1], v2: [...VAGA[2], 1], saiu: [270, 163, 0] };
  const cores = ['blue', 'amber', 'green', 'red'];
  const carros = cores.map((c, i) => {
    const g = S('g', null, svg);
    S('rect', { class: { blue: 'bl', amber: 'am', green: 'gr', red: 'rd' }[c], x: -12, y: -9, width: 24, height: 18, rx: 4 }, g);
    S('text', { x: 0, y: 0, style: 'font-size:10px' }, g, 'c' + (i + 1));
    return g;
  });
  /* [posição de cada carro, valor do semáforo, mensagem] */
  const E = [
    [['fora', 'fora', 'fora', 'fora'], 3, 's = 3: três vagas'],
    [['v0', 'fora', 'fora', 'fora'], 2, 'c1 faz P: s = 2'],
    [['v0', 'v1', 'fora', 'fora'], 1, 'c2 faz P: s = 1'],
    [['v0', 'v1', 'v2', 'fora'], 0, 'c3 faz P: s = 0'],
    [['v0', 'v1', 'v2', 'fila'], 0, 'c4 faz P com s = 0: espera'],
    [['saiu', 'v1', 'v2', 'v0'], 0, 'c1 faz V: acorda c4'],
    [['saiu', 'saiu', 'v2', 'v0'], 1, 'c2 faz V: s = 1'],
    [['saiu', 'saiu', 'saiu', 'v0'], 2, 'c3 faz V: s = 2'],
    [['saiu', 'saiu', 'saiu', 'saiu'], 3, 'c4 faz V: s = 3'],
    [['saiu', 'saiu', 'saiu', 'saiu'], 3, 's = 3: três vagas']
  ];
  return (t) => {
    const [k, p] = fatia(t, E.length);
    const a = E[k], b = E[(k + 1) % E.length], q = ease(clamp01((p - 0.35) / 0.55));
    carros.forEach((g, i) => {
      const pa = P[a[0][i]], pb = P[b[0][i]];
      const viraFora = b[0][i] === 'fora' && a[0][i] === 'saiu';
      const x = viraFora ? pb[0] : lerp(pa[0], pb[0], q), y = viraFora ? pb[1] : lerp(pa[1], pb[1], q);
      const o = viraFora ? 0 : lerp(pa[2], pb[2], q);
      const vert = (a[0][i][0] === 'v' && q < 0.5) || (b[0][i][0] === 'v' && q >= 0.5);
      g.setAttribute('transform', `translate(${x},${y}) rotate(${vert ? 90 : 0})`);
      g.style.opacity = o;
    });
    const atual = q > 0.5 ? b : a;
    placar.textContent = 's = ' + atual[1];
    placarR.setAttribute('class', atual[1] === 0 ? 'rd' : 'gr');
    cancela.style.stroke = atual[1] === 0 ? 'var(--red)' : 'var(--green)';
    msg.textContent = atual[2];
  };
};

/* buffer circular de 8 posições: 16 itens passam; o produtor espera quando enche */
montar.buffer = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 210');
  const N = 8, cx = 120, cy = 100, R = 62;
  const slots = [...Array(N)].map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / N, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    const r = S('rect', { class: 'k', x: x - 15, y: y - 13, width: 30, height: 26, rx: 5 }, svg);
    const t = S('text', { x, y, style: 'font-size:11px' }, svg, '');
    return { r, t };
  });
  const pE = S('line', { x1: cx, y1: cy, x2: cx, y2: cy, style: 'stroke:var(--blue);stroke-width:2.5', 'marker-end': 'url(#mnarrow)' }, svg);
  const pS = S('line', { x1: cx, y1: cy, x2: cx, y2: cy, style: 'stroke:var(--amber);stroke-width:2.5', 'marker-end': 'url(#mnarrow)' }, svg);
  S('circle', { class: 'k', cx, cy, r: 4 }, svg);
  S('text', { class: 'tb', x: 34, y: 8 }, svg, '→ entra');
  S('text', { class: 'tam', x: 206, y: 8 }, svg, '→ sai');
  const cont = S('text', { class: 'tm', x: 120, y: 184 }, svg, '');
  const est = S('text', { x: 120, y: 202, style: 'font-size:11px' }, svg, '');
  const rampa = (t, a, b, de, ate) => (t <= a ? de : t >= b ? ate : de + (ate - de) * (t - a) / (b - a));
  return (t) => {
    let cons = Math.floor(t < 0.6 ? rampa(t, 0.08, 0.25, 0, 2) : rampa(t, 0.6, 0.95, 2, 16));
    let prod = Math.floor(t < 0.6 ? rampa(t, 0, 0.5, 0, 10) : rampa(t, 0.6, 0.8, 10, 16));
    prod = Math.min(prod, cons + N); cons = Math.min(cons, prod);
    slots.forEach(({ r, t: tx }, j) => {
      let it = null;
      for (let i = cons; i < prod; i++) if (i % N === j) it = i;
      r.setAttribute('class', it === null ? 'k' : 'bl');
      tx.textContent = it === null ? '' : '#' + (it + 1);
    });
    const ang = (i) => -Math.PI / 2 + ((i % N) * 2 * Math.PI) / N;
    const ponta = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
    const [ex, ey] = ponta(prod, 40), [sx, sy] = ponta(cons, 40);
    pE.setAttribute('x2', ex); pE.setAttribute('y2', ey);
    pS.setAttribute('x2', sx); pS.setAttribute('y2', sy);
    const ch = prod - cons;
    cont.textContent = `cheio = ${ch}   vazio = ${N - ch}`;
    est.textContent = ch === N ? 'cheio: produtor dorme em P(vazio)' : ch === 0 ? 'vazio: consumidor dorme em P(cheio)' : '';
    est.style.fill = ch === N || ch === 0 ? 'var(--red)' : '';
  };
};

/* jantar dos filósofos: primeiro o deadlock, depois dois comendo por vez */
montar.filosofos = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 210');
  const cx = 120, cy = 100;
  S('circle', { class: 'k', cx, cy, r: 42 }, svg);
  const ang = (g) => (g * Math.PI) / 180;
  const fil = [...Array(5)].map((_, i) => {
    const a = ang(-90 + 72 * i), x = cx + 74 * Math.cos(a), y = cy + 74 * Math.sin(a);
    const c = S('circle', { class: 'k', cx: x, cy: y, r: 15 }, svg);
    S('text', { x, y, style: 'font-size:11px' }, svg, 'F' + (i + 1));
    return { c, x, y };
  });
  /* garfo i fica entre o filósofo i e o i+1 */
  const garfos = [...Array(5)].map((_, i) => {
    const a = ang(-90 + 72 * i + 36), x = cx + 50 * Math.cos(a), y = cy + 50 * Math.sin(a);
    const l = S('line', { style: 'stroke:var(--fg2);stroke-width:3;stroke-linecap:round' }, svg);
    return { l, x, y, a };
  });
  const msg = S('text', { class: 'tm', x: 120, y: 200 }, svg, '');
  const anel = S('circle', { cx, cy, r: 28, style: 'fill:none;stroke:var(--red);stroke-width:2;stroke-dasharray:5 4' }, svg);
  const PARES = [[0, 2], [1, 3], [2, 4], [3, 0], [4, 1]];
  return (t) => {
    const dono = Array(5).fill(null), estado = Array(5).fill('pensa');
    let txt = '';
    if (t < 0.45) {
      const q = ease(clamp01((t - 0.04) / 0.12));
      for (let i = 0; i < 5; i++) { if (q > 0) dono[i] = [i, q]; }
      if (t > 0.18) { for (let i = 0; i < 5; i++) estado[i] = 'trava'; txt = 'cada um com 1 garfo: deadlock'; }
      else txt = 'todos pegam o garfo da esquerda…';
    } else if (t < 0.5) {
      txt = 'agora com uma regra de ordem';
    } else {
      const [k, p] = fatia((t - 0.5) / 0.5, PARES.length);
      const q = ease(clamp01(p / 0.25)) * (1 - ease(clamp01((p - 0.8) / 0.2)));
      for (const f of PARES[k]) {
        estado[f] = 'come';
        dono[f] = [f, q];
        dono[(f + 4) % 5] = [f, q];
      }
      txt = `F${PARES[k][0] + 1} e F${PARES[k][1] + 1} comem`;
    }
    garfos.forEach((g, i) => {
      let x = g.x, y = g.y;
      if (dono[i]) { const [f, q] = dono[i]; x = lerp(g.x, (g.x + fil[f].x) / 2, q); y = lerp(g.y, (g.y + fil[f].y) / 2, q); }
      const dx = 9 * Math.cos(g.a), dy = 9 * Math.sin(g.a);
      g.l.setAttribute('x1', x - dx); g.l.setAttribute('y1', y - dy); g.l.setAttribute('x2', x + dx); g.l.setAttribute('y2', y + dy);
    });
    fil.forEach((f, i) => f.c.setAttribute('class', estado[i] === 'trava' ? 'rd' : estado[i] === 'come' ? 'gr' : 'k'));
    anel.style.opacity = t > 0.18 && t < 0.45 ? 0.5 + 0.5 * Math.sin(t * 60) : 0;
    msg.textContent = txt;
  };
};

/* cruzamento travado: cada carro ocupa o quadrante de que o próximo precisa */
montar.cruzamento = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 200');
  S('rect', { x: 0, y: 78, width: 240, height: 44, style: 'fill:var(--surface2)' }, svg);
  S('rect', { x: 98, y: 0, width: 44, height: 200, style: 'fill:var(--surface2)' }, svg);
  S('line', { class: 's', x1: 0, y1: 100, x2: 240, y2: 100, 'stroke-dasharray': '6 6' }, svg);
  S('line', { class: 's', x1: 120, y1: 0, x2: 120, y2: 200, 'stroke-dasharray': '6 6' }, svg);
  /* [classe, rótulo, de, até (quadrante), vertical?] */
  const C = [
    ['bl', 'A', [109, -20], [109, 89], true],
    ['am', 'B', [-20, 111], [109, 111], false],
    ['gr', 'C', [131, 220], [131, 111], true],
    ['rd', 'D', [260, 89], [131, 89], false]
  ];
  const carros = C.map(([cl, r, , , v]) => {
    const g = S('g', null, svg);
    S('rect', { class: cl, x: v ? -8 : -12, y: v ? -12 : -8, width: v ? 16 : 24, height: v ? 24 : 16, rx: 3 }, g);
    S('text', { x: 0, y: 0, style: 'font-size:10px' }, g, r);
    return g;
  });
  const ciclo = S('path', { d: 'M120 64 A36 36 0 1 0 156 100', style: 'fill:none;stroke:var(--red);stroke-width:2.2', 'marker-end': 'url(#mnarrow)' }, svg);
  const msg = S('text', { class: 'tm', x: 120, y: 194 }, svg, '');
  return (t) => {
    const q = ease(clamp01(t / 0.35)), some = clamp01((t - 0.9) / 0.1);
    C.forEach(([, , de, ate], i) => {
      const qi = ease(clamp01((t - i * 0.04) / 0.35));
      carros[i].setAttribute('transform', `translate(${lerp(de[0], ate[0], qi)},${lerp(de[1], ate[1], qi)})`);
      carros[i].style.opacity = 1 - some;
    });
    const trav = t > 0.42 && t < 0.9;
    ciclo.style.opacity = trav ? 0.55 + 0.45 * Math.sin(t * 50) : 0;
    msg.textContent = q < 1 ? 'quatro carros entram juntos…' : trav ? 'cada um espera o da frente: espera circular' : '';
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

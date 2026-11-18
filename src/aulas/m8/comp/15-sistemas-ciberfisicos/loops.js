import { S } from '../../../../lib/dom.js';
import { loop, ease, clamp01 } from '../../../../lib/loop.js';

/* Animações em loop da aula 15. Cada uma é montada num <aside data-loop="nome"> do consulta.html
   e redesenhada a partir de t ∈ [0,1). */
const montar = {};

/* O ciclo de um CPS: sensor mede → computador decide → atuador age → o mundo muda → sensor mede de novo */
montar.ciclo = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 132');
  const NOS = [
    { x: 120, y: 18, rot: 'decide', sub: 'camada cyber' },
    { x: 206, y: 74, rot: 'atuador', sub: 'LED, motor' },
    { x: 120, y: 116, rot: 'mundo', sub: 'camada física' },
    { x: 34, y: 74, rot: 'sensor', sub: 'botão, luz' },
  ];
  const caixas = NOS.map((n) => {
    const r = S('rect', { class: 'k', x: n.x - 32, y: n.y - 13, width: 64, height: 26, rx: 5 }, svg);
    S('text', { x: n.x, y: n.y - 2 }, svg, n.rot);
    S('text', { class: 'tm', x: n.x, y: n.y + 8, style: 'font-size:8px' }, svg, n.sub);
    return r;
  });
  /* arcos entre os nós, no sentido horário */
  const arco = (a, b) => S('path', { class: 's', d: `M${a.x},${a.y} Q${(a.x + b.x) / 2 + (b.y - a.y) * 0.25},${(a.y + b.y) / 2 - (b.x - a.x) * 0.25} ${b.x},${b.y}`, style: 'fill:none;stroke-dasharray:3 3;opacity:.6' }, svg);
  const caminhos = NOS.map((n, i) => arco(n, NOS[(i + 1) % 4]));
  caminhos.forEach((c) => svg.insertBefore(c, svg.firstChild));
  const ponto = S('circle', { r: 5, style: 'fill:var(--accent)' }, svg);
  return (t) => {
    const fase = t * 4;
    const i = Math.floor(fase) % 4;
    const q = ease(clamp01((fase - Math.floor(fase)) / 0.8));
    const c = caminhos[i];
    const L = c.getTotalLength();
    const pt = c.getPointAtLength(q * L);
    ponto.setAttribute('cx', pt.x);
    ponto.setAttribute('cy', pt.y);
    caixas.forEach((r, j) => r.setAttribute('class', j === (q >= 1 ? (i + 1) % 4 : i) ? 'acf' : 'k'));
  };
};

/* PWM: o pino só liga e desliga; o duty cycle decide o brilho */
montar.pwm = (svg) => {
  svg.setAttribute('viewBox', '0 0 240 132');
  S('text', { class: 'tm st', x: 4, y: 10 }, svg, '5 V');
  S('text', { class: 'tm st', x: 4, y: 52 }, svg, '0 V');
  const onda = S('path', { class: 'ac', style: 'fill:none' }, svg);
  const led = S('circle', { cx: 40, cy: 98, r: 16, style: 'fill:var(--amber);stroke:var(--amber)' }, svg);
  S('circle', { cx: 40, cy: 98, r: 16, style: 'fill:none;stroke:var(--line2)' }, svg);
  const rot = S('text', { class: 'st', x: 70, y: 92 }, svg, '');
  const cod = S('text', { class: 'tm st', x: 70, y: 110 }, svg, '');
  const X0 = 28, W = 208, PER = 4;
  return (t) => {
    const duty = 0.5 - 0.42 * Math.cos(2 * Math.PI * t); /* de 8% a 92% e de volta */
    const p = W / PER;
    let d = `M${X0},48`;
    for (let k = 0; k < PER; k++) {
      const x = X0 + k * p;
      d += ` V14 H${x + duty * p} V48 H${x + p}`;
    }
    onda.setAttribute('d', d);
    led.style.opacity = String(0.08 + 0.92 * duty);
    rot.textContent = `duty ${Math.round(duty * 100)}%`;
    cod.textContent = `analogWrite(5, ${Math.round(duty * 255)})`;
  };
};

document.querySelectorAll('[data-loop]').forEach((el) => {
  const f = montar[el.dataset.loop];
  if (!f) return;
  const svg = el.querySelector('svg');
  const frame = f(svg);
  loop(el, +(el.dataset.ms || 8000), frame, +(el.dataset.still || 0.5));
});

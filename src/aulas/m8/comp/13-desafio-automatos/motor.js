/* Motor do treino do Desafio 1: lê autômatos escritos em texto, simula AFD, AFN e AP e
   compara com a linguagem pedida em todas as palavras até um comprimento. Sem DOM: roda no
   navegador e no node (para conferir as respostas da página). */

export const EPS = new Set(['ε', 'e', 'eps', '&', 'λ', '-']);
const ehEps = (s) => EPS.has(s);

/* ---------- leitura do texto ----------
   inicial q1
   finais q2 q3          (ou "finais" sem nada: nenhum estado final)
   AFD/AFN:  q1 a q2 q3  (de, símbolo, para…; símbolo ε para transição vazia)
   AP:       q1 a ε -> q1 a      (de, lê, desempilha -> para, empilha; empilha pode ser uma palavra,
                                  e a 1ª letra fica no topo: "a$" deixa a em cima do $)
   Linhas vazias e o que vem depois de # são ignorados. */
export function ler(texto, tipo) {
  const m = { tipo, inicial: null, finais: new Set(), trans: [], estados: new Set() };
  const erros = [];
  texto.split('\n').forEach((bruta, i) => {
    const linha = bruta.replace(/#.*/, '').trim();
    if (!linha) return;
    const p = linha.split(/[\s,]+/).filter(Boolean).filter((x) => x !== '->' && x !== '→');
    const cab = p[0].toLowerCase().replace(/:$/, '');
    if (cab === 'inicial' || cab === 'início' || cab === 'inicio') {
      if (p.length !== 2) erros.push(`linha ${i + 1}: escreva "inicial q0"`);
      else { m.inicial = p[1]; m.estados.add(p[1]); }
      return;
    }
    if (cab === 'finais' || cab === 'final' || cab === 'f') {
      p.slice(1).forEach((q) => { m.finais.add(q); m.estados.add(q); });
      return;
    }
    if (tipo === 'ap') {
      if (p.length < 4 || p.length > 5) { erros.push(`linha ${i + 1}: AP é "de lê desempilha -> para empilha"`); return; }
      const [de, le, tira, para, poe = 'ε'] = p;
      m.trans.push({ de, le: ehEps(le) ? '' : le, tira: ehEps(tira) ? '' : tira, para, poe: ehEps(poe) ? '' : poe });
      m.estados.add(de); m.estados.add(para);
      if (le.length > 1 && !ehEps(le)) erros.push(`linha ${i + 1}: lê um símbolo por vez ("${le}")`);
      if (tira.length > 1 && !ehEps(tira)) erros.push(`linha ${i + 1}: desempilha um símbolo por vez ("${tira}")`);
      return;
    }
    if (p.length < 3) { erros.push(`linha ${i + 1}: escreva "de símbolo para"`); return; }
    const [de, s, ...para] = p;
    if (s.length > 1 && !ehEps(s)) erros.push(`linha ${i + 1}: um símbolo por transição ("${s}")`);
    para.forEach((q) => { m.trans.push({ de, s: ehEps(s) ? '' : s, para: q }); m.estados.add(q); });
    m.estados.add(de);
  });
  if (!m.inicial) erros.push('falta a linha "inicial q0"');
  if (tipo === 'afd') {
    const vistos = new Map();
    m.trans.forEach((t) => {
      if (t.s === '') erros.push(`AFD não tem transição vazia (${t.de})`);
      const k = `${t.de} ${t.s}`;
      if (vistos.has(k) && vistos.get(k) !== t.para) erros.push(`AFD com duas saídas de ${t.de} lendo ${t.s}`);
      vistos.set(k, t.para);
    });
  }
  return { m, erros: [...new Set(erros)] };
}

/* ---------- autômatos finitos ---------- */
function fecho(m, conj) {
  const pilha = [...conj], vistos = new Set(conj);
  while (pilha.length) {
    const q = pilha.pop();
    for (const t of m.trans) if (t.de === q && t.s === '' && !vistos.has(t.para)) { vistos.add(t.para); pilha.push(t.para); }
  }
  return vistos;
}
export function aceitaAF(m, w) {
  let ativos = fecho(m, new Set([m.inicial]));
  for (const c of w) {
    const prox = new Set();
    for (const t of m.trans) if (ativos.has(t.de) && t.s === c) prox.add(t.para);
    ativos = fecho(m, prox);
    if (!ativos.size) return false;
  }
  return [...ativos].some((q) => m.finais.has(q));
}
/* estados ativos depois de cada símbolo (para mostrar o rastro) */
export function rastroAF(m, w) {
  let ativos = fecho(m, new Set([m.inicial]));
  const passos = [[...ativos]];
  for (const c of w) {
    const prox = new Set();
    for (const t of m.trans) if (ativos.has(t.de) && t.s === c) prox.add(t.para);
    ativos = fecho(m, prox);
    passos.push([...ativos]);
  }
  return passos;
}

/* ---------- autômato com pilha ----------
   modo 'ambos': aceita se leu tudo, está num estado final e a pilha está vazia (convenção da lista).
   modo 'final': aceita se leu tudo e está num estado final (JFLAP e aula 01).
   Busca em largura nas configurações; corta pilhas longas para não rodar para sempre. */
export function aceitaAP(m, w, modo = 'ambos', limitePilha = 2 * w.length + 8) {
  const ini = [m.inicial, 0, ''];
  const vistos = new Set([ini.join('|')]);
  const fila = [ini];
  let passos = 0;
  while (fila.length) {
    const [q, i, pilha] = fila.shift();
    if (i === w.length && m.finais.has(q) && (modo === 'final' || pilha === '')) return true;
    if (++passos > 200000) return false;
    for (const t of m.trans) {
      if (t.de !== q) continue;
      if (t.le && w[i] !== t.le) continue;
      if (t.tira && pilha[0] !== t.tira) continue;
      const nova = t.poe + (t.tira ? pilha.slice(1) : pilha);
      if (nova.length > limitePilha) continue;
      const c = [t.para, i + (t.le ? 1 : 0), nova];
      const k = c.join('|');
      if (!vistos.has(k)) { vistos.add(k); fila.push(c); }
    }
  }
  return false;
}

/* Todas as computações (sequências de configurações) do AP numa palavra, até um número de passos.
   Cada configuração é [estado, resto, pilha] com o topo à esquerda. */
export function computacoesAP(m, w, modo = 'ambos', maxPassos = 12) {
  const res = [];
  (function ir(cam, q, i, pilha) {
    const fim = i === w.length && m.finais.has(q) && (modo === 'final' || pilha === '');
    const filhos = m.trans.filter((t) => t.de === q && (!t.le || w[i] === t.le) && (!t.tira || pilha[0] === t.tira));
    if (!filhos.length || cam.length > maxPassos) { res.push({ cam, aceita: fim }); return; }
    if (fim) res.push({ cam, aceita: true });
    for (const t of filhos) {
      const nova = t.poe + (t.tira ? pilha.slice(1) : pilha);
      const i2 = i + (t.le ? 1 : 0);
      ir([...cam, [t.para, w.slice(i2), nova]], t.para, i2, nova);
    }
  })([[m.inicial, w, '']], m.inicial, 0, '');
  return res;
}

/* ---------- palavras e comparação ---------- */
export function palavras(alfabeto, max) {
  const out = [''];
  let nivel = [''];
  for (let n = 1; n <= max; n++) {
    nivel = nivel.flatMap((w) => alfabeto.map((a) => w + a));
    out.push(...nivel);
  }
  return out;
}
export function aceita(m, w, modo) { return m.tipo === 'ap' ? aceitaAP(m, w, modo) : aceitaAF(m, w); }

/* Compara o autômato com o predicado em todas as palavras até max. Devolve os erros. */
export function comparar(m, alvo, alfabeto, max, modo) {
  const sobra = [], falta = [];
  let total = 0;
  for (const w of palavras(alfabeto, max)) {
    total++;
    const a = aceita(m, w, modo), b = alvo(w);
    if (a && !b) sobra.push(w);
    if (!a && b) falta.push(w);
  }
  return { total, sobra, falta };
}

export const mostra = (w) => (w === '' ? 'ε' : w);
const conta = (w, c) => [...w].filter((x) => x === c).length;
const rev = (w) => [...w].reverse().join('');

/* ---------- linguagens dos exercícios (o "gabarito" que os testes usam) ---------- */
export const L = {
  termina00: (w) => w.endsWith('00'),
  tres0: (w) => w.includes('000'),
  zeroEntre1: (w) => !w.startsWith('0') && !w.endsWith('0') && !w.includes('00'),
  fim1101: (w) => w.endsWith('1101'),
  palin6: (w) => w.length === 6 && w === rev(w),
  anbn1: (w) => /^a*b*$/.test(w) && conta(w, 'b') === conta(w, 'a') + 1,
  anb2n: (w) => /^a*b*$/.test(w) && conta(w, 'b') === 2 * conta(w, 'a'),
  difer: (w) => conta(w, '0') !== conta(w, '1'),
  anbmDif: (w) => /^a*b*$/.test(w) && conta(w, 'a') !== conta(w, 'b'),
  w1cw2: (w) => { const p = w.split('c'); return p.length === 2 && p[0] !== rev(p[1]); },
  anbn: (w) => /^a*b*$/.test(w) && conta(w, 'a') === conta(w, 'b'),
  meioA: (w) => w.length % 2 === 1 && w[(w.length - 1) / 2] === 'a',
  par1: (w) => conta(w, '1') % 2 === 0,
  mult3: (w) => w === '' ? false : parseInt(w, 2) % 3 === 0,
  contem101: (w) => w.includes('101'),
  wwr: (w) => w.length % 2 === 0 && w === rev(w),
  igual01: (w) => conta(w, '0') === conta(w, '1'),
  aibjck: (w) => { const r = /^(a*)(b*)(c*)$/.exec(w); return !!r && (r[1].length === r[2].length || r[1].length === r[3].length); },
  terceiroFim1: (w) => w.length >= 3 && w[w.length - 3] === '1',
};

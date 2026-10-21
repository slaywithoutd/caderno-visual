/* Confere se todo termo em negrito (<b>…</b>) das aulas tem verbete no glossário global.
   Uso: npm run checar            (todas as aulas)
        npm run checar -- m8/comp (só uma matéria ou aula)
   Termo em negrito = termo que o leitor precisa entender. Se ele não estiver no glossário,
   a explicação some quando o termo reaparecer em outra aula. */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = join(process.cwd(), 'src', 'aulas');
const filtro = process.argv[2] || '';

/* palavras de ênfase que não são termos técnicos */
const IGNORAR = new Set(['não', 'todas', 'todos', 'toda', 'todo', 'qualquer', 'existe', 'para todo', 'só', 'nada', 'antes', 'depois', 'exatamente', 'incluindo', 'exceto', 'sem', 'maior', 'aceito', 'rejeito', 'alguma', 'algum', 'contar sem limite', 'casar pares', 'ordem', 'estrutura', 'se e somente se', 'mais forte', 'uma única variável', 'tais que', 'ilimitada que será comparada depois', 'como saber onde é o meio?', 'o que eu preciso lembrar, e em que ordem vou conferir?', 'quais sequências de símbolos são válidas?', 'escolha de palavras', 'receita de substituições', 'não importa o que está em volta dela', 'conjunto de opções', 'chuta', 'maior', 'contínuo', 'começo', 'fim', 'ou', 'cai na prova', 'sensível', 'entrada', 'não pode', 'topo à direita', 'formato das regras', 'escrever', 'decidir', 'nenhuma', 'y fica inteiro dentro dos a', 'expressões aritméticas', 'números naturais', 'f ⊆ q', 'q₀', 'aceita', 'não é comutativa']);

const aulas = [];
for (const mod of readdirSync(RAIZ)) for (const mat of readdirSync(join(RAIZ, mod))) {
  const dmat = join(RAIZ, mod, mat); if (!statSync(dmat).isDirectory()) continue;
  for (const aula of readdirSync(dmat)) {
    const d = join(dmat, aula); if (!statSync(d).isDirectory()) continue;
    if (existsSync(join(d, 'meta.json'))) aulas.push({ id: `${mod}/${mat}/${aula}`, dir: d });
  }
}
aulas.sort((a, b) => a.id.localeCompare(b.id));

const formas = new Set();
for (const a of aulas) {
  const g = join(a.dir, 'glossario.js');
  if (!existsSync(g)) continue;
  const termos = (await import(pathToFileURL(g).href)).default;
  for (const e of Object.values(termos)) {
    e.m.forEach((f) => formas.add(f.toLowerCase()));
    formas.add(e.t.toLowerCase().replace(/\s*\(.*\)\s*/g, '').trim());
  }
}

const limpa = (s) => s.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
const tem = (t) => {
  const x = t.toLowerCase().replace(/[.:,;]$/, '');
  if (formas.has(x)) return true;
  for (const f of formas) if (f.length > 3 && (x === f || x.startsWith(f + ' ') || x.endsWith(' ' + f) || x.replace(/s$/, '') === f)) return true;
  return false;
};

let faltando = 0;
for (const a of aulas.filter((x) => x.id.startsWith(filtro))) {
  /* o cabeçalho decorativo (hero) não conta */
  const arquivo = existsSync(join(a.dir, 'conteudo.html')) ? 'conteudo.html' : 'consulta.html';
  const html = readFileSync(join(a.dir, arquivo), 'utf8').replace(/<header[\s\S]*?<\/header>/, '');
  const vistos = new Map();
  for (const m of html.matchAll(/<b(?:\s[^>]*)?>([\s\S]*?)<\/b>/g)) {
    const t = limpa(m[1]);
    if (!t || t.length < 2 || IGNORAR.has(t.toLowerCase()) || /^[\d\s.]+$/.test(t) || /^\d+\.\s/.test(t)) continue;
    /* listas em negrito ("União, interseção, diferença"): confere cada item */
    const itens = t.split(/,\s*/).filter(Boolean);
    const falta = itens.filter((i) => !IGNORAR.has(i.toLowerCase()) && !tem(i));
    if (falta.length) vistos.set(t, (vistos.get(t) || 0) + 1);
  }
  if (vistos.size) {
    console.log(`\n${a.id}: ${vistos.size} termo(s) em negrito sem verbete no glossário`);
    for (const [t, n] of vistos) console.log(`  - ${t}${n > 1 ? ` (${n}x)` : ''}`);
    faltando += vistos.size;
  } else console.log(`${a.id}: ok`);
}
console.log(faltando ? `\n${faltando} termo(s) para revisar: crie o verbete ou tire o negrito se não for termo.` : '\nTudo coberto.');
process.exitCode = faltando ? 1 : 0;

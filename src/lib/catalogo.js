/* Catálogo montado a partir das pastas (roda no build, não no navegador).
   src/aulas/<modulo>/<materia>/<slug>/
     meta.json        título, resumo, seções, fontes   (obrigatório)
     conteudo.html    texto da aula                    (obrigatório)
     index.js         figuras/loops/glossário no navegador
     glossario.js     termos                            revisao.js  cartões e cola
     notas/           anotações (.md), slides (.pdf) e fotos da aula */
import { site, modulos } from '../data/estrutura.js';

const metas = import.meta.glob('/src/aulas/*/*/*/meta.json', { eager: true, import: 'default' });
const conteudos = import.meta.glob('/src/aulas/*/*/*/conteudo.html', { eager: true, query: '?raw', import: 'default' });
const revisoes = import.meta.glob('/src/aulas/*/*/*/revisao.js', { eager: true });
const glossarios = import.meta.glob('/src/aulas/*/*/*/glossario.js', { eager: true, import: 'default' });
const notasMd = import.meta.glob('/src/aulas/*/*/*/notas/*.md', { eager: true });
const notasRaw = import.meta.glob('/src/aulas/*/*/*/notas/*.md', { eager: true, query: '?raw', import: 'default' });
const anexos = import.meta.glob('/src/aulas/*/*/*/notas/*.{pdf,png,jpg,jpeg,webp,gif,svg}', { eager: true, query: '?url', import: 'default' });

export { site, modulos };

export const url = (p = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;

const dentro = (obj, dir) => Object.entries(obj).filter(([k]) => k.startsWith(dir + '/')).sort(([a], [b]) => a.localeCompare(b));

export const aulas = Object.entries(metas)
  .map(([path, meta]) => {
    const [, , , modulo, materia, slug] = path.split('/');
    const dir = `/src/aulas/${modulo}/${materia}/${slug}`;
    const rev = revisoes[`${dir}/revisao.js`] || {};
    const raws = Object.fromEntries(dentro(notasRaw, dir + '/notas'));
    return {
      ...meta,
      modulo, materia, slug,
      id: `${modulo}/${materia}/${slug}`,
      href: url(`/${modulo}/${materia}/${slug}`),
      conteudo: conteudos[`${dir}/conteudo.html`] || '',
      cartoes: rev.cartoes || [],
      cola: rev.cola || [],
      glossario: glossarios[`${dir}/glossario.js`] || {},
      notas: dentro(notasMd, dir + '/notas').map(([k, m]) => ({ arquivo: k.split('/').pop(), Content: m.default, frontmatter: m.frontmatter || {}, raw: raws[k] || '' })),
      anexos: dentro(anexos, dir + '/notas').map(([k, u]) => ({ arquivo: k.split('/').pop(), url: u, tipo: /\.pdf$/i.test(k) ? 'pdf' : 'imagem' })),
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

export const materia = (m, s) => modulos.find((x) => x.slug === m)?.materias.find((x) => x.slug === s);
export const modulo = (m) => modulos.find((x) => x.slug === m);
export const aulasDe = (m, s) => aulas.filter((a) => a.modulo === m && a.materia === s);
export const hrefRevisao = (m, s) => url(`/${m}/${s}/revisao`);
export const hrefGlossario = url('/glossario');

/* Glossário global: os termos de todas as aulas. Um termo aprendido numa aula continua virando
   link nas próximas. Se duas aulas definem a mesma chave, vale a primeira (a mais antiga). */
export const glossarioGlobal = (() => {
  const G = {};
  for (const a of aulas) {
    const mat = materia(a.modulo, a.materia);
    for (const [k, v] of Object.entries(a.glossario)) {
      if (!G[k]) G[k] = { ...v, origem: { rotulo: `Aula ${a.numero} · ${mat ? mat.titulo : a.materia}`, href: `${a.href}#gl-${k}` } };
    }
  }
  return G;
})();

/* Destaques "cai na prova": <p class="prova"> no conteúdo e "> [!prova]" nas notas */
const inline = (t) => t
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\*(.+?)\*/g, '<i>$1</i>');

export function destaquesProva(aula) {
  const doConteudo = [...aula.conteudo.matchAll(/<p class="prova">([\s\S]*?)<\/p>/g)].map((m) => ({ html: m[1].trim(), origem: 'autoestudo' }));
  const dasNotas = [];
  for (const n of aula.notas) {
    const linhas = n.raw.split(/\r?\n/);
    for (let i = 0; i < linhas.length; i++) {
      const m = linhas[i].match(/^>\s*\[!prova\][+-]?\s*(.*)$/i);
      if (!m) continue;
      const partes = [m[1]];
      while (i + 1 < linhas.length && /^>/.test(linhas[i + 1])) partes.push(linhas[++i].replace(/^>\s?/, ''));
      dasNotas.push({ html: inline(partes.join(' ').trim()), origem: 'aula' });
    }
  }
  return [...doConteudo, ...dasNotas];
}

/* Tempo de leitura estimado, calculado sozinho no build (nenhuma aula precisa informar).
   - texto: palavras do conteúdo, notas e cartões a 180 palavras/min (texto técnico em português);
   - figura passo a passo: +1,5 min cada (é para assistir e mexer);
   - animação em loop: +0,25 min cada;
   - cartão de revisão: +0,5 min cada (tempo de pensar na resposta antes de abrir).
   O glossário não conta (é consulta). */
const PALAVRAS_MIN = 180, MIN_FIGURA = 1.5, MIN_LOOP = 0.25, MIN_CARTAO = 0.5;
const contarPalavras = (html) => html
  .replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')
  .split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

export function tempoLeitura({ html = '', extras = '', figuras = null, loops = null, cartoes = 0 }) {
  const palavras = contarPalavras(html) + contarPalavras(extras);
  const nFig = figuras ?? (html.match(/<figure class="fig"/g) || []).length;
  const nLoop = loops ?? (html.match(/data-loop="/g) || []).length;
  const min = palavras / PALAVRAS_MIN + nFig * MIN_FIGURA + nLoop * MIN_LOOP + cartoes * MIN_CARTAO;
  return { minutos: Math.max(1, Math.ceil(min)), palavras, figuras: nFig, loops: nLoop, cartoes };
}

export const tempoAula = (a) => tempoLeitura({
  html: a.conteudo,
  extras: [...a.notas.map((n) => n.raw), ...a.cartoes.flat(), ...a.cola.flat()].join(' '),
  cartoes: a.cartoes.length,
});

export const formatarTempo = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`);

/* linha "tempo de leitura" mostrada logo abaixo do título de toda página de leitura */
export function htmlTempo(t, rotulo = 'Leitura') {
  const partes = [`${rotulo}: ~${formatarTempo(t.minutos)}`];
  if (t.figuras) partes.push(`${t.figuras} ${t.figuras === 1 ? 'figura passo a passo' : 'figuras passo a passo'}`);
  if (t.loops) partes.push(`${t.loops} ${t.loops === 1 ? 'animação' : 'animações'} em loop`);
  if (t.cartoes) partes.push(`${t.cartoes} ${t.cartoes === 1 ? 'cartão' : 'cartões'}`);
  const icone = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.6V8l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  return `<div class="leitura" title="${t.palavras} palavras a ${PALAVRAS_MIN}/min, +${MIN_FIGURA} min por figura e +${MIN_LOOP} min por loop, +${MIN_CARTAO} min por cartão">${icone}<span>${partes.join(' · ')}</span></div>`;
}

/* coloca a linha de tempo logo depois do título (dentro do primeiro <header> do conteúdo) */
export const comTempo = (html, t, rotulo) => html.replace('</header>', `${htmlTempo(t, rotulo)}\n</header>`);

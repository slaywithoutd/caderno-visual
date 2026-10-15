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

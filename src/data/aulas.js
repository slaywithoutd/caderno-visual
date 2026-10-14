/* Catálogo do caderno: áreas (matérias) e suas aulas.
   Para adicionar uma aula:
   1. crie src/aulas/<area>/<slug>/ com conteudo.html, figuras.js, loops.js e glossario.js;
   2. crie src/pages/<area>/<slug>.astro (copie o de lfa/01-conceitos);
   3. adicione a aula na lista abaixo (e a área, se for nova). */
export const site = {
  titulo: 'Caderno visual',
  subtitulo: 'Autoestudos reescritos como texto curto, desenhos e diagramas que se montam.',
};

export const areas = [
  {
    slug: 'lfa',
    titulo: 'Linguagens Formais e Autômatos',
    descricao: 'Alfabetos, gramáticas, autômatos e a Hierarquia de Chomsky.',
  },
];

export const aulas = [
  {
    area: 'lfa',
    slug: '01-conceitos',
    numero: '01',
    titulo: 'Conceitos de linguagens formais',
    resumo: 'Alfabeto, palavra e gramática; o limite das linguagens regulares; linguagens livres do contexto, autômatos com pilha e a Hierarquia de Chomsky.',
    topicos: ['Σ* e linguagens', 'Gramáticas', 'Lema do bombeamento', 'GLC', 'Autômato com pilha', 'Chomsky'],
    fontes: '4 vídeos · Menezes cap. 2 e 6',
    secoes: [
      ['palavras', 'Alfabeto, palavra e linguagem'],
      ['gramaticas', 'Gramáticas e derivação'],
      ['naoregulares', 'Linguagens não-regulares'],
      ['llc', 'Livres do contexto'],
      ['ap', 'Autômatos com pilha'],
      ['apex', 'Mais exemplos de AP'],
      ['chomsky', 'Hierarquia de Chomsky'],
      ['revisao', 'Revisão rápida'],
      ['glossario', 'Glossário'],
    ],
  },
];

export const areaDe = (aula) => areas.find((a) => a.slug === aula.area);
export const hrefAula = (aula) => url(`/${aula.area}/${aula.slug}`);

export const url = (p = '') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${p.replace(/^\//, '')}`;
};

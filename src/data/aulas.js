/* Catálogo de aulas. Para adicionar uma aula nova:
   1. crie src/aulas/<slug>/ com conteudo.html, figuras.js e glossario.js;
   2. crie src/pages/aulas/<slug>.astro (copie o da aula 01);
   3. adicione a entrada abaixo. */
export const curso = {
  titulo: 'Linguagens Formais e Autômatos',
  subtitulo: 'Autoestudos com diagramas que se montam passo a passo.',
};

export const aulas = [
  {
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

export const url = (p = '') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${p.replace(/^\//, '')}`;
};

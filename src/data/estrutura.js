/* Estrutura do caderno: módulos e matérias. As aulas NÃO entram aqui: cada aula é uma pasta
   src/aulas/<modulo>/<materia>/<slug>/ com um meta.json, e o site encontra todas sozinho. */
export const site = {
  titulo: 'Caderno visual',
  subtitulo: 'Autoestudos reescritos como texto curto, desenhos e diagramas que se montam.',
};

export const modulos = [
  {
    slug: 'm8',
    titulo: 'Módulo 8',
    materias: [
      { slug: 'comp', titulo: 'Computação', descricao: 'Linguagens formais, gramáticas e autômatos.' },
      { slug: 'mat', titulo: 'Matemática', descricao: '' },
      { slug: 'negocios', titulo: 'Negócios', descricao: '' },
      { slug: 'ux', titulo: 'UX', descricao: '' },
      { slug: 'lideranca', titulo: 'Liderança', descricao: '' },
    ],
  },
];

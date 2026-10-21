/* Estrutura do caderno: módulos, matérias e (opcional) eixos de cada matéria. As aulas NÃO entram aqui: cada aula é uma pasta
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
      {
        slug: 'comp', titulo: 'Computação', descricao: 'Dois eixos: linguagens formais e autômatos; arquitetura de computadores e sistemas operacionais.',
        /* eixos da matéria, na ordem das aulas. Cada aula entra no eixo cujo título é igual ao "tema" do meta.json. */
        eixos: [
          { slug: 'lfa', titulo: 'Linguagens formais e autômatos', descricao: 'Linguagens, gramáticas e as máquinas que as reconhecem.' },
          { slug: 'sistemas', titulo: 'Do silício ao sistema operacional', descricao: 'Arquitetura de computadores e sistemas operacionais: do processador e da memória até processos, sincronização e gerência de recursos.' },
        ],
      },
      { slug: 'mat', titulo: 'Matemática', descricao: '' },
      { slug: 'negocios', titulo: 'Negócios', descricao: '' },
      { slug: 'ux', titulo: 'Design / UX', descricao: 'Conceitos conectados, decisões de projeto e exercícios para discutir e aplicar.' },
      { slug: 'lideranca', titulo: 'Liderança', descricao: '' },
    ],
  },
];

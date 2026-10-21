import './visual.css';

const laboratorio = document.getElementById('ux-lab');
if (laboratorio) {
  const seletor = laboratorio.querySelector('select');
  const retorno = laboratorio.querySelector('[role="status"]');
  const casos = {
    aviso: {
      principal: 'percepcao',
      explicacao: 'A barreira é depender da cor para entender o aviso. Proponha texto e símbolo coerentes; teste se o status é identificado sem a cor e com leitor de tela.',
      conexao: 'Equidade e flexibilidade podem orientar a solução, mas primeiro descreva como a informação chega à pessoa.'
    },
    entrada: {
      principal: 'equidade',
      explicacao: 'O percurso acessível oferece uma experiência inferior. Compare dignidade, tempo e segurança; investigue como tornar o acesso comum utilizável.',
      conexao: 'Percepção e flexibilidade podem importar em outros aspectos do trajeto; aqui a pista central é a segregação.'
    },
    gesto: {
      principal: 'flexibilidade',
      explicacao: 'Uma única forma de interação exige precisão. Ofereça outra maneira de concluir a tarefa e teste sua descoberta e uso; esforço e alcance também merecem análise.',
      conexao: 'O princípio escolhido pode ajudar, mas explique como sua mudança elimina a dependência de arrastar com precisão.'
    }
  };
  laboratorio.querySelectorAll('[data-principio]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const caso = casos[seletor.value];
      retorno.textContent = `${botao.dataset.principio === caso.principal ? 'Boa pista inicial. ' : 'Outra conexão é possível. '}${caso.explicacao} ${botao.dataset.principio === caso.principal ? '' : caso.conexao}`;
    });
  });
  seletor.addEventListener('change', () => {
    retorno.textContent = 'Novo caso: escolha um princípio e justifique a relação com a barreira.';
  });
}

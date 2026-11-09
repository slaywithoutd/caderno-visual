export const cartoes = [
  ['Qual é a definição de ergonomia adotada pela IEA em 2000?', 'Disciplina científica que estuda as interações entre pessoas e os outros elementos de um sistema, e profissão que aplica teoria, princípios, dados e métodos ao projeto para otimizar bem-estar humano e desempenho do sistema.', 'ergonomia'],
  ['Quais são os três domínios da ergonomia e o que cada um trata?', 'Física: corpo, postura, carga, repetição. Cognitiva: percepção, memória, raciocínio, resposta motora. Organizacional: estruturas, políticas e processos do sistema sociotécnico.', 'dominios'],
  ['Reescreva "o botão fica a 40 mm e tem 9 mm" como capacidade exigida.', '"Exige levar o polegar 40 mm e acertar um alvo de 9 mm." O sujeito passa do objeto para quem usa, com verbo de capacidade e número.', 'suposicao'],
  ['Quais são as quatro categorias de suposição da ponderada?', 'Antropométrica (tamanho e alcance), biomecânica (força, postura, carga, repetição), motora (precisão, velocidade, estabilidade) e sensorial (ver, ouvir, sentir).', 'suposicao'],
  ['Qual é o princípio 2 do design baseado em habilidades e o que ele muda num requisito?', 'Responsabilização (accountability): diante de mau desempenho, mudar o sistema e deixar a pessoa como ela é. O requisito tem o sistema como sujeito, nunca "o usuário deve…".', 'design-habilidades'],
  ['Folga e alcance: qual percentil usar em cada um?', 'Folga (algo do corpo passa) pelo maior, geralmente P95 do grupo maior. Alcance (algo precisa ser alcançado) pelo menor, geralmente P5 do grupo menor. Se um valor não serve a todos, faixa ajustável.', 'antropometria'],
  ['Por que o P95 masculino do ANSUR II não serve direto para um projeto com idosos brasileiros?', 'Porque percentil vale para a população medida: militares do Exército dos EUA, 17 a 58 anos, medidos em 2010–2012. É preciso dizer a diferença ou achar outra fonte.', 'antropometria'],
  ['O que a história dos cockpits da Força Aérea mostra?', 'Que o piloto médio não existe: de 4.063 pilotos, nenhum cabia na faixa média de 10 dimensões. Os cockpits ajustáveis do P5 ao P95 resolveram (Wobbrock et al., 2018, a partir de Rose).', 'antropometria'],
  ['Calcule o ID de um botão de 9 mm a 40 mm, forma de Shannon.', 'ID = log₂(40/9 + 1) = log₂(5,44) ≈ 2,44 bits.', 'fitts'],
  ['De onde saem a e b na Lei de Fitts?', 'De regressão linear com medições daquele dispositivo e daquelas pessoas. Não são universais; sem medição, compare IDs.', 'fitts'],
  ['Quais são as três formas do índice de dificuldade?', 'Fitts (1954): log₂(2D/W). Welford (1960): log₂(D/W + 0,5). Shannon (MacKenzie): log₂(D/W + 1), a recomendada.', 'fitts'],
  ['O que transforma uma suposição em barreira?', 'A capacidade que ela exige faltar a um grupo, com evidência citada (pesquisa, artigo, observação registrada). Sem fonte, é estereótipo.', 'barreiras'],
  ['O que torna um requisito verificável?', 'Derivar de uma barreira, ter o sistema como sujeito e trazer critério mensurável (valor, faixa ou condição observável) com instrumento.', 'requisitos'],
  ['Cite três erros plausíveis de IA em dados antropométricos e fórmulas.', 'População trocada, percentil confundido, cm × mm, variante errada de Fitts, log na base errada, a e b sem origem, fonte inexistente.', 'verificar-ia']
];

export const cola = [
  ['Ergonomia', 'Pessoa × sistema; bem-estar + desempenho; quem é afetado participa.', 'ergonomia'],
  ['Domínios', 'Física, cognitiva e organizacional se sobrepõem.', 'dominios'],
  ['Suposição', 'Sujeito = quem usa; verbo de capacidade + número + fonte.', 'suposicao'],
  ['Habilidades', 'O que a pessoa consegue; quem muda é o sistema (princípio 2).', 'design-habilidades'],
  ['Percentil', 'Da população medida; P5 ≈ média − 1,645 dp.', 'antropometria'],
  ['Extremos', 'Folga pelo P95 do maior, alcance pelo P5 do menor, ou faixa ajustável.', 'antropometria'],
  ['Medir', 'mm, instrumento anotado, três medidas, cotas numeradas na foto.', 'medir-dispositivo'],
  ['Fitts', 'MT = a + b · log₂(D/W + 1); ID em bits; a e b medidos.', 'fitts'],
  ['Barreira', 'Exigência do aparelho + falta documentada no grupo.', 'barreiras'],
  ['Design fiction', 'História que pergunta quem decide a regra; não é evidência.', 'design-ficcao'],
  ['Requisito', 'Barreira → o sistema deve → critério mensurável → teste.', 'requisitos'],
  ['IA', 'Conferir na fonte primária: quem, unidade, forma, conta.', 'verificar-ia']
];

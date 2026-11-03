/* Revisão da aula: cartões (pergunta, resposta, seção) e cola de uma página (tópico, resumo, seção).
   O 3º item é o id da seção do consulta.html onde o assunto mora. Pode usar HTML simples. */
export const cartoes = [
  ['O que diferencia uma DSL de uma linguagem de propósito geral?','A DSL tem notação e abstrações para um domínio só (SQL, HTML, fórmula do Excel); a de propósito geral serve para qualquer programa (Java, Python, PHP, Pascal).','dsl'],
  ['HTML não é linguagem de programação. Ela é DSL?','Sim. DSL é linguagem de programação ou de especificação dedicada a um domínio; HTML é de marcação, para páginas web.','dsl'],
  ['O que é um metamodelo, e o que é um gerador?','O metamodelo diz que elementos um modelo pode ter (como a gramática para o programa). O gerador lê o modelo e produz código, dados ou configuração; trocando o gerador, o mesmo modelo vira outro produto.','modelos'],
  ['Cite duas vantagens e duas desvantagens de uma DSL.','Vantagens: notação do domínio, abstração, produtividade, geração de código, documentação viva. Desvantagens: custo de criar, especialistas em linguagem e no domínio, usuários aprendendo a linguagem.','pros-contras'],
  ['Quais são os cinco grupos de diretrizes de Karsai et al.?','Propósito (1–3), realização (4–7), conteúdo (8–13), sintaxe concreta (14–22) e sintaxe abstrata (23–26). A semântica atravessa todos.','diretrizes'],
  ['O que as diretrizes 1 e 2 pedem?','Identificar cedo os usos (documentar, gerar código, testes, verificação, simulação…) e perguntar quem modela, quem revisa, quando, e quem usa os modelos para quê.','proposito'],
  ['Em que ordem de preferência a linguagem deve ser realizada?','Compor linguagens existentes (5), senão reaproveitar definições e sistemas de tipos (6 e 7); do zero só quando nada serve.','realizacao'],
  ['Por que class e struct em C++ são o exemplo da diretriz 12?','Dois conceitos quase iguais (só muda o acesso padrão) para o mesmo fato: redundância conceitual. Cada um usa um, e a diferença é esquecida.','conteudo-ling'],
  ['Qual a diferença entre sintaxe concreta e abstrata?','Concreta é o texto que se lê e escreve, com pontuação. Abstrata é a estrutura interna (a AST), só com o que tem significado: x = a + 2; e x := a + 2 têm a mesma.','concreta-abstrata'],
  ['Açúcar sintático aumenta o que a linguagem expressa?','Não. É outra forma de escrever o que já dava para escrever (ex.: o for aprimorado do Java 5). Ajuda a ler; em excesso, distrai.','notacao'],
  ['O que está errado no = da OCL?','É atribuição dentro do let e igualdade nas expressões: a notação abstrata depende do contexto. Quebra a diretriz 23.','abstrata'],
  ['O que uma especificação de linguagem precisa trazer?','Léxico (tokens e padrões), sintaxe (GLC em BNF/EBNF, sem ambiguidade), semântica (o que cada construção faz e as regras que a GLC não confere) e exemplos válidos e com erro.','especificacao'],
];

export const cola = [
  ['DSL × GPL', 'DSL: um domínio (SQL, HTML, Excel, UML). GPL: qualquer programa (Java, Python).', 'dsl'],
  ['Modelo', 'metamodelo → modelo → gerador → código. Troca o gerador, mantém o modelo.', 'modelos'],
  ['Prós e contras', 'notação do domínio, abstração, produtividade × custo, especialistas, aprendizado. ANTLR, Xtext, MPS.', 'pros-contras'],
  ['Grupos', 'propósito 1–3 · realização 4–7 · conteúdo 8–13 · concreta 14–22 · abstrata 23–26.', 'diretrizes'],
  ['Propósito', 'usos cedo; perguntas (quem modela, revisa, usa); cada recurso serve ao propósito.', 'proposito'],
  ['Realização', 'gráfica × textual; compor (OCL); reaproveitar definições e tipos; do zero por último.', 'realizacao'],
  ['Conteúdo', 'só o necessário; simples; sem generalidade; poucos elementos; sem redundância; sem elemento ineficiente.', 'conteudo-ling'],
  ['Concreta × abstrata', 'texto com pontuação × árvore com significado (AST).', 'concreta-abstrata'],
  ['Notação', 'copie a do especialista; + soma; elementos distinguíveis; açúcar com moderação.', 'notacao'],
  ['Estilo', '// e /* */; import e nomes qualificados; curto para o frequente; um estilo; convenções fora da gramática.', 'estilo'],
  ['Abstrata', 'alinhar com a concreta; layout sem significado; módulos; interfaces.', 'abstrata'],
  ['Especificação', 'tokens (ER) · gramática (EBNF: { } repete, [ ] opcional) · semântica · exemplos.', 'especificacao'],
];

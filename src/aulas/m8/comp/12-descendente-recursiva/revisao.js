/* Revisão da aula: cartões (pergunta, resposta, seção) e cola de uma página (tópico, resumo, seção).
   O 3º item é o id da seção do consulta.html onde o assunto mora. Pode usar HTML simples. */
export const cartoes = [
  ['Como cada pedaço de uma regra vira código na descida recursiva?', 'Terminal: <code>match</code>. Variável: chamada da função dela. <code>|</code>: if ou switch pelo próximo token. <code>{ }</code>: while. <code>[ ]</code>: if.', 'uma-funcao'],
  ['O que <code>match(tipo)</code> faz?', 'Confere se o token atual é do tipo esperado. Se é, consome e passa ao próximo; se não é, acusa erro de sintaxe.', 'match'],
  ['Como a função escolhe a alternativa, e o que fazer com a alternativa ε?', 'Olha o token atual e escolhe a única alternativa que começa com ele (FIRST disjuntos). Escolher ε é não fazer nada: a função retorna sem consumir.', 'decisao'],
  ['Qual a diferença entre a descida com backtracking e o analisador preditivo?', 'Com backtracking, tenta uma alternativa, e se falhar volta o ponteiro da entrada e tenta a próxima. O preditivo decide pelo próximo token e nunca volta.', 'backtracking'],
  ['Por que <code>expr → expr + termo</code> não pode virar função direto?', 'A primeira linha de <code>expr()</code> chamaria <code>expr()</code> sem consumir token: laço infinito ou estouro de pilha. Reescreva sem recursão à esquerda; a repetição vira while.', 'repeticao'],
  ['Como o código decide a associatividade de um operador?', 'Com while e <code>esq = (op, esq, direita)</code>, à esquerda: 5 − 3 − 1 = (5 − 3) − 1. Com a função chamando a si mesma no lado direito, à direita: a = (b = c).', 'precedencia'],
  ['Trocar <code>E → E − T</code> por <code>E → T − E</code> é inofensivo?', 'Não. Tira a recursão à esquerda, mas a árvore de 5 − 3 − 1 vira 5 − (3 − 1) = 3.', 'precedencia'],
  ['Como a AST é montada durante a descida?', 'Cada função devolve o nó da sua regra, e quem chamou encaixa no nó dele. Parênteses, ; e variáveis intermediárias não viram nó.', 'ast'],
  ['O que torna uma mensagem de erro sintático útil?', 'O que era esperado, o que foi encontrado, linha e coluna. E o analisador precisa exigir o fim do arquivo, senão aceita lixo no final.', 'erros'],
  ['Como funciona o modo pânico?', 'Ao achar um erro, registra, lança uma exceção que desempilha as funções até o comando, e descarta tokens até um token de sincronização (; ou palavra que começa comando). Depois continua.', 'recuperacao'],
  ['O que o ANTLR gera a partir da gramática?', 'Um analisador descendente recursivo: uma função por regra, match e um switch sobre adaptivePredict nas decisões. O ALL(*) espia à frente o quanto precisar e aceita recursão à esquerda direta.', 'antlr'],
  ['O que a pilha de chamadas mostra durante a análise?', 'O caminho da raiz da árvore até o nó sendo montado. A ordem das chamadas percorre a árvore inteira.', 'pilha'],
];

export const cola = [
  ['Regra → função', 'terminal: match · variável: chamada · | : if · { }: while · [ ]: if', 'uma-funcao'],
  ['match', 'confere o tipo do atual, consome, ou erro', 'match'],
  ['Decisão', 'atual escolhe a alternativa; FIRST disjuntos; ε = retornar sem consumir', 'decisao'],
  ['Preditivo × backtracking', 'nunca volta × tenta, volta o ponteiro, tenta de novo', 'backtracking'],
  ['Recursão à esquerda', 'função chama a si mesma sem consumir; reescreva; cauda vira while', 'repeticao'],
  ['Precedência', 'um nível por função; mais fundo = calcula antes', 'precedencia'],
  ['Associatividade', 'while: esquerda · recursão no lado direito: direita', 'precedencia'],
  ['AST', 'cada função devolve o nó; sem ( ) e ;', 'ast'],
  ['Erros', 'esperado × encontrado, linha e coluna; exigir EOF', 'erros'],
  ['Modo pânico', 'exceção até o comando; descarta até ; ou palavra-chave', 'recuperacao'],
  ['Pilha', 'pilha de chamadas = caminho da raiz até o nó atual', 'pilha'],
  ['ANTLR', 'gera descida recursiva; ALL(*); ações entre { }', 'antlr'],
];

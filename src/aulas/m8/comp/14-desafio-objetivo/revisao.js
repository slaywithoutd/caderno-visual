/* Revisão da aula: cartões (pergunta, resposta, seção) e cola de uma página (tópico, resumo, seção). */
export const cartoes = [
  ['Quantas setas tem um AFD com 4 estados sobre {a, b}?', 'Exatamente 8: uma para cada par (estado, símbolo). Seta que falta vai para o estado de erro, que precisa aparecer ou ser dito.', 'afd'],
  ['Quando um AFN aceita uma palavra?', 'Quando existe pelo menos um caminho que lê a palavra toda e para num estado final. Caminhos que morrem não importam.', 'afn'],
  ['O que quer dizer ε no topo de uma transição de AP?', 'Não olha nem tira o topo: a transição vale com qualquer topo, inclusive com a pilha vazia.', 'ap'],
  ['Empilhar XY: quem fica no topo?', 'X.', 'ap'],
  ['AFN é mais poderoso que AFD?', 'Não. Reconhecem as mesmas linguagens (as regulares); o AFN pode ter muito menos estados (k + 1 contra 2ᵏ no "k-ésimo do fim").', 'poder'],
  ['O não determinismo muda o poder do AP?', 'Sim. wcwᴿ tem AP determinístico; wwᴿ só não determinístico.', 'poder'],
  ['aⁿbⁿcⁿ tem AP?', 'Não. A pilha é gasta casando a com b e não sobra nada para os c.', 'limites'],
  ['ww tem AP?', 'Não. A pilha devolve a primeira metade ao contrário; ww precisaria dela na mesma ordem.', 'limites'],
  ['As livres do contexto são fechadas sob interseção?', 'Não: aⁿbⁿcᵐ ∩ aᵐbⁿcⁿ = aⁿbⁿcⁿ. Mas a interseção com uma regular continua livre do contexto.', 'limites'],
  ['Como fazer o AFD de "não contém x"?', 'Faça o de "contém x", completo, e troque finais por não finais.', 'construir-afd'],
  ['Como fazer o AFD de duas condições com "e"?', 'Construção do produto: estado = par de estados; final quando os dois são finais.', 'construir-afd'],
  ['AFN para "o 3º símbolo do fim é 1"?', 'Laço com 0 e 1 no inicial, 1 para q1, depois duas setas com qualquer símbolo até q3, final e sem saída.', 'construir-afn'],
  ['AP de aⁿbᵐ com m ≥ n?', 'a, ε → X; depois b, X → ε e b, ε → ε. Com pilha vazia no fim, n dos b desempilham e os outros passam de graça.', 'construir-ap'],
  ['Final com laço de todos os símbolos: como ler?', 'Achou, está aceita: "contém" ou "começa com".', 'ler-af'],
  ['O AP de aⁿbⁿ (q0 e q1 finais) com o critério "só estado final" reconhece o quê?', 'aⁿbᵐ com m ≤ n: sobrar a na pilha deixa de impedir.', 'ler-ap'],
];

export const cola = [
  ['Notação', 'aⁿbⁿ amarra; aⁿbᵐ não; n ≥ 0 põe ε; XY empilhado: X no topo', 'notacao'],
  ['AFD', 'uma seta por (estado, símbolo); sem ε; estado de erro', 'afd'],
  ['AFN', 'algum caminho aceita; ∅ = ramo morre; ε-fecho', 'afn'],
  ['AP', 'a, X → γ; ε no topo = qualquer topo; $ no fundo; diga o critério', 'ap'],
  ['Poder', 'AFD = AFN ⊊ AP determinístico ⊊ AP', 'poder'],
  ['Limites', 'limitado: AF; uma contagem: AP; duas cruzadas, aⁿbⁿcⁿ, ww: nenhum', 'limites'],
  ['Construir AFD', 'o que lembrar; começa/termina/contém/resto/contador/produto; complemento', 'construir-afd'],
  ['Construir AFN', 'laço com tudo + corrente; ε para unir; estrela com inicial novo', 'construir-afn'],
  ['Construir AP', 'o que a pilha guarda; fase = estado; chute com ε', 'construir-ap'],
  ['Ler', 'nomeie os estados; formas; aceitas curtas; confira ε e bordas', 'ler-af'],
  ['Ler AP', 'ordem pelos estados; conta pela pilha; critério', 'ler-ap'],
];

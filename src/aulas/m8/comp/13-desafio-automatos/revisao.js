/* Revisão da aula: cartões (pergunta, resposta, seção) e cola de uma página (tópico, resumo, seção).
   O 3º item é o id da seção do consulta.html onde o assunto mora. Pode usar HTML simples. */
export const cartoes = [
  ['Qual a linguagem do AFD do exercício 2(a) da lista (F = {q5})?', 'As palavras de comprimento 2 ou mais que terminam em c: { wc : w ∈ {a,b,c}⁺ }. A palavra <code>c</code> sozinha vai para q4 e fica de fora.', 'ler-tabela'],
  ['Qual o primeiro passo para inventar um AFD?', 'Responder o que o estado precisa lembrar da palavra lida para decidir no fim. Cada resposta possível vira um estado.', 'projetar-afd'],
  ['No AFD de "termina em 1101", para onde vai q4 (li 1101) lendo 1?', 'Para q2 (li 11): 11011 termina em 11. Voltar para q0 é o erro clássico.', 'projetar-afd'],
  ['Como achar o complemento de uma linguagem regular com um AFD?', 'Troque finais por não finais num AFD completo, com o estado de erro desenhado.', 'projetar-afd'],
  ['O que significa ∅ numa célula da tabela de um AFN?', 'Aquele ramo morre. AFN não precisa de estado de erro.', 'ler-afn'],
  ['Na construção dos subconjuntos, quando um estado do AFD é final?', 'Quando o conjunto contém pelo menos um estado final do AFN.', 'afn-afd'],
  ['Quando o AP da lista aceita uma palavra?', 'Quando algum ramo lê a entrada toda e para num estado final com a pilha vazia, ao mesmo tempo.', 'ap-tabela'],
  ['O que quer dizer ε na coluna "topo da pilha"?', 'Não desempilha nada. A transição vale com qualquer topo, inclusive com a pilha vazia.', 'ap-tabela'],
  ['Qual a linguagem do AP do exercício 1 da lista?', 'Palavras de comprimento ímpar com a no meio: { uav : |u| = |v| }.', 'ap-tabela'],
  ['Como mostrar que w ∉ L(M) num AP?', 'Listando todas as computações de w e mostrando que nenhuma aceita.', 'computacoes'],
  ['Que AP aceita aⁿbⁿ⁺¹?', 'q1: a, ε → a; q1: b, ε → q2 sem empilhar; q2: b, a → ε. F = {q2}, critério final e pilha vazia.', 'projetar-ap'],
  ['Como um AP decide nº de 0 ≠ nº de 1?', 'A pilha guarda o excesso sobre um $: igual cancela, diferente empilha. Aceita se, no fim, o topo não é o $ (aí esvazia).', 'projetar-ap'],
  ['aⁿbᵐcⁿ⁺ᵐ é regular? livre do contexto?', 'Livre do contexto e não regular: uma pilha casa os c com os a e os b.', 'classes'],
  ['Por que <code>senaox</code> é um identificador e não SENAO seguido de x?', 'Maior casamento: o padrão de identificador casa os 6 caracteres; a palavra-chave só 5.', 'lexico'],
  ['Em Python, por que <code>re</code> com <code>=|==</code> erra em <code>a==b</code>?', 'A alternativa <code>|</code> escolhe a primeira que casa, não a maior. Ponha <code>==</code> antes de <code>=</code>.', 'lexico'],
  ['Por que o simulador de AP precisa de um corte ou de um conjunto de visitados?', 'Uma transição ε, ε → x gera ramos que empilham para sempre; sem corte, a busca não termina.', 'codigo'],
];

export const cola = [
  ['Qual a linguagem?', 'nomeie cada estado pelo que ele lembra; teste ε, símbolos e pares; confira 2 aceitas e 2 rejeitadas', 'ler-tabela'],
  ['Inventar AFD', 'o que o estado lembra; seta para todo símbolo; estado de erro', 'projetar-afd'],
  ['AFN', 'conjunto de ativos; ∅ = ramo morre; ε-fecho', 'ler-afn'],
  ['AFN → AFD', 'estados = conjuntos; final se contém final; ∅ = erro', 'afn-afd'],
  ['AP da lista', '(q, lê, topo) → (q′, empilha); aceita com final e pilha vazia', 'ap-tabela'],
  ['Computações', '(estado, resto, pilha) ⊢ …; liste todos os ramos', 'computacoes'],
  ['Inventar AP', 'o que a pilha guarda: contagem ou começo da palavra; $ no fundo; chute com ε', 'projetar-ap'],
  ['Classes', 'memória limitada = regular; uma pilha = livre do contexto; aⁿbⁿcⁿ, ww: nenhuma', 'classes'],
  ['Tokens', 'maior casamento; empate: palavra-chave; erro só se nada casa', 'lexico'],
  ['Código', 'AFD, AFN, AP, léxico; return bool; sem input/print', 'codigo'],
];

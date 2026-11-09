/* Revisão da aula: cartões (pergunta, resposta, seção) e cola de uma página (tópico, resumo, seção).
   O 3º item é o id da seção do consulta.html onde o assunto mora. Pode usar HTML simples. */
export const cartoes = [
  ['O que o analisador sintático recebe e o que devolve?','Recebe a fila de tokens do léxico (só o tipo de cada um) e devolve a árvore sintática, conferindo se a sequência sai da gramática.','papel'],
  ['Qual a diferença entre derivação e inferência recursiva?','Derivação troca cabeça por corpo, a partir da inicial (árvore da raiz às folhas, descendente). Inferência troca corpo por cabeça, a partir da cadeia (das folhas à raiz, ascendente).','descendente-ascendente'],
  ['O que significam as letras de LL(1) e LR(1)?','1º L: lê da esquerda para a direita. 2ª letra: derivação mais à esquerda (L) ou mais à direita ao contrário (R). 1: um token à frente.','descendente-ascendente'],
  ['Como escrever expressões sem ambiguidade e com potência associativa à direita?','Uma variável por nível: <code>expr → expr op1 termo | termo</code>, <code>termo → termo op2 fator | fator</code>, <code>fator → num op3 fator | num</code>. Recursão à esquerda nos associativos à esquerda; à direita na potência.','ambiguidade-tecnicas'],
  ['Elimine a recursão à esquerda de <code>E → E + T | T</code>.','<code>E → T E′</code>, <code>E′ → + T E′ | ε</code>. Em geral A → Aα | β vira A → βA′, A′ → αA′ | ε.','recursao-esquerda'],
  ['Fatore <code>CMD → if E then CMD else CMD | if E then CMD</code>.','<code>CMD → if E then CMD CMD_ELSE</code>, <code>CMD_ELSE → else CMD | ε</code>.','fatoracao'],
  ['Defina FIRST(α) e FOLLOW(A).','FIRST(α): terminais que podem começar uma cadeia derivada de α (mais ε se α pode sumir). FOLLOW(A): terminais que podem vir logo depois de A numa forma sentencial (mais $ se A pode ficar no fim; nunca ε).','first-follow'],
  ['Como se preenche a tabela LL(1)?','Para cada A → α: M[A, a] = A → α para cada a ∈ FIRST(α); se α pode sumir, também para cada b ∈ FOLLOW(A), inclusive $.','ll1'],
  ['Por que <code>S → i E t S S′ | a</code>, <code>S′ → e S | ε</code>, <code>E → b</code> não é LL(1)?','M[S′, e] recebe S′ → e S (FIRST) e S′ → ε (e ∈ FOLLOW(S′)). É o else pendente: a gramática é ambígua.','ll1'],
  ['No preditivo com pilha, o que fazer com o topo X e o token a?','X = a: casa (desempilha, avança). X terminal diferente: erro. X variável: M[X, a] vazia é erro; senão troca X pelo corpo, empilhado ao contrário.','ll1-pilha'],
  ['O que é um handle?','O corpo de uma regra que aparece no topo da pilha na hora certa de ser reduzido. Achar os handles é o problema do ascendente.','ascendente'],
  ['O que o LR faz num reduce rJ?','Desempilha tantos estados quantos símbolos o corpo da regra J tem, olha o novo topo t e empilha transição[t, cabeça]. A entrada não anda.','lr'],
  ['Como a SLR decide onde pôr um reduce A → α?','Num estado que tem o item A → α · (ponto no fim), só nas colunas dos tokens de FOLLOW(A).','slr'],
  ['Como resolver o conflito shift-reduce do else pendente e o da precedência?','Else: na dúvida, shift (o else fica com o if mais próximo). Precedência: operador mais forte ganha; mesmo nível, à esquerda reduz e à direita empilha.','conflitos'],
  ['SLR, LR(1) e LALR: qual a diferença?','SLR usa FOLLOW e tem conflitos à toa; LR(1) põe tokens em cada item e tem tabela enorme; LALR junta estados da LR(1) com os mesmos itens (tamanho da SLR). LALR é a do Yacc.','variantes-lr'],
];

export const cola = [
  ['Papel', 'tokens (só o tipo) → árvore concreta; depois a abstrata (aula 09).', 'papel'],
  ['Sentidos', 'descendente = derivação lm, raiz → folhas; ascendente = inferência, rm ao contrário, folhas → raiz.', 'descendente-ascendente'],
  ['Ambiguidade', 'níveis de precedência; end if; analisador decide (ganancioso, %left/%right).', 'ambiguidade-tecnicas'],
  ['LL(k)', 'olhar k tokens à frente; preditivo não volta; k = 1 na prática.', 'lookahead'],
  ['Recursão', 'A → Aα | β ⟹ A → βA′, A′ → αA′ | ε.', 'recursao-esquerda'],
  ['Fatorar', 'A → αβ₁ | αβ₂ ⟹ A → αA′, A′ → β₁ | β₂.', 'fatoracao'],
  ['FIRST/FOLLOW', 'ponto fixo; FIRST com ε se anulável; $ ∈ FOLLOW(S); A → αBβ: FIRST(β) e, se β some, FOLLOW(A).', 'first-follow'],
  ['Tabela LL(1)', 'a ∈ FIRST(α) ou (α anulável e a ∈ FOLLOW(A)); célula dupla = não LL(1); vazia = erro.', 'll1'],
  ['Pilha LL', 'S$; casa terminal; variável → corpo ao contrário.', 'll1-pilha'],
  ['ANTLR', 'LL(*) com AFD de decisão; ALL(*) em paralelo, reescreve recursão direta.', 'llk-antlr'],
  ['Shift-reduce', 'shift empilha; reduce troca handle pela cabeça; aceita com S sobre $.', 'ascendente'],
  ['LR', 'sN, rJ (desempilha |corpo|, goto), acc, vazia = erro.', 'lr'],
  ['SLR', 'itens LR(0), fechamento, transições; reduce em FOLLOW.', 'slr'],
  ['Conflitos', 'shift-reduce (else: shift; precedência) e reduce-reduce (reescrever).', 'conflitos'],
];

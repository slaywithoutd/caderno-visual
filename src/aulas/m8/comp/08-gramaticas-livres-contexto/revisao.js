/* Revisão da aula: cartões (pergunta, resposta, seção) e cola de uma página (tópico, resumo, seção).
   O 3º item é o id da seção do consulta.html onde o assunto mora. Pode usar HTML simples. */
export const cartoes = [
  ['Dadas só as regras <code>S → TT | X</code>, <code>T → 0T | T0 | #</code>, <code>X → 0X00 | #</code>, quem são V, Σ e a inicial?','V = {S, T, X} (quem aparece à esquerda), Σ = {0, #} (o resto), inicial S (primeira regra).','convencoes'],
  ['Qual a diferença entre →, ⇒ e ⇒*?','→ é uma regra da gramática. ⇒ é um passo: aplicar uma regra uma vez. ⇒* são zero ou mais passos; toda cadeia deriva ela mesma.','convencoes'],
  ['Como se lê a palavra de uma árvore de derivação?','Percurso em ordem: da raiz, cada filho da esquerda para a direita, lendo toda a subárvore do filho antes de passar ao próximo. Folhas ε não contam.','ler-arvore'],
  ['A mesma palavra ter duas derivações diferentes torna a gramática ambígua?','Não. A mesma árvore tem várias derivações (muda a ordem das trocas). Ambígua é ter duas árvores, ou duas derivações mais à esquerda.','ambigua'],
  ['Que linguagem gera <code>P → aP | Pb | ε</code>? Justifique.','{ aⁿbᵐ | n, m ≥ 0 }. aP põe a à esquerda de P e Pb põe b à direita, então P fica sempre entre os a e os b. E qualquer aⁿbᵐ sai com n vezes aP, m vezes Pb e P → ε.','qual-linguagem'],
  ['Que linguagem gera <code>S → aSbS | bSaS | ε</code>?','As palavras com tantos a quanto b, em qualquer ordem: cada a nasce na mesma regra que um b.','catalogo'],
  ['GLC para parênteses balanceados.','<code>S → (S) | SS | ε</code>. O primeiro ( casa com o último ) ou com algum do meio, e aí a palavra é duas balanceadas coladas.','exemplos-l'],
  ['GLC para { aⁿbᵐ | n ≠ m }.','<code>S → aSb | A | B</code>, <code>A → aA | a</code>, <code>B → bB | b</code>. Gera casado e depois sobra pelo menos um a ou pelo menos um b.','exemplos-l'],
  ['Não consegui achar uma GLC para L. Então L não é livre do contexto?','Não dá para concluir. Para provar que não é, é preciso o lema do bombeamento das livres do contexto.','construir'],
  ['Existe algoritmo que diga se uma GLC qualquer é ambígua, ou que tire a ambiguidade?','Não, nenhum dos dois. E há linguagens inerentemente ambíguas, em que toda GLC é ambígua.','ambigua'],
  ['Como tirar a ambiguidade de <code>E → E+E | E*E | (E) | d</code>?','Uma variável por nível: <code>E → E+T | T</code>, <code>T → T*F | F</code>, <code>F → (E) | d</code>. O * fica embaixo do + e é calculado primeiro.','precedencia'],
  ['Quando uma GLC está na forma normal de Chomsky?','Toda regra é A → BC ou A → a; S → ε só para a inicial. Toda LLC tem uma gramática na FNC.','fnc'],
];

export const cola = [
  ['Convenções', 'maiúscula = variável; resto = terminal; inicial = 1ª regra. Cada variável gera sua linguagem.', 'convencoes'],
  ['→ ⇒ ⇒*', 'regra / um passo / zero ou mais passos.', 'convencoes'],
  ['Ler árvore', 'percurso em ordem, filhos da esquerda para a direita; ε não conta; não é binária.', 'ler-arvore'],
  ['Derivações', 'várias por árvore; mais à esquerda (LL) ou à direita (LR) é única por árvore.', 'uma-arvore'],
  ['Qual L(G)?', 'gerar exemplos → onde a variável fica → chutar X → L(G) ⊆ X e X ⊆ L(G).', 'qual-linguagem'],
  ['Blocos', 'qualquer coisa T → 0T | 1T | ε; sequência S → SS | ε; casamento S → aSb; ou S → A | B; pelo menos um A → aA | a.', 'construir'],
  ['Exemplos', '≥ três 1: T1T1T1T · ∅: S → aS · parênteses: (S) | SS | ε · wwᴿ: aSa | bSb | ε · n ≠ m: aSb | A | B.', 'exemplos-l'],
  ['Ambígua', 'duas árvores para a mesma palavra. Indecidível; sem algoritmo de remoção; há LLC inerentemente ambíguas.', 'ambigua'],
  ['Precedência', 'E → E+T | T, T → T*F | F, F → (E) | d.', 'precedencia'],
  ['FNC', 'A → BC | a, S → ε. n letras = 2n − 1 passos.', 'fnc'],
  ['Subárvore', 'E ⇒* αEβ e E ⇒* x dão αᵏxβᵏ: base do bombeamento das LLC.', 'subarvore'],
  ['Projeto', 'terminais = tipos de token; sintático = recursão + árvore; recursão à esquerda vira while.', 'sintatico'],
];

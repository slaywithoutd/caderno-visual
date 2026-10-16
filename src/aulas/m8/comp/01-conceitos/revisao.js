/* Revisão da aula: cartões (pergunta, resposta) e cola de uma página (tópico, resumo).
   Aparecem no fim da aula e na página de revisão da matéria. Pode usar HTML simples. */
export const cartoes = [
  ['Qual a diferença entre ∅ e {ε}?','∅ não tem nenhuma palavra. {ε} tem exatamente uma: a palavra vazia. As duas são linguagens.', 'linguagem'],
  ['O que é um estado de erro (trap state) e quem precisa dele?','Um estado não final em que todas as setas voltam para ele: quem entra não sai. O AFD precisa dele para ter uma seta por símbolo em cada estado; o AFN não, porque ali a seta pode faltar (∅).', 'estado-erro'],
  ['Qual a diferença entre a função de transição do AFD e a do AFN?','AFD: δ: Q × Σ → Q (um destino). AFN: δ: Q × Σ_ε → 𝒫(Q) (um conjunto de destinos, talvez vazio, e ε-transições).', 'afn'],
  ['Quantos elementos tem 𝒫({a, b, c, d})?','2⁴ = 16. Sempre |𝒫(A)| = 2^|A|.', 'produto-partes'],
  ['Quando um AFN aceita uma palavra?','Quando pelo menos um ramo lê a palavra toda e para num estado final.', 'computacao-afn'],
  ['AFN reconhece mais linguagens que AFD?','Não. Todo AFN tem um AFD equivalente; os dois reconhecem exatamente as linguagens regulares.', 'regular'],
  ['Toda linguagem formal pode ser expressa por uma regex?','Não. Só as regulares. aⁿbⁿ é formal e não tem regex nem AFD.', 'regular'],
  ['O que faz a transição de AP "ε, b → ε"?','Não lê nada da fita, desempilha b e não empilha nada.', 'transicao-ap'],
  ['Quantas palavras de comprimento 3 existem sobre Σ = {0,1,2}?','3³ = 27. Com |Σ| = k há kⁿ palavras de comprimento n.', 'sigma-estrela'],
  ['O que é L(G)?','O conjunto das palavras formadas só por terminais que podem ser derivadas a partir de S: { w ∈ T* | S ⇒⁺ w }.', 'gerada'],
  ['O que torna uma gramática "livre do contexto"?','Todo lado esquerdo é uma única variável (A → α). A variável é trocada sem olhar o que está ao redor.', 'llc'],
  ['O lema do bombeamento prova que uma linguagem é regular?','Não. Ele só prova que uma linguagem NÃO é regular (pela contrapositiva).', 'prova-bombeamento'],
  ['No jogo do bombeamento, quem escolhe p e quem escolhe a divisão xyz?','O adversário escolhe os dois. Você escolhe w e i, e precisa vencer qualquer divisão.', 'prova-bombeamento'],
  ['Por que y fica só com a em w = aᵖbᵖ?','Porque |xy| ≤ p e os p primeiros símbolos são todos a.', 'prova-bombeamento'],
  ['O que significa a transição "b, A → ε"?','Lê b da entrada, tira A do topo da pilha e não empilha nada.', 'transicao-ap'],
  ['Para que serve o $ no fundo da pilha?','O AP não testa "pilha vazia" diretamente. Ver $ no topo equivale a saber que a pilha está vazia.', 'transicao-ap'],
  ['Como um AP reconhece wwᴿ sem saber onde está o meio?','Não determinismo: ele chuta o meio com uma ε-transição. Basta um ramo acertar e aceitar.', 'projeto-ap'],
  ['aⁿbⁿcⁿ é livre do contexto?','Não. É sensível ao contexto (Tipo 1). Uma pilha só consegue casar duas contagens.', 'projeto-ap'],
  ['Qual máquina corresponde a cada tipo de Chomsky?','Tipo 3: autômato finito. Tipo 2: autômato com pilha. Tipo 1: MT com fita limitada. Tipo 0: máquina de Turing.', 'chomsky'],
  ];

export const cola = [
  ["Linguagem", "qualquer subconjunto de Σ*. ∅ ≠ {ε}.", "linguagem"],
  ["Σ*", "inclui ε; <b>Σ⁺</b> = Σ* − {ε}. w⁰ = ε.", "sigma-estrela"],
  ["AFD", "(Q, Σ, δ, q₀, F), δ: Q × Σ → Q. Uma seta por símbolo; estado de erro completa a tabela.", "afd"],
  ["AFN", "δ: Q × Σ_ε → 𝒫(Q). Vários destinos, ∅, ε. Mesmo poder do AFD.", "afn"],
  ["Regular", "AFD ⇔ AFN ⇔ regex. Toda linguagem finita é regular.", "regular"],
  ["𝒫(A)", "todos os subconjuntos; |𝒫(A)| = 2^|A|.", "produto-partes"],
  ["Gramática", "G = (V, T, P, S). L(G) = { w ∈ T* | S ⇒⁺ w }.", "gramatica"],
  ["Equivalentes", "L(G₁) = L(G₂).", "gerada"],
  ["Bombeamento", "w = xyz, |y| ≥ 1, |xy| ≤ p, xyⁱz ∈ L ∀i ≥ 0. Só prova que <i>não</i> é regular.", "bombeamento"],
  ["GLC", "regras A → α. Gera LLC. Árvore de derivação; duas árvores = ambígua.", "llc"],
  ["BNF", "⟨var⟩ ::= … é uma GLC.", "bnf"],
  ["AP", "(Q, Σ, Γ, δ, q₀, F), transição a, b → c. Aceita se algum ramo lê tudo e para em F.", "ap"],
  ["Truque do $", "marca fundo da pilha, testa \"vazia\".", "transicao-ap"],
  ["GLC ⇔ AP", "mesmo poder. AP não determinístico &gt; determinístico (wwᴿ).", "ap"],
  ["Chomsky", "3 Reg/AF ⊊ 2 LLC/AP ⊊ 1 LSC/ALL ⊊ 0 RE/MT.", "chomsky"]
];

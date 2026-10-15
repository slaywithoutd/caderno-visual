/* Revisão da aula: cartões (pergunta, resposta) e cola de uma página (tópico, resumo).
   Aparecem no fim da aula e na página de revisão da matéria. Pode usar HTML simples. */
export const cartoes = [
  ['Qual a diferença entre ∅ e {ε}?','∅ não tem nenhuma palavra. {ε} tem exatamente uma: a palavra vazia. As duas são linguagens.'],
  ['Quantas palavras de comprimento 3 existem sobre Σ = {0,1,2}?','3³ = 27. Com |Σ| = k há kⁿ palavras de comprimento n.'],
  ['O que é L(G)?','O conjunto das palavras formadas só por terminais que podem ser derivadas a partir de S: { w ∈ T* | S ⇒⁺ w }.'],
  ['O que torna uma gramática "livre do contexto"?','Todo lado esquerdo é uma única variável (A → α). A variável é trocada sem olhar o que está ao redor.'],
  ['O lema do bombeamento prova que uma linguagem é regular?','Não. Ele só prova que uma linguagem NÃO é regular (pela contrapositiva).'],
  ['No jogo do bombeamento, quem escolhe p e quem escolhe a divisão xyz?','O adversário escolhe os dois. Você escolhe w e i, e precisa vencer qualquer divisão.'],
  ['Por que y fica só com a em w = aᵖbᵖ?','Porque |xy| ≤ p e os p primeiros símbolos são todos a.'],
  ['O que significa a transição "b, A → ε"?','Lê b da entrada, tira A do topo da pilha e não empilha nada.'],
  ['Para que serve o $ no fundo da pilha?','O AP não testa "pilha vazia" diretamente. Ver $ no topo equivale a saber que a pilha está vazia.'],
  ['Como um AP reconhece wwᴿ sem saber onde está o meio?','Não determinismo: ele chuta o meio com uma ε-transição. Basta um ramo acertar e aceitar.'],
  ['aⁿbⁿcⁿ é livre do contexto?','Não. É sensível ao contexto (Tipo 1). Uma pilha só consegue casar duas contagens.'],
  ['Qual máquina corresponde a cada tipo de Chomsky?','Tipo 3: autômato finito. Tipo 2: autômato com pilha. Tipo 1: MT com fita limitada. Tipo 0: máquina de Turing.'],
  ];

export const cola = [
  ["Linguagem", "qualquer subconjunto de Σ*. ∅ ≠ {ε}."],
  ["Σ*", "inclui ε; <b>Σ⁺</b> = Σ* − {ε}. w⁰ = ε."],
  ["Gramática", "G = (V, T, P, S). L(G) = { w ∈ T* | S ⇒⁺ w }."],
  ["Equivalentes", "L(G₁) = L(G₂)."],
  ["Bombeamento", "w = xyz, |y| ≥ 1, |xy| ≤ p, xyⁱz ∈ L ∀i ≥ 0. Só prova que <i>não</i> é regular."],
  ["GLC", "regras A → α. Gera LLC. Árvore de derivação; duas árvores = ambígua."],
  ["BNF", "⟨var⟩ ::= … é uma GLC."],
  ["AP", "(Q, Σ, Γ, δ, q₀, F), transição a, b → c. Aceita se algum ramo lê tudo e para em F."],
  ["Truque do $", "marca fundo da pilha, testa \"vazia\"."],
  ["GLC ⇔ AP", "mesmo poder. AP não determinístico &gt; determinístico (wwᴿ)."],
  ["Chomsky", "3 Reg/AF ⊊ 2 LLC/AP ⊊ 1 LSC/ALL ⊊ 0 RE/MT."]
];

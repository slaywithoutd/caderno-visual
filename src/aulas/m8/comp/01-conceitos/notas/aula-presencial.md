---
titulo: Aula presencial · Conceitos de linguagens formais
---

Slides do prof. Resina: a aula do Módulo 8 (semana 1) e, como revisão, as duas aulas do Módulo 6 sobre AFD e AFND. Estão embutidos logo abaixo.

## Anotações

- Toda linguagem regular pode ser expressa por um AFD ou por uma expressão regular (regex).
- Não determinístico: a partir de um estado posso ir para mais de uma opção de estado, ou fazer uma transição vazia (ε). Essa é a diferença entre determinístico e não determinístico.
- Aquele conjunto das partes, 𝒫(A).
- Trap state (estado de erro).
- O não determinístico não precisa de trap state.
- Representação das transições de um AP.

> [!atencao]
> Na anotação original estava "toda linguagem **formal**". O certo é "toda linguagem **regular**": aⁿbⁿ é uma linguagem formal e não tem AFD nem regex.

## O que o professor destacou

> [!professor]
> Um AP é um AFN com memória infinita, no formato de pilha. Só dá para acessar o topo.

> [!professor]
> Cada transição de AP tem 3 valores, nesta ordem: símbolo lido da fita, símbolo desempilhado do topo, símbolo empilhado. Para a transição acontecer, as duas condições valem ao mesmo tempo: o próximo símbolo da fita é o pedido **e** o topo da pilha é o pedido.

> [!dica]
> JFLAP 7.1 para simular. Em Preferences → Set the Empty String Character, troque para Epsilon. Ao criar um Pushdown Automaton, escolha **Single Character Input**. O JFLAP tem o próprio marcador de fundo (Z), mas na aula usamos `$`.

## Ponderadas do módulo (prof. Resina)

> [!prova]
> Semana 4: ponderada de Autômatos, Linguagens Formais e Gramáticas. Desafio presencial, sem consulta, de 50 a 60 minutos, e pode envolver programação.

- Semana 7: Análises Léxica e Sintática.
- Semana 8: Análise Semântica.
- Novo horário: 10h–12h dev · 14h–15h desafio · 14h45–16h autoestudo · 16h–16h15 café · 16h15–18h instrução.

## Exercícios propostos

Construa e simule APs para:

- L1 = { 0ⁿ1²ⁿ | n ≥ 1 } (ex.: 011, 001111)
- L2 = { wwᴿ | w ∈ {a,b}* } (ex.: aa, abba, baab)
- L3 = { aⁱbʲcᵏ | i, j, k ≥ 0 e i = j ou i = k } (ex.: aabbc, aabcc)
- L4 = { aⁿbⁿcⁿ | n ≥ 1 } (pegadinha: não existe AP para ela)

L1, L2 e L3 estão na Figura 8 da aula.

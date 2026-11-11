/* Exercícios do treino: enunciado, tipo, alfabeto, linguagem pedida (para os testes) e uma resposta.
   As respostas foram conferidas por força bruta (scripts/conferir no fim do arquivo de testes). */
import { L } from './motor.js';

export const exercicios = [
  /* ----- lista do professor: AFD (exercício 5) ----- */
  { id: 'l5a', fonte: 'lista', tipo: 'afd', alfabeto: '01', alvo: L.termina00,
    titulo: '5(a) · palavras que acabam em 00',
    dica: 'O estado lembra quantos 0 seguidos acabaram de ser lidos: nenhum, um, dois ou mais.',
    resposta: `inicial q0
finais q2
q0 0 q1
q0 1 q0
q1 0 q2
q1 1 q0
q2 0 q2
q2 1 q0` },
  { id: 'l5b', fonte: 'lista', tipo: 'afd', alfabeto: '01', alvo: L.tres0,
    titulo: '5(b) · palavras com três 0 consecutivos',
    dica: 'Conte os 0 seguidos até 3. Achou 000, a palavra já está aceita: o último estado prende.',
    resposta: `inicial q0
finais q3
q0 0 q1
q0 1 q0
q1 0 q2
q1 1 q0
q2 0 q3
q2 1 q0
q3 0 q3
q3 1 q3` },
  { id: 'l5c', fonte: 'lista', tipo: 'afd', alfabeto: '01', alvo: L.zeroEntre1,
    titulo: '5(c) · palavras em que cada 0 está entre dois 1',
    dica: 'Leia como: todo 0 tem um 1 logo antes e um 1 logo depois. Então não começa com 0, não termina com 0 e não tem 00. ε e 111 entram (não há 0 para violar a regra).',
    resposta: `inicial q0
finais q0 q1
q0 1 q1
q0 0 qe
q1 1 q1
q1 0 q2
q2 1 q1
q2 0 qe
qe 0 qe
qe 1 qe` },
  { id: 'l5d', fonte: 'lista', tipo: 'afd', alfabeto: '01', alvo: L.fim1101,
    titulo: '5(d) · palavras cujos quatro símbolos finais são 1101',
    dica: 'O estado guarda o maior pedaço do começo de 1101 que termina a leitura: ε, 1, 11, 110, 1101. Ao errar, não volte sempre para o início: 11 seguido de 1 ainda termina em 11.',
    resposta: `inicial q0
finais q4
q0 1 q1
q0 0 q0
q1 1 q2
q1 0 q0
q2 1 q2
q2 0 q3
q3 1 q4
q3 0 q0
q4 1 q2
q4 0 q0` },
  { id: 'l5e', fonte: 'lista', tipo: 'afd', alfabeto: '01', alvo: L.palin6,
    titulo: '5(e) · palíndromos de comprimento 6',
    dica: 'A linguagem é finita (8 palavras: x₁x₂x₃x₃x₂x₁), então é regular. Os 3 primeiros símbolos montam uma árvore; depois só falta conferir o espelho. Dá para fundir estados: depois do 4º símbolo só importa o que falta (x₂x₁).',
    resposta: `inicial s
finais ok
# árvore dos 3 primeiros símbolos (o nome do estado é o que foi lido)
s 0 a0
s 1 a1
a0 0 a00
a0 1 a01
a1 0 a10
a1 1 a11
a00 0 a000
a00 1 a001
a01 0 a010
a01 1 a011
a10 0 a100
a10 1 a101
a11 0 a110
a11 1 a111
# 4º símbolo = 3º; o estado passa a ser "falta x2 x1"
a000 0 f00
a000 1 erro
a001 1 f00
a001 0 erro
a010 0 f10
a010 1 erro
a011 1 f10
a011 0 erro
a100 0 f01
a100 1 erro
a101 1 f01
a101 0 erro
a110 0 f11
a110 1 erro
a111 1 f11
a111 0 erro
# 5º símbolo = 2º; falta só x1
f00 0 g0
f00 1 erro
f10 1 g0
f10 0 erro
f01 0 g1
f01 1 erro
f11 1 g1
f11 0 erro
g0 0 ok
g0 1 erro
g1 1 ok
g1 0 erro
ok 0 erro
ok 1 erro
erro 0 erro
erro 1 erro` },

  /* ----- lista do professor: AP (exercício 2) ----- */
  { id: 'p2a', fonte: 'lista', tipo: 'ap', alfabeto: 'ab', alvo: L.anbn1,
    titulo: '2(a) · AP para { aⁿbⁿ⁺¹ : n ≥ 0 }',
    dica: 'Empilhe um a por a. O primeiro b é o "a mais": leia sem desempilhar e troque de estado. Cada b depois desempilha um a.',
    resposta: `inicial q1
finais q2
q1 a ε -> q1 a
q1 b ε -> q2 ε
q2 b a -> q2 ε` },
  { id: 'p2b', fonte: 'lista', tipo: 'ap', alfabeto: 'ab', alvo: L.anb2n,
    titulo: '2(b) · AP para { aⁿb²ⁿ : n ≥ 0 }',
    dica: 'Um a por a na pilha; cada par de b tira um a. Use dois estados para os b: um lê o 1º b do par sem mexer na pilha, o outro lê o 2º e desempilha.',
    resposta: `inicial q1
finais q1 q2
q1 a ε -> q1 a
q1 b ε -> q3 ε
q2 b ε -> q3 ε
q3 b a -> q2 ε` },
  { id: 'p2c', fonte: 'lista', tipo: 'ap', alfabeto: '01', alvo: L.difer,
    titulo: '2(c) · AP para { w ∈ {0,1}* : o número de 0 é diferente do de 1 }',
    dica: 'A pilha guarda o excesso (só 0 ou só 1) em cima de um $. Igual cancela, diferente empilha. No fim, se o topo não é o $, sobrou excesso: esvazie e aceite.',
    resposta: `inicial q0
finais q3
q0 ε ε -> q1 $
q1 0 $ -> q1 0$
q1 0 0 -> q1 00
q1 0 1 -> q1 ε
q1 1 $ -> q1 1$
q1 1 1 -> q1 11
q1 1 0 -> q1 ε
q1 ε 0 -> q2 ε
q1 ε 1 -> q2 ε
q2 ε 0 -> q2 ε
q2 ε 1 -> q2 ε
q2 ε $ -> q3 ε` },
  { id: 'p2d', fonte: 'lista', tipo: 'ap', alfabeto: 'ab', alvo: L.anbmDif,
    titulo: '2(d) · AP para { aⁿbᵐ : m, n ≥ 0 e m ≠ n }',
    dica: 'É o AP de aⁿbⁿ com duas saídas: sobrou a na pilha quando os b acabaram (n > m) ou chegou b com a pilha já no $ (m > n).',
    resposta: `inicial q0
finais q4 q5
q0 ε ε -> q1 $
q1 a ε -> q1 a
q1 ε ε -> q2 ε
q2 b a -> q2 ε
# n > m: ainda tem a na pilha
q2 ε a -> q3 ε
q3 ε a -> q3 ε
q3 ε $ -> q4 ε
# m > n: chegou b com a pilha no fundo
q2 b $ -> q5 ε
q5 b ε -> q5 ε` },
  { id: 'p2e', fonte: 'lista', tipo: 'ap', alfabeto: 'abc', alvo: L.w1cw2,
    titulo: '2(e) · AP para { w₁cw₂ : w₁, w₂ ∈ {a,b}* e w₁ ≠ w₂ʳ }',
    dica: 'w₁ ≠ w₂ʳ é o mesmo que w₂ ≠ w₁ʳ. Empilhe w₁; depois do c, compare w₂ com a pilha (o topo é o fim de w₁). Aceite se algum símbolo não bate, se w₂ acaba antes ou se w₂ continua depois do $.',
    resposta: `inicial q0
finais q4 q6 q7
q0 ε ε -> q1 $
q1 a ε -> q1 a
q1 b ε -> q1 b
q1 c ε -> q2 ε
q2 a a -> q2 ε
q2 b b -> q2 ε
# um símbolo não bate: lê o resto e esvazia a pilha
q2 a b -> q3 ε
q2 b a -> q3 ε
q3 a ε -> q3 ε
q3 b ε -> q3 ε
q3 ε a -> q3 ε
q3 ε b -> q3 ε
q3 ε $ -> q4 ε
q4 a ε -> q4 ε
q4 b ε -> q4 ε
# w2 acabou antes: sobrou w1 na pilha (q6 não lê nada)
q2 ε a -> q5 ε
q2 ε b -> q5 ε
q5 ε a -> q5 ε
q5 ε b -> q5 ε
q5 ε $ -> q6 ε
# w2 é mais comprido: passou do $
q2 a $ -> q7 ε
q2 b $ -> q7 ε
q7 a ε -> q7 ε
q7 b ε -> q7 ε` },

  /* ----- autorais, no mesmo estilo ----- */
  { id: 'x1', fonte: 'autoral', tipo: 'afd', alfabeto: '01', alvo: L.par1,
    titulo: 'AFD · número par de 1',
    dica: 'Dois estados: "par até aqui" e "ímpar até aqui". O 0 não muda nada.',
    resposta: `inicial par
finais par
par 0 par
par 1 impar
impar 0 impar
impar 1 par` },
  { id: 'x2', fonte: 'autoral', tipo: 'afd', alfabeto: '01', alvo: L.mult3,
    titulo: 'AFD · binários (não vazios) múltiplos de 3',
    dica: 'Ler um bit b depois de n vira 2n + b. Guarde só o resto por 3: de r vai para (2r + b) mod 3. Não aceite ε: crie um estado inicial separado.',
    resposta: `inicial i
finais r0
i 0 r0
i 1 r1
r0 0 r0
r0 1 r1
r1 0 r2
r1 1 r0
r2 0 r1
r2 1 r2` },
  { id: 'x3', fonte: 'autoral', tipo: 'afn', alfabeto: '01', alvo: L.terceiroFim1,
    titulo: 'AFN · o antepenúltimo símbolo é 1',
    dica: 'No AFN, "chute" o 1 certo: fique em q0 lendo qualquer coisa e, num 1, aposte que faltam exatamente dois símbolos.',
    resposta: `inicial q0
finais q3
q0 0 q0
q0 1 q0 q1
q1 0 q2
q1 1 q2
q2 0 q3
q2 1 q3` },
  { id: 'x4', fonte: 'autoral', tipo: 'afn', alfabeto: '01', alvo: L.contem101,
    titulo: 'AFN · contém 101',
    dica: 'Três chutes em sequência e um estado final que prende.',
    resposta: `inicial q0
finais q3
q0 0 q0
q0 1 q0 q1
q1 0 q2
q2 1 q3
q3 0 q3
q3 1 q3` },
  { id: 'x5', fonte: 'autoral', tipo: 'ap', alfabeto: 'ab', alvo: L.anbn,
    titulo: 'AP · { aⁿbⁿ : n ≥ 0 }',
    dica: 'O clássico: empilha nos a, desempilha nos b. Com a convenção da lista (pilha vazia no fim) nem precisa de $.',
    resposta: `inicial q1
finais q1 q2
q1 a ε -> q1 a
q1 b a -> q2 ε
q2 b a -> q2 ε` },
  { id: 'x6', fonte: 'autoral', tipo: 'ap', alfabeto: 'ab', alvo: L.wwr,
    titulo: 'AP · { wwʳ : w ∈ {a,b}* } (palíndromos de tamanho par)',
    dica: 'Empilhe w e, num ponto qualquer, chute que chegou ao meio (transição ε). Depois desempilhe conferindo.',
    resposta: `inicial q1
finais q2
q1 a ε -> q1 a
q1 b ε -> q1 b
q1 ε ε -> q2 ε
q2 a a -> q2 ε
q2 b b -> q2 ε` },
  { id: 'x7', fonte: 'autoral', tipo: 'ap', alfabeto: '01', alvo: L.igual01,
    titulo: 'AP · mesmo número de 0 e de 1 (em qualquer ordem)',
    dica: 'O 2(c) ao contrário: aceite só quando o topo voltou ao $.',
    resposta: `inicial q0
finais q2
q0 ε ε -> q1 $
q1 0 $ -> q1 0$
q1 0 0 -> q1 00
q1 0 1 -> q1 ε
q1 1 $ -> q1 1$
q1 1 1 -> q1 11
q1 1 0 -> q1 ε
q1 ε $ -> q2 ε` },
  { id: 'x8', fonte: 'autoral', tipo: 'ap', alfabeto: 'abc', alvo: L.aibjck,
    titulo: 'AP · { aⁱbʲcᵏ : i = j ou i = k } (a L3 da aula 01)',
    dica: '"Ou" vira um chute no começo: um ramo confere a contra b, o outro confere a contra c.',
    resposta: `inicial q0
finais q3 q6
q0 ε ε -> q1 $
q1 a ε -> q1 a
# ramo i = j
q1 ε ε -> q2 ε
q2 b a -> q2 ε
q2 ε $ -> q3 ε
q3 c ε -> q3 ε
# ramo i = k
q1 ε ε -> q4 ε
q4 b ε -> q4 ε
q4 ε ε -> q5 ε
q5 c a -> q5 ε
q5 ε $ -> q6 ε` },
];

/* Exercícios de "qual linguagem?" (a lista dá o autômato; você descreve a linguagem). */
export const descrever = [
  { id: 'd2a', tipo: 'afd', alfabeto: 'abc', titulo: 'Lista 2(a) · AFD, F₁ = {q5}',
    texto: `inicial q1
finais q5
q1 a q2
q1 b q3
q1 c q4
q2 a q2
q2 b q4
q2 c q5
q3 a q4
q3 b q3
q3 c q5
q4 a q4
q4 b q4
q4 c q5
q5 a q4
q5 b q4
q5 c q5`,
    resposta: 'Palavras de comprimento ≥ 2 que terminam em c: { wc : w ∈ {a,b,c}⁺ }. O c sozinho fica de fora: q1 lendo c vai para q4. Leitura dos estados: q1 = ε, q2 = a⁺, q3 = b⁺, q5 = "terminou em c (e tem 2+ símbolos)", q4 = o resto.' },
  { id: 'd2b', tipo: 'afd', alfabeto: 'abc', titulo: 'Lista 2(b) · mesmo δ, F₂ = {q4}',
    texto: null, base: 'd2a', finais: 'q4',
    resposta: 'O complemento do que cai em q1, q2, q3 e q5. Em palavras: a palavra c, ou palavras que terminam em a ou b e não são só de a nem só de b (têm pelo menos dois símbolos diferentes). Exemplos: c, ab, ca, cb, aab, acb. Ficam de fora ε, aaa, bb, ac.' },
  { id: 'd2c', tipo: 'afd', alfabeto: 'abc', titulo: 'Lista 2(c) · AFD, F₃ = {q2}',
    texto: `inicial q1
finais q2
q1 a q2
q1 b q2
q1 c q1
q2 a q3
q2 b q2
q2 c q1
q3 a q1
q3 b q3
q3 c q2`,
    resposta: 'Não tem nome curto: descreva pelos estados. a anda q1 → q2 → q3 → q1 (um ciclo), b não muda de estado em q2 e q3 e leva q1 para q2, c volta um passo (q3 → q2 → q1) e fica em q1. Aceita as palavras que terminam em q2. Aceitas: a, b, ab, bb, ca, acb, aaaa. Rejeitadas: ε, c, aa, ba, ac. Numa prova, uma descrição pelos estados com exemplos aceitos e rejeitados é uma resposta válida quando a linguagem não tem padrão simples.' },
  { id: 'd1a', tipo: 'afn', alfabeto: 'abc', titulo: 'Lista 1(a) · AFN, F₁ = {q4}',
    texto: `inicial q1
finais q4
q1 a q1 q2 q3
q2 b q4
q3 c q4`,
    resposta: 'a⁺b ∪ a⁺c = { aⁿb, aⁿc : n ≥ 1 }. Um ou mais a e depois exatamente um b ou um c.' },
  { id: 'd1b', tipo: 'afn', alfabeto: 'abc', titulo: 'Lista 1(b) · mesmo δ, F₂ = {q1, q2, q3}',
    texto: null, base: 'd1a', finais: 'q1 q2 q3',
    resposta: 'a* = { aⁿ : n ≥ 0 }. q1 é inicial e final, então ε entra; qualquer b ou c leva a q4 (que não é final) ou mata o ramo.' },
  { id: 'd1c', tipo: 'afn', alfabeto: 'ab', titulo: 'Lista 1(c) · AFN, F₃ = {q2}',
    texto: `inicial q1
finais q2
q1 a q2
q2 b q1 q3
q3 a q1 q3`,
    resposta: 'a(ba⁺)*: um a, depois blocos "b seguido de um ou mais a". Em palavras: começa com um único a, termina em a e todo b vem entre a (sem bb). Ex.: a, aba, abaa, abaaba. Fora: ε, aa, ab, abba.' },
  { id: 'dp1', tipo: 'ap', alfabeto: 'ab', titulo: 'Lista AP 1 · Σ = {a,b}, Γ = {a}, F = {q2}',
    texto: `inicial q1
finais q2
q1 a ε -> q1 a
q1 a ε -> q2 ε
q1 b ε -> q1 a
q2 a a -> q2 ε
q2 b a -> q2 ε`,
    resposta: 'Palavras de comprimento ímpar com a no meio: { uav : u, v ∈ {a,b}* e |u| = |v| }. Em q1 cada símbolo empilha um a (conta |u|); um a chuta "é o meio" e vai para q2; em q2 cada símbolo desempilha (conta |v|). A aceitação exige estado final e pilha vazia, por isso aa (sobra um a na pilha) fica de fora.' },
];

export const cartoes = [
  ['Quanto é −11 mod 7? Por quê?', '3. O múltiplo de 7 logo abaixo de −11 é −14, e −11 = (−2)·7 + 3. O resto fica entre 0 e 6, nunca negativo.', 'resto'],
  ['O que significa 15 ≡ 3 (mod 12)?', '15 e 3 deixam o mesmo resto (3) na divisão por 12. Equivale a 12 dividir 15 − 3.', 'congruencia'],
  ['Que tipo de função deixa o Bob decriptar? Por quê?', 'Bijetora: só ela tem inversa. Se duas mensagens dessem o mesmo C, ele não saberia para qual voltar. De ℤ₂₆ em ℤ₂₆, injetora já basta.', 'bijecao'],
  ['O que o princípio de Kerckhoffs manda manter secreto?', 'Só a chave K. O algoritmo pode ser público (e é, como o AES).', 'cifra-simetrica'],
  ['Encripte P com César, K = 3, e decripte C com K = 3.', 'P = 15, 15 + 3 = 18 = S. C = 2, 2 − 3 = −1 = (−1)·26 + 25 = Z.', 'cesar'],
  ['Por que a força bruta quebra a César? Quais as três condições?', 'Algoritmo público, só 26 chaves e a Eve reconhece o texto claro quando aparece. Em média 13 testes.', 'forca-bruta'],
  ['Quantas chaves tem a monoalfabética? E quantas bijeções de ℤ₅ em ℤ₅?', '26! ≈ 4·10²⁶ (26 escolhas para o A, 25 para o B…). Em ℤ₅: 5! = 120, das quais a César usa 5.', 'monoalfabetica'],
  ['Por que 26! chaves não salvam a monoalfabética?', 'A chave é uma bijeção fixa: troca o nome da letra, não a frequência. Contando letras (Al-Kindi), Q = A, T = E, G = O. Espaço grande é necessário, não suficiente.', 'frequencia'],
  ['Calcule mdc(21, 15) por Euclides.', '21 = 1·15 + 6, 15 = 2·6 + 3, 6 = 2·3 + 0. Par (3, 0): mdc = 3.', 'mdc'],
  ['Quando a tem inverso módulo n? Dê 3⁻¹ mod 10 e diga por que 13 não tem inverso mod 26.', 'Se e somente se mdc(a, n) = 1. 3·7 = 21 ≡ 1, então 3⁻¹ = 7. mdc(13, 26) = 13: 13x deixa resto 0 ou 13, nunca 1.', 'inverso'],
  ['Com K = (7, 3), encripte C e decripte o resultado. E se fizer a volta na ordem errada?', '2·7 + 3 = 17 = R. Volta: 17 − 3 = 14, 14·15 = 210 ≡ 2 = C. Ordem errada: 17·15 − 3 = 252 ≡ 18 = S.', 'afim'],
  ['(4M + 1) mod 26 é bijetora? Dê um contraexemplo.', 'Não, mdc(4, 26) = 2. E(0) = 1 e E(13) = 53 = 2·26 + 1 = 1.', 'afim'],
];

export const cola = [
  ['Resto', 'a = q·n + r, 0 ≤ r < n; r = a mod n. Negativo: some n até cair em 0…n − 1.', 'resto'],
  ['Congruência', 'a ≡ b (mod n) ⟺ mesmo resto ⟺ n divide a − b.', 'congruencia'],
  ['Bijeção', 'Injetora + sobrejetora; só ela tem f⁻¹. Em ℤ₂₆ → ℤ₂₆, achar duas entradas com a mesma saída derruba.', 'bijecao'],
  ['Modelo', 'C = E(K, M), M = D(K, C), mesma chave. Kerckhoffs: só a chave é secreta.', 'cifra-simetrica'],
  ['César', 'C = (M + K) mod 26, M = (C − K) mod 26; 26 chaves; A = 0 … Z = 25.', 'cesar'],
  ['Força bruta', 'Testa todas as chaves; média = metade. César: 13 testes.', 'forca-bruta'],
  ['Monoalfabética', 'Chave = bijeção; 26! ≈ 4·10²⁶; força bruta ≈ 6,3·10⁹ anos.', 'monoalfabetica'],
  ['Frequência', 'Bijeção fixa preserva frequência: A, E, O. Necessário ≠ suficiente.', 'frequencia'],
  ['Euclides', 'mdc(a, b) = mdc(b, a mod b) até b = 0; resposta = último a.', 'mdc'],
  ['Inverso', 'a·a⁻¹ ≡ 1 (mod n); existe ⟺ mdc(a, n) = 1. Mod 26: ímpares ≠ 13.', 'inverso'],
  ['Afim', 'C = (aM + b) mod 26; M = a⁻¹(C − b); bijetora ⟺ mdc(a, 26) = 1; 312 chaves.', 'afim'],
];

export const cartoes = [
  ['H : {0, 1}* → {0, 1}ⁿ pode ser injetora? Justifique.', 'Não. O domínio é infinito e o contradomínio tem 2ⁿ elementos: pela casa dos pombos, duas mensagens caem no mesmo resumo.', 'colisao'],
  ['Calcule o resumo de SIM e de BIT no hash de brinquedo (soma das letras, resto por 10).', 'SIM: 18 + 8 + 12 = 38 → 8. BIT: 1 + 8 + 19 = 28 → 8. Colidem.', 'colisao'],
  ['Um invasor troca o arquivo e o SHA-256 da página. A conferência passa?', 'Passa: ele publica o resumo do arquivo falso. O resumo precisa vir de uma referência confiável, ou de uma chave.', 'usos'],
  ['Diferencie pré-imagem, segunda pré-imagem e colisão.', 'Pré-imagem: dado h, ache M com H(M) = h. Segunda: dada M, ache M′ ≠ M com o mesmo resumo. Colisão: ache quaisquer M ≠ M′ com o mesmo resumo (a mais barata).', 'ataques'],
  ['Num resumo de 40 bits, quanto custa uma pré-imagem em média? E uma colisão?', 'Pré-imagem 2³⁹ (metade de 2⁴⁰). Colisão 2²⁰ (a raiz).', 'aniversario'],
  ['Por que 23 pessoas bastam para a chance de aniversário repetido passar de metade?', 'Porque são 23·22/2 = 253 pares. Pr[sem repetição] = 365/365 · … · 343/365 ≈ 0,4927, então Pr[repetição] ≈ 0,5073.', 'aniversario'],
  ['10.000 registros, senhas de 5 dígitos, 10⁷ resumos/s. Quanto tempo sem sal e com sal?', 'Sem sal: 10⁵/10⁷ = 0,01 s. Com sal: 10⁴ · 10⁵ = 10⁹ cálculos, 100 s. O sal multiplica (U · D).', 'sal'],
  ['O Mallory troca SIM por NAO. Por que o Bob aceita quando só vai o resumo?', 'Sem chave, qualquer um calcula H: o Mallory manda NAO com H(NAO) = 7 e o Bob confere 7 = 7. O resumo da autenticação precisa de uma chave (MAC).', 'mac'],
  ['Calcule H(254) com f(h, m) = (3h + m) mod 10, IV = 0, e escreva como composição.', '0 → 2 → 11 → 1 → 7. H(254) = f(f(f(0, 2), 5), 4) = 7. Somar os blocos (resumo 1) é erro.', 'cadeia'],
  ['Quantos zeros o SHA-256 põe numa mensagem de 500 bits? Quantos blocos?', '500 + 1 + 64 = 565 > 512. k = 1.024 − 565 = 459 zeros, 2 blocos.', 'preenchimento'],
  ['Por que publicar H(K ‖ M) não serve de MAC?', 'O resumo é o último estado da cadeia: quem o vê continua com mais blocos. Com resumo 6 e bloco 5: 3·6 + 5 = 23 → 3, sem saber K.', 'extensao'],
  ['Calcule o HMAC de brinquedo de 25 (K1 = 4, K2 = 6). O Bob aceita 31 com a mesma etiqueta?', 'H(425) = 7, H(67) = 5: etiqueta 5. H(431) = 6, H(66) = 4 ≠ 5: rejeita.', 'hmac'],
];

export const cola = [
  ['Função de hash', 'H : {0, 1}* → {0, 1}ⁿ; determinística; SHA-256 = 64 dígitos hexa.', 'hash'],
  ['Avalanche', 'Um bit muda na entrada, cerca de metade muda no resumo (CASA × CASC: 117/256).', 'hash'],
  ['Referência', 'Resumo protege a integridade só se vier de fonte confiável; autenticação pede chave.', 'usos'],
  ['Colisão', 'M ≠ M′, H(M) = H(M′). Casa dos pombos: toda H tem. 2ᵇ⁻ⁿ mensagens por resumo.', 'colisao'],
  ['XOR de blocos', '1011 ⊕ 0110 ⊕ 1100 = 0001; bloco forjado = XOR do resto ⊕ resumo desejado.', 'xor-simples'],
  ['Ataques', 'Pré-imagem e 2ª pré-imagem: 2ⁿ⁻¹. Colisão: 2ⁿᐟ². H⁻¹(h) é conjunto.', 'ataques'],
  ['Aniversário', 'Pares q(q − 1)/2; 23 → 253, Pr ≈ 0,5073. Segurança s bits pede n = 2s.', 'aniversario'],
  ['Sal', 'Sem sal D cálculos, com sal U · D. Senha real: bcrypt, Argon2.', 'sal'],
  ['MAC', 'Valor com chave secreta: integridade + autenticação. Ainda muitos para um.', 'mac'],
  ['Cadeia', 'h₀ = IV, hᵢ = f(hᵢ₋₁, mᵢ), H = hₖ. Brinquedo: f = (3h + m) mod 10; H(381) = 2.', 'cadeia'],
  ['Preenchimento', 'ℓ + 1 + k + 64 = múltiplo de 512 (SHA-256). Sempre feito.', 'preenchimento'],
  ['HMAC', 'H(K2 ‖ H(K1 ‖ M)); esconde o estado de dentro; não prova a terceiros.', 'hmac'],
];

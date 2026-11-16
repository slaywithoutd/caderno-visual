/* Glossário da aula 01 de Matemática (Fundamentos de criptografia).
   Chaves com prefixo cr- para não colidir com termos de Computação (conjunto, função de transição…). */
export default {
  /* Base: resto e congruência */
  'cr-algoritmo-divisao': { t: 'Algoritmo da divisão', m: ['algoritmo da divisão'], d: 'Para todo inteiro a e todo n > 0 existem q e r únicos com a = q·n + r e 0 ≤ r < n.', f: 'a = q·n + r, 0 ≤ r < n', see: ['cr-quociente', 'cr-resto'] },
  'cr-quociente': { t: 'Quociente', m: ['quociente', 'quocientes'], d: 'Quantas vezes n cabe inteiro em a: o maior inteiro q com q·n ≤ a. Também se escreve ⌊a/n⌋ (piso de a sobre n).', f: 'q = ⌊a/n⌋' },
  'cr-resto': { t: 'Resto', m: ['resto', 'restos'], d: 'O que sobra da divisão inteira: r = a − q·n. Fica sempre entre 0 e n − 1, mesmo quando a é negativo.', f: 'r = a − q·n', see: ['cr-mod'] },
  'cr-mod': { t: 'a mod n (operação módulo)', m: ['aritmética modular', 'operação mod', 'a mod n'], d: 'O resto da divisão de a por n. "17 mod 5 = 2" lê-se "17 módulo 5 é 2".', f: 'a mod n = a − ⌊a/n⌋·n', a: 'o ponteiro do relógio: ele só mostra o que sobra depois das voltas inteiras.' },
  'cr-zn': { t: 'ℤn (Z n)', m: ['ℤ₂₆', 'ℤ26', 'z26', 'ℤₙ', 'ℤn'], d: 'O conjunto dos restos possíveis na divisão por n: {0, 1, …, n − 1}. Nas cifras da aula, ℤ₂₆ são as 26 letras numeradas de A = 0 a Z = 25.', x: 'O Z vem do alemão Zahlen, "números".' },
  'cr-congruencia': { t: 'Congruência módulo n', m: ['congruência', 'congruências', 'congruentes', 'congruente'], d: 'a ≡ b (mod n) quando a e b deixam o mesmo resto na divisão por n. 15 ≡ 3 (mod 12).', f: 'a ≡ b (mod n) ⟺ a mod n = b mod n', a: '15h e 3h no relógio: o ponteiro fica no mesmo lugar.' },
  'cr-classe': { t: 'Classe de resto', m: ['classe de resto', 'classes de resto'], d: 'Todos os inteiros que deixam o mesmo resto módulo n. Módulo 2 há duas classes: pares (resto 0) e ímpares (resto 1).' },

  /* Base: funções */
  'cr-funcao': { t: 'Função', m: ['função', 'funções'], d: 'Regra f : A → B que associa a cada elemento de A um único elemento de B.', f: 'f : A → B' },
  'cr-dominio': { t: 'Domínio', m: ['domínio'], d: 'O conjunto A das entradas de uma função f : A → B.' },
  'cr-contradominio': { t: 'Contradomínio', m: ['contradomínio'], d: 'O conjunto B onde as saídas de f : A → B podem cair. Nem todo elemento dele precisa ser atingido.' },
  'cr-imagem': { t: 'Imagem', m: ['imagem de', 'imagens'], d: 'f(x) é a imagem de x: a saída que a função dá para a entrada x.' },
  'cr-injetora': { t: 'Função injetora (um para um)', m: ['injetora', 'injetoras', 'um para um'], d: 'Entradas diferentes dão saídas diferentes: se M₁ ≠ M₂, então f(M₁) ≠ f(M₂).', a: 'cada pessoa tem o próprio armário; ninguém divide.' },
  'cr-sobrejetora': { t: 'Função sobrejetora', m: ['sobrejetora', 'sobrejetoras'], d: 'Todo elemento do contradomínio recebe pelo menos uma flecha: é imagem de alguém.' },
  'cr-bijetora': { t: 'Função bijetora (bijeção)', m: ['bijetora', 'bijetoras', 'bijeção', 'bijeções'], d: 'Injetora e sobrejetora ao mesmo tempo. É a única que tem inversa. Uma bijeção de um conjunto nele mesmo é um embaralhamento (permutação) dos seus elementos.', see: ['cr-inversa'] },
  'cr-inversa': { t: 'Função inversa', m: ['função inversa', 'f inversa', 'inversa'], d: 'f⁻¹ desfaz f: f⁻¹(f(x)) = x. Só existe quando f é bijetora; desenhe as flechas ao contrário.', f: 'f⁻¹(f(x)) = x' },
  'cr-composicao': { t: 'Composição de funções', m: ['composição', 'composta'], d: 'g ∘ f aplica primeiro f e depois g. A inversa desfaz na ordem contrária: (g ∘ f)⁻¹ = f⁻¹ ∘ g⁻¹.', f: '(g ∘ f)(x) = g(f(x))', a: 'calçar meia e depois sapato; para tirar, primeiro o sapato.' },

  /* Vocabulário da criptografia */
  'cr-criptologia': { t: 'Criptologia', m: ['criptologia'], d: 'A área inteira: criptografia mais criptoanálise.' },
  'cr-criptografia': { t: 'Criptografia', m: ['criptografia'], d: 'Criação de esquemas de encriptação: como esconder uma mensagem e recuperá-la com a chave.', x: 'Do grego kryptós (escondido) + gráphein (escrever).' },
  'cr-criptoanalise': { t: 'Criptoanálise', m: ['criptoanálise', 'criptoanalista'], d: 'Recuperar o texto claro ou a chave sem conhecer a chave.', see: ['cr-forca-bruta', 'cr-frequencia'] },
  'cr-ataque-passivo': { t: 'Ataque passivo', m: ['ataque passivo', 'ataques passivos'], d: 'Só escuta o canal, sem mudar nada. É o papel da Eve (eavesdropper). Ameaça a confidencialidade.' },
  'cr-ataque-ativo': { t: 'Ataque ativo', m: ['ataque ativo', 'ataques ativos'], d: 'Altera, insere ou repete mensagens no caminho. É o papel do Mallory (malicious). Ameaça integridade e autenticação.' },
  'cr-confidencialidade': { t: 'Confidencialidade (sigilo)', m: ['confidencialidade', 'sigilo'], d: 'Serviço de segurança que responde "quem pode ler?": só quem tem autorização lê o conteúdo.' },
  'cr-integridade': { t: 'Integridade', m: ['integridade'], d: 'Serviço de segurança que responde "alguém mudou?": o dado chega como saiu.' },
  'cr-autenticacao': { t: 'Autenticação (autenticidade)', m: ['autenticação', 'autenticidade'], d: 'Serviço de segurança que responde "veio de quem diz?": a origem é quem diz ser.' },
  'cr-irretratabilidade': { t: 'Irretratabilidade (não repúdio)', m: ['irretratabilidade', 'não repúdio'], d: 'Serviço de segurança que responde "o autor pode negar?": quem enviou não consegue negar que enviou.' },

  /* Cifra simétrica */
  'cr-texto-claro': { t: 'Texto claro (M)', m: ['texto claro', 'textos claros', 'plaintext'], d: 'A mensagem original, legível. Nos slides é M; no livro, X.' },
  'cr-texto-cifrado': { t: 'Texto cifrado (C)', m: ['texto cifrado', 'textos cifrados', 'ciphertext'], d: 'O que sai da encriptação e passa pelo canal público. Nos slides é C; no livro, Y.' },
  'cr-chave': { t: 'Chave (K)', m: ['chave secreta', 'chave', 'chaves'], d: 'O parâmetro secreto que escolhe qual função a cifra aplica. Na César, K é o deslocamento; na afim, o par (a, b).' },
  'cr-encriptacao': { t: 'Encriptação (E)', m: ['encriptação', 'encriptar', 'encripta', 'cifrar'], d: 'Aplicar o algoritmo E com a chave: C = E(K, M).', f: 'C = E(K, M)' },
  'cr-decriptacao': { t: 'Decriptação (D)', m: ['decriptação', 'decriptar', 'decripta', 'decifrar'], d: 'Aplicar o algoritmo D com a mesma chave: M = D(K, C). D(K, ·) é a inversa de E(K, ·).', f: 'M = D(K, C)' },
  'cr-cifra': { t: 'Cifra', m: ['cifra', 'cifras'], d: 'O par de algoritmos de encriptação e decriptação. Com a chave fixa, a encriptação é uma função.', x: 'Vem do árabe ṣifr, "vazio" ou "zero"; no latim medieval virou cifra, o algarismo, e depois o código secreto.' },
  'cr-cifra-simetrica': { t: 'Cifra simétrica', m: ['cifra simétrica', 'cifras simétricas', 'encriptação simétrica', 'criptografia simétrica'], d: 'A mesma chave secreta encripta e decripta. Alice e Bob precisam ter combinado a chave antes, por um canal seguro.' },
  'cr-kerckhoffs': { t: 'Princípio de Kerckhoffs', m: ['princípio de kerckhoffs'], d: 'O algoritmo pode ser público; a segurança depende só do segredo da chave (Auguste Kerckhoffs, 1883).' },
  'cr-seg-incondicional': { t: 'Segurança incondicional', m: ['segurança incondicional', 'incondicionalmente segura'], d: 'O texto cifrado não dá informação nenhuma sobre o texto claro, por mais tempo e computação que o atacante tenha. Só o one-time pad tem.' },
  'cr-seg-computacional': { t: 'Segurança computacional', m: ['segurança computacional', 'computacionalmente segura'], d: 'Quebrar a cifra custa mais do que a informação vale, ou leva mais tempo do que ela continua útil.' },

  /* Cifras clássicas */
  'cr-cesar': { t: 'Cifra de César', m: ['cifra de césar', 'césar'], d: 'Soma a chave K a cada letra, módulo 26. Com K = 3, PAO vira SDR.', f: 'C = (M + K) mod 26' },
  'cr-forca-bruta': { t: 'Força bruta', m: ['força bruta', 'busca exaustiva'], d: 'Testar todas as chaves até uma dar um texto claro que faz sentido.' },
  'cr-espaco-chaves': { t: 'Espaço de chaves', m: ['espaço de chaves'], d: 'O conjunto de todas as chaves possíveis. A César tem 26; a monoalfabética, 26! ≈ 4·10²⁶.' },
  'cr-monoalfabetica': { t: 'Cifra monoalfabética', m: ['cifra monoalfabética', 'monoalfabética', 'monoalfabéticas'], d: 'A chave é uma bijeção qualquer das 26 letras: cada letra vira sempre a mesma outra letra.' },
  'cr-fatorial': { t: 'Fatorial (n!)', m: ['fatorial'], d: 'n! = n·(n − 1)·…·2·1. Conta de quantos jeitos dá para ordenar n coisas. 5! = 120.', f: 'n! = n·(n − 1)·…·1' },
  'cr-frequencia': { t: 'Análise de frequência', m: ['análise de frequência', 'frequência das letras'], d: 'Contar quantas vezes cada símbolo aparece no texto cifrado e casar com as letras mais comuns da língua (no português, A, E e O).' },
  'cr-playfair': { t: 'Cifra de Playfair', m: ['playfair'], d: 'Cifra de pares de letras sobre uma grade 5×5 montada a partir de uma palavra-chave. Esconde a frequência de letras isoladas, mas não a de pares.' },
  'cr-hill': { t: 'Cifra de Hill', m: ['cifra de hill'], d: 'Multiplica cada bloco de letras por uma matriz inversível módulo 26 (Lester Hill, 1929).', f: 'C = K·P mod 26' },
  'cr-matriz': { t: 'Matriz', m: ['matriz', 'matrizes'], d: 'Tabela retangular de números. Uma matriz 2×2 vezes um par (x, y) dá outro par: cada linha da matriz multiplica o par e soma.' },
  'cr-determinante': { t: 'Determinante (2×2)', m: ['determinante'], d: 'Para a matriz de linhas (a, b) e (c, d), det = ad − bc. A matriz tem inversa módulo 26 quando mdc(det, 26) = 1.', f: 'det = ad − bc' },
  'cr-polialfabetica': { t: 'Cifra polialfabética', m: ['polialfabética', 'polialfabéticas'], d: 'Usa várias substituições e troca de uma para outra ao longo do texto, conforme a chave.' },
  'cr-vigenere': { t: 'Cifra de Vigenère', m: ['vigenère'], d: 'Cada letra usa uma César diferente, dada pela letra da chave repetida embaixo do texto.', f: 'Cᵢ = (Mᵢ + Kᵢ) mod 26' },
  'cr-otp': { t: 'One-time pad', m: ['one-time pad', 'chave de uso único'], d: 'Vigenère com chave aleatória do tamanho da mensagem, usada uma vez só. Tem segurança incondicional (Shannon, 1949).' },
  'cr-enigma': { t: 'Enigma (máquina de rotores)', m: ['enigma', 'máquina de rotores'], d: 'Máquina alemã de rotores da Segunda Guerra. Cada tecla gira os rotores, então a substituição muda a cada letra: é uma polialfabética mecânica.' },

  /* Inverso e afim */
  'cr-mdc': { t: 'mdc (máximo divisor comum)', m: ['máximo divisor comum', 'mdc'], d: 'O maior inteiro que divide a e b ao mesmo tempo. mdc(12, 8) = 4.' },
  'cr-coprimos': { t: 'Coprimos (primos entre si)', m: ['coprimos', 'primos entre si', 'relativamente primos'], d: 'Dois inteiros com mdc = 1: não têm divisor comum além do 1. 8 e 15 são coprimos sem que nenhum dos dois seja primo.' },
  'cr-euclides': { t: 'Algoritmo de Euclides', m: ['algoritmo de euclides', 'euclides'], d: 'Calcula o mdc trocando o par (a, b) por (b, a mod b) até b = 0; a resposta é o a que sobra.', f: 'mdc(a, b) = mdc(b, a mod b)' },
  'cr-inverso': { t: 'Inverso multiplicativo módulo n', m: ['inverso multiplicativo', 'inverso modular', 'inversos'], d: 'O número a⁻¹ com a·a⁻¹ ≡ 1 (mod n). Existe se e somente se mdc(a, n) = 1. 3⁻¹ ≡ 7 (mod 10).', f: 'a·a⁻¹ ≡ 1 (mod n)' },
  'cr-afim': { t: 'Cifra afim', m: ['cifra afim', 'afim'], d: 'Multiplica por a e soma b, módulo 26. Com K = (a, b), é bijetora se e somente se mdc(a, 26) = 1.', f: 'C = (aM + b) mod 26' },

  /* Prévia da chave pública (vídeos do autoestudo) */
  'cr-primo': { t: 'Número primo', m: ['número primo', 'números primos', 'primo', 'primos'], d: 'Inteiro maior que 1 cujos únicos divisores positivos são 1 e ele mesmo: 2, 3, 5, 7, 11…' },
  'cr-fatoracao': { t: 'Fatoração em primos', m: ['fatoração', 'fatorar'], d: 'Escrever um inteiro como produto de primos: 50 = 2·5·5. Todo inteiro maior que 1 tem uma, e só uma, a menos da ordem.' },
  'cr-mao-unica': { t: 'Função de mão única', m: ['função de mão única', 'funções de mão única', 'one-way function'], d: 'Fácil de calcular, muito difícil de desfazer sem uma informação extra. Multiplicar dois primos grandes é fácil; achá-los a partir do produto, não.' },
  'cr-chave-publica': { t: 'Chave pública e chave privada', m: ['chave pública', 'chaves públicas', 'chave privada'], d: 'Na criptografia assimétrica, cada pessoa publica uma chave que todos usam para encriptar e guarda outra, privada, que é a única que decripta.' },
  'cr-rsa': { t: 'RSA', m: ['rsa'], d: 'Cifra de chave pública de Rivest, Shamir e Adleman (1977). Encripta com C = Mᵉ mod n e decripta com M = Cᵈ mod n; a segurança vem da dificuldade de fatorar n = p·q.', f: 'C = Mᵉ mod n, M = Cᵈ mod n' },
};

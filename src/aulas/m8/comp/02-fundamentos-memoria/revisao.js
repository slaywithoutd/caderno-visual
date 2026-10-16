/* Revisão da aula: cartões (pergunta, resposta) e cola de uma página (tópico, resumo).
   Aparecem no fim da aula e na página de revisão da matéria. Pode usar HTML simples. */
export const cartoes = [
  ['Qual a diferença entre latência e throughput?', 'Latência (tempo de execução) é quanto uma tarefa leva do começo ao fim. Throughput é quantas tarefas terminam por segundo. Mais processadores melhoram o throughput sem diminuir a latência de uma tarefa.', 'latencia'],
  ['Y leva 12 s e X leva 8 s. Quantas vezes X é mais rápido?', 'n = tempo_Y / tempo_X = 12 / 8 = 1,5.', 'speedup'],
  ['Escreva a equação de desempenho da CPU.', 'Tempo de CPU = IC × CPI × tempo de ciclo = IC × CPI / f.', 'equacao-cpu'],
  ['IC = 2 × 10⁹, CPI = 1,5, clock de 3 GHz. Qual o tempo?', '2 × 10⁹ × 1,5 / (3 × 10⁹) = 1 s.', 'equacao-cpu'],
  ['Mix: 60% CPI 1, 30% CPI 2, 10% CPI 4. Qual o CPI médio?', '0,6 × 1 + 0,3 × 2 + 0,1 × 4 = 0,6 + 0,6 + 0,4 = 1,6.', 'equacao-cpu'],
  ['Lei de Amdahl: f = 0,5 e s = 4. Qual o speedup global? E o teto?', 'S = 1 / (0,5 + 0,5/4) = 1 / 0,625 = 1,6. Teto: 1 / (1 − 0,5) = 2.', 'amdahl'],
  ['Como a potência dinâmica depende de tensão e frequência? O que acontece com V e f 15% menores?', 'P ∝ ½ · C · V² · f. Com os dois 15% menores: 0,85³ ≈ 0,61 da potência original.', 'potencia-dinamica'],
  ['O que foi a escala de Dennard e o que o fim dela causou?', 'Ao encolher transistores, tensão e corrente caíam e a potência por área ficava constante. Por volta de 2004 a tensão parou de cair, o clock travou por calor e a indústria passou para o multicore.', 'dennard'],
  ['MTTF = 999 h e MTTR = 1 h. Qual a disponibilidade e o MTBF?', 'Disponibilidade = 999 / 1 000 = 99,9%. MTBF = MTTF + MTTR = 1 000 h.', 'confiabilidade'],
  ['Por que o custo de um chip cresce mais rápido que a área do die?', 'Die maior: cabem menos por wafer e o yield cai (mais chance de pegar um defeito). Os dois efeitos se multiplicam.', 'custo-die'],
  ['Hit time de 2 ns, miss rate 4%, miss penalty 50 ns. Qual o AMAT?', 'AMAT = 2 + 0,04 × 50 = 4 ns.', 'amat'],
  ['Cache de 16 KiB, blocos de 32 B, 2 vias, endereço de 32 bits. Quantos bits de offset, índice e tag?', 'Linhas: 16 384 / 32 = 512; conjuntos: 256. Offset: 5 bits; índice: 8 bits; tag: 32 − 8 − 5 = 19 bits.', 'enderecamento-cache'],
  ['Write-through × write-back: o que muda e para que serve o dirty bit?', 'Write-through grava na cache e na memória a cada escrita (com write buffer). Write-back grava só na cache; o dirty bit marca o bloco modificado, que é gravado na memória quando sai.', 'escrita'],
  ['Classifique os três Cs.', 'Compulsório: primeiro acesso ao bloco. Capacidade: não cabe tudo, nem numa totalmente associativa do mesmo tamanho. Conflito: cabia, mas o bloco foi expulso por disputa do mesmo conjunto.', 'tres-cs'],
  ['L1: hit 1 ciclo, 5% miss. L2: hit 10 ciclos, 40% miss local. Memória 100 ciclos. AMAT?', '1 + 0,05 × (10 + 0,4 × 100) = 1 + 0,05 × 50 = 3,5 ciclos.', 'multinivel'],
  ['Para que serve a TLB?', 'É uma cache de traduções página virtual → moldura. Evita ler a tabela de páginas na memória a cada acesso.', 'tlb'],
];

export const cola = [
  ['Desempenho', 'latência × throughput. n vezes mais rápido = tempo_lento / tempo_rápido. SPECRatio resumido por média geométrica.', 'latencia'],
  ['Equação da CPU', 'T = IC × CPI × Tc = IC × CPI / f. CPI = Σ (ICᵢ/IC) × CPIᵢ.', 'equacao-cpu'],
  ['Amdahl', 'S = 1 / ((1 − f) + f/s); teto 1/(1 − f). Torne rápido o caso comum.', 'amdahl'],
  ['Potência', 'dinâmica ∝ ½·C·V²·f; estática = fuga × V. Fim de Dennard → multicore.', 'potencia-dinamica'],
  ['Confiabilidade', 'MTBF = MTTF + MTTR; disponibilidade = MTTF / (MTTF + MTTR); taxas de falha somam.', 'confiabilidade'],
  ['Custo do die', 'custo do wafer / (dies por wafer × yield); cresce mais rápido que a área.', 'custo-die'],
  ['Localidade', 'temporal (reusa) e espacial (vizinhos). Base de toda a hierarquia.', 'localidade'],
  ['Mapeamento', 'direto (1 linha), associativa em conjunto (n vias), totalmente associativa (qualquer).', 'mapeamento'],
  ['Endereço na cache', 'tag | índice | offset. offset = log₂ bloco; índice = log₂ conjuntos.', 'enderecamento-cache'],
  ['Escrita', 'write-through (+ buffer) × write-back (+ dirty bit); write allocate × no-write allocate.', 'escrita'],
  ['AMAT', 'hit time + miss rate × miss penalty. Multinível: hit₁ + miss₁ × (hit₂ + miss₂ × pen₂). Misses: compulsório, capacidade, conflito.', 'amat'],
  ['Memória virtual', 'VA = VPN | offset → tabela de páginas → moldura | offset. TLB = cache de traduções.', 'memoria-virtual'],
];

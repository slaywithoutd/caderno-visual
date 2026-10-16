/* Revisão da aula 03: cartões (pergunta, resposta) e cola de uma página (tópico, resumo).
   Aparecem no fim da aula e na página de revisão da matéria. Pode usar HTML simples. */
export const cartoes = [
  ['O pipeline diminui o tempo de execução de cada instrução?', 'Não. Cada instrução ainda passa por todos os estágios (e fica um pouco mais lenta, pelo overhead). O que aumenta é a vazão: termina uma instrução por ciclo.'],
  ['Quais são os 5 estágios do pipeline clássico e o que cada um faz?', 'IF busca a instrução; ID decodifica e lê registradores; EX faz a conta na ULA (ou calcula o endereço); MEM lê ou escreve a memória de dados; WB grava o resultado no registrador.'],
  ['Sem pipeline: 4,4 ns por instrução. Com pipeline: ciclo de 1,2 ns. Qual a aceleração?', '4,4 / 1,2 ≈ 3,7. Menor que os 5 ideais por causa do overhead de 0,2 ns por ciclo.'],
  ['Pipeline de 5 estágios, 0,25 ciclo de stall por instrução. CPI e aceleração?', 'CPI = 1 + 0,25 = 1,25. Aceleração = 5 / 1,25 = 4.'],
  ['Quais são os três tipos de hazard e o que falta em cada um?', 'Estrutural: falta hardware (recurso disputado). De dados: falta um valor que outra instrução ainda vai produzir. De controle: falta saber o caminho depois de um desvio.'],
  ['RAW, WAR e WAW: qual é dependência verdadeira e quais somem com renomeação?', 'RAW (leitura após escrita) é a verdadeira. WAR (antidependência) e WAW (dependência de saída) são dependências de nome e somem com renomeação.'],
  ['Por que um load seguido de uso custa 1 stall mesmo com forwarding?', 'O dado só existe no fim do MEM, e a instrução seguinte precisaria dele no começo do EX, no mesmo ciclo. Forwarding não volta no tempo.'],
  ['20% de desvios, 10% de erro de predição, penalidade de 3 ciclos. Quanto entra no CPI?', '0,20 × 0,10 × 3 = 0,06 ciclo por instrução.'],
  ['Num desvio de laço (T T T N repetido), quantos erros por execução têm os preditores de 1 e de 2 bits?', '1 bit: dois (na saída e na primeira volta seguinte). 2 bits: um (só na saída), porque a previsão só muda depois de dois erros seguidos.'],
  ['Quantos bits tem um preditor correlacionado (2, 2) com 1K linhas?', '2² × 2 × 1024 = 8K bits, o mesmo de um (0, 2) com 4K linhas.'],
  ['O laço x[i] = x[i] + s leva 9 ciclos por elemento. Desenrolado 4 vezes e escalonado, 14 ciclos por volta. Qual o ganho?', '14 / 4 = 3,5 ciclos por elemento. Aceleração 9 / 3,5 ≈ 2,6.'],
  ['No Tomasulo, o que é uma estação de reserva e o que passa pelo CDB?', 'A estação guarda a instrução emitida e seus operandos: o valor ou a etiqueta de quem vai produzi-lo. Pelo CDB passa cada resultado com a etiqueta, e todos que esperam aquela etiqueta copiam o valor.'],
  ['Como o Tomasulo elimina WAR e WAW?', 'Renomeando: na emissão, os operandos viram valores ou etiquetas de estação, e o registrador de destino passa a apontar para a última estação que vai escrevê-lo. Escritas posteriores não afetam quem já guardou o valor, e resultados velhos não são gravados.'],
  ['Para que serve o ROB?', 'Guarda os resultados das instruções especulativas, na ordem do programa, até o commit. Só na cabeça da fila o valor vai para registradores ou memória. Isso permite desfazer desvios mal previstos e ter exceções precisas.'],
  ['O que é uma exceção precisa?', 'No desvio para o tratador, tudo antes da instrução culpada foi efetivado e nada depois dela mudou o estado. Com execução fora de ordem, exige commit em ordem.'],
  ['Superescalar × VLIW: quem decide quais instruções vão juntas?', 'Superescalar: o hardware, a cada ciclo. VLIW: o compilador, que monta pacotes com uma vaga por unidade (vagas vazias levam nop).'],
];

export const cola = [
  ['Pipeline', 'k estágios sobrepostos (IF ID EX MEM WB). Aumenta vazão, não diminui latência. Ideal: aceleração k.'],
  ['CPI real', 'CPI = 1 + stalls por instrução. Aceleração = profundidade / (1 + stalls). Stall = frequência × ciclos perdidos.'],
  ['Hazards', 'estrutural (recurso), de dados (valor), de controle (caminho). Stall resolve todos.'],
  ['RAW · WAR · WAW', 'RAW = dependência verdadeira. WAR (anti) e WAW (saída) = de nome, somem com renomeação.'],
  ['Forwarding', 'leva o valor de EX/MEM ou MEM/WB direto à ULA. Load-use ainda custa 1 stall.'],
  ['Desvios', 'congelar, prever não tomado, prever tomado, delay slot; estática (laço = tomado) ou dinâmica.'],
  ['Preditores', 'BHT 1 bit (2 erros/laço), 2 bits (1 erro, muda após 2 erros), correlacionado (m, n): 2ᵐ × n × linhas bits; torneio; BTB e pilha de retorno.'],
  ['Loop unrolling', 'copia o corpo, renomeia registradores, amortiza DADDUI/BNE: 9 → 7 → 3,5 ciclos por elemento.'],
  ['Tomasulo', 'estações de reserva (Vj, Vk, Qj, Qk) + CDB + etiquetas. Emite em ordem, executa fora de ordem. Elimina WAR e WAW.'],
  ['Especulação + ROB', 'executa o caminho previsto; resultados no ROB; commit em ordem pela cabeça. Exceções precisas, desfaz erro de predição.'],
  ['Emissão múltipla', 'superescalar (hardware decide; i7 especulativo, A8 estático) × VLIW (compilador monta pacotes com nops).'],
  ['Limites e TLP', 'ILP real é limitado (janela, predição, energia). Multithreading: fina, grossa, SMT (Hyper-Threading).'],
];

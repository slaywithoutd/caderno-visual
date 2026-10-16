/* Revisão da aula 06: cartões (pergunta, resposta) e cola de uma página (tópico, resumo).
   Aparecem no fim da aula e na página de revisão da matéria. Pode usar HTML simples. */
export const cartoes = [
  ['Um processo chega em t = 2, tem surto de 5, começa em t = 4 e termina em t = 9 sem ser interrompido. Turnaround, espera e resposta?', 'Turnaround = 9 − 2 = 7. Espera = 7 − 5 = 2. Resposta = 4 − 2 = 2 (não preemptivo: espera = resposta).', 'criterios'],
  ['FCFS com P1 (chega 0, surto 10), P2 (chega 1, surto 2), P3 (chega 2, surto 2). Espera média?', 'P1 0–10, P2 10–12, P3 12–14. Esperas: 0, 9, 10. Média = 19/3 ≈ 6,33. Efeito comboio: os curtos esperam o longo.', 'fcfs'],
  ['Por que SJF/SRTF têm a menor espera média e por que quase ninguém usa na forma pura?', 'Passar um surto curto na frente de um longo reduz mais a espera do curto do que aumenta a do longo. Mas o surto precisa ser estimado (média exponencial) e os longos podem sofrer starvation.', 'sjf'],
  ['O que acontece com o round-robin quando o quantum é muito grande? E muito pequeno?', 'Muito grande: ninguém é interrompido, vira FCFS. Muito pequeno: a CPU gasta boa parte do tempo em trocas de contexto. Troca de 1 ms e q = 4 ms: 1/5 = 20% de overhead.', 'round-robin'],
  ['Duas tarefas periódicas: C₁ = 2 ms, T₁ = 10 ms; C₂ = 5 ms, T₂ = 25 ms. Rate monotonic garante os prazos?', 'U = 2/10 + 5/25 = 0,2 + 0,2 = 0,4 ≤ 0,828 (limite para n = 2). Garante. A tarefa 1, de período menor, tem prioridade maior.', 'rate-monotonic'],
  ['Base = 40 000, limite = 10 000. Para onde vai o endereço lógico 7 500? E o 12 000?', '7 500 < 10 000: físico = 40 000 + 7 500 = 47 500. 12 000 ≥ limite: a MMU gera erro de acesso.', 'mmu'],
  ['Fragmentação interna × externa: qual técnica causa qual?', 'Interna (sobra dentro da área dada): partições fixas e a última página na paginação. Externa (buracos espalhados): partições variáveis, segmentação, alocação contígua de arquivos. Compactação resolve a externa.', 'particao-variavel'],
  ['Buracos de 10, 4 e 20 KB (nessa ordem). Onde first, best e worst-fit colocam um pedido de 3 KB?', 'First-fit: no de 10 (o primeiro que cabe). Best-fit: no de 4 (o menor que cabe). Worst-fit: no de 20 (o maior).', 'fits'],
  ['Páginas de 4 KB. Endereço virtual 9 000: qual página e qual deslocamento? Se a página está na moldura 6, qual o físico?', '9 000 div 4 096 = 2; 9 000 − 8 192 = 808. Endereço (2, 808). Físico = 6 × 4 096 + 808 = 24 576 + 808 = 25 384.', 'traducao'],
  ['Memória de 100 ns, page fault de 10 ms, p = 1/10 000. Qual o tempo efetivo de acesso?', 'TEA = 0,9999 × 100 + 0,0001 × 10 000 000 = 99,99 + 1 000 ≈ 1 100 ns. A memória ficou 11 vezes mais lenta.', 'tea'],
  ['O que é a anomalia de Belady e quais algoritmos a sofrem?', 'Mais molduras gerando mais page faults. Só o FIFO (entre os vistos): 1 2 3 4 1 2 5 1 2 3 4 5 dá 9 page faults com 3 molduras e 10 com 4. LRU e ótimo não sofrem.', 'belady'],
  ['O que é thrashing e como o working set ajuda a evitar?', 'O sistema pagina mais do que executa porque os processos têm menos molduras do que usam. O SO só deixa rodar processos cuja soma dos working sets cabe na memória; se não cabe, suspende alguém.', 'working-set'],
  ['Blocos de 4 KB, ponteiros de 4 bytes. Quanto um i-node alcança pelos 12 diretos e pelo indireto simples?', 'Diretos: 12 × 4 KB = 48 KB. Indireto simples: 4 096 / 4 = 1 024 ponteiros × 4 KB = 4 MB.', 'i-node'],
  ['Polling, interrupção ou DMA para copiar blocos grandes de um dispositivo rápido? Por quê?', 'DMA: o controlador copia o bloco inteiro sem a CPU e gera uma interrupção só no fim. Polling prende a CPU; interrupção por palavra gera milhares de interrupções.', 'modos-es'],
  ['Disco de 10 000 rpm, seek médio 4 ms. Latência rotacional média e tempo de acesso (desprezando a transferência)?', 'Uma volta = 60/10 000 s = 6 ms; latência média = 3 ms. Acesso ≈ 4 + 3 = 7 ms.', 'tempo-acesso-disco'],
  ['Cabeça no 50, fila 90, 10, 60. Distância com FCFS e com SSTF?', 'FCFS: 50→90 (40) →10 (80) →60 (50) = 170. SSTF: 50→60 (10) →90 (30) →10 (80) = 120.', 'escalonamento-disco'],
];

export const cola = [
  ['Critérios', 'utilização da CPU e throughput ↑; turnaround = fim − chegada; espera = turnaround − surto; resposta = 1ª execução − chegada ↓.', 'criterios'],
  ['FCFS · SJF · SRTF', 'FCFS: ordem de chegada, efeito comboio. SJF / SRTF: menor surto / menor restante. Menor espera média; precisa estimar o surto; starvation.', 'fcfs'],
  ['Prioridade', 'estática ou dinâmica, preemptiva ou não. Starvation → aging.', 'prioridade'],
  ['Round-robin · MLFQ', 'quantum q; espera ≤ (n − 1)·q; q grande = FCFS, q pequeno = overhead. MLFQ: gastou o quantum desce, bloqueou fica.', 'round-robin'],
  ['Tempo real', 'prazo (deadline), pior caso. Rate monotonic: período menor = prioridade maior, U ≤ n(2^(1/n) − 1). EDF: prazo mais perto, U ≤ 1.', 'tempo-real'],
  ['Memória', 'MMU: físico = base + lógico se lógico &lt; limite. Fixas → fragmentação interna; variáveis → externa (first/best/worst-fit, compactação). Swapping.', 'mmu'],
  ['Paginação', 'pág = end div tam, desl = end mod tam; físico = moldura·tam + desl. Bit V = 0 → page fault. TEA = (1 − p)·mem + p·page fault.', 'traducao'],
  ['Substituição', 'OPT (futuro, mínimo), FIFO (Belady), LRU (perto do ótimo, caro), relógio (bit R, segunda chance), NRU, LFU.', 'algoritmos-substituicao'],
  ['Thrashing', 'pagina mais que executa. Working set W(t, Δ); soma dos WS ≤ molduras.', 'thrashing'],
  ['Arquivos', 'contígua (rápida, fragmentação externa), encadeada (FAT; acesso direto lento), indexada (i-node: 12 diretos + simples + duplo + triplo). Livre: vetor de bits ou lista.', 'alocacao-arquivos'],
  ['E/S', 'processo → subsistema de E/S → driver → controlador → dispositivo. Polling (busy waiting) &lt; interrupção &lt; DMA (1 interrupção por bloco). Buffering, spooling.', 'modos-es'],
  ['Disco', 'acesso = seek + latência (meia volta) + transferência. FCFS, SSTF (starvation), SCAN (elevador), C-SCAN (espera uniforme). RAID 0/1/5.', 'escalonamento-disco'],
];

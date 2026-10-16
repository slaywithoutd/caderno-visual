/* Revisão da aula: cartões (pergunta, resposta) e cola de uma página (tópico, resumo).
   Aparecem no fim da aula e na página de revisão da matéria. Pode usar HTML simples. */
export const cartoes = [
  ['Qual a diferença entre programa e processo?', 'Programa é código parado no disco (passivo). Processo é o programa em execução, com contexto de hardware, contexto de software e espaço de endereçamento (ativo). Um programa pode virar vários processos.'],
  ['Por que um programa em modo usuário não pode falar direto com o disco?', 'Porque acessar dispositivos é instrução privilegiada: só roda em modo núcleo. O programa pede ao núcleo por uma chamada de sistema.'],
  ['Qual a diferença entre interrupção e exceção?', 'Interrupção vem de um dispositivo e chega a qualquer momento (assíncrona). Exceção é causada pela instrução em execução, como divisão por zero (síncrona).'],
  ['Um programa usa 10 ms de CPU e espera 40 ms de E/S, em ciclo. Qual o uso da CPU sozinho? E com 3 cópias, no melhor caso?', 'Sozinho: 10 / 50 = 20 %. Com 3 cópias sem esperas coincidentes: 3 × 20 % = 60 %.'],
  ['O que fica no contexto de hardware e o que fica no contexto de software?', 'Hardware: registradores gerais, PC, SP e registrador de status. Software: identificação (PID, dono), quotas e privilégios.'],
  ['Quais são as quatro regiões do espaço de endereçamento e para onde crescem heap e pilha de execução?', 'Código, dados globais, heap e pilha de execução. O heap cresce para cima; a pilha de execução cresce para baixo.'],
  ['O que o PCB guarda?', 'Contexto de hardware, contexto de software, informações do espaço de endereçamento e o estado do processo. Fica na memória do núcleo.'],
  ['Quais transições entre estados <b>não</b> existem?', 'Espera → executando (quem sai da espera vai para pronto) e pronto → espera (só quem executa pode pedir E/S).'],
  ['O que provoca executando → pronto?', 'Preempção: a fatia de tempo acabou (interrupção do temporizador) ou chegou um processo mais prioritário.'],
  ['Fatia q = 2 ms e troca s = 50 µs. Qual a fração útil da CPU?', '2 / (2 + 0,05) = 2 / 2,05 ≈ 0,976. Cerca de 97,6 % útil e 2,4 % de overhead.'],
  ['6 processos revezam com q = 5 ms e s = 0,01 ms. Quanto um processo espera, no pior caso, até voltar a executar?', '(n − 1) × (q + s) = 5 × 5,01 = 25,05 ms.'],
  ['Por que a troca de contexto é overhead?', 'Enquanto ela acontece, a CPU só executa código do núcleo (salvar, escolher, carregar) e nenhum processo avança. Ainda deixa cache e TLB frias.'],
  ['O que as threads de um processo compartilham e o que cada uma tem só para si?', 'Compartilham código, dados globais, heap e arquivos abertos. Cada uma tem PC, registradores, pilha de execução e estado.'],
  ['Numa ULT (N:1), o que acontece quando uma thread faz uma chamada bloqueante?', 'O processo inteiro bloqueia, porque o núcleo só enxerga o processo. Todas as threads param.'],
  ['Qual a vantagem do KLT sobre o ULT, e qual o custo?', 'Uma thread bloqueada não trava as outras e há paralelismo em vários cores. O custo: criar e trocar exige chamada de sistema, mais lenta.'],
  ['Concorrência e paralelismo são a mesma coisa?', 'Não. Concorrência é revezar a CPU no mesmo intervalo de tempo (basta um core). Paralelismo é executar no mesmo instante, em cores diferentes.'],
];

export const cola = [
  ['SO', 'máquina estendida + gerente de recursos. Núcleo roda em modo núcleo; programas em modo usuário.'],
  ['Entrar no núcleo', 'chamada de sistema (pedido do programa), interrupção (dispositivo, assíncrona), exceção (instrução, síncrona).'],
  ['Multiprogramação', 'vários programas na memória; quem espera E/S cede a CPU. Com temporizador: tempo compartilhado.'],
  ['Processo', 'programa em execução = contexto de hardware + contexto de software + espaço de endereçamento.'],
  ['Hardware × software', 'hardware: registradores, PC, SP, status. Software: PID, dono, quotas, privilégios.'],
  ['Espaço de endereçamento', 'código · dados globais · heap ↑ · … · ↓ pilha de execução.'],
  ['PCB', 'ficha do processo no núcleo: contexto + memória + estado. Todos juntos: tabela de processos.'],
  ['Estados', 'novo → pronto ⇄ executando → terminado; executando → espera → pronto. Sem espera → executando.'],
  ['Troca de contexto', 'salva no PCB, escolhe, carrega. Overhead. Útil = q / (q + s); espera máx. (n − 1)(q + s).'],
  ['Tipos', 'foreground × background; processos do sistema; CPU-bound × I/O-bound; fork + exec; sinais.'],
  ['Thread', 'compartilha código, dados, heap, arquivos; tem PC, registradores, pilha de execução e estado próprios.'],
  ['ULT × KLT', 'N:1 rápido mas bloqueia tudo e sem paralelismo; 1:1 paralelo e não bloqueia, mais caro; M:N híbrido.'],
];

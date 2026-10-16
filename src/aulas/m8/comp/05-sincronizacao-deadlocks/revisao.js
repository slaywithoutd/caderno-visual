/* Revisão da aula: cartões (pergunta, resposta) e cola de uma página (tópico, resumo). */
export const cartoes = [
  ['O que é condição de corrida?', 'Dois ou mais fluxos acessam um dado compartilhado, pelo menos um escreve, e o resultado depende da ordem de execução das instruções.'],
  ['Por que <code>saldo = saldo + 1</code> não é seguro com duas threads?', 'Vira três instruções (LOAD, ADD, STORE). Se a outra thread lê entre o LOAD e o STORE, as duas gravam o mesmo valor e um incremento se perde.'],
  ['Saldo 100, duas threads somam 1, ordem A.LOAD, B.LOAD, A.ADD, B.ADD, A.STORE, B.STORE. Resultado?', '101. As duas leram 100, as duas gravaram 101. Esperado 102: atualização perdida.'],
  ['Quais os 4 requisitos de uma solução de exclusão mútua?', '(1) Nunca dois na região crítica. (2) Nada se supõe sobre velocidades ou número de CPUs. (3) Quem está fora não bloqueia os outros. (4) Espera limitada: ninguém espera para sempre.'],
  ['Por que desabilitar interrupções não serve num multicore?', 'Só impede a troca na CPU atual. Uma thread em outro núcleo roda ao mesmo tempo sem precisar de interrupção.'],
  ['O que faz Test-and-Set?', 'Numa instrução atômica, lê a variável, grava 1 nela e devolve o valor antigo. Se devolveu 0, a trava era livre e agora é sua.'],
  ['Qual o defeito da alternância estrita?', 'Força turnos A, B, A, B. Se um não quer entrar, o outro fica esperando a vez: quem está fora bloqueia quem quer entrar.'],
  ['Semáforo com s = 2 (pode ficar negativo). Quatro threads fazem P. Qual o valor e quantas na fila?', 's = 2 − 4 = −2. Duas passaram e |−2| = 2 estão na fila.'],
  ['Valores iniciais dos semáforos no produtor/consumidor com N posições?', 'vazio = N, cheio = 0, mutex = 1.'],
  ['O que acontece se o produtor fizer P(mutex) antes de P(vazio)?', 'Com o buffer cheio, ele dorme segurando o mutex; o consumidor não consegue entrar para tirar um item. Deadlock.'],
  ['Produtor gera 40 itens/s e o consumidor esvazia a cada 0,25 s. Buffer mínimo?', 'N ≥ r × T = 40 × 0,25 = 10 posições (mais folga para atrasos).'],
  ['Diferença entre signal de variável de condição e V de semáforo?', 'V tem memória: sem ninguém esperando, o valor sobe e o próximo P passa. Signal sem ninguém esperando se perde.'],
  ['Quais as 4 condições de Coffman?', 'Exclusão mútua, posse e espera, não preempção e espera circular. Precisam valer todas ao mesmo tempo.'],
  ['Ciclo no grafo de alocação sempre é deadlock?', 'Só se cada recurso tiver uma instância. Com várias, o ciclo é necessário mas não suficiente.'],
  ['Estado inseguro é deadlock?', 'Não. Só perde a garantia de que todos terminam. Pode nunca virar deadlock se os processos pedirem menos que o máximo.'],
  ['Banqueiro: total 10, Alocado (3, 2, 2), Máximo (9, 4, 7). O estado é seguro?', 'Disponível = 3; Precisa = (6, 2, 5). P2 (2 ≤ 3) → livre 5; P3 (5 ≤ 5) → livre 7; P1 (6 ≤ 7) → livre 10. Seguro: ⟨P2, P3, P1⟩.']
];

export const cola = [
  ['Condição de corrida', 'resultado depende da ordem; x = x + 1 é LOAD, ADD, STORE.'],
  ['Exclusão mútua', '4 requisitos: só um dentro; nada de velocidade; quem está fora não bloqueia; espera limitada.'],
  ['Hardware', 'desabilitar interrupções (só 1 CPU, só núcleo); Test-and-Set e Swap atômicos → spinlock (espera ocupada).'],
  ['Software', 'alternância estrita falha (req. 3); Dekker, Peterson (2 processos), padaria (N). Todos com espera ocupada.'],
  ['Semáforo', 'P (down, wait): s − 1, bloqueia se não há vaga. V (up, signal): s + 1 ou acorda um. Sem espera ocupada.'],
  ['Tipos', 'binário/mutex começa em 1; contador começa em N; começa em 0 para impor ordem.'],
  ['Produtor/consumidor', 'vazio = N, cheio = 0, mutex = 1. P da condição antes do P(mutex). N ≥ r × T.'],
  ['Clássicos', 'leitores/escritores (starvation de escritor); filósofos (deadlock se todos pegam a esquerda); barbeiro.'],
  ['Monitor', 'exclusão mútua automática; wait solta o monitor; signal sem espera se perde.'],
  ['Mensagens', 'send/receive; direto × indireto (mailbox); síncrona (rendezvous) × assíncrona (buffer).'],
  ['Deadlock', 'Coffman: exclusão mútua + posse e espera + não preempção + espera circular. Grafo: P → R pedido, R → P posse.'],
  ['Tratamento', 'avestruz; prevenir (ordem global); evitar (banqueiro, estado seguro); detectar (ciclo) e recuperar (matar, preempção, rollback).']
];

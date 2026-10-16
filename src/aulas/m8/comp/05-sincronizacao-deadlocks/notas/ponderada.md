---
titulo: Ponderada · pulseira sensorial
---

Enunciado resumido da avaliação individual que vem depois das aulas 02 a 05. Guardado aqui como nota bruta; a aula não resolve nada dele.

## Cenário

- Você é CTO de uma startup que faz uma pulseira sensorial para pessoas com deficiência visual.
- A pulseira lê um sensor de distância 100 vezes por segundo: uma amostra a cada 10 ms.
- Cada amostra vira vibração: quanto mais perto o obstáculo, mais forte (ou diferente) a vibração.
- A pulseira também manda um log por Bluetooth (BLE) para o app no celular.
- Requisito inegociável: cada amostra processada em no máximo 5 ms. Se atrasar ou travar, a pessoa anda sem saber do poste.

## O que o artefato pede

- **Parte A · problema técnico**: arquitetura, memória, pipeline, processos e threads, semáforos e deadlock, tudo aplicado à pulseira.
  - Na parte de threads: a thread do sensor, a thread do BLE e o buffer compartilhado entre elas.
  - Contas mostradas, passo a passo.
  - Código na questão A4.
- **Parte B · decisão de negócio**: uma decisão do CTO, defendida com a análise da Parte A.
- Cada aluno tem parâmetros D1 e D2, tirados do próprio nome.
- Entrega: prints em `/ponderada/img` e o código da A4 em `/ponderada/codigo`.

> [!prova]
> Requisito da ponderada: cada amostra processada em no máximo 5 ms. Parte A técnica (arquitetura, memória, pipeline, processos e threads, semáforos e deadlock na pulseira) e Parte B com a decisão do CTO defendida pela análise. Contas mostradas. Prints em /ponderada/img e código da A4 em /ponderada/codigo. D1 e D2 saem do seu nome.

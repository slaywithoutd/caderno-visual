---
name: auditar-cobertura
description: Compara fontes de uma aula com o Caderno visual para localizar omissões, erros e diferenças de edição. Use ao criar ou integrar aulas, ou quando a pessoa disser que faltou conteúdo, exemplos ou exercícios. Produz rastreabilidade em cobertura.json e corrige os modos existentes.
---

# Auditar cobertura de uma aula

Leia `CLAUDE.md` e a estrutura da aula antes de editar. O resultado é uma aula conferida contra fontes identificáveis, não um resumo mais longo baseado em memória.

## 1. Confirmar o que foi realmente lido

- Inventarie cada arquivo/link, edição, capítulo e intervalo indicado. Não adivinhe edição pela paginação.
- Distinga: fonte integral acessível, trecho acessível, resumo de terceiros e fonte indisponível. Resumo de IA não comprova leitura do livro ou vídeo.
- PDF: conte páginas e confira todas. Leitura lazy do Drive só carrega parte do documento: navegar à última página não significa ler as intermediárias. Registre páginas efetivamente examinadas; confira diagramas e tabelas visualmente quando carregarem informação não extraída.
- Compare páginas impressas com páginas do PDF. Texto vazio, OCR incoerente, fórmulas quebradas ou páginas ausentes exigem outra extração ou inspeção visual.
- Se faltar livro: procure edição identificada em editora, material autorizado dos autores ou biblioteca acessível. Use documentação primária para verificar conceitos específicos, sem chamá-la de extração do livro. Não contorne login/paywall nem trate uma cópia aleatória como fonte confiável.

## 2. Fazer o inventário antes de resumir

Para cada página/seção, liste conceitos, pré-requisitos, fórmulas e suas hipóteses, diagramas, exemplos, perguntas e exercícios. Confira separadamente o que o leitor precisa conseguir FAZER: calcular, comparar, implementar, justificar uma decisão.

Classifique diferenças como: omitido, superficial, já coberto, conteúdo novo da aula, informação ausente na fonte, divergência ou erro factual. Uma palavra no glossário não comprova que o assunto foi ensinado. Não atribua falha a scraping sem evidência de uma extração defeituosa.

## 3. Corrigir com rastreabilidade

- Integre conceitos à seção dona, exercícios no ponto de aplicação e referências cruzadas para pré-requisitos. Não crie uma segunda definição concorrente.
- Preserve ambos os modos quando existirem. Reutilize figuras por referência; só Consulta continua só Consulta.
- Fonte nova não é evidência de que o autor anterior mentiu ou de que o tema estava no autoestudo original. Identifique a origem e a data.
- Refaça as contas, explicite unidades e reservas de memória, e distinga média de pior caso. Não copie erros do slide automaticamente.
- A marca `prova` exige orientação explícita, não apenas a presença de um conceito no material. Não invente o enunciado de uma atividade distribuída fora dos arquivos recebidos.
- Atualize glossário, cartões, cola, metadados e estimativa automática; preserve o material bruto apenas quando apropriado. Material privado não deve ser republicado integralmente.

## 4. Registrar e conferir

Crie `cobertura.json` junto da aula seguindo `m8/comp/02-fundamentos-memoria/cobertura.json`:
fontes identificadas, status de acesso, total de unidades, intervalos sem lacunas, diagnóstico inicial,
destinos de Leitura/Consulta, evidências e observações. Conteúdo estrutural pode apontar a um destino
geral com justificativa. Fonte inacessível fica marcada como tal, nunca como coberta.

Rode `npm run checar-cobertura`, `npm run checar`, `npm run checar-consulta` e build. A validação
automática verifica intervalos, destinos e evidências textuais; não prova equivalência semântica.
Releia a matriz contra o inventário e tente resolver os exercícios só com o caderno. Confira no
navegador busca de termos, figuras e links. Ao concluir, diga o que faltava, a causa comprovada,
as correções e qualquer fonte que continua sem conferência integral.

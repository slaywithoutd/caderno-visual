/* Glossário da aula 13 (preparação para o Desafio 1). Só os termos novos: o resto mora nas aulas 01, 07 e 08. */
export default {
  'eps-fecho': { t: 'ε-fecho', m: ['ε-fecho'], d: 'Os estados que se alcançam a partir de um conjunto usando só transições vazias (ε), incluindo os do próprio conjunto. Num AFN com ε, os estados ativos são sempre fechados assim.', f: 'fecho({q1}) = {q1} ∪ tudo que q1 alcança por ε', see: ['eps-trans', 'subconjuntos'] },
  subconjuntos: { t: 'Construção dos subconjuntos', m: ['construção dos subconjuntos'], d: 'Transforma um AFN num AFD equivalente: cada estado do AFD é um conjunto de estados ativos do AFN, e é final se contém algum final do AFN.', x: 'No pior caso o AFD tem 2ⁿ estados, um para cada elemento de 𝒫(Q).', see: ['eps-fecho', 'conjunto-partes'] },
  'final-vazia': { t: 'Aceitação por estado final e pilha vazia', m: ['estado final e pilha vazia'], d: 'Critério de aceitação do AP usado na lista de treino: a palavra é aceita se algum ramo lê a entrada toda e termina num estado final com a pilha vazia, as duas coisas ao mesmo tempo.', see: ['aceita-final', 'aceita-vazia'] },
  computacao: { t: 'Computação (de um AP)', m: ['computações'], d: 'Uma sequência de configurações ligadas por ⊢, do início até um ponto em que nenhuma transição se aplica. Num AP não determinístico, uma palavra pode ter várias.', see: ['configuracao', 'ramo'] },
};

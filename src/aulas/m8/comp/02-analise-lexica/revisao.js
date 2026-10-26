/* Revisão da aula: cartões (pergunta, resposta) e cola de uma página (tópico, resumo).
   Aparecem no fim da aula e na página de revisão da matéria. Pode usar HTML simples. */
export const cartoes = [
  ['Qual a diferença entre compilador e interpretador?','O compilador traduz uma vez para um programa objeto que roda sozinho (mais rápido). O interpretador traduz e executa a cada execução (mais lento, mensagens de erro melhores).'],
  ['Que classe de linguagem corresponde a cada análise?','Léxica: linguagens regulares (AF, ER). Sintática: livres do contexto (GLC, AP). O que nenhuma GLC captura, como declarar antes de usar, fica para a semântica.'],
  ['Lexema, padrão e token: qual é qual?','Lexema é o texto no fonte (<code>valor</code>). Padrão é a regra da classe ("letra seguida de letras e dígitos"). Token é a estrutura (tipo, valor) que o léxico entrega.'],
  ['O que o analisador léxico faz além de gerar tokens?','Ignora espaços e comentários e guarda linha e coluna de cada token para as mensagens de erro de todas as fases.'],
  ['Quando acontece um erro léxico?','Só quando nenhum padrão reconhece a entrada naquele ponto (ex.: <code>@</code>). <code>whilee</code> vira identificador; o erro aparece no sintático.'],
  ['Liste os tokens de <code>SE x &lt;= 10</code> em Alguma.','<code>&lt;SE&gt; &lt;Var,x&gt; &lt;OpRel,&lt;=&gt; &lt;NumInt,10&gt;</code>, e no fim do arquivo <code>&lt;EOF&gt;</code>.'],
  ['O que significa o asterisco num estado final do diagrama de transição?','Retroceder um caractere: para saber que o token acabou, foi lido um caractere a mais, que pertence ao próximo token.'],
  ['Por que buffer duplo e não buffer único?','Com um só, recarregar no meio de um lexema apaga o começo dele e não dá para voltar. Com duas metades alternadas, a anterior continua na memória.'],
  ['O que fazem zerar() e confirmar()?','zerar volta o ponteiro ao início do lexema quando um padrão falha; confirmar avança o início do lexema até o ponteiro quando um padrão casa.'],
  ['Por que palavras-chave vêm antes do identificador?','Porque toda palavra-chave também casa com o padrão de identificador. Se o identificador for testado antes, nenhuma palavra-chave é reconhecida.'],
  ['Como o ANTLR escolhe entre duas regras que casam?','Maior casamento: vence a que consome mais caracteres. Empate: vence a que aparece primeiro no arquivo. <code>ALGORITMObla</code> vira uma VARIAVEL só.'],
  ['O que há de errado com <code>CADEIA : \'\\\'\' .* \'\\\'\' ;</code>?','O <code>.*</code> é ganancioso e vai até a última aspa do arquivo, engolindo várias cadeias. Use <code>.*?</code> ou, melhor, a versão determinística com <code>~</code>.'],
];

export const cola = [
  ["Compilador", "traduz fonte → objeto equivalente e aponta erros. Interpretador executa direto. Java: bytecode + JVM + JIT."],
  ["Fases", "léxica → sintática → semântica → intermediário → otimização → geração. Front-end = análise; back-end = síntese."],
  ["Tabela de símbolos", "guarda os nomes; usada por todas as fases."],
  ["Chomsky", "regulares = léxica; LLC = sintática; declarar antes de usar ≈ ww, não é LLC → semântica."],
  ["Lexema / padrão / token", "texto no fonte / regra da classe / estrutura (tipo, valor)."],
  ["Léxico", "ignora espaços e comentários, guarda linha/coluna, gera &lt;EOF&gt;. Não sabe se dois nomes iguais são a mesma variável."],
  ["Erro léxico", "só quando nenhum padrão casa. whilee = identificador."],
  ["Diagrama", "AFD por padrão; <b>*</b> = retroceder 1. Cadeia não retrocede."],
  ["Buffer duplo", "2N posições, metades alternadas, circular; bufferAtual evita recarga dupla."],
  ["Cascata", "um método por padrão; falhou → zerar, casou → confirmar; tudo falhou → erro léxico."],
  ["ER", "união |, concatenação, fecho *. ER ≡ AF ≡ gramática regular."],
  ["ANTLR", "maior casamento, empate pela ordem; palavras-chave primeiro; fragment, -&gt; skip, .*? não ganancioso."]
];

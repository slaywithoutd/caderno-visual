/* Exercícios de código do treino. Cada teste é [nome, expressão, esperado], as duas últimas em Python,
   avaliadas no espaço de nomes do código da pessoa depois do PREP (funções de referência com _). */

export const PREP = `
from itertools import product as _product
from collections import deque as _deque

def _todas(alf, n):
    for k in range(n + 1):
        for t in _product(alf, repeat=k):
            yield ''.join(t)

def _levanta(f, exc):
    try:
        f()
    except exc:
        return True
    except Exception:
        return False
    return False

def _afd(delta, ini, fin, w):
    q = ini
    for c in w:
        if c not in delta.get(q, {}):
            return False
        q = delta[q][c]
    return q in fin

def _ap(trans, ini, fin, w):
    fila = _deque([(ini, 0, '')])
    vistos = {(ini, 0, '')}
    while fila:
        q, i, p = fila.popleft()
        if i == len(w) and q in fin and p == '':
            return True
        for (de, le, topo, para, poe) in trans:
            if de != q or (le and (i >= len(w) or w[i] != le)) or (topo and (not p or p[-1] != topo)):
                continue
            n = (p[:-1] if topo else p) + poe[::-1]
            if len(n) > 2 * len(w) + 5:
                continue
            c = (para, i + (1 if le else 0), n)
            if c not in vistos:
                vistos.add(c)
                fila.append(c)
    return False

_D00 = {'q0': {'0': 'q1', '1': 'q0'}, 'q1': {'0': 'q2', '1': 'q0'}, 'q2': {'0': 'q2', '1': 'q0'}}
_DAB = {'q0': {'a': 'q1'}, 'q1': {'b': 'q0'}}
_N11 = {'q1': {'0': {'q1'}, '1': {'q1', 'q2'}}, 'q2': {'0': {'q3'}, '': {'q3'}}, 'q3': {'1': {'q4'}}, 'q4': {'0': {'q4'}, '1': {'q4'}}}
_N1A = {'q1': {'a': {'q1', 'q2', 'q3'}}, 'q2': {'b': {'q4'}}, 'q3': {'c': {'q4'}}}
_M = [('q1', 'a', '', 'q1', 'a'), ('q1', 'a', '', 'q2', ''), ('q1', 'b', '', 'q1', 'a'),
      ('q2', 'a', 'a', 'q2', ''), ('q2', 'b', 'a', 'q2', '')]
_DIF = [('q0', '', '', 'q1', '$'), ('q1', '0', '$', 'q1', '0$'), ('q1', '0', '0', 'q1', '00'), ('q1', '0', '1', 'q1', ''),
        ('q1', '1', '$', 'q1', '1$'), ('q1', '1', '1', 'q1', '11'), ('q1', '1', '0', 'q1', ''),
        ('q1', '', '0', 'q2', ''), ('q1', '', '1', 'q2', ''), ('q2', '', '0', 'q2', ''), ('q2', '', '1', 'q2', ''), ('q2', '', '$', 'q3', '')]
_LOOP = [('p', '', '', 'p', 'x'), ('p', 'a', '', 'f', '')]
`;

export const HARNESS = `
import json
def _rodar():
    ns = {}
    try:
        exec(compile(_codigo, 'solucao.py', 'exec'), ns)
    except SyntaxError as e:
        return json.dumps({'sintaxe': f'linha {e.lineno}: {e.msg}'})
    except Exception as e:
        return json.dumps({'carga': f'{type(e).__name__}: {e}'})
    exec(_prep, ns)
    out = []
    for nome, expr, esp in json.loads(_testes):
        try:
            obt = eval(expr, ns)
            espv = eval(esp, ns)
            out.append([nome, obt == espv, repr(obt)[:300], repr(espv)[:300]])
        except Exception as e:
            out.append([nome, False, f'{type(e).__name__}: {e}', esp])
    return json.dumps({'res': out})
_rodar()
`;

export const pyex = [
  {
    id: 'afd', titulo: '1 · aceita_afd (molde 1)',
    enunciado: '<p>Escreva <code>aceita_afd(delta, inicial, finais, w)</code>. <code>delta</code> é um dicionário de dicionários (<code>delta[\'q0\'][\'a\'] == \'q1\'</code>); <code>finais</code> pode ser conjunto ou lista. Transição que não existe rejeita a palavra. Devolva <code>True</code> ou <code>False</code>.</p>',
    inicio: `def aceita_afd(delta, inicial, finais, w):
    # devolva True se o AFD aceita w
    pass
`,
    testes: [
      ['termina em 00: 1100 aceita', "aceita_afd(_D00, 'q0', {'q2'}, '1100')", 'True'],
      ['termina em 00: 0010 rejeita', "aceita_afd(_D00, 'q0', {'q2'}, '0010')", 'False'],
      ['palavra vazia com inicial final', "aceita_afd(_D00, 'q0', {'q0'}, '')", 'True'],
      ['finais como lista', "aceita_afd(_D00, 'q0', ['q2'], '000')", 'True'],
      ['seta que falta rejeita', "aceita_afd(_DAB, 'q0', {'q0'}, 'aab')", 'False'],
      ['(ab)* aceita abab', "aceita_afd(_DAB, 'q0', {'q0'}, 'abab')", 'True'],
      ['todas as palavras até 8', "[w or 'ε' for w in _todas('01', 8) if aceita_afd(_D00, 'q0', {'q2'}, w) != w.endswith('00')][:4]", '[]'],
      ['devolve bool', "type(aceita_afd(_D00, 'q0', {'q2'}, '1')).__name__", "'bool'"],
    ],
    resposta: `def aceita_afd(delta, inicial, finais, w):
    estado = inicial
    for c in w:
        if c not in delta.get(estado, {}):
            return False
        estado = delta[estado][c]
    return estado in finais
`,
  },
  {
    id: 'delta', titulo: '2 · o AFD de 5(b) como dicionário',
    enunciado: '<p>Preencha <code>DELTA</code>, <code>INICIAL</code> e <code>FINAIS</code> de um AFD <b>completo</b> sobre {0, 1} que aceita as palavras com três 0 consecutivos (exercício 5(b) da lista). O teste roda o seu AFD em todas as palavras até 10 símbolos.</p>',
    inicio: `INICIAL = 'q0'
FINAIS = {'q3'}
DELTA = {
    'q0': {'0': 'q1', '1': 'q0'},
    # complete os outros estados
}
`,
    testes: [
      ['AFD completo: seta para 0 e 1 em todo estado', "[(q, c) for q in DELTA for c in '01' if c not in DELTA[q]]", '[]'],
      ['todo destino é um estado', "[DELTA[q][c] for q in DELTA for c in DELTA[q] if DELTA[q][c] not in DELTA]", '[]'],
      ['inicial existe', 'INICIAL in DELTA', 'True'],
      ['todas as palavras até 10', "[w or 'ε' for w in _todas('01', 10) if _afd(DELTA, INICIAL, FINAIS, w) != ('000' in w)][:4]", '[]'],
    ],
    resposta: `INICIAL = 'q0'
FINAIS = {'q3'}
DELTA = {
    'q0': {'0': 'q1', '1': 'q0'},
    'q1': {'0': 'q2', '1': 'q0'},
    'q2': {'0': 'q3', '1': 'q0'},
    'q3': {'0': 'q3', '1': 'q3'},
}
`,
  },
  {
    id: 'afn', titulo: '3 · aceita_afn (molde 2)',
    enunciado: '<p>Escreva <code>aceita_afn(delta, inicial, finais, w)</code>. Cada célula é um conjunto (<code>delta[\'q1\'][\'a\'] == {\'q1\', \'q2\'}</code>), célula que falta é ∅ e a chave <code>\'\'</code> é a transição vazia. Lembre do ε-fecho.</p>',
    inicio: `def aceita_afn(delta, inicial, finais, w):
    # devolva True se algum ramo aceita w
    pass
`,
    testes: [
      ['contém 11 ou 101: 010110', "aceita_afn(_N11, 'q1', {'q4'}, '010110')", 'True'],
      ['11 só passa pelo ε', "aceita_afn(_N11, 'q1', {'q4'}, '11')", 'True'],
      ['1001 rejeita', "aceita_afn(_N11, 'q1', {'q4'}, '1001')", 'False'],
      ['lista 1(a): aab', "aceita_afn(_N1A, 'q1', {'q4'}, 'aab')", 'True'],
      ['lista 1(a): b rejeita (célula ∅)', "aceita_afn(_N1A, 'q1', {'q4'}, 'b')", 'False'],
      ['lista 1(a): abc rejeita', "aceita_afn(_N1A, 'q1', {'q4'}, 'abc')", 'False'],
      ['lista 1(b): F = {q1,q2,q3} aceita ε', "aceita_afn(_N1A, 'q1', {'q1', 'q2', 'q3'}, '')", 'True'],
      ['todas as palavras até 8', "[w or 'ε' for w in _todas('01', 8) if aceita_afn(_N11, 'q1', {'q4'}, w) != ('11' in w or '101' in w)][:4]", '[]'],
    ],
    resposta: `def fecho(delta, estados):
    pilha = list(estados)
    vistos = set(estados)
    while pilha:
        q = pilha.pop()
        for r in delta.get(q, {}).get('', set()):
            if r not in vistos:
                vistos.add(r)
                pilha.append(r)
    return vistos

def aceita_afn(delta, inicial, finais, w):
    ativos = fecho(delta, {inicial})
    for c in w:
        prox = set()
        for q in ativos:
            prox |= delta.get(q, {}).get(c, set())
        ativos = fecho(delta, prox)
    return len(ativos & set(finais)) > 0
`,
  },
  {
    id: 'ap', titulo: '4 · aceita_ap (molde 3)',
    enunciado: '<p>Escreva <code>aceita_ap(trans, inicial, finais, w)</code>. <code>trans</code> é uma lista de tuplas <code>(estado, le, topo, destino, empilha)</code> em que <code>\'\'</code> é "nada"; em <code>empilha</code> com dois símbolos, o primeiro fica no topo. Aceita com estado final <b>e</b> pilha vazia, como na lista. Cuidado com ramos que empilham para sempre.</p>',
    inicio: `from collections import deque

def aceita_ap(trans, inicial, finais, w):
    # busca em largura nas configurações (estado, posição, pilha)
    pass
`,
    testes: [
      ['lista 1(b): baa aceita', "aceita_ap(_M, 'q1', {'q2'}, 'baa')", 'True'],
      ['lista 1(b): bab aceita', "aceita_ap(_M, 'q1', {'q2'}, 'bab')", 'True'],
      ['lista 1(b): baaaa aceita', "aceita_ap(_M, 'q1', {'q2'}, 'baaaa')", 'True'],
      ['lista 1(b): aba rejeita', "aceita_ap(_M, 'q1', {'q2'}, 'aba')", 'False'],
      ['lista 1(b): aa rejeita (sobra pilha)', "aceita_ap(_M, 'q1', {'q2'}, 'aa')", 'False'],
      ['lista 1(b): abb rejeita', "aceita_ap(_M, 'q1', {'q2'}, 'abb')", 'False'],
      ['empilha dois de uma vez: nº de 0 ≠ nº de 1, até 8', "[w or 'ε' for w in _todas('01', 8) if aceita_ap(_DIF, 'q0', {'q3'}, w) != (w.count('0') != w.count('1'))][:4]", '[]'],
      ['não trava com ε, ε → x', "aceita_ap(_LOOP, 'p', {'f'}, 'aa')", 'False'],
    ],
    resposta: `from collections import deque

def aceita_ap(trans, inicial, finais, w):
    inicio = (inicial, 0, '')
    fila = deque([inicio])
    vistos = {inicio}
    while fila:
        q, i, pilha = fila.popleft()
        if i == len(w) and q in finais and pilha == '':
            return True
        for (de, le, topo, para, poe) in trans:
            if de != q:
                continue
            if le != '' and (i >= len(w) or w[i] != le):
                continue
            if topo != '' and (pilha == '' or pilha[-1] != topo):
                continue
            nova = pilha[:-1] if topo != '' else pilha
            nova = nova + poe[::-1]
            if len(nova) > 2 * len(w) + 5:
                continue
            conf = (para, i + (1 if le != '' else 0), nova)
            if conf not in vistos:
                vistos.add(conf)
                fila.append(conf)
    return False
`,
  },
  {
    id: 'trans', titulo: '5 · o AP de 2(b) como lista',
    enunciado: '<p>Preencha <code>TRANS</code>, <code>INICIAL</code> e <code>FINAIS</code> de um AP para { aⁿb²ⁿ : n ≥ 0 } (exercício 2(b) da lista), no formato do exercício 4, com aceitação por estado final e pilha vazia. O teste roda o seu AP em todas as palavras sobre {a, b} até 9 símbolos.</p>',
    inicio: `INICIAL = 'q1'
FINAIS = {'q2'}
TRANS = [
    ('q1', 'a', '', 'q1', 'a'),   # cada a empilha um a
    # complete
]
`,
    testes: [
      ['ε (n = 0) aceita', "_ap(TRANS, INICIAL, FINAIS, '')", 'True'],
      ['abb aceita', "_ap(TRANS, INICIAL, FINAIS, 'abb')", 'True'],
      ['ab rejeita', "_ap(TRANS, INICIAL, FINAIS, 'ab')", 'False'],
      ['todas as palavras até 9', "[w or 'ε' for w in _todas('ab', 9) if _ap(TRANS, INICIAL, FINAIS, w) != (w == 'a' * (len(w) // 3) + 'b' * (2 * (len(w) // 3)))][:4]", '[]'],
    ],
    resposta: `INICIAL = 'q1'
FINAIS = {'q1', 'q2'}
TRANS = [
    ('q1', 'a', '', 'q1', 'a'),   # cada a empilha um a
    ('q1', 'b', '', 'q3', ''),    # 1º b do par: não mexe na pilha
    ('q2', 'b', '', 'q3', ''),
    ('q3', 'b', 'a', 'q2', ''),   # 2º b do par: tira um a
]
`,
  },
  {
    id: 'lex', titulo: '6 · tokens (molde 4)',
    enunciado: `<p>Escreva <code>tokens(codigo)</code>, que devolve a lista de pares <code>(tipo, lexema)</code>. Ignore espaço, tab e quebra de linha. Caractere que nenhum padrão reconhece: <code>raise ValueError</code>.</p>
<div class="tbl prose"><table><thead><tr><th>Tipo</th><th>Padrão</th></tr></thead><tbody>
<tr><td>SE, SENAO, ENQUANTO</td><td>as palavras <code>se</code>, <code>senao</code>, <code>enquanto</code></td></tr>
<tr><td>ID</td><td>letra ou _, seguida de letras, dígitos ou _</td></tr>
<tr><td>NUM</td><td>um ou mais dígitos</td></tr>
<tr><td>IGUAL, DIF, MENOR_IG, MAIOR_IG</td><td><code>==</code> <code>!=</code> <code>&lt;=</code> <code>&gt;=</code></td></tr>
<tr><td>ATRIB, MENOR, MAIOR, MAIS, MENOS, VEZES, DIV, ABRE, FECHA, PV</td><td><code>=</code> <code>&lt;</code> <code>&gt;</code> <code>+</code> <code>-</code> <code>*</code> <code>/</code> <code>(</code> <code>)</code> <code>;</code></td></tr>
</tbody></table></div>`,
    inicio: `def tokens(codigo):
    saida = []
    # percorra codigo e acrescente (tipo, lexema) em saida
    return saida
`,
    testes: [
      ['atribuição simples', "tokens('x = 1')", "[('ID', 'x'), ('ATRIB', '='), ('NUM', '1')]"],
      ['>= é um token só', "tokens('a>=b')", "[('ID', 'a'), ('MAIOR_IG', '>='), ('ID', 'b')]"],
      ['== e não dois =', "tokens('a==b')", "[('ID', 'a'), ('IGUAL', '=='), ('ID', 'b')]"],
      ['palavra-chave', "tokens('se senao enquanto')", "[('SE', 'se'), ('SENAO', 'senao'), ('ENQUANTO', 'enquanto')]"],
      ['maior casamento: senaox é ID', "tokens('senaox')", "[('ID', 'senaox')]"],
      ['número seguido de letra', "tokens('10abc')", "[('NUM', '10'), ('ID', 'abc')]"],
      ['linha completa', "tokens('se (x1 >= 10) y = x1*2;\\nsenao y=0')", "[('SE', 'se'), ('ABRE', '('), ('ID', 'x1'), ('MAIOR_IG', '>='), ('NUM', '10'), ('FECHA', ')'), ('ID', 'y'), ('ATRIB', '='), ('ID', 'x1'), ('VEZES', '*'), ('NUM', '2'), ('PV', ';'), ('SENAO', 'senao'), ('ID', 'y'), ('ATRIB', '='), ('NUM', '0')]"],
      ['_ no identificador', "tokens('_a1 != b_2')", "[('ID', '_a1'), ('DIF', '!='), ('ID', 'b_2')]"],
      ['texto vazio', "tokens('')", '[]'],
      ['erro léxico levanta ValueError', "_levanta(lambda: tokens('x @ y'), ValueError)", 'True'],
    ],
    resposta: `PALAVRAS = {'se': 'SE', 'senao': 'SENAO', 'enquanto': 'ENQUANTO'}
DUPLOS = {'==': 'IGUAL', '!=': 'DIF', '<=': 'MENOR_IG', '>=': 'MAIOR_IG'}
SIMPLES = {'=': 'ATRIB', '<': 'MENOR', '>': 'MAIOR', '+': 'MAIS', '-': 'MENOS',
           '*': 'VEZES', '/': 'DIV', '(': 'ABRE', ')': 'FECHA', ';': 'PV'}

def tokens(codigo):
    saida = []
    i = 0
    while i < len(codigo):
        c = codigo[i]
        if c in ' \\t\\n':
            i += 1
        elif c.isalpha() or c == '_':
            j = i
            while j < len(codigo) and (codigo[j].isalnum() or codigo[j] == '_'):
                j += 1
            lex = codigo[i:j]
            saida.append((PALAVRAS.get(lex, 'ID'), lex))
            i = j
        elif c.isdigit():
            j = i
            while j < len(codigo) and codigo[j].isdigit():
                j += 1
            saida.append(('NUM', codigo[i:j]))
            i = j
        elif codigo[i:i + 2] in DUPLOS:
            saida.append((DUPLOS[codigo[i:i + 2]], codigo[i:i + 2]))
            i += 2
        elif c in SIMPLES:
            saida.append((SIMPLES[c], c))
            i += 1
        else:
            raise ValueError(f'erro léxico: {c!r} na posição {i}')
    return saida
`,
  },
];

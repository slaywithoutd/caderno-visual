/* Confere o modo Consulta de cada aula que tem consulta.html.
   Uso: npm run checar-consulta            (todas)
        npm run checar-consulta -- m8/comp/02
   Erros (saída 1):
   - todo termo do glossario.js da aula mora em exatamente UMA seção (data-termos);
   - data-termos só cita termos da aula; data-leitura só cita seções que existem no conteudo.html;
   - toda figura (<figure id>) e todo loop (data-loop) do modo Leitura aparece uma vez (data-ref / data-ref-loop);
   - todo <p class="prova"> do modo Leitura aparece igual no modo Consulta;
   - toda seção começa com p.cs-def e segue a ordem de blocos;
   - todo cartão e linha de cola em revisao.js aponta (3º item) para uma seção que existe.
   Avisos: fórmulas (.formula) e blocos de código do modo Leitura que não foram achados no modo Consulta. */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = join(process.cwd(), 'src', 'aulas');
const filtro = process.argv[2] || '';
const ORDEM = ['cs-def', 'cs-formula', 'cs-uso', 'cs-pegadinhas', 'cs-ponderada'];
const limpa = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const attr = (tag, nome) => (tag.match(new RegExp(`${nome}="([^"]*)"`)) || [])[1] || '';

let erros = 0, avisos = 0;
const erro = (m) => { erros++; console.log(`  ✗ ${m}`); };
const aviso = (m) => { avisos++; console.log(`  ! ${m}`); };

for (const mod of readdirSync(RAIZ)) for (const mat of readdirSync(join(RAIZ, mod))) {
  const dmat = join(RAIZ, mod, mat); if (!statSync(dmat).isDirectory()) continue;
  for (const aula of readdirSync(dmat).sort()) {
    const d = join(dmat, aula), id = `${mod}/${mat}/${aula}`;
    if (!id.startsWith(filtro) || !existsSync(join(d, 'consulta.html'))) continue;
    console.log(`\n${id}`);
    const cons = readFileSync(join(d, 'consulta.html'), 'utf8');
    const meta = JSON.parse(readFileSync(join(d, 'meta.json'), 'utf8'));
    const apenasConsulta = meta.modos?.length === 1 && meta.modos[0] === 'consulta';
    const leit = existsSync(join(d, 'conteudo.html')) ? readFileSync(join(d, 'conteudo.html'), 'utf8') : '';
    if (!leit && !apenasConsulta) erro('falta conteudo.html; para aula só Consulta, declare modos: ["consulta"] no meta.json');
    const G = existsSync(join(d, 'glossario.js')) ? (await import(pathToFileURL(join(d, 'glossario.js')).href)).default : {};
    const R = existsSync(join(d, 'revisao.js')) ? await import(pathToFileURL(join(d, 'revisao.js')).href) : {};

    /* seções */
    const blocos = cons.split(/(?=<section\b)/).filter((b) => /^<section\b[^>]*class="cs\b/.test(b));
    const ids = new Set(), dono = {};
    const idsLeitura = new Set([...leit.matchAll(/<section class="chap"[^>]*id="([^"]+)"/g)].map((m) => m[1]));
    for (const b of blocos) {
      const tag = b.slice(0, b.indexOf('>') + 1), sid = attr(tag, 'id');
      if (!sid) { erro('seção sem id'); continue; }
      if (ids.has(sid)) erro(`id repetido: ${sid}`); ids.add(sid);
      if (!/^<section[^>]*>\s*<h2>/.test(b)) erro(`${sid}: a seção tem de começar com <h2>`);
      const classes = [...b.matchAll(/class="(cs-(?:def|formula|uso|pegadinhas|ponderada))\b/g)].map((m) => m[1]);
      if (classes[0] !== 'cs-def') erro(`${sid}: o primeiro bloco tem de ser p.cs-def`);
      for (let i = 1; i < classes.length; i++) if (ORDEM.indexOf(classes[i]) < ORDEM.indexOf(classes[i - 1])) { erro(`${sid}: blocos fora de ordem (${classes.join(' → ')})`); break; }
      attr(tag, 'data-termos').split(',').map((t) => t.trim()).filter(Boolean).forEach((k) => {
        if (!G[k]) erro(`${sid}: data-termos cita "${k}", que não está no glossario.js desta aula`);
        if (dono[k]) erro(`"${k}" mora em duas seções: ${dono[k]} e ${sid}`); else dono[k] = sid;
      });
      const lei = attr(tag, 'data-leitura').split(',').map((t) => t.trim()).filter(Boolean);
      if (!lei.length && !apenasConsulta) erro(`${sid}: falta data-leitura (para o switch cair no lugar certo)`);
      lei.forEach((l) => { if (!idsLeitura.has(l)) erro(`${sid}: data-leitura cita "${l}", que não é seção do conteudo.html`); });
    }
    const semDono = Object.keys(G).filter((k) => !dono[k]);
    if (semDono.length) erro(`${semDono.length} termo(s) sem seção dona: ${semDono.join(', ')}`);

    /* figuras e loops */
    const figs = [...leit.matchAll(/<figure\b[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    const loops = [...leit.matchAll(/data-loop="([^"]+)"/g)].map((m) => m[1]);
    const refs = [...cons.matchAll(/data-ref="([^"]+)"/g)].map((m) => m[1]);
    const refLoops = [...cons.matchAll(/data-ref-loop="([^"]+)"/g)].map((m) => m[1]);
    figs.forEach((f) => { const n = refs.filter((r) => r === f).length; if (n !== 1) erro(`figura ${f} aparece ${n} vez(es) no modo Consulta (deve ser 1)`); });
    refs.filter((r) => !figs.includes(r)).forEach((r) => erro(`data-ref="${r}" não existe no conteudo.html`));
    loops.forEach((l) => { const n = refLoops.filter((r) => r === l).length; if (n !== 1) erro(`loop ${l} aparece ${n} vez(es) no modo Consulta (deve ser 1)`); });
    /* desenhos de margem estáticos e tabelas: todos com id no conteudo.html e citados uma vez */
    const mns = [...leit.matchAll(/<aside class="mn"([^>]*)>/g)].map((m) => attr(m[1], 'id'));
    if (mns.some((x) => !x)) erro(`${mns.filter((x) => !x).length} desenho(s) de margem sem id no conteudo.html (dê id="mn-…" para citar no modo Consulta)`);
    const refMn = [...cons.matchAll(/data-ref-mn="([^"]+)"/g)].map((m) => m[1]);
    mns.filter(Boolean).forEach((x) => { const n = refMn.filter((r) => r === x).length; if (n !== 1) erro(`desenho ${x} aparece ${n} vez(es) no modo Consulta (deve ser 1)`); });
    refMn.filter((r) => !mns.includes(r)).forEach((r) => erro(`data-ref-mn="${r}" não existe no conteudo.html`));
    /* tabelas fora de figuras (as de dentro de <figure> chegam junto com a figura) */
    const semFiguras = leit.replace(/<figure\b[\s\S]*?<\/figure>/g, '');
    const tbls = [...semFiguras.matchAll(/<div\b[^>]*class="tbl\b[^"]*"[^>]*>/g)].map((m) => attr(m[0], 'id'));
    if (tbls.some((x) => !x)) erro(`${tbls.filter((x) => !x).length} tabela(s) sem id no conteudo.html (dê id="tbl-…" ou reescreva a tabela no consulta.html)`);
    const refTbl = [...cons.matchAll(/data-ref-tbl="([^"]+)"/g)].map((m) => m[1]);
    tbls.filter(Boolean).forEach((x) => { const n = refTbl.filter((r) => r === x).length; if (n !== 1) erro(`tabela ${x} aparece ${n} vez(es) no modo Consulta (deve ser 1)`); });
    refTbl.filter((r) => !tbls.includes(r)).forEach((r) => erro(`data-ref-tbl="${r}" não existe no conteudo.html`));
    if (!apenasConsulta && /<figure\b|data-loop="/.test(cons)) erro('consulta.html não copia figura nem loop: use <div data-ref="…"></div> / <div data-ref-loop="…"></div>');

    /* cai na prova */
    const provaC = new Set([...cons.matchAll(/<p class="prova">([\s\S]*?)<\/p>/g)].map((m) => limpa(m[1])));
    [...leit.matchAll(/<p class="prova">([\s\S]*?)<\/p>/g)].map((m) => limpa(m[1])).forEach((p) => { if (!provaC.has(p)) erro(`p.prova do modo Leitura ausente (copie igual): "${p.slice(0, 70)}…"`); });

    /* fórmulas e código: aviso */
    const textoC = limpa(cons).replace(/\s/g, '');
    [...leit.matchAll(/<div class="formula">([\s\S]*?)<\/div>/g)].map((m) => limpa(m[1])).forEach((f) => { if (!textoC.includes(f.replace(/\s/g, ''))) aviso(`fórmula não achada: ${f.slice(0, 80)}`); });
    [...leit.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map((m) => limpa(m[1])).forEach((c) => { if (!textoC.includes(c.replace(/\s/g, '').slice(0, 60))) aviso(`bloco de código não achado: ${c.slice(0, 60)}`); });
    const pondL = (leit.match(/Na ponderada/g) || []).length, pondC = (cons.match(/class="cs-ponderada"/g) || []).length;
    if (pondC < Math.min(pondL, 1)) erro('nenhuma caixa cs-ponderada, mas o modo Leitura tem ligação com a ponderada');
    console.log(`  seções ${ids.size} · termos ${Object.keys(dono).length}/${Object.keys(G).length} · figuras ${refs.length}/${figs.length} · loops ${refLoops.length}/${loops.length} · ponderada ${pondC} (Leitura: ${pondL} caixas)`);

    /* revisão agrupada */
    for (const [nome, lista] of [['cartão', R.cartoes || []], ['cola', R.cola || []]]) {
      lista.forEach((it) => { if (!it[2]) erro(`${nome} sem seção (3º item): "${limpa(it[0]).slice(0, 50)}"`); else if (!ids.has(it[2])) erro(`${nome} aponta para seção inexistente "${it[2]}"`); });
    }
  }
}
console.log(erros ? `\n${erros} erro(s), ${avisos} aviso(s).` : `\nTudo certo${avisos ? ` (${avisos} aviso(s) para conferir)` : ''}.`);
process.exitCode = erros ? 1 : 0;

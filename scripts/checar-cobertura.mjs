import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(process.cwd(), 'src', 'aulas');
const filtro = process.argv[2] || '';
let falhas = 0;
let pendencias = 0;
let matrizes = 0;
const normalizar = (texto) => texto.replace(/<[^>]+>/g, ' ').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ');
const erro = (mensagem) => { falhas++; console.error(`  ERRO: ${mensagem}`); };

function visitar(diretorio) {
  for (const entrada of readdirSync(diretorio, { withFileTypes: true })) {
    if (entrada.isDirectory()) visitar(join(diretorio, entrada.name));
    if (entrada.name !== 'cobertura.json') continue;
    const caminho = join(diretorio, entrada.name);
    if (!caminho.replaceAll('\\', '/').includes(filtro)) continue;
    matrizes++;
    console.log(`\n${caminho}`);
    const matriz = JSON.parse(readFileSync(caminho, 'utf8'));
    const modos = Object.fromEntries(['leitura', 'consulta'].map((modo) => {
      const arquivo = join(diretorio, modo === 'leitura' ? 'conteudo.html' : 'consulta.html');
      const html = existsSync(arquivo) ? readFileSync(arquivo, 'utf8') : '';
      return [modo, new Map([...html.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)].map((secao) => [secao[1], normalizar(secao[2])]))];
    }));
    for (const fonte of matriz.fontes || []) {
      if (!fonte.id || !fonte.url || !fonte.escopo) erro('fonte sem identificação, URL ou escopo');
      if (fonte.acesso !== 'integral') {
        pendencias++;
        console.log(`  PENDÊNCIA: ${fonte.id}: ${fonte.acesso}. ${fonte.limitacao || ''}`);
        continue;
      }
      if (!Number.isInteger(fonte.totalUnidades) || fonte.totalUnidades < 1) { erro(`${fonte.id}: total de unidades inválido`); continue; }
      const visitadas = new Set();
      for (const unidade of fonte.unidades || []) {
        if (!unidade.assunto || !unidade.antes || !unidade.justificativa) erro(`${fonte.id}: unidade sem assunto, diagnóstico ou justificativa`);
        for (const numero of unidade.paginas || []) {
          if (!Number.isInteger(numero) || numero < 1 || numero > fonte.totalUnidades || visitadas.has(numero)) erro(`${fonte.id}: unidade inválida ou repetida: ${numero}`);
          visitadas.add(numero);
        }
        for (const [modo, secoes] of Object.entries(modos)) {
          if (!secoes.size) continue;
          const destinos = unidade[modo] || [];
          if (!destinos.length) erro(`${fonte.id}: ${unidade.assunto} sem destino em ${modo}`);
          for (const destino of destinos) if (!secoes.has(destino)) erro(`${fonte.id}: destino inexistente ${modo}#${destino}`);
          const texto = destinos.map((destino) => secoes.get(destino) || '').join(' ');
          for (const evidencia of unidade.evidencias || []) if (!texto.includes(normalizar(evidencia))) erro(`${fonte.id}: evidência ausente em ${modo}: ${evidencia}`);
        }
      }
      const faltantes = Array.from({ length: fonte.totalUnidades }, (_, indice) => indice + 1).filter((numero) => !visitadas.has(numero));
      if (faltantes.length) erro(`${fonte.id}: páginas sem classificação: ${faltantes.join(', ')}`);
      console.log(`  ${fonte.id}: ${visitadas.size}/${fonte.totalUnidades} unidades rastreadas`);
    }
  }
}

visitar(raiz);
if (!matrizes) erro('nenhuma matriz encontrada; não é possível declarar cobertura');
console.log(`\n${matrizes} matriz(es), ${falhas} erro(s), ${pendencias} fonte(s) sem conferência integral. Rastreabilidade não prova equivalência semântica.`);
process.exitCode = falhas ? 1 : 0;

/* Plugin rehype: transforma callouts no estilo Obsidian em blocos do caderno.
     > [!prova] Lema do bombeamento só prova que NÃO é regular
     > [!professor] Ele disse que vai cobrar a construção do AP
     > [!duvida] Por que wwᴿ não tem AP determinístico?
   vira <div class="callout prova"><span class="callout-lab">Cai na prova</span>…</div> */
const ROTULOS = { prova: 'Cai na prova', professor: 'O professor disse', duvida: 'Dúvida', dica: 'Dica', atencao: 'Atenção' };

function primeiroTexto(no) {
  if (!no) return null;
  if (no.type === 'text') return no;
  for (const f of no.children || []) { const t = primeiroTexto(f); if (t) return t; }
  return null;
}

function visitar(no) {
  for (const f of no.children || []) {
    if (f.type === 'element' && f.tagName === 'blockquote') {
      const p = (f.children || []).find((c) => c.type === 'element');
      const t = primeiroTexto(p);
      const m = t && t.value.match(/^\s*\[!(\w+)\][+-]?\s*/);
      if (m) {
        const tipo = m[1].toLowerCase();
        t.value = t.value.slice(m[0].length);
        f.tagName = 'div';
        f.properties = { className: ['callout', tipo] };
        f.children.unshift({ type: 'element', tagName: 'span', properties: { className: ['callout-lab'] }, children: [{ type: 'text', value: ROTULOS[tipo] || tipo }] });
      }
    }
    visitar(f);
  }
}

export default function callouts() {
  return (arvore) => visitar(arvore);
}

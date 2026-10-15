/* utilitários de DOM/SVG compartilhados pelas aulas */
export const NS='http://www.w3.org/2000/svg';
export const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
export function S(tag,attrs,parent,text){const e=document.createElementNS(NS,tag);if(attrs)for(const k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;if(parent)parent.appendChild(e);return e;}
export function H(tag,attrs,html){const e=document.createElement(tag);if(attrs)for(const k in attrs){if(k==='class')e.className=attrs[k];else e.setAttribute(k,attrs[k]);}if(html!=null)e.innerHTML=html;return e;}
export const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));


/* quanto de um elemento está na tela, de 0 a 1. Elementos mais altos que a tela contam como
   inteiros quando ocupam a tela toda. Usado para só animar o que dá para ver de fato (>= 80%). */
export function fracaoVisivel(el) {
  const r = el.getBoundingClientRect();
  if (!r.height) return 0;
  const visivel = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
  return Math.max(0, visivel) / Math.min(r.height, innerHeight);
}
export const VISIVEL_MIN = 0.8;

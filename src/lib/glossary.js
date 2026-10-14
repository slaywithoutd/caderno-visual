import { H, esc } from './dom.js';

/* Monta o glossário (#gl-list), transforma termos do texto em botões e abre o popover. */
export function initGlossary(G){

  const keys=Object.keys(G);
  const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  const sortKey=k=>norm(G[k].t).replace(/^[^a-z]+/,'');
  const sorted=keys.slice().sort((a,b)=>sortKey(a).localeCompare(sortKey(b)));
  const letterOf=k=>(sortKey(k)[0]||'#').toUpperCase();
  document.getElementById('gl-count').textContent=keys.length;
  /* lista */
  const list=document.getElementById('gl-list'),lettersEl=document.getElementById('gl-letters');
  const card=k=>{const e=G[k];const c=H('div',{class:'gl-card',id:'gl-'+k});
    c.innerHTML=`<div class="gl-term">${e.t}</div><div class="gl-def">${e.d}</div>`+
      (e.a?`<div class="gl-analogy"><span class="gl-k">como se fosse</span>${e.a}</div>`:'')+
      (e.x?`<div class="gl-deep"><span class="gl-k">pra ir além</span>${e.x}</div>`:'')+
      (e.see&&e.see.length?`<div class="gl-see">${e.see.filter(s=>G[s]).map(s=>`<a class="seebtn" href="#gl-${s}">${G[s].t}</a>`).join('')}</div>`:'');
    c.dataset.search=norm(e.t+' '+e.m.join(' ')+' '+e.d);return c;};
  let curL=null,grid=null;const groups=[];
  sorted.forEach(k=>{const L=letterOf(k);if(L!==curL){curL=L;const h=H('div',{class:'gl-letter',id:'gl-letra-'+L},L);grid=H('div',{class:'gl-grid'});list.append(h,grid);groups.push({h,grid});
      const a=H('a',{href:'#gl-letra-'+L},L);lettersEl.appendChild(a);}
    grid.appendChild(card(k));});
  const search=document.getElementById('gl-search'),empty=document.getElementById('gl-empty');
  search.addEventListener('input',()=>{const q=norm(search.value.trim());let any=0;
    groups.forEach(g=>{let n=0;[...g.grid.children].forEach(c=>{const ok=!q||c.dataset.search.includes(q);c.hidden=!ok;if(ok)n++;});g.h.hidden=!n;g.grid.hidden=!n;any+=n;});
    empty.hidden=!!any;});
  /* termos no texto */
  const form2key=new Map();keys.forEach(k=>G[k].m.forEach(f=>{if(!form2key.has(f.toLowerCase()))form2key.set(f.toLowerCase(),k);}));
  const forms=[...form2key.keys()].sort((a,b)=>b.length-a.length).map(f=>f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const re=new RegExp('(?<![\\p{L}\\p{N}*⁺-])('+forms.join('|')+')(?![\\p{L}\\p{N}-])','giu');
  const SKIP='code,h1,h2,h3,figure,.src,.formula,button,a,.gterm,.num,.lab,.widget,.tbl,.cards,.cheat,#glossario,section.fontes,.mn,.kicker,footer';
  document.querySelectorAll('section.chap').forEach(sec=>{
    if(sec.id==='glossario'||sec.id==='revisao')return;
    const seen=new Set();const tw=document.createTreeWalker(sec,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest(SKIP)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    const nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);
    nodes.forEach(node=>{const txt=node.nodeValue;re.lastIndex=0;let m,last=0;const frag=document.createDocumentFragment();let changed=false;
      while((m=re.exec(txt))){const k=form2key.get(m[1].toLowerCase());if(!k||seen.has(k))continue;seen.add(k);changed=true;
        frag.appendChild(document.createTextNode(txt.slice(last,m.index)));const b=H('button',{class:'gterm',type:'button'},esc(m[1]));b.dataset.g=k;frag.appendChild(b);last=m.index+m[1].length;}
      if(changed){frag.appendChild(document.createTextNode(txt.slice(last)));node.parentNode.replaceChild(frag,node);}});
  });
  /* popover */
  const pop=document.getElementById('pop');let anchor=null;
  function openPop(k,el){const e=G[k];if(!e)return;anchor=el;
    pop.innerHTML=`<div class="p-term">${e.t}</div><div class="p-def">${e.d}</div>`+(e.a?`<div class="p-a"><span class="gl-k">como se fosse</span>${e.a}</div>`:'')+(e.x?`<div class="p-x"><span class="gl-k">pra ir além</span>${e.x}</div>`:'')+
      `<div class="p-foot">${(e.see||[]).filter(s=>G[s]).map(s=>`<button class="seebtn" type="button" data-see="${s}">${G[s].t}</button>`).join('')}<a class="seebtn p-go" href="#gl-${k}">abrir no glossário →</a></div>`;
    pop.classList.add('on');document.querySelectorAll('.gterm.act').forEach(t=>t.classList.remove('act'));if(el.classList.contains('gterm'))el.classList.add('act');
    const r=el.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;let left=Math.min(Math.max(12,r.left),innerWidth-w-12);let top=r.bottom+8;if(top+h>innerHeight-8&&r.top-h-8>8)top=r.top-h-8;
    pop.style.left=left+scrollX+'px';pop.style.top=top+scrollY+'px';}
  function closePop(){pop.classList.remove('on');document.querySelectorAll('.gterm.act').forEach(t=>t.classList.remove('act'));anchor=null;}
  document.addEventListener('click',e=>{const t=e.target.closest('.gterm');if(t){e.stopPropagation();if(anchor===t&&pop.classList.contains('on'))closePop();else openPop(t.dataset.g,t);return;}
    const s=e.target.closest('[data-see]');if(s){openPop(s.dataset.see,anchor||s);return;}
    if(e.target.closest('.p-go')){closePop();return;}
    if(!e.target.closest('#pop'))closePop();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePop();});
  /* destaca o cartão ao navegar */
  addEventListener('hashchange',()=>{const c=document.querySelector(location.hash.startsWith('#gl-')?location.hash:null);if(c&&c.classList.contains('gl-card')){c.classList.add('flash');setTimeout(()=>c.classList.remove('flash'),1600);}});
}

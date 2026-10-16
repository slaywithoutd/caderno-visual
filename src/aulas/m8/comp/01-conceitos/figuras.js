import { S, H, esc, reduce } from '../../../../lib/dom.js';
import { StepFig } from '../../../../lib/stepfig.js';
import { drawMachine } from '../../../../lib/machine.js';

/* ============ Fig 1: Σ* ============ */
(function(){
  const svg=document.getElementById('sig-svg'),cap=document.getElementById('sig-cap');
  const nodes=[];const levelY=[34,104,174,244];
  function build(w,d){const n={w,d,kids:[]};nodes.push(n);if(d<3){n.kids=[build(w+'a',d+1),build(w+'b',d+1)];}return n;}
  const root=build('',0);
  let leaf=0;(function lay(n){if(!n.kids.length)n.x=95+leaf++*84;else{n.kids.forEach(lay);n.x=(n.kids[0].x+n.kids[1].x)/2;}})(root);
  const gE=S('g',null,svg),gN=S('g',null,svg);
  ['Σ⁰','Σ¹','Σ²','Σ³'].forEach((t,i)=>{const tx=S('text',{x:18,y:levelY[i]+5,class:'sv-muted anim lvl'},gN,t);tx.dataset.d=i;});
  nodes.forEach(n=>{n.kids.forEach((c,i)=>{const g=S('g',{class:'anim'},gE);g.dataset.d=c.d;
      S('line',{x1:n.x,y1:levelY[n.d]+13,x2:c.x,y2:levelY[c.d]-13,class:'sv-edge'},g);
      S('text',{x:(n.x+c.x)/2+(i?10:-10),y:(levelY[n.d]+levelY[c.d])/2+4,class:'elab'},g,i?'b':'a');});
    const g=S('g',{class:'wnode anim'},gN);n.g=g;g.dataset.d=n.d;
    const wd=Math.max(30,16+n.w.length*9);
    S('rect',{x:n.x-wd/2,y:levelY[n.d]-13,width:wd,height:26,rx:7},g);S('text',{x:n.x,y:levelY[n.d]},g,n.w||'ε');});
  const dots=S('text',{x:360,y:288,class:'sv-muted anim','text-anchor':'middle'},gN,'⋮  Σ⁴, Σ⁵, … continua para sempre');
  const pal=w=>w===[...w].reverse().join('');
  const caps=['Σ⁰ = { ε }','Σ¹ = { a, b }','Σ² = { aa, ab, ba, bb }','Σ³ = { aaa, aab, aba, abb, baa, bab, bba, bbb }','Σ* = Σ⁰ ∪ Σ¹ ∪ Σ² ∪ Σ³ ∪ …','Σ⁺ = Σ* − { ε }','L₁ = { w ∈ Σ* | w é palíndromo } = { ε, a, b, aa, bb, aaa, aba, … }','L₂ = { w ∈ Σ* | w começa com a } = { a, aa, ab, aaa, … }'];
  const notes=[
    'Alfabeto <code>Σ = {a, b}</code>. A única palavra de comprimento 0 é a <b>palavra vazia ε</b>.',
    'Comprimento 1: cada símbolo sozinho já é uma palavra. Cada aresta da árvore acrescenta um símbolo no fim (concatenação).',
    'Comprimento 2: <b>2² = 4</b> palavras. Repare que <code>ab ≠ ba</code>: a ordem importa.',
    'Comprimento 3: <b>2³ = 8</b>. Em geral, com |Σ| = k há <b>kⁿ</b> palavras de comprimento n.',
    '<b>Σ*</b> junta todos os níveis. É infinito, mas <b>cada palavra é finita</b>.',
    '<b>Σ⁺</b> é o mesmo conjunto sem ε.',
    'Uma <b>linguagem</b> é só uma escolha de palavras dentro de Σ*. Aqui: os palíndromos (iguais lidos de trás para frente).',
    'Outra linguagem: palavras que começam com a. Toda a subárvore de <code>a</code> entra. <code>a</code> é <b>prefixo</b> de todas elas.'
  ];
  new StepFig(document.getElementById('fig-sigma'),{notes,speed:2200,render(k){
    const lv=Math.min(k,3);
    svg.querySelectorAll('[data-d]').forEach(e=>{const d=+e.dataset.d;e.classList.toggle('hide',d>lv);});
    dots.classList.toggle('hide',k<4);
    nodes.forEach(n=>{const g=n.g;g.classList.toggle('new',k<=3&&n.d===k);g.classList.toggle('strike',k===5&&n.d===0);
      g.classList.toggle('hl',(k===6&&pal(n.w))||(k===7&&n.w.startsWith('a')));
      g.classList.toggle('ghosted',(k===6&&!pal(n.w))||(k===7&&!n.w.startsWith('a')));});
    cap.textContent=caps[k];
  }});
})();

/* ============ widget concatenação ============ */
(function(){
  const v=document.getElementById('cw-v'),w=document.getElementById('cw-w'),out=document.getElementById('cw-out');
  const f=s=>s===''?'ε':esc(s);
  function upd(){const a=v.value,b=w.value;const pre=[],suf=[];for(let i=0;i<=b.length;i++){pre.push(f(b.slice(0,i)));suf.push(f(b.slice(i)));}
    const rows=[['vw',f(a+b)],['wv',f(b+a)],['|v|, |w|, |vw|',`${a.length}, ${b.length}, ${a.length+b.length}`],['w⁰, w¹, w², w³',['',b,b+b,b+b+b].map(f).join(', ')],['prefixos de w',pre.join(', ')],['sufixos de w',suf.join(', ')],['vw = wv ?',a+b===b+a?'sim (caso especial)':'não: concatenação não é comutativa']];
    out.innerHTML=rows.map(r=>`<span>${r[0]}</span><span>${r[1]}</span>`).join('');}
  v.addEventListener('input',upd);w.addEventListener('input',upd);upd();
})();

/* ============ Derivações ============ */
const GR={
  anbn:{label:'aⁿbⁿ: aaabbb',start:'S',rules:{S:[['a','S','b'],[]]},seq:[0,0,0,1],
    extra:{1:'Um <b>a</b> e um <b>b</b> entram juntos, um de cada lado do S. É isso que garante a mesma quantidade.',4:'S → ε apaga a última variável.'},
    intro:'Gramática do livro para <b>duplo balanceamento</b>: <code>G = ({S}, {a,b}, P, S)</code>. Começa pela variável inicial <b>S</b>.'},
  num:{label:'Números: 243',start:'N',rules:{N:[['D','N'],['D']],D:'0123456789'.split('').map(c=>[c])},seq:[0,2,0,4,1,3],
    extra:{1:'N → DN: "um dígito seguido de mais um número".',5:'N → D encerra a recursão: este é o último dígito.'},
    intro:'Gramática do livro para <b>números naturais</b>: <code>N → D | DN</code>, <code>D → 0 | … | 9</code>. Começa em <b>N</b>.'},
  expr:{label:'x*(x+x)',start:'E',rules:{E:[['E','+','E'],['E','*','E'],['(','E',')'],['x']]},seq:[1,3,2,0,3,3],
    extra:{3:'Os parênteses entram <b>juntos</b> pela regra E → (E): duplo balanceamento de novo.'},
    intro:'Gramática de <b>expressões aritméticas</b> (Menezes): <code>E → E+E | E*E | (E) | x</code>.'},
  amb1:{label:'x+x*x · árvore 1',start:'E',rules:{E:[['E','+','E'],['E','*','E'],['(','E',')'],['x']]},seq:[0,3,1,3,3],
    extra:{1:'Começa pelo <b>+</b>: o * fica embaixo, dentro do segundo operando. Lê-se x + (x*x).'},
    final:'Compare com a árvore 2: mesma palavra, outra árvore.',
    intro:'Derivando <code>x+x*x</code> pela primeira vez.'},
  amb2:{label:'x+x*x · árvore 2',start:'E',rules:{E:[['E','+','E'],['E','*','E'],['(','E',')'],['x']]},seq:[1,0,3,3,3],
    extra:{1:'Agora começa pelo <b>*</b>: o + fica embaixo. Lê-se (x+x) * x.'},
    final:'Mesma palavra, <b>duas árvores diferentes</b>: esta gramática é <b>ambígua</b>. Para um compilador isso é ruim, porque o significado muda.',
    intro:'Derivando a mesma palavra <code>x+x*x</code> de outro jeito.'},
};
function buildDeriv(def){
  let id=0;const isV=s=>s in def.rules;
  const mk=(sym,born,depth,parent)=>({id:id++,sym,born,depth,parent,children:[]});
  const root=mk(def.start,0,0,null);let form=[root];
  const snaps=[{form:form.slice(),exp:null,rule:null,fresh:new Set([root.id])}];
  def.seq.forEach((alt,j)=>{
    const idx=form.findIndex(n=>isV(n.sym));const node=form[idx];const rhs=def.rules[node.sym][alt];
    const kids=rhs.length?rhs.map(s=>mk(s,j+1,node.depth+1,node)):[mk('ε',j+1,node.depth+1,node)];
    node.children=kids;
    form=[...form.slice(0,idx),...kids.filter(k=>k.sym!=='ε'),...form.slice(idx+1)];
    snaps.push({form:form.slice(),exp:node,rule:[node.sym,alt],fresh:new Set(kids.map(k=>k.id))});
  });
  let slot=0;const all=[];(function lay(n){all.push(n);if(!n.children.length)n.x=slot++;else{n.children.forEach(lay);n.x=(n.children[0].x+n.children[n.children.length-1].x)/2;}})(root);
  return {root,snaps,all,leaves:slot,depth:Math.max(...all.map(n=>n.depth)),isV};
}
const rhsStr=r=>r.length?r.join(''):'ε';
function derivFig(rootId,keys){
  const root=document.getElementById(rootId);
  const rulesEl=root.querySelector('.rules'),sform=root.querySelector('.sform'),chain=root.querySelector('.chain'),svg=root.querySelector('svg.tree'),tabs=root.querySelector('.fig-tabs');
  let fig=null,cur=null;
  function load(key){
    const def=GR[key];const D=buildDeriv(def);
    tabs.querySelectorAll('.btn').forEach(b=>b.classList.toggle('sel',b.dataset.k===key));
    rulesEl.innerHTML='';
    for(const v in def.rules){const ln=H('div',{class:'ln'});ln.appendChild(H('span',{class:'v'},v));ln.appendChild(H('span',{class:'bar'},'→'));
      def.rules[v].forEach((r,i)=>{if(i)ln.appendChild(H('span',{class:'bar'},'|'));const s=H('span',{class:'alt'},esc(rhsStr(r)));s.dataset.r=v+i;ln.appendChild(s);});rulesEl.appendChild(ln);}
    svg.innerHTML='';
    const SX=58,SY=60,W=Math.max(D.leaves*SX,260),Hh=D.depth*SY+50;
    svg.setAttribute('viewBox',`${-W/2} 0 ${W} ${Hh}`);svg.style.maxHeight=Math.min(Hh*1.1,420)+'px';
    const off=-(D.leaves-1)*SX/2;const px=n=>off+n.x*SX,py=n=>24+n.depth*SY;
    const gE=S('g',null,svg),gN=S('g',null,svg);
    D.all.forEach(n=>{
      if(n.parent){n.e=S('line',{x1:px(n.parent),y1:py(n.parent)+17,x2:px(n),y2:py(n)-17,class:'tedge anim'},gE);}
      const g=S('g',{class:'tnode anim'+(D.isV(n.sym)?' isvar':n.sym==='ε'?' eps':' term')},gN);
      S('circle',{cx:px(n),cy:py(n),r:17},g);S('text',{x:px(n),y:py(n)},g,n.sym);n.g=g;
    });
    const fs=f=>f.length?f.map(n=>n.sym).join(''):'ε';
    const notes=D.snaps.map((s,k)=>{
      if(k===0)return def.intro;
      const prev=fs(D.snaps[k-1].form),now=fs(s.form);const [v,a]=s.rule;
      let t=`Aplica <code>${v} → ${esc(rhsStr(def.rules[v][a]))}</code> na variável mais à esquerda: <code>${esc(prev)} ⇒ ${esc(now)}</code>.`;
      if(def.extra&&def.extra[k])t+=' '+def.extra[k];
      if(k===D.snaps.length-1)t+=` <b>Só sobraram terminais</b>: <code>${esc(now)}</code> ∈ L(G). ${def.final||''}`;
      return t;
    });
    cur={D,def};
    const render=k=>{
      const s=D.snaps[k];
      rulesEl.querySelectorAll('.alt').forEach(e=>e.classList.toggle('on',!!s.rule&&e.dataset.r===s.rule[0]+s.rule[1]));
      sform.innerHTML='';
      if(!s.form.length)sform.appendChild(H('span',{class:'tok eps'},'ε'));
      s.form.forEach(n=>{sform.appendChild(H('span',{class:'tok'+(D.isV(n.sym)?' var':'')+(s.fresh.has(n.id)&&k>0?' fresh':'')},esc(n.sym)));});
      chain.innerHTML=D.snaps.slice(0,k+1).map((x,i)=>i===k?`<b>${esc(fs(x.form))}</b>`:esc(fs(x.form))).join(' ⇒ ');
      D.all.forEach(n=>{const vis=n.born<=k;n.g.classList.toggle('hide',!vis);if(n.e)n.e.classList.toggle('hide',!vis);
        n.g.classList.toggle('exp',s.exp===n);});
    };
    if(!fig)fig=new StepFig(root,{notes,render,speed:1800});else{fig.stop();fig.render=render;fig.setSteps(notes);}
  }
  keys.forEach(k=>{const b=H('button',{class:'btn sm'},GR[k].label);b.dataset.k=k;b.addEventListener('click',()=>{load(k);fig.play();});tabs.appendChild(b);});
  load(keys[0]);
}
derivFig('fig-der1',['anbn','num']);
derivFig('fig-der2',['expr','amb1','amb2']);

/* ============ AFN: conjunto de estados ativos ============ */
(function(){
  const svg=document.getElementById('afn-svg');
  const D=drawMachine(svg,{states:[{id:'q1',x:80,y:140,start:true},{id:'q2',x:240,y:140},{id:'q3',x:400,y:140},{id:'q4',x:560,y:140,accept:true}],
    edges:[{from:'q1',to:'q1',labels:[{text:'0, 1',k:0}]},{from:'q1',to:'q2',labels:[{text:'1',k:0}]},{from:'q2',to:'q3',labels:[{text:'0, ε',k:0}]},{from:'q3',to:'q4',labels:[{text:'1',k:0}]},{from:'q4',to:'q4',labels:[{text:'0, 1',k:0}]}]});
  const w='010110';
  const sets=[['q1'],['q1'],['q1','q2','q3'],['q1','q3'],['q1','q2','q3','q4'],['q1','q2','q3','q4'],['q1','q3','q4']];
  const notes=[
    'Este AFN aceita as palavras com <code>11</code> ou <code>101</code>. Ele começa só no estado inicial. Ativos: <b>{q1}</b>.',
    'Lê <b>0</b>: q1 tem um laço com 0 e fica em q1. Ativos: <b>{q1}</b>.',
    'Lê <b>1</b>: q1 tem duas setas com 1, então a computação se divide. Um ramo fica em q1 e outro vai para q2. De q2 sai uma ε-transição para q3, seguida sem ler nada. Ativos: <b>{q1, q2, q3}</b>.',
    'Lê <b>0</b>: q1 fica em q1, q2 vai para q3, e q3 não tem seta com 0: esse ramo <b>morre</b>. Ativos: <b>{q1, q3}</b>.',
    'Lê <b>1</b>: q1 se divide de novo (q1, q2 e, pelo ε, q3) e q3 vai para q4. q4 é final: o ramo que chegou lá achou <code>101</code>. Ativos: <b>{q1, q2, q3, q4}</b>.',
    'Lê <b>1</b>: q2 não tem seta com 1 e morre; q3 vai para q4; q4 fica em q4. Ativos: <b>{q1, q2, q3, q4}</b>.',
    'Lê <b>0</b>: q3 morre; os outros seguem. Ativos: <b>{q1, q3, q4}</b>.',
    '<b class="ok">Aceita.</b> A entrada acabou e um dos estados ativos, q4, é final. Basta <b>um</b> ramo aceitar, mesmo que vários tenham morrido no caminho.'
  ];
  const tape=document.getElementById('afn-tape'),trail=document.getElementById('afn-trail');
  const cells=[...w].map(c=>H('span',{class:'cell'},c));tape.append(...cells);
  const fmt=s=>`{${s.join(', ')}}`;
  new StepFig(document.getElementById('fig-afn'),{notes,speed:2200,render(k){
    const fin=k>=7,pos=Math.min(k,6),act=sets[pos];
    Object.entries(D.states).forEach(([id,g])=>{g.classList.remove('on','acc');if(act.includes(id))g.classList.add(fin&&id==='q4'?'acc':'on');});
    cells.forEach((c,i)=>{c.className='cell'+(i<pos?' done':'')+(i===pos&&!fin?' head':'');});
    trail.innerHTML=sets.slice(0,pos+1).map((s,i)=>`<span class="q${i===pos?' rep':''}">${fmt(s)}</span>`).join('<span class="ar">→</span>');
  }});
})();

/* ============ Fig 4: bombeamento no AFD ============ */
(function(){
  const svg=document.getElementById('pump-svg');
  const M={states:[{id:'q0',x:70,y:120,start:true},{id:'q1',x:230,y:120},{id:'q2',x:410,y:120},{id:'q3',x:230,y:245,accept:true},{id:'qe',x:520,y:245,faded:true,note:'erro (setas omitidas)'}],
    edges:[{from:'q0',to:'q1',labels:[{text:'a',k:'a'}]},{from:'q1',to:'q2',labels:[{text:'b',k:'b'}],bend:-38},{from:'q2',to:'q1',labels:[{text:'c',k:'c'}],bend:-38},{from:'q1',to:'q3',labels:[{text:'d',k:'d'}]}]};
  const D=drawMachine(svg,M);
  S('text',{x:600,y:30,class:'sv-muted','text-anchor':'end'},svg,'L = a(bc)*d   ·   p = 5 estados');
  const w='abcbcd';const path=['q0','q1','q2','q1','q2','q1','q3'];
  const tape=document.getElementById('pump-tape'),trail=document.getElementById('pump-trail'),cap=document.getElementById('pump-cap');
  const notes=[
    'Um AFD para <code>L = a(bc)*d</code>. Ele tem <b>p = 5</b> estados contando o de erro. Toda palavra de L com |w| ≥ p terá que repetir algum estado.',
    'Vamos ler <code>w = abcbcd</code>, com |w| = 6 ≥ p. Começa em q0.',
    'Lê <b>a</b>: vai para q1.',
    'Lê <b>b</b>: vai para q2.',
    'Lê <b>c</b>: volta para <b>q1</b>, que já tinha sido visitado. <b>Casa dos pombos</b>: ler p símbolos passa por p+1 estados, então algum se repete.',
    'O trecho lido entre as duas visitas a q1 é um <b>laço</b>. Chamamos de <b>y = bc</b>. Antes dele, <b>x = a</b>; depois, <b>z = bcd</b>.',
    'Bombeando com <b>i = 2</b>: <code>x·y·y·z = a·bc·bc·bcd</code>. O AFD só dá mais uma volta no laço e ainda aceita.',
    'Com <b>i = 0</b>: <code>x·z = a·bcd</code>. Pula o laço e ainda aceita.',
    'Isso vale para <b>qualquer</b> L regular: palavras longas sempre têm um y que pode ser repetido ou removido sem sair de L. Esse é o lema.'
  ];
  const cells=[...w].map(c=>H('span',{class:'cell'},c));tape.append(...cells);
  function seg(str,cls){return [...str].map(c=>`<span class="cell ${cls}">${c}</span>`).join('');}
  new StepFig(document.getElementById('fig-pump'),{notes,speed:2100,render(k){
    const pos=k>=1&&k<=4?k-1:(k>4?3:-1);
    Object.values(D.states).forEach(g=>g.classList.remove('on','rep'));
    Object.values(D.edges).forEach(g=>g.classList.remove('on','y'));
    if(pos>=0&&k<=4){D.states[path[pos]].classList.add('on');}
    if(k>=2&&k<=4){const e=D.edges[path[pos-1]+'>'+path[pos]];if(e)e.classList.add('on');}
    if(k===4)D.states.q1.classList.add('rep');
    if(k>=5){D.edges['q1>q2'].classList.add('y');D.edges['q2>q1'].classList.add('y');D.states.q1.classList.add('rep');}
    if(k===6||k===7){D.states.q3.classList.add('on');}
    cells.forEach((c,i)=>{c.className='cell'+(k>=1&&k<=4&&i<pos?' done':'')+(k>=1&&k<=4&&i===pos?' head':'')+(k>=5?(i<1?' x':i<3?' y':' z'):'');});
    const shown=k===0?[]:path.slice(0,Math.min(pos+1,4));
    trail.innerHTML=shown.map((q,i)=>`<span class="q${(k>=4&&q==='q1'&&i>0)?' rep':''}">${q}</span>`).join('<span class="ar">→</span>')||'<span class="muted">—</span>';
    cap.innerHTML=k<5?(k===4?'q1 aparece duas vezes → existe um laço':'&nbsp;'):
      k===5?'w = <span style="color:var(--blue)">x</span>·<span style="color:var(--amber)">y</span>·<span style="color:var(--accent)">z</span> = a · bc · bcd   (|y| = 2 ≥ 1, |xy| = 3 ≤ p)':
      k===6?'xy²z = a·bc·bc·bcd = abcbcbcd  ✓ aceita':k===7?'xy⁰z = a·bcd = abcd  ✓ aceita':'∀ i ≥ 0:  x yⁱ z ∈ L';
  }});
})();

/* ============ Fig 4: jogo ============ */
(function(){
  const $=id=>document.getElementById(id);
  const p=$('g-p'),s=$('g-s'),l=$('g-l'),i=$('g-i');
  function upd(){
    const P=+p.value;s.max=P-1;if(+s.value>P-1)s.value=P-1;const smax=P-(+s.value);l.max=smax;if(+l.value>smax)l.value=smax;
    const st=+s.value,L=+l.value,I=+i.value;
    $('g-pv').textContent=P;$('g-sv').textContent=st;$('g-lv').textContent=L;$('g-iv').textContent=I;
    const w='a'.repeat(P)+'b'.repeat(P);const x=w.slice(0,st),y=w.slice(st,st+L),z=w.slice(st+L);
    const cell=(c,cls)=>`<span class="cell ${cls}">${c}</span>`;
    $('g-w').innerHTML=[...x].map(c=>cell(c,'x')).join('')+[...y].map(c=>cell(c,'y')).join('')+[...z].map(c=>cell(c,'z')).join('');
    const pumped=x+y.repeat(I)+z;
    $('g-plab').textContent=`x yⁱ z com i = ${I}   →   |x| = ${x.length}, |y| = ${y.length}, |z| = ${z.length}`;
    $('g-pumped').innerHTML=([...x].map(c=>cell(c,'x')).join('')+Array.from({length:I},()=>[...y].map(c=>cell(c,'y')).join('')).join('')+[...z].map(c=>cell(c,'z')).join(''))||'<span class="cell endmark">ε</span>';
    const na=(pumped.match(/a/g)||[]).length,nb=(pumped.match(/b/g)||[]).length;const inL=/^a*b*$/.test(pumped)&&na===nb;
    const v=$('g-verdict');v.className='verdict '+(inL?'ok':'bad');
    v.innerHTML=inL?`Com i = ${I} a palavra continua em L (${na} a, ${nb} b). Tente outro i.`:`${na} a e ${nb} b → <b>∉ L</b>. Você venceu essa divisão.`;
    $('g-allout').textContent='';
  }
  [p,s,l,i].forEach(e=>e.addEventListener('input',upd));
  $('g-all').addEventListener('click',()=>{const P=+p.value;let tot=0,ok=0;
    for(let st=0;st<P;st++)for(let L=1;st+L<=P;L++){tot++;const w='a'.repeat(P)+'b'.repeat(P);const pu=w.slice(0,st)+w.slice(st,st+L).repeat(2)+w.slice(st+L);const na=(pu.match(/a/g)||[]).length,nb=pu.length-na;if(na===nb)ok++;}
    $('g-allout').innerHTML=`p = ${P}: ${tot} divisões válidas, <b>${tot-ok}</b> falham com i = 2. Nenhuma escapa.`;});
  upd();
})();

/* ============ Autômatos com pilha ============ */
const fmtT=t=>`${t.read||'ε'}, ${t.pop||'ε'} → ${t.push||'ε'}`;
const PDAS={
  anbn:{name:'aⁿbⁿ',alpha:'ab',start:'q1',accept:['q1','q4'],presets:['aaabbb','aabbb','abab',''],vb:'0 0 620 180',
    states:[{id:'q1',x:60,y:120},{id:'q2',x:220,y:120},{id:'q3',x:400,y:120},{id:'q4',x:560,y:120}],
    trans:[{from:'q1',to:'q2',read:'',pop:'',push:'$',hint:'marca o fundo da pilha com $'},
      {from:'q2',to:'q2',read:'a',pop:'',push:'A',hint:'cada a vira um A na pilha (contando)'},
      {from:'q2',to:'q3',read:'b',pop:'A',push:'',hint:'primeiro b: começa a cancelar'},
      {from:'q3',to:'q3',read:'b',pop:'A',push:'',hint:'cada b cancela um A'},
      {from:'q3',to:'q4',read:'',pop:'$',push:'',hint:'achou o $: todos os A foram cancelados, mesma quantidade'}]},
  wwr:{name:'wwᴿ (palíndromo par)',alpha:'ab',start:'q1',accept:['q4'],presets:['abba','aabbaa','abab','baab'],vb:'0 0 620 180',
    states:[{id:'q1',x:60,y:120},{id:'q2',x:220,y:120},{id:'q3',x:400,y:120},{id:'q4',x:560,y:120}],
    trans:[{from:'q1',to:'q2',read:'',pop:'',push:'$',hint:'marca o fundo da pilha'},
      {from:'q2',to:'q2',read:'a',pop:'',push:'a',hint:'guarda a primeira metade'},
      {from:'q2',to:'q2',read:'b',pop:'',push:'b',hint:'guarda a primeira metade'},
      {from:'q2',to:'q3',read:'',pop:'',push:'',hint:'<b>chuta</b> que chegou no meio (ε-transição não determinística)'},
      {from:'q3',to:'q3',read:'a',pop:'a',push:'',hint:'confere com o topo: bateu'},
      {from:'q3',to:'q3',read:'b',pop:'b',push:'',hint:'confere com o topo: bateu'},
      {from:'q3',to:'q4',read:'',pop:'$',push:'',hint:'pilha vazia: a segunda metade é o espelho da primeira'}]},
  abc:{name:'aⁱbʲcᵏ, i = j ou i = k',alpha:'abc',start:'q1',accept:['q4','q7'],presets:['aabbc','aabcc','aabccc','abc'],vb:'0 0 640 340',
    states:[{id:'q1',x:50,y:170},{id:'q2',x:170,y:170},{id:'q3',x:310,y:85},{id:'q4',x:470,y:85},{id:'q5',x:310,y:255,loopDir:'down'},{id:'q6',x:450,y:255,loopDir:'down'},{id:'q7',x:590,y:255}],
    bends:{'q2>q3':0,'q2>q5':0},labelOffs:{'q2>q3':14},
    trans:[{from:'q1',to:'q2',read:'',pop:'',push:'$',hint:'marca o fundo da pilha'},
      {from:'q2',to:'q2',read:'a',pop:'',push:'A',hint:'cada a vira um A na pilha'},
      {from:'q2',to:'q3',read:'',pop:'',push:'',hint:'<b>chuta</b>: vou testar i = j'},
      {from:'q3',to:'q3',read:'b',pop:'A',push:'',hint:'cada b cancela um A'},
      {from:'q3',to:'q4',read:'',pop:'$',push:'',hint:'bateu: i = j'},
      {from:'q4',to:'q4',read:'c',pop:'',push:'',hint:'os c não importam neste ramo'},
      {from:'q2',to:'q5',read:'',pop:'',push:'',hint:'<b>chuta</b>: vou testar i = k'},
      {from:'q5',to:'q5',read:'b',pop:'',push:'',hint:'os b não importam neste ramo'},
      {from:'q5',to:'q6',read:'',pop:'',push:'',hint:'passa para os c'},
      {from:'q6',to:'q6',read:'c',pop:'A',push:'',hint:'cada c cancela um A'},
      {from:'q6',to:'q7',read:'',pop:'$',push:'',hint:'bateu: i = k'}]},
  zeros:{name:'0ⁿ1²ⁿ (exercício da aula)',alpha:'01',start:'q1',accept:['q5'],presets:['011','001111','0011','00111111'],vb:'0 0 640 200',
    states:[{id:'q1',x:50,y:130},{id:'q2',x:180,y:130},{id:'q3',x:330,y:130},{id:'q4',x:470,y:130},{id:'q5',x:600,y:130}],
    bends:{'q3>q4':-34,'q4>q3':-34},
    trans:[{from:'q1',to:'q2',read:'',pop:'',push:'$',hint:'marca o fundo da pilha'},
      {from:'q2',to:'q2',read:'0',pop:'',push:'X',hint:'cada 0 vira um X na pilha'},
      {from:'q2',to:'q3',read:'1',pop:'',push:'',hint:'primeiro 1 do par: só lê'},
      {from:'q3',to:'q4',read:'1',pop:'X',push:'',hint:'segundo 1 do par: cancela um X'},
      {from:'q4',to:'q3',read:'1',pop:'',push:'',hint:'começa o próximo par: só lê'},
      {from:'q4',to:'q5',read:'',pop:'$',push:'',hint:'achou o $: cada 0 teve seus dois 1'}]},
};
function simulate(M,w){
  const n=w.length,cap=n+3,key=c=>c.s+'|'+c.pos+'|'+c.st.join('');
  const st0={s:M.start,pos:0,st:[],t:null,parent:null,d:0};const q=[st0];const seen=new Set([key(st0)]);
  let best=st0,explored=0,acc=null;
  while(q.length&&explored<60000){const c=q.shift();explored++;
    if(c.pos===n&&M.accept.includes(c.s)){acc=c;break;}
    if(c.pos>=best.pos)best=c;
    for(const t of M.trans){if(t.from!==c.s)continue;if(t.read&&w[c.pos]!==t.read)continue;if(t.pop&&c.st[c.st.length-1]!==t.pop)continue;
      const st=c.st.slice();if(t.pop)st.pop();if(t.push)st.push(t.push);if(st.length>cap)continue;
      const nc={s:t.to,pos:c.pos+(t.read?1:0),st,t,parent:c,d:c.d+1};const k=key(nc);if(seen.has(k))continue;seen.add(k);q.push(nc);}
  }
  const end=acc||best;const path=[];for(let c=end;c;c=c.parent)path.unshift(c);
  return {ok:!!acc,path,explored};
}
function pdaFig(rootId,keys){
  const root=document.getElementById(rootId);
  const svg=root.querySelector('svg.diag'),tape=root.querySelector('.tape'),cfg=root.querySelector('.cfg'),well=root.querySelector('.well'),bar=root.querySelector('.pda-in');
  let fig=null,key=keys[0],D=null,M=null;
  let sel=null;
  if(keys.length>1){sel=H('select',{id:rootId+'-m','aria-label':'Máquina'});keys.forEach(k=>sel.appendChild(H('option',{value:k},PDAS[k].name)));bar.appendChild(sel);}
  const inp=H('input',{type:'text',id:rootId+'-w','aria-label':'Entrada',maxlength:'12',spellcheck:'false'});bar.appendChild(inp);
  const pre=H('span',{class:'fig-tabs'});bar.appendChild(pre);
  function setMachine(k){key=k;M=PDAS[k];
    const groups={};M.trans.forEach((t,i)=>{const g=t.from+'>'+t.to;(groups[g]=groups[g]||[]).push({text:fmtT(t),k:i});});
    const edges=Object.entries(groups).map(([g,labels])=>{const [from,to]=g.split('>');return {from,to,labels,bend:(M.bends&&M.bends[g])||0,labelOff:M.labelOffs?M.labelOffs[g]:undefined};});
    svg.setAttribute('viewBox',M.vb);
    D=drawMachine(svg,{states:M.states.map(s=>({...s,start:s.id===M.start,accept:M.accept.includes(s.id)})),edges});
    pre.innerHTML='';M.presets.forEach(p=>{const b=H('button',{class:'btn sm'},p===''?'ε':p);b.addEventListener('click',()=>{inp.value=p;run(true)});pre.appendChild(b);});
    inp.value=M.presets[0];run(false);}
  function run(autoplay){
    const w=[...inp.value].filter(c=>M.alpha.includes(c)).join('');if(w!==inp.value)inp.value=w;
    const R=simulate(M,w);const P=R.path;
    const notes=P.map((c,k)=>{if(k===0)return `Configuração inicial <code>(${c.s}, ${w||'ε'}, ε)</code>: estado ${c.s}, entrada inteira, pilha vazia.`;
      const t=c.t;const r=t.read?`lê <b>${t.read}</b>`:'não lê (ε)',po=t.pop?`desempilha <b>${t.pop}</b>`:'não desempilha',pu=t.push?`empilha <b>${t.push}</b>`:'não empilha';
      const id=x=>`(${x.s}, ${esc(w.slice(x.pos)||'ε')}, ${esc(x.st.join('')||'ε')})`;
      return `<code>${t.from} → ${t.to}</code> com <code>${fmtT(t)}</code>: ${t.hint}.<br><small>${r} · ${po} · ${pu}</small><br><small class="mono">${id(P[k-1])} ⊢ ${id(c)}</small>`;});
    const last=P[P.length-1];
    notes.push(R.ok?`<b class="ok">Aceita.</b> Leu a entrada toda e está em ${last.s}, estado de aceitação. Basta <b>um</b> ramo aceitar. (${R.explored} configurações exploradas)`
      :`<b class="bad">Rejeita.</b> Nenhum ramo lê a entrada toda e termina em estado de aceitação. Mostrei o ramo que foi mais longe (leu ${last.pos} de ${w.length} símbolos). ${R.explored} configurações exploradas.`);
    const render=k=>{
      const fin=k>=P.length;const c=P[Math.min(k,P.length-1)];const prev=k>0?P[Math.min(k,P.length-1)-(fin?0:1)]:null;
      Object.values(D.states).forEach(g=>g.classList.remove('on','acc','rej'));Object.values(D.edges).forEach(g=>{g.classList.remove('on');g.querySelectorAll('tspan').forEach(t=>t.classList.remove('on'));});
      D.states[c.s].classList.add(fin?(R.ok?'acc':'rej'):'on');
      if(!fin&&c.t){const g=D.edges[c.t.from+'>'+c.t.to];g.classList.add('on');const ti=M.trans.indexOf(c.t);g.querySelectorAll('tspan').forEach(t=>t.classList.toggle('on',+t.dataset.k===ti));}
      tape.innerHTML='';if(!w.length)tape.appendChild(H('span',{class:'cell endmark'},'ε (entrada vazia)'));
      [...w].forEach((ch,i)=>tape.appendChild(H('span',{class:'cell'+(i<c.pos?' done':'')+(i===c.pos&&!fin?' head':'')},ch)));
      const rest=w.slice(c.pos)||'ε',stk=c.st.join('')||'ε';
      cfg.innerHTML=`(${c.s}, ${esc(rest)}, ${esc(stk)})`+(fin?(R.ok?'  <span class="ok">✓ aceita</span>':'  <span class="bad">✗ rejeita</span>'):'');
      well.innerHTML='';const before=(!fin&&prev&&k>0)?P[k-1].st:c.st;let common=0;while(common<before.length&&common<c.st.length&&before[common]===c.st[common])common++;
      const items=[];for(let i=before.length-1;i>=common;i--)items.push(H('div',{class:'sitem out'},esc(before[i])));
      for(let i=c.st.length-1;i>=0;i--)items.push(H('div',{class:'sitem'+(c.st[i]==='$'?' bottom':'')+(i>=common&&!fin&&k>0?' in':'')},esc(c.st[i])));
      if(!items.length)items.push(H('div',{class:'muted',style:'font-size:.75rem;text-align:center'},'vazia'));
      well.append(...items);
    };
    if(!fig)fig=new StepFig(root,{notes,render,speed:1300});else{fig.stop();fig.render=render;fig.setSteps(notes);if(autoplay)fig.play();}
  }
  inp.addEventListener('change',()=>run(true));
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')run(true)});
  if(sel)sel.addEventListener('change',()=>{setMachine(sel.value);fig.play();});
  setMachine(key);
}
pdaFig('fig-pda1',['anbn']);
pdaFig('fig-pda2',['wwr','abc','zeros']);

/* ============ Chomsky ============ */
(function(){
  const svg=document.getElementById('ch-svg');const cx=350,cy=212;
  const rings=[
    {rx:110,ry:56,lab:'Tipo 3 · Regulares',c:'var(--accent)'},
    {rx:190,ry:100,lab:'Tipo 2 · Livres do contexto',c:'var(--blue)'},
    {rx:265,ry:142,lab:'Tipo 1 · Sensíveis ao contexto',c:'var(--amber)'},
    {rx:335,ry:182,lab:'Tipo 0 · Recursivamente enumeráveis',c:'var(--red)'}];
  const gR=S('g',null,svg),gX=S('g',null,svg);
  rings.slice().reverse().forEach(r=>{const g=S('g',{class:'anim'},gR);r.g=g;
    S('ellipse',{cx,cy,rx:r.rx,ry:r.ry,class:'ringfill',fill:r.c,'fill-opacity':'.06'},g);
    r.el=S('ellipse',{cx,cy,rx:r.rx,ry:r.ry,class:'ring',stroke:r.c},g);
    S('text',{x:cx,y:r===rings[0]?cy-28:cy-r.ry+20,class:'ring-lab',fill:r.c},g,r.lab);});
  const EX=[
    {t:'a*b*',r:0,x:cx-45,y:cy+5,why:'Regular: a expressão regular a*b* descreve, e um AFD de 2 estados (mais o de erro) reconhece.'},
    {t:'(ab)*',r:0,x:cx+45,y:cy+5,why:'Regular: AFD com um laço de 2 estados.'},
    {t:'aⁿbⁿ',r:1,x:cx-150,y:cy+10,why:'Livre do contexto (S → aSb | ε, AP da Figura 7), mas não regular (lema do bombeamento, Figura 5).'},
    {t:'wwᴿ',r:1,x:cx+150,y:cy+10,why:'Livre do contexto: AP que chuta o meio (Figura 8). Não regular.'},
    {t:'expressões',r:1,x:cx,y:cy+78,why:'Livre do contexto: E → E+E | E*E | (E) | x. Parênteses balanceados impedem que seja regular.'},
    {t:'aⁿbⁿcⁿ',r:2,x:cx-225,y:cy+30,why:'Sensível ao contexto, não livre do contexto: uma pilha só consegue comparar duas contagens, não três.'},
    {t:'ww',r:2,x:cx+225,y:cy+30,why:'Sensível ao contexto: a cópia não sai espelhada, então a pilha (que inverte) não serve.'},
    {t:'termina em 0',r:0,x:cx,y:cy+40,why:'Regular: um AFD de 2 estados lembra só o último símbolo lido. Exemplo da aula.'},
    {t:'aⁿbᵐcⁿ⁺ᵐ',r:1,x:cx-100,y:cy-54,why:'Livre do contexto: empilha os a e os b, e cada c desempilha um. Exemplo da aula.'},
    {t:'aⁿbᵐcⁿᵐ',r:2,x:cx+140,y:cy-87,why:'Sensível ao contexto: k = n·m exige recontar os b para cada a, e a pilha perde o que desempilha. Exemplo da aula.'},
    {t:'parada (aceita)',r:3,x:cx,y:cy+160,why:'Recursivamente enumerável: uma MT simula M em w e aceita se M parar. Se M não parar, a MT roda para sempre.'},
    {t:'complemento da parada',r:4,x:cx+270,y:cy-185,why:'Fora de todas as classes: nenhuma máquina de Turing reconhece. Existem linguagens que nem o Tipo 0 alcança.'},
  ];
  EX.forEach(e=>{const g=S('g',{class:'ex anim'},gX);e.g=g;const w=e.t.length*7.4+16;S('rect',{x:e.x-w/2,y:e.y-12,width:w,height:24,rx:12},g);S('text',{x:e.x,y:e.y},g,e.t);});
  const notes=[
    '<b>Tipo 3, regulares.</b> Regras <code>A → aB</code> ou <code>A → a</code> (no máximo uma variável, sempre na ponta). Reconhecedor: <b>autômato finito</b>, sem memória extra. Ex.: <code>a*b*</code>.',
    '<b>Tipo 2, livres do contexto.</b> Regras <code>A → α</code>: uma variável sozinha à esquerda. Reconhecedor: <b>autômato com pilha</b>. Ex.: <code>aⁿbⁿ</code>, <code>wwᴿ</code>, expressões.',
    '<b>Tipo 1, sensíveis ao contexto.</b> Regras <code>α → β</code> com <code>|α| ≤ |β|</code> (a palavra nunca encolhe). Reconhecedor: <b>MT com fita limitada</b> ao tamanho da entrada. Ex.: <code>aⁿbⁿcⁿ</code>, <code>ww</code>.',
    '<b>Tipo 0, recursivamente enumeráveis.</b> Regras <code>α → β</code> sem restrição. Reconhecedor: <b>máquina de Turing</b>. Ex.: o problema da parada.',
    'Cada anel contém os de dentro, e a inclusão é <b>própria</b>: em cada anel existe pelo menos uma linguagem que não está no de dentro.',
    'Fora do Tipo 0 ainda há linguagens: nenhuma máquina as reconhece. Agora clique nas linguagens abaixo da figura.'
  ];
  let picked=null;
  const fig=new StepFig(document.getElementById('fig-chomsky'),{notes,speed:2600,render(k){
    rings.forEach((r,i)=>r.g.classList.toggle('hide',i>k));
    EX.forEach(e=>{e.g.classList.toggle('hide',e.r>Math.min(k,3)&&!(e.r===4&&k>=5));e.g.classList.toggle('pick',picked===e);});
    rings.forEach(r=>r.el.setAttribute('stroke-width',2));
  }});
  const chips=document.getElementById('ch-chips'),ans=document.getElementById('ch-ans');
  const names=['Tipo 3 (regular)','Tipo 2 (livre do contexto)','Tipo 1 (sensível ao contexto)','Tipo 0 (rec. enumerável)','nenhuma classe'];
  EX.forEach(e=>{const b=H('button',{class:'btn sm'},e.t);b.addEventListener('click',()=>{fig.stop();picked=e;fig.go(5);
    chips.querySelectorAll('.btn').forEach(x=>x.classList.toggle('sel',x===b));
    if(e.r<4)rings[e.r].el.setAttribute('stroke-width',4.5);
    ans.innerHTML=`<b>${esc(e.t)}</b> → ${names[e.r]}. ${e.why}`;});chips.appendChild(b);});
})();

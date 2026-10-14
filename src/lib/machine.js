import { S } from './dom.js';

/* ---------- desenho genérico de autômato ---------- */
export function drawMachine(svg,M){
  svg.innerHTML='';
  const R=24;const id='ah'+Math.random().toString(36).slice(2,7);
  const defs=S('defs',null,svg);const mk=S('marker',{id,viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'},defs);
  S('path',{d:'M0,0 L10,5 L0,10 z',class:'arrowhead'},mk);
  const pos={};M.states.forEach(s=>pos[s.id]=s);
  const edges={};const gE=S('g',null,svg);const gS=S('g',null,svg);
  M.edges.forEach(e=>{
    const g=S('g',{class:'ed'},gE);edges[e.from+'>'+e.to]=g;
    const a=pos[e.from],b=pos[e.to];const lines=e.labels;
    let lx,ly,anchor='middle',up=true;
    if(e.from===e.to){
      const down=a.loopDir==='down';const s=down?1:-1;
      const y0=a.y+s*R;
      S('path',{d:`M${a.x-11},${y0} C${a.x-38},${y0+s*58} ${a.x+38},${y0+s*58} ${a.x+11},${y0+s*2}`,'marker-end':`url(#${id})`},g);
      lx=a.x;ly=down?a.y+R+56:a.y-R-50;up=!down;
    }else{
      const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
      const bend=e.bend||0;const cx=(a.x+b.x)/2+nx*bend,cy=(a.y+b.y)/2+ny*bend;
      const u1=[cx-a.x,cy-a.y],l1=Math.hypot(...u1),u2=[cx-b.x,cy-b.y],l2=Math.hypot(...u2);
      const sx=a.x+u1[0]/l1*R,sy=a.y+u1[1]/l1*R,ex=b.x+u2[0]/l2*(R+2),ey=b.y+u2[1]/l2*(R+2);
      S('path',{d:`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`,'marker-end':`url(#${id})`},g);
      const mx=.25*sx+.5*cx+.25*ex,my=.25*sy+.5*cy+.25*ey;
      const off=e.labelOff!=null?e.labelOff:(bend===0?-12:Math.sign(bend)*12);
      lx=mx+nx*off;ly=my+ny*off;
      if(nx*off>4)anchor='start';else if(nx*off<-4)anchor='end';
      up=ny*off<0;
    }
    const t=S('text',{'text-anchor':anchor},g);
    lines.forEach((ln,i)=>{const y=up?ly-(lines.length-1-i)*14:ly+10+i*14;const ts=S('tspan',{x:lx,y},t,ln.text);ts.dataset.k=ln.k;});
  });
  const states={};
  M.states.forEach(s=>{
    const g=S('g',{class:'st'+(s.faded?' faded':'')},gS);states[s.id]=g;
    S('circle',{cx:s.x,cy:s.y,r:R},g);if(s.accept)S('circle',{cx:s.x,cy:s.y,r:R-5,class:'inner'},g);
    S('text',{x:s.x,y:s.y},g,s.label||s.id);
    if(s.start)S('path',{d:`M${s.x-R-30},${s.y} L${s.x-R-2},${s.y}`,class:'sv-edge',stroke:'currentColor','marker-end':`url(#${id})`,style:'stroke:var(--muted)'},gE);
    if(s.note)S('text',{x:s.x,y:s.y+R+18,class:'sv-muted','text-anchor':'middle'},gS,s.note);
  });
  return {states,edges,svg};
}


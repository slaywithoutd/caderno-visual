import { H, reduce } from './dom.js';

/* ---------- componente de figura passo a passo ---------- */
const IC={
  reset:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10a5.5 5.5 0 1 0 1.7-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M4 3.5v3.2h3.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  prev:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  play:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10l8-5z" fill="currentColor"/></svg>',
  pause:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 5h2.5v10H6.5zM11 5h2.5v10H11z" fill="currentColor"/></svg>'
};
const canHover=matchMedia('(hover: hover)').matches;

/* Figura passo a passo. Os controles ficam numa barra logo acima da animação (como um player).
   Com o mouse em cima, avança na hora e segue sozinha; a linha da barra mostra quanto falta
   para o próximo passo. */
export class StepFig{
  constructor(root,{notes,render,speed=1700}){
    this.root=root;this.render=render;this.speed=speed;this.i=0;this.timer=null;this.hold=false;this.hovering=false;
    this.notesEl=root.querySelector('.fig-notes');
    const body=root.querySelector('.fig-body');
    this.ctrl=root.querySelector('.fig-ctrl');
    body.parentNode.insertBefore(this.ctrl,body);
    this.ctrl.innerHTML=`<span class="fc-btns"><button class="ib main" data-a="play" aria-label="Animar" title="${canHover?'Passe o mouse na figura para animar':'Animar'}">${IC.play}</button><button class="ib" data-a="prev" aria-label="Passo anterior" title="Anterior">${IC.prev}</button><button class="ib" data-a="next" aria-label="Próximo passo" title="Próximo">${IC.next}</button><button class="ib" data-a="reset" aria-label="Reiniciar" title="Reiniciar">${IC.reset}</button></span><div class="fc-track" aria-hidden="true"><span class="fc-done"></span><span class="fc-tick"></span></div><span class="count"></span><span class="fc-hint">${canHover?'passe o mouse':'toque ▶'}</span>`;
    this.playBtn=this.ctrl.querySelector('[data-a=play]');this.countEl=this.ctrl.querySelector('.count');
    this.done=this.ctrl.querySelector('.fc-done');this.tick=this.ctrl.querySelector('.fc-tick');
    this.ctrl.addEventListener('click',e=>{const a=e.target.closest('button')?.dataset.a;if(!a)return;
      if(a==='play'){if(this.timer){this.stop();this.hold=true;}else{this.hold=false;this.play(true);}}
      if(a==='prev'){this.stop();this.hold=true;this.go(this.i-1);}
      if(a==='next'){this.stop();this.hold=true;this.go(this.i+1);}
      if(a==='reset'){this.stop();this.hold=false;this.go(0);if(this.hovering)this.play();}
    });
    /* anima só enquanto o mouse está sobre a figura (barra, animação ou passos).
       pointermove cobre o caso em que a página rola por baixo do mouse parado e o
       navegador não dispara pointerenter. */
    const entrar=()=>{if(this.hovering)return;this.hovering=true;root.classList.add('hot');if(!this.hold&&!reduce)this.play(true);};
    root.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')entrar();});
    root.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')entrar();});
    root.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse')return;this.hovering=false;root.classList.remove('hot');this.stop();this.hold=false;});
    this.setSteps(notes);
  }
  setSteps(notes){
    this.notes=notes;this.notesEl.innerHTML='';
    notes.forEach((n,k)=>{const li=H('li',{tabindex:'0'},n);li.addEventListener('click',()=>{this.stop();this.hold=true;this.go(k)});li.addEventListener('keydown',e=>{if(e.key==='Enter'){this.stop();this.hold=true;this.go(k)}});this.notesEl.appendChild(li);});
    this.go(0);
  }
  go(k){
    const n=this.notes.length;k=Math.max(0,Math.min(n-1,k));this.i=k;this.render(k);
    [...this.notesEl.children].forEach((li,j)=>{li.className=j<k?'past':j===k?'cur':'fut'});
    const cur=this.notesEl.children[k];
    if(cur){const top=Math.max(0,cur.offsetTop+cur.offsetHeight-this.notesEl.clientHeight+12);this.notesEl.scrollTo({top,behavior:reduce?'auto':'smooth'});}
    this.countEl.textContent=`${k+1}/${n}`;this.done.style.width=(n>1?k/(n-1)*100:100)+'%';
    this.restartTick();
  }
  /* linha que enche até o próximo passo (só enquanto anima) */
  restartTick(){
    const t=this.tick;t.style.animation='none';void t.offsetWidth;
    t.style.animation=this.timer&&this.i<this.notes.length-1?`fc-tick ${this.speed}ms linear forwards`:'none';
  }
  play(agora=false){
    if(this.timer)return;
    this.playBtn.innerHTML=IC.pause;this.playBtn.setAttribute('aria-label','Pausar');
    this.timer=setInterval(()=>{if(this.i>=this.notes.length-1)this.stop();else this.go(this.i+1)},this.speed);
    if(this.i>=this.notes.length-1)this.go(0);else if(agora)this.go(this.i+1);else this.restartTick();
  }
  stop(){clearInterval(this.timer);this.timer=null;this.playBtn.innerHTML=IC.play;this.playBtn.setAttribute('aria-label','Animar');this.restartTick();}
}

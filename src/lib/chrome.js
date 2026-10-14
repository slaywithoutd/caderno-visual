/* sidebar recolhível no celular, sumário ativo e barra de progresso */
export function initChrome(){
/* ============ sidebar no celular ============ */
(function(){
  const box=document.getElementById('side-box');const mq=matchMedia('(max-width:1020px)');
  const sync=()=>{box.open=!mq.matches;};sync();mq.addEventListener('change',sync);
  box.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(mq.matches)box.open=false;}));
})();

/* ============ sumário + progresso ============ */
(function(){
  const bar=document.getElementById('progress');
  const links=[...document.querySelectorAll('.toc a')];const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
  function onScroll(){const h=document.documentElement;const p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);bar.style.width=(p*100).toFixed(1)+'%';
    let cur=0;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<200)cur=i;});links.forEach((a,i)=>a.classList.toggle('on',i===cur));}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
}

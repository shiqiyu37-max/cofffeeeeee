(() => {
  'use strict';
  const display=document.getElementById('bean-display');if(!display)return;
  const root=document.body.dataset.siteRoot||'.',products=new Map((window.HAISHI_DATA||[]).map(p=>[p.id,p]));
  function decorate(){
    for(const card of display.querySelectorAll('.bean-card')){
      if(card.parentElement.classList.contains('gallery-entry'))continue;
      const p=products.get(card.dataset.id),entry=document.createElement('div');entry.className='gallery-entry has-scene';
      card.replaceWith(entry);entry.append(card);card.querySelector('.gallery-edition b')?.remove();
      const art=card.querySelector('.bean-art');art.querySelector('.gallery-paint')?.remove();
      const image=art.querySelector('img');image.classList.add('scene-artwork');image.alt=p.name+'黏土场景';
      const flavor=card.querySelector('.bean-flavor');flavor.classList.add('flavor-tags');flavor.setAttribute('aria-label','风味');flavor.innerHTML=HaishiFlavors.tags(p,root);
    }
  }
  new MutationObserver(decorate).observe(display,{childList:true});decorate();
})();

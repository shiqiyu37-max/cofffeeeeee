(() => {
  'use strict';
  const products=window.HAISHI_DATA||[],byId=new Map(products.map(p=>[p.id,p])),byName=new Map(products.map(p=>[p.name,p]));
  const countryNames={CRI:'Costa Rica',HND:'Honduras',JAM:'Jamaica',COL:'Colombia',PER:'Peru',ETH:'Ethiopia',KEN:'Kenya',CHN:'China',IDN:'Indonesia'};
  const countryChinese={CRI:'哥斯达黎加',HND:'洪都拉斯',JAM:'牙买加',COL:'哥伦比亚',PER:'秘鲁',ETH:'埃塞俄比亚',KEN:'肯尼亚',CHN:'中国',IDN:'印度尼西亚'};
  const countryProducts={CRI:['item-12','item-14','item-13'],HND:['item-11','item-01'],JAM:['item-07'],COL:['item-15','item-09'],PER:['item-06'],ETH:['item-10','item-16','item-11','item-05','item-08'],KEN:['item-17'],CHN:['item-10','item-18','item-03','item-04'],IDN:['item-02']};
  function bean(el){if(!el||el.querySelector('.echo-bean'))return;const mark=document.createElement('span');mark.className='echo-bean';mark.setAttribute('aria-hidden','true');el.prepend(mark)}
  function sign(el,p){if(!el||!p)return;el.classList.add('echo-signed');el.style.setProperty('--echo-hue',p.bg)}
  function cards(){for(const c of document.querySelectorAll('.bean-card')){const p=byId.get(c.dataset.id);sign(c.querySelector('.bean-name'),p)}}
  function origin(){bean(document.querySelector('.origin-index'))}
  cards();origin();
  const display=document.getElementById('bean-display'),heading=document.getElementById('origin-heading');
  if(display)new MutationObserver(cards).observe(display,{childList:true});
  if(heading)new MutationObserver(origin).observe(heading,{childList:true});
  const product=byId.get(document.body.dataset.productId);
  if(product){
    document.body.style.setProperty('--echo-hue',product.bg);sign(document.querySelector('main h1'),product);
    const english=Object.entries(countryProducts).filter(([,ids])=>ids.includes(product.id)).sort(([a],[b])=>product.origin.indexOf(countryChinese[a])-product.origin.indexOf(countryChinese[b])).map(([code])=>countryNames[code]).join(' · ');
    for(const el of document.querySelectorAll('.detail-header .eyebrow,.card-header .origin-line')){
      if(!el.querySelector('.echo-origin-en')){const text=document.createElement('span');text.className='echo-origin-en';text.lang='en';text.textContent=english;el.append(text)}
    }
  }
  bean(document.querySelector('.detail-trail'));bean(document.querySelector('.card-header .section-label'));bean(document.querySelector('.guide-intro .section-kicker'));
  for(const c of document.querySelectorAll('.guide-card')){const title=c.querySelector('h2');sign(title,byName.get(title?.textContent.trim()))}
  for(const c of document.querySelectorAll('.related-card')){const id=c.getAttribute('href')?.match(/item-\d+/)?.[0];sign(c.querySelector('b'),byId.get(id))}
  function dialog(el){const title=el.querySelector('#inspector-title,#dialog-title');if(!title)return;const p=byName.get(title.textContent.trim());if(p)sign(title,p)}
  for(const el of document.querySelectorAll('#bean-inspector,.site-dialog')){dialog(el);new MutationObserver(()=>dialog(el)).observe(el,{childList:true})}
})();

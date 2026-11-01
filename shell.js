(() => {
'use strict';
const motion=matchMedia('(prefers-reduced-motion:reduce)');
  const floating = document.createElement('button');
  floating.type = 'button'; floating.className = 'floating-tray';
  floating.dataset.action = 'cart';
  floating.setAttribute('aria-label', '打开选豆单');
  floating.innerHTML = '<span class="tray-dish" aria-hidden="true"><i class="toy-bean"></i><i class="toy-bean"></i><i class="toy-bean"></i></span><span>选豆单 <b data-cart-count>0</b></span>';
  floating.hidden = true;
  document.body.append(floating);
  const headerBasket = document.querySelector('.site-header .basket-button');
  const count = headerBasket.querySelector('[data-cart-count]');
  let headerVisible = true;
  const syncTray = () => {
    const n = Number(count.textContent) || 0;
    floating.hidden = headerVisible || n === 0;
    floating.querySelector('[data-cart-count]').textContent = n;
    floating.querySelectorAll('.toy-bean').forEach((bean, i) => bean.hidden = i >= Math.min(3, n));
  };
  new MutationObserver(syncTray).observe(count, { childList: true, characterData: true, subtree: true });
  syncTray();
  new IntersectionObserver(([e]) => { headerVisible = e.isIntersecting; syncTray(); }, { threshold: 0 }).observe(headerBasket);
  document.addEventListener('haishi:selection-added', e => {
    syncTray();
    const target = floating.hidden ? headerBasket : floating;
    target.classList.remove('tray-arrived'); void target.offsetWidth;
    if (!motion.matches) target.classList.add('tray-arrived');
    if (motion.matches) return;
    const end = target.getBoundingClientRect();
    const source = document.querySelector(`.bean-card[data-id="${e.detail.id}"] .bean-art`);
    const box = source?.getBoundingClientRect();
    const start = box && box.bottom > 0 && box.top < innerHeight ? { x: box.left + box.width / 2, y: Math.min(innerHeight - 70, box.top + box.height / 2) } : { x: innerWidth / 2, y: innerHeight * .55 };
    const bean = document.createElement('span');
    bean.className = 'toy-bean flying-bean'; bean.setAttribute('aria-hidden', 'true');
    bean.style.left = start.x + 'px'; bean.style.top = start.y + 'px'; document.body.append(bean);
    const dx = end.left + end.width / 2 - start.x, dy = end.top + 22 - start.y;
    const flight = bean.animate([{ transform: 'translate(-50%,-50%) rotate(-25deg) scale(1)' }, { transform: `translate(calc(-50% + ${dx * .48}px),calc(-50% + ${dy * .4 - 90}px)) rotate(70deg) scale(1.1)`, offset: .5 }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(175deg) scale(.45)`, opacity: .8 }], { duration: 850, easing: 'cubic-bezier(.25,.65,.35,1)' });
    flight.finished.then(() => bean.remove(), () => bean.remove());
  });
})();

(() => {
  'use strict';
  const root=document.body.dataset.siteRoot||'.';
  const product=(window.HAISHI_DATA||[]).find(p=>p.id===document.body.dataset.productId);
  if(product&&window.HaishiFlavors){
    document.querySelectorAll('.flavor-tokens').forEach(el=>{el.classList.add('flavor-tags');el.innerHTML=HaishiFlavors.tags(product,root)});
  }
  const from=new URLSearchParams(location.search).get('origin');
  if(from&&/^(all|CRI|HND|JAM|COL|PER|ETH|KEN|RWA|CHN|IDN)$/.test(from)){
    document.body.dataset.originCode=from;
    document.querySelectorAll('a[href*="index.html"][href*="#bean-shelf"]').forEach(a=>a.href=root+'/index.html?origin='+from+'#bean-shelf');
  }
  const links=[...document.querySelectorAll('.photo a[href]')];
  if(!links.length)return;
  const photos=[...new Map(links.map(a=>[a.href,{url:a.href,caption:a.closest('figure')?.querySelector('figcaption')?.textContent||a.querySelector('img')?.alt||'产地资料照片'}])).values()];
  const box=document.createElement('dialog');box.className='photo-lightbox';box.setAttribute('aria-label','产地资料相册');
  box.innerHTML='<button type="button" class="sheet-close" aria-label="关闭相册">×</button><figure><img alt=""><figcaption></figcaption></figure><nav aria-label="相册翻页"><button type="button" data-photo="previous" aria-label="上一张照片">←</button><span class="photo-position"></span><button type="button" data-photo="next" aria-label="下一张照片">→</button></nav>';
  document.body.append(box);let current=0,previousFocus;
  function show(i){current=(i+photos.length)%photos.length;const p=photos[current];const img=box.querySelector('figure img');img.src=p.url;img.alt=p.caption;box.querySelector('figcaption').textContent=p.caption;box.querySelector('.photo-position').textContent=(current+1)+' / '+photos.length;}
  function close(){box.close();previousFocus?.focus({preventScroll:true})}
  links.forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();previousFocus=a;show(photos.findIndex(p=>p.url===a.href));box.showModal()}));
  box.querySelector('.sheet-close').addEventListener('click',close);
  box.querySelector('[data-photo="previous"]').addEventListener('click',()=>show(current-1));
  box.querySelector('[data-photo="next"]').addEventListener('click',()=>show(current+1));
  box.addEventListener('cancel',e=>{e.preventDefault();close()});
  box.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}});
  box.addEventListener('click',e=>{if(e.target!==box)return;const b=box.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close()});
})();

(() => {
  'use strict';
  const products=window.HAISHI_DATA||[],byId=new Map(products.map(p=>[p.id,p]));
  const availableFirst=list=>[...list].sort((a,b)=>Number(Boolean(a.soldOut))-Number(Boolean(b.soldOut)));
  const root=document.body.dataset.siteRoot;
  const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=c=>'¥'+Number((c/100).toFixed(2));
  const weightLabel=g=>g===5000?'5kg整批':g+'g';
  const cover=p=>`${root}/assets/${p.scene||p.id+'-scene.png'}`;
  const inspector=document.getElementById('bean-inspector'),catalog=document.getElementById('catalog-dialog');
  let previousInspectorFocus,previousCatalogFocus;
  document.getElementById('catalog-list').innerHTML=availableFirst(products).map(p=>`<button type="button" class="catalog-row" data-bean-action="inspect" data-id="${p.id}"${p.soldOut?' disabled aria-disabled="true" tabindex="-1"':''}><img src="${esc(cover(p))}" alt="" width="65" height="65" loading="lazy"><span><span class="catalog-name">${esc(p.name)}</span><span class="catalog-description">${esc(p.descriptor)}</span><small>${esc(p.origin)}</small></span><span class="catalog-row-price">${money(p.sizes[0].retailCents)}<small>/ ${weightLabel(p.sizes[0].grams)}</small></span></button>`).join('');
  function closeInspector(){if(inspector.open){inspector.close();previousInspectorFocus?.focus({preventScroll:true})}}
  function closeCatalog(){if(catalog.open){catalog.close();previousCatalogFocus?.focus({preventScroll:true})}}
  function inspect(id){
    const p=byId.get(id);if(!p||p.soldOut)return;
    previousInspectorFocus=catalog.open?document.querySelector('[data-bean-action="catalog"]'):document.activeElement;
    if(catalog.open)catalog.close();
    const facts=[['处理方式',p.process],...(p.roast?[['烘焙度',p.roast]]:[]),['规格',p.sizes.map(s=>weightLabel(s.grams)).join(' / ')]];
    inspector.innerHTML=`<button class="sheet-close" type="button" data-bean-action="close-inspector" aria-label="关闭豆子资料">×</button><div class="inspector-inner"><p class="inspector-eyebrow">海市咖啡 · 豆子资料</p><div class="inspector-head"><img src="${esc(cover(p))}" alt="${esc(p.name)}风味主图" width="104" height="104"><div><h2 id="inspector-title" class="${p.name.length>4?'long-name':''}">${esc(p.name)}</h2><p>${esc(p.descriptor)}</p></div></div><dl class="inspector-origin"><dt>产地 / 产区</dt><dd>${esc(p.origin)}</dd></dl><dl class="inspector-facts">${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p class="inspector-price">${money(p.sizes[0].retailCents)}<small>/ ${weightLabel(p.sizes[0].grams)}</small></p><button class="inspect-choose" type="button" data-action="choose" data-id="${p.id}">选择规格与数量 <span aria-hidden="true">↗</span></button><div class="inspector-links"><a href="${root}/beans/${p.id}.html?origin=${window.HaishiMap?.getSelected?.()||document.body.dataset.originCode||'CRI'}">查看完整产地介绍 ↗</a><button type="button" data-bean-action="close-inspector">回到地图 ↶</button></div><p class="inspector-note">${p.sizes.some(s=>s.grams===454)?'454g 为 227g × 2 包装。':p.bulkOnly?'本款仅按5kg整批售卖，不拆分。':''}需要研磨时，请在微信说明使用器具。当前批次、库存及应付金额在微信确认。</p></div>`;
    inspector.showModal();
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-bean-action]');
    if(b){const a=b.dataset.beanAction;if(a==='inspect')inspect(b.dataset.id);if(a==='close-inspector')closeInspector();if(a==='catalog'){previousCatalogFocus=document.activeElement;catalog.showModal()}if(a==='close-catalog')closeCatalog()}
    if(e.target.closest('.bean-inspector [data-action="choose"]'))closeInspector();
    if(e.target.closest('.cart-empty a')&&window.HaishiMap?.reset){e.preventDefault();document.querySelector('.site-dialog')?.close();document.documentElement.style.overflow='';window.HaishiMap?.reset()}
  });
  inspector.addEventListener('cancel',e=>{e.preventDefault();closeInspector()});catalog.addEventListener('cancel',e=>{e.preventDefault();closeCatalog()});
  for(const d of[inspector,catalog])d.addEventListener('click',e=>{if(e.target!==d)return;const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d===inspector?closeInspector():closeCatalog()});
  window.HaishiBeanInspector={open:inspect};
})();

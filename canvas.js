(() => {
  'use strict';
  const countries=window.HAISHI_ORIGINS||[], products=window.HAISHI_DATA||[], byId=new Map(products.map(p=>[p.id,p])),byCode=new Map(countries.map(c=>[c.code,c]));
  const root=document.body.dataset.siteRoot,svg=document.getElementById('origin-world'),picker=document.getElementById('origin-picker'),shelf=document.getElementById('bean-shelf');
  const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const availableFirst=list=>[...list].sort((a,b)=>Number(Boolean(a.soldOut))-Number(Boolean(b.soldOut)));
  const weightLabel=g=>g===5000?'5kg整批':g+'g';
  const cover=p=>`${root}/assets/${p.scene||p.id+'-scene.png'}`, money=c=>'¥'+Number((c/100).toFixed(2));
  const brushColor=p=>({'item-12':'#b58bc7','item-14':'#7ba69c','item-10':'#647393','item-17':'#a7bd70','item-18':'#d79ab0','item-15':'#87bdc5','item-16':'#d6b058','item-11':'#95afa2','item-13':'#ce9279','item-01':'#b58692','item-02':'#a77f59','item-03':'#81baa7','item-04':'#8c9dc3','item-05':'#527792','item-06':'#adb574','item-07':'#7aacc2','item-08':'#c4a15e','item-09':'#d89483'})[p.id]||p.bg;
  function brushRail(p){const n=(Number(p.id.replace('item-',''))-1)%4,id=p.id;return `<svg class="gallery-paint" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id="rail-clip-${id}"><rect x="0" y="0" width="100" height="100"/></clipPath><filter id="rail-color-${id}" x="0" y="0" width="100%" height="100%"><feFlood flood-color="${brushColor(p)}" result="pigment"/><feComposite in="pigment" in2="SourceAlpha" operator="in"/></filter></defs><g clip-path="url(#rail-clip-${id})"><image href="assets/brush-atlas.png" x="${-(n%2)*100}" y="${-Math.floor(n/2)*100}" width="200" height="200" filter="url(#rail-color-${id})"/></g></svg>`}

  const ordered=['CRI','HND','JAM','COL','PER','ETH','KEN','RWA','CHN','IDN'];
  const english={CRI:'Costa Rica',HND:'Honduras',JAM:'Jamaica',COL:'Colombia',PER:'Peru',ETH:'Ethiopia',KEN:'Kenya',RWA:'Rwanda',CHN:'China',IDN:'Indonesia'};
  const colors={CRI:'#d9cdf1',HND:'#bfe1ec',JAM:'#cadcfa',COL:'#f2d0dd',PER:'#ebd5ee',ETH:'#d9dcf6',KEN:'#f1d1df',RWA:'#e1c493',CHN:'#cfdfcb',IDN:'#d1e5e8'};
  const offsets={CRI:[-190,52],HND:[-196,-61],JAM:[150,-27],COL:[196,79],PER:[-126,65],ETH:[-31,-60],KEN:[70,58],RWA:[-75,75],CHN:[202,-36],IDN:[70,55]};
  const regionOf=code=>['CRI','HND','JAM','COL','PER'].includes(code)?'americas':['ETH','KEN','RWA'].includes(code)?'africa':'asia';
  const regionBoxes={all:[0,0,1440,560],americas:[110,30,670,510],africa:[665,155,455,345],asia:[925,60,445,370]};
  const requested=new URLSearchParams(location.search).get('origin');let selected=byCode.has(requested)?requested:'all',region=selected==='all'?'all':innerWidth<=600?regionOf(selected):'all',frame;
  const projection=d3.geoEqualEarth().fitExtent([[105,14],[1348,518]],window.HAISHI_LAND),path=d3.geoPath(projection);
  const land=path(window.HAISHI_LAND);
  svg.innerHTML=`<image id="clay-world-art" href="assets/clay-world-forest-rivers.png" x="0" y="0" width="1440" height="560" preserveAspectRatio="none"/>
  <path id="canvas-land" d="${land}" fill="none" stroke="none" aria-hidden="true"/>
  <g id="origin-points"></g>`;
  document.getElementById('origin-points').innerHTML=ordered.map(code=>{
    const c=byCode.get(code),[x,y]=projection(c.coordinate),[dx,dy]=offsets[code],w=c.name.length*22+39;
    const lx=x+dx,ly=y+dy,labelX=lx-w/2;
    const cx=labelX+w/2,cy=ly;
    return `<g class="origin-pin" id="origin-${code}" data-canvas-action="country" data-code="${code}" tabindex="0" role="button" aria-label="${c.name} ${english[code]}，${c.products.length}款咖啡豆" aria-pressed="${selected===code}">
    ${code==='RWA'?`<path class="label-leader-hit" d="M${x},${y}Q${cx},${y} ${cx},${cy}" fill="none" stroke="transparent" stroke-width="18" stroke-linecap="round" pointer-events="stroke"/>`:''}<path class="label-leader" d="M${x},${y}Q${cx},${y} ${cx},${cy}"/>
    <circle class="pin-ring" cx="${x}" cy="${y}" r="8.8"/>
    <circle class="pin-dot" cx="${x}" cy="${y}" r="4.7"/>
    <circle class="pin-glint" cx="${x-1.3}" cy="${y-1.4}" r="1.05"/>
    <circle class="pin-hit" cx="${x}" cy="${y}" r="10" fill="transparent"/>
    <rect class="label-highlight" x="${labelX-10}" y="${ly-23}" width="${w+19}" height="53" rx="2"/>
    <path class="label-underline" d="M${labelX} ${ly+28}Q${labelX+w*.35} ${ly+30} ${labelX+w*.71} ${ly+27}"/>
    <rect class="label-hit" x="${labelX-9}" y="${ly-27}" width="${w+18}" height="62" fill="transparent" rx="10"/>
    <text class="origin-label" x="${labelX}" y="${ly-6}">${c.name}</text><text class="origin-english" x="${labelX+.5}" y="${ly+17}" lang="en">${english[code]}</text><text class="origin-count" x="${labelX+w-22}" y="${ly-6}">${c.products.length}款</text></g>`;
  }).join('');
  picker.innerHTML=`<button class="origin-choice" type="button" data-canvas-action="country" data-code="all" aria-pressed="${selected==='all'}"><span>全部豆子<small>${products.length}</small></span><span class="choice-english" lang="en">All coffees</span></button>`+ordered.map(code=>{const c=byCode.get(code);return `<button class="origin-choice" type="button" data-canvas-action="country" data-code="${code}" aria-pressed="${selected===code}"><span>${c.name}<small>${c.products.length}</small></span><span class="choice-english" lang="en">${english[code]}</span></button>`}).join('');
  function updateView(animate=true){
    cancelAnimationFrame(frame);
    const target=regionBoxes[region],from=svg.getAttribute('viewBox').split(/\s+/).map(Number);
    document.querySelectorAll('.map-views button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.region===region)));
    // Cropped-out countries stay available in the native country selector.
    document.querySelectorAll('.origin-pin').forEach(p=>{
      const visible=region==='all'||regionOf(p.dataset.code)===region;
      p.style.display=visible?'':'none';p.setAttribute('tabindex',visible?'0':'-1');p.setAttribute('aria-hidden',String(!visible));
    });
    if(!animate||matchMedia('(prefers-reduced-motion:reduce)').matches){svg.setAttribute('viewBox',target.join(' '));return}
    const start=performance.now();function step(t){const k=Math.min(1,(t-start)/430),q=1-Math.pow(1-k,3);svg.setAttribute('viewBox',target.map((v,i)=>from[i]+(v-from[i])*q).join(' '));if(k<1)frame=requestAnimationFrame(step)}frame=requestAnimationFrame(step);
  }
  function render(){
    const c=byCode.get(selected),ps=availableFirst(c?c.products.map(id=>byId.get(id)).filter(Boolean):products),i=ordered.indexOf(selected);
    shelf.style.setProperty('--origin-soft',colors[selected]||'#cfdfcb');
    document.getElementById('origin-heading').innerHTML=c?`<span class="origin-index">ORIGIN ${String(i+1).padStart(2,'0')} / ${String(ordered.length).padStart(2,'0')}</span><h2 id="selected-country-title">${c.name}<span class="heading-english" lang="en">${english[selected]}</span></h2><p class="origin-quantity">${ps.length} 款咖啡豆</p><button class="origin-show-all" type="button" data-canvas-action="country" data-code="all">查看全部 ${products.length} 款</button><p class="origin-summary">具体产区、处理方式和规格，<br>点豆卡查看。</p><div class="origin-countries"><button type="button" data-canvas-action="previous" aria-label="上一个产地">←</button><span>换个产地</span><button type="button" data-canvas-action="next" aria-label="下一个产地">→</button></div>`:`<span class="origin-index">ALL COFFEES</span><h2 id="selected-country-title">全部豆子</h2><p class="origin-quantity">${ps.length} 款咖啡豆</p><p class="origin-summary">先看看所有豆子，<br>也可以按产地挑选。</p><div class="origin-countries"><button type="button" data-canvas-action="previous" aria-label="上一个产地">←</button><span>按产地选</span><button type="button" data-canvas-action="next" aria-label="下一个产地">→</button></div>`;
    document.getElementById('bean-display').innerHTML=ps.map((p,index)=>`<button class="bean-card" type="button" data-bean-action="inspect" data-id="${p.id}"${p.soldOut?' disabled aria-disabled="true" tabindex="-1"':''}><span class="bean-art">${brushRail(p)}<img src="${esc(cover(p))}" alt="${esc(p.name)}原主图" width="1254" height="1254" loading="${index<2?'eager':'lazy'}" decoding="async"></span><span class="gallery-info"><span class="gallery-edition"><b>${String(index+1).padStart(2,'0')}</b><span class="gallery-detail" aria-hidden="true" title="查看产地与规格"><svg viewBox="0 0 28 28" fill="none" focusable="false"><path d="M14 8.1C10.7 5.7 6.8 5.5 3.5 6.7v15c3.6-1.4 7.2-1.1 10.5 1.1 3.3-2.2 6.9-2.5 10.5-1.1v-15C21.2 5.5 17.3 5.7 14 8.1Z"/><path d="M14 8.1v14.7M7.2 10.5c1.3-.1 2.6.2 3.8.8M7.2 14.4c1.3-.1 2.6.2 3.8.8M17 11.3c1.2-.6 2.5-.9 3.8-.8M17 15.2c1.2-.6 2.5-.9 3.8-.8"/></svg></span></span><span class="bean-name ${p.name.length>4?'long-name':''}">${esc(p.name)}</span><span class="bean-flavor">${esc(p.descriptor)}</span>${p.bulkOnly?'<span class="bulk-badge">5kg整批 · 不拆分</span>':''}<span class="bean-price">${money(p.sizes[0].retailCents)}<small>/ ${weightLabel(p.sizes[0].grams)}</small></span><span class="gallery-hint">查看产地与规格</span></span></button>`).join('');
    document.querySelectorAll('[data-canvas-action="country"]').forEach(b=>{const active=b.dataset.code===selected;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});
    document.getElementById('canvas-status').textContent=`${c?c.name:'全部豆子'}，${ps.length}款咖啡豆。`;
  }
  function select(code,{scroll=false}={}){
    if(code!=='all'&&!byCode.has(code))return;selected=code;
    if(code==='all')region='all';else if(region!=='all')region=regionOf(code);
    render();updateView();
    if(scroll&&innerWidth<=600)shelf.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
  }
  function selectRegion(r){
    if(!regionBoxes[r])return;region=r;
    if(r==='all'){selected='all';render()}else if(selected==='all'||regionOf(selected)!==r){selected=ordered.find(code=>regionOf(code)===r);render()}
    updateView();
  }
  function reset(){region='all';selected='all';render();updateView();document.getElementById('canvas-title').scrollIntoView({behavior:'auto',block:'start'})}
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-canvas-action]');if(!b)return;
    const a=b.dataset.canvasAction;
    if(a==='country')select(b.dataset.code,{scroll:true});
    if(a==='region')selectRegion(b.dataset.region);
    if(a==='previous'||a==='next'){const i=ordered.indexOf(selected),n=i<0?(a==='next'?0:ordered.length-1):(i+(a==='next'?1:-1)+ordered.length)%ordered.length;select(ordered[n])}
  });
  svg.addEventListener('keydown',e=>{const p=e.target.closest('.origin-pin');if(p&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(p.dataset.code,{scroll:true})}});
  document.querySelector('.wordmark').addEventListener('click',e=>{e.preventDefault();reset()});
  render();updateView(false);window.HaishiMap={select,selectRegion,reset,getSelected:()=>selected};
})();

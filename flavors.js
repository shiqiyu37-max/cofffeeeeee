(() => {
  'use strict';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function sprite(src,col,row){return `<span class="prop-sprite atlas-sprite" aria-hidden="true"><img src="${src}" alt="" draggable="false" style="left:${-col*100}%;top:${-row*100}%"></span>`}
  const knownFlavors=new Map();
  for(const p of window.HAISHI_DATA||[])if(Number.isInteger(p.atlas)&&Number.isInteger(p.atlasRow)){
    (p.labels||[]).forEach((label,index)=>{if(!knownFlavors.has(label))knownFlavors.set(label,{atlas:p.atlas,row:p.atlasRow,index})});
  }
  function icon(p,label,root){
    const term=label.replace(/^浓缩[：:]\s*/,'');
    const index=(p.labels||[]).indexOf(term);
    if(index>=0&&Number.isInteger(p.atlas)&&Number.isInteger(p.atlasRow))return sprite(root+'/assets/flavor-atlas-'+p.atlas+'.png',index,p.atlasRow);
    const shared=knownFlavors.get(term);if(shared)return sprite(root+'/assets/flavor-atlas-'+shared.atlas+'.png',shared.index,shared.row);
    if(term==='柑橘')return sprite(root+'/assets/flavor-atlas-3.png',2,1);
    if(term==='花蜜')return '<span class="nectar-icon" aria-hidden="true"><i></i></span>';
    return '<span class="flavor-dot" aria-hidden="true"></span>';
  }
  function tags(p,root='.'){
    return p.descriptor.split(' · ').map(label=>`<span class="flavor-tag">${icon(p,label,root)}<span class="flavor-label">${esc(label)}</span></span>`).join('');
  }
  window.HaishiFlavors={tags,icon};
})();

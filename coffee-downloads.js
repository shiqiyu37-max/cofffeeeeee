(() => {
  'use strict';
  const W=1200,M=82,CW=W-M*2;
  const BODY='"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
  const HAND='HaishiHand,"Kaiti SC",'+BODY;
  const data=window.HAISHI_DOWNLOAD_DATA||{products:[]};
  const products=new Map(data.products.map(p=>[p.id,p]));
  const types={origin:'产地介绍',brew:'冲煮方案'};
  const textOf=v=>typeof v==='string'?v:String(v?.value||v?.text||'');
  const uniq=values=>[...new Set(values.map(textOf).filter(Boolean))];
  const font=(size,weight=400,hand=false)=>`${weight} ${size}px ${hand?HAND:BODY}`;
  const neutralOriginText=value=>String(value??'').replaceAll('照片中的塔拉珠','塔拉珠地区').replaceAll('产地照片记录了','产地资料记录了').replaceAll('照片记录了耶加雪菲','产地资料记载了耶加雪菲');
  const roastContext={
    'item-02':'原介绍有“偏深烘焙”描述；本批烘焙度尚未提供。',
    'item-05':'原介绍有“中深烘焙”描述；本批烘焙度尚未提供。',
    'item-08':'原介绍有“浅烘焙”描述；本批烘焙度尚未提供。'
  };

  // Wrap by measured glyph width. Long model names and numbers can also wrap.
  function wrap(ctx,value,width){
    const result=[];
    for(const paragraph of String(value??'').split(/\r?\n/)){
      if(!paragraph.trim()){result.push('');continue;}
      const tokens=paragraph.match(/[A-Za-z0-9][A-Za-z0-9.,:;%+\-–/]*|\s+|[^\s]/gu)||[];
      let line='';
      const push=()=>{if(line.trim())result.push(line.trimEnd());line='';};
      for(let token of tokens){
        if(!line)token=token.trimStart();
        if(!token)continue;
        if(ctx.measureText(line+token).width<=width){line+=token;continue;}
        if(line&&/^[，。！？：；、）》】]$/.test(token)&&Array.from(line).length>1){
          const trailing=line.match(/(?:[A-Za-z0-9][A-Za-z0-9.,:;%+\-–/]*(?:[℃°])?|\d[\d.,:;/+\-–]*\s*[A-Za-z%℃°]+)$/u)?.[0]||Array.from(line).at(-1);
          if(ctx.measureText(trailing+token).width<=width){line=line.slice(0,-trailing.length);push();line=trailing+token;continue;}
        }
        push();
        if(ctx.measureText(token).width<=width){line=token;continue;}
        for(const char of Array.from(token)){
          if(line&&ctx.measureText(line+char).width>width)push();
          line+=char;
        }
      }
      push();
    }
    return result;
  }

  function layout(ctx,p,type){
    if(!types[type])throw new Error('未知资料类型');
    const ops=[],bounds=[];let y=76;
    const text=(value,{size=36,weight=400,color='#405644',gap=16,line=56,x=M,width=CW,hand=false}={})=>{
      value=type==='origin'?neutralOriginText(value):String(value??'');
      if(!String(value??'').trim())return;
      const face=font(size,weight,hand);ctx.font=face;
      for(const row of wrap(ctx,value,width)){
        ops.push({kind:'text',text:row,x,y,font:face,color,size});
        bounds.push({text:row,x,width:ctx.measureText(row).width,right:x+ctx.measureText(row).width,y,size});y+=line;
      }
      y+=gap;
    };
    const heading=title=>{y+=30;text(title,{size:41,weight:600,line:60,gap:24,color:'#304e39'});};
    const paragraphs=items=>{for(const value of uniq(items||[]))text(value);};
    const fields=values=>{
      const all=(values||[]).filter(f=>f.label&&f.value),missing=new Map();
      const rows=all.filter(f=>{
        if(f.status!=='missing'&&!['本批未提供','待本批次确认'].includes(f.value))return true;
        if(!missing.has(f.value))missing.set(f.value,[]);missing.get(f.value).push(f.label);return false;
      });
      const gap=24,width=(CW-gap)/2,pad=24;
      for(let index=0;index<rows.length;index+=2){
        const pair=rows.slice(index,index+2).map((f,i)=>{
          ctx.font=font(26);const labels=wrap(ctx,f.label,width-pad*2);
          ctx.font=font(34);const lines=wrap(ctx,f.value,width-pad*2);
          return{f,x:M+i*(width+gap),labels,lines,height:pad*2+labels.length*36+12+lines.length*49};
        });
        const height=Math.max(...pair.map(f=>f.height));
        for(const box of pair){
          ops.push({kind:'box',x:box.x,y:y-5,width,height,color:box.f.status==='missing'?'#f7f8f5':'#f3f6f1'});
          let by=y+20;
          for(const label of box.labels){ops.push({kind:'text',text:label,x:box.x+pad,y:by,font:font(26),size:26,color:'#819078'});by+=36;}
          by+=12;
          for(const row of box.lines){
            ctx.font=font(34);
            ops.push({kind:'text',text:row,x:box.x+pad,y:by,font:font(34),size:34,color:box.f.status==='missing'?'#7b8476':'#3f5b40'});
            bounds.push({text:row,x:box.x+pad,width:ctx.measureText(row).width,right:box.x+pad+ctx.measureText(row).width,y:by,size:34});by+=49;
          }
        }
        y+=height+gap;
      }
      y+=4;
      for(const [value,labels] of missing)text(labels.join('、')+'：'+value.replace(/。$/,'')+'。',{size:32,line:51,color:'#7e8877'});
    };
    const records=rows=>{for(const row of rows||[]){text(row.label,{size:29,weight:600,line:44,gap:5,color:'#7d8e72'});text(row.value);}};
    const blocks=rows=>{for(const row of rows||[]){
      if(row.type==='heading')text(row.text,{size:34,weight:600,line:52,gap:8,color:'#58704d'});
      else if(row.type==='steps')for(const [i,value] of (row.items||[]).entries())text(`${i+1}. ${value}`);
      else text(row.text);
    }};
    text('海市咖啡  /  HAISHI COFFEE',{size:27,line:44,gap:35,color:'#7f8c79'});
    const titleY=y;text(p.name,{size:78,line:100,gap:0,hand:true,color:'#2f4e39'});
    ctx.font=font(78,400,true);const nameWidth=Math.min(CW,Math.max(...wrap(ctx,p.name,CW).map(t=>ctx.measureText(t).width)));
    ops.push({kind:'clay',x:M,y:y+4,width:nameWidth,color:p.accent||'#ccd8c1'});y+=39;
    text(types[type],{size:42,weight:500,line:62,gap:18,color:'#5b7152'});
    const origin=p.basic.find(f=>f.label==='国家与产区');if(origin)text(origin.value,{size:29,line:46,gap:21,color:'#8a977f'});
    paragraphs(p.summary);
    heading('基本信息');fields(p.basic);
    if(p.disclosures.length){heading('处理说明');paragraphs(p.disclosures);}
    if(type==='origin'){
      heading('产地介绍');
      if(p.origin.blocks.length)blocks(p.origin.blocks);else text(p.origin.missingMessage||'本批未提供产地介绍。');
      const existing=new Set(p.origin.blocks.map(b=>b.text));
      const extra=p.origin.processNotes.filter(b=>b.type==='steps'||!existing.has(b.text));
      if(extra.length){heading('处理记录');blocks(extra);}
    }else{
      heading('冲煮参数');
      const status={supplier_reference:'供方参考配方',reference_pending_batch_test:'参考参数 · 本批次待验证',not_provided:'本批未提供经确认的冲煮参数'}[p.brew.status];
      if(p.brew.statusStatements.length)paragraphs(p.brew.statusStatements);
      else if(status)text(status,{size:30,line:46,gap:18,color:'#7e8d75'});
      paragraphs(p.brew.usage);
      const compact=value=>String(value).replace(/\s+/g,'');
      const gridParameters=p.brew.parameters.filter(row=>!['注水步骤','总萃取时长'].includes(row.label)||!p.brew.recipeLines.some(line=>compact(line).includes(compact(row.value))));
      if(gridParameters.length)fields(gridParameters);
      if(p.brew.missingFields.length)text(p.brew.missingFields.join('、')+'：本批未提供。',{size:32,line:51,color:'#7e8877'});
      if(p.brew.recipeLines.length){heading('配方与操作记录');paragraphs(p.brew.recipeLines);}
      paragraphs(p.brew.notes);
      heading(p.roast.referenceBatch?'烘焙参数 · 参考批次':'烘焙参数');
      if(roastContext[p.id])text(roastContext[p.id],{size:31,line:50,color:'#7e8d75'});
      if(p.roast.referenceBatch)text('以下为参考批次记录，当前烘焙安排以下单确认信息为准。',{size:31,line:50,color:'#7e8d75'});
      fields(p.roast.parameters);
      text('烘焙时间、烘焙温度：本批未提供。',{size:32,line:51,color:'#7e8877'});
      paragraphs(p.roast.notes);
    }
    heading(type==='brew'?'萃取与风味记录':'风味记录');
    if(p.flavor.summary)text(p.flavor.summary,{size:38,line:58,gap:22,color:'#49673f'});
    records(p.flavor.records);paragraphs(p.flavor.notes);
    y+=30;ops.push({kind:'rule',x:M,y,width:CW});y+=31;
    text('海市咖啡 · 精品咖啡豆',{size:27,line:42,gap:4,color:'#84917b'});
    text('资料按网站公开记录整理 · '+String(p.updatedDate||data.date||'').replaceAll('-','.'),{size:25,line:40,gap:0,color:'#98a18f'});
    const height=Math.ceil(y+60);
    return{width:W,height,ops,bounds,id:p.id,type,titleY};
  }

  function roundedBox(ctx,x,y,w,h){const r=14;ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fill();}
  function clay(ctx,op){
    ctx.save();ctx.translate(op.x,op.y);ctx.scale(op.width/180,1);ctx.fillStyle=op.color;
    ctx.shadowColor='#42513b20';ctx.shadowBlur=2;ctx.shadowOffsetY=2;
    ctx.beginPath();ctx.moveTo(1,6);ctx.bezierCurveTo(30,1,39,8,64,5);ctx.bezierCurveTo(91,1,111,8,140,4);ctx.bezierCurveTo(162,3,178,0,180,5);ctx.bezierCurveTo(180,12,154,8,132,11);ctx.bezierCurveTo(101,13,88,7,60,11);ctx.bezierCurveTo(35,13,15,8,1,11);ctx.closePath();ctx.fill();ctx.shadowColor='transparent';
    ctx.strokeStyle='#ffffff85';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(9,5);ctx.bezierCurveTo(45,5,65,3,84,6);ctx.bezierCurveTo(118,8,145,3,172,4);ctx.stroke();ctx.restore();
  }
  async function fontsReady(name){
    if(!document.fonts)return;
    await Promise.race([Promise.all([document.fonts.load('78px HaishiHand',name),document.fonts.ready]),new Promise(resolve=>setTimeout(resolve,6000))]).catch(()=>{});
  }
  async function render(id,type){
    const p=products.get(id);if(!p)throw new Error('暂未找到这款豆的下载资料。');
    await fontsReady(p.name);
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('当前浏览器未能生成图片，请换用手机浏览器重试。');
    const plan=layout(ctx,p,type);canvas.width=plan.width;canvas.height=plan.height;
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textBaseline='top';
    for(const op of plan.ops){
      if(op.kind==='text'){ctx.font=op.font;ctx.fillStyle=op.color;ctx.fillText(op.text,op.x,op.y);}
      else if(op.kind==='box'){ctx.fillStyle=op.color;roundedBox(ctx,op.x,op.y,op.width,op.height);}
      else if(op.kind==='clay')clay(ctx,op);
      else if(op.kind==='rule'){ctx.strokeStyle='#e3e9dd';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(op.x,op.y);ctx.lineTo(op.x+op.width,op.y);ctx.stroke();}
    }
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('图片未能生成，请重试。')),'image/png'));
    const filename=('海市咖啡_'+p.name+'_'+types[type]+'.png').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-');
    return{blob,filename,width:plan.width,height:plan.height,plan};
  }

  const downloadIcon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v11m-4-4 4 4 4-4M5 15v5h14v-5"/></svg>';
  let panel,dialog,sequence=0,objectUrl='',result=null,previousFocus;
  function closeDialog(){if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');sequence++;setBusy(false);previousFocus?.focus({preventScroll:true});}}
  function setBusy(busy){panel?.querySelectorAll('[data-coffee-download]').forEach(b=>b.disabled=busy);}
  function getDialog(){
    if(dialog)return dialog;
    dialog=document.createElement('dialog');dialog.className='coffee-download-dialog';dialog.setAttribute('aria-labelledby','coffee-download-title');
    dialog.innerHTML='<header><div><p>海市咖啡</p><h2 id="coffee-download-title">资料图片</h2></div><button type="button" class="download-close" aria-label="关闭图片预览">×</button></header><p class="download-status" role="status" aria-live="polite"></p><nav class="download-save-actions" aria-label="图片保存"><a class="download-save" hidden>保存PNG图片</a><a class="download-open" target="_blank" rel="noopener" hidden>打开大图</a><button class="download-share" type="button" hidden>分享图片</button></nav><p class="download-fallback" hidden>手机未弹出下载时，可点“保存PNG图片”，或长按下方图片保存；也可打开大图后长按保存。</p><figure class="download-preview" hidden><img alt=""></figure>';
    document.body.append(dialog);
    const closed=()=>{sequence++;setBusy(false);previousFocus?.focus({preventScroll:true});};
    dialog.querySelector('.download-close').addEventListener('click',closeDialog);
    dialog.addEventListener('close',closed);
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeDialog();});
    dialog.querySelector('.download-share').addEventListener('click',async()=>{
      if(!result)return;
      try{await navigator.share({files:[new File([result.blob],result.filename,{type:'image/png'})],title:result.filename});}
      catch(error){if(error.name!=='AbortError')dialog.querySelector('.download-status').textContent='暂时无法分享，可保存图片后再发送。';}
    });
    return dialog;
  }
  async function open(id,type,source){
    const box=getDialog(),p=products.get(id);if(!p)return;
    previousFocus=source||document.activeElement;const token=++sequence;
    const status=box.querySelector('.download-status'),preview=box.querySelector('.download-preview'),image=preview.querySelector('img');
    box.querySelector('h2').textContent=p.name+' · '+types[type];status.textContent='正在生成图片…';status.classList.remove('is-error');
    preview.hidden=true;image.removeAttribute('src');box.querySelector('.download-fallback').hidden=true;
    box.querySelectorAll('.download-save-actions>a,.download-share').forEach(el=>el.hidden=true);setBusy(true);
    if(!box.open){if(typeof box.showModal==='function')box.showModal();else{box.setAttribute('open','');box.classList.add('download-dialog-fallback');}}
    try{
      const generated=await render(id,type);if(token!==sequence)return;
      if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(generated.blob);result=generated;
      image.src=objectUrl;image.alt=p.name+' '+types[type]+'完整资料图片';image.width=generated.width;image.height=generated.height;preview.hidden=false;
      const save=box.querySelector('.download-save');save.href=objectUrl;save.download=generated.filename;save.hidden=false;
      const full=box.querySelector('.download-open');full.href=objectUrl;full.hidden=false;box.querySelector('.download-fallback').hidden=false;
      let canShare=false;try{canShare=typeof File==='function'&&!!navigator.canShare&&navigator.canShare({files:[new File([generated.blob],generated.filename,{type:'image/png'})]});}catch(_){}
      box.querySelector('.download-share').hidden=!canShare;
      status.textContent='图片已生成。若未自动下载，可点击保存或长按图片。';
      const direct=document.createElement('a');direct.href=objectUrl;direct.download=generated.filename;direct.hidden=true;document.body.append(direct);try{direct.click();}catch(_){status.textContent='图片已生成。可点击保存PNG图片，或长按下方图片保存。';}finally{direct.remove();}
    }catch(error){
      if(token!==sequence)return;
      status.textContent='图片生成失败，请关闭后重试；也可继续查看当前网页资料。';status.classList.add('is-error');console.error('Coffee PNG export:',error);
    }finally{if(token===sequence)setBusy(false);}
  }
  function mount(){
    const id=document.body.dataset.productId,header=document.querySelector('.detail-header,.card-header');
    if(!products.has(id)||!header||document.querySelector('.coffee-download-tools'))return;
    panel=document.createElement('section');panel.className='coffee-download-tools';panel.setAttribute('aria-label','下载豆款资料');
    panel.innerHTML='<div class="download-tools-copy"><h2>下载豆款资料</h2><p>保存后可查阅或分享。</p></div><div class="coffee-download-buttons"><button type="button" data-coffee-download="origin">'+downloadIcon+'下载产地介绍图</button><button type="button" data-coffee-download="brew">'+downloadIcon+'下载冲煮方案图</button></div>';
    header.after(panel);
    panel.addEventListener('click',event=>{const button=event.target.closest('[data-coffee-download]');if(button&&!button.disabled)open(id,button.dataset.coffeeDownload,button);});
  }
  window.HaishiDownloads={render,layout,wrap,open,products};
  mount();
  window.addEventListener('pagehide',event=>{if(objectUrl&&!event.persisted)URL.revokeObjectURL(objectUrl);});
})();

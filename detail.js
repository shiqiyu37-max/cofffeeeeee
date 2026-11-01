const navLinks=[...document.querySelectorAll('.section-nav a')];
if(navLinks.length){
 const sections=['origin','flavor','brew','spec'].map(id=>document.getElementById(id));
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)navLinks.forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('current',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-16% 0px -64% 0px'});
 sections.filter(Boolean).forEach(s=>observer.observe(s));
}
document.querySelectorAll('.copy-recipe').forEach(button=>button.addEventListener('click',async()=>{
 const title=document.querySelector('h1').textContent.trim();
 const section=button.closest('section');
 const text=title+'｜冲煮参考\n'+section.querySelector('.params').innerText+'\n'+section.querySelector('.recipe-text').innerText+'\n'+section.querySelector('.note').textContent;
 let ok=false;
 try{await navigator.clipboard.writeText(text);ok=true;}catch(e){const input=document.createElement('textarea');input.value=text;input.style.cssText='position:fixed;left:-9999px';document.body.append(input);input.select();ok=document.execCommand('copy');input.remove();}
 let toast=document.querySelector('.toast');if(!toast){toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');document.body.append(toast);}toast.textContent=ok?'配方已复制':'可直接选取页面文字复制';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400);
}));

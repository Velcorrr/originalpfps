'use strict';
(() => {
  const assetBase = new URL('.',document.currentScript.src);
  const all = window.AVATARS || [];
  const $ = id => document.getElementById(id);
  const imagePath = (x,full=false) => new URL(`${full?'pictures':'thumbs'}/${x.id}.webp`,assetBase).href;
  const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const searchIndex = new Map(all.map(x=>[x.id,normalize(`${x.name} ${x.category} ${x.platform}`)]));
  const params = new URLSearchParams(location.search);
  const platforms = ['Netflix','Disney+','HBO Max','Prime Video','Crunchyroll','Paramount+','Peacock','Movies Anywhere'];
  const state = {query:params.get('q')||'',platform:platforms.includes(params.get('platform'))?params.get('platform'):'',limit:84};
  let results=[],timer,returnFocus,renderedCount=0;
  const platformSections=new Map(),seriesSections=new Map();
  for(const p of platforms)$('platform').append(new Option(`${p} (${all.filter(x=>x.platform===p).length.toLocaleString()})`,p));
  $('search').value=state.query;$('platform').value=state.platform;
  const organized=[...all].sort((a,b)=>platforms.indexOf(a.platform)-platforms.indexOf(b.platform)||a.category.localeCompare(b.category,undefined,{sensitivity:'base',numeric:true})||a.name.localeCompare(b.name,undefined,{sensitivity:'base',numeric:true}));
  function syncUrl(){const p=new URLSearchParams();if(state.query)p.set('q',state.query);if(state.platform)p.set('platform',state.platform);try{history.replaceState(null,'',location.pathname+(p.size?'?'+p.toString():'')+location.hash);}catch{}}
  function openPreview(x,trigger){
    returnFocus=trigger||document.activeElement;$('picture').src=imagePath(x,true);$('picture').alt=x.name;$('picture-name').textContent=x.name;$('picture-platform').textContent=x.platform;$('picture-category').textContent=x.category;$('picture-size').textContent=`${x.width} × ${x.height}`;
    $('download').href=imagePath(x,true);$('download').download=`${x.name.replace(/[<>:"/\\|?*]/g,'-')}.webp`;
    $('preview').showModal();document.body.classList.add('modal-open');
  }
  function card(x,i){
    const b=document.createElement('button');b.className='card';b.style.setProperty('--delay',`${Math.min(i,12)*16}ms`);b.setAttribute('aria-label',`Preview ${x.name}, ${x.category}, ${x.platform}`);
    const pic=document.createElement('span');pic.className='image';const im=document.createElement('img');im.src=imagePath(x);im.alt=x.name;im.width=320;im.height=320;im.loading='lazy';im.decoding='async';const indicator=document.createElement('span');indicator.className='open-indicator';indicator.textContent='↗';indicator.setAttribute('aria-hidden','true');pic.append(im,indicator);
    const name=document.createElement('span');name.className='name';name.textContent=x.name;const category=document.createElement('span');category.className='category';category.textContent=x.category;const platform=document.createElement('span');platform.className='platform';platform.textContent=x.platform;b.append(pic,name,category,platform);
    b.addEventListener('click',()=>openPreview(x,b));return b;
  }
  function render(append=false){
    const start=append?renderedCount:0;
    if(!append){$('grid').replaceChildren();platformSections.clear();seriesSections.clear();}
    results.slice(start,state.limit).forEach((x,i)=>{
      if(!platformSections.has(x.platform)){
        const section=document.createElement('section');section.className='platform-group';
        const heading=document.createElement('h2');heading.className='platform-heading';heading.textContent=x.platform;
        const count=document.createElement('span');count.textContent=results.filter(r=>r.platform===x.platform).length.toLocaleString()+' pictures';heading.append(count);
        section.append(heading);$('grid').append(section);platformSections.set(x.platform,section);
      }
      const key=JSON.stringify([x.platform,x.category]);
      if(!seriesSections.has(key)){
        const section=document.createElement('section');section.className='series-group';const heading=document.createElement('h3');heading.textContent=x.category;
        const grid=document.createElement('div');grid.className='grid';section.append(heading,grid);platformSections.get(x.platform).append(section);seriesSections.set(key,grid);
      }
      seriesSections.get(key).append(card(x,i));
    });
    renderedCount=Math.min(state.limit,results.length);
    $('empty').hidden=results.length!==0;$('more').hidden=state.limit>=results.length;$('progress').textContent=results.length?`${Math.min(state.limit,results.length).toLocaleString()} of ${results.length.toLocaleString()}`:'';
  }
  function update(){
    state.limit=84;const words=normalize(state.query.trim()).split(/\s+/).filter(Boolean);results=organized.filter(x=>(!state.platform||x.platform===state.platform)&&words.every(w=>searchIndex.get(x.id).includes(w)));
    const strong=document.createElement('strong');strong.textContent=results.length.toLocaleString();$('count').replaceChildren(strong,document.createTextNode(` picture${results.length===1?'':'s'}${state.platform?' · '+state.platform:''}`));$('reset').hidden=!(state.query||state.platform);render();syncUrl();
  }
  function clear(){clearTimeout(timer);state.query='';state.platform='';$('search').value='';$('platform').value='';update();}
  $('search').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.query=$('search').value;update();},100);});$('platform').addEventListener('change',()=>{state.platform=$('platform').value;update();});
  $('reset').addEventListener('click',clear);$('empty-reset').addEventListener('click',clear);$('more').addEventListener('click',()=>{const start=renderedCount;state.limit+=84;render(true);$('grid').querySelectorAll('.card')[start]?.focus({preventScroll:true});});
  $('close').addEventListener('click',()=>$('preview').close());$('info-close').addEventListener('click',()=>$('info').close());$('info-open').addEventListener('click',()=>{returnFocus=$('info-open');$('info').showModal();document.body.classList.add('modal-open');});
  for(const id of ['preview','info']){
    $(id).addEventListener('close',()=>{document.body.classList.remove('modal-open');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
    $(id).addEventListener('click',e=>{if(e.target!==$(id))return;const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close();});
  }
  let frame=0;
  $('grid').addEventListener('pointermove',e=>{if(e.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=e.target.closest('.card');if(!c)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',`${e.clientX-r.left}px`);c.style.setProperty('--my',`${e.clientY-r.top}px`);});});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!document.querySelector('dialog[open]')&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}});
  update();
})();

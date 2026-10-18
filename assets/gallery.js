'use strict';
(() => {
  const assetBase = new URL('.',document.currentScript.src);
  const all = window.AVATARS || [];
  const $ = id => document.getElementById(id);
  const imagePath = (x,full=false) => new URL(`${full?'pictures':'thumbs'}/${x.id}.webp`,assetBase).href;
  const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const searchIndex = new Map(all.map(x=>[x.id,normalize(`${x.name} ${x.category} ${x.platform} ${x.generation||''}`)]));
  const params = new URLSearchParams(location.search);
  const platforms = ['Netflix','Disney+','HBO Max','Prime Video','Crunchyroll','Paramount+','Peacock','Movies Anywhere','Xbox One / Series','Xbox 360'];
  const state = {query:params.get('q')||'',platform:platforms.includes(params.get('platform'))?params.get('platform'):'',limit:84};
  let results=[],timer,returnFocus,renderedCount=0;
  const platformSections=new Map(),seriesSections=new Map();
  const choices=['',...platforms];
  const platformCounts=new Map(choices.map(p=>[p,p?all.filter(x=>x.platform===p).length:all.length]));
  let activeOption=0,typeBuffer='',typeTimer;
  for(const [i,p] of choices.entries()){
    const option=document.createElement('button');option.type='button';option.className='platform-option';option.id='platform-option-'+i;option.setAttribute('role','option');option.tabIndex=-1;
    const label=document.createElement('span');label.textContent=p||'All platforms';
    const count=document.createElement('span');count.className='option-count';count.textContent=platformCounts.get(p).toLocaleString();
    const check=document.createElement('span');check.className='option-check';check.textContent='✓';check.setAttribute('aria-hidden','true');
    option.append(label,count,check);option.addEventListener('click',()=>choosePlatform(i));option.addEventListener('pointermove',()=>highlightOption(i));$('platform-menu').append(option);
  }
  function syncPlatform(){
    $('platform-label').textContent=state.platform||'All platforms';
    [...$('platform-menu').children].forEach((o,i)=>o.setAttribute('aria-selected',String(choices[i]===state.platform)));
  }
  function highlightOption(i){
    activeOption=(i+choices.length)%choices.length;
    [...$('platform-menu').children].forEach((o,j)=>o.classList.toggle('active',j===activeOption));
    $('platform').setAttribute('aria-activedescendant','platform-option-'+activeOption);
  }
  function openMenu(){
    $('platform-menu').hidden=false;$('platform').setAttribute('aria-expanded','true');highlightOption(choices.indexOf(state.platform));
  }
  function closeMenu(){
    $('platform-menu').hidden=true;$('platform').setAttribute('aria-expanded','false');$('platform').removeAttribute('aria-activedescendant');typeBuffer='';clearTimeout(typeTimer);
  }
  function choosePlatform(i){state.platform=choices[i];syncPlatform();closeMenu();update();$('platform').focus({preventScroll:true});}
  $('platform').addEventListener('click',()=>{$('platform-menu').hidden?openMenu():closeMenu();});
  $('platform').addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(!$('platform-menu').hidden){e.preventDefault();closeMenu();}return;}
    if(e.key==='Tab'){closeMenu();return;}
    if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
      e.preventDefault();if($('platform-menu').hidden){openMenu();if(e.key.startsWith('Arrow'))return;}
      highlightOption(e.key==='Home'?0:e.key==='End'?choices.length-1:activeOption+(['ArrowDown','ArrowRight'].includes(e.key)?1:-1));
      $('platform-menu').children[activeOption].scrollIntoView({block:'nearest'});return;
    }
    if((e.key==='Enter'||e.key===' ')&&!$('platform-menu').hidden){e.preventDefault();choosePlatform(activeOption);return;}
    if(e.key.length===1&&e.key!==' '&&!e.ctrlKey&&!e.altKey&&!e.metaKey){
      e.preventDefault();if($('platform-menu').hidden)openMenu();typeBuffer+=e.key.toLowerCase();clearTimeout(typeTimer);typeTimer=setTimeout(()=>{typeBuffer='';},650);
      const i=choices.findIndex(p=>(p||'All platforms').toLowerCase().startsWith(typeBuffer));if(i>=0)highlightOption(i);
    }
  });
  document.addEventListener('pointerdown',e=>{if(!$('platform-picker').contains(e.target))closeMenu();});
  $('platform-picker').addEventListener('focusout',e=>{if(!$('platform-picker').contains(e.relatedTarget))closeMenu();});
  $('search').value=state.query;syncPlatform();
  const titleSort=new Intl.Collator(undefined,{sensitivity:'base',numeric:true});
  const xboxOrder=x=>x.platform==='Xbox 360'&&x.category!=='Xbox 360 Classics'?1:0;
  const organized=[...all].sort((a,b)=>platforms.indexOf(a.platform)-platforms.indexOf(b.platform)||xboxOrder(a)-xboxOrder(b)||titleSort.compare(a.category,b.category)||titleSort.compare(a.name,b.name));
  function syncUrl(){const p=new URLSearchParams();if(state.query)p.set('q',state.query);if(state.platform)p.set('platform',state.platform);try{history.replaceState(null,'',location.pathname+(p.size?'?'+p.toString():'')+location.hash);}catch{}}
  function openPreview(x,trigger){
    returnFocus=trigger||document.activeElement;$('picture').src=imagePath(x,true);$('picture').alt=x.name;$('picture-name').textContent=x.name;$('picture-platform').textContent=x.generation||x.platform;$('picture-category').textContent=x.category;$('picture-size').textContent=`${x.width} × ${x.height}`;
    $('download').href=imagePath(x,true);$('download').download=`${x.name.replace(/[<>:"/\\|?*]/g,'-')}.webp`;
    $('preview').showModal();document.body.classList.add('modal-open');
  }
  function card(x,i){
    const b=document.createElement('button');b.className='card';b.style.setProperty('--delay',`${Math.min(i,12)*16}ms`);b.setAttribute('aria-label',`Preview ${x.name}, ${x.category}, ${x.platform}`);
    const pic=document.createElement('span');pic.className='image';const im=document.createElement('img');im.src=imagePath(x);im.alt=x.name;im.width=320;im.height=320;im.loading='lazy';im.decoding='async';pic.append(im);
    const name=document.createElement('span');name.className='name';name.textContent=x.name;const category=document.createElement('span');category.className='category';category.textContent=x.category;const platform=document.createElement('span');platform.className='platform';platform.textContent=x.generation||x.platform;b.append(pic,name,category,platform);
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
    $('empty').hidden=results.length!==0;
    loadObserver.disconnect();
    $('load-sentinel').hidden=renderedCount>=results.length;
    if(renderedCount<results.length)loadObserver.observe($('load-sentinel'));
  }
  function update(){
    state.limit=84;const words=normalize(state.query.trim()).split(/\s+/).filter(Boolean);results=organized.filter(x=>(!state.platform||x.platform===state.platform)&&words.every(w=>searchIndex.get(x.id).includes(w)));
    const strong=document.createElement('strong');strong.textContent=results.length.toLocaleString();$('count').replaceChildren(strong,document.createTextNode(` picture${results.length===1?'':'s'}${state.platform?' · '+state.platform:''}`));render();syncUrl();
  }
  $('search').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.query=$('search').value;update();},100);});
  $('close').addEventListener('click',()=>$('preview').close());$('info-close').addEventListener('click',()=>$('info').close());$('info-open').addEventListener('click',()=>{returnFocus=$('info-open');$('info').showModal();document.body.classList.add('modal-open');});
  for(const id of ['preview','info']){
    $(id).addEventListener('close',()=>{document.body.classList.remove('modal-open');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
    $(id).addEventListener('click',e=>{if(e.target!==$(id))return;const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close();});
  }
  let frame=0;
  $('grid').addEventListener('pointermove',e=>{if(e.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=e.target.closest('.card');if(!c)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',`${e.clientX-r.left}px`);c.style.setProperty('--my',`${e.clientY-r.top}px`);});});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!document.querySelector('dialog[open]')&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}});
  const loadObserver=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)&&renderedCount<results.length){state.limit+=84;render(true);}
  },{rootMargin:'1000px 0px'});
  update();
})();

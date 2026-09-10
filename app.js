const GITHUB_API='https://api.github.com/repos/rcpdkc/sgdb-tasarim/contents?ref=main';
const gallery=document.querySelector('#gallery');
const statusEl=document.querySelector('#status');
const countMetric=document.querySelector('#countMetric');
const search=document.querySelector('#search');
const sort=document.querySelector('#sort');
const viewer=document.querySelector('#viewer');
const viewerImg=document.querySelector('#viewerImg');
const viewerTitle=document.querySelector('#viewerTitle');
const viewerNo=document.querySelector('#viewerNo');
const openRaw=document.querySelector('#openRaw');
let items=[],visible=[],current=0;

const isImage=n=>/\.(png|jpe?g|webp|gif)$/i.test(n);
const titleFor=(name,i)=>`SGDB Design ${String(i+1).padStart(2,'0')}`;

function render(){
  const q=search.value.trim().toLowerCase();
  visible=items.filter(x=>x.name.toLowerCase().includes(q));
  if(sort.value==='old') visible=[...visible].reverse();
  else if(sort.value==='name') visible=[...visible].sort((a,b)=>a.name.localeCompare(b.name,'tr'));

  gallery.innerHTML=visible.map((x,i)=>`<article class="card" data-i="${i}" tabindex="0" aria-label="${titleFor(x.name,i)}"><span class="cardNo">${String(i+1).padStart(2,'0')}</span><img loading="lazy" decoding="async" src="${x.download_url}" alt="${titleFor(x.name,i)}"><div class="cardMeta"><b>${titleFor(x.name,i)}</b><span>VIEW DESIGN ↗</span></div></article>`).join('');
  statusEl.textContent=visible.length?`${visible.length} tasarım gösteriliyor`:'Eşleşen tasarım bulunamadı.';

  document.querySelectorAll('.card').forEach(c=>{
    const open=()=>show(Number(c.dataset.i));
    c.addEventListener('click',open);
    c.addEventListener('keydown',e=>{if(e.key==='Enter')open()});
  });
}

function show(i){
  current=i;
  const x=visible[i];
  if(!x)return;
  viewerImg.src=x.download_url;
  viewerTitle.textContent=titleFor(x.name,i);
  viewerNo.textContent=`${String(i+1).padStart(2,'0')} / ${String(visible.length).padStart(2,'0')}`;
  openRaw.href=x.download_url;
  viewer.showModal();
}

function step(d){
  if(!visible.length)return;
  show((current+d+visible.length)%visible.length);
}

async function fetchImages(){
  const sources=['/api/images',GITHUB_API];
  let lastError;
  for(const url of sources){
    try{
      const r=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
      if(!r.ok)throw new Error(`${url} -> ${r.status}`);
      const data=await r.json();
      const list=Array.isArray(data)?data:[];
      const normalized=list
        .filter(x=>x&&x.name&&isImage(x.name))
        .map(x=>({
          name:x.name,
          download_url:x.download_url||`https://raw.githubusercontent.com/rcpdkc/sgdb-tasarim/main/${encodeURIComponent(x.name)}`
        }));
      if(normalized.length)return normalized;
      throw new Error(`${url} boş liste döndürdü`);
    }catch(e){lastError=e;}
  }
  throw lastError||new Error('Görsel kaynağı bulunamadı');
}

async function load(){
  try{
    statusEl.textContent='Görseller yükleniyor…';
    items=await fetchImages();
    items.sort((a,b)=>b.name.localeCompare(a.name,'tr'));
    countMetric.textContent=items.length;
    statusEl.textContent='';
    render();
  }catch(e){
    statusEl.textContent='Görseller yüklenemedi. Lütfen sayfayı yenileyin.';
    console.error('SGDB gallery load error:',e);
  }
}

search.addEventListener('input',render);
sort.addEventListener('change',render);
document.querySelector('#closeViewer').addEventListener('click',()=>viewer.close());
document.querySelector('#prevBtn').addEventListener('click',()=>step(-1));
document.querySelector('#nextBtn').addEventListener('click',()=>step(1));
viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
document.addEventListener('keydown',e=>{if(!viewer.open)return;if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)});
document.querySelector('#randomBtn').addEventListener('click',()=>{if(!items.length)return;visible=[...items];show(Math.floor(Math.random()*items.length))});

const themeBtn=document.querySelector('#themeBtn');
const saved=localStorage.getItem('sgdb-theme');
if(saved==='light')document.body.classList.add('light');
themeBtn.addEventListener('click',()=>{
  document.body.classList.toggle('light');
  localStorage.setItem('sgdb-theme',document.body.classList.contains('light')?'light':'dark');
});

load();

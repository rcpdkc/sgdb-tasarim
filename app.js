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
const titleFor=i=>`SGDB Design ${String(i+1).padStart(2,'0')}`;

function render(){
  const q=search.value.trim().toLocaleLowerCase('tr');
  visible=items.filter(x=>x.name.toLocaleLowerCase('tr').includes(q));
  if(sort.value==='old') visible=[...visible].reverse();
  if(sort.value==='name') visible=[...visible].sort((a,b)=>a.name.localeCompare(b.name,'tr'));
  gallery.innerHTML=visible.map((x,i)=>`<article class="card" data-i="${i}" tabindex="0"><span class="cardNo">${String(i+1).padStart(2,'0')}</span><img loading="lazy" decoding="async" src="${x.download_url}" alt="${titleFor(i)}"><div class="cardMeta"><b>${titleFor(i)}</b><span>GÖRÜNTÜLE</span></div></article>`).join('');
  countMetric.textContent=visible.length;
  statusEl.textContent=visible.length?'':'Tasarım bulunamadı.';
  document.querySelectorAll('.card').forEach(card=>{
    const open=()=>show(Number(card.dataset.i));
    card.addEventListener('click',open);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  });
}

function show(i){
  current=i;
  const x=visible[i];
  if(!x)return;
  viewerImg.src=x.download_url;
  viewerTitle.textContent=titleFor(i);
  viewerNo.textContent=`${i+1} / ${visible.length}`;
  openRaw.href=x.download_url;
  viewer.showModal();
}
function step(d){if(visible.length)show((current+d+visible.length)%visible.length)}

async function fetchImages(){
  for(const url of ['/api/images',GITHUB_API]){
    try{
      const r=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
      if(!r.ok)continue;
      const data=await r.json();
      const list=(Array.isArray(data)?data:[]).filter(x=>x&&x.name&&isImage(x.name));
      if(list.length)return list.map(x=>({name:x.name,download_url:x.download_url||`https://raw.githubusercontent.com/rcpdkc/sgdb-tasarim/main/${encodeURIComponent(x.name)}`}));
    }catch(_){ }
  }
  throw new Error('Görsel kaynağı bulunamadı');
}

async function load(){
  try{
    statusEl.textContent='Görseller yükleniyor…';
    items=await fetchImages();
    items.sort((a,b)=>b.name.localeCompare(a.name,'tr'));
    render();
  }catch(e){
    countMetric.textContent='0';
    statusEl.textContent='Görseller yüklenemedi. Sayfayı yenileyin.';
    console.error(e);
  }
}

search.addEventListener('input',render);
sort.addEventListener('change',render);
document.querySelector('#closeViewer').addEventListener('click',()=>viewer.close());
document.querySelector('#prevBtn').addEventListener('click',()=>step(-1));
document.querySelector('#nextBtn').addEventListener('click',()=>step(1));
viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
document.addEventListener('keydown',e=>{if(!viewer.open)return;if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1);if(e.key==='Escape')viewer.close();});
load();

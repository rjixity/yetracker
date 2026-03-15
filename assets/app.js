const ERA_COLORS={
  'before the college dropout':'#2e1a6e','the college dropout':'#6e3a1a',
  'late registration':'#1a3a6e','graduation':'#5a4a0a','808s':'#0a4a5a',
  'my beautiful dark twisted fantasy':'#2a5a1a','watch the throne':'#5a1a3a',
  'yeezus':'#6e1a1a','the life of pablo':'#4a1a6e','ye':'#0a5a4a',
  'kids see ghosts':'#5a1a5a','jesus is king':'#4a5a0a','donda':'#1a1a2e',
  'vultures':'#5a3a0a','cruel summer':'#6e4a0a'
};
function getColor(era){const k=era.toLowerCase();for(const[p,c]of Object.entries(ERA_COLORS))if(k.includes(p))return c;return'#1a1a2e';}
function qClass(q){if(!q)return'q-na';const l=q.toLowerCase();if(l.includes('high'))return'q-high';if(l.includes('cd'))return'q-cd';if(l.includes('low'))return'q-low';if(l.includes('record'))return'q-rec';if(l.includes('confirm'))return'q-conf';if(l.includes('not avail')||l.includes('unavail'))return'q-na';return'q-other';}
let allData=null,currentTab='u',currentLabel='Songs';
function loadData(){allData=JSON.parse(atob(RAW));}
function resetHero(){
  document.getElementById('hero-bg').style.background='radial-gradient(ellipse 60% 80% at 50% 50%,#1a0a2e 0%,#0a0a0a 75%)';
  document.getElementById('hero-sub').textContent='THE COMPLETE ARCHIVE';
}
function switchTab(key,label){
  currentTab=key;currentLabel=label;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===key));
  resetHero();renderEras(allData[key]);
}
function renderEras(eraObj){
  const list=document.getElementById('era-list');
  list.innerHTML='';
  const keys=Object.keys(eraObj);
  const total=keys.reduce((s,k)=>s+eraObj[k].length,0);
  document.getElementById('s-eras').textContent=keys.length;
  document.getElementById('s-songs').textContent=total.toLocaleString();
  keys.forEach(era=>{
    const songs=eraObj[era];
    const wrap=document.createElement('div');
    const row=document.createElement('div');
    row.className='era-row';
    row.innerHTML=`<div class="era-row-name">${era}</div><div class="era-row-count">${songs.length} ${currentLabel}</div>`;
    const panel=document.createElement('div');
    panel.className='songs-panel';
    row.onclick=()=>{
      const isOpen=panel.classList.contains('open');
      document.querySelectorAll('.songs-panel.open').forEach(p=>p.classList.remove('open'));
      document.querySelectorAll('.era-row.active').forEach(r=>r.classList.remove('active'));
      if(!isOpen){
        panel.classList.add('open');row.classList.add('active');
        document.getElementById('hero-bg').style.background=`radial-gradient(ellipse 60% 80% at 50% 50%, ${getColor(era)} 0%, #0a0a0a 75%)`;
        document.getElementById('hero-sub').textContent=era.toUpperCase();
        if(!panel.dataset.loaded){
          panel.dataset.loaded='1';
          songs.forEach(([name,quality,length,url],i)=>{
            const el=document.createElement(url?'a':'div');
            el.className='song-item'+(url?'':' no-link');
            if(url){el.href=url;el.target='_blank';el.rel='noopener noreferrer';}
            el.innerHTML=`<div class="song-num">${i+1}</div><div class="song-name" title="${name.replace(/"/g,'&quot;')}">${name}</div>${quality?`<div class="song-quality ${qClass(quality)}">${quality}</div>`:''}<div class="song-len">${length}</div><div class="play-btn"><svg viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9"/></svg></div>`;
            panel.appendChild(el);
          });
        }
        row.scrollIntoView({behavior:'smooth',block:'nearest'});
      } else {resetHero();}
    };
    wrap.appendChild(row);wrap.appendChild(panel);list.appendChild(wrap);
  });
}
loadData();renderEras(allData['u']);
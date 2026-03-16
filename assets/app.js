function qClass(q){
  if(!q)return'q-na';const l=q.toLowerCase();
  if(l.includes('high'))return'q-high';
  if(l.includes('cd'))return'q-cd';
  if(l.includes('low'))return'q-low';
  if(l.includes('record'))return'q-rec';
  if(l.includes('confirm'))return'q-conf';
  if(l.includes('not avail')||l.includes('unavail'))return'q-na';
  return'q-other';
}

let allData=null,currentTab='u',currentLabel='Songs';

// PLAYER
let audio=null,currentSong=null;

function fmt(s){
  if(isNaN(s))return'0:00';
  const m=Math.floor(s/60),sec=Math.floor(s%60);
  return m+':'+(sec<10?'0':'')+sec;
}

function initPlayer(){
  audio=new Audio();
  audio.crossOrigin='anonymous';

  audio.addEventListener('timeupdate',()=>{
    if(!audio.duration)return;
    const pct=(audio.currentTime/audio.duration)*100;
    document.getElementById('p-fill').style.width=pct+'%';
    document.getElementById('p-cur').textContent=fmt(audio.currentTime);
    document.getElementById('p-dur').textContent=fmt(audio.duration);
  });

  audio.addEventListener('ended',()=>{
    setPlayIcon(false);
    document.getElementById('p-fill').style.width='0%';
  });

  audio.addEventListener('error',()=>{
    document.getElementById('p-error').style.display='block';
    setPlayIcon(false);
  });

  audio.addEventListener('canplay',()=>{
    document.getElementById('p-error').style.display='none';
  });

  document.getElementById('p-bar').addEventListener('click',(e)=>{
    if(!audio.duration)return;
    const rect=e.currentTarget.getBoundingClientRect();
    audio.currentTime=((e.clientX-rect.left)/rect.width)*audio.duration;
  });
}

function setPlayIcon(playing){
  const btn=document.getElementById('p-play');
  btn.classList.toggle('playing',playing);
  btn.innerHTML=playing
    ?'<svg viewBox="0 0 10 10"><rect x="1.5" y="1" width="2.5" height="8" rx="1"/><rect x="6" y="1" width="2.5" height="8" rx="1"/></svg>'
    :'<svg viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9"/></svg>';
}

function playSong(name,era,url){
  const player=document.getElementById('player');
  player.classList.add('visible');
  document.getElementById('p-title').textContent=name;
  document.getElementById('p-era').textContent=era;
  document.getElementById('p-ext').href=url;
  document.getElementById('p-error').style.display='none';
  document.getElementById('p-fill').style.width='0%';
  document.getElementById('p-cur').textContent='0:00';
  document.getElementById('p-dur').textContent='0:00';

  if(!audio)initPlayer();
  audio.src=url;
  audio.play().then(()=>setPlayIcon(true)).catch(()=>{
    setPlayIcon(false);
    document.getElementById('p-error').style.display='block';
  });
  currentSong=url;
}

function togglePlay(){
  if(!audio)return;
  if(audio.paused){audio.play();setPlayIcon(true);}
  else{audio.pause();setPlayIcon(false);}
}

function closePlayer(){
  if(audio){audio.pause();audio.src='';}
  document.getElementById('player').classList.remove('visible');
  setPlayIcon(false);
  currentSong=null;
}

function loadData(){allData=JSON.parse(atob(RAW));}

function switchTab(key,label){
  currentTab=key;currentLabel=label;
  document.querySelectorAll('.nav-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===key));
  document.getElementById('search-box').value='';
  renderEras(allData[key]);
}

function renderEras(eraObj,filter=''){
  const list=document.getElementById('era-list');
  const keys=Object.keys(eraObj);
  let total=keys.reduce((s,k)=>s+eraObj[k].length,0);
  document.getElementById('nav-eras').textContent=keys.length;
  document.getElementById('nav-songs').textContent=total.toLocaleString();

  let filtered={};
  if(filter){
    const f=filter.toLowerCase();
    Object.entries(eraObj).forEach(([era,songs])=>{
      const matched=songs.filter(([name])=>name.toLowerCase().includes(f));
      if(matched.length||era.toLowerCase().includes(f))
        filtered[era]=matched.length?matched:songs;
    });
  } else {
    filtered=eraObj;
  }

  list.innerHTML='';
  if(Object.keys(filtered).length===0){
    list.innerHTML='<div class="no-results">no results found</div>';
    return;
  }

  Object.entries(filtered).forEach(([era,songs])=>{
    const wrap=document.createElement('div');
    wrap.className='era-wrap';

    const row=document.createElement('div');
    row.className='era-row';
    row.innerHTML=`
      <div class="era-row-name">${era}</div>
      <div class="era-row-right">
        <div class="era-pill">${songs.length} ${currentLabel}</div>
        <svg class="era-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>
      </div>`;

    const panel=document.createElement('div');
    panel.className='songs-panel';
    const inner=document.createElement('div');
    inner.className='songs-inner';

    row.onclick=()=>{
      const isOpen=panel.classList.contains('open');
      document.querySelectorAll('.songs-panel.open').forEach(p=>{
        p.classList.remove('open');
        p.closest('.era-wrap').querySelector('.era-row').classList.remove('active');
      });
      if(!isOpen){
        panel.classList.add('open');
        row.classList.add('active');
        if(!inner.dataset.loaded){
          inner.dataset.loaded='1';
          songs.forEach(([name,quality,length,url],i)=>{
            const el=document.createElement('div');
            el.className='song-item'+(url?'':' no-link');
            el.innerHTML=`
              <div class="song-num">${i+1}</div>
              <div class="song-name" title="${name.replace(/"/g,'&quot;')}">${name}</div>
              ${quality?`<div class="song-quality ${qClass(quality)}">${quality}</div>`:''}
              <div class="song-len">${length}</div>
              <div class="song-actions">
                ${url?`<button class="play-btn" title="Play preview" onclick="event.stopPropagation();playSong(${JSON.stringify(name)},${JSON.stringify(era)},${JSON.stringify(url)})"><svg viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9"/></svg></button>`:'<div class="play-btn" style="opacity:0.15"><svg viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9"/></svg></div>'}
                ${url?`<a class="ext-btn" href="${url}" target="_blank" rel="noopener noreferrer" title="Open in new tab" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`:''}
              </div>`;
            inner.appendChild(el);
          });
        }
        setTimeout(()=>row.scrollIntoView({behavior:'smooth',block:'nearest'}),50);
      }
    };

    panel.appendChild(inner);
    wrap.appendChild(row);
    wrap.appendChild(panel);
    list.appendChild(wrap);
  });
}

let searchTimer;
function onSearch(val){
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>renderEras(allData[currentTab],val),120);
}

loadData();
renderEras(allData['u']);

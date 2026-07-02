(async function(){
  // ================= PASSWORD GATE =================
  const CORRECT_HASH = "f6a6ede1db281475a3d12161f3630e225fb251ae0a21453a24520c3f00cb2d85";
  async function sha256(text){
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }
  const gate = document.getElementById('gate');
  const pwdInput = document.getElementById('pwd');
  const unlockBtn = document.getElementById('unlockBtn');
  const gateError = document.getElementById('gateError');

  async function tryUnlock(){
    const val = pwdInput.value.trim();
    if(!val) return;
    const hash = await sha256(val);
    if(hash === CORRECT_HASH){
      gate.classList.add('hidden');
      setTimeout(()=> gate.style.display='none', 650);
      document.getElementById('app').classList.add('visible');
      sessionStorage.setItem('gm_unlocked','1');
    } else {
      gateError.classList.add('show');
      pwdInput.value='';
      setTimeout(()=> gateError.classList.remove('show'), 1800);
    }
  }
  unlockBtn.addEventListener('click', tryUnlock);
  pwdInput.addEventListener('keydown', e=>{ if(e.key==='Enter') tryUnlock(); });
  if(sessionStorage.getItem('gm_unlocked')==='1'){
    gate.style.display='none';
    document.getElementById('app').classList.add('visible');
  }

  // ================= TIME =================
  function nowIST(){ return new Date(new Date().toLocaleString('en-US', {timeZone:'Asia/Kolkata'})); }
  const now = nowIST();
  const hour = now.getHours() + now.getMinutes()/60;
  const isNight = (hour < 5 || hour >= 19);
  const dayIdx = Math.floor((now - new Date(now.getFullYear(),0,0)) / 86400000);

  function fmtDate(d){ return d.toLocaleDateString('en-IN', {weekday:'long', year:'numeric', month:'long', day:'numeric'}); }
  function isoDate(d){ return d.toISOString().slice(0,10); }
  document.getElementById('dateLabel').textContent = fmtDate(now);

  // ================= WINDOW SKY =================
  const windowSky = document.getElementById('windowSky');
  const starsEl = document.getElementById('stars');
  const rainEl = document.getElementById('rain');
  const sunEl = document.getElementById('sun');

  function setSky(top, mid, bottom, sun, showStars, sunTop, sunOpacity){
    windowSky.style.setProperty('--sky-top', top);
    document.documentElement.style.setProperty('--sky-top', top);
    document.documentElement.style.setProperty('--sky-mid', mid);
    document.documentElement.style.setProperty('--sky-bottom', bottom);
    document.documentElement.style.setProperty('--sun-color', sun);
    starsEl.style.opacity = showStars ? '1' : '0';
    sunEl.style.top = sunTop + '%';
    sunEl.style.opacity = sunOpacity;
  }

  let base;
  if(hour >= 5 && hour < 8) base = {top:'#FCEEDD',mid:'#F6C9B8',bottom:'#F3E4DC',sun:'#E3A64B',stars:false,sunTop:50,sunOp:1};
  else if(hour >= 8 && hour < 16) base = {top:'#DCEBF2',mid:'#EAF1EE',bottom:'#FBF6F0',sun:'#F2C868',stars:false,sunTop:8,sunOp:1};
  else if(hour >= 16 && hour < 19) base = {top:'#E9D6E8',mid:'#F0B39B',bottom:'#F6E1D3',sun:'#E08A5B',stars:false,sunTop:44,sunOp:1};
  else base = {top:'#1D1730',mid:'#332944',bottom:'#4A314D',sun:'#F6ECE5',stars:true,sunTop:56,sunOp:1};

  setSky(base.top, base.mid, base.bottom, base.sun, base.stars, base.sunTop, base.sunOp);
  if(base.stars){
    let html = '';
    for(let i=0;i<18;i++){
      const top = Math.random()*55, left = Math.random()*100, delay = (Math.random()*3).toFixed(2);
      html += `<div class="star" style="top:${top}%;left:${left}%;animation-delay:${delay}s;"></div>`;
    }
    starsEl.innerHTML = html;
  }

  function addClouds(count){
    for(let i=0;i<count;i++){
      const c = document.createElement('div');
      c.className='cloud';
      const w = 20 + Math.random()*18, h = w*0.35;
      const top = 10 + Math.random()*25;
      const dur = 10 + Math.random()*8;
      const delay = -Math.random()*10;
      c.style.cssText = `width:${w}px;height:${h}px;top:${top}%;animation-duration:${dur}s;animation-delay:${delay}s;`;
      windowSky.appendChild(c);
    }
  }
  function addRain(){
    let html = '';
    for(let i=0;i<22;i++){
      const left = Math.random()*100;
      const dur = (0.5 + Math.random()*0.4).toFixed(2);
      const delay = (Math.random()*1.5).toFixed(2);
      html += `<div class="drop" style="left:${left}%;animation-duration:${dur}s;animation-delay:${delay}s;"></div>`;
    }
    rainEl.innerHTML = html;
    rainEl.style.opacity = '1';
  }
  if(!isNight) addClouds(2);

  // ================= WEATHER =================
  const weatherNote = document.getElementById('weatherNote');

  function weatherPhrase(code, tmax){
    const hot = tmax >= 33;
    const isRainy = [51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code);
    const isStorm = [95,96,99].includes(code);
    const isFog = [45,48].includes(code);
    const isCloudy = [1,2,3].includes(code);

    const clearPhrases = ["Clear skies today - enjoy the sunshine! ♥️☀️", "Bright and clear today! ♥️☀️", "Sunny all day today! ♥️☀️"];
    const cloudyPhrases = ["Cloudy skies today - nice and mellow! ♥️☁️", "Overcast today, stays cool at least! ♥️☁️", "Grey skies today but should stay dry! ♥️☁️"];
    const rainPhrases = ["It's a rainy day - carry your umbrella with you! ♥️☔", "Showers expected today - umbrella, don't forget! ♥️☔", "Rain's likely today - keep that umbrella handy! ♥️☔"];
    const stormPhrases = ["Thunderstorms today - stay safe and dry! ♥️⛈️", "Stormy today - better to stay indoors if you can! ♥️⛈️"];
    const fogPhrases = ["Foggy start today - take it slow out there! ♥️🌫️"];
    const hotPhrases = ["It'll be quite hot today, Niyu - please don't skip water just because you're busy! ♥️🥵"];

    let phrase;
    if(isStorm) phrase = stormPhrases[dayIdx % stormPhrases.length];
    else if(isRainy) phrase = rainPhrases[dayIdx % rainPhrases.length];
    else if(isFog) phrase = fogPhrases[dayIdx % fogPhrases.length];
    else if(hot) phrase = hotPhrases[dayIdx % hotPhrases.length];
    else if(isCloudy) phrase = cloudyPhrases[dayIdx % cloudyPhrases.length];
    else phrase = clearPhrases[dayIdx % clearPhrases.length];

    return "Niyu Weather Update: " + phrase;
  }

  try{
    const wRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=19.1953&longitude=73.1936&current=weather_code,temperature_2m&daily=weather_code,temperature_2m_max&timezone=Asia%2FKolkata');
    const wData = await wRes.json();
    const code = wData.current?.weather_code ?? wData.daily?.weather_code?.[0] ?? 0;
    const tmax = wData.daily?.temperature_2m_max?.[0] ?? 30;

    weatherNote.textContent = weatherPhrase(code, tmax);

    const rainy = [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code);
    const cloudy = [1,2,3,45,48].includes(code);

    if(rainy){
      if(isNight) setSky('#232840','#2E3450','#3E4658', base.sun, true, base.sunTop, 0);
      else setSky('#A8B5C6','#C7C4CB','#DAD1CC', base.sun, false, base.sunTop, 0);
      addRain();
    } else if(cloudy){
      if(!isNight){
        setSky('#CFD9E0','#E4DDD6','#F1EAE2', base.sun, false, base.sunTop, 0.55);
        addClouds(2);
      } else {
        setSky('#241F38','#3A2E44','#463B4E', base.sun, true, base.sunTop, 1);
      }
    }
  } catch(err){
    weatherNote.textContent = "Niyu Weather Update: couldn't check today, but here's a hug anyway ♥️";
  }

  // ================= PLANT GROWTH =================
  const plantSvg = document.getElementById('plantSvg');
  function renderPlant(stage){
    // stage 0: seedling, 1: small, 2: medium, 3: blooming
    const pots = `<path d="M18 54 L38 54 L35 62 L21 62 Z" fill="var(--wood-dark)"/>`;
    let leaves = '';
    if(stage===0){
      leaves = `<path d="M28 54 C28 44 28 40 28 36" stroke="#7C9473" stroke-width="3" fill="none" stroke-linecap="round"/>
                 <ellipse cx="28" cy="34" rx="5" ry="8" fill="#8FAE7E"/>`;
    } else if(stage===1){
      leaves = `<path d="M28 54 C28 40 28 34 28 26" stroke="#6E8B62" stroke-width="3" fill="none" stroke-linecap="round"/>
                 <ellipse cx="21" cy="34" rx="7" ry="10" fill="#8FAE7E" transform="rotate(-25 21 34)"/>
                 <ellipse cx="35" cy="38" rx="7" ry="10" fill="#8FAE7E" transform="rotate(25 35 38)"/>
                 <ellipse cx="28" cy="24" rx="6" ry="9" fill="#9DBB8B"/>`;
    } else if(stage===2){
      leaves = `<path d="M28 54 C28 38 28 30 28 18" stroke="#5F7D55" stroke-width="4" fill="none" stroke-linecap="round"/>
                 <ellipse cx="18" cy="36" rx="9" ry="12" fill="#7FA06F" transform="rotate(-30 18 36)"/>
                 <ellipse cx="38" cy="40" rx="9" ry="12" fill="#7FA06F" transform="rotate(30 38 40)"/>
                 <ellipse cx="20" cy="22" rx="8" ry="11" fill="#8FAE7E" transform="rotate(-15 20 22)"/>
                 <ellipse cx="36" cy="24" rx="8" ry="11" fill="#8FAE7E" transform="rotate(15 36 24)"/>
                 <ellipse cx="28" cy="14" rx="7" ry="10" fill="#9DBB8B"/>`;
    } else {
      leaves = `<path d="M28 54 C28 36 28 26 28 14" stroke="#5F7D55" stroke-width="4" fill="none" stroke-linecap="round"/>
                 <ellipse cx="16" cy="38" rx="9" ry="12" fill="#7FA06F" transform="rotate(-32 16 38)"/>
                 <ellipse cx="40" cy="42" rx="9" ry="12" fill="#7FA06F" transform="rotate(32 40 42)"/>
                 <ellipse cx="18" cy="22" rx="8" ry="11" fill="#8FAE7E" transform="rotate(-15 18 22)"/>
                 <ellipse cx="38" cy="26" rx="8" ry="11" fill="#8FAE7E" transform="rotate(15 38 26)"/>
                 <circle cx="28" cy="10" r="7" fill="var(--blush)"/>
                 <circle cx="19" cy="14" r="5" fill="var(--mauve)" opacity="0.85"/>
                 <circle cx="37" cy="14" r="5" fill="var(--mauve)" opacity="0.85"/>`;
    }
    plantSvg.innerHTML = `<svg viewBox="0 0 56 64" width="56" height="64">${leaves}${pots}</svg>`;
  }

  // ================= MODAL =================
  const overlay = document.getElementById('overlay');
  const modalCard = document.getElementById('modalCard');
  function openModal(html){
    modalCard.innerHTML = html;
    overlay.classList.add('show');
  }
  function closeModal(){
    overlay.classList.remove('show');
  }
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeModal(); });

  // ================= LOAD DATA =================
  let dayCount = 1;
  let noteEntry = null;
  let photoUrl = '';
  let photoCaption = '';

  try{
    const res = await fetch(window.SITE_DATA_URL + '?t=' + Date.now());
    const data = await res.json();

    if(data.startDate){
      dayCount = Math.floor((now - new Date(data.startDate)) / 86400000) + 1;
    }

    if(data.today && data.today.date === isoDate(now)){
      noteEntry = data.today;
    } else {
      const fb = data.fallbackNotes || [];
      if(fb.length) noteEntry = fb[dayIdx % fb.length];
    }

    if(data.today && data.today.date === isoDate(now) && data.today.photo){
      photoUrl = data.today.photo;
      photoCaption = data.today.photoCaption || '';
    }
  } catch(err){
    noteEntry = { message: "Good morning, Niyu. Just wanted you to see this first thing today.", signoff: "" };
  }

  // plant stage from day count
  let stage = 0;
  if(dayCount >= 30) stage = 3;
  else if(dayCount >= 16) stage = 2;
  else if(dayCount >= 6) stage = 1;
  renderPlant(stage);

  // frame photo
  const frameInner = document.getElementById('frameInner');
  if(photoUrl){
    frameInner.innerHTML = `<img src="${photoUrl}" alt="a photo of us">`;
  }

  // ================= INTERACTIONS =================

  // mug -> day tooltip + steam burst
  const mugBtn = document.getElementById('mugBtn');
  const dayTooltip = document.getElementById('dayTooltip');
  const steam = document.getElementById('steam');
  let tooltipTimer = null;
  mugBtn.addEventListener('click', ()=>{
    dayTooltip.textContent = 'day ' + dayCount + ' of good mornings';
    dayTooltip.classList.add('show');
    steam.style.animation = 'none';
    void steam.offsetWidth;
    steam.style.animation = '';
    clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(()=> dayTooltip.classList.remove('show'), 2600);
  });

  // jar -> shake + open note modal
  const jarBtn = document.getElementById('jarBtn');
  jarBtn.addEventListener('click', ()=>{
    jarBtn.classList.remove('shake');
    void jarBtn.offsetWidth;
    jarBtn.classList.add('shake');
    setTimeout(()=>{
      const msg = noteEntry ? (noteEntry.message || '') : "Good morning, Niyu.";
      const signoff = noteEntry ? (noteEntry.signoff || '') : '';
      openModal(`
        <button class="modal-close" onclick="document.getElementById('overlay').classList.remove('show')">✕</button>
        <div class="modal-message">${msg.replace(/</g,'&lt;')}</div>
        ${signoff ? `<div class="modal-signoff">${signoff.replace(/</g,'&lt;')}</div>` : ''}
      `);
    }, 380);
  });

  // frame -> open photo modal
  const frameBtn = document.getElementById('frameBtn');
  frameBtn.addEventListener('click', ()=>{
    if(!photoUrl){
      openModal(`
        <button class="modal-close" onclick="document.getElementById('overlay').classList.remove('show')">✕</button>
        <div class="modal-message">No photo today - just imagine my favourite one of us here.</div>
      `);
      return;
    }
    openModal(`
      <button class="modal-close" onclick="document.getElementById('overlay').classList.remove('show')">✕</button>
      <img class="modal-photo" src="${photoUrl}" alt="a photo of us">
      ${photoCaption ? `<div class="memory-title">${photoCaption.replace(/</g,'&lt;')}</div>` : ''}
    `);
  });

})();

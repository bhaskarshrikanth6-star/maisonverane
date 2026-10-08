/* =====================================================================
   MAISON VÉRANE · ui.js
   Extra motion features layered on the WebGL stage (js/main.js exposes
   window.MV). Everything here is progressive: if MV is missing, nothing runs.
   ===================================================================== */
(function(){
'use strict';
var MV = window.MV; if(!MV) return;
var N = MV.N, SC = MV.SC;
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
var root = document.documentElement;
function $(id){ return document.getElementById(id); }
function cl(x,a,b){ return Math.min(b,Math.max(a,x)); }
function pad(n){ return (n<10?'0':'')+n; }

var CHAPTERS = ['Overture','Calla','In detail','Tavola','The atelier','Form in orbit','Interlude','Aurum','Tresse','Seuil','Fronde','Maison Vérane'];

/* ---------------------------------------------------------------
   1. SPLIT TEXT: every caption title becomes words > letters so CSS
      can stagger them in when the scene arrives (class .in on .cap)
   --------------------------------------------------------------- */
(function splitTitles(){
  var idx = 0;
  Array.prototype.forEach.call(document.querySelectorAll('.cap h2'), function(h){
    var text = h.textContent; h.setAttribute('aria-label', text); idx = 0;
    h.innerHTML = text.split(' ').map(function(w){
      return '<span class="wd" aria-hidden="true">' + w.split('').map(function(ch){
        return '<span class="ch" style="--i:'+(idx++)+'">'+(ch==='&'?'&amp;':ch)+'</span>';
      }).join('') + '</span>';
    }).join(' ');
  });
})();

/* ---------------------------------------------------------------
   2. HUD: rolling scene counter, chapter name, progress hairline
   --------------------------------------------------------------- */
var roll = $('roll'), hudName = $('hudName'), progBar = $('progBar');
(function buildRoll(){
  roll.innerHTML = '';
  for(var i=0;i<N;i++){ var s = document.createElement('span'); s.textContent = pad(i+1); roll.appendChild(s); }
})();
function setScene(i){
  roll.style.transform = 'translateY(' + (-i*1.5) + 'em)';
  hudName.textContent = CHAPTERS[i];
  hudName.classList.remove('sw'); void hudName.offsetWidth; hudName.classList.add('sw');
  Array.prototype.forEach.call($('menuList').querySelectorAll('button'), function(b,k){ b.classList.toggle('cur', k===i); });
}
MV.on('scene', setScene);
setScene(0);

/* ---------------------------------------------------------------
   3. CHAPTERS MENU: circular reveal, staggered list, jump to scene
   --------------------------------------------------------------- */
var menuOpen = false, menu = $('menu'), menuBtn = $('menuBtn');
(function buildMenu(){
  var ol = $('menuList');
  CHAPTERS.forEach(function(name,i){
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.style.setProperty('--i', i); b.tabIndex = -1;
    b.innerHTML = '<span class="n">'+pad(i+1)+'</span><span>'+name+'</span>';
    b.addEventListener('click', function(){ setMenu(false); MV.goTo(i); });
    li.appendChild(b); ol.appendChild(li);
  });
})();
function setMenu(on){
  if(on === menuOpen) return;
  if(on && MV.panelOpen) MV.closePanel();
  menuOpen = on;
  root.classList.toggle('menu-open', on);
  menuBtn.setAttribute('aria-expanded', on?'true':'false');
  menu.setAttribute('aria-hidden', on?'false':'true');
  Array.prototype.forEach.call(menu.querySelectorAll('button'), function(b){ b.tabIndex = on ? 0 : -1; });
  if(MV.lenis){ on ? MV.lenis.stop() : MV.lenis.start(); }
  root.style.overflow = on ? 'hidden' : '';
  if(on){ stopTour(); setTimeout(function(){ var c = menu.querySelector('button.cur') || menu.querySelector('button'); if(c) c.focus({preventScroll:true}); }, 900); }
  else menuBtn.focus({preventScroll:true});
}
menuBtn.addEventListener('click', function(){ setMenu(!menuOpen); });

/* ---------------------------------------------------------------
   4. GUIDED TOUR: auto-advances through the scenes until you touch
      the wheel, keys, screen or any button
   --------------------------------------------------------------- */
var tour = {on:false, t:null};
var tourMini = $('tourMini'), tourLbl = $('tourLbl'), tourBtn = $('tourBtn');
function tourStep(){
  var next = Math.round(MV.p) + 1;
  if(next >= N){ stopTour(); return; }
  MV.goTo(next);
}
function startTour(){
  if(tour.on) return;
  tour.on = true; tourMini.classList.add('on'); tourLbl.textContent = 'Pause'; tourBtn.textContent = 'Pause the tour';
  if(menuOpen) setMenu(false);
  if(MV.p > N-1.5) MV.goTo(0);
  tour.t = setInterval(tourStep, 6200);
  setTimeout(function(){ if(tour.on) tourStep(); }, MV.p > N-1.5 ? 2600 : 700);
}
function stopTour(){
  if(!tour.on) return;
  tour.on = false; clearInterval(tour.t); tourMini.classList.remove('on'); tourLbl.textContent = 'Tour'; tourBtn.textContent = 'Begin the guided tour';
}
tourMini.addEventListener('click', function(){ tour.on ? stopTour() : startTour(); });
tourBtn.addEventListener('click', function(){ tour.on ? stopTour() : startTour(); });
['wheel','touchstart'].forEach(function(ev){ window.addEventListener(ev, function(){ stopTour(); }, {passive:true}); });
MV.on('open', stopTour);

/* ---------------------------------------------------------------
   5. KEYBOARD: arrows / page keys / space move scene by scene
   --------------------------------------------------------------- */
var kbTarget = null;
window.addEventListener('keydown', function(e){
  var tag = (e.target && e.target.tagName) || '';
  if(e.metaKey || e.ctrlKey || e.altKey || tag==='INPUT' || tag==='TEXTAREA') return;
  var k = e.key;
  if(k==='m' || k==='M'){ setMenu(!menuOpen); return; }
  if(k==='Escape' && menuOpen){ setMenu(false); return; }
  if(MV.panelOpen || menuOpen) return;
  var dir = 0;
  if(k==='ArrowDown' || k==='PageDown' || (k===' ' && tag!=='BUTTON' && tag!=='A')) dir = 1;
  else if(k==='ArrowUp' || k==='PageUp') dir = -1;
  else if(k==='Home'){ e.preventDefault(); stopTour(); kbTarget = 0; MV.goTo(0); return; }
  else if(k==='End'){ e.preventDefault(); stopTour(); kbTarget = N-1; MV.goTo(N-1); return; }
  if(!dir) return;
  e.preventDefault(); stopTour();
  var base = (kbTarget!==null && Math.abs(MV.p-kbTarget) > .05) ? kbTarget : Math.round(MV.p);
  kbTarget = cl(base+dir, 0, N-1); MV.goTo(kbTarget);
});

/* ---------------------------------------------------------------
   6. CUSTOM CURSOR: ring follows with inertia, grows on links and
      shows "View" over a watch or ring
   --------------------------------------------------------------- */
var cur = $('cur'), cdot = $('cdot'), curLbl = $('curLbl');
var mx = -100, my = -100, rx = -100, ry = -100, hasCur = false, overLink = false;
function moveCursor(e){
  if(e.pointerType && e.pointerType !== 'mouse') return;
  mx = e.clientX; my = e.clientY;
  if(!hasCur){ hasCur = true; rx = mx; ry = my; root.classList.add('has-cur'); }
  var t = e.target; overLink = !!(t && t.closest && t.closest('a,button,[data-cursor],.rail'));
}
if(!coarse){
  window.addEventListener('pointermove', moveCursor, {passive:true});
  window.addEventListener('pointerdown', function(){ cur.classList.add('down'); });
  window.addEventListener('pointerup', function(){ cur.classList.remove('down'); });
  document.addEventListener('pointerleave', function(){ root.classList.remove('has-cur'); hasCur = false; });
}

/* ---------------------------------------------------------------
   7. SPARKLE TRAIL: tiny four-point gold stars follow the pointer
   --------------------------------------------------------------- */
var tc = $('trail'), tx = tc.getContext('2d'), stars = [], tw = 0, th = 0, lastX = null, lastY = null;
function sizeTrail(){ var d = Math.min(2, window.devicePixelRatio||1); tw = innerWidth; th = innerHeight; tc.width = tw*d; tc.height = th*d; tx.setTransform(d,0,0,d,0,0); }
sizeTrail(); window.addEventListener('resize', sizeTrail);
function spark(x,y){
  stars.push({x:x+(Math.random()-.5)*8, y:y+(Math.random()-.5)*8, vx:(Math.random()-.5)*.8, vy:Math.random()*.7+.15, life:1, d:.016+Math.random()*.02, s:2.5+Math.random()*4.5, r:Math.random()*3});
  if(stars.length > 70) stars.shift();
}
if(!coarse && !reduce){
  window.addEventListener('pointermove', function(e){
    if(e.pointerType && e.pointerType !== 'mouse') return;
    if(lastX!==null){ var d = Math.hypot(e.clientX-lastX, e.clientY-lastY); if(d > 14){ spark(e.clientX,e.clientY); lastX = e.clientX; lastY = e.clientY; } }
    else { lastX = e.clientX; lastY = e.clientY; }
  }, {passive:true});
}
function star(x,y,s,r,a){
  tx.save(); tx.translate(x,y); tx.rotate(r); tx.globalAlpha = a; tx.fillStyle = '#e8c36a'; tx.shadowColor = 'rgba(255,214,120,.9)'; tx.shadowBlur = 8;
  tx.beginPath(); tx.moveTo(0,-s); tx.quadraticCurveTo(0,0,s,0); tx.quadraticCurveTo(0,0,0,s); tx.quadraticCurveTo(0,0,-s,0); tx.quadraticCurveTo(0,0,0,-s); tx.fill(); tx.restore();
}

/* ---------------------------------------------------------------
   8. MAGNETIC BUTTONS: controls lean toward the pointer when near
   --------------------------------------------------------------- */
var mags = Array.prototype.slice.call(document.querySelectorAll('.btn,.snd,.menu,.tourmini,.save,.brand'));
function magnet(e){
  if(coarse || reduce) return;
  mags.forEach(function(el){
    var cap = el.closest('.cap'); if(cap && cap.style.visibility==='hidden') return;
    var r = el.getBoundingClientRect(); if(!r.width) return;
    var cx = r.left+r.width/2, cy = r.top+r.height/2, dx = e.clientX-cx, dy = e.clientY-cy, d = Math.hypot(dx,dy), R = Math.max(r.width,r.height)*.9+30;
    if(d < R){ el.style.transition = 'transform .15s ease-out'; el.style.transform = 'translate('+(dx*.22).toFixed(1)+'px,'+(dy*.28).toFixed(1)+'px)'; el.__m = true; }
    else if(el.__m){ el.style.transition = 'transform .7s cubic-bezier(.2,1.6,.4,1)'; el.style.transform = ''; el.__m = false; }
  });
}
window.addEventListener('pointermove', magnet, {passive:true});

/* ---------------------------------------------------------------
   9. PRODUCT PANEL EXTRAS: 3D tilt on the swatch, save to wishlist
   --------------------------------------------------------------- */
var psw = $('psw'), panel = $('panel');
panel.addEventListener('pointermove', function(e){
  if(reduce) return;
  var r = psw.getBoundingClientRect(), x = (e.clientX-r.left)/r.width, y = (e.clientY-r.top)/r.height;
  var inside = x>-.2 && x<1.2 && y>-.3 && y<1.3;
  if(!inside){ psw.style.transform = ''; return; }
  psw.style.transform = 'rotateY('+((x-.5)*16).toFixed(1)+'deg) rotateX('+((.5-y)*12).toFixed(1)+'deg)';
  psw.style.setProperty('--mx', (x*100)+'%'); psw.style.setProperty('--my', (y*100)+'%');
});
panel.addEventListener('pointerleave', function(){ psw.style.transform = ''; });

var saved = [], save = $('psave'), wish = $('wish'), wn = $('wn');
try{ saved = JSON.parse(localStorage.getItem('mv-saved')||'[]'); if(!Array.isArray(saved)) saved = []; }catch(e){ saved = []; }
function persist(){ try{ localStorage.setItem('mv-saved', JSON.stringify(saved)); }catch(e){} }
function renderWish(bump){
  wn.textContent = saved.length; wish.classList.toggle('has', saved.length>0);
  wish.title = saved.length ? 'Saved: '+saved.map(function(id){ return MV.PRODUCTS[id].n; }).join(', ') : 'Saved pieces';
  if(bump){ wish.classList.remove('bump'); void wish.offsetWidth; wish.classList.add('bump'); }
}
function syncSave(id){ var on = saved.indexOf(id) > -1; save.setAttribute('aria-pressed', on?'true':'false'); save.setAttribute('aria-label', on?'Remove from saved':'Save this piece'); }
MV.on('open', syncSave);
save.addEventListener('click', function(){
  var id = MV.product; if(!id) return;
  var i = saved.indexOf(id); if(i>-1) saved.splice(i,1); else saved.push(id);
  persist(); syncSave(id); renderWish(true);
  save.classList.remove('pop'); void save.offsetWidth; save.classList.add('pop');
});
renderWish(false);

/* ---------------------------------------------------------------
   10. ONE LOOP drives cursor inertia, trail stars and the progress bar
   --------------------------------------------------------------- */
var wasView = false;
function loop(){
  /* progress hairline */
  progBar.style.transform = 'scaleX(' + (MV.p/(N-1)).toFixed(4) + ')';
  /* cursor */
  if(hasCur){
    rx += (mx-rx)*.16; ry += (my-ry)*.16;
    cur.style.transform = 'translate('+rx.toFixed(1)+'px,'+ry.toFixed(1)+'px)' + (cur.classList.contains('down')?' scale(.8)':'');
    cdot.style.transform = 'translate('+mx+'px,'+my+'px)';
    var over = MV.hovering && !MV.panelOpen && !menuOpen;
    cur.classList.toggle('view', !!over);
    cur.classList.toggle('link', !over && overLink);
    if(over !== wasView){ wasView = over; curLbl.textContent = over ? 'View' : ''; }
  }
  /* stars */
  if(stars.length){
    tx.clearRect(0,0,tw,th);
    for(var i=stars.length-1;i>=0;i--){
      var s = stars[i]; s.x += s.vx; s.y += s.vy; s.vy += .018; s.life -= s.d; s.r += .02;
      if(s.life <= 0){ stars.splice(i,1); continue; }
      star(s.x, s.y, s.s*s.life, s.r, Math.min(1,s.life*1.4));
    }
    if(!stars.length) tx.clearRect(0,0,tw,th);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

})();

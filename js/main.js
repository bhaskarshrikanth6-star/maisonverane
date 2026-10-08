(function(){
'use strict';
/* ============================================================
   0. CONFIG: the twelve scenes (copy, colours, camera, product)
   ============================================================ */
var N = 12, GAP = 140;
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;

/* world = which 3D set each scene lives in (scenes 2 and 3 share one world) */
var WORLD = [0,1,1,2,3,4,5,6,7,8,9,10];
var NW = 11;

var SC = [
 {k:'Maison Vérane presents', h:'Hours & Marvels', s:'An exhibition of watchmaking and high jewellery', pos:'mid big', bg:'#e9dcc6', ink:'#3b2a1b', hold:'first'},
 {k:'Haute Joaillerie', h:'Calla', s:'Brilliant-cut diamonds and four cabochon rubies, set by hand', pos:'low', bg:'#c3993f', ink:'#2a1a0a', prod:'calla'},
 {k:'In detail', h:'412 stones', s:'Each one placed beneath the loupe', pos:'low', bg:'#b48a35', ink:'#22150a', prod:'calla'},
 {k:'The rectangle', h:'Tavola', s:'A case drawn with a ruler and an hour kept to the second', pos:'low', bg:'#dcc08a', ink:'#2e1d0e', prod:'tavola'},
 {k:'Architecture of time', h:'Tavola Atelier', s:'Gold held in warm light', pos:'low', bg:'#5c2419', ink:'#f7e8cf', prod:'tavola'},
 {k:'Tavola Noir', h:'Form in orbit', s:'Steel, black calf and a few quiet geometries', pos:'low', bg:'#f5f3ef', ink:'#1b1511', prod:'noir'},
 {k:'', h:'Tavola, à toute heure', s:'', pos:'mid', bg:'#ebdfcc', ink:'#3b2a1b', mark:true},
 {k:'Montre Joaillière', h:'Aurum', s:'A single stone, caught in the dark', pos:'low', bg:'#0b0806', ink:'#f3e1bf', prod:'aurum'},
 {k:'Savoir-faire', h:'Tresse', s:'Three strands of gold, woven without a seam', pos:'low', bg:'#efe6d6', ink:'#3b2a1b', prod:'tresse'},
 {k:'The threshold', h:'Seuil', s:'Two rings, one doorway', pos:'low', bg:'#dcc29b', ink:'#3b2a1b', prod:'seuil'},
 {k:'Les Clés', h:'Fronde', s:'A green dial among the branches', pos:'low', bg:'#c9d1b8', ink:'#26301f', prod:'fronde'},
 {k:'', h:'Maison Vérane', s:'Hours & Marvels', pos:'mid big', bg:'#e8cdaa', ink:'#3b2a1b', mark:true, hold:'last'}
];

/* camera keys, local to the scene's world: [position], [look-at] */
var CAM = [
 [[0,.8,15.5],[0,.8,0]],
 [[0,.2,9.6],[0,.05,0]],
 [[.55,.35,3.5],[0,.3,0]],
 [[0,0,10.5],[0,0,0]],
 [[0,.2,9],[0,0,0]],
 [[0,0,10.5],[0,0,0]],
 [[0,0,10],[0,0,0]],
 [[0,.3,8.6],[0,0,0]],
 [[0,.3,9.4],[0,0,0]],
 [[0,.7,10.8],[0,.2,0]],
 [[0,.5,9.8],[0,-.2,0]],
 [[0,0,10],[0,0,0]]
];

var PRODUCTS = {
 calla:{n:'Calla',k:'Haute Joaillerie · 36 mm',sw:['#f4e7c4','#c3993f'],
  d:'A round watch set entirely with brilliant-cut diamonds and accented by four cabochon rubies. Bezel, dial and bracelet are paved by hand over 312 hours.',
  sp:[['Case','White gold, 36 mm'],['Setting','412 diamonds, 4 rubies'],['Strap','Pavé bracelet'],['Edition','Eight pieces']]},
 tavola:{n:'Tavola',k:'Watchmaking · 23 × 31 mm',sw:['#f7ecd2','#b8893e'],
  d:'A rectangle drawn with a ruler. Two straight brancards frame an ivory dial with a railway minute track and blued hands.',
  sp:[['Case','Yellow gold, 23 × 31 mm'],['Dial','Ivory, Roman numerals'],['Movement','Hand-wound, 38 h reserve'],['Crown','Sapphire cabochon']]},
 noir:{n:'Tavola Noir',k:'Watchmaking · Steel',sw:['#d9d6d0','#17120f'],
  d:'The Tavola in polished steel on a black calf strap. A quieter reading of the same rectangle.',
  sp:[['Case','Steel, 23 × 31 mm'],['Dial','Ivory, Roman numerals'],['Strap','Black alligator-grain calf'],['Water resistance','30 m']]},
 aurum:{n:'Aurum',k:'Montre Joaillière',sw:['#f3dba3','#241509'],
  d:'A solitaire cut from a single rough stone and mounted on a plain gold band, so the light has only one place to go.',
  sp:[['Metal','18 ct yellow gold'],['Stone','Solitaire, 3.02 ct, D / IF'],['Cut','Brilliant'],['Made','Paris atelier']]},
 tresse:{n:'Tresse',k:'High jewellery · Bracelet',sw:['#f6efe0','#c9a35a'],
  d:'Three strands of gold links woven in a continuous braid with no visible clasp. It moves like fabric and holds its shape like metal.',
  sp:[['Metal','18 ct champagne gold'],['Links','1,104, individually joined'],['Width','18 mm'],['Weight','74 g']]},
 seuil:{n:'Seuil',k:'High jewellery · Duo of rings',sw:['#f2dfbd','#a8793a'],
  d:'Two rings made to be worn together or apart. One is a plain gold band, the other is paved with diamonds along its full length.',
  sp:[['Metal','18 ct yellow and white gold'],['Stones','96 brilliant-cut diamonds'],['Sizes','46 – 62'],['Finish','Satin and polished']]},
 fronde:{n:'Fronde',k:'Watchmaking · Green dial',sw:['#d6e0c6','#2f5a3a'],
  d:'A round watch with a sunburst green dial, finished by hand so the colour shifts from moss to emerald as the wrist turns.',
  sp:[['Case','Yellow gold, 34 mm'],['Dial','Sunburst green lacquer'],['Strap','Green calf'],['Movement','Automatic, 55 h reserve']]}
};

/* ============================================================
   1. small helpers
   ============================================================ */
function cl(x,a,b){return Math.min(b===undefined?1:b,Math.max(a===undefined?0:a,x));}
function lerp(a,b,t){return a+(b-a)*t;}
function sm(x){x=cl(x);return x*x*(3-2*x);}
function ent(q,a,b){return sm((q-a)/(b-a));}
function easeOutBack(x){var c1=1.4,c3=c1+1;x=cl(x);return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);}
function rnd(a,b){return a+Math.random()*(b-a);}
function $(id){return document.getElementById(id);}
function hexToRgb(h){h=h.replace('#','');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function mixHex(a,b,t){var x=hexToRgb(a),y=hexToRgb(b);return 'rgb('+Math.round(lerp(x[0],y[0],t))+','+Math.round(lerp(x[1],y[1],t))+','+Math.round(lerp(x[2],y[2],t))+')';}

/* ============================================================
   2. DOM build: captions and rail
   ============================================================ */
var MARK_SVG = '<svg class="mark" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><circle cx="40" cy="40" r="37"/><circle cx="40" cy="40" r="31" opacity=".5"/><path d="M22 24h12l6 30 6-30h12" stroke-linejoin="round"/><path d="M28 60h24" opacity=".6"/></svg>';
var capsEl = $('caps'), railEl = $('rail'), caps = [], railBtns = [];
SC.forEach(function(s,i){
  var a = document.createElement('article');
  a.className = 'cap '+s.pos; a.setAttribute('aria-label', s.h);
  var html = '';
  if(s.mark) html += MARK_SVG.replace('class="mark"', 'class="mark'+(i===N-1?'':' sm')+'"');
  if(s.k) html += '<p class="k">'+s.k+'</p>';
  html += '<h2>'+s.h.replace('&','&amp;')+'</h2>';
  if(s.s) html += '<p>'+s.s+'</p>';
  if(s.prod) html += '<button class="btn" type="button" data-p="'+s.prod+'">View the piece</button>';
  a.innerHTML = html; capsEl.appendChild(a); caps.push(a);
  var b = document.createElement('button'); b.type='button'; b.setAttribute('aria-label','Scene '+(i+1)+': '+s.h);
  b.addEventListener('click', function(){ goTo(i); }); railEl.appendChild(b); railBtns.push(b);
});
capsEl.addEventListener('click', function(e){
  var t = e.target.closest && e.target.closest('[data-p]'); if(t) openPanel(t.getAttribute('data-p'));
});

/* ---- tiny event bus + public API used by js/ui.js ---- */
var hooks = {}, hoveredId = null, curProduct = null;
function emit(n,a){ (hooks[n]||[]).forEach(function(f){ try{ f(a); }catch(e){ console.error(e); } }); }
window.MV = {
  N:N, SC:SC, PRODUCTS:PRODUCTS,
  goTo:function(i){ goTo(i); },
  openPanel:function(id){ openPanel(id); },
  closePanel:function(){ closePanel(); },
  on:function(n,f){ (hooks[n]=hooks[n]||[]).push(f); },
  get p(){ return PS; }, get cur(){ return lastSceneIdx; },
  get hovering(){ return hoveredId; }, get panelOpen(){ return panelOpen; }, get product(){ return curProduct; },
  get lenis(){ return lenis; }, get unit(){ return scrollUnit; }
};

/* ============================================================
   3. renderer, camera, light rig
   ============================================================ */
if(!window.THREE){ $('lnum').textContent = 'Three.js failed to load'; return; }
var canvas = $('stage');
var renderer;
try{
  renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, powerPreference:'high-performance', alpha:false});
}catch(e){ $('loader').innerHTML = '<div class="w">Maison Vérane</div><div class="n" style="letter-spacing:.1em">WebGL is unavailable in this browser.</div>'; return; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, coarse?1.5:1.75));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

var scene = new THREE.Scene();
scene.background = new THREE.Color(SC[0].bg);
scene.fog = new THREE.Fog(SC[0].bg, 24, 52);
var camera = new THREE.PerspectiveCamera(40, 1, .1, 500);

var keyLight = new THREE.DirectionalLight(0xfff0d8, 1.25);
var rimLight = new THREE.PointLight(0xffd9a0, 1.1, 40, 2);
var hemi = new THREE.HemisphereLight(0xfff3e0, 0x6b4a2a, .45);
var keyTarget = new THREE.Object3D();
keyLight.target = keyTarget;
scene.add(keyLight, keyTarget, rimLight, hemi);

/* procedural environment so gold, steel and stones have something to reflect */
var pmrem = new THREE.PMREMGenerator(renderer);
function buildEnv(){
  var es = new THREE.Scene();
  var c = document.createElement('canvas'); c.width = 4; c.height = 256;
  var g = c.getContext('2d'), gr = g.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,'#fff4de'); gr.addColorStop(.45,'#cdb083'); gr.addColorStop(.7,'#8a6a42'); gr.addColorStop(1,'#3a2a1a');
  g.fillStyle = gr; g.fillRect(0,0,4,256);
  var tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
  es.add(new THREE.Mesh(new THREE.SphereGeometry(60,32,16), new THREE.MeshBasicMaterial({map:tex, side:THREE.BackSide})));
  function box(w,h,x,y,z,col){
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({color:col, side:THREE.DoubleSide}));
    m.position.set(x,y,z); m.lookAt(0,0,0); es.add(m);
  }
  box(26,10,12,22,14,new THREE.Color(9,8.4,7.2));
  box(8,26,-26,6,6,new THREE.Color(5,4.6,4));
  box(6,20,24,2,-4,new THREE.Color(4,3.4,2.6));
  box(30,5,0,-4,-30,new THREE.Color(3,2.5,2));
  box(18,3,0,30,0,new THREE.Color(6,6,6));
  var t = pmrem.fromScene(es, .03).texture;
  return t;
}

/* ============================================================
   4. materials and textures
   ============================================================ */
var M = {};
function initMats(){
  scene.environment = buildEnv();
  M.gold   = new THREE.MeshStandardMaterial({color:0xe2b865, metalness:1, roughness:.2});
  M.champ  = new THREE.MeshStandardMaterial({color:0xe9d3a2, metalness:1, roughness:.28});
  M.rose   = new THREE.MeshStandardMaterial({color:0xe3b08c, metalness:1, roughness:.25});
  M.white  = new THREE.MeshStandardMaterial({color:0xeceae4, metalness:1, roughness:.14});
  M.steel  = new THREE.MeshStandardMaterial({color:0xd7d8da, metalness:1, roughness:.18});
  M.dark   = new THREE.MeshStandardMaterial({color:0x1b1613, metalness:.6, roughness:.35});
  M.black  = new THREE.MeshStandardMaterial({color:0x0f0d0c, metalness:0, roughness:.55});
  M.green  = new THREE.MeshStandardMaterial({color:0x2c4a33, metalness:0, roughness:.6});
  M.cream  = new THREE.MeshStandardMaterial({color:0xf0e4cf, metalness:0, roughness:.7});
  M.diamond= new THREE.MeshStandardMaterial({color:0xffffff, metalness:.15, roughness:0, envMapIntensity:3.2, flatShading:true});
  M.ruby   = new THREE.MeshStandardMaterial({color:0xb5001f, metalness:.2, roughness:.04, emissive:0x40000a, envMapIntensity:2.2, flatShading:true});
  M.crystal= new THREE.MeshPhysicalMaterial({color:0xffffff, metalness:0, roughness:0, transparent:true, opacity:.14, envMapIntensity:2.5, clearcoat:1});
}

function radialTex(stops, size){
  size = size||256;
  var c = document.createElement('canvas'); c.width = c.height = size;
  var g = c.getContext('2d'), r = g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  stops.forEach(function(s){ r.addColorStop(s[0], s[1]); });
  g.fillStyle = r; g.fillRect(0,0,size,size);
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}
function vertTex(stops){
  var c = document.createElement('canvas'); c.width = 4; c.height = 256;
  var g = c.getContext('2d'), r = g.createLinearGradient(0,0,0,256);
  stops.forEach(function(s){ r.addColorStop(s[0], s[1]); });
  g.fillStyle = r; g.fillRect(0,0,4,256);
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}

/* watch dials are painted on canvas; hands are real meshes so they can move */
function dialTexture(kind, w, h){
  var c = document.createElement('canvas'); c.width = w; c.height = h;
  var g = c.getContext('2d'), cx = w/2, cy = h/2;
  if(kind==='pave'){
    var gr = g.createRadialGradient(cx,cy*0.8,10,cx,cy,w/2);
    gr.addColorStop(0,'#fffdf7'); gr.addColorStop(1,'#cfc6b4'); g.fillStyle = gr; g.fillRect(0,0,w,h);
    for(var i=0;i<900;i++){
      var a = Math.random()*Math.PI*2, r = Math.sqrt(Math.random())*w*.5, x = cx+Math.cos(a)*r, y = cy+Math.sin(a)*r;
      g.fillStyle = Math.random()<.5 ? 'rgba(255,255,255,.95)' : 'rgba(150,140,125,.55)';
      g.beginPath(); g.arc(x,y,2+Math.random()*3,0,7); g.fill();
    }
  } else if(kind==='green'){
    var gg = g.createRadialGradient(cx,cy,10,cx,cy,w/2);
    gg.addColorStop(0,'#5f9468'); gg.addColorStop(.6,'#2f6140'); gg.addColorStop(1,'#173a26'); g.fillStyle = gg; g.fillRect(0,0,w,h);
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1;
    for(var k=0;k<180;k++){ var an = k/180*Math.PI*2; g.beginPath(); g.moveTo(cx,cy); g.lineTo(cx+Math.cos(an)*w, cy+Math.sin(an)*w); g.stroke(); }
    g.fillStyle = '#e7c982';
    for(var n=0;n<12;n++){ var a2 = n/12*Math.PI*2; g.save(); g.translate(cx+Math.sin(a2)*w*.4, cy-Math.cos(a2)*w*.4); g.rotate(a2); g.fillRect(-4,-(n%3===0?20:12),8,n%3===0?40:24); g.restore(); }
  } else if(kind==='roman'){
    g.fillStyle = '#f6efde'; g.fillRect(0,0,w,h);
    var vg = g.createLinearGradient(0,0,w,h); vg.addColorStop(0,'rgba(255,255,255,.5)'); vg.addColorStop(1,'rgba(160,140,100,.25)'); g.fillStyle = vg; g.fillRect(0,0,w,h);
    var m = w*.07; g.strokeStyle = '#2a2622'; g.lineWidth = 3; g.strokeRect(m,m,w-2*m,h-2*m);
    var m2 = w*.2; g.lineWidth = 2; g.strokeRect(m2,m2*h/w,w-2*m2,h-2*m2*h/w);
    g.lineWidth = 2;
    for(var t=0;t<60;t++){
      var ang = t/60*Math.PI*2, s = Math.sin(ang), co = -Math.cos(ang);
      var sc = Math.min((w/2-m)/Math.max(Math.abs(s),1e-3),(h/2-m)/Math.max(Math.abs(co),1e-3));
      var len = t%5===0?0:16; if(t%5===0) continue;
      g.beginPath(); g.moveTo(cx+s*sc, cy+co*sc); g.lineTo(cx+s*(sc-len), cy+co*(sc-len)); g.stroke();
    }
    var rom = ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
    g.fillStyle = '#1e1b19'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '500 '+(w*.095)+'px "Cormorant Garamond",Georgia,serif';
    rom.forEach(function(r,idx){
      var an = idx/12*Math.PI*2, s2 = Math.sin(an), c2 = -Math.cos(an);
      var sc2 = Math.min((w/2-m2*1.15)/Math.max(Math.abs(s2),1e-3),(h/2-m2*1.15*h/w)/Math.max(Math.abs(c2),1e-3));
      g.fillText(r, cx+s2*sc2, cy+c2*sc2);
    });
  } else { /* black */
    g.fillStyle = '#121010'; g.fillRect(0,0,w,h);
  }
  var tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 8; return tx;
}

/* ============================================================
   5. geometry builders: watches, jewellery, ribbons, branches
   ============================================================ */
var watches = [];     /* every watch registers its hands here */

function rrShape(w,h,r){
  var s = new THREE.Shape(), x=-w/2, y=-h/2, P=Math.PI;
  s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.absarc(x+w-r,y+r,r,-P/2,0,false);
  s.lineTo(x+w,y+h-r); s.absarc(x+w-r,y+h-r,r,0,P/2,false);
  s.lineTo(x+r,y+h); s.absarc(x+r,y+h-r,r,P/2,P,false);
  s.lineTo(x,y+r); s.absarc(x+r,y+r,r,P,P*1.5,false);
  return s;
}

/* a gem ring: instanced faceted stones around a circle (z facing viewer) */
function gemRing(mat, count, radius, size, z, rubyEvery){
  var gm = new THREE.IcosahedronGeometry(1,0);
  var im = new THREE.InstancedMesh(gm, mat, count), d = new THREE.Object3D();
  for(var i=0;i<count;i++){
    var a = i/count*Math.PI*2;
    d.position.set(Math.cos(a)*radius, Math.sin(a)*radius, z); d.scale.set(size,size,size*.7); d.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3)); d.updateMatrix(); im.setMatrixAt(i,d.matrix);
  }
  return im;
}

/* strap built from boxes along a curve (gold links or leather) */
function strapSide(group, dir, o){
  var pts = [], segs = o.segs||20, i;
  for(i=0;i<=segs;i++){
    var s = i/segs;
    pts.push(new THREE.Vector3(0, dir*(o.start + s*o.len), -Math.pow(s,1.55)*o.curl));
  }
  var cols = o.cols||1, gap = o.colGap||0, cw = (o.width - gap*(cols-1))/cols;
  var gems = o.gems ? [] : null;
  for(i=0;i<segs;i++){
    var a = pts[i], b = pts[i+1], mid = a.clone().add(b).multiplyScalar(.5), L = a.distanceTo(b);
    for(var c=0;c<cols;c++){
      var off = (c-(cols-1)/2)*(cw+gap);
      var thick = o.thick||.08;
      var m = new THREE.Mesh(new THREE.BoxGeometry(cw, thick, 1), o.mat);
      m.position.copy(mid); m.position.x = off; m.lookAt(new THREE.Vector3(off,b.y,b.z));
      var wob = (o.braid ? ((i+c)%2?1:-1)*.12 : 0);
      m.scale.z = L*(o.braid?.92:1.04); m.rotateZ(wob);
      group.add(m);
      if(gems){ gems.push(m.position.clone()); }
    }
    if(o.stitch && i%3===1){
      var st = new THREE.Mesh(new THREE.BoxGeometry(o.width*.86,.008,L*.09), M.cream);
      st.position.copy(mid); st.position.z += .0; st.lookAt(new THREE.Vector3(0,b.y,b.z)); st.translateY((o.thick||.08)/2+.002);
      group.add(st);
    }
  }
  if(gems){
    var inst = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0), M.diamond, gems.length*2), d = new THREE.Object3D(), k = 0;
    gems.forEach(function(p){
      [-1,1].forEach(function(sx){ d.position.set(p.x+sx*o.width*.22, p.y, p.z+(o.thick||.08)/2+.03); d.scale.setScalar(.055); d.rotation.set(rnd(0,3),rnd(0,3),0); d.updateMatrix(); inst.setMatrixAt(k++, d.matrix); });
    });
    group.add(inst);
  }
}

function makeHands(parent, z, len, mats){
  var hg = new THREE.Group(); hg.position.z = z;
  function hand(w,l,m){ var h = new THREE.Mesh(new THREE.BoxGeometry(w,l,.012), m); h.position.y = l*.42; var p = new THREE.Group(); p.add(h); hg.add(p); return p; }
  var hr = hand(.055,len*.55,mats[0]), mn = hand(.04,len*.82,mats[0]), sc = hand(.012,len*.9,mats[1]); sc.children[0].position.y = len*.3;
  var pin = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.04,24), mats[1]); pin.rotation.x = Math.PI/2; hg.add(pin);
  parent.add(hg); watches.push({hr:hr,mn:mn,sc:sc,phase:rnd(0,60)});
  hr.rotation.z = -1.0; mn.rotation.z = -0.8;
  return hg;
}

/* ROUND WATCH. o:{dial, gems, strap, caseMat} */
function roundWatch(o){
  var g = new THREE.Group(), cm = o.caseMat||M.gold;
  var body = new THREE.Mesh(new THREE.CylinderGeometry(1,1,.36,96), cm); body.rotation.x = Math.PI/2; g.add(body);
  var rim = new THREE.Mesh(new THREE.TorusGeometry(1,.035,16,96), cm); rim.position.z = .18; g.add(rim);
  var dr = o.gems ? .7 : .88;
  var bezel = new THREE.Mesh(new THREE.RingGeometry(dr-.02,.99,96), cm); bezel.position.z = .181; g.add(bezel);
  var dial = new THREE.Mesh(new THREE.CircleGeometry(dr,96), new THREE.MeshStandardMaterial({map:dialTexture(o.dial,512,512), roughness:.42, metalness:.25}));
  dial.position.z = .175; g.add(dial);
  var cry = new THREE.Mesh(new THREE.CircleGeometry(dr+.02,64), M.crystal); cry.position.z = .26; g.add(cry);
  if(o.gems){
    var r1 = gemRing(M.diamond, 56, .92, .052, .2); var r2 = gemRing(M.diamond, 44, .795, .046, .2);
    var r3 = gemRing(M.diamond, 64, 1.0, .042, .0);
    g.add(r1, r2, r3);
    /* four rubies at the cardinal points */
    for(var q=0;q<4;q++){
      var a = q*Math.PI/2, rb = new THREE.Mesh(new THREE.IcosahedronGeometry(.085,1), M.ruby);
      rb.position.set(Math.cos(a)*.855, Math.sin(a)*.855, .215); rb.scale.z = .7; g.add(rb);
    }
  }
  makeHands(g, .205, dr*.92, o.dial==='green' ? [M.gold, M.gold] : [M.steel, M.ruby]);
  var crown = new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.2,24), cm); crown.rotation.z = Math.PI/2; crown.position.x = 1.06; g.add(crown);
  var cab = new THREE.Mesh(new THREE.SphereGeometry(.07,24,16), o.gems?M.ruby:M.diamond); cab.position.x = 1.17; g.add(cab);
  /* lugs */
  [[.38,1],[-.38,1],[.38,-1],[-.38,-1]].forEach(function(l){ var lug = new THREE.Mesh(new THREE.BoxGeometry(.12,.22,.2), cm); lug.position.set(l[0],l[1]*1.0,-.02); g.add(lug); });
  if(o.strap==='bracelet'){
    var sm1 = o.gems ? M.white : M.gold;
    strapSide(g,1,{start:1.0,len:2.2,curl:1.6,width:.84,mat:sm1,cols:1,thick:.1,gems:o.gems,segs:20});
    strapSide(g,-1,{start:1.0,len:2.2,curl:1.6,width:.84,mat:sm1,cols:1,thick:.1,gems:o.gems,segs:20});
  } else if(o.strap==='leather'){
    strapSide(g,1,{start:1.0,len:2.3,curl:1.5,width:.78,mat:o.strapMat||M.green,thick:.07,segs:18,stitch:true});
    strapSide(g,-1,{start:1.0,len:2.3,curl:1.5,width:.78,mat:o.strapMat||M.green,thick:.07,segs:18,stitch:true});
  }
  return g;
}

/* TAVOLA: rectangular watch with brancards */
function tavolaWatch(o){
  var g = new THREE.Group(), cm = o.caseMat||M.gold;
  function bar(w,h,d,x,y){
    var s = rrShape(w,h,Math.min(w,h)*.22);
    var geo = new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:4,curveSegments:8});
    geo.translate(0,0,-d/2); var m = new THREE.Mesh(geo, cm); m.position.set(x,y,0); g.add(m); return m;
  }
  bar(.3,2.3,.34,-.62,0); bar(.3,2.3,.34,.62,0);
  bar(1.0,.17,.22,0,1.07); bar(1.0,.17,.22,0,-1.07);
  var dial = new THREE.Mesh(new THREE.PlaneGeometry(1.06,1.98), new THREE.MeshStandardMaterial({map:dialTexture(o.dial||'roman',512,960), roughness:.5, metalness:.15}));
  dial.position.z = .02; g.add(dial);
  var cry = new THREE.Mesh(new THREE.PlaneGeometry(1.06,1.98), M.crystal); cry.position.z = .16; g.add(cry);
  var blued = new THREE.MeshStandardMaterial({color:0x1f2f66, metalness:.8, roughness:.3});
  makeHands(g, .05, .72, [blued, blued]);
  var crown = new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.16,24), cm); crown.position.set(0,1.2,0); g.add(crown);
  var cab = new THREE.Mesh(new THREE.SphereGeometry(.085,24,16), new THREE.MeshStandardMaterial({color:0x2a4fc0, metalness:.1, roughness:.05, envMapIntensity:2})); cab.position.set(0,1.29,0); g.add(cab);
  var sm1 = o.strapMat||M.black;
  strapSide(g,1,{start:1.18,len:2.4,curl:1.5,width:.96,mat:sm1,thick:.07,segs:18,stitch:true});
  strapSide(g,-1,{start:1.18,len:2.4,curl:1.5,width:.96,mat:sm1,thick:.07,segs:18,stitch:true});
  return g;
}

/* ring: band + stone */
function ringObj(o){
  var g = new THREE.Group(), R = .55;
  var band = new THREE.Mesh(new THREE.TorusGeometry(R,o.tube||.09,24,96), o.mat||M.gold); g.add(band);
  if(o.pave){
    var n = 90, im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0), M.diamond, n), d = new THREE.Object3D();
    for(var i=0;i<n;i++){ var a = i/n*Math.PI*2; d.position.set(Math.cos(a)*(R+(o.tube||.09)*.82), Math.sin(a)*(R+(o.tube||.09)*.82), (i%2?1:-1)*.03); d.scale.setScalar(.034); d.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3)); d.updateMatrix(); im.setMatrixAt(i,d.matrix); }
    g.add(im);
  }
  if(o.stone){
    var st = new THREE.Mesh(new THREE.OctahedronGeometry(.2,1), M.diamond); st.scale.set(1,1,.85); st.position.set(0,R+.2,0); st.rotation.y = .4; g.add(st);
    for(var k=0;k<4;k++){ var pr = new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.17,8), o.mat||M.gold); var an = k*Math.PI/2+Math.PI/4; pr.position.set(Math.cos(an)*.13, R+.1, Math.sin(an)*.13); g.add(pr); }
  }
  return g;
}

/* ribbon strip along a parametric curve */
function ribbonGeo(fn, segs, width){
  var pos = [], idx = [], i;
  for(i=0;i<=segs;i++){
    var u = i/segs, p = fn(u), p2 = fn(Math.min(1,u+.002)), p0 = fn(Math.max(0,u-.002));
    var tan = p2.clone().sub(p0).normalize(), side = new THREE.Vector3(0,1,0).cross(tan);
    if(side.lengthSq()<1e-4) side.set(1,0,0); side.normalize();
    var tw = Math.sin(u*Math.PI*3)*.9; /* twist */
    var nrm = tan.clone().cross(side).normalize(); side.multiplyScalar(Math.cos(tw)).add(nrm.multiplyScalar(Math.sin(tw)));
    var w = width*(.5+.5*Math.sin(u*Math.PI)) + width*.15;
    var a = p.clone().add(side.clone().multiplyScalar(w)), b = p.clone().sub(side.clone().multiplyScalar(w));
    pos.push(a.x,a.y,a.z,b.x,b.y,b.z);
    if(i<segs){ var k = i*2; idx.push(k,k+1,k+2,k+1,k+3,k+2); }
  }
  var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
}

/* braided link bracelet (a ring of links, three strands) */
function braidBracelet(mat){
  var g = new THREE.Group(), n = 72, R = 1.35, lg = new THREE.BoxGeometry(.3,.1,.2);
  for(var s=0;s<3;s++){
    var im = new THREE.InstancedMesh(lg, mat, n), d = new THREE.Object3D();
    for(var i=0;i<n;i++){
      var a = i/n*Math.PI*2, off = (s-1)*.28 + Math.sin(a*6+s*2.1)*.07;
      d.position.set(Math.cos(a)*R, off, Math.sin(a)*R);
      d.rotation.set(0,-a,0); d.rotateZ((i%2?1:-1)*.5 + (s-1)*.1); d.scale.set(1,1,1.1);
      d.updateMatrix(); im.setMatrixAt(i,d.matrix);
    }
    g.add(im);
  }
  return g;
}

/* branches (scene 11): recursive tubes */
function branchGroup(mat){
  var g = new THREE.Group();
  function grow(start, dir, len, rad, depth){
    var pts = [start.clone()], p = start.clone(), d = dir.clone();
    for(var i=0;i<5;i++){
      d.add(new THREE.Vector3(rnd(-.35,.35), rnd(-.1,.3), rnd(-.35,.35))).normalize();
      p = p.clone().add(d.clone().multiplyScalar(len/5)); pts.push(p);
    }
    var curve = new THREE.CatmullRomCurve3(pts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, rad, 6, false), mat));
    if(depth>0){
      for(var k=0;k<2;k++){
        var t = rnd(.4,.9), b = curve.getPoint(t), tg = curve.getTangent(t);
        var nd = tg.clone().add(new THREE.Vector3(rnd(-.8,.8), rnd(-.1,.6), rnd(-.8,.8))).normalize();
        grow(b, nd, len*.62, rad*.6, depth-1);
      }
    }
  }
  return {group:g, grow:grow};
}

/* dust motes shared by many scenes */
var dotTex;
function dust(count, spread, color, size, op){
  if(!dotTex) dotTex = radialTex([[0,'rgba(255,255,255,1)'],[.4,'rgba(255,255,255,.4)'],[1,'rgba(255,255,255,0)']],64);
  var pos = new Float32Array(count*3);
  for(var i=0;i<count;i++){ pos[i*3]=rnd(-spread[0],spread[0]); pos[i*3+1]=rnd(-spread[1],spread[1]); pos[i*3+2]=rnd(-spread[2],spread[2]); }
  var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  var p = new THREE.Points(geo, new THREE.PointsMaterial({map:dotTex, color:color, size:size, transparent:true, opacity:op, depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true}));
  p.frustumCulled = false; return p;
}

/* ============================================================
   6. worlds: each returns {group, update(q,time)}
      q = scroll position relative to the world's first scene
   ============================================================ */
var pickables = [];  /* {holder, scene} */
function productHolder(obj, id, sceneIdx, hitR, hitSize){
  var h = new THREE.Group(); h.add(obj);
  var hit = new THREE.Mesh(hitSize?new THREE.BoxGeometry(hitSize[0],hitSize[1],hitSize[2]):new THREE.SphereGeometry(hitR||1.6,12,8), new THREE.MeshBasicMaterial({visible:false}));
  h.add(hit); h.userData.hover = 0; h.userData.hit = hit; pickables.push({holder:h, scene:[].concat(sceneIdx), id:id});
  return h;
}

function archWall(w,h,centers,half,depth,z,mat,floorY){
  var s = new THREE.Shape(); s.moveTo(-w/2,floorY); s.lineTo(w/2,floorY); s.lineTo(w/2,floorY+h); s.lineTo(-w/2,floorY+h); s.lineTo(-w/2,floorY);
  centers.forEach(function(cx){
    var p = new THREE.Path(), spring = floorY + h*.52;
    p.moveTo(cx-half,floorY); p.lineTo(cx-half,spring); p.absarc(cx,spring,half,Math.PI,0,true); p.lineTo(cx+half,floorY); p.lineTo(cx-half,floorY);
    s.holes.push(p);
  });
  var geo = new THREE.ExtrudeGeometry(s,{depth:depth,bevelEnabled:false,curveSegments:24});
  var m = new THREE.Mesh(geo, mat); m.position.z = z; return m;
}

/* ---- WORLD 0 · scene 1: the alcove ---- */
function worldAlcove(){
  var g = new THREE.Group(), beige = new THREE.MeshStandardMaterial({color:0xe3d2b4, roughness:.95, metalness:0});
  var beige2 = new THREE.MeshStandardMaterial({color:0xd6c1a0, roughness:.95, metalness:0});
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(120,80), new THREE.MeshStandardMaterial({color:0xdcc9a6, roughness:.6, metalness:.05}));
  floor.rotation.x = -Math.PI/2; floor.position.set(0,-3,-10); g.add(floor);
  var back = new THREE.Mesh(new THREE.CylinderGeometry(26,26,22,64,1,true), beige); back.material.side = THREE.BackSide; back.position.set(0,6,-4); g.add(back);
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(120,80), beige2); ceil.rotation.x = Math.PI/2; ceil.position.set(0,12,-10); g.add(ceil);
  g.add(archWall(19,11,[-5.2,0,5.2],1.85,.9,-4.9,beige,-3));
  var w2 = archWall(21,13,[-5.2,0,5.2],1.35,.9,-9.2,beige2,-3); g.add(w2);
  var glowTex = vertTex([[0,'#fff6e2'],[.55,'#f7e2b6'],[1,'#e6b86e']]);
  var gl = new THREE.Mesh(new THREE.PlaneGeometry(26,12), new THREE.MeshBasicMaterial({map:glowTex, fog:false})); gl.position.set(0,2.5,-12); g.add(gl);
  /* volumetric shafts */
  var beamTex = vertTex([[0,'rgba(255,240,205,0)'],[.25,'rgba(255,238,200,.5)'],[1,'rgba(255,225,170,0)']]);
  var beams = [];
  [-5.2,0,5.2].forEach(function(x,i){
    var b = new THREE.Mesh(new THREE.PlaneGeometry(2.6,13), new THREE.MeshBasicMaterial({map:beamTex, transparent:true, opacity:.55, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide}));
    b.position.set(x+1.4,2.3,-3.2); b.rotation.set(-.12,0,-.42); g.add(b); beams.push(b);
  });
  var d = dust(220,[11,6,8],0xfff0c8,.09,.55); d.position.set(0,2,-2); g.add(d);
  return {group:g, update:function(q,t){
    d.rotation.y = t*.02; d.position.y = 2+Math.sin(t*.2)*.2;
    beams.forEach(function(b,i){ b.material.opacity = .42+.16*Math.sin(t*.5+i*1.7); });
  }};
}

/* ---- WORLD 1 · scenes 2-3: Calla on the golden checker ---- */
function worldCalla(){
  var g = new THREE.Group();
  var cols = 5, rows = 15, cs = 1.06, count = cols*rows;
  var cubes = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({color:0xffffff, metalness:.95, roughness:.32}), count);
  var d = new THREE.Object3D(), tgt = [], c1 = new THREE.Color(0xe3b55c), c2 = new THREE.Color(0x9a6f26), i = 0;
  for(var y=0;y<rows;y++) for(var x=0;x<cols;x++){
    tgt.push({x:(x-(cols-1)/2)*cs, y:(y-(rows-1)/2)*cs, dl:Math.abs(y-(rows-1)/2)/rows*.9+Math.random()*.15, rx:rnd(-3,3), ry:rnd(-30,30), rz:rnd(2,14), r:rnd(-3,3)});
    cubes.setColorAt(i++, (x+y)%2 ? c1 : c2);
  }
  cubes.instanceColor.needsUpdate = true; cubes.position.z = -3.4; g.add(cubes);
  var back = new THREE.Mesh(new THREE.PlaneGeometry(90,60), new THREE.MeshStandardMaterial({color:0x8d6322, metalness:.8, roughness:.5})); back.position.z = -4.1; g.add(back);
    var w = roundWatch({dial:'pave', gems:true, strap:'bracelet', caseMat:M.white});
  var holder = productHolder(w,'calla',[1,2],1.7); g.add(holder);
  var halo = new THREE.Mesh(new THREE.CircleGeometry(4.2,64), new THREE.MeshBasicMaterial({map:radialTex([[0,'rgba(255,240,200,.55)'],[1,'rgba(255,240,200,0)']]), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
  halo.position.z = -1.2; g.add(halo);
  var sp = dust(120,[5,6,3],0xfff0cc,.07,.6); g.add(sp);
  return {group:g, holder:holder, update:function(q,t){
    var e = ent(q,-.5,.3);
    for(var k=0;k<count;k++){
      var T = tgt[k], ee = sm((e-T.dl*.7)/.35);
      d.position.set(T.x+T.rx*(1-ee), T.y+T.ry*(1-ee), T.rz*(1-ee));
      d.rotation.set(T.r*(1-ee),T.r*.7*(1-ee),0); d.scale.setScalar(cs*.97*(.2+.8*ee)); d.updateMatrix(); cubes.setMatrixAt(k,d.matrix);
    }
    cubes.instanceMatrix.needsUpdate = true;
    var we = ent(q,-.2,.35), ws = easeOutBack(we);
    w.scale.setScalar(Math.max(.001,1.22*ws)); w.position.set(0,.05+Math.sin(t*.9)*.07, lerp(-3,0,sm(we)));
    var close = ent(q,.55,1.0);
    w.rotation.y = Math.sin(t*.45)*.32 + close*-.5; w.rotation.x = Math.sin(t*.37)*.05 - close*.28; w.rotation.z = close*.2;
    halo.material.opacity = .6+.25*Math.sin(t*.8);
    sp.rotation.y = t*.03;
  }};
}

/* ---- WORLD 2 · scene 4: gold panels part to reveal Tavola ---- */
function worldPanels(){
  var g = new THREE.Group();
  var back = new THREE.Mesh(new THREE.PlaneGeometry(90,60), new THREE.MeshStandardMaterial({color:0xcfae72, metalness:.4, roughness:.7})); back.position.z = -8; g.add(back);
  var wt = vertTex([[0,'rgba(255,244,214,1)'],[1,'rgba(230,196,130,1)']]);
  var glow = new THREE.Mesh(new THREE.PlaneGeometry(26,16), new THREE.MeshBasicMaterial({map:wt, fog:false})); glow.position.z = -7.9; g.add(glow);
  var w = tavolaWatch({dial:'roman', caseMat:M.gold, strapMat:M.black});
  var holder = productHolder(w,'tavola',3,2,[1.8,3.6,1]); g.add(holder);
  var panels = [], pm = new THREE.MeshStandardMaterial({color:0xe6c77d, metalness:1, roughness:.24});
  for(var i=0;i<9;i++){ var m = new THREE.Mesh(new THREE.BoxGeometry(1.45,3.9,.08), pm); g.add(m); panels.push(m); }
  var fr = [], fm = new THREE.MeshBasicMaterial({color:0xffd98a, transparent:true, opacity:.5, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide});
  for(var k=0;k<7;k++){
    var o = rrShape(2.2,3.4,.12), h = new THREE.Path(), s = rrShape(2.1,3.3,.1); /* hole */
    var hole = s.getPoints(); h.setFromPoints(hole.reverse()); o.holes.push(h);
    var f = new THREE.Mesh(new THREE.ShapeGeometry(o), fm.clone()); f.position.z = -1.5; g.add(f); fr.push(f);
  }
  var sp = dust(90,[6,4,3],0xffe9b8,.06,.7); g.add(sp);
  return {group:g, holder:holder, update:function(q,t){
    var open = ent(q,-.02,.42);
    for(var i=0;i<9;i++){
      var j = i-4, p = panels[i];
      var cx = j*1.5, ox = Math.sign(j||1)*(Math.abs(j)*1.45+3.4) + (j===0?0:0);
      var spread = open;
      var xx = lerp(cx, j===0 ? (i%2?3.6:-3.6) : ox, spread);
      p.position.set(xx, Math.sin(t*.6+i)*.12*spread + (i%3-1)*.35*spread, lerp(2.4, 1.2-Math.abs(j)*.5, spread));
      p.rotation.y = lerp(0, -Math.sign(j||1)*(.35+Math.abs(j)*.06), spread) + Math.sin(t*.4+i)*.03;
      p.rotation.x = Math.sin(t*.5+i*2)*.03*spread; p.scale.y = lerp(1, .85+.15*((i*37)%5)/4, spread);
      p.visible = !(open<.02 && j===0 && false);
    }
    var we = ent(q,-.2,.3), ws = lerp(.7,1,sm(we));
    w.scale.setScalar(1.18*ws); w.position.y = Math.sin(t*.8)*.08; w.rotation.y = Math.sin(t*.4)*.28;
    fr.forEach(function(f,i){
      var ph = ((t*.18 + i/7) % 1), s = .8 + ph*3.2;
      f.scale.set(s,s,1); f.material.opacity = Math.sin(ph*Math.PI)*.55*ent(q,0,.3); f.position.z = -1.5 - ph*1.5;
    });
    sp.rotation.y = t*.04;
  }};
}

/* ---- WORLD 3 · scene 5: red-brown interior ---- */
function worldAtelier(){
  var g = new THREE.Group();
  var room = new THREE.Mesh(new THREE.BoxGeometry(24,13,26), new THREE.MeshStandardMaterial({color:0x7d3325, roughness:.85, metalness:0, side:THREE.BackSide}));
  room.position.set(0,1.5,-6); g.add(room);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.MeshStandardMaterial({color:0x4a1a12, roughness:.35, metalness:.4})); floor.rotation.x = -Math.PI/2; floor.position.y = -4; g.add(floor);
  var recess = new THREE.Mesh(new THREE.PlaneGeometry(7,10), new THREE.MeshBasicMaterial({map:vertTex([[0,'#f6c88f'],[1,'#c05a2f']]), fog:false})); recess.position.set(0,.5,-9); g.add(recess);
  var arch = archWall(14,10.5,[0],3.4,.8,-8.4,new THREE.MeshStandardMaterial({color:0x8f4030,roughness:.85}),-4); g.add(arch);
  var w = tavolaWatch({dial:'roman', caseMat:M.gold, strapMat:new THREE.MeshStandardMaterial({color:0x2a1410,roughness:.5})});
  var holder = productHolder(w,'tavola',4,2,[1.8,3.6,1]); g.add(holder);
  var pan = [], mats = [0xa24a35,0xc98b5a,0x5f2217,0xd9a574,0x8a3626];
  for(var i=0;i<8;i++){
    var m = new THREE.Mesh(new THREE.BoxGeometry(rnd(1,2.2),rnd(2,4.5),.12), new THREE.MeshStandardMaterial({color:mats[i%5],roughness:.55,metalness:i%3?0:.5}));
    m.position.set((i<4?-1:1)*rnd(3.2,6.5), rnd(-1.5,2.5), rnd(-4,2)); m.rotation.y = (i<4?1:-1)*rnd(.3,.9); g.add(m); pan.push({m:m, y:m.position.y, s:rnd(.3,.7), p:rnd(0,6)});
  }
  var cone = new THREE.Mesh(new THREE.ConeGeometry(3.4,12,40,1,true), new THREE.MeshBasicMaterial({color:0xffc27a, transparent:true, opacity:.1, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide}));
  cone.position.y = 3; g.add(cone);
  var sp = dust(110,[7,5,5],0xffd2a0,.06,.6); g.add(sp);
  return {group:g, holder:holder, update:function(q,t){
    w.position.y = Math.sin(t*.8)*.1; w.rotation.y = Math.sin(t*.35)*.35; w.rotation.x = Math.sin(t*.3)*.04;
    var s = 1.2*lerp(.85,1,ent(q,-.4,.1)); w.scale.setScalar(s);
    pan.forEach(function(p){ p.m.position.y = p.y+Math.sin(t*p.s+p.p)*.25; p.m.rotation.z = Math.sin(t*p.s*.7+p.p)*.04; });
    cone.material.opacity = .08+.03*Math.sin(t*.7); sp.rotation.y = t*.03;
  }};
}

/* ---- WORLD 4 · scene 6: white void, orbiting geometry ---- */
function worldVoid(){
  var g = new THREE.Group();
  var w = tavolaWatch({dial:'roman', caseMat:M.steel, strapMat:M.black});
  var holder = productHolder(w,'noir',5,2,[1.8,3.6,1]); g.add(holder);
  var shadow = new THREE.Mesh(new THREE.PlaneGeometry(9,9), new THREE.MeshBasicMaterial({map:radialTex([[0,'rgba(60,50,40,.28)'],[1,'rgba(60,50,40,0)']]), transparent:true, depthWrite:false}));
  shadow.rotation.x = -Math.PI/2; shadow.position.y = -3.2; g.add(shadow);
  var shapes = [], defs = [
    [new THREE.TorusGeometry(.7,.16,24,64), M.gold],
    [new THREE.ConeGeometry(.5,1.5,48), M.steel],
    [new THREE.SphereGeometry(.55,48,32), M.white],
    [new THREE.SphereGeometry(.7,48,16,0,Math.PI*2,0,Math.PI/2), M.gold],
    [new THREE.CylinderGeometry(.9,.9,1.5,48,1,true,0,Math.PI*.9), M.champ],
    [new THREE.BoxGeometry(.8,.8,.8), M.dark],
    [new THREE.OctahedronGeometry(.6,0), M.steel],
    [new THREE.TorusGeometry(.9,.1,16,64,Math.PI*1.2), M.gold],
    [new THREE.CylinderGeometry(.35,.35,1.7,32), M.white],
    [new THREE.TorusKnotGeometry(.42,.12,96,12), M.champ]
  ];
  defs.forEach(function(df,i){
    var m = new THREE.Mesh(df[0], df[1]); if(df[0].type==='CylinderGeometry'||df[0].type==='SphereGeometry') m.material = df[1].clone(), m.material.side = THREE.DoubleSide;
    var gg = new THREE.Group(); gg.add(m); g.add(gg);
    shapes.push({g:gg, m:m, r:rnd(3.2,5.4), sp:rnd(.12,.28)*(i%2?1:-1), ph:i/defs.length*Math.PI*2, tilt:rnd(-.6,.6), y:rnd(-1.8,1.8), spin:[rnd(-.6,.6),rnd(-.6,.6),rnd(-.3,.3)]});
  });
  return {group:g, holder:holder, update:function(q,t){
    w.position.y = Math.sin(t*.8)*.1; w.rotation.y = Math.sin(t*.4)*.3;
    var s = 1.15*lerp(.9,1,ent(q,-.4,.1)); w.scale.setScalar(s);
    var open = ent(q,-.2,.35);
    shapes.forEach(function(o){
      var a = o.ph + t*o.sp, r = o.r*(.2+.8*open);
      o.g.position.set(Math.cos(a)*r, o.y*open + Math.sin(a*1.3)*.4, Math.sin(a)*r*.7 - 1);
      o.g.rotation.set(t*o.spin[0],t*o.spin[1],t*o.spin[2]); o.g.scale.setScalar(.2+.8*open);
    });
  }};
}

/* ---- WORLD 5 · scene 7: minimal beige ---- */
function worldMinimal(){
  var g = new THREE.Group(), rings = [];
  for(var i=0;i<3;i++){
    var r = new THREE.Mesh(new THREE.TorusGeometry(1.1+i*.7,.012,8,160), M.gold); r.rotation.set(Math.PI/2.4+i*.35, i*.5, 0); g.add(r); rings.push(r);
  }
  var d = dust(80,[5,3,3],0xffffff,.05,.8); g.add(d);
  return {group:g, update:function(q,t){
    rings.forEach(function(r,i){ r.rotation.z = t*(.08+i*.03)*(i%2?1:-1); r.rotation.y += .0008; var s = lerp(.2,1,ent(q,-.5,.1)); r.scale.setScalar(s); });
    d.rotation.y = t*.03;
  }};
}

/* ---- WORLD 6 · scene 8: Montre Joaillière, dark, smoke, burst ---- */
function worldDark(){
  var g = new THREE.Group();
  var smokeTex = (function(){
    var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
    for(var i=0;i<26;i++){ var px = rnd(60,196), py = rnd(60,196), r = rnd(30,80), gr = x.createRadialGradient(px,py,0,px,py,r); gr.addColorStop(0,'rgba(255,255,255,.22)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0,0,256,256); }
    var t = new THREE.CanvasTexture(c); return t;
  })();
  var smoke = [];
  for(var i=0;i<34;i++){
    var s = new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex, color:0xb98348, transparent:true, opacity:rnd(.05,.12), depthWrite:false, blending:THREE.AdditiveBlending, rotation:rnd(0,6)}));
    s.position.set(rnd(-7,7), rnd(-3,3), rnd(-6,2)); var sc = rnd(5,11); s.scale.set(sc,sc,1); g.add(s); smoke.push({s:s, sp:rnd(.05,.15), p:rnd(0,6), x:s.position.x, y:s.position.y, op:s.material.opacity});
  }
  var rayTex = vertTex([[0,'rgba(255,220,150,0)'],[.35,'rgba(255,215,140,.55)'],[1,'rgba(255,200,120,0)']]);
  var rays = [];
  for(var k=0;k<9;k++){
    var r = new THREE.Mesh(new THREE.PlaneGeometry(rnd(.6,1.6),16), new THREE.MeshBasicMaterial({map:rayTex, transparent:true, opacity:.18, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide}));
    r.position.set((k-4)*.9,3,-2-Math.abs(k-4)*.3); r.rotation.z = (k-4)*.11; g.add(r); rays.push(r);
  }
  var ring = ringObj({mat:M.gold, tube:.16, stone:true, pave:true});
  ring.scale.setScalar(1.7); ring.rotation.x = 0;
  var inner = new THREE.Group(); inner.add(ring);
  var holder = productHolder(inner,'aurum',7,1.7); g.add(holder);
  var spot = new THREE.Mesh(new THREE.CircleGeometry(5,64), new THREE.MeshBasicMaterial({map:radialTex([[0,'rgba(255,205,130,.45)'],[1,'rgba(255,205,130,0)']]), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
  spot.position.z = -1.5; g.add(spot);
  var burst = new THREE.Sprite(new THREE.SpriteMaterial({map:radialTex([[0,'rgba(255,250,235,1)'],[.25,'rgba(255,225,160,.8)'],[1,'rgba(255,200,110,0)']]), transparent:true, depthWrite:false, depthTest:false, blending:THREE.AdditiveBlending, opacity:0}));
  burst.position.z = 2; burst.renderOrder = 10; g.add(burst);
  var sp = dust(160,[6,4,4],0xffd9a0,.05,.8); g.add(sp);
  var api = {group:g, holder:holder, burst:0, update:function(q,t){
    var e = ent(q,-.3,.2);
    inner.rotation.y = t*.45; inner.rotation.x = -.5 + Math.sin(t*.3)*.08; inner.position.y = Math.sin(t*.8)*.1;
    holder.scale.setScalar(holder.scale.x); inner.scale.setScalar(lerp(.6,1,e));
    smoke.forEach(function(o){ o.s.position.x = o.x+Math.sin(t*o.sp+o.p)*1.6; o.s.position.y = o.y+Math.cos(t*o.sp*.8+o.p)*.8; o.s.material.rotation += .0006; });
    rays.forEach(function(r,i){ r.material.opacity = (.12+.1*Math.sin(t*.5+i))*e; });
    var b = ent(q,.38,.62)*(1-ent(q,.64,1.0));
    api.burst = b; burst.material.opacity = Math.min(1,b*1.4); var bs = 2+b*22; burst.scale.set(bs,bs,1);
    sp.rotation.y = t*.04;
  }};
  return api;
}

/* ---- WORLD 7 · scene 9: Tresse, ribbons and braided bracelet ---- */
function worldTresse(){
  var g = new THREE.Group(), rib = [], i;
  var white = new THREE.MeshStandardMaterial({color:0xfaf6ee, roughness:.55, metalness:0, side:THREE.DoubleSide});
  var champ = new THREE.MeshStandardMaterial({color:0xe5c88a, roughness:.22, metalness:1, side:THREE.DoubleSide});
  for(i=0;i<7;i++){
    (function(i){
      var R = 3.2+i*.35, ph = i*.9, h = rnd(1.4,2.6);
      var fn = function(u){ var a = u*Math.PI*2.1+ph; return new THREE.Vector3(Math.cos(a)*(R+Math.sin(u*9+ph)*.5), (u-.5)*h*2.4 + Math.sin(u*5+ph)*.6, Math.sin(a)*(R*.75)-1); };
      var m = new THREE.Mesh(ribbonGeo(fn,160,.55+i%3*.22), i%2 ? champ : white); g.add(m); rib.push({m:m, s:rnd(.04,.1)*(i%2?1:-1)});
    })(i);
  }
  var br = braidBracelet(M.champ); br.rotation.x = .9; br.scale.setScalar(.95);
  var inner = new THREE.Group(); inner.add(br);
  var holder = productHolder(inner,'tresse',8,1.9); g.add(holder);
  var d = dust(80,[6,4,4],0xffffff,.05,.9); g.add(d);
  return {group:g, holder:holder, update:function(q,t){
    var e = ent(q,-.55,.1);
    br.rotation.y = t*.35; br.rotation.x = .85+Math.sin(t*.4)*.12; inner.scale.setScalar(lerp(.5,1,e)); inner.position.y = Math.sin(t*.7)*.08;
    rib.forEach(function(r,i){ r.m.rotation.y = t*r.s + q*.5; r.m.rotation.z = Math.sin(t*.2+i)*.05; r.m.scale.setScalar(lerp(.3,1,e)); });
    d.rotation.y = t*.03;
  }};
}

/* ---- WORLD 8 · scene 10: Seuil, doorway and two rings ---- */
function worldDoor(){
  var g = new THREE.Group();
  var wall = new THREE.MeshStandardMaterial({color:0xe9d4b2, roughness:.9});
  g.add(archWall(24,15,[0],3.2,1.1,-6,wall,-4.5));
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(60,40), new THREE.MeshStandardMaterial({color:0xd9bd92, roughness:.5, metalness:.1})); floor.rotation.x = -Math.PI/2; floor.position.set(0,-4.5,-4); g.add(floor);
  var lightTex = radialTex([[0,'#fffdf2'],[.45,'#ffe6b0'],[1,'#e9a85c']]);
  var glow = new THREE.Mesh(new THREE.PlaneGeometry(12,16), new THREE.MeshBasicMaterial({map:lightTex, fog:false})); glow.position.set(0,0,-8); g.add(glow);
  var back = new THREE.Mesh(new THREE.PlaneGeometry(60,40), new THREE.MeshStandardMaterial({color:0xcfae7c, roughness:.9})); back.position.set(0,0,-10); g.add(back);
  var beamTex = vertTex([[0,'rgba(255,238,200,0)'],[.4,'rgba(255,238,200,.55)'],[1,'rgba(255,238,200,0)']]);
  var beam = new THREE.Mesh(new THREE.PlaneGeometry(5,12), new THREE.MeshBasicMaterial({map:beamTex, transparent:true, opacity:.5, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide}));
  beam.position.set(0,.3,-1); beam.rotation.x = -.35; g.add(beam);
  var r1 = ringObj({mat:M.gold, tube:.1, stone:false}), r2 = ringObj({mat:M.white, tube:.12, pave:true, stone:false});
  r1.scale.setScalar(1.35); r2.scale.setScalar(1.35);
  var pair = new THREE.Group(); pair.add(r1); pair.add(r2);
  var holder = productHolder(pair,'seuil',9,2.2); holder.position.set(0,-.2,1); g.add(holder);
  var d = dust(130,[6,4,5],0xfff1cc,.07,.8); g.add(d);
  return {group:g, holder:holder, update:function(q,t){
    var e = ent(q,-.5,.15);
    r1.position.set(-.85, Math.sin(t*.8)*.12, 0); r2.position.set(.85, Math.cos(t*.7)*.12, .2);
    r1.rotation.set(1.2+Math.sin(t*.4)*.1, t*.4, .3); r2.rotation.set(1.1+Math.cos(t*.35)*.1, -t*.35+1, -.25);
    pair.scale.setScalar(lerp(.4,1,e)); beam.material.opacity = .38+.14*Math.sin(t*.6); d.rotation.y = t*.03;
  }};
}

/* ---- WORLD 9 · scene 11: Fronde, green dial among branches ---- */
function worldGarden(){
  var g = new THREE.Group();
  var disc = new THREE.Mesh(new THREE.CircleGeometry(7.5,96), new THREE.MeshBasicMaterial({map:radialTex([[0,'#f3f0e0'],[.7,'#e1e5cf'],[1,'#c9d1b8']],512), fog:false}));
  disc.position.z = -5; g.add(disc);
  var plat = new THREE.Mesh(new THREE.CylinderGeometry(4.6,4.9,.7,96), new THREE.MeshStandardMaterial({color:0xefe6d2, roughness:.7})); plat.position.y = -3; g.add(plat);
  var plat2 = new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.4,.4,96), new THREE.MeshStandardMaterial({color:0xe4d8bd, roughness:.6})); plat2.position.y = -2.55; g.add(plat2);
  var bm = new THREE.MeshStandardMaterial({color:0xd9c9a2, roughness:.5, metalness:.4});
  var bg = branchGroup(bm);
  for(var i=0;i<9;i++){
    var a = i/9*Math.PI*2, st = new THREE.Vector3(Math.cos(a)*3.8, -2.6, Math.sin(a)*2.4-.5);
    bg.grow(st, new THREE.Vector3(-Math.cos(a)*.5, 1, -Math.sin(a)*.4).normalize(), rnd(4,6.2), .045, 2);
  }
  g.add(bg.group);
  var w = roundWatch({dial:'green', gems:false, strap:'leather', caseMat:M.gold, strapMat:M.green});
  var holder = productHolder(w,'fronde',10,1.7); g.add(holder);
  var beam = new THREE.Mesh(new THREE.ConeGeometry(2.8,9,40,1,true), new THREE.MeshBasicMaterial({color:0xfff2c8, transparent:true, opacity:.1, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide}));
  beam.position.y = 1.2; g.add(beam);
  var d = dust(120,[5,4,3],0xfff7d0,.07,.9); g.add(d);
  return {group:g, holder:holder, update:function(q,t){
    var e = ent(q,-.5,.1);
    w.position.y = Math.sin(t*.8)*.1+.1; w.rotation.y = Math.sin(t*.4)*.4; w.rotation.x = Math.sin(t*.3)*.06; w.scale.setScalar(1.15*lerp(.6,1,e));
    bg.group.rotation.y = Math.sin(t*.12)*.08; bg.group.scale.setScalar(lerp(.7,1,e));
    beam.material.opacity = .07+.03*Math.sin(t*.6); d.rotation.y = t*.03;
  }};
}

/* ---- WORLD 10 · scene 12: soft orange sun ---- */
function worldSun(){
  var g = new THREE.Group();
  var sun = new THREE.Mesh(new THREE.CircleGeometry(4.3,128), new THREE.MeshBasicMaterial({map:radialTex([[0,'rgba(255,170,90,1)'],[.5,'rgba(247,150,70,.92)'],[.82,'rgba(240,140,70,.45)'],[1,'rgba(240,140,70,0)']],512), transparent:true, depthWrite:false, fog:false}));
  sun.position.z = -2; g.add(sun);
  var halo = new THREE.Mesh(new THREE.CircleGeometry(9,64), new THREE.MeshBasicMaterial({map:radialTex([[0,'rgba(255,200,140,.5)'],[1,'rgba(255,200,140,0)']]), transparent:true, depthWrite:false, fog:false}));
  halo.position.z = -3; g.add(halo);
  var d = dust(100,[7,4,3],0xffffff,.05,.7); g.add(d);
  return {group:g, update:function(q,t){
    var e = ent(q,-.5,.3), s = (1+.025*Math.sin(t*.7))*lerp(.6,1,e); sun.scale.setScalar(s); sun.material.opacity = e; halo.scale.setScalar(s*(1+.04*Math.sin(t*.5))); d.rotation.y = t*.02;
  }};
}

/* ============================================================
   7. assemble: build worlds with a progress report
   ============================================================ */
var worlds = [], builders = [worldAlcove, worldCalla, worldPanels, worldAtelier, worldVoid, worldMinimal, worldDark, worldTresse, worldDoor, worldGarden, worldSun];
var scrollUnit = 1, scroller = $('scroller');

function lerpTo(el, val){ el.style.transform = 'scaleX('+val+')'; }
var loadProg = 0, shown = 0;
function setProg(v){ loadProg = Math.max(loadProg, v); }
(function tickLoad(){
  shown += (loadProg-shown)*.12; if(loadProg-shown<.002) shown = loadProg;
  lerpTo($('lbar'), shown.toFixed(3)); $('lnum').textContent = String(Math.round(shown*100)).padStart(3,'0');
  if(!tickLoad.done) requestAnimationFrame(tickLoad);
  tickLoad.stop = function(){ tickLoad.done = true; };
  window.__loadTick = tickLoad;
})();

function buildAll(done){
  initMats(); setProg(.12);
  var i = 0;
  (function step(){
    if(i >= builders.length){ done(); return; }
    var w = builders[i]();
    w.group.position.x = i*GAP; w.group.visible = false; scene.add(w.group); worlds.push(w);
    i++; setProg(.12 + .8*i/builders.length);
    setTimeout(step, 16);
  })();
}

/* ============================================================
   8. interaction: scroll, camera, hover, panel
   ============================================================ */
var lenis = null, P = 0, PS = 0;
var pointer = {x:0,y:0,sx:0,sy:0,cx:-1,cy:-1};
var ray = new THREE.Raycaster(), hovered = null, panelOpen = false;
var look = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();

function resize(){
  var w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w,h,false); camera.aspect = w/h; camera.updateProjectionMatrix();
  scrollUnit = Math.round(h*1.4);
  scroller.style.height = ((N-1)*scrollUnit + h) + 'px';
}
window.addEventListener('resize', resize);
function goTo(i){
  var y = i*scrollUnit;
  if(lenis) lenis.scrollTo(y,{duration:reduce?0:2.4}); else window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});
}
window.addEventListener('pointermove', function(e){ pointer.cx = e.clientX; pointer.cy = e.clientY; pointer.x = (e.clientX/innerWidth)*2-1; pointer.y = -(e.clientY/innerHeight)*2+1; }, {passive:true});
window.addEventListener('keydown', function(e){
  if(e.key==='Escape' && panelOpen) closePanel();
});

function camAt(p, out, lk){
  var k = Math.min(Math.floor(p), N-2), f = p>=N-1 ? 1 : p-k;
  if(p>=N-1) k = N-2;
  var e = sm((f-.52)/.48), A = CAM[k], B = CAM[k+1];
  var ax = WORLD[k]*GAP, bx = WORLD[k+1]*GAP;
  out.set(lerp(A[0][0]+ax,B[0][0]+bx,e), lerp(A[0][1],B[0][1],e), lerp(A[0][2],B[0][2],e));
  lk.set(lerp(A[1][0]+ax,B[1][0]+bx,e), lerp(A[1][1],B[1][1],e), lerp(A[1][2],B[1][2],e));
}

var bgA = new THREE.Color(), bgB = new THREE.Color(), lastSceneIdx = -1;
function updateTheme(p){
  var k = Math.min(Math.floor(p), N-2), f = p>=N-1 ? 1 : p-k; if(p>=N-1) k = N-2;
  var e = sm((f-.52)/.48);
  bgA.set(SC[k].bg); bgB.set(SC[k+1].bg); bgA.lerp(bgB,e);
  scene.background.copy(bgA); scene.fog.color.copy(bgA);
  var ink = mixHex(SC[k].ink, SC[k+1].ink, e);
  document.documentElement.style.setProperty('--ink', ink);
  var bgCss = '#'+bgA.getHexString(); document.documentElement.style.setProperty('--bg', bgCss); document.body.style.background = bgCss;
}

var capState = [];
function updateCaps(p){
  for(var i=0;i<N;i++){
    var t = p - i, o = 0;
    if(t > -1 && t < 1){
      var a = ent(t,.04,.17), b = 1-ent(t,.4,.52);
      o = Math.min(a,b);
      if(SC[i].hold==='first') o = Math.min(1, b);
      if(SC[i].hold==='last') o = a;
    }
    var el = caps[i];
    var key = Math.round(o*100);
    if(capState[i] !== key){
      capState[i] = key;
      el.style.opacity = o; el.style.visibility = o>.01 ? 'visible' : 'hidden'; el.classList.toggle('in', o>.35);
      var ty = (1-o)*18;
      if(SC[i].pos.indexOf('mid')>-1) el.style.transform = 'translateY(calc(-50% + '+(ty*.6)+'px))'; else el.style.transform = 'translateY('+ty+'px)';
      var btn = el.querySelector('.btn'); if(btn) btn.tabIndex = o>.6 ? 0 : -1;
      el.setAttribute('aria-hidden', o>.2 ? 'false' : 'true');
    }
  }
  var cur = Math.round(p); cur = Math.max(0,Math.min(N-1,cur));
  if(cur !== lastSceneIdx){ lastSceneIdx = cur; railBtns.forEach(function(b,i){ b.classList.toggle('on', i===cur); }); if(audio.on) audioScene(cur); emit('scene',cur); }
  $('cue').style.opacity = String(1-ent(p,.02,.18));
}

/* hover / pick */
function activePickables(){
  var out = [], p = PS;
  pickables.forEach(function(o){ if(!panelOpen && o.scene.some(function(sc){ return Math.abs(p-sc) < .42; })) out.push(o); });
  return out;
}
function pick(){
  if(pointer.cx<0 || coarse) return null;
  var list = activePickables(); if(!list.length) return null;
  ray.setFromCamera({x:pointer.x,y:pointer.y}, camera);
  var best = null, bd = 1e9;
  list.forEach(function(o){
    var hits = ray.intersectObject(o.holder.userData.hit,false);
    if(hits.length && hits[0].distance<bd){ bd = hits[0].distance; best = o; }
  });
  return best;
}
canvas.addEventListener('click', function(e){
  if(panelOpen) return;
  pointer.x = (e.clientX/innerWidth)*2-1; pointer.y = -(e.clientY/innerHeight)*2+1; pointer.cx = e.clientX; pointer.cy = e.clientY;
  var o = (function(){ var list = activePickables(); ray.setFromCamera({x:pointer.x,y:pointer.y}, camera); var b=null,d=1e9; list.forEach(function(q){ var h=ray.intersectObject(q.holder.userData.hit,false); if(h.length&&h[0].distance<d){d=h[0].distance;b=q;} }); return b; })();
  if(o) openPanel(o.id);
});
/* the scroller sits above the canvas but ignores pointer events, so canvas receives clicks */

var lastFocus = null;
function openPanel(id){
  var pr = PRODUCTS[id]; if(!pr) return;
  lastFocus = document.activeElement;
  $('pk').textContent = pr.k; $('pn').textContent = pr.n; $('pdsc').textContent = pr.d;
  $('pspec').innerHTML = pr.sp.map(function(s){ return '<dt>'+s[0]+'</dt><dd>'+s[1]+'</dd>'; }).join('');
  $('psw').style.background = 'linear-gradient(135deg,'+pr.sw[0]+','+pr.sw[1]+')';
  $('veil').classList.add('on'); $('panel').classList.add('on'); $('panel').setAttribute('aria-hidden','false');
  panelOpen = true; if(lenis) lenis.stop(); document.documentElement.style.overflow='hidden';
  setTimeout(function(){ $('px').focus(); }, 60);
  audioChime(); curProduct = id; emit('open',id);
}
function closePanel(){
  $('veil').classList.remove('on'); $('panel').classList.remove('on'); $('panel').setAttribute('aria-hidden','true');
  panelOpen = false; if(lenis) lenis.start(); document.documentElement.style.overflow='';
  if(lastFocus && lastFocus.focus) lastFocus.focus();
  emit('close');
}
$('px').addEventListener('click', closePanel); $('veil').addEventListener('click', closePanel);
$('pdisc').addEventListener('click', function(e){ e.preventDefault(); });

/* ============================================================
   9. ambient sound (Web Audio, started by the Sound button)
   ============================================================ */
var audio = {on:false, ctx:null, voices:[], master:null};
var ROOTS = [110,110,98,123.5,87.3,130.8,110,73.4,98,123.5,110,98];
function audioInit(){
  var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return false;
  var c = audio.ctx = new AC(), master = audio.master = c.createGain(); master.gain.value = 0;
  var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = .6;
  var lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .07; lg.gain.value = 260; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
  master.connect(lp); lp.connect(c.destination);
  [1,1.5,2,3,4.02].forEach(function(m,i){
    var o = c.createOscillator(), g = c.createGain(); o.type = i%2 ? 'sine' : 'triangle'; o.detune.value = (i-2)*5; g.gain.value = [.5,.3,.28,.12,.06][i];
    o.frequency.value = ROOTS[0]*m; o.connect(g); g.connect(master); o.start(); audio.voices.push({o:o,m:m});
  });
  return true;
}
function audioScene(i){
  if(!audio.ctx) return; var t = audio.ctx.currentTime;
  audio.voices.forEach(function(v){ v.o.frequency.setTargetAtTime(ROOTS[i]*v.m, t, 1.6); });
}
function audioChime(){
  if(!audio.on || !audio.ctx) return; var c = audio.ctx, t = c.currentTime;
  [880,1318.5,1760].forEach(function(f,i){
    var o = c.createOscillator(), g = c.createGain(); o.type='sine'; o.frequency.value = f; g.gain.setValueAtTime(0,t+i*.07); g.gain.linearRampToValueAtTime(.05,t+i*.07+.02); g.gain.exponentialRampToValueAtTime(.0001,t+i*.07+1.8);
    o.connect(g); g.connect(c.destination); o.start(t+i*.07); o.stop(t+i*.07+2);
  });
}
$('snd').addEventListener('click', function(){
  var b = $('snd');
  if(!audio.ctx && !audioInit()) return;
  audio.on = !audio.on; b.setAttribute('aria-pressed', audio.on?'true':'false');
  if(audio.ctx.state==='suspended') audio.ctx.resume();
  audio.master.gain.setTargetAtTime(audio.on?.16:0, audio.ctx.currentTime, .8);
  if(audio.on) audioScene(Math.max(0,lastSceneIdx));
});

/* ============================================================
   10. main loop
   ============================================================ */
var clock = new THREE.Clock(), flashEl = $('flash'), started = false, introT = 0;
var rigOff = new THREE.Vector3(5,7,9);

function frame(ts){
  var dt = Math.min(.05, clock.getDelta()), time = clock.elapsedTime;
  if(lenis) lenis.raf(ts);
  var y = window.pageYOffset || document.documentElement.scrollTop || 0;
  P = cl(y/scrollUnit, 0, N-1);
  PS += (P-PS)*(reduce?1:Math.min(1,dt*5.5));
  if(Math.abs(P-PS)<.0003) PS = P;
  pointer.sx += (pointer.x-pointer.sx)*.05; pointer.sy += (pointer.y-pointer.sy)*.05;

  /* camera */
  camAt(PS, tmpA, look);
  var aspect = camera.aspect, far = Math.pow(Math.max(1,1.3/aspect), .85);
  tmpA.sub(look).multiplyScalar(far).add(look);
  var dr = reduce?0:1;
  camera.position.set(tmpA.x + (Math.sin(time*.23)*.28 + pointer.sx*.55)*dr, tmpA.y + (Math.cos(time*.19)*.16 + pointer.sy*.3)*dr, tmpA.z + Math.sin(time*.17)*.18*dr);
  camera.lookAt(look);
  camera.fov = (aspect<1 ? 46 : 40) + (reduce?0:cl(Math.abs(P-PS)*16,0,5)); camera.updateProjectionMatrix();
  scene.fog.near = 22*far; scene.fog.far = 56*far;

  /* light rig follows camera */
  keyLight.position.copy(look).add(rigOff); keyTarget.position.copy(look);
  rimLight.position.copy(look).add(tmpB.set(-5,2,6));

  /* worlds */
  var k = Math.floor(PS);
  var w0 = WORLD[Math.min(k,N-1)], w1 = WORLD[Math.min(k+1,N-1)];
  var flash = 0;
  for(var i=0;i<worlds.length;i++){
    var wd = worlds[i], vis = (i===w0 || i===w1); wd.group.visible = vis;
    if(vis){
      var first = WORLD.indexOf(i);
      wd.update(PS-first, time);
      if(wd.holder){ wd.holder.userData.hover += ((wd.holder.userData.want?1:0)-wd.holder.userData.hover)*.12; var s = 1+.06*wd.holder.userData.hover; wd.holder.scale.setScalar(s); }
      if(wd.burst) flash = Math.max(flash, wd.burst);
    }
  }
  /* watch hands */
  for(var j=0;j<watches.length;j++){ var h = watches[j], tt = time+h.phase; h.sc.rotation.z = -tt*1.2; h.mn.rotation.z = -.8 - tt*.02; h.hr.rotation.z = -1.0 - tt*.0017; }

  /* hover */
  if(!coarse){
    var pk = pick(), want = pk ? pk.holder : null;
    pickables.forEach(function(o){ o.holder.userData.want = (o.holder===want); });
    if(want !== hovered){ hovered = want; hoveredId = null; pickables.forEach(function(o){ if(o.holder===want) hoveredId = o.id; }); canvas.style.cursor = want ? 'pointer' : ''; emit('hover',hoveredId); }
    keyLight.intensity = 1.25 + (want?.35:0); rimLight.intensity = 1.1 + (want?.6:0);
  }

  flashEl.style.opacity = flash>.01 ? Math.min(.92,flash*.92) : 0;
  updateTheme(PS); updateCaps(PS);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

/* ============================================================
   11. boot: build, compile, reveal
   ============================================================ */
function boot(){
  resize();
  buildAll(function(){
    /* warm the shaders: show every world once so nothing hitches mid-scroll */
    worlds.forEach(function(w){ w.group.visible = true; });
    try{ renderer.compile(scene, camera); }catch(e){}
    worlds.forEach(function(w){ w.group.visible = false; });
    setProg(1);
    var go = function(){
      if(window.Lenis && !reduce){
        lenis = new Lenis({lerp:.09, smoothWheel:true, wheelMultiplier:.9, touchMultiplier:1.4});
      }
      requestAnimationFrame(frame);
      var ld = $('loader');
      var reveal = function(){ ld.style.display = 'none'; if(window.__loadTick) window.__loadTick.stop(); };
      if(window.gsap && !reduce){
        gsap.to(ld,{opacity:0,duration:1.1,delay:.45,ease:'power2.inOut',onComplete:reveal});
        var h = caps[0].querySelector('h2');
        gsap.fromTo(h,{letterSpacing:'.9em',opacity:0},{letterSpacing:'.34em',opacity:1,duration:3,delay:1,ease:'power3.out'});
        gsap.from(caps[0].querySelectorAll('.k,p'),{opacity:0,y:14,duration:1.6,delay:1.8,stagger:.25,ease:'power2.out'});
        gsap.from('.hdr',{opacity:0,y:-12,duration:1.4,delay:1.2,ease:'power2.out'});
      } else { reveal(); }
    };
    setTimeout(go, 500);
  });
}
var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function(r){setTimeout(r,2500);})]) : Promise.resolve();
fontsReady.then(boot);
})();

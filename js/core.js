'use strict';
// ---- загрузка: считаем все картинки, ждём шрифт; экран загрузки с прогрессом, без зависаний (таймаут) ----
const LOADQ=[];{const _I=window.Image;window.Image=function(w,h){const i=new _I(w,h);LOADQ.push(i);return i};window.Image.prototype=_I.prototype}
let LOADED=false,LOADT0=performance.now(),FONTOK=false;
// ===== Ярмарка подсказок — движок =====
const C=document.getElementById('c'),X=C.getContext('2d');
let W=0,H=0,S=1,OX=0,OY=0,DPR=1,T=0,DT=0.016,shake=0,PX=640,PY=360,fade=1;
function rs(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);S=Math.min(W/1280,H/720);OX=(W-1280*S)/2;OY=(H-720*S)/2}
// сцена = видимая область (visualViewport) + безопасные зоны (чёлка); страница не прокручивается
const SAFE={l:0,t:0,r:0,b:0};let VVX=0,VVY=0;const _sp=document.createElement('div');_sp.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.documentElement.appendChild(_sp);
function vpWH(){const v=window.visualViewport;let w=innerWidth,h=innerHeight;VVX=0;VVY=0;if(v&&v.width>0){w=Math.round(v.width);h=Math.round(v.height);VVX=v.offsetLeft||0;VVY=v.offsetTop||0}const e=document.documentElement;return[w||e.clientWidth,h||e.clientHeight]}
function rs(){DPR=Math.min(2,window.devicePixelRatio||1);if(window.scrollX||window.scrollY)window.scrollTo(0,0);[W,H]=vpWH();C.style.left=VVX+'px';C.style.top=VVY+'px';C.style.width=W+'px';C.style.height=H+'px';C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);
 const cs=getComputedStyle(_sp);SAFE.t=parseFloat(cs.paddingTop)||0;SAFE.r=parseFloat(cs.paddingRight)||0;SAFE.b=parseFloat(cs.paddingBottom)||0;SAFE.l=parseFloat(cs.paddingLeft)||0;
 const aw=W-SAFE.l-SAFE.r,ah=H-SAFE.t-SAFE.b;S=Math.min(aw/1280,ah/720);OX=SAFE.l+(aw-1280*S)/2;OY=SAFE.t+(ah-720*S)/2}
// полноэкранный режим (Android/desktop); iPhone — через «На экран Домой» (manifest + apple-mobile-web-app-capable)
const FS_OK=!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen);const isFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
function goFS(){if(!FS_OK||isFS())return;const e=document.documentElement;try{const p=(e.requestFullscreen||e.webkitRequestFullscreen).call(e,{navigationUI:'hide'});const lk=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(_){}};if(p&&p.then)p.then(lk).catch(()=>{});else lk()}catch(_){}}
function exitFS(){try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(_){}}
function toggleFS(){isFS()?exitFS():goFS()}
const TOUCHDEV=('ontouchstart' in window)||navigator.maxTouchPoints>0;let _fsTried=false;
addEventListener('pointerdown',()=>{if(TOUCHDEV&&!_fsTried&&!PORTRAIT()){_fsTried=true;goFS()}},true);
document.addEventListener('fullscreenchange',()=>onOrient());document.addEventListener('webkitfullscreenchange',()=>onOrient());
const FSI={on:new Image(),off:new Image()};FSI.on.src='assets/ui/fs_on.png';FSI.off.src='assets/ui/fs_off.png';
function fsButton(){if(!FS_OK||(scene!=='title'&&scene!=='map'))return;const x=62,y=52,d=78;UI.push({id:'fs',x,y,w:d,h:d,fn:toggleFS,always:1});const im=isFS()?FSI.off:FSI.on;if(!im.complete||!im.naturalWidth)return;
 const hov=Math.hypot(PX-x,PY-y)<d/2;X.save();X.translate(x,y);X.rotate(Math.sin(T*1.3)*.04);const k=hov?1.07:1;X.scale(k,k);X.shadowColor='rgba(0,0,0,.45)';X.shadowBlur=10;X.shadowOffsetY=4;X.drawImage(im,-d/2,-d/2,d,d*im.naturalHeight/im.naturalWidth);X.restore()}
let _lastW=-1,_lastH=-1,_wasP=null;function relayout(){rs();_lastW=W;_lastH=H;const p=PORTRAIT();if(_wasP!==p){_wasP=p;document.body.classList.toggle('portrait',p);if(!p){last=performance.now();if(AC&&AC.state==='suspended')AC.resume().catch(()=>{})}}}
function onOrient(){relayout();[100,300,600].forEach(t=>setTimeout(relayout,t))}
addEventListener('resize',onOrient);addEventListener('orientationchange',onOrient);addEventListener('pageshow',onOrient);addEventListener('scroll',()=>{if(scrollX||scrollY)scrollTo(0,0)});document.addEventListener('visibilitychange',()=>{if(!document.hidden)onOrient()});
if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',onOrient);
if(window.visualViewport){visualViewport.addEventListener('resize',onOrient);visualViewport.addEventListener('scroll',onOrient)}
setInterval(()=>{const[w,h]=vpWH();if(w!==_lastW||h!==_lastH||PORTRAIT()!==_wasP)relayout()},500);rs();
const IM={};function img(n,src){const i=new Image();i.src=src;IM[n]=i}
['title','l1','l2','l3','l4','l5'].forEach(n=>img('bg_'+n,'assets/bg_'+n+'.jpg'));
['lyova','nika','barsik','bear','bunny','owl'].forEach(n=>img(n,'assets/sprites/'+n+'.png'));
const FONT='FairyLogo, Georgia, serif',BODY='Pangolin, "Comic Sans MS", sans-serif';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// ---- точная математика ----
// ---- сохранение ----
let SV;try{SV=JSON.parse(localStorage.getItem('yarmarka1'))}catch(e){}
if(!SV)SV={stars:[0,0,0,0,0],secret:[0,0,0,0],open:1};
function save(){try{localStorage.setItem('yarmarka1',JSON.stringify(SV))}catch(e){}}
// ---- звук (синтез WebAudio) ----
var AC=null;function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d,type,v,when,slide){const a=ac();if(!a)return;const t=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.1,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.05)}
function noise(d,v,fq,when){const a=ac();if(!a)return;const b=a.createBuffer(1,Math.floor(a.sampleRate*d),a.sampleRate),ch=b.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=(Math.random()*2-1)*(1-i/ch.length);const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=fq;const g=a.createGain();g.gain.value=v;s.connect(f).connect(g).connect(a.destination);s.start(a.currentTime+(when||0))}
const SFX={ok(){[1046,1318,1568,2093].forEach((f,i)=>tone(f,.5,'sine',.08,i*.07))},bad(){tone(240,.25,'triangle',.1,0,160);tone(190,.3,'triangle',.08,.12,130)},
 click(){tone(1300,.05,'square',.035)},hit(){noise(.3,.6,350);tone(95,.3,'square',.1,0,40)},shatter(){noise(.5,.35,3200);[2400,3100,2700,3600].forEach((f,i)=>tone(f,.3,'sine',.05,i*.04))},
 clang(){tone(1800,.45,'triangle',.09);tone(2650,.6,'sine',.05,.02)},splash(){noise(.35,.18,1100)},star(){[1568,2093,2637].forEach((f,i)=>tone(f,.6,'sine',.08,i*.13))},
 tick(){tone(2200,.03,'square',.03)},whoosh(){noise(.5,.2,600)}};
// ---- голос и реплики ----
const G={_busy:0,fast:false,mute:false};let talk=null,skipTalk=null;
const STALE={stale:1};// корутина устаревшей сцены: тихо обрывается, не трогает новый уровень
function ctxNow(){return{lv:typeof LV!=='undefined'?LV:null,sc:scene}}
function alive(c){if(/^l\d$/.test(c.sc))return typeof LV!=='undefined'&&LV===c.lv&&(scene===c.sc||scene==='secret');return scene===c.sc}
function wait(ms){const c=ctxNow();return new Promise((r,j)=>setTimeout(()=>alive(c)?r():j(STALE),G.fast?Math.min(ms,40):ms))}
let SAYID=0,SAYQ=Promise.resolve(),SAYEP=0;
function stopTalk(){SAYEP++;if(skipTalk)skipTalk();talk=null}
function say(k){const ep=SAYEP,c=ctxNow();const p=SAYQ.then(()=>ep===SAYEP&&alive(c)?say1(k):null);SAYQ=p.catch(()=>{});return p.then(v=>{if(!alive(c))throw STALE;return v})}
async function say1(k){const l=LINES[k];if(!l)return;const id=++SAYID;talk={who:l.who,text:l.t,k,t0:T,id};
 if(G.fast){await wait(60);if(talk&&talk.id===id)talk=null;return}
 const v=typeof VOICE!=='undefined'&&VOICE[k];const dur=Math.max(2200,l.t.length*75);
 await new Promise(async res=>{let done=false,a=null;const fin=()=>{if(!done){done=true;if(a){try{a.pause()}catch(e){}}if(skipTalk===sk)skipTalk=null;res()}};const sk=()=>fin();skipTalk=sk;setTimeout(fin,((v&&v[1])||0)*1000+dur+4000);// страховка: play() может зависнуть на телефоне — очередь не должна вставать
  
  if(v&&!G.mute){a=new Audio('assets/voice/'+v[0]);try{attachAnalyser(a)}catch(e){}a.onended=()=>setTimeout(fin,350);a.onerror=()=>setTimeout(fin,dur);let ok=true;try{await a.play()}catch(e){ok=false}
   if(done)return;if(ok)setTimeout(fin,(v[1]+2.5)*1000);else setTimeout(fin,dur)}else setTimeout(fin,dur)});
 if(talk&&talk.id===id)talk=null}
async function run(fn){G._busy++;try{await fn()}catch(e){if(e!==STALE)console.error(e)}finally{G._busy--}}
// ---- частицы ----
const PS=[];
function burst(x,y,n,kind,hue,sp){sp=sp||1;for(let i=0;i<n;i++){const a=Math.random()*6.283,v=rnd(80,420)*sp;PS.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind==='shard'?180:0),life:1,dec:rnd(.6,1.3),kind,hue:hue+rnd(-15,15),s:kind==='shard'?rnd(6,16):rnd(2,6),rot:rnd(0,6),vr:rnd(-10,10)})}}
function drops(x,y,n){for(let i=0;i<n;i++)PS.push({x:x+rnd(-14,14),y:y+rnd(-30,0),vx:rnd(-60,60),vy:rnd(-160,40),life:1,dec:rnd(1.2,2),kind:'drop',hue:195,s:rnd(2,4.5),rot:0,vr:0})}
function motes(hue){if(PS.length<260&&Math.random()<.35){const v=vis();PS.push({x:rnd(v.x0,v.x0+v.w),y:v.y0+v.h+5,vx:rnd(-8,8),vy:rnd(-30,-12),life:1,dec:rnd(.08,.16),kind:'mote',hue:hue+rnd(-20,20),s:rnd(1.5,3.5),rot:rnd(0,6),vr:0})}}
function stepParticles(){for(let i=PS.length-1;i>=0;i--){const p=PS[i];p.life-=p.dec*DT;if(p.life<=0){PS.splice(i,1);continue}
 if(p.kind==='shard'||p.kind==='drop')p.vy+=900*DT;else if(p.kind==='spark'){p.vx*=.96;p.vy*=.96}else if(p.kind==='mote')p.vx+=Math.sin(T+p.rot)*4*DT;p.x+=p.vx*DT;p.y+=p.vy*DT;p.rot+=p.vr*DT}}
// ---- фон с параллаксом ----
function vis(){return{x0:-OX/S,y0:-OY/S,w:W/S,h:H/S}}
// фон: картинка заполняет весь видимый экран (cover), без размытых полей
function bgScale(){const v=vis();return Math.max(v.w/1280,v.h/720)}
// фон прижат к низу экрана (cover): нарисованная земля всегда видна; герои стоят на линии земли GROUND (y в пикселях картинки 1280x720)
function bgY0(){const v=vis();return v.y0+v.h-720*bgScale()}
function bgXY(px,py){const s=bgScale(),ox=Math.sin(T*.21)*2;return[640*(1-s)+px*s+ox,bgY0()+py*s]}
const GROUND={title:700,l1:700,l2:700,l3:698,l4:688,l5:712};let BGN='title',GND=[];
function gY(py){return bgY0()+(py==null?GROUND[BGN]:py)*bgScale()}
function bgDraw(n,dim,scroll){const v=vis(),s=bgScale(),mx=(PX-640)/640;BGN=n;
 const b=IM['bg_'+n];
 if(b&&b.complete&&b.naturalWidth){const ox=-mx*4+Math.sin(T*.21)*2;X.drawImage(b,640-640*s+ox,bgY0(),1280*s,720*s)}
 if(dim){X.fillStyle=`rgba(8,4,24,${dim})`;X.fillRect(v.x0,v.y0,v.w,v.h)}
 const g=X.createRadialGradient(640,360,300,640,360,900);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(20,8,0,.35)');X.fillStyle=g;X.fillRect(v.x0,v.y0,v.w,v.h)}
// ---- рисование ----
function wrap(t,maxW){const ws=t.split(' '),out=[];let cur='';for(const w of ws){const s=cur?cur+' '+w:w;if(X.measureText(s).width>maxW&&cur){out.push(cur);cur=w}else cur=s}if(cur)out.push(cur);return out}
function txt(t,x,y,size,col,o){o=o||{};X.font=(o.b?'bold ':'')+size+'px '+(o.f||FONT);X.textAlign=o.al||'center';X.textBaseline='middle';
 if(o.st!==0){X.lineJoin='round';X.lineWidth=o.lw||Math.max(3,size*.16);X.strokeStyle=o.st||'rgba(30,10,50,.9)';X.strokeText(t,x,y)}X.fillStyle=col||'#fff';X.fillText(t,x,y)}
// кристалл-самоцвет с гранями
// ---- кнопки ----
let UI=[];
// ---- герои: дыхание, речь со squash&stretch, прыжки ----
let cast=[];
const NAMES={lyova:['Сыщик Лёва','#b0602a'],nika:['Ника','#2a8a7a'],barsik:['Кот Барсик','#d8701a'],narrator:['','#fff']};
function cheer(){cast.forEach((c,i)=>{c.jump=T+i*.08})}
function oops(n){const c=cast.find(c=>c.n===n);if(c)c.wob=T}
let PUI=[];const HERO_K=1.3,HERO_KI=1.28;
// телефон в ландшафте: крупнее интерактив (картина и так на весь экран)
function PK(){return (('ontouchstart' in window)||navigator.maxTouchPoints>0)&&H<=520?1.22:1}
function heroFit(c){if(c.h0==null){c.h0=c.h;c.bx=c.x}const v=vis(),bs=bgScale(),si=(typeof SAFE!=='undefined'?SAFE.l/Math.max(S,.01):0);
 const big=scene==='intro'||scene==='title'||scene==='fin';c.h=Math.min(c.h0*(big?HERO_KI:HERO_K)*(big?1:Math.min(PK(),1.12)),big?560:400*Math.min(PK(),1.1));
 const px0=(v.x0-640*(1-bs))/bs,px1=(v.x0+v.w-640*(1-bs))/bs;const safe=Math.max(si+8,16);
 const i=IM[c.n],hw=(i&&i.naturalWidth?c.h*i.naturalWidth/i.naturalHeight:c.h*.6)/2;
 const lo=Math.max(v.x0+safe,px0+safe)+hw,hi=Math.min(v.x0+v.w-safe,px1-safe)-hw;
 c.x=clamp(big?c.bx:c.bx+(c.bx<640?-(c.h-c.h0)*.2:(c.h-c.h0)*.2),lo,hi)}
const HERO_GAP=14;function heroW(c){const i=IM[c.n];return i&&i.naturalWidth?c.h*i.naturalWidth/i.naturalHeight:c.h*.6}
function separate(){const L=cast.slice().sort((a,b)=>a.x-b.x);for(let it=0;it<6;it++){let moved=false;
 for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i],need=(heroW(a)+heroW(b))/2+HERO_GAP,d=b.x-a.x;if(d<need){const k=(need-d)/2;a.x-=k;b.x+=k;moved=true}}
 const v=vis(),si=(typeof SAFE!=='undefined'?SAFE.l/Math.max(S,.01):0),safe=Math.max(si+8,16);
 for(const c of L){const hw=heroW(c)/2;c.x=clamp(c.x,v.x0+safe+hw,v.x0+v.w-safe-hw)}if(!moved)break}}
function drawCast(){cast.forEach(c=>{c.y=gY()});cast.forEach(heroFit);separate();cast.forEach(drawHero)}
// ---- сцены ----
const SC={};let scene='title',SCN=null;
function go(n,arg){try{if(typeof LV!=='undefined'&&LV&&n!=='secret'&&n!=='l'+LV.n)LV.resume=false}catch(e){}scene=n;SCN=SC[n];fade=1;stopTalk();PS.length=0;SCN.enter&&SCN.enter(arg)}
// ввод: блокируется только на время «победной» сцены раунда (LV.lock/SEC.lock), голос может говорить, пока ребёнок играет.
// хит-зона кнопок — не меньше 56 css px; из нескольких попаданий берётся ближайшая; случайный повторный тап (<220 мс, то же место) гасится
function locked(){if(scene[0]==='l'&&typeof LV!=='undefined'&&LV)return!!(LV.lock||LV.done);if(scene==='secret'&&typeof SEC!=='undefined'&&SEC)return!!SEC.lock;return G._busy>0}
G.locked=locked;let _lastTap={t:0,x:-99,y:-99};
C.addEventListener('pointerdown',e=>{if(PORTRAIT())return;e.preventDefault();ac();const x=(e.clientX-VVX-OX)/S,y=(e.clientY-VVY-OY)/S;PX=x;PY=y;
 const now=performance.now();if(now-_lastTap.t<170&&Math.hypot(e.clientX-_lastTap.x,e.clientY-_lastTap.y)<24)return;_lastTap={t:now,x:e.clientX,y:e.clientY};
 const mh=28/S;let best=null,bd=1e9;
 for(let i=UI.length-1;i>=0;i--){const b=UI[i];const dx=Math.abs(x-b.x),dy=Math.abs(y-b.y);if(dx<Math.max(b.w/2+6,mh)&&dy<Math.max(b.h/2+6,mh)){const inside=dx<b.w/2+6&&dy<b.h/2+6;const d=(inside?0:1e5)+Math.hypot(dx,dy);if(d<bd){bd=d;best=b}}}
 if(best){const b=best;if(b.dis)return;if(locked()&&!b.always)return;SFX.click();b.fn();return}
 if(talk&&talk.box&&skipTalk){const[bx,by,bw,bh]=talk.box;if(x>bx&&x<bx+bw&&y>by&&y<by+bh)skipTalk()}
 if(SCN&&SCN.tap)SCN.tap(x,y)},{passive:false});
['dblclick','contextmenu','gesturestart','gesturechange'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
C.addEventListener('pointermove',e=>{PX=(e.clientX-VVX-OX)/S;PY=(e.clientY-VVY-OY)/S});
let last=performance.now(),fpsA=60;
const TOUCH=(('ontouchstart' in window)||navigator.maxTouchPoints>0)&&matchMedia('(pointer:coarse)').matches;const PORTRAIT=()=>TOUCH&&H>W*1.05;
function loop(now){DT=PORTRAIT()?0:clamp((now-last)/1000,0,.05);last=now;T+=DT;fpsA=fpsA*.95+(1/Math.max(DT,.001))*.05;
 X.setTransform(DPR,0,0,DPR,0,0);X.clearRect(0,0,W,H);
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;shake*=Math.pow(.004,DT);if(shake<.3)shake=0;
 X.setTransform(DPR*S,0,0,DPR*S,DPR*(OX+sx),DPR*(OY+sy));PUI=UI;UI=[];frameBoxes();GND=[];if(G.auditReq){G.auditReq=0;AUD={t:[],c:[],h:[]};G._aud=AUD}else AUD=null;stepParticles();
 try{SCN&&SCN.draw()}catch(e){console.error(e)}
 drawParticles();if(SCN&&SCN.ui)SCN.ui();fsButton();drawTalk();
 if(fade>0){const v=vis();X.fillStyle=`rgba(8,4,20,${fade})`;X.fillRect(v.x0,v.y0,v.w,v.h);fade=Math.max(0,fade-DT*2.5)}
 if(PORTRAIT())drawRotate();
 requestAnimationFrame(loop)}
// поверни телефон: нарисованный свиток со сказочной надписью, игра на паузе
let rotT=0;function drawRotate(){rotT+=1/60;X.setTransform(DPR,0,0,DPR,0,0);const tb=IM.bg_title;if(tb&&tb.complete&&tb.naturalWidth){const k=Math.max(W/tb.naturalWidth,H/tb.naturalHeight)*1.08,dx=Math.sin(rotT*.3)*W*.02;X.save();X.filter='blur(3px) brightness(.8)';X.drawImage(tb,W/2-tb.naturalWidth*k/2+dx,H/2-tb.naturalHeight*k/2,tb.naturalWidth*k,tb.naturalHeight*k);X.restore()}
 {const g=X.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');X.fillStyle=g;X.fillRect(0,0,W,H)}
 const bw=Math.min(W*.92,560),bh=bw*.62,k=1+Math.sin(rotT*2.2)*.03;X.save();X.translate(W/2,H/2);X.rotate(Math.sin(rotT*1.4)*.05);X.scale(k,k);
 win('plaque',-bw/2,-bh/2,bw,bh);const fs=bw*.105;txt('Поверни',0,-fs*.62,fs,'#5a2a0a',{st:'rgba(255,240,205,.85)',lw:fs*.14});txt('телефон',0,fs*.62,fs,'#5a2a0a',{st:'rgba(255,240,205,.85)',lw:fs*.14});X.restore()}
// тестовый интерфейс
Object.defineProperty(G,'busy',{get:()=>G._busy>0});Object.defineProperty(G,'scene',{get:()=>scene});
G.go=n=>go(n);G.S=SV;G.pg=(x,y)=>({x:OX+x*S,y:OY+y*S});G.btns=()=>UI.map(b=>({id:b.id,x:b.x,y:b.y}));G.fps=()=>fpsA;


function loadFrac(){const n=LOADQ.filter(i=>i.src).length||1,d=LOADQ.filter(i=>i.src&&(i.complete)).length;return Math.min(1,d/n)}
SC.load={draw(){const v=vis();const g=X.createLinearGradient(0,v.y0,0,v.y0+v.h);g.addColorStop(0,'#f6d79a');g.addColorStop(1,'#c9853a');X.fillStyle=g;X.fillRect(v.x0,v.y0,v.w,v.h);
 const tb=IM.bg_title;if(tb&&tb.complete&&tb.naturalWidth){X.globalAlpha=.55;const s=Math.max(v.w/1280,v.h/720);X.drawImage(tb,640-640*s,v.y0+v.h-720*s,1280*s,720*s);X.globalAlpha=1}
 const f=loadFrac(),fs=Math.max(40,24/S);X.font=fs+'px '+(FONTOK?FONT:'serif');X.textAlign='center';X.textBaseline='middle';X.lineWidth=fs*.14;X.strokeStyle='#5a2a0a';X.fillStyle='#fff3d6';X.strokeText('Ярмарка подсказок',640,300);X.fillText('Ярмарка подсказок',640,300);
 const bw=Math.min(760,v.w-80),bh=Math.max(26,16/S),bx=640-bw/2,by=390;X.fillStyle='rgba(40,20,8,.55)';X.beginPath();X.roundRect(bx-4,by-4,bw+8,bh+8,(bh+8)/2);X.fill();X.fillStyle='#ffcf4a';X.beginPath();X.roundRect(bx,by,Math.max(bh,bw*f),bh,bh/2);X.fill();
 X.font=Math.max(26,15/S)+'px '+(FONTOK?FONT:'serif');X.fillStyle='#fff3d6';X.strokeText('Загрузка… '+Math.round(f*100)+'%',640,by+bh+Math.max(40,22/S));X.fillText('Загрузка… '+Math.round(f*100)+'%',640,by+bh+Math.max(40,22/S))}};
function startGame(){scene='load';SCN=SC.load;fade=0;requestAnimationFrame(loop);
 (document.fonts&&document.fonts.load?Promise.race([document.fonts.load('40px '+FONT),new Promise(r=>setTimeout(r,6000))]):Promise.resolve()).then(()=>{FONTOK=true});
 const chk=()=>{const t=performance.now()-LOADT0;if((loadFrac()>=1&&FONTOK&&t>500)||t>25000){LOADED=true;go('title')}else setTimeout(chk,100)};chk()}

G.gnd=()=>({S,v:vis(),scene,items:GND});

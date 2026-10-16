'use strict';
// ===== сцены и уровни «Ярмарка подсказок» (урок 638 «Логика: кто есть кто») =====
const LNAMES=['Три домика','Разбитая ваза','Дежурство','Три коробки','Большое дело'];
const ROUNDS=[3,3,3,3,3];
let LV=null;
const PN={bear:'Мишутка',bunny:'Тимоша',owl:'Соня',barsik:'Барсик'};
// ---------- точная логика: все дела — перестановки трёх; решение проверяется перебором ----------
function perms3(){return[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]}
function sols(P){return perms3().filter(p=>{const d={};P.who.forEach((w,i)=>d[w]=p[i]);return P.clues.every(c=>c.f(d))})}
const ne=(a,k)=>d=>d[a]!==k,rt=(a,b)=>d=>d[a]>d[b],nb=(a,b)=>d=>Math.abs(d[a]-d[b])===1,nx=(a,b)=>d=>d[a]===d[b]+1;
// L1 домики: место 0..2 = домик 1..3, «правее» = номер больше
const P1=[{k:'l1r0',d:'l1d0',who:['bear','barsik','owl'],clues:[{t:'Мишутка живёт не в первом домике',f:ne('bear',0)},{t:'Соня живёт правее Мишутки',f:rt('owl','bear')},{t:'Барсик живёт не в третьем домике',f:ne('barsik',2)}]},
 {k:'l1r1',who:['bunny','owl','bear'],clues:[{t:'Тимоша живёт не во втором домике',f:ne('bunny',1)},{t:'Соня живёт левее Тимоши',f:rt('bunny','owl')},{t:'Мишутка живёт не в первом домике',f:ne('bear',0)}]},
 {k:'l1r2',who:['bear','bunny','owl'],clues:[{t:'Мишутка живёт не в третьем домике',f:ne('bear',2)},{t:'Мишутка и Тимоша — соседи',f:nb('bear','bunny')},{t:'Тимоша живёт правее Сони',f:rt('bunny','owl')}]}];
// L3 дежурство: 0 вторник, 1 среда, 2 четверг
const P3=[{k:'l3r0',who:['bear','bunny','owl'],clues:[{t:'Мишутка дежурит раньше Тимоши',f:rt('bunny','bear')},{t:'Соня дежурит не в четверг',f:ne('owl',2)},{t:'Мишутка дежурит не в среду',f:ne('bear',1)}]},
 {k:'l3r1',who:['bear','bunny','owl'],clues:[{t:'Соня дежурит раньше Мишутки',f:rt('bear','owl')},{t:'Тимоша дежурит не во вторник',f:ne('bunny',0)},{t:'Мишутка дежурит не в четверг',f:ne('bear',2)}]},
 {k:'l3r2',who:['bear','bunny','owl'],clues:[{t:'Тимоша дежурит на следующий день после Сони',f:nx('bunny','owl')},{t:'Мишутка дежурит не во вторник',f:ne('bear',0)}]}];
// L5 таблица: чашки × полки (0 верх, 1 середина, 2 низ; «ниже» = больше), друзья × возраст (0→9, 1→10, 2→11)
const P5=[{k:'l5r0',kind:'cups',who:['cup_red','cup_blue','cup_green'],rows:['Красная','Синяя','Зелёная'],cols:['Верхняя','Средняя','Нижняя'],clues:[{t:'Красная — не на верхней полке',f:ne('cup_red',0)},{t:'Синяя стоит ниже красной',f:rt('cup_blue','cup_red')},{t:'Зелёная — не на нижней полке',f:ne('cup_green',2)}]},
 {k:'l5r1',kind:'ages',who:['bear','bunny','owl'],rows:['Мишутка','Тимоша','Соня'],cols:['9 лет','10 лет','11 лет'],clues:[{t:'Тимоша на год младше Сони',f:nx('owl','bunny')},{t:'Мишутка не самый старший',f:ne('bear',2)},{t:'Соня не самая младшая',f:ne('owl',0)}]},
 {k:'l5r2',kind:'cups',who:['cup_red','cup_blue','cup_green'],rows:['Красная','Синяя','Зелёная'],cols:['Верхняя','Средняя','Нижняя'],clues:[{t:'Красная — на соседней полке с синей',f:nb('cup_red','cup_blue')},{t:'Синяя — не на средней полке',f:ne('cup_blue',1)},{t:'Зелёная стоит ниже синей',f:rt('cup_green','cup_blue')}]}];
// L2 «кто солгал»: tr[i](g) — правдива ли фраза i, если виноват/лжёт g; правда у всех, кроме g
const P2=[{k:'l2r0',ev:'vase_broken',q:'Виноват один — и он же солгал',who:['bear','barsik','owl'],say:['Вазу разбил не я','Вазу разбил Мишутка','Вазу разбил Барсик'],tr:[g=>g!==0,g=>g===0,g=>g===1],
  why:['Если виноват Мишутка, то солгала и Соня: она сказала «Барсик». А лгать может только виноватый!',null,'Если виновата Соня, то солгал и Барсик: он сказал «Мишутка». А лгать может только виноватый!'],ok:'Вазу разбил Барсик: его фраза — неправда, а Мишутка и Соня сказали правду.'},
 {k:'l2r1',ev:null,q:'Ровно один из троих — лжец',who:['bear','bunny','owl'],say:['Тимоша — лжец','Соня — лжец','Мишутка говорит правду'],tr:[g=>g===1,g=>g===2,g=>g!==0],
  why:['Если лжёт Мишутка, то Тимоша честный — и тогда лжёт ещё и Соня. Лжецов двое — так нельзя!',null,'Если лжёт Соня, то лжёт и Мишутка: она сказала, что он говорит правду. Лжецов двое — так нельзя!'],ok:'Лжёт Тимоша: Соня честная, а Мишутка и Соня говорят правду.'},
 {k:'l2r2',ev:'pie',q:'Кто съел пирожок? Виноват один — и он солгал',who:['bunny','owl','bear'],say:['Это не Соня','Это Мишутка','Это не я'],tr:[g=>g!==1,g=>g===2,g=>g!==2],
  why:['Если пирожок съел Тимоша, то солгала и Соня: она сказала «Мишутка». А лгать может только виноватый!','Если пирожок съела Соня, то солгал и Тимоша: он сказал «Это не Соня». А лгать может только виноватый!',null],ok:'Пирожок съел Мишутка: «это не я» — неправда, а Тимоша и Соня сказали правду.'}];
function liarSol(P){return[0,1,2].filter(g=>P.tr.every((f,i)=>f(g)===(i!==g)))}
// L4 коробки: наклейки ш / ж / шж; содержимое — перестановка, ни одна наклейка не совпадает
const BX=['cones','acorns','mix'],BXT={cones:'шишки',acorns:'жёлуди',mix:'шишки и жёлуди'};
function boxWorlds(){const o=[];for(const p of perms3()){if(p.every((c,i)=>c!==i))o.push(p)}return o}// p[label]=content
function boxSolve(pulled){return boxWorlds().filter(p=>p[2]===BX.indexOf(pulled))}
// ---------- заставка ----------
function logo(x,y,w){const lg=UA.logo_plaque;let h=w*.42;if(okI(lg)){h=w*lg.naturalHeight/lg.naturalWidth;X.drawImage(lg,x-w/2,y-h/2,w,h)}FB.c.push({n:'plank',b:lbox(x-w*.4,y-h*.32,x+w*.4,y+h*.32)});txt('Ярмарка',x,y-h*.13,w*.11,'#ffe28a',{st:'#5a2208',lw:w*.016});txt('подсказок',x,y+h*.14,w*.11,'#ffe28a',{st:'#5a2208',lw:w*.016})}
SC.title={enter(){cast=[{n:'lyova',x:150,y:705,h:330},{n:'nika',x:1060,y:705,h:270},{n:'barsik',x:1215,y:705,h:250}]},
 draw(){bgDraw('title');motes(45);drawCast();logo(610,175+Math.sin(T*1.5)*4,580);
  win('sign',370,318,480,104);ink('Урок 638 · Логика: кто есть кто',610,370,25)},
 ui(){btn('play',610,540,300,90,'Играть!',()=>{go('intro')},{pulse:1,fs:46})}};
// ---------- вступление ----------
SC.intro={enter(){cast=[{n:'lyova',x:210,y:705,h:340},{n:'nika',x:900,y:705,h:300},{n:'barsik',x:1110,y:705,h:290}];
 run(async()=>{for(const k of['p1','p2','p3','p4','p5']){if(scene!=='intro')return;if(k==='p5')cheer();await say(k)}if(scene==='intro')go('map')})},
 draw(){bgDraw('title',.12);motes(45);drawCast()},
 ui(){btn('skip',1170,50,170,60,'Дальше ›',()=>go('map'),{always:1,fs:28})}};
// ---------- карта ----------
const MPB=[[300,430],[490,360],[680,430],[870,360],[1070,420]];let MP=MPB.map(p=>p.slice()),MK=1;const MAPI=['house_red','vase','card','box','cup_red'];
function mapLayout(){const v=vis(),si=typeof SAFE!=='undefined'?SAFE.l/Math.max(S,.01):0,safe=Math.max(si+12,20);MK=clamp(1.25-S*.45,.85,1.15)*PK();
 const tc=cast[0],timR=tc?tc.x+heroW(tc)*.5:v.x0+safe+80;const L=Math.max(timR+90*MK,v.x0+safe+100),R=Math.min(v.x0+v.w-safe-110*MK,1180);const sp=Math.min(260,Math.max(140,(R-L)/4));MK=Math.max(.75,Math.min(MK,(sp-14)/196,1.4));
 MP=MPB.map((p,i)=>[L+i*sp,(i%2?360:440)+(MK-1)*30]);MP.forEach(p=>{p[0]=clamp(p[0],v.x0+safe+80,v.x0+v.w-safe-80);p[1]=clamp(p[1],v.y0+110,v.y0+v.h-170)});
 const pts=[];for(let i=1;i<MP.length;i++){const a=MP[i-1],b=MP[i],mx=(a[0]+b[0])/2,my=Math.max(a[1],b[1])+50*MK;const n=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/(26*MK));
  for(let k=0;k<=n;k++){const u=k/n,x=(1-u)*(1-u)*a[0]+2*u*(1-u)*mx+u*u*b[0],y=(1-u)*(1-u)*a[1]+2*u*(1-u)*my+u*u*b[1];if(Math.hypot(x-a[0],y-a[1])>70*MK&&Math.hypot(x-b[0],y-b[1])>70*MK)pts.push([x,y,i,k])}}return{v,safe,pts}}
SC.map={enter(){cast=[{n:'nika',x:80,y:712,h:200}];if(!SV.seenMap){SV.seenMap=1;save();run(()=>say('map'))}},
 draw(){bgDraw('title',.25);motes(45);const{v,safe,pts}=mapLayout();
  pts.forEach(([x,y,i,k])=>{const op=i<SV.open;coinTok(x,y,6.5*MK,{rot:k*.7,a:op?.95:.7,dark:op?0:.5})});
  win('sign',470,6,340,92);ink('Карта ярмарки',640,52,34);
  const sc=SV.secret.reduce((a,b)=>a+b,0),rx=Math.min(1245,v.x0+v.w-safe)-260;win('plank',rx,22,260,46);coinTok(rx+27,45,11,{glow:sc?1:0});txt('Тайные звёзды: '+sc+'/4',rx+142,45,19,'#fff0c8',{st:'#2a1004',lw:4,maxW:200});
  MP.forEach((p,i)=>{const open=i<SV.open,cur=i===SV.open-1;const bob=open?Math.sin(T*1.6+i)*4:0;X.save();X.translate(p[0],p[1]);X.scale(MK,MK);
   spr('shadow',0,50,26,{a:.35});spr(MAPI[i],0,bob,110,{dark:open?0:.5,glow:open?(cur?1.3+Math.sin(T*4)*.4:.5):0});if(!open)spr('lock',0,bob+10,54,{a:.95});
   coinTok(46,bob-44,18,{dark:open?0:.6});txt(String(i+1),46,bob-44,22,open?'#fff3c0':'#d8cbb0',{st:'#3a1a06',lw:4});
   win('plank',-98,62,196,44);txt(LNAMES[i],0,84,19,open?'#fff0c8':'#cfc4b0',{st:'#2a1004',lw:4,maxW:164});
   for(let s=0;s<3;s++)star(-30+s*30,126,11,s<SV.stars[i]);X.restore()});
  drawCast()},
 tap(x,y){MP.forEach((p,i)=>{if(Math.abs(x-p[0])<100*MK&&y>p[1]-70*MK&&y<p[1]+140*MK){if(i<SV.open){SFX.click();go('l'+(i+1))}else{SFX.bad();oops('nika')}}})}};
// ---------- общая рамка уровня ----------
const SECRET_POS=[[1215,250],[1215,250],[1215,250],[1215,250]];
const DEF={};
function levelScene(n){SC['l'+n]={enter(){if(LV&&LV.n===n&&LV.resume){LV.resume=false;cast=LV.cast;return}
  LV={n,r:0,mist:0,done:false,banner:null,def:DEF[n],reveal:false};DEF[n].init(LV);cast=LV.cast;run(()=>DEF[n].start(LV))},
 draw(){bgDraw('l'+n,0);motes(45);if(!LV.done)DEF[n].draw(LV);drawCast();
  if(n<5&&!SV.secret[n-1]&&!LV.done){const[sx,sy]=SECRET_POS[n-1];coinTok(sx,sy,14,{a:.45+.35*Math.sin(T*3),glow:.8+.4*Math.sin(T*3),rot:T})}},
 ui(){win('sign',450,0,380,90);ink(LNAMES[n-1],640,45,28);for(let i=0;i<ROUNDS[n-1];i++)coinTok(870+i*34,45,13,{grey:i>=LV.r});
  btn('home',74,66,84,64,'⌂',()=>{go('map')},{always:1});if(!LV.done)btn('hint',1214,58,76,64,'?',()=>{if(!(talk&&/h$/.test(talk.k)))run(()=>DEF[n].hint(LV))},{fs:36});
  if(DEF[n].ui&&!LV.done)DEF[n].ui(LV);if(LV.done)endPanel(n)},
 tap(x,y){if(LV.done||LV.lock)return;if(n<5&&!SV.secret[n-1]){const[sx,sy]=SECRET_POS[n-1];if(Math.hypot(x-sx,y-sy)<44){LV.resume=true;go('secret',n);return}}if(DEF[n].tap)DEF[n].tap(LV,x,y)}}}
function banner(t,bad,y){LV.banner={t,bad,t0:T,y}}
async function roundDone(){LV.r++;LV.banner=null;if(LV.r>=ROUNDS[LV.n-1]){LV.done=true;LV.doneT=T;const st=LV.mist===0?3:LV.mist<=2?2:1;LV.stars=st;SV.stars[LV.n-1]=Math.max(SV.stars[LV.n-1],st);SV.open=Math.max(SV.open,Math.min(5,LV.n+1));save();cheer();const cx_=ctxNow();for(let i=0;i<3;i++)setTimeout(()=>{if(i<st&&alive(cx_)){SFX.star();burst(560+i*80,368,24,'spark',48)}},500+i*350);if(LV.n<5)await say('win');return true}return false}
function endPanel(n){win('plaque',330,110,620,420);ink(n<5?'Дело раскрыто!':'Все дела раскрыты!',640,215,40,{col:'#8a4a08'});
 for(let i=0;i<3;i++){const k=ease((T-LV.doneT-.5-i*.35)*3);star(560+i*80,320,30,i<LV.stars&&k>0,k>0?.4+.6*k:1)}
 ink(LV.mist===0?'Без единой ошибки!':'Ошибок: '+LV.mist,640,420,28);
 btn('map',520,600,200,70,'Карта',()=>go('map'),{always:1});
 if(n<5)btn('next',770,600,220,70,'Дальше ›',()=>go('l'+(n+1)),{always:1,pulse:1});else btn('fin',770,600,220,70,'Финал ›',()=>go('fin'),{always:1,pulse:1})}
// ---------- общие рисовалки ----------
function tok(n,x,y,h,o){o=o||{};const i=UA[n]&&okI(UA[n])?UA[n]:IM[n];if(!okI(i))return;const w=h*i.naturalWidth/i.naturalHeight;X.save();X.translate(x,y);if(o.sc)X.scale(o.sc,o.sc);if(o.a!=null)X.globalAlpha*=o.a;
 if(o.glow){X.save();X.globalCompositeOperation='lighter';X.globalAlpha*=.3*o.glow;X.drawImage(i,-w*.56,-h*1.04,w*1.12,h*1.08);X.restore()}X.drawImage(i,-w/2,-h,w,h);X.restore();if(o.gl!=null){const k=o.sc||1;GND.push({n,x,feet:y,gls:[o.gl],w:w*k,h:h*k,nr:i.naturalWidth/i.naturalHeight})}return w}
function clueBox(L,P,y0){const n=P.clues.length,lh=38,h=n*lh+92,x=250,w=780;win('sign',x,y0,w,h,false,'clues');
 P.clues.forEach((c,i)=>{const y=y0+h*.505-(n-1)*lh/2+i*lh;const st=L.cst&&L.cst[i];ink((i+1)+'. '+c.t,x+w/2+(st!=null?18:0),y,26,{col:'#4a2208'});if(st!=null){X.save();X.font='27px '+FONT;const tw=X.measureText((i+1)+'. '+c.t).width;X.restore();spr(st?'tick':'redx',x+w/2+18-tw/2-30,y,36)}})}
function nameTag(n,x,y,fs){X.font=(fs||22)+'px '+FONT;const w=Math.max(110,X.measureText(PN[n]).width+44);win('plank',x-w/2,y-20,w,40);txt(PN[n],x,y,fs||22,'#fff0c8',{st:'#2a1004',lw:4})}
// ---------- задачи на расстановку (домики / дежурство) ----------
function assignLevel(n,o){DEF[n]={init(L){L.cast=[{n:'lyova',x:70,y:712,h:260},{n:'nika',x:1215,y:712,h:240}]},
 setR(L){L.P=o.P[L.r];L.pos={};L.sel=null;L.cst=null;L.banner=null;L.solved=false;L.lock=false},
 async start(L){this.setR(L);await say(o.intro);await say(L.P.k)},
 slotXY(i){return[o.sx[i],o.sy]},trayXY(j){return[470+j*170,gY(640)]},
 draw(L){const P=L.P;if(!P)return;clueBox(L,P,96);
  for(let i=0;i<3;i++){const[x,y]=this.slotXY(i);o.drawSlot(i,x,y,L)}
  P.who.forEach((w,j)=>{const s=L.pos[w];let x,y,h;if(s!=null){[x,y]=this.slotXY(s);y+=o.py;h=118}else{[x,y]=this.trayXY(j);h=140}
   const sel=L.sel===w;tok(w,x,y-(sel?8+Math.sin(T*6)*4:0),h,{glow:sel?1.4:0,gl:s==null&&!sel?gY(640):null});if(s==null)nameTag(w,x,y+20,20)})},
 // тап-выбор → тап-место. Тап по поставленному жильцу — выбрать; второй тап по нему же — вернуть на лужайку.
 // Тап по занятому домику без выбора — взять его жильца. Поставить выбранного в занятый домик — поменять местами.
 tap(L,x,y){if(L.solved)return;const P=L.P;
  for(let j=0;j<3;j++){const w=P.who[j];const s=L.pos[w];let[tx,ty]=s!=null?this.slotXY(s):this.trayXY(j);if(s!=null)ty+=o.py;if(Math.abs(x-tx)<75&&y>ty-150&&y<ty+34){SFX.click();L.cst=null;L.banner=null;
    if(L.sel===w){if(s!=null)delete L.pos[w];L.sel=null}else L.sel=w;return}}
  for(let i=0;i<3;i++){const[sx,sy]=this.slotXY(i);if(Math.abs(x-sx)<o.sw/2&&Math.abs(y-sy)<o.sh/2){const prev=Object.keys(L.pos).find(k=>L.pos[k]===i);
    if(!L.sel){if(prev){SFX.click();L.sel=prev;L.cst=null}else run(()=>say('pick'));return}
    if(prev===L.sel){L.sel=null;return}
    const from=L.pos[L.sel];if(prev){if(from!=null)L.pos[prev]=from;else delete L.pos[prev]}L.pos[L.sel]=i;SFX.clang();L.sel=null;L.cst=null;L.banner=null;if(Object.keys(L.pos).length===3)run(()=>this.check(L));return}}
  if(L.sel&&L.pos[L.sel]!=null&&y>gY(640)-160){SFX.click();delete L.pos[L.sel];L.sel=null;L.cst=null}},
 async check(L){const P=L.P;const d=L.pos;L.cst=P.clues.map(c=>c.f(d));const bad=L.cst.indexOf(false);
  if(bad>=0){L.mist++;SFX.bad();oops('lyova');banner('Подсказка '+(bad+1)+' не сходится. '+o.fixMsg,true,600);stopTalk();await say('no');return}
  L.solved=true;L.lock=true;SFX.ok();cheer();burst(640,330,30,'spark',48);await say('ok');if(P.d)await say(P.d);await wait(500);
  if(!await roundDone()){this.setR(L);await say(L.P.k)}},
 async hint(L){L.reveal=true;await say(o.hint)},
 info(L){const P=L.P;const s=sols(P);return{r:L.r,n:s.length,sol:s[0],who:P.who}},
 // для теста: тапы для правильного ответа и для ошибки
 taps(L,good){const P=L.P;const s=sols(P)[0];let p=s;if(!good){p=perms3().find(q=>{const d={};P.who.forEach((w,i)=>d[w]=q[i]);return!P.clues.every(c=>c.f(d))})}
  const out=[],pos={...L.pos};P.who.forEach((w,j)=>{if(pos[w]===p[j])return;let tx,ty;if(pos[w]!=null){[tx,ty]=this.slotXY(pos[w]);ty+=o.py}else[tx,ty]=this.trayXY(j);out.push([tx,ty-50]);const[sx,sy]=this.slotXY(p[j]);out.push([sx,sy-60]);const prev=Object.keys(pos).find(k=>pos[k]===p[j]);const from=pos[w];if(prev){if(from!=null)pos[prev]=from;else delete pos[prev]}pos[w]=p[j]});return out}};levelScene(n)}
assignLevel(1,{P:P1,intro:'l1i',hint:'l1h',sx:[400,640,880],sy:408,sw:230,sh:220,py:100,fixMsg:'Поменяй жильцов местами.',
 drawSlot(i,x,y,L){spr(['house_red','house_blue','house_green'][i],x,y,220);coinTok(x-92,y+72,26);txt(String(i+1),x-92,y+72,34,'#fff3c0',{st:'#3a1a06',lw:5})}});
const DAYS=['Вторник','Среда','Четверг'];
assignLevel(3,{P:P3,intro:'l3i',hint:'l3h',sx:[400,640,880],sy:418,sw:220,sh:210,py:92,fixMsg:'Поменяй дежурных местами.',
 drawSlot(i,x,y,L){spr('card',x,y,200);win('plank',x-92,y-100,184,50);txt(DAYS[i],x,y-75,28,'#fff0c8',{st:'#2a1004',lw:4})}});
// ---------- УРОВЕНЬ 2: кто солгал ----------
const SX2=[420,640,860];
DEF[2]={init(L){L.cast=[{n:'lyova',x:70,y:712,h:260},{n:'nika',x:1215,y:712,h:240}]},
 setR(L){L.P=P2[L.r];L.tried={};L.banner=null;L.solved=false;L.lock=false},
 async start(L){this.setR(L);await say('l2i');await say(L.P.k)},
 draw(L){const P=L.P;if(!P)return;win('pryanik',310,90,660,100,false,'clues');ink(P.q,640,140,26,{col:'#4a2208'});
  P.who.forEach((w,i)=>{const x=SX2[i];win('bubble',x-108,194,216,150,i===2,'stmt');X.font='26px '+FONT;const Ls=[PN[w]+':',...wrap('«'+P.say[i]+'»',170)];Ls.forEach((l,k)=>txt(l,x,254+(k-(Ls.length-1)/2)*29,k?25:23,k?'#2a1004':'#8a3a0a',{st:'rgba(255,244,220,.7)',lw:3}));
   const tr=L.tried[w];tok(w,x,gY(590),200,{gl:gY(590),a:tr?.6:1,glow:L.solved&&i===liarSol(P)[0]?1.4:0});if(tr)spr('redx',x+56,420,60);if(L.solved&&i===liarSol(P)[0])spr('tick',x+56,420,64)});
  if(L.P.ev)spr(L.P.ev,1010,560,90)},
 tap(L,x,y){if(L.solved)return;const P=L.P;P.who.forEach((w,i)=>{if(Math.abs(x-SX2[i])<85&&y>gY(590)-220&&y<gY(590)+30&&!L.tried[w])run(()=>this.pick(L,i))})},
 async pick(L,i){const P=L.P;const g=liarSol(P)[0];if(i!==g){L.mist++;L.tried[P.who[i]]=1;SFX.bad();oops('lyova');banner(P.why[i],true);stopTalk();await say('l2w');return}
  L.solved=true;L.lock=true;L.banner=null;SFX.ok();cheer();burst(SX2[i],420,30,'spark',48);banner(P.ok,false);await say('ok');await wait(1600);L.banner=null;if(!await roundDone()){this.setR(L);await say(L.P.k)}},
 async hint(L){L.reveal=true;await say('l2h')},
 info(L){return{r:L.r,ans:liarSol(L.P)}},
 taps(L,good){const g=liarSol(L.P)[0];const i=good?g:[0,1,2].find(j=>j!==g&&!L.tried[L.P.who[j]]);return[[SX2[i],480]]}};levelScene(2);
// ---------- УРОВЕНЬ 4: коробки с неверными наклейками ----------
// rounds: r0 — откуда тянуть; r1/r2 — достали предмет, найди коробку со смесью
const R4=[{k:'l4r0',ask:'pull'},{k:'l4r1',ask:'mix',pulled:'cones'},{k:'l4r2',ask:'mix',pulled:'acorns'}];
DEF[4]={init(L){L.cast=[{n:'lyova',x:70,y:712,h:260},{n:'barsik',x:1210,y:712,h:240}]},
 setR(L){L.R=R4[L.r];L.ord=shuffle([0,1,2]);L.tried={};L.banner=null;L.solved=false;L.show=null;L.lock=false},
 async start(L){this.setR(L);await say('l4i');await say(L.R.k)},
 bx(L,lab){return[[400,640,880][L.ord.indexOf(lab)],430]},
 answer(L){const R=L.R;if(R.ask==='pull')return 2;const w=boxSolve(R.pulled)[0];return w.indexOf(2)},// наклейка коробки со смесью
 draw(L){const R=L.R;if(!R)return;win('pryanik',290,90,700,100,false,'clues');ink(R.ask==='pull'?'Все наклейки неверные!':'Достали '+(R.pulled==='cones'?'шишку':'жёлудь')+'. Где смесь?',640,140,27,{col:'#4a2208'});
  const world=R.pulled?boxSolve(R.pulled)[0]:null;
  for(let lab=0;lab<3;lab++){const[x,y]=this.bx(L,lab);spr('box',x,y,230,{a:L.tried[lab]?.65:1});win('plank',x-104,y+6,208,84);X.font='27px '+FONT;const Ls=wrap(BXT[BX[lab]],170);Ls.forEach((l,k)=>txt(l,x,y+48+(k-(Ls.length-1)/2)*30,27,'#fff0c8',{st:'#2a1004',lw:4}));
   if(L.tried[lab])spr('redx',x+70,y-80,56);
   if(R.pulled&&lab===2){spr('shadow',x,y-112,20,{a:.5});spr(R.pulled,x,y-170+Math.sin(T*3)*6,110,{glow:1.4})}
   if(L.solved&&world){const c=BX[world[lab]];if(c==='mix'){spr('cones',x-30,y-130,70);spr('acorns',x+30,y-130,70)}else if(lab!==2)spr(c,x,y-135,80)}
   if(L.solved&&!world&&lab===2)spr('tick',x+70,y-80,60)}},
 tap(L,x,y){if(L.solved)return;for(let lab=0;lab<3;lab++){const[bx,by]=this.bx(L,lab);if(Math.abs(x-bx)<100&&Math.abs(y-by)<110&&!L.tried[lab]){run(()=>this.pick(L,lab));return}}},
 async pick(L,lab){const R=L.R,a=this.answer(L);
  if(lab!==a){L.mist++;L.tried[lab]=1;L.lock=false;SFX.bad();oops('lyova');
   const oth=R.pulled==='cones'?'acorns':'cones';const other=[0,1].find(j=>j!==lab);
   banner(R.ask==='pull'?'В коробке «'+BXT[BX[lab]]+'» может лежать смесь, а может — что-то одно. Один предмет не скажет всего!':
    lab===2?'Из этой коробки достали '+(R.pulled==='cones'?'шишку':'жёлудь')+', а смеси в ней нет: наклейка «шишки и жёлуди» неверна. Значит, тут только '+BXT[R.pulled]+'!':
    'Если смесь в коробке «'+BXT[BX[lab]]+'», то в коробке «'+BXT[BX[other]]+'» — только '+BXT[oth]+'. Но наклейки все неверные!',true);stopTalk();await say('no');return}
  L.solved=true;L.lock=true;SFX.ok();cheer();burst(this.bx(L,lab)[0],330,30,'spark',48);await say('ok');if(R.ask==='pull')await say('l4d');await wait(900);if(!await roundDone()){this.setR(L);await say(L.R.k)}},
 async hint(L){L.reveal=true;await say('l4h')},
 info(L){return{r:L.r,ans:this.answer(L)}},
 taps(L,good){const a=this.answer(L);const lab=good?a:[0,1,2].find(j=>j!==a&&!L.tried[j]);return[this.bx(L,lab)]}};levelScene(4);
// ---------- УРОВЕНЬ 5: большая таблица «да / нет» ----------
const TB={x0:390,y0:364,cw:136,ch:108};function cellC(r,c){return[TB.x0+c*TB.cw+TB.cw/2,TB.y0+r*TB.ch+TB.ch/2]}
DEF[5]={init(L){L.cast=[{n:'lyova',x:70,y:712,h:260}]},
 setR(L){L.P=P5[L.r];L.g=[[0,0,0],[0,0,0],[0,0,0]];L.m=[null,null,null];L.cst=null;L.banner=null;L.solved=false;L.lock=false},
 async start(L){this.setR(L);await say('l5i');await say(L.P.k)},
 // клетка: тап → звёздочка «да» → крестик «нет» → пусто. Ответ = по одной звёздочке в каждой строке, в разных столбцах
 syncM(L){L.m=L.g.map(r=>r.filter(v=>v===1).length===1?r.indexOf(1):null)},
 draw(L){const P=L.P;if(!P)return;clueBox(L,P,96);
  P.cols.forEach((c,j)=>{const[x]=cellC(0,j);txt(c,x,TB.y0-24,26,'#5a2a0a',{st:'rgba(255,240,205,.85)',lw:4,maxW:132})});
  P.rows.forEach((rw,i)=>{const[,y]=cellC(i,0);if(P.kind==='cups')spr(P.who[i],TB.x0-110,y-4,66);else tok(P.who[i],TB.x0-118,y+40,84);txt(rw,TB.x0-48,y+26,20,'#5a2a0a',{st:'rgba(255,240,205,.85)',lw:4,maxW:96});
   for(let j=0;j<3;j++){const[x,y2]=cellC(i,j);win('gframe',x-TB.cw*.47,y2-TB.ch*.47,TB.cw*.94,TB.ch*.94,false,'cell');
    const v=L.g[i][j];if(v===1)star(x,y2,30,true,1+.06*Math.sin(T*4));else if(v===2)spr('redx',x,y2,50,{a:.85})}});
  const sx=1040;const mm=L.m.every(v=>v!=null)&&new Set(L.m).size===3?L.m:[null,null,null];
  if(P.kind==='cups'){for(let s=0;s<3;s++){const y=330+s*105;spr('shelf',sx,y+30,40);const i=mm.indexOf(s);if(i>=0)spr(P.who[i],sx,y-8,64)}}
  else{P.who.forEach((w,i)=>{if(mm[i]!=null){const y=320+i*100;coinTok(sx+50,y,26);txt(String(9+mm[i]),sx+50,y,30,'#fff3c0',{st:'#3a1a06',lw:5});tok(w,sx-20,y+40,84)}})}},
 tap(L,x,y){if(L.solved)return;for(let i=0;i<3;i++)for(let j=0;j<3;j++){const[cx,cy]=cellC(i,j);if(Math.abs(x-cx)<TB.cw/2&&Math.abs(y-cy)<TB.ch/2){SFX.click();L.cst=null;L.banner=null;
   L.g[i][j]=(L.g[i][j]+1)%3;this.syncM(L);
   const full=L.g.every(r=>r.filter(v=>v===1).length===1)&&L.m.every(v=>v!=null)&&new Set(L.m).size===3;if(full)run(()=>this.check(L));return}}},
 async check(L){const P=L.P,d={};P.who.forEach((w,i)=>d[w]=L.m[i]);L.cst=P.clues.map(c=>c.f(d));const bad=L.cst.indexOf(false);
  if(bad>=0){L.mist++;SFX.bad();oops('lyova');stopTalk();await say('no');return}
  L.solved=true;L.lock=true;SFX.ok();cheer();burst(640,420,40,'spark',48);await say('ok');await wait(700);if(L.r===2){await say('l5end')}if(!await roundDone()){this.setR(L);await say(L.P.k)}},
 async hint(L){L.reveal=true;await say('l5h')},
 info(L){const s=sols(L.P);return{r:L.r,n:s.length,sol:s[0]}},
 taps(L,good){const P=L.P;let p=sols(P)[0];if(!good)p=perms3().find(q=>{const d={};P.who.forEach((w,i)=>d[w]=q[i]);return!P.clues.every(c=>c.f(d))});const out=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(p[i]!==j&&L.g[i][j]===1)out.push(cellC(i,j));for(let i=0;i<3;i++){let v=L.g[i][p[i]];while(v!==1){out.push(cellC(i,p[i]));v=(v+1)%3}}return out}};levelScene(5);
// ---------- тайные комнаты ----------
const SECRETS=[{k:'s1',o:['3','6','2'],a:0,why:'По одному утёнку каждого цвета: всего 3. «Все, кроме двух, — рыжие» — значит, не рыжих ровно двое.'},
 {k:'s2',o:['Синяя','Красная','Зелёная'],a:1,why:'Синяя левее красной, красная левее зелёной: синяя, красная, зелёная. В середине — красная.'},
 {k:'s3',o:['5','7','2'],a:0,why:'«Кроме двух» — значит, не полосатых двое: 7 − 2 = 5.'},
 {k:'s4',o:['2013','2014','2015'],a:2,why:'Соня младше всех — значит, родилась позже всех: в 2015 году.'}];
let SEC=null;
SC.secret={enter(n){SEC={n,i:n-1,why:null};cast=[{n:'barsik',x:150,y:712,h:250}];run(async()=>{await say('sec');await say(SECRETS[n-1].k)})},
 draw(){bgDraw('l'+SEC.n,.35);motes(45);const s=SECRETS[SEC.i];win('plaque',240,40,800,560);ink('Тайная комната',640,150,40,{col:'#8a4a08'});
  para(LINES[s.k].t,640,225,560,26);
  if(SEC.why)para(SEC.why,640,445,560,23,{col:SEC.ok?'#1a5a10':'#8a1a08'});
  if(SEC.ok)coinTok(640,340,56,{sc:1+.1*Math.sin(T*5),glow:1.6,rot:Math.sin(T*3)*.3});drawCast()},
 ui(){const s=SECRETS[SEC.i];if(!SEC.ok)s.o.forEach((o,i)=>btn('o'+i,440+i*200,340,170,70,o,()=>ansS(i),{fs:o.length>3?28:40}));
  btn('back',1170,50,170,60,'‹ Назад',()=>go('l'+SEC.n),{always:1,fs:28})}};
function ansS(i){if(SEC.lock)return;const s=SECRETS[SEC.i];run(async()=>{if(i!==s.a){SFX.bad();oops('barsik');SEC.why=s.why;SEC.bad=i;stopTalk();await say('secw');return}
 SEC.lock=1;SEC.ok=1;SEC.why=s.why;SV.secret[SEC.i]=1;save();SFX.star();burst(640,330,50,'spark',48);cheer();await say('secok');await wait(600);go('l'+SEC.n)})}
// ---------- финал ----------
SC.fin={enter(){cast=[{n:'lyova',x:200,y:705,h:340},{n:'nika',x:900,y:705,h:300},{n:'barsik',x:1110,y:705,h:290}];
 run(async()=>{cheer();await say('fin');await say('l5end')})},
 draw(){bgDraw('title',.05);motes(45);if(Math.random()<.2)burst(rnd(100,1180),rnd(80,300),8,'spark',48,.6);if(Math.random()<.01)cheer();
  win('sign',330,10,620,150);ink('Все дела раскрыты!',640,85,46,{col:'#7a3a0a'});const st=SV.stars.reduce((a,b)=>a+b,0);
  win('plank',340,166,600,66);txt('Звёзд: '+st+' из 15 · тайных: '+SV.secret.reduce((a,b)=>a+b,0)+' из 4',640,199,24,'#fff0c8',{st:'#2a1004',lw:4});
  ['bear','bunny','owl'].forEach((w,i)=>{const hp=Math.abs(Math.sin(T*3+i))*14;tok(w,470+i*130,gY(688)-hp,150,hp<.5?{gl:gY(688)}:{})});drawCast()},
 ui(){btn('map',1150,60,160,60,'Карта',()=>go('map'),{always:1,fs:28})}};
// ---------- API для тестов ----------
G.info=()=>LV&&scene[0]==='l'?LV.def.info(LV):scene==='secret'?{sec:SEC.i,a:SECRETS[SEC.i].a}:{};
G.taps=good=>LV.def.taps(LV,good);G.LV=()=>LV;G.cast=()=>cast;G.T=()=>T;G.waiting=()=>!G.busy;
G.secretXY=()=>{const p=SECRET_POS[LV.n-1];return{x:p[0],y:p[1]}};G.mp=()=>MP;
G.selftest=()=>{const e=[];const chk=(nm,P,want)=>{const s=sols(P);if(s.length!==1)e.push(nm+' sols '+s.length);else if(want&&s[0].join('')!==want)e.push(nm+' ans '+s[0].join(''));
};
 // ответы урока 638: дома Б1 М2 С3; дежурство М-вт С-ср Т-чт; чашки К-ср С-низ З-верх; возраст М9 Т10 С11
 chk('L1r0',P1[0],'102');chk('L1r1',P1[1],'201');chk('L1r2',P1[2],'120');chk('L3r0',P3[0],'021');chk('L3r1',P3[1],'120');chk('L3r2',P3[2],'210');
 chk('L5r0',P5[0],'120');chk('L5r1',P5[1],'012');chk('L5r2',P5[2],'102');
 const l2=P2.map(liarSol);if(l2.some(s=>s.length!==1))e.push('L2 not unique '+JSON.stringify(l2));if(l2[0][0]!==1||l2[1][0]!==1||l2[2][0]!==2)e.push('L2 ans '+JSON.stringify(l2));
 if(boxWorlds().length!==2)e.push('boxes worlds');if(boxSolve('cones').length!==1||boxSolve('acorns').length!==1)e.push('boxes unique');
 if(boxSolve('cones')[0].indexOf(2)!==1||boxSolve('acorns')[0].indexOf(2)!==0)e.push('boxes ans');
 [0,1].forEach(lab=>{const c=new Set(boxWorlds().map(p=>p[lab]));if(c.size<2)e.push('box '+lab+' would be enough')});
 return e};

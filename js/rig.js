'use strict';
// ===== Живые герои: голова (наклон, кивки, squash-talk по громкости голоса), подвижные части, дыхание, прыжки, эмоции =====
// r=[x0,y0,x1,y1] доли спрайта, p=точка вращения. Головы-виземы — см. tools/ART_NEEDED.md (пока squash-talk)
const RIG={
 lyova:{head:{r:[.12,0,.98,.36],p:[.5,.34]},parts:[]},
 nika:{head:{r:[.04,0,.98,.37],p:[.5,.35]},parts:[]},
 barsik:{head:{r:[0,0,1,.40],p:[.5,.38]},parts:[]}};
let AN=null,AMP=0;const _abuf=new Uint8Array(512);
function attachAnalyser(a){try{const ctx=ac();if(!ctx)return;const s=ctx.createMediaElementSource(a),an=ctx.createAnalyser();an.fftSize=512;s.connect(an);an.connect(ctx.destination);AN=an}catch(e){AN=null}}
function ampNow(c){if(!(talk&&talk.who===c.n))return 0;if(AN&&!G.fast){AN.getByteTimeDomainData(_abuf);let s=0;for(let i=0;i<_abuf.length;i++){const v=(_abuf[i]-128)/128;s+=v*v}const r=Math.sqrt(s/_abuf.length);AMP=AMP*.5+clamp(r*5,0,1)*.5;return AMP}
 const t=T-talk.t0;const syl=Math.sin(t*11.5)*.5+.5,word=Math.sin(t*2.1+1)>-.55?1:0;return word*(.15+.85*syl)}
function clipExcept(w,h,rects){X.beginPath();X.rect(-w*.3,-h*.3,w*1.6,h*1.6);rects.forEach(r=>{X.moveTo(r[0]*w,r[1]*h);X.lineTo(r[0]*w,r[3]*h);X.lineTo(r[2]*w,r[3]*h);X.lineTo(r[2]*w,r[1]*h);X.closePath()});X.clip('evenodd')}
function drawPart(im,w,h,r,p,ang){X.save();X.translate(p[0]*w,p[1]*h);X.rotate(ang||0);X.translate(-p[0]*w,-p[1]*h);
 X.beginPath();X.rect(r[0]*w-1,r[1]*h-1,(r[2]-r[0])*w+2,(r[3]-r[1])*h+2);X.clip();X.drawImage(im,0,0,w,h);X.restore()}
function mood(n,m){const c=cast.find(c=>c.n===n);if(c){c.mood=m;c.moodT=T}}
function swing(n){const c=cast.find(c=>c.n===n);if(c){c.fid='hop';c.fid0=T}}
function drawHero(c){const im=IM[c.n],R=RIG[c.n]||{head:{r:[0,0,1,.001],p:[.5,.5]},parts:[]};if(!okI(im))return;const ph=c.x*.013;const talking=talk&&talk.who===c.n;
 if(!c.fidT)c.fidT=T+rnd(3,7);if(T>c.fidT&&!c.fid){c.fid={lyova:'sway',nika:'hop',barsik:Math.random()<.5?'flap':'hop'}[c.n]||'sway';c.fid0=T}
 if(c.fid){c.fidK=(T-c.fid0)/1.2;if(c.fidK>=1){c.fid=null;c.fidT=T+rnd(4,8)}}
 // дыхание — только равномерный масштаб (пропорции спрайта не меняются), опора — ступни; прыжки начинаются и заканчиваются на земле
 const br=1+Math.sin(T*2.2+ph)*.008;let dy=0,rot=Math.sin(T*1.3+ph)*.012;
 if(c.fid==='hop'){const k=c.fidK;dy-=Math.abs(Math.sin(k*Math.PI*2))*14}
 if(c.fid==='sway')rot+=Math.sin(c.fidK*Math.PI*2)*.05;
 if(c.fid==='flap'){dy-=Math.sin(c.fidK*Math.PI)*10}
 if(c.jump&&T>c.jump&&T-c.jump<.75){const u=(T-c.jump)/.75;dy-=Math.sin(u*Math.PI)*70}
 const puz=c.wob&&T-c.wob<1.6?1-(T-c.wob)/1.6:0;
 const hit=c.hit&&T-c.hit<1?1-(T-c.hit):0;if(hit){rot+=Math.sin((T-c.hit)*16)*.07*hit}
 const sx=br,sy=br;
 const h=c.h,w=h*im.naturalWidth/im.naturalHeight;GND.push({n:c.n,hero:1,x:c.x,feet:c.y,gl:c.y,gls:[gY()],w:w*sx,h:h*sy,nr:im.naturalWidth/im.naturalHeight});
 const lk=G.look||{x:PX,y:PY};const dir=clamp((lk.x-c.x)/600,-1,1)*(c.flip?-1:1);
  let headA=dir*.05+Math.sin(T*.9+ph)*.02+puz*.15*Math.sin(Math.min(1,(1-puz)*8)*1.57)+(talking?Math.sin((T-talk.t0)*3.3)*.025:0);
 if(c.mood==='laugh'&&T-c.moodT<1.5)headA+=Math.sin(T*28)*.05;
 X.save();X.translate(c.x,c.y);FB.h.push({n:c.n,b:lbox(-w*.33,-h*.95,w*.33,-h*.05)});if(AUD)(AUD.hf=AUD.hf||[]).push({n:c.n,b:tbox(-w/2,-h,w/2,0)});if(AUD)AUD.h.push({n:c.n,b:tbox(-w*.33,-h*.95,w*.33,-h*.05)});
 const sh=UA.shadow;if(okI(sh)){X.globalAlpha=.55;X.drawImage(sh,-w*.45,-w*.07,w*.9,w*.14);X.globalAlpha=1}
 X.translate(0,dy);X.rotate(rot);X.scale(sx*(c.flip?-1:1),sy);X.translate(-w/2,-h);
 const rects=[R.head.r,...R.parts.map(p=>p.r)];
 X.save();clipExcept(w,h,rects);X.drawImage(im,0,0,w,h);X.restore();
 R.parts.forEach(p=>drawPart(im,w,h,p.r,p.p,p.f?p.f(T+ph,c):0));
 X.save();const hp=R.head.p;X.translate(hp[0]*w,hp[1]*h);X.rotate(headA);
 X.translate(-hp[0]*w,-hp[1]*h);
 X.save();X.beginPath();const hr=R.head.r;X.rect(hr[0]*w-1,hr[1]*h-1,(hr[2]-hr[0])*w+2,(hr[3]-hr[1])*h+2);X.clip();X.drawImage(im,0,0,w,h);X.restore();
 const hf=HF[c.n];if(hf){let vf=visFor(c);if(vf===0&&blinkOn(c))vf=5;const v=UA['v_'+c.n+vf];if(okI(v)){const hw=hf[2]*w,hh=hw*v.naturalHeight/v.naturalWidth;X.drawImage(v,hf[0]*w-hw/2,hf[1]*h-hh/2,hw,hh)}
  if(hf[3]){X.beginPath();X.rect(-w,-h,w*3,h+hf[3]*h);X.clip();X.drawImage(im,0,0,w,h)}}
 X.restore();X.restore();
 if(puz>0&&true)REACT.push({t:'?',x:c.x+Math.sin(T*6)*4,y:c.y-h*1.02+dy-10*Math.sin(puz*3),s:44*Math.min(1,puz*3),col:'#ffe066',c});
 if(c.mood==='laugh'&&T-c.moodT<1.5)REACT.push({t:c.n==='barsik'?'Мур!':'Ха-ха!',x:c.x,y:c.y-h*1.05,s:40,col:'#ffe9a0',c})}
const HF={};
// 0 закрыт · 1 приоткрыт · 2 широко · 3 «О» · 4 улыбка · 5 моргание — по громкости голоса
function visFor(c){if(c.forceV!=null)return c.forceV;const talking=talk&&talk.who===c.n;
 if(talking){if(!c.vs)c.vs={f:0,t:0,env:0};const v=c.vs;const a=ampNow(c);v.env=v.env*.6+a*.4;
  const tgt=v.env<.1?0:v.env<.28?1:v.env<.55?(Math.floor(T*4.3+c.x)%3===0?3:1):2;if(T-v.t>.085&&tgt!==v.f){v.f=tgt;v.t=T}return v.f}
 if(c.wob&&T-c.wob<1.2)return 3;if(c.jump&&T-c.jump<1.2)return 4;if(c.mood==='happy'&&T-c.moodT<2)return 4;if(c.mood==='laugh'&&T-c.moodT<1.6)return 4;if(c.n==='flint'&&c.hit&&T-c.hit<1)return 3;return 0}
function blinkOn(c){if(c.forceV!=null)return false;if(!c.blN){c.blN=T+rnd(1,4);c.bl2=0}if(T>c.blN+.12){if(!c.bl2&&Math.random()<.25){c.bl2=1;c.blN=T+.12}else{c.bl2=0;c.blN=T+rnd(2.5,5)}}return T>=c.blN&&T<c.blN+.12}
G.vis=n=>{const c=cast.find(c=>c.n===n);return c?visFor(c):-1};
const REACT=[];
// реплики-реакции рисуются поверх всего и никогда не залезают на облачко речи
function drawReacts(){const box=talk&&talk.box;for(const r of REACT){if(r.s<4)continue;X.font=r.s+'px '+FONT;const w=X.measureText(r.t).width+12,h=r.s*1.1;
 const hit=(x,y)=>box&&x+w/2>box[0]-6&&x-w/2<box[0]+box[2]+6&&y+h/2>box[1]-6&&y-h/2<box[1]+box[3]+6;
 const hw=r.c.h*.35;const cand=[[r.x,r.y],[r.x+(r.c.x>640?-1:1)*(hw+w/2),r.y+r.c.h*.25],[r.x-(r.c.x>640?-1:1)*(hw+w/2),r.y+r.c.h*.25],[r.x,box?box[1]-h/2-8:r.y],[r.x,r.y+r.c.h*.45]];
 let p=null;for(const q of cand){q[0]=clamp(q[0],w/2+4,1276-w/2);q[1]=clamp(q[1],h/2+4,716-h/2);if(!hit(q[0],q[1])){p=q;break}}if(!p)p=cand[0];
 r.px=p[0];r.py=p[1];txt(r.t,p[0],p[1],r.s,r.col)}G.reacts=REACT.map(r=>{X.font=r.s+'px '+FONT;return{t:r.t,x:r.px,y:r.py,w:X.measureText(r.t).width,h:r.s}});G.rbox=box;REACT.length=0}

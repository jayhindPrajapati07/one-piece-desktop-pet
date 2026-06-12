'use strict';
// Vector character renderer — Canvas 2D API
// ctx is pre-translated by renderer: (S.cx-100, S.animOffset)
// Draw at S.cx=100, S.cy=155 in local space

// ─── Primitives ──────────────────────────────────────────────────────────────
function circ(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function elps(ctx,x,y,rx,ry,rot=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);ctx.fill();}
function rrect(ctx,x,y,w,h,r=4){
  const s=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+s,y);ctx.lineTo(x+w-s,y);ctx.arcTo(x+w,y,x+w,y+s,s);
  ctx.lineTo(x+w,y+h-s);ctx.arcTo(x+w,y+h,x+w-s,y+h,s);
  ctx.lineTo(x+s,y+h);ctx.arcTo(x,y+h,x,y+h-s,s);
  ctx.lineTo(x,y+s);ctx.arcTo(x,y,x+s,y,s);
  ctx.closePath();ctx.fill();
}
function tri(ctx,x1,y1,x2,y2,x3,y3){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.closePath();ctx.fill();
}

// ─── Shared face features ─────────────────────────────────────────────────────
function faceEyes(ctx,lx,rx,ey,em,ec='#111'){
  ctx.save();ctx.fillStyle=ec;ctx.strokeStyle=ec;ctx.lineCap='round';
  if(em==='sleep'||em==='blink'){
    ctx.lineWidth=3;
    for(const x of[lx,rx]){ctx.beginPath();ctx.moveTo(x-7,ey);ctx.lineTo(x+7,ey);ctx.stroke();}
  }else if(em==='happy'||em==='wave'||em==='pet'||em==='hover'){
    ctx.lineWidth=3;
    for(const x of[lx,rx]){ctx.beginPath();ctx.arc(x,ey+3,6,Math.PI+0.35,-0.35,false);ctx.stroke();}
  }else if(em==='excited'||em==='dblclick'||em==='special'){
    for(const[x,d]of[[lx,-1],[rx,1]]){
      circ(ctx,x,ey,7);ctx.fillStyle='#fff';circ(ctx,x+d,ey-2,2.5);ctx.fillStyle=ec;
    }
  }else if(em==='angry'||em==='click'){
    for(const x of[lx,rx])ctx.fillRect(x-6,ey-2,12,4);
    ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(lx-9,ey-9);ctx.lineTo(lx+8,ey-3);ctx.stroke();
    ctx.beginPath();ctx.moveTo(rx+9,ey-9);ctx.lineTo(rx-8,ey-3);ctx.stroke();
  }else if(em==='sad'){
    for(const x of[lx,rx])circ(ctx,x,ey,4);
    ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(lx-7,ey-7);ctx.lineTo(lx+7,ey-4);ctx.stroke();
    ctx.beginPath();ctx.moveTo(rx+7,ey-7);ctx.lineTo(rx-7,ey-4);ctx.stroke();
  }else{
    for(const x of[lx,rx])circ(ctx,x,ey,4);
  }
  ctx.restore();
}

function faceMouth(ctx,cx,my,em,w=10){
  ctx.save();ctx.strokeStyle='#111';ctx.lineCap='round';ctx.lineWidth=2.5;
  if(em==='happy'||em==='wave'||em==='pet'){
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(cx,my,w,0,Math.PI);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff';ctx.fillRect(cx-w+1,my,w*2-2,w-1);
    ctx.beginPath();ctx.arc(cx,my,w,0,Math.PI);ctx.stroke();
  }else if(em==='excited'||em==='dblclick'||em==='special'){
    ctx.fillStyle='#111';elps(ctx,cx,my+5,w-2,w+2);
    ctx.fillStyle='#fff';elps(ctx,cx,my+4,w-5,w-1);
  }else if(em==='angry'||em==='click'||em==='sad'){
    ctx.beginPath();ctx.moveTo(cx-w,my+5);ctx.quadraticCurveTo(cx,my+12,cx+w,my+5);ctx.stroke();
  }else if(em==='sleep'){
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(cx,my,4,0,Math.PI);ctx.closePath();ctx.fill();
  }else if(em==='blink'){
    ctx.beginPath();ctx.moveTo(cx-5,my);ctx.lineTo(cx+5,my);ctx.stroke();
  }else{
    ctx.beginPath();ctx.moveTo(cx-w+3,my);ctx.quadraticCurveTo(cx,my+7,cx+w-3,my);ctx.stroke();
  }
  ctx.restore();
}

window.CHARACTERS = [

// ══════════════════════════════════════════════════════════════════════════════
// 1. LUFFY — straw hat captain, red vest, blue shorts, scar
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'luffy', name:'Monkey D. Luffy', role:'Captain', color:'#e63946',
  idleBehaviors:['stretch','sniff','look_around'],
  quotes:{
    idle:["I'm hungry...","Gum Gum!","Shishishi..."],
    hover:["Shishishi!","Hey! You!","I'm Luffy!"],
    pet:["Hehe~ tickles!","I'm not a kid!"],
    click:["GOMU GOMU NO PISTOL!","HAAAAAH!"],
    dblclick:["GEAR SECOND!!","KING OF PIRATES!!"],
    happy:["SHISHISHI!!","MEAT!!!!!"],
    angry:["Don't hurt my nakama!!","I'll BEAT you!"],
    sad:["I miss Ace...","Nakama..."],
    sleep:["Zzz...meat..."],
    wave:["Hey!! OVER HERE!!","YOOOO!!"],
    excited:["MEAT!!","Shishishi!!!"],
    special:["GEAR SECOND!!","GOMU GOMU NO JET PISTOL!!","I'LL BE KING OF THE PIRATES!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Luffy: massive hungry bounce — MEAT!! energy
      S.animOffset=-Math.abs(Math.sin(tick*0.28))*20;
      S.armL=-1.0+Math.sin(tick*0.35)*0.5;
      S.armR=1.0+Math.sin(tick*0.35+1)*0.5;
      if(tick%7===0)spawn('star');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-62;
    ctx.save();

    // Legs (bare skin)
    ctx.fillStyle='#f5c07a';
    rrect(ctx,cx-21,cy+52,17,44,4);
    rrect(ctx,cx+4,cy+52,17,44,4);
    // Sandals
    ctx.fillStyle='#a07040';
    rrect(ctx,cx-25,cy+93,23,9,3);
    rrect(ctx,cx+2,cy+93,23,9,3);
    // Blue shorts
    ctx.fillStyle='#1166bb';
    rrect(ctx,cx-27,cy+28,54,28,5);
    ctx.fillStyle='#0a3a88';
    ctx.fillRect(cx-27,cy+28,54,5);
    // Torso — red vest sides + skin center
    ctx.fillStyle='#cc2200';
    rrect(ctx,cx-27,cy-27,15,58,4);
    rrect(ctx,cx+12,cy-27,15,58,4);
    ctx.fillStyle='#f5c07a';
    rrect(ctx,cx-13,cy-27,26,58,2);
    // Wave / special: right arm raised
    if(em==='wave'||em==='special'){
      ctx.fillStyle='#cc2200';
      rrect(ctx,cx+25,cy-55,11,32,4);
      rrect(ctx,cx+31,cy-78,10,28,4);
    }
    // Neck
    ctx.fillStyle='#f5c07a';
    rrect(ctx,cx-7,hcy+27,14,20,3);
    // Head
    ctx.fillStyle='#f5c07a';
    circ(ctx,cx,hcy,27);
    // Scar (2 lines below left eye)
    ctx.save();
    ctx.strokeStyle='#cc2200';ctx.lineWidth=2.5;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(cx-12,hcy+1);ctx.lineTo(cx-12,hcy+9);ctx.stroke();
    ctx.restore();
    // Eyes & mouth
    faceEyes(ctx,cx-11,cx+11,hcy-6,em);
    faceMouth(ctx,cx,hcy+13,em,13);
    // STRAW HAT
    ctx.fillStyle='#f0d060';
    elps(ctx,cx,hcy-50,23,20);          // dome
    ctx.fillStyle='#cc2200';
    ctx.fillRect(cx-25,hcy-36,50,8);    // red band
    ctx.fillStyle='#f0d060';
    elps(ctx,cx,hcy-28,52,9);           // wide brim
    ctx.fillStyle='#c8a010';
    ctx.beginPath();ctx.ellipse(cx,hcy-25,51,7,0,0,Math.PI);ctx.fill(); // brim underside

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 2. BOA HANCOCK — Pirate Empress: tiara, long silky hair, purple cheongsam,
//    snake Salome, gold jewellery, beauty mark, blush, stilettos
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'hancock', name:'Boa Hancock', role:'Pirate Empress', color:'#d63384', hidden:true,
  idleBehaviors:['sniff','bloom_flowers','look_around'],
  quotes:{
    idle:["Beauty is justice.","Hmph.","I am the most beautiful..."],
    hover:["...I'll allow it.","Not bad, for a commoner.","Hmm~"],
    pet:["H-how dare you!","Only Luffy-kun may do that!","...Fine."],
    click:["Love Love Beam!","You should feel honored!","Mero Mero~"],
    dblclick:["MERO MERO MELLOW!!","You're all stone!","Love Love Mellow!!"],
    happy:["Luffy-kun~ ♥","My heart is pounding!!","Kyaaa~ ♥"],
    angry:["STONE!!","How DARE you!!","Mero Mero Mellow!!"],
    sad:["Luffy-kun...","My past...","The mark on my back..."],
    sleep:["Zzz...Luffy-kun...","Zzz..."],
    wave:["...Fine. Hello.","I grace you with my presence.","Hmph~ wave back."],
    excited:["LUFFY-KUN!! ♥♥","My heart!!","Kyaaaa~~ ♥"],
    special:["SLAVE ARROW!!","PERFUME FEMUR!!","MERO MERO MELLOW!!","Love Love Beam!! ♥"],
  },
  excited:{
    anim(S,tick,spawn){
      // Hancock: composed flutter — heart-pounding for Luffy-kun
      S.animOffset=Math.sin(tick*0.1)*4;
      S.armL=-0.2+Math.sin(tick*0.15)*0.2;
      S.armR=0.3+Math.sin(tick*0.12)*0.15;
      if(tick%12===0)spawn('heart');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-66;
    ctx.save();

    // ── DEEP BACKGROUND HAIR (widest layer, drawn first) ──────────────────────
    ctx.fillStyle='#0d0220';
    ctx.beginPath();                                    // left back
    ctx.moveTo(cx-20,hcy-14);
    ctx.quadraticCurveTo(cx-52,hcy+28,cx-46,hcy+90);
    ctx.lineTo(cx-30,hcy+90);
    ctx.quadraticCurveTo(cx-38,hcy+26,cx-10,hcy-10);
    ctx.closePath();ctx.fill();
    ctx.beginPath();                                    // right back
    ctx.moveTo(cx+20,hcy-14);
    ctx.quadraticCurveTo(cx+52,hcy+28,cx+44,hcy+90);
    ctx.lineTo(cx+28,hcy+90);
    ctx.quadraticCurveTo(cx+38,hcy+26,cx+10,hcy-10);
    ctx.closePath();ctx.fill();

    // ── STILETTO HEELS ────────────────────────────────────────────────────────
    ctx.fillStyle='#3a0a50';
    rrect(ctx,cx-16,cy+86,13,16,3);
    rrect(ctx,cx+3,cy+86,13,16,3);
    ctx.fillStyle='#6b2d8b';
    ctx.fillRect(cx-8,cy+100,3,12);   // left heel pin
    ctx.fillRect(cx+10,cy+100,3,12);  // right heel pin

    // ── SLIM PALE LEGS ────────────────────────────────────────────────────────
    ctx.fillStyle='#f5d0bc';
    rrect(ctx,cx-15,cy+50,12,40,3);
    rrect(ctx,cx+3,cy+50,12,40,3);

    // ── DRESS SKIRT (flared, purple-blue gradient look) ───────────────────────
    ctx.fillStyle='#5a1f7a';
    ctx.beginPath();                                    // skirt trapezoid
    ctx.moveTo(cx-18,cy+24);
    ctx.lineTo(cx-30,cy+62);
    ctx.lineTo(cx+30,cy+62);
    ctx.lineTo(cx+18,cy+24);
    ctx.closePath();ctx.fill();
    ctx.fillStyle='#7d3da8';                            // lighter skirt front panel
    ctx.beginPath();
    ctx.moveTo(cx-12,cy+24);
    ctx.lineTo(cx-20,cy+60);
    ctx.lineTo(cx+20,cy+60);
    ctx.lineTo(cx+12,cy+24);
    ctx.closePath();ctx.fill();
    // Skirt hem gold trim
    ctx.fillStyle='#f7c948';
    ctx.fillRect(cx-30,cy+60,60,3);

    // ── CHEONGSAM BODICE (hourglass) ──────────────────────────────────────────
    ctx.fillStyle='#5a1f7a';                            // bodice sides
    ctx.beginPath();
    ctx.moveTo(cx-20,cy-30);ctx.lineTo(cx-18,cy+26);
    ctx.lineTo(cx-12,cy+26);ctx.lineTo(cx-14,cy-30);
    ctx.closePath();ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx+14,cy-30);ctx.lineTo(cx+12,cy+26);
    ctx.lineTo(cx+18,cy+26);ctx.lineTo(cx+20,cy-30);
    ctx.closePath();ctx.fill();
    ctx.fillStyle='#7d3da8';                            // centre front
    rrect(ctx,cx-14,cy-30,28,56,3);
    // Gold waist sash
    ctx.fillStyle='#f7c948';
    ctx.fillRect(cx-20,cy+22,40,5);
    // Gold neckline collar
    ctx.fillStyle='#f7c948';
    rrect(ctx,cx-12,cy-30,24,8,4);
    // Dress side gold trim lines
    ctx.save();ctx.strokeStyle='#f7c948';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(cx-14,cy-22);ctx.lineTo(cx-14,cy+20);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx+14,cy-22);ctx.lineTo(ctx.strokeStyle,cx+14,cy+20);ctx.stroke();
    ctx.restore();
    // Heart brooch at chest
    ctx.fillStyle='#ff3399';
    ctx.beginPath();
    ctx.arc(cx-5,cy-10,5,Math.PI,0);ctx.fill();
    ctx.beginPath();ctx.arc(cx+5,cy-10,5,Math.PI,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(cx-10,cy-10);ctx.lineTo(cx,cy-1);ctx.lineTo(cx+10,cy-10);ctx.fill();

    // ── SNAKE SALOME on left arm ──────────────────────────────────────────────
    // Arm
    ctx.fillStyle='#f5d0bc';
    rrect(ctx,cx-30,cy-22,11,38,3);
    // Snake body coiled
    ctx.fillStyle='#3aaa60';
    ctx.beginPath();ctx.arc(cx-28,cy-5,9,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2e8b50';
    ctx.beginPath();ctx.arc(cx-34,cy-16,7,0,Math.PI*2);ctx.fill();
    // Scale pattern hint
    ctx.save();ctx.strokeStyle='#1a6038';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(cx-28,cy-5,7,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(cx-34,cy-16,5,0,Math.PI*2);ctx.stroke();
    ctx.restore();
    // Snake head
    ctx.fillStyle='#1f7a42';
    elps(ctx,cx-37,cy-26,6,5);
    // Snake eyes
    ctx.fillStyle='#ffee00';circ(ctx,cx-39,cy-27,1.5);circ(ctx,cx-35,cy-27,1.5);
    // Fork tongue
    ctx.save();ctx.strokeStyle='#cc1111';ctx.lineWidth=1.5;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(cx-37,cy-31);ctx.lineTo(cx-40,cy-36);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx-37,cy-31);ctx.lineTo(cx-34,cy-36);ctx.stroke();
    ctx.restore();

    // ── RIGHT ARM ────────────────────────────────────────────────────────────
    ctx.fillStyle='#f5d0bc';
    if(em==='wave'||em==='special'){
      rrect(ctx,cx+19,cy-54,11,32,3);
      rrect(ctx,cx+24,cy-76,10,26,3);
    }else{
      rrect(ctx,cx+19,cy-22,11,38,3);
    }

    // ── NECK ─────────────────────────────────────────────────────────────────
    ctx.fillStyle='#f5d0bc';
    rrect(ctx,cx-6,hcy+26,12,22,3);
    // Neck jewel choker
    ctx.fillStyle='#f7c948';
    ctx.fillRect(cx-10,hcy+27,20,4);
    ctx.fillStyle='#ff69b4';circ(ctx,cx,hcy+29,3);

    // ── HEAD (elegant oval) ───────────────────────────────────────────────────
    ctx.fillStyle='#f5d0bc';
    elps(ctx,cx,hcy,21,25);

    // Soft blush on cheeks
    ctx.fillStyle='rgba(255,100,120,0.22)';
    elps(ctx,cx-13,hcy+6,9,6);
    elps(ctx,cx+13,hcy+6,9,6);

    // EYES + lashes
    faceEyes(ctx,cx-9,cx+9,hcy-5,em,'#1a2a8a');
    // Upper lashes
    ctx.save();ctx.strokeStyle='#050010';ctx.lineWidth=1.5;ctx.lineCap='round';
    for(const[lx,d]of[[cx-9,-1],[cx+9,1]]){
      ctx.beginPath();ctx.moveTo(lx-5,hcy-11);ctx.lineTo(lx-6+d,hcy-16);ctx.stroke();
      ctx.beginPath();ctx.moveTo(lx,hcy-13);ctx.lineTo(lx+d,hcy-18);ctx.stroke();
      ctx.beginPath();ctx.moveTo(lx+5,hcy-11);ctx.lineTo(lx+5+d,hcy-15);ctx.stroke();
    }
    ctx.restore();

    // Nose (delicate)
    ctx.save();ctx.strokeStyle='#d4a090';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(cx,hcy+4);ctx.lineTo(cx+2,hcy+8);ctx.stroke();
    ctx.restore();

    // LIPS — full, rose-red, with Cupid's bow
    ctx.fillStyle='#cc1144';
    ctx.beginPath();
    ctx.moveTo(cx-8,hcy+13);
    ctx.quadraticCurveTo(cx-4,hcy+10,cx,hcy+12);
    ctx.quadraticCurveTo(cx+4,hcy+10,cx+8,hcy+13);
    ctx.lineTo(cx+8,hcy+16);
    ctx.quadraticCurveTo(cx,hcy+21,cx-8,hcy+16);
    ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,200,220,0.4)';  // lip sheen
    elps(ctx,cx-2,hcy+13,4,2);
    // Adjust generic mouth for emotions
    if(!['idle','hover','blink'].includes(em)) faceMouth(ctx,cx,hcy+14,em,8);

    // Beauty mark
    ctx.fillStyle='#1a0520';circ(ctx,cx+10,hcy+10,2);

    // GOLD SERPENT EARRINGS
    ctx.fillStyle='#f7c948';
    ctx.save();ctx.strokeStyle='#f7c948';ctx.lineWidth=2;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(cx-22,hcy+3,5,0,Math.PI*1.7);ctx.stroke();
    ctx.beginPath();ctx.arc(cx+22,hcy+3,5,Math.PI*1.3,Math.PI*3);ctx.stroke();
    ctx.restore();
    circ(ctx,cx-22,hcy+8,2.5);
    circ(ctx,cx+22,hcy+8,2.5);

    // FRONT HAIR (frames face, over head)
    ctx.fillStyle='#1a0530';
    ctx.beginPath();                                    // left front strand
    ctx.moveTo(cx-20,hcy-16);
    ctx.quadraticCurveTo(cx-30,hcy+12,cx-26,hcy+50);
    ctx.lineTo(cx-18,hcy+50);
    ctx.quadraticCurveTo(cx-22,hcy+10,cx-12,hcy-12);
    ctx.closePath();ctx.fill();
    ctx.beginPath();                                    // right front strand
    ctx.moveTo(cx+20,hcy-16);
    ctx.quadraticCurveTo(cx+30,hcy+12,cx+24,hcy+50);
    ctx.lineTo(cx+16,hcy+50);
    ctx.quadraticCurveTo(cx+22,hcy+10,cx+12,hcy-12);
    ctx.closePath();ctx.fill();
    // Subtle purple sheen on front hair
    ctx.fillStyle='rgba(140,60,200,0.12)';
    ctx.beginPath();
    ctx.moveTo(cx-18,hcy-14);
    ctx.quadraticCurveTo(cx-28,hcy+10,cx-24,hcy+40);
    ctx.lineTo(cx-16,hcy+40);
    ctx.quadraticCurveTo(cx-20,hcy+8,cx-10,hcy-10);
    ctx.closePath();ctx.fill();

    // CROWN / TIARA (topmost layer)
    ctx.fillStyle='#f7c948';
    rrect(ctx,cx-17,hcy-35,34,8,3);                   // base band
    // 7 graduated points
    const pts=[-14,-9,-4,0,4,9,14];
    const ht=[16,22,28,32,28,22,16];
    for(let i=0;i<pts.length;i++){
      tri(ctx,cx+pts[i]-3,hcy-35,cx+pts[i],hcy-35-ht[i],cx+pts[i]+3,hcy-35);
    }
    // Jewels on crown points
    const jcols=['#ff69b4','#e74c3c','#9b59b6','#ff1493','#9b59b6','#e74c3c','#ff69b4'];
    const jht=[14,20,26,30,26,20,14];
    for(let i=0;i<pts.length;i++){
      ctx.fillStyle=jcols[i];circ(ctx,cx+pts[i],hcy-36-jht[i],i===3?4:2.5);
    }
    // Crown glitter
    ctx.fillStyle='rgba(255,255,200,0.8)';
    circ(ctx,cx-12,hcy-38,1.5);circ(ctx,cx+6,hcy-44,1.5);circ(ctx,cx+14,hcy-36,1.5);

    // HAIR TOP MASS (covers base of crown, ties everything together)
    ctx.fillStyle='#140326';
    elps(ctx,cx,hcy-22,19,15);
    ctx.fillStyle='#06010f';
    ctx.beginPath();ctx.arc(cx,hcy-22,17,Math.PI+0.4,0-0.4);ctx.fill();

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 3. ZORO — green spiky hair, 3 earrings, white shirt, 3 swords
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'zoro', name:'Roronoa Zoro', role:'Swordsman', color:'#27ae60',
  idleBehaviors:['sword_swing','meditate','look_around'],
  quotes:{
    idle:["Nothing but a scratch.","..."],
    hover:["Don't distract me.","Tch."],
    pet:["Don't touch my swords.","Hn."],
    click:["Onigiri!!","Santoryu!"],
    dblclick:["ASURA!!","TRI-BLADE!!"],
    happy:["Not bad.","I'll surpass him."],
    angry:["I'll cut you down!","Wado Ichimonji!"],
    sad:["...I'm lost again.","Kuina..."],
    sleep:["Zzz..."],
    wave:["Oi!","...hey."],
    excited:["The world's greatest!","Heh."],
    special:["ASURA ICHIBUGIN!!","THREE THOUSAND WORLDS!!","I WILL SURPASS MIHAWK!!","ONI GIRI!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Zoro: sword-swing battle readiness
      S.animOffset=Math.sin(tick*0.15)*5;
      S.armR=Math.sin(tick*0.4)*1.3;
      S.armL=-0.3+Math.sin(tick*0.12)*0.15;
      if(tick%12===0)spawn('star');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-62;
    ctx.save();

    // Black boots
    ctx.fillStyle='#1a1a1a';
    rrect(ctx,cx-21,cy+55,17,45,4);
    rrect(ctx,cx+4,cy+55,17,45,4);
    // Dark pants
    ctx.fillStyle='#2c3e50';
    rrect(ctx,cx-23,cy+28,46,32,4);
    // Belt
    ctx.fillStyle='#6b4e32';
    ctx.fillRect(cx-24,cy+28,48,6);
    // Sword hilts (3 swords at left hip)
    ctx.fillStyle='#7f8c8d';
    rrect(ctx,cx-30,cy+14,5,18,2);
    rrect(ctx,cx-26,cy+10,5,18,2);
    rrect(ctx,cx-22,cy+6,5,18,2);
    ctx.fillStyle='#444'; // guards
    ctx.fillRect(cx-32,cy+14,9,3);
    ctx.fillRect(cx-28,cy+10,9,3);
    ctx.fillRect(cx-24,cy+6,9,3);
    // White shirt
    ctx.fillStyle='#ecf0f1';
    rrect(ctx,cx-25,cy-28,50,58,4);
    // Open collar V
    ctx.fillStyle='#f5c07a';
    ctx.beginPath();ctx.moveTo(cx,cy-18);ctx.lineTo(cx-10,cy-28);ctx.lineTo(cx+10,cy-28);ctx.closePath();ctx.fill();
    // Chest scar (3 diagonal lines)
    ctx.save();
    ctx.strokeStyle='#e74c3c';ctx.lineWidth=2;ctx.lineCap='round';
    for(let i=0;i<3;i++){
      ctx.beginPath();ctx.moveTo(cx-2+i*2,cy-16);ctx.lineTo(cx+10+i*2,cy+8);ctx.stroke();
    }
    ctx.restore();
    // Wave / special: right arm out
    if(em==='wave'||em==='special'){
      ctx.fillStyle='#ecf0f1';
      rrect(ctx,cx+24,cy-54,11,32,4);
      rrect(ctx,cx+30,cy-76,10,27,4);
    }
    // Neck
    ctx.fillStyle='#f5c07a';
    rrect(ctx,cx-7,hcy+27,14,20,3);
    // Head
    ctx.fillStyle='#f5c07a';
    circ(ctx,cx,hcy,27);
    // 3 gold earrings (right ear)
    ctx.fillStyle='#f7c948';
    for(let i=0;i<3;i++) circ(ctx,cx+27,hcy-4+i*7,3);
    // Left eye always closed (scar)
    ctx.save();
    ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(cx-18,hcy-6);ctx.lineTo(cx-6,hcy-6);ctx.stroke();
    ctx.restore();
    // Right eye only (by emotion)
    faceEyes(ctx,cx+999,cx+12,hcy-6,em); // lx off-screen = only draws rx
    faceMouth(ctx,cx+3,hcy+13,em,9);
    // GREEN SPIKY HAIR
    ctx.fillStyle='#27ae60';
    circ(ctx,cx,hcy-26,22);              // main mass
    // Spikes
    for(const[sx,sy,ex,ey] of [
      [cx-22,hcy-24,cx-36,hcy-38],
      [cx-10,hcy-46,cx-8,hcy-62],
      [cx+6, hcy-46,cx+12,hcy-62],
      [cx+22,hcy-24,cx+36,hcy-38],
    ]){
      ctx.beginPath();ctx.moveTo(sx-4,sy);ctx.lineTo(ex,ey);ctx.lineTo(sx+4,sy);ctx.closePath();ctx.fill();
    }

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 3. NAMI — orange flowing hair, tattoo, bikini, navigator
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'nami', name:'Nami', role:'Navigator', color:'#e67e22',
  idleBehaviors:['count_coins','draw_map','look_around'],
  quotes:{
    idle:["Where's my Beli?","Navigation time!"],
    hover:["Hey cutie~","Don't touch the map!"],
    pet:["Hehe~ not bad~","Pay me first!"],
    click:["Clima Tact!","Take THAT!"],
    dblclick:["THUNDERBOLT TEMPO!!","You'll pay triple!"],
    happy:["Money!! Money!!","Wahahaha!"],
    angry:["Pay me back, LUFFY!!","Triple the price!!"],
    sad:["Arlong...","My village..."],
    sleep:["Zz...Beli..."],
    wave:["Yoohoo~!","Over here!"],
    excited:["A treasure map!","Gold!!"],
    special:["THUNDERBOLT TEMPO!!","MIRAGE TEMPO!!","That's triple the price, idiot!!","PERFECT CLIMA TACT!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Nami: greedy coin-counting arm + sway
      S.animOffset=Math.sin(tick*0.25)*7;
      S.armL=0.1;
      S.armR=-0.4+Math.sin(tick*0.3)*0.6;
      if(tick%9===0)spawn('coin');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-62;
    ctx.save();

    // Legs (skin)
    ctx.fillStyle='#f5c07a';
    rrect(ctx,cx-18,cy+52,15,44,4);
    rrect(ctx,cx+3,cy+52,15,44,4);
    // Sandals / shoes
    ctx.fillStyle='#8b5e3c';
    rrect(ctx,cx-21,cy+93,20,9,3);
    rrect(ctx,cx+1,cy+93,20,9,3);
    // White shorts
    ctx.fillStyle='#f0f0f0';
    rrect(ctx,cx-22,cy+28,44,27,5);
    ctx.fillStyle='#ccc';
    ctx.fillRect(cx-22,cy+28,44,4);
    // Blue bikini top
    ctx.fillStyle='#1a7abf';
    rrect(ctx,cx-20,cy-28,40,26,4);
    // Orange tattoo on left arm
    ctx.fillStyle='#e67e22';
    rrect(ctx,cx-31,cy-10,8,22,3);
    ctx.fillStyle='#c0392b';
    rrect(ctx,cx-30,cy-8,6,10,2);
    // Wave / special arm
    if(em==='wave'||em==='special'){
      ctx.fillStyle='#f5c07a';
      rrect(ctx,cx+22,cy-52,10,30,4);
      rrect(ctx,cx+28,cy-74,10,26,4);
    }
    // Neck
    ctx.fillStyle='#f5c07a';
    rrect(ctx,cx-6,hcy+27,12,20,3);
    // Head
    ctx.fillStyle='#f5c07a';
    circ(ctx,cx,hcy,25);
    // Eyes & mouth
    faceEyes(ctx,cx-10,cx+10,hcy-5,em,'#5c3a1e');
    faceMouth(ctx,cx,hcy+12,em,9);
    // ORANGE HAIR (flows both sides)
    ctx.fillStyle='#e67e22';
    circ(ctx,cx,hcy-24,20);            // top mass
    // Left flow
    ctx.beginPath();
    ctx.moveTo(cx-20,hcy-14);
    ctx.quadraticCurveTo(cx-36,hcy+10,cx-28,hcy+40);
    ctx.lineTo(cx-18,hcy+40);
    ctx.quadraticCurveTo(cx-24,hcy+8,cx-12,hcy-10);
    ctx.closePath();ctx.fill();
    // Right flow
    ctx.beginPath();
    ctx.moveTo(cx+20,hcy-14);
    ctx.quadraticCurveTo(cx+36,hcy+10,cx+26,hcy+36);
    ctx.lineTo(cx+16,hcy+36);
    ctx.quadraticCurveTo(cx+24,hcy+8,cx+12,hcy-10);
    ctx.closePath();ctx.fill();
    // Hair darker highlight
    ctx.fillStyle='#c0580a';
    ctx.beginPath();ctx.arc(cx,hcy-24,20,Math.PI+0.5,0-0.5,false);ctx.fill();

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 4. USOPP — very long nose, dark afro, goggles, overalls, slingshot
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'usopp', name:'Usopp', role:'Sniper', color:'#d4a017',
  idleBehaviors:['polish_slingshot','tell_story','look_around'],
  quotes:{
    idle:["Captain Usopp!!","I lied... maybe."],
    hover:["8000 soldiers!","Don't scare me!"],
    pet:["I-I'm not scared!","Captain Usopp!"],
    click:["USOPP FIRE!!","Kabuto!"],
    dblclick:["SPECIAL ATTACK!!","GIANT HAMMER!!"],
    happy:["I'm a brave warrior!","USOPP SHOT!"],
    angry:["I'm not lying!!","8000 men!!"],
    sad:["I-I lied...","Syrup Village..."],
    sleep:["Zzz...brave..."],
    wave:["Over here!! 8000 soldiers!","HEEEY!!"],
    excited:["I can do it!!","BRAVE WARRIOR!!"],
    special:["SOGEKING!!","KABUTO!!","CERTAIN KILL IMPACT WOLF!!","I am the brave warrior of the sea!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Usopp: panicked brave flailing — both arms going wild
      S.animOffset=Math.sin(tick*0.22)*9;
      S.armL=Math.sin(tick*0.35)*1.2;
      S.armR=-Math.sin(tick*0.35+1.5)*1.1;
      if(tick%11===0)spawn('star');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-62;
    ctx.save();

    // Brown boots
    ctx.fillStyle='#6b3d1e';
    rrect(ctx,cx-20,cy+60,16,40,4);
    rrect(ctx,cx+4,cy+60,16,40,4);
    // Brown overall legs
    ctx.fillStyle='#7d6135';
    rrect(ctx,cx-21,cy+28,18,36,2);
    rrect(ctx,cx+3,cy+28,18,36,2);
    // Overall bib / torso
    ctx.fillStyle='#8b6e3a';
    rrect(ctx,cx-22,cy-28,44,58,4);
    // Straps
    ctx.fillStyle='#6b4e20';
    ctx.fillRect(cx-14,cy-28,5,20);
    ctx.fillRect(cx+9,cy-28,5,20);
    // Slingshot in left hand
    ctx.fillStyle='#4a3020';
    rrect(ctx,cx-32,cy+5,6,28,2);
    ctx.fillStyle='#c8a050'; // Y-shape top
    rrect(ctx,cx-35,cy,7,7,2);
    rrect(ctx,cx-28,cy,7,7,2);
    // Wave / special arm
    if(em==='wave'||em==='special'){
      ctx.fillStyle='#8b6e3a';
      rrect(ctx,cx+22,cy-50,11,30,4);
      rrect(ctx,cx+28,cy-72,10,26,4);
    }
    // Neck
    ctx.fillStyle='#c8a070';
    rrect(ctx,cx-7,hcy+27,14,20,3);
    // Head (slightly longer/oval for big nose)
    ctx.fillStyle='#c8a070';
    elps(ctx,cx-2,hcy,26,25);
    // VERY LONG NOSE (most distinctive!)
    ctx.fillStyle='#b08050';
    ctx.beginPath();
    ctx.moveTo(cx+5,hcy-4);
    ctx.quadraticCurveTo(cx+18,hcy+5,cx+38,hcy+12);
    ctx.lineTo(cx+35,hcy+18);
    ctx.quadraticCurveTo(cx+14,hcy+12,cx+2,hcy+8);
    ctx.closePath();ctx.fill();
    // Goggles on forehead
    ctx.fillStyle='#333';
    rrect(ctx,cx-18,hcy-22,36,10,4);
    ctx.fillStyle='#5dade2';
    rrect(ctx,cx-16,hcy-20,14,7,3);
    rrect(ctx,cx+2,hcy-20,14,7,3);
    ctx.fillStyle='#fff';
    rrect(ctx,cx-15,hcy-20,5,4,2);
    rrect(ctx,cx+3,hcy-20,5,4,2);
    // Eyes & mouth
    faceEyes(ctx,cx-10,cx+8,hcy-5,em,'#2c1a0a');
    faceMouth(ctx,cx+3,hcy+13,em,9);
    // DARK CURLY HAIR / AFRO
    ctx.fillStyle='#1a0d00';
    circ(ctx,cx-3,hcy-28,20);
    circ(ctx,cx-18,hcy-20,12);
    circ(ctx,cx+12,hcy-20,11);
    circ(ctx,cx-8,hcy-38,14);
    circ(ctx,cx+6,hcy-36,13);

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 5. SANJI — blonde hair covers left eye, cigarette, black suit, tie
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'sanji', name:'Sanji', role:'Cook', color:'#f39c12',
  idleBehaviors:['spin_kick','cook_air','look_around'],
  quotes:{
    idle:["Hmm... what to cook?","Mellorine~"],
    hover:["Mellorine!! ♥","A beautiful lady?"],
    pet:["Hehe~ only for ladies.","Don't mess my suit."],
    click:["DIABLE JAMBE!!","FLAMBAGE SHOT!!"],
    dblclick:["SKY WALK!!","HELL MEMORIES!!"],
    happy:["Mellorine~~ ♥","For you, my lady!"],
    angry:["Don't insult food!!","I'll break your face!"],
    sad:["...All Blue...","Baratie..."],
    sleep:["Zzz...Nami-san..."],
    wave:["Nami-SAN~ ♥","Ohhh ladies~"],
    excited:["MELLORINE!!","Oh ho ho ho!"],
    special:["DIABLE JAMBE!!","HELL MEMORIES!!","POÊLE À FRIRE: SPECTRE!!","SKY WALK!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Sanji: spin-kick shimmy + Mellorine~ hearts
      S.animOffset=Math.sin(tick*0.3)*11;
      S.armL=Math.sin(tick*0.28)*0.9;
      S.armR=0.7+Math.sin(tick*0.2)*0.4;
      if(tick%10===0)spawn('heart');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-62;
    ctx.save();

    // Black shoes
    ctx.fillStyle='#111';
    rrect(ctx,cx-22,cy+62,18,40,4);
    rrect(ctx,cx+4,cy+62,18,40,4);
    // Dark suit pants
    ctx.fillStyle='#222';
    rrect(ctx,cx-23,cy+28,46,38,4);
    // Black suit jacket
    ctx.fillStyle='#1a1a1a';
    rrect(ctx,cx-26,cy-28,52,58,4);
    // White shirt front
    ctx.fillStyle='#eee';
    rrect(ctx,cx-10,cy-26,20,50,2);
    // Red tie
    ctx.fillStyle='#c0392b';
    rrect(ctx,cx-4,cy-24,8,32,2);
    // Cigarette (extends right from mouth)
    ctx.fillStyle='#f0f0f0';
    ctx.fillRect(cx+14,hcy+10,22,4);
    ctx.fillStyle='#e67e22';
    ctx.fillRect(cx+32,hcy+10,4,4);
    ctx.fillStyle='rgba(200,200,200,0.6)';
    circ(ctx,cx+34,hcy+5,5);
    // Wave / special arm
    if(em==='wave'||em==='special'){
      ctx.fillStyle='#1a1a1a';
      rrect(ctx,cx+25,cy-52,11,32,4);
      rrect(ctx,cx+31,cy-74,10,27,4);
    }
    // Neck
    ctx.fillStyle='#f5c07a';
    rrect(ctx,cx-6,hcy+27,12,20,3);
    // Head
    ctx.fillStyle='#f5c07a';
    circ(ctx,cx,hcy,26);
    // Curly eyebrow (right side swirl)
    ctx.save();
    ctx.strokeStyle='#c8a030';ctx.lineWidth=2.5;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(cx+14,hcy-14,6,Math.PI,-0.3);ctx.stroke();
    ctx.restore();
    // ONLY right eye visible (left covered by hair)
    const rightEyeX = cx+12;
    ctx.fillStyle='#111';
    if(em==='sleep'||em==='blink'){
      ctx.save();ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(rightEyeX-7,hcy-5);ctx.lineTo(rightEyeX+7,hcy-5);ctx.stroke();
      ctx.restore();
    }else if(em==='happy'||em==='wave'||em==='pet'||em==='hover'){
      ctx.save();ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.lineCap='round';
      ctx.beginPath();ctx.arc(rightEyeX,hcy-2,6,Math.PI+0.35,-0.35,false);ctx.stroke();
      ctx.restore();
    }else if(em==='angry'||em==='click'){
      ctx.fillRect(rightEyeX-6,hcy-7,12,4);
      ctx.save();ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(rightEyeX+9,hcy-14);ctx.lineTo(rightEyeX-8,hcy-8);ctx.stroke();
      ctx.restore();
    }else{
      circ(ctx,rightEyeX,hcy-5,4);
    }
    faceMouth(ctx,cx+5,hcy+13,em,9);
    // BLONDE HAIR covering LEFT side of face entirely
    ctx.fillStyle='#f4d03f';
    // Right-side hair
    ctx.beginPath();
    ctx.arc(cx,hcy-20,22,0,Math.PI*2);ctx.fill();
    // Left covering hair (solid block over left face)
    ctx.beginPath();
    ctx.moveTo(cx-26,hcy-30);
    ctx.lineTo(cx+6,hcy-30);
    ctx.lineTo(cx+2,hcy+20);
    ctx.lineTo(cx-26,hcy+18);
    ctx.closePath();ctx.fill();
    // Hair darker shading
    ctx.fillStyle='#d4a90a';
    ctx.beginPath();ctx.arc(cx,hcy-20,22,Math.PI+0.5,0-0.5,false);ctx.fill();

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 6. CHOPPER — pink hat with blue cross, antlers, small round brown reindeer
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'chopper', name:'Tony Tony Chopper', role:'Doctor', color:'#e91e63',
  idleBehaviors:['eat_candy','sniff','happy_dance'],
  quotes:{
    idle:["Don't call me cute!","Yoi!"],
    hover:["I'm not cute!!","Yoi yoi!"],
    pet:["D-don't praise me! Idiot!","Yoiii!"],
    click:["HORN POINT!!","Jumping Point!"],
    dblclick:["MONSTER POINT!!","RUMBLE BALL!!"],
    happy:["Yoiii!! ♥","So happy!!"],
    angry:["I'm not cute!! IDIOT!!","Yaaah!!"],
    sad:["Doctorine...","Hiriluk..."],
    sleep:["Zzz...cotton candy..."],
    wave:["YOIII!! HI!!","Hiiii~"],
    excited:["Yoii yoii!!","WOOOAH!!"],
    special:["MONSTER POINT!!","RUMBLE BALL!!","HORN POINT!!","Walk Point!! Guard Point!! Arm Point!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Chopper: rapid cute stomp bounce, arms flutter
      S.animOffset=-Math.abs(Math.sin(tick*0.4))*11;
      S.armL=Math.sin(tick*0.5)*0.7;
      S.armR=-Math.sin(tick*0.5+1)*0.7;
      if(tick%14===0)spawn('heart');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    // Chopper is small — shift center up a bit
    const hcy=cy-42;
    ctx.save();

    // Hooves (small, dark brown)
    ctx.fillStyle='#4a2a0a';
    rrect(ctx,cx-17,cy+48,14,16,4);
    rrect(ctx,cx+3,cy+48,14,16,4);
    // Short tan legs
    ctx.fillStyle='#c8905a';
    rrect(ctx,cx-16,cy+32,12,20,3);
    rrect(ctx,cx+4,cy+32,12,20,3);
    // Blue shorts (tiny)
    ctx.fillStyle='#1a6db5';
    rrect(ctx,cx-20,cy+18,40,18,4);
    // Round brown body
    ctx.fillStyle='#8b5e3c';
    elps(ctx,cx,cy-2,22,30);
    // Lighter chest fur
    ctx.fillStyle='#d4a070';
    elps(ctx,cx,cy+8,13,18);
    // Small arms
    ctx.fillStyle='#8b5e3c';
    rrect(ctx,cx-30,cy-8,12,22,4);
    rrect(ctx,cx+18,cy-8,12,22,4);
    // Wave / special arm
    if(em==='wave'||em==='special'){
      ctx.fillStyle='#8b5e3c';
      rrect(ctx,cx+18,cy-30,12,22,4);
      rrect(ctx,cx+22,cy-48,10,22,4);
    }
    // Head (round)
    ctx.fillStyle='#8b5e3c';
    circ(ctx,cx,hcy,24);
    // BLUE NOSE
    ctx.fillStyle='#1a6db5';
    elps(ctx,cx,hcy+10,7,5);
    // Eyes & mouth
    faceEyes(ctx,cx-10,cx+10,hcy-4,em,'#2c1200');
    faceMouth(ctx,cx,hcy+15,em,7);
    // ANTLERS (brown, two Y-shapes)
    ctx.fillStyle='#6b3d12';
    // Left antler
    rrect(ctx,cx-18,hcy-44,6,20,2);
    rrect(ctx,cx-24,hcy-54,6,16,2);
    rrect(ctx,cx-12,hcy-54,6,16,2);
    // Right antler
    rrect(ctx,cx+12,hcy-44,6,20,2);
    rrect(ctx,cx+6,hcy-54,6,16,2);
    rrect(ctx,cx+18,hcy-54,6,16,2);
    // PINK HAT (large, distinctive)
    ctx.fillStyle='#e91e63';
    rrect(ctx,cx-26,hcy-30,52,20,4);  // hat brim
    rrect(ctx,cx-20,hcy-54,40,28,4);  // hat body
    // Blue cross on hat
    ctx.fillStyle='#1a6db5';
    ctx.fillRect(cx-3,hcy-53,6,26);   // vertical
    ctx.fillRect(cx-14,hcy-44,28,6);  // horizontal

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 7. ROBIN — black flowing hair, purple outfit, flowers, calm
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'robin', name:'Nico Robin', role:'Archaeologist', color:'#8e44ad',
  idleBehaviors:['read_book','bloom_flowers','look_around'],
  quotes:{
    idle:["Ara ara...","History speaks."],
    hover:["...Hello.","How interesting."],
    pet:["Ara ara~","...Thank you."],
    click:["Cien Fleur!","CLUTCH!"],
    dblclick:["GIGANTE FLEUR!!","DEMONIO FLEUR!!"],
    happy:["Ara ara~ ♥","How lovely."],
    angry:["Seis Fleur!","I'll break you."],
    sad:["...Ohara...","I want to live."],
    sleep:["Zzz...ruins..."],
    wave:["...Ara.","Over here."],
    excited:["Ara ara ara~","A Poneglyph!!"],
    special:["GIGANTE FLEUR!!","DEMONIO FLEUR!!","Cien Fleur: Clutch!!","Ocho Fleur!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Robin: graceful Ara ara sway — restrained excitement, flowers bloom
      S.animOffset=Math.sin(tick*0.12)*5;
      S.armL=-0.25+Math.sin(tick*0.14)*0.2;
      S.armR=0.25+Math.sin(tick*0.12+1)*0.2;
      if(tick%12===0)spawn('flower');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-62;
    ctx.save();

    // Dark heels / shoes
    ctx.fillStyle='#4a1a6b';
    rrect(ctx,cx-19,cy+62,15,38,4);
    rrect(ctx,cx+4,cy+62,15,38,4);
    // Purple skirt/pants
    ctx.fillStyle='#6b2f9e';
    rrect(ctx,cx-22,cy+28,44,38,5);
    // Purple top / jacket
    ctx.fillStyle='#7d3db5';
    rrect(ctx,cx-24,cy-28,48,58,4);
    // White inner
    ctx.fillStyle='#e8d8f5';
    rrect(ctx,cx-10,cy-26,20,32,2);
    // Flower at chest
    ctx.fillStyle='#f1c40f';
    circ(ctx,cx,cy-12,6);
    ctx.fillStyle='#e74c3c';
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5-Math.PI/2;
      circ(ctx,cx+Math.cos(a)*9,cy-12+Math.sin(a)*9,4);
    }
    // Extra sprouted hands (left side arms for her powers)
    ctx.fillStyle='#f5c07a';
    rrect(ctx,cx-36,cy-15,11,36,4);
    // Wave / special arm
    if(em==='wave'||em==='special'){
      ctx.fillStyle='#7d3db5';
      rrect(ctx,cx+23,cy-52,11,30,4);
      rrect(ctx,cx+29,cy-74,10,26,4);
    }else{
      ctx.fillStyle='#7d3db5';
      rrect(ctx,cx+23,cy-22,11,36,4);
    }
    // Neck
    ctx.fillStyle='#f5c07a';
    rrect(ctx,cx-6,hcy+27,12,20,3);
    // Head
    ctx.fillStyle='#f5c07a';
    circ(ctx,cx,hcy,26);
    // Eyes & mouth (calm/elegant)
    faceEyes(ctx,cx-10,cx+10,hcy-5,em,'#2c1a4a');
    faceMouth(ctx,cx,hcy+12,em,8);
    // BLACK FLOWING HAIR (very distinctive)
    ctx.fillStyle='#1a0a2a';
    circ(ctx,cx,hcy-22,22);          // top mass
    // Left flow (long, down to shoulders)
    ctx.beginPath();
    ctx.moveTo(cx-22,hcy-12);
    ctx.quadraticCurveTo(cx-40,hcy+15,cx-34,hcy+50);
    ctx.lineTo(cx-20,hcy+50);
    ctx.quadraticCurveTo(cx-28,hcy+14,cx-12,hcy-8);
    ctx.closePath();ctx.fill();
    // Right flow
    ctx.beginPath();
    ctx.moveTo(cx+22,hcy-12);
    ctx.quadraticCurveTo(cx+40,hcy+15,cx+32,hcy+50);
    ctx.lineTo(cx+18,hcy+50);
    ctx.quadraticCurveTo(cx+28,hcy+14,cx+12,hcy-8);
    ctx.closePath();ctx.fill();

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 8. FRANKY — blue tall pompadour, wide cyborg body, star tattoo
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'franky', name:'Franky', role:'Shipwright', color:'#3498db',
  idleBehaviors:['flex','super_pose','cola_drink'],
  quotes:{
    idle:["SUPER!!","Franky SUPER!!"],
    hover:["Ohhh SUPER!!","You're looking at a LEGEND!"],
    pet:["SUPER!! I love it!","Heh heh!"],
    click:["FRANKY SHOGUN!!","COUP DE VENT!!"],
    dblclick:["GENERAL CANNON!!","SUPER DOCKING!!"],
    happy:["SUUUPER!! ♥","I'm SUPER!!"],
    angry:["SUPER ANGRY!!","Don't mess with me!"],
    sad:["Tom-san...","...SUPER sad."],
    sleep:["Zzz...cola..."],
    wave:["SUPER!! HEYYY!!","YOOO SUPER!!"],
    excited:["SUPER SUPER SUPER!!","The Thousand Sunny!!"],
    special:["FRANKY SHOGUN!!","COUP DE VENT!!","GENERAL CANNON!!","SUPER DOCKING!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Franky: rigid SUPER!! double-flex pose + bounce
      S.armL=-1.1+Math.sin(tick*0.15)*0.15;
      S.armR=1.1+Math.sin(tick*0.15+1)*0.15;
      S.animOffset=-Math.abs(Math.sin(tick*0.18))*8;
      if(tick%8===0)spawn('star');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-62;
    ctx.save();

    // Wide black boots
    ctx.fillStyle='#1a1a2e';
    rrect(ctx,cx-26,cy+58,20,42,4);
    rrect(ctx,cx+6,cy+58,20,42,4);
    // Blue cyborg legs
    ctx.fillStyle='#1a5f8e';
    rrect(ctx,cx-24,cy+30,20,32,3);
    rrect(ctx,cx+4,cy+30,20,32,3);
    // Blue swim trunks
    ctx.fillStyle='#1a6db5';
    rrect(ctx,cx-30,cy+20,60,16,4);
    // WIDE CYBORG TORSO (widest character)
    ctx.fillStyle='#1a5f8e';
    rrect(ctx,cx-38,cy-32,76,54,6);
    // Star tattoo on chest
    ctx.fillStyle='#e74c3c';
    const starY=cy-14;
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5-Math.PI/2;
      const a2=(i+0.5)*Math.PI*2/5-Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(cx+Math.cos(a)*14,starY+Math.sin(a)*14);
      ctx.lineTo(cx+Math.cos(a2)*6,starY+Math.sin(a2)*6);
      const a3=(i+1)*Math.PI*2/5-Math.PI/2;
      ctx.lineTo(cx+Math.cos(a3)*14,starY+Math.sin(a3)*14);
      ctx.closePath();ctx.fill();
    }
    // Wide cyborg arms
    ctx.fillStyle='#1a5f8e';
    if(em==='wave'||em==='special'){
      rrect(ctx,cx-52,cy-28,16,44,4);  // left arm normal
      rrect(ctx,cx+36,cy-60,14,36,4);  // right arm raised
      rrect(ctx,cx+40,cy-84,14,30,4);  // right forearm raised
    }else{
      rrect(ctx,cx-52,cy-28,16,44,4);
      rrect(ctx,cx+36,cy-28,16,44,4);
    }
    // Neck
    ctx.fillStyle='#3a9ad9';
    rrect(ctx,cx-8,hcy+26,16,20,3);
    // Head
    ctx.fillStyle='#3a9ad9';
    circ(ctx,cx,hcy,26);
    // Nose (big)
    ctx.fillStyle='#2980b9';
    elps(ctx,cx,hcy+8,6,4);
    // Eyes & mouth
    faceEyes(ctx,cx-11,cx+11,hcy-5,em,'#0a1a2e');
    faceMouth(ctx,cx,hcy+16,em,10);
    // BLUE TALL POMPADOUR (very distinctive)
    ctx.fillStyle='#1a6db5';
    // Base of pompadour
    rrect(ctx,cx-20,hcy-34,40,18,4);
    // Tall swept-back part
    ctx.beginPath();
    ctx.moveTo(cx-18,hcy-32);
    ctx.quadraticCurveTo(cx-10,hcy-70,cx+5,hcy-76);
    ctx.lineTo(cx+14,hcy-68);
    ctx.quadraticCurveTo(cx+2,hcy-62,cx-6,hcy-28);
    ctx.closePath();ctx.fill();
    // Hair shine
    ctx.fillStyle='#3498db';
    ctx.beginPath();ctx.arc(cx-2,hcy-44,8,0,Math.PI*2);ctx.fill();

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 9. BROOK — skull face, top hat + afro, very thin, black suit
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'brook', name:'Brook', role:'Musician', color:'#2c3e50',
  idleBehaviors:['play_violin','skull_joke','look_around'],
  quotes:{
    idle:["Yohohoho!","May I see your panties?"],
    hover:["Yohohoho!!","Soul King Brook!"],
    pet:["Yohohoho~","I have no skin to blush!"],
    click:["SOUL SOLID!!","AUBADE COUP DROIT!"],
    dblclick:["SOUL PARADE!!","BROOK'S PARTY!!"],
    happy:["YOHOHOHO!! ♥","Skull joke!!"],
    angry:["Yohohoho... I'm angry!","On guard!"],
    sad:["Laboon...","My crew..."],
    sleep:["Zzz...yohoho..."],
    wave:["YOHOHOHO!! HEEEY!!","Soul King is here!!"],
    excited:["YOHOHOHOHO!!","SKULL JOKE!!"],
    special:["SOUL PARADE!!","NEMURIUTA FLANC!!","AUBADE COUP DROIT!!","YOHOHOHO!! SKULL JOKE!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Brook: Yohohoho rhythm dance, music notes fly
      S.animOffset=Math.sin(tick*0.22)*12;
      S.armL=Math.sin(tick*0.28)*1.0;
      S.armR=-Math.sin(tick*0.28+1.2)*1.0;
      if(tick%10===0)spawn('music');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-65;  // slightly taller
    ctx.save();

    // VERY THIN black shoes
    ctx.fillStyle='#111';
    rrect(ctx,cx-14,cy+65,11,40,3);
    rrect(ctx,cx+3,cy+65,11,40,3);
    // Thin dark pants
    ctx.fillStyle='#1a1a1a';
    rrect(ctx,cx-14,cy+28,12,40,3);
    rrect(ctx,cx+2,cy+28,12,40,3);
    // Black suit jacket (thin)
    ctx.fillStyle='#111';
    rrect(ctx,cx-20,cy-28,40,60,4);
    // White shirt / bow tie
    ctx.fillStyle='#eee';
    ctx.fillRect(cx-6,cy-26,12,22);
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.moveTo(cx-5,cy-22);ctx.lineTo(cx,cy-17);ctx.lineTo(cx+5,cy-22);ctx.lineTo(cx+5,cy-28);ctx.lineTo(cx,cy-23);ctx.lineTo(cx-5,cy-28);ctx.closePath();ctx.fill();
    // Thin arms
    ctx.fillStyle='#111';
    if(em==='wave'||em==='special'){
      rrect(ctx,cx-28,cy-22,9,36,3);   // left
      rrect(ctx,cx+19,cy-52,9,30,3);   // right raised
      rrect(ctx,cx+24,cy-74,9,26,3);
    }else{
      rrect(ctx,cx-28,cy-22,9,36,3);
      rrect(ctx,cx+19,cy-22,9,36,3);
    }
    // Cane sword
    ctx.fillStyle='#888';
    ctx.fillRect(cx-30,cy+10,3,55);
    ctx.fillStyle='#f7c948';
    rrect(ctx,cx-32,cy+8,7,8,2);
    // Neck (bone thin)
    ctx.fillStyle='#f0f0f0';
    rrect(ctx,cx-5,hcy+26,10,22,2);
    // SKULL HEAD (most distinctive)
    ctx.fillStyle='#f5f5f0';
    circ(ctx,cx,hcy,26);
    // Hollow black eye sockets
    ctx.fillStyle='#0a0a0a';
    elps(ctx,cx-10,hcy-5,8,9);
    elps(ctx,cx+10,hcy-5,8,9);
    // Small highlight in sockets
    ctx.fillStyle='rgba(255,255,255,0.3)';
    circ(ctx,cx-8,hcy-8,3);
    circ(ctx,cx+12,hcy-8,3);
    // No nose (just 2 small holes)
    ctx.fillStyle='#ccc';
    elps(ctx,cx-3,hcy+6,2.5,2);
    elps(ctx,cx+3,hcy+6,2.5,2);
    // TEETH (visible grin — always)
    ctx.fillStyle='#f5f5f0';
    ctx.fillRect(cx-10,hcy+14,20,8);
    ctx.strokeStyle='#ccc';ctx.lineWidth=1;
    for(let i=1;i<4;i++) {ctx.beginPath();ctx.moveTo(cx-10+i*5,hcy+14);ctx.lineTo(cx-10+i*5,hcy+22);ctx.stroke();}
    ctx.strokeStyle='#aaa';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(cx-10,hcy+14);ctx.lineTo(cx+10,hcy+14);ctx.stroke();
    // AFRO (large dark puff)
    ctx.fillStyle='#1a0a00';
    circ(ctx,cx,hcy-30,24);
    circ(ctx,cx-18,hcy-22,14);
    circ(ctx,cx+18,hcy-22,14);
    // TOP HAT
    ctx.fillStyle='#111';
    rrect(ctx,cx-18,hcy-74,36,46,2);  // hat body
    ctx.fillRect(cx-26,hcy-32,52,6);   // brim
    // Hat band
    ctx.fillStyle='#8B0000';
    ctx.fillRect(cx-18,hcy-34,36,5);

    ctx.restore();
  }
},

// ══════════════════════════════════════════════════════════════════════════════
// 10. JINBE — blue skin, wide head, gill marks, kimono, fish-man
// ══════════════════════════════════════════════════════════════════════════════
{
  id:'jinbe', name:'Jinbe', role:'Helmsman', color:'#2980b9',
  idleBehaviors:['water_kata','meditate','look_around'],
  quotes:{
    idle:["Calm down.","Steady as the sea."],
    hover:["Luffy-kun...","What is it?"],
    pet:["...Thank you.","Strong as the tide."],
    click:["FISH-MAN KARATE!!","VAGABOND DRILL!!"],
    dblclick:["THOUSAND SHARK!!","BURAIKAN!!"],
    happy:["...This is good.","Ha ha ha!"],
    angry:["FISH-MAN KARATE!!","Don't test me!"],
    sad:["Tiger-san...","Arlong..."],
    sleep:["Zzz...ocean..."],
    wave:["HEYYYY!!","Come, join us!"],
    excited:["NAKAMA!!","The Straw Hats!!"],
    special:["FISH-MAN KARATE!!","BURAIKAN!!","THOUSAND SHARK!!","VAGABOND DRILL!!"],
  },
  excited:{
    anim(S,tick,spawn){
      // Jinbe: powerful slow bob, arms spread — calm but powerful joy
      S.animOffset=Math.sin(tick*0.09)*7;
      S.armL=-0.5+Math.sin(tick*0.12)*0.2;
      S.armR=0.5+Math.sin(tick*0.1+1)*0.2;
      if(tick%22===0)spawn('drop');
    }
  },
  draw(ctx,S){
    const em=S.isBlinking?'blink':S.emotion;
    const cx=S.cx, cy=S.cy;
    const hcy=cy-60;
    ctx.save();

    // Wide bare feet (blue)
    ctx.fillStyle='#1a5a8a';
    rrect(ctx,cx-28,cy+65,22,20,4);
    rrect(ctx,cx+6,cy+65,22,20,4);
    // Wide legs
    ctx.fillStyle='#2471a3';
    rrect(ctx,cx-26,cy+40,22,28,3);
    rrect(ctx,cx+4,cy+40,22,28,3);
    // Orange kimono skirt
    ctx.fillStyle='#d4500a';
    rrect(ctx,cx-32,cy+16,64,30,4);
    ctx.fillStyle='#a83d08';
    ctx.fillRect(cx-32,cy+16,64,5);
    // VERY WIDE blue torso / kimono top
    ctx.fillStyle='#2980b9';
    rrect(ctx,cx-36,cy-32,72,52,5);
    // White kimono lining
    ctx.fillStyle='#d0e8f0';
    rrect(ctx,cx-18,cy-32,36,46,2);
    // Belt sash
    ctx.fillStyle='#8B0000';
    ctx.fillRect(cx-34,cy+16,68,8);
    // Wide arms
    ctx.fillStyle='#2980b9';
    if(em==='wave'||em==='special'){
      rrect(ctx,cx-50,cy-26,16,44,4);
      rrect(ctx,cx+34,cy-58,14,34,4);
      rrect(ctx,cx+38,cy-80,14,28,4);
    }else{
      rrect(ctx,cx-50,cy-26,16,44,4);
      rrect(ctx,cx+34,cy-26,16,44,4);
    }
    // Wide neck
    ctx.fillStyle='#2980b9';
    rrect(ctx,cx-10,hcy+27,20,22,3);
    // WIDE BLUE HEAD (fish-man proportions)
    ctx.fillStyle='#2980b9';
    elps(ctx,cx,hcy,34,28);
    // Gill marks on cheeks (3 lines each side)
    ctx.save();
    ctx.strokeStyle='#1a6090';ctx.lineWidth=2;ctx.lineCap='round';
    for(let i=0;i<3;i++){
      ctx.beginPath();ctx.moveTo(cx-34+i*1,hcy-8+i*7);ctx.lineTo(cx-22+i*1,hcy-4+i*7);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx+34-i*1,hcy-8+i*7);ctx.lineTo(cx+22-i*1,hcy-4+i*7);ctx.stroke();
    }
    ctx.restore();
    // Small dark eyes (wide set)
    faceEyes(ctx,cx-18,cx+18,hcy-6,em,'#0a1a2e');
    // Wide nose
    ctx.fillStyle='#1a6090';
    elps(ctx,cx,hcy+6,6,4);
    faceMouth(ctx,cx,hcy+16,em,12);
    // Very short dark hair / no real hair
    ctx.fillStyle='#0a1a2e';
    ctx.beginPath();ctx.arc(cx,hcy-26,30,Math.PI,0);ctx.fill();
    ctx.fillStyle='#1a3a5e';
    ctx.beginPath();ctx.arc(cx,hcy-26,28,Math.PI+0.2,0-0.2);ctx.fill();

    ctx.restore();
  }
},

]; // end window.CHARACTERS

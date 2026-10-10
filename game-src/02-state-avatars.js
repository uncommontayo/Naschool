/* =================== STATE =================== */
const SAVE_KEY='naschool-proto-v1';
let S=null;            // game state
let O={step:0,d:{}};   // onboarding state
let CAST=null;         // derived people
let SPEED=0.2;         // game minutes per real second: 1 game day = 120 real minutes (MVP spec)
let LAST_SIG='';
let paused=false;

function load(){try{const r=localStorage.getItem(SAVE_KEY);return r?JSON.parse(r):null}catch(e){return null}}
function save(){if(!S)return;S.lastSeen=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function wipe(){try{localStorage.removeItem(SAVE_KEY)}catch(e){}}

/* =================== AVATARS =================== */
let UID=0;
function avatar(o,w=48){
  const id='av'+(++UID);
  const sk=o.skin||'#6E4630',dark=shade(sk,-22),hc=o.hairColor||'#17110e';
  const bx=o.build==='Slim'?0.92:o.build==='Sturdy'?1.1:1;
  const hy=o.height==='Short'?0.96:o.height==='Tall'?1.03:1;
  const sc=(o.scale||1)*hy;
  let defs='';
  if(o.pattern){const p=o.pattern;defs+=`<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${p[0]}"/><circle cx="4.5" cy="4.5" r="2.6" fill="${p[1]}"/><circle cx="0" cy="0" r="1.7" fill="${p[2]}"/><circle cx="9" cy="9" r="1.7" fill="${p[2]}"/></pattern>`}
  if(o.check){defs+=`<pattern id="${id}c" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${o.bottom}"/><rect width="4" height="8" fill="rgba(243,230,200,.28)"/><rect width="8" height="4" fill="rgba(243,230,200,.22)"/></pattern>`}
  const tf=o.patternTop?`url(#${id})`:(o.top||'#fff');
  const bf=o.check?`url(#${id}c)`:o.patternBottom?`url(#${id})`:(o.bottom||'#2a2f3a');
  const fx={Oval:[9.3,11.4],Round:[10.2,10.6],Long:[8.8,12.2],Square:[9.9,11],Heart:[9.6,11.2]}[o.face||'Oval'];
  const hs=o.hair||'lowcut';
  let g='';
  if(hs==='puff')g+=`<circle cx="30" cy="8.5" r="9.5" fill="${hc}"/>`;
  if(hs==='braids'||hs==='relaxed'||hs==='knotless')g+=`<path d="M19 14 Q16.5 40 20 ${hs==='relaxed'?44:54} L40 ${hs==='relaxed'?44:54} Q43.5 40 41 14 Z" fill="${hc}"/>`;
  if(o.bag)g+=`<rect x="12.5" y="42" width="35" height="34" rx="6" fill="${o.bag}"/>`;
  const bt=o.bottomType||'trousers';
  const sock=o.socks?`<rect x="19.5" y="131" width="8.5" height="13" fill="#fff"/><rect x="32" y="131" width="8.5" height="13" fill="#fff"/>`:'';
  if(bt==='trousers')g+=`<rect x="17.5" y="80" width="11.5" height="65" rx="2" fill="${bf}"/><rect x="31" y="80" width="11.5" height="65" rx="2" fill="${bf}"/>`;
  else if(bt==='shorts')g+=`<rect x="19.5" y="100" width="8.5" height="44" fill="${sk}"/><rect x="32" y="100" width="8.5" height="44" fill="${sk}"/>${sock}<path d="M16.5 79 H43.5 L44.5 106 H31.5 L30 93 L28.5 106 H15.5 Z" fill="${bf}"/>`;
  else if(bt==='skirt')g+=`<rect x="20" y="112" width="8" height="33" fill="${sk}"/><rect x="32" y="112" width="8" height="33" fill="${sk}"/>${sock}<path d="M16.5 78 H43.5 L47 ${o.long?140:124} H13 Z" fill="${bf}"/>`;
  else g+=`<rect x="20" y="112" width="8" height="33" fill="${sk}"/><rect x="32" y="112" width="8" height="33" fill="${sk}"/>${sock}`;
  const shoe=o.shoes||'#141414';
  g+=`<ellipse cx="23.5" cy="146.5" rx="6.8" ry="3.2" fill="${shoe}"/><ellipse cx="36.5" cy="146.5" rx="6.8" ry="3.2" fill="${shoe}"/>`;
  const arm=x=>o.sleeves==='short'?`<rect x="${x}" y="39" width="7.5" height="15" rx="3" fill="${tf}"/><rect x="${x+.8}" y="52" width="6" height="27" rx="3" fill="${sk}"/><circle cx="${x+3.8}" cy="81" r="3.6" fill="${sk}"/>`:`<rect x="${x}" y="39" width="7.5" height="40" rx="3.5" fill="${tf}"/><circle cx="${x+3.8}" cy="81" r="3.6" fill="${sk}"/>`;
  g+=arm(8.5)+arm(44);
  if(bt==='gown')g+=`<path d="M15.5 40 Q30 34 44.5 40 L48 ${o.long?142:116} H12 Z" fill="${tf}"/>`;
  else g+=`<path d="M15.5 40 Q30 34 44.5 40 L44 82 L16 82 Z" fill="${tf}"/>`;
  if(bt==='pinafore')g+=`<path d="M19 41 H41 L48 116 H12 Z" fill="${bf}"/><rect x="21.5" y="37" width="3" height="7" fill="${bf}"/><rect x="35.5" y="37" width="3" height="7" fill="${bf}"/>`;
  if(o.apron)g+=`<path d="M20 50 H40 L41 106 H19 Z" fill="${o.apron}"/>`;
  if(o.collar)g+=`<path d="M25 36 L30 42 L35 36 L33 35 L30 39 L27 35 Z" fill="${o.collar}"/>`;
  if(o.tie)g+=`<path d="M28.6 39 H31.4 L32.6 60 L30 64 L27.4 60 Z" fill="${o.tie}"/>${o.tieStripe?`<path d="M28 47 L32.3 44 M28.2 53 L32.6 50" stroke="${o.tieStripe}" stroke-width="1.2"/>`:''}`;
  if(o.lanyard)g+=`<path d="M25 37 L30 58 L35 37" stroke="${o.lanyard}" stroke-width="1.4" fill="none"/><rect x="27.5" y="57" width="5" height="7" rx="1" fill="#fff"/>`;
  if(o.badge)g+=`<circle cx="37" cy="48" r="2.6" fill="${o.badge}" stroke="#fff" stroke-width=".6"/>`;
  if(o.bag)g+=`<path d="M19 40 L21 72 M41 40 L39 72" stroke="${shade(o.bag,-30)}" stroke-width="2.4"/>`;
  g+=`<rect x="26.5" y="29" width="7" height="9" fill="${dark}"/>`;
  if(hs==='hijab')g+=`<path d="M17 20 Q17 6 30 6 Q43 6 43 20 L46 45 Q30 51 14 45 Z" fill="${o.hijab||hc}"/>`;
  g+=`<ellipse cx="20.6" cy="22" rx="1.8" ry="2.6" fill="${sk}"/><ellipse cx="39.4" cy="22" rx="1.8" ry="2.6" fill="${sk}"/>`;
  g+=`<ellipse cx="30" cy="21" rx="${fx[0]}" ry="${fx[1]}" fill="${sk}"/>`;
  g+=`<ellipse cx="26.4" cy="21.6" rx="1.25" ry="1.4" fill="${o.eyes||'#120c0a'}"/><ellipse cx="33.6" cy="21.6" rx="1.25" ry="1.4" fill="${o.eyes||'#120c0a'}"/>`;
  g+=`<path d="M24.6 18.6 Q26.4 17.7 28.1 18.4 M31.9 18.4 Q33.6 17.7 35.4 18.6" stroke="#120c0a" stroke-width="0.9" fill="none" stroke-linecap="round"/>`;
  g+=`<path d="M30 23 Q28.4 26.2 30.4 26.4" stroke="${dark}" stroke-width="0.9" fill="none"/>`;
  g+=`<path d="M27.6 28.4 Q30 29.9 32.4 28.4" stroke="#4a221b" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  if(o.freckles)g+=`<g fill="#c98a6a"><circle cx="25" cy="24.5" r=".5"/><circle cx="26.6" cy="25.2" r=".5"/><circle cx="35" cy="24.5" r=".5"/><circle cx="33.4" cy="25.2" r=".5"/></g>`;
  const fh=o.facialHair;
  if(fh==='Full beard')g+=`<path d="M21.3 22 Q21.8 33.6 30 34 Q38.2 33.6 38.7 22 Q37 30.5 30 31 Q23 30.5 21.3 22 Z" fill="${hc}"/>`;
  if(fh==='Stubble')g+=`<path d="M21.5 23 Q22 33 30 33.4 Q38 33 38.5 23 Q37 30.5 30 31 Q23 30.5 21.5 23 Z" fill="${hc}" opacity=".35"/>`;
  if(fh==='Goatee')g+=`<ellipse cx="30" cy="31.5" rx="2.6" ry="2" fill="${hc}"/>`;
  if(fh==='Moustache'||fh==='Goatee')g+=`<path d="M27 27.2 Q30 25.8 33 27.2" stroke="${hc}" stroke-width="1.4" fill="none"/>`;
  g+=hairFront(hs,hc,o);
  if(o.glasses)g+=`<g stroke="#1d1d1d" stroke-width="0.8" fill="none"><circle cx="26.4" cy="21.7" r="2.9"/><circle cx="33.6" cy="21.7" r="2.9"/><path d="M29.3 21.5 H30.7"/></g>`;
  const W=w*sc,H=W*160/60;
  return `<svg viewBox="0 0 60 160" width="${W.toFixed(1)}" height="${H.toFixed(1)}" aria-hidden="true">${defs?`<defs>${defs}</defs>`:''}<g transform="translate(30 0) scale(${bx} 1) translate(-30 0)">${g}</g></svg>`;
}
function hairFront(hs,hc,o){
  const cap=`<path d="M20.6 18 Q21 9.2 30 9.4 Q39 9.2 39.4 18 Q37.5 13.4 30 13.2 Q22.5 13.4 20.6 18 Z" fill="${hc}"/>`;
  const thin=`<path d="M21 17 Q21.6 10.4 30 10.6 Q38.4 10.4 39 17 Q37.2 13.8 30 13.7 Q22.8 13.8 21 17 Z" fill="${hc}"/>`;
  switch(hs){
    case 'lowcut':return cap;
    case 'greylow':return cap;
    case 'fade':return thin;
    case 'waves':return cap+`<path d="M23 13.5 q2 -1.5 4 0 q2 1.5 4 0 q2 -1.5 4 0" stroke="${shade(hc,30)}" stroke-width=".6" fill="none"/>`;
    case 'twists':return cap+[22.5,26,30,34,37.5].map(x=>`<circle cx="${x}" cy="10.8" r="2.1" fill="${hc}"/>`).join('');
    case 'cornrows':return `<path d="M20.2 19 Q20.6 8.4 30 8.6 Q39.4 8.4 39.8 19 Q37.5 12.8 30 12.6 Q22.5 12.8 20.2 19 Z" fill="${hc}"/><path d="M24 11 L23 17 M27 10 L26.5 14 M30 9.6 L30 13 M33 10 L33.5 14 M36 11 L37 17" stroke="${shade(hc,35)}" stroke-width=".5"/>`;
    case 'shuku':return cap+`<circle cx="30" cy="6.3" r="4.8" fill="${hc}"/>`;
    case 'ghana':return `<path d="M20.2 19 Q20.6 8.4 30 8.6 Q39.4 8.4 39.8 19 Q37.5 12.8 30 12.6 Q22.5 12.8 20.2 19 Z" fill="${hc}"/><path d="M22 18 L28 9.5 M25 18 L30 9.4 M38 18 L32 9.5 M35 18 L30.5 9.5" stroke="${shade(hc,35)}" stroke-width=".55"/>`;
    case 'puff':return thin;
    case 'braids':case 'knotless':return cap+`<path d="M23 12 L21 17 M27 10.4 L26 14 M33 10.4 L34 14 M37 12 L39 17" stroke="${shade(hc,35)}" stroke-width=".5"/>`;
    case 'bun':return cap+`<circle cx="30" cy="7" r="5.5" fill="${hc}"/>`;
    case 'bob':return `<path d="M19.8 28 Q18 8 30 8.4 Q42 8 40.2 28 L37.6 28 Q38.3 15.2 30 14 Q21.7 15.2 22.4 28 Z" fill="${hc}"/>`;
    case 'relaxed':return `<path d="M19.4 34 Q17 8 30 8.4 Q43 8 40.6 34 L38 34 Q38.6 15 30 14 Q21.4 15 22 34 Z" fill="${hc}"/>`;
    case 'headwrap':{const c=o.wrap||'#c0392b';return `<path d="M19 19 Q16.6 4 30 4.4 Q43.4 4 41 19 Q36 12.4 30 12.8 Q24 12.4 19 19 Z" fill="${c}"/><circle cx="38" cy="7" r="3.2" fill="${shade(c,-20)}"/>`}
    case 'gele':{const c=o.wrap||'#d4ac0d';return `<path d="M17 19 Q12 -2 30 1 Q48 -2 43 19 Q36 11.8 30 12.4 Q24 11.8 17 19 Z" fill="${c}"/><path d="M20 10 Q30 2 40 10" stroke="${shade(c,-25)}" stroke-width="1" fill="none"/>`}
    case 'hijab':{const c=o.hijab||hc;return `<path d="M19.4 22 Q19 6.6 30 6.6 Q41 6.6 40.6 22 Q39.4 12.4 30 11.8 Q20.6 12.4 19.4 22 Z" fill="${c}"/>`}
    case 'bald':return `<ellipse cx="26" cy="13" rx="4" ry="1.8" fill="#fff" opacity=".18"/>`;
    default:return cap;
  }
}
function uniformFor(code,year,gender){
  const s=SCHOOLS[code],u={top:s.shirt,bottom:s.primary,badge:code==='GHC'?s.accent:s.accent,shoes:'#1a1a1a'};
  if(year==='JSS3'){u.sleeves='short';u.socks=true;if(gender==='M')u.bottomType='shorts';else{u.bottomType='pinafore';if(code==='BFA')u.check=true}}
  else{u.sleeves='long';u.tie=s.primary;u.tieStripe=code==='GHC'?s.accent:s.accent;u.collar=s.shirt;u.bottomType=gender==='M'?'trousers':'skirt'}
  return u;
}
const OUTFITS={M:['Shirt and tie','Ankara shirt','Senator kaftan'],F:['Blouse and skirt','Ankara gown','Iro and buba','Trouser suit']};
const ANKARA=[['#c0392b','#f1c40f','#1f6f8b'],['#1f6f8b','#f39c12','#ffffff'],['#6c3483','#f4d03f','#27ae60'],['#117a65','#f5b041','#922b21']];
function staffOutfit(gender,outfit,code,seed){
  const s=SCHOOLS[code||'GHC'],pat=ANKARA[seed%ANKARA.length];
  if(gender==='M'){
    if(outfit==='Ankara shirt')return{top:'#fff',pattern:pat,patternTop:1,bottom:'#2b2f38',bottomType:'trousers'};
    if(outfit==='Senator kaftan')return{top:['#2c4a3e','#3a3f5c','#5d4037'][seed%3],bottom:['#2c4a3e','#3a3f5c','#5d4037'][seed%3],bottomType:'trousers'};
    return{top:'#d9e6f5',collar:'#d9e6f5',tie:s.primary,bottom:'#2b2f38',bottomType:'trousers'};
  }
  if(outfit==='Ankara gown')return{top:'#fff',pattern:pat,patternTop:1,bottomType:'gown',long:1,shoes:'#5d4037'};
  if(outfit==='Iro and buba')return{top:'#fff',pattern:pat,patternTop:1,patternBottom:1,bottomType:'skirt',long:1,shoes:'#5d4037'};
  if(outfit==='Trouser suit')return{top:'#3a3f5c',bottom:'#3a3f5c',bottomType:'trousers'};
  return{top:'#f4d6dc',bottom:'#2b2f38',bottomType:'skirt'};
}
function roleOutfit(role,gender,code,seed){
  switch(role){
    case 'matron':return{top:'#f4f4f4',bottomType:'gown',hair:'headwrap',wrap:'#f4f4f4'};
    case 'nurse':return{top:'#ffffff',bottomType:'gown',hair:'headwrap',wrap:'#ffffff'};
    case 'security':return{top:'#1f2a44',bottom:'#1f2a44',bottomType:'trousers',hair:'lowcut'};
    case 'cook':return{top:'#e67e22',apron:'#ffffff',bottomType:'gown',hair:'headwrap',wrap:'#ffffff'};
    case 'cleaner':return{top:'#2f7d4a',bottom:'#2f7d4a',bottomType:'trousers'};
    case 'principal':return gender==='M'?{top:'#1c2233',bottom:'#1c2233',bottomType:'trousers',collar:'#fff',tie:'#e3a72f'}:{top:'#5b2a6e',bottomType:'gown',long:1,hair:'gele',wrap:'#e3a72f'};
    case 'mum':return{top:'#fff',pattern:ANKARA[seed%4],patternTop:1,bottomType:'gown',long:1,hair:'headwrap',wrap:ANKARA[(seed+1)%4][0]};
    default:return staffOutfit(gender,OUTFITS[gender][seed%OUTFITS[gender].length],code,seed);
  }
}
function npcLook(n){
  const h=hash(n.name);
  const look={skin:SKINS[h%8][1],face:['Oval','Round','Long','Square','Heart'][h%5],build:['Slim','Average','Average','Sturdy'][h%4]};
  if(n.kind==='student'){
    Object.assign(look,uniformFor(n.school,n.year,n.g));
    const first=n.name.split(' ')[0];
    if(n.g==='M')look.hair=rnd2(['lowcut','fade','waves',...(n.year==='SSS3'?['twists']:[])],h);
    else look.hair=HIJAB_NAMES.includes(first)?'hijab':rnd2(['lowcut','cornrows','shuku','ghana',...(n.year==='SSS3'?['puff']:[])],h);
    if(look.hair==='hijab')look.hijab=SCHOOLS[n.school].primary;
    if(n.arch==='ACA')look.glasses=true;
    look.bag=rnd2(['#1d2230','#2b3a67','#555b66','#7B1E2E'],h>>3);
    look.scale=n.year==='JSS3'?0.88:1;
  } else {
    look.scale=1.05;
    if(n.g==='M')look.hair=rnd2(['lowcut','bald','fade','greylow'],h),look.facialHair=rnd2(['Clean','Stubble','Full beard','Moustache','Goatee'],h>>2);
    else look.hair=rnd2(['knotless','bob','bun','headwrap','relaxed'],h);
    if(look.hair==='greylow')look.hairColor='#8f8a85';
    Object.assign(look,roleOutfit(n.role||'teacher',n.g,n.school,h));
    if(n.kind==='teacher')look.lanyard=SCHOOLS[n.school].primary;
  }
  return look;
}
function rnd2(a,h){return a[Math.abs(h)%a.length]}
function logoSVG(code,size=44){
  if(code==='GHC')return `<svg viewBox="0 0 40 46" width="${size}" height="${size*46/40}" aria-hidden="true"><path d="M3 3 H37 V24 Q37 38 20 44 Q3 38 3 24 Z" fill="#1F4E9C" stroke="#fff" stroke-width="2"/><path d="M9 33 Q14 30 20 33 Q26 30 31 33 V36 Q26 33 20 36 Q14 33 9 36 Z" fill="#fff"/><path d="M12 30 H18 V26 H23 V22 H28 V30" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M20 7 Q25 12 20 17 Q15 12 20 7 Z" fill="#A7AFB8"/><text x="20" y="22" text-anchor="middle" font-size="5.6" font-family="Georgia,serif" font-weight="700" fill="#fff">GHC</text></svg>`;
  return `<svg viewBox="0 0 44 44" width="${size}" height="${size}" aria-hidden="true"><circle cx="22" cy="22" r="20.5" fill="#7B1E2E" stroke="#F3E6C8" stroke-width="2.5"/><path d="M10 27 A12 12 0 0 1 34 27 Z" fill="#E3A72F"/><path d="M8 29 Q15 37 22 29 M36 29 Q29 37 22 29" stroke="#F3E6C8" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M22 6.5 l1.3 2.7 3 .4 -2.2 2 .6 3 -2.7-1.5 -2.7 1.5 .6-3 -2.2-2 3-.4z" fill="#E3A72F"/><text x="22" y="40" text-anchor="middle" font-size="6" font-family="Arial,sans-serif" font-weight="900" fill="#F3E6C8">BFA</text></svg>`;
}


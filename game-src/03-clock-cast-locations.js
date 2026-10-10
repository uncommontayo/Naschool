/* =================== CLOCK =================== */
const tod=t=>((t%1440)+1440)%1440;
const dayOf=t=>Math.floor(t/1440);
const DOW=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const dow=t=>dayOf(t)%7;
const weekday=t=>dow(t)<5;
function hhmm(m){m=tod(m);const h=Math.floor(m/60),mi=m%60;return String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')}
function phaseOf(t){const m=tod(t);if(m>=360&&m<630)return 'Morning';if(m>=630&&m<840)return 'Midday';if(m>=840&&m<1140)return 'After school';return 'Night'}
function periodIdx(t){if(!weekday(t))return -1;const m=tod(t);for(let i=0;i<5;i++){if(m>=PERIODS[i]&&m<PERIODS[i]+50)return i}return -1}
function dayList(t){const d=dow(t);return (d===1||d===3)?TT.TTH:TT.MWF}
function subjectFor(year,t,p){const l=dayList(t);return year==='JSS3'?l[p]:l[(p+1)%5]}
function activityOf(t){
  const m=tod(t),d=dow(t);
  if(d===5){if(m>=540&&m<780)return 'Saturday · sports and visiting day';if(m>=1080&&m<1110)return 'Rivalry results';}
  if(d===6&&m>=360&&m<1140)return 'Sunday · free day';
  if(m<330)return 'Lights out';if(m<360)return 'Wake-up bell';if(m<435)return 'Bath, dress, breakfast';if(m<450)return 'Getting to assembly';
  if(m<480)return weekday(t)?'Assembly':'Morning';
  const p=periodIdx(t);if(p>=0){const yr=S&&S.player.year||'JSS3';return `Period ${p+1} · ${SUBJ[subjectFor(yr,t,p)]}`}
  if(m<660)return weekday(t)?'Break':'Free time';if(m<760)return 'Free time';if(m<780)return 'Free time';if(m<840)return 'Lunch';if(m<960)return 'Sports and clubs';if(m<1080)return 'Free time · rivalry friendlies';if(m<1140)return 'Dinner';if(m<1260)return 'Prep (night study)';if(m<1290)return 'Dorm time';return 'Lights out';
}

/* =================== CAST =================== */
function buildCast(){
  const P=S.player,code=P.school,rival=code==='GHC'?'BFA':'GHC';
  const people={};
  const mk=(o)=>{o.look=npcLook(o);people[o.id]=o;return o};
  ['JSS3','SSS3'].forEach(yr=>{
    CLASS_NPCS[code][yr].forEach(([arch,name,g])=>mk({id:'s_'+name.split(' ')[0].toLowerCase(),kind:'student',name,g,arch,year:yr,school:code,cls:SCHOOLS[code].classes[yr],house:ARCH_HOUSE[arch]}));
  });
  Object.entries(TEACHERS[code]).forEach(([sub,[name,style,line,g]])=>{
    if(P.role==='teacher'&&P.subject===sub)return;
    mk({id:'t_'+sub,kind:'teacher',name,g,subject:sub,style,line,school:code,role:'teacher'});
  });
  STAFF[code].forEach(([role,name,g])=>mk({id:'x_'+role,kind:'staff',role,name,g,school:code}));
  mk({id:'j_mamaput',kind:'junction',role:'mamaput',name:'Iya Rafiu',g:'F',school:code,lbl:'Mama Put'});
  mk({id:'j_pos',kind:'junction',role:'pos',name:'Chidi POS',g:'M',school:code,lbl:'POS agent'});
  mk({id:'j_kiosk',kind:'junction',role:'kiosk',name:'Mallam Shehu',g:'M',school:code,lbl:'Kiosk'});
  mk({id:'h_mum',kind:'home',role:'mum',name:'Mum',g:'F',school:code,lbl:'Your mum'});
  // rival students for the junction / ground
  const ry=P.year||'SSS3';
  CLASS_NPCS[rival][ry].filter(a=>a[0]==='COM'||a[0]==='FUN').forEach(([arch,name,g])=>mk({id:'r_'+name.split(' ')[0].toLowerCase(),kind:'student',rival:true,name,g,arch,year:ry,school:rival,cls:SCHOOLS[rival].classes[ry],house:ARCH_HOUSE[arch]}));
  // simulated human players
  const myYear=P.year||'JSS3',otherYear=myYear==='JSS3'?'SSS3':'JSS3';
  const sims=[['kachi','Kachi Nwosu','M',code,myYear,'SOC'],['ronke','Ronke Tella','F',code,otherYear,'SPO'],['dami','Dami Ade','F',code,myYear,'ACA'],['seun','Seun Bello','M',rival,ry,'COM']];
  sims.forEach(([k,name,g,sc,yr,arch])=>mk({id:'p_'+k,kind:'student',human:false,name,g,arch,year:yr,school:sc,cls:SCHOOLS[sc].classes[yr],house:ARCH_HOUSE[arch],rival:sc!==code}));
  const own=CLASS_NPCS[code][P.year||'JSS3'];
  const byArch=a=>'s_'+own.find(x=>x[0]===a)[1].split(' ')[0].toLowerCase();
  CAST={people,buddy:byArch('HEL'),quiet:byArch('OBS'),herring:byArch('COM'),social:byArch('SOC'),
    prankster:'s_'+CLASS_NPCS[code].JSS3.find(x=>x[0]==='MIS')[1].split(' ')[0].toLowerCase(),
    myClass:P.role==='student'?SCHOOLS[code].classes[P.year]:null,rival};
  // staff storyline pair (teachers), excluding the player's subject
  const pairs=code==='GHC'?[['ENG','FIN'],['HIS','BSC']]:[['BSC','ENG'],['HIS','GEO']];
  const pr=pairs.find(p=>!(P.role==='teacher'&&p.includes(P.subject)));
  CAST.pair=pr.map(s=>TEACHERS[code][s][0]);
}
const npc=id=>CAST.people[id];
function relLevel(score,kind){const L=kind==='staffpair'?['Unknown','Colleague','Friend','Close Colleague']:kind==='adult'?['Unknown','Known','Trusted','Star Student']:['Unknown','Acquaintance','Friend','Close Friend'];return score<10?L[0]:score<40?L[1]:score<75?L[2]:L[3]}
function relKind(n){if(S.player.role==='teacher'&&n.kind==='teacher')return 'staffpair';if(n.kind!=='student')return S.player.role==='teacher'?'staffpair':'adult';return S.player.role==='teacher'?'adult':'peer'}
function rel(id){return S.rels[id]||0}
function addRel(id,d,silent){
  const n=npc(id);if(!n)return;
  const before=relLevel(rel(id),relKind(n));
  S.rels[id]=clamp(rel(id)+d,0,100);
  const after=relLevel(rel(id),relKind(n));
  if(!silent&&d)toast(`${d>0?'+':''}${d} ${n.name.split(' ')[0]} · ${after}`,d>0?'good':'bad');
  if(before!==after&&d>0)notify('social',`${n.name} is now your ${after}.`);
}
function npcLoc(n,t){
  const m=tod(t),d=dow(t),wk=d<5;
  if(n.kind==='junction')return 'junction';
  if(n.kind==='home')return 'home';
  if(n.kind==='staff'){
    switch(n.role){
      case 'principal':case 'vp':return (wk&&m>=450&&m<480)?'assembly':'admin';
      case 'matron':case 'housemaster':return (m<450||m>=1140)?'hostel':'admin';
      case 'nurse':case 'counsellor':return 'clinic';
      case 'librarian':return 'library';case 'security':return 'gate';case 'cook':return 'cafeteria';
      case 'cleaner':return m<720?'common':'field';
    }
  }
  if(n.kind==='teacher'){
    const p=periodIdx(t);
    if(p>=0&&(subjectFor('JSS3',t,p)===n.subject||subjectFor('SSS3',t,p)===n.subject))return 'classroom';
    if(m>=390&&m<1080)return 'staffroom';return 'quarters';
  }
  // students (incl. simulated players)
  const h=hash(n.id);
  if(n.rival){return (m>=960&&m<1140)?(h%2?'junction':'ground'):(d===5&&m>=540&&m<780?'ground':'away')}
  if(m<420)return 'hostel';
  if(m<435)return 'cafeteria';
  if(wk){
    if(m<480)return 'assembly';
    if(periodIdx(t)>=0)return 'classroom';
    if(m<660)return h%2?'cafeteria':'common';
    if(m<780)return 'common';
  }
  if(m<840)return 'cafeteria';
  if(m<1080){const a=n.arch;if(a==='SPO'||a==='COM')return (d===5&&m<780)?'ground':'field';if(a==='ACA'||a==='OBS')return 'library';if(a==='HEL')return h%2?'cafeteria':'common';return 'common'}
  if(m<1140)return 'cafeteria';
  if(m<1260)return wk?'classroom':'common';
  return 'hostel';
}
function peopleAt(loc){
  const t=S.t,P=S.player,out=[];
  for(const n of Object.values(CAST.people)){
    if(npcLoc(n,t)!==loc)continue;
    if(n.kind==='student'&&!n.rival&&n.school!==P.school)continue;
    if(loc==='classroom'&&n.kind==='student'){const cls=classroomClass();if(n.cls!==cls)continue}
    if(loc==='classroom'&&n.kind==='teacher'){const p=periodIdx(t);const yr=classroomYear();if(p<0||subjectFor(yr,t,p)!==n.subject)continue}
    if(loc==='hostel'&&n.kind==='student'){if(n.g!==P.presentation||n.year!==(P.year||n.year))continue}
    if(loc==='hostel'&&n.kind==='staff'){if((P.presentation==='F')!==(n.role==='matron'))continue}
    if(loc==='home'&&!(P.status==='day'))continue;
    out.push(n);
  }
  out.sort((a,b)=>(b.id===CAST.buddy)-(a.id===CAST.buddy)||(a.kind==='student')-(b.kind==='student'));
  return out.slice(0,11);
}
function classroomYear(){const P=S.player;if(P.role==='student')return P.year;const tc=teacherClassNow();return tc?tc.year:'JSS3'}
function classroomClass(){return SCHOOLS[S.player.school].classes[classroomYear()]}
function teacherClassNow(){const P=S.player,p=periodIdx(S.t);if(p<0||P.role!=='teacher')return null;if(subjectFor('JSS3',S.t,p)===P.subject)return{year:'JSS3',p};if(subjectFor('SSS3',S.t,p)===P.subject)return{year:'SSS3',p};return null}

/* =================== LOCATIONS =================== */
const LOCS={
  gate:{n:'School gate',out:1,ground:'concrete'},assembly:{n:'Assembly ground',out:1,ground:'concrete'},classroom:{n:'Classroom',ground:'floor tile'},
  library:{n:'Library',ground:'floor wood'},cafeteria:{n:'Cafeteria',ground:'floor tile'},field:{n:'Football field',out:1,ground:'grass'},
  common:{n:'Common area',out:1,ground:'dirt'},hostel:{n:'Hostel',ground:'floor cement'},admin:{n:'Admin block',ground:'floor tile'},
  clinic:{n:'Clinic and counselling',ground:'floor tile'},staffroom:{n:'Staff room',ground:'floor wood'},quarters:{n:'Staff quarters',ground:'floor wood'},
  junction:{n:'Town Junction',out:1,ground:'road',shared:1},home:{n:'Home',ground:'floor tile'},ground:{n:'Inter-School Ground',out:1,ground:'grass',shared:1}
};
function locName(id){const P=S.player;if(id==='classroom')return P.role==='student'?`${P.year} ${P.cls}`:`Classroom · ${classroomYear()} ${classroomClass()}`;if(id==='hostel')return P.presentation==='F'?"Girls' hostel":"Boys' hostel";if(id==='quarters')return P.presentation==='F'?'Staff quarters (female block)':'Staff quarters (male block)';return LOCS[id].n}
function canEnter(id){
  const P=S.player,m=tod(S.t),d=dow(S.t);
  if(S.lock&&S.t<S.lock.until&&id!==S.lock.loc)return{ok:false,reason:`${S.lock.reason} until ${hhmm(S.lock.until)}.`};
  if(id==='staffroom'&&P.role!=='teacher')return{ok:false,reason:'Staff only. You can knock on the door.',knock:true};
  if(id==='quarters'&&P.role!=='teacher')return{ok:false,reason:'Staff only.'};
  if(id==='hostel'){if(P.role==='teacher')return isDuty()&&m>=1260?{ok:true}:{ok:false,reason:isDuty()?'Duty teacher inspection opens after 21:00.':'Only the duty teacher enters the hostels.'};if(P.status!=='boarding')return{ok:false,reason:'Boarders only.'}}
  if(id==='home'&&P.status!=='day')return{ok:false,reason:'Day students only.'};
  if(id==='ground'){const open=(d===5&&m>=540&&m<780)||(m>=960&&m<1020);if(!open)return{ok:false,reason:'Opens for rivalry events: daily friendly 16:00–17:00, Saturday 09:00–13:00.'}}
  if(id==='junction'&&P.role==='student'){
    if(P.status==='boarding'&&!(d===5&&m>=540&&m<1080))return{ok:false,reason:'Boarders need permission to leave. Visiting day is Saturday.',sneak:true};
    if(P.status==='day'&&d<5&&m>=450&&m<960)return{ok:false,reason:'School hours. Day students leave from 16:00.',sneak:true};
  }
  return{ok:true};
}
function isDuty(){return S.player.role==='teacher'&&dayOf(S.t)%2===0}


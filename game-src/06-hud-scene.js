/* =================== HUD =================== */
function renderHUD(){
  if(!S||$('#game').hidden)return;
  const P=S.player,s=SCHOOLS[P.school];
  const av=avatar(lookToAvatar(P.look,P.role,P.school,P.year),40);
  const sub=P.role==='student'?`${P.year} ${P.cls} · <span class="housedot" style="background:${HOUSES[P.house]}"></span>${P.house} · ${P.status==='boarding'?'Boarder':'Day'}`:`${SUBJ[P.subject]} · Staff · ${P.house} patron${isDuty()?' · Duty teacher':''}`;
  const next=P.role==='teacher'?nextLesson():null;
  $('#hud').innerHTML=`<div class="hud-id"><div class="hud-av">${av}</div><div style="min-width:0"><b>${esc(P.name)} ${logoSVG(P.school,14)}</b><small>${sub}</small></div></div>
  <div class="hud-stats"><span class="pill opt">📍 ${esc(locName(S.loc))}</span><span class="pill"><span class="mono" id="clock">${hhmm(S.t)}</span><small id="act">${DOW[dow(S.t)].slice(0,3)} · ${activityOf(S.t)}</small></span>
  ${next?`<span class="pill opt">Next: ${next}</span>`:''}${isHungry()?'<span class="pill hungry" title="Eat something to clear this">Hungry: −3 s per question</span>':''}
  <span class="pill money mono">${naira(S.wallet)}</span><span class="pill opt"><small>Kolo</small> <span class="mono">${naira(S.kolo.bal)}</span></span>
  <button class="iconbtn" aria-label="Notifications" data-a="${act(()=>openPanel('notifs'))}">🔔${S.unread?`<span class="n">${S.unread}</span>`:''}</button>
  <button class="iconbtn" aria-label="Settings" data-a="${act(()=>openPanel('tester'))}">⚙</button></div>`;
}
function nextLesson(){const P=S.player;const m=tod(S.t);if(!weekday(S.t))return 'No lessons today';for(let p=0;p<5;p++){if(PERIODS[p]+50<=m)continue;for(const yr of ['JSS3','SSS3']){if(subjectFor(yr,S.t,p)===P.subject)return `${yr} ${SCHOOLS[P.school].classes[yr]} ${hhmm(PERIODS[p])}`}}return 'Done for today'}
function updateClock(){const c=$('#clock');if(c){c.textContent=hhmm(S.t);$('#act').textContent=`${DOW[dow(S.t)].slice(0,3)} · ${activityOf(S.t)}`}}
function renderTaskbar(){
  if(!S)return;const tk=activeTask();
  const g=S.points.GHC,b=S.points.BFA,tot=Math.max(1,g+b);
  $('#taskbar').innerHTML=`<div class="taskline"><span class="lbl">TASK</span><button data-a="${act(()=>openPanel('tasks'))}">${esc(tk)}</button></div>
  <button class="rival" data-a="${act(()=>openPanel('rivalry'))}" aria-label="Rivalry board"><span style="color:${SCHOOLS.GHC.primary}">GHC ${g}</span><span class="bar"><i style="width:${g/tot*100}%;background:${SCHOOLS.GHC.primary}"></i><i style="width:${b/tot*100}%;background:${SCHOOLS.BFA.primary}"></i></span><span style="color:${SCHOOLS.BFA.primary}">BFA ${b}</span></button>`;
}
function activeTask(){
  const P=S.player;
  if(S.tut&&S.tut<10)return TUT_TEXT[S.tut]||'Finish the tutorial';
  if(P.role==='student'){const M=S.mystery;if(M.started&&!M.resolved)return `Find out who moved the ${trophyName()} · ${clueCount()}/6 clues`;}
  const open=(P.role==='teacher'?S.teacherTasks:S.tasks).find(x=>!x.done);return open?open.text:'Explore the school. Something is always happening.';
}
function renderNav(){
  const items=[['map','🗺','Map'],['tasks','✓','Tasks'],['bag','🎒','Bag'],['wallet','₦','Wallet'],['friends','👥','Friends'],['chat','💬','Chat'],['timetable','📅','Timetable'],['rivalry','🏆','Rivalry'],['me','👤','Me']];
  $('#nav').innerHTML=items.map(([k,i,l])=>`<button data-a="${act(()=>openPanel(k))}" aria-label="${l}"><span>${i}</span><b>${l}</b></button>`).join('');
}

/* =================== SCENE =================== */
function skyFor(t){const m=tod(t);if(m<360||m>=1200)return 'linear-gradient(#0b1530,#1d2b55)';if(m<420)return 'linear-gradient(#f6b98a,#9cc3e6)';if(m<1020)return 'linear-gradient(#7fc0f0,#cfe7f8)';if(m<1140)return 'linear-gradient(#f39c6b,#f7d39a)';return 'linear-gradient(#3b3560,#c76b5d)'}
function nightAlpha(t){const m=tod(t);if(m>=1260||m<330)return .5;if(m>=1140)return .28;if(m<390)return .2;return 0}
function sceneProps(id){
  const P=S.player,M=S.mystery,m=tod(S.t),st=P.role==='student';
  const hs=[];const H=(x,y,shape,label,fn,hint)=>hs.push({x,y,shape,label,fn,hint});
  switch(id){
    case 'classroom':H(50,26,'<div class="shape blackboard"></div>','Blackboard',()=>ctxHotspot('board'),st&&canAttend());H(22,62,'<div class="shape desk"></div>','Your desk',()=>ctxHotspot('desk'));break;
    case 'library':H(18,30,'<div class="shape shelf"></div>','Shelves',()=>ctxHotspot('shelf'));if(P.school==='GHC')H(82,30,'<div class="shape store"></div>','Old storeroom door',()=>ctxHotspot('store'),st&&M.started&&!M.clues[4]);break;
    case 'cafeteria':H(25,30,'<div class="shape counter"></div>','Serving window',()=>openShop('cafeteria'));H(75,30,'<div class="shape kiosk" style="--kc:var(--school)"></div>','Tuck shop',()=>openShop('tuck'));H(50,78,'<div class="shape bench"></div>','Table',()=>ctxHotspot('table'));break;
    case 'field':H(50,34,'<div class="goal"></div>','Goalpost',()=>ctxHotspot('goal'));if(P.school==='BFA')H(86,40,'<div class="shape store"></div>','Sports store',()=>ctxHotspot('store'),st&&M.started&&!M.clues[4]);break;
    case 'common':H(22,40,'<div class="tree"></div>','Big mango tree',()=>ctxHotspot('tree'));break;
    case 'assembly':H(78,46,'<div class="shape noticeb"></div>','Notice board',()=>ctxHotspot('notice'),(S.tut===4)||(st&&!M.started));break;
    case 'hostel':H(20,46,'<div class="shape bunk"></div>',P.year==='SSS3'?'Your bed':'Your bunk',()=>ctxHotspot('bed'));H(80,46,'<div class="shape locker"></div>','Locker',()=>ctxHotspot('locker'));break;
    case 'gate':H(50,40,'<div class="gatebars"></div>','Gate',()=>ctxHotspot('gate'));break;
    case 'admin':H(26,34,'<div class="shape counter"></div>','Report desk',()=>ctxHotspot('report'));break;
    case 'staffroom':H(30,42,'<div class="shape kettle"></div>','Kettle corner',()=>ctxHotspot('kettle'));H(74,30,'<div class="shape noticeb"></div>','Staff notices',()=>ctxHotspot('staffnotice'));break;
    case 'quarters':H(30,50,'<div class="shape bed"></div>','Bed',()=>ctxHotspot('bed'));H(70,46,'<div class="shape desk"></div>','Lesson notes',()=>ctxHotspot('notes'));break;
    case 'junction':H(16,40,'<div class="shape kiosk" style="--kc:#c0392b"></div>','Mama Put',()=>openShop('mamaput'));H(40,40,'<div class="shape kiosk" style="--kc:#1f6f8b"></div>','Chidi POS',()=>ctxHotspot('pos'));H(64,40,'<div class="shape kiosk" style="--kc:#d4ac0d"></div>','Kiosk',()=>openShop('kiosk'));H(86,40,'<div class="shape kiosk" style="--kc:#6c3483"></div>','Barber and braider',()=>ctxHotspot('barber'));break;
    case 'home':H(28,48,'<div class="shape bed"></div>','Your bed',()=>ctxHotspot('bed'));H(74,40,'<div class="shape locker" style="background:#e7e7e7;border-color:#bbb"></div>','Fridge',()=>ctxHotspot('fridge'));break;
    case 'ground':H(30,36,'<div class="shape counter"></div>','Rivalry quiz stand',()=>ctxHotspot('quizstand'),true);H(74,34,'<div class="goal"></div>','Pitch',()=>ctxHotspot('pitch'));break;
    case 'clinic':H(76,36,'<div class="shape bed" style="width:90px"></div>','Sick bay',()=>ctxHotspot('sickbay'));break;
  }
  return hs;
}
const SLOTS=[[16,74],[30,82],[44,72],[58,84],[72,74],[86,82],[24,92],[52,94],[80,92],[38,64],[66,64]];
function sceneSig(){return S.loc+'|'+peopleAt(S.loc).map(n=>n.id).join(',')+'|'+Math.floor(tod(S.t)/30)+'|'+(S.tut||0)+'|'+clueCount()}
function renderScene(force){
  if(!S)return;const sig=sceneSig();if(!force&&sig===LAST_SIG)return;LAST_SIG=sig;
  const P=S.player,s=SCHOOLS[P.school],L=LOCS[S.loc],sc=$('#scene');
  const shared=L.shared;const cs=shared?{wall:'#e2d6bd',trim:'#6f4826',roof:'#7d6a52',door:'#6f4826',signBg:'#141a2b',signInk:'#ffd88a',signFont:'var(--f-display)'}:s;
  sc.style.cssText=`--wallC:${cs.wall};--trimC:${cs.trim};--roofC:${cs.roof};--doorC:${cs.door};--signBg:${cs.signBg};--signInk:${cs.signInk};--signFont:${cs.signFont}`;
  let html='';
  const signTitle=S.loc==='junction'?'TOWN JUNCTION':S.loc==='ground'?'INTER-SCHOOL GROUND':S.loc==='home'?'HOME':locName(S.loc).toUpperCase();
  const signSub=shared?'Shared by Heights and Future':S.loc==='home'?'Near Town Junction':s.name;
  if(L.out){
    html+=`<div class="sky" style="background:${skyFor(S.t)}"></div><div class="bldg">${[8,22,36,58,72,86].map(x=>`<div class="win" style="left:${x-4.5}%"></div>`).join('')}<div class="door"></div>${s===cs&&P.school==='BFA'?[2,98].map(x=>`<div class="pillar" style="left:${x-.8}%"></div>`).join(''):''}</div><div class="ground ${L.ground}"></div>`;
  } else {
    const fl=L.ground.split(' ')[1];
    html+=`<div class="wall" style="background:linear-gradient(${shade(cs.wall,8)},${cs.wall})"></div><div class="floor ${fl}"></div>`;
    if(S.loc!=='hostel'&&S.loc!=='home')html+=`<div style="position:absolute;top:10%;left:6%;width:12%;height:22%;background:repeating-linear-gradient(180deg,#6f7c8c 0 3px,#cfd8e2 3px 7px);border:4px solid ${cs.trim}"></div><div style="position:absolute;top:10%;right:6%;width:12%;height:22%;background:repeating-linear-gradient(180deg,#6f7c8c 0 3px,#cfd8e2 3px 7px);border:4px solid ${cs.trim}"></div>`;
    if(['classroom','library','staffroom','cafeteria'].includes(S.loc))html+=`<div style="position:absolute;top:3%;left:50%;width:56px;height:56px;margin-left:-28px;border-radius:50%;border:3px solid rgba(0,0,0,.2);animation:none"></div>`;
  }
  html+=`<div class="sign"><b>${esc(signTitle)}</b><small>${esc(signSub)}</small></div>`;
  for(const h of sceneProps(S.loc)){html+=`<button class="prop ${h.hint?'hint':''}" style="left:${h.x}%;top:${h.y}%;transform:translate(-50%,-50%)" data-a="${act(h.fn)}">${h.shape}<span class="lab">${esc(h.label)}</span></button>`}
  if(S.loc==='classroom'){for(let i=0;i<6;i++){html+=`<div class="shape desk" style="position:absolute;left:${18+i%3*28}%;top:${62+Math.floor(i/3)*18}%;z-index:4;pointer-events:none;opacity:.9"></div>`}}
  const ppl=peopleAt(S.loc);
  const off=hash(S.loc)%SLOTS.length;
  ppl.forEach((n,i)=>{const [x,y]=SLOTS[(i+off)%SLOTS.length];
    const ring=n.kind==='student'?HOUSES[n.house]:(SCHOOLS[n.school]||s).primary;
    const glow=(S.tut===2&&n.id===CAST.buddy)||(mysteryTarget()===n.id);
    const scale=0.82+(y-62)/110;
    html+=`<button class="chr ${glow?'glow':''}" style="left:${x}%;top:${y}%;--ring:${ring};z-index:${10+y}" data-a="${act((el)=>openCtxNPC(n.id,el))}" aria-label="${esc(n.name)}"><span class="tag">${n.human?'<i title="Player">👤</i>':''}${esc(n.name.split(' ')[0])}${n.human?'':' <i title="NPC" style="opacity:.6">NPC</i>'}</span>${avatar(n.look,44*scale)}</button>`;
  });
  const me=lookToAvatar(P.look,P.role,P.school,P.year);
  html+=`<div class="chr me" id="me" style="left:${S.px}%;top:${S.py}%;z-index:${10+S.py};pointer-events:none"><span class="tag">You</span>${avatar(me,46*(0.82+(S.py-62)/110))}</div>`;
  html+=`<div class="night" style="background:rgba(8,12,36,${nightAlpha(S.t)})"></div>`;
  html+=exitsHTML();
  if(S.tut&&S.tut<10)html+=`<div class="tut"><span>${TUT_TEXT[S.tut]}</span><button data-a="${act(skipTutorial)}">Skip tutorial</button></div>`;
  else html+=`<div class="scene-hint">Tap people and objects to see what you can do. Tap the ground to walk.</div>`;
  const prevIn=$('#chat-in'),prevVal=prevIn?prevIn.value:'',hadFocus=prevIn&&document.activeElement===prevIn;
  sc.innerHTML=html+chatDockHTML();
  wireChatForm();
  const ni=$('#chat-in');if(ni&&prevVal){ni.value=prevVal}if(ni&&hadFocus)ni.focus();
}
function exitsHTML(){
  const near={gate:['assembly','junction'],assembly:['classroom','common','gate','admin'],classroom:['assembly','library','cafeteria'],library:['classroom','common'],cafeteria:['common','classroom'],field:['common','ground'],common:['cafeteria','field','library','assembly'],hostel:['cafeteria','assembly'],admin:['assembly','clinic'],clinic:['admin','common'],staffroom:['classroom','admin'],quarters:['staffroom','gate'],junction:['gate','home'],home:['junction'],ground:['field','junction']}[S.loc]||[];
  const list=near.filter(id=>!(id==='home'&&S.player.status!=='day'));
  return `<div class="exits">${list.map(id=>`<button data-a="${act(()=>travel(id))}">→ ${esc(id==='classroom'&&S.player.role==='student'?'Class':LOCS[id].n)}</button>`).join('')}<button data-a="${act(()=>openPanel('map'))}">Map</button></div>`;
}
document.addEventListener('pointerdown',e=>{
  if(!S||$('#game').hidden)return;const sc=$('#scene');if(!sc.contains(e.target))return;
  if(e.target.closest('button,form,#chatdock,.tut'))return;
  const r=sc.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
  if(y<56)return;
  S.px=clamp(x,6,94);S.py=clamp(y,62,95);const me=$('#me');if(me){me.style.left=S.px+'%';me.style.top=S.py+'%';me.style.zIndex=10+Math.round(S.py)}
  closeCtx();
  if(S.tut===1){S.tut=2;renderScene(true);renderTaskbar()}
});
function travel(id){
  closeCtx();
  if(id===S.loc){closePanel();return}
  const c=canEnter(id);
  if(!c.ok){
    if(c.sneak)return chaosPrompt(id==='junction'?'sneakout':'sneakout');
    if(c.knock)return showModal({title:'Staff room',body:`<p>${c.reason}</p>`,buttons:[{label:'Knock',cls:'school',fn:()=>{closeModal();toast(`"Yes? Come back after class, please." — ${npc('t_MTH')?npc('t_MTH').name:'a teacher'}`)}},{label:'Leave'}]});
    toast(c.reason,'bad');return;
  }
  S.loc=id;S.px=50;S.py=80;advance(5);closePanel();renderScene(true);renderHUD();
  if(id==='library')progress('library',0);
  onEnter(id);
}
function onEnter(id){
  const P=S.player,M=S.mystery;
  if(id==='classroom'&&P.role==='student'&&canAttend()&&S.tut>=10)setTimeout(()=>promptAttend(),250);
  if(id==='classroom'&&P.role==='teacher'&&teacherClassNow()&&!S.lessonDone?.[lessonKey()])setTimeout(()=>toast('Tap the blackboard to start your lesson.'),300);
}


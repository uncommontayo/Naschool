/* =================== CLASS + QUESTIONS =================== */

/* Adaptive difficulty. Each question has a level (l) from 1 to 5.
   JSS3 plays levels 2-3 and SSS3 plays levels 4-5. After every 5 answers:
   4 or 5 correct moves the player up a level, 0 or 1 correct moves them down,
   always inside their band. */
const LEVEL_BAND={JSS3:[2,3],SSS3:[4,5]};
const ADAPT_EVERY=5;
function diffState(){
  return S.diff||(S.diff={level:LEVEL_BAND[S.player.year][0],recent:[]});
}
function recordAnswer(ok){
  if(S.player.role!=='student')return;
  const d=diffState(),[low,high]=LEVEL_BAND[S.player.year];
  d.recent.push(ok);
  if(d.recent.length<ADAPT_EVERY)return;
  const right=d.recent.filter(Boolean).length;
  if(right>=4)d.level=Math.min(high,d.level+1);
  else if(right<=1)d.level=Math.max(low,d.level-1);
  d.recent=[];
}
/* Take n questions from pool, closest to the player's level first. */
function pickQuestions(pool,n){
  if(S.player.role!=='student')return shuffle(pool).slice(0,n);
  const level=diffState().level;
  return shuffle(pool).sort((a,b)=>Math.abs(a.l-level)-Math.abs(b.l-level)).slice(0,n);
}
function currentSubject(){const p=periodIdx(S.t);return p<0?'':SUBJ[subjectFor(S.player.year,S.t,p)]}
function lessonKey(){return dayOf(S.t)+'-'+periodIdx(S.t)}
function canAttend(){const P=S.player;return P.role==='student'&&S.loc==='classroom'&&periodIdx(S.t)>=0&&!S.attended[lessonKey()]}
function promptAttend(){
  if(!canAttend())return;const p=periodIdx(S.t),sub=subjectFor(S.player.year,S.t,p),t=TEACHERS[S.player.school][sub];
  const isTest=dow(S.t)===4&&p===4;
  showModal({title:isTest?'Weekly class test':`Period ${p+1} · ${SUBJ[sub]}`,kicker:`${S.player.year} ${S.player.cls} · ${t[0]}`,body:`<div class="dlg"><div class="por">${avatar(npc('t_'+sub)?npc('t_'+sub).look:npcLook({name:t[0],kind:'teacher',g:t[3],school:S.player.school}),80)}</div><div class="say"><small>${esc(t[0])}</small>"${esc(isTest?'Books under your desk. Ten questions. No talking.':t[2])}"</div></div><p>${isTest?'10 mixed questions. Your grade uses the '+(S.player.year==='JSS3'?'BECE':'WAEC')+' scale.':'3 quick questions at your level. Attendance is logged when you start.'}</p>`,buttons:[{label:'Not now'},{label:isTest?'Start test':'Attend class',cls:'school',fn:()=>{closeModal();attendClass(sub,isTest)}}]});
}
function attendClass(sub,isTest){
  S.attended[lessonKey()]=true;progress('attend',1);
  if(S.standBack===lessonKey()){toast('You are standing at the back this period. You cannot answer.','bad');return}
  const yr=S.player.year;
  let pool=QB.filter(q=>q.y===yr&&(isTest||q.s===sub));
  if(!isTest&&pool.length<3)pool=pool.concat(QB.filter(q=>q.y===yr&&q.s!==sub));
  pool=pickQuestions(pool,isTest?10:3);
  const popQuiz=!isTest&&S.popDay!==dayOf(S.t)&&chance(.3);
  runQuestions({title:isTest?'Weekly class test':popQuiz?`Pop quiz! · ${SUBJ[sub]}`:`${SUBJ[sub]} · class activity`,qs:pool,time:20,onDone:(res)=>{
    const c=res.filter(x=>x).length;
    housePts(c,'correct answers');schoolPts(c,'class answers');
    if(popQuiz){S.popDay=dayOf(S.t);if(c===3)money(100,'Pop quiz 3/3')}
    if(isTest){const pct=Math.round(c/pool.length*100);const g=grade(pct,yr);S.results.unshift({t:S.t,score:pct,grade:g,kind:'Weekly class test'});const pos=Math.max(1,9-Math.round(pct/12));
      if(pct>=70){money(500,'Class test grade A');schoolPts(5,'Class test A')}if(pos===1)giveBadge('top');
      showModal({title:'Result card',kicker:`${S.player.year} ${S.player.cls} · weekly class test`,body:`<div class="spread"><div><div class="big">${pct}%</div><div>Grade <b>${g}</b> (${yr==='JSS3'?'BECE':'WAEC'} scale)</div></div><div class="badge school">Class position ${pos} of 30</div></div><p class="note">${yr==='JSS3'?'A Distinction 70–100 · C Credit 50–69 · P Pass 40–49 · F Fail 0–39':'A1 75+ · B2 70 · B3 65 · C4 60 · C5 55 · C6 50 · D7 45 · E8 40 · F9 below 40'}</p><p>Revise in the library to retry a missed question.</p>`,buttons:[{label:'Done',cls:'school'}]})}
    else toast(`Class done: ${c}/${pool.length} correct · attendance logged`,'good');
    renderHUD();
  }});
}
function grade(p,yr){if(yr==='JSS3')return p>=70?'A (Distinction)':p>=50?'C (Credit)':p>=40?'P (Pass)':'F (Fail)';return p>=75?'A1':p>=70?'B2':p>=65?'B3':p>=60?'C4':p>=55?'C5':p>=50?'C6':p>=45?'D7':p>=40?'E8':'F9'}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function runQuestions({title,qs,time=20,onDone,versus}){
  let i=0;const res=[];const bonus=(S.counsel>S.t?5:0)-(isHungry()?3:0);const T=Math.max(6,time+bonus);
  let timer=null,left=T;
  const show=()=>{
    const q=qs[i];left=T;
    showModal({wide:true,title,kicker:`Question ${i+1} of ${qs.length}${bonus?` · timer ${bonus>0?'+':''}${bonus}s (${bonus>0?'counsellor':'hungry'})`:''}`,noClose:true,body:`<div class="chalkq"><div class="meta"><span>${SUBJ[q.s]} · ${q.y}</span><span id="qleft">${left}s</span></div><div class="timer"><i id="qbar" style="width:100%"></i></div><div class="q">${esc(q.q)}</div><div class="opts">${q.o.map((o,j)=>`<button data-j="${j}" data-a="${act(()=>answer(j))}">${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join('')}</div><div id="qexp"></div></div>`,buttons:[]});
    timer=setInterval(()=>{left--;const l=$('#qleft'),b=$('#qbar');if(l)l.textContent=left+'s';if(b)b.style.width=(left/T*100)+'%';if(left<=0)answer(-1)},1000);
  };
  const answer=j=>{
    if(timer){clearInterval(timer);timer=null}else return;
    const q=qs[i],ok=j===q.a;res.push(ok);recordAnswer(ok);S.answered++;if(ok)S.correct++;if(ok&&q.s==='MTH')progress('maths',1);if(!ok)S.missed=q;
    S.houseGoal+=ok?1:0;
    document.querySelectorAll('.chalkq .opts button').forEach(b=>{const k=+b.dataset.j;b.disabled=true;if(k===q.a)b.classList.add('right');else if(k===j)b.classList.add('wrong')});
    $('#qexp').innerHTML=`<div class="explain"><b>${ok?'Correct.':j<0?"Time's up.":'Not quite.'}</b> ${esc(q.e)}${versus?`<br>${esc(versus(ok,i))}`:''}</div><div class="row end" style="margin-top:8px"><button class="btn gold sm" data-a="${act(next)}">${i+1<qs.length?'Next question':'See result'}</button></div>`;
    if(ok)rep('ACA',1);
  };
  const next=()=>{i++;if(i<qs.length)show();else{closeModal();onDone&&onDone(res)}};
  show();
}
function practiceQ(n){const yr=S.player.year;const q=pickQuestions(QB.filter(x=>x.y===yr),1)[0];runQuestions({title:`${n.name} asks you`,qs:[q],time:20,onDone:r=>{if(r[0]){addRel(n.id,3);schoolPts(1,'Correct answer')}}})}
function reviseMissed(){if(!S.missed)return toast('No missed questions to revise yet.');advance(10);const q=S.missed;S.missed=null;runQuestions({title:'Revision retry',qs:[q],time:25,onDone:r=>{if(r[0])toast('Revised and correct. +Academic','good')}})}

/* =================== TEACHER LESSON =================== */
function seedTeacherTasks(){S.teacherTasks=[{id:'t_att',text:'Get 80% attendance in your next lesson',done:false,r:300},{id:'t_board',text:`Find out who keeps writing "${S.player.school==='GHC'?'BFA is better':'Heights who?'}" on your blackboard (be in class at 07:50)`,done:false,r:300},{id:'t_coach',text:'Coach your school to a rivalry quiz win',done:false,r:500},{id:'t_kettle',text:'Settle the staff-room kettle argument',done:false,r:200},{id:'t_staff',text:'Find out why two colleagues keep disappearing',done:false,r:400}]}
function taskDone(id){const t=S.teacherTasks.find(x=>x.id===id);return t&&t.done}
function taskTick(id){const t=S.teacherTasks.find(x=>x.id===id);if(t&&!t.done){t.done=true;money(t.r,'Teacher task');notify('task',`Task done: ${t.text}`);renderTaskbar()}}
function startLesson(){
  const tc=teacherClassNow();if(!tc)return;const P=S.player,cls=SCHOOLS[P.school].classes[tc.year];
  const roster=Object.values(CAST.people).filter(n=>n.kind==='student'&&!n.rival&&n.school===P.school&&n.cls===cls);
  const present=roster.filter(n=>!n.human||chance(.8));
  S.lesson={year:tc.year,cls,roster:present.map(n=>n.id),awarded:0,bq:0,quiz:false,catchFired:false,sel:null,key:lessonKey()};
  renderLesson();
}
function renderLesson(msg){
  const L=S.lesson;if(!L)return;const P=S.player;
  const roster=L.roster.map(id=>npc(id));
  const catchEv=L.catchActive?`<div class="catch"><span>${esc(npc(L.catchActive).name)} is making noise at the back!</span><button class="btn sm" style="background:#fff;color:var(--bad)" data-a="${act(catchStudent)}">Catch! <span id="catchT">10</span></button></div>`:'';
  showModal({wide:true,noClose:true,title:`${SUBJ[P.subject]} · ${L.year} ${L.cls}`,kicker:`Lesson in progress · ${roster.length} present · points awarded ${L.awarded}/20`,body:`${catchEv}${msg?`<div class="item"><span class="t"><b>${msg}</b></span></div>`:''}<div class="roster">${roster.map(n=>`<button class="${L.sel===n.id?'sel':''}" data-a="${act(()=>{L.sel=n.id;renderLesson()})}">${avatar(n.look,40)}${esc(n.name.split(' ')[0])}${n.human?' 👤':''}${S.incidents.find(i=>i.who===n.id&&!i.warned)?'<span class="warn">incident</span>':''}</button>`).join('')}</div>
  <div class="row"><button class="btn school sm" data-a="${act(boardQ)}">Board question ${L.sel?'· '+esc(npc(L.sel).name.split(' ')[0]):'· random'}</button><button class="btn sm" data-a="${act(popQuizT)}" ${L.quiz?'disabled':''}>Pop quiz</button><button class="btn sm" data-a="${act(()=>{notify('task',`Assignment set for ${L.year} ${L.cls}: answer 3 ${SUBJ[P.subject]} questions in the library.`);renderLesson('Assignment set for the whole class.')})}">Give assignment</button>
  ${[1,3,5].map(v=>`<button class="btn ghost sm" data-a="${act(()=>award(v))}">+${v} pts</button>`).join('')}<button class="btn ghost sm" data-a="${act(warnSel)}">Issue warning</button></div>`,buttons:[{label:'End lesson',cls:'school',fn:endLesson}]});
  if(L.catchActive){let t=10;clearInterval(L.ci);L.ci=setInterval(()=>{t--;const e=$('#catchT');if(e)e.textContent=t;if(t<=0){clearInterval(L.ci);const who=L.catchActive;L.catchActive=null;renderLesson(`Too slow. ${npc(who).name.split(' ')[0]} got away with it.`)}},1000)}
  if(!L.catchFired&&chance(.6)){L.catchFired=true;setTimeout(()=>{if(S.lesson===L){const pool=L.roster.map(npc).filter(n=>['FUN','MIS'].includes(n.arch));if(pool.length){L.catchActive=rnd(pool).id;renderLesson()}}},3500)}
}
function catchStudent(){const L=S.lesson;clearInterval(L.ci);const n=npc(L.catchActive);L.catchActive=null;S.incidents.unshift({who:n.id,action:'Making noise',loc:'Classroom',t:S.t,by:S.player.name,pun:'Pending',warned:false});renderLesson(`Caught ${n.name}. Incident logged. You can issue a warning.`)}
function warnSel(){const L=S.lesson;const inc=S.incidents.find(i=>(!L.sel||i.who===L.sel)&&!i.warned);if(!inc)return renderLesson('Warnings need a logged incident. Catch someone first.');inc.warned=true;inc.pun='Warning';renderLesson(`Warning issued to ${npc(inc.who).name}.`)}
function award(v){const L=S.lesson;if(L.awarded+v>20)return renderLesson('Max 20 house points per lesson.');const n=npc(L.sel||rnd(L.roster));L.awarded+=v;addRel(n.id,2,true);renderLesson(`+${v} ${n.house} House to ${n.name}.`)}
function boardQ(){const L=S.lesson;const n=npc(L.sel||rnd(L.roster));const q=shuffle(QB.filter(x=>x.y===L.year&&x.s===S.player.subject).concat(QB.filter(x=>x.y===L.year)))[0];const p=n.arch==='ACA'?.88:n.arch==='MIS'||n.arch==='FUN'?.45:.62;const ok=chance(p);L.bq++;
  renderLesson(`Board question to ${n.name}: "${q.q}" → ${n.name.split(' ')[0]} answers "${ok?q.o[q.a]:q.o[(q.a+1)%4]}". ${ok?'Correct!':'Wrong. Correct answer: '+q.o[q.a]+'.'} ${q.e}`)}
function popQuizT(){const L=S.lesson;L.quiz=true;const rows=L.roster.map(npc).map(n=>[n,Math.min(3,Math.round((n.arch==='ACA'?2.6:n.arch==='COM'?2.2:1.6)+Math.random()-.4)+(S.flags.prepared===dayOf(S.t)?0:0))]).sort((a,b)=>b[1]-a[1]);
  renderLesson(`Pop quiz leaderboard: ${rows.slice(0,5).map(([n,s])=>`${n.name.split(' ')[0]} ${s}/3`).join(' · ')}`)}
function endLesson(){
  const L=S.lesson;clearInterval(L.ci);closeModal();S.lessonDone=S.lessonDone||{};S.lessonDone[L.key]=true;
  const total=8,present=L.roster.filter(id=>!npc(id).human).length,att=Math.round(present/total*100);
  money(200,'Lesson completed');if(att>=80)taskTick('t_att');
  showModal({title:'Lesson summary',kicker:`${L.year} ${L.cls}`,body:`<table class="tbl"><tr><th>Attendance</th><td>${present}/${total} NPC students (${att}%)</td></tr><tr><th>Board questions</th><td>${L.bq}</td></tr><tr><th>Pop quiz</th><td>${L.quiz?'Run':'Not run'}</td></tr><tr><th>House points awarded</th><td>${L.awarded}</td></tr><tr><th>Incidents</th><td>${S.incidents.filter(i=>i.t>=S.t-60).length}</td></tr></table>`,buttons:[{label:'Done',cls:'school'}]});
  S.lesson=null;
}
function teacherAsk(n){const q=shuffle(QB.filter(x=>x.y===n.year))[0];const ok=chance(n.arch==='ACA'?.85:.55);sayBubble(n,ok?`"${q.o[q.a]}"`:`"Erm… ${q.o[(q.a+2)%4]}?"`);toast(`${q.q} → ${ok?'correct':'wrong (answer: '+q.o[q.a]+')'}`)}
function viewNPC(n){showModal({title:n.name,kicker:npcSub(n),body:`<div class="dlg"><div class="por">${avatar(n.look,80)}</div><div><p>Relationship: <b>${relLevel(rel(n.id),relKind(n))}</b> (${rel(n.id)})</p><p>Incidents: ${S.incidents.filter(i=>i.who===n.id).length}</p></div></div>`,buttons:[{label:'Close'}]})}
function boardWriter(){const n=npc(S.player.role==='teacher'?(Object.values(CAST.people).find(x=>x.kind==='student'&&!x.rival&&x.arch==='FUN'&&x.school===S.player.school)||{}).id:CAST.herring);advance(5);if(!n)return;
  showModal({title:'Caught in the act',body:`<p>${esc(n.name)} is writing "${S.player.school==='GHC'?'BFA is better':'Heights who?'}" on the blackboard.</p>`,buttons:[{label:'Report / tell them off',cls:'school',fn:()=>{closeModal();if(S.player.role==='teacher'){S.incidents.unshift({who:n.id,action:'Writing on the board',loc:'Classroom',t:S.t,by:S.player.name,pun:'Pending',warned:false});taskTick('t_board')}else{addRel(n.id,-10);rep('DIS',2);toast('+Teacher trust','good')}}},{label:'Tell them to rub it off',fn:()=>{closeModal();addRel(n.id,5);if(S.player.role==='teacher')taskTick('t_board')}},{label:'Laugh along',fn:()=>{closeModal();rep('SOC',1);toast('+Funny')}}]})}
function staffGossip(n){heardRumour(10);addRel(n.id,3);sayBubble(n,`${CAST.pair[0].split(' ').slice(0,2).join(' ')} and ${CAST.pair[1].split(' ').slice(0,2).join(' ')} again… stepping out together.`);advance(3)}
function observeStaff(){advance(10);if(!S.rumours[10])return toast('Quiet staff room. Try gossiping with a colleague first.');if(tod(S.t)<960)return toast('Nothing unusual. Things get interesting after 16:00.');
  showModal({title:'Staff-room mystery',body:`<p>You follow ${esc(CAST.pair[0])} and ${esc(CAST.pair[1])} to the music room… They are rehearsing a surprise song for the principal's birthday at Monday assembly!</p>`,buttons:[{label:'Keep the secret',cls:'school',fn:()=>{closeModal();taskTick('t_staff');S.rumours[10]='Confirmed';toast('Close Colleague with both','good')}},{label:'Tell the staff room',fn:()=>{closeModal();taskTick('t_staff');toast('Surprise ruined. −relationship','bad')}},{label:'Join the rehearsal',fn:()=>{closeModal();taskTick('t_staff');giveBadge('choir')}}]})}
function kettle(){if(taskDone('t_kettle'))return toast('Peace reigns over the kettle.');showModal({title:'The kettle argument',body:'<p>Whose turn is it to buy the staff kettle? Three teachers are shouting.</p>',buttons:[{label:'Make a rota',cls:'school',fn:()=>{closeModal();taskTick('t_kettle')}},{label:'Buy it yourself (₦1,500)',fn:()=>{closeModal();if(money(-1500,'Staff kettle'))taskTick('t_kettle')}}]})}


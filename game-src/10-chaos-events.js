/* =================== CHAOS =================== */
const CHAOS={
  noise:{n:'Make noise in class',base:.4,ok:'Classmates laugh. +Mischief, +Funny.',pun:'warning',hp:-2},
  sleep:{n:'Sleep in class',base:.35,ok:'"10 minutes of peace. Nobody noticed."',pun:'back'},
  alarm:{n:'Raise a false alarm ("Principal is coming!")',base:.25,ok:'The class scrambles. +Funny.',pun:'detention'},
  noodles:{n:'Cook noodles in the hostel',base:.45,ok:'Roommates love you. +5 with each.',pun:'warning',conf:'noodles'},
  hide:{n:'Hide a snack during inspection',base:.5,ok:'You kept your snack.',pun:'confiscate'},
  raid:{n:'Snack raid (NPC lockers only)',base:.4,ok:'You got a biscuit pack.',pun:'grass'},
  sneakout:{n:'Sneak out to Town Junction',base:.5,ok:'You slipped past the gate. Cheaper food awaits.',pun:'detention'},
  rival:{n:'Sneak into the rival campus',base:.6,ok:'You spotted their quiz practice sheet. Report it back for +5 school points.',pun:'rivalBack',hp:-5},
  vernacular:{n:'Speak vernacular on English-only Wednesday',base:.3,ok:'+Social with nearby students.',pun:'lines'}
};
function chaosPrompt(id){
  const c=CHAOS[id],P=S.player;let p=c.base;const mods=[];
  const strict=peopleAt(S.loc).find(n=>n.kind==='teacher'&&n.style==='STR');if(strict){p+=.2;mods.push(`${strict.name} is strict (+20%)`)}
  if(id==='noise'||id==='sleep'){if(!peopleAt('classroom').some(n=>n.kind==='teacher')&&id==='noise'){p=.1;mods.push('No teacher in the room')}}
  p=clamp(p,.05,.9);const lvl=p<.34?'l':p<.55?'m':'h';
  showModal({title:c.n,kicker:'Chaos · risk check',body:`<div class="risk ${lvl}"><span></span><span></span><span></span></div><p><b>Risk: ${lvl==='l'?'Low':lvl==='m'?'Medium':'High'}</b> · ${Math.round(p*100)}% chance of getting caught${mods.length?' ('+mods.join(', ')+')':''}.</p><p class="note">Chaos is fictional and harmless. You can never take items or money from other players.</p>`,buttons:[{label:'Not today'},{label:'Do it',cls:'bad',fn:()=>{closeModal();doChaos(id,p)}}]});
}
function doChaos(id,p){
  const c=CHAOS[id];advance(5);const caught=Math.random()<p;
  if(!caught){S.stats.chaosOk++;rep('MIS',3);checkBadges();
    if(id==='noodles'){removeItem('noodles')||null;peopleAt('hostel').filter(n=>n.kind==='student').forEach(n=>addRel(n.id,5,true))}
    if(id==='raid')addItem('biscuit');
    if(id==='sneakout'){S.loc='junction';S.px=50;S.py=80;renderScene(true)}
    if(id==='rival'){S.flags.intel=true;notify('task','Rivalry intel found. Talk to any teacher or the VP: Report something → Rivalry intel.')}
    if(id==='noise'||id==='alarm')peopleAt(S.loc).filter(n=>['FUN','MIS'].includes(n.arch)).forEach(n=>addRel(n.id,3,true));
    showModal({title:'It worked',kicker:c.n,body:`<p>${c.ok}</p>`,buttons:[{label:'Nice',cls:'school'}]});return}
  rep('DIS',-4);if(c.hp)housePts(c.hp,'caught');
  const by=peopleAt(S.loc).find(n=>n.kind==='teacher'||n.kind==='staff');const byName=by?by.name:(id==='rival'?`${SCHOOLS[CAST.rival].short} security`:'a prefect');
  if(id==='noodles'&&S.inv.noodles)removeItem('noodles');
  addIncident(c.n,byName,c.pun);
}
function addIncident(action,by,pun){
  const today=dayOf(S.t);const warnsToday=S.incidents.filter(i=>i.self&&dayOf(i.t)===today&&i.pun==='Warning').length;
  if(pun==='warning'&&warnsToday>=2)pun='detention';
  const label={warning:'Warning',back:'Stand at the back',detention:'Detention',grass:'Grass cutting',lines:'Lines',confiscate:'Confiscation',rivalBack:'Sent back + lose house points'}[pun];
  S.incidents.unshift({self:true,action,loc:locName(S.loc),t:S.t,by,pun:label,status:'Served'});
  notify('punish',`Caught: ${action}. ${label}.`,true);
  punish(pun,by,action);
}
function punish(pun,by,action){
  const head=`<p><b>${esc(by)}</b> caught you: ${esc(action)}.</p>`;
  if(pun==='warning')return showModal({title:'Warning',kicker:'Punishment',body:head+'<p>This is logged in your Discipline tab. 3 warnings in one day means detention.</p>',buttons:[{label:'Okay',cls:'school'}]});
  if(pun==='back'){S.standBack=lessonKey();return showModal({title:'Stand at the back',kicker:'Punishment',body:head+'<p>You cannot answer questions for the rest of this period.</p>',buttons:[{label:'Okay',cls:'school'}]})}
  if(pun==='confiscate'){const k=Object.keys(S.inv).find(x=>ITEMS[x].food);if(k){removeItem(k);S.confiscated=(S.confiscated||[]).concat(k)}return showModal({title:'Confiscated',kicker:'Punishment',body:head+`<p>${k?ITEMS[k].n+' was taken. It comes back on Monday.':'Nothing to take. Lucky.'}</p>`,buttons:[{label:'Okay',cls:'school'}]})}
  if(pun==='rivalBack'){S.loc='gate';S.px=50;S.py=80;renderScene(true);return showModal({title:'Sent back',kicker:'Punishment',body:head+'<p>You were walked back to your own gate. −5 house points.</p>',buttons:[{label:'Okay',cls:'school'}]})}
  if(pun==='detention'){return showModal({title:'Detention',kicker:'Punishment · 20 game minutes',body:head+'<p>Sit in the library. You can only study.</p>',noClose:true,buttons:[{label:'Serve detention',cls:'school',fn:()=>{closeModal();S.loc='library';S.px=50;S.py=80;advance(20);rep('ACA',1);renderScene(true);toast('Detention served. +Academic (you read something)')}}]})}
  if(pun==='lines'){const s='I will speak English in school';let n=0;showModal({title:'Lines',kicker:'Punishment',noClose:true,body:head+`<p>Type <b>"${s}"</b> 3 times.</p><form id="linesForm" class="row"><input id="lines-in" style="flex:1;min-width:0;border:1.5px solid var(--line);border-radius:10px;padding:10px" autocomplete="off"><button class="btn school sm">Submit</button></form><p id="lines-n" class="note">0 of 3</p>`,buttons:[]});
    $('#linesForm').addEventListener('submit',e=>{e.preventDefault();const v=$('#lines-in').value.trim().toLowerCase();if(v===s.toLowerCase()){n++;$('#lines-in').value='';$('#lines-n').textContent=`${n} of 3`;if(n>=3){closeModal();toast('Lines done.')}}else $('#lines-n').textContent='Type it exactly. '+n+' of 3'});return}
  if(pun==='grass'){let cut=0;const tufts=12;const draw=()=>`<div class="grasses">${Array.from({length:tufts},(_,i)=>`<button aria-label="Grass tuft" data-a="${act((el)=>{if(el.classList.contains('cut'))return;el.classList.add('cut');el.textContent='✓';cut++;if(cut>=tufts){closeModal();S.loc='field';S.px=50;S.py=82;advance(15);renderScene(true);toast('Grass cut. 15 game minutes gone.')}})}">🌿</button>`).join('')}</div>`;
    return showModal({title:'Grass cutting',kicker:'Punishment · 15 game minutes',noClose:true,body:head+'<p>Cut every tuft on the field.</p>'+draw(),buttons:[]})}
}

/* =================== EVENTS =================== */
function randomEvent(force){
  const P=S.player,loc=S.loc,m=tod(S.t);
  const pool=[];
  if(P.role==='student'){
    if(loc==='classroom'&&periodIdx(S.t)>=0){pool.push('phone','cramps')}
    if(loc==='cafeteria')pool.push('money','lend');
    if(loc==='common'||loc==='cafeteria'||loc==='assembly')pool.push('bully');
    if(P.year==='JSS3'&&['common','cafeteria','library'].includes(loc))pool.push('favour');
    if(loc==='hostel'&&(m>=1260||m<300))pool.push('homesick','noodlesMatron');
    if(dow(S.t)===4&&m<700)pool.push('stress');
    if(dow(S.t)===2&&weekday(S.t))pool.push('vernacular');
    pool.push('fakeNotice');
  } else {
    if(loc==='staffroom')pool.push('staffGist');
  }
  if(!pool.length)return force&&toast('No event fits this place and time. Try the classroom, cafeteria or common area.');
  const e=rnd(pool);S.eventsToday++;
  const n=(arch)=>npc(Object.values(CAST.people).find(x=>x.kind==='student'&&!x.rival&&!x.human&&x.arch===arch&&x.school===P.school&&x.year===P.year).id);
  const choice=(title,body,opts)=>showModal({title,kicker:'Something happened',body:`<p>${body}</p><div class="list">${opts.map(o=>`<button class="choice" data-a="${act(()=>{closeModal();o.fn()})}"><b>${esc(o.l)}</b><small>${esc(o.s||'')}</small></button>`).join('')}</div>`,buttons:[],noClose:true});
  switch(e){
    case 'phone':{const c=n('MIS');choice('A phone in class',`${c.name} has a phone under the desk.`,[{l:'Report it',s:'Teacher trust up, classmate down',fn:()=>{rep('DIS',3);housePts(3,'reported');addRel(c.id,-10);S.stats.reports++;snitchCheck();toast('+Teacher trust','good')}},{l:'Warn them',s:'Friendship up, 30% teacher still finds it',fn:()=>{addRel(c.id,10);if(chance(.3))toast(`The teacher found it anyway. ${c.name.split(' ')[0]} gets a warning.`)}},{l:'Ignore it',s:'Nothing now… maybe',fn:()=>{if(chance(.2))toast('Later the teacher asked if you knew. Awkward.','bad')}}]);break}
    case 'cramps':{const c=n('SOC');choice('A classmate needs help',`${c.name} has bad period cramps during class.`,[{l:'Tell the teacher',s:'+Helpful',fn:()=>care(c)},{l:'Walk her to the clinic',s:'+Helpful',fn:()=>care(c)},{l:'Get supplies from the nurse',s:'+Helpful',fn:()=>care(c)},{l:'Ignore it',fn:()=>addRel(c.id,-5)}]);break}
    case 'money':choice('Found money','You find ₦500 on the cafeteria floor.',[{l:'Hand it to the VP',s:'Owner found, ₦100 thank-you',fn:()=>{rep('HEL',2);money(100,'Thank-you for returning ₦500')}},{l:'Ask around for the owner',s:'+15 with the owner',fn:()=>{const c=n('SPO');addRel(c.id,15);rep('HEL',3)}},{l:'Keep it',s:'+₦500… 40% the owner finds out',fn:()=>{money(500,'Found money');if(chance(.4)){setTimeout(()=>{money(-500,'Returned found money');rep('SOC',-5);notify('punish','The owner traced the ₦500 to you. You returned it. −Reputation.')},1500)}}}]);break;
    case 'lend':{const c=n('FUN');choice('Can I borrow?',`${c.name}: "Abeg, lend me ₦300. I will pay tomorrow."`,[{l:'Lend ₦300',s:'40% chance they never pay back',fn:()=>{if(money(-300,'Lent to '+c.name.split(' ')[0])){addRel(c.id,5);S.flags.loan={who:c.id,day:dayOf(S.t)+1,paid:!chance(.4)}}}},{l:'Politely decline',fn:()=>toast('"No wahala."')}]);break}
    case 'bully':choice('Corridor trouble','A senior is making a junior hand over their snacks.',[{l:'Stand up to them',s:'50% they back off',fn:()=>{if(chance(.5)){giveBadge('brave');rep('HEL',4);toast('They backed off. The junior thanks you.','good')}else{addIncident('"Disrespecting a senior"','A prefect','warning');toast('Report it to overturn the warning.')}}},{l:'Report to the VP',s:'+Helpful',fn:()=>{rep('HEL',3);rep('DIS',2);toast('The VP handled it.','good')}},{l:'Comfort the junior after',fn:()=>rep('HEL',2)},{l:'Ignore it',fn:()=>rep('HEL',-2)}]);break;
    case 'favour':{const c=Object.values(CAST.people).find(x=>x.kind==='student'&&x.year==='SSS3'&&!x.rival&&!x.human);choice('A senior asks a favour',`Senior ${c.name.split(' ')[0]} asks you to carry their books to the library.`,[{l:'Carry them',s:'+relationship, ₦50 tip',fn:()=>{addRel(c.id,5);money(50,'Tip from a senior');advance(5)}},{l:'Politely decline',s:'No penalty',fn:()=>toast('"Okay. Next time."')}]);break}
    case 'homesick':{const c=Object.values(CAST.people).find(x=>x.kind==='student'&&x.year===P.year&&x.g===P.presentation&&!x.rival&&!x.human&&x.arch==='OBS')||n('HEL');choice('Late at night','A roommate is quietly crying. They miss home.',[{l:'Talk to them',s:'+Helpful',fn:()=>care(c)},{l:'Share a snack',fn:()=>{const k=Object.keys(S.inv).find(x=>ITEMS[x].food);if(k){removeItem(k);care(c)}else toast('You have no snacks. Talking helps too.')}},{l:'Go back to sleep',fn:()=>{}}]);break}
    case 'noodlesMatron':{const c=n('MIS');choice('Matron at the door',`"Who cooked noodles in this room?" It was ${c.name.split(' ')[0]}.`,[{l:'Tell the matron',s:'+Matron, −15 friend',fn:()=>{addRel(c.id,-15);addRel('x_matron',5);S.stats.reports++;snitchCheck()}},{l:'Cover for them',s:'+10 friend, 30% you both get warnings',fn:()=>{addRel(c.id,10);if(chance(.3))addIncident('Covering for noodles','Matron','warning')}},{l:'Stay silent',s:'She searches the whole room',fn:()=>{const k=Object.keys(S.inv).find(x=>ITEMS[x].food);if(k&&chance(.5)){removeItem(k);toast(ITEMS[k].n+' confiscated in the search.','bad')}}}]);break}
    case 'stress':choice('Test day nerves','The class test is today and your chest feels tight.',[{l:'Visit the counsellor',s:'+5 s per question on the next test',fn:()=>{S.counsel=S.t+600;toast('Breathing exercises done. +5 s per question today.','good')}},{l:'Revise in the library',fn:()=>{rep('ACA',1);advance(10)}},{l:'Push through',fn:()=>{}}]);break;
    case 'vernacular':chaosPrompt('vernacular');break;
    case 'fakeNotice':S.flags.fakeNotice=dayOf(S.t);notify('rumour','Someone says there is a strange new post on the notice board.');break;
    case 'staffGist':notify('rumour',`Staff-room gist: ${CAST.pair[0]} and ${CAST.pair[1]} stepped out together again.`);heardRumour(10);break;
  }
}
function inspectDorm(){const k='insp'+dayOf(S.t);if(S.flags[k])return toast('You already inspected tonight.');S.flags[k]=1;advance(15);const kids=peopleAt('hostel').filter(n=>n.kind==='student');const found=shuffle(kids).slice(0,Math.min(2,kids.length));found.forEach(n=>S.incidents.unshift({who:n.id,action:'Hidden snack at inspection',loc:locName('hostel'),t:S.t,by:S.player.name,pun:'Confiscation',warned:false}));showModal({title:'Hostel inspection',kicker:'Duty teacher',body:`<p>${found.length?`You found hidden snacks with ${found.map(n=>esc(n.name)).join(' and ')}. Confiscated until Monday; incidents logged.`:'Everything is in order.'}</p>`,buttons:[{label:'Done',cls:'school'}]})}
function care(c){addRel(c.id,10);rep('HEL',3);S.stats.wellbeing++;checkBadges();toast('+Helpful · thank you for caring','good')}
function snitchCheck(){const wk=Math.floor(dayOf(S.t)/7);S.snitchWeek=S.snitchWeek||{};S.snitchWeek[wk]=(S.snitchWeek[wk]||0)+1;if(S.snitchWeek[wk]===3)notify('rumour','People are whispering "Snitch" behind you this week.')}

/* =================== REPORTING =================== */
function reportMenu(n){
  const opts=[];
  if(S.flags.intel)opts.push({l:'Rivalry intel',s:'+5 school points',fn:()=>{S.flags.intel=false;schoolPts(5,'Rivalry intel')}});
  if(S.inv.answers)opts.push({l:'The fake test-answers scam',s:'Scam Spotter badge',fn:()=>{removeItem('answers');giveBadge('scam');rep('DIS',3);toast('The VP thanks you for reporting the scam.','good')}});
  const M=S.mystery;if(M.started&&!M.resolved&&clueCount()>=5&&M.clues[6])opts.push({l:'The trophy (Report)',fn:()=>resolveMystery('report')});
  opts.push({l:'Nothing for now',fn:()=>{}});
  showModal({title:'Report something',kicker:n?n.name:'Report desk',body:`<div class="list">${opts.map(o=>`<button class="choice" data-a="${act(()=>{closeModal();o.fn()})}"><b>${esc(o.l)}</b><small>${esc(o.s||'')}</small></button>`).join('')}</div>`,buttons:[]});
}
function scam(n){showModal({title:`${n.name}'s offer`,body:'<p>"Class test answers. Fresh. ₦500 only. Tell nobody."</p>',buttons:[{label:'No thanks'},{label:'Buy for ₦500',cls:'bad',fn:()=>{closeModal();if(money(-500,'"Test answers"')){S.flags.scam=true;addItem('answers');showModal({title:'You unfold the paper',body:'<p>It says: <b>"A B C D A B C D A B"</b>. These are not answers. You were scammed.</p><p class="note">If it sounds too good to be true, it usually is. You can report it at the report desk or to the VP.</p>',buttons:[{label:'Lesson learned',cls:'school'}]})}}}]})}
function counsel(n){advance(10);addRel(n.id,5);S.counsel=S.t+600;showModal({title:n.name,kicker:'Counselling',body:'<p>"School pressure is normal. Breathe in for four, out for four. You are doing better than you think."</p><p>+5 seconds per question for the next 10 game hours.</p>',buttons:[{label:'Thank you',cls:'school'}]})}
function helpCook(n){const k='cook'+dayOf(S.t);if(S.flags[k])return toast('You already helped today.');S.flags[k]=1;advance(15);addRel(n.id,6);money(300,'Helped carry trays');progress('cook',1)}


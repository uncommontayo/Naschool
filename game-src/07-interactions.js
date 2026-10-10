/* =================== CONTEXT MENUS =================== */
function closeCtx(){const c=$('#ctx');if(c)c.hidden=true}
function showCtx(el,head,items){
  const c=$('#ctx');
  c.innerHTML=head+items.map(it=>it.dis?`<button class="dis" aria-disabled="true">${esc(it.l)}<small>${esc(it.dis)}</small></button>`:`<button data-a="${act(()=>{closeCtx();it.fn()})}">${esc(it.l)}${it.s?`<small>${esc(it.s)}</small>`:''}</button>`).join('');
  c.hidden=false;
  const app=$('#app').getBoundingClientRect(),r=el.getBoundingClientRect();
  let x=r.left+r.width/2-115-app.left,y=r.top-app.top-10;
  const ch=c.offsetHeight;if(y+ch>app.height-10)y=Math.max(10,app.height-ch-10);if(y<10)y=10;
  x=clamp(x,10,app.width-240);c.style.left=x+'px';c.style.top=y+'px';
}
function npcSub(n){
  if(n.kind==='student')return `${n.human?'Player · ':''}${n.year} ${n.cls}${n.rival?' · '+SCHOOLS[n.school].short:''} · ${n.house}${n.human?'':' · '+ARCH_LABEL[n.arch]}`;
  if(n.kind==='teacher')return `${SUBJ[n.subject]} teacher · ${STYLE_TITLE[n.style]}`;
  if(n.kind==='staff')return ROLE_LABEL[n.role];return n.lbl||'';
}
function openCtxNPC(id,el){
  const n=npc(id),P=S.player;if(!n)return;
  const r=rel(id),lvl=relLevel(r,relKind(n));
  const head=`<div class="c-head"><b>${esc(n.name)}</b><small>${esc(npcSub(n))}</small><small style="display:block">${lvl} · ${r}</small><div class="relbar"><i style="width:${r}%"></i></div></div>`;
  showCtx(el,head,actionsFor(n));
  if(S.tut===2&&id===CAST.buddy){S.tut=3;renderTaskbar();updateTut()}
}
function updateTut(){const t=$('.tut span');if(t&&TUT_TEXT[S.tut])t.textContent=TUT_TEXT[S.tut]}
function actionsFor(n){
  const P=S.player,A=[],r=rel(n.id),lvl=relLevel(r,relKind(n)),friend=r>=40,M=S.mystery;
  if(S.blocked.includes(n.id))return[{l:'Unblock',fn:()=>{S.blocked=S.blocked.filter(x=>x!==n.id);toast('Unblocked.')}}];
  if(n.kind==='student'&&P.role==='student'){
    if(n.human){A.push({l:'Talk',fn:()=>talkHuman(n)});if(!S.friends.includes(n.id))A.push({l:'Add friend',fn:()=>{S.friends.push(n.id);addRel(n.id,10);notify('social',`${n.name} accepted your friend request.`)}});else A.push({l:'Send money',fn:()=>giveMoney(n)},{l:'Give item',fn:()=>giveItem(n)});A.push({l:'Challenge',fn:()=>challengeMenu(n)});if(S.friends.includes(n.id)&&M.started&&!M.resolved&&!M.party.includes(n.id))A.push({l:'Invite to mission',fn:()=>inviteParty(n)});A.push({l:S.muted.includes(n.id)?'Unmute':'Mute',fn:()=>toggleMute(n)},{l:'Block',fn:()=>{S.blocked.push(n.id);toast(`${n.name} is blocked.`)}},{l:'Report',fn:()=>reportPlayer(n)});return A}
    const senior=P.year==='JSS3'&&n.year==='SSS3',junior=P.year==='SSS3'&&n.year==='JSS3';
    if(senior)A.push({l:'Greet senior',s:'+1',fn:()=>greetSenior(n)});
    if(r<10)A.push({l:'Introduce yourself',fn:()=>{addRel(n.id,5);sayBubble(n,`Nice to meet you, ${P.name}!`);advance(1)}});
    A.push({l:'Talk',fn:()=>talk(n)});
    if(n.rival)A.push({l:'Banter',fn:()=>banter(n)});
    A.push({l:'Ask about a rumour',fn:()=>askRumour(n)});
    if(Object.keys(S.rumours).length&&r>=10)A.push({l:'Share a rumour',fn:()=>shareRumour(n)});
    if(junior)A.push({l:'Ask a favour',fn:()=>askFavour(n)});
    if(friend){A.push({l:'Give item',fn:()=>giveItem(n)},{l:'Send money',fn:()=>giveMoney(n)});if(M.started&&!M.resolved&&!M.party.includes(n.id)&&!n.rival)A.push({l:'Invite to mission',fn:()=>inviteParty(n)})}
    else if(!n.rival&&r>=10)A.push({l:'Give item',dis:'Needs Friend'});
    A.push({l:'Challenge',fn:()=>challengeMenu(n)});
    if(n.id===CAST.prankster&&M.started&&!M.resolved&&M.clues[3]&&M.clues[4]&&M.clues[5])A.push({l:'Show the clues',s:'Confront',fn:confess});
    if(n.arch==='MIS'&&!n.rival&&!S.flags.scam)A.push({l:'Buy "test answers"',s:'₦500',fn:()=>scam(n)});
    return A;
  }
  if(n.kind==='student'&&P.role==='teacher'){
    A.push({l:'Talk',fn:()=>talk(n)},{l:'Ask a question',fn:()=>teacherAsk(n)},{l:'Award house points',s:'+2',fn:()=>{toast(`+2 ${n.house} House · awarded by you`,'good');addRel(n.id,3)}});
    const inc=S.incidents.find(i=>i.who===n.id&&!i.warned);if(inc)A.push({l:'Issue warning',fn:()=>{inc.warned=true;toast(`Warning issued to ${n.name}.`);}});else A.push({l:'Issue warning',dis:'Needs a logged incident'});
    A.push({l:'View student',fn:()=>viewNPC(n)});return A;
  }
  if(n.kind==='teacher'){
    if(P.role==='student'){A.push({l:'Greet',fn:()=>{addRel(n.id,1);sayBubble(n,'Good morning. Tuck in that shirt.')}},{l:'Ask a question',fn:()=>practiceQ(n)},{l:'Ask for help',fn:()=>{addRel(n.id,3);sayBubble(n,n.line);advance(2)}},{l:'Report something',fn:()=>reportMenu(n)},{l:'Thank teacher',fn:()=>{addRel(n.id,2);sayBubble(n,'You are welcome.')}})}
    else{A.push({l:'Talk',fn:()=>talk(n)},{l:'Gossip',fn:()=>staffGossip(n)},{l:'Help',fn:()=>{addRel(n.id,4);sayBubble(n,'Thank you, colleague!')}},{l:'Discuss a student',fn:()=>{addRel(n.id,2);sayBubble(n,`${npc(CAST.prankster).name.split(' ')[0]}? Always "just passing".`)}})}
    return A;
  }
  if(n.kind==='staff'){
    switch(n.role){
      case 'security':A.push({l:'Ask who came in this week',fn:()=>askSecurity(n)});break;
      case 'cleaner':A.push({l:'Ask what they noticed',fn:()=>askCleaner(n)});break;
      case 'librarian':A.push({l:'Ask about school history',fn:()=>{addRel(n.id,3);sayBubble(n,P.school==='GHC'?'That old storeroom has been locked for years. Mostly.':'Every trophy has a story.')}});break;
      case 'nurse':A.push({l:'Visit the nurse',fn:()=>{sayBubble(n,'Drink water, eat well, rest.');advance(5)}});break;
      case 'counsellor':A.push({l:'Talk to the counsellor',fn:()=>counsel(n)});break;
      case 'cook':A.push({l:'Buy food',fn:()=>openShop('cafeteria')});if(tod(S.t)>=780&&tod(S.t)<840&&P.role==='student')A.push({l:'Help carry trays',s:'₦300',fn:()=>helpCook(n)});break;
      case 'vp':A.push({l:'Report something',fn:()=>reportMenu(n)});break;
      case 'principal':A.push({l:'Greet',fn:()=>{addRel(n.id,1);sayBubble(n,`Welcome to ${SCHOOLS[P.school].short}. Make us proud.`)}});break;
      default:A.push({l:'Greet',fn:()=>{addRel(n.id,1);sayBubble(n,'Good evening. Lights out soon.')}});
    }
    A.push({l:'Talk',fn:()=>talk(n)});return A;
  }
  if(n.role==='mamaput')return[{l:'Buy food',fn:()=>openShop('mamaput')},{l:'Talk',fn:()=>sayBubble(n,'My jollof is cheaper than your school own. Taste am!')}];
  if(n.role==='kiosk')return[{l:'Buy',fn:()=>openShop('kiosk')}];
  if(n.role==='pos')return[{l:'Withdraw',fn:()=>ctxHotspot('pos')}];
  if(n.role==='mum')return[{l:'Get pocket money',fn:mumMoney},{l:'Talk',fn:()=>sayBubble(n,rnd(['Did you eat?','Read your books o!','Greet your teachers for me.','Do not follow bad friends.']))}];
  return[{l:'Talk',fn:()=>talk(n)}];
}
function sayBubble(n,text){
  const btn=[...document.querySelectorAll('#scene .chr')].find(b=>b.getAttribute('aria-label')===n.name);
  if(!btn){toast(`${n.name.split(' ')[0]}: "${text}"`);return}
  const sc=$('#scene'),b=document.createElement('div');b.className='bubble';b.textContent=text;
  b.style.left=btn.style.left;b.style.top=`calc(${btn.style.top} - ${btn.offsetHeight+6}px)`;sc.appendChild(b);setTimeout(()=>b.remove(),5100);
}

/* hotspots */
function ctxHotspot(kind){
  const P=S.player,M=S.mystery,m=tod(S.t),st=P.role==='student';
  const target=(LAST_EL&&LAST_EL.closest&&(LAST_EL.closest('.prop')||LAST_EL))||$('#scene');
  let items=[],title='';
  switch(kind){
    case 'board':title='Blackboard';
      if(st){if(canAttend())items.push({l:'Attend class',s:currentSubject(),fn:promptAttend});else items.push({l:'Attend class',dis:periodIdx(S.t)<0?'No lesson right now':'Already attended'});
        const tPresent=peopleAt('classroom').some(n=>n.kind==='teacher');
        items.push(tPresent?{l:'Make noise',s:'Chaos',fn:()=>chaosPrompt('noise')}:{l:'Raise a false alarm',s:'Chaos',fn:()=>chaosPrompt('alarm')});
        items.push({l:'Sleep on your desk',s:'Chaos',fn:()=>chaosPrompt('sleep')});
        if(m>=465&&m<480)items.push({l:'Watch who writes on the board',fn:boardWriter});}
      else{const tc=teacherClassNow();if(tc&&!(S.lessonDone||{})[lessonKey()])items.push({l:`Start lesson · ${tc.year} ${SCHOOLS[P.school].classes[tc.year]}`,fn:startLesson});else items.push({l:'Start lesson',dis:tc?'Lesson finished':'Not your period'});
        if(m>=465&&m<480&&!taskDone('t_board'))items.push({l:'Wait and watch the board',fn:boardWriter});}
      break;
    case 'desk':title='Your desk';items.push({l:'Study',s:'+Academic',fn:()=>{rep('ACA',1);advance(10);toast('+Academic · 10 minutes of revision')}});break;
    case 'shelf':title='Shelves';items.push({l:'Study for 20 minutes',s:'+Academic',fn:()=>{rep('ACA',2);advance(20);progress('library',20);toast('+Academic · you revised for 20 minutes')}},{l:'Revise a missed question',fn:reviseMissed});break;
    case 'store':title=P.school==='GHC'?'Old storeroom door':'Sports store';items.push({l:'Search',s:M.started?'Mystery':'',fn:searchStore});break;
    case 'table':title='Table';items.push({l:'Eat something from your bag',fn:()=>openPanel('bag')},{l:'Sit with people',fn:()=>{const p=peopleAt(S.loc).filter(n=>n.kind==='student');if(!p.length)return toast('Nobody is sitting here right now.');p.slice(0,2).forEach(n=>addRel(n.id,2));advance(10)}});break;
    case 'goal':title='Goalpost';items.push({l:'Practise',fn:()=>{advance(15);rep('SOC',1);toast('You practised penalties for 15 minutes.')}},{l:'Football challenge',fn:()=>{const opp=peopleAt(S.loc).find(n=>n.kind==='student');if(!opp)return toast('Nobody here to play right now. Try after 14:00.');football(opp)}});break;
    case 'tree':title='Big mango tree';items.push({l:'Ask around',s:'Rumours',fn:askAround},{l:'Gossip with the group',fn:()=>{const p=peopleAt('common').filter(n=>n.kind==='student'&&!n.human);if(!p.length)return toast('Nobody under the tree right now.');p.forEach(n=>addRel(n.id,1,true));rep('SOC',1);toast('+Social · you joined the gist');advance(10)}});break;
    case 'notice':title='Notice board';items.push({l:'Read',fn:readNotice});break;
    case 'bed':title='Bed';items.push({l:m>=1260||m<330?'Sleep until the morning bell':'Rest for 30 minutes',fn:()=>{if(m>=1260||m<330){const target=m>=1260?(1440-m)+330:330-m;advance(target);notify('task','Good morning! New day, new tasks.')}else advance(30)}});break;
    case 'locker':title='Locker';
      if(!st)items.push({l:'Inspect lockers',s:'Duty teacher',fn:inspectDorm});
      if(st){items.push({l:'Cook noodles',s:'Chaos · after 21:00',fn:()=>m>=1260||m<300?chaosPrompt('noodles'):toast('Too early. Matron is still around.')});if(S.flags.inspection===dayOf(S.t))items.push({l:'Hide your snack',s:'Chaos',fn:()=>chaosPrompt('hide')});items.push({l:'Snack raid on an NPC locker',s:'Chaos',fn:()=>chaosPrompt('raid')})}
      break;
    case 'gate':title='Gate';
      if(st){items.push({l:'Leave for Town Junction',fn:()=>travel('junction')});items.push({l:`Sneak into ${SCHOOLS[CAST.rival].short} campus`,s:'Chaos',fn:()=>chaosPrompt('rival')})}
      else items.push({l:'Go to Town Junction',fn:()=>travel('junction')});
      break;
    case 'report':title='Report desk';items.push({l:'Report something',fn:()=>reportMenu(npc('x_vp'))});break;
    case 'kettle':title='Kettle corner';items.push({l:'Observe the room',fn:observeStaff},{l:'Settle the kettle argument',fn:kettle});break;
    case 'staffnotice':title='Staff notices';items.push({l:'Sign up as rivalry quiz coach',fn:()=>{S.flags.coach=true;taskTick('t_coach',0);toast('You are the rivalry quiz coach. Go to the Inter-School Ground for a friendly at 16:00.')}});break;
    case 'notes':title='Lesson notes';items.push({l:'Prepare a lesson (20 min)',fn:()=>{advance(20);S.flags.prepared=dayOf(S.t);toast('Prepared. Your next pop quiz gives +1 bonus point.')}});break;
    case 'pos':title='Chidi POS';items.push({l:`Withdraw ₦1,000 (fee ₦50)`,s:`Bank ${naira(S.bank)}`,fn:posWithdraw});break;
    case 'barber':title='Barber and braider';items.push({l:'New hairstyle',s:'₦500',fn:hairChange});break;
    case 'fridge':title='Fridge';items.push({l:'Eat breakfast',fn:()=>{if(S.lastMealDay===dayOf(S.t))return toast('You already ate today.');S.lastMealDay=dayOf(S.t);toast('You ate bread, egg and tea. No longer hungry.','good');renderHUD()}});break;
    case 'quizstand':title='Rivalry quiz stand';items.push({l:'Join the rivalry quiz',fn:rivalryQuiz});break;
    case 'pitch':title='Pitch';items.push({l:'Football vs a rival player',fn:()=>{const r=peopleAt('ground').find(n=>n.rival);if(!r)return toast('No rival players here right now.');football(r)}});break;
    case 'sickbay':title='Sick bay';items.push({l:'Rest for 20 minutes',fn:()=>advance(20)});break;
  }
  if(!items.length)items.push({l:'Nothing to do here',dis:'Try another time'});
  showCtx(target,`<div class="c-head"><b>${esc(title)}</b><small>${esc(locName(S.loc))}</small></div>`,items);
}

/* =================== TALK =================== */
function fillVars(s){const P=S.player,code=P.school;const p=periodIdx(S.t);const yr=P.year||'JSS3';
  const nx=(()=>{for(let i=Math.max(0,p+1);i<5;i++){return SUBJ[subjectFor(yr,S.t,i)]}return 'Prep, then dinner'})();
  return s.replace('{cook}',STAFF[code].find(x=>x[0]==='cook')[1]).replace('{mth}',TEACHERS[code].MTH[0]).replace('{rival}',SCHOOLS[CAST.rival].short).replace('{next}',nx).replace('{house}','{house}').replace('{pairA}',CAST.pair[0]).replace('{pairB}',CAST.pair[1])}
function talk(n){
  const P=S.player,day=dayOf(S.t),k=n.id+'-'+day;S.talks[k]=S.talks[k]||0;
  const top=P.role==='student'?(P.type||'SOC'):'SOC';
  let prompts=[];
  if(S.tut===3&&n.id===CAST.buddy)prompts.push(['new',"Hi, I'm new here.",'gen']);
  prompts.push(['latest','Have you heard the latest?','gos']);
  const first=TRAIT_CAT[top];const pool=[];
  Object.entries(PROMPTS).forEach(([c,l])=>l.forEach(([k2,t])=>{if(k2!=='latest')pool.push([k2,t,c])}));
  const fromTop=pool.filter(x=>x[2]===first);prompts.push(fromTop[hash(n.id+day)%fromTop.length]);
  const rest=pool.filter(x=>x[2]!==first);for(let i=0;i<2;i++)prompts.push(rest[(hash(n.id+i+day)+i*7)%rest.length]);
  prompts=prompts.slice(0,4);
  const pick=i=>{
    const [key]=prompts[i];closeModal();advance(2);
    let reply,d=0,pay=null;
    if(key==='new'){reply=`Welcome to ${SCHOOLS[P.school].short}! Have you seen the notice board at the assembly ground? Something big is missing.`;d=6;S.tut=4;renderTaskbar();renderScene(true)}
    else if(n.kind!=='student'){reply=n.kind==='teacher'?(key==='latest'?(P.role==='teacher'?`Have you noticed ${CAST.pair[0]} and ${CAST.pair[1]} keep stepping out together?`:'Focus on your books. And on the notice board.'):n.line):staffLine(n,key);d=2;if(n.kind==='teacher'&&P.role==='teacher'&&key==='latest')heardRumour(10)}
    else{
      const r=(REPLIES[key]||{})[n.arch];
      if(n.arch==='OBS'&&key==='latest'){if(rel(n.id)>=10&&S.mystery.started){reply=`I saw something… after prep, a boy carrying a box in a ${P.school==='GHC'?'blue wrapper':'maroon cloth'}.`;d=3;pay='clue3'}else{reply='Maybe. Why are you asking?';d=1}}
      else if(r){reply=r[0].replace('{house}',n.house);d=r[1];pay=r[2]||null}else{reply='Hmm, okay.';d=1}
    }
    reply=fillVars(reply);
    if(S.talks[k]>=3&&d>0)d=0;S.talks[k]++;
    if(d)addRel(n.id,d);
    if(key==='latest'||key==='who'||key==='assembly')progress('ask',1);
    if(pay==='rumour')heardRumour(nextRumour());
    if(pay==='ghost')heardRumour(2);
    if(pay==='herring'){heardRumour(1);if(S.mystery.started)findClue(1)}
    if(pay==='notice'&&!S.mystery.started)toast('Tip: read the notice board at the assembly ground.');
    if(pay==='clue3')findClue(3);
    showModal({title:n.name,kicker:npcSub(n),body:`<div class="dlg"><div class="por">${avatar(n.look,80)}</div><div class="say"><small>You: "${esc(prompts[i][1])}"</small>${esc(reply)}</div></div>`,buttons:[{label:'Talk again',fn:()=>{closeModal();talk(n)}},{label:'Done',cls:'school'}]});
  };
  showModal({title:n.name,kicker:`Talk · ${relLevel(rel(n.id),relKind(n))}`,body:`<div class="dlg"><div class="por">${avatar(n.look,80)}</div><div style="display:grid;gap:8px"><div class="say">${n.kind==='student'?(rel(n.id)<10?'"Yes? Do I know you?"':'"How far?"'):'"Yes?"'}</div><div class="prompts">${prompts.map((p,i)=>`<button data-a="${act(()=>pick(i))}"><span class="cat">${CAT_LABEL[p[2]]}</span>${esc(p[1])}</button>`).join('')}</div></div></div><p class="note">Typing your own message works with human players only.</p>`,buttons:[{label:'Leave'}]});
}
function staffLine(n,key){const L={security:'I sign everybody in and out. Nobody passes me.',cleaner:'People forget the cleaner has eyes.',librarian:'Shh. Quiet zone.',nurse:'Are you feeling okay?',counsellor:'How are you really doing?',cook:"Jollof today. Extra pepper.",principal:'Discipline and excellence.',vp:'Is your uniform correct?',matron:'Lights out at the bell. No noodles.',housemaster:'Wake-up bell is 05:30. Not 05:31.'};return L[n.role]||'Good day.'}
function talkHuman(n){
  showModal({title:n.name,kicker:'Player · type your own message',body:`<form id="humanForm" class="row"><input id="human-msg" maxlength="280" placeholder="Say something…" style="flex:1;min-width:0;border:1.5px solid var(--line);border-radius:10px;padding:10px"><button class="btn school sm" type="submit">Send</button></form><p class="note">Direct messages work between Friends. Phone numbers and handles are blocked in public chat.</p><div id="human-log" class="list"></div>`,buttons:[{label:'Close'}]});
  $('#humanForm').addEventListener('submit',e=>{e.preventDefault();const v=$('#human-msg').value.trim();if(!v)return;const f=filterMsg(v,false);const log=$('#human-log');if(!f.ok){log.insertAdjacentHTML('afterbegin',`<div class="item"><span class="t"><small>${esc(f.reason)}</small></span></div>`);return}
    log.insertAdjacentHTML('afterbegin',`<div class="item"><span class="t"><b>You</b><small>${esc(v)}</small></span></div>`);$('#human-msg').value='';addRel(n.id,2,true);
    setTimeout(()=>{if(!$('#human-log'))return;$('#human-log').insertAdjacentHTML('afterbegin',`<div class="item"><span class="t"><b>${esc(n.name)}</b><small>${esc(rnd(['lol true','abeg wait, I dey come','which class you dey?','omo this trophy matter ehn','see you at the field?','we go win this rivalry 💪']))}</small></span></div>`)},900)});
}
function greetSenior(n){const k='g'+n.id+dayOf(S.t);if(S.flags[k])return toast('You already greeted them today.');S.flags[k]=1;addRel(n.id,1);sayBubble(n,'Morning. Tuck in your shirt.')}
function askFavour(n){if(chance(.7)){addRel(n.id,2);sayBubble(n,'Okay, Senior. I will carry them.');toast(`${n.name.split(' ')[0]} carried your books. Say thank you!`)}else sayBubble(n,"Sorry, Senior, I'm late for class.")}
function banter(n){sayBubble(n,rnd([`${SCHOOLS[S.player.school].banter}? We are coming for you.`,'See you on Saturday. Bring tissues.','Your trophy is missing? Wahala.','Future Forever!','Heights No. 1? In your dreams.']));addRel(n.id,1)}

/* =================== RUMOURS =================== */
function nextRumour(){const order=[3,4,5,7,8,9,6,1,2];return order.find(id=>!S.rumours[id])||rnd(order)}
function heardRumour(id){if(!S.rumours[id]){S.rumours[id]='Heard';notify('rumour',`Rumour heard: "${fillVars(RUMOURS[id-1].t)}"`);if(id===5)S.flags.pricesUpNext=dayOf(S.t)+1;if(id===4)S.flags.inspectNight=dayOf(S.t)}}
function askRumour(n){progress('ask',1);advance(2);const r=(REPLIES.latest[n.arch]||['No gist.',0]);if(n.arch==='SOC'||n.arch==='FUN'||n.human){const id=nextRumour();heardRumour(id);sayBubble(n,`"${fillVars(RUMOURS[id-1].t)}"`)}else if(n.arch==='COM'){heardRumour(1);if(S.mystery.started)findClue(1);sayBubble(n,fillVars(r[0]))}else sayBubble(n,fillVars(r[0]))}
function askAround(){const p=peopleAt('common').filter(n=>n.kind==='student');if(!p.length)return toast('Nobody under the tree right now. Come at break or after school.');const n=rnd(p);askRumour(n);advance(5)}
function shareRumour(n){const ids=Object.keys(S.rumours).map(Number);showModal({title:'Share a rumour',body:`<div class="list">${ids.map(id=>`<button class="choice" data-a="${act(()=>{closeModal();if(!S.shared.includes(id))S.shared.push(id);addRel(n.id,2);rep('SOC',1);sayBubble(n,'Ehn?! Tell me more.');toast(`You told ${n.name.split(' ')[0]}. If it turns out false, it will cost you.`)})}"><b>${esc(fillVars(RUMOURS[id-1].t))}</b><small>${S.rumours[id]}</small></button>`).join('')}</div>`,buttons:[{label:'Cancel'}]})}
function disprove(id){if(S.rumours[id]&&S.rumours[id]!=='Disproven'){S.rumours[id]='Disproven';notify('rumour',`Disproven: "${fillVars(RUMOURS[id-1].t)}"`);if(S.shared.includes(id)){rep('SOC',-3);toast('−3 reputation with everyone you told','bad')}}}


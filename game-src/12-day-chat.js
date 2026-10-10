/* =================== DAY CYCLE + TICK =================== */
function newDay(first){
  const d=dayOf(S.t);S.tasksDay=d;genTasks();S.ptsToday=0;S.eventsToday=0;
  if(S.flags.pricesUpNext===d){S.flags.pricesUp=true;S.flags.pricesUpNext=null}else S.flags.pricesUp=false;
  if(S.flags.loan&&S.flags.loan.day===d){const l=S.flags.loan;S.flags.loan=null;if(l.paid)money(300,'Loan repaid by '+npc(l.who).name.split(' ')[0]);else notify('social',`${npc(l.who).name} has not paid back your ₦300.`)}
  if(!first&&S.player.role==='teacher')money(1000,'Daily salary');
  if(dow(S.t)===0&&S.confiscated&&S.confiscated.length){S.confiscated.forEach(k=>addItem(k));S.confiscated=[];notify('reward','Confiscated items returned.')}
}
function onMinute(){
  const m=tod(S.t),d=dow(S.t);
  if(m===0||dayOf(S.t)!==S.tasksDay)newDay();
  if(m===450&&weekday(S.t)&&S.player.role==='student')notify('school',`Assembly: ${STAFF[S.player.school][0][1]} reminds everyone the rivalry quiz is on Saturday.`);
  if(m===455&&weekday(S.t)&&S.player.role==='student'&&S.tut>=10&&S.loc!=='assembly'&&!S.flags['late'+dayOf(S.t)]){S.flags['late'+dayOf(S.t)]=1;rep('DIS',-2);S.incidents.unshift({self:true,action:'Late for assembly',loc:'Assembly ground',t:S.t,by:'Vice Principal',pun:'Warning',status:'Served'});notify('punish','Late for assembly. Warning logged.')}
  const p=periodIdx(S.t);
  if(p>=0&&m===PERIODS[p]){const P=S.player;
    if(P.role==='student'){const sub=subjectFor(P.year,S.t,p);notify('school',`Bell! Period ${p+1}: ${SUBJ[sub]} · ${ROOM[P.year]}`,S.loc==='classroom');if(S.loc==='classroom'&&S.tut>=10&&!modalOpen())promptAttend()}
    else{const tc=teacherClassNow();if(tc)notify('school',`Bell! Your lesson: ${tc.year} ${SCHOOLS[P.school].classes[tc.year]} · ${ROOM[tc.year]}`)}}
  if(m===PERIODS[0]-5&&S.player.role==='teacher'&&weekday(S.t)){const nl=nextLesson();if(nl&&!nl.startsWith('Done'))notify('school',`First lesson soon: ${nl}`)}
  if(d===5&&m===540){if(S.player.status==='boarding'){money(S.player.year==='JSS3'?2000:3000,'Visiting-day allowance')}if(S.player.status==='day')S.bank+=1000;notify('school','Saturday! Visiting day and the rivalry quiz at 10:00 (Inter-School Ground).')}
  if(d===5&&m===1080)weeklyResolution();
  if(m%30===0){const ch=chance(.5)?1:0;const add=Math.floor(Math.random()*4);const code=S.player.school;const before=leader();S.points[CAST.rival]+=add+ch;S.points[code]+=Math.floor(Math.random()*3);checkLead(before);renderTaskbar();
    S.housePts.Emerald+=Math.floor(Math.random()*3);S.housePts.Ruby+=Math.floor(Math.random()*3);S.housePts.Topaz+=Math.floor(Math.random()*3);S.housePts.Amethyst+=Math.floor(Math.random()*3)}
  if(m===510&&dayOf(S.t)===0&&!S.flags.kachiReq){S.flags.kachiReq=1;notify('social','Kachi (NPC) sent you a friend request. Open Friends to respond.');S.pendingReq=['p_kachi']}
  if(m%20===0)simChat();
  if(m%60===30&&S.tut>=10&&!modalOpen()&&S.eventsToday<4&&chance(.35))randomEvent();
  if(m===1290&&S.player.status==='boarding'&&(S.flags.inspectNight===dayOf(S.t)||chance(.25))){S.flags.inspection=dayOf(S.t);notify('school','Hostel inspection tonight! Hide your snacks or lose them.')}
  if(m===1080&&S.player.role==='student'){const ok=S.houseGoal>=6;if(ok){housePts(20,'House challenge complete');}S.houseGoal=0}
  if(m===1260&&isDuty())notify('school','You are duty teacher tonight. Inspect the hostels after 21:00.');
  if(m%10===0)renderScene(false);
  if(m%30===0)renderHUD();
}
function weeklyResolution(){
  const g=S.points.GHC,b=S.points.BFA,win=g>=b?'GHC':'BFA';
  if(win===S.player.school&&S.ptsWeek>0)money(300,'Rivalry week champions');
  const topHouse=Object.entries(S.housePts).sort((a,b)=>b[1]-a[1])[0][0];if(topHouse===S.player.house)giveBadge('house');
  notify('rivalry',`RIVALRY WEEK RESULT: ${SCHOOLS[win].name} wins ${Math.max(g,b)}–${Math.min(g,b)}! ${topHouse} House takes the house cup.`);
  if(!modalOpen())showModal({title:`${SCHOOLS[win].short} are Rivalry Week Champions`,kicker:'Saturday 18:00 · weekly resolution',body:`<div class="spread"><div class="big" style="color:${SCHOOLS.GHC.primary}">GHC ${g}</div><div class="big" style="color:${SCHOOLS.BFA.primary}">BFA ${b}</div></div><p>${win===S.player.school?(S.ptsWeek>0?'You contributed, so you get ₦300.':'Contribute next week to share the prize.'):'Next week, your school takes it back.'} The winning gate shows a champions banner for a week. Scores reset now.</p>`,buttons:[{label:'Okay',cls:'school'}]});
  S.points={GHC:0,BFA:0};S.ptsWeek=0;renderTaskbar();
}
function advance(mins){for(let i=0;i<mins;i++){S.t++;onMinute()}updateClock();renderScene(false)}
let acc=0;
setInterval(()=>{
  if(!S||$('#game').hidden)return;
  acc+=SPEED/4;  // the clock never pauses, not even behind a panel or popup
  while(acc>=1){acc-=1;S.t++;onMinute()}
  updateClock();
},250);
setInterval(()=>{save();ambient()},5000);
function ambient(){if(!S||$('#game').hidden||modalOpen())return;const p=peopleAt(S.loc).filter(n=>n.kind==='student'&&!n.human);if(!p.length)return;const n=rnd(p);sayBubble(n,fillVars(rnd(AMBIENT)))}

/* =================== CHAT =================== */
const CHANNELS=['Nearby','Class','School','House','Junction'];
const CHAT_LINES={Nearby:['who get biro?','this sun no be here 😩','see queue for jollof','abeg move small'],Class:['Did anyone do the assignment?','Mr. Vincent is coming!!','which page are we on','the test is Friday o'],School:['Rivalry quiz Saturday. Who is going?','Who took the trophy sef','prep is too long abeg','tuck shop meat pie is back'],House:['We need 6 correct answers for the house challenge!','House meeting after lunch','Ruby is catching up, wake up guys'],Junction:['Heights who? 😂','Future is shaking already','see you on Saturday','our quiz team is cooking']};
function simChat(){const ch=rnd(CHANNELS);const who=ch==='Junction'?rnd(['Seun (NPC)','Kachi (NPC)','Ronke (NPC)']):rnd(['Kachi (NPC)','Ronke (NPC)','Dami (NPC)','Zainab (NPC)','Femi (NPC)']);pushChat(ch,who,rnd(CHAT_LINES[ch]),true)}
function pushChat(ch,who,text,isNpc,sys){S.chat[ch]=S.chat[ch]||[];if(!sys&&S.muted.some(id=>npc(id)&&npc(id).name===who))return;S.chat[ch].push({who,text,npc:isNpc,sys});S.chat[ch]=S.chat[ch].slice(-40);if(ch===S.chatCh){const box=$('#chatdock .ch-msgs');if(box){box.insertAdjacentHTML('beforeend',chatLine(S.chat[ch][S.chat[ch].length-1]));box.scrollTop=box.scrollHeight}}}
function chatLine(m){return m.sys?`<div class="sys">${esc(m.text)}</div>`:`<div class="${m.npc?'npc':''}"><b>${esc(m.who)}:</b> ${esc(m.text)}</div>`}
function chatDockHTML(){const ch=S.chatCh,msgs=(S.chat[ch]||[]).slice(-20);return `<div id="chatdock" class="${S.chatMin?'min':''}"><div class="ch-head">${CHANNELS.map(c=>`<button class="${c===ch?'on':''}" data-a="${act(()=>{S.chatCh=c;S.chatMin=false;renderScene(true)})}">${c}</button>`).join('')}<button aria-label="Minimise chat" data-a="${act(()=>{S.chatMin=!S.chatMin;renderScene(true)})}">${S.chatMin?'▾':'▴'}</button></div><div class="ch-msgs">${msgs.map(chatLine).join('')||'<div class="sys">No messages yet.</div>'}</div><form id="chatForm"><input id="chat-in" maxlength="280" placeholder="Message ${ch}…" autocomplete="off"><button type="submit">Send</button></form></div>`}
function wireChatForm(){const f=$('#chatForm');if(!f)return;const box=$('#chatdock .ch-msgs');if(box)box.scrollTop=box.scrollHeight;f.addEventListener('submit',e=>{e.preventDefault();const v=$('#chat-in').value.trim();if(!v)return;const r=filterMsg(v,true);if(!r.ok){pushChat(S.chatCh,'',r.reason,false,true);return}pushChat(S.chatCh,'You',v,false);$('#chat-in').value='';if(S.chatCh==='Nearby'){const p=peopleAt(S.loc).find(n=>n.kind==='student');if(p)setTimeout(()=>sayBubble(p,rnd(['Ehn?','True talk.','Lol.','How far?'])),600)}})}
let sent=[];
function filterMsg(v,pub){
  const now=Date.now();sent=sent.filter(t=>now-t<10000);if(sent.length>=5)return{ok:false,reason:'Slow down: 5 messages per 10 seconds.'};
  if(/\b(fuck|shit|bitch|bastard|idiot|sex)\b/i.test(v))return{ok:false,reason:'Message not sent: keep it school-friendly.'};
  if(pub&&(/(\+?\d[\d\s-]{6,}\d)/.test(v)||/[\w.]+@[\w-]+\.\w+/.test(v)||/@\w{3,}|whatsapp|\binsta\b|\big\b|snapchat|telegram/i.test(v)))return{ok:false,reason:'Message not sent: phone numbers, emails and social handles are blocked in public channels.'};
  sent.push(now);return{ok:true};
}
function toggleMute(n){if(S.muted.includes(n.id)){S.muted=S.muted.filter(x=>x!==n.id);toast(`${n.name} unmuted.`)}else{S.muted.push(n.id);toast(`${n.name} muted. You won't see their messages.`)}}
function reportPlayer(n){showModal({title:`Report ${n.name}`,body:`<div class="list">${['Harassment','Inappropriate content','Sharing personal info','Spam','Cheating','Other'].map(r=>`<button class="choice" data-a="${act(()=>{closeModal();notify('school',`Report sent (${r}). The last 20 messages were attached for review. No automatic punishment.`)})}"><b>${r}</b></button>`).join('')}</div>`,buttons:[{label:'Cancel'}]})}


/* =================== MONEY / SHOP / KOLO =================== */
function openShop(v){
  const V=VENDORS[v];closeCtx();
  const rows=V.items.map(id=>`<div class="item"><span class="t"><b>${ITEMS[id].n}</b><small>${ITEMS[id].c}</small></span><div class="row"><span class="mono">${naira(price(id,v))}</span><button class="btn school sm" data-a="${act(()=>buy(id,v))}">Buy</button></div></div>`).join('');
  showModal({title:V.n,kicker:`Wallet ${naira(S.wallet)}${S.flags.pricesUp&&v==='tuck'?' · prices up 10% today':''}`,body:`<div class="list">${rows}</div>`,buttons:[{label:'Close',cls:'school'}]});
}
function buy(id,v){const p=price(id,v);if(S.wallet<p)return toast(`Not enough money. ${ITEMS[id].n} costs ${naira(p)}.`,'bad');if(!addItem(id))return;money(-p,`Bought ${ITEMS[id].n}`);if(ITEMS[id].food&&(v==='cafeteria'||v==='mamaput')){removeItem(id);eat(id)}else openShop(v)}
function eat(id){S.lastMealDay=dayOf(S.t);toast(`You ate ${ITEMS[id].n}. Not hungry any more.`,'good');advance(10);renderHUD()}
function posWithdraw(){if(S.player.status!=='day')return toast('Only day students have a bank top-up here.');if(S.bank<1000)return toast(`Your bank balance is ${naira(S.bank)}.`,'bad');S.bank-=1000;money(1000,'POS withdrawal');money(-50,'POS fee')}
function mumMoney(){const d=dayOf(S.t);if(S.mumPaid===d)return toast('"I already gave you money today!"');if(tod(S.t)>480)return toast('"You are late! Money is for the morning."');S.mumPaid=d;money(S.player.year==='JSS3'?300:500,'From Mum')}
function hairChange(){if(S.wallet<500)return toast('Not enough money (₦500).','bad');const opts=hairOptionsFor();showModal({title:'Barber and braider',kicker:'₦500',body:`<div class="chips">${opts.map(([v,l])=>`<button class="chip ${S.player.look.hair===v?'on':''}" data-a="${act(()=>{closeModal();S.player.look.hair=v;money(-500,'New hairstyle');renderScene(true);renderHUD()})}">${l}</button>`).join('')}</div>`,buttons:[{label:'Cancel'}]})}
function hairOptionsFor(){const prev={role:O.d.role,year:O.d.year,look:O.d.look};O.d.role=S.player.role;O.d.year=S.player.year;O.d.look=S.player.look;const r=hairOptions();Object.assign(O.d,prev);return r}
function giveMoney(n){const today=dayOf(S.t);if(S.giveDay!==today){S.giveDay=today;S.givenToday=0}
  showModal({title:`Send money to ${n.name}`,kicker:`Friends only · ₦50–₦1,000 · ${naira(2000-S.givenToday)} left today`,body:`<div class="chips">${[50,100,200,500,1000].map(a=>`<button class="chip" data-a="${act(()=>{if(S.givenToday+a>2000)return toast('Daily limit is ₦2,000.','bad');closeModal();showModal({title:'Confirm',body:`<p>Send <b>${naira(a)}</b> to <b>${esc(n.name)}</b>?</p>`,buttons:[{label:'Cancel'},{label:'Send',cls:'school',fn:()=>{closeModal();if(money(-a,'Sent to '+n.name)){S.givenToday+=a;addRel(n.id,Math.ceil(a/100)+2)}}}]})})}">${naira(a)}</button>`).join('')}</div>`,buttons:[{label:'Cancel'}]})}
function giveItem(n){const ids=Object.keys(S.inv).filter(k=>!ITEMS[k].locked&&k!=='answers');if(!ids.length)return toast('Nothing in your bag to give.');showModal({title:`Give to ${n.name}`,body:`<div class="list">${ids.map(id=>`<button class="choice" data-a="${act(()=>{closeModal();removeItem(id);addRel(n.id,ITEMS[id].c==='Cosmetics'?8:3);sayBubble(n,'Ah, thank you!')})}"><b>${ITEMS[id].n} ×${S.inv[id]}</b><small>${ITEMS[id].c}</small></button>`).join('')}</div>`,buttons:[{label:'Cancel'}]})}
function koloDeposit(a){if(!money(-a,'Kolo deposit'))return;S.kolo.bal+=a;const d=dayOf(S.t);if(!S.kolo.days.includes(d))S.kolo.days.push(d);const ds=S.kolo.days.slice(-3);if(ds.length===3&&ds[2]-ds[0]===2)giveBadge('kolo');progress('kolo',a);
  if(S.kolo.locked&&S.kolo.bal>=S.kolo.goal){const b=Math.round(S.kolo.goal*.05);S.kolo.bal+=b;S.kolo.locked=false;notify('reward',`Kolo goal reached! +${naira(b)} bonus (5%).`)}openPanel('wallet')}
function koloWithdraw(a){if(S.kolo.bal<a)return toast('Not enough in your Kolo.','bad');if(S.kolo.locked)return showModal({title:'Break your Kolo?',body:'<p>Your Kolo is locked until the goal. Breaking it now loses the 5% bonus.</p>',buttons:[{label:'Keep saving'},{label:'Break it',cls:'bad',fn:()=>{closeModal();S.kolo.locked=false;toast('You broke your Kolo!','bad');koloWithdraw(a)}}]});S.kolo.bal-=a;money(a,'Kolo withdrawal');openPanel('wallet')}

/* =================== CHALLENGES =================== */
function challengeMenu(n){showModal({title:`Challenge ${n.name}`,body:`<div class="list"><button class="choice" data-a="${act(()=>{closeModal();quizChallenge(n)})}"><b>Quiz challenge</b><small>3 questions · most correct wins</small></button><button class="choice" data-a="${act(()=>{closeModal();football(n)})}"><b>Football challenge</b><small>3 rounds · Attack, Pass or Defend</small></button></div>`,buttons:[{label:'Cancel'}]})}
function quizChallenge(n){
  if(chance(.15)&&!n.human)return toast(`${n.name.split(' ')[0]} declined: "Not now, I'm busy."`);
  const yr=S.player.role==='student'?S.player.year:'SSS3';const qs=shuffle(QB.filter(q=>q.y===yr)).slice(0,3);
  const p=n.arch==='ACA'?.8:n.arch==='COM'?.7:.5;const opp=qs.map(()=>chance(p));
  runQuestions({title:`Quiz challenge vs ${n.name.split(' ')[0]}`,qs,time:15,versus:(ok,i)=>`${n.name.split(' ')[0]} got it ${opp[i]?'right':'wrong'}.`,onDone:res=>{
    const me=res.filter(x=>x).length,them=opp.filter(x=>x).length;const out=me>them?'Win':me<them?'Lose':'Draw';
    progress('challenge',1);addRel(n.id,2,true);
    if(out==='Win'){S.stats.quizWins++;money(200,'Quiz challenge win');if(n.rival)schoolPts(5,'Beat a rival')}else money(out==='Draw'?50:50,'Played a challenge');
    checkBadges();showModal({title:out==='Win'?'You win!':out==='Lose'?'You lose':'Draw',kicker:'Quiz challenge',body:`<div class="spread"><div class="big">${me} – ${them}</div><span class="badge">${esc(n.name)}</span></div>`,buttons:[{label:'Done',cls:'school'}]});
  }});
}
function football(n){
  let round=0,me=0,them=0;const log=[];const beats={Attack:'Pass',Pass:'Defend',Defend:'Attack'};
  const show=()=>showModal({title:`Football vs ${n.name.split(' ')[0]}`,kicker:`Round ${round+1} of 3 · ${me}–${them}`,noClose:true,body:`<p class="note">Attack beats Pass · Pass beats Defend · Defend beats Attack</p>${log.length?`<div class="list">${log.map(l=>`<div class="item"><span class="t"><small>${esc(l)}</small></span></div>`).join('')}</div>`:''}<div class="row">${['Attack','Pass','Defend'].map(m=>`<button class="btn school" data-a="${act(()=>play(m))}">${m}</button>`).join('')}</div>`,buttons:[]});
  const play=m=>{const o=rnd(['Attack','Pass','Defend']);let r='No goal';if(beats[m]===o){me++;r='GOAL for you!'}else if(beats[o]===m){them++;r=`Goal for ${n.name.split(' ')[0]}`}log.push(`You ${m} · they ${o} → ${r}`);round++;if(round<3)show();else done()};
  const done=()=>{closeModal();progress('challenge',1);const out=me>them?'Win':me<them?'Lose':'Draw';if(out==='Win'){S.stats.footWins++;money(200,'Football win');if(n.rival)schoolPts(5,'Beat a rival at football')}else money(50,'Played a challenge');addRel(n.id,2,true);checkBadges();
    showModal({title:out==='Win'?'You win!':out==='Lose'?'You lose':'Draw',kicker:'Football challenge',body:`<div class="big">${me} – ${them}</div><div class="list">${log.map(l=>`<div class="item"><span class="t"><small>${esc(l)}</small></span></div>`).join('')}</div>`,buttons:[{label:'Done',cls:'school'}]})};
  show();
}
function rivalryQuiz(){
  const yr=S.player.year||'SSS3';const qs=shuffle(QB.filter(q=>q.y===yr)).slice(0,5);const opp=qs.map(()=>chance(.55));
  runQuestions({title:`Rivalry quiz · ${S.player.school} vs ${CAST.rival}`,qs,time:15,versus:(ok,i)=>`${CAST.rival} ${opp[i]?'answered correctly':'missed it'}.`,onDone:res=>{
    const team=res.filter(x=>x).length+Math.round(Math.random());const them=opp.filter(x=>x).length+Math.round(Math.random());const win=team>them;
    if(win){schoolPts(10,'Rivalry quiz win');money(200,'Rivalry quiz');if(S.player.role==='teacher'&&S.flags.coach)taskTick('t_coach')}else{S.points[CAST.rival]+=10;renderTaskbar()}
    showModal({title:win?`${SCHOOLS[S.player.school].short} wins!`:`${SCHOOLS[CAST.rival].short} wins this round`,kicker:'Rivalry quiz (your team + NPC teammates)',body:`<div class="big">${team} – ${them}</div><p>Spectators cheered. ${win?'+10 school points.':`+10 to ${CAST.rival}.`}</p>`,buttons:[{label:'Done',cls:'school'}]});
  }});
}

/* =================== TASKS =================== */
const TASK_POOL=[
 {k:'attend',text:'Attend all 5 periods today',goal:5,r:300,hp:3,tr:'ACA'},{k:'maths',text:'Answer 3 Maths questions correctly',goal:3,r:200,tr:'ACA'},
 {k:'ask',text:'Ask three students about the latest rumour',goal:3,r:150,tr:'SOC'},{k:'cook',text:'Help the cook carry trays at lunch (13:00)',goal:1,r:0,tr:'HEL',note:'pays ₦300 when done'},
 {k:'notice',text:'Read the notice board',goal:1,r:150,tr:'OBS'},{k:'challenge',text:'Play one challenge',goal:1,r:100,tr:'COM'},
 {k:'kolo',text:'Save ₦500 in your Kolo',goal:500,r:0,tr:'ACA',note:'Kolo badge progress'},{k:'library',text:'Read in the library for 20 game minutes',goal:20,r:100,tr:'ACA'},
 {k:'invite',text:'Invite a friend to do a task together',goal:1,r:150,tr:'SOC'},{k:'football',text:'Win a football challenge',goal:1,r:200,tr:'SPO',hook:'challenge'}
];
function genTasks(){const P=S.player;if(P.role!=='student'){S.tasks=[];return}const top=P.type||'SOC';const first=TASK_POOL.filter(t=>t.tr===top);const pick=[first.length?rnd(first):rnd(TASK_POOL)];const rest=shuffle(TASK_POOL.filter(t=>!pick.includes(t)));while(pick.length<3)pick.push(rest.pop());S.tasks=pick.map(t=>({k:t.hook||t.k,text:t.text,goal:t.goal,prog:0,r:t.r,hp:t.hp||0,done:false,note:t.note||''}))}
function progress(k,n){if(!S||!S.tasks)return;S.tasks.forEach(t=>{if(t.done||t.k!==k)return;t.prog=Math.min(t.goal,t.prog+(n||1));if(t.prog>=t.goal){t.done=true;if(t.r)money(t.r,'Daily task');if(t.hp)housePts(t.hp,'daily task');notify('task',`Task done: ${t.text}`)}});renderTaskbar()}


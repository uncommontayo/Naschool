/* =================== NOTIFY / TOAST / LOG =================== */
function toast(text,kind=''){const el=document.createElement('div');el.className='toast '+kind;el.textContent=text;$('#toasts').appendChild(el);setTimeout(()=>el.remove(),3700)}
function notify(type,text,silent){S.notifs.unshift({type,text,t:S.t});S.notifs=S.notifs.slice(0,60);S.unread++;if(!silent)toast(text,type==='reward'?'gold':type==='punish'?'bad':'');renderHUD()}
function ledger(amount,label){S.ledger.unshift({a:amount,l:label,t:S.t});S.ledger=S.ledger.slice(0,80)}
function money(d,label){
  if(d<0&&S.wallet+d<0){toast(`Not enough money. You have ${naira(S.wallet)}.`,'bad');return false}
  S.wallet+=d;ledger(d,label);toast(`${d>0?'+':'−'}${naira(Math.abs(d))} · ${label}`,d>0?'gold':'');renderHUD();return true
}
function rep(k,d){S.rep[k]=clamp((S.rep[k]||50)+d,0,100)}
function housePts(d,why){S.housePts[S.player.house]=(S.housePts[S.player.house]||0)+d;if(why)toast(`${d>0?'+':''}${d} ${S.player.house} House · ${why}`,d>0?'good':'bad')}
function schoolPts(d,why){
  const code=S.player.school;
  if(d>0){const room=50-S.ptsToday;d=Math.min(d,Math.max(0,room));if(d<=0){toast('Daily cap reached: 50 school points per player.');return}S.ptsToday+=d;S.ptsWeek+=d}
  const before=leader();S.points[code]+=d;if(why)toast(`${d>0?'+':''}${d} ${code} · ${why}`,d>0?'good':'bad');checkLead(before);renderTaskbar();checkBadges();
}
function leader(){return S.points.GHC===S.points.BFA?null:(S.points.GHC>S.points.BFA?'GHC':'BFA')}
function checkLead(before){const now=leader();if(now&&now!==before)notify('rivalry',`RIVALRY UPDATE: ${SCHOOLS[now].short} has taken the lead. GHC ${S.points.GHC} · BFA ${S.points.BFA}.`)}
function giveBadge(id){if(S.badges[id])return;S.badges[id]=S.t;const b=BADGES.find(x=>x[0]===id);notify('reward',`Badge earned: ${b[1]}`)}
function checkBadges(){
  if(S.stats.quizWins>=5)giveBadge('quiz');if(S.stats.footWins>=5)giveBadge('sports');if(S.stats.wellbeing>=3)giveBadge('friend');
  if(S.stats.chaosOk>=10)giveBadge('chaos');if(S.ptsWeek>=50)giveBadge('hero');
}

/* =================== ITEMS =================== */
function addItem(id,q=1){if(invCount()>=30&&!S.inv[id]){toast('Your bag is full (30 slots).','bad');return false}S.inv[id]=(S.inv[id]||0)+q;return true}
function invCount(){return Object.values(S.inv).filter(v=>v>0).length}
function removeItem(id,q=1){if(!S.inv[id])return false;S.inv[id]-=q;if(S.inv[id]<=0)delete S.inv[id];return true}
function price(id,vendor){let p=(VENDORS[vendor]&&VENDORS[vendor].disc&&VENDORS[vendor].disc[id])||ITEMS[id].p;if(S.flags.pricesUp&&vendor==='tuck')p=Math.round(p*1.1/10)*10;return p}
function isHungry(){return S.player.role==='student'&&tod(S.t)>=840&&S.lastMealDay!==dayOf(S.t)}

/* =================== NEW GAME =================== */
function newState(){
  const d=O.d,role=d.role,code=d.school;
  const P={username:d.username,name:d.name,nick:d.nick||'',role,school:code,presentation:d.look.presentation,look:d.look,traits:d.traits||{},styles:d.styles||{}};
  if(role==='student'){P.year=d.year;P.cls=SCHOOLS[code].classes[d.year];P.status=d.status;P.house=d.house;P.type=d.type;P.id=`${code}/${d.year}/${CLASSCODE[P.cls]}/${String(1000+hash(d.username)%9000).padStart(4,'0')}`}
  else{P.subject=d.subject;P.style=d.style;P.house=d.house;P.id=`${code}/STF/${d.subject}/${String(1+hash(d.username)%120).padStart(3,'0')}`;P.status='staff'}
  const start=7*60+22;
  const st={v:1,player:P,t:start,loc:role==='teacher'?'quarters':'assembly',px:50,py:76,
    wallet:role==='teacher'?5000:(d.year==='JSS3'?(d.status==='boarding'?3000:2000):(d.status==='boarding'?5000:3500)),
    bank:P.status==='day'?1500:0,kolo:{bal:0,goal:1200,goalName:'New backpack',locked:false,days:[]},
    inv:{biro:1,exbook:1},rels:{},talks:{},rep:{ACA:50,SOC:50,HEL:50,MIS:50,DIS:70},
    points:{GHC:84,BFA:79},housePts:{Emerald:212,Ruby:240,Topaz:198,Amethyst:225},houseGoal:0,ptsToday:0,ptsWeek:0,
    tasks:[],tasksDay:-1,mystery:{started:false,clues:{},resolved:null,party:[]},rumours:{},shared:[],incidents:[],notifs:[],unread:0,ledger:[],
    badges:{},results:[],attended:{},answered:0,correct:0,lastMealDay:-1,stats:{quizWins:0,footWins:0,wellbeing:0,chaosOk:0,reports:0,giftToday:0},
    flags:{},friends:[],blocked:[],muted:[],lock:null,tut:role==='teacher'?10:1,lastSeen:Date.now(),chatCh:'Nearby',chat:{},teacherTasks:[],
    lesson:null,mumPaid:-1,diff:{},counsel:0,standBack:-1,popDay:-1,eventsToday:0};
  st.ledger.push({a:st.wallet,l:'Starting pocket money',t:start});
  return st;
}


/* =================== MYSTERY =================== */
const trophyName=()=>S.player.school==='GHC'?'Heights Quiz Cup':'Future Football Shield';
const clueCount=()=>Object.keys(S.mystery.clues).length;
const CLUE_TEXT=()=>{const g=S.player.school==='GHC',P=npc(CAST.prankster);return{
  1:`${npc(CAST.herring).name.split(' ')[0]} insists ${SCHOOLS[CAST.rival].short} stole it. (Red herring?)`,
  2:`${g?'Mallam Sule':'Mallam Garba'}: no ${SCHOOLS[CAST.rival].short} student entered this week.`,
  3:`${npc(CAST.quiet).name.split(' ')[0]} saw a boy after prep with a box in a ${g?'blue wrapper':'maroon cloth'}.`,
  4:g?'Blue wrapper and a polishing cloth by the old storeroom door.':'Maroon cloth and a polish tin by the sports store.',
  5:`${g?'Mr. Yakubu':'Mr. Okon Bassey'}: a junior boy with his shirt out borrowed the ${g?'storeroom':'sports store'} key on Tuesday.`,
  6:`${P.name.split(' ')[0]} confessed: "I was going to find it at assembly and be a hero."`}};
function startMystery(){if(S.mystery.started)return;S.mystery.started=true;notify('task',`New mystery: the ${trophyName()} is missing.`);if(S.tut===4){S.tut=10;giveBadge('first');toast('Tutorial complete! You are free to explore.','gold')}renderTaskbar();renderScene(true)}
function findClue(i){const M=S.mystery;if(!M.started||M.clues[i])return;M.clues[i]=S.t;notify('task',`Clue ${clueCount()}/6: ${CLUE_TEXT()[i]}`);if(i===2)disprove(1);if(M.party.length)toast(`Shared with your mission party (${M.party.length}).`);rep('ACA',0);renderTaskbar();renderScene(true)}
function mysteryTarget(){const M=S.mystery;if(!M.started||M.resolved||S.player.role!=='student')return null;if(M.clues[3]&&M.clues[4]&&M.clues[5])return CAST.prankster;return null}
function readNotice(){
  advance(2);const P=S.player;
  const posts=[`MISSING: ${trophyName()}. See the VP with any information.`,'Rivalry quiz: Saturday 10:00, Inter-School Ground. Volunteers wanted.',`English-only Wednesday is back. Vernacular = lines.`,'Lost and found is at the admin block.'];
  if(S.flags.fakeNotice===dayOf(S.t))posts.unshift('FREE JOLLOF FOR ALL TODAY!!! (signed: The Principal?)');
  showModal({title:'Notice board',kicker:SCHOOLS[P.school].name,body:`<div class="list">${posts.map(p=>`<div class="item"><span class="t"><b>${esc(p)}</b></span></div>`).join('')}</div>`,buttons:[{label:'Close',cls:'school',fn:()=>{closeModal();if(P.role==='student'){startMystery();progress('notice',1)}}}]});
}
function askSecurity(n){advance(3);if(!S.mystery.started){sayBubble(n,'Everything is in order at my gate.');return}if(!S.mystery.clues[2]){sayBubble(n,`No ${SCHOOLS[CAST.rival].short} student entered this week. I sign everybody.`);findClue(2);addRel(n.id,2)}else sayBubble(n,'I told you. My book does not lie.')}
function askCleaner(n){advance(3);if(!S.mystery.started)return sayBubble(n,'Mind the wet floor.');if(clueCount()<2)return sayBubble(n,'I see many things. Come back when you know more.');if(!S.mystery.clues[5]){sayBubble(n,'A junior boy with his shirt out borrowed the key from my hook on Tuesday.');findClue(5);addRel(n.id,3)}else sayBubble(n,'That boy again? Find him.')}
function searchStore(){
  const M=S.mystery;advance(5);
  if(!M.started)return toast('Locked. Nothing interesting.');
  if(tod(S.t)<960)return toast(`Locked. ${S.player.school==='GHC'?'Mr. Yakubu':'Mr. Okon Bassey'} opens it after 16:00.`,'bad');
  if(!M.clues[4]){addItem('clue_wrapper');findClue(4)}else toast('Nothing new here.');
}
function confess(){
  const n=npc(CAST.prankster);findClue(6);
  showModal({title:`You found the ${trophyName()}`,kicker:'Mystery decision',body:`<div class="dlg"><div class="por">${avatar(n.look,80)}</div><div class="say"><small>${esc(n.name)}</small>"Okay, okay! I hid it. I was going to 'find' it at assembly and be a hero. Please…"</div></div><div class="list">
  <button class="choice" data-a="${act(()=>resolveMystery('report'))}"><b>REPORT</b><small>Tell the VP.</small></button>
  <button class="choice" data-a="${act(()=>resolveMystery('warn'))}"><b>WARN</b><small>Let ${n.name.split(' ')[0]} return it himself.</small></button>
  <button class="choice" data-a="${act(()=>resolveMystery('investigate'))}"><b>INVESTIGATE</b><small>Look for more before deciding.</small></button>
  <button class="choice" data-a="${act(()=>resolveMystery('ignore'))}"><b>IGNORE</b><small>Walk away.</small></button></div>`,buttons:[],noClose:true});
}
function resolveMystery(ch,bonus){
  closeModal();const M=S.mystery,n=npc(CAST.prankster),mult=bonus?1.5:1;let lines=[];
  if(ch==='investigate'){giveBadge('detective');addItem('clue_note');showModal({title:'Operation Hero',kicker:'Investigate further',body:`<p>You check ${n.name.split(' ')[0]}'s locker and find a folded note: <b>"Operation Hero: hide cup Tues, find it at Monday assembly, become famous."</b></p><p>You now have proof. Rewards for Report or Warn go up by 50%.</p>`,buttons:[{label:'Report',cls:'school',fn:()=>resolveMystery('report',true)},{label:'Warn',fn:()=>resolveMystery('warn',true)}],noClose:true});return}
  if(ch==='report'){M.resolved='Report';money(Math.round(1000*mult),'Mystery solved');schoolPts(10,'Mystery solved');housePts(5,'Mystery');addRel(n.id,-20,true);addRel('x_vp',10,true);rep('DIS',5);S.stats.reports++;giveBadge('solver');lines=[`+${naira(1000*mult)}`,'+10 school points, +5 house points',`VP trust up · ${n.name.split(' ')[0]} −20 (he cuts grass)`,'The trophy returns at Monday assembly.']}
  if(ch==='warn'){M.resolved='Warn';money(Math.round(500*mult),'Mystery solved');schoolPts(5,'Mystery solved');addRel(n.id,20,true);rep('HEL',4);giveBadge('solver');lines=[`+${naira(500*mult)}`,'+5 school points',`${n.name.split(' ')[0]} +20 · he returns it with a funny speech`,'Loyal badge progress']}
  if(ch==='ignore'){M.resolved='Ignore';lines=['No reward.',`The cleaner finds it in 2 days. Rumour "${SCHOOLS[CAST.rival].short} stole it" keeps spreading.`,'A rivalry "Revenge Quiz" is coming.'];S.flags.revenge=true}
  renderTaskbar();renderScene(true);
  showModal({title:'Result',kicker:`You chose ${M.resolved.toUpperCase()}`,body:`<div class="list">${lines.map(l=>`<div class="item"><span class="t"><b>${esc(l)}</b></span></div>`).join('')}</div><p class="note">Shareable card: "I solved the Missing Trophy at ${S.player.school}." (Share cards are a later feature.)</p>`,buttons:[{label:'Back to school',cls:'school'}]});
}
function inviteParty(n){const M=S.mystery;if(M.party.length>=2)return toast('A mission party holds you plus 2 players.','bad');showModal({title:'Mission invite sent',body:`<p><b>${esc(n.name)}</b> got: "${esc(S.player.name)} invited you to a mystery mission. Join / Decline."</p>`,buttons:[{label:'OK',cls:'school',fn:()=>{closeModal();setTimeout(()=>{if(chance(.8)||n.human){M.party.push(n.id);addRel(n.id,10);progress('invite',1);notify('social',`${n.name} joined your mission. Clues are shared.`)}else notify('social',`${n.name} declined your mission invite.`)},600)}}]})}


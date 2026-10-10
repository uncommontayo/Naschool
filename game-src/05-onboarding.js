/* =================== ONBOARDING =================== */
const ONB_STUDENT=['account','role','school','test','year','status','look','reveal'];
const ONB_TEACHER=['account','role','school','test','subject','look','reveal'];
function steps(){return O.d.role==='teacher'?ONB_TEACHER:ONB_STUDENT}
function setSchoolVars(code){const s=SCHOOLS[code||'GHC'];const r=document.documentElement.style;r.setProperty('--school',s.primary);r.setProperty('--school2',s.secondary);r.setProperty('--schoolAcc',s.accent);r.setProperty('--rival',SCHOOLS[code==='BFA'?'GHC':'BFA'].primary)}
function renderOnb(){
  const st=steps(),key=st[O.step];setSchoolVars(O.d.school);
  const prog=`<div class="steps" aria-hidden="true">${st.map((s,i)=>`<span class="${i<=O.step?'on':''}"></span>`).join('')}</div>`;
  let body='';
  if(key==='account')body=onbAccount();
  else if(key==='role')body=onbRole();
  else if(key==='school')body=onbSchool();
  else if(key==='test')body=onbTest();
  else if(key==='year')body=onbYear();
  else if(key==='subject')body=onbSubject();
  else if(key==='status')body=onbStatus();
  else if(key==='look')body=onbLook();
  else if(key==='reveal')body=onbReveal();
  $('#onb').innerHTML=`<div class="onb-wrap"><div class="brand"><div class="brand-board"><h1>Na School</h1><p>Nigerian school life simulator · early access</p></div><p class="brand-note">Two rival schools. Real-looking people. Gist, chaos, mysteries, money and a little learning.</p></div>${prog}${body}</div>`;
  const f=$('#onb input');if(f&&key==='account')setTimeout(()=>{},0);
}
function back(){return O.step>0?`<button class="btn ghost" data-a="${act(()=>{O.step--;renderOnb()})}">Back</button>`:''}
function onbAccount(){
  const saved=load();
  const cont=saved&&saved.player?`<div class="card"><div class="spread"><div><h2>Welcome back</h2><p class="sub">Continue as <b>${esc(saved.player.name)}</b> · ${saved.player.role==='student'?`${saved.player.year} ${saved.player.cls}`:SUBJ[saved.player.subject]} · ${saved.player.school}</p></div><div class="row"><button class="btn school" data-a="${act(()=>{S=saved;resumeGame()})}">Continue</button><button class="btn ghost" data-a="${act(()=>{wipe();renderOnb()})}">Start over</button></div></div></div>`:'';
  return cont+`<form class="card" id="acctForm" novalidate><h2>Make your student</h2><p class="sub">Early access for players aged 18 and over. This is a single-player preview: your game is saved on this device only, and nothing is sent to us. Multiplayer is coming soon.</p>
  <div class="grid2"><div class="field"><label for="f-user">Username</label><input id="f-user" autocomplete="username" value="${esc(O.d.username||'')}" placeholder="e.g. tobi_lagos"></div>
  <div class="field"><label for="f-name">Display name</label><input id="f-name" value="${esc(O.d.name||'')}" placeholder="What classmates call you"></div>
  <div class="field"><label for="f-nick">Nickname (optional)</label><input id="f-nick" value="${esc(O.d.nick||'')}" placeholder="e.g. Professor"></div>
  <div class="field"><label for="f-dob">Date of birth</label><input id="f-dob" type="date" value="${esc(O.d.dob||'')}"></div></div>
  <label class="check" for="f-terms"><input id="f-terms" type="checkbox" ${O.d.terms?'checked':''}> <span>I’m 18 or over and I’ve read the <a href="/privacy.html" target="_blank" rel="noopener">privacy notice</a>.</span></label>
  <p class="err" id="f-err"></p><div class="row end"><button class="btn ghost" type="button" data-a="${act(fillDemo)}">Quick start</button><button class="btn school" type="submit">Continue</button></div></form>`;
}
function fillDemo(){$('#f-user').value='student'+Math.floor(1000+Math.random()*9000);$('#f-name').value='Tolu';$('#f-nick').value='Professor';$('#f-dob').focus()}
document.addEventListener('submit',e=>{
  if(e.target.id!=='acctForm')return;e.preventDefault();
  const u=$('#f-user').value.trim(),n=$('#f-name').value.trim(),k=$('#f-nick').value.trim(),dob=$('#f-dob').value,terms=$('#f-terms').checked;
  let err='';
  if(u.length<3)err='Username needs at least 3 characters.';
  else if(u.toLowerCase()==='admin'||u.toLowerCase()==='naschool')err='That username is taken. Try another.';
  
  else if(!n)err='Add a display name.';
  else if(!dob)err='Add your date of birth.';
  else{const b=new Date(dob),now=new Date();let age=now.getFullYear()-b.getFullYear();if(now<new Date(now.getFullYear(),b.getMonth(),b.getDate()))age--;if(age<18)err='Na School is for players aged 18 and over.'}
  if(!err&&!terms)err='Tick the box to confirm you’re 18 or over.';
  if(err){$('#f-err').textContent=err;return}
  Object.assign(O.d,{username:u,name:n,nick:k,dob,terms});O.step++;renderOnb();
});
function onbRole(){
  const c=(r,t,d)=>`<button class="pick ${O.d.role===r?'on':''}" data-a="${act(()=>{if(O.d.role!==r){O.d.answers=[];O.d.look=null}O.d.role=r;O.step++;renderOnb()})}"><h3>${t}</h3><p class="tagline">${d}</p>${r==='student'?'<p>Pick a school and year. Your class is assigned for you.</p>':'<p>Pick a school and a subject. You teach both classes in your subject.</p>'}</button>`;
  return `<div class="card"><h2>Who are you at school?</h2><p class="sub">You can play either role in either school.</p><div class="grid2">${c('student','Student','Live school life. Make friends. Compete. Investigate. Cause chaos.')}${c('teacher','Teacher','Teach classes. Run your classroom. Join staff-room life. Investigate school mysteries.')}</div><div class="row">${back()}</div></div>`;
}
function onbSchool(){
  const card=code=>{const s=SCHOOLS[code];const fig=(y,g)=>avatar(Object.assign({skin:SKINS[(hash(code+y+g))%8][1],hair:g==='M'?'lowcut':'cornrows',scale:y==='JSS3'?0.88:1},uniformFor(code,y,g)),34);
    return `<button class="pick schoolpick ${O.d.school===code?'on':''}" style="--school:${s.primary}" data-a="${act(()=>{O.d.school=code;O.step++;renderOnb()})}"><div>${logoSVG(code,58)}</div><div style="display:grid;gap:6px;min-width:0"><h3>${s.name}</h3><p class="tagline">"${s.motto}"</p><p>${code==='GHC'?'Cream two-storey blocks, royal-blue frames and louvres.':'Terracotta bungalow blocks, deep verandas, red zinc roofs.'}</p><div class="figs">${fig('JSS3','M')}${fig('JSS3','F')}${fig('SSS3','M')}${fig('SSS3','F')}</div><span class="btn school sm" style="--school:${s.primary};--school2:${s.secondary};justify-self:start">${code==='GHC'?'Join Heights':'Join Future'}</span></div></button>`};
  return `<div class="card"><h2>Pick your school</h2><p class="sub">Both schools run the same game. Only the uniform, logo and buildings differ. The rivalry is real.</p><div class="grid2">${card('GHC')}${card('BFA')}</div><div class="row">${back()}</div></div>`;
}
function onbTest(){
  const T=O.d.role==='teacher'?TEACHER_TEST:STUDENT_TEST;O.d.answers=O.d.answers||[];
  const i=Math.min(O.d.answers.length,T.length-1),qq=T[i];
  return `<div class="card"><div class="spread"><span class="qcount">Question ${i+1} of ${T.length}</span><span class="badge school">${O.d.role==='teacher'?'Teaching style':'Personality'}</span></div><h2 style="margin-top:8px">${qq[0]}</h2><p class="sub">There are no wrong answers. This sets your type and house, never your school or class.</p>
  <div class="answers">${qq[1].map((a,j)=>`<button class="answer ${O.d.answers[i]===j?'on':''}" data-a="${act(()=>{O.d.answers[i]=j;O.d.answers.length=i+1;if(i+1>=T.length){finishTest();O.step++}renderOnb()})}">${String.fromCharCode(65+j)}. ${a[0]}</button>`).join('')}</div>
  <div class="row" style="margin-top:12px">${i>0?`<button class="btn ghost" data-a="${act(()=>{O.d.answers.length=i-1;renderOnb()})}">Previous question</button>`:back()}</div></div>`;
}
function finishTest(){
  if(O.d.role==='teacher'){const sc={STR:0,FRI:0,CPT:0,OBS:0,FUN:0};O.d.answers.forEach((j,i)=>sc[TEACHER_TEST[i][1][j][1]]++);O.d.styles=sc;O.d.style=Object.entries(sc).sort((a,b)=>b[1]-a[1]||(hash(O.d.username+a[0])-hash(O.d.username+b[0])))[0][0];O.d.house='Topaz';return}
  const tr={ACA:0,SPO:0,SOC:0,FUN:0,OBS:0,COM:0,HEL:0,MIS:0};
  O.d.answers.forEach((j,i)=>{for(const[k,v]of Object.entries(STUDENT_TEST[i][1][j][1]))tr[k]+=v});
  O.d.traits=tr;
  const top=Object.entries(tr).sort((a,b)=>b[1]-a[1]||(hash(O.d.username+a[0])-hash(O.d.username+b[0])))[0][0];O.d.type=top;
  const counts={Emerald:12,Ruby:14,Topaz:11,Amethyst:13},min=Math.min(...Object.values(counts));
  const pref=Object.keys(HOUSE_TRAITS).map(h=>[h,tr[HOUSE_TRAITS[h][0]]+tr[HOUSE_TRAITS[h][1]]]).sort((a,b)=>b[1]-a[1]);
  O.d.house=(pref.find(([h])=>counts[h]<=min+3)||pref[0])[0];
}
function onbYear(){
  const c=(y,t)=>`<button class="pick ${O.d.year===y?'on':''}" data-a="${act(()=>{O.d.year=y;O.d.look=null;renderOnb()})}"><h3>${y}</h3><p class="tagline">${t}</p><p>You'll be placed in <b>${y} ${SCHOOLS[O.d.school].classes[y]}</b> at ${SCHOOLS[O.d.school].short}.</p></button>`;
  return `<div class="card"><h2>Pick your year</h2><p class="sub">Your class is assigned from school + year. There is no class picker.</p><div class="grid2">${c('JSS3','Junior. BECE year. Survive the seniors.')}${c('SSS3','Senior. WAEC year. Run the school.')}</div><div class="row" style="margin-top:12px">${back()}<button class="btn school" ${O.d.year?'':'disabled'} data-a="${act(()=>{if(O.d.year){O.step++;renderOnb()}})}">Continue</button></div></div>`;
}
function onbSubject(){
  const taken='GEO';
  return `<div class="card"><h2>Pick your subject</h2><p class="sub">You teach JSS3 ${SCHOOLS[O.d.school].classes.JSS3} and SSS3 ${SCHOOLS[O.d.school].classes.SSS3}. NPC teachers cover any subject without a human.</p><div class="grid3">${Object.entries(SUBJ).map(([k,v])=>k===taken?`<div class="pick taken"><h3 style="font-size:18px">${v}</h3><p>Already taken. Pick another subject.</p></div>`:`<button class="pick ${O.d.subject===k?'on':''}" data-a="${act(()=>{O.d.subject=k;O.step++;renderOnb()})}"><h3 style="font-size:18px">${v}</h3><p>Replaces ${TEACHERS[O.d.school][k][0]} (NPC)</p></button>`).join('')}</div><div class="row" style="margin-top:12px">${back()}</div></div>`;
}
function onbStatus(){
  const c=(s,t,d)=>`<button class="pick ${O.d.status===s?'on':''}" data-a="${act(()=>{O.d.status=s;O.step++;renderOnb()})}"><h3>${t}</h3><p>${d}</p></button>`;
  return `<div class="card"><h2>Boarding or day student?</h2><p class="sub">This sets where you sleep, your allowance and your routine.</p><div class="grid2">${c('boarding','Boarding','Live in the hostel. Wake-up bell 05:30, prep at night, inspections. Allowance every Saturday.')}${c('day','Day student','Live at home near Town Junction. Mum gives you money each morning. Leave school from 16:00.')}</div><div class="row" style="margin-top:12px">${back()}</div></div>`;
}
function defaultLook(){
  const st=O.d.role==='student';const pres=O.d.look&&O.d.look.presentation||'M';
  return{presentation:pres,skin:SKINS[3][1],face:'Oval',height:'Average',build:'Average',hair:pres==='M'?(st?'lowcut':'fade'):(st?'cornrows':'knotless'),hairColor:'#17110e',glasses:false,bag:'#2b3a67',outfit:OUTFITS[pres][0],facialHair:'Clean',freckles:false,hijab:null};
}
function hairOptions(){const st=O.d.role==='student',p=O.d.look.presentation;
  if(st)return p==='M'?[['lowcut','Low cut'],['fade','Skin fade'],['waves','Waves'],...(O.d.year==='SSS3'?[['twists','Short twists']]:[])]:[['lowcut','Low cut'],['cornrows','All-back cornrows'],['shuku','Shuku'],['ghana','Short Ghana weaving'],...(O.d.year==='SSS3'?[['puff','Afro puff']]:[]),['hijab','Hijab']];
  return p==='M'?[['bald','Bald'],['lowcut','Low cut'],['fade','Fade'],['greylow','Grey low cut']]:[['knotless','Knotless braids'],['bun','Braids in bun'],['bob','Bob wig'],['puff','Natural puff'],['relaxed','Relaxed'],['headwrap','Headwrap'],['gele','Gele'],['hijab','Hijab']]}
function lookToAvatar(L,role,code,year){
  let o={skin:L.skin,face:L.face,height:L.height,build:L.build,hair:L.hair,hairColor:L.hair==='greylow'?'#8f8a85':L.hairColor,glasses:L.glasses,freckles:L.skin==='#F1D9C6'};
  if(L.skin==='#F1D9C6')o.eyes='#5d6b72';
  if(role==='student'){Object.assign(o,uniformFor(code,year,L.presentation));o.bag=L.bag;o.scale=year==='JSS3'?0.88:1;if(L.hair==='hijab')o.hijab=SCHOOLS[code].primary}
  else{Object.assign(o,staffOutfit(L.presentation,L.outfit,code,hash(L.outfit)));o.hair=L.hair;o.facialHair=L.presentation==='M'?L.facialHair:null;o.lanyard=SCHOOLS[code].primary;o.scale=1.05;if(L.hair==='hijab')o.hijab='#5d4037';if(L.hair==='headwrap'||L.hair==='gele')o.wrap=ANKARA[hash(L.outfit)%4][0]}
  return o;
}
function onbLook(){
  if(!O.d.look)O.d.look=defaultLook();const L=O.d.look,st=O.d.role==='student';
  const chips=(key,opts)=>`<div class="chips">${opts.map(([v,l])=>`<button class="chip ${L[key]===v?'on':''}" data-a="${act(()=>{L[key]=v;renderOnb()})}">${l}</button>`).join('')}</div>`;
  const pres=st?[['M','Boy'],['F','Girl']]:[['M','Man'],['F','Woman']];
  const av=avatar(lookToAvatar(L,O.d.role,O.d.school,O.d.year),150);
  return `<div class="card"><h2>Create your character</h2><p class="sub">Realistic proportions, real Nigerian looks. Your ${st?'uniform matches your school and year':'staff clothing uses your school colours'} automatically.</p>
  <div class="creator"><div class="preview">${av}<div class="who">${esc(O.d.name)} · ${st?`${O.d.year} ${SCHOOLS[O.d.school].classes[O.d.year]}`:SUBJ[O.d.subject]}</div></div><div class="opts">
  <div class="opt"><h4>Presentation</h4><div class="chips">${pres.map(([v,l])=>`<button class="chip ${L.presentation===v?'on':''}" data-a="${act(()=>{const keepSkin=L.skin;O.d.look=defaultLook();O.d.look.presentation=v;O.d.look.skin=keepSkin;O.d.look.hair=v==='M'?(st?'lowcut':'fade'):(st?'cornrows':'knotless');O.d.look.outfit=OUTFITS[v][0];renderOnb()})}">${l}</button>`).join('')}</div></div>
  <div class="opt"><h4>Skin tone</h4><div class="chips">${SKINS.map(([n,c])=>`<button class="sw ${L.skin===c?'on':''}" style="background:${c}" title="${n}" aria-label="${n}" data-a="${act(()=>{L.skin=c;renderOnb()})}"></button>`).join('')}</div></div>
  <div class="opt"><h4>Hair</h4>${chips('hair',hairOptions())}</div>
  ${!st?`<div class="opt"><h4>Hair colour</h4>${chips('hairColor',[['#17110e','Black'],['#3b2416','Dark brown'],['#5e1a24','Burgundy']])}</div>`:''}
  ${!st&&L.presentation==='M'?`<div class="opt"><h4>Facial hair</h4>${chips('facialHair',['Clean','Stubble','Full beard','Goatee','Moustache'].map(x=>[x,x]))}</div>`:''}
  ${!st?`<div class="opt"><h4>Outfit</h4>${chips('outfit',OUTFITS[L.presentation].map(x=>[x,x]))}</div>`:''}
  <div class="opt"><h4>Face shape</h4>${chips('face',['Oval','Round','Long','Square','Heart'].map(x=>[x,x]))}</div>
  <div class="opt"><h4>Height and build</h4>${chips('height',[['Short','Short'],['Average','Average height'],['Tall','Tall']])}<div style="height:6px"></div>${chips('build',[['Slim','Slim'],['Average','Average build'],['Sturdy','Sturdy']])}</div>
  <div class="opt"><h4>Extras</h4><div class="chips"><button class="chip ${L.glasses?'on':''}" data-a="${act(()=>{L.glasses=!L.glasses;renderOnb()})}">Glasses</button>${st?['#2b3a67','#1d2230','#555b66','#7B1E2E'].map(c=>`<button class="sw ${L.bag===c?'on':''}" style="background:${c}" aria-label="Backpack colour" data-a="${act(()=>{L.bag=c;renderOnb()})}"></button>`).join(''):''}</div></div>
  </div></div><div class="row end" style="margin-top:14px">${back()}<button class="btn ghost" data-a="${act(()=>{L.skin=rnd(SKINS)[1];L.hair=rnd(hairOptions())[0];L.face=rnd(['Oval','Round','Long','Square','Heart']);L.build=rnd(['Slim','Average','Sturdy']);renderOnb()})}">Randomise</button><button class="btn school" data-a="${act(()=>{O.step++;renderOnb()})}">Looks good</button></div></div>`;
}
function onbReveal(){
  const d=O.d,s=SCHOOLS[d.school],st=d.role==='student';
  const id=st?`${d.school}/${d.year}/${CLASSCODE[s.classes[d.year]]}/${String(1000+hash(d.username)%9000).padStart(4,'0')}`:`${d.school}/STF/${d.subject}/${String(1+hash(d.username)%120).padStart(3,'0')}`;
  const av=avatar(lookToAvatar(d.look,d.role,d.school,d.year),96);
  const type=st?TYPES[d.type]:[STYLE_TITLE[d.style],'Your classroom, your rules. Mostly.'];
  return `<div class="card"><h2 style="text-align:center">${st?'Welcome to':'Welcome to the staff of'} ${s.name}</h2><p class="sub" style="text-align:center">Your placement is saved. ${st?'Your class came from your school and year; your house came from your answers.':'You teach both classes in your subject.'}</p>
  <div class="idcard"><div class="top">${logoSVG(d.school,40)}<div><b>${s.name}</b><small>${st?'STUDENT IDENTITY CARD':'STAFF IDENTITY CARD'} · "${s.motto}"</small></div></div>
  <div class="body"><div class="photo">${av}</div><dl><dt>Name</dt><dd>${esc(d.name)}${d.nick?` "${esc(d.nick)}"`:''}</dd>${st?`<dt>Year</dt><dd>${d.year}</dd><dt>Class</dt><dd>${s.classes[d.year]}</dd><dt>House</dt><dd><span class="housedot" style="background:${HOUSES[d.house]}"></span>${d.house}</dd><dt>Status</dt><dd>${d.status==='boarding'?'Boarding':'Day student'}</dd>`:`<dt>Subject</dt><dd>${SUBJ[d.subject]}</dd><dt>Role</dt><dd>Subject teacher</dd><dt>Patron</dt><dd><span class="housedot" style="background:${HOUSES[d.house]}"></span>${d.house} House</dd><dt>Classes</dt><dd>JSS3 ${s.classes.JSS3}, SSS3 ${s.classes.SSS3}</dd>`}<dt>ID</dt><dd class="mono" style="font-size:12px">${id}</dd></dl></div>
  <div class="foot"><span class="note">${st?'Your type':'Your style'}</span><br><b>${type[0]}</b><br><span>"${type[1]}"</span></div></div>
  <div class="row" style="justify-content:center;margin-top:16px"><button class="btn ghost" data-a="${act(()=>{O.step--;renderOnb()})}">Back</button><button class="btn school" data-a="${act(startGame)}">${st?'Enter school':'Enter staff quarters'}</button></div></div>`;
}

/* =================== GAME START =================== */
function startGame(){
  S=newState();buildCast();newDay(true);
  if(S.player.role==='teacher')seedTeacherTasks();
  showGame();save();
  setTimeout(()=>{if(S.player.role==='teacher')notify('task','Welcome! Open your timetable (📅) to see today\'s lessons.')},400);
}
function resumeGame(){
  buildCast();showGame();
  const away=Date.now()-(S.lastSeen||Date.now());
  if(away>30*60*1000)setTimeout(showWYWA,300);
}
function showGame(){
  $('#onb').hidden=true;$('#game').hidden=false;setSchoolVars(S.player.school);
  renderGame();
}
function renderGame(){renderHUD();renderTaskbar();renderScene(true);renderNav()}


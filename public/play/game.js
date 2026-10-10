
"use strict";
/* =========================================================
   NA SCHOOL — interactive prototype (single-player simulation
   of the shared world; NPCs + simulated players stand in for
   real multiplayer).
   ========================================================= */
const $=(s,r=document)=>r.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const chance=p=>Math.random()<p;
const naira=n=>'₦'+Math.round(n).toLocaleString('en-NG');
function hash(s){let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)}
function shade(hex,p){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=p/100;r=clamp(Math.round(r+(f<0?r:255-r)*f),0,255);g=clamp(Math.round(g+(f<0?g:255-g)*f),0,255);b=clamp(Math.round(b+(f<0?b:255-b)*f),0,255);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* action registry for click handlers */
const ACTS=new Map();let AID=0;let LAST_EL=null;
function act(fn){const id='a'+(++AID);ACTS.set(id,fn);if(ACTS.size>4000){const k=[...ACTS.keys()].slice(0,1500);k.forEach(x=>ACTS.delete(x))}return id}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-a]');
  if(el){const fn=ACTS.get(el.dataset.a);if(fn){e.stopPropagation();LAST_EL=el;fn(el,e)}return}
  if(!e.target.closest('#ctx'))closeCtx();
});

/* =================== CONFIG / CONTENT =================== */
const SCHOOLS={
  GHC:{code:'GHC',name:'Greater Heights College',short:'Heights',motto:'Rise Through Knowledge',banter:'Greater Excuses College',
    primary:'#1F4E9C',secondary:'#FFFFFF',accent:'#A7AFB8',classes:{JSS3:'Lily',SSS3:'Rose'},
    wall:'#F1E7CF',trim:'#1F4E9C',roof:'#8B939C',door:'#1F4E9C',signBg:'#1F4E9C',signInk:'#FFFFFF',signFont:"Georgia,'Times New Roman',serif",shirt:'#FFFFFF'},
  BFA:{code:'BFA',name:'Bright Future Academy',short:'Future',motto:'Light, Service, Excellence',banter:'Bright Failure Academy',
    primary:'#7B1E2E',secondary:'#F3E6C8',accent:'#E3A72F',classes:{JSS3:'Diamond',SSS3:'Pearl'},
    wall:'#B5603F',trim:'#F3E6C8',roof:'#9C3B2A',door:'#7B1E2E',signBg:'#F3E6C8',signInk:'#7B1E2E',signFont:"var(--f-display)",shirt:'#F3E6C8'}
};
const CLASSCODE={Lily:'LIL',Rose:'ROS',Diamond:'DIA',Pearl:'PRL'};
const HOUSES={Emerald:'#2E8B57',Ruby:'#C0392B',Topaz:'#E2B714',Amethyst:'#7D3C98'};
const HOUSE_TRAITS={Emerald:['HEL','ACA'],Ruby:['COM','SPO'],Topaz:['SOC','FUN'],Amethyst:['OBS','MIS']};
const ARCH_HOUSE={HEL:'Emerald',ACA:'Emerald',COM:'Ruby',SPO:'Ruby',SOC:'Topaz',FUN:'Topaz',OBS:'Amethyst',MIS:'Amethyst'};
const SKINS=[['Ebony','#3B2219'],['Deep Cocoa','#4A2C20'],['Mahogany','#5C3A28'],['Chestnut','#6E4630'],['Cocoa Brown','#80543A'],['Caramel','#946546'],['Honey','#A8775A'],['Light Brown','#C08A69'],['Fair (albinism)','#F1D9C6']];
const SUBJ={MTH:'Mathematics',ENG:'English',FIN:'Financial Literacy',BSC:'Basic Science',HIS:'History',GEO:'Geography'};
const ARCH_LABEL={ACA:'Brainy',SPO:'Sports Person',SOC:'Social Butterfly',OBS:'Quiet One',FUN:'Class Comedian',MIS:'Mischief Maker',HEL:'Class Buddy',COM:'Competitor'};
const CLASS_NPCS={
  GHC:{JSS3:[['ACA','Amaka Obi','F'],['SPO','Chinedu Eze','M'],['SOC','Zainab Bello','F'],['OBS','Ifeoma Okeke','F'],['FUN','Femi Ogunleye','M'],['MIS','Musa Abdullahi','M'],['HEL','Tobi Adeyemi','M'],['COM','Ada Nwosu','F']],
       SSS3:[['ACA','Daniel Etim','M'],['SPO','Emeka Okafor','M'],['SOC','Kemi Lawal','F'],['OBS','Halima Sani','F'],['FUN','Tunde Bakare','M'],['MIS','Aisha Yusuf','F'],['HEL','Bisola Ajayi','F'],['COM','David Akpan','M']]},
  BFA:{JSS3:[['ACA','Nneka Ibe','F'],['SPO','Kunle Alabi','M'],['SOC','Precious Udo','F'],['OBS','Fatima Garba','F'],['FUN','Seyi Adebayo','M'],['MIS','Uche Nnamdi','M'],['HEL','Blessing Effiong','F'],['COM','Ibrahim Lawan','M']],
       SSS3:[['ACA','Chioma Agu','F'],['SPO','Osas Igbinedion','M'],['SOC','Temi Oladipo','F'],['OBS','Hauwa Musa','F'],['FUN','Segun Afolabi','M'],['MIS','Malik Danjuma','M'],['HEL','Ruth Ekanem','F'],['COM','Ebuka Obi','M']]}
};
const HIJAB_NAMES=['Zainab','Fatima','Halima','Hauwa','Aisha'];
const TEACHERS={
  GHC:{MTH:['Mr. Vincent Adeleke','STR','Who is talking? Come and solve number 3.','M'],ENG:['Mr. Ade Coker','FUN','Your grammar is on strike. Let us negotiate.','M'],FIN:['Ms. Tobi Johnson','FRI','Before you buy, ask: need or want?','F'],BSC:['Mr. Ibrahim Sule','OBS','Interesting. Very interesting.','M'],HIS:['Mrs. Bisi Bello','OBS','History repeats itself. So do rumours.','F'],GEO:['Mr. Kenneth Chukwu','CPT','Ruby House will win inter-house. Write it down.','M']},
  BFA:{MTH:['Mr. Babatunde Ojo','CPT','Heights students finish this in 2 minutes. You?','M'],ENG:['Mrs. Ngozi Eze','FRI',"Read it again, slowly. You've got this.",'F'],FIN:['Mrs. Halima Abubakar','STR','Every kobo has a job. Where did yours go?','F'],BSC:['Mr. Peter Udoh','FUN','If this experiment explodes, I was never here.','M'],HIS:['Ms. Funke Alade','FRI','Every old building has a story.','F'],GEO:['Mr. Emmanuel Okon','STR','Map books out. Now.','M']}
};
const STYLE_TITLE={STR:'The Strict One',FRI:'The Friendly One',CPT:'The Competitive One',OBS:'The Observant One',FUN:'The Funny One'};
const STAFF={
  GHC:[['principal','Dr. Folake Adewale','F'],['vp','Mr. Samuel Obi','M'],['matron','Mrs. Comfort Udeh','F'],['housemaster','Mr. Ayo Badmus','M'],['nurse','Sister Joy Okon','F'],['counsellor','Mrs. Ruth Danladi','F'],['librarian','Mr. Felix Nwachukwu','M'],['security','Mallam Sule','M'],['cook','Mama Nkechi','F'],['cleaner','Mr. Yakubu','M']],
  BFA:[['principal','Mr. Olumide Ogunbiyi','M'],['vp','Mrs. Patience Edet','F'],['matron','Mrs. Esther Bassey','F'],['housemaster','Mr. Danjuma Ali','M'],['nurse','Sister Mercy Ibe','F'],['counsellor','Mr. Kayode Bello','M'],['librarian','Mrs. Rachel Okoro','F'],['security','Mallam Garba','M'],['cook','Mama Titi','F'],['cleaner','Mr. Okon Bassey','M']]
};
const ROLE_LABEL={principal:'Principal',vp:'Vice Principal',matron:"Matron, girls' hostel",housemaster:"Housemaster, boys' hostel",nurse:'Nurse',counsellor:'Counsellor',librarian:'Librarian',security:'Security',cook:'Cook',cleaner:'Cleaner and grounds'};

/* personality tests (section 6) */
const STUDENT_TEST=[
 ['Teacher asks for a volunteer to solve a question on the board.',[['Go up immediately',{ACA:2,COM:1}],['Push your friend forward and laugh',{FUN:2,MIS:1}],['Watch who goes and how they do',{OBS:2}],['Offer to help whoever goes',{HEL:2}]]],
 ['Free period, no teacher in class.',[['Read ahead for the test',{ACA:2}],['Organise quick football',{SPO:2,SOC:1}],['Start gisting with everyone',{SOC:2,FUN:1}],["Slip out to see what's happening",{MIS:2,OBS:1}]]],
 ["Your friend's snack vanished from their locker.",[['Help them search',{HEL:2}],['Ask who was near the locker',{OBS:2}],['Blame the "locker ghost"',{FUN:2}],['You know who took it, but say nothing yet',{MIS:2,OBS:1}]]],
 ['Inter-house sports is tomorrow.',[['Train tonight, I want gold',{SPO:2,COM:2}],['Make cheer songs and posters',{SOC:2,FUN:1}],['Help set up the field',{HEL:2}],["Study the other houses' runners",{OBS:2,COM:1}]]],
 ['You have ₦2,000 to last until visiting day.',[['Save most of it in my Kolo',{ACA:2}],['Buy snacks and share',{SOC:2,HEL:1}],['Resell biscuits to make ₦3,000',{COM:2,MIS:1}],['Buy only what I need',{OBS:1,HEL:1}]]],
 ['A senior is picking on a junior in the corridor.',[['Step in and tell them to stop',{HEL:2,COM:1}],['Call a prefect or teacher',{HEL:1,ACA:1}],['Crack a joke to break the tension',{FUN:2}],['Note what happened and who saw',{OBS:2}]]],
 ['Rivalry quiz against the other school. What matters most?',[['Winning, full stop',{COM:2}],['Getting the answers right',{ACA:2}],['The banter after',{SOC:2,FUN:1}],["Finding out what they're planning",{MIS:2,OBS:1}]]],
 ['What do you want to be known for?',[['Top of the class',{ACA:2}],['Best player in school',{SPO:2}],["Everybody's friend",{SOC:2}],['Knowing everything that happens',{OBS:2}]]]
];
const TEACHER_TEST=[
 ['A student walks in 10 minutes late.',[['Stand at the back','STR'],["Ask if they're okay, carry on",'FRI'],['"Answer this to earn your seat"','CPT'],['Note it, find out why later','OBS']]],
 ['You enter a noisy class.',[['Silence. Wait. Stare.','STR'],['Crack a joke to get attention','FUN'],['Announce a surprise quiz','CPT'],['Ask what everyone is excited about','FRI']]],
 ['Staff-room gist is flowing.',[["I don't do gossip",'STR'],['I listen and remember','OBS'],["I'm the one telling it",'FUN'],["I'm planning to win inter-house",'CPT']]],
 ['A student gets a hard question wrong.',[['Correct firmly','STR'],['Encourage and give a hint','FRI'],['Turn it into a class challenge','CPT'],['Make it a funny memory','FUN']]],
 ['Something goes missing in school.',[['Inspection, now','STR'],['Ask students gently','FRI'],['Watch who acts strange','OBS'],['House points for whoever finds it','CPT']]],
 ['Your teaching motto?',[['Discipline first','STR'],['Every child can learn','FRI'],['Winners are made','CPT'],['Learning should be fun','FUN']]]
];
const TYPES={ACA:['The Academic Weapon','Teachers know your name for good reasons.'],SPO:['The Sports Star','The field is your second classroom.'],SOC:['The Social Butterfly','Everybody knows you. You know everybody.'],FUN:['The Class Comedian','Even the strict teachers almost laugh.'],OBS:['The Detective','You notice what others miss. Use it well.'],COM:['The Competitor','Second place is just first loser.'],HEL:['The Helper','When something goes wrong, people call you.'],MIS:['The Mischief Maker','Trouble finds you. Sometimes you find it first.']};

/* question bank (section 11) */
const QB=[
 {y:'JSS3',s:'MTH',q:'Simplify 3/4 + 2/3',o:['5/7','17/12','5/12','6/7'],a:1,e:'9/12 + 8/12 = 17/12.'},
 {y:'JSS3',s:'MTH',q:'What is 15% of 200?',o:['20','25','30','35'],a:2,e:'15/100 × 200 = 30.'},
 {y:'JSS3',s:'ENG',q:'Neither the teacher nor the students ___ in class.',o:['is','are','was','be'],a:1,e:'The verb agrees with the nearer subject, "students".'},
 {y:'JSS3',s:'ENG',q:'Choose the correct spelling.',o:['Recieve','Receive','Receeve','Riceive'],a:1,e:'"i before e, except after c": receive.'},
 {y:'JSS3',s:'FIN',q:'Which of these is a need?',o:['Video game','Designer shoes','School textbook','Ice cream'],a:2,e:'Needs are required for school or survival; the rest are wants.'},
 {y:'JSS3',s:'FIN',q:'You earn ₦1,000 and spend ₦650. How much is left?',o:['₦250','₦350','₦450','₦1,650'],a:1,e:'1,000 − 650 = 350.'},
 {y:'JSS3',s:'BSC',q:'How do green plants make their food?',o:['Respiration','Photosynthesis','Digestion','Excretion'],a:1,e:'Plants use sunlight, water and carbon dioxide to make food.'},
 {y:'JSS3',s:'BSC',q:'Which organ pumps blood around the body?',o:['Lungs','Liver','Heart','Kidney'],a:2,e:'The heart pumps blood through the arteries and veins.'},
 {y:'JSS3',s:'HIS',q:'When did Nigeria gain independence?',o:['1 Oct 1960','1 Oct 1963','12 Jun 1993','29 May 1999'],a:0,e:'Nigeria became independent from Britain on 1 October 1960.'},
 {y:'JSS3',s:'HIS',q:"Who was Nigeria's first Prime Minister?",o:['Tafawa Balewa','Nnamdi Azikiwe','Obafemi Awolowo','Ahmadu Bello'],a:0,e:'Sir Abubakar Tafawa Balewa led the government at independence.'},
 {y:'JSS3',s:'GEO',q:'The longest river in Nigeria is',o:['River Benue','River Niger','Ogun River','Cross River'],a:1,e:'The Niger enters from the north-west and flows to the Atlantic.'},
 {y:'JSS3',s:'GEO',q:'What is the capital of Nigeria?',o:['Lagos','Abuja','Kano','Ibadan'],a:1,e:'Abuja became the capital in 1991.'},
 {y:'SSS3',s:'MTH',q:'Find the roots of x² − 5x + 6 = 0',o:['1 and 6','2 and 3','−2 and −3','3 and 5'],a:1,e:'(x − 2)(x − 3) = 0.'},
 {y:'SSS3',s:'MTH',q:'Evaluate log₁₀ 1000',o:['2','3','10','100'],a:1,e:'10³ = 1000.'},
 {y:'SSS3',s:'ENG',q:'Nearest in meaning to "candid":',o:['frank','secretive','angry','proud'],a:0,e:'Candid means open and honest.'},
 {y:'SSS3',s:'ENG',q:'Opposite of "scarce":',o:['rare','plentiful','costly','small'],a:1,e:'Scarce means in short supply; plentiful is the opposite.'},
 {y:'SSS3',s:'FIN',q:'₦10,000 at 10% simple interest per year. Interest after 2 years?',o:['₦1,000','₦2,000','₦2,100','₦12,000'],a:1,e:'Simple interest = 10,000 × 10% × 2.'},
 {y:'SSS3',s:'FIN',q:'Bought for ₦800, sold for ₦1,000. Profit percentage?',o:['20%','25%','80%','200%'],a:1,e:'Profit 200 ÷ cost 800 = 25%.'},
 {y:'SSS3',s:'BSC',q:'The pH of pure water at 25°C is',o:['0','5','7','14'],a:2,e:'Pure water is neutral.'},
 {y:'SSS3',s:'BSC',q:'The chemical symbol for sodium is',o:['So','Sd','Na','S'],a:2,e:'Na comes from the Latin "natrium".'},
 {y:'SSS3',s:'HIS',q:"Who was Nigeria's first Executive President (1979)?",o:['Shehu Shagari','Nnamdi Azikiwe','Yakubu Gowon','Olusegun Obasanjo'],a:0,e:'The 1979 constitution created an executive presidency.'},
 {y:'SSS3',s:'HIS',q:'Nigeria became a republic in which year?',o:['1960','1963','1966','1979'],a:1,e:'Nigeria became a republic on 1 October 1963.'},
 {y:'SSS3',s:'GEO',q:'The harmattan wind blows into Nigeria from the',o:['North-east','South-west','South-east','West'],a:0,e:'It is a dry, dusty wind from the Sahara.'},
 {y:'SSS3',s:'GEO',q:'Which vegetation belt covers most of northern Nigeria?',o:['Rainforest','Mangrove','Savanna','Montane'],a:2,e:'Guinea, Sudan and Sahel savanna cover the north.'}
];

/* timetable: JSS3 runs the list; SSS3 runs it shifted by one period, so a subject never clashes */
const TT={MWF:['MTH','ENG','BSC','FIN','GEO'],TTH:['ENG','BSC','MTH','HIS','FIN']};
const PERIODS=[480,530,580,660,710];
const ROOM={JSS3:'Block A, Room 1',SSS3:'Block B, Room 2'};

/* shop (section 16) */
const ITEMS={
 jollof:{n:'Jollof rice and chicken',c:'Food',p:700,food:1},beans:{n:'Beans and dodo',c:'Food',p:400,food:1},bread:{n:'Bread and egg',c:'Food',p:300,food:1},
 pie:{n:'Meat pie',c:'Food',p:250,food:1},noodles:{n:'Indomie (pack)',c:'Food',p:250},puff:{n:'Puff-puff (5)',c:'Food',p:100,food:1},
 biscuit:{n:'Biscuit pack',c:'Food',p:100,food:1},choc:{n:'Chocolate bar',c:'Food',p:300,food:1},
 sachet:{n:'Pure water sachet',c:'Drinks',p:30},bottle:{n:'Bottled water',c:'Drinks',p:150},malt:{n:'Malt',c:'Drinks',p:350},zobo:{n:'Zobo',c:'Drinks',p:150},
 exbook:{n:'Exercise book',c:'Stationery',p:200},biro:{n:'Biro',c:'Stationery',p:100},mathset:{n:'Mathematical set',c:'Stationery',p:800},
 torch:{n:'Torchlight',c:'School items',p:600},padlock:{n:'Padlock',c:'School items',p:500},
 watch:{n:'Wristwatch',c:'Cosmetics',p:1500},bagcol:{n:'New backpack colour',c:'Cosmetics',p:1200},frame:{n:'Glasses frame',c:'Cosmetics',p:1000},
 answers:{n:'"Test answers" (folded paper)',c:'Mystery items',p:0,locked:0},
 clue_wrapper:{n:'Wrapper + polishing cloth',c:'Mystery items',p:0,locked:1},clue_key:{n:"Cleaner's note about the key",c:'Mystery items',p:0,locked:1},clue_note:{n:'Note: "Operation Hero"',c:'Mystery items',p:0,locked:1}
};
const VENDORS={
 cafeteria:{n:'Serving window',items:['jollof','beans','bread','sachet','bottle','zobo']},
 tuck:{n:'Tuck shop',items:['pie','puff','biscuit','choc','noodles','malt','sachet','exbook','biro','mathset','torch','padlock','watch','bagcol','frame']},
 mamaput:{n:"Iya Rafiu's buka (Mama Put)",items:['jollof','beans','bread','zobo'],disc:{jollof:500}},
 kiosk:{n:"Mallam Shehu's kiosk",items:['biscuit','choc','malt','bottle','sachet','exbook','biro','noodles']}
};

/* conversation (section 10) */
const PROMPTS={
 gen:[['day',"How far? How's your day?"],['next','What class do you have next?'],['house','Which house are you in?']],
 fri:[['lunch','Want to sit together at lunch?'],['read',"Let's read together for the test."],['field','Come and hang out at the field.']],
 gos:[['latest','Have you heard the latest?'],['assembly','Do you know what happened at assembly?'],['who','Who was involved?']],
 task:[['help','I need your help with something.'],['seen','Have you seen this?'],['come','Can you come with me?']],
 mis:[['idea','I have an idea…'],['saw','Did you see what just happened?'],['inv','Should we investigate?']]
};
const CAT_LABEL={gen:'General',fri:'Friendship',gos:'Gossip',task:'Task',mis:'Mischief'};
const TRAIT_CAT={ACA:'task',SPO:'fri',SOC:'gos',FUN:'mis',OBS:'gos',COM:'gen',HEL:'task',MIS:'mis'};
const REPLIES={
 day:{ACA:['Busy. Two assignments, one test.',2],SOC:["Fantastic! Everybody's talking about the trophy.",3],OBS:["It's fine.",1],MIS:["Boring. Let's change that.",2],COM:['I got 9/10 this morning. You?',1],SPO:['Legs are tired. Coach is wicked.',2],FUN:['{cook} gave me extra meat. Best day of my life.',3],HEL:['Good! Need anything?',3]},
 next:{ACA:['{next}. I already read ahead.',2],SOC:['{next}, I think. Sit with me?',3],OBS:['{next}.',1],MIS:['{next}… if I go.',1],COM:['{next}. I will finish first.',1],SPO:['{next}, then football.',2],FUN:['{next}. Pray the teacher is in a good mood.',2],HEL:["{next}. I'll show you the room.",3]},
 house:{ACA:['{house}. Steady and clever.',2],SOC:['{house}! Best vibes in school.',3],OBS:['{house}.',1],MIS:['{house}. We do things quietly.',2],COM:['{house}. We are winning this term.',1],SPO:['{house}. Watch us on sports day.',2],FUN:['{house}. Our cheer songs are elite.',3],HEL:['{house}. Come to our house meeting!',3]},
 lunch:{ACA:['If we can revise while eating.',3],SOC:['Yes! I will bring everybody.',5],OBS:['Okay. Corner table.',4],MIS:['Only if you are buying.',2],COM:['Sure. I will eat faster than you.',2],SPO:['After training. Save me a seat.',3],FUN:['Lunch is my favourite subject.',4],HEL:['Of course. I will save you a seat.',5]},
 read:{ACA:['Yes! 4 pm, library.',8],SOC:["Only if there's gist.",3],OBS:['Okay.',5],MIS:['Read? Me?',-2],COM:["Fine, but I'll still beat you.",3],SPO:['After training, maybe.',2],FUN:['I will bring snacks. Reading is optional.',3],HEL:['Of course. Which subject?',6]},
 field:{ACA:['Maybe after prep.',1],SOC:['Only if everyone is going.',3],OBS:['I will watch.',2],MIS:['The field has secrets.',2],COM:['Penalty shoot-out. Loser buys zobo.',3],SPO:['Now you are talking!',6],FUN:['I will commentate.',3],HEL:['Sure, I will come.',3]},
 latest:{ACA:["Unless it's about the test, no.",0],SOC:['Which one? Sit down, let me tell you.',3,'rumour'],MIS:['Heard it? I started it.',1,'ghost'],COM:["If it's about the trophy, I know more than you. {rival} took it. Who else?",1,'herring'],SPO:['Only gist I know is the football fixtures.',1],FUN:["The latest is {mth}'s new shoes. They squeak like a goat.",2],HEL:['Have you seen the notice board? Something big is missing.',2,'notice']},
 assembly:{ACA:['The principal announced the rivalry quiz.',2],SOC:['The principal was SO angry about the trophy.',3,'notice'],OBS:['Someone left early.',2],MIS:['Assembly? I was… around.',1],COM:['They read my test score. You heard?',1],SPO:['Sports day dates are out.',2],FUN:['A goat walked past the principal. Best assembly ever.',3],HEL:['They said the trophy is missing. Check the notice board.',2,'notice']},
 who:{ACA:['Ask someone who gossips. Not me.',0],SOC:['Everybody is involved, if you ask me.',2,'rumour'],OBS:['…Some people walk around after prep.',2],MIS:['Who? Nobody. Next question.',1],COM:['Someone from the other school, obviously.',1,'herring'],SPO:['No idea, I was training.',1],FUN:['The locker ghost. Case closed.',2],HEL:['Not sure. Security at the gate sees everybody.',2]},
 help:{ACA:['With what subject?',3],SOC:['Say no more. Who do we need?',5],OBS:['…What kind of help?',2],MIS:['Help costs ₦200.',0],COM:['What do I get?',0],SPO:["If it's heavy, I'm your guy.",3],FUN:["Help? I'm the help. Tell me.",3],HEL:["Anything. What's up?",5]},
 seen:{ACA:['Is it in the textbook? Then no.',1],SOC:['Show me! Ooh, who else knows?',3],OBS:['…Maybe near the library.',3],MIS:['Never seen it. Never.',0],COM:['Why would I look at your things?',0],SPO:['Nope.',1],FUN:['Is it edible?',2],HEL:['No, but I will keep an eye out.',3]},
 come:{ACA:['After I finish this page.',2],SOC:['Where? I am coming!',4],OBS:['Okay.',3],MIS:['Finally, an adventure.',3],COM:['Only if it is worth my time.',1],SPO:['Lead the way.',3],FUN:['If we get caught, I do not know you.',3],HEL:['Sure.',4]},
 idea:{ACA:['Is it a study idea?',0],SOC:['Tell me everything.',3],OBS:['…Go on.',2],MIS:['I like you already.',4],COM:['Will it make us win?',2],SPO:['Does it involve a ball?',2],FUN:['If it is funny, count me in.',4],HEL:['As long as nobody gets hurt.',2]},
 saw:{ACA:['I was reading.',0],SOC:['I saw EVERYTHING.',3,'rumour'],OBS:['I always see.',3],MIS:['Saw what? Nothing happened.',2],COM:['I saw myself winning.',1],SPO:['I saw the ball go in.',2],FUN:['I saw Mr. Vincent smile. Joking.',3],HEL:['No, what happened? Is someone hurt?',2]},
 inv:{ACA:['After the test.',1],SOC:['Yes! Who are we investigating?',4],OBS:['Start where nobody looks.',3],MIS:['Investigate what? …Fine.',2],COM:['Only if I get the credit.',1],SPO:['If it is after training.',2],FUN:['Detective Femi reporting.',3],HEL:['Sure. Be careful.',3]}
};
const AMBIENT=['Who has a biro?','Mtchew.','How far?','No wahala.','Abeg, wait for me!','Has anyone seen the trophy?','The quiz is on Saturday.','I have not read anything.','{cook} added extra pepper today.','Ehn?!','Heights No. 1!','Future Forever!','Prep is too long.','Which period is next?'];

/* rumours (section 14) */
const RUMOURS=[
 {id:1,t:'The other school stole our trophy.',truth:'False'},
 {id:2,t:"There's a ghost in the old storeroom.",truth:'False'},
 {id:3,t:'Surprise test tomorrow in Maths.',truth:'True 50%'},
 {id:4,t:'Principal is visiting the hostels tonight.',truth:'True'},
 {id:5,t:'Tuck shop prices are going up.',truth:'True'},
 {id:6,t:'Someone has the class test answers.',truth:'False'},
 {id:7,t:'{cook} gives Ruby House extra meat.',truth:'False'},
 {id:8,t:'{mth} has never smiled.',truth:'Partial'},
 {id:9,t:'The other school has a secret quiz coach.',truth:'Partial'},
 {id:10,t:'{pairA} and {pairB} keep disappearing from the staff room together.',truth:'Partial'}
];
const BADGES=[
 ['first','First Day','Finish onboarding and the tutorial'],['top','Top of Class','Best class test score in your class'],['quiz','Quiz Champion','Win 5 quiz challenges'],['sports','Sports Star','Win 5 football challenges'],
 ['solver','Mystery Solver','Resolve the trophy mystery (Report or Warn)'],['detective','Detective','Investigate further in the mystery'],['friend','Good Friend','3 wellbeing choices that helped'],['kolo','Kolo Saver','Deposit 3 game days in a row'],
 ['scam','Scam Spotter','Report the fake-answers scam'],['brave','Brave','Stand up to a bully'],['hero','Rivalry Hero','50 school points in one week'],['house','House Champion','Be in the weekly winning house'],
 ['chaos','Chaos Legend','10 successful chaos actions'],['choir','Staff Choir','(Teacher) Join the surprise rehearsal']
];

/* =================== STATE =================== */
const SAVE_KEY='naschool-proto-v1';
let S=null;            // game state
let O={step:0,d:{}};   // onboarding state
let CAST=null;         // derived people
let SPEED=0.2;         // game minutes per real second: 1 game day = 120 real minutes (MVP spec)
let LAST_SIG='';
let paused=false;

function load(){try{const r=localStorage.getItem(SAVE_KEY);return r?JSON.parse(r):null}catch(e){return null}}
function save(){if(!S)return;S.lastSeen=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function wipe(){try{localStorage.removeItem(SAVE_KEY)}catch(e){}}

/* =================== AVATARS =================== */
let UID=0;
function avatar(o,w=48){
  const id='av'+(++UID);
  const sk=o.skin||'#6E4630',dark=shade(sk,-22),hc=o.hairColor||'#17110e';
  const bx=o.build==='Slim'?0.92:o.build==='Sturdy'?1.1:1;
  const hy=o.height==='Short'?0.96:o.height==='Tall'?1.03:1;
  const sc=(o.scale||1)*hy;
  let defs='';
  if(o.pattern){const p=o.pattern;defs+=`<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${p[0]}"/><circle cx="4.5" cy="4.5" r="2.6" fill="${p[1]}"/><circle cx="0" cy="0" r="1.7" fill="${p[2]}"/><circle cx="9" cy="9" r="1.7" fill="${p[2]}"/></pattern>`}
  if(o.check){defs+=`<pattern id="${id}c" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${o.bottom}"/><rect width="4" height="8" fill="rgba(243,230,200,.28)"/><rect width="8" height="4" fill="rgba(243,230,200,.22)"/></pattern>`}
  const tf=o.patternTop?`url(#${id})`:(o.top||'#fff');
  const bf=o.check?`url(#${id}c)`:o.patternBottom?`url(#${id})`:(o.bottom||'#2a2f3a');
  const fx={Oval:[9.3,11.4],Round:[10.2,10.6],Long:[8.8,12.2],Square:[9.9,11],Heart:[9.6,11.2]}[o.face||'Oval'];
  const hs=o.hair||'lowcut';
  let g='';
  if(hs==='puff')g+=`<circle cx="30" cy="8.5" r="9.5" fill="${hc}"/>`;
  if(hs==='braids'||hs==='relaxed'||hs==='knotless')g+=`<path d="M19 14 Q16.5 40 20 ${hs==='relaxed'?44:54} L40 ${hs==='relaxed'?44:54} Q43.5 40 41 14 Z" fill="${hc}"/>`;
  if(o.bag)g+=`<rect x="12.5" y="42" width="35" height="34" rx="6" fill="${o.bag}"/>`;
  const bt=o.bottomType||'trousers';
  const sock=o.socks?`<rect x="19.5" y="131" width="8.5" height="13" fill="#fff"/><rect x="32" y="131" width="8.5" height="13" fill="#fff"/>`:'';
  if(bt==='trousers')g+=`<rect x="17.5" y="80" width="11.5" height="65" rx="2" fill="${bf}"/><rect x="31" y="80" width="11.5" height="65" rx="2" fill="${bf}"/>`;
  else if(bt==='shorts')g+=`<rect x="19.5" y="100" width="8.5" height="44" fill="${sk}"/><rect x="32" y="100" width="8.5" height="44" fill="${sk}"/>${sock}<path d="M16.5 79 H43.5 L44.5 106 H31.5 L30 93 L28.5 106 H15.5 Z" fill="${bf}"/>`;
  else if(bt==='skirt')g+=`<rect x="20" y="112" width="8" height="33" fill="${sk}"/><rect x="32" y="112" width="8" height="33" fill="${sk}"/>${sock}<path d="M16.5 78 H43.5 L47 ${o.long?140:124} H13 Z" fill="${bf}"/>`;
  else g+=`<rect x="20" y="112" width="8" height="33" fill="${sk}"/><rect x="32" y="112" width="8" height="33" fill="${sk}"/>${sock}`;
  const shoe=o.shoes||'#141414';
  g+=`<ellipse cx="23.5" cy="146.5" rx="6.8" ry="3.2" fill="${shoe}"/><ellipse cx="36.5" cy="146.5" rx="6.8" ry="3.2" fill="${shoe}"/>`;
  const arm=x=>o.sleeves==='short'?`<rect x="${x}" y="39" width="7.5" height="15" rx="3" fill="${tf}"/><rect x="${x+.8}" y="52" width="6" height="27" rx="3" fill="${sk}"/><circle cx="${x+3.8}" cy="81" r="3.6" fill="${sk}"/>`:`<rect x="${x}" y="39" width="7.5" height="40" rx="3.5" fill="${tf}"/><circle cx="${x+3.8}" cy="81" r="3.6" fill="${sk}"/>`;
  g+=arm(8.5)+arm(44);
  if(bt==='gown')g+=`<path d="M15.5 40 Q30 34 44.5 40 L48 ${o.long?142:116} H12 Z" fill="${tf}"/>`;
  else g+=`<path d="M15.5 40 Q30 34 44.5 40 L44 82 L16 82 Z" fill="${tf}"/>`;
  if(bt==='pinafore')g+=`<path d="M19 41 H41 L48 116 H12 Z" fill="${bf}"/><rect x="21.5" y="37" width="3" height="7" fill="${bf}"/><rect x="35.5" y="37" width="3" height="7" fill="${bf}"/>`;
  if(o.apron)g+=`<path d="M20 50 H40 L41 106 H19 Z" fill="${o.apron}"/>`;
  if(o.collar)g+=`<path d="M25 36 L30 42 L35 36 L33 35 L30 39 L27 35 Z" fill="${o.collar}"/>`;
  if(o.tie)g+=`<path d="M28.6 39 H31.4 L32.6 60 L30 64 L27.4 60 Z" fill="${o.tie}"/>${o.tieStripe?`<path d="M28 47 L32.3 44 M28.2 53 L32.6 50" stroke="${o.tieStripe}" stroke-width="1.2"/>`:''}`;
  if(o.lanyard)g+=`<path d="M25 37 L30 58 L35 37" stroke="${o.lanyard}" stroke-width="1.4" fill="none"/><rect x="27.5" y="57" width="5" height="7" rx="1" fill="#fff"/>`;
  if(o.badge)g+=`<circle cx="37" cy="48" r="2.6" fill="${o.badge}" stroke="#fff" stroke-width=".6"/>`;
  if(o.bag)g+=`<path d="M19 40 L21 72 M41 40 L39 72" stroke="${shade(o.bag,-30)}" stroke-width="2.4"/>`;
  g+=`<rect x="26.5" y="29" width="7" height="9" fill="${dark}"/>`;
  if(hs==='hijab')g+=`<path d="M17 20 Q17 6 30 6 Q43 6 43 20 L46 45 Q30 51 14 45 Z" fill="${o.hijab||hc}"/>`;
  g+=`<ellipse cx="20.6" cy="22" rx="1.8" ry="2.6" fill="${sk}"/><ellipse cx="39.4" cy="22" rx="1.8" ry="2.6" fill="${sk}"/>`;
  g+=`<ellipse cx="30" cy="21" rx="${fx[0]}" ry="${fx[1]}" fill="${sk}"/>`;
  g+=`<ellipse cx="26.4" cy="21.6" rx="1.25" ry="1.4" fill="${o.eyes||'#120c0a'}"/><ellipse cx="33.6" cy="21.6" rx="1.25" ry="1.4" fill="${o.eyes||'#120c0a'}"/>`;
  g+=`<path d="M24.6 18.6 Q26.4 17.7 28.1 18.4 M31.9 18.4 Q33.6 17.7 35.4 18.6" stroke="#120c0a" stroke-width="0.9" fill="none" stroke-linecap="round"/>`;
  g+=`<path d="M30 23 Q28.4 26.2 30.4 26.4" stroke="${dark}" stroke-width="0.9" fill="none"/>`;
  g+=`<path d="M27.6 28.4 Q30 29.9 32.4 28.4" stroke="#4a221b" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  if(o.freckles)g+=`<g fill="#c98a6a"><circle cx="25" cy="24.5" r=".5"/><circle cx="26.6" cy="25.2" r=".5"/><circle cx="35" cy="24.5" r=".5"/><circle cx="33.4" cy="25.2" r=".5"/></g>`;
  const fh=o.facialHair;
  if(fh==='Full beard')g+=`<path d="M21.3 22 Q21.8 33.6 30 34 Q38.2 33.6 38.7 22 Q37 30.5 30 31 Q23 30.5 21.3 22 Z" fill="${hc}"/>`;
  if(fh==='Stubble')g+=`<path d="M21.5 23 Q22 33 30 33.4 Q38 33 38.5 23 Q37 30.5 30 31 Q23 30.5 21.5 23 Z" fill="${hc}" opacity=".35"/>`;
  if(fh==='Goatee')g+=`<ellipse cx="30" cy="31.5" rx="2.6" ry="2" fill="${hc}"/>`;
  if(fh==='Moustache'||fh==='Goatee')g+=`<path d="M27 27.2 Q30 25.8 33 27.2" stroke="${hc}" stroke-width="1.4" fill="none"/>`;
  g+=hairFront(hs,hc,o);
  if(o.glasses)g+=`<g stroke="#1d1d1d" stroke-width="0.8" fill="none"><circle cx="26.4" cy="21.7" r="2.9"/><circle cx="33.6" cy="21.7" r="2.9"/><path d="M29.3 21.5 H30.7"/></g>`;
  const W=w*sc,H=W*160/60;
  return `<svg viewBox="0 0 60 160" width="${W.toFixed(1)}" height="${H.toFixed(1)}" aria-hidden="true">${defs?`<defs>${defs}</defs>`:''}<g transform="translate(30 0) scale(${bx} 1) translate(-30 0)">${g}</g></svg>`;
}
function hairFront(hs,hc,o){
  const cap=`<path d="M20.6 18 Q21 9.2 30 9.4 Q39 9.2 39.4 18 Q37.5 13.4 30 13.2 Q22.5 13.4 20.6 18 Z" fill="${hc}"/>`;
  const thin=`<path d="M21 17 Q21.6 10.4 30 10.6 Q38.4 10.4 39 17 Q37.2 13.8 30 13.7 Q22.8 13.8 21 17 Z" fill="${hc}"/>`;
  switch(hs){
    case 'lowcut':return cap;
    case 'greylow':return cap;
    case 'fade':return thin;
    case 'waves':return cap+`<path d="M23 13.5 q2 -1.5 4 0 q2 1.5 4 0 q2 -1.5 4 0" stroke="${shade(hc,30)}" stroke-width=".6" fill="none"/>`;
    case 'twists':return cap+[22.5,26,30,34,37.5].map(x=>`<circle cx="${x}" cy="10.8" r="2.1" fill="${hc}"/>`).join('');
    case 'cornrows':return `<path d="M20.2 19 Q20.6 8.4 30 8.6 Q39.4 8.4 39.8 19 Q37.5 12.8 30 12.6 Q22.5 12.8 20.2 19 Z" fill="${hc}"/><path d="M24 11 L23 17 M27 10 L26.5 14 M30 9.6 L30 13 M33 10 L33.5 14 M36 11 L37 17" stroke="${shade(hc,35)}" stroke-width=".5"/>`;
    case 'shuku':return cap+`<circle cx="30" cy="6.3" r="4.8" fill="${hc}"/>`;
    case 'ghana':return `<path d="M20.2 19 Q20.6 8.4 30 8.6 Q39.4 8.4 39.8 19 Q37.5 12.8 30 12.6 Q22.5 12.8 20.2 19 Z" fill="${hc}"/><path d="M22 18 L28 9.5 M25 18 L30 9.4 M38 18 L32 9.5 M35 18 L30.5 9.5" stroke="${shade(hc,35)}" stroke-width=".55"/>`;
    case 'puff':return thin;
    case 'braids':case 'knotless':return cap+`<path d="M23 12 L21 17 M27 10.4 L26 14 M33 10.4 L34 14 M37 12 L39 17" stroke="${shade(hc,35)}" stroke-width=".5"/>`;
    case 'bun':return cap+`<circle cx="30" cy="7" r="5.5" fill="${hc}"/>`;
    case 'bob':return `<path d="M19.8 28 Q18 8 30 8.4 Q42 8 40.2 28 L37.6 28 Q38.3 15.2 30 14 Q21.7 15.2 22.4 28 Z" fill="${hc}"/>`;
    case 'relaxed':return `<path d="M19.4 34 Q17 8 30 8.4 Q43 8 40.6 34 L38 34 Q38.6 15 30 14 Q21.4 15 22 34 Z" fill="${hc}"/>`;
    case 'headwrap':{const c=o.wrap||'#c0392b';return `<path d="M19 19 Q16.6 4 30 4.4 Q43.4 4 41 19 Q36 12.4 30 12.8 Q24 12.4 19 19 Z" fill="${c}"/><circle cx="38" cy="7" r="3.2" fill="${shade(c,-20)}"/>`}
    case 'gele':{const c=o.wrap||'#d4ac0d';return `<path d="M17 19 Q12 -2 30 1 Q48 -2 43 19 Q36 11.8 30 12.4 Q24 11.8 17 19 Z" fill="${c}"/><path d="M20 10 Q30 2 40 10" stroke="${shade(c,-25)}" stroke-width="1" fill="none"/>`}
    case 'hijab':{const c=o.hijab||hc;return `<path d="M19.4 22 Q19 6.6 30 6.6 Q41 6.6 40.6 22 Q39.4 12.4 30 11.8 Q20.6 12.4 19.4 22 Z" fill="${c}"/>`}
    case 'bald':return `<ellipse cx="26" cy="13" rx="4" ry="1.8" fill="#fff" opacity=".18"/>`;
    default:return cap;
  }
}
function uniformFor(code,year,gender){
  const s=SCHOOLS[code],u={top:s.shirt,bottom:s.primary,badge:code==='GHC'?s.accent:s.accent,shoes:'#1a1a1a'};
  if(year==='JSS3'){u.sleeves='short';u.socks=true;if(gender==='M')u.bottomType='shorts';else{u.bottomType='pinafore';if(code==='BFA')u.check=true}}
  else{u.sleeves='long';u.tie=s.primary;u.tieStripe=code==='GHC'?s.accent:s.accent;u.collar=s.shirt;u.bottomType=gender==='M'?'trousers':'skirt'}
  return u;
}
const OUTFITS={M:['Shirt and tie','Ankara shirt','Senator kaftan'],F:['Blouse and skirt','Ankara gown','Iro and buba','Trouser suit']};
const ANKARA=[['#c0392b','#f1c40f','#1f6f8b'],['#1f6f8b','#f39c12','#ffffff'],['#6c3483','#f4d03f','#27ae60'],['#117a65','#f5b041','#922b21']];
function staffOutfit(gender,outfit,code,seed){
  const s=SCHOOLS[code||'GHC'],pat=ANKARA[seed%ANKARA.length];
  if(gender==='M'){
    if(outfit==='Ankara shirt')return{top:'#fff',pattern:pat,patternTop:1,bottom:'#2b2f38',bottomType:'trousers'};
    if(outfit==='Senator kaftan')return{top:['#2c4a3e','#3a3f5c','#5d4037'][seed%3],bottom:['#2c4a3e','#3a3f5c','#5d4037'][seed%3],bottomType:'trousers'};
    return{top:'#d9e6f5',collar:'#d9e6f5',tie:s.primary,bottom:'#2b2f38',bottomType:'trousers'};
  }
  if(outfit==='Ankara gown')return{top:'#fff',pattern:pat,patternTop:1,bottomType:'gown',long:1,shoes:'#5d4037'};
  if(outfit==='Iro and buba')return{top:'#fff',pattern:pat,patternTop:1,patternBottom:1,bottomType:'skirt',long:1,shoes:'#5d4037'};
  if(outfit==='Trouser suit')return{top:'#3a3f5c',bottom:'#3a3f5c',bottomType:'trousers'};
  return{top:'#f4d6dc',bottom:'#2b2f38',bottomType:'skirt'};
}
function roleOutfit(role,gender,code,seed){
  switch(role){
    case 'matron':return{top:'#f4f4f4',bottomType:'gown',hair:'headwrap',wrap:'#f4f4f4'};
    case 'nurse':return{top:'#ffffff',bottomType:'gown',hair:'headwrap',wrap:'#ffffff'};
    case 'security':return{top:'#1f2a44',bottom:'#1f2a44',bottomType:'trousers',hair:'lowcut'};
    case 'cook':return{top:'#e67e22',apron:'#ffffff',bottomType:'gown',hair:'headwrap',wrap:'#ffffff'};
    case 'cleaner':return{top:'#2f7d4a',bottom:'#2f7d4a',bottomType:'trousers'};
    case 'principal':return gender==='M'?{top:'#1c2233',bottom:'#1c2233',bottomType:'trousers',collar:'#fff',tie:'#e3a72f'}:{top:'#5b2a6e',bottomType:'gown',long:1,hair:'gele',wrap:'#e3a72f'};
    case 'mum':return{top:'#fff',pattern:ANKARA[seed%4],patternTop:1,bottomType:'gown',long:1,hair:'headwrap',wrap:ANKARA[(seed+1)%4][0]};
    default:return staffOutfit(gender,OUTFITS[gender][seed%OUTFITS[gender].length],code,seed);
  }
}
function npcLook(n){
  const h=hash(n.name);
  const look={skin:SKINS[h%8][1],face:['Oval','Round','Long','Square','Heart'][h%5],build:['Slim','Average','Average','Sturdy'][h%4]};
  if(n.kind==='student'){
    Object.assign(look,uniformFor(n.school,n.year,n.g));
    const first=n.name.split(' ')[0];
    if(n.g==='M')look.hair=rnd2(['lowcut','fade','waves',...(n.year==='SSS3'?['twists']:[])],h);
    else look.hair=HIJAB_NAMES.includes(first)?'hijab':rnd2(['lowcut','cornrows','shuku','ghana',...(n.year==='SSS3'?['puff']:[])],h);
    if(look.hair==='hijab')look.hijab=SCHOOLS[n.school].primary;
    if(n.arch==='ACA')look.glasses=true;
    look.bag=rnd2(['#1d2230','#2b3a67','#555b66','#7B1E2E'],h>>3);
    look.scale=n.year==='JSS3'?0.88:1;
  } else {
    look.scale=1.05;
    if(n.g==='M')look.hair=rnd2(['lowcut','bald','fade','greylow'],h),look.facialHair=rnd2(['Clean','Stubble','Full beard','Moustache','Goatee'],h>>2);
    else look.hair=rnd2(['knotless','bob','bun','headwrap','relaxed'],h);
    if(look.hair==='greylow')look.hairColor='#8f8a85';
    Object.assign(look,roleOutfit(n.role||'teacher',n.g,n.school,h));
    if(n.kind==='teacher')look.lanyard=SCHOOLS[n.school].primary;
  }
  return look;
}
function rnd2(a,h){return a[Math.abs(h)%a.length]}
function logoSVG(code,size=44){
  if(code==='GHC')return `<svg viewBox="0 0 40 46" width="${size}" height="${size*46/40}" aria-hidden="true"><path d="M3 3 H37 V24 Q37 38 20 44 Q3 38 3 24 Z" fill="#1F4E9C" stroke="#fff" stroke-width="2"/><path d="M9 33 Q14 30 20 33 Q26 30 31 33 V36 Q26 33 20 36 Q14 33 9 36 Z" fill="#fff"/><path d="M12 30 H18 V26 H23 V22 H28 V30" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M20 7 Q25 12 20 17 Q15 12 20 7 Z" fill="#A7AFB8"/><text x="20" y="22" text-anchor="middle" font-size="5.6" font-family="Georgia,serif" font-weight="700" fill="#fff">GHC</text></svg>`;
  return `<svg viewBox="0 0 44 44" width="${size}" height="${size}" aria-hidden="true"><circle cx="22" cy="22" r="20.5" fill="#7B1E2E" stroke="#F3E6C8" stroke-width="2.5"/><path d="M10 27 A12 12 0 0 1 34 27 Z" fill="#E3A72F"/><path d="M8 29 Q15 37 22 29 M36 29 Q29 37 22 29" stroke="#F3E6C8" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M22 6.5 l1.3 2.7 3 .4 -2.2 2 .6 3 -2.7-1.5 -2.7 1.5 .6-3 -2.2-2 3-.4z" fill="#E3A72F"/><text x="22" y="40" text-anchor="middle" font-size="6" font-family="Arial,sans-serif" font-weight="900" fill="#F3E6C8">BFA</text></svg>`;
}

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
  else html+=`<div class="scene-hint">Tap people and objects to see what you can do. Tap the ground or use WASD / arrow keys to walk.</div>`;
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
  placeMe(x,y);
  closeCtx();
  advanceTutorialAfterMove();
});

/* Walking: tap the ground, or use WASD / arrow keys. Both go through placeMe(). */
function placeMe(x,y){
  S.px=clamp(x,6,94);S.py=clamp(y,62,95);
  const me=$('#me');
  if(me){me.style.left=S.px+'%';me.style.top=S.py+'%';me.style.zIndex=10+Math.round(S.py)}
}
function advanceTutorialAfterMove(){
  if(S.tut===1){S.tut=2;renderScene(true);renderTaskbar()}
}
const KEY_STEP={ArrowLeft:[-2,0],a:[-2,0],ArrowRight:[2,0],d:[2,0],ArrowUp:[0,-1.5],w:[0,-1.5],ArrowDown:[0,1.5],s:[0,1.5]};
document.addEventListener('keydown',e=>{
  const step=KEY_STEP[e.key.length===1?e.key.toLowerCase():e.key];
  if(!step||!S||$('#game').hidden)return;
  if(e.ctrlKey||e.metaKey||e.altKey||modalOpen()||!$('#panel').hidden)return;
  if(e.target.closest('input,textarea,select,[contenteditable]'))return;
  e.preventDefault();
  placeMe(S.px+step[0],S.py+step[1]);
  closeCtx();
  advanceTutorialAfterMove();
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

/* =================== CLASS + QUESTIONS =================== */
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
  pool=shuffle(pool).slice(0,isTest?10:3);
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
    const q=qs[i],ok=j===q.a;res.push(ok);S.answered++;if(ok)S.correct++;if(ok&&q.s==='MTH')progress('maths',1);if(!ok)S.missed=q;
    S.houseGoal+=ok?1:0;
    document.querySelectorAll('.chalkq .opts button').forEach(b=>{const k=+b.dataset.j;b.disabled=true;if(k===q.a)b.classList.add('right');else if(k===j)b.classList.add('wrong')});
    $('#qexp').innerHTML=`<div class="explain"><b>${ok?'Correct.':j<0?"Time's up.":'Not quite.'}</b> ${esc(q.e)}${versus?`<br>${esc(versus(ok,i))}`:''}</div><div class="row end" style="margin-top:8px"><button class="btn gold sm" data-a="${act(next)}">${i+1<qs.length?'Next question':'See result'}</button></div>`;
    if(ok)rep('ACA',1);
  };
  const next=()=>{i++;if(i<qs.length)show();else{closeModal();onDone&&onDone(res)}};
  show();
}
function practiceQ(n){const yr=S.player.year;const q=shuffle(QB.filter(x=>x.y===yr))[0];runQuestions({title:`${n.name} asks you`,qs:[q],time:20,onDone:r=>{if(r[0]){addRel(n.id,3);schoolPts(1,'Correct answer')}}})}
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

/* =================== MODAL =================== */
function modalOpen(){return !!$('#modalRoot .back')}
function showModal({title,kicker,body,buttons=[{label:'Close'}],wide,noClose}){
  closeCtx();
  const btns=buttons.map(b=>`<button class="btn ${b.cls||'ghost'}" data-a="${act(()=>{if(b.fn)b.fn();else closeModal()})}">${esc(b.label)}</button>`).join('');
  $('#modalRoot').innerHTML=`<div class="back" ${noClose?'':`data-a="${act((el,e)=>{if(e.target===el)closeModal()})}"`}><div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="m-head"><div>${kicker?`<div class="kicker">${esc(kicker)}</div>`:''}<h2>${esc(title)}</h2></div>${noClose?'':`<button class="x" aria-label="Close" data-a="${act(closeModal)}">×</button>`}</div><div class="m-body">${body}</div>${btns?`<div class="m-foot">${btns}</div>`:''}</div></div>`;
}
function closeModal(){$('#modalRoot').innerHTML='';if(S&&!$('#game').hidden){renderHUD();renderTaskbar()}}

/* =================== PANELS =================== */
function closePanel(){$('#panel').hidden=true;$('#panel').innerHTML=''}
function openPanel(k){
  closeCtx();const P=S.player;let title='',body='';
  switch(k){
    case 'map':{title='Map';const tile=(id)=>{const c=canEnter(id),here=S.loc===id,out=LOCS[id].shared||id==='home';return `<button class="tile ${here?'here':c.ok?(out?'out':''):'lock'}" data-a="${act(()=>travel(id))}">${esc(id==='classroom'&&P.role==='student'?`${P.year} ${P.cls}`:LOCS[id].n)}<small>${here?'You are here':c.ok?'5 game min':esc(c.reason)}</small></button>`};
      body=`<div class="sec"><h3>${SCHOOLS[P.school].name}</h3><div class="mapgrid">${['gate','assembly','classroom','library','cafeteria','field','common','hostel','admin','clinic','staffroom','quarters'].map(tile).join('')}</div></div>
      <div class="sec"><h3>Outside school</h3><div class="mapgrid">${tile('junction')}${tile('ground')}${P.status==='day'?tile('home'):''}<button class="tile rival" data-a="${act(()=>{closePanel();P.role==='student'?chaosPrompt('rival'):toast('Staff visits to the rival school are not in this build.')})}">${SCHOOLS[CAST.rival].name}<small>Rival campus · sneaking in is chaos</small></button></div></div><p class="note">Travel costs 5 game minutes. Locked places say why.</p>`;break}
    case 'tasks':{title='Tasks';const M=S.mystery;
      const mys=P.role==='student'?`<div class="sec"><h3>Mystery · The Missing ${trophyName()}</h3>${M.started?`<div class="list">${[1,2,3,4,5,6].map(i=>`<div class="item ${M.clues[i]?'done':''}"><span class="t"><b>${M.clues[i]?'✓ ':'○ '}Clue ${i}</b><small>${M.clues[i]?esc(CLUE_TEXT()[i]):esc(clueHint(i))}</small></span></div>`).join('')}</div>${M.resolved?`<p><span class="badge good">Resolved: ${M.resolved}</span></p>`:''}${M.party.length?`<p class="note">Mission party: ${M.party.map(id=>esc(npc(id).name)).join(', ')}</p>`:''}`:'<p class="note">Read the notice board at the assembly ground to start.</p>'}</div>`:'';
      const daily=P.role==='student'?`<div class="sec"><h3>Daily tasks · ${DOW[dow(S.t)]}</h3><div class="list">${S.tasks.map(t=>`<div class="item ${t.done?'done':''}"><span class="t"><b>${t.done?'✓ ':''}${esc(t.text)}</b><small>${t.prog}/${t.goal}${t.r?` · ${naira(t.r)}`:''}${t.note?' · '+esc(t.note):''}</small></span></div>`).join('')}</div></div>`:`<div class="sec"><h3>Teacher tasks</h3><div class="list">${S.teacherTasks.map(t=>`<div class="item ${t.done?'done':''}"><span class="t"><b>${t.done?'✓ ':''}${esc(t.text)}</b><small>${naira(t.r)}</small></span></div>`).join('')}</div></div>`;
      const rum=`<div class="sec"><h3>Rumours you've heard</h3>${Object.keys(S.rumours).length?`<div class="list">${Object.entries(S.rumours).map(([id,st])=>`<div class="item"><span class="t"><b>"${esc(fillVars(RUMOURS[id-1].t))}"</b><small>${st}${S.shared.includes(+id)?' · you shared it':''}</small></span></div>`).join('')}</div>`:'<p class="note">Gossip under the mango tree or ask a Social Butterfly.</p>'}</div>`;
      const house=P.role==='student'?`<div class="sec"><h3>House challenge</h3><div class="item"><span class="t"><b>${P.house}: 6 correct answers today (yours count)</b><small>${S.houseGoal}/6 · +20 house points at 18:00</small></span></div></div>`:'';
      body=mys+daily+house+rum;break}
    case 'bag':{title='Bag';const ids=Object.keys(S.inv);const groups={};ids.forEach(id=>{(groups[ITEMS[id].c]=groups[ITEMS[id].c]||[]).push(id)});
      body=`<p class="note">${invCount()}/30 slots. Mystery items can't be given, sold or lost.</p>`+(ids.length?Object.entries(groups).map(([c,l])=>`<div class="sec"><h3>${c}</h3><div class="list">${l.map(id=>`<div class="item"><span class="t"><b>${ITEMS[id].n} ×${S.inv[id]}</b><small>${ITEMS[id].locked?'Locked mystery item':''}</small></span><div class="row">${ITEMS[id].food?`<button class="btn school sm" data-a="${act(()=>{removeItem(id);eat(id);openPanel('bag')})}">Eat</button>`:''}${id==='answers'?`<button class="btn sm" data-a="${act(()=>{closePanel();reportMenu(npc('x_vp'))})}">Report scam</button>`:''}</div></div>`).join('')}</div></div>`).join(''):'<p>Your bag is empty.</p>')+(S.confiscated&&S.confiscated.length?`<p class="note">Confiscated (back on Monday): ${S.confiscated.map(k=>ITEMS[k].n).join(', ')}</p>`:'');break}
    case 'wallet':{title='Wallet and Kolo';const K=S.kolo,pct=Math.min(100,Math.round(K.bal/K.goal*100));
      body=`<div class="spread"><div><div class="note">Wallet</div><div class="big mono">${naira(S.wallet)}</div></div>${P.status==='day'?`<div><div class="note">Bank (withdraw at Chidi POS)</div><div class="mono" style="font-weight:800">${naira(S.bank)}</div></div>`:''}</div>
      <div class="kolo"><div class="spread"><b>KOLO · Goal: ${esc(K.goalName)}</b><span>${K.locked?'🔒 Locked':'Unlocked'}</span></div><div class="mono">${naira(K.bal)} / ${naira(K.goal)} · ${pct}%</div><div class="prog"><i style="width:${pct}%"></i></div>
      <div class="row">${[100,500].map(a=>`<button class="btn gold sm" data-a="${act(()=>koloDeposit(a))}">Deposit ${naira(a)}</button>`).join('')}<button class="btn sm" style="background:rgba(255,255,255,.2)" data-a="${act(()=>koloWithdraw(100))}">Withdraw ₦100</button></div>
      <div class="row"><button class="btn sm" style="background:rgba(255,255,255,.2)" data-a="${act(()=>{K.locked=!K.locked;openPanel('wallet')})}">${K.locked?'Unlock (lose bonus)':'Lock until goal (+5% bonus)'}</button><button class="btn sm" style="background:rgba(255,255,255,.2)" data-a="${act(editGoal)}">Edit goal</button></div><small>Deposit 3 days in a row for the Kolo Saver badge.</small></div>
      <div class="sec"><h3>Transactions</h3><div class="ledger">${S.ledger.slice(0,25).map(l=>`<div><span>${esc(l.l)} <span class="note">${DOW[dow(l.t)].slice(0,3)} ${hhmm(l.t)}</span></span><span class="${l.a>=0?'plus':'minus'} mono">${l.a>=0?'+':'−'}${naira(Math.abs(l.a))}</span></div>`).join('')}</div></div>`;break}
    case 'friends':{title='Friends';const req=(S.pendingReq||[]).map(id=>npc(id));
      const list=Object.values(CAST.people).filter(n=>rel(n.id)>=10||S.friends.includes(n.id)).sort((a,b)=>rel(b.id)-rel(a.id));
      body=`${req.length?`<div class="sec"><h3>Friend requests</h3>${req.map(n=>`<div class="item"><span class="t"><b>👤 ${esc(n.name)}</b><small>${esc(npcSub(n))}</small></span><div class="row"><button class="btn school sm" data-a="${act(()=>{S.friends.push(n.id);addRel(n.id,40);S.pendingReq=S.pendingReq.filter(x=>x!==n.id);openPanel('friends')})}">Accept</button><button class="btn ghost sm" data-a="${act(()=>{S.pendingReq=S.pendingReq.filter(x=>x!==n.id);openPanel('friends')})}">Decline</button></div></div>`).join('')}</div>`:''}
      <div class="sec"><h3>People you know</h3>${list.length?`<div class="list">${list.map(n=>`<div class="item"><span class="t"><b>${n.human?'👤 ':''}${esc(n.name)}${S.friends.includes(n.id)?' · Friend':''}</b><small>${esc(npcSub(n))}</small></span><span class="badge ${rel(n.id)>=40?'good':''}">${relLevel(rel(n.id),relKind(n))} ${rel(n.id)}</span></div>`).join('')}</div>`:'<p class="note">Talk to people to get to know them. Friend status unlocks giving, money and missions.</p>'}</div>`;break}
    case 'chat':{title='Chat';body=`<p class="note">The chat box sits at the top-left of the world. Channels: Nearby, Class, School, House, Junction (both schools). DMs work between Friends. Phone numbers, emails and handles are blocked in public channels.</p><div class="list">${CHANNELS.map(c=>`<button class="choice" data-a="${act(()=>{S.chatCh=c;S.chatMin=false;closePanel();renderScene(true)})}"><b>${c}</b><small>${(S.chat[c]||[]).length} messages</small></button>`).join('')}</div>`;break}
    case 'timetable':{title='Timetable';const d=dayList(S.t);const yrs=P.role==='student'?[P.year]:['JSS3','SSS3'];
      body=`<p>${DOW[dow(S.t)]} · ${weekday(S.t)?'school day':'no classes'}</p><div class="tblwrap"><table class="tbl"><tr><th>Period</th>${yrs.map(y=>`<th>${y} ${SCHOOLS[P.school].classes[y]}</th>`).join('')}</tr>${PERIODS.map((t,i)=>`<tr${periodIdx(S.t)===i?' style="background:#fff6e0"':''}><td class="mono">P${i+1} ${hhmm(t)}</td>${yrs.map(y=>{const s=subjectFor(y,S.t,i);const mine=P.role==='teacher'&&s===P.subject;return `<td>${mine?'<b>':''}${SUBJ[s]}${mine?' (you)</b>':''}</td>`}).join('')}</tr>`).join('')}</table></div>
      <p class="note">${P.role==='student'?`${ROOM[P.year]}. Break 10:30, lunch 13:00, prep 19:00. Weekly class test: Friday, Period 5.`:'SSS3 runs one period ahead of JSS3, so you are never double-booked.'}</p>
      <div class="row"><button class="btn school sm" data-a="${act(()=>{closePanel();travel('classroom')})}">Go to class</button>${P.role==='student'?`<button class="btn ghost sm" data-a="${act(()=>{closePanel();jumpTo(4,710);travel('classroom')})}">Demo: jump to Friday class test</button>`:''}</div>`;break}
    case 'rivalry':{title='Rivalry';const g=S.points.GHC,b=S.points.BFA,max=Math.max(1,...Object.values(S.housePts));
      body=`<div class="spread"><div style="color:${SCHOOLS.GHC.primary}">${logoSVG('GHC',30)} <span class="big">${g}</span></div><span class="note">this week</span><div style="color:${SCHOOLS.BFA.primary}"><span class="big">${b}</span> ${logoSVG('BFA',30)}</div></div>
      <p class="note">Your contribution: ${S.ptsWeek} this week · ${S.ptsToday}/50 today (daily cap). Resolves Saturday 18:00.</p>
      <div class="sec"><h3>Ways to score</h3><table class="tbl"><tr><td>Correct class answer</td><td>+1</td></tr><tr><td>Class test A grade</td><td>+5</td></tr><tr><td>Win rivalry quiz round</td><td>+10</td></tr><tr><td>Beat a rival at football or quiz</td><td>+5</td></tr><tr><td>Solve the mystery</td><td>+10 / +5</td></tr><tr><td>Caught in chaos</td><td>−2 to −5</td></tr></table></div>
      <div class="sec"><h3>House cup · ${SCHOOLS[P.school].short}</h3><div class="bars">${Object.entries(S.housePts).sort((a,b)=>b[1]-a[1]).map(([h,v])=>`<div class="barrow"><span><span class="housedot" style="background:${HOUSES[h]}"></span>${h}</span><span class="tr"><i style="width:${v/max*100}%;background:${HOUSES[h]}"></i></span><span class="mono">${v}</span></div>`).join('')}</div></div>
      <div class="row"><button class="btn school sm" data-a="${act(()=>{closePanel();travel('ground')})}">Go to Inter-School Ground</button></div>`;break}
    case 'me':{title='Profile';const type=P.role==='student'?TYPES[P.type][0]:STYLE_TITLE[P.style];const known=knownAs();
      body=`<div class="idcard" style="animation:none"><div class="top">${logoSVG(P.school,34)}<div><b>${SCHOOLS[P.school].name}</b><small>${P.role==='student'?'STUDENT':'STAFF'} IDENTITY CARD</small></div></div><div class="body"><div class="photo">${avatar(lookToAvatar(P.look,P.role,P.school,P.year),90)}</div><dl><dt>Name</dt><dd>${esc(P.name)}</dd>${P.role==='student'?`<dt>Class</dt><dd>${P.year} ${P.cls}</dd><dt>House</dt><dd>${P.house}</dd><dt>Status</dt><dd>${P.status==='boarding'?'Boarding':'Day'}</dd>`:`<dt>Subject</dt><dd>${SUBJ[P.subject]}</dd><dt>Patron</dt><dd>${P.house}</dd>`}<dt>ID</dt><dd class="mono" style="font-size:11.5px">${P.id}</dd></dl></div><div class="foot"><span class="note">Type</span> <b>${type}</b>${known?` · <span class="note">Known as</span> <b>${known}</b>`:''}</div></div>
      ${P.role==='student'?`<div class="sec"><h3>Reputation</h3><div class="bars">${[['ACA','Academic'],['SOC','Social'],['HEL','Helpful'],['MIS','Mischief'],['DIS','Discipline']].map(([k,l])=>`<div class="barrow"><span>${l}</span><span class="tr"><i style="width:${S.rep[k]}%"></i></span><span class="mono">${S.rep[k]}</span></div>`).join('')}</div></div>`:''}
      <div class="sec"><h3>Badges</h3><div class="badges">${BADGES.map(([id,n,d])=>`<div class="bdg ${S.badges[id]?'got':''}"><b>${S.badges[id]?'★ ':''}${n}</b>${d}</div>`).join('')}</div></div>
      <div class="sec"><h3>Results</h3>${S.results.length?`<table class="tbl"><tr><th>Assessment</th><th>Score</th><th>Grade</th></tr>${S.results.map(r=>`<tr><td>${r.kind}</td><td>${r.score}%</td><td>${r.grade}</td></tr>`).join('')}</table>`:`<p class="note">Answered ${S.answered} questions · ${S.correct} correct. Weekly test results appear here.</p>`}</div>
      <div class="sec"><h3>Discipline</h3>${S.incidents.filter(i=>i.self||P.role==='teacher').length?`<div class="tblwrap"><table class="tbl"><tr><th>When</th><th>Incident</th><th>${P.role==='teacher'?'Student':'By'}</th><th>Outcome</th></tr>${S.incidents.filter(i=>i.self||P.role==='teacher').map(i=>`<tr><td class="mono">${DOW[dow(i.t)].slice(0,3)} ${hhmm(i.t)}</td><td>${esc(i.action)}</td><td>${esc(i.self?i.by:npc(i.who).name)}</td><td>${esc(i.pun)}</td></tr>`).join('')}</table></div>`:'<p class="note">Clean record. For now.</p>'}</div>
      <div class="sec"><h3>Leadership</h3><p class="note">${P.role==='student'?`Class Captain: ${npc(CAST.buddy).name} (NPC). The human with the top class reputation takes over at the weekly reset.${P.year==='SSS3'?' Prefects: top 4 SSS3 humans by reputation.':''}`:'Teachers can coach the rivalry quiz team from the staff notices.'}</p></div>`;break}
    case 'notifs':{title='Notifications';S.unread=0;renderHUD();body=S.notifs.length?`<div class="list">${S.notifs.map(n=>`<div class="item"><span class="t"><b>${esc(n.text)}</b><small>${DOW[dow(n.t)].slice(0,3)} ${hhmm(n.t)} · ${n.type}</small></span></div>`).join('')}</div>`:'<p>No notifications yet.</p>';break}
    case 'tester':{title='Settings';body=`<div class="sec tester"><h3>Clock speed</h3><div class="row">${[[0.2,'Relaxed'],[1,'Normal'],[6,'Fast']].map(([v,l])=>`<button class="chip ${SPEED===v?'on':''}" data-a="${act(()=>{SPEED=v;openPanel('tester')})}">${l}</button>`).join('')}</div><p class="note">The clock never pauses, even with a panel or popup open. Default is Relaxed (1 game day = 120 real minutes). This switch is for testing only: in the full game the server owns the clock.</p></div>
      <div class="sec tester"><h3>Jump in time</h3><div class="row">${[['Assembly',450],['Period 1',480],['Break',630],['Lunch',780],['After school 16:00',960],['Prep 19:00',1140],['Night 21:30',1290]].map(([l,m])=>`<button class="btn ghost sm" data-a="${act(()=>{jumpTo(null,m);closePanel()})}">${l}</button>`).join('')}<button class="btn ghost sm" data-a="${act(()=>{advance(60);closePanel()})}">+1 hour</button><button class="btn ghost sm" data-a="${act(()=>{jumpTo(5,595);closePanel()})}">Saturday 09:55</button></div></div>
      <div class="sec tester"><h3>Trigger</h3><div class="row"><button class="btn ghost sm" data-a="${act(()=>{closePanel();randomEvent(true)})}">Random event here</button><button class="btn ghost sm" data-a="${act(()=>{closePanel();weeklyResolution()})}">Weekly rivalry result</button><button class="btn ghost sm" data-a="${act(()=>{closePanel();showWYWA()})}">While You Were Away</button>${P.role==='teacher'?`<button class="btn ghost sm" data-a="${act(()=>{closePanel();const tc=nextTeachPeriod();if(tc!=null){jumpTo(null,PERIODS[tc]);travel('classroom')}})}">Jump to my next lesson</button>`:''}</div></div>
      <div class="sec tester"><h3>Game</h3><div class="row"><button class="btn ghost sm" data-a="${act(()=>{save();toast('Saved on this device.')})}">Save now</button><button class="btn bad sm" data-a="${act(()=>{showModal({title:'Start a new character?',body:'<p>This deletes the saved game in this browser.</p>',buttons:[{label:'Cancel'},{label:'Start over',cls:'bad',fn:()=>{wipe();location.reload()}}]})})}">New character</button></div><p class="note">Single-player simulation: NPCs and 4 simulated players (marked 👤) stand in for real multiplayer.</p></div>`;break}
  }
  $('#panel').innerHTML=`<div class="p-head"><h2>${title}</h2><button class="x" aria-label="Close" data-a="${act(closePanel)}">×</button></div><div class="p-body">${body}</div>`;$('#panel').hidden=false;
}
function nextTeachPeriod(){const P=S.player;for(let p=0;p<5;p++){if(subjectFor('JSS3',S.t,p)===P.subject||subjectFor('SSS3',S.t,p)===P.subject)return p}return null}
function editGoal(){showModal({title:'Kolo goal',body:`<div class="list">${[['New backpack',1200],['Wristwatch',1500],['Football boots',5000],['Visiting-day treat',2000]].map(([n,a])=>`<button class="choice" data-a="${act(()=>{S.kolo.goalName=n;S.kolo.goal=a;closeModal();openPanel('wallet')})}"><b>${n}</b><small>${naira(a)}</small></button>`).join('')}</div>`,buttons:[{label:'Cancel'}]})}
function clueHint(i){const g=S.player.school==='GHC';return{1:'Gossip with the Competitor in your class.',2:'Ask Security at the gate.',3:`Become an Acquaintance of ${npc(CAST.quiet).name.split(' ')[0]} (the quiet one), then ask "Have you heard the latest?"`,4:g?'Search the library storeroom door after 16:00.':'Search the sports store at the field after 16:00.',5:'Ask the cleaner once you have 2 clues (common area mornings, field afternoons).',6:`Show clues 3–5 to ${npc(CAST.prankster).name.split(' ')[0]}.`}[i]}
function knownAs(){if(S.player.role!=='student')return '';const e=Object.entries(S.rep).filter(([k])=>k!=='DIS').sort((a,b)=>b[1]-a[1])[0];if(e[1]<56&&S.rep.DIS<80)return '';if(S.rep.DIS>=80&&S.rep.DIS>e[1])return 'Model Student';return{ACA:'Academic Weapon',SOC:'School Celebrity',HEL:"Everybody's Helper",MIS:'Chaos Legend'}[e[0]]}
function jumpTo(day,m){let t=S.t;if(day!=null){let d=dayOf(t);while(d%7!==day)d++;t=d*1440}const target=(day!=null?t:dayOf(S.t)*1440)+m;let delta=target-S.t;if(delta<=0)delta+=day!=null?7*1440:1440;advance(delta);renderScene(true);renderHUD()}
function showWYWA(){
  const n=S.notifs.slice(0,5).map(x=>x.text);const lines=[`${S.player.house} House gained ${10+Math.floor(Math.random()*120)} points.`,`Rivalry: GHC ${S.points.GHC} · BFA ${S.points.BFA}.`,...n].slice(0,8);
  if(S.kolo.goal)lines.push(`Your Kolo goal is ${Math.min(100,Math.round(S.kolo.bal/S.kolo.goal*100))}% complete.`);
  showModal({title:'While you were away',kicker:'Your school kept going',body:`<div class="list">${lines.map(l=>`<div class="item"><span class="t"><b>• ${esc(l)}</b></span></div>`).join('')}</div><p class="note">Your own character did nothing while you were away.</p>`,buttons:[{label:'Continue',cls:'school'}]});
}

/* =================== TUTORIAL =================== */
const TUT_TEXT={1:'Tap the ground, or press WASD / arrow keys, to walk.',2:'Tap your class buddy (the glowing ring).',3:'Choose "Talk" from the menu, then say hi.',4:'Tap the notice board and read it.'};
function skipTutorial(){S.tut=10;giveBadge('first');renderScene(true);renderTaskbar()}

/* =================== BOOT =================== */
(function boot(){
  const saved=load();
  if(saved&&saved.player){O.d={};}
  renderOnb();
})();

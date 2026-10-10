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
 {y:'JSS3',s:'MTH',l:2,q:'Simplify 3/4 + 2/3',o:['5/7','17/12','5/12','6/7'],a:1,e:'9/12 + 8/12 = 17/12.'},
 {y:'JSS3',s:'MTH',l:3,q:'What is 15% of 200?',o:['20','25','30','35'],a:2,e:'15/100 × 200 = 30.'},
 {y:'JSS3',s:'ENG',l:2,q:'Neither the teacher nor the students ___ in class.',o:['is','are','was','be'],a:1,e:'The verb agrees with the nearer subject, "students".'},
 {y:'JSS3',s:'ENG',l:3,q:'Choose the correct spelling.',o:['Recieve','Receive','Receeve','Riceive'],a:1,e:'"i before e, except after c": receive.'},
 {y:'JSS3',s:'FIN',l:2,q:'Which of these is a need?',o:['Video game','Designer shoes','School textbook','Ice cream'],a:2,e:'Needs are required for school or survival; the rest are wants.'},
 {y:'JSS3',s:'FIN',l:3,q:'You earn ₦1,000 and spend ₦650. How much is left?',o:['₦250','₦350','₦450','₦1,650'],a:1,e:'1,000 − 650 = 350.'},
 {y:'JSS3',s:'BSC',l:2,q:'How do green plants make their food?',o:['Respiration','Photosynthesis','Digestion','Excretion'],a:1,e:'Plants use sunlight, water and carbon dioxide to make food.'},
 {y:'JSS3',s:'BSC',l:3,q:'Which organ pumps blood around the body?',o:['Lungs','Liver','Heart','Kidney'],a:2,e:'The heart pumps blood through the arteries and veins.'},
 {y:'JSS3',s:'HIS',l:2,q:'When did Nigeria gain independence?',o:['1 Oct 1960','1 Oct 1963','12 Jun 1993','29 May 1999'],a:0,e:'Nigeria became independent from Britain on 1 October 1960.'},
 {y:'JSS3',s:'HIS',l:3,q:"Who was Nigeria's first Prime Minister?",o:['Tafawa Balewa','Nnamdi Azikiwe','Obafemi Awolowo','Ahmadu Bello'],a:0,e:'Sir Abubakar Tafawa Balewa led the government at independence.'},
 {y:'JSS3',s:'GEO',l:2,q:'The longest river in Nigeria is',o:['River Benue','River Niger','Ogun River','Cross River'],a:1,e:'The Niger enters from the north-west and flows to the Atlantic.'},
 {y:'JSS3',s:'GEO',l:3,q:'What is the capital of Nigeria?',o:['Lagos','Abuja','Kano','Ibadan'],a:1,e:'Abuja became the capital in 1991.'},
 {y:'SSS3',s:'MTH',l:4,q:'Find the roots of x² − 5x + 6 = 0',o:['1 and 6','2 and 3','−2 and −3','3 and 5'],a:1,e:'(x − 2)(x − 3) = 0.'},
 {y:'SSS3',s:'MTH',l:5,q:'Evaluate log₁₀ 1000',o:['2','3','10','100'],a:1,e:'10³ = 1000.'},
 {y:'SSS3',s:'ENG',l:4,q:'Nearest in meaning to "candid":',o:['frank','secretive','angry','proud'],a:0,e:'Candid means open and honest.'},
 {y:'SSS3',s:'ENG',l:5,q:'Opposite of "scarce":',o:['rare','plentiful','costly','small'],a:1,e:'Scarce means in short supply; plentiful is the opposite.'},
 {y:'SSS3',s:'FIN',l:4,q:'₦10,000 at 10% simple interest per year. Interest after 2 years?',o:['₦1,000','₦2,000','₦2,100','₦12,000'],a:1,e:'Simple interest = 10,000 × 10% × 2.'},
 {y:'SSS3',s:'FIN',l:5,q:'Bought for ₦800, sold for ₦1,000. Profit percentage?',o:['20%','25%','80%','200%'],a:1,e:'Profit 200 ÷ cost 800 = 25%.'},
 {y:'SSS3',s:'BSC',l:4,q:'The pH of pure water at 25°C is',o:['0','5','7','14'],a:2,e:'Pure water is neutral.'},
 {y:'SSS3',s:'BSC',l:5,q:'The chemical symbol for sodium is',o:['So','Sd','Na','S'],a:2,e:'Na comes from the Latin "natrium".'},
 {y:'SSS3',s:'HIS',l:4,q:"Who was Nigeria's first Executive President (1979)?",o:['Shehu Shagari','Nnamdi Azikiwe','Yakubu Gowon','Olusegun Obasanjo'],a:0,e:'The 1979 constitution created an executive presidency.'},
 {y:'SSS3',s:'HIS',l:5,q:'Nigeria became a republic in which year?',o:['1960','1963','1966','1979'],a:1,e:'Nigeria became a republic on 1 October 1963.'},
 {y:'SSS3',s:'GEO',l:4,q:'The harmattan wind blows into Nigeria from the',o:['North-east','South-west','South-east','West'],a:0,e:'It is a dry, dusty wind from the Sahara.'},
 {y:'SSS3',s:'GEO',l:5,q:'Which vegetation belt covers most of northern Nigeria?',o:['Rainforest','Mangrove','Savanna','Montane'],a:2,e:'Guinea, Sudan and Sahel savanna cover the north.'}
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


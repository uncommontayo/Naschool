/* =================== TUTORIAL =================== */
const TUT_TEXT={1:'Tap the ground, or press WASD / arrow keys, to walk.',2:'Tap your class buddy (the glowing ring).',3:'Choose "Talk" from the menu, then say hi.',4:'Tap the notice board and read it.'};
function skipTutorial(){S.tut=10;giveBadge('first');renderScene(true);renderTaskbar()}

/* =================== BOOT =================== */
(function boot(){
  const saved=load();
  if(saved&&saved.player){O.d={};}
  renderOnb();
})();

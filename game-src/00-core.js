
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


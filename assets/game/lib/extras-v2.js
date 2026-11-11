/* Pathways Home extras: visit mode and two role-play games.
   Loaded in the background after the main game is ready. */
export function install(K){
const {THREE,scene,camera,controls,view}=K;
const S=()=>K.S();
const esc=t=>String(t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const fmt=n=>Math.round(n).toLocaleString('en-US');
const P=K.P,h=K.h,zr=K.zr;
const v2=(x,z)=>new THREE.Vector2(x,z);
const free=(x,z)=>{const v=K.freePoint(v2(x,z));return{x:v.x,z:v.y}};
const PRICE={wage:14704,sorghum:1572,jerry:450,barrelJerry:11};
const SRC='Prices: WFP and Logistics Cluster Sudan Market Monitor (April 2026 data), Asharq Al-Awsat, Radio Tamazuj, EUAA. Rounded for play.';

/* ---------- styles ---------- */
const css=document.createElement('style');css.textContent=`
.xbar{position:absolute;z-index:6;right:64px;bottom:150px;display:flex;flex-direction:column;gap:6px}
.page .xbar{right:456px}.nor .xbar{right:64px}
@media (max-width:1180px){.page .xbar{right:416px}}
@media (max-width:860px){.page .xbar{right:64px;bottom:150px}}
.xbar>button{display:flex;align-items:center;gap:7px;font:inherit;font-size:13px;font-weight:700;border:1px solid var(--line-2);background:rgba(255,255,255,.95);border-radius:999px;padding:7px 13px;cursor:pointer;color:var(--ink);box-shadow:0 4px 14px rgba(20,30,50,.12)}
.xbar>button:hover,.xbar>button[aria-expanded="true"]{border-color:var(--brand);color:var(--brand)}
.xbar svg{width:17px;height:17px;flex:none}
.xpop{position:absolute;z-index:7;display:none;background:#fff;border:1px solid var(--line-2);border-radius:12px;box-shadow:0 14px 40px rgba(20,30,50,.2);padding:8px;width:270px;max-height:min(70vh,520px);overflow:auto}
.xpop.on{display:block}
.xpop h4{margin:4px 6px 6px;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.xpop button{display:flex;gap:9px;align-items:center;width:100%;text-align:left;font:inherit;border:0;background:none;border-radius:8px;padding:7px 8px;cursor:pointer;color:var(--ink)}
.xpop button:hover,.xpop button:focus-visible{background:var(--panel-2);outline:none}
.xpop .n{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:var(--brand-tint);color:var(--brand);font-weight:800;font-size:12px}
.xpop b{display:block;font-size:13.5px}.xpop small{display:block;font-size:11.5px;color:var(--muted);line-height:1.3}
.xpop .job{border:1px solid var(--line);margin-bottom:6px;padding:9px}
.xpop .job .n{width:34px;height:34px;border-radius:9px}
body.xmode .hud,body.xmode .lpanel,body.xmode .side,body.xmode .opener,body.xmode .xbar,body.xmode .reset3d{display:none!important}
body.gmode .zoom3d,body.gmode .lbl3d{display:none!important}
.view3d.visiting::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 42% 46% at 58% 55%,transparent 55%,rgba(236,226,205,.82) 100%);z-index:1}
.vpanel{position:absolute;z-index:5;left:12px;top:calc(var(--hdr,70px) + 12px);bottom:12px;width:min(360px,calc(100% - 24px));background:rgba(255,255,255,.97);border:1px solid var(--line-2);border-radius:14px;box-shadow:0 14px 40px rgba(20,30,50,.18);display:flex;flex-direction:column;overflow:hidden}
.vpanel .vh{padding:14px 16px 8px;border-bottom:1px solid var(--line)}
.vpanel .vk{font-size:11px;letter-spacing:.06em;text-transform:uppercase;font-weight:800;color:var(--brand)}
.vpanel h3{margin:2px 0 2px;font-size:20px;line-height:1.2}
.vpanel .vs{font-size:12px;color:var(--muted)}
.vpanel .vb{padding:12px 16px;overflow:auto;flex:1}
.vpanel .vb p{margin:0 0 10px;font-size:14px;line-height:1.5}
.vpanel ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.vpanel li button{display:grid;grid-template-columns:24px 1fr;gap:9px;width:100%;text-align:left;font:inherit;border:1px solid var(--line);background:#fff;border-radius:9px;padding:8px;cursor:pointer;color:inherit}
.vpanel li button:hover,.vpanel li button.on{border-color:var(--brand);background:#f6f9fe}
.vpanel li .n{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:var(--brand);color:#fff;font-weight:800;font-size:12px}
.vpanel li b{font-size:13.5px;display:block}.vpanel li span.t{font-size:13px;line-height:1.45;color:var(--ink-2);display:none;margin-top:3px}
.vpanel li button.on span.t{display:block}
.vpanel .vf{display:flex;gap:6px;padding:10px 12px;border-top:1px solid var(--line);flex-wrap:wrap}
.vpanel .vf .btn{flex:1}
.vpanel .fic{font-size:11px;color:var(--muted);margin-top:8px}
.xpin{position:absolute;z-index:3;transform:translate(-50%,-100%);pointer-events:auto;cursor:pointer;border:0;padding:0;background:none;font:inherit}
.xpin .pn{display:grid;place-items:center;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--brand);color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.25);border:2px solid #fff}
.xpin .pn i{transform:rotate(45deg);font-style:normal;font-weight:800;font-size:12px}
.xpin.on .pn{background:#e07a3a}
.gpin{position:absolute;z-index:3;transform:translate(-50%,-100%);pointer-events:none;background:#fff;border:2px solid var(--brand);border-radius:999px;padding:3px 9px;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.18);color:var(--ink)}
.gpin.dest{background:var(--brand);color:#fff}.gpin.fill{border-color:#3f8fd0;color:#1d5fae}.gpin.trough{border-color:#8a6a48;color:#6b4f35}.gpin.door{border-color:#e07a3a}
.gpin small{font-weight:600;color:var(--muted)}.gpin.dest small{color:#dbe7fb}
.ghud{position:absolute;z-index:5;left:50%;transform:translateX(-50%);top:calc(var(--hdr,70px) + 10px);display:flex;gap:8px;align-items:stretch;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 24px)}
.ghud .gc{background:rgba(255,255,255,.96);border:1px solid var(--line-2);border-radius:12px;padding:6px 12px;box-shadow:0 6px 18px rgba(20,30,50,.12);display:flex;flex-direction:column;justify-content:center;min-width:92px}
.ghud .gc small{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700}
.ghud .gc b{font-size:19px;font-variant-numeric:tabular-nums}
.ghud .goal{min-width:180px}.ghud .bar{height:6px;border-radius:3px;background:var(--track);margin-top:4px;overflow:hidden}.ghud .bar i{display:block;height:100%;background:#2e8b57;border-radius:3px}
.ghud .gc.task{max-width:340px;min-width:200px}.ghud .gc.task b{font-size:14px;font-weight:700;line-height:1.3}
.ghud .quit{font:inherit;font-size:13px;font-weight:700;border:1px solid var(--line-2);background:#fff;border-radius:12px;padding:6px 12px;cursor:pointer}
.gtoast{position:absolute;z-index:6;left:50%;bottom:110px;transform:translateX(-50%);background:#1c2230;color:#fff;border-radius:999px;padding:8px 16px;font-size:14px;font-weight:700;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap}
.gtoast.on{opacity:1}.gtoast.good{background:#1f6b42}.gtoast.bad{background:#b3261e}
.gkeys{position:absolute;z-index:5;left:12px;bottom:12px;background:rgba(255,255,255,.94);border:1px solid var(--line-2);border-radius:10px;padding:6px 10px;font-size:12px;color:var(--ink-2)}
.gcard{position:absolute;z-index:8;inset:0;display:grid;place-items:center;background:rgba(20,26,36,.35)}
.gcard>div{background:#fff;border-radius:14px;max-width:520px;width:calc(100% - 32px);padding:22px 24px;box-shadow:0 20px 60px rgba(10,20,40,.3);max-height:calc(100% - 40px);overflow:auto}
.gcard h2{margin:0 0 4px;font-size:22px}.gcard .sub{color:var(--muted);font-size:13px;margin-bottom:10px}
.gcard p{margin:0 0 10px;font-size:14.5px;line-height:1.5}.gcard ul{margin:0 0 10px;padding-left:20px;font-size:14px;line-height:1.5}
.gcard .foot{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}
.gcard .big{font-size:34px;font-weight:900;font-variant-numeric:tabular-nums}
.gcard .res{display:grid;grid-template-columns:1fr auto;gap:4px 12px;font-size:14px;margin:8px 0}
.gcard .res span:nth-child(even){text-align:right;font-variant-numeric:tabular-nums;font-weight:700}
.gcard .src{font-size:11px;color:var(--muted);margin-top:8px}
.gcard .ok{color:#1f6b42;font-weight:800}.gcard .no{color:#b3261e;font-weight:800}
.edgearr{position:absolute;z-index:4;width:46px;height:46px;margin:-23px 0 0 -23px;pointer-events:none;display:none}
.edgearr svg{width:100%;height:100%;filter:drop-shadow(0 3px 6px rgba(0,0,0,.3))}
.gzoom{display:flex;flex-direction:column;gap:2px;justify-content:center}
.gzoom button,.ghud .tog{font:inherit;font-size:15px;font-weight:800;width:30px;height:24px;border:1px solid var(--line-2);background:#fff;border-radius:7px;cursor:pointer;line-height:1}
.gbtn{font:inherit;font-size:12px;border:1px solid var(--line-2);background:#fff;border-radius:8px;padding:3px 9px;cursor:pointer}
.ghud .gc.fuel b{font-size:16px}.ghud .gc.fuel .bar i{background:#e39a27}.ghud .gc.fuel.low .bar i{background:#c62f25}
`;document.head.appendChild(css);

/* ---------- buttons on the map ---------- */
const ICO={eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  job:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
  tuk:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h9l3 4h3a2 2 0 0 1 2 2v3h-2a2.5 2.5 0 0 0-5 0H9a2.5 2.5 0 0 0-5 0H3V9a1 1 0 0 1 1-1z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/><path d="M5 5h8v2H5z"/></svg>',
  donkey:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 10h9a3 3 0 0 1 3 3v2h-1v4h-1.5v-4h-6v4H5v-4H3z"/><path d="M14 10l2-4 1.5-2 1 1.5 1.5-1V8l-2 3h-2z"/><rect x="15" y="12" width="7" height="5" rx="2.5" fill="#3f8fd0"/><circle cx="18.5" cy="19" r="2"/></svg>'};
const bar=document.createElement('div');bar.className='xbar';
bar.innerHTML='<button type="button" data-x="visit" aria-expanded="false">'+ICO.eye+'Visit a place</button><button type="button" data-x="job" aria-expanded="false">'+ICO.job+'Try a job</button>';
view.appendChild(bar);
const pop=document.createElement('div');pop.className='xpop';view.appendChild(pop);
function closePop(){pop.classList.remove('on');bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-expanded','false'))}
bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const open=b.getAttribute('aria-expanded')==='true';closePop();if(open)return;
  b.setAttribute('aria-expanded','true');
  if(b.dataset.x==='visit')pop.innerHTML='<h4>Visit a place</h4>'+PLACES.map((p,i)=>'<button type="button" data-v="'+i+'"><span class="n">'+(i+1)+'</span><span><b>'+esc(p.name)+'</b><small>'+esc(p.sub)+'</small></span></button>').join('');
  else pop.innerHTML='<h4>Try a job for 3 minutes</h4><button type="button" class="job" data-j="tuk"><span class="n">'+ICO.tuk+'</span><span><b>Tuk-tuk driver</b><small>Pick up passengers and earn 10,000 SDG after fuel.</small></span></button><button type="button" class="job" data-j="donkey"><span class="n">'+ICO.donkey+'</span><span><b>Donkey water seller</b><small>Fill your barrel at the river and sell 2 barrels of water.</small></span></button>';
  const vr=view.getBoundingClientRect(),br=b.getBoundingClientRect();pop.classList.add('on');
  pop.style.left=Math.max(8,br.right-vr.left-pop.offsetWidth)+'px';pop.style.top=Math.max(8,br.top-vr.top-pop.offsetHeight-8)+'px'});
pop.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;closePop();if(b.dataset.v!==undefined)startVisit(+b.dataset.v);else if(b.dataset.j)startJob(b.dataset.j)});
document.addEventListener('pointerdown',e=>{if(!pop.contains(e.target)&&!bar.contains(e.target))closePop()});

/* ---------- shared helpers ---------- */
const TV=new THREE.Vector3();
function project(x,y,z){TV.set(x,y,z).project(camera);if(TV.z>1)return null;return{x:(TV.x+1)/2*view.clientWidth,y:(1-TV.y)/2*view.clientHeight}}
function enterMode(cls){closePop();K.showTip&&K.showTip(null);document.body.classList.add('xmode');if(cls)document.body.classList.add(cls);K.setInsets(0,0,0)}
function exitMode(){fpExit();document.body.classList.remove('xmode','gmode','vmode');view.classList.remove('visiting');K.keyGrab=false;controls.enabled=true;
  K.INS.l=K.INS.r=K.INS.t=-99;if(window.__applyInsets)window.__applyInsets();else K.setInsets(0,0,0);setTimeout(()=>{K.fitCam();window.__showAdvisor&&window.__showAdvisor()},60)}
let fly=null;
function flyTo(x,z,d,ang=0){const tgt=new THREE.Vector3(x,0,z);const off=new THREE.Vector3(Math.sin(ang)*.62,1,Math.cos(ang)*.95).normalize().multiplyScalar(d);
  fly={t:0,fp:camera.position.clone(),ft:controls.target.clone(),tp:tgt.clone().add(off),tt:tgt}}
function stepFly(dt){if(!fly)return;fly.t=Math.min(1,fly.t+dt*.9);const e=fly.t<.5?4*fly.t**3:1-Math.pow(-2*fly.t+2,3)/2;camera.position.lerpVectors(fly.fp,fly.tp,e);controls.target.lerpVectors(fly.ft,fly.tt,e);if(fly.t>=1)fly=null}

/* ---------- close-up details (only near the camera) ---------- */
const DET=new THREE.Group();scene.add(DET);DET.visible=false;
function grpAt(x,z,ry=0){const g=new THREE.Group();g.position.set(x,h(x,z),z);g.rotation.y=ry;DET.add(g);return g}
const M=(geo,c,x,y,z,p,o)=>K.mesh(geo,K.mat(c,o),x,y,z,p);
{// tea seller by the road
  const g=grpAt(9.7,-1.0,.3);M(new THREE.BoxGeometry(.5,.25,.35),'#7a5a3c',0,.12,0,g);const pot=M(new THREE.CylinderGeometry(.07,.09,.16,8),'#c9a35a',0,.33,0,g);M(new THREE.CylinderGeometry(.04,.04,.08,6),'#c9a35a',.08,.36,0,g).rotation.z=-.9;
  for(let i=0;i<3;i++)M(new THREE.CylinderGeometry(.03,.025,.05,6),'#f4f1ea',-.18+i*.07,.27,.1,g);
  for(const [a,b] of [[.55,.25],[.5,-.35],[-.55,.3]])M(new THREE.CylinderGeometry(.13,.11,.2,8),['#3f6fb0','#b8433a','#2f8f8a'][Math.abs(Math.round(a*10))%3],a,.1,b,g);
  const w=K.makeBody(3101,{woman:true,cloth:'#d9a521',parent:g,scale:.95});w.g.position.set(0,0,-.45);K.sitPose(w,true);w.armR.rotation.x=-.9;
  const c=K.makeBody(3102,{woman:false,parent:g,scale:1});c.g.position.set(.55,0,.25);c.g.rotation.y=-1.8;K.sitPose(c,true);
  K.TIPS.push({o:g,dy:.6,vis:()=>DET.visible,tip:()=>'<b>Tea seller (sit al shai)</b>Women sell sweet tea and jabana coffee by the roadside. It is one of the few jobs open to women without capital.'})}
{// sorghum sacks at the market
  const g=grpAt(7.0,-.6,.2);for(let i=0;i<5;i++){const s=M(new THREE.CylinderGeometry(.16,.18,.42,8),'#e3d5b3',(i%3)*.36-.36,.21,Math.floor(i/3)*.36,g);s.rotation.y=i}
  M(new THREE.BoxGeometry(.3,.02,.3),'#d6a64a',0,.43,0,g);
  K.TIPS.push({o:g,dy:.5,vis:()=>DET.visible,tip:()=>'<b>Sorghum sacks</b>Sorghum is the staple grain, eaten as porridge (asida) and flatbread (kisra). In April 2026 it cost about 1,572 SDG a kilo on average.'})}
{// cooking pots and jerrycans in the IDP site
  for(const [x,z] of [[-3.7,4.0],[0.9,6.3],[-6.4,7.4]]){const g=grpAt(x,z,x);M(new THREE.CylinderGeometry(.13,.1,.14,10),'#3a3a3a',0,.1,0,g);for(let i=0;i<3;i++)M(new THREE.BoxGeometry(.06,.06,.06),'#8a8a8a',Math.cos(i*2.1)*.15,.03,Math.sin(i*2.1)*.15,g);
    for(let i=0;i<3;i++)M(new THREE.BoxGeometry(.11,.15,.08),['#e2b632','#3f8fd0','#e8e2d0'][i],.35+i*.14,.075,.1,g);
    K.TIPS.push({o:g,dy:.4,vis:()=>DET.visible,tip:()=>'<b>Cooking and water</b>A cooking pot on three stones and the family jerrycans. A 20-litre jerrycan is the household water supply for most of a day.'})}}
{// phone charging on a small solar panel
  const g=grpAt(-6.3,3.0,.4);const pnl=M(new THREE.BoxGeometry(.55,.03,.38),'#20406d',0,.32,0,g,{roughness:.35});pnl.rotation.x=-.5;M(new THREE.BoxGeometry(.03,.3,.03),'#555',0,.15,0,g);
  for(let i=0;i<3;i++)M(new THREE.BoxGeometry(.06,.01,.11),'#1c1c1c',-.2+i*.13,.02,.35,g);
  K.TIPS.push({o:g,dy:.5,vis:()=>DET.visible,tip:()=>'<b>Phone charging point</b>A neighbour charges phones on a small solar panel for a fee. Phones keep families in touch with relatives and receive mobile money.'})}
{// prayer mat and kettle near the meeting tree
  const g=grpAt(P.tree.x-2.2,P.tree.z+1.2,.6);M(new THREE.BoxGeometry(.4,.01,.8),'#7a2f3a',0,.01,0,g);M(new THREE.CylinderGeometry(.06,.07,.14,8),'#9aa0a6',.32,.07,.3,g);
  K.TIPS.push({o:g,dy:.3,vis:()=>DET.visible,tip:()=>'<b>Prayer mat and ibrik</b>A water kettle (ibrik) for washing before prayer, beside a mat in the shade.'})}

/* ---------- visit mode ---------- */
const built=k=>S().built[k]!==undefined,act=id=>S().active.includes(id),played=id=>S().played.some(p=>p.id===id);
const srv=g=>Math.round(K.sr(S(),g));
const PLACES=[
 {name:'IDP site',sub:'Tents on the floodplain',x:-1.5,z:5,d:15,a:.2,
  story:()=>{const s=S();let t='<p>About 18,000 internally displaced people live in tents on low ground beside the river. Most fled fighting more than a year ago and lost their homes, land and documents.</p>';
    t+=(built('borehole')&&!s.damaged.borehole)?'<p>Clean water now comes from the solar borehole on Plot '+s.sites.borehole+'. Women no longer walk hours to the old well.</p>':(act('water')?'<p>Water arrives by truck each day, but only while funding lasts.</p>':'<p>There is no safe water nearby. Women walk about 5 km to the old well, or buy river water from donkey carts.</p>');
    t+='<p>Self-reliance here is '+srv('idp')+' out of 100.</p>';return t},
  pts:[[-4.6,6.6,1.2,'Tents',()=>'Most tents are patched plastic sheeting. A family of six shares one tent, and it gets very hot from April to June.'+(played('shelter')?' New sheeting from the shelter kits keeps families drier.':'')],
   [P.fire.x,P.fire.z,.8,'Cooking fire',()=>'Families cook sorghum porridge on firewood. Women and girls walk far to collect wood, which puts them at risk.'],
   [P.tap.x,P.tap.z,2,'Tap stand',()=>act('water')?'Trucked water fills the tank each morning. When the truck is late, the queue grows.':'The tap stand is dry. Without trucking or a borehole, it stays empty.'],
   [6,8.9,1,'Persons with disabilities',()=>'Wheelchairs sink into the sand. Without ramps or hard paths, persons with disabilities depend on neighbours for water, food and health care.'],
   [P.latr.x,P.latr.z,1.4,'Latrines',()=>played('hygiene')?'Lockable latrines with hand-washing points. They are safer for women and girls at night and stop cholera spreading.':'There are too few latrines, so many people use open ground. In the rains this spreads cholera.'],
   [P.food.x,P.food.z,1.2,'Food distribution',()=>act('food')?'Monthly rations of sorghum, pulses and oil. Host families nearby get nothing, which strains relations.':'When rations stop, families eat fewer meals, sell what they own, or borrow from traders.']]},
 {name:'Refugee camp',sub:'South Sudan, Eritrea, Ethiopia',x:P.camp.x,z:-25,d:16,a:-.3,
  story:()=>'<p>About '+fmt(S().pop.ref)+' refugees from South Sudan, Eritrea and Ethiopia live in rows of tents beside the host town. Some arrived years ago; others came this season.</p>'+(built('inclusion')?'<p>With work permits and leased land, many families now farm and work in town alongside their neighbours.</p>':'<p>Without work permits, refugees cannot farm or take formal jobs, so most rely on aid and casual day labour.</p>')+'<p>Self-reliance here is '+srv('ref')+' out of 100.</p>',
  pts:[[P.camp.x,-21.6,1.4,'Reception',()=>'New arrivals are registered here and receive a tent, a ration card and basic household items.'],
   [14,-27,1,'Rows of tents',()=>'Tents stand in tidy rows with numbered blocks. Families from different countries live side by side.'],
   [20,-24,1,'Many languages',()=>'Families speak Arabic, Dinka, Nuer, Tigrinya and Amharic. Children pick up Sudanese Arabic first and often translate for their parents.'],
   [P.refTap.x,P.refTap.z,1.2,'Water tank',()=>act('water')?'Trucked water fills the tank each morning.':'The tank is empty, so families queue at the town hand pump behind host families, which causes friction.'],
   [P.permit.x,P.permit.z,1,'Work permits',()=>built('inclusion')?'Families with permits lease land from host farmers and can be hired legally.':'Refugees need a permit to work and lease land. Without one, they can only find casual work.']]},
 {name:'Returnee village',sub:'Families rebuilding at home',x:P.village.x,z:P.village.z,d:15,a:.4,
  story:()=>{const s=S();return'<p>About '+fmt(s.pop.ret)+' people have come back to the village they fled. Many homes were burned or looted, and some plots are now used by others.</p><p>'+(s.level&&s.level.hlp?'Land committees and surveyors are helping families prove what is theirs.':'Disputes over houses and farmland are common, and there are no papers to settle them.')+'</p><p>Self-reliance here is '+srv('ret')+' out of 100.</p>'},
  pts:[[-17,-12,1.6,'Tukuls',()=>'Families rebuild round mud-brick houses with thatched roofs, called tukuls, one wall at a time.'],
   [-12.6,-9,.8,'Empty foundations',()=>'These are homes not yet rebuilt. Some owners have not come back; others cannot prove the land is theirs.'],
   [-13.8,-12.4,1,'A returnee with a disability',()=>'Back home, but the paths are rough and the house is not rebuilt, so reaching the well and the market is hard.'],
   [(K.FIELDS.ret.x0+K.FIELDS.ret.x1)/2,(K.FIELDS.ret.z0+K.FIELDS.ret.z1)/2,1,'Family plots',()=>played('seeds')?'Seeds and tools arrived, so families could plant again.':'Without seed, many plots stay empty and families buy food at high prices.'],
   [P.hlp.x,P.hlp.z,1,'Land committee',()=>act('hlp')?'A mixed committee with traditional leaders hears competing claims to houses and land.':'There is no committee to hear land claims yet, so disputes can turn violent.']]},
 {name:'Host town',sub:'Market, office and homes',x:16,z:-11,d:17,a:-.2,
  story:()=>'<p>About 30,000 residents live in the town. It has the market, the health centre and the locality office, and all of them are stretched by newcomers.</p><p>Social cohesion is '+Math.round(S().coh)+' out of 100.'+(S().coh<45?' Tension is high, and protests have started at the locality office.':'')+'</p><p>Self-reliance here is '+srv('host')+' out of 100.</p>',
  pts:[[P.market.x,P.market.z,1.4,'Market',()=>'Traders sell sorghum, onions, okra and dried fish. Prices rose as more people arrived.'+(act('cash')?' Cash transfers bring more customers.':'')],
   [9.7,-1,.9,'Tea seller',()=>'Women sell tea and coffee by the road. It is one of the few jobs open to women without capital.'],
   [P.pump.x,P.pump.z,1,'Hand pump',()=>'The only pump in town. Queues are long, and tempers short when refugees and IDPs join.'],
   [P.office.x,P.office.z,1.8,'Locality office',()=>'Authority capacity is '+Math.round(S().cap)+' out of 100. '+(S().cap>=50?'Planners now map services and include every settlement in the plan.':'Planners lack staff and data, so the camps are left out of local plans.')],
   [14,-14.5,1.2,'Homes',()=>'Mud-brick and concrete houses with walled yards. Many host families also shelter relatives who fled.']]},
 {name:'Primary school',sub:'Classes for every group',x:P.primary.x,z:P.primary.z-1,d:12,a:.3,
  story:()=>built('primary')?'<p>Classes have reopened for children from all four groups. Teachers are paid and children get a school meal.</p>':'<p>The school has been closed since the fighting. The roof is damaged and teachers have not been paid for months.</p>',
  pts:[[P.primary.x,P.primary.z,1.4,'Classrooms',()=>built('primary')?'Repaired classrooms with desks, books and a working roof.':'A broken roof and shuttered windows. Rain comes in during the wet season.'],
   [P.primary.x,P.primary.z-2.2,.8,'Children',()=>built('primary')?'Children from the camp, the village and the town learn together.':'Children sit outside with nothing to do. Some work in the market; girls look after younger siblings.'],
   [P.primary.x+2.2,P.primary.z-1,.8,'Teachers',()=>built('primary')?'Teachers are back on the payroll, with training for crowded classes.':'Most teachers left to find paid work elsewhere.']]},
 {name:'Health centre',sub:'One centre for everyone',x:P.clinic.x-1,z:P.clinic.z+.5,d:12,a:-.2,
  story:()=>built('clinic')?'<p>With staff and medicines funded, patients are seen the same day. Health workers catch cholera cases early.</p>':'<p>One nurse sees hundreds of patients a day. Medicines run out by the middle of the month.</p>',
  pts:[[12.5,-4.2,1,'Waiting line',()=>built('clinic')?'A short wait. Mothers with sick children are seen first.':'People wait most of the day, many with sick children. Some go home without being seen.'],
   [P.clinic.x,P.clinic.z,1.6,'Clinic',()=>'Malaria, diarrhoea and malnutrition are the most common reasons for visits.'+(built('power')?' The mini-grid powers lights and a vaccine fridge.':' Without power, vaccines are hard to keep cold.')],
   [P.clinic.x+1.6,P.clinic.z+.6,1.4,'Cholera risk',()=>'In the rains, cholera spreads fast where water is unsafe and latrines are few.']]},
 {name:'Old well',sub:'5 km from the IDP site',x:K.WELL.x+1.5,z:K.WELL.z+3,d:12,a:.5,
  story:()=>'<p>An old hand-dug well about 5 km from the IDP site. When there is no safe water nearby, women and girls walk here and back, often twice a day.</p>'+(K.safeWater('idp')?'<p>With safe water closer to home, fewer women make the trip now.</p>':''),
  pts:[[K.WELL.x,K.WELL.z,1.3,'The well',()=>'The rope and bucket wear out often. In the dry months the water level drops and the queue gets longer.'],
   [-25.2,-10,1,'The path',()=>'The walk takes hours each way, on an open path where women and girls face harassment.'],
   [K.WELL.x+.9,K.WELL.z+.5,.6,'Jerrycans',()=>'A full jerrycan holds 20 litres and weighs 20 kg, carried on the head.']]},
 {name:'Farms',sub:'Fields, canals and seed',x:-15,z:4,d:16,a:.2,
  story:()=>{let t='<p>Returnee and host farmers grow sorghum, groundnuts and vegetables near the river. Most fields depend on the rains.</p>';if(played('cfw'))t+='<p>Canals cleared through cash for work now carry water to the fields.</p>';if(built('landrehab'))t+='<p>Rehabilitated land to the north-west is back in production.</p>';return t},
  pts:[[-17.5,3.4,1,'Sorghum fields',()=>played('seeds')?'Good seed planted before the rains gives a strong harvest.':'Without seed, many fields stay bare.'],
   [-12.8,7,.8,'Canals',()=>played('cfw')?'Cleared canals water the fields for years.':'Canals are silted up, so water does not reach the fields.'],
   [-20,8,1,'Far bank',()=>'More fields lie across the footbridge. Farmers cross each morning with their tools.']]},
 {name:'Dam',sub:'Upstream on the river',x:K.DAMX+.5,z:zr(K.DAMX),d:12,a:1.25,
  story:()=>built('dam')?'<p>The repaired dam stores water for irrigation and holds back flood peaks.</p>':'<p>The dam broke years ago. Cracks run down the wall and water leaks through, so it neither stores water nor holds back floods.</p>',
  pts:[[K.DAMX,zr(K.DAMX),1.2,'The wall',()=>built('dam')?'A repaired concrete wall with working gates.':'Cracks run down the wall, and a leak runs at its base.'],
   [K.DAMX-4,zr(K.DAMX),.6,'Reservoir',()=>built('dam')?'The reservoir is filling and feeds irrigation canals downstream.':'The basin behind the dam is dry silt and reeds.'],
   [K.DAMX+3,zr(K.DAMX)-2.5,.8,'Flood risk',()=>'Without the dam, floods reach the IDP site every rainy season.']]},
 {name:'River and footbridge',sub:'Fishing, crossings, water',x:K.BRIDGE.x+3,z:zr(K.BRIDGE.x)-1.5,d:14,a:.1,
  story:()=>'<p>The river is a lifeline and a risk. People fish, cross to the far fields and fill barrels here. In the rains it floods the low ground.</p>',
  pts:[[K.BRIDGE.x,zr(K.BRIDGE.x),.8,'Footbridge',()=>'A wooden footbridge to the far fields and grazing land. In a flood it is closed.'],
   [-3.2,zr(-3.2)-1.85,1,'Fishing',()=>'Fish add food and a little income for families who have lost their land.'],
   [2,zr(2)-1.9,.8,'Water for sale',()=>'Donkey cart sellers fill their barrels here. The water is not treated.']]},
 {name:'Destroyed homes',sub:'What returnees come back to',x:-31,z:-12.8,d:13,a:1.07,sr:5.4,
  story:()=>'<p>This street beside the returnee village was shelled and burnt during the fighting. Families who return find walls without roofs.</p><p>Before anyone can help them rebuild, they need to show the house is theirs. Many lost their papers in the fire.</p>',
  pts:[[-32.6,-16.2,1,'Burnt house',()=>'The roof beams burnt and the slab fell in. The walls can be reused, but not the roof.'],[-31.2,-11.4,1,'Burnt-out car',()=>'Left where it stopped. Nobody has the means to move it.'],[-29.6,-9.6,1,'A house with one wall',()=>'The family now sleeps at a cousin’s house in the village, eleven people in two rooms.']]},
 {name:'Market street',sub:'Stalls, bakery and tea',x:18,z:K.roadZ(18)+1.2,d:14,a:-1.2,sr:3,
  story:()=>'<p>Stalls line the road in front of the host fields. Traders from the town, the IDP site and the camp sell side by side.</p><p>Prices follow the road and the fuel line. When lorries cannot come, everything costs more.</p>',
  pts:[[24.7,K.roadZ(24.7)+2.2,1.2,'Bakery',()=>'The bread line starts before dawn. The loaf is smaller than last year and costs more.'],[12.25,K.roadZ(12.25)+2,1.2,'Tea seller',()=>'For many displaced women, a kettle and a few stools are the first income after arriving.'],[16.5,K.roadZ(16.5)+2,1,'Vegetable stalls',()=>'Onions, okra and tomatoes, sold in small piles because few people can afford a kilo.']]},
 {name:'Petrol line',sub:'Across the river',x:14,z:K.trackZ(14)+.4,d:15,a:2.6,sr:2.6,
  story:()=>'<p>The only station that still receives fuel is on the far bank. The line of tuk-tuks fills one side of the track for as far as you can see.</p><p>Drivers wait for hours, often overnight. When the river floods, the causeway goes under water and there is no fuel at all.</p>',
  pts:[[K.CAUSEX,zr(K.CAUSEX),1,'Causeway',()=>'A raised crossing with pipes underneath. It is the only way across for vehicles.'],[11,K.trackZ(11)+.5,1,'The line',()=>'Each tuk-tuk in this line is a family without income for the day.'],[K.FUEL.x,K.FUEL.z,1.6,'Petrol station',()=>'Three lines: buses and lorries, cars, and tuk-tuks. Jerrycans are left in line overnight to keep a place.']]}];
let VI=-1,pins=[],panel=null;
function startVisit(i){if(G.on)return;buildFP();if(VI<0)enterMode('vmode');VI=i;closeTalk();if(FP.room)leaveRoom();const pl=PLACES[i];fpEnter('walk');
  const a=(pl.a||0)+.5,r=pl.sr||3.4,sp=free(pl.x+Math.sin(a)*r,pl.z+Math.cos(a)*r);FP.x=sp.x;FP.z=sp.z;FP.yaw=Math.atan2(pl.x-sp.x,pl.z-sp.z);drawVisit();flash()}
function drawVisit(){const pl=PLACES[VI];pins.forEach(p=>p.el.remove());pins=[];if(panel)panel.remove();
  panel=document.createElement('div');panel.className='fphud';
  panel.innerHTML='<div class="fh-t"><label for="fpsel">You are at</label><select id="fpsel">'+PLACES.map((p,k)=>'<option value="'+k+'"'+(k===VI?' selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select></div><div class="fh-s">'+esc(pl.sub)+'</div><details class="fh-d"><summary>About this place</summary><div class="fh-b">'+pl.story()+'</div></details><div class="fh-k"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to walk</span><span>Drag the mouse to look around</span><span><kbd>E</kbd> to talk or go inside</span><span><kbd>Shift</kbd> to walk faster</span></div><div class="fh-n">People with a gold marker will talk to you. Gold rings on the ground are doors.</div><button type="button" class="fh-x">Back to the map</button>';
  view.appendChild(panel);panel.querySelector('select').onchange=e=>{e.target.blur();startVisit(+e.target.value)};panel.querySelector('.fh-x').onclick=endVisit;
  pl.pts.forEach((p,k)=>{const el=document.createElement('div');el.className='xpin';el.innerHTML='<span class="pn"><i>'+(k+1)+'</i></span>';view.appendChild(el);pins.push({el,x:p[0],z:p[1],dy:.75,ttl:p[3],txt:p[4]})})}
function endVisit(){pins.forEach(p=>p.el.remove());pins=[];if(panel)panel.remove();panel=null;VI=-1;fly=null;exitMode()}
addEventListener('keydown',e=>{if(e.key==='Escape'){if(TALK){closeTalk();return}if(FP.room){leaveRoom();return}if(VI>=0)endVisit();else if(G.on)quitJob()}});

/* ---------- role-play games ---------- */
const G={on:false};
const keys={};
addEventListener('keydown',e=>{if(!G.on||G.state!=='play')return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k)){keys[k]=true;G.auto=null;e.preventDefault()}});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
addEventListener('keydown',e=>{if(!G.on)return;if(e.key==='+'||e.key==='=')G.zoom=Math.max(1,G.zoom-1);else if(e.key==='-'||e.key==='_')G.zoom=Math.min(3,G.zoom+1)});
let wAcc=0,wT=0;view.addEventListener('wheel',e=>{if(!G.on||!e.target.closest('canvas'))return;e.preventDefault();const now=performance.now();if(now-wT>400)wAcc=0;wAcc+=e.deltaY;if(Math.abs(wAcc)>50&&now-wT>220){G.zoom=Math.max(1,Math.min(3,G.zoom+(wAcc>0?1:-1)));wAcc=0;wT=now}},{passive:false});
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let downAt=null;
view.addEventListener('pointerdown',e=>{if(G.on)downAt=[e.clientX,e.clientY]});
view.addEventListener('pointerup',e=>{if(FP.on)return;if(!G.on||G.state!=='play'||!downAt||!e.target.closest('canvas'))return;if(Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>8)return;
  const r=view.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);const hit=ray.intersectObject(K.ground,false)[0];if(hit){G.auto={x:hit.point.x,z:hit.point.z}}});
let hud=null,toastEl=null,toastT=0,gpins=[];
function toast(t,cls=''){if(!toastEl)return;toastEl.textContent=t;toastEl.className='gtoast on '+cls;toastT=2.6}
function gpin(cls){const el=document.createElement('div');el.className='gpin '+cls;view.appendChild(el);const p={el,x:0,z:0,dy:1.4,show:false};gpins.push(p);return p}
function card(html,acts){const c=document.createElement('div');c.className='gcard';c.innerHTML='<div>'+html+'</div>';view.appendChild(c);c.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{c.remove();acts[b.dataset.g]&&acts[b.dataset.g]()});const f=c.querySelector('[data-g]');f&&f.focus();return c}
function figure(i,o){const b=K.makeBody(i,o);return b}
/* places for the tuk-tuk */
const STOPS=[['Bus stop',K.LIFE.stop.x+1.4,K.LIFE.stop.z+.8],['Market',P.market.x+.2,P.market.z-1.5],['IDP site',2.2,1.3],['Refugee camp',P.camp.x+1.6,-20.4],['Health centre',P.clinic.x-1.3,-3.0],['Returnee village',-14.8,-5.3],['Host town',14.4,-7.5],['Locality office',P.office.x+1.8,-3.4],['Footbridge',K.BRIDGE.x+1.6,zr(K.BRIDGE.x)-3.4],['Old well',K.WELL.x+1.6,K.WELL.z+1.4]].map(([n,x,z])=>{const f=free(x,z);return{n,x:f.x,z:f.z}});
/* places for the water seller */
const FILLS=[[2.2,zr(2.2)-1.95],[-13,zr(-13)-1.95],[16.5,zr(16.5)-1.95]].map(([x,z])=>({x,z}));
const TROUGHS=[free(P.pump.x+1.4,P.pump.z+1.2),free(-.3,zr(-.3)-2.3)];
const BUYERS=[['IDP site','idp',-.6,1.7],['Refugee camp','ref',P.camp.x+2.6,-20.4],['Host town','host',16.6,-7.6],['Returnee village','ret',-15.6,-5.6]].map(([n,g,x,z])=>{const f=free(x,z);return{n,g,x:f.x,z:f.z}});
const TRG=new THREE.Group();scene.add(TRG);TRG.visible=false;
for(const t of TROUGHS){const g=new THREE.Group();g.position.set(t.x,h(t.x,t.z),t.z);TRG.add(g);M(new THREE.BoxGeometry(.9,.22,.36),'#8a6a48',0,.11,0,g);M(new THREE.BoxGeometry(.8,.02,.26),'#4c8ec4',0,.22,0,g)}
const QG=new THREE.Group();scene.add(QG);QG.visible=false;
for(const B of BUYERS){B.q=[];for(let k=0;k<3;k++){const b=figure(3200+BUYERS.indexOf(B)*5+k,{woman:k!==1,parent:QG});const can=K.mesh(K.geo.can,K.mat(['#e2b632','#3f8fd0','#e8e2d0'][k]),0,-.26,0,b.armR);const x=B.x+.5+k*.45,z=B.z+.35;b.g.position.set(x,h(x,z),z);b.g.rotation.y=-Math.PI/2;B.q.push(b)}}
let veh=null;
const arShape=new THREE.Shape();arShape.moveTo(0,.95);arShape.lineTo(.5,.25);arShape.lineTo(.19,.25);arShape.lineTo(.19,-.55);arShape.lineTo(-.19,-.55);arShape.lineTo(-.19,.25);arShape.lineTo(-.5,.25);arShape.closePath();
const arGeo=new THREE.ShapeGeometry(arShape);arGeo.rotateX(Math.PI/2);
const AR=new THREE.Mesh(arGeo,new THREE.MeshBasicMaterial({color:'#1d5fae',transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));AR.renderOrder=5;AR.visible=false;scene.add(AR);
const rgGeo=new THREE.RingGeometry(.85,1.1,40);rgGeo.rotateX(-Math.PI/2);
const RG=new THREE.Mesh(rgGeo,new THREE.MeshBasicMaterial({color:'#1d5fae',transparent:true,opacity:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));RG.renderOrder=5;RG.visible=false;scene.add(RG);
const EA=document.createElement('div');EA.className='edgearr';EA.innerHTML='<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#1d5fae" stroke="#fff" stroke-width="3"/><path d="M14 24h17M24 15l9 9-9 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';view.appendChild(EA);
const ZM=[1,1.55,2.2];
const UNIT_M=50;
/* navigation: a grid of free cells, A* and string pulling, so the arrow and click-to-drive go round obstacles */
const CELL=.7,NX=Math.ceil(K.W/CELL),NZ=Math.ceil(K.D/CELL);let NAV=null;
const gx=i=>-K.W/2+(i+.5)*CELL,gz=j=>-K.D/2+(j+.5)*CELL,ci=x=>Math.max(0,Math.min(NX-1,Math.floor((x+K.W/2)/CELL))),cj=z=>Math.max(0,Math.min(NZ-1,Math.floor((z+K.D/2)/CELL)));
const nv=new THREE.Vector2();
const inCrop=(x,z)=>{for(const k in K.FIELDS){const f=K.FIELDS[k];if(x>f.x0-.15&&x<f.x1+.15&&z>f.z0-.3&&z<f.z1+.15)return f}return null};
const hitAt=(px,pz)=>{if(inCrop(px,pz))return true;nv.set(px,pz);K.pushOut(nv);return Math.abs(nv.x-px)+Math.abs(nv.y-pz)>.035};
function buildNav(){const any=new Uint8Array(NX*NZ),ctr=new Uint8Array(NX*NZ),near=new Uint8Array(NX*NZ),hc=CELL/2;
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const x=gx(i),z=gz(j),k=j*NX+i;if(hitAt(x,z)){ctr[k]=any[k]=1;continue}
    sample:for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)if((a||b)&&hitAt(x+a*hc,z+b*hc)){any[k]=1;break sample}}
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++)if(any[j*NX+i])for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const ii=i+a,jj=j+b;if(ii>=0&&jj>=0&&ii<NX&&jj<NZ)near[jj*NX+ii]=1}
  NAV={any,ctr,near}}
function Heap(){const k=[],v=[];return{size:()=>k.length,push(key,val){let i=k.length;k.push(key);v.push(val);while(i>0){const p=(i-1)>>1;if(k[p]<=k[i])break;let t=k[p];k[p]=k[i];k[i]=t;t=v[p];v[p]=v[i];v[i]=t;i=p}},pop(){const top=v[0],lk=k.pop(),lv=v.pop();if(k.length){k[0]=lk;v[0]=lv;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<k.length&&k[l]<k[m])m=l;if(r<k.length&&k[r]<k[m])m=r;if(m===i)break;let t=k[m];k[m]=k[i];k[i]=t;t=v[m];v[m]=v[i];v[i]=t;i=m}}return top}}}
function geoLos(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(d/.22));for(let k=1;k<=n;k++){const t=k/n;if(hitAt(x0+(x1-x0)*t,z0+(z1-z0)*t))return false}return true}
/* the free cell nearest to a point that can really be reached from it in a straight line */
function reachCell(x,z,grid){const i0=ci(x),j0=cj(z);for(let r=0;r<7;r++){let best=null,bd=1e9;for(let b=-r;b<=r;b++)for(let a=-r;a<=r;a++){if(Math.max(Math.abs(a),Math.abs(b))!==r)continue;const ii=i0+a,jj=j0+b;if(ii<0||jj<0||ii>=NX||jj>=NZ||grid[jj*NX+ii])continue;const d=Math.hypot(gx(ii)-x,gz(jj)-z);if(d<bd&&geoLos(x,z,gx(ii),gz(jj))){bd=d;best=[ii,jj]}}if(best)return best}return null}
function los(x0,z0,x1,z1,grid){const d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/(CELL*.3));for(let k=1;k<n;k++){const t=k/n;if(grid[cj(z0+(z1-z0)*t)*NX+ci(x0+(x1-x0)*t)])return false}return true}
function findPath(x0,z0,x1,z1){if(!NAV)buildNav();
  if(Math.hypot(x1-x0,z1-z0)<12&&geoLos(x0,z0,x1,z1))return[[x1,z1]];
  for(const grid of [NAV.any,NAV.ctr]){const s=reachCell(x0,z0,grid),e=reachCell(x1,z1,grid);if(!s||!e)continue;
    const N=NX*NZ,g=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N),open=Heap(),sk=s[1]*NX+s[0],ek=e[1]*NX+e[0],near=NAV.near;
    const hf=k=>{const dx=Math.abs(k%NX-e[0]),dz=Math.abs(Math.floor(k/NX)-e[1]);return Math.max(dx,dz)+.414*Math.min(dx,dz)};
    g[sk]=0;open.push(hf(sk),sk);let found=false;
    while(open.size()){const k=open.pop();if(closed[k])continue;closed[k]=1;if(k===ek){found=true;break}
      const i=k%NX,j=(k-i)/NX;
      for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){if(!a&&!b)continue;const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=NX||jj>=NZ)continue;const nk=jj*NX+ii;if(grid[nk]||closed[nk])continue;if(a&&b&&(grid[j*NX+ii]||grid[jj*NX+i]))continue;
        const ng=g[k]+(a&&b?1.414:1)*(near[nk]?1.7:1);if(ng<g[nk]){g[nk]=ng;from[nk]=k;open.push(ng+hf(nk),nk)}}}
    if(!found)continue;
    const pts=[];for(let k=ek;k!==-1;k=from[k])pts.push([gx(k%NX),gz(Math.floor(k/NX))]);pts.reverse();
    const out=[pts[0]];let a=0;while(a<pts.length-1){let b=pts.length-1;while(b>a+1&&!los(pts[a][0],pts[a][1],pts[b][0],pts[b][1],grid))b--;out.push(pts[b]);a=b}
    out.push([x1,z1]);return out}
  return[[x1,z1]]}
function route(C,tx,tz,dt){const key=tx.toFixed(1)+','+tz.toFixed(1);C.t=(C.t||0)-dt;if(C.key!==key||C.t<=0||!C.pts||!C.pts.length){C.key=key;C.t=1.2;C.pts=findPath(G.x,G.z,tx,tz)}
  while(C.pts.length>1&&Math.hypot(C.pts[0][0]-G.x,C.pts[0][1]-G.z)<1.2)C.pts.shift();return C.pts[0]}
const RT_GUIDE={},RT_AUTO={};
function nearest(list,f=()=>true){let b=null,bd=1e9;for(const o of list){if(!f(o))continue;const d=Math.hypot(o.x-G.x,o.z-G.z);if(d<bd){bd=d;b=o}}return b}
function target(){
  if(G.kind==='tuk'){if(G.state==='queue')return null;
    if(G.tank<=14&&!G.ride){const e=K.FUEL.end;return{x:e.x,z:e.z,n:'Petrol station',r:1.6,col:'#e39a27'}}
    if(G.ride){const d=STOPS[G.ride.to];return{x:d.x,z:d.z,n:d.n,r:G.ride.kind?1.4:2.1,col:G.ride.kind?'#e07a3a':'#1d5fae'}}
    const p=nearest(G.pass.map(p=>({x:STOPS[p.from].x,z:STOPS[p.from].z,p})));return p?{x:p.x,z:p.z,n:'Passenger at '+STOPS[p.p.from].n,r:1.9,col:'#1d5fae'}:null}
  if(G.energy<30){const t=nearest(TROUGHS);return{x:t.x,z:t.z,n:'Water trough',r:1.8,col:'#8a6a48'}}
  {const f=nearest(FILLS),near=Math.hypot(f.x-G.x,f.z-G.z)<2.2;if(G.barrel<=0||(G.barrel<11&&near))return{x:f.x,z:f.z,n:'River fill point',r:1.8,col:'#3f8fd0',fill:near}}
  let b=G.buyer&&G.buyer.dem>=1?G.buyer:null;if(!b){let best=-1;for(const B of BUYERS){if(B.dem<1)continue;const sc=Math.min(B.dem,G.barrel)/(Math.hypot(B.x-G.x,B.z-G.z)+10);if(sc>best){best=sc;b=B}}if(!b)b=nearest(BUYERS);G.buyer=b}
  return{x:b.x,z:b.z,n:b.n,r:2.1,col:'#2e8b57',b}}
function guide(dt,t){const T=G.on&&G.state==='play'?target():null;G.tgt=T;
  if(!T||!G.arrow){AR.visible=RG.visible=false;EA.style.display='none';return}
  const dx=T.x-G.x,dz=T.z-G.z,d=Math.hypot(dx,dz),ux=dx/(d||1),uz=dz/(d||1);
  let wx=dx,wz=dz;if(d>3){const wp=route(RT_GUIDE,T.x,T.z,dt);wx=wp[0]-G.x;wz=wp[1]-G.z}const wl=Math.hypot(wx,wz)||1;
  AR.visible=d>T.r;AR.material.color.set(T.col);const ax=G.x+wx/wl*1.5,az=G.z+wz/wl*1.5;AR.position.set(ax,h(ax,az)+.08,az);AR.rotation.y=Math.atan2(wx,wz);AR.scale.setScalar(.55+Math.sin(t*5)*.04);
  RG.visible=true;RG.material.color.set(T.col);RG.position.set(T.x,h(T.x,T.z)+.1,T.z);const k=T.r*(1+Math.sin(t*4)*.08);RG.scale.set(k,1,k);
  if(FP.on){let da=Math.atan2(wx,wz)-(G.yaw+FP.look);da=Math.atan2(Math.sin(da),Math.cos(da));EA.style.display='block';EA.style.left=(view.clientWidth/2)+'px';EA.style.top='7.4rem';EA.style.transform='rotate('+(-Math.PI/2-da)+'rad)';EA.querySelector('circle').setAttribute('fill',T.col);return}
  TV.set(T.x,h(T.x,T.z)+.5,T.z).project(camera);const W=view.clientWidth,H=view.clientHeight;let sx=(TV.x+1)/2*W,sy=(1-TV.y)/2*H;const behind=TV.z>1;
  const off=behind||sx<30||sx>W-30||sy<90||sy>H-30;
  if(!off){EA.style.display='none';return}
  let vx=sx-W/2,vy=sy-H/2;if(behind){vx=-vx;vy=-vy}const L=Math.hypot(vx,vy)||1;vx/=L;vy/=L;
  const mx=W/2-40,my=H/2-60,s2=Math.min(Math.abs(vx)>1e-3?mx/Math.abs(vx):1e9,Math.abs(vy)>1e-3?my/Math.abs(vy):1e9);
  EA.style.display='block';EA.style.left=(W/2+vx*s2)+'px';EA.style.top=(H/2+vy*s2+10)+'px';EA.style.transform='rotate('+Math.atan2(vy,vx)+'rad)';EA.querySelector('circle').setAttribute('fill',T.col)}
const distTxt=T=>T?Math.max(10,Math.round(Math.hypot(T.x-G.x,T.z-G.z)*UNIT_M/10)*10).toLocaleString('en-US')+' m':'';
function makeVehicle(kind){
  if(kind==='tuk'){const T=K.makeTuk('#d9a521');T.pass.g.visible=false;return{g:T.g,pass:T.pass,driver:T.driver}}
  const D=K.makeDonkey();const man=figure(3301,{woman:false,parent:D.g,scale:.87});man.g.position.set(0,.33,.14);K.sitPose(man,true);man.armL.rotation.x=man.armR.rotation.x=-.9;return{g:D.g,legs:D.legs,barrel:D.barrel,man}}
function startJob(kind){if(G.on)return;if(VI>=0)endVisit();NAV=null;RT_GUIDE.pts=RT_AUTO.pts=null;G.buyer=null;
  Object.assign(G,{on:true,kind,state:'intro',time:180,money:0,fuel:0,fares:0,trips:0,spd:0,auto:null,pass:[],ride:null,barrel:0,sold:0,energy:100,act:0,sinceSpawn:0,nino:S().season>=4,tank:46,tank0:46,lowMsg:false,zoom:G.zoom||2,arrow:G.arrow!==false,qWait:0,qDone:false});
  enterMode('gmode');controls.enabled=false;K.keyGrab=true;buildFP();fpEnter('drive');
  const start=kind==='tuk'?free(K.LIFE.stand.x,K.LIFE.stand.z+.6):free(FILLS[0].x+1,FILLS[0].z-1.2);
  veh=makeVehicle(kind);G.x=start.x;G.z=start.z;G.yaw=kind==='tuk'?Math.PI/2:Math.PI;veh.g.scale.multiplyScalar(.62);veh.g.traverse(m=>{if(m.isMesh&&m.material.transparent)m.visible=false});if(kind==='tuk'){veh.driver.g.visible=false;M(B3(.44,.03,.03),'#2b2b2b',0,.6,.5,veh.g);M(CY(.015,.015,.3,5),'#2b2b2b',0,.48,.52,veh.g).rotation.x=.5;FP.eye=.5;FP.fwd=.3}else{veh.man.g.visible=false;FP.eye=.76;FP.fwd=-.14;FP.pitch=-.22}placeVeh();camFollow(0);
  const zm=ZM[G.zoom-1];camera.position.set(G.x,8.5*zm,G.z+10.5*zm);controls.target.set(G.x,0,G.z);
  hud=document.createElement('div');hud.className='ghud';view.appendChild(hud);toastEl=document.createElement('div');toastEl.className='gtoast';view.appendChild(toastEl);
  const kb=document.createElement('div');kb.className='gkeys';kb.innerHTML='<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span><b>Drive:</b> arrow keys or W A S D. <b>Look:</b> drag the mouse. <b>Esc</b> to leave.</span><button type="button" data-a class="gbtn">Hide arrow</button><button type="button" data-q class="gbtn"><b>Leave</b></button></div>';view.appendChild(kb);G.kb=kb;
  kb.querySelector('[data-a]').onclick=e=>{G.arrow=!G.arrow;e.currentTarget.textContent=G.arrow?'Hide arrow':'Show arrow'};kb.querySelector('[data-q]').onclick=quitJob;
  if(kind==='tuk'){for(let k=0;k<3;k++)spawnPassenger();G.dpin=gpin('dest')}
  else{TRG.visible=QG.visible=true;G.fpins=FILLS.map(f=>{const p=gpin('fill');p.x=f.x;p.z=f.z;p.show=true;p.el.innerHTML='Fill here';return p});
    G.tpins=TROUGHS.map(t=>{const p=gpin('trough');p.x=t.x;p.z=t.z;p.dy=1;p.show=true;p.el.innerHTML='Water trough';return p});
    BUYERS.forEach(B=>{const safe=K.safeWater(B.g),tank=B.g!=='host'&&S().active.includes('water');B.rate=B.g==='host'?.13:(safe?.06:(tank?.12:.3));B.dem=Math.round(B.g==='host'?5:(safe?2:(tank?4:9)));B.acc=0;B.pin=gpin('');B.pin.x=B.x;B.pin.z=B.z;B.pin.show=true})}
  drawHud();
  const bh=K.safeWater('idp');
  const intro=kind==='tuk'?
   '<h2>Tuk-tuk driver</h2><div class="sub">3 minutes. Goal: take home 10,000 SDG after fuel.</div><ul><li>Drive to a passenger waving at a stop, then slow down to let them in.</li><li>Take them to the stop shown on the map. Short trips pay 2,000 SDG, middle ones 3,000 SDG, long ones 5,000 SDG.</li><li>Your tank is less than half full, because fuel is scarce. When it runs low, the arrow takes you over the causeway to the back of the petrol line on the far bank'+(G.nino?', which is even longer in this El Niño year':'')+'. Joining the line ends your day.</li><li>You sit in the driver’s seat. Follow the blue arrow on the ground and the compass at the top of the screen.</li><li>Passengers using a wheelchair or going to the health centre need you to stop right at the door.</li></ul><p>Fares are based on recent shared rides in Khartoum, where a short trip cost about 2,000 to 3,000 SDG.</p>'
   :'<h2>Donkey water seller</h2><div class="sub">3 minutes. Goal: sell 2 barrels of water, about 10,000 SDG.</div><ul><li>Ride to the river and stop at a fill point to fill your barrel (11 jerrycans).</li><li>Sell by the jerrycan at the IDP site, the refugee camp, the host town and the returnee village, for 450 SDG each.</li><li>Your donkey gets tired. Stop at a water trough to rest it, or it slows down.</li><li>You sit on the cart behind your donkey. Follow the arrow on the ground and the compass: to the river when the barrel is empty, then to the families waiting to buy.</li></ul><p>'+(bh?'The solar borehole now gives free clean water at the IDP site, so fewer families there buy from carts.':'With no safe water nearby, many families depend on carts like yours.')+' A barrel sells for about 5,000 SDG, as in recent reports from Khartoum.</p>';
  card(intro+'<div class="foot"><button class="btn" data-g="leave">Not now</button><button class="btn btn-primary" data-g="go">Start</button></div>',{go:()=>{G.state='play'},leave:quitJob})}
function spawnPassenger(){const used=new Set(G.pass.map(p=>p.from).concat(G.ride?[G.ride.from]:[]));const opts=STOPS.map((s,i)=>i).filter(i=>!used.has(i));if(!opts.length)return;
  const from=opts[Math.floor(Math.random()*opts.length)];let to;do{to=Math.floor(Math.random()*STOPS.length)}while(to===from);
  if(Math.random()<.3)to=4;if(to===from)to=(from+3)%STOPS.length;
  const a=STOPS[from],b=STOPS[to],d=Math.hypot(a.x-b.x,a.z-b.z),fare=d<18?2000:(d<32?3000:5000);
  const kind=to===4?'sick':(Math.random()<.18?'chair':'');
  const f=figure(3400+Math.floor(Math.random()*400),{woman:Math.random()<.5});f.g.position.set(a.x,h(a.x,a.z),a.z);f.g.rotation.y=Math.random()*6;
  const pin=gpin(kind?'door':'');pin.x=a.x;pin.z=a.z;pin.show=true;pin.el.innerHTML=fmt(fare)+' SDG <small>to '+esc(b.n)+'</small>';
  G.pass.push({from,to,fare,kind,f,pin,wave:Math.random()*6})}
function placeVeh(){veh.g.position.set(G.x,h(G.x,G.z),G.z);veh.g.rotation.y=G.yaw}
function drawHud(){if(!hud)return;const t=Math.max(0,G.time),mm=Math.floor(t/60),ss=String(Math.floor(t%60)).padStart(2,'0');
  const T=G.tgt,dist=distTxt(T);let task,cards='';
  if(G.kind==='tuk'){const net=G.fares-Math.round((G.tank0-G.tank)*50*(G.nino?1.35:1)/10)*10;
    if(G.state==='queue')task='Waiting in the fuel queue: '+Math.ceil(G.qWait)+' s';
    else if(G.tank<=0)task='Out of fuel. Push the tuk-tuk to the petrol station'+(dist&&!G.ride?', '+dist:'');
    else if(G.tank<=18&&!G.ride)task='Fuel is low. Go to the petrol station, '+dist;
    else if(G.ride)task='Take your passenger to '+esc(STOPS[G.ride.to].n)+', '+dist+(G.ride.kind?'. Stop right at the door':'');
    else task=T?'Pick up the passenger waiting at '+esc(T.n.replace('Passenger at ',''))+', '+dist:'Wait for a passenger';
    cards='<div class="gc goal"><small>Take-home</small><b>'+fmt(net)+' SDG</b><span class="bar"><i style="width:'+Math.max(0,Math.min(100,net/250))+'%"></i></span></div><div class="gc"><small>Fares</small><b>'+fmt(G.fares)+'</b></div><div class="gc fuel'+(G.tank<=18?' low':'')+'"><small>Tank</small><b>'+Math.round(G.tank)+'%</b><span class="bar"><i style="width:'+G.tank+'%"></i></span></div>'}
  else{const brl=G.sold/11;
    if(G.energy<30)task='Your donkey is tired. Rest it at the water trough, '+dist;
    else if(T&&T.fill)task='Hold still while the barrel fills: '+G.barrel+' of 11 jerrycans';
    else if(G.barrel<=0)task='Your barrel is empty. Fill it at the river, '+dist;
    else if(T&&T.b)task=T.b.dem>=1?'Sell water at '+esc(T.b.n)+': '+Math.floor(T.b.dem)+(Math.floor(T.b.dem)===1?' family':' families')+' waiting, '+dist:'No one needs water right now. Try another place';
    else task='Sell your water';
    task+=' ('+G.barrel+(G.barrel===1?' jerrycan':' jerrycans')+' left)';
    cards='<div class="gc goal"><small>Barrels sold</small><b>'+brl.toFixed(1)+' of 2</b><span class="bar"><i style="width:'+Math.min(100,brl/2*100)+'%"></i></span></div><div class="gc"><small>Earned</small><b>'+fmt(G.money)+' SDG</b></div><div class="gc fuel'+(G.energy<30?' low':'')+'"><small>Donkey</small><b>'+Math.round(G.energy)+'%</b><span class="bar"><i style="width:'+G.energy+'%"></i></span></div>'}
  hud.innerHTML='<div class="gc"><small>Time</small><b>'+mm+':'+ss+'</b></div>'+cards+'<div class="gc task"><small>Now</small><b>'+task+'</b></div>';
}
function quitJob(){if(!G.on)return;cleanup();exitMode()}
function cleanup(){G.on=false;G.state='off';if(veh){veh.g.parent&&veh.g.parent.remove(veh.g);veh=null}for(const p of G.pass||[])p.f.g.parent&&p.f.g.parent.remove(p.f.g);G.pass=[];G.ride=null;
  gpins.forEach(p=>p.el.remove());gpins=[];hud&&hud.remove();hud=null;toastEl&&toastEl.remove();toastEl=null;G.kb&&G.kb.remove();TRG.visible=QG.visible=false;AR.visible=RG.visible=false;EA.style.display='none';document.querySelectorAll('.gcard').forEach(c=>c.remove());for(const k in keys)keys[k]=false}
function finish(why,late){G.state='done';const kind=G.kind;let html;
  if(kind==='tuk'){G.fuel=Math.round((G.tank0-G.tank)*50*(G.nino?1.35:1)/10)*10;const net=G.fares-G.fuel,ok=net>=10000;
    if(why==='fuel'){const n=K.FUEL.n||4;html='<h2>Petrol shortage</h2><div class="sub">Tuk-tuk driver, after '+(()=>{const e=Math.round(180-G.time);return e<60?e+' seconds':Math.floor(e/60)+' min '+String(e%60).padStart(2,'0')+' s'})()+' on the road</div><p>'+(late?'The day ends where most days end for a driver: at the back of the petrol line. There are '+n+' vehicles ahead of you, in a line':'You joined the back of a line of '+n+' vehicles')+' that stretches right across the far bank. The only station with fuel is across the river, the pumps run dry often, and the line barely moves. Drivers can wait for hours, sometimes overnight, and every hour in the queue is an hour without fares'+(G.nino?'. In this El Niño year the queue is even longer and fuel costs more':'')+'.</p><p>For most drivers the hardest part of the day is not finding passengers. It is finding fuel.</p><div class="big">'+fmt(net)+' SDG</div><div class="res"><span>Trips</span><span>'+G.trips+'</span><span>Fares</span><span>'+fmt(G.fares)+'</span><span>Fuel used, paid at the pump</span><span>\u2212'+fmt(G.fuel)+'</span><span>Goal: 10,000 SDG</span><span class="'+(ok?'ok':'no')+'">'+(ok?'Met':'Not met')+'</span></div>'}else
    html='<h2>'+(ok?'A good day on the road':'A hard day on the road')+'</h2><div class="sub">Tuk-tuk driver, 3 minutes</div><div class="big">'+fmt(net)+' SDG</div><div class="res"><span>Trips</span><span>'+G.trips+'</span><span>Fares</span><span>'+fmt(G.fares)+'</span><span>Fuel used'+(G.nino?' (El Niño prices)':'')+'</span><span>−'+fmt(G.fuel)+'</span><span>Goal: 10,000 SDG</span><span class="'+(ok?'ok':'no')+'">'+(ok?'Met':'Not met')+'</span></div>'}
  else{const brl=G.sold/11,ok=brl>=2;
    html='<h2>'+(ok?'Two barrels sold':'Not enough water sold')+'</h2><div class="sub">Donkey water seller, 3 minutes</div><div class="big">'+fmt(G.money)+' SDG</div><div class="res"><span>Jerrycans sold</span><span>'+G.sold+'</span><span>Barrels</span><span>'+brl.toFixed(1)+'</span><span>Goal: 2 barrels</span><span class="'+(ok?'ok':'no')+'">'+(ok?'Met':'Not met')+'</span></div>'+
      (K.safeWater('idp')?'<p>Families at the IDP site now get free clean water from the borehole, so fewer bought from you. Cleaner water for everyone means less income for water sellers, unless they find other work.</p>':'<p>With no safe water at the IDP site, families there had to buy from carts like yours, often untreated river water.</p>')}
  const earned=kind==='tuk'?G.fares-G.fuel:G.money;
  html+='<p><b>What it buys:</b> about '+fmt(Math.max(0,earned)/PRICE.sorghum)+' kg of sorghum, at 1,572 SDG a kilo. A day of casual labour paid about 14,704 SDG in April 2026, so this is '+(earned>=PRICE.wage?'more than':'less than')+' a day’s wage.</p><div class="src">'+SRC+'</div>';
  html+='<div class="foot"><button class="btn" data-g="map">Back to the map</button><button class="btn btn-primary" data-g="again">Play again</button></div>';
  card(html,{map:quitJob,again:()=>{const k=kind;cleanup();exitMode();setTimeout(()=>startJob(k),120)}})}
const tmpV=new THREE.Vector2();
function camFollow(dt){FP.x=G.x;FP.z=G.z;FP.yaw=G.yaw;if(!fpDrag)FP.look*=1-Math.min(1,dt*2.5);FP.bob+=Math.abs(G.spd)*dt*(G.kind==='tuk'?13:8)}
function stepGame(dt){
  if(G.state==='queue'){G.time-=dt;G.qWait-=dt;G.spd=0;placeVeh();if(G.qWait<=0){const cost=Math.round((G.tank0-G.tank)*50*(G.nino?1.35:1)/10)*10;G.fuel+=cost;G.tank=100;G.state='play';G.qDone=true;toast('Tank full. You paid '+fmt(cost)+' SDG for fuel.','good')}
    if(G.time<=0){G.time=0;drawHud();finish();return}camFollow(dt);G.hudT=(G.hudT||0)+dt;if(G.hudT>.25){G.hudT=0;drawHud()}return}
  if(G.state!=='play'){if(veh)placeVeh();return}
  G.time-=dt;if(G.time<=0){G.time=0;drawHud();if(G.kind==='tuk'){const e=K.FUEL.end;G.x=Math.min(K.W/2-1,e.x+.35);G.z=e.z;G.yaw=-Math.PI/2;G.spd=0;placeVeh();camFollow(0);FP.look=0;FP.pitch=-.06;finish('fuel',true)}else finish();return}
  // input
  let f=(keys.arrowup||keys.w?1:0)-(keys.arrowdown||keys.s?1:0),turn=(keys.arrowleft||keys.a?1:0)-(keys.arrowright||keys.d?1:0);
  if(G.auto){const d=Math.hypot(G.auto.x-G.x,G.auto.z-G.z);if(d<.5){G.auto=null}else{const wp=d>2.5?route(RT_AUTO,G.auto.x,G.auto.z,dt):[G.auto.x,G.auto.z],dx=wp[0]-G.x,dz=wp[1]-G.z;let da=Math.atan2(dx,dz)-G.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));turn=Math.max(-1,Math.min(1,da*2.2));f=Math.abs(da)>1.6?.3:(d<1.5?.5:1)}}
  const onRoad=K.roadD(G.x,G.z)<1.1;
  let max=G.kind==='tuk'?(G.tank<=0?.6:(onRoad?3.5:2.2)):1.9*(G.energy<30?.5:1);
  const want=f>0?f*max:(f<0?-max*.4:0);G.spd+=(want-G.spd)*Math.min(1,dt*(f?1.8:3.2));
  G.yaw+=turn*dt*2.4*(Math.min(1,Math.abs(G.spd)/1.2)*.8+.2)*(G.spd<-.05?-1:1);
  const ox=G.x,oz=G.z;tmpV.set(G.x+Math.sin(G.yaw)*G.spd*dt,G.z+Math.cos(G.yaw)*G.spd*dt);if(G.kind==='tuk')solid(tmpV,G.yaw,.2,.34,.3);else solid(tmpV,G.yaw,.2,.62,.36);
  const moved=Math.hypot(tmpV.x-ox,tmpV.y-oz);if(Math.abs(G.spd)*dt>1e-4&&moved<Math.abs(G.spd)*dt*.3)G.spd*=.6;
  G.x=tmpV.x;G.z=tmpV.y;placeVeh();
  // wheels and legs
  if(veh.legs){veh.phase=(veh.phase||0)+moved*7;veh.legs.forEach((lg,j)=>lg.rotation.x=moved>1e-4?Math.sin(veh.phase+(j%2?Math.PI:0)+(j>1?Math.PI/2:0))*.5:0)}
  else veh.g.rotation.z=moved>1e-4?Math.sin(performance.now()/60)*.01:0;
  const slow=Math.abs(G.spd)<.7;
  if(G.kind==='tuk'){G.tank=Math.max(4,G.tank-moved*.2);
    {const e=K.FUEL.end,de=Math.hypot(e.x-G.x,e.z-G.z);if(de>3)G.qDone=false;if(de<2.2&&slow&&G.tank<=30){finish('fuel');return}}if(G.tank<=14&&!G.lowMsg){G.lowMsg=true;toast('Fuel is low. Cross the causeway and join the petrol line.','bad')}
    for(const p of G.pass){p.wave+=dt*6;p.f.armR.rotation.x=-2.6+Math.sin(p.wave)*.4;p.f.g.rotation.y=Math.atan2(G.x-p.f.g.position.x,G.z-p.f.g.position.z)}
    if(!G.ride){const p=G.pass.find(p=>Math.hypot(STOPS[p.from].x-G.x,STOPS[p.from].z-G.z)<1.9);if(p&&slow){G.ride=p;G.pass=G.pass.filter(q=>q!==p);p.f.g.parent.remove(p.f.g);p.pin.show=false;p.pin.el.remove();gpins=gpins.filter(q=>q!==p.pin);veh.pass.g.visible=true;
        toast((p.kind==='chair'?'A passenger who uses a wheelchair':(p.kind==='sick'?'A sick passenger':'A passenger'))+' gets in. To '+STOPS[p.to].n+'.');G.sinceSpawn=0}}
    else{const d=STOPS[G.ride.to],dd=Math.hypot(d.x-G.x,d.z-G.z),rr=G.ride.kind?1.4:2.1;
      if(dd<rr&&slow){G.fares+=G.ride.fare;G.trips++;veh.pass.g.visible=false;toast('+'+fmt(G.ride.fare)+' SDG. '+(G.ride.kind==='chair'?'You stopped at the door, so she could get out safely.':'Passenger dropped off.'),'good');G.ride=null}
      else if(dd<3.2&&slow&&G.ride.kind&&dd>=rr&&!G.warned){toast('Closer to the door, please.','bad');G.warned=true}
      if(dd>3.2)G.warned=false}
    G.sinceSpawn+=dt;if(G.pass.length<3&&G.sinceSpawn>2.5){spawnPassenger();G.sinceSpawn=0}
    if(G.dpin){G.dpin.show=!!G.ride;if(G.ride){const d=STOPS[G.ride.to];G.dpin.x=d.x;G.dpin.z=d.z;G.dpin.el.innerHTML='Drop off: '+esc(d.n)+(G.ride.kind?' <small>at the door</small>':'')}}}
  else{G.energy=Math.max(0,G.energy-moved*.32);
    if(slow){const fp=FILLS.find(f=>Math.hypot(f.x-G.x,f.z-G.z)<1.8);
      if(fp&&G.barrel<11){G.act+=dt;if(G.act>.3){G.act=0;G.barrel++;if(G.barrel===11)toast('Barrel full: 11 jerrycans.','good')}}
      const tr=TROUGHS.find(t=>Math.hypot(t.x-G.x,t.z-G.z)<1.8);if(tr&&G.energy<100){G.energy=Math.min(100,G.energy+dt*22);if(G.energy>=99.5)toast('Your donkey is rested.','good')}
      const by=BUYERS.find(B=>Math.hypot(B.x-G.x,B.z-G.z)<2.1);
      if(by&&G.barrel>0){if(by.dem>=1){G.act+=dt;if(G.act>.55){G.act=0;G.barrel--;by.dem--;G.sold++;G.money+=PRICE.jerry}}else if(!G.noDem){toast('No one here needs water right now.','bad');G.noDem=true}}
      if(!by)G.noDem=false}
    for(const B of BUYERS){B.acc+=dt*B.rate;if(B.acc>=1&&B.dem<12){B.dem++;B.acc=0}B.q.forEach((b,k)=>b.g.visible=k<Math.min(3,Math.floor(B.dem)));B.pin.el.innerHTML=esc(B.n)+' <small>'+Math.floor(B.dem)+' want water</small>'}
    if(veh.barrel)veh.barrel.material.color.set(G.barrel>0?'#3e7fc2':'#8b9099')}
  // camera follows
  camFollow(dt);
  if(toastT>0){toastT-=dt;if(toastT<=0&&toastEl)toastEl.classList.remove('on')}
  G.hudT=(G.hudT||0)+dt;if(G.hudT>.25){G.hudT=0;drawHud()}}

/* ---------- first person: walk through places, go inside, talk to people ---------- */
const FP={on:false,x:0,z:0,yaw:0,pitch:0,look:0,fwd:0,room:null,eye:.52,bob:0,mode:'',goto:null};
const fk={};let fpSave=null,fpDrag=null,TALK=null,NEARBY=null;
const B3=K.B3,CY=K.CY;
K.fpCam=()=>{const y0=FP.room?FP.room.y:h(FP.x,FP.z);scene.fog.near=30;scene.fog.far=175;
  camera.position.set(FP.x+Math.sin(FP.yaw)*FP.fwd,y0+FP.eye+Math.sin(FP.bob)*.01,FP.z+Math.cos(FP.yaw)*FP.fwd);camera.rotation.order='YXZ';camera.rotation.set(FP.pitch,FP.yaw+FP.look+Math.PI,0)};
function fpEnter(mode){if(!FP.on){fpSave={pos:camera.position.clone(),tgt:controls.target.clone(),near:camera.near};FP.on=true;controls.enabled=false;K.keyGrab=true;K.fov=mode==='walk'?64:70;camera.near=.03;K.setFP(true);document.body.classList.add('fp');K.INS.l=-99;K.setInsets(0,0,0,0);NAV=null;for(const k in fk)fk[k]=false}
  FP.mode=mode;FP.room=null;FP.pitch=mode==='walk'?-.03:-.08;FP.look=0;FP.fwd=0;FP.eye=.52;FP.goto=null}
function fpExit(){if(!FP.on)return;closeTalk();FP.on=false;if(FP.room)FP.room.g.visible=false;FP.room=null;ROOMS.visible=false;K.fov=0;camera.near=fpSave.near;camera.rotation.order='XYZ';K.setFP(false);document.body.classList.remove('fp');camera.position.copy(fpSave.pos);controls.target.copy(fpSave.tgt);NAV=null;prompt(null);caption(null)}
view.addEventListener('pointerdown',e=>{if(!FP.on||!e.target.closest('canvas'))return;fpDrag={x:e.clientX,y:e.clientY,moved:0}});
addEventListener('pointermove',e=>{if(!fpDrag||!FP.on)return;const dx=e.clientX-fpDrag.x,dy=e.clientY-fpDrag.y;fpDrag.x=e.clientX;fpDrag.y=e.clientY;fpDrag.moved+=Math.abs(dx)+Math.abs(dy);
  if(FP.mode==='walk')FP.yaw-=dx*.0045;else FP.look=Math.max(-1.4,Math.min(1.4,FP.look-dx*.0045));FP.pitch=Math.max(-.9,Math.min(.7,FP.pitch-dy*.0035))});
addEventListener('pointerup',()=>{if(fpDrag&&FP.on&&fpDrag.moved<6&&FP.mode==='walk'&&!TALK)fpUse();fpDrag=null});
addEventListener('keydown',e=>{if(!FP.on||FP.mode!=='walk')return;const k=e.key.toLowerCase();
  if(TALK){if('1234'.includes(k)&&k!==''){askQ(+k-1);e.preventDefault()}return}
  if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','shift','e','enter',' '].includes(k)){fk[k]=true;if(k==='e'||k==='enter'||k===' ')fpUse();e.preventDefault()}});
addEventListener('keyup',e=>{fk[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{for(const k in fk)fk[k]=false});

/* signs and notices drawn on a canvas */
function sign(lines,w,hh,bg='#f4f1ea',fg='#1b2a3a',px=38){const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*hh/w);const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
  const L=[].concat(lines);L.forEach((t,i)=>{g.font=(i?'600 ':'700 ')+(i?px*.72:px)+'px Barlow, Arial, sans-serif';g.fillText(t,c.width/2,c.height*(i+1)/(L.length+1))});
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,hh),new THREE.MeshBasicMaterial({map:t}));return m}
const glow=(c,i=.9)=>K.mat(c,{emissive:c,emissiveIntensity:i});

/* rooms are built once, away from the map, and shown only while you are inside */
const ROOMS=new THREE.Group();scene.add(ROOMS);ROOMS.visible=false;const RM={};
function roomShell(key,ox,w,d,ht,o){const g=new THREE.Group();g.position.set(ox,-40,300);ROOMS.add(g);g.visible=false;const t=.08;
  const dh=o.dh||.8;M(B3(w+t*2,.06,d+t*2),o.floor,0,-.03,0,g);if(!o.noCeil)M(B3(w+t*2,.06,d+t*2),o.ceil||'#cfc9ba',0,ht+.03,0,g);
  M(B3(w+t*2,ht,t),o.wall,0,ht/2,-d/2-t/2,g);M(B3(t,ht,d),o.wall,-w/2-t/2,ht/2,0,g);M(B3(t,ht,d),o.wall,w/2+t/2,ht/2,0,g);
  // front wall with a doorway
  const dx=o.door,dw=.42;M(B3(dx-dw/2+w/2+t,ht,t),o.wall,(-w/2-t+dx-dw/2)/2,ht/2,d/2+t/2,g);M(B3(w/2+t-dx-dw/2,ht,t),o.wall,(w/2+t+dx+dw/2)/2,ht/2,d/2+t/2,g);if(ht-dh>.02)M(B3(dw,ht-dh,t),o.wall,dx,dh+(ht-dh)/2,d/2+t/2,g);
  const day=M(B3(dw,dh,.02),'#fff3d0',dx,dh/2,d/2+t,g,{emissive:'#ffe9b0',emissiveIntensity:1});
  if(o.dado){for(const [x,z,ww,dd] of [[0,-d/2+.006,w,.012],[-w/2+.006,0,.012,d],[w/2-.006,0,.012,d]])M(B3(ww,ht*.36,dd),o.dado,x,ht*.18,z,g)}
  const R={key,g,x:ox,z:300,y:-40,w,d,ht,boxes:[],npcs:[],spawn:{x:ox+dx,z:300+d/2-.35,yaw:Math.PI},exit:{x:ox+dx,z:300+d/2-.2},
    box(x,z,hw,hd){this.boxes.push({x,z,hw,hd})},
    clamp(nx,nz){let lx=nx-this.x,lz=nz-this.z;const m=.13;lx=Math.max(-w/2+m,Math.min(w/2-m,lx));lz=Math.max(-d/2+m,Math.min(d/2-m,lz));
      for(const b of this.boxes){const ex=b.hw+m-Math.abs(lx-b.x),ez=b.hd+m-Math.abs(lz-b.z);if(ex>0&&ez>0){if(ex<ez)lx=b.x+(lx<b.x?-1:1)*(b.hw+m);else lz=b.z+(lz<b.z?-1:1)*(b.hd+m)}}
      return[this.x+lx,this.z+lz]}};
  RM[key]=R;return R}
const win=(R,x,y,z,w,hh,side)=>{const m=M(side?B3(.02,hh,w):B3(w,hh,.02),'#fff3d0',x,y,z,R.g,{emissive:'#ffedc0',emissiveIntensity:1});const fr=M(side?B3(.03,.03,w+.06):B3(w+.06,.03,.03),'#7a6a55',x,y-hh/2,z,R.g);return m};
function person(R,i,x,z,ry,o={}){const b=K.makeBody(i,{parent:R.g,scale:o.child?.42:(o.s||.6),woman:o.woman,child:o.child,cloth:o.cloth});b.g.position.set(x,o.y||0,z);b.g.rotation.y=ry;if(o.sit)K.sitPose(b,true);
  if(o.lie){b.g.rotation.order='YXZ';b.g.rotation.set(-Math.PI/2,ry,0);b.g.position.y=(o.y||0)+.06}return b}
const finishRoom=R=>{R.g.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false}})};

function buildClinic(){const R=roomShell('clinic',300,4.3,3.1,1.15,{floor:'#a9a293',wall:'#d6d1c2',dado:'#8fb0c4',door:1.5}),g=R.g,w=4.3,d=3.1;
  win(R,-1.2,.72,-d/2+.01,.6,.36);win(R,.4,.72,-d/2+.01,.6,.36);M(B3(.012,.34,.5),'#8a8474',-2.14,.62,-.2,g);
  // damp patches and a cracked wall
  for(const [x,y,s] of [[-.4,.95,.3],[1.3,.9,.22],[-1.8,.98,.26]])M(CY(s,s*.8,.01,9),'#b3ab98',x,y,-d/2+.012,g).rotation.x=Math.PI/2;
  const bed=(x,z,ry,o={})=>{const b=new THREE.Group();b.position.set(x,0,z);b.rotation.y=ry;g.add(b);M(B3(.34,.03,.74),'#8d949b',0,.2,0,b);for(const [a,c] of [[-.15,-.34],[.15,-.34],[-.15,.34],[.15,.34]])M(B3(.025,.2,.025),'#8d949b',a,.1,c,b);M(B3(.34,.16,.025),'#8d949b',0,.3,-.37,b);
    M(B3(.31,.04,.7),o.bare?'#b9ad98':'#e3ddd0',0,.235,0,b);if(!o.bare)M(B3(.2,.035,.14),'#f1ede2',0,.27,-.26,b);return b};
  const pat=(i,x,z,ry,o={})=>{const p=person(R,i,x,z,ry,{...o,lie:true,y:o.y===undefined?.2:o.y});return p};
  // north row: five beds, all taken, two people in one of them
  [-1.85,-1.25,-.65,-.05,.55].forEach((x,i)=>{bed(x,-1.12,0,{bare:i===3});pat(3400+i,x+(i===1?-.07:0),-1.02,0,{woman:i%2===0,s:.56});if(i===1)pat(3410,x+.09,-1.0,0,{child:true});
    if(i%2===0){M(CY(.008,.008,.78,5),'#8d949b',x+.2,.39,-1.42,g);M(B3(.05,.09,.02),i===0?'#dfe9f2':'#f2efe6',x+.2,.74,-1.42,g)}});
  R.box(-.65,-1.12,1.45,.4);
  // south-west row: three beds
  [-1.85,-1.25,-.65].forEach((x,i)=>{bed(x,1.1,Math.PI);pat(3420+i,x,1.0,Math.PI,{woman:i===1,s:.56})});R.box(-1.25,1.12,.85,.4);
  // patients on mats on the floor, with relatives sitting beside them
  for(const [x,z,c,i] of [[-.1,.25,'#7a4fa0',0],[-1.0,.2,'#2f8f8a',1]]){M(B3(.34,.015,.72),c,x,.008,z,g);pat(3430+i,x,z+.08,0,{woman:i===0,y:.01,s:.56});person(R,3440+i,x+.3,z-.1,-1.2,{woman:true,sit:true})}
  R.box(-.55,.22,.75,.38);
  // cholera corner behind plastic sheeting
  for(const z of [-.62,-.98,-1.34])M(B3(.012,.9,.34),'#9fc3dd',1.18,.5,z,g,{transparent:true,opacity:.45});M(B3(.9,.9,.012),'#9fc3dd',1.66,.5,-.44,g,{transparent:true,opacity:.45});
  for(const x of [1.5,1.92]){const c=new THREE.Group();c.position.set(x,0,-1.05);g.add(c);M(B3(.3,.025,.7),'#3f8fd0',0,.18,0,c);for(const [a,b] of [[-.13,-.3],[.13,-.3],[-.13,.3],[.13,.3]])M(B3(.02,.18,.02),'#8d949b',a,.09,b,c);M(CY(.07,.06,.1,8),'#c9483f',0,.05,.05,c)}
  pat(3450,1.5,-1.0,0,{woman:false,y:.19,s:.54});{const s=sign(['CHOLERA','wash your hands'],.5,.24,'#e2b632','#1b2a3a',64);s.position.set(1.66,.86,-.43);g.add(s)}R.box(1.72,-.98,.5,.56);
  // broken oxygen machine, empty medicine cabinet
  M(B3(.22,.42,.2),'#d9d6cc',-2.0,.21,.55,g);M(B3(.012,.12,.14),'#22303a',-1.885,.32,.55,g);{const s=sign(['OUT OF ORDER'],.2,.07,'#c9483f','#ffffff',58);s.position.set(-1.884,.14,.55);s.rotation.y=Math.PI/2;g.add(s)}R.box(-2.0,.55,.13,.12);
  const cab=new THREE.Group();cab.position.set(2.06,0,.35);g.add(cab);M(B3(.16,.95,.8),'#e9e4da',0,.47,0,cab);for(let i=0;i<4;i++)M(B3(.17,.012,.78),'#b9b3a8',-.005,.18+i*.22,0,cab);
  for(const [y,z] of [[.215,-.2],[.435,.22]])M(B3(.06,.05,.09),'#3f8fd0',-.07,y,z,cab);
  R.stock=new THREE.Group();cab.add(R.stock);for(let i=0;i<4;i++)for(let k=0;k<4;k++)M(B3(.06,.06,.1),['#3f8fd0','#f4f1ea','#2e8b57','#e2b632'][(i+k)%4],-.07,.22+i*.22,-.28+k*.18,R.stock);
  {const s=sign(['PHARMACY'],.5,.1,'#1d5fae','#ffffff',72);s.position.set(1.975,1.02,.35);s.rotation.y=-Math.PI/2;g.add(s)}R.box(2.06,.35,.1,.42);
  // desk, register, kerosene lamp, dead ceiling fan
  M(B3(.6,.03,.34),'#9a7450',1.15,.36,.15,g);for(const [a,b] of [[-.27,-.14],[.27,-.14],[-.27,.14],[.27,.14]])M(B3(.03,.36,.03),'#7a5a3c',1.15+a,.18,.15+b,g);M(B3(.2,.02,.14),'#f4f1ea',1.05,.385,.15,g);M(CY(.03,.04,.1,8),'#c9a33a',1.35,.43,.1,g);R.box(1.15,.15,.32,.19);
  M(CY(.03,.03,.1,6),'#6c6f75',0,1.1,0,g);for(let i=0;i<3;i++)M(B3(.5,.01,.09),'#8d949b',Math.cos(i*2.09)*.25,1.06,Math.sin(i*2.09)*.25,g).rotation.y=-i*2.09;
  // the queue: from the desk back along the wall, some sitting on the floor
  R.queue=[];[[1.15,.62,0,0],[.8,1.3,1,Math.PI],[.48,1.32,0,Math.PI],[.16,1.34,1,Math.PI],[1.98,1.02,1,-Math.PI/2],[1.98,1.3,1,-Math.PI/2],[-.16,1.34,0,Math.PI]].forEach(([x,z,sit,ry],i)=>{const b=person(R,3460+i,x,z,ry,{woman:i%3!==1,sit:!!sit});R.queue.push(b)});
  R.npcs=[npc('huda',R,1.15,-.14,0,{woman:true,cloth:'#f4f1ea'}),npc('amna',R,1.76,.72,-2.2,{woman:true,sit:true}),npc('osman',R,1.12,.92,Math.PI,{woman:false})];
  person(R,3470,1.62,.62,-2,{child:true,sit:true});
  R.refresh=()=>{const on=act('health');R.stock.visible=on;R.queue.forEach((b,i)=>b.g.visible=!on||i<3)};finishRoom(R);return R}

function buildSchool(){const R=roomShell('school',320,3.7,2.9,1.2,{floor:'#a59c88',wall:'#d9cfb6',dado:'#7fa07c',door:1.2}),g=R.g,w=3.7,d=2.9;
  for(const z of [-.8,.4])win(R,w/2-.01,.75,z,.6,.4,true);M(B3(.012,.6,1.5),'#2f4a3c',-w/2+.012,.72,-.2,g);M(B3(.03,.04,1.56),'#7a5a3c',-w/2+.02,.4,-.2,g);
  R.bdA=sign(['Last lesson: 13 April 2023','Science: how plants grow'],1.4,.5,'#2f4a3c','#e9e4da',40);R.bdB=sign(['Today: fractions','1/2 + 1/4 = 3/4'],1.4,.5,'#2f4a3c','#f4f1ea',52);for(const s of [R.bdA,R.bdB]){s.position.set(-w/2+.02,.72,-.2);s.rotation.y=Math.PI/2;g.add(s)}
  M(B3(.5,.02,.5),'#fff3d0',.6,1.195,-.6,g,{emissive:'#ffe9b0',emissiveIntensity:.9});M(B3(.3,.25,.012),'#b3a88f',-.5,.9,-d/2+.012,g);
  const desk=(x,z,p,tilt)=>{const k=new THREE.Group();k.position.set(x,0,z);g.add(k);M(B3(.26,.02,.6),'#9a7450',0,.3,0,k);M(B3(.14,.02,.6),'#8a6a48',.24,.17,0,k);for(const dz of [-.27,.27]){M(B3(.03,.3,.03),'#6c6f75',-.08,.15,dz,k);M(B3(.03,.17,.03),'#6c6f75',.24,.085,dz,k)}if(tilt){k.rotation.set(tilt,.4,.3)}p.add(k);return k};
  // shelter: families sleep where the desks were
  const A=new THREE.Group(),Bc=new THREE.Group();g.add(A,Bc);R.A=A;R.B=Bc;
  for(let i=0;i<5;i++){const k=desk(-1.5+(i%2)*.14,-1.12+i*.02,A,0);k.position.y=i*.19;k.rotation.y=(i%2)*.5}
  M(CY(.006,.006,w,4),'#6c6f75',0,.92,.2,A).rotation.z=Math.PI/2;[['#b8433a',-1.2],['#2f8f8a',-.6],['#d9a521',0],['#e9e2d2',.5],['#7a4fa0',1.1]].forEach(([c,x])=>M(B3(.3,.26,.008),c,x,.78,.2,A));
  [[-.9,.85,'#7a4fa0'],[.2,.95,'#2f8f8a'],[1.25,-.9,'#b8433a'],[.2,-.95,'#d9a521'],[-.75,-.25,'#3f6fb0']].forEach(([x,z,c],i)=>{M(B3(.7,.015,.42),c,x,.008,z,A);M(CY(.07,.07,.3,8),'#d8cdb8',x-.2,.07,z+.12,A).rotation.z=Math.PI/2;M(CY(.08,.06,.09,8),'#2b2b2b',x+.28,.045,z-.12,A);M(B3(.1,.14,.07),i%2?'#e2b632':'#3f8fd0',x+.3,.07,z+.14,A)});
  M(B3(.012,.7,1.1),'#c9b79a',.75,.35,-.9,A);M(B3(.012,.7,.9),'#a8b7a0',-.25,.35,.9,A);
  const pa=(i,x,z,ry,o)=>{const b=K.makeBody(i,{parent:A,scale:o.child?.42:.6,woman:o.woman,child:o.child});b.g.position.set(x,0,z);b.g.rotation.y=ry;if(o.sit)K.sitPose(b,true);if(o.lie){b.g.rotation.order='YXZ';b.g.rotation.set(-Math.PI/2,ry,0);b.g.position.y=.07}return b};
  pa(3500,1.2,-.95,0,{woman:true,lie:true});pa(3501,.35,-.8,1,{child:true,sit:true});pa(3502,-.6,-.3,.5,{woman:true,sit:true});pa(3503,-.95,-.1,2,{child:true});pa(3504,.5,.95,3,{woman:false,sit:true});pa(3505,1.35,.3,-1.6,{child:true,sit:true});
  // class in session: nine desks, two children at each
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){const x=-.55+r*.78,z=-.95+c*.7;desk(x,z,Bc,0);for(const dz of [-.15,.15]){const b=K.makeBody(3520+r*6+c*2+(dz>0),{parent:Bc,scale:.42,child:true,woman:(r+c+(dz>0))%2===0});b.g.position.set(x+.26,.1,z+dz);b.g.rotation.y=-Math.PI/2;K.sitPose(b,true)}if((r+c)%3===0)M(B3(.12,.015,.16),'#3f6fb0',x,.32,z,Bc)}
  R.box(-1.5,-1.12,.3,.3);
  R.npA=[npc('ibrahimA',R,-1.2,.25,1.2,{woman:false},A),npc('mahaA',R,.75,.3,-2.4,{child:true,woman:true},A),npc('zainab',R,.45,-1.2,0,{woman:true,sit:true},A)];
  R.npB=[npc('ibrahimB',R,-1.45,-.2,Math.PI/2,{woman:false},Bc),npc('mahaB',R,.35,1.12,-Math.PI/2,{child:true,woman:true},Bc)];
  R.refresh=()=>{const open=built('primary');A.visible=!open;Bc.visible=open;R.bdA.visible=!open;R.bdB.visible=open;R.npcs=open?R.npB:R.npA;
    R.boxes=open?[{x:-.45,z:-.25,hw:.34,hd:1.02},{x:.33,z:-.25,hw:.34,hd:1.02},{x:1.11,z:-.25,hw:.34,hd:1.02}]:[{x:-1.5,z:-1.12,hw:.32,hd:.3},{x:.75,z:-.9,hw:.04,hd:.55},{x:-.25,z:.9,hw:.04,hd:.45}]};finishRoom(R);return R}

function buildTent(){const R=roomShell('tent',340,1.9,1.7,.5,{floor:'#b7a98a',wall:'#d8d2c0',door:0,dh:.48,noCeil:true}),g=R.g;
  // sloped canvas roof and a centre pole
  for(const sx of [-1,1]){const p=M(B3(1.12,.02,1.74),'#e3ddcc',sx*.5,.74,0,g);p.rotation.z=sx*-.5}M(CY(.02,.02,1.0,6),'#7a5a3c',0,.5,-.2,g);for(const z of [-.86,.86])M(B3(1.9,.5,.02),'#d8d2c0',0,.75,z,g);
  M(B3(1.2,.015,.9),'#7a4fa0',-.25,.008,-.3,g);M(B3(.6,.015,.9),'#2f8f8a',.6,.008,-.3,g);for(const [x,z,c] of [[-.75,-.7,'#b8433a'],[-.4,-.72,'#d9a521'],[.6,-.7,'#3f6fb0']])M(CY(.07,.07,.34,8),c,x,.07,z,g).rotation.z=Math.PI/2;
  M(CY(.1,.08,.1,8),'#2b2b2b',.6,.05,.45,g);for(let i=0;i<3;i++)M(new THREE.DodecahedronGeometry(.05,0),'#8a8474',.6+Math.cos(i*2.1)*.12,.03,.45+Math.sin(i*2.1)*.12,g);
  for(const [x,c] of [[-.78,'#e2b632'],[-.62,'#e2b632'],[-.46,'#3f8fd0']])M(B3(.1,.15,.07),c,x,.075,.6,g);M(B3(.34,.07,.24),'#e3d5b3',.2,.035,.62,g);M(new THREE.SphereGeometry(.14,8,6),'#8a6f8f',-.8,.1,.15,g).scale.set(1,.7,1);
  M(B3(.09,.12,.01),'#f4f1ea',.03,.62,-.2,g,{transparent:true,opacity:.85});M(CY(.035,.035,.07,8),'#e2b632',-.03,.8,-.2,g,{emissive:'#f0d890',emissiveIntensity:.4});
  const gm=K.makeBody(3550,{parent:g,scale:.58,woman:true});gm.g.rotation.order='YXZ';gm.g.rotation.set(-Math.PI/2,Math.PI/2,0);gm.g.position.set(.75,.07,-.3);
  person(R,3552,-.45,-.25,2.2,{child:true,sit:true});R.box(.6,.45,.14,.14);
  R.npcs=[npc('khadija',R,-.2,-.42,.4,{woman:true,sit:true}),npc('yousif',R,.2,.1,-2.2,{child:true,woman:false})];R.refresh=()=>{};finishRoom(R);return R}

/* ---------- people you can talk to ---------- */
const WHO_SRC='WHO, 14 April 2026',UNICEF_SRC='UNICEF, 14 April 2026',IOM_SRC='IOM Displacement Tracking Matrix, June 2026';
const NPCD={
 huda:{n:'Sister Huda',r:'Nurse in charge, health centre',hi:'Come in, but mind the people on the floor. We ran out of beds a long time ago.',qa:[
  ['How many people come here?',()=>'This centre was built for the host town. Now it serves the town, the IDP site, the returnees and the camp: more than 60,000 people, with two nurses and no doctor. Across Sudan more than a third of health facilities are not working at all, so people walk to the ones that are.',WHO_SRC],
  ['What do you need most?',()=>act('health')?'Since the health support started we have basic medicine again and a second shift. The line is shorter, but it is still a line. The oxygen machine is still broken, and nobody knows who will pay the salaries next year.':'Medicine, fuel for the generator, and salaries. The oxygen machine has been broken since the power went. I write prescriptions for drugs I do not have, and families go to the market to buy them, if they can.'],
  ['What worries you?',()=>'The rains. Cholera has been reported in every state of Sudan. The last outbreak was declared over in March 2026 after a huge vaccination campaign, and new cases came within months. If it reaches the site, where there are few latrines, this room will not be enough.',WHO_SRC+'; WHO, July 2026']]},
 amna:{n:'Amna',r:'Mother from the IDP site, waiting with her son',hi:'We came before sunrise. He has had a fever for three days.',qa:[
  ['How long have you been waiting?',()=>'Since the first prayer. There were forty people before us. If the medicine runs out before our turn, we come back tomorrow.'],
  ['How did you get here?',()=>'On foot from the IDP site. A tuk-tuk costs 2,000 pounds and I did not have it, so I carried him.'],
  ['What would help?',()=>'A clinic day at the site, even once a week. And clean water, so that he does not get sick again.']]},
 osman:{n:'Hajj Osman',r:'Elder from the returnee village',hi:'Peace be upon you. I am only here for my tablets.',qa:[
  ['Do they have your medicine?',()=>'For blood pressure? Not for two months. I come anyway, in case. In the market one strip costs what I earn in two days.'],
  ['What was it like before the war?',()=>'There was a doctor twice a week and a small laboratory. The doctor left for Port Sudan. The microscope was looted. The building is the same, but a building is not a clinic.']]},
 ibrahimA:{n:'Ustaz Ibrahim',r:'Teacher, displaced from Khartoum',hi:'This was a classroom. Now eleven families sleep here, and I am one of them.',qa:[
  ['Why is the school closed?',()=>'Families fleeing the fighting had nowhere else to go, so they sleep in the classrooms. Across Sudan almost half of all school buildings are no longer used as classrooms. Nobody wants to move people out with nowhere to send them.',UNICEF_SRC],
  ['What about the children?',()=>'At least 8 million children in Sudan are out of school, close to half of all children of school age. Some here have missed three years. The boys sell things in the market. Some of the girls have been married early.',UNICEF_SRC],
  ['What would it take to reopen?',()=>'Somewhere better for these families to live, repairs to the roof and the latrines, and pay for teachers. I have not been paid since I left Khartoum, but I would start tomorrow.']]},
 mahaA:{n:'Maha',r:'12 years old',hi:'I was in grade 4 when we left. That is my old lesson on the board.',qa:[
  ['What do you miss?',()=>'My friends, and science. I liked the lesson about how plants grow.'],
  ['What do you do all day?',()=>'I fetch water in the morning and look after my brother. Sometimes Ustaz Ibrahim gives us sums under the tree.'],
  ['What do you want to be?',()=>'A doctor. But first I have to finish grade 4.']]},
 zainab:{n:'Zainab',r:'Mother of four, living in the classroom',hi:'Sit, please. Mind the pots.',qa:[
  ['What is it like living here?',()=>'We are dry, and that is something. But there are eleven families and one latrine. At night I put the children between me and the wall.'],
  ['Would you move out?',()=>'If there were a plot and a shelter, yes, today. My children should sit at these desks, not sleep beside them.']]},
 ibrahimB:{n:'Ustaz Ibrahim',r:'Teacher',hi:'Good morning. Stand at the back if you can find a place.',qa:[
  ['How is the school now?',()=>'Open, in two shifts. Children from the host town, the IDP site, the village and the camp sit together. There are seventy pupils in this room and one book for every three.'],
  ['What changed?',()=>'The families who sheltered here got plots and shelter kits, the roof was repaired, and volunteer teachers receive an incentive. It took all three. Take one away and the school closes again.'],
  ['What is still missing?',()=>'Books, a salary instead of an incentive, and the children who started working and did not come back. Children in Sudan have lost about 500 days of school. That does not come back in one term.','Save the Children, January 2026']]},
 mahaB:{n:'Maha',r:'12 years old, back in grade 4',hi:'I am the oldest in my row. I do not mind.',qa:[
  ['How does it feel to be back?',()=>'Good. I can read again without stopping. My brother started grade 1 on the same day.'],
  ['What do you want to be?',()=>'A doctor. Sister Huda at the health centre says she will show me the pharmacy when there is something in it.']]},
 khadija:{n:'Khadija',r:'Mother of three, displaced from Al Jazirah',hi:'Welcome. Sit, the mat is clean.',qa:[
  ['How long have you lived here?',()=>'Fourteen months. We left when the fighting reached our village and walked for six days. I thought we would stay a few weeks.'],
  ['What is a day like?',()=>K.safeWater('idp')?'I wake before dawn. The tap is ten minutes away now. Before, the well was two hours each way, and the day was gone before it started. Now I have the morning, and I sell tea.':'I wake before dawn to walk to the old well. It is about two hours each way, and I go twice. By the time the water is home, the day is gone. Then I queue for the ration.'],
  ['What did you bring with you?',()=>'The children, two blankets, a cooking pot, and that plastic bag on the pole. It holds our papers: the birth certificates and the deed to our land. Without the deed we cannot prove the house was ours.'],
  ['What do you hope for?',()=>'To go home if it is safe, or to be allowed to stay here properly: a plot, work, a school. Anything but waiting.']]},
 yousif:{n:'Yousif',r:'9 years old',hi:'This is our house. That is my grandmother. She is sleeping.',qa:[
  ['What do you do in the day?',()=>'I carry water, and I play football across the river. There is no school here.'],
  ['What do you remember about home?',()=>'We had goats and a mango tree. I had my own bed.']]},
 adam:{n:'Sheikh Adam',r:'Community leader, IDP site',hi:'You are welcome here. Ask what you want to know.',qa:[
  ['Who lives here?',()=>'About 18,000 people, from three states. Across Sudan close to 9 million people are still displaced inside the country, even after millions have gone home.',IOM_SRC],
  ['What do people need?',()=>'First food and water. But ask people what they want and they say work, land and documents. Nobody wants to queue for a ration for ever.'],
  ['How are things with the host town?',()=>'They shared what they had when we came. But the well, the health centre and the firewood are the same, for twice as many people. Small quarrels grow if nobody talks.']]},
 mariam:{n:'Mariam',r:'Vegetable seller, market street',hi:'Onions, okra, tomatoes. Look, you do not have to buy.',qa:[
  ['How are prices?',()=>'Onions cost twice what they did at harvest. Transport is the reason. When fuel is short the lorry does not come, and what does come costs more.'],
  ['Who buys from you?',()=>'Everyone, in the week the cash assistance is paid. The week after, people buy on credit. I keep a notebook, and I do not charge interest.']]},
 awadia:{n:'Sitt Awadia',r:'Tea seller',hi:'Tea or coffee? Sit, the stool is free.',qa:[
  ['How did you start?',()=>'I fled with a kettle and my daughters. A neighbour lent me charcoal and six glasses. Now I feed five people from this stove.'],
  ['What would help your business?',()=>'A small loan for a proper stall, and a licence, so that nobody can move me on. I do not need a ration. I need not to be chased.']]},
 mustafa:{n:'Mustafa',r:'Tuk-tuk driver, in the petrol line',hi:'Do not ask me how long. Ask me how many days.',qa:[
  ['How long have you been in line?',()=>'Since yesterday afternoon. I slept in the tuk-tuk. You stand twelve hours in line, or you pay much more on the black market. Those are the two choices.','Radio Dabanga, September 2026'],
  ['What does it do to your income?',()=>'Every hour here is an hour without fares. And when I do get fuel, I must charge more, and people cannot pay. Bus fares went up by a third this year.','Al Jazeera, October 2026'],
  ['Why is the station across the river?',()=>'It is the only one that still gets deliveries. When the river floods, the causeway goes under and there is no fuel at all.']]},
 abdel:{n:'Abdelrahman',r:'Farmer, returned to his village',hi:'This field fed nine people once. It will again.',qa:[
  ['What did you find when you came back?',()=>'The house had no roof and the pump was gone. The land was still here. More than four and a half million people have gone home like us, most of them to something like this.',IOM_SRC],
  ['What do you need to farm?',()=>'Seed in time for the rains, a pump, and a canal that holds water. And a road to market that is open. I can do the rest.']]},
 nafisa:{n:'Nafisa',r:'Returnee, in front of her family home',hi:'This was the sitting room. My father built it.',qa:[
  ['What happened here?',()=>'The street was shelled, and then it burnt. We came back in March and found walls. Our neighbours on both sides are the same.'],
  ['Can you rebuild?',()=>'A committee must confirm the house is ours before anyone helps us rebuild, and our papers burnt with it. The neighbours can testify. So we wait, and we sleep at my cousin’s.']]},
 nyakor:{n:'Nyakor',r:'Refugee from South Sudan',hi:'Hello. You are the first visitor today who is not counting us.',qa:[
  ['Why did you come to Sudan?',()=>'We fled fighting at home years ago. Then the war came here too. There is nowhere left to run to, so we stay.'],
  ['What is life like in the camp?',()=>act('inclusion')?'Better since the permits. My husband works on a farm three days a week and my son goes to the town school. We are still refugees, but we are not only waiting.':'We are registered and we get a ration. But we may not work outside the camp without a permit, so the young men sit all day. Sitting is the hardest work there is.']]},
 hawa:{n:'Hawa',r:'14 years old, at the old well',hi:'Wait, let me put this down. It is heavy.',qa:[
  ['How far did you walk?',()=>'From the IDP site. It is about two hours each way, and I go twice a day.'],
  ['Do you go to school?',()=>'Not since we left home. Water takes the morning. In the afternoon I am too tired to think.']]},
 hassan:{n:'Am Hassan',r:'Former dam keeper',hi:'I still come every morning. Somebody should look at it.',qa:[
  ['What happened to the dam?',()=>built('dam')?'It is whole again. You should have seen the first day the gates closed. The old men cried, and I was one of them.':'A flood broke the middle of the wall some years ago. There was a plan to repair it. Then the war came and the engineers left.'],
  ['Why does it matter?',()=>'With the dam, the fields get water in the dry season and the low ground does not flood. Without it, the IDP site is under water every rainy season, and the farmers pray for rain and fear it.']]},
 idris:{n:'Sheikh Idris',r:'Imam',hi:'Peace be upon you. The door is open to everyone.',qa:[
  ['What do people bring to you?',()=>'Land, mostly. A family returns and finds another family farming their field. Both have suffered. We sit until there is an answer both can live with.'],
  ['Does it work?',()=>'Often. People accept a decision they helped to make. What we cannot do is write it down in a way an office will respect. For that we need the locality.']]},
 samia:{n:'Samia',r:'In the bread line',hi:'Are you in line? The end is back there.',qa:[
  ['Why is the line so long?',()=>'Flour and fuel for the oven cost more every month. The baker makes fewer loaves, and smaller ones. If you come after eight, there is none.'],
  ['How do you manage?',()=>'We eat twice a day now, not three times. The children first.']]},
 tariq:{n:'Tariq',r:'13 years old',hi:'Do you want to play? We need a goalkeeper.',qa:[
  ['Do you go to school?',()=>built('primary')?'In the afternoon shift. In the morning I work in the market. The teacher says that is allowed if I do my sums.':'The school is full of families. So we play. When it opens I will go.'],
  ['What is the ball made of?',()=>'Plastic bags and string, with a sock on the outside. It lasts about a week.']]}
};
const NPCS=[];const mark=new THREE.OctahedronGeometry(.045,0),markMat=new THREE.MeshBasicMaterial({color:'#f2b632'});
function npc(id,R,x,z,ry,o={},parent){const D=NPCD[id];let b;
  if(R){b=K.makeBody(3600+NPCS.length,{parent:parent||R.g,scale:o.child?.44:.6,woman:o.woman,child:o.child,cloth:o.cloth});b.g.position.set(x,0,z)}
  else{b=K.makeBody(3600+NPCS.length,{woman:o.woman,child:o.child,scale:o.child?.78:undefined,cloth:o.cloth});b.g.position.set(x,h(x,z),z)}
  b.g.rotation.y=ry;if(o.sit)K.sitPose(b,true);const m=new THREE.Mesh(mark,markMat);m.position.y=o.sit?.82:1.02;b.g.add(m);
  const N={id,D,b,m,room:R||null,lx:x,lz:z,get x(){return R?R.x+x:x},get z(){return R?R.z+z:z}};NPCS.push(N);return N}
let OUT=[],DOORS=[];
function buildFP(){if(RM.clinic)return;buildClinic();buildSchool();buildTent();
  const at=(id,x,z,ry,o)=>{const f=free(x,z);OUT.push(npc(id,null,f.x,f.z,ry,o));K.obC(f.x,f.z,.1)};
  at('adam',P.fire.x-.9,P.fire.z+.5,1.2,{woman:false,sit:true});at('mariam',16.5,K.roadZ(16.5)+1.25,Math.PI,{woman:true});at('awadia',12.25,K.roadZ(12.25)+1.25,Math.PI,{woman:true});
  at('mustafa',15.2,K.trackZ(15.2)-.75,0,{woman:false});at('abdel',-17.5,.2,0,{woman:false});at('nafisa',-31.2,-14.9,.3,{woman:true});
  at('nyakor',P.camp.x+1.4,K.CAMP.z1+1.2,.2,{woman:true});at('hawa',K.WELL.x+.9,K.WELL.z+.9,.8,{woman:true,child:true});at('hassan',K.DAMX+3.4,zr(K.DAMX)-6.6,-.6,{woman:false});
  at('idris',-.6,-11.2,0,{woman:false});at('samia',27.6,K.roadZ(27.6)+2.9,-Math.PI/2,{woman:true});at('tariq',11.2,23.4,Math.PI,{child:true,woman:false});
  const dr=(room,x,z,label)=>{const f=free(x,z);DOORS.push({room,x:f.x,z:f.z,label})};
  dr('clinic',P.clinic.x+.6,P.clinic.z+1.35,'the health centre');dr('school',P.primary.x+.2,P.primary.z+1.95,'the primary school');dr('tent',-1.3,4.55,'a family tent');
  DOORS.forEach(D=>{const m=new THREE.Mesh(new THREE.RingGeometry(.22,.3,24),new THREE.MeshBasicMaterial({color:'#f2b632',transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));m.rotation.x=-Math.PI/2;m.position.set(D.x,h(D.x,D.z)+.05,D.z);scene.add(m);D.m=m;m.visible=false})}
const CAUSEX=K.CAUSEX;

/* prompt, caption and conversation panel */
const fpUI=document.createElement('div');fpUI.className='fpui';fpUI.innerHTML='<div class="fpcap" hidden></div><div class="fpprompt" hidden></div><div class="fpx" aria-hidden="true"></div>';view.appendChild(fpUI);
const capEl=fpUI.querySelector('.fpcap'),prEl=fpUI.querySelector('.fpprompt');let prTxt='',capTxt='';
function prompt(t){if(t===prTxt)return;prTxt=t;prEl.hidden=!t;if(t)prEl.innerHTML='<kbd>E</kbd><span>'+t+'</span>'}
function caption(t){if(t===capTxt)return;capTxt=t;capEl.hidden=!t;if(t)capEl.innerHTML=t}
prEl.addEventListener('click',()=>fpUse());
function openTalk(N){closeTalk();TALK=N;const el=document.createElement('div');el.className='talk';el.setAttribute('role','dialog');el.setAttribute('aria-label','Conversation with '+N.D.n);
  el.innerHTML='<div class="tk-h"><span class="tk-av">'+esc(N.D.n.replace(/^(Sister|Sheikh|Hajj|Ustaz|Sitt|Am) /,'')[0])+'</span><div><b>'+esc(N.D.n)+'</b><small>'+esc(N.D.r)+'</small></div><button type="button" class="tk-x" aria-label="End the conversation">×</button></div><div class="tk-a"></div><div class="tk-s" hidden></div><div class="tk-q">'+N.D.qa.map((q,i)=>'<button type="button" data-q="'+i+'"><i>'+(i+1)+'</i>'+esc(q[0])+'</button>').join('')+'</div><div class="tk-f">This person is fictional. What they describe is drawn from 2025 and 2026 reports on Sudan.</div>';
  view.appendChild(el);N.el=el;el.querySelector('.tk-a').textContent=N.D.hi;el.querySelector('.tk-x').onclick=closeTalk;el.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>askQ(+b.dataset.q));prompt(null);
  // turn to face each other
  FP.yaw=Math.atan2(N.x-FP.x,N.z-FP.z);FP.pitch=-.05;N.b.g.rotation.y=Math.atan2(FP.x-N.x,FP.z-N.z)}
function askQ(i){if(!TALK||!TALK.D.qa[i])return;const q=TALK.D.qa[i],el=TALK.el;el.querySelector('.tk-a').textContent=q[1]();const s=el.querySelector('.tk-s');s.hidden=!q[2];if(q[2])s.textContent='Source: '+q[2];el.querySelectorAll('[data-q]').forEach((b,k)=>{b.classList.toggle('on',k===i);if(k===i)b.classList.add('seen')})}
function closeTalk(){if(TALK&&TALK.el)TALK.el.remove();TALK=null}
function goRoom(key){const R=RM[key];R.refresh();ROOMS.visible=true;for(const k in RM)RM[k].g.visible=k===key;FP.back={x:FP.x,z:FP.z,yaw:FP.yaw+Math.PI};FP.room=R;FP.x=R.spawn.x;FP.z=R.spawn.z;FP.yaw=R.spawn.yaw;FP.pitch=-.05;FP.eye=key==='tent'?.44:.52;flash()}
function leaveRoom(){const R=FP.room;if(!R)return;R.g.visible=false;ROOMS.visible=false;FP.room=null;FP.x=FP.back.x;FP.z=FP.back.z;FP.yaw=FP.back.yaw;FP.eye=.52;flash()}
function flash(){const f=fpUI.querySelector('.fpx');f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
function fpUse(){if(!FP.on||FP.mode!=='walk'||TALK||!NEARBY)return;if(NEARBY.t==='npc')openTalk(NEARBY.o);else if(NEARBY.t==='door')goRoom(NEARBY.o.room);else if(NEARBY.t==='exit')leaveRoom()}
function fpNear(){NEARBY=null;if(TALK){if(Math.hypot(TALK.x-FP.x,TALK.z-FP.z)>1.5)closeTalk();return}
  let best=null,bd=1e9;const list=FP.room?FP.room.npcs:OUT;for(const N of list){const d=Math.hypot(N.x-FP.x,N.z-FP.z);if(d<(FP.room?.75:1.05)&&d<bd){bd=d;best=N}}
  if(best){NEARBY={t:'npc',o:best};prompt('Talk to '+esc(best.D.n)+'<small>'+esc(best.D.r)+'</small>');return}
  if(FP.room){if(Math.hypot(FP.room.exit.x-FP.x,FP.room.exit.z-FP.z)<.5){NEARBY={t:'exit'};prompt('Go back outside')}else prompt(null);return}
  for(const D of DOORS)if(Math.hypot(D.x-FP.x,D.z-FP.z)<.95){NEARBY={t:'door',o:D};prompt('Go inside '+D.label);return}
  prompt(null)}
const ROOMCAP={clinic:'<b>Health centre</b>One ward for the town, the IDP site, the village and the camp.',school:'<b>Primary school</b>',tent:'<b>A family tent</b>Five people, one room.'};
function stepWalk(dt,t){let f=(fk.arrowup||fk.w?1:0)-(fk.arrowdown||fk.s?1:0),tr=(fk.arrowleft||fk.a?1:0)-(fk.arrowright||fk.d?1:0);
  if(FP.goto&&!TALK){const dx=FP.goto.x-FP.x,dz=FP.goto.z-FP.z,d=Math.hypot(dx,dz);if(d<.25)FP.goto=null;else{let da=Math.atan2(dx,dz)-FP.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));tr=Math.max(-1,Math.min(1,da*3));f=Math.abs(da)>1.2?0:1}}
  if(TALK){f=0;tr=0}
  FP.yaw+=tr*dt*1.9;
  if(f){const sp=(fk.shift?2.7:1.45)*(f<0?.6:1)*(FP.room?.6:1);let nx=FP.x+Math.sin(FP.yaw)*f*sp*dt,nz=FP.z+Math.cos(FP.yaw)*f*sp*dt;
    if(FP.room)[nx,nz]=FP.room.clamp(nx,nz);else{tmpV.set(nx,nz);K.pushOut(tmpV);K.pushOut(tmpV);nx=tmpV.x;nz=tmpV.y}
    FP.x=nx;FP.z=nz;FP.bob+=dt*10}
  fpNear();
  const pulse=1+Math.sin(t*4)*.12;for(const N of NPCS){N.m.rotation.y=t*2;N.m.position.y=(N.b.body.position.y<0?.82:1.02)+Math.sin(t*3+N.lx)*.02}
  for(const D of DOORS){D.m.visible=!FP.room;D.m.scale.setScalar(pulse)}
  // what you are looking at
  if(FP.room)caption(ROOMCAP[FP.room.key]+(FP.room.key==='school'?(built('primary')?'Open again, in two shifts.':'Closed. Eleven families live in this classroom.'):''));
  else{let c=null;for(const p of pins){const d=Math.hypot(p.x-FP.x,p.z-FP.z);if(d<1.7){c='<b>'+esc(p.ttl)+'</b>'+esc(p.txt());p.el.classList.add('on')}else p.el.classList.remove('on')}caption(c)}}

/* a vehicle is solid: it cannot pass through buildings, fences, the queue, people or other vehicles */
const tmpW=new THREE.Vector2();
function solid(v,yaw,rad,front,back){const sx=Math.sin(yaw),cz=Math.cos(yaw);
  for(let it=0;it<2;it++)for(const o of [0,front,-back]){const px=v.x+sx*o,pz=v.y+cz*o;tmpW.set(px,pz);K.pushOut(tmpW);v.x+=tmpW.x-px;v.y+=tmpW.y-pz}
  for(const o of [front,0,-back]){const px=v.x+sx*o,pz=v.y+cz*o,f=inCrop(px,pz);if(f){const dl=px-(f.x0-.15),dr=f.x1+.15-px,dt=pz-(f.z0-.3),db=f.z1+.15-pz,m=Math.min(dl,dr,dt,db);if(m===dl)v.x-=dl;else if(m===dr)v.x+=dr;else if(m===dt)v.y-=dt;else v.y+=db}}
  const hit=(x,z,r)=>{for(const o of [front*.7,0,-back*.7]){const dx=v.x+sx*o-x,dz=v.y+cz*o-z,d=Math.hypot(dx,dz),R=r+rad;if(d<R&&d>1e-4){v.x+=dx/d*(R-d);v.y+=dz/d*(R-d)}}};
  for(const q of K.FUEL.qobs||[]){if(Math.abs(q[0]-v.x)>3||Math.abs(q[1]-v.y)>3)continue;const n=Math.max(1,Math.round(q[2]/q[3]));for(let i=0;i<n;i++)hit(q[0]+(n>1?(i/(n-1)-.5)*2*(q[2]-q[3]):0),q[1],q[3]+.03)}
  for(const p of K.PEOPLE){const g=p.g;if(g.visible&&Math.abs(g.position.x-v.x)<2&&Math.abs(g.position.z-v.y)<2)hit(g.position.x,g.position.z,.08)}
  const L=K.LIFE;for(const T of L.tuks||[])if(T.g.visible)hit(T.g.position.x,T.g.position.z,.3);for(const D of L.donkeys||[])if(D.g.visible)hit(D.g.position.x,D.g.position.z,.33);for(const c of L.carriers||[])hit(c.g.position.x,c.g.position.z,.08);
  if(L.bus&&L.bus.g.visible){const b=L.bus.g.position;for(const o of [-.75,0,.75])hit(b.x+o,b.z,.42)}
  const tr=K.W3.truck;if(tr&&tr.visible)for(const o of [-.45,.45])hit(tr.position.x+o,tr.position.z,.4)}

/* ---------- per-frame updates ---------- */
K.hooks.push((dt,t)=>{
  stepFly(dt);
  const dist=camera.position.distanceTo(controls.target);DET.visible=VI>=0||G.on||FP.on||dist<22;
  if(G.on)stepGame(dt);if(FP.on&&FP.mode==='walk')stepWalk(dt,t);
  guide(dt,t);
  for(const p of pins){if(FP.room){p.el.style.display='none';continue}const s=project(p.x,h(p.x,p.z)+p.dy,p.z);if(!s){p.el.style.display='none';continue}p.el.style.display='';p.el.style.left=s.x+'px';p.el.style.top=s.y+'px'}
  for(const p of gpins){if(!p.show){p.el.style.display='none';continue}const s=project(p.x,h(p.x,p.z)+p.dy,p.z);if(!s){p.el.style.display='none';continue}p.el.style.display='';p.el.style.left=s.x+'px';p.el.style.top=s.y+'px'}
});
window.__XTRAS={startVisit,startJob,endVisit,quitJob,G,PLACES,FP,goRoom,leaveRoom,openTalk,askQ,closeTalk,get OUT(){return OUT},get RM(){return RM},get NPCS(){return NPCS}};
}

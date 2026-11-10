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
  else pop.innerHTML='<h4>Try a job for 3 minutes</h4><button type="button" class="job" data-j="tuk"><span class="n">'+ICO.tuk+'</span><span><b>Tuk-tuk driver</b><small>Pick up passengers and earn 25,000 SDG after fuel.</small></span></button><button type="button" class="job" data-j="donkey"><span class="n">'+ICO.donkey+'</span><span><b>Donkey water seller</b><small>Fill your barrel at the river and sell 4 barrels of water.</small></span></button>';
  const vr=view.getBoundingClientRect(),br=b.getBoundingClientRect();pop.classList.add('on');
  pop.style.left=Math.max(8,br.right-vr.left-pop.offsetWidth)+'px';pop.style.top=Math.max(8,br.top-vr.top-pop.offsetHeight-8)+'px'});
pop.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;closePop();if(b.dataset.v!==undefined)startVisit(+b.dataset.v);else if(b.dataset.j)startJob(b.dataset.j)});
document.addEventListener('pointerdown',e=>{if(!pop.contains(e.target)&&!bar.contains(e.target))closePop()});

/* ---------- shared helpers ---------- */
const TV=new THREE.Vector3();
function project(x,y,z){TV.set(x,y,z).project(camera);if(TV.z>1)return null;return{x:(TV.x+1)/2*view.clientWidth,y:(1-TV.y)/2*view.clientHeight}}
function enterMode(cls){closePop();K.showTip&&K.showTip(null);document.body.classList.add('xmode');if(cls)document.body.classList.add(cls);K.setInsets(cls==='vmode'&&innerWidth>860?384:0,0,0)}
function exitMode(){document.body.classList.remove('xmode','gmode','vmode');view.classList.remove('visiting');K.keyGrab=false;controls.enabled=true;
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
   [2,zr(2)-1.9,.8,'Water for sale',()=>'Donkey cart sellers fill their barrels here. The water is not treated.']]}];
let VI=-1,pins=[],panel=null,sel=-1;
function startVisit(i){if(G.on)return;if(VI<0)enterMode('vmode');VI=i;sel=-1;view.classList.add('visiting');const pl=PLACES[i];flyTo(pl.x,pl.z,pl.d*1.35,pl.a||0);drawVisit()}
function drawVisit(){const pl=PLACES[VI];pins.forEach(p=>p.el.remove());pins=[];if(panel)panel.remove();
  panel=document.createElement('div');panel.className='vpanel';const sn=K.SEASONS[Math.min(S().season,5)];
  panel.innerHTML='<div class="vh"><div class="vk">Visit '+(VI+1)+' of '+PLACES.length+'</div><h3>'+esc(pl.name)+'</h3><div class="vs">'+(S().over?'After two years':'Year '+sn.yr+', '+sn.name.toLowerCase()+', '+sn.short)+'</div></div><div class="vb">'+pl.story()+'<ol>'+pl.pts.map((p,k)=>'<li><button type="button" data-k="'+k+'"><span class="n">'+(k+1)+'</span><span><b>'+esc(p[3])+'</b><span class="t">'+esc(p[4]())+'</span></span></button></li>').join('')+'</ol><div class="fic">What you see changes with the season and with what you fund. Visiting does not change your score.</div></div><div class="vf"><button class="btn btn-sm" data-n="-1">‹ Previous</button><button class="btn btn-sm" data-n="1">Next ›</button><button class="btn btn-sm btn-primary" data-n="0">Back to the map</button></div>';
  view.appendChild(panel);
  panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.k!==undefined)pick(+b.dataset.k);else{const n=+b.dataset.n;if(n===0)endVisit();else startVisit((VI+n+PLACES.length)%PLACES.length)}});
  pl.pts.forEach((p,k)=>{const el=document.createElement('button');el.type='button';el.className='xpin';el.innerHTML='<span class="pn"><i>'+(k+1)+'</i></span>';el.setAttribute('aria-label',p[3]);el.onclick=()=>pick(k);view.appendChild(el);pins.push({el,x:p[0],z:p[1],dy:p[2]})})}
function pick(k){sel=sel===k?-1:k;panel.querySelectorAll('li button').forEach((b,i)=>b.classList.toggle('on',i===sel));pins.forEach((p,i)=>p.el.classList.toggle('on',i===sel));
  if(sel>=0){const b=panel.querySelectorAll('li button')[sel];b.scrollIntoView({block:'nearest'})}}
function endVisit(){pins.forEach(p=>p.el.remove());pins=[];if(panel)panel.remove();panel=null;VI=-1;fly=null;exitMode()}
addEventListener('keydown',e=>{if(e.key==='Escape'){if(VI>=0)endVisit();else if(G.on)quitJob()}});

/* ---------- role-play games ---------- */
const G={on:false};
const keys={};
addEventListener('keydown',e=>{if(!G.on||G.state!=='play')return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k)){keys[k]=true;G.auto=null;e.preventDefault()}});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
addEventListener('keydown',e=>{if(!G.on)return;if(e.key==='+'||e.key==='=')G.zoom=Math.max(1,G.zoom-1);else if(e.key==='-'||e.key==='_')G.zoom=Math.min(3,G.zoom+1)});
let wAcc=0,wT=0;view.addEventListener('wheel',e=>{if(!G.on||!e.target.closest('canvas'))return;e.preventDefault();const now=performance.now();if(now-wT>400)wAcc=0;wAcc+=e.deltaY;if(Math.abs(wAcc)>50&&now-wT>220){G.zoom=Math.max(1,Math.min(3,G.zoom+(wAcc>0?1:-1)));wAcc=0;wT=now}},{passive:false});
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let downAt=null;
view.addEventListener('pointerdown',e=>{if(G.on)downAt=[e.clientX,e.clientY]});
view.addEventListener('pointerup',e=>{if(!G.on||G.state!=='play'||!downAt||!e.target.closest('canvas'))return;if(Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>8)return;
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
const hitAt=(px,pz)=>{nv.set(px,pz);K.pushOut(nv);return Math.abs(nv.x-px)+Math.abs(nv.y-pz)>.035};
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
    if(G.tank<=18&&!G.ride){const e=K.FUEL.end;return{x:e.x,z:e.z,n:'Petrol station',r:1.6,col:'#e39a27'}}
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
  AR.visible=d>T.r;AR.material.color.set(T.col);const ax=G.x+wx/wl*1.9,az=G.z+wz/wl*1.9;AR.position.set(ax,h(ax,az)+.14,az);AR.rotation.y=Math.atan2(wx,wz);AR.scale.setScalar(1+Math.sin(t*5)*.06);
  RG.visible=true;RG.material.color.set(T.col);RG.position.set(T.x,h(T.x,T.z)+.1,T.z);const k=T.r*(1+Math.sin(t*4)*.08);RG.scale.set(k,1,k);
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
  Object.assign(G,{on:true,kind,state:'intro',time:180,money:0,fuel:0,fares:0,trips:0,spd:0,auto:null,pass:[],ride:null,barrel:0,sold:0,energy:100,act:0,sinceSpawn:0,nino:S().season>=4,tank:100,zoom:G.zoom||2,arrow:G.arrow!==false,qWait:0,qDone:false});
  enterMode('gmode');controls.enabled=false;K.keyGrab=true;
  const start=kind==='tuk'?free(K.LIFE.stand.x,K.LIFE.stand.z+.6):free(FILLS[0].x+1,FILLS[0].z-1.2);
  veh=makeVehicle(kind);G.x=start.x;G.z=start.z;G.yaw=kind==='tuk'?Math.PI/2:Math.PI;placeVeh();
  const zm=ZM[G.zoom-1];camera.position.set(G.x,8.5*zm,G.z+10.5*zm);controls.target.set(G.x,0,G.z);
  hud=document.createElement('div');hud.className='ghud';view.appendChild(hud);toastEl=document.createElement('div');toastEl.className='gtoast';view.appendChild(toastEl);
  const kb=document.createElement('div');kb.className='gkeys';kb.innerHTML='<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span><b>Drive:</b> arrow keys or W A S D, or click the ground. <b>Esc</b> to leave.</span><span class="gzoom" style="flex-direction:row"><button type="button" data-z="-1" aria-label="Zoom in" title="Zoom in">+</button><button type="button" data-z="1" aria-label="Zoom out" title="Zoom out">−</button></span><button type="button" data-a class="gbtn">Hide arrow</button><button type="button" data-q class="gbtn"><b>Leave</b></button></div>';view.appendChild(kb);G.kb=kb;
  kb.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{G.zoom=Math.max(1,Math.min(3,G.zoom+(+b.dataset.z)))});kb.querySelector('[data-a]').onclick=e=>{G.arrow=!G.arrow;e.currentTarget.textContent=G.arrow?'Hide arrow':'Show arrow'};kb.querySelector('[data-q]').onclick=quitJob;
  if(kind==='tuk'){for(let k=0;k<3;k++)spawnPassenger();G.dpin=gpin('dest')}
  else{TRG.visible=QG.visible=true;G.fpins=FILLS.map(f=>{const p=gpin('fill');p.x=f.x;p.z=f.z;p.show=true;p.el.innerHTML='Fill here';return p});
    G.tpins=TROUGHS.map(t=>{const p=gpin('trough');p.x=t.x;p.z=t.z;p.dy=1;p.show=true;p.el.innerHTML='Water trough';return p});
    BUYERS.forEach(B=>{const safe=K.safeWater(B.g),tank=B.g!=='host'&&S().active.includes('water');B.rate=B.g==='host'?.13:(safe?.06:(tank?.12:.3));B.dem=Math.round(B.g==='host'?5:(safe?2:(tank?4:9)));B.acc=0;B.pin=gpin('');B.pin.x=B.x;B.pin.z=B.z;B.pin.show=true})}
  drawHud();
  const bh=K.safeWater('idp');
  const intro=kind==='tuk'?
   '<h2>Tuk-tuk driver</h2><div class="sub">3 minutes. Goal: take home 25,000 SDG after fuel.</div><ul><li>Drive to a passenger waving at a stop, then slow down to let them in.</li><li>Take them to the stop shown on the map. Short trips pay 2,000 SDG, middle ones 3,000 SDG, long ones 5,000 SDG.</li><li>You start with a full tank. When it runs low, the arrow takes you to the petrol station to join the queue'+(G.nino?', which is even longer in this El Niño year':'')+'. If the tank runs dry, you push the tuk-tuk at walking pace.</li><li>Follow the blue arrow. It points to the next passenger, then to their stop.</li><li>Passengers using a wheelchair or going to the health centre need you to stop right at the door.</li></ul><p>Fares are based on recent shared rides in Khartoum, where a short trip cost about 2,000 to 3,000 SDG.</p>'
   :'<h2>Donkey water seller</h2><div class="sub">3 minutes. Goal: sell 4 barrels of water, about 20,000 SDG.</div><ul><li>Ride to the river and stop at a fill point to fill your barrel (11 jerrycans).</li><li>Sell by the jerrycan at the IDP site, the refugee camp, the host town and the returnee village, for 450 SDG each.</li><li>Your donkey gets tired. Stop at a water trough to rest it, or it slows down.</li><li>Follow the arrow: to the river when the barrel is empty, then to the places where families are waiting to buy.</li></ul><p>'+(bh?'The solar borehole now gives free clean water at the IDP site, so fewer families there buy from carts.':'With no safe water nearby, many families depend on carts like yours.')+' A barrel sells for about 5,000 SDG, as in recent reports from Khartoum.</p>';
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
  if(G.kind==='tuk'){const net=G.fares-Math.round((100-G.tank)*50*(G.nino?1.35:1)/10)*10;
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
    cards='<div class="gc goal"><small>Barrels sold</small><b>'+brl.toFixed(1)+' of 4</b><span class="bar"><i style="width:'+Math.min(100,brl/4*100)+'%"></i></span></div><div class="gc"><small>Earned</small><b>'+fmt(G.money)+' SDG</b></div><div class="gc fuel'+(G.energy<30?' low':'')+'"><small>Donkey</small><b>'+Math.round(G.energy)+'%</b><span class="bar"><i style="width:'+G.energy+'%"></i></span></div>'}
  hud.innerHTML='<div class="gc"><small>Time</small><b>'+mm+':'+ss+'</b></div>'+cards+'<div class="gc task"><small>Now</small><b>'+task+'</b></div>';
}
function quitJob(){if(!G.on)return;cleanup();exitMode()}
function cleanup(){G.on=false;G.state='off';if(veh){veh.g.parent&&veh.g.parent.remove(veh.g);veh=null}for(const p of G.pass||[])p.f.g.parent&&p.f.g.parent.remove(p.f.g);G.pass=[];G.ride=null;
  gpins.forEach(p=>p.el.remove());gpins=[];hud&&hud.remove();hud=null;toastEl&&toastEl.remove();toastEl=null;G.kb&&G.kb.remove();TRG.visible=QG.visible=false;AR.visible=RG.visible=false;EA.style.display='none';document.querySelectorAll('.gcard').forEach(c=>c.remove());for(const k in keys)keys[k]=false}
function finish(why){G.state='done';const kind=G.kind;let html;
  if(kind==='tuk'){G.fuel=Math.round((100-G.tank)*50*(G.nino?1.35:1)/10)*10;const net=G.fares-G.fuel,ok=net>=25000;
    if(why==='fuel'){const n=K.FUEL.n||4;html='<h2>Stuck in the fuel queue</h2><div class="sub">Tuk-tuk driver, after '+(()=>{const e=Math.round(180-G.time);return e<60?e+' seconds':Math.floor(e/60)+' min '+String(e%60).padStart(2,'0')+' s'})()+' on the road</div><p>You joined the back of a queue of '+n+' vehicles. The pumps run dry often, and the line barely moves. Drivers can wait for hours, sometimes overnight, and every hour in the queue is an hour without fares'+(G.nino?'. In this El Niño year the queue is even longer and fuel costs more':'')+'.</p><p>For most drivers the hardest part of the day is not finding passengers. It is finding fuel.</p><div class="big">'+fmt(net)+' SDG</div><div class="res"><span>Trips</span><span>'+G.trips+'</span><span>Fares</span><span>'+fmt(G.fares)+'</span><span>Fuel used, paid at the pump</span><span>\u2212'+fmt(G.fuel)+'</span><span>Goal: 25,000 SDG</span><span class="'+(ok?'ok':'no')+'">'+(ok?'Met':'Not met')+'</span></div>'}else
    html='<h2>'+(ok?'A good day on the road':'A hard day on the road')+'</h2><div class="sub">Tuk-tuk driver, 3 minutes</div><div class="big">'+fmt(net)+' SDG</div><div class="res"><span>Trips</span><span>'+G.trips+'</span><span>Fares</span><span>'+fmt(G.fares)+'</span><span>Fuel used'+(G.nino?' (El Niño prices)':'')+'</span><span>−'+fmt(G.fuel)+'</span><span>Goal: 25,000 SDG</span><span class="'+(ok?'ok':'no')+'">'+(ok?'Met':'Not met')+'</span></div>'}
  else{const brl=G.sold/11,ok=brl>=4;
    html='<h2>'+(ok?'Four barrels sold':'Not enough water sold')+'</h2><div class="sub">Donkey water seller, 3 minutes</div><div class="big">'+fmt(G.money)+' SDG</div><div class="res"><span>Jerrycans sold</span><span>'+G.sold+'</span><span>Barrels</span><span>'+brl.toFixed(1)+'</span><span>Goal: 4 barrels</span><span class="'+(ok?'ok':'no')+'">'+(ok?'Met':'Not met')+'</span></div>'+
      (K.safeWater('idp')?'<p>Families at the IDP site now get free clean water from the borehole, so fewer bought from you. Cleaner water for everyone means less income for water sellers, unless they find other work.</p>':'<p>With no safe water at the IDP site, families there had to buy from carts like yours, often untreated river water.</p>')}
  const earned=kind==='tuk'?G.fares-G.fuel:G.money;
  html+='<p><b>What it buys:</b> about '+fmt(Math.max(0,earned)/PRICE.sorghum)+' kg of sorghum, at 1,572 SDG a kilo. A day of casual labour paid about 14,704 SDG in April 2026, so this is '+(earned>=PRICE.wage?'more than':'less than')+' a day’s wage.</p><div class="src">'+SRC+'</div>';
  html+='<div class="foot"><button class="btn" data-g="map">Back to the map</button><button class="btn btn-primary" data-g="again">Play again</button></div>';
  card(html,{map:quitJob,again:()=>{const k=kind;cleanup();exitMode();setTimeout(()=>startJob(k),120)}})}
const tmpV=new THREE.Vector2();
function camFollow(dt){const zm=ZM[G.zoom-1];controls.target.lerp(TV.set(G.x,0,G.z),Math.min(1,dt*4));camera.position.lerp(TV.set(G.x,8.5*zm,G.z+10.5*zm),Math.min(1,dt*3));camera.lookAt(controls.target)}
function stepGame(dt){
  if(G.state==='queue'){G.time-=dt;G.qWait-=dt;G.spd=0;placeVeh();if(G.qWait<=0){const cost=Math.round((100-G.tank)*50*(G.nino?1.35:1)/10)*10;G.fuel+=cost;G.tank=100;G.state='play';G.qDone=true;toast('Tank full. You paid '+fmt(cost)+' SDG for fuel.','good')}
    if(G.time<=0){G.time=0;drawHud();finish();return}camFollow(dt);G.hudT=(G.hudT||0)+dt;if(G.hudT>.25){G.hudT=0;drawHud()}return}
  if(G.state!=='play'){if(veh)placeVeh();return}
  G.time-=dt;if(G.time<=0){G.time=0;drawHud();finish();return}
  // input
  let f=(keys.arrowup||keys.w?1:0)-(keys.arrowdown||keys.s?1:0),turn=(keys.arrowleft||keys.a?1:0)-(keys.arrowright||keys.d?1:0);
  if(G.auto){const d=Math.hypot(G.auto.x-G.x,G.auto.z-G.z);if(d<.5){G.auto=null}else{const wp=d>2.5?route(RT_AUTO,G.auto.x,G.auto.z,dt):[G.auto.x,G.auto.z],dx=wp[0]-G.x,dz=wp[1]-G.z;let da=Math.atan2(dx,dz)-G.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));turn=Math.max(-1,Math.min(1,da*2.2));f=Math.abs(da)>1.6?.3:(d<1.5?.5:1)}}
  const onRoad=K.roadD(G.x,G.z)<1.1;
  let max=G.kind==='tuk'?(G.tank<=0?.7:(onRoad?4.6:2.7)):2.3*(G.energy<30?.5:1);
  const want=f>0?f*max:(f<0?-max*.4:0);G.spd+=(want-G.spd)*Math.min(1,dt*(f?1.8:3.2));
  G.yaw+=turn*dt*2.4*(Math.min(1,Math.abs(G.spd)/1.2)*.8+.2)*(G.spd<-.05?-1:1);
  const ox=G.x,oz=G.z;tmpV.set(G.x+Math.sin(G.yaw)*G.spd*dt,G.z+Math.cos(G.yaw)*G.spd*dt);K.pushOut(tmpV);K.pushOut(tmpV);
  const moved=Math.hypot(tmpV.x-ox,tmpV.y-oz);if(Math.abs(G.spd)*dt>1e-4&&moved<Math.abs(G.spd)*dt*.3)G.spd*=.6;
  G.x=tmpV.x;G.z=tmpV.y;placeVeh();
  // wheels and legs
  if(veh.legs){veh.phase=(veh.phase||0)+moved*7;veh.legs.forEach((lg,j)=>lg.rotation.x=moved>1e-4?Math.sin(veh.phase+(j%2?Math.PI:0)+(j>1?Math.PI/2:0))*.5:0)}
  else veh.g.rotation.z=moved>1e-4?Math.sin(performance.now()/60)*.01:0;
  const slow=Math.abs(G.spd)<.7;
  if(G.kind==='tuk'){G.tank=Math.max(0,G.tank-moved*.2);
    {const e=K.FUEL.end,de=Math.hypot(e.x-G.x,e.z-G.z);if(de>3)G.qDone=false;if(de<2.2&&slow&&G.tank<70){finish('fuel');return}}
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

/* ---------- per-frame updates ---------- */
K.hooks.push((dt,t)=>{
  stepFly(dt);
  const dist=camera.position.distanceTo(controls.target);DET.visible=VI>=0||G.on||dist<22;
  if(G.on)stepGame(dt);
  guide(dt,t);
  for(const p of pins){const s=project(p.x,h(p.x,p.z)+p.dy,p.z);if(!s){p.el.style.display='none';continue}p.el.style.display='';p.el.style.left=s.x+'px';p.el.style.top=s.y+'px'}
  for(const p of gpins){if(!p.show){p.el.style.display='none';continue}const s=project(p.x,h(p.x,p.z)+p.dy,p.z);if(!s){p.el.style.display='none';continue}p.el.style.display='';p.el.style.left=s.x+'px';p.el.style.top=s.y+'px'}
});
window.__XTRAS={startVisit,startJob,endVisit,quitJob,G,PLACES};
}

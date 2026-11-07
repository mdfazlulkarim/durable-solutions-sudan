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
  K.INS.l=K.INS.r=K.INS.t=-99;if(window.__applyInsets)window.__applyInsets();else K.setInsets(0,0,0);setTimeout(()=>K.fitCam(),60)}
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
function startVisit(i){if(G.on)return;if(VI<0)enterMode('vmode');VI=i;sel=-1;view.classList.add('visiting');const pl=PLACES[i];flyTo(pl.x,pl.z,pl.d,pl.a||0);drawVisit()}
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
const STOPS=[['Bus stop',K.LIFE.stop.x+1.4,K.LIFE.stop.z+.8],['Market',P.market.x+.2,P.market.z-1.5],['IDP site',2.2,1.3],['Refugee camp',P.camp.x+1.6,-20.4],['Health centre',P.clinic.x-1.3,-3.8],['Returnee village',-14.8,-5.3],['Host town',14.4,-7.5],['Locality office',P.office.x+1.8,-3.4],['Footbridge',K.BRIDGE.x+1.6,zr(K.BRIDGE.x)-3.4],['Old well',K.WELL.x+1.6,K.WELL.z+1.4]].map(([n,x,z])=>{const f=free(x,z);return{n,x:f.x,z:f.z}});
/* places for the water seller */
const FILLS=[[2.2,zr(2.2)-1.95],[-13,zr(-13)-1.95],[16.5,zr(16.5)-1.95]].map(([x,z])=>({x,z}));
const TROUGHS=[free(P.pump.x+1.4,P.pump.z+1.2),free(-.3,zr(-.3)-2.3)];
const BUYERS=[['IDP site','idp',-.6,1.7],['Refugee camp','ref',P.camp.x+2.6,-20.4],['Host town','host',16.6,-7.6],['Returnee village','ret',-15.6,-5.6]].map(([n,g,x,z])=>{const f=free(x,z);return{n,g,x:f.x,z:f.z}});
const TRG=new THREE.Group();scene.add(TRG);TRG.visible=false;
for(const t of TROUGHS){const g=new THREE.Group();g.position.set(t.x,h(t.x,t.z),t.z);TRG.add(g);M(new THREE.BoxGeometry(.9,.22,.36),'#8a6a48',0,.11,0,g);M(new THREE.BoxGeometry(.8,.02,.26),'#4c8ec4',0,.22,0,g)}
const QG=new THREE.Group();scene.add(QG);QG.visible=false;
for(const B of BUYERS){B.q=[];for(let k=0;k<3;k++){const b=figure(3200+BUYERS.indexOf(B)*5+k,{woman:k!==1,parent:QG});const can=K.mesh(K.geo.can,K.mat(['#e2b632','#3f8fd0','#e8e2d0'][k]),0,-.26,0,b.armR);const x=B.x+.5+k*.45,z=B.z+.35;b.g.position.set(x,h(x,z),z);b.g.rotation.y=-Math.PI/2;B.q.push(b)}}
let veh=null;
function makeVehicle(kind){
  if(kind==='tuk'){const T=K.makeTuk('#d9a521');T.pass.g.visible=false;return{g:T.g,pass:T.pass,driver:T.driver}}
  const D=K.makeDonkey();const man=figure(3301,{woman:false,parent:D.g,scale:.87});man.g.position.set(0,.33,.14);K.sitPose(man,true);man.armL.rotation.x=man.armR.rotation.x=-.9;return{g:D.g,legs:D.legs,barrel:D.barrel,man}}
function startJob(kind){if(G.on)return;if(VI>=0)endVisit();
  Object.assign(G,{on:true,kind,state:'intro',time:180,money:0,fuel:0,fares:0,trips:0,spd:0,auto:null,pass:[],ride:null,barrel:0,sold:0,energy:100,act:0,sinceSpawn:0,nino:S().season>=4});
  enterMode('gmode');controls.enabled=false;K.keyGrab=true;
  const start=kind==='tuk'?free(K.LIFE.stand.x,K.LIFE.stand.z+.6):free(FILLS[0].x+1,FILLS[0].z-1.2);
  veh=makeVehicle(kind);G.x=start.x;G.z=start.z;G.yaw=kind==='tuk'?Math.PI/2:Math.PI;placeVeh();
  camera.position.set(G.x,9,G.z+11);controls.target.set(G.x,0,G.z);
  hud=document.createElement('div');hud.className='ghud';view.appendChild(hud);toastEl=document.createElement('div');toastEl.className='gtoast';view.appendChild(toastEl);
  const kb=document.createElement('div');kb.className='gkeys';kb.innerHTML='<b>Drive:</b> arrow keys or W A S D, or click the ground to drive there. <b>Esc</b> to leave.';view.appendChild(kb);G.kb=kb;
  if(kind==='tuk'){for(let k=0;k<3;k++)spawnPassenger();G.dpin=gpin('dest')}
  else{TRG.visible=QG.visible=true;G.fpins=FILLS.map(f=>{const p=gpin('fill');p.x=f.x;p.z=f.z;p.show=true;p.el.innerHTML='Fill here';return p});
    G.tpins=TROUGHS.map(t=>{const p=gpin('trough');p.x=t.x;p.z=t.z;p.dy=1;p.show=true;p.el.innerHTML='Water trough';return p});
    BUYERS.forEach(B=>{const safe=K.safeWater(B.g),tank=B.g!=='host'&&S().active.includes('water');B.rate=B.g==='host'?.13:(safe?.06:(tank?.12:.3));B.dem=Math.round(B.g==='host'?5:(safe?2:(tank?4:9)));B.acc=0;B.pin=gpin('');B.pin.x=B.x;B.pin.z=B.z;B.pin.show=true})}
  drawHud();
  const bh=K.safeWater('idp');
  const intro=kind==='tuk'?
   '<h2>Tuk-tuk driver</h2><div class="sub">3 minutes. Goal: take home 25,000 SDG after fuel.</div><ul><li>Drive to a passenger waving at a stop, then slow down to let them in.</li><li>Take them to the stop shown on the map. Short trips pay 2,000 SDG, middle ones 3,000 SDG, long ones 5,000 SDG.</li><li>Fuel costs money for every metre you drive'+(G.nino?', and in this El Niño year it costs a third more':'')+'.</li><li>Passengers using a wheelchair or going to the health centre need you to stop right at the door.</li></ul><p>Fares are based on recent shared rides in Khartoum, where a short trip cost about 2,000 to 3,000 SDG.</p>'
   :'<h2>Donkey water seller</h2><div class="sub">3 minutes. Goal: sell 4 barrels of water, about 20,000 SDG.</div><ul><li>Ride to the river and stop at a fill point to fill your barrel (11 jerrycans).</li><li>Sell by the jerrycan at the IDP site, the refugee camp, the host town and the returnee village, for 450 SDG each.</li><li>Your donkey gets tired. Stop at a water trough to rest it, or it slows down.</li></ul><p>'+(bh?'The solar borehole now gives free clean water at the IDP site, so fewer families there buy from carts.':'With no safe water nearby, many families depend on carts like yours.')+' A barrel sells for about 5,000 SDG, as in recent reports from Khartoum.</p>';
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
  let task='',goal,pct;
  if(G.kind==='tuk'){const net=G.fares-G.fuel;goal='<small>Take-home</small><b>'+fmt(net)+' SDG</b><span class="bar"><i style="width:'+Math.max(0,Math.min(100,net/250))+'%"></i></span>';
    task=G.ride?('Take your passenger to <b style="display:inline">'+esc(STOPS[G.ride.to].n)+'</b>'+(G.ride.kind?' and stop right at the door':'')):'Pick up a passenger waiting at a stop';
    hud.innerHTML='<div class="gc"><small>Time</small><b>'+mm+':'+ss+'</b></div><div class="gc goal">'+goal+'</div><div class="gc"><small>Fares</small><b>'+fmt(G.fares)+'</b></div><div class="gc"><small>Fuel</small><b>−'+fmt(G.fuel)+'</b></div><div class="gc task"><small>Now</small><b>'+task+'</b></div><button class="quit" type="button">Leave</button>'}
  else{const brl=G.sold/11;goal='<small>Barrels sold</small><b>'+brl.toFixed(1)+' of 4</b><span class="bar"><i style="width:'+Math.min(100,brl/4*100)+'%"></i></span>';
    task=G.barrel>0?'Sell water: '+G.barrel+(G.barrel===1?' jerrycan':' jerrycans')+' left in the barrel':'Your barrel is empty. Ride to the river and fill it';if(G.energy<30)task='Your donkey is tired. Rest it at a water trough';
    hud.innerHTML='<div class="gc"><small>Time</small><b>'+mm+':'+ss+'</b></div><div class="gc goal">'+goal+'</div><div class="gc"><small>Earned</small><b>'+fmt(G.money)+' SDG</b></div><div class="gc"><small>Donkey</small><b>'+Math.round(G.energy)+'%</b></div><div class="gc task"><small>Now</small><b>'+task+'</b></div><button class="quit" type="button">Leave</button>'}
  hud.querySelector('.quit').onclick=quitJob}
function quitJob(){if(!G.on)return;cleanup();exitMode()}
function cleanup(){G.on=false;G.state='off';if(veh){veh.g.parent&&veh.g.parent.remove(veh.g);veh=null}for(const p of G.pass||[])p.f.g.parent&&p.f.g.parent.remove(p.f.g);G.pass=[];G.ride=null;
  gpins.forEach(p=>p.el.remove());gpins=[];hud&&hud.remove();hud=null;toastEl&&toastEl.remove();toastEl=null;G.kb&&G.kb.remove();TRG.visible=QG.visible=false;document.querySelectorAll('.gcard').forEach(c=>c.remove());for(const k in keys)keys[k]=false}
function finish(){G.state='done';const kind=G.kind;let html;
  if(kind==='tuk'){const net=G.fares-G.fuel,ok=net>=25000;
    html='<h2>'+(ok?'A good day on the road':'A hard day on the road')+'</h2><div class="sub">Tuk-tuk driver, 3 minutes</div><div class="big">'+fmt(net)+' SDG</div><div class="res"><span>Trips</span><span>'+G.trips+'</span><span>Fares</span><span>'+fmt(G.fares)+'</span><span>Fuel'+(G.nino?' (El Niño prices)':'')+'</span><span>−'+fmt(G.fuel)+'</span><span>Goal: 25,000 SDG</span><span class="'+(ok?'ok':'no')+'">'+(ok?'Met':'Not met')+'</span></div>'}
  else{const brl=G.sold/11,ok=brl>=4;
    html='<h2>'+(ok?'Four barrels sold':'Not enough water sold')+'</h2><div class="sub">Donkey water seller, 3 minutes</div><div class="big">'+fmt(G.money)+' SDG</div><div class="res"><span>Jerrycans sold</span><span>'+G.sold+'</span><span>Barrels</span><span>'+brl.toFixed(1)+'</span><span>Goal: 4 barrels</span><span class="'+(ok?'ok':'no')+'">'+(ok?'Met':'Not met')+'</span></div>'+
      (K.safeWater('idp')?'<p>Families at the IDP site now get free clean water from the borehole, so fewer bought from you. Cleaner water for everyone means less income for water sellers, unless they find other work.</p>':'<p>With no safe water at the IDP site, families there had to buy from carts like yours, often untreated river water.</p>')}
  const earned=kind==='tuk'?G.fares-G.fuel:G.money;
  html+='<p><b>What it buys:</b> about '+fmt(Math.max(0,earned)/PRICE.sorghum)+' kg of sorghum, at 1,572 SDG a kilo. A day of casual labour paid about 14,704 SDG in April 2026, so this is '+(earned>=PRICE.wage?'more than':'less than')+' a day’s wage.</p><div class="src">'+SRC+'</div>';
  html+='<div class="foot"><button class="btn" data-g="map">Back to the map</button><button class="btn btn-primary" data-g="again">Play again</button></div>';
  card(html,{map:quitJob,again:()=>{const k=kind;cleanup();exitMode();setTimeout(()=>startJob(k),120)}})}
const tmpV=new THREE.Vector2();
function stepGame(dt){
  if(G.state!=='play'){if(veh)placeVeh();return}
  G.time-=dt;if(G.time<=0){G.time=0;drawHud();finish();return}
  // input
  let f=(keys.arrowup||keys.w?1:0)-(keys.arrowdown||keys.s?1:0),turn=(keys.arrowleft||keys.a?1:0)-(keys.arrowright||keys.d?1:0);
  if(G.auto){const dx=G.auto.x-G.x,dz=G.auto.z-G.z,d=Math.hypot(dx,dz);if(d<.5){G.auto=null}else{let da=Math.atan2(dx,dz)-G.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));turn=Math.max(-1,Math.min(1,da*2.2));f=Math.abs(da)>1.6?.3:(d<1.5?.5:1)}}
  const onRoad=K.roadD(G.x,G.z)<1.1;
  let max=G.kind==='tuk'?(onRoad?4.6:2.7):2.3*(G.energy<30?.5:1);
  const want=f>0?f*max:(f<0?-max*.4:0);G.spd+=(want-G.spd)*Math.min(1,dt*(f?1.8:3.2));
  G.yaw+=turn*dt*2.4*(Math.min(1,Math.abs(G.spd)/1.2)*.8+.2)*(G.spd<-.05?-1:1);
  const ox=G.x,oz=G.z;tmpV.set(G.x+Math.sin(G.yaw)*G.spd*dt,G.z+Math.cos(G.yaw)*G.spd*dt);K.pushOut(tmpV);K.pushOut(tmpV);
  const moved=Math.hypot(tmpV.x-ox,tmpV.y-oz);if(Math.abs(G.spd)*dt>1e-4&&moved<Math.abs(G.spd)*dt*.3)G.spd*=.6;
  G.x=tmpV.x;G.z=tmpV.y;placeVeh();
  // wheels and legs
  if(veh.legs){veh.phase=(veh.phase||0)+moved*7;veh.legs.forEach((lg,j)=>lg.rotation.x=moved>1e-4?Math.sin(veh.phase+(j%2?Math.PI:0)+(j>1?Math.PI/2:0))*.5:0)}
  else veh.g.rotation.z=moved>1e-4?Math.sin(performance.now()/60)*.01:0;
  const slow=Math.abs(G.spd)<.7;
  if(G.kind==='tuk'){G.fuel+=moved*16*(G.nino?1.35:1);
    for(const p of G.pass){p.wave+=dt*6;p.f.armR.rotation.x=-2.6+Math.sin(p.wave)*.4;p.f.g.rotation.y=Math.atan2(G.x-p.f.g.position.x,G.z-p.f.g.position.z)}
    if(!G.ride){const p=G.pass.find(p=>Math.hypot(STOPS[p.from].x-G.x,STOPS[p.from].z-G.z)<1.9);if(p&&slow){G.ride=p;G.pass=G.pass.filter(q=>q!==p);p.f.g.parent.remove(p.f.g);p.pin.show=false;p.pin.el.remove();gpins=gpins.filter(q=>q!==p.pin);veh.pass.g.visible=true;
        toast((p.kind==='chair'?'A passenger who uses a wheelchair':(p.kind==='sick'?'A sick passenger':'A passenger'))+' gets in. To '+STOPS[p.to].n+'.');G.sinceSpawn=0}}
    else{const d=STOPS[G.ride.to],dd=Math.hypot(d.x-G.x,d.z-G.z),rr=G.ride.kind?1.15:2.1;
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
  const cx=G.x,cz=G.z;controls.target.lerp(TV.set(cx,0,cz),Math.min(1,dt*4));camera.position.lerp(TV.set(cx,8.5,cz+10.5),Math.min(1,dt*3));camera.lookAt(controls.target);
  if(toastT>0){toastT-=dt;if(toastT<=0&&toastEl)toastEl.classList.remove('on')}
  G.hudT=(G.hudT||0)+dt;if(G.hudT>.25){G.hudT=0;drawHud()}}

/* ---------- per-frame updates ---------- */
K.hooks.push((dt,t)=>{
  stepFly(dt);
  const dist=camera.position.distanceTo(controls.target);DET.visible=VI>=0||G.on||dist<22;
  if(G.on)stepGame(dt);
  for(const p of pins){const s=project(p.x,h(p.x,p.z)+p.dy,p.z);if(!s){p.el.style.display='none';continue}p.el.style.display='';p.el.style.left=s.x+'px';p.el.style.top=s.y+'px'}
  for(const p of gpins){if(!p.show){p.el.style.display='none';continue}const s=project(p.x,h(p.x,p.z)+p.dy,p.z);if(!s){p.el.style.display='none';continue}p.el.style.display='';p.el.style.left=s.x+'px';p.el.style.top=s.y+'px'}
});
window.__XTRAS={startVisit,startJob,endVisit,quitJob,G,PLACES};
}

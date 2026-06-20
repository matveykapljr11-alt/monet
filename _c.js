
"use strict";
const tg=window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null;
try{ if(tg){ tg.ready(); tg.expand(); if(tg.setBackgroundColor) tg.setBackgroundColor('#E7EDE3'); } }catch(e){}

/* =====================================================================
   CONFIG — the two things only YOU can wire (see README.md)
   ===================================================================== */
const CONFIG = {
  // 1) Your deployed worker.js. Empty => DEMO prices (clearly labelled).
  PROXY_BASE: "",
  // 2) Where the full catalogue lives. Falls back to embedded SEED below.
  CATALOG_URL: "catalog.json",
  CURRENCY_USD: 1.76,     // TON->USD, refreshed at runtime if proxy provides it
  // 3) MONETISATION — your referral codes per marketplace. Every "buy" link
  //    gets tagged so you earn on routed sales. Fill what each market supports;
  //    blank => clean link. ref()/startapp params are the common patterns.
  REF: {
    Tonnel:   { param: "startapp", code: "" },   // e.g. code:"monet"
    Portals:  { param: "ref",      code: "" },
    Getgems:  { param: "ref",      code: "" },
    Fragment: { param: "",         code: "" }     // Fragment has no ref program
  }
};
function refLink(mkt, url){
  if(!url) return url;
  const r=CONFIG.REF&&CONFIG.REF[mkt];
  if(!r||!r.param||!r.code) return url;
  try{ const u=new URL(url); u.searchParams.set(r.param, r.code); return u.toString(); }
  catch(e){ return url+(url.includes("?")?"&":"?")+r.param+"="+encodeURIComponent(r.code); }
}

/* Embedded SEED so the file works standalone (file://). Replaced by CATALOG_URL if reachable. */
const SEED_CATALOG = {"_meta":{"seed":true},"collections":[
  {"id":"plushpepe","name":"Plush Pepe","slug":"plushpepe","supply":2812,"floorTON":11000,
   "models":[{"n":"Classic","pct":38},{"n":"Hoodie","pct":22},{"n":"Astronaut","pct":12},{"n":"Pharaoh","pct":7},{"n":"Samurai","pct":4},{"n":"Golden","pct":1.2},{"n":"Diamond","pct":0.4}],
   "backdrops":[{"n":"Onyx Black","pct":20,"hex":"#1b1b1f"},{"n":"Forest","pct":16,"hex":"#234a31"},{"n":"Sky","pct":14,"hex":"#3f6fa3"},{"n":"Crimson","pct":9,"hex":"#7a2230"},{"n":"Royal Purple","pct":5,"hex":"#4b2e6b"},{"n":"Aurora","pct":1.5,"hex":"#2e9b8f"},{"n":"Pure Gold","pct":0.6,"hex":"#caa24b"}],
   "symbols":[{"n":"None","pct":30},{"n":"Hearts","pct":18},{"n":"Stars","pct":12},{"n":"Skulls","pct":7},{"n":"Crowns","pct":3},{"n":"Toncoin","pct":1},{"n":"Diamonds","pct":0.3}]},
  {"id":"durovscap","name":"Durov's Cap","slug":"durovscap","supply":1000,"floorTON":1150,
   "models":[{"n":"Standard","pct":60},{"n":"Signed","pct":25},{"n":"Vintage","pct":12},{"n":"Founder","pct":3}],
   "backdrops":[{"n":"Telegram Blue","pct":22,"hex":"#2aabee"},{"n":"Graphite","pct":18,"hex":"#2c2c30"},{"n":"Sand","pct":10,"hex":"#c8b48a"},{"n":"Emerald","pct":4,"hex":"#1f7a52"},{"n":"Platinum","pct":1,"hex":"#cfd6dd"}],
   "symbols":[{"n":"None","pct":50},{"n":"Paper Plane","pct":22},{"n":"Lock","pct":8},{"n":"Crown","pct":2}]},
  {"id":"preciouspeach","name":"Precious Peach","slug":"preciouspeach","supply":8000,"floorTON":920,
   "models":[{"n":"Fresh","pct":45},{"n":"Ripe","pct":30},{"n":"Candied","pct":18},{"n":"Crystal","pct":5},{"n":"Eternal","pct":2}],
   "backdrops":[{"n":"Cream","pct":24,"hex":"#efe2cf"},{"n":"Peony","pct":16,"hex":"#d98aa0"},{"n":"Mint","pct":10,"hex":"#7fc8a9"},{"n":"Velvet","pct":4,"hex":"#6b2e4b"},{"n":"Sunburst","pct":1,"hex":"#e7a13c"}],
   "symbols":[{"n":"None","pct":55},{"n":"Leaf","pct":28},{"n":"Blossom","pct":12},{"n":"Halo","pct":3}]},
  {"id":"signetring","name":"Signet Ring","slug":"signetring","supply":6000,"floorTON":530,
   "models":[{"n":"Silver","pct":48},{"n":"Gold","pct":32},{"n":"Obsidian","pct":15},{"n":"Royal","pct":5}],
   "backdrops":[{"n":"Leather","pct":28,"hex":"#5a3a22"},{"n":"Marble","pct":18,"hex":"#d8d4cc"},{"n":"Velvet","pct":8,"hex":"#6b2e4b"},{"n":"Imperial","pct":2,"hex":"#caa24b"}],
   "symbols":[{"n":"Crest","pct":50},{"n":"Initial","pct":30},{"n":"Lion","pct":16},{"n":"Eagle","pct":4}]},
  {"id":"eternalrose","name":"Eternal Rose","slug":"eternalrose","supply":20000,"floorTON":260,
   "models":[{"n":"Red","pct":46},{"n":"White","pct":30},{"n":"Black","pct":18},{"n":"Crystal","pct":5},{"n":"Golden","pct":1}],
   "backdrops":[{"n":"Garden","pct":26,"hex":"#2f6b3f"},{"n":"Dusk","pct":18,"hex":"#6b3a5a"},{"n":"Frost","pct":9,"hex":"#bcd3df"},{"n":"Blood Moon","pct":2,"hex":"#7a2230"}],
   "symbols":[{"n":"None","pct":58},{"n":"Thorns","pct":26},{"n":"Dewdrop","pct":13},{"n":"Halo","pct":3}]},
  {"id":"toybear","name":"Toy Bear","slug":"toybear","supply":25000,"floorTON":150,
   "models":[{"n":"Brown","pct":44},{"n":"Panda","pct":28},{"n":"Polar","pct":18},{"n":"Rainbow","pct":8},{"n":"Galaxy","pct":2}],
   "backdrops":[{"n":"Nursery","pct":26,"hex":"#e7c9a3"},{"n":"Night","pct":18,"hex":"#2c2c40"},{"n":"Candy","pct":9,"hex":"#e58aa0"},{"n":"Aurora","pct":2,"hex":"#2e9b8f"}],
   "symbols":[{"n":"None","pct":60},{"n":"Bowtie","pct":26},{"n":"Honey","pct":12},{"n":"Crown","pct":2}]}
]};

let CATALOG=SEED_CATALOG, CAT_LIVE=false;
const ICONS={plushpepe:"🐸",durovscap:"🧢",preciouspeach:"🍑",astralshard:"💠",signetring:"💍",vintagecigar:"🚬",eternalrose:"🌹",toybear:"🧸"};
function icon(c){ return ICONS[c.id]||"🎁"; }
function img(c){ return c.slug?("https://nft.fragment.com/gift/"+c.slug+"-1.small.jpg"):null; }
function esc(s){ return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
function grp(n){ n=Math.round(n); return n>=1000?n.toLocaleString("en-US").replace(/,/g," "):String(n); }
function fmtTON(n){ return grp(n)+" TON"; }
function fmtUSD(n){ return "$"+grp(n*CONFIG.CURRENCY_USD); }

/* ---------- catalogue load ---------- */
async function loadCatalog(){
  try{
    const r=await fetch(CONFIG.CATALOG_URL,{cache:"no-store"});
    if(r.ok){ const j=await r.json(); if(j&&Array.isArray(j.collections)&&j.collections.length){ CATALOG=j; CAT_LIVE=!(j._meta&&j._meta.seed); } }
  }catch(e){}
  const b=document.getElementById("catBadge"), t=document.getElementById("catBadgeTxt");
  b.className="chip "+(CAT_LIVE?"live":"demo");
  t.textContent=(CAT_LIVE?"каталог live · ":"каталог seed · ")+CATALOG.collections.length+" колл.";
  if(!CAT_LIVE){ const w=document.getElementById("seedWarn"); w.style.display="block";
    w.innerHTML="⚠️ Каталог — <b>seed</b> ("+CATALOG.collections.length+" коллекций, трейты примерные). Запусти <b>ingest.mjs</b>, чтобы заменить его полным реальным индексом всех коллекций и вариаций."; }
  const pb=document.getElementById("priceBadge"), pt=document.getElementById("priceBadgeTxt");
  const live=!!CONFIG.PROXY_BASE;
  pb.className="chip "+(live?"live":"demo");
  pt.textContent=live?"цены live":"цены demo";
}

/* =====================================================================
   SEARCH + IDENTIFY
   ===================================================================== */
function parseLink(q){
  // t.me/nft/PlushPepe-123  |  fragment.com/gift/plushpepe ...
  const m=q.match(/nft\/([A-Za-z0-9]+)[-\/](\d+)/) || q.match(/gift\/([A-Za-z0-9]+)/i);
  if(!m) return null;
  const key=m[1].toLowerCase();
  const col=CATALOG.collections.find(c=> c.slug.toLowerCase()===key || c.id===key || c.name.toLowerCase().replace(/[^a-z]/g,"")===key );
  if(!col) return null;
  return { col, num: m[2]?parseInt(m[2],10):null };
}
function search(q){
  q=q.trim().toLowerCase();
  const res=document.getElementById("results");
  if(!q){ res.innerHTML=topList(); return; }
  // link?
  const link=parseLink(q);
  if(link){ openDetail(link.col.id, link.num); return; }
  const out=[];
  CATALOG.collections.forEach(c=>{
    let hit=null, score=0;
    if(c.name.toLowerCase().includes(q)){ score=100; }
    // trait match
    ["models","backdrops","symbols"].forEach(grp=>{
      (c[grp]||[]).forEach(tr=>{ if(tr.n.toLowerCase().includes(q)){ const s=60-(tr.pct||50)*0.2; if(s>score){score=s;} hit={grp,tr}; } });
    });
    if(score>0) out.push({c,score,hit});
  });
  out.sort((a,b)=>b.score-a.score);
  res.innerHTML = out.length? out.map(o=>resRow(o.c,o.hit)).join("") : '<div class="empty">Ничего не нашлось. Попробуй название коллекции или трейта.</div>';
}
function topList(){
  return '<div class="trait-l" style="margin:6px 2px 4px">Каталог</div>'+
    CATALOG.collections.slice().sort((a,b)=>b.floorTON-a.floorTON).map(c=>resRow(c,null)).join("");
}
function resRow(c,hit){
  const im=img(c);
  const sub = hit ? (hit.grp==="backdrops"?"фон ":hit.grp==="symbols"?"узор ":"модель ")+esc(hit.tr.n)+" · "+hit.tr.pct+"%"
                  : grp(c.supply)+" шт · "+(c.models.length*c.backdrops.length*c.symbols.length)+" комбинаций";
  return '<div class="res" onclick="openDetail(\''+c.id+'\',null)">'+
    '<div class="ic">'+(im?'<img src="'+im+'" loading="lazy" onerror="this.replaceWith(document.createTextNode(\''+icon(c)+'\'))">':icon(c))+'</div>'+
    '<div class="mid"><div class="nm">'+esc(c.name)+'</div><div class="sub">'+sub+'</div></div>'+
    '<div class="rt"><div class="fll">флор</div><div class="fl">'+grp(c.floorTON)+'</div></div></div>';
}

/* =====================================================================
   VARIATION DETAIL — rarity + fair value + cross-market price
   ===================================================================== */
let sel={ colId:null, num:null, model:null, backdrop:null, symbol:null };
function openDetail(colId, num){
  const c=CATALOG.collections.find(x=>x.id===colId); if(!c) return;
  sel={ colId, num:num||null, model:null, backdrop:null, symbol:null };
  document.getElementById("view-search").style.display="none";
  const v=document.getElementById("view-detail"); v.style.display="block";
  window.scrollTo(0,0);
  renderDetail();
}
function backToSearch(){
  document.getElementById("view-detail").style.display="none";
  document.getElementById("view-search").style.display="block";
}
function pick(kind,name){ sel[kind]=(sel[kind]===name?null:name); renderDetail(); priceLookup(); }

function comboRarity(c){
  const parts=[];
  if(sel.model){ const m=c.models.find(x=>x.n===sel.model); if(m) parts.push(m.pct/100); }
  if(sel.backdrop){ const m=c.backdrops.find(x=>x.n===sel.backdrop); if(m) parts.push(m.pct/100); }
  if(sel.symbol){ const m=c.symbols.find(x=>x.n===sel.symbol); if(m) parts.push(m.pct/100); }
  if(!parts.length) return null;
  let p=1; parts.forEach(x=>p*=x);
  let oneIn=Math.max(2,Math.round(1/p));
  oneIn=Math.min(oneIn, c.supply);
  const L=[[20,"Обычная","#9AA4B2"],[200,"Нечастая","#22A35B"],[2000,"Редкая","#3B82F6"],[20000,"Эпическая","#8B5CF6"],[1e9,"Легендарная","#F59E0B"]];
  let key="Обычная",color="#9AA4B2"; for(const [thr,k,col] of L){ if(oneIn<thr){ key=k; color=col; break; } }
  return { oneIn, key, color, p };
}
// honest fair value: floor scaled by a capped log multiplier of rarity
function fairValue(c){
  const r=comboRarity(c);
  if(!r) return { val:c.floorTON, mult:1, isFloor:true };
  // multiplier grows with log of (oneIn / typical), capped relative to supply liquidity
  const ref=40; // ~ a "1 in 40" combo ≈ floor-ish
  let mult = 1 + 0.42*Math.log10(Math.max(1, r.oneIn/ref));
  mult=Math.max(1, Math.min(mult, 1+Math.log10(c.supply))); // cap by collection size
  return { val: Math.round(c.floorTON*mult), mult, isFloor:false };
}

function chipRow(c,kind,arr){
  return '<div class="trait"><div class="trait-l">'+({model:"Модель",backdrop:"Фон",symbol:"Узор"}[kind])+'</div><div class="trait-chips">'+
    arr.map(tr=>{
      const on=sel[kind]===tr.n;
      const sw=(kind==="backdrop"&&tr.hex)?'<span class="sw" style="background:'+tr.hex+'"></span>':'';
      return '<button class="tchip'+(on?" on":"")+'" onclick="pick(\''+kind+'\','+JSON.stringify(tr.n).replace(/"/g,"&quot;")+')">'+sw+esc(tr.n)+'<span class="pc">'+tr.pct+'%</span></button>';
    }).join("")+'</div></div>';
}
function renderDetail(){
  const c=CATALOG.collections.find(x=>x.id===sel.colId); if(!c) return;
  const im=img(c);
  const r=comboRarity(c);
  const fv=fairValue(c);
  const combos=c.models.length*c.backdrops.length*c.symbols.length;
  const title=c.name+(sel.num?(" #"+sel.num):"");
  const v=document.getElementById("view-detail");
  v.innerHTML=
    '<button class="back" onclick="backToSearch()"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>назад к поиску</button>'+
    '<div class="dhead"><div class="ic">'+(im?'<img src="'+im+'" onerror="this.replaceWith(document.createTextNode(\''+icon(c)+'\'))">':icon(c))+'</div>'+
      '<div class="nm"><b>'+esc(title)+'</b><span>'+grp(c.supply)+' шт · '+combos+' возможных комбинаций</span></div></div>'+

    '<div class="panel"><h3>① Собери вариацию</h3>'+
      chipRow(c,"model",c.models)+chipRow(c,"backdrop",c.backdrops)+chipRow(c,"symbol",c.symbols)+
      '<div class="rar">'+(r?
        '<span class="rrank" style="background:'+r.color+'1f;color:'+r.color+'"><span class="rd" style="background:'+r.color+'"></span>'+r.key+'</span>'+
        '<span class="rone">≈ 1 из '+grp(r.oneIn)+' в коллекции</span>'
        :'<span class="rone">Выбери трейты, чтобы оценить редкость комбинации</span>')+'</div>'+
      '<div class="idbar"><input id="idnum" placeholder="или вставь номер / ссылку t.me/nft…" value="'+(sel.num||"")+'"><button onclick="resolveId()">→</button></div>'+
    '</div>'+

    '<div class="pricebox">'+
      '<div class="price-top">'+
        '<div class="lbl">'+(CONFIG.PROXY_BASE?"Лучшая цена по площадкам":"Ориентир (demo)")+'</div>'+
        '<div class="big" id="bestPrice">'+fmtTON(fv.val)+'</div>'+
        '<div class="sub" id="bestSub">'+(fv.isFloor?"флор коллекции":"оценка по редкости · ×"+fv.mult.toFixed(2)+" к флору")+' · '+fmtUSD(fv.val)+'</div>'+
        '<div class="est" id="bestEst">Est. '+fmtTON(Math.round(fv.val*0.85))+' – '+fmtTON(Math.round(fv.val*1.25))+'</div>'+
      '</div>'+
      '<div class="mkt-list" id="mktList"><div class="loadrow">ищу листинги по площадкам…</div></div>'+
    '</div>'+

    '<div class="panel"><h3>③ Снайпер-алерт</h3>'+
      '<p style="margin:0 0 12px;font-size:12.5px;color:var(--txt-2)">Поставь целевую цену — пингану в Telegram, как только эта вариация появится на любой площадке дешевле.</p>'+
      '<div class="idbar"><input id="watchPrice" inputmode="numeric" placeholder="цель, TON (напр. '+grp(Math.round(fv.val*0.9))+')" value="'+(watchFor(c)||"")+'"><button onclick="toggleWatch()" id="watchBtn">'+(watchFor(c)?"обновить":"следить")+'</button></div>'+
      (watchList().length?'<div id="watchListBox" style="margin-top:12px">'+watchListHTML()+'</div>':'<div id="watchListBox"></div>')+
    '</div>'+

    '<div class="panel"><h3>② Контекст коллекции</h3>'+
      '<div class="kv">'+
        kv("Флор",fmtTON(c.floorTON))+kv("Supply",grp(c.supply)+" шт")+
        kv("Комбинаций",grp(combos))+kv("Курс","1 TON ≈ "+fmtUSD(1))+
      '</div></div>';
  priceLookup();
}
function kv(k,v){ return '<div class="row"><div class="k">'+k+'</div><div class="v">'+v+'</div></div>'; }
function resolveId(){
  const raw=(document.getElementById("idnum").value||"").trim();
  const link=parseLink(raw);
  if(link){ sel.num=link.num; if(link.col.id!==sel.colId){ openDetail(link.col.id, link.num); return; } }
  else { const n=parseInt(raw.replace(/\D/g,""),10); if(n>0) sel.num=n; }
  renderDetail();
}

/* =====================================================================
   PRICE AGGREGATION LAYER  (adapter pattern)
   Live: GET {PROXY_BASE}/listings?collection&model&backdrop&symbol&n
   Demo: deterministic synthetic listings, clearly labelled.
   ===================================================================== */
let priceReq=0;
async function priceLookup(){
  const c=CATALOG.collections.find(x=>x.id===sel.colId); if(!c) return;
  const box=document.getElementById("mktList"); if(!box) return;
  const my=++priceReq;
  box.innerHTML='<div class="loadrow">ищу листинги по площадкам…</div>';
  let listings;
  try{ listings = CONFIG.PROXY_BASE ? await liveListings(c) : demoListings(c); }
  catch(e){ listings=null; }
  if(my!==priceReq) return; // stale
  renderListings(box, c, listings);
}
async function liveListings(c){
  const p=CONFIG.PROXY_BASE; const qs=new URLSearchParams({collection:c.id,n:"6"});
  if(sel.model) qs.set("model",sel.model);
  if(sel.backdrop) qs.set("backdrop",sel.backdrop);
  if(sel.symbol) qs.set("symbol",sel.symbol);
  const r=await fetch(p+(p.includes("?")?"&":"?")+"listings&"+qs.toString(),{cache:"no-store"});
  if(!r.ok) throw 0; const d=await r.json();
  if(d&&d.usdRate) CONFIG.CURRENCY_USD=d.usdRate;
  return Array.isArray(d.items)?d.items:[];
}
function demoListings(c){
  // deterministic pseudo-listings around fair value, so the UX is real even without a proxy
  const fv=fairValue(c).val;
  const seedStr=c.id+sel.model+sel.backdrop+sel.symbol;
  let h=2166136261; for(let i=0;i<seedStr.length;i++){ h=Math.imul(h^seedStr.charCodeAt(i),16777619); }
  const rnd=()=>{ h+=0x6D2B79F5; let t=h; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; };
  const mkts=[["Tonnel","t.me/tonnel_network_bot"],["Portals","t.me/portals"],["Getgems","getgems.io"],["Fragment","fragment.com"]];
  const out=mkts.map(m=>{
    const jitter=0.82+rnd()*0.5;
    return { mkt:m[0], link:"https://"+m[1], price:Math.round(fv*jitter),
             num: 100+Math.floor(rnd()*9000), match: !!(sel.model||sel.backdrop||sel.symbol) && rnd()>0.45 };
  }).filter(()=>rnd()>0.12);
  return out;
}
function renderListings(box,c,listings){
  if(!listings){ box.innerHTML='<div class="mkt-note">Не удалось получить данные площадок. Проверь PROXY_BASE.</div>'; return; }
  if(!listings.length){ box.innerHTML='<div class="mkt-note">Активных листингов по этой вариации сейчас нет. Показана оценка по редкости выше.</div>'; return; }
  listings.sort((a,b)=>a.price-b.price);
  const cheapest=listings[0];
  // update hero to real best price when live
  if(CONFIG.PROXY_BASE){
    const bp=document.getElementById("bestPrice"), bs=document.getElementById("bestSub"), be=document.getElementById("bestEst");
    if(bp) bp.textContent=fmtTON(cheapest.price);
    if(bs) bs.textContent="дешевле всего на "+cheapest.mkt+" · "+fmtUSD(cheapest.price);
    const prices=listings.map(l=>l.price); const med=prices[Math.floor(prices.length/2)];
    if(be) be.textContent="медиана листингов "+fmtTON(med)+" · "+listings.length+" предложений";
  }
  box.innerHTML=listings.map((l,i)=>{
    const sub=(l.num!=null?"#"+l.num:"")+(l.match?" · совпадение по трейтам":"");
    return '<div class="mkt"><div class="mn">'+esc(l.mkt)+(i===0?'<span class="cheap">дешевле</span>':'')+'<small>'+esc(sub)+'</small></div>'+
      '<div class="mp">'+fmtTON(l.price)+'</div>'+
      (l.link?'<a class="buy" href="'+esc(refLink(l.mkt,l.link))+'" target="_blank" rel="noopener" onclick="trackBuy('+JSON.stringify(l.mkt)+','+l.price+')">купить ↗</a>':'')+'</div>';
  }).join("")+
  '<div class="mkt-note">'+(CONFIG.PROXY_BASE?'Live-агрегация по площадкам Telegram.':'⚠️ Demo-листинги (детерминированные). Подключи <b>PROXY_BASE</b> в worker.js для живых цен.')+'</div>';
}

/* =====================================================================
   AFFILIATE ATTRIBUTION — fire-and-forget click event to your worker so
   routed sales can be measured / attributed (where the money is).
   ===================================================================== */
function trackBuy(mkt, price){
  try{
    if(CONFIG.PROXY_BASE && navigator.sendBeacon){
      const body=JSON.stringify({ ev:"buy_click", mkt, price, col:sel.colId,
        model:sel.model, backdrop:sel.backdrop, symbol:sel.symbol, ts:Date.now() });
      navigator.sendBeacon(CONFIG.PROXY_BASE+(CONFIG.PROXY_BASE.includes("?")?"&":"?")+"track", body);
    }
  }catch(e){}
}

/* =====================================================================
   SNIPER ALERTS — set a target price for a variation. Stored locally and
   (if proxy + Telegram) synced to the worker, which cron-checks floors
   and pings the user's bot. Bot token + cron = your side (see README).
   ===================================================================== */
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function watchList(){ try{ return JSON.parse(lsGet("monet_watch")||"[]"); }catch(e){ return []; } }
function watchKey(){ return sel.colId+"|"+(sel.model||"")+"|"+(sel.backdrop||"")+"|"+(sel.symbol||""); }
function watchFor(c){ const w=watchList().find(x=>x.key===watchKey()); return w?w.target:null; }
function toggleWatch(){
  const c=CATALOG.collections.find(x=>x.id===sel.colId); if(!c) return;
  const target=parseInt((document.getElementById("watchPrice").value||"").replace(/\D/g,""),10);
  if(!(target>0)) return;
  let list=watchList().filter(x=>x.key!==watchKey());
  const label=c.name+[sel.model,sel.backdrop,sel.symbol].filter(Boolean).map(s=>" · "+s).join("");
  list.unshift({ key:watchKey(), col:sel.colId, label, target,
    model:sel.model||null, backdrop:sel.backdrop||null, symbol:sel.symbol||null, ts:Date.now() });
  list=list.slice(0,50); lsSet("monet_watch", JSON.stringify(list));
  syncWatch();
  const b=document.getElementById("watchListBox"); if(b) b.innerHTML=watchListHTML();
  const wb=document.getElementById("watchBtn"); if(wb) wb.textContent="обновить";
  if(tg&&tg.HapticFeedback){ try{ tg.HapticFeedback.notificationOccurred("success"); }catch(e){} }
}
function removeWatch(key){
  lsSet("monet_watch", JSON.stringify(watchList().filter(x=>x.key!==key)));
  syncWatch();
  const b=document.getElementById("watchListBox"); if(b) b.innerHTML=watchListHTML();
  const wb=document.getElementById("watchBtn"); if(wb&&!watchFor()) wb.textContent="следить";
}
function watchListHTML(){
  const list=watchList(); if(!list.length) return "";
  return '<div class="trait-l" style="margin:4px 2px 8px">Слежу за ('+list.length+')</div>'+
    list.map(w=>'<div class="mkt"><div class="mn">'+esc(w.label)+'<small>цель ≤ '+grp(w.target)+' TON</small></div>'+
      '<button class="buy" style="background:transparent;border-color:var(--line);color:var(--down)" onclick="removeWatch('+JSON.stringify(w.key)+')">убрать</button></div>').join("");
}
async function syncWatch(){
  if(!CONFIG.PROXY_BASE) return;
  const initData=(tg&&tg.initData)||"";
  if(!initData) return; // need Telegram identity to deliver the ping
  try{
    await fetch(CONFIG.PROXY_BASE+(CONFIG.PROXY_BASE.includes("?")?"&":"?")+"watch",{
      method:"POST", headers:{"content-type":"application/json"},
      body:JSON.stringify({ initData, watches:watchList() }) });
  }catch(e){}
}

/* ---------- search input wiring ---------- */
const qEl=document.getElementById("q");
let deb;
qEl.addEventListener("input",()=>{ clearTimeout(deb); deb=setTimeout(()=>search(qEl.value),120); });
qEl.addEventListener("keydown",e=>{ if(e.key==="Enter") search(qEl.value); });

/* ---------- boot ---------- */
(async function(){ await loadCatalog(); search(""); })();
window.openDetail=openDetail; window.backToSearch=backToSearch; window.pick=pick; window.resolveId=resolveId;

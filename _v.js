
"use strict";
window.VF = (function(){
  /* affiliate — твои реф-коды по площадкам. Пусто = чистая ссылка. */
  const REF = {
    Tonnel:   { param:"startapp", code:"" },
    Portals:  { param:"ref",      code:"" },
    Getgems:  { param:"ref",      code:"" }
  };
  function ref(mkt,url){ const r=REF[mkt]; if(!url||!r||!r.param||!r.code) return url;
    try{ const u=new URL(url); u.searchParams.set(r.param,r.code); return u.toString(); }
    catch(e){ return url+(url.includes("?")?"&":"?")+r.param+"="+encodeURIComponent(r.code); } }

  /* SEED-каталог трейтов (модель/фон/узор, % = доля в коллекции).
     Значения примерные — замени реальными, когда подключишь ингест.
     Ключи совпадают с id из твоего COLLECTIONS.gifts. */
  const CAT = {
    plushpepe:{ model:[["Classic",38],["Hoodie",22],["Astronaut",12],["Pharaoh",7],["Samurai",4],["Golden",1.2],["Diamond",0.4]],
      backdrop:[["Onyx Black",20],["Forest",16],["Sky",14],["Crimson",9],["Royal Purple",5],["Aurora",1.5],["Pure Gold",0.6]],
      symbol:[["None",30],["Hearts",18],["Stars",12],["Skulls",7],["Crowns",3],["Toncoin",1],["Diamonds",0.3]] },
    durovcap:{ model:[["Standard",60],["Signed",25],["Vintage",12],["Founder",3]],
      backdrop:[["Telegram Blue",22],["Graphite",18],["Sand",10],["Emerald",4],["Platinum",1]],
      symbol:[["None",50],["Paper Plane",22],["Lock",8],["Crown",2]] },
    preciouspeach:{ model:[["Fresh",45],["Ripe",30],["Candied",18],["Crystal",5],["Eternal",2]],
      backdrop:[["Cream",24],["Peony",16],["Mint",10],["Velvet",4],["Sunburst",1]],
      symbol:[["None",55],["Leaf",28],["Blossom",12],["Halo",3]] },
    signetring:{ model:[["Silver",48],["Gold",32],["Obsidian",15],["Royal",5]],
      backdrop:[["Leather",28],["Marble",18],["Velvet",8],["Imperial",2]],
      symbol:[["Crest",50],["Initial",30],["Lion",16],["Eagle",4]] },
    eternalrose:{ model:[["Red",46],["White",30],["Black",18],["Crystal",5],["Golden",1]],
      backdrop:[["Garden",26],["Dusk",18],["Frost",9],["Blood Moon",2]],
      symbol:[["None",58],["Thorns",26],["Dewdrop",13],["Halo",3]] },
    toybear:{ model:[["Brown",44],["Panda",28],["Polar",18],["Rainbow",8],["Galaxy",2]],
      backdrop:[["Nursery",26],["Night",18],["Candy",9],["Aurora",2]],
      symbol:[["None",60],["Bowtie",26],["Honey",12],["Crown",2]] }
  };

  const RU = (typeof S==="object" && S.lang==="ru");
  const L = RU
    ? {title:"Найти дешевле", sub:"вариация → цена по всем площадкам", pick:"Выбери подарок",
       model:"Модель", backdrop:"Фон", symbol:"Узор", rar:"≈ 1 из", pickHint:"Собери комбинацию",
       find:"Где дешевле", loading:"Ищу по площадкам…", none:"Активных листингов по этой вариации нет",
       est:"Ориентир по редкости", cheapest:"дешевле", buy:"купить", demo:"demo-листинги · подключи прокси для живых цен",
       live:"live по площадкам", noTrait:"для этой коллекции трейты ещё не заведены — показываю по флору"}
    : {title:"Find it cheaper", sub:"variation → price across all markets", pick:"Pick a gift",
       model:"Model", backdrop:"Backdrop", symbol:"Symbol", rar:"≈ 1 in", pickHint:"Build a combination",
       find:"Where cheapest", loading:"Searching markets…", none:"No active listings for this variation",
       est:"Rarity estimate", cheapest:"cheapest", buy:"buy", demo:"demo listings · connect proxy for live prices",
       live:"live across markets", noTrait:"traits not set for this collection — showing by floor"};

  let sel={ id:null, model:null, backdrop:null, symbol:null };
  const esc = (typeof escapeHTML==="function") ? escapeHTML : (s)=>String(s);
  function grp(n){ n=Math.round(n); return n>=1000?n.toLocaleString("en-US").replace(/,/g," "):String(n); }
  function gifts(){ return (typeof COLLECTIONS==="object"&&COLLECTIONS.gifts?COLLECTIONS.gifts:[]).filter(c=>c.id!=="other"); }
  function col(){ return gifts().find(c=>c.id===sel.id)||null; }
  function img(slug){ return slug?("https://nft.fragment.com/gift/"+slug+"-1.small.jpg"):null; }

  function rarity(){ const t=CAT[sel.id]; if(!t) return null; const parts=[];
    [["model",sel.model],["backdrop",sel.backdrop],["symbol",sel.symbol]].forEach(([k,v])=>{
      if(v){ const f=(t[k]||[]).find(x=>x[0]===v); if(f) parts.push(f[1]/100); } });
    if(!parts.length) return null; let p=1; parts.forEach(x=>p*=x);
    const c=col(); const cap=(c&&c._supply)||100000; return Math.min(Math.max(2,Math.round(1/p)),cap); }
  function estimate(){ const c=col(); if(!c) return 0; let m=1; const oneIn=rarity();
    if(oneIn) m=1+0.42*Math.log10(Math.max(1,oneIn/40)); return Math.round(c.floor*Math.min(m,30)); }

  function open(){ sel={id:null,model:null,backdrop:null,symbol:null}; render(); document.getElementById("vf-scrim").classList.add("open"); }
  function close(){ document.getElementById("vf-scrim").classList.remove("open"); }
  function pickCol(id){ sel={id,model:null,backdrop:null,symbol:null}; render(); }
  function pickTrait(kind,val){ sel[kind]=(sel[kind]===val?null:val); render(); lookup(); }

  function tiles(){ return '<div class="gift-grid">'+gifts().map((c,i)=>{
    const im=img(c.slug);
    return '<button type="button" class="gift-tile'+(c.id===sel.id?" on":"")+'" onclick="VF.pickCol(\''+c.id+'\')">'+
      '<div class="gt-art" style="background:var(--bg2)">'+(im?'<img class="gt-img" src="'+im+'" loading="lazy" onerror="this.remove()">':'')+'<span class="gt-emo">'+(c.ic||"🎁")+'</span></div>'+
      '<div class="gt-n">'+esc(c.n)+'</div><div class="gt-f">'+grp(c.floor)+' TON</div></button>';
  }).join("")+'</div>'; }

  function chips(kind,label){ const t=CAT[sel.id]; if(!t||!t[kind]) return "";
    return '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--txt-3);margin:10px 2px 7px">'+label+'</div>'+
      '<div class="attr-chips">'+(t[kind]||[]).map(([n,pct])=>
        '<button type="button" class="rchip'+(sel[kind]===n?" on":"")+'" onclick="VF.pickTrait(\''+kind+'\','+JSON.stringify(n).replace(/"/g,"&quot;")+')">'+esc(n)+' <span style="opacity:.6;font-weight:700">'+pct+'%</span></button>').join("")+'</div>'; }

  function render(){
    const c=col(); const oneIn=rarity();
    let body='<div class="mk-sheet-h"><div class="ic">🔍</div><div class="nm"><b>'+L.title+'</b><span>'+L.sub+'</span></div><button class="x" onclick="VF.close()">✕</button></div>';
    if(!c){ body+='<div class="gift-label" style="margin:14px 2px 9px">'+L.pick+'</div>'+tiles(); }
    else {
      body+='<div style="display:flex;align-items:center;gap:11px;margin:14px 0 6px">'+
        '<div class="mc-ic" style="width:44px;height:44px;font-size:22px">'+(c.ic||"🎁")+'</div>'+
        '<div><b style="font-family:var(--font-d);font-weight:600;font-size:17px">'+esc(c.n)+'</b>'+
        '<div style="font-size:11px;color:var(--txt-3);font-weight:600">'+grp(c.floor)+' TON · '+L.pickHint+'</div></div>'+
        '<button class="rchip" style="margin-left:auto" onclick="VF.pickCol(null)">↺</button></div>';
      if(CAT[sel.id]){
        body+=chips("model",L.model)+chips("backdrop",L.backdrop)+chips("symbol",L.symbol);
        if(oneIn) body+='<div style="margin:12px 2px 2px;font-weight:700;font-size:13px;color:var(--ton)">'+L.rar+' '+grp(oneIn)+'</div>';
      } else { body+='<div class="hint dim" style="margin:10px 2px">'+L.noTrait+'</div>'; }
      body+='<div id="vf-result" style="margin-top:14px"></div>';
    }
    document.getElementById("vf-sheet").innerHTML=body;
    if(c) lookup();
  }

  let reqId=0;
  function lookup(){
    const c=col(); const box=document.getElementById("vf-result"); if(!c||!box) return;
    const my=++reqId;
    box.innerHTML='<div class="lots-note">'+L.loading+'</div>';
    const proxy=(typeof proxyURL==="function")?proxyURL():"";
    if(proxy){
      const qs="listings="+encodeURIComponent(c.n)+
        (sel.model?"&model="+encodeURIComponent(sel.model):"")+
        (sel.backdrop?"&backdrop="+encodeURIComponent(sel.backdrop):"")+
        (sel.symbol?"&symbol="+encodeURIComponent(sel.symbol):"")+"&n=8";
      fetch(proxy+(proxy.includes("?")?"&":"?")+qs).then(r=>r.json())
        .then(d=>{ if(my!==reqId) return; render2((d&&Array.isArray(d.items))?d.items:[], true); })
        .catch(()=>{ if(my!==reqId) return; render2(demo(c), false); });
    } else { render2(demo(c), false); }
  }
  function demo(c){ const seed=c.id+sel.model+sel.backdrop+sel.symbol; let h=2166136261;
    for(let i=0;i<seed.length;i++) h=Math.imul(h^seed.charCodeAt(i),16777619);
    const rnd=()=>{ h+=0x6D2B79F5; let t=h; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; };
    const base=estimate()||c.floor;
    return [["Tonnel","https://t.me/tonnel_network_bot"],["Portals","https://t.me/portals"],["Getgems","https://getgems.io"]]
      .map(m=>({mkt:m[0],link:m[1],price:Math.round(base*(0.85+rnd()*0.45)),num:100+Math.floor(rnd()*9000)}))
      .filter(()=>rnd()>0.12);
  }
  function render2(items, live){
    const box=document.getElementById("vf-result"); if(!box) return;
    const est=estimate();
    const head='<div style="display:flex;align-items:baseline;justify-content:space-between;margin:2px 2px 9px">'+
      '<span style="font-family:var(--font-d);font-style:italic;font-weight:600;font-size:14px;color:var(--ton)">'+
        (live?L.live:L.est)+(live?' <span class="comps-live"><span class="flr-dot" style="background:var(--up)"></span>live</span>':'')+'</span>'+
      (est?'<span style="font-size:12px;font-weight:700;color:var(--txt-3)">~ '+grp(est)+' TON</span>':'')+'</div>';
    if(!items||!items.length){ box.innerHTML=head+'<div class="lots-note">'+L.none+'</div>'; return; }
    items.sort((a,b)=>a.price-b.price);
    box.innerHTML=head+'<div class="lots-list">'+items.map((it,i)=>{
      const sub=[it.num!=null?"#"+it.num:"",it.model,it.backdrop,it.symbol].filter(Boolean).join(" · ");
      return '<div class="lot"><div class="lot-l"><div class="lot-pr">'+grp(it.price)+' TON'+
        (i===0?' <span class="lot-flag">'+L.cheapest+'</span>':'')+'</div>'+
        (sub?'<div class="lot-sub">'+esc(sub)+'</div>':'')+'</div>'+
        (it.link?'<a class="lot-buy" href="'+esc(ref(it.mkt,it.link))+'" target="_blank" rel="noopener">'+esc(it.mkt)+' · '+L.buy+' ↗</a>':'')+
        '</div>';
    }).join("")+'</div>'+
      (live?'':'<div class="lots-note" style="margin-top:8px">⚠️ '+L.demo+'</div>');
  }

  return { open, close, pickCol, pickTrait };
})();

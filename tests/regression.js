// Wichtel Shopper regression suite: 50 Hamburg postcodes x 7 scenarios, run against the real index.html in jsdom.
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{runScripts:'dangerously',url:'https://s1nc0de.github.io/wichtel-shopper/'});const w=dom.window;w.HTMLElement.prototype.scrollIntoView=()=>{};w.__errs=[];w.addEventListener('error',e=>w.__errs.push(e.message));return w;}
const SCEN=[{id:'S1',N:20,B:30},{id:'S2',N:20,B:20},{id:'S3',N:10,B:15},{id:'S4',N:20,B:10},{id:'S5',N:20,B:1},{id:'S6',N:5,B:10,wrap:true},{id:'S7',N:30,B:40}];
const RAD=2,MAXSAME=3;
const w0=boot();const {ITEMS,STORES,PLZ_DIST,DIST_KEYS,WRAPS,I18N}=w0.eval('({ITEMS,STORES,PLZ_DIST,DIST_KEYS,WRAPS,I18N})');
// independent oracle: cheapest feasible total with max identical
const minCost=(items,N,m)=>{const ps=items.map(i=>i.p).sort((a,b)=>a-b);let t=0,n=0;for(const p of ps){const k=Math.min(m,N-n);t+=p*k;n+=k;if(n>=N)break;}return n>=N?t:Infinity;};
const results=[],fails=[];let checks=0;
const ok=(c,msg,ctx)=>{checks++;if(!c)fails.push(Object.assign({msg},ctx));return c;};
// static checks
const missing=Object.keys(I18N.en).filter(k=>!(k in I18N.de));ok(missing.length===0,'German translation missing keys: '+missing.join(','),{plz:'-',scen:'i18n'});
const now=new Date('2026-11-18T22:30:00+01:00');
for(const z of Object.keys(PLZ_DIST)){
  const w=boot(),d=w.document;
  const pl=d.getElementById('plz');d.getElementById('rad').value=String(RAD);pl.value=z;pl.dispatchEvent(new w.Event('input',{bubbles:true}));w.eval('onPlz()');
  const sel=w.eval('[...state.stores]');
  const expected=Object.keys(STORES).filter(k=>!STORES[k].none&&PLZ_DIST[z][1][DIST_KEYS.indexOf(k)]<=RAD);
  ok(JSON.stringify([...sel].sort())===JSON.stringify(expected.sort()),'auto-selected stores differ from distance table',{plz:z,scen:'plz'});
  const row={plz:z,sub:PLZ_DIST[z][0],stores:expected,scen:{}};
  for(const s of SCEN){
    d.getElementById('n').value=String(s.N);d.getElementById('b').value=String(s.B);d.getElementById('wrap').checked=!!s.wrap;d.getElementById('same').value=String(MAXSAME);
    d.getElementById('go').click();
    const ctx={plz:z,scen:s.id};
    const items=ITEMS.filter(i=>expected.includes(i.s)&&!(i.src==='offer'&&i.until&&new Date(i.until+'T23:59:59+01:00')<now));
    const wraps=WRAPS.filter(x=>expected.includes(x.s)).sort((a,b)=>a.p-b.p);
    const wcost=s.wrap&&wraps.length?s.N*wraps[0].p:0;
    const need=items.length?minCost(items,s.N,MAXSAME)+wcost:Infinity;
    const feasible=items.length>0&&need<=s.B+1e-9;
    const cands=w.eval('state.cands');const imp=d.querySelector('.imp');
    const r={feasible,need:isFinite(need)?+need.toFixed(2):null};
    if(!feasible){
      ok(!!imp&&!cands,'impossible case not flagged',ctx);
      if(imp&&expected.length){const fb=imp.querySelector('[data-fix=budget]');ok(!!fb||!isFinite(need),'no "raise budget" fix offered',ctx);
        if(fb){fb.click();ok(!!w.eval('state.cands'),'"raise budget" fix did not produce results',ctx);}
        // re-run and try the "fewer gifts" fix too
        d.getElementById('n').value=String(s.N);d.getElementById('b').value=String(s.B);d.getElementById('go').click();
        const fg=d.querySelector('[data-fix=gifts]');if(fg){fg.click();ok(!!w.eval('state.cands'),'"fewer gifts" fix did not produce results',ctx);}
        d.getElementById('n').value=String(s.N);d.getElementById('b').value=String(s.B);d.getElementById('go').click();
        const fs2=d.querySelector('[data-fix=same]');if(fs2){fs2.click();ok(!!w.eval('state.cands'),'"allow identical" fix did not produce results',ctx);d.getElementById('same').value=String(MAXSAME);}
        const msg=imp.textContent;ok(!/Raise budget to €(\d+)/.test(msg)||+(msg.match(/Raise budget to €(\d+)/)[1])>s.B,'suggested budget is not higher than current budget',ctx);}
      r.status='impossible (correctly flagged)';
    }else{
      ok(!!cands&&cands.length>0,'feasible case returned no combinations',ctx);
      if(cands&&cands.length){
        let worst=0;
        for(const c of cands){
          ok(Math.abs(c.lines.reduce((a,l)=>a+l.q,0)-s.N)<1e-9,'wrong gift count',ctx);
          ok(c.grand<=s.B+1e-6,'over budget: '+c.grand,ctx);
          ok(isFinite(c.grand)&&!isNaN(c.score),'NaN in totals',ctx);
          const used=new Set(c.lines.flatMap(l=>l.u.items.map(i=>i.s)));if(c.wrap)used.add(c.wrap.s);
          ok([...used].every(x=>expected.includes(x)),'used a store outside 2 km: '+[...used].filter(x=>!expected.includes(x)),ctx);
          const use={};c.lines.forEach(l=>l.u.items.forEach(i=>use[i.id]=(use[i.id]||0)+l.q));
          worst=Math.max(worst,...Object.values(use));
          const sub=c.lists.reduce((a,l)=>a+l.sub,0);ok(Math.abs(sub-c.grand)<0.005,'store subtotals do not add up to total',ctx);
        }
        ok(worst<=MAXSAME,'max identical exceeded ('+worst+')',ctx);
        const cheapest=Math.min(...cands.map(c=>c.grand));
        ok(cheapest<=need+0.6,'cheapest option far above theoretical minimum ('+cheapest.toFixed(2)+' vs '+need.toFixed(2)+')',ctx);
        // UI check: cheapest tab shows the minimum
        d.querySelector('[data-sort=cheap]').click();const first=w.eval('sorted("cheap")[0].grand');ok(Math.abs(first-cheapest)<1e-9,'cheapest tab not sorted',ctx);
        d.querySelector('[data-sort=best]').click();
        const best=w.eval('sorted("best")[0]'),few=w.eval('sorted("fewest")[0]');
        Object.assign(r,{status:'ok',combos:cands.length,best:+best.grand.toFixed(2),bestStores:best.lists.map(l=>l.k),cheapest:+cheapest.toFixed(2),fewest:+few.grand.toFixed(2),fewestStores:few.lists.map(l=>l.k)});
      }
    }
    row.scen[s.id]=r;
  }
  // language toggle renders without errors and without raw keys
  d.querySelector('[data-lang=de]').click();const vis=[...d.body.querySelectorAll('*:not(script):not(style)')].filter(e=>!e.children.length).map(e=>e.textContent).join(' ');ok(!/\b(tagSite|impTitle|perGift|cat_\w+)\b/.test(vis),'raw i18n key visible in German',{plz:z,scen:'i18n'});
  d.querySelector('[data-lang=en]').click();
  ok(w.__errs.length===0,'JS errors: '+w.__errs.join('; '),{plz:z,scen:'js'});
  results.push(row);
}
const out={ranAt:new Date().toISOString(),postcodes:results.length,scenarios:SCEN,radiusKm:RAD,maxIdentical:MAXSAME,checks,failed:fails.length,fails,results};
fs.writeFileSync(path.join(__dirname,'regression-results.json'),JSON.stringify(out,null,1));
console.log(`postcodes=${results.length} scenarios=${SCEN.length} checks=${checks} failed=${fails.length}`);
if(fails.length)console.log(fails.slice(0,15));

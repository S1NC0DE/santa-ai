// Downloads branch locations of the 8 chains and all postcode areas in Hamburg from OpenStreetMap (Overpass API)
// and writes data/locations.json. Run by .github/workflows/refresh-locations.yml.
import fs from 'node:fs';
const MIRRORS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass.private.coffee/api/interpreter','https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
const UA='WichtelShopper/1.3 (+https://github.com/S1NC0DE/wichtel-shopper)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function overpass(q){
  let last;
  for(let round=0;round<3;round++)for(const m of MIRRORS){
    try{const r=await fetch(m,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':UA},body:'data='+encodeURIComponent(q)});
      if(r.ok)return await r.json();last=m+' '+r.status;}catch(e){last=m+' '+e.message;}
    console.log('retry after',last);await sleep(5000*(round+1));}
  throw new Error('Overpass failed: '+last);
}
const BR=[['dm',/^dm(\b|-)/i],['rossmann',/rossmann/i],['aldi',/aldi/i],['lidl',/lidl/i],['rewe',/rewe/i],['action',/^action$/i],['tedi',/tedi/i],['kaufland',/kaufland/i]];
const key=t=>{const s=(t.brand||t.name||'');for(const [k,re] of BR)if(re.test(s))return k;return null;};
const area='area["ISO3166-2"="DE-HH"]->.hh;';
const shops=await overpass(`[out:json][timeout:180];${area}nwr["shop"]["brand"~"^(dm|dm-drogerie markt|Rossmann|Aldi|Aldi Nord|ALDI Nord|Lidl|REWE|Rewe|REWE City|Action|TEDi|Kaufland)$",i](area.hh);out center tags;`);
const seen=new Set(),stores=[];
for(const e of shops.elements){const k=key(e.tags||{});if(!k)continue;const la=e.lat??e.center?.lat,lo=e.lon??e.center?.lon;if(la==null)continue;
  const id=k+la.toFixed(4)+lo.toFixed(4);if(seen.has(id))continue;seen.add(id);
  const t=e.tags;stores.push([k,+la.toFixed(5),+lo.toFixed(5),[t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' '),t['addr:postcode']||'']);}
await sleep(3000);
const pc=await overpass(`[out:json][timeout:180];${area}relation["boundary"="postal_code"](area.hh);out center tags;`);
const plz={};
for(const e of pc.elements){const z=e.tags?.postal_code;if(!z||!e.center)continue;plz[z]=[+e.center.lat.toFixed(5),+e.center.lon.toFixed(5),e.tags.note||e.tags.name||''];}
const counts={};stores.forEach(s=>counts[s[0]]=(counts[s[0]]||0)+1);
if(stores.length<150||Object.keys(plz).length<60)throw new Error('Suspiciously small result: '+stores.length+' stores, '+Object.keys(plz).length+' postcodes');
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync('data/locations.json',JSON.stringify({updated:new Date().toISOString(),source:'OpenStreetMap contributors (ODbL), via Overpass API',counts,stores,plz}));
console.log('stores',stores.length,counts,'postcodes',Object.keys(plz).length);

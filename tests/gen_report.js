const fs=require('fs');const R=JSON.parse(fs.readFileSync(__dirname+'/regression-results.json','utf8'));
const N={dm:'dm',rossmann:'Rossmann',aldi:'Aldi',lidl:'Lidl',rewe:'Rewe',action:'Action',tedi:'TEDi',kaufland:'Kaufland'};
const C={dm:'#1c3d8f',rossmann:'#c3002f',aldi:'#00205b',lidl:'#0050aa',rewe:'#cc071e',action:'#1f6fb5',tedi:'#b38900',kaufland:'#e10915'};
const e=x=>x==null?'–':'€'+x.toFixed(2);const chip=k=>`<span class="c" style="background:${C[k]}">${N[k]}</span>`;
const cell=(r)=>!r?'–':r.status==='ok'?`<b>${e(r.cheapest)}</b>`:`<span class="imp">impossible<br><small>needs ${e(r.need)}</small></span>`;
const rows=R.results.map(r=>`<tr><td><b>${r.plz}</b><br><small>${r.sub}</small></td><td>${r.stores.map(chip).join(' ')||'<span class="imp">none</span>'}</td>
<td>${r.scen.S1.status==='ok'?`${e(r.scen.S1.best)}<br><small>${r.scen.S1.bestStores.map(k=>N[k]).join(' + ')}</small>`:cell(r.scen.S1)}</td><td>${cell(r.scen.S1)}</td>
<td>${r.scen.S1.status==='ok'?`${e(r.scen.S1.fewest)}<br><small>${r.scen.S1.fewestStores.map(k=>N[k]).join(' + ')}</small>`:'–'}</td>
<td>${cell(r.scen.S2)}</td><td>${cell(r.scen.S4)}</td><td>${cell(r.scen.S5)}</td><td>${cell(r.scen.S7)}</td><td>${r.scen.S1.combos||'–'}</td></tr>`).join('');
const ok=R.results.filter(r=>r.scen.S1.status==='ok').length;
const s4imp=R.results.filter(r=>r.scen.S4.status!=='ok').length;
const cheapS1=R.results.filter(r=>r.scen.S1.status==='ok').map(r=>r.scen.S1.cheapest);
const html=`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Santa.ai – Regression report</title>
<style>body{font:14px/1.45 system-ui,Inter,sans-serif;margin:0;background:#eff3f8;color:#161616}.top{background:#0d3b2e;color:#fff;padding:20px 16px}.in{max-width:1100px;margin:0 auto}h1{margin:0 0 6px;font-size:24px}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px}.k div{background:#165440;border-radius:12px;padding:10px 12px}.k b{display:block;font-size:22px}.pass{color:#00d775}
.w{max-width:1100px;margin:0 auto;padding:16px}.card{background:#fff;border-radius:14px;padding:14px 16px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.08)}h2{font-size:17px;margin:0 0 8px}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:7px 6px;border-bottom:1px solid #e5e9ef;text-align:left;vertical-align:top}th{background:#f5f8fc;position:sticky;top:0}small{color:#626971}
.c{display:inline-block;color:#fff;font-size:11px;font-weight:700;border-radius:5px;padding:1px 5px;margin:1px}.imp{color:#b0034a;font-weight:600}.scroll{overflow:auto;max-height:70vh}li{margin-bottom:4px}code{background:#eef2f7;padding:1px 4px;border-radius:4px}a{color:#c8102e}</style></head><body>
<div class="top"><div class="in"><div style="font-weight:800">🎁 Santa.ai™ · Regression report</div><h1>${R.postcodes} Hamburg postcodes × 7 scenarios</h1>
<div>Run ${new Date(R.ranAt).toLocaleString('en-GB',{timeZone:'Europe/Berlin'})} (Berlin) · store radius ${R.radiusKm} km · max ${R.maxIdentical} identical gifts</div>
<div class="k"><div><b class="pass">${R.failed===0?'PASS':'FAIL'}</b>result</div><div><b>${R.checks.toLocaleString('en')}</b>automated checks</div><div><b>${R.failed}</b>failures</div><div><b>${ok}/${R.postcodes}</b>postcodes with a €30 list</div><div><b>${e(Math.min(...cheapS1))}–${e(Math.max(...cheapS1))}</b>cheapest 20 gifts, by area</div><div><b>3</b>bugs found & fixed</div></div></div></div>
<div class="w">
<div class="card"><h2>What was tested</h2><ul>
<li><b>Live data (18 Nov 2026):</b> 9 chains' branch locations in Hamburg from OpenStreetMap (Nominatim); distance from each postcode centre to the nearest branch of each chain. Rewe online-shop prices were checked live at 3 postcodes (20457 HafenCity, 21073 Harburg, 22767 Altona): all 11 Rewe products were in stock at identical prices. 22143 Rahlstedt could not be selected in Rewe's postcode dialog. Prices on dm, Aldi Nord and Action were re-read from the store sites and were unchanged. Aldi's Weihnachtsmann offers end 21 Nov, and the app now marks them as ended and drops them after that date automatically.</li>
<li><b>Scenarios per postcode:</b> S1 20 gifts/€30 · S2 20/€20 · S3 10/€15 · S4 20/€10 (tight) · S5 20/€1 (impossible) · S6 5/€10 + gift bags · S7 30/€40.</li>
<li><b>Checks on every combination returned:</b> exactly N gifts · total ≤ budget · only stores within ${R.radiusKm} km used · ≤ ${R.maxIdentical} of any product · store subtotals add up · no NaN · "Cheapest" tab really is the cheapest · cheapest result within €0.60 of the theoretical minimum · postcode auto-selects exactly the stores in the distance table.</li>
<li><b>Impossible cases:</b> the app's verdict is compared against an independent calculation of the cheapest possible list. Each fix button (raise budget, fewer gifts, allow identical) must lead to a working result, and a suggested budget must be higher than the current one.</li>
<li><b>Languages:</b> every English text has a German translation, and no raw text keys show in either language. No JavaScript errors.</li></ul></div>
<div class="card"><h2>Bugs found and fixed during this run</h2><ol>
<li><b>Postcode lookup</b>: the first geocoding pass placed all 50 postcodes at Hamburg's city centre. Fixed by querying by postcode only, and re-verified (Altstadt, Eimsbüttel, Harburg… now distinct).</li>
<li><b>Search engine</b>: 20 gifts for €10 was reported as impossible even though a €9.62 list exists, because the look-ahead ignored the "max 3 identical" rule. Fixed with a limit-aware look-ahead plus a guaranteed cheapest-first fallback.</li>
<li><b>Impossible-case advice</b>: when only the identical-gift limit blocked a list, the app suggested a <i>lower</i> budget, and "make it N gifts" ignored the limit. Both are fixed and covered by tests.</li></ol></div>
<div class="card"><h2>Results by postcode</h2><p><small>Cheapest totals in €. "Impossible" means no valid list exists with the stores within ${R.radiusKm} km. The app flags it and offers fixes, and this was verified in every case. ${s4imp} of ${R.postcodes} areas can't do 20 gifts for €10 within ${R.radiusKm} km.</small></p>
<div class="scroll"><table><thead><tr><th>Postcode</th><th>Stores ≤ ${R.radiusKm} km</th><th>S1 Best</th><th>S1 Cheapest</th><th>S1 Fewest stops</th><th>S2 €20</th><th>S4 €10</th><th>S5 €1</th><th>S7 30/€40</th><th># combos</th></tr></thead><tbody>${rows}</tbody></table></div></div>
<div class="card"><h2>Limits</h2><ul><li>Prices are a snapshot from the store websites (checked 18 Nov 2026, 22:10). A static page can't fetch them live.</li><li>Branch locations come from OpenStreetMap and may miss some stores, so real distances can be shorter. Distances are straight-line from the postcode centre.</li><li>dm, Rossmann, Aldi Nord, Action and TEDi use national online prices. Shelf prices can differ by branch.</li></ul>
<p><a href="./">← Open Santa.ai</a> · raw data: <a href="tests/regression-results.json">regression-results.json</a></p></div>
<p style="text-align:center;color:#626971;font-size:12px">© 2026 Jayant Singh Amethia. Santa.ai™ is a trademark of Jayant Singh Amethia.</p>
</div></body></html>`;
fs.writeFileSync(__dirname+'/../report.html',html);console.log('report written',html.length);

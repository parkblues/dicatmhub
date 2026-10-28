/* Dicatat! - Maganghub Mode: shared UI building blocks, ask dialog, transactions list */

const calIcon=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
/* Core & Debt/Receivable Calculations */
const bal=w=>S.tx.reduce((a,t)=>t.type==='inc'&&t.w===w.id?a+t.amt:t.type==='exp'&&t.w===w.id?a-t.amt:t.type==='tr'?a+(t.to===w.id?t.amt:0)-(t.w===w.id?t.amt:0):a,w.init)-S.inv.filter(i=>i.w===w.id).reduce((a,i)=>a+(+i.p||0),0);
const sum=(ty,p)=>S.tx.filter(t=>t.type===ty&&matchP(t.date,p)).reduce((a,t)=>a+t.amt,0);
const spent=(c,p=pv())=>S.tx.filter(t=>t.type==='exp'&&t.cat===c&&matchP(t.date,p)).reduce((a,t)=>a+t.amt,0);
const days=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);
const invVal=i=>i.kind==='Deposito'?i.p+i.p*i.rate/100*Math.max(0,Math.min(days(i.start,TODAY),i.tenor*30.4))/365*.8:i.p/i.buy*i.nav;
const tb=()=>Object.values(S.budgets).reduce((a,b)=>a+(+b||0),0),tsp=(p=pv())=>Object.keys(S.budgets).reduce((a,c)=>a+spent(c,p),0);
const row=(l,v,p,c)=>`<div class="metric-item"><div class="rw"><span>${l}</span><b>${v}</b></div><div class="bar"><i style="width:${Math.min(100,Math.max(0,p))}%;background:${c}"></i></div></div>`;
const COL=['#0070C9','#0d9f6e','#f5a623','#38a3ff','#e03e3e','#7c3aed','#64748b'];

/* Utang & Piutang Helpers */
const debtOblig=d=>(+d.amt||0)*(1+(+d.rate||0)/100);
const activeUtang=()=>S.debts.filter(d=>d.kind==='utang'&&!d.paid);
const activePiutang=()=>S.debts.filter(d=>d.kind==='piutang'&&!d.paid);
const totUtangVal=()=>activeUtang().reduce((a,d)=>a+debtOblig(d),0);
const totPiutangVal=()=>activePiutang().reduce((a,d)=>a+debtOblig(d),0);
function dueBadge(d){
  if(d.paid)return`<span class="tag ok">${L('settled')}</span>`;
  if(!d.due)return'—';
  const diff=days(TODAY,d.due);
  if(diff<0)return`<span class="tag urg">${L('overdue')} (${Math.abs(diff)}d)</span>`;
  if(diff===0)return`<span class="tag urg">${L('dueToday')}</span>`;
  if(diff<=7)return`<span class="pill warn">${L('dueIn',diff)}</span>`;
  return`<span class="mute">${dt(d.due)}</span>`;
}

function fmtMoneyInp(v){
  if(v===''||v===null||v===undefined)return'';
  const s=String(Math.round(Math.abs(+v||0))).replace(/\D/g,'').replace(/^0+(?=\d)/,'');
  if(!s||s==='0')return String(v)==='0'||v===0?'0':'';
  return s.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}
function parseMoney(v){
  if(typeof v==='number')return v;
  const s=String(v??'').trim().replace(/\./g,'').replace(/,/g,'.').replace(/[^\d.-]/g,'');
  return +s||0;
}
function snapMoneyKey(e,el){
  if(e.key==='Backspace'&&el.selectionStart===el.selectionEnd&&el.selectionStart>0&&el.value[el.selectionStart-1]==='.'){
    e.preventDefault();
    const pos=el.selectionStart-1;
    el.value=el.value.slice(0,Math.max(0,pos-1))+el.value.slice(pos+1);
    el.setSelectionRange(Math.max(0,pos-1),Math.max(0,pos-1));
    snapMoneyInput(el);
  }
}
function snapMoneyInput(el){
  const raw=el.value;
  const sel=el.selectionStart??raw.length;
  const digitsBefore=raw.slice(0,sel).replace(/\D/g,'').length;
  const clean=raw.replace(/\D/g,'').replace(/^0+(?=\d)/,'');
  const fmtVal=clean?clean.replace(/\B(?=(\d{3})+(?!\d))/g,'.'):'';
  if(el.value!==fmtVal)el.value=fmtVal;
  let pos=0,seen=0;
  while(pos<fmtVal.length&&seen<digitsBefore){
    if(/\d/.test(fmtVal[pos]))seen++;
    pos++;
  }
  try{el.setSelectionRange(pos,pos)}catch(e){}
}

/* Keep the page behind the mobile bottom sheet perfectly still.
   The sheet is the only thing that should move; the background stays where it is. */
let SHEET_LOCK_Y=0;
function lockPageForSheet(){
  const root=document.documentElement;
  if(root.dataset.mobile!=='1')return;
  if(root.classList.contains('ui-locked'))return;
  SHEET_LOCK_Y=window.scrollY||root.scrollTop||0;
  /* Freeze the body at the exact scroll offset first, then hide the overflow,
     so the background never jumps by a frame while the sheet slides in. */
  const b=document.body.style;
  b.position='fixed';
  b.top=(-SHEET_LOCK_Y)+'px';
  b.left='0';
  b.right='0';
  b.width='100%';
  root.classList.add('ui-locked');
}
function unlockPageForSheet(){
  const root=document.documentElement;
  if(!root.classList.contains('ui-locked'))return;
  root.classList.remove('ui-locked');
  const b=document.body.style;
  b.position='';b.top='';b.left='';b.right='';b.width='';
  const sb=root.style.scrollBehavior;
  root.style.scrollBehavior='auto';
  window.scrollTo(0,SHEET_LOCK_Y);
  root.style.scrollBehavior=sb;
}

function ask(title,fields,ok,sub){
  closeDP();
  const f=$('#f');
  f.innerHTML=`<h3>${title}</h3>`+fields.map(([n,l,t,o,v,x])=>`<label class="r-${n}">${l}${
    t==='select'?`<select name="${n}">${opt(o,v)}</select>`:
    t==='area'?`<textarea name="${n}" rows="8">${esc(v)}</textarea>`:
    t==='check'?`<label class="chk-row"><input type="checkbox" name="${n}" value="1" ${v?'checked':''}><span>${esc(o)}</span></label>`:
    t==='date'?`<input type="hidden" name="${n}" value="${esc(v)}"><button type="button" class="dp-trig" data-val="${esc(v)}" data-empty="${esc(L('dpTargetDate'))}" onclick="openDP(this,{onlyDate:true,label:'${esc(l)}',val:this.dataset.val})"><span class="dp-txt">${esc(fmtP(v,L('dpTargetDate')))}</span>${calIcon}</button>`:
    t==='money'?`<input name="${n}" type="text" inputmode="numeric" pattern="[0-9.]*" autocomplete="off" value="${esc(fmtMoneyInp(v))}" placeholder="0" oninput="snapMoneyInput(this)" onkeydown="snapMoneyKey(event,this)" ${x||''}>`:
    `<input name="${n}" type="${t}" ${t==='number'?'inputmode="decimal"':''} value="${esc(v)}" ${x||''}>`
  }</label>`).join('')+`<div class="act"><button type="button" class="btn g" onclick="closeDP();$('#d').close()">${L('cancel')}</button><button class="btn">${sub||L('save')}</button></div>`;
  f.onsubmit=e=>{
    e.preventDefault();
    closeDP();
    const data=Object.fromEntries(new FormData(f));
    for(const [n,l,t] of fields){
      if(t==='money'){
        const inp=f.elements[n];
        const row=f.querySelector('.r-'+n);
        const num=parseMoney(data[n]);
        if(inp&&inp.required&&(!row||!row.hidden)&&!(num>0)){
          inp.focus();
          return;
        }
        data[n]=String(num);
      }
    }
    if(ok(data)!==false)$('#d').close();
  };
  const dlg=$('#d');
  lockPageForSheet();
  dlg.showModal();
  /* showModal() focuses the first field, which makes phones scroll the page behind
     the sheet. Focus the sheet itself instead, so only the sheet animates in. */
  try{dlg.focus({preventScroll:true})}catch(e){try{dlg.focus()}catch(e2){}}
  return f;
}

/* Release the page lock on every way the sheet can close (button, Esc, submit).
   'close' is the natural event, but some mobile browsers drop that task, so
   'toggle' (newState === 'closed') is the reliable fallback. Both are idempotent. */
const __sheetDlg=$('#d');
if(__sheetDlg){
  __sheetDlg.addEventListener('close',unlockPageForSheet);
  __sheetDlg.addEventListener('toggle',e=>{if(e.newState==='closed')unlockPageForSheet()});
}

function donut(items,label){const t=items.reduce((a,x)=>a+x[1],0);if(!t)return`<p class="mute" style="margin:auto 0">${L('nothingYet')}</p>`;let o=0;const c=2*Math.PI*52;
return`<div class="dn"><svg viewBox="0 0 140 140" width="146" height="146" style="flex-shrink:0">${items.map((x,i)=>{const l=x[1]/t*c,s=`<circle r="52" cx="70" cy="70" fill="none" stroke="${COL[i%7]}" stroke-width="16" stroke-dasharray="${l} ${c-l}" stroke-dashoffset="${-o}" transform="rotate(-90 70 70)"/>`;o+=l;return s}).join('')}<text x="70" y="65" text-anchor="middle" font-size="9" font-weight="600" fill="var(--mute)">${esc(label)}</text><text x="70" y="82" text-anchor="middle" font-size="12" font-weight="800" fill="var(--ink)">${short(t)}</text></svg><ul class="lg">${items.map((x,i)=>`<li><i style="background:${COL[i%7]}"></i><span>${esc(x[0])}</span><b>${Math.round(x[1]/t*100)}%</b></li>`).join('')}</ul></div>`}

function flow(){
  const ps=mhPeriods();
  if(!ps.length)return`<p class="mute" style="margin:auto 0">${L('nothingYet')}</p>`;
  const v=ps.map(b=>[sum('inc','P'+b.n),sum('exp','P'+b.n)]),mx=Math.max(1,...v.flat());
  const mShort=getMShort();
  const grid=[30,70,110,150].map(y=>`<line x1="16" y1="${y}" x2="544" y2="${y}" stroke="var(--line)" stroke-dasharray="${y===150?'':'3 3'}" stroke-width="1"/>`).join('');
  return`<svg viewBox="0 0 560 188" width="100%" style="display:block;margin-top:auto">${grid}${ps.map((p,i)=>{const k='P'+p.n,lbl=mhName(k),rng=mhRangeN(p.n,true),sRng=`${+p.start.slice(8,10)} ${mShort[+p.start.slice(5,7)-1]}–${+p.end.slice(8,10)} ${mShort[+p.end.slice(5,7)-1]}`,x=26+i*88,a=Math.max(v[i][0]>0?4:0,v[i][0]/mx*120),b=Math.max(v[i][1]>0?4:0,v[i][1]/mx*120);return`<rect x="${x}" y="${150-a}" width="24" height="${a}" rx="5" fill="var(--pos)"><title>${esc(lbl)} (${esc(rng)}) ${L('income')}: ${fmt(v[i][0])}</title></rect><rect x="${x+28}" y="${150-b}" width="24" height="${b}" rx="5" fill="var(--acc)"><title>${esc(lbl)} (${esc(rng)}) ${L('expense')}: ${fmt(v[i][1])}</title></rect><text x="${x+26}" y="167" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--ink)">${esc(lbl)}</text><text x="${x+26}" y="180" text-anchor="middle" font-size="8.2" font-weight="600" fill="var(--mute)">${esc(sRng)}</text>`}).join('')}</svg>`;
}

function txDayLabel(ds){
  if(!ds)return'—';
  if(ds===TODAY)return S.s.lang==='id'?'HARI INI':'TODAY';
  const yd=(()=>{const d=new Date(TODAY+'T00:00');d.setDate(d.getDate()-1);return iso(d)})();
  if(ds===yd)return S.s.lang==='id'?'KEMARIN':'YESTERDAY';
  const pi=mhIdxOf(ds);
  const pTag=(pi>=1&&pi<=MH_N)?` · ${mhName('P'+pi).toUpperCase()}`:'';
  return dt(ds).toUpperCase()+pTag;
}
const txr=(t,del)=>{const w=S.wallets.find(x=>x.id===t.w),to=S.wallets.find(x=>x.id===t.to),sg=t.type==='inc'?'+':t.type==='exp'?'−':'',catTxt=t.type==='tr'?L('transfer'):esc(t.cat),walTxt=esc(w?w.name:'—')+(to?' → '+esc(to.name):'');
return`<tr class="tx-row"><td class="tx-d">${dt(t.date)}</td><td class="tx-m"><b>${esc(t.note||t.cat||L('transfer'))}</b><div class="tx-sub"><span class="tag">${catTxt}</span><span class="tx-sep">—</span><span>${walTxt}</span></div></td><td class="tx-c"><span class="tag">${catTxt}</span></td><td class="tx-w">${walTxt}</td><td class="n tx-a ${t.type==='inc'?'inc':''}">${sg}${fmt(t.amt)}</td>${del?`<td class="n tx-x"><div class="row-act">${iconBtns(`editTx('${t.id}')`,`delTx('${t.id}')`)}</div></td>`:''}</tr>`};

function txList(list,del=0,emptyMsg=L('noEntries')){
  const cols=del?6:5;
  if(!list.length)return`<tr class="tx-empty"><td colspan="${cols}" class="mute">${emptyMsg}</td></tr>`;
  const groups=[];
  for(const t of list){
    const d=t.date||'';
    if(!groups.length||groups[groups.length-1].d!==d)groups.push({d,items:[t]});
    else groups[groups.length-1].items.push(t);
  }
  return groups.map(g=>{
    const net=g.items.reduce((a,t)=>a+(t.type==='inc'?t.amt:t.type==='exp'?-t.amt:0),0);
    const sg=net>0?'+':net<0?'−':'';
    return`<tr class="tx-day-hdr"><td colspan="${cols}"><span>${esc(txDayLabel(g.d))}</span></td></tr>`+
      g.items.map(t=>txr(t,del)).join('')+
      `<tr class="tx-day-tot"><td colspan="${cols}"><span>Total</span><b class="${net>0?'inc':''}">${sg}${fmt(Math.abs(net))}</b></td></tr>`;
  }).join('');
}


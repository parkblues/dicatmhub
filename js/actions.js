/* Dicatat! - Maganghub Mode: CRUD actions, settings, data import / export */

const F={m:'',t:'',w:'',q:''};
let REP_P=curP();

const fl=()=>S.tx.filter(t=>matchP(t.date,F.m)&&(!F.t||t.type===F.t)&&(!F.w||t.w===F.w||t.to===F.w)&&(!F.q||((t.note||'')+t.cat).toLowerCase().includes(F.q.toLowerCase()))).sort((a,b)=>b.date.localeCompare(a.date));
function tbl(){
  const l=fl();
  $('#tb').innerHTML=txList(l,1,L('noMatch'));
  $('#ts').innerHTML=`${L('income')} <b class="inc">${fmt(l.filter(t=>t.type==='inc').reduce((a,t)=>a+t.amt,0))}</b> · ${L('expense')} <b>${fmt(l.filter(t=>t.type==='exp').reduce((a,t)=>a+t.amt,0))}</b>`;
  const ft=$('#flt-dp-txt');
  if(ft)ft.textContent=mhNum(F.m)?`${mhName(F.m)} (${mhRangeTxt(F.m,false)})`:fmtP(F.m,L('allDates'));
}

/* Actions */
function addTx(type='exp',x=null,pre=null){const defDate=x?x.date:(pre?.date||mhDefDate());const f=ask(x?L('edit'):L('addEntry'),[['type','Type','select',[['exp',L('expense')],['inc',L('income')],['tr',L('transfer')]],type],['amt',`${L('amount')} (${curSym()})`,'money','',x?x.amt:(pre?.amt||''),'required'],['date',L('date'),'date','',defDate,'required'],['cat',L('cat'),'select',[],''],['w',L('wallet'),'select',wopts(),x?x.w:S.wallets[0]?.id||''],['to','To '+L('wallet'),'select',wopts(),x&&x.to?x.to:(S.wallets[1]||S.wallets[0])?.id||''],['note',L('desc'),'text','',x?x.note||'':(pre?.note||'')]],o=>{
 if(o.type==='tr'&&o.w===o.to){toast('Choose two different wallets');return false}
 const nt={id:x?x.id:uid(),type:o.type,amt:+o.amt,date:o.date||defDate,cat:o.type==='tr'?'':o.cat,w:o.w,to:o.type==='tr'?o.to:'',note:o.note.trim(),_ts:Date.now()};if(x)Object.assign(x,nt);else S.tx.push(nt);done()});
 const e=f.elements,sync=()=>{const t=e.type.value;e.cat.innerHTML=opt(t==='tr'?[]:S.cats[t]);f.querySelector('.r-cat').hidden=t==='tr';f.querySelector('.r-to').hidden=t!=='tr'};e.type.onchange=sync;sync();if(x&&x.cat)e.cat.value=x.cat;else if(pre?.cat)e.cat.value=pre.cat}
const editTx=id=>{const x=S.tx.find(v=>v.id===id);if(x)addTx(x.type,x)};
const delTx=id=>{if(!confirm(L('delConfirm')))return;S.tx=S.tx.filter(t=>t.id!==id);done()};
const setB=(c,v)=>{S.budgets[c]=Math.max(0,parseMoney(v));done()};

/* Utang & Piutang Actions */
function addDebt(kind='utang',d=null){
  const isU=kind==='utang';
  const defDue=(()=>{const x=new Date();x.setDate(x.getDate()+30);return iso(x)})();
  const dv=(k,def)=>d&&d[k]!=null?d[k]:def;
  const common=[
    ['amt',`${L('principal')} (${curSym()})`,'money','',dv('amt',''),'required'],
    ['rate',L('interestPct'),'number','',dv('rate',0),'min="0" step="any"'],
    ['due',L('jatuhTempo'),'date','',dv('due',defDue),'required'],
    ['urgent',L('urgency'),'check',L('markUrgent'),dv('urgent',false)]
  ];
  const fields=isU?[
    ['cat',L('cat'),'select',[['Paylater','[Paylater]'],['Credit','[Credit]'],['Pinjol','[Pinjol]']],dv('cat','Paylater')],
    ['desc',L('providerDesc')+' *','text','',dv('desc',''),'required placeholder="e.g. Kredivo / BCA Card / SPayLater"'],
    ...common
  ]:[
    ['desc',L('borrowerDesc')+' *','text','',dv('desc',''),'required placeholder="e.g. Budi - Pinjaman usaha"'],
    ...common
  ];
  ask(d?L('edit')+' – '+esc(d.desc):(isU?L('addUtang'):L('addPiutang')),fields,o=>{
    const desc=(o.desc||'').trim();
    if(!desc){toast(L('mandateProvider'));return false}
    const nd={id:d?d.id:uid(),kind,cat:isU?(o.cat||'Paylater'):'Piutang',desc,amt:+o.amt||0,rate:+o.rate||0,due:o.due||defDue,urgent:!!o.urgent,paid:d?d.paid:false,created:d?d.created:TODAY,_ts:Date.now()};
    if(d)Object.assign(d,nd);else S.debts.push(nd);
    done();
  });
}
const editDebt=id=>{const d=S.debts.find(x=>x.id===id);if(d)addDebt(d.kind,d)};

function toggleDebtUrgent(id){
  const d=S.debts.find(x=>x.id===id);
  if(d){d.urgent=!d.urgent;d._ts=Date.now();done()}
}

function settleDebt(id){
  const d=S.debts.find(x=>x.id===id);
  if(!d)return;
  d.paid=!d.paid;
  d._ts=Date.now();
  done();
}

function delDebt(id){
  if(!confirm(L('delConfirm')))return;
  S.debts=S.debts.filter(x=>x.id!==id);
  done();
}

function addCat(){ask(L('addCat'),[['type','Type','select',[['exp',L('expense')],['inc',L('income')]],'exp'],['name','Name','text','','','required']],o=>{const n=o.name.trim(),l=S.cats[o.type];if(!n||l.includes(n)){toast('Enter a new, unique name');return false}l.push(n);done()})}
const delCat=(t,c)=>{if(!confirm(L('delConfirm')))return;S.cats[t]=S.cats[t].filter(x=>x!==c);delete S.budgets[c];done()};
function addWallet(w0=null){
  ask(w0?L('edit')+' – '+esc(w0.name):L('addWallet'),[['name','Name','text','',w0?w0.name:'','required'],['type','Type','select',['Bank','E-Wallet','Cash'],w0?w0.type:'Bank'],['init',`${L('openBal')} (${curSym()})`,'money','',w0?w0.init:0,'']],o=>{
    const nw={name:o.name.trim(),type:o.type,init:+o.init||0,_ts:Date.now()};
    if(w0)Object.assign(w0,nw);else S.wallets.push({id:uid(),...nw});
    done();
  });
}
const editWallet=id=>{const w=S.wallets.find(x=>x.id===id);if(w)addWallet(w)};
function editCat(tp,c){
  ask(L('edit')+' – '+esc(c),[['name','Name','text','',c,'required']],o=>{
    const n=o.name.trim(),l=S.cats[tp];
    if(!n)return false;
    if(n===c)return;
    if(l.includes(n)){toast('Enter a new, unique name');return false}
    l[l.indexOf(c)]=n;
    S.tx.forEach(x=>{if(x.type===tp&&x.cat===c){x.cat=n;x._ts=Date.now()}});
    if(tp==='exp'&&c in S.budgets){S.budgets[n]=S.budgets[c];delete S.budgets[c]}
    done();
  });
}
function delWallet(id){if(S.wallets.length<2)return toast('Keep at least one wallet');if(S.tx.some(t=>t.w===id||t.to===id)||S.inv.some(i=>i.w===id))return toast('Delete this wallet’s entries and investments first');if(!confirm(L('delConfirm')))return;S.wallets=S.wallets.filter(w=>w.id!==id);done()}
function addInv(i0=null){
  if(!i0&&!S.wallets.some(w=>bal(w)>0)){toast(L('fundWalletFirst'));go('wal');return}
  const wl=S.wallets.map(w=>[w.id,`${w.name} · ${fmt(bal(w)+(i0&&i0.w===w.id?i0.p:0))}`]);
  if(i0&&!i0.w)wl.unshift(['',L('legacyW')]);
  const defW=i0?(i0.w||''):(S.wallets.find(w=>bal(w)>0)||S.wallets[0]).id;
  const f=ask(i0?L('edit')+' – '+esc(i0.name):L('addInv'),[
    ['w',L('fundFrom'),'select',wl,defW],
    ['kind','Type','select',[['RDPU','RDPU – Money Market Fund'],['RDO','RDO – Bond Fund'],['Deposito','Bank Deposito']],i0?i0.kind:'RDPU'],
    ['name','Name','text','',i0?i0.name:'','required'],
    ['p',`${L('invested')} (${curSym()})`,'money','',i0?i0.p:'','required'],
    ['buy','Buy NAV','money','',i0&&i0.buy?i0.buy:'',''],
    ['nav','Current NAV','money','',i0&&i0.nav?i0.nav:'',''],
    ['rate','Interest p.a. (%)','number','',i0&&i0.rate!=null?i0.rate:'','step="any"'],
    ['start','Start date','date','',i0?i0.start:TODAY,''],
    ['tenor','Tenor (months)','number','',i0&&i0.tenor?i0.tenor:6,'inputmode="numeric" pattern="[0-9]*"']
  ],o=>{
    const p=+o.p;
    if(o.w){
      const w=S.wallets.find(x=>x.id===o.w),avail=bal(w)+(i0&&i0.w===o.w?i0.p:0);
      if(p>avail){toast(L('insufficient',w.name,fmt(avail)));return false}
    }else if(!i0){toast(L('fundWalletFirst'));return false}
    const i={id:i0?i0.id:uid(),kind:o.kind,name:o.name.trim(),p,w:o.w,start:o.start||TODAY,_ts:Date.now()};
    if(o.kind==='Deposito'){i.rate=+o.rate||0;i.tenor=+o.tenor||1}
    else{i.buy=+o.buy;i.nav=+o.nav||i.buy;if(!(i.buy>0)){toast('Enter the buy NAV');return false}}
    if(i0)S.inv[S.inv.indexOf(i0)]=i;else S.inv.push(i);
    done();
  });
  const e=f.elements,sync=()=>{const d=e.kind.value==='Deposito';['buy','nav'].forEach(k=>f.querySelector('.r-'+k).hidden=d);['rate','tenor'].forEach(k=>f.querySelector('.r-'+k).hidden=!d)};
  e.kind.onchange=sync;sync();
}
const editInv=id=>{const i=S.inv.find(x=>x.id===id);if(i)addInv(i)};
const updNav=id=>{const i=S.inv.find(x=>x.id===id);ask(L('updNav')+' – '+esc(i.name),[['nav','Current NAV','money','',i.nav,'required']],o=>{i.nav=+o.nav;i._ts=Date.now();done()})};
const delInv=id=>{if(!confirm(L('delInvConfirm')))return;S.inv=S.inv.filter(i=>i.id!==id);done()};
const setS=(k,v)=>{S.s[k]=v;done()};
const setLang=l=>{S.s.lang=l;done()};
function saveDataFile(){
  const payload=JSON.stringify({...S,_app:'Dicatat!',_exportedAt:new Date().toISOString()},null,2);
  const blob=new Blob([payload],{type:'application/json;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`Dicatat_Data_${TODAY}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1500);
  toast(L('dataSavedMsg'));
}
function applyUploadedData(raw){
  try{
    const x= normalizeState(JSON.parse(raw));
    if(!x)throw 0;
    delete x._app;delete x._exportedAt;
    x._updatedAt=Date.now();
    S=x;
    done();
    toast(L('dataRestoredMsg'));
  }catch(e){
    toast(L('dataInvalidMsg'));
  }
}
function triggerUpload(){
  const inp=$('#data-file-inp');
  if(inp){inp.value='';inp.click()}
}
function handleUploadFile(ev){
  const f=ev.target?.files?.[0];
  if(!f)return;
  const r=new FileReader();
  r.onload=e=>applyUploadedData(e.target.result);
  r.onerror=()=>toast(L('dataInvalidMsg'));
  r.readAsText(f);
}
function onDataDrop(ev){
  ev.preventDefault();
  ev.currentTarget.classList.remove('drag');
  const f=ev.dataTransfer?.files?.[0];
  if(!f)return;
  const r=new FileReader();
  r.onload=e=>applyUploadedData(e.target.result);
  r.onerror=()=>toast(L('dataInvalidMsg'));
  r.readAsText(f);
}
let armed=0;
function reset(){if(!armed){armed=1;toast('Press again to erase all data');setTimeout(()=>armed=0,4000);return}armed=0;const pf={name:S.s?.name||'',inst:S.s?.inst||''};S=structuredClone(D);S.s.name=pf.name;S.s.inst=pf.inst;S._updatedAt=Date.now();PV='';REP_P=curP();F.m='';done();toast('All data erased')}

/* Dicatat! - Maganghub Mode: Maganghub batch periods (P1-P6) */

/* ==========================================================================
   MAGANGHUB MODE - program classes & the Period 1-6 calendar engine.
   Every budgeting / reporting window is a PERIOD:
   - Batch 2 (formerly Class September): starts 21st of each month, ends 20th of next month (21 Sep 2026 – 20 Mar 2027)
   - Batch 3 (formerly Class November): starts 16th of each month, ends 15th of next month (16 Nov 2026 – 15 May 2027)
   Each class runs 6 periods (P1..P6). Salary enters on the 1st date of each period (starting Period 2).
   ========================================================================== */
const MH_N=6;
const MH_CLASSES={
  sep:{start:'2026-09-21',name:{id:'Batch 2',en:'Batch 2'},short:{id:'Batch 2',en:'Batch 2'},badge:{id:'Siklus 21 – 20',en:'21st – 20th Cycle'}},
  nov:{start:'2026-11-16',name:{id:'Batch 3',en:'Batch 3'},short:{id:'Batch 3',en:'Batch 3'},badge:{id:'Siklus 16 – 15',en:'16th – 15th Cycle'}}
};
const mhPad=n=>String(n).padStart(2,'0');
const mhISO=(y,m,d)=>{const x=new Date(y,m,d);return`${x.getFullYear()}-${mhPad(x.getMonth()+1)}-${mhPad(x.getDate())}`};
const mhNum=p=>{const m=/^P(\d+)$/.exec(p||'');return m?+m[1]:0};

let MH_SEL='',MH_CHANGING=false;
const mhKey=k=>k||S.s.mh||MH_SEL||'sep';

/* Bounds of period n for a class (1..6 within program, or outside for general calendar nav) */
function mhBounds(n,k){
  const c=MH_CLASSES[mhKey(k)];
  if(!c)return null;
  const y=+c.start.slice(0,4),m=+c.start.slice(5,7)-1,d=+c.start.slice(8,10);
  const start=mhISO(y,m+n-1,d),end=mhISO(y,m+n,d-1);
  return{n,start,end,days:Math.round((new Date(end)-new Date(start))/864e5)+1};
}
const mhPeriods=k=>Array.from({length:MH_N},(_,i)=>mhBounds(i+1,k));

/* Index of the period holding a date */
function mhIdxOf(ds){
  const c=MH_CLASSES[mhKey()];
  if(!c||!ds)return 1;
  const y=+c.start.slice(0,4),m=+c.start.slice(5,7)-1,d=+c.start.slice(8,10);
  const Y=+ds.slice(0,4),M=+ds.slice(5,7)-1,D=+ds.slice(8,10);
  let n=(Y-y)*12+(M-m)+1;
  if(D<d)n--;
  return n;
}
const mhCurN=()=>Math.min(MH_N,Math.max(1,mhIdxOf(TODAY)));
const curP=()=>'P'+mhCurN();
let PV='';
const pv=()=>PV||curP();

function mhDefDate(){
  const a=mhBounds(1),z=mhBounds(MH_N);
  if(!a)return TODAY;
  return TODAY<a.start?a.start:TODAY>z.end?z.end:TODAY;
}
function mhGuessY(mi,d){
  const c=MH_CLASSES[mhKey()],y0=c?+c.start.slice(0,4):new Date().getFullYear();
  for(const y of [y0,y0+1]){const n=mhIdxOf(`${y}-${mhPad(mi+1)}-${mhPad(d||1)}`);if(n>=1&&n<=MH_N)return y}
  return y0;
}

const MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_ID=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const MSHORT_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MSHORT_ID=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const getMonths=()=>S.s.lang==='id'?MONTHS_ID:MONTHS_EN;
const getMShort=()=>S.s.lang==='id'?MSHORT_ID:MSHORT_EN;

const mhOrd=n=>n+(n%100>=11&&n%100<=13?'th':(['th','st','nd','rd'][n%10]||'th'));
function mhFmtD(ds,long){
  const en=S.s.lang==='en',d=+ds.slice(8,10),m=+ds.slice(5,7)-1;
  const mn=(long?(en?MONTHS_EN:MONTHS_ID):(en?MSHORT_EN:MSHORT_ID))[m];
  return`${long&&en?mhOrd(d):d} ${mn} ${ds.slice(0,4)}`;
}
function mhRangeN(n,long,k){
  const b=mhBounds(n,k);
  return b?`${mhFmtD(b.start,long)} - ${mhFmtD(b.end,long)}`:'';
}
const mhRangeTxt=(p,long)=>mhRangeN(mhNum(p),long);
const mhProgramRange=(long,k)=>{const a=mhBounds(1,k),z=mhBounds(MH_N,k);return a?`${mhFmtD(a.start,long)} - ${mhFmtD(z.end,long)}`:''};
function mhName(p){
  const n=mhNum(p);
  return n?(n>=1&&n<=MH_N?`${L('period')} ${n}`:L('mhOutside')):'';
}
function mhSub(p,long=false){
  const n=mhNum(p);
  if(n)return mhRangeN(n,long);
  if(!p)return mhProgramRange(long);
  return'';
}
function mhFullDesc(p){
  const n=mhNum(p);
  if(n)return`${mhName(p)}: ${mhRangeN(n,true)}`;
  if(!p)return`${L('mhAllProgram')} (${mhProgramRange(true)})`;
  return fmtP(p);
}
function mhDaysLeft(p){
  const b=mhBounds(mhNum(p));
  if(!b)return 0;
  if(TODAY<b.start)return b.days;
  if(TODAY>b.end)return 0;
  return days(TODAY,b.end);
}

function mhStep(p,dir){
  const a=mhBounds(1),z=mhBounds(MH_N),n=mhNum(p);
  if(!a)return p;
  if(n)return'P'+Math.min(MH_N,Math.max(1,n+dir));
  if(!p)return dir>0?'P1':'P'+MH_N;
  if(/^\d{4}-\d{2}-\d{2}$/.test(p)){
    const d=new Date(p+'T00:00');d.setDate(d.getDate()+dir);
    const s=iso(d);
    return s<a.start?a.start:s>z.end?z.end:s;
  }
  return p;
}
const mhGet=t=>t==='rep'?REP_P:pv();
function mhSet(t,v){if(t==='rep')REP_P=v;else PV=v||'';render()}
const mhNav=(t,dir)=>mhSet(t,mhStep(mhGet(t),dir));
const mhPick=(t,el)=>openDP(el,{allowEmpty:t==='rep',periodOnly:t==='pv',label:L('dpTargetPeriod'),val:mhGet(t),onSelect:v=>mhSet(t,v)});

/* Maganghub Period Navigator Bar: [<]  Period 1 / 21st September 2026 - 20th October 2026  [>] */
function mhBar(t,flat){
  const p=mhGet(t),n=mhNum(p),a=mhBounds(1),z=mhBounds(MH_N);
  if(!a)return'';
  const isCur=p===curP();
  const canPrev=!p||(n?n>1:p>a.start),canNext=!p||(n?n<MH_N:p<z.end);
  const title=p?fmtP(p):L('mhAllProgram');
  const sub=n?mhRangeTxt(p,true):p?mhFmtD(p,true):mhProgramRange(true);
  const b=mhBounds(n);
  let foot='';
  if(t==='pv'&&n){
    if(isCur&&b&&TODAY>=b.start&&TODAY<=b.end){
      const dn=days(b.start,TODAY)+1;
      foot=`<div class="mh-pb-foot"><span class="pill pos">${esc(L('mhNow'))}</span><span class="mh-pb-d">${esc(L('mhDayOf',dn,b.days))}</span><div class="mh-pb-bar"><i style="width:${Math.round(dn/b.days*100)}%"></i></div></div>`;
    }else if(!isCur){
      foot=`<div class="mh-pb-foot"><button type="button" class="btn g s" onclick="mhSet('pv','')">${esc(L('mhGoCur',mhName(curP())))}</button></div>`;
    }
  }
  return`<div class="mh-pbar${flat?' flat':''}"><div class="mh-pb-row">
    <button type="button" class="mh-pb-btn" ${canPrev?'':'disabled'} onclick="mhNav('${t}',-1)" aria-label="${esc(L('mhPrevP'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div class="mh-pb-mid"><b>${esc(title)}</b><small>${esc(sub)}</small></div>
    <button type="button" class="mh-pb-btn" ${canNext?'':'disabled'} onclick="mhNav('${t}',1)" aria-label="${esc(L('mhNextP'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
  </div>${foot}</div>`;
}

/* Period Strip removed per design specification (navigation is handled cleanly via [<] and [>]) */
const mhStrip=()=>'';

/* Full Maganghub Period Calendar Grid (Sen..Min with check/dash/square markers) */
function mhCalendarCard(p=pv()){
  const n=mhNum(p)||mhCurN(),b=mhBounds(n);
  if(!b)return'';
  const y0=+b.start.slice(0,4),m0=+b.start.slice(5,7)-1,d0=+b.start.slice(8,10);
  const lead=(new Date(b.start+'T00:00').getDay()+6)%7;
  const salDates=new Set([2,3,4,5,6,7].map(i=>mhBounds(i)?.start).filter(Boolean));
  const mShort=getMShort();
  const cells=[];
  for(let i=0;i<lead;i++)cells.push('<td class="empty"></td>');
  for(let i=0;i<b.days;i++){
    const ds=mhISO(y0,m0,d0+i),dow=(lead+i)%7,we=dow>=5;
    const dayNum=+ds.slice(8,10),mi=+ds.slice(5,7)-1;
    const dayTxs=S.tx.filter(t=>t.date===ds);
    const net=dayTxs.reduce((a,t)=>a+(t.type==='inc'?t.amt:t.type==='exp'?-t.amt:0),0);
    const isSal=salDates.has(ds);
    let mk='';
    if(we){
      mk=dayTxs.length?`<span class="mh-cal-mk chk" title="${dayTxs.length} tx">✓</span>`:`<span class="mh-cal-mk dot"></span>`;
    }else if(dayTxs.length){
      mk=`<span class="mh-cal-mk chk" title="${dayTxs.length} tx">✓</span>`;
    }else if(ds<=TODAY){
      mk=`<span class="mh-cal-mk dash">—</span>`;
    }else{
      mk=`<span class="mh-cal-mk" style="color:var(--mute);opacity:.4">·</span>`;
    }
    const amtBadge=dayTxs.length?`<span class="mh-cal-amt ${net>0?'inc':net<0?'neg':''}">${net>0?'+':net<0?'−':''}${short(Math.abs(net))}</span>`:(isSal?`<span class="mh-cal-amt inc">${S.s.lang==='id'?'Gaji':'Salary'}</span>`:'');
    const showM=(i===0||dayNum===1)?`<small>${mShort[mi]}</small>`:'';
    cells.push(`<td class="${we?'we':''}"><button type="button" class="mh-cal-cell ${ds===TODAY?'tod':''} ${isSal?'sal':''}" onclick="addTx('${isSal&&!dayTxs.length?'inc':'exp'}',null,{date:'${ds}'${isSal&&!dayTxs.length?`,cat:'Salary'`:''}})" title="${esc(mhFmtD(ds,true))}">
      <span class="mh-cal-d">${dayNum}${showM}</span>
      ${mk}
      ${amtBadge}
    </button></td>`);
  }
  while(cells.length%7!==0)cells.push('<td class="empty"></td>');
  const rows=[];
  for(let i=0;i<cells.length;i+=7)rows.push(`<tr>${cells.slice(i,i+7).join('')}</tr>`);
  const dow=S.s.lang==='id'?['Sen','Sel','Rab','Kam','Jum','Sab','Min']:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return`<div class="card mh-cal-card">
    <div class="mh-cal-hd">
      <div class="hd-title">
        <h3>${esc(mhName('P'+n))} <span class="pill neu" style="margin-left:6px">${b.days} ${S.s.lang==='id'?'hari':'days'}</span></h3>
        <span class="mh-k-sub">${esc(mhRangeN(n,true))}</span>
      </div>
    </div>
    <div class="mh-cal-wrap">
      <table class="mh-cal-tbl">
        <thead><tr>${dow.map((w,i)=>`<th class="${i>=5?'we':''}">${w}</th>`).join('')}</tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  </div>`;
}

/* Salary Schedule (1st day of Period 2..6 + post-Period 6) */
function mhSalaries(){
  return[2,3,4,5,6,7].map((n,i)=>{
    const date=mhBounds(n).start;
    const recs=S.tx.filter(t=>t.type==='inc'&&t.cat==='Salary'&&t.date===date);
    return{no:i+1,date,label:n<=MH_N?L('mhSalAt',n,n-1):L('mhSalAfter'),amt:recs.reduce((a,t)=>a+t.amt,0),done:recs.length>0};
  });
}
function mhSalary(date){addTx('inc',null,{date,cat:'Salary'})}
function mhSalaryCard(){
  const rows=mhSalaries();
  if(!rows.length)return'';
  return`<div class="card mh-sal">
    <div class="hd" style="margin-bottom:12px">
      <div class="hd-title">
        <h3>${L('mhSalTitle')}</h3>
        <span class="mh-sal-sub">${esc(L('mhSalSub'))}</span>
      </div>
    </div>
    <div class="mh-sal-g">${rows.map(r=>{
      const st=r.done?['pos',L('mhSalDone')]:r.date<TODAY?['warn',L('mhSalTodo')]:r.date===TODAY?['warn',L('dueToday')]:['neu',L('mhUpcoming')];
      return`<div class="mh-sal-i ${r.done?'done':''}">
        <div class="mh-sal-top">
          <span class="mh-sal-num">${esc(L('mhSalNo',r.no))}</span>
          <span class="pill ${st[0]}">${esc(st[1])}</span>
        </div>
        <div class="mh-sal-body">
          <b class="mh-sal-d">${esc(mhFmtD(r.date,true))}</b>
          <span class="mh-sal-lbl">${esc(r.label)}</span>
        </div>
        <div class="mh-sal-act">
          ${r.done?`<span class="mh-sal-a">+${fmt(r.amt)}</span>`:`<button type="button" class="btn g s mh-sal-btn" onclick="mhSalary('${r.date}')">+ ${esc(L('mhSalRec'))}</button>`}
        </div>
      </div>`}).join('')}</div>
  </div>`;
}

/* Mandatory Batch Selection Gate (Batch 2 vs Batch 3) */
const MH_LOGO='<img class="mh-logo on-light" src="MagangHub%20Logo%20-%20Black%20-%20zonalogo.com.svg" alt="Maganghub" decoding="async"><img class="mh-logo on-dark" src="MagangHub%20Logo%20-%20White%20-%20zonalogo.com.svg" alt="" aria-hidden="true" decoding="async">';
function mhGate(){
  const g=$('#mh-gate');
  if(!g)return;
  const pfg=document.getElementById('pf-gate');
  const need=(!S.s.mh||MH_CHANGING)&&!(pfg&&!pfg.hidden);
  g.hidden=!need;
  if(!need){g.innerHTML='';syncGateLock();return}
  if(!MH_SEL)MH_SEL=S.s.mh||'sep';
  const en=S.s.lang==='en';
  const opts=Object.keys(MH_CLASSES).map(k=>{
    const c=MH_CLASSES[k];
    const p1=mhBounds(1,k);
    return`<button type="button" class="mh-opt ${MH_SEL===k?'on':''}" role="radio" aria-checked="${MH_SEL===k}" onclick="mhSelClass('${k}')">
      <span class="mh-opt-badge">${esc(c.badge[S.s.lang]||c.badge.id)}</span>
      <span class="mh-opt-n">${esc(c.name[S.s.lang]||c.name.id)}</span>
      <span class="mh-opt-r">${esc(mhProgramRange(true,k))}</span>
      <span class="mh-opt-m">${esc(L('period'))} 1: ${esc(mhFmtD(p1.start))} – ${esc(mhFmtD(p1.end))}</span>
      <i class="mh-opt-c" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></i>
    </button>`}).join('');
  g.innerHTML=`<div class="mh-gate-card" role="dialog" aria-modal="true" aria-labelledby="mh-gate-t">
    <div class="mh-gate-top">
      ${MH_LOGO}
      <div class="mh-gate-top-r">
        <div class="mh-gate-lang" role="group" aria-label="${esc(L('lang'))}">
          <button type="button" class="${S.s.lang==='id'?'on':''}" onclick="setLang('id')">ID</button>
          <button type="button" class="${en?'on':''}" onclick="setLang('en')">EN</button>
        </div>
        ${MH_CHANGING?`<button type="button" class="mh-gate-close" onclick="mhCancelChange()" aria-label="${esc(L('cancel'))}">✕</button>`:''}
      </div>
    </div>
    <h2 id="mh-gate-t">${esc(L(MH_CHANGING?'mhChangeTitle':'mhGateTitle'))}</h2>
    <p class="mh-gate-sub">${esc(L(MH_CHANGING?'mhChangeSub':'mhGateSub'))}</p>
    <div class="mh-opts" role="radiogroup" aria-labelledby="mh-gate-t">${opts}</div>
    <div class="mh-gate-act ${MH_CHANGING?'pair':''}">
      ${MH_CHANGING?`<button type="button" class="btn g" onclick="mhCancelChange()">${esc(L('cancel'))}</button>`:''}
      <button type="button" class="btn" ${MH_SEL?'':'disabled'} onclick="mhChoose()">${esc(MH_CHANGING?(S.s.lang==='id'?'Lanjutkan':'Continue'):(MH_SEL?L('mhStartWith',MH_CLASSES[MH_SEL].name[S.s.lang]||MH_CLASSES[MH_SEL].name.id):L('mhPickOne')))}</button>
    </div>
  </div>`;
  syncGateLock();
}
const mhSelClass=k=>{MH_SEL=k;render()};
function mhChange(){MH_CHANGING=true;MH_SEL=S.s.mh||'sep';mhGate()}
function mhCancelChange(){MH_CHANGING=false;MH_SEL='';render()}
function mhChoose(){
  if(!MH_SEL)return;
  const changed=S.s.mh!==MH_SEL;
  S.s.mh=MH_SEL;
  MH_CHANGING=false;MH_SEL='';
  PV='';REP_P=curP();F.m='';
  done();
  toast(L(changed?'mhSaved':'mhKept'));
}

function matchP(dateStr,p){
  if(!p)return true;
  if(!dateStr)return false;
  const pn=mhNum(p);
  if(pn){const b=mhBounds(pn);return !!b&&dateStr>=b.start&&dateStr<=b.end}
  if(/^\d{4}-\d{2}-\d{2}$/.test(p))return dateStr===p;
  if(/^\d{4}-\d{2}$/.test(p))return dateStr.startsWith(p);
  if(/^\d{4}$/.test(p))return dateStr.startsWith(p);
  return dateStr.startsWith(p);
}

function fmtP(p,empty){
  const emp=empty??L('allDates');
  if(!p)return emp;
  if(mhNum(p))return mhName(p);
  if(/^\d{4}-\d{2}-\d{2}$/.test(p)){
    const d=new Date(p+'T00:00');
    return d.toLocaleDateString(S.s.lang==='id'?'id-ID':'en-US',{month:'short',day:'numeric',year:'numeric'});
  }
  if(/^\d{4}-\d{2}$/.test(p)){
    const[y,m]=p.split('-');
    return`${getMonths()[+m-1]} ${y}`;
  }
  if(/^\d{4}$/.test(p))return`${S.s.lang==='id'?'Tahun':'Year'} ${p}`;
  return p;
}

function prevP(p){
  if(!p)return'';
  const pn=mhNum(p);
  if(pn)return pn>1?'P'+(pn-1):'';
  if(/^\d{4}-\d{2}-\d{2}$/.test(p)){const d=new Date(p+'T00:00');d.setDate(d.getDate()-1);return iso(d)}
  if(/^\d{4}-\d{2}$/.test(p)){const[y,m]=p.split('-').map(Number),d=new Date(y,m-2,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
  if(/^\d{4}$/.test(p))return String(+p-1);
  return p;
}

function nextP(p){
  if(!p)return'';
  const pn=mhNum(p);
  if(pn)return pn<MH_N?'P'+(pn+1):'';
  if(/^\d{4}-\d{2}-\d{2}$/.test(p)){const d=new Date(p+'T00:00');d.setDate(d.getDate()+1);return iso(d)}
  if(/^\d{4}-\d{2}$/.test(p)){const[y,m]=p.split('-').map(Number),d=new Date(y,m,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
  if(/^\d{4}$/.test(p))return String(+p+1);
  return p;
}

function pMult(p){
  if(mhNum(p))return 1;
  if(!p)return MH_N;
  if(/^\d{4}$/.test(p))return 12;
  return 1;
}


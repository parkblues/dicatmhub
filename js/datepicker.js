/* Dicatat! - Maganghub Mode: date / period picker */

/* Date / Period Picker (Maganghub Mode): "Period 1-6" list + Period Calendar (Mon-Sun) */
let DP={open:false,mode:'period',val:'',onlyDate:false,periodOnly:false,cb:null,anchor:null,pi:1,q:'',preview:''};

function dpModeOf(v,def='period'){
  if(!v)return def;
  if(mhNum(v))return'period';
  if(/^\d{4}-\d{2}-\d{2}$/.test(v))return'day';
  return def;
}

function dpSyncView(v){
  if(!v)return;
  if(mhNum(v)){DP.pi=mhNum(v);return}
  if(/^\d{4}-\d{2}-\d{2}$/.test(v))DP.pi=mhIdxOf(v);
}

function parseNaturalDate(raw,onlyDate){
  const s=raw.trim().toLowerCase();
  if(!s)return null;
  const pm=s.match(/^(?:p|per|periode|period)\.?\s*([1-6])$/);
  if(pm)return onlyDate?null:{mode:'period',val:'P'+pm[1]};
  if(s==='today'||s==='now'||s==='hari ini')return{mode:'day',val:TODAY};
  if(s==='yesterday'||s==='kemarin'){const d=new Date();d.setDate(d.getDate()-1);return{mode:'day',val:iso(d)}}
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return{mode:'day',val:s};
  for(let i=0;i<12;i++){
    const names=[MONTHS_EN[i],MSHORT_EN[i],MONTHS_ID[i],MSHORT_ID[i]].map(x=>x.toLowerCase());
    for(const nm of names){
      const r1=new RegExp(`^${nm}\\.?\\s*(\\d{1,2})?(?:[,\\s]+(\\d{4}))?$`);
      const r2=new RegExp(`^(\\d{1,2})\\s+${nm}\\.?(?:[,\\s]+(\\d{4}))?$`);
      const m1=s.match(r1),m2=s.match(r2);
      if(m1){
        const d=m1[1]?+m1[1]:null,y=m1[2]?+m1[2]:mhGuessY(i,d);
        if(d&&d>=1&&d<=31)return{mode:'day',val:`${y}-${mhPad(i+1)}-${mhPad(d)}`};
        if(!d&&onlyDate)return{mode:'day',val:`${y}-${mhPad(i+1)}-01`};
      }
      if(m2){
        const d=+m2[1],y=m2[2]?+m2[2]:mhGuessY(i,d);
        if(d>=1&&d<=31)return{mode:'day',val:`${y}-${mhPad(i+1)}-${mhPad(d)}`};
      }
    }
  }
  return null;
}

function openDP(el,opts={}){
  const pop=$('#dp-pop');
  if(DP.open&&DP.anchor===el){closeDP();return}
  document.querySelectorAll('.dp-trig.open').forEach(x=>x.classList.remove('open'));
  el.classList.add('open');
  const host=el.closest('dialog')||document.body;
  if(pop.parentElement!==host)host.appendChild(pop);
  const val=opts.val??el.dataset.val??'';
  DP={
    open:true,
    anchor:el,
    label:opts.label||(opts.onlyDate?L('dpTargetDate'):L('dpTargetPeriod')),
    onlyDate:!!opts.onlyDate,
    periodOnly:!!opts.periodOnly,
    allowEmpty:!!opts.allowEmpty,
    val,
    preview:val,
    mode:opts.onlyDate?'day':(opts.periodOnly?'period':dpModeOf(val,'period')),
    pi:mhCurN(),
    q:fmtP(val,''),
    cb:opts.onSelect
  };
  dpSyncView(val||mhDefDate());
  pop.hidden=false;
  renderDP(document.documentElement.dataset.mobile!=='1');
  posDP();
}

function posDP(){
  if(!DP.open||!DP.anchor)return;
  const pop=$('#dp-pop'),r=DP.anchor.getBoundingClientRect();
  const pw=308,ph=pop.offsetHeight||350;
  let top=r.bottom+6,left=r.left;
  if(top+ph>window.innerHeight-12)top=Math.max(12,r.top-ph-6);
  if(left+pw>window.innerWidth-12)left=Math.max(12,window.innerWidth-pw-12);
  pop.style.top=top+'px';
  pop.style.left=left+'px';
}

function closeDP(){
  DP.open=false;
  if(DP.anchor)DP.anchor.classList.remove('open');
  DP.anchor=null;
  const pop=$('#dp-pop');
  if(pop){pop.hidden=true;if(pop.parentElement!==document.body)document.body.appendChild(pop)}
}

function pickDP(val,stayOpen=false){
  if(DP.onlyDate&&val&&!/^\d{4}-\d{2}-\d{2}$/.test(val))return;
  DP.val=val;
  if(DP.anchor){
    DP.anchor.dataset.val=val;
    const sp=DP.anchor.querySelector('.dp-txt');
    if(sp)sp.textContent=fmtP(val,DP.anchor.dataset.empty||L('allDates'));
    const hid=DP.anchor.parentElement?.querySelector('input[type="hidden"]');
    if(hid)hid.value=val;
  }
  if(DP.cb)DP.cb(val);
  if(!stayOpen)closeDP();
}

function dpNav(dir){
  DP.pi=Math.max(-24,Math.min(24,DP.pi+dir));
  renderDP();
}

function dpSetMode(m){
  DP.mode=m;
  renderDP();
}

function dpOnInput(inp){
  DP.q=inp.value;
  const res=parseNaturalDate(DP.q,DP.onlyDate);
  if(res&&!(DP.periodOnly&&res.mode!=='period')){
    DP.mode=res.mode;
    DP.preview=res.val;
    dpSyncView(res.val);
    renderDPBody();
    renderDPTabs();
  }
}

function dpOnKey(e){
  if(e.key==='Enter'){
    e.preventDefault();
    if(!DP.q.trim()&&DP.allowEmpty){pickDP('');return}
    const res=parseNaturalDate(DP.q,DP.onlyDate);
    if(res&&!(DP.periodOnly&&res.mode!=='period'))pickDP(res.val);
    else if(DP.preview)pickDP(DP.preview);
  }else if(e.key==='Escape'){
    e.stopPropagation();
    closeDP();
  }
}

function dpClearInput(){
  DP.q='';
  const inp=$('#dp-pop .dp-inp');
  if(inp){inp.value='';inp.focus()}
  if(DP.allowEmpty){
    DP.preview='';
    renderDPBody();
  }
}

function renderDPTabs(){
  const el=$('#dp-tabs-c');
  if(!el)return;
  if(DP.onlyDate||DP.periodOnly){el.hidden=true;el.innerHTML='';return}
  el.hidden=false;
  const tabs=[['period',L('dpPeriod')],['day',L('dpDay')]];
  el.innerHTML=tabs.map(([k,l])=>`<button type="button" class="dp-tab ${DP.mode===k?'on':''}" onclick="dpSetMode('${k}')">${l}</button>`).join('');
}

function renderDPBody(){
  const box=$('#dp-body-c');
  if(!box)return;
  const sel=DP.preview||DP.val;
  if(DP.mode==='period'){
    const cur=mhCurN();
    const rows=mhPeriods().map(b=>{
      const k='P'+b.n;
      return`<button type="button" class="mh-dp-p ${sel===k?'sel':''}" onclick="pickDP('${k}')"><span><b>${esc(mhName(k))}</b><small>${esc(mhRangeN(b.n,true))}</small></span>${b.n===cur?`<i>${esc(L('mhNow'))}</i>`:''}</button>`;
    }).join('');
    const all=DP.allowEmpty?`<button type="button" class="mh-dp-p ${!sel?'sel':''}" onclick="pickDP('')"><span><b>${esc(L('mhAllProgram'))}</b><small>${esc(mhProgramRange(true))}</small></span></button>`:'';
    box.innerHTML=`<div class="dp-sub"><span>${esc(L('dpSelectPeriod'))}</span></div><div class="mh-dp-list">${all}${rows}</div>`;
    return;
  }
  const b=mhBounds(DP.pi);
  if(!b){box.innerHTML='';return}
  const inProg=DP.pi>=1&&DP.pi<=MH_N;
  const y0=+b.start.slice(0,4),m0=+b.start.slice(5,7)-1,d0=+b.start.slice(8,10);
  const lead=(new Date(b.start+'T00:00').getDay()+6)%7;
  const cells=[];
  for(let i=0;i<lead;i++)cells.push('<span></span>');
  for(let i=0;i<b.days;i++){
    const ds=mhISO(y0,m0,d0+i),we=((lead+i)%7)>=5;
    cells.push(`<button type="button" class="dp-d ${we?'we':''} ${inProg?'':'out'} ${ds===TODAY?'tod':''} ${ds===sel?'sel':''}" onclick="pickDP('${ds}')">${+ds.slice(8,10)}</button>`);
  }
  const dow=S.s.lang==='id'?['Sen','Sel','Rab','Kam','Jum','Sab','Min']:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const ttl=inProg?mhName('P'+b.n):L('mhOutside');
  box.innerHTML=`<div class="dp-sub"><span class="mh-dp-t"><b>${esc(ttl)}</b><small>${esc(mhRangeN(b.n,true))}</small></span><div class="dp-nav"><button type="button" onclick="dpNav(-1)">‹</button><button type="button" onclick="dpNav(1)">›</button></div></div>
  <div class="dp-dow">${dow.map((w,i)=>`<span class="${i>4?'we':''}">${w}</span>`).join('')}</div>
  <div class="dp-days">${cells.join('')}</div>`;
}

function renderDP(focusInp=false){
  const pop=$('#dp-pop');
  pop.innerHTML=`<div class="dp-lbl">${esc(DP.label)}</div>
  <div class="dp-inp-w">
    <input class="dp-inp" type="text" value="${esc(DP.q)}" placeholder="${esc(DP.onlyDate?L('dpPhDate'):L('dpPhPeriod'))}" oninput="dpOnInput(this)" onkeydown="dpOnKey(event)">
    <button type="button" class="dp-x" title="Clear" onclick="${DP.allowEmpty?`pickDP('')`:'dpClearInput()'}">✕</button>
  </div>
  <div class="dp-tabs" id="dp-tabs-c"></div>
  <div id="dp-body-c"></div>`;
  renderDPTabs();
  renderDPBody();
  if(focusInp){
    const inp=pop.querySelector('.dp-inp');
    if(inp){inp.focus();inp.select()}
  }
}

document.addEventListener('mousedown',e=>{
  if(!DP.open)return;
  const pop=$('#dp-pop');
  if(pop&&!pop.contains(e.target)&&(!DP.anchor||!DP.anchor.contains(e.target)))closeDP();
});
window.addEventListener('resize',()=>DP.open&&posDP());


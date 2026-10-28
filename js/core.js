/* Dicatat! - Maganghub Mode: state loading, storage helpers, money and date formatting */

let S;
try{
  localStorage.removeItem('kas-v1');
  S=JSON.parse(localStorage.getItem(KEY));
}catch(e){}
S=normalizeState(S)||structuredClone(D);
if(!S.debts)S.debts=[];
if(!S.s)S.s={cur:'IDR',theme:'auto',lang:'id',mh:'',name:'',inst:''};
if(S.s.cur!=='IDR'&&S.s.cur!=='USD')S.s.cur='IDR';
if(!S.s.lang)S.s.lang='id';

const L=(k,...args)=>{
  const dict=I18N[S.s.lang]||I18N.en;
  let v=dict[k]??I18N.en[k]??k;
  args.forEach((a,i)=>{v=String(v).replace(`{${i}}`,a)});
  return v;
};

const $=s=>document.querySelector(s),uid=()=>Date.now().toString(36).slice(-4)+Math.random().toString(36).slice(2,7);

/* ==========================================================================
   LOCAL STATE HELPERS (local-only: saved in this browser's localStorage)
   ========================================================================== */
function normalizeState(x){
  if(!x||!Array.isArray(x.wallets)||!Array.isArray(x.tx))return null;
  if(!Array.isArray(x.debts))x.debts=[];
  if(!Array.isArray(x.inv))x.inv=[];
  if(!Array.isArray(x.goals))x.goals=[];
  if(!x.budgets||typeof x.budgets!=='object')x.budgets={};
  if(!x.cats||typeof x.cats!=='object')x.cats=structuredClone(D.cats);
  if(!x.s||typeof x.s!=='object')x.s={cur:'IDR',theme:'auto',lang:'id',mh:'',name:'',inst:''};
  if(x.s.cur!=='USD'&&x.s.cur!=='IDR')x.s.cur='IDR';
  if(x.s.lang!=='en'&&x.s.lang!=='id')x.s.lang='id';
  if(!['auto','light','dark'].includes(x.s.theme))x.s.theme='auto';
  if(x.s.mh!=='sep'&&x.s.mh!=='nov')x.s.mh='';
  /* profile (name + institution): plain text, trimmed, capped, never trusted as HTML */
  if(typeof x.s.name!=='string')x.s.name='';
  if(typeof x.s.inst!=='string')x.s.inst='';
  x.s.name=x.s.name.replace(/\s+/g,' ').trim().slice(0,40);
  x.s.inst=x.s.inst.replace(/\s+/g,' ').trim().slice(0,60);
  /* drop metadata left over from the old cloud-sync version */
  delete x._deleted;delete x._budgetsTs;delete x._resetAt;delete x._sTs;
  return x;
}

function applyLiveRender(){
  const active=document.activeElement;
  if(active&&active.classList?.contains('bar-in'))return;
  render();
}

/* Save-failure warning: a persistent banner, cleared by the next successful save */
function saveWarn(on){
  let b=document.getElementById('savewarn');
  if(!on){if(b)b.hidden=true;return}
  if(!b){
    b=document.createElement('div');
    b.id='savewarn';
    b.setAttribute('role','alert');
    b.innerHTML='<span></span><button type="button" aria-label="OK" onclick="this.parentNode.hidden=true">&#10005;</button>';
    document.body.appendChild(b);
  }
  b.firstChild.textContent=L('saveFail');
  b.hidden=false;
}

const save=()=>{
  S._updatedAt=Date.now();
  try{localStorage.setItem(KEY,JSON.stringify(S));saveWarn(false);return true}
  catch(e){saveWarn(true);return false}
};
const done=()=>{save();render()};

const iso=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10),TODAY=iso(new Date()),MON=TODAY.slice(0,7);
const curSym=()=>S.s.cur==='USD'?'$':'Rp';
const curLabel=()=>S.s.cur==='USD'?'USD ($)':'IDR (Rp)';
const fmt=n=>S.s.cur==='USD'?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(+n||0):'Rp '+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Math.round(+n||0));
const fmtPlain=n=>S.s.cur==='USD'?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(+n||0):'Rp '+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Math.round(+n||0));
const short=n=>(S.s.cur==='USD'?'$':'')+new Intl.NumberFormat(S.s.cur==='USD'?'en-US':(S.s.lang==='id'?'id-ID':'en-US'),{notation:'compact',maximumFractionDigits:1}).format(+n||0);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dt=d=>d?new Date(d+'T00:00').toLocaleDateString(S.s.lang==='id'?'id-ID':'en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
const opt=(l,s)=>l.map(x=>{const[v,t]=Array.isArray(x)?x:[x,x];return`<option value="${esc(v)}"${v==s?' selected':''}>${esc(t)}</option>`}).join('');
const toast=m=>{const t=$('#t');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2600)};
const wopts=()=>S.wallets.map(w=>[w.id,w.name]);
const IC={
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  del:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>'
};
const iconBtns=(ed,dl,cls='')=>`<button type="button" class="ib ${cls}" title="${L('edit')}" aria-label="${L('edit')}" onclick="${ed}">${IC.edit}</button><button type="button" class="ib del ${cls}" title="${L('del')}" aria-label="${L('del')}" onclick="${dl}">${IC.del}</button>`;


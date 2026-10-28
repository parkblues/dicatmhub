/* Dicatat! - Maganghub Mode: router, mobile navigation, render loop, boot */

let V='dash';
const NAV_KEYS=['dash','tx','debt','bud','wal','inv','rep','set'];

/* ==========================================================================
   MOBILE DEVICE AUTO-DETECTION (Phones = Mobile Mode, Tablets = Desktop Mode)
   & AESTHETIC BOTTOM NAVIGATION BAR
   ========================================================================== */
let IS_MOBILE=false,MOB_SHEET_OPEN=false,MOB_READY=false;

const MOB_ICONS={
  dash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>`,
  tx:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>`,
  debt:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></svg>`,
  bud:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-6"/></svg>`,
  wal:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>`,
  inv:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  rep:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  set:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  more:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="18" r="2.2"/></svg>`,
  /* Dock icons: outline, 1.85 stroke, matched to the reference tab bar */
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 10.4 12 3.6l8.4 6.8V20a1.4 1.4 0 0 1-1.4 1.4h-4.5v-5.9a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v5.9H5A1.4 1.4 0 0 1 3.6 20z"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.2v15.6M4.2 12h15.6"/></svg>`,
  pie:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v9h9a9 9 0 0 0-9-9z"/><path d="M21.2 15.1A9 9 0 1 1 8.9 2.8"/></svg>`,
  grid:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6.6" height="6.6" rx="2"/><rect x="13.4" y="4" width="6.6" height="6.6" rx="2"/><rect x="4" y="13.4" width="6.6" height="6.6" rx="2"/><rect x="13.4" y="13.4" width="6.6" height="6.6" rx="2"/></svg>`
};

function checkMobileMode(){
  const ua=navigator.userAgent||'';
  const isTablet=/iPad|Tablet|PlayBook|Silk/i.test(ua)||(/Android/i.test(ua)&&!/Mobile/i.test(ua))||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1&&Math.min(window.screen.width,window.screen.height)>=600);
  let mob=false;
  if(!isTablet){
    if(navigator.userAgentData&&typeof navigator.userAgentData.mobile==='boolean'){
      mob=navigator.userAgentData.mobile;
    }
    if(!mob){
      mob=/iPhone|iPod|Windows Phone|IEMobile|Opera Mini|BlackBerry/i.test(ua)||(/Android/i.test(ua)&&/Mobile/i.test(ua));
    }
  }
  if(window.innerWidth<=640)mob=true;
  const prev=IS_MOBILE;
  IS_MOBILE=mob;
  document.documentElement.dataset.mobile=mob?'1':'0';
  if(prev!==mob){if(!mob)closeMobSheet();else renderMobNav();if(MOB_READY)setTimeout(render,0)}
}

function toggleMobSheet(){
  MOB_SHEET_OPEN=!MOB_SHEET_OPEN;
  renderMobNav();
}

function closeMobSheet(){
  if(!MOB_SHEET_OPEN)return;
  MOB_SHEET_OPEN=false;
  renderMobNav();
}

function renderMobNav(){
  const bar=$('#mob-bar'),sheet=$('#mob-sheet'),bd=$('#mob-backdrop'),pill=$('#mob-view-pill');
  if(!bar||!sheet||!bd)return;
  const navDict=I18N[S.s.lang]?.nav||I18N.en.nav;
  if(pill)pill.textContent=navDict[V]||'';

  const idMode=S.s.lang==='id';
  const isMenu=V!=='dash'&&V!=='bud';
  const menuOn=MOB_SHEET_OPEN||isMenu;
  const hasUrgDebt=S.debts?.some(d=>!d.paid&&(d.urgent||(d.due&&days(TODAY,d.due)<=0)));

  bar.innerHTML=`
    <button type="button" class="mob-tab ${V==='dash'&&!MOB_SHEET_OPEN?'on':''}" aria-current="${V==='dash'&&!MOB_SHEET_OPEN?'page':'false'}" onclick="go('dash')">
      <span class="mob-ic">${MOB_ICONS.home}</span>
      <span class="mob-lbl">${esc(navDict.dash)}</span>
    </button>
    <button type="button" class="mob-tab" title="${esc(L('addEntry'))}" aria-label="${esc(L('addEntry'))}" onclick="closeMobSheet();addTx()">
      <span class="mob-ic">${MOB_ICONS.plus}</span>
      <span class="mob-lbl">${idMode?'Tambah':'Add'}</span>
    </button>
    <button type="button" class="mob-tab ${V==='bud'&&!MOB_SHEET_OPEN?'on':''}" aria-current="${V==='bud'&&!MOB_SHEET_OPEN?'page':'false'}" onclick="go('bud')">
      <span class="mob-ic">${MOB_ICONS.pie}</span>
      <span class="mob-lbl">${esc(navDict.bud)}</span>
    </button>
    <button type="button" class="mob-tab ${menuOn?'on':''}" aria-current="${isMenu?'page':'false'}" aria-expanded="${MOB_SHEET_OPEN?'true':'false'}" onclick="toggleMobSheet()">
      <span class="mob-ic">${MOB_ICONS.grid}${hasUrgDebt?'<i class="mob-dot"></i>':''}</span>
      <span class="mob-lbl">${idMode?'Semua Menu':'All Menus'}</span>
    </button>
  `;

  bd.classList.toggle('open',MOB_SHEET_OPEN);
  sheet.classList.toggle('open',MOB_SHEET_OPEN);
  if(MOB_SHEET_OPEN){
    const subMap={
      dash:short(S.wallets.reduce((a,x)=>a+bal(x),0)+S.inv.reduce((a,i)=>a+invVal(i),0)),
      tx:`${S.tx.length} ${L('entries')}`,
      debt:`${(S.debts||[]).filter(d=>!d.paid).length} active`,
      bud:`${Object.keys(S.budgets||{}).filter(k=>S.budgets[k]>0).length} limits`,
      wal:`${S.wallets.length} ${esc(navDict.wal)}`,
      inv:`${S.inv.length} assets`,
      rep:fmtP(REP_P,L('mhAllProgram')),
      set:`${S.s.lang.toUpperCase()} · ${S.s.cur}`
    };
    sheet.innerHTML=`
      <div class="mob-handle"></div>
      <div class="mob-sheet-hd">
        <strong>${S.s.lang==='id'?'Semua Menu & Navigasi':'All Menus & Navigation'}</strong>
        <button type="button" class="x" onclick="closeMobSheet()">✕</button>
      </div>
      <div class="mob-grid">
        ${NAV_KEYS.map(k=>`
          <button type="button" class="mob-card ${V===k?'on':''}" onclick="go('${k}')">
            <div class="mob-card-ic">${MOB_ICONS[k]}</div>
            <b>${esc(navDict[k])}</b>
            <small>${esc(subMap[k]||'')}</small>
          </button>
        `).join('')}
      </div>
      <div class="mob-quick">
        <button type="button" class="btn g" onclick="closeMobSheet();addDebt('utang')">+ ${esc(L('loanLbl'))}</button>
        <button type="button" class="btn g" onclick="closeMobSheet();addDebt('piutang')">+ ${esc(L('recLbl'))}</button>
        <button type="button" class="btn g" onclick="closeMobSheet();go('rep')">${esc(L('repBtn'))}</button>
      </div>
    `;
  }
}

window.addEventListener('resize',()=>checkMobileMode());
window.addEventListener('orientationchange',()=>setTimeout(checkMobileMode,80));
checkMobileMode();

/* ==========================================================================
   PROFILE GATE (name + institution)
   First-run popup on phones; also the editor used from Settings.
   Saved in S.s.name / S.s.inst — this browser only, never uploaded.
   ========================================================================== */
let PF_EDIT=false,PF_D={name:'',inst:''},PF_LANG='';

function pfInitials(n){
  const p=String(n||'').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
  if(!p.length)return '?';
  const a=p[0][0], b=p.length>1?p[p.length-1][0]:'';
  return (a+b).toUpperCase();
}
function pfGreetKey(){
  const h=new Date().getHours();
  return h<11?'pfMorning':h<15?'pfAfternoon':'pfEvening';
}
function syncGateLock(){
  const lock=['#pf-gate','#mh-gate'].some(s=>{const e=$(s);return e&&!e.hidden});
  document.body.style.overflow=lock?'hidden':'';
}
function pfDraw(){
  const g=$('#pf-gate');
  const canClose=PF_EDIT&&!!S.s.name;
  const en=S.s.lang==='en';
  g.innerHTML=`<div class="mh-gate-card pf-card" role="dialog" aria-modal="true" aria-labelledby="pf-t">
    <div class="mh-gate-top">
      ${MH_LOGO}
      <div class="mh-gate-top-r">
        <div class="mh-gate-lang" role="group" aria-label="${esc(L('lang'))}">
          <button type="button" class="${S.s.lang==='id'?'on':''}" onclick="setLang('id')">ID</button>
          <button type="button" class="${en?'on':''}" onclick="setLang('en')">EN</button>
        </div>
        ${canClose?`<button type="button" class="mh-gate-close" onclick="pfClose()" aria-label="${esc(L('cancel'))}">✕</button>`:''}
      </div>
    </div>
    <div class="pf-badge" aria-hidden="true">
      <span class="pf-av">${PF_EDIT&&S.s.name?esc(pfInitials(S.s.name)):`<svg viewBox="17 15 66 70"><use href="#dicatat-mark"/></svg>`}</span>
    </div>
    <h2 id="pf-t">${esc(L(PF_EDIT?'pfEditTitle':'pfTitle'))}</h2>
    <p class="mh-gate-sub">${esc(L(PF_EDIT?'pfEditSub':'pfSub'))}</p>
    <div class="pf-fields">
      <label class="pf-field">
        <span class="pf-lbl">${esc(L('pfName'))}</span>
        <input class="pf-inp" id="pf-name" type="text" value="${esc(PF_D.name)}" placeholder="${esc(L('pfNamePh'))}" maxlength="40" autocomplete="name" enterkeyhint="next" oninput="PF_D.name=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();$('#pf-inst').focus()}">
      </label>
      <label class="pf-field">
        <span class="pf-lbl">${esc(L('pfInst'))}</span>
        <input class="pf-inp" id="pf-inst" type="text" value="${esc(PF_D.inst)}" placeholder="${esc(L('pfInstPh'))}" maxlength="60" autocomplete="organization" enterkeyhint="done" oninput="PF_D.inst=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();pfSave()}">
      </label>
    </div>
    <div class="pf-priv">
      <svg class="pf-priv-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg>
      <span>${esc(PRIVACY_LINE)}</span>
    </div>
    <div class="mh-gate-act ${PF_EDIT?'pair':''}">
      ${PF_EDIT?`<button type="button" class="btn g" onclick="pfClose()">${esc(L('cancel'))}</button>`:''}
      <button type="button" class="btn" onclick="pfSave()">${esc(L(PF_EDIT?'pfSave':'pfStart'))}</button>
    </div>
  </div>`;
}
function pfGate(){
  const g=$('#pf-gate');
  if(!g)return;
  const need=PF_EDIT||!S.s.name;
  if(!need){
    if(!g.hidden){g.hidden=true;g.innerHTML=''}
    PF_LANG='';
    syncGateLock();
    return;
  }
  g.hidden=false;
  if(!g.innerHTML||PF_LANG!==S.s.lang){
    PF_LANG=S.s.lang;
    const first=!g.innerHTML;
    pfDraw();
    if(first)setTimeout(()=>{const i=$('#pf-name');if(i&&!i.value)i.focus()},80);
  }
  syncGateLock();
}
function openProfile(){
  PF_EDIT=true;
  PF_D={name:S.s.name||'',inst:S.s.inst||''};
  PF_LANG='';
  render();
}
function pfClose(){
  if(!S.s.name)return;
  PF_EDIT=false;PF_D={name:'',inst:''};PF_LANG='';
  render();
}
function pfSave(){
  const name=(PF_D.name||'').replace(/\s+/g,' ').trim().slice(0,40);
  const inst=(PF_D.inst||'').replace(/\s+/g,' ').trim().slice(0,60);
  if(!name||!inst){
    const card=$('#pf-gate .pf-card');
    if(card){card.classList.add('pf-shake');setTimeout(()=>card.classList.remove('pf-shake'),420)}
    toast(L('pfErr'));
    const i=$(name?'#pf-inst':'#pf-name');
    if(i)i.focus();
    return;
  }
  S.s.name=name;S.s.inst=inst;
  PF_EDIT=false;PF_D={name:'',inst:''};PF_LANG='';
  done();
  toast(L('pfSaved'));
}

const go=k=>{closeDP();closeMobSheet();V=k;render();scrollTo(0,0)};
function render(){
  checkMobileMode();
  const r=document.documentElement;
  S.s.theme==='auto'?r.removeAttribute('data-theme'):r.dataset.theme=S.s.theme;
  const isDark=S.s.theme==='dark'||(S.s.theme==='auto'&&window.matchMedia('(prefers-color-scheme:dark)').matches);
  const mt=$('#meta-theme-light');
  if(mt)mt.setAttribute('content',isDark?'#090b10':'#0070C9');
  $('#hdr-sub').textContent=L('sub');
  $('#hdr-rep-lbl').textContent=L('repBtn');
  const addLbl=$('#hdr-add-lbl');
  if(addLbl)addLbl.textContent=L('addEntry');
  const clsPill=$('#mh-cls-pill');
  if(clsPill){
    const c=MH_CLASSES[S.s.mh];
    const clsName=c?(c.short[S.s.lang]||c.short.id):L('mhPickBtn');
    clsPill.innerHTML=`<i></i><span class="mh-cls-mob">${esc(clsName)}</span><span class="mh-cls-desk">${esc(`${clsName} · ${mhName(pv())}`)}</span>`;
    clsPill.title=c?`${c.name[S.s.lang]||c.name.id} (${mhProgramRange(true)}) — ${L('mhClickSwitch')}`:L('mhGateTitle');
  }
  $('#user').textContent=new Date().toLocaleDateString(S.s.lang==='id'?'id-ID':'en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  const navDict=I18N[S.s.lang]?.nav||I18N.en.nav;
  $('#nav').innerHTML=NAV_KEYS.map(k=>`<button class="${k===V?'on':''}" onclick="go('${k}')">${esc(navDict[k])}</button>`).join('');
  const mainEl=$('#main'),viewChanged=render._v!==V;render._v=V;
  mainEl.innerHTML=VIEWS[V]();
  mainEl.querySelectorAll('table.rt').forEach(tb=>{
    const hs=[...tb.querySelectorAll('thead th')].map(th=>th.textContent.trim());
    tb.querySelectorAll('tbody tr').forEach(r=>{let ci=0;[...r.cells].forEach(c=>{c.dataset.l=hs[ci]||'';ci+=c.colSpan||1})});
  });
  if(viewChanged){mainEl.classList.remove('enter');void mainEl.offsetWidth;mainEl.classList.add('enter')}
  if(V==='tx')tbl();
  renderMobNav();
  pfGate();
  mhGate();
  const fp=$('#foot-priv');
  if(fp&&!fp.textContent)fp.textContent=PRIVACY_LINE;
}
const h=location.hash.slice(1);if(VIEWS[h])V=h;
render();
MOB_READY=true;

/* Keep multiple tabs in step: last-write-wins (no merging, so deleted items never come back) */
function adoptState(raw){
  const inc=normalizeState(raw);
  if(inc&&(+inc._updatedAt||0)>(+S._updatedAt||0)){S=inc;applyLiveRender()}
}
window.addEventListener('storage',e=>{
  if(e.key===KEY&&e.newValue){try{adoptState(JSON.parse(e.newValue))}catch(err){}}
});

/* Service worker: caches the app shell + fonts so it opens offline (needs https or localhost) */
if('serviceWorker' in navigator&&location.protocol!=='file:'){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
}

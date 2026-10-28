/* Dicatat! - Maganghub Mode: the eight application views */

/* Views */
const VIEWS={
dash(){
  const P=pv();
  const w=S.wallets.reduce((a,x)=>a+bal(x),0),iv=S.inv.reduce((a,i)=>a+invVal(i),0),nw=w+iv||1,inc=sum('inc',P),ex=sum('exp',P),mx=Math.max(inc,ex,1);
  const uTot=totUtangVal(),pTot=totPiutangVal(),adjNw=(w+iv)-uTot+pTot;
  const riskPct=w>0?(uTot/w*100):(uTot>0?100:0);
  const riskStatus=riskPct>50?['neg',L('highRisk')]:riskPct>25?['warn',L('modRisk')]:['pos',L('lowRisk')];
  const urgCnt=S.debts.filter(d=>!d.paid&&d.urgent).length;
  const ovdCnt=S.debts.filter(d=>!d.paid&&d.due&&days(TODAY,d.due)<0).length;
  const byU=['Paylater','Credit','Pinjol'].map(c=>[c,activeUtang().filter(d=>d.cat===c).reduce((a,d)=>a+debtOblig(d),0)]);
  const cats=Object.entries(S.tx.filter(t=>t.type==='exp'&&matchP(t.date,P)).reduce((a,t)=>(a[t.cat]=(a[t.cat]||0)+t.amt,a),{})).sort((a,b)=>b[1]-a[1]);
  const bg=Object.keys(S.budgets).filter(c=>S.budgets[c]>0).map(c=>[c,spent(c,P)/S.budgets[c]]).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const totB=tb(),totS=tsp(P),left=mhDaysLeft(P);

  const pfHero=S.s.name?`<div class="pf-hero">
    <span class="pf-av pf-av-lg" aria-hidden="true">${esc(pfInitials(S.s.name))}</span>
    <div class="pf-hero-t">
      <strong>${esc(L(pfGreetKey()))}, ${esc(S.s.name)}</strong>
      <small>${esc(S.s.inst)}${S.s.mh&&MH_CLASSES[S.s.mh]?` · ${esc(MH_CLASSES[S.s.mh].short[S.s.lang]||MH_CLASSES[S.s.mh].short.id)}`:''}</small>
    </div>
    <button type="button" class="pf-hero-ed" onclick="openProfile()" title="${esc(L('pfEdit'))}" aria-label="${esc(L('pfEdit'))}">${IC.edit}</button>
  </div>`:'';

  return`<div class="view-stack">
    ${pfHero}
    ${mhBar('pv')}
    <div class="g3">
      <div class="card">
        <div>
          <div class="rw"><span class="k">${L('netWorth')}</span><span class="pill neu">${L('adjNetWorth')}: ${short(adjNw)}</span></div>
          <div class="v">${fmt(w+iv)}</div>
        </div>
        <div class="metric-stack">
          ${row(L('wallets'),fmt(w),w/nw*100,'var(--acc)')}
          ${row(L('investments'),fmt(iv),iv/nw*100,'var(--pos)')}
        </div>
      </div>
      <div class="card">
        <div>
          <div class="rw">
            <div>
              <span class="k" style="color:var(--ink);font-weight:800;font-size:13px">${esc(fmtP(P))}</span>
              <div class="mh-k-sub">${esc(mhRangeTxt(P,true))}</div>
            </div>
            <span class="pill ${inc>=ex?'pos':'neg'}">${inc>=ex?'+':''}${inc>0?Math.round((inc-ex)/inc*100):0}% net</span>
          </div>
          <div class="v ${inc-ex<0?'neg':''}">${fmt(inc-ex)}</div>
        </div>
        <div class="metric-stack">
          ${row(L('income'),fmt(inc),inc/mx*100,'var(--pos)')}
          ${row(L('expense'),fmt(ex),ex/mx*100,'var(--acc)')}
        </div>
      </div>
      <div class="card">
        <div class="hd" style="margin-bottom:10px">
          <div class="hd-title">
            <h3>${L('budgetStatus')}</h3>
            <span class="mh-k-sub">${esc(fmtP(P))}: ${esc(mhRangeTxt(P,false))}</span>
          </div>
          <button class="btn g s" onclick="go('bud')">${L('manage')}</button>
        </div>
        <div class="metric-stack" style="margin-top:0">
          ${totB?`<div class="metric-item"><div class="rw" style="font-size:12px"><span class="mute">${L('spentOf',fmt(totS),fmt(totB))}</span><span class="pill neu">${L('daysLeft',left)}</span></div><div class="bar"><i style="width:${Math.min(100,totS/totB*100)}%;background:${totS>totB?'var(--neg)':'var(--acc)'}"></i></div></div>`:''}
          ${bg.length?bg.map(([c,p])=>row(esc(c),Math.round(p*100)+'%',p*100,p>1?'var(--neg)':p>.8?'var(--warn)':'var(--pos)')).join(''):`<p class="mute" style="margin:auto 0">${L('noBudget')}</p>`}
        </div>
      </div>
    </div>

    ${mhCalendarCard(P)}
    ${mhSalaryCard()}

    <div class="card">
      <div class="hd">
        <div class="hd-title">
          <h3>${L('riskResp')}</h3>
          <span class="k">${L('debtRiskRatio')}: <b>${riskPct.toFixed(1)}%</b> · <span class="pill ${riskStatus[0]}">${riskStatus[1]}</span> ${urgCnt?`· <span class="tag urg">${L('urgentCount',urgCnt)}</span>`:''} ${ovdCnt?`· <span class="tag urg">${L('overdueCount',ovdCnt)}</span>`:''}</span>
        </div>
        <div class="act risk-acts" style="margin:0">
          <button type="button" class="btn g s btn-add-compact" onclick="addDebt('piutang')" title="${esc(L('recLbl'))}"><span class="btn-lbl">+ ${esc(L('recLbl'))}</span><span class="btn-plus" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span></button>
          <button type="button" class="btn g s btn-add-compact" onclick="addDebt('utang')" title="${esc(L('loanLbl'))}"><span class="btn-lbl">+ ${esc(L('loanLbl'))}</span><span class="btn-plus" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span></button>
          <button class="btn s mob-desk-only" onclick="go('debt')">${esc(L('manage'))}</button>
        </div>
      </div>
      <div class="g3">
        <div class="rep-kpi">
          <div class="rw"><span class="k">${L('totUtang')}</span><span class="tag pinjol">${activeUtang().length} active</span></div>
          <div class="v neg">${fmt(uTot)}</div>
          <div class="rw" style="font-size:11.5px;gap:6px">
            ${byU.map(([c,v])=>`<span class="tag ${c.toLowerCase()}">${c}: ${short(v)}</span>`).join('')}
          </div>
        </div>
        <div class="rep-kpi">
          <div class="rw"><span class="k">${L('totPiutang')}</span><span class="tag ok">${activePiutang().length} active</span></div>
          <div class="v inc">${fmt(pTot)}</div>
          <div class="k">${L('adjNetWorth')}: <b>${fmt(adjNw)}</b></div>
        </div>
        <div class="rep-kpi">
          <div class="rw"><span class="k">${L('debtRiskRatio')}</span><b>${riskPct.toFixed(1)}%</b></div>
          <div class="bar" style="margin:10px 0"><i style="width:${Math.min(100,riskPct)}%;background:var(--${riskStatus[0]})"></i></div>
          <div class="rw" style="font-size:12px"><span class="mute">${L('loanLbl')} vs Liquid Wallets</span><span class="pill ${riskStatus[0]}">${riskStatus[1]}</span></div>
        </div>
      </div>
    </div>

    <div class="g3">
      <div class="card s2"><div class="hd"><h3>${L('cashFlow6m')}</h3><span class="k"><b class="inc">■</b> ${L('income')} &nbsp;&nbsp;<b style="color:var(--acc)">■</b> ${L('expense')}</span></div>${flow()}</div>
      <div class="card"><div class="hd"><div class="hd-title"><h3>${L('spendByCat')}</h3><span class="mh-k-sub">${esc(fmtP(P))}: ${esc(mhRangeTxt(P,false))}</span></div></div>${donut(cats,L('spent'))}</div>
    </div>

    <div class="g3">
      <div class="card s2">
        <div class="hd">
          <h3>${L('recentTx')}</h3>
          <div class="act tx-acts" style="margin:0">
            <button class="btn g s" onclick="go('rep')">${L('repBtn')}</button>
            <button class="btn g s" onclick="go('tx')">${L('viewAll')}</button>
            <button class="btn s" onclick="addTx()">+ ${L('addEntry')}</button>
          </div>
        </div>
        <div class="tbl-w tx-tbl-w">
          <table class="tx-tbl">
            <thead><tr><th>${L('date')}</th><th>${L('desc')}</th><th>${L('cat')}</th><th>${L('wallet')}</th><th class="n">${L('amount')}</th></tr></thead>
            <tbody>${txList(S.tx.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6),0,L('noEntries'))}</tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="hd"><h3>${L('wallets')}</h3><button class="btn g s" onclick="go('wal')">${L('manage')}</button></div>
        <div class="wal-list">
          ${S.wallets.map(x=>`<div class="wal-item"><div><b>${esc(x.name)}</b> <span class="tag" style="margin-left:4px">${x.type}</span></div><b class="n">${fmt(bal(x))}</b></div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
},

tx(){return`<div class="view-stack"><div class="card">
  <div class="hd" style="margin-bottom:14px">
    <div class="hd-title">
      <h3>${I18N[S.s.lang].nav.tx}</h3>
      <span class="k" id="ts"></span>
    </div>
    <div class="flt-act">
      <button class="btn g" onclick="REP_P=F.m||pv();go('rep')">${L('exportRep')}</button>
      <button class="btn" onclick="addTx()">+ ${L('addEntry')}</button>
    </div>
  </div>
  <div class="flt-bar">
    <div class="flt-group">
      <button type="button" class="dp-trig" data-val="${esc(F.m)}" data-empty="${esc(L('allDates'))}" onclick="openDP(this,{allowEmpty:true,defMode:'period',label:'${esc(L('dpTargetPeriod'))}',val:F.m,onSelect:v=>{F.m=v;tbl()}})">
        ${calIcon}<span class="dp-txt" id="flt-dp-txt">${esc(mhNum(F.m)?`${mhName(F.m)} (${mhRangeTxt(F.m,false)})`:fmtP(F.m,L('allDates')))}</span>
        ${F.m?`<span class="dp-clr" title="Clear" onclick="event.stopPropagation();F.m='';render()">✕</span>`:''}
      </button>
      <select onchange="F.t=this.value;tbl()">${opt([['',L('allTypes')],['exp',L('expense')],['inc',L('income')],['tr',L('transfer')]],F.t)}</select>
      <select onchange="F.w=this.value;tbl()">${opt([['',L('allWallets')],...wopts()],F.w)}</select>
      <input type="search" placeholder="${esc(L('search'))}" value="${esc(F.q)}" oninput="F.q=this.value;tbl()">
    </div>
  </div>
  <div class="tbl-w tx-tbl-w">
    <table class="tx-tbl">
      <thead><tr><th>${L('date')}</th><th>${L('desc')}</th><th>${L('cat')}</th><th>${L('wallet')}</th><th class="n">${L('amount')}</th><th></th></tr></thead>
      <tbody id="tb"></tbody>
    </table>
  </div>
</div></div>`},

debt(){
  const w=S.wallets.reduce((a,x)=>a+bal(x),0),iv=S.inv.reduce((a,i)=>a+invVal(i),0);
  const uTot=totUtangVal(),pTot=totPiutangVal(),adjNw=(w+iv)-uTot+pTot;
  const riskPct=w>0?(uTot/w*100):(uTot>0?100:0);
  const riskStatus=riskPct>50?['neg',L('highRisk')]:riskPct>25?['warn',L('modRisk')]:['pos',L('lowRisk')];
  const utangs=S.debts.filter(d=>d.kind==='utang').sort((a,b)=>(a.paid-b.paid)||(b.urgent-a.urgent)||(a.due||'').localeCompare(b.due||''));
  const piutangs=S.debts.filter(d=>d.kind==='piutang').sort((a,b)=>(a.paid-b.paid)||(b.urgent-a.urgent)||(a.due||'').localeCompare(b.due||''));
  const byCat=['Paylater','Credit','Pinjol'].map(c=>[c,activeUtang().filter(d=>d.cat===c).reduce((a,d)=>a+debtOblig(d),0)]);

  return`<div class="view-stack">
    <div class="g4">
      <div class="card">
        <div class="k">${L('totUtang')}</div>
        <div class="v neg">${fmt(uTot)}</div>
        <div class="rw" style="font-size:11.5px;gap:5px">
          ${byCat.map(([c,v])=>`<span class="tag ${c.toLowerCase()}">${c}: ${short(v)}</span>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="k">${L('totPiutang')}</div>
        <div class="v inc">${fmt(pTot)}</div>
        <div class="k">${activePiutang().length} active receivables</div>
      </div>
      <div class="card">
        <div class="k">${L('debtRiskRatio')}</div>
        <div class="v">${riskPct.toFixed(1)}%</div>
        <div><span class="pill ${riskStatus[0]}">${riskStatus[1]}</span></div>
      </div>
      <div class="card">
        <div class="k">${L('adjNetWorth')}</div>
        <div class="v acc">${fmt(adjNw)}</div>
        <div class="k">Assets ${short(w+iv)} − ${L('loanLbl')} + ${L('recLbl')}</div>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <div class="hd-title" style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%">
            <h3>${L('utangList')}</h3>
            <button type="button" class="btn btn-add-compact" onclick="addDebt('utang')" title="${esc(L('addUtang'))}" aria-label="${esc(L('addUtang'))}"><span class="btn-lbl">+ ${esc(L('addUtang'))}</span><span class="btn-plus" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span></button>
          </div>
          <span class="k">Categorized strictly as [Paylater], [Credit], [Pinjol] with mandatory Service Provider / Description</span>
        </div>
      </div>
      <div class="tbl-w">
        <table class="rt">
          <thead><tr><th>${L('cat')}</th><th>${L('providerDesc')}</th><th class="n">${L('principal')}</th><th class="n">${L('interestPct')}</th><th class="n">${L('totalOblig')}</th><th>${L('jatuhTempo')}</th><th>${L('urgency')}</th><th></th></tr></thead>
          <tbody>
          ${utangs.length?utangs.map(d=>{
            const tot=debtOblig(d);
            return`<tr style="${d.paid?'opacity:.55':''}">
              <td><span class="tag ${d.cat.toLowerCase()}">[${esc(d.cat)}]</span></td>
              <td><b>${esc(d.desc)}</b></td>
              <td class="n">${fmt(d.amt)}</td>
              <td class="n mute">${(+d.rate||0).toFixed(2)}%</td>
              <td class="n neg">${fmt(tot)}</td>
              <td>${dueBadge(d)}</td>
              <td>
                <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer">
                  <input type="checkbox" ${d.urgent?'checked':''} onchange="toggleDebtUrgent('${d.id}')">
                  <span class="tag ${d.urgent?'urg':'non-urg'}">${d.urgent?L('urgent'):L('nonUrgent')}</span>
                </label>
              </td>
              <td class="n">
                <div class="row-act">
                  <button class="btn g s" onclick="settleDebt('${d.id}')">${d.paid?L('settled'):L('settle')}</button>
                  ${iconBtns(`editDebt('${d.id}')`,`delDebt('${d.id}')`)}
                </div>
              </td>
            </tr>`;
          }).join(''):`<tr><td colspan="8" class="mute">${L('noUtang')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="hd">
        <div class="hd-title" style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%">
            <h3>${L('piutangList')}</h3>
            <button type="button" class="btn btn-add-compact" onclick="addDebt('piutang')" title="${esc(L('addPiutang'))}" aria-label="${esc(L('addPiutang'))}"><span class="btn-lbl">+ ${esc(L('addPiutang'))}</span><span class="btn-plus" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span></button>
          </div>
          <span class="k">Receivables owed to you with due date, interest &amp; urgency tracking</span>
        </div>
      </div>
      <div class="tbl-w">
        <table class="rt">
          <thead><tr><th>${L('borrowerDesc')}</th><th class="n">${L('principal')}</th><th class="n">${L('interestPct')}</th><th class="n">${L('totalOblig')}</th><th>${L('jatuhTempo')}</th><th>${L('urgency')}</th><th></th></tr></thead>
          <tbody>
          ${piutangs.length?piutangs.map(d=>{
            const tot=debtOblig(d);
            return`<tr style="${d.paid?'opacity:.55':''}">
              <td><b>${esc(d.desc)}</b></td>
              <td class="n">${fmt(d.amt)}</td>
              <td class="n mute">${(+d.rate||0).toFixed(2)}%</td>
              <td class="n inc">${fmt(tot)}</td>
              <td>${dueBadge(d)}</td>
              <td>
                <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer">
                  <input type="checkbox" ${d.urgent?'checked':''} onchange="toggleDebtUrgent('${d.id}')">
                  <span class="tag ${d.urgent?'urg':'non-urg'}">${d.urgent?L('urgent'):L('nonUrgent')}</span>
                </label>
              </td>
              <td class="n">
                <div class="row-act">
                  <button class="btn g s" onclick="settleDebt('${d.id}')">${d.paid?L('settled'):L('settle')}</button>
                  ${iconBtns(`editDebt('${d.id}')`,`delDebt('${d.id}')`)}
                </div>
              </td>
            </tr>`;
          }).join(''):`<tr><td colspan="7" class="mute">${L('noPiutang')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
},

bud(){
  const P=pv(),n=tb(),s=tsp(P),left=mhDaysLeft(P);
  return`<div class="view-stack">
  ${mhBar('pv')}
  <div class="g3">
    <div class="card">
      <div><div class="k">${L('totBudget')}</div><div class="mh-k-sub">${esc(L('mhBudPerP'))}</div></div>
      <div class="v" style="margin-bottom:0">${fmt(n)}</div>
    </div>
    <div class="card">
      <div><div class="k" style="color:var(--ink);font-weight:800">${esc(L('spentInP',fmtP(P)))}</div><div class="mh-k-sub">${esc(mhRangeTxt(P,true))}</div></div>
      <div class="v" style="margin-bottom:0">${fmt(s)}</div>
    </div>
    <div class="card">
      <div><div class="k">${L('remaining')}</div><div class="mh-k-sub">${esc(L('daysLeft',left))}</div></div>
      <div class="v ${n-s<0?'neg':'inc'}" style="margin-bottom:0">${fmt(n-s)}</div>
    </div>
  </div>
  <div class="card">
    <div class="hd">
      <div class="hd-title">
        <h3>${L('monthLimits')} — ${esc(fmtP(P))}</h3>
        <span class="mh-k-sub">${esc(mhRangeTxt(P,true))}</span>
      </div>
      <button class="btn" onclick="addCat()">+ ${L('addCat')}</button>
    </div>
    <div class="tbl-w">
      <table class="rt">
        <thead><tr><th>${L('cat')}</th><th>${L('monthLimit')}</th><th class="n">${L('spent')} (${esc(fmtP(P))})</th><th style="width:24%">${L('progress')}</th><th class="n">${L('left')}</th><th></th></tr></thead>
        <tbody>${S.cats.exp.map(c=>{const b=+S.budgets[c]||0,sp=spent(c,P),p=b?sp/b:0;return`<tr><td><b>${esc(c)}</b></td><td><input class="bar-in" type="text" inputmode="numeric" pattern="[0-9.]*" autocomplete="off" value="${b?fmtMoneyInp(b):''}" placeholder="${esc(L('noLimit'))}" oninput="snapMoneyInput(this)" onkeydown="snapMoneyKey(event,this)" onchange="setB('${esc(c)}',this.value)"></td><td class="n">${fmt(sp)}</td><td><div class="bar" style="margin:0"><i style="width:${Math.min(100,p*100)}%;background:${p>1?'var(--neg)':p>.8?'var(--warn)':'var(--acc)'}"></i></div></td><td class="n ${b&&b-sp<0?'neg':''}">${b?fmt(b-sp):'—'}</td><td class="n"><div class="row-act">${iconBtns(`editCat('exp','${esc(c)}')`,`delCat('exp','${esc(c)}')`)}</div></td></tr>`}).join('')}</tbody>
      </table>
    </div>
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span class="k" style="margin-right:4px">${L('incCats')}:</span>
      ${S.cats.inc.map(c=>`<span class="tag cat-chip">${esc(c)}${iconBtns(`editCat('inc','${esc(c)}')`,`delCat('inc','${esc(c)}')`,'mini')}</span>`).join('')}
    </div>
  </div>
</div>`},

wal(){const g=['Bank','E-Wallet','Cash'];return`<div class="view-stack">
  <div class="g3">${g.map(t=>`<div class="card"><div class="k">${t}</div><div class="v" style="margin-bottom:0">${fmt(S.wallets.filter(w=>w.type===t).reduce((a,w)=>a+bal(w),0))}</div></div>`).join('')}</div>
  <div class="card">
    <div class="hd"><h3>${L('yourWallets')}</h3><div class="act" style="margin:0"><button class="btn g" onclick="addTx('tr')">${L('transfer')}</button><button class="btn" onclick="addWallet()">+ ${L('addWallet')}</button></div></div>
    <div class="tbl-w">
      <table class="rt">
        <thead><tr><th>Name</th><th>Type</th><th class="n">${L('openBal')}</th><th class="n">${L('curBal')}</th><th></th></tr></thead>
        <tbody>${S.wallets.map(w=>`<tr><td><b>${esc(w.name)}</b></td><td><span class="tag">${w.type}</span></td><td class="n mute">${fmt(w.init)}</td><td class="n">${fmt(bal(w))}</td><td class="n"><div class="row-act">${iconBtns(`editWallet('${w.id}')`,`delWallet('${w.id}')`)}</div></td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
</div>`},

inv(){const v=S.inv.reduce((a,i)=>a+invVal(i),0),c=S.inv.reduce((a,i)=>a+i.p,0),by={};S.inv.forEach(i=>by[i.kind]=(by[i.kind]||0)+invVal(i));
return`<div class="view-stack">
  <div class="g3">
    <div class="card"><div class="k">${L('portVal')}</div><div class="v">${fmt(v)}</div><div class="k">${L('invested')}: <b>${fmt(c)}</b></div></div>
    <div class="card"><div class="k">${L('totGain')}</div><div class="v ${v-c<0?'neg':'inc'}">${v-c>=0?'+':''}${fmt(v-c)}</div><div><span class="pill ${v-c>=0?'pos':'neg'}">${c?((v-c)/c*100).toFixed(2):'0.00'}% ${L('ret')}</span></div></div>
    <div class="card"><div class="hd" style="margin-bottom:8px"><h3>${L('alloc')}</h3></div>${donut(Object.entries(by),'Total')}</div>
  </div>
  <div class="card">
    <div class="hd"><div class="hd-title"><h3>${L('holdings')}</h3><span class="k">${L('depNote')}</span></div><button class="btn" onclick="addInv()">+ ${L('addInv')}</button></div>
    <div class="tbl-w">
      <table class="rt">
        <thead><tr><th>Name</th><th>${L('details')}</th><th class="n">${L('invested')}</th><th class="n">${L('value')}</th><th class="n">${L('gain')}</th><th></th></tr></thead>
        <tbody>${S.inv.map(i=>{const val=invVal(i),g=val-i.p,mat=(()=>{const d=new Date(i.start+'T00:00');d.setMonth(d.getMonth()+(i.tenor||0));return iso(d)})();
        return`<tr><td><b>${esc(i.name)}</b> <span class="tag" style="margin-left:4px">${i.kind}</span>${i.w?`<div class="mute" style="font-size:11.5px;margin-top:3px">${L('wallet')}: ${esc((S.wallets.find(x=>x.id===i.w)||{}).name||'—')}</div>`:''}</td><td class="mute">${i.kind==='Deposito'?`${i.rate}% p.a. · matures ${dt(mat)}`:`${(i.p/i.buy).toFixed(2)} units · NAV ${i.nav}`}</td><td class="n">${fmt(i.p)}</td><td class="n">${fmt(val)}</td><td class="n ${g<0?'neg':'inc'}">${g>=0?'+':''}${fmt(g)} (${(g/i.p*100).toFixed(2)}%)</td><td class="n"><div class="row-act">${i.kind==='Deposito'?'':`<button class="btn g s" onclick="updNav('${i.id}')">${L('updNav')}</button>`}${iconBtns(`editInv('${i.id}')`,`delInv('${i.id}')`)}</div></td></tr>`}).join('')||`<tr><td colspan="6" class="mute">${L('noInv')}</td></tr>`}</tbody>
      </table>
    </div>
  </div>
</div>`},

rep(){
  const R=compileReport(REP_P);
  const cats=R.expRows.filter(x=>x.amt>0).map(x=>[x.cat,x.amt]);
  return`<div class="view-stack">
  ${mhBar('rep')}
  <div class="rep-ctrl-row">
    <div class="rep-scope-toggle">
      ${REP_P?`<button type="button" class="btn g s" onclick="mhSet('rep','')">${esc(L('mhAllProgram'))}</button>`:`<button type="button" class="btn g s" onclick="mhSet('rep',curP())">${esc(L('curMonth'))}</button>`}
    </div>
    <div class="rep-export-group">
      <button type="button" class="btn g s" onclick="exportCSV(REP_P)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>CSV</span>
      </button>
      <button type="button" class="btn g s" onclick="exportXLSX(REP_P)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/></svg>
        <span>Excel</span>
      </button>
      <button type="button" class="btn s" onclick="exportPDF(REP_P)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></svg>
        <span>PDF</span>
      </button>
    </div>
  </div>

  <div class="rep-sheet" id="report-sheet">
    <div class="rep-hdr">
      <div>
        <div class="rep-badge"><i></i>${L('repBadge')}</div>
        <h2 class="rep-title">${esc(L('repTitle',R.label))}</h2>
        <div class="mh-rep-sub">${esc(R.sub)}${R.clsName?` · ${esc(R.clsName)}`:''}</div>
        <div class="k">${L('repSub')}</div>
      </div>
      <div class="rep-meta">
        <div>${L('genOn')} <b>${dt(TODAY)}</b></div>
        <div style="margin-top:4px">${L('cur')}: <b>${curLabel()}</b> · ${L('entries')}: <b>${R.txs.length}</b></div>
      </div>
    </div>

    <div class="g4" style="margin-bottom:20px">
      <div class="rep-kpi">
        <div class="k">${L('totInc')}</div>
        <div class="v inc">${fmt(R.inc)}</div>
        <div>${R.incDiff!==null?`<span class="pill ${R.incDiff>=0?'pos':'neg'}">${R.incDiff>=0?'↑':'↓'} ${Math.abs(R.incDiff).toFixed(1)}% vs ${esc(R.prvLabel)}</span>`:`<span class="pill neu">${R.txs.filter(t=>t.type==='inc').length} ${L('entries')}</span>`}</div>
      </div>
      <div class="rep-kpi">
        <div class="k">${L('totExp')}</div>
        <div class="v">${fmt(R.exp)}</div>
        <div>${R.expDiff!==null?`<span class="pill ${R.expDiff<=0?'pos':'neg'}">${R.expDiff>=0?'↑':'↓'} ${Math.abs(R.expDiff).toFixed(1)}% vs ${esc(R.prvLabel)}</span>`:`<span class="pill neu">${R.txs.filter(t=>t.type==='exp').length} ${L('entries')}</span>`}</div>
      </div>
      <div class="rep-kpi">
        <div class="k">${L('netFlow')}</div>
        <div class="v ${R.net<0?'neg':'acc'}">${R.net>=0?'+':''}${fmt(R.net)}</div>
        <div><span class="pill ${R.savRate>=20?'pos':R.savRate>=0?'neu':'neg'}">${L('savRate')}: ${R.savRate.toFixed(1)}%</span></div>
      </div>
      <div class="rep-kpi">
        <div class="k">${L('adjNetWorth')}</div>
        <div class="v acc">${fmt(R.adjNw)}</div>
        <div><span class="pill neu">${L('loanLbl')} ${short(R.uTot)} · ${L('recLbl')} ${short(R.pTot)}</span></div>
      </div>
    </div>

    <div class="g3">
      <div class="card s2"><div class="hd"><h3>${L('cashFlow6m')}</h3><span class="k"><b class="inc">■</b> ${L('income')} &nbsp;&nbsp;<b style="color:var(--acc)">■</b> ${L('expense')}</span></div>${flow(REP_P)}</div>
      <div class="card"><div class="hd"><h3>${L('spendByCat')}</h3></div>${donut(cats,L('spent'))}</div>
    </div>

    <div class="rep-sec">
      <div class="rep-sec-hd"><h4>${L('riskResp')}</h4><span class="k">${L('debtRiskRatio')}: <b>${R.riskRatio.toFixed(1)}%</b> · ${L('loanLbl')}: <b>${fmt(R.uTot)}</b> · ${L('recLbl')}: <b>${fmt(R.pTot)}</b></span></div>
      <div class="tbl-w">
        <table class="rep-tbl rt">
          <thead><tr><th>Type / Category</th><th>${L('providerDesc')}</th><th class="n">${L('principal')}</th><th class="n">${L('interestPct')}</th><th class="n">${L('totalOblig')}</th><th>${L('jatuhTempo')}</th><th>${L('urgency')}</th></tr></thead>
          <tbody>
          ${S.debts.length?S.debts.map(d=>`<tr>
            <td><span class="tag ${d.kind==='utang'?d.cat.toLowerCase():'ok'}">${d.kind==='utang'?`${L('loanLbl')} [${esc(d.cat)}]`:L('recLbl')}</span></td>
            <td><b>${esc(d.desc)}</b></td>
            <td class="n">${fmt(d.amt)}</td>
            <td class="n mute">${(+d.rate||0).toFixed(2)}%</td>
            <td class="n ${d.kind==='utang'?'neg':'inc'}">${fmt(debtOblig(d))}</td>
            <td>${dueBadge(d)}</td>
            <td><span class="tag ${d.urgent?'urg':'non-urg'}">${d.urgent?L('urgent'):L('nonUrgent')}</span></td>
          </tr>`).join(''):`<tr><td colspan="7" class="mute">${L('noUtang')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <div class="rep-sec">
      <div class="rep-sec-hd"><h4>${L('expBreak')}</h4><span class="k">${R.totBud?`${Math.round(R.totBudSpent/R.totBud*100)}% (${fmt(R.totBudSpent)} / ${fmt(R.totBud)})`:L('noBudget')}</span></div>
      <div class="tbl-w">
        <table class="rep-tbl rt">
          <thead><tr><th>${L('cat')}</th><th class="n">${L('entries')}</th><th class="n">${L('spent')}</th><th class="n">%</th><th class="n">${L('monthLimit')}</th><th style="width:18%">${L('progress')}</th><th class="n">${L('left')}</th></tr></thead>
          <tbody>
          ${R.expRows.length?R.expRows.map(x=>`<tr>
            <td><b>${esc(x.cat)}</b></td>
            <td class="n mute">${x.cnt}</td>
            <td class="n">${fmt(x.amt)}</td>
            <td class="n mute">${x.share.toFixed(1)}%</td>
            <td class="n mute">${x.budget?fmt(x.budget):'—'}</td>
            <td>${x.budget?`<div class="bar" style="margin:0"><i style="width:${Math.min(100,x.util)}%;background:${x.util>100?'var(--neg)':x.util>80?'var(--warn)':'var(--acc)'}"></i></div>`:'<span class="mute">—</span>'}</td>
            <td class="n ${x.budget&&x.rem<0?'neg':'inc'}">${x.budget?(x.rem>=0?fmt(x.rem):'-'+fmt(-x.rem)):'—'}</td>
          </tr>`).join('')+`<tr class="tot"><td>${L('totExp')}</td><td class="n">${R.txs.filter(t=>t.type==='exp').length}</td><td class="n">${fmt(R.exp)}</td><td class="n">100%</td><td class="n">${R.totBud?fmt(R.totBud):'—'}</td><td></td><td class="n">${R.totBud?fmt(R.totBud-R.totBudSpent):'—'}</td></tr>`:`<tr><td colspan="7" class="mute">${L('noEntries')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <div class="g2 rep-sec">
      <div>
        <div class="rep-sec-hd"><h4>${L('incSources')}</h4><span class="k">${R.incRows.length} sources</span></div>
        <div class="tbl-w">
          <table class="rep-tbl rt" style="min-width:340px">
            <thead><tr><th>${L('cat')}</th><th class="n">${L('entries')}</th><th class="n">${L('amount')}</th><th class="n">%</th></tr></thead>
            <tbody>
            ${R.incRows.length?R.incRows.map(x=>`<tr><td><b>${esc(x.cat)}</b></td><td class="n mute">${x.cnt}</td><td class="n inc">+${fmt(x.amt)}</td><td class="n mute">${x.share.toFixed(1)}%</td></tr>`).join('')+`<tr class="tot"><td>${L('totInc')}</td><td class="n">${R.txs.filter(t=>t.type==='inc').length}</td><td class="n inc">+${fmt(R.inc)}</td><td class="n">100%</td></tr>`:`<tr><td colspan="4" class="mute">${L('noEntries')}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div class="rep-sec-hd"><h4>${L('walLiq')}</h4><span class="k">${fmt(R.wTot)}</span></div>
        <div class="tbl-w">
          <table class="rep-tbl rt" style="min-width:340px">
            <thead><tr><th>${L('wallet')}</th><th>Type</th><th class="n">Period Net</th><th class="n">${L('curBal')}</th></tr></thead>
            <tbody>
            ${R.walRows.map(w=>{const nf=w.pIn-w.pOut;return`<tr><td><b>${esc(w.name)}</b></td><td><span class="tag">${w.type}</span></td><td class="n ${nf>0?'inc':nf<0?'neg':'mute'}">${nf>0?'+':''}${fmt(nf)}</td><td class="n">${fmt(w.end)}</td></tr>`}).join('')}
            <tr class="tot"><td colspan="2">Total</td><td class="n">${fmt(R.walRows.reduce((a,w)=>a+w.pIn-w.pOut,0))}</td><td class="n">${fmt(R.wTot)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="rep-sec">
      <div class="rep-sec-hd"><h4>${L('txLedger')} (${R.txs.length})</h4><span class="k">${esc(R.label)} — ${esc(R.sub)}</span></div>
      <div class="tbl-w tx-tbl-w">
        <table class="rep-tbl tx-tbl">
          <thead><tr><th>${L('date')}</th><th>${L('desc')}</th><th>${L('cat')}</th><th>${L('wallet')}</th><th class="n">${L('amount')}</th></tr></thead>
          <tbody>${txList(R.txs,0,L('noEntries'))}</tbody>
        </table>
      </div>
    </div>

    <div class="rep-foot">
      <span>Dicatat! – Maganghub Mode (${esc(R.clsName||'6 Periods')})</span>
      <span>${esc(R.label)}: ${esc(R.sub)} · ${dt(TODAY)}</span>
    </div>
  </div>
  </div>`;
},

set(){
  const navDict=I18N[S.s.lang]?.nav||I18N.en.nav;
  const cls=MH_CLASSES[S.s.mh];
  return`<div class="set-wrap">
    <div class="card set-card pf-set-card">
      <div>
        <div class="pf-set-hd">
          <span class="pf-av pf-av-lg" aria-hidden="true">${esc(S.s.name?pfInitials(S.s.name):'?')}</span>
          <div class="pf-set-txt">
            <h3>${esc(S.s.name||L('pfProfile'))}</h3>
            <p class="mute">${esc(S.s.name?S.s.inst:L('pfProfileSub'))}</p>
          </div>
          <button type="button" class="btn g pf-set-btn" onclick="openProfile()">${esc(S.s.name?L('pfEdit'):L('pfSetup'))}</button>
        </div>
        <p class="pf-priv">
          <svg class="pf-priv-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg>
          <span>${esc(PRIVACY_LINE)}</span>
        </p>
      </div>
    </div>

    <div class="card set-card">
      <div>
        <h3 style="margin-bottom:4px">${L('prefs')}</h3>
        <p class="mute" style="margin:0 0 14px;font-size:12.5px">${L('prefsSub')}</p>
        <div class="set-list">
          <div class="set-item">
            <div class="set-meta">
              <strong>${esc(L('mhSetClass'))}</strong>
              <span>${esc(cls?`${cls.name[S.s.lang]||cls.name.id} · ${mhProgramRange(true)}`:L('mhSetClassDesc'))}</span>
            </div>
            <div class="seg" role="group" aria-label="${esc(L('mhSetClass'))}">
              <button type="button" class="${S.s.mh==='sep'?'on':''}" onclick="MH_SEL='sep';mhChoose()">${esc(MH_CLASSES.sep.name[S.s.lang]||MH_CLASSES.sep.name.id)}</button>
              <button type="button" class="${S.s.mh==='nov'?'on':''}" onclick="MH_SEL='nov';mhChoose()">${esc(MH_CLASSES.nov.name[S.s.lang]||MH_CLASSES.nov.name.id)}</button>
            </div>
          </div>
          <div class="set-item">
            <div class="set-meta">
              <strong>${L('lang')}</strong>
              <span>${L('langDesc')}</span>
            </div>
            <div class="seg" role="group" aria-label="${L('lang')}">
              <button type="button" class="${S.s.lang==='id'?'on':''}" onclick="setLang('id')">Indonesia (ID)</button>
              <button type="button" class="${S.s.lang==='en'?'on':''}" onclick="setLang('en')">English (EN)</button>
            </div>
          </div>
          <div class="set-item">
            <div class="set-meta">
              <strong>${L('cur')}</strong>
              <span>${L('curDesc')}</span>
            </div>
            <div class="seg" role="group" aria-label="${L('cur')}">
              <button type="button" class="${S.s.cur==='IDR'?'on':''}" onclick="setS('cur','IDR')">IDR (Rp)</button>
              <button type="button" class="${S.s.cur==='USD'?'on':''}" onclick="setS('cur','USD')">USD ($)</button>
            </div>
          </div>
          <div class="set-item">
            <div class="set-meta">
              <strong>${L('theme')}</strong>
              <span>${L('themeDesc')}</span>
            </div>
            <div class="seg" role="group" aria-label="${L('theme')}">
              <button type="button" class="${S.s.theme==='auto'?'on':''}" onclick="setS('theme','auto')">${L('matchSys')}</button>
              <button type="button" class="${S.s.theme==='light'?'on':''}" onclick="setS('theme','light')">${L('light')}</button>
              <button type="button" class="${S.s.theme==='dark'?'on':''}" onclick="setS('theme','dark')">${L('dark')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card set-card">
      <div>
        <h3 style="margin-bottom:4px">${L('yourData')}</h3>
        <p class="mute" style="margin:0 0 12px;font-size:12.5px;line-height:1.45">${L('dataDesc')}</p>
        <div class="data-stats">
          <span class="data-pill"><b>${S.tx.length}</b> ${esc(navDict.tx)}</span>
          <span class="data-pill"><b>${(S.debts||[]).length}</b> ${esc(navDict.debt)}</span>
          <span class="data-pill"><b>${S.wallets.length}</b> ${esc(navDict.wal)}</span>
          <span class="data-pill"><b>${S.inv.length}</b> ${esc(navDict.inv)}</span>
        </div>
        <input type="file" id="data-file-inp" accept=".json,application/json" hidden onchange="handleUploadFile(event)">
        <div class="data-drop" onclick="triggerUpload()" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" ondrop="onDataDrop(event)">
          <div class="data-drop-ic">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div style="font-weight:700;font-size:13px;color:var(--ink)">${L('dropTitle')}</div>
          <div class="mute" style="font-size:11.5px;margin-top:3px">${L('dropSub')}</div>
        </div>
      </div>
      <div>
        <div class="data-actions">
          <button type="button" class="btn" onclick="saveDataFile()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>${L('saveFile')}</span>
          </button>
          <button type="button" class="btn g" onclick="triggerUpload()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>${L('uploadFile')}</span>
          </button>
        </div>
        <div class="data-sub-actions">
          <button type="button" class="btn g" style="color:var(--neg)" onclick="reset()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>${L('eraseAll')}</span>
          </button>
        </div>
      </div>
    </div>
  </div>`}};


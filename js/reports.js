/* Dicatat! - Maganghub Mode: report compiler, XLSX / CSV / PDF exporters */

/* Report Data Compiler */
function compileReport(p){
  const mult=pMult(p),prv=prevP(p);
  const txs=S.tx.filter(t=>matchP(t.date,p)).sort((a,b)=>b.date.localeCompare(a.date));
  const inc=txs.filter(t=>t.type==='inc').reduce((a,t)=>a+t.amt,0);
  const exp=txs.filter(t=>t.type==='exp').reduce((a,t)=>a+t.amt,0);
  const net=inc-exp;
  const savRate=inc>0?((inc-exp)/inc*100):0;
  const prvInc=prv?sum('inc',prv):0,prvExp=prv?sum('exp',prv):0;
  const incDiff=prvInc>0?((inc-prvInc)/prvInc*100):null;
  const expDiff=prvExp>0?((exp-prvExp)/prvExp*100):null;
  const wTot=S.wallets.reduce((a,x)=>a+bal(x),0);
  const ivTot=S.inv.reduce((a,i)=>a+invVal(i),0);
  const ivCost=S.inv.reduce((a,i)=>a+i.p,0);
  const nw=wTot+ivTot;
  const uTot=totUtangVal(),pTot=totPiutangVal();
  const adjNw=nw-uTot+pTot;
  const riskRatio=wTot>0?(uTot/wTot*100):(uTot>0?100:0);

  const allExpCats=Array.from(new Set([...S.cats.exp,...txs.filter(t=>t.type==='exp').map(t=>t.cat)]));
  const expRows=allExpCats.map(c=>{
    const cTxs=txs.filter(t=>t.type==='exp'&&t.cat===c);
    const amt=cTxs.reduce((a,t)=>a+t.amt,0);
    const b=(+S.budgets[c]||0)*mult;
    return{cat:c,cnt:cTxs.length,amt,share:exp>0?(amt/exp*100):0,budget:b,rem:b?b-amt:null,util:b?(amt/b*100):null};
  }).filter(r=>r.amt>0||r.budget>0).sort((a,b)=>b.amt-a.amt||b.budget-a.budget);

  const allIncCats=Array.from(new Set([...S.cats.inc,...txs.filter(t=>t.type==='inc').map(t=>t.cat)]));
  const incRows=allIncCats.map(c=>{
    const cTxs=txs.filter(t=>t.type==='inc'&&t.cat===c);
    const amt=cTxs.reduce((a,t)=>a+t.amt,0);
    return{cat:c,cnt:cTxs.length,amt,share:inc>0?(amt/inc*100):0};
  }).filter(r=>r.amt>0).sort((a,b)=>b.amt-a.amt);

  const walRows=S.wallets.map(w=>{
    const pIn=txs.reduce((a,t)=>t.type==='inc'&&t.w===w.id?a+t.amt:t.type==='tr'&&t.to===w.id?a+t.amt:a,0);
    const pOut=txs.reduce((a,t)=>t.type==='exp'&&t.w===w.id?a+t.amt:t.type==='tr'&&t.w===w.id?a+t.amt:a,0);
    return{...w,pIn,pOut,end:bal(w)};
  });

  const totBud=tb()*mult,totBudSpent=tsp(p);
  const clsName=S.s.mh?(MH_CLASSES[S.s.mh].name[S.s.lang]||MH_CLASSES[S.s.mh].name.id):'';
  return{p,label:fmtP(p,L('mhAllProgram')),sub:mhSub(p,true),clsName,prvLabel:fmtP(prv,''),mult,txs,inc,exp,net,savRate,prvInc,prvExp,incDiff,expDiff,wTot,ivTot,ivCost,nw,uTot,pTot,adjNw,riskRatio,expRows,incRows,walRows,totBud,totBudSpent};
}

/* Native Zero-Dependency Styled .XLSX Workbook Generator */
function exportXLSX(p=REP_P){
  const R=compileReport(p);
  const cs=curSym(),cl=curLabel();
  const numFmt=S.s.cur==='USD'?'$#,##0.00':'#,##0';
  const xmlEsc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const colName=n=>{let s='';while(n>=0){s=String.fromCharCode(65+(n%26))+s;n=Math.floor(n/26)-1}return s};

  function buildSheet(rows,cols,merges=[]){
    const rXml=rows.map((r,ri)=>{
      if(!r||!r.length)return`<row r="${ri+1}" ht="14" customHeight="1"/>`;
      const ht=r._ht||20;
      const cells=r.map((c,ci)=>{
        if(c===null||c===undefined)return'';
        const ref=`${colName(ci)}${ri+1}`;
        const[v,st=6,ty='s']=Array.isArray(c)?c:[c,6,typeof c==='number'?'n':'s'];
        if(ty==='n'&&typeof v==='number'&&!isNaN(v))return`<c r="${ref}" s="${st}"><v>${Math.round(v*10000)/10000}</v></c>`;
        return`<c r="${ref}" s="${st}" t="inlineStr"><is><t>${xmlEsc(v)}</t></is></c>`;
      }).join('');
      return`<row r="${ri+1}" ht="${ht}" customHeight="1">${cells}</row>`;
    }).join('');
    const cXml=cols.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('');
    const mXml=merges.length?`<mergeCells count="${merges.length}">${merges.map(m=>`<mergeCell ref="${m}"/>`).join('')}</mergeCells>`:'';
    return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0" showGridLines="1"/></sheetViews>
<cols>${cXml}</cols>
<sheetData>${rXml}</sheetData>
${mXml}
</worksheet>`;
  }

  const r1=[],m1=[];
  const pushR=(arr,ht=20)=>{arr._ht=ht;r1.push(arr);return r1.length};

  pushR([[`DICATAT! MAGANGHUB – ${R.label.toUpperCase()}`,1],['',1],['',1],['',1],['',1],['',1]],28);
  m1.push('A1:F1');
  pushR([[`${R.sub}${R.clsName?'   |   '+R.clsName:''}   |   Currency: ${cl}   |   Generated: ${dt(TODAY)}   |   Entries: ${R.txs.length}`,2],['',2],['',2],['',2],['',2],['',2]],20);
  m1.push('A2:F2');
  r1.push([]);

  const kpiHdr=pushR([['EXECUTIVE SUMMARY',3],['',3],['',3],['NET WORTH & LOAN / RECEIVABLES RISK',3],['',3],['',3]],22);
  m1.push(`A${kpiHdr}:C${kpiHdr}`,`D${kpiHdr}:F${kpiHdr}`);
  pushR([['Metric',4],[`Amount (${cs})`,5],['Benchmark',4],['Balance Sheet Item',4],[`Value (${cs})`,5],['Ratio / Share',5]],20);
  pushR([[L('totInc'),6],[R.inc,10,'n'],[R.incDiff!==null?`${R.incDiff>=0?'+':''}${R.incDiff.toFixed(1)}%`:'—',7],['Liquid Wallets',6],[R.wTot,8,'n'],[R.nw>0?R.wTot/R.nw:0,12,'n']]);
  pushR([[L('totExp'),6],[R.exp,11,'n'],[R.expDiff!==null?`${R.expDiff>=0?'+':''}${R.expDiff.toFixed(1)}%`:'—',7],[L('totUtang'),6],[R.uTot,11,'n'],[R.riskRatio/100,12,'n']]);
  pushR([[L('netFlow'),13],[R.net,R.net>=0?10:11,'n'],[`Savings: ${R.savRate.toFixed(1)}%`,13],['Adjusted Net Worth',13],[R.adjNw,9,'n'],[1,12,'n']],22);
  r1.push([]);

  const debtHdr=pushR([['LOANS (UTANG) & RECEIVABLES (PIUTANG)',3],['',3],['',3],['',3],['',3],['',3]],22);
  m1.push(`A${debtHdr}:F${debtHdr}`);
  pushR([['Type / Category',4],['Service Provider / Description',4],[`Principal (${cs})`,5],['Interest (%)',5],[`Total w/ Interest (${cs})`,5],['Due Date & Priority',4]],20);
  if(S.debts.length){
    S.debts.forEach(d=>{
      const tot=debtOblig(d);
      pushR([[d.kind==='utang'?`${L('loanLbl')} [${d.cat}]`:L('recLbl'),6],[d.desc,6],[d.amt,8,'n'],[(+d.rate||0)/100,12,'n'],[tot,d.kind==='utang'?11:10,'n'],[`${d.due||'—'} · ${d.urgent?'URGENT':'Non-Urgent'} · ${d.paid?'Settled':'Active'}`,7]]);
    });
  }else{
    pushR([[L('noUtang'),7],['',7],['',7],['',7],['',7],['',7]]);
  }
  r1.push([]);

  const expHdr=pushR([['EXPENSE BREAKDOWN & BUDGET PERFORMANCE',3],['',3],['',3],['',3],['',3],['',3]],22);
  m1.push(`A${expHdr}:F${expHdr}`);
  pushR([['Category',4],['Entries',5],[`Actual Spent (${cs})`,5],['% of Expense',5],[`Period Budget (${cs})`,5],['Remaining / (Over)',5]],20);
  if(R.expRows.length){
    R.expRows.forEach(x=>{
      pushR([[x.cat,6],[x.cnt,6,'n'],[x.amt,8,'n'],[x.share/100,12,'n'],[x.budget||0,8,'n'],[x.budget?x.rem:0,x.budget&&x.rem<0?11:8,'n']]);
    });
  }else{
    pushR([['No expenses in this period',7],['',7],['',7],['',7],['',7],['',7]]);
  }
  pushR([['Total Expenses & Budget',13],[R.txs.filter(t=>t.type==='exp').length,13,'n'],[R.exp,9,'n'],[R.exp>0?1:0,12,'n'],[R.totBud,9,'n'],[R.totBud-R.totBudSpent,(R.totBud-R.totBudSpent)<0?11:9,'n']],22);

  const r2=[],m2=[];
  const pushR2=(arr,ht=20)=>{arr._ht=ht;r2.push(arr);return r2.length};
  pushR2([[`TRANSACTIONS LEDGER – ${R.label.toUpperCase()} (${R.sub})`,1],['',1],['',1],['',1],['',1],['',1]],28);
  m2.push('A1:F1');
  pushR2([['Date',4],['Type',4],['Category',4],['Description',4],['Wallet',4],[`Amount (${cs})`,5]],21);
  if(R.txs.length){
    R.txs.forEach(t=>{
      const w=S.wallets.find(x=>x.id===t.w),to=S.wallets.find(x=>x.id===t.to);
      const tyLbl=t.type==='inc'?'Income':t.type==='exp'?'Expense':'Transfer';
      const wLbl=(w?w.name:'—')+(to?' -> '+to.name:'');
      const signed=t.type==='exp'?-t.amt:t.amt;
      const st=t.type==='inc'?10:t.type==='exp'?11:8;
      pushR2([[t.date,6],[tyLbl,6],[t.type==='tr'?'Transfer':t.cat,6],[t.note||t.cat||'Transfer',6],[wLbl,6],[signed,st,'n']]);
    });
  }else{
    pushR2([['No transactions in this period',7],['',7],['',7],['',7],['',7],[0,8,'n']]);
  }
  pushR2([['Net Period Total',13],['',13],['',13],[`${R.txs.length} transactions`,13],['Net Flow',13],[R.net,9,'n']],22);

  const stylesXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2">
  <numFmt numFmtId="164" formatCode="${numFmt}"/>
  <numFmt numFmtId="165" formatCode="0.0%"/>
</numFmts>
<fonts count="8">
  <font><sz val="10"/><color rgb="FF20242E"/><name val="Calibri"/></font>
  <font><b/><sz val="14"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  <font><sz val="9.5"/><color rgb="FFD9E8F7"/><name val="Calibri"/></font>
  <font><b/><sz val="10.5"/><color rgb="FF0070C9"/><name val="Calibri"/></font>
  <font><b/><sz val="10"/><color rgb="FF20242E"/><name val="Calibri"/></font>
  <font><sz val="10"/><color rgb="FF646D82"/><name val="Calibri"/></font>
  <font><b/><sz val="10"/><color rgb="FF0D9F6E"/><name val="Calibri"/></font>
  <font><b/><sz val="10"/><color rgb="FFE03E3E"/><name val="Calibri"/></font>
</fonts>
<fills count="6">
  <fill><patternFill patternType="none"/></fill>
  <fill><patternFill patternType="gray125"/></fill>
  <fill><patternFill patternType="solid"><fgColor rgb="FF0070C9"/></patternFill></fill>
  <fill><patternFill patternType="solid"><fgColor rgb="FFEBF5FF"/></patternFill></fill>
  <fill><patternFill patternType="solid"><fgColor rgb="FFF4F7FB"/></patternFill></fill>
  <fill><patternFill patternType="solid"><fgColor rgb="FFE1E7F0"/></patternFill></fill>
</fills>
<borders count="3">
  <border><left/><right/><top/><bottom/><diagonal/></border>
  <border>
    <left style="thin"><color rgb="FFE1E7F0"/></left>
    <right style="thin"><color rgb="FFE1E7F0"/></right>
    <top style="thin"><color rgb="FFE1E7F0"/></top>
    <bottom style="thin"><color rgb="FFE1E7F0"/></bottom>
  </border>
  <border>
    <top style="medium"><color rgb="FF0070C9"/></top>
    <bottom style="double"><color rgb="FF0070C9"/></bottom>
  </border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="14">
  <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  <xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
  <xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
  <xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
  <xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
  <xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
  <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
  <xf numFmtId="0" fontId="5" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
  <xf numFmtId="164" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
  <xf numFmtId="164" fontId="4" fillId="5" borderId="2" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
  <xf numFmtId="164" fontId="6" fillId="0" borderId="1" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
  <xf numFmtId="164" fontId="7" fillId="0" borderId="1" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
  <xf numFmtId="165" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
  <xf numFmtId="0" fontId="4" fillId="5" borderId="2" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
</cellXfs>
</styleSheet>`;

  const files=[
    ['[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`],
    ['_rels/.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Executive Report" sheetId="1" r:id="rId1"/><sheet name="Transactions Ledger" sheetId="2" r:id="rId2"/></sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml',stylesXml],
    ['xl/worksheets/sheet1.xml',buildSheet(r1,[26,30,18,24,20,24],m1)],
    ['xl/worksheets/sheet2.xml',buildSheet(r2,[14,12,18,34,24,20],m2)]
  ];

  const enc=new TextEncoder();
  const crcTable=new Uint32Array(256);
  for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);crcTable[n]=c}
  const crc32=buf=>{let c=0xffffffff;for(let i=0;i<buf.length;i++)c=crcTable[(c^buf[i])&0xff]^(c>>>8);return(c^0xffffffff)>>>0};

  const localParts=[],centralParts=[];
  let offset=0;
  files.forEach(([name,content])=>{
    const nb=enc.encode(name),db=enc.encode(content),crc=crc32(db),sz=db.length;
    const lh=new Uint8Array(30+nb.length),lv=new DataView(lh.buffer);
    lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(8,0,true);
    lv.setUint32(14,crc,true);lv.setUint32(18,sz,true);lv.setUint32(22,sz,true);
    lv.setUint16(26,nb.length,true);lh.set(nb,30);
    localParts.push(lh,db);

    const ch=new Uint8Array(46+nb.length),cv=new DataView(ch.buffer);
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);
    cv.setUint32(16,crc,true);cv.setUint32(20,sz,true);cv.setUint32(24,sz,true);
    cv.setUint16(28,nb.length,true);cv.setUint32(42,offset,true);ch.set(nb,46);
    centralParts.push(ch);
    offset+=lh.length+db.length;
  });

  const cSize=centralParts.reduce((a,b)=>a+b.length,0);
  const eocd=new Uint8Array(22),ev=new DataView(eocd.buffer);
  ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);
  ev.setUint32(12,cSize,true);ev.setUint32(16,offset,true);

  const blob=new Blob([...localParts,...centralParts,eocd],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`Dicatat_Maganghub_${p||'All_Periods'}.xlsx`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast('Downloaded Excel report (.xlsx)');
}

function exportCSV(p=REP_P){
  const R=compileReport(p);
  const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
  const lines=[
    ['DICATAT! MAGANGHUB - SECURED FINANCE REPORT',R.label,R.sub,R.clsName],
    ['Generated',TODAY,'Currency',curLabel()],
    [],
    ['EXECUTIVE SUMMARY'],
    ['Total Income',R.inc],
    ['Total Expense',R.exp],
    ['Net Cash Flow',R.net],
    ['Savings Rate (%)',R.savRate.toFixed(2)+'%'],
    ['Total Net Worth',R.nw],
    ['Active Utang (w/ Interest)',R.uTot],
    ['Active Piutang',R.pTot],
    ['Adjusted Net Worth',R.adjNw],
    [],
    ['UTANG & PIUTANG'],
    ['Kind','Category','Provider / Description','Principal','Interest %','Total w/ Interest','Jatuh Tempo','Urgency','Status'],
    ...S.debts.map(d=>[d.kind,d.cat,d.desc,d.amt,d.rate+'%',Math.round(debtOblig(d)),d.due,d.urgent?'Urgent':'Non-Urgent',d.paid?'Settled':'Active']),
    [],
    ['EXPENSE BY CATEGORY & BUDGET'],
    ['Category','Transactions','Spent','Share (%)','Budget Limit','Remaining'],
    ...R.expRows.map(x=>[x.cat,x.cnt,x.amt,x.share.toFixed(1)+'%',x.budget||'',x.budget?x.rem:'']),
    [],
    ['TRANSACTIONS LEDGER'],
    ['Date','Type','Category','Description','Wallet','Amount'],
    ...R.txs.map(t=>{
      const w=S.wallets.find(x=>x.id===t.w),to=S.wallets.find(x=>x.id===t.to);
      return[t.date,t.type==='inc'?'Income':t.type==='exp'?'Expense':'Transfer',t.type==='tr'?'Transfer':t.cat,t.note||t.cat||'Transfer',(w?w.name:'')+(to?' -> '+to.name:''),t.type==='exp'?-t.amt:t.amt];
    })
  ];
  const csv='\uFEFF'+lines.map(r=>r.map(q).join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`Dicatat_Maganghub_${p||'All_Periods'}.csv`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast('Downloaded CSV report (.csv)');
}

/* Native Direct Binary .PDF Generator (Zero External Libraries, Instant Download) */
function exportPDF(p=REP_P){
  const R=compileReport(p);
  const PW=595.28,PH=841.89,M=36,CW=PW-M*2;
  const pages=[];
  let ops=[],y=PH-M;

  const pdfEsc=s=>String(s??'').replace(/[^\x20-\x7E]/g,c=>c==='\u2212'||c==='\u2013'||c==='\u2014'?'-':c==='\u00a0'?' ':'').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
  const rgb=hex=>{const n=parseInt(hex.replace('#',''),16);return`${((n>>16)&255)/255} ${((n>>8)&255)/255} ${(n&255)/255}`};
  const fillRect=(x,yy,w,h,col)=>ops.push(`${rgb(col)} rg ${x.toFixed(2)} ${yy.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  const strokeRect=(x,yy,w,h,col,lw=0.6)=>ops.push(`${lw} w ${rgb(col)} RG ${x.toFixed(2)} ${yy.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
  const line=(x1,y1,x2,y2,col='#e1e7f0',lw=0.6)=>ops.push(`${lw} w ${rgb(col)} RG ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  const txt=(str,x,yy,sz=9.5,bold=false,col='#20242E',align='left')=>{
    const s=String(str??'').replace(/[^\x20-\x7E]/g,c=>c==='\u2212'||c==='\u2013'||c==='\u2014'?'-':c==='\u00a0'?' ':'');
    const w=s.length*sz*(bold?0.54:0.5);
    let tx=x;
    if(align==='right')tx=x-w;
    else if(align==='center')tx=x-w/2;
    ops.push(`BT /${bold?'F2':'F1'} ${sz} Tf ${rgb(col)} rg ${tx.toFixed(2)} ${yy.toFixed(2)} Td (${pdfEsc(s)}) Tj ET`);
  };
  const clip=(s,max=32)=>String(s??'').length>max?String(s).slice(0,max-2)+'..':String(s??'');

  function newPage(){
    if(ops.length)pages.push(ops);
    ops=[];
    y=PH-M;
    fillRect(0,PH-8,PW,8,'#0070C9');
  }
  function checkY(need=40){if(y-need<48)newPage()}

  const drawLogoMark=(lx,cy,s=0.45,fg='#F1F1F1',bg='#0b1018')=>{
    const px=sx=>(lx+(sx-17)*s).toFixed(2),py=sy=>(cy+(50-sy)*s).toFixed(2);
    ops.push([
      'q',
      `${rgb(fg)} rg`,
      `${px(20)} ${py(15)} m`,
      `${px(48)} ${py(15)} l`,
      `${px(67.33)} ${py(15)} ${px(83)} ${py(30.67)} ${px(83)} ${py(50)} c`,
      `${px(83)} ${py(69.33)} ${px(67.33)} ${py(85)} ${px(48)} ${py(85)} c`,
      `${px(20)} ${py(85)} l`,
      `${px(18.34)} ${py(85)} ${px(17)} ${py(83.66)} ${px(17)} ${py(82)} c`,
      `${px(17)} ${py(18)} l`,
      `${px(17)} ${py(16.34)} ${px(18.34)} ${py(15)} ${px(20)} ${py(15)} c`,
      'f',
      `1 J 1 j ${(8*s).toFixed(2)} w ${rgb(bg)} RG`,
      `${px(32)} ${py(51)} m ${px(43)} ${py(62)} l ${px(64)} ${py(39)} l S`,
      'Q'
    ].join(' '));
  };

  fillRect(0,PH-102,PW,102,'#0b1018');
  fillRect(0,PH-105,PW,3,'#0070C9');
  drawLogoMark(M,PH-52,0.46,'#F1F1F1','#0b1018');
  txt(`DICATAT! MAGANGHUB - ${R.label.toUpperCase()}`,M+41,PH-48,13,true,'#F1F1F1');
  txt(`${R.sub}${R.clsName?'  |  '+R.clsName:''}`,M+41,PH-64,9.5,false,'#9aa3b8');
  txt(`Generated: ${dt(TODAY)}`,PW-M,PH-48,9.5,true,'#F1F1F1','right');
  txt(`Currency: ${curLabel()}  |  Entries: ${R.txs.length}`,PW-M,PH-64,9,false,'#9aa3b8','right');

  y=PH-126;

  const kw=(CW-18)/4,kh=58;
  const kpis=[
    [L('totInc'),fmtPlain(R.inc),R.incDiff!==null?`${R.incDiff>=0?'+':''}${R.incDiff.toFixed(1)}% vs prev`:`${R.txs.filter(t=>t.type==='inc').length} entries`,'#0d9f6e'],
    [L('totExp'),fmtPlain(R.exp),R.expDiff!==null?`${R.expDiff>=0?'+':''}${R.expDiff.toFixed(1)}% vs prev`:`${R.txs.filter(t=>t.type==='exp').length} entries`,'#20242E'],
    [L('netFlow'),(R.net>=0?'+':'')+fmtPlain(R.net),`${L('savRate')}: ${R.savRate.toFixed(1)}%`,R.net>=0?'#0070C9':'#e03e3e'],
    [L('adjNetWorth'),fmtPlain(R.adjNw),`${L('loanLbl')}: ${fmtPlain(R.uTot)} (${R.riskRatio.toFixed(0)}% risk)`,'#0070C9']
  ];
  kpis.forEach(([lbl,val,sub,col],i)=>{
    const kx=M+i*(kw+6),ky=y-kh;
    fillRect(kx,ky,kw,kh,'#f4f7fb');
    strokeRect(kx,ky,kw,kh,'#e1e7f0');
    fillRect(kx,ky+kh-3,kw,3,col);
    txt(clip(lbl,24),kx+9,ky+kh-16,8,true,'#646d82');
    txt(clip(val,20),kx+9,ky+kh-34,11.5,true,col);
    txt(clip(sub,26),kx+9,ky+10,7.5,false,'#646d82');
  });
  y-=kh+22;

  function secTitle(title,rightTxt=''){
    checkY(50);
    fillRect(M,y-18,CW,20,'#ebf5ff');
    fillRect(M,y-18,3.5,20,'#0070C9');
    txt(title.toUpperCase(),M+10,y-11,9,true,'#0070C9');
    if(rightTxt)txt(rightTxt,PW-M-8,y-11,8.5,false,'#646d82','right');
    y-=26;
  }

  const urgCnt=S.debts.filter(d=>!d.paid&&d.urgent).length;
  secTitle(L('riskResp'),`${L('loanLbl')}: ${fmtPlain(R.uTot)}  |  ${L('recLbl')}: ${fmtPlain(R.pTot)}  |  Urgent: ${urgCnt}`);
  const dCols=[M+6,M+85,M+250,M+335,M+425,PW-M-6];
  fillRect(M,y-14,CW,16,'#f4f7fb');
  txt('TYPE / CAT',dCols[0],y-9,7.5,true,'#646d82');
  txt('PROVIDER / DESCRIPTION',dCols[1],y-9,7.5,true,'#646d82');
  txt('PRINCIPAL',dCols[2],y-9,7.5,true,'#646d82');
  txt('TOTAL + INT',dCols[3],y-9,7.5,true,'#646d82');
  txt('DUE DATE',dCols[4],y-9,7.5,true,'#646d82');
  txt('PRIORITY',dCols[5],y-9,7.5,true,'#646d82','right');
  y-=18;
  if(S.debts.length){
    S.debts.forEach((d,idx)=>{
      checkY(20);
      if(idx%2===1)fillRect(M,y-13,CW,16,'#fafbfd');
      const tot=debtOblig(d);
      txt(d.kind==='utang'?`${L('loanLbl')} [${d.cat}]`:L('recLbl'),dCols[0],y-8,8,true,d.kind==='utang'?'#e03e3e':'#0d9f6e');
      txt(clip(d.desc,30),dCols[1],y-8,8,false,'#20242E');
      txt(fmtPlain(d.amt),dCols[2],y-8,8,false,'#20242E');
      txt(`${fmtPlain(tot)} (${d.rate||0}%)`,dCols[3],y-8,8,true,'#20242E');
      txt(dt(d.due),dCols[4],y-8,8,false,'#646d82');
      txt(d.paid?'SETTLED':(d.urgent?'URGENT':'Normal'),dCols[5],y-8,7.5,true,d.paid?'#0d9f6e':(d.urgent?'#e03e3e':'#646d82'),'right');
      line(M,y-14,PW-M,y-14,'#edf1f7');
      y-=16;
    });
  }else{
    txt('No Utang or Piutang obligations recorded.',M+8,y-8,8.5,false,'#646d82');
    y-=18;
  }
  y-=10;

  secTitle(L('expBreak'),R.totBud?`Total Budget: ${fmtPlain(R.totBud)}`:'');
  const eCols=[M+6,M+145,M+205,M+295,M+365,PW-M-6];
  fillRect(M,y-14,CW,16,'#f4f7fb');
  txt('CATEGORY',eCols[0],y-9,7.5,true,'#646d82');
  txt('ENTRIES',eCols[1],y-9,7.5,true,'#646d82');
  txt('ACTUAL SPENT',eCols[2],y-9,7.5,true,'#646d82');
  txt('SHARE',eCols[3],y-9,7.5,true,'#646d82');
  txt('BUDGET LIMIT',eCols[4],y-9,7.5,true,'#646d82');
  txt('VARIANCE / STATUS',eCols[5],y-9,7.5,true,'#646d82','right');
  y-=18;
  if(R.expRows.length){
    R.expRows.forEach((x,idx)=>{
      checkY(20);
      if(idx%2===1)fillRect(M,y-13,CW,16,'#fafbfd');
      txt(clip(x.cat,22),eCols[0],y-8,8.5,true,'#20242E');
      txt(String(x.cnt),eCols[1],y-8,8,false,'#646d82');
      txt(fmtPlain(x.amt),eCols[2],y-8,8.5,true,'#20242E');
      txt(x.share.toFixed(1)+'%',eCols[3],y-8,8,false,'#646d82');
      txt(x.budget?fmtPlain(x.budget):'-',eCols[4],y-8,8,false,'#646d82');
      const vTxt=x.budget?(x.rem>=0?fmtPlain(x.rem)+' left':'Over '+fmtPlain(-x.rem)):'-';
      txt(vTxt,eCols[5],y-8,8,true,x.budget&&x.rem<0?'#e03e3e':'#0d9f6e','right');
      line(M,y-14,PW-M,y-14,'#edf1f7');
      y-=16;
    });
  }else{
    txt('No expenses recorded in this period.',M+8,y-8,8.5,false,'#646d82');
    y-=18;
  }
  y-=10;

  secTitle(`${L('walLiq')} & ${L('invSnap')}`,`Liquid: ${fmtPlain(R.wTot)}  |  Investments: ${fmtPlain(R.ivTot)}`);
  fillRect(M,y-14,CW,16,'#f4f7fb');
  txt('ASSET / WALLET NAME',M+6,y-9,7.5,true,'#646d82');
  txt('CLASS / TYPE',M+210,y-9,7.5,true,'#646d82');
  txt('PRINCIPAL / FLOW',M+330,y-9,7.5,true,'#646d82');
  txt('CURRENT VALUE',PW-M-6,y-9,7.5,true,'#646d82','right');
  y-=18;
  R.walRows.forEach(w=>{
    checkY(18);
    const nf=w.pIn-w.pOut;
    txt(clip(w.name,28),M+6,y-8,8.5,true,'#20242E');
    txt('Wallet - '+w.type,M+210,y-8,8,false,'#646d82');
    txt((nf>=0?'+':'')+fmtPlain(nf)+' (period)',M+330,y-8,8,false,nf>=0?'#0d9f6e':'#e03e3e');
    txt(fmtPlain(w.end),PW-M-6,y-8,8.5,true,'#20242E','right');
    line(M,y-14,PW-M,y-14,'#edf1f7');
    y-=16;
  });
  S.inv.forEach(iv=>{
    checkY(18);
    const val=invVal(iv);
    txt(clip(iv.name,28),M+6,y-8,8.5,true,'#20242E');
    txt('Investment - '+iv.kind,M+210,y-8,8,false,'#0070C9');
    txt('Cost: '+fmtPlain(iv.p),M+330,y-8,8,false,'#646d82');
    txt(fmtPlain(val),PW-M-6,y-8,8.5,true,'#0d9f6e','right');
    line(M,y-14,PW-M,y-14,'#edf1f7');
    y-=16;
  });
  y-=10;

  secTitle(`${L('txLedger')} (${R.txs.length})`,`${R.label}: ${R.sub}`);
  const tCols=[M+6,M+82,M+175,M+335,PW-M-6];
  fillRect(M,y-14,CW,16,'#f4f7fb');
  txt('DATE',tCols[0],y-9,7.5,true,'#646d82');
  txt('CATEGORY',tCols[1],y-9,7.5,true,'#646d82');
  txt('DESCRIPTION',tCols[2],y-9,7.5,true,'#646d82');
  txt('WALLET',tCols[3],y-9,7.5,true,'#646d82');
  txt(`AMOUNT (${curSym().toUpperCase()})`,tCols[4],y-9,7.5,true,'#646d82','right');
  y-=18;
  if(R.txs.length){
    R.txs.forEach((t,idx)=>{
      checkY(18);
      if(idx%2===1)fillRect(M,y-13,CW,16,'#fafbfd');
      const w=S.wallets.find(x=>x.id===t.w),to=S.wallets.find(x=>x.id===t.to);
      const sg=t.type==='inc'?'+':t.type==='exp'?'-':'';
      txt(dt(t.date),tCols[0],y-8,8,false,'#646d82');
      txt(clip(t.type==='tr'?'Transfer':t.cat,15),tCols[1],y-8,8,true,'#0070C9');
      txt(clip(t.note||t.cat||'Transfer',28),tCols[2],y-8,8,false,'#20242E');
      txt(clip((w?w.name:'-')+(to?' -> '+to.name:''),18),tCols[3],y-8,8,false,'#646d82');
      txt(sg+fmtPlain(t.amt),tCols[4],y-8,8.5,true,t.type==='inc'?'#0d9f6e':t.type==='exp'?'#20242E':'#646d82','right');
      line(M,y-14,PW-M,y-14,'#edf1f7');
      y-=16;
    });
  }else{
    txt('No transactions recorded in this period.',M+8,y-8,8.5,false,'#646d82');
    y-=18;
  }

  if(ops.length)pages.push(ops);

  const totalPages=pages.length;
  pages.forEach((pOps,idx)=>{
    pOps.push(`0.6 w ${rgb('#e1e7f0')} RG ${M} 32 m ${PW-M} 32 l S`);
    pOps.push(`BT /F1 8 Tf ${rgb('#646d82')} rg ${M} 20 Td (Dicatat! Maganghub   |   ${pdfEsc(R.label)}: ${pdfEsc(R.sub)}) Tj ET`);
    pOps.push(`BT /F2 8 Tf ${rgb('#0070C9')} rg ${(PW-M-55).toFixed(2)} 20 Td (Page ${idx+1} of ${totalPages}) Tj ET`);
  });

  const objs=[];
  const addObj=body=>{objs.push(body);return objs.length};
  const font1Id=addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const font2Id=addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const pagesId=addObj('');
  const pageIds=[];

  pages.forEach(pOps=>{
    const stream=pOps.join('\n');
    const cId=addObj(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pId=addObj(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PW.toFixed(2)} ${PH.toFixed(2)}] /Resources << /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R >> >> /Contents ${cId} 0 R >>`);
    pageIds.push(pId);
  });

  objs[pagesId-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  const catId=addObj(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf='%PDF-1.4\n';
  const offsets=[0];
  objs.forEach((body,i)=>{
    offsets.push(pdf.length);
    pdf+=`${i+1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefPos=pdf.length;
  pdf+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;
  for(let i=1;i<=objs.length;i++){
    pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
  }
  pdf+=`trailer\n<< /Size ${objs.length+1} /Root ${catId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const blob=new Blob([pdf],{type:'application/pdf'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`Dicatat_Maganghub_${p||'All_Periods'}.pdf`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast('Downloaded PDF report (.pdf)');
}

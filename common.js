/* shared: theme, reveal, count-up, progress, scrollspy, mobile menu, back-to-top */
(function(){
  var root=document.documentElement, btn=document.getElementById('themeToggle');
  var saved=null; try{saved=localStorage.getItem('theme')}catch(e){}
  if(saved) root.setAttribute('data-theme',saved);
  function setIcon(){ if(!btn)return; var d=root.getAttribute('data-theme');
    var dark = d==='dark' || (!d && matchMedia('(prefers-color-scheme: dark)').matches);
    btn.textContent = dark ? '☀' : '☾'; }
  setIcon();
  if(btn) btn.addEventListener('click',function(){
    var cur=root.getAttribute('data-theme');
    var next = cur==='dark' ? 'light' : (cur==='light' ? 'dark' :
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'light':'dark'));
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('theme',next)}catch(e){}
    setIcon();
    if(window.__redraw) window.__redraw();
  });
})();

/* reveal on scroll */
(function(){
  var els=[].slice.call(document.querySelectorAll('.reveal'));
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}})},{threshold:.12});
  els.forEach(function(e){io.observe(e)});
  window.addEventListener('load',function(){setTimeout(function(){els.forEach(function(e){e.classList.add('in')});},1800);});
})();

/* count-up */
(function(){
  var done=new WeakSet();
  function run(el){
    if(done.has(el))return; done.add(el);
    var target=+el.getAttribute('data-count'), pre=el.getAttribute('data-prefix')||'', suf=el.getAttribute('data-suffix')||'', t0=null, dur=1300;
    function tick(ts){if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1), e=1-Math.pow(1-p,3);
      el.textContent=pre+Math.round(target*e).toLocaleString('en-US')+suf; if(p<1)requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
  }
  if(!('IntersectionObserver' in window)){[].slice.call(document.querySelectorAll('[data-count]')).forEach(run);return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting)run(x.target)})},{threshold:.4});
  [].slice.call(document.querySelectorAll('[data-count]')).forEach(function(e){io.observe(e)});
})();

/* scroll progress bar */
(function(){
  var bar=document.getElementById('progress'); if(!bar)return;
  function upd(){var h=document.documentElement, max=h.scrollHeight-h.clientHeight;
    bar.style.width=(max>0?(h.scrollTop/max*100):0)+'%';}
  addEventListener('scroll',upd,{passive:true}); addEventListener('resize',upd); upd();
})();

/* scrollspy: highlight active nav link */
(function(){
  var links=[].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if(!links.length||!('IntersectionObserver' in window))return;
  var map={}; links.forEach(function(a){var id=a.getAttribute('href').slice(1); if(id)map[id]=a;});
  var io=new IntersectionObserver(function(en){en.forEach(function(x){
    if(x.isIntersecting){links.forEach(function(a){a.classList.remove('active')}); if(map[x.target.id])map[x.target.id].classList.add('active');}
  })},{rootMargin:'-45% 0px -50% 0px'});
  Object.keys(map).forEach(function(id){var s=document.getElementById(id); if(s)io.observe(s);});
})();

/* mobile menu */
(function(){
  var mb=document.getElementById('menuBtn'), nl=document.querySelector('.nav-links'); if(!mb||!nl)return;
  mb.addEventListener('click',function(){nl.classList.toggle('open');});
  nl.addEventListener('click',function(e){if(e.target.tagName==='A')nl.classList.remove('open');});
})();

/* back to top */
(function(){
  var b=document.getElementById('toTop'); if(!b)return;
  addEventListener('scroll',function(){b.classList.toggle('show',scrollY>500);},{passive:true});
  b.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'});});
})();

/* premium interactions: cursor spotlight + 3D tilt + magnetic buttons */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(reduce || !fine) return;
  // spotlight + tilt on cards
  [].slice.call(document.querySelectorAll('.gcard,.proj,.skill-card,.credcard,.contact-card')).forEach(function(card){
    card.classList.add('spot','tilt');
    var flat = card.classList.contains('contact-card'); // glow but no tilt on big banner
    card.addEventListener('mousemove',function(e){
      var r=card.getBoundingClientRect();
      var px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
      card.style.setProperty('--mx',(px*100).toFixed(1)+'%');
      card.style.setProperty('--my',(py*100).toFixed(1)+'%');
      if(!flat){var rx=(0.5-py)*6, ry=(px-0.5)*6;
        card.style.transform='perspective(950px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) translateY(-5px)';}
    });
    card.addEventListener('mouseleave',function(){card.style.transform='';});
  });
  // magnetic primary buttons
  [].slice.call(document.querySelectorAll('.btn.primary')).forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();
      var x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
      b.style.transform='translate('+(x*0.22).toFixed(1)+'px,'+(y*0.32).toFixed(1)+'px)';});
    b.addEventListener('mouseleave',function(){b.style.transform='';});
  });
})();

/* interactive constellation background in hero */
(function(){
  var cv=document.getElementById('fx'); if(!cv) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx=cv.getContext('2d'), DPR=Math.min(window.devicePixelRatio||1,2);
  var hero=cv.parentElement, W=0,H=0,pts=[],mouse={x:-999,y:-999}, raf=null, running=false, col=[37,111,237];
  function accentRGB(){var c=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().replace('#','');
    if(c.length===3)c=c.split('').map(function(x){return x+x}).join(''); var n=parseInt(c,16);
    return isNaN(n)?[37,111,237]:[(n>>16)&255,(n>>8)&255,n&255];}
  function resize(){var r=hero.getBoundingClientRect(); W=r.width; H=r.height; cv.width=W*DPR; cv.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
    var n=Math.max(24,Math.min(64,Math.floor(W*H/17000))); pts=[];
    for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.32,vy:(Math.random()-.5)*.32});}
  function frame(){
    ctx.clearRect(0,0,W,H); col=accentRGB();
    var i,a,b;
    for(i=0;i<pts.length;i++){var p=pts[i]; p.x+=p.vx; p.y+=p.vy;
      if(p.x<0){p.x=0;p.vx*=-1} if(p.x>W){p.x=W;p.vx*=-1} if(p.y<0){p.y=0;p.vy*=-1} if(p.y>H){p.y=H;p.vy*=-1}
      var mdx=mouse.x-p.x, mdy=mouse.y-p.y, md=Math.hypot(mdx,mdy);
      if(md<130&&md>0){var f=(130-md)/130*0.7; p.x+=mdx/md*f; p.y+=mdy/md*f;}
      ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,6.283); ctx.fillStyle='rgba('+col[0]+','+col[1]+','+col[2]+',.55)'; ctx.fill();}
    for(a=0;a<pts.length;a++)for(b=a+1;b<pts.length;b++){var dx=pts[a].x-pts[b].x,dy=pts[a].y-pts[b].y,d=dx*dx+dy*dy;
      if(d<13500){var o=(1-d/13500)*0.32; ctx.strokeStyle='rgba('+col[0]+','+col[1]+','+col[2]+','+o+')'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(pts[a].x,pts[a].y); ctx.lineTo(pts[b].x,pts[b].y); ctx.stroke();}}
    for(i=0;i<pts.length;i++){var qx=mouse.x-pts[i].x,qy=mouse.y-pts[i].y,q=qx*qx+qy*qy;
      if(q<22000){var o2=(1-q/22000)*0.55; ctx.strokeStyle='rgba('+col[0]+','+col[1]+','+col[2]+','+o2+')'; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(mouse.x,mouse.y); ctx.lineTo(pts[i].x,pts[i].y); ctx.stroke();}}
    raf=requestAnimationFrame(frame);
  }
  function start(){if(!running){running=true; frame();}} function stop(){running=false; if(raf)cancelAnimationFrame(raf);}
  hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top;});
  hero.addEventListener('mouseleave',function(){mouse.x=-999; mouse.y=-999;});
  window.addEventListener('resize',resize);
  if('IntersectionObserver' in window){ new IntersectionObserver(function(en){en.forEach(function(x){x.isIntersecting?start():stop();});},{threshold:0}).observe(hero); }
  resize(); start();
})();

/* interactive SQL showcase: question -> query */
(function(){
  var tabs=document.getElementById('sqlTabs'); if(!tabs) return;
  var codeEl=document.getElementById('sqlCode'), noteEl=document.getElementById('sqlNote'),
      fnameEl=document.querySelector('.sql-bar .fname'), copyBtn=document.getElementById('sqlCopy');
  var SQLS=[
    {file:'top_product_per_market.sql', note:'A window function ranks product types within each market.',
     code:"SELECT s.market,\n       p.product_type,\n       SUM(f.sales) AS total_sales,\n       RANK() OVER (PARTITION BY s.market\n                    ORDER BY SUM(f.sales) DESC) AS rnk\nFROM   fact_sales f\nJOIN   product_dim p ON f.product_id = p.product_id\nJOIN   store_dim   s ON f.area_code  = s.area_code\nGROUP BY s.market, p.product_type;"},
    {file:'loss_making_products.sql', note:'HAVING keeps only products with negative total profit.',
     code:"SELECT p.product_description,\n       SUM(f.profit) AS total_profit\nFROM   fact_sales f\nJOIN   product_dim p ON f.product_id = p.product_id\nGROUP BY p.product_description\nHAVING SUM(f.profit) < 0\nORDER BY total_profit ASC;"},
    {file:'market_share.sql', note:'A subquery computes how each market contributes to company-wide sales.',
     code:"SELECT s.market,\n       SUM(f.sales) AS market_sales,\n       ROUND(SUM(f.sales) * 100.0\n             / (SELECT SUM(sales) FROM fact_sales), 1) AS pct_of_total\nFROM   fact_sales f\nJOIN   store_dim s ON f.area_code = s.area_code\nGROUP BY s.market\nORDER BY market_sales DESC;"},
    {file:'margin_bands.sql', note:'A CASE expression buckets each product type by profit margin.',
     code:"SELECT p.product_type,\n       ROUND(SUM(f.profit) * 100.0\n             / NULLIF(SUM(f.sales), 0), 1) AS margin_pct,\n       CASE WHEN SUM(f.profit) / NULLIF(SUM(f.sales),0) >= 0.30 THEN 'High'\n            WHEN SUM(f.profit) / NULLIF(SUM(f.sales),0) >= 0.15 THEN 'Healthy'\n            ELSE 'Low / watch' END AS margin_band\nFROM   fact_sales f\nJOIN   product_dim p ON f.product_id = p.product_id\nGROUP BY p.product_type;"}
  ];
  var KW='SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP\\s+BY|ORDER\\s+BY|HAVING|AS|WITH|CASE|WHEN|THEN|ELSE|END|AND|OR|NOT|IS|NULL|DESC|ASC|OVER|PARTITION\\s+BY|DISTINCT';
  var FN='SUM|COUNT|AVG|MIN|MAX|RANK|ROUND|NULLIF|COALESCE|ROW_NUMBER|DENSE_RANK';
  var RE=new RegExp('(--[^\\n]*)|(\'[^\']*\')|\\b('+KW+')\\b|\\b('+FN+')\\b(?=\\s*\\()|\\b(\\d+(?:\\.\\d+)?)\\b','gi');
  function hl(code){
    var esc=code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return esc.replace(RE,function(m,com,str,kw,fn,num){
      if(com)return '<span class="c-com">'+com+'</span>';
      if(str)return '<span class="c-str">'+str+'</span>';
      if(kw)return '<span class="c-kw">'+kw+'</span>';
      if(fn)return '<span class="c-fn">'+fn+'</span>';
      if(num)return '<span class="c-num">'+num+'</span>';
      return m;
    });
  }
  function show(i){
    var q=SQLS[i]; codeEl.innerHTML=hl(q.code); codeEl.setAttribute('data-raw',q.code);
    noteEl.innerHTML='<b>&#10003;</b> '+q.note; if(fnameEl)fnameEl.textContent=q.file;
    [].slice.call(tabs.querySelectorAll('.sqltab')).forEach(function(b){b.classList.toggle('active',+b.getAttribute('data-q')===i);});
  }
  tabs.addEventListener('click',function(e){var b=e.target.closest('.sqltab'); if(b)show(+b.getAttribute('data-q'));});
  if(copyBtn)copyBtn.addEventListener('click',function(){
    var raw=codeEl.getAttribute('data-raw')||codeEl.textContent;
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(raw).then(function(){
      copyBtn.textContent='Copied!'; setTimeout(function(){copyBtn.textContent='Copy';},1400);});}
  });
  show(0);
})();

/* project detail modals */
(function(){
  var dlg=document.getElementById('projModal'); if(!dlg||!dlg.showModal) return;
  var GH='https://github.com/muradhasib01/', BI=GH+'business-intelligence-portfolio/tree/main/', MIS=GH+'mis-graduate-portfolio/tree/main/';
  var P={
    'coffee-dw':{k:'SQL & Data Modeling',t:'Coffee Chain Data Warehouse',
      f:'A star-schema warehouse (fact plus product, store and budget dimensions) modeled in Access, then written as portable SQL — window functions rank product types within each market, HAVING isolates loss-making products, and a CASE expression buckets each product type into margin bands. <strong>Totals reconcile to $819,811</strong>, matching the Tableau dashboards the model powers.',
      chips:[{b:'Star schema',s:'fact + 3 dims'},{b:'$819,811',s:'totals reconcile'}],
      links:[{h:BI+'03-ms-access',t:'Star-schema SQL ↗'},{h:BI+'05-tableau',t:'Dashboards ↗'}]},
    'tableau-geo':{k:'Tableau',t:'Sales Geography & Market Mix',
      f:'Two questions, two encodings of the same measure. A US tile-grid map shaded by sales answers <strong>where</strong>; grouped cross-tab bars answer <strong>what</strong>, and in what order. Texas leads on total sales while carrying a lower average than Wyoming — volume, not basket size, a distinction the map alone would hide.',
      chips:[{b:'$2.3M',s:'superstore sales'},{b:'$819,811',s:'coffee chain'}],
      shots:[{s:'assets/tableau-sales-by-state-map.png',a:'Tableau tile-grid map of US sales',c:'Sales by U.S. state — tile-grid choropleth'},
             {s:'assets/tableau-sales-by-market.png',a:'Tableau grouped bars by market and product',c:'Sales by market & product type'}],
      links:[{h:BI+'05-tableau',t:'View on GitHub ↗'}]},
    'sap-bw':{k:'SAP Business Warehouse',t:'Enterprise Revenue Reporting',
      f:'Revenue reporting at scale on Global Bike Inc. — InfoObjects and Key Figures with exception aggregation, mapped onto a snowflake-schema fact table. 29 products ranked by revenue, <strong>$1.79B total</strong>, with share-of-total available on demand.',
      chips:[{b:'$1.79B',s:'total revenue'},{b:'29',s:'products ranked'}],
      shots:[{s:'assets/sap-bw-revenue-by-product.png',a:'SAP BW revenue by product',c:'Revenue by product — Global Bike Inc.'}],
      links:[{h:BI+'07-sap-bw',t:'View on GitHub ↗'}]},
    'sas-dist':{k:'SAS Visual Analytics',t:'Distribution & Profitability',
      f:'Box-plot distributions of compensation across 8 job titles (647 employees), category-vs-measure classification, and cross-country profitability. The distribution view exposes spread and outliers that a single average would flatten away.',
      chips:[{b:'647',s:'employees'},{b:'8',s:'job titles'}],
      shots:[{s:'assets/sas-salary-boxplot-dashboard.png',a:'SAS salary box-plot dashboard',c:'Salary distribution by job title'}],
      links:[{h:BI+'04-sas',t:'View on GitHub ↗'}]},
    'excel-prod':{k:'Analysis · Excel',t:'Product & Sales Analysis',
      f:'Fast analysis without a database — isolating underperforming product lines, loss-making products, and the top cities by orders and profit, then framing each finding as a decision a manager can actually act on.',
      chips:[{b:'Excel',s:'no database'},{b:'Loss-makers',s:'flagged by profit'}],
      links:[{h:BI+'02-data-analysis',t:'View on GitHub ↗'}]},
    'oltp-olap':{k:'BI Foundations',t:'OLTP vs. OLAP',
      f:'Why a manager can’t make decisions from a transaction report — and how an analytical (OLAP) view of the same Global Bike data turns rows of transactions into answers. The foundational argument for why data warehousing exists at all.',
      chips:[{b:'OLTP → OLAP',s:'transactional vs analytical'}],
      links:[{h:BI+'01-oltp-olap',t:'View on GitHub ↗'}]},
    'covid':{k:'Research · Python · SEC EDGAR',t:'COVID-19 & Retail: Walmart vs. Target',
      f:'Ten years of SEC EDGAR 10-K filings, reconciled across two filers that don’t report alike, then compared. <strong>Target grew 3.8× faster</strong> through the pandemic (+35.71% vs +9.31%) and reached 8.44% operating margin — then gave it back: net income <strong>−60%</strong> in 2022 with free cash flow going <strong>negative</strong> on flat revenue. Surge and resilience are different things. The whole study rebuilds from source in two commands, no dependencies.',
      chips:[{b:'3.8×',s:'faster growth'},{b:'−60%',s:'2022 net income'},{b:'−$1.51B',s:'2022 free cash flow'}],
      links:[{h:MIS+'02-data-analytics/edgar',t:'Run the pipeline ↗'},{h:MIS+'02-data-analytics',t:'Read the study ↗'}]},
    'predictive':{k:'Predictive Analytics · SAP Analytics Cloud',t:'Clustering, Forecasting & Regression',
      f:'Segmentation, association rules, forecasting and regression — read skeptically. Two regression models had near-identical confidence (99.35% vs 99.99%) but their RMSE differed <strong>tenfold</strong> (3.018 vs 0.26); against a target mean of 5.28, the “confident” model’s error was worth more than half the average value. A metric pinned near 100% can look decisive and discriminate nothing.',
      chips:[{b:'0.26 vs 3.018',s:'RMSE — 10× gap'},{b:'99.35–99.99%',s:'confidence, saturated'},{b:'10.29%',s:'forecast MAPE'}],
      shots:[{s:'assets/proof/sac-regression-model-comparison.png',a:'SAC model comparison table',c:'Two models: RMSE 0.26 vs 3.018 at near-identical confidence'},
             {s:'assets/proof/sac-regression-predicted-vs-actual.png',a:'Predicted vs actual chart',c:'Predicted vs. actual with validation error bands'},
             {s:'assets/proof/sac-store-clustering-bubble.png',a:'k-means store clustering',c:'k-means store segmentation — three clusters'},
             {s:'assets/proof/sac-time-series-forecast.png',a:'Time series forecast',c:'Forecast vs. actual — expected MAPE 10.29%'},
             {s:'assets/proof/sac-titanic-association-rules.png',a:'Association rules',c:'Association rules ranked by frequency'}],
      links:[{h:MIS+'01-data-mining',t:'View on GitHub ↗'}]},
    'erpsim':{k:'SAP S/4HANA · ERPSim',t:'Live ERP Simulation Analysis',
      f:'A multi-round competitive simulation run in a real S/4HANA system (Team A, finished 3rd), then analysis of the game’s own transaction data. <strong>500g Nut Muesli — the single highest-revenue product — sold nothing at all through Hypermarkets.</strong> The best product was absent from a whole channel, a gap invisible in revenue rankings and visible only by crossing product against channel. Smart Discovery rated only Quantity a moderate driver of revenue; price, product, team and channel all came back weak.',
      chips:[{b:'3rd',s:'of the field'},{b:'24.4M',s:'top-product revenue'},{b:'0',s:'its hypermarket sales'}],
      shots:[{s:'assets/proof/sac-erpsim-revenue-per-product.png',a:'ERPSim revenue per product',c:'Revenue per product — 500g Nut Muesli leads'},
             {s:'assets/proof/sac-erpsim-key-influencers.png',a:'Smart Discovery key influencers',c:'Smart Discovery: only Quantity is a moderate driver'}],
      links:[{h:MIS+'05-sap-enterprise',t:'View on GitHub ↗'}]},
    'pm-evm':{k:'Project Management · Primavera P6',t:'Earned Value & Critical Path',
      f:'A project simultaneously <strong>ahead of schedule (SPI 1.09) and over budget (CPI 0.89)</strong> — the signature of buying speed with money, visible only when the two indices are read together. Estimate at completion $22,472 against a $20,000 budget, finishing about a month early. Plus critical-path float analysis where a 5-day slip moved the deadline zero days but cut an activity’s float from 8 days to 3.',
      chips:[{b:'SPI 1.09',s:'ahead of schedule'},{b:'CPI 0.89',s:'over budget'},{b:'$22,472',s:'EAC vs $20k'}],
      shots:[{s:'assets/proof/p6-activity-schedule-float.png',a:'Primavera P6 float table',c:'Primavera P6 — free float vs. total float per activity'}],
      links:[{h:MIS+'04-project-management',t:'View on GitHub ↗'}]},
    'oracle-sql':{k:'Oracle SQL',t:'SQL That Survives the Data Changing',
      f:'Coursework rebuilt as runnable, commented SQL across DQL, DDL and DML — documenting the places the obvious query is quietly wrong: <strong>manager_id = NULL</strong> matches nothing (three-valued logic), <strong>NOT IN</strong> collapses against a NULL in the list, and <strong>IN</strong> beats <strong>=</strong> in a subquery that must survive a second matching row. SQL written to stay correct as the data changes, not just against today’s rows.',
      chips:[{b:'DQL·DDL·DML',s:'3 script files'},{b:'3VL',s:'NULL-safe logic'}],
      links:[{h:MIS+'03-database-management',t:'View the SQL ↗'}]}
  };
  function chip(c){return '<div class="pm-chip"><b>'+c.b+'</b><small>'+c.s+'</small></div>';}
  function shot(s){return '<figure><img src="'+s.s+'" alt="'+s.a+'" loading="lazy"><figcaption>'+s.c+'</figcaption></figure>';}
  function link(l){return '<a class="btn" href="'+l.h+'" target="_blank" rel="noopener">'+l.t+'</a>';}
  function render(p){
    var h='<div class="pm-head"><span class="k">'+p.k+'</span><h3 id="pmTitle">'+p.t+'</h3>'+
          '<button class="pm-close" type="button" aria-label="Close">✕</button></div>'+
          '<div class="pm-body"><p class="pm-find">'+p.f+'</p>';
    if(p.chips&&p.chips.length) h+='<div class="pm-chips">'+p.chips.map(chip).join('')+'</div>';
    if(p.shots&&p.shots.length) h+='<div class="pm-shots'+(p.shots.length>1?' multi':'')+'">'+p.shots.map(shot).join('')+'</div>';
    if(p.links&&p.links.length) h+='<div class="pm-links">'+p.links.map(link).join('')+'</div>';
    return h+'</div>';
  }
  var last=null;
  function open(key){var p=P[key]; if(!p) return; dlg.innerHTML=render(p); dlg.showModal();
    var b=dlg.querySelector('.pm-body'); if(b)b.scrollTop=0;}
  [].slice.call(document.querySelectorAll('.proj[data-modal]')).forEach(function(card){
    card.setAttribute('role','button'); card.setAttribute('tabindex','0'); card.setAttribute('aria-haspopup','dialog');
    function go(e){ if(e.target.closest('a')) return; card.style.transform=''; last=card; open(card.getAttribute('data-modal')); }
    card.addEventListener('click',go);
    card.addEventListener('keydown',function(e){ if((e.key==='Enter'||e.key===' ')&&!e.target.closest('a')){ e.preventDefault(); go(e); } });
  });
  dlg.addEventListener('click',function(e){ if(e.target===dlg||e.target.closest('.pm-close')) dlg.close(); });
  dlg.addEventListener('close',function(){ if(last&&last.focus) last.focus(); });
})();

(function(){var y=document.getElementById('yr'); if(y)y.textContent='2026';})();

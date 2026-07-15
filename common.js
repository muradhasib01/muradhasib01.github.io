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

(function(){var y=document.getElementById('yr'); if(y)y.textContent='2026';})();

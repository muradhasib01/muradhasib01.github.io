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

(function(){var y=document.getElementById('yr'); if(y)y.textContent='2026';})();

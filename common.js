/* shared: theme toggle, scroll reveal, count-up */
(function(){
  var root=document.documentElement, btn=document.getElementById('themeToggle');
  var saved=null; try{saved=localStorage.getItem('theme')}catch(e){}
  if(saved) root.setAttribute('data-theme',saved);
  if(btn) btn.addEventListener('click',function(){
    var cur=root.getAttribute('data-theme');
    var next = cur==='dark' ? 'light' : (cur==='light' ? 'dark' :
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'light':'dark'));
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('theme',next)}catch(e){}
    if(window.__redraw) window.__redraw();
  });
})();
(function(){
  var els=[].slice.call(document.querySelectorAll('.reveal'));
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}})},{threshold:.12});
  els.forEach(function(e){io.observe(e)});
  window.addEventListener('load',function(){setTimeout(function(){els.forEach(function(e){e.classList.add('in')});},1800);});
})();
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
(function(){var y=document.getElementById('yr'); if(y)y.textContent='2026';})();

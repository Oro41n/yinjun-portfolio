/* ============================================================
   殷俊 作品集 — interactions
   ============================================================ */
(function(){
'use strict';
const C = window.CATALOG, A = window.ASSETS;
const $ = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const app = $('#app');

/* 兜底 0：数据脚本没读到（文件缺失/被改名/浏览器拦截本地脚本）时给出明确指引，而非空白页 */
if(!C || !A){
  app.innerHTML = `<div class="fatal"><b>作品集数据未能载入</b>
    缺少 <code>${!A?'assets.js':'catalog.js'}</code> 文件，或浏览器阻止了本地脚本执行（部分浏览器双击 file:// 打开时会拦截）。<br>
    解决办法：① 确认 <code>assets.js</code>、<code>catalog.js</code>、<code>app.js</code>、<code>assets</code> 文件夹与本页在同一目录；
    ② 改用「打开作品集.bat」启动（自带本地服务，兼容性最好）；
    ③ 或把整个 <code>site</code> 文件夹拖到 Chrome / Edge 里打开。</div>`;
  return;
}

/* ---------- CDN：重资源走 jsDelivr（国内实测快 3.3x），失败自动整体回退本地 ---------- */
const CDN_BASE = 'https://fastly.jsdelivr.net/gh/Oro41n/yinjun-portfolio@2e10e11/';
/* 若 CDN 上次失败过（或被手动关掉），本次整页直接走本地，不再重试 */
let cdnOn = true;
try{ if(sessionStorage.getItem('pxNoCdn') === '1') cdnOn = false; }catch(e){}
const cdn = p => cdnOn ? CDN_BASE + p : p;
/* CDN 连续失败两次 → 打标记后重载页面，重载时整体走本地相对路径。
   直接改 srcset 在 <picture> 里重选不可靠，重载是唯一确定性方案。 */
let cdnFail = 0;
function cdnFallback(){
  if(!cdnOn) return;
  try{ sessionStorage.setItem('pxNoCdn', '1'); }catch(e){ return; }
  location.reload();
}

/* ---------- 响应式图源：480w 缩略 / 800w 中图（WebP），大图仅阅读器使用 ---------- */
const T = window.TIERS || {};
const baseOf = s => s ? s.replace(/^.*\//, '').replace(/\.jpg$/i, '') : '';
function tierSrc(s, w){
  const b = baseOf(s), t = T[b];
  if(!t || !t[w ? 1 : 0]) return '';
  return (w ? 'assets_m/' : 'assets_t/') + b + '.webp';
}
/* 输出 <picture>：AVIF 两档优先，WebP 两档兜底；浏览器按 sizes 自选宽度 */
function imgTag(s, sizes, alt, extra){
  const b = baseOf(s), t = T[b];
  const has = !!(t && t[0] && t[1]);
  let dim = '';
  if(t && t[2] && t[3]){ const k = t[1] / t[2];
    dim = ' width="' + Math.round(t[2] * k) + '" height="' + Math.round(t[3] * k) + '"'; }
  let avif = '';
  if(has) avif = '<source type="image/avif" data-k="' + b + '" srcset="' + cdn('assets_ta/' + b + '.avif') + ' ' + t[0] + 'w, ' + cdn('assets_ma/' + b + '.avif') + ' ' + t[1] + 'w" sizes="' + sizes + '">';
  const webp = has
    ? ' data-k="' + b + '" data-big="1" src="' + cdn('assets_m/' + b + '.webp') + '" srcset="' + cdn('assets_t/' + b + '.webp') + ' ' + t[0] + 'w, ' + cdn('assets_m/' + b + '.webp') + ' ' + t[1] + 'w" sizes="' + sizes + '"'
    : ' data-raw="' + s + '" src="' + cdn(s) + '"';
  return '<picture>' + avif + '<img' + webp + dim + ' decoding="async" loading="lazy"' + (extra ? ' ' + extra : '') + ' alt="' + (alt || '') + '"></picture>';
}
const pngSrc = k => (A.png[k] || {}).src;
const pdfPages = k => (A.pdf[k] || {}).pages || [];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------------- markup builders ---------------- */
function chapterHead(ch){
  return `<div class="ch-head">
    <div class="ch-no rv">${ch.no}</div>
    <div class="ch-title">
      <h2 class="rv d1">${esc(ch.title)}</h2>
      <div class="en rv d2">CHAPTER ${ch.no} &nbsp;—&nbsp; ${esc(ch.en)}</div>
      <div class="lead rv d3">「 ${esc(ch.lead)} 」</div>
    </div>
    <div class="ch-desc rv d3">${esc(ch.desc)}</div>
  </div>`;
}

function buildHero(){
  return `<section class="hero" id="sec-hero" data-chapter="00">
    <canvas class="bg41n" id="bg41n" aria-hidden="true"></canvas>
    <div class="hero-scrim"></div>
    <div class="bg41n-mark" aria-hidden="true">
      <div class="m-kicker">PROJECT CODE / 项目代号</div>
      <span class="m-num">41<span class="m-n">n</span></span>
      <span class="m-rule"></span>
      <div class="m-cap">41N — KINETIC IDENTITY / NO. 041</div>
    </div>
    <div class="hero-inner">
      <div class="hero-eyebrow">PORTFOLIO &nbsp;·&nbsp; 2021—2026 &nbsp;·&nbsp; GRAPHIC DESIGN</div>
      <h1><span class="ch"><i>殷</i></span><span class="ch"><i>俊</i></span></h1>
      <div class="hero-sub">
        <div class="tag">${esc(C.meta.tagline)}<small>${esc(C.meta.taglineEn)}</small></div>
        <div class="hero-info">
          <div><span>WORKS</span><b>${C.meta.works}</b></div>
          <div><span>REPORTS</span><b>${C.meta.reports}</b></div>
          <div><span>PAGES</span><b>${C.meta.pages}</b></div>
        </div>
      </div>
    </div>
    <div class="hero-scroll"><span>SCROLL</span><div class="bar"></div></div>
  </section>`;
}

function buildStatement(){
  return `<section class="statement" id="sec-statement" data-chapter="00">
    <div class="stamp">A DESIGNER'S NOTE / 自述</div>
    <div class="big rv">版式是沉默的<em>语言</em>，<br>留白是未说出口的<em>分寸</em>。<br>把每一次落版，都当作一件<em>作品</em>。</div>
    <div class="statement-foot rv d2">${esc(C.meta.role)} &nbsp;·&nbsp; ${esc(C.meta.agency)} &nbsp;·&nbsp; ${esc(C.meta.period)}</div>
  </section>`;
}

function buildCinema(ch){
  const items = ch.items;
  return `<section class="chapter" id="sec-${ch.id}" data-chapter="${ch.no}">
    ${chapterHead(ch)}
    <div class="cinema">
      <div class="stage rv" id="stage">
        ${items.map((it,i)=>`<div class="slide${i===0?' on':''}" data-i="${i}">
          ${imgTag(pngSrc(it.key),'(max-width:700px) 92vw, 86vw', esc(it.title), i>2?'':'fetchpriority="high"')}
        </div>`).join('')}
        <div class="stage-cap"><h3 id="stageTitle">${esc(items[0].title)}</h3>
          <p id="stageSub">${esc(items[0].sub)}</p></div>
        <div class="stage-idx"><b id="stageNum">01</b> / ${String(items.length).padStart(2,'0')}</div>
      </div>
      <div class="stage-ctrl">
        <button id="stagePrev" aria-label="上一张">‹</button>
        <div class="stage-dots">${items.map((_,i)=>`<i class="${i===0?'on':''}" data-i="${i}"></i>`).join('')}</div>
        <button id="stageNext" aria-label="下一张">›</button>
      </div>
      <div class="stage-thumbs">${items.map((it,i)=>`<button class="${i===0?'on':''}" data-i="${i}">${imgTag(pngSrc(it.key),'84px','','')}</button>`).join('')}</div>
    </div>
  </section>`;
}

function buildCoverflow(ch){
  return `<section class="chapter" id="sec-${ch.id}" data-chapter="${ch.no}">
    ${chapterHead(ch)}
    <div class="coverflow">
      <div class="cf-track" id="cfTrack">
        ${ch.items.map((it,i)=>`<div class="cf-item" data-i="${i}">
          ${imgTag(pngSrc(it.key),'(max-width:700px) 150px, 300px', esc(it.title), '')}
          <div class="cf-tag">${esc(it.title)} · ${esc(it.tag)}</div>
        </div>`).join('')}
      </div>
      <div class="cf-nav">
        <button id="cfPrev">← 上一帧</button>
        <div class="cf-hint">点击两侧画面切换 · 共 ${ch.items.length} 帧</div>
        <button id="cfNext">下一帧 →</button>
      </div>
    </div>
  </section>`;
}

function buildCollateral(ch){
  return `<section class="chapter" id="sec-${ch.id}" data-chapter="${ch.no}">
    ${chapterHead(ch)}
    <div class="coll">
      ${ch.groups.map((g,gi)=>`<div class="coll-group rv">
        <div class="coll-ghead"><h3>${esc(g.name)}</h3><span class="en">${esc(g.en)}</span>
          <span class="num">${String(g.items.length).padStart(2,'0')} PCS</span></div>
        <div class="masonry">${g.items.map(it=>`<figure class="m-item" data-key="${esc(it.key)}" data-title="${esc(it.title)}">
          ${imgTag(pngSrc(it.key),'(max-width:700px) 46vw, (max-width:1100px) 30vw, 22vw', esc(it.title), '')}
          <figcaption class="m-cap">${esc(it.title)}</figcaption>
        </figure>`).join('')}</div>
      </div>`).join('')}
    </div>
  </section>`;
}

function buildBook(ch){
  const items = ch.items;
  return `<section class="chapter book-sec" id="sec-${ch.id}" data-chapter="${ch.no}">
    ${chapterHead(ch)}
    <div class="book-wrap">
      <div class="book rv" id="book">
        ${items.map((it,i)=>`<div class="b-page${i===0?' on':''}" data-i="${i}">
          ${imgTag(pngSrc(it.key),'(max-width:900px) 88vw, 58vw', esc(it.title), i>1?'':'fetchpriority="high"')}
        </div>`).join('')}
        <div class="b-shade"></div>
      </div>
      <div class="book-side rv d2">
        <div class="b-count"><span id="bookNum">01</span><small> / ${String(items.length).padStart(2,'0')}</small></div>
        <h4 id="bookTitle">${esc(items[0].title)}</h4>
        <p>${esc(ch.desc)}<br><br>逐页翻阅，注意留白、字号与图像之间的呼吸。单击画面进入大图模式。</p>
        <div class="book-ctrl">
          <button id="bookPrev">‹</button><button id="bookNext">›</button>
        </div>
        <div class="book-strip">${items.map((it,i)=>`<button class="${i===0?'on':''}" data-i="${i}">${imgTag(pngSrc(it.key),'56px','','')}</button>`).join('')}</div>
      </div>
    </div>
  </section>`;
}

function buildArchive(ch){
  return `<section class="chapter archive" id="sec-${ch.id}" data-chapter="${ch.no}">
    ${chapterHead(ch)}
    <div class="filter" id="filter">
      <span class="fl-label">FILTER / 项目</span>
      <button class="on" data-p="ALL">全部 ${ch.items.length}</button>
      ${ch.projects.map(p=>`<button data-p="${esc(p)}">${esc(p)}</button>`).join('')}
    </div>
    <div class="archive-grid" id="archiveGrid">
      ${ch.items.map((r,i)=>`<article class="rep rv" data-i="${i}" data-project="${esc(r.project)}">
        <div class="rep-cover">
          ${imgTag(r.pages[0],'(max-width:700px) 88vw, (max-width:1100px) 30vw, 22vw', esc(r.title), '')}
          <div class="rep-open"><span>逐 页 翻 阅</span></div>
        </div>
        <div class="rep-meta"><h4>${esc(r.title)}</h4><span class="pg">${r.pages.length} P</span></div>
        <div class="rep-sub"><span>${esc(r.project)}</span><i>/</i><span>${esc(r.month)}</span><i>/</i><span>${esc(r.projectEn)}</span></div>
      </article>`).join('')}
    </div>
  </section>`;
}

function buildFooter(){
  return `<footer class="footer" id="sec-footer" data-chapter="06">
    <div class="f-mark">YIN JUN</div>
    <div class="f-top">
      <div class="f-quote">设计不是把画面填满，<br>而是替观看者<em>留出位置</em>。</div>
      <div class="f-info"><b>殷 俊 · YIN JUN</b>
        ${esc(C.meta.role)}<br>${esc(C.meta.agency)}<br>${esc(C.meta.period)} · ${C.meta.works} 件作品 / ${C.meta.pages} 页报告</div>
    </div>
    <div class="f-bottom"><span>© 2021—2026 YIN JUN PORTFOLIO · ALL WORKS SHOWN WITH PERMISSION</span>
      <a href="#" class="backtop" id="backtop">返回顶部 ↑</a></div>
  </footer>`;
}

const chapters = C.chapters;
app.innerHTML = buildHero() + buildStatement() +
  chapters.map(ch=>({
    cinema:buildCinema, coverflow:buildCoverflow, masonry:buildCollateral,
    book:buildBook, reports:buildArchive
  })[ch.type](ch)).join('') + buildFooter();

/* ---------------- rail ---------------- */
const railItems = [
  {id:'sec-hero',no:'00',name:'序'},
  ...chapters.map(c=>({id:'sec-'+c.id,no:c.no,name:c.title})),
  {id:'sec-footer',no:'06',name:'尾'},
];
$('#rail').innerHTML = railItems.map(r=>`<button data-id="${r.id}"><span class="r-name">${esc(r.name)}</span>
  <span class="r-line"></span><span class="r-no">${r.no}</span></button>`).join('');
function setActive(id,no){
  $$('#rail button').forEach(b=>b.classList.toggle('active', b.dataset.id===id));
  $('#counter').innerHTML = `<b>${no}</b> / 06`;
}
$('#rail').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  document.getElementById(b.dataset.id).scrollIntoView({behavior:'smooth'});
});
$('#backtop').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});

/* ---------------- reveal + progress + active chapter ---------------- */
/* 兜底 1：IntersectionObserver 缺失/异常时，全部内容立即可见，绝不留白页 */
const ioOK = 'IntersectionObserver' in window;
if(!ioOK) document.documentElement.classList.add('no-io');

const io = ioOK ? new IntersectionObserver(es=>{
  es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
},{threshold:.12,rootMargin:'0px 0px -8% 0px'}) : null;
if(io){ $$('.rv').forEach(el=>io.observe(el)); $$('.statement').forEach(el=>io.observe(el)); }
else { $$('.rv,.statement').forEach(el=>el.classList.add('in')); }

/* 兜底 2：观察器若因任何原因没触发，3.5 秒后把已被滚过或已进入视口的元素放出来 */
setTimeout(()=>{
  if(!io) return;
  $$('.rv:not(.in)').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.top < window.innerHeight*1.2 && r.bottom > -200) el.classList.add('in');
  });
},3500);

const chIO = ioOK ? new IntersectionObserver(es=>{
  es.forEach(en=>{ if(en.isIntersecting) setActive(en.target.id, en.target.dataset.chapter||'00'); });
},{rootMargin:'-45% 0px -50% 0px'}) : null;
if(chIO) $$('[data-chapter]').forEach(el=>chIO.observe(el));

function onScroll(){
  const h=document.documentElement.scrollHeight-window.innerHeight;
  $('#progress').style.width = (h>0? (scrollY/h*100):0)+'%';
  $('#topbar').classList.toggle('hidden', scrollY>window.innerHeight*.9 && scrollY < h-400);
  if(cfOn && !cfPaused) layoutCF();
}
addEventListener('scroll',onScroll,{passive:true});

/* ---------------- 01 cinema ---------------- */
(function(){
  const items=chapters.find(c=>c.type==='cinema').items;
  let cur=0, timer=null;
  const slides=$$('#stage .slide');
  function go(i){
    cur=(i+items.length)%items.length;
    slides.forEach((s,k)=>s.classList.toggle('on',k===cur));
    $('#stageTitle').textContent=items[cur].title;
    $('#stageSub').textContent=items[cur].sub;
    $('#stageNum').textContent=String(cur+1).padStart(2,'0');
    $$('.stage-dots i').forEach((d,k)=>d.classList.toggle('on',k===cur));
    $$('.stage-thumbs button').forEach((d,k)=>d.classList.toggle('on',k===cur));
  }
  function play(){ stop(); timer=setInterval(()=>go(cur+1),5200); }
  function stop(){ if(timer) clearInterval(timer); timer=null; }
  $('#stageNext').onclick=()=>{go(cur+1);play()};
  $('#stagePrev').onclick=()=>{go(cur-1);play()};
  $$('.stage-dots i').forEach(d=>d.onclick=()=>{go(+d.dataset.i);play()});
  $$('.stage-thumbs button').forEach(d=>d.onclick=()=>{go(+d.dataset.i);play()});
  const st=$('#stage');
  st.addEventListener('mouseenter',stop); st.addEventListener('mouseleave',play);
  st.addEventListener('click',e=>{ if(e.target.closest('button'))return; openViewer([pngSrc(items[cur].key)],items[cur].title,items[cur].sub,0); });
  let sx=null;
  st.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
  st.addEventListener('touchend',e=>{ if(sx===null)return; const dx=e.changedTouches[0].clientX-sx;
    if(Math.abs(dx)>40){go(cur+(dx<0?1:-1));play()} sx=null; },{passive:true});
  play();
})();

/* ---------------- 02 coverflow ---------------- */
let cfOn=false, cfPaused=false, cfCur=0, cfN=0, cfEls=[];
(function(){
  const ch=chapters.find(c=>c.type==='coverflow');
  cfN=ch.items.length; cfCur=Math.floor(cfN/2);
  cfEls=$$('#cfTrack .cf-item');
  const track=$('#cfTrack');
  function layout(){
    if(!cfOn) return;
    const W=track.clientWidth, H=track.clientHeight;
    cfEls.forEach((el,i)=>{
      let d=i-cfCur;
      const n=cfN;
      if(d> n/2) d-=n; if(d< -n/2) d+=n;
      const ad=Math.abs(d);
      const x=d*Math.min(W*.235, 250);
      const z=-ad*130;
      const ry=d*-34;
      const sc=Math.max(.62, 1-ad*.075);
      const h=Math.min(H*.84, 560)*sc;
      el.style.width=(h*(1243/2689))+'px';
      el.style.height=h+'px';
      el.style.transform=`translate3d(${x}px,0,${z}px) rotateY(${ry}deg) scale(${sc})`;
      el.style.zIndex=100-ad;
      el.style.opacity=ad>3?0:(1-ad*.13);
      el.style.filter=ad===0?'none':`brightness(${.92-ad*.08}) saturate(${1-ad*.1})`;
      el.style.pointerEvents=ad>3?'none':'auto';
      el.classList.toggle('center',d===0);
    });
  }
  window.layoutCF=layout;
  // center item click -> lightbox; side item -> move
  cfEls.forEach(el=>el.addEventListener('click',()=>{
    const i=+el.dataset.i;
    if(i===cfCur){ const it=ch.items[i]; openViewer([pngSrc(it.key)],it.title,it.sub,0); }
    else { let d=i-cfCur; if(d>cfN/2)d-=cfN; if(d<-cfN/2)d+=cfN; cfCur=(cfCur+d+cfN)%cfN; layout(); }
  }));
  $('#cfPrev').onclick=()=>{cfCur=(cfCur-1+cfN)%cfN;layout()};
  $('#cfNext').onclick=()=>{cfCur=(cfCur+1)%cfN;layout()};
  let sx=null;
  track.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
  track.addEventListener('touchend',e=>{ if(sx===null)return; const dx=e.changedTouches[0].clientX-sx;
    if(Math.abs(dx)>40){cfCur=(cfCur+(dx<0?1:-1)+cfN)%cfN;layout()} sx=null; },{passive:true});
  // wheel over coverflow
  let wlock=0;
  track.addEventListener('wheel',e=>{
    const now=Date.now(); if(now-wlock<420) return; wlock=now;
    if(Math.abs(e.deltaY)>8){ e.preventDefault(); cfCur=(cfCur+(e.deltaY>0?1:-1)+cfN)%cfN; layout(); }
  },{passive:false});
  // auto rotate slowly when in view, pause on hover
  track.addEventListener('mouseenter',()=>cfPaused=true);
  track.addEventListener('mouseleave',()=>cfPaused=false);
  setInterval(()=>{ if(cfOn && !cfPaused && !viewerOpen){ cfCur=(cfCur+1)%cfN; layout(); } },4600);
  if('IntersectionObserver' in window){
    const cfIO=new IntersectionObserver(es=>{cfOn=es[0].isIntersecting; if(cfOn)layout()},{threshold:.15});
    cfIO.observe(track);
  } else { cfOn=true; }
  addEventListener('resize',layout);
  layout();
})();

/* ---------------- 04 book ---------------- */
(function(){
  const items=chapters.find(c=>c.type==='book').items;
  let cur=0;
  const pages=$$('#book .b-page');
  function go(i){
    cur=(i+items.length)%items.length;
    pages.forEach((p,k)=>p.classList.toggle('on',k===cur));
    $('#bookNum').textContent=String(cur+1).padStart(2,'0');
    $('#bookTitle').textContent=items[cur].title;
    $$('.book-strip button').forEach((b,k)=>b.classList.toggle('on',k===cur));
  }
  $('#bookPrev').onclick=()=>go(cur-1);
  $('#bookNext').onclick=()=>go(cur+1);
  $$('.book-strip button').forEach(b=>b.onclick=()=>go(+b.dataset.i));
  $('#book').addEventListener('click',()=>openViewer(items.map(it=>pngSrc(it.key)),'宣传册 · '+items[cur].title,chapters.find(c=>c.type==='book').en,cur));
  let sx=null;
  $('#book').addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
  $('#book').addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;
    if(Math.abs(dx)>40)go(cur+(dx<0?1:-1));sx=null},{passive:true});
})();

/* ---------------- 03 masonry & 05 archive -> viewer ---------------- */
$$('.m-item').forEach(el=>el.addEventListener('click',()=>{
  const key=el.dataset.key;
  openViewer([pngSrc(key)],el.dataset.title,'COLLATERAL / 物料延展',0);
}));

(function(){
  const ch=chapters.find(c=>c.type==='reports');
  $$('#filter button').forEach(b=>b.onclick=()=>{
    $$('#filter button').forEach(x=>x.classList.remove('on')); b.classList.add('on');
    const p=b.dataset.p;
    $$('#archiveGrid .rep').forEach(el=>{
      const show=p==='ALL'||el.dataset.project===p;
      el.style.display=show?'':'none';
    });
  });
  $$('#archiveGrid .rep').forEach(el=>el.addEventListener('click',()=>{
    const r=ch.items[+el.dataset.i];
    openViewer(r.pages,r.title,`${r.project} · ${r.month} · ${r.pages.length} 页`,0);
  }));
})();

/* ---------------- viewer ---------------- */
let viewerOpen=false, vList=[], vIdx=0, vZoomFit=true;
const V=$('#viewer'), vImg=$('#vImg'), vFilm=$('#vFilm'), vFilmTrack=$('#vFilmTrack');
function openViewer(list,title,sub,idx){
  vList=list; vIdx=idx||0; viewerOpen=true;
  $('#vTitle').textContent=title; $('#vSub').textContent=sub;
  $('#vTotal').textContent=list.length;
  V.classList.add('on'); document.body.classList.add('locked');
  buildFilm();
  showV();
}
function buildFilm(){
  vFilmTrack.innerHTML='';
  if(vList.length<2){ vFilm.classList.remove('show'); return; }
  const frag=document.createDocumentFragment();
  vList.forEach((src,i)=>{
    const b=document.createElement('button');
    b.type='button'; b.title='第 '+(i+1)+' 页'; b.dataset.i=i;
    const im=document.createElement('img'); im.loading='lazy'; im.decoding='async';
    im.src=cdn(tierSrc(src,0)||src); im.alt='';
    const s=document.createElement('span'); s.textContent=String(i+1).padStart(2,'0');
    b.appendChild(im); b.appendChild(s);
    b.onclick=()=>{ vIdx=i; showV(); };
    frag.appendChild(b);
  });
  vFilmTrack.appendChild(frag);
  vFilm.classList.add('show');
}
/* 阅读器图源：手机上 800w WebP 足够且省 4~5 倍流量；桌面用原始 1536 图保质量 */
function viewerSrc(s){
  const many = vList.length > 1;
  if(many && window.innerWidth <= 900){ const m = tierSrc(s,1); if(m) return cdn(m); }
  return cdn(s);
}
function showV(){
  const src=vList[vIdx]; if(!src) return;
  vImg.classList.remove('show');
  const use = viewerSrc(src);
  const im=new Image();
  vImg.decoding='async';
  im.onload=()=>{ vImg.src=use; vImg.classList.add('show'); applyZoom(); };
  im.src=use;
  if(vImg.complete && vImg.src===use) { vImg.classList.add('show'); }
  $('#vCur').textContent=vIdx+1;
  $('#vBarFill').style.width=((vIdx+1)/vList.length*100)+'%';
  $('#vPrev').disabled=vIdx<=0; $('#vNext').disabled=vIdx>=vList.length-1;
  // keep filmstrip active + scroll into view
  if(vFilm.classList.contains('show')){
    $$('#vFilmTrack button').forEach(b=>b.classList.toggle('on',+b.dataset.i===vIdx));
    const act=vFilmTrack.children[vIdx];
    if(act){ const tr=vFilmTrack.getBoundingClientRect(), ar=act.getBoundingClientRect();
      if(ar.left<tr.left||ar.right>tr.right)
        vFilmTrack.scrollLeft+=ar.left-tr.left-(tr.width-ar.width)/2; }
  }
  // preload neighbours
  [vIdx-1,vIdx+1,vIdx+2].forEach(i=>{if(i>=0&&i<vList.length){const p=new Image();p.src=viewerSrc(vList[i])}});
}
function applyZoom(){
  if(vZoomFit){ vImg.style.maxWidth='100%';vImg.style.maxHeight='100%';vImg.style.width='auto';vImg.style.height='auto'; }
  else { vImg.style.maxWidth='none';vImg.style.maxHeight='none';vImg.style.width='auto';vImg.style.height='auto'; }
}
function goV(d){ const n=vIdx+d; if(n<0||n>=vList.length)return; vIdx=n; showV(); }
function closeV(){ viewerOpen=false; V.classList.remove('on'); document.body.classList.remove('locked'); vImg.src=''; }
$('#vClose').onclick=closeV;
$('#vPrev').onclick=()=>goV(-1); $('#vNext').onclick=()=>goV(1);
$('#vZoom').onclick=()=>{ vZoomFit=!vZoomFit; applyZoom(); $('#vZoom').textContent=vZoomFit?'⤢':'⤡'; };
$('#vBar').onclick=e=>{ const r=e.currentTarget.getBoundingClientRect();
  vIdx=Math.max(0,Math.min(vList.length-1,Math.floor((e.clientX-r.left)/r.width*vList.length))); showV(); };
$('#vStage').addEventListener('wheel',e=>{
  if(!viewerOpen)return;
  const now=Date.now(); if(viewerOpen && now-(window._vw||0)<380) return; window._vw=now;
  goV(e.deltaY>0?1:-1);
},{passive:true});
V.addEventListener('click',e=>{ if(e.target===V||e.target.id==='vStage') closeV(); });
addEventListener('keydown',e=>{
  if(!viewerOpen)return;
  if(e.key==='Escape')closeV();
  else if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();goV(1)}
  else if(e.key==='ArrowLeft'){e.preventDefault();goV(-1)}
  else if(e.key==='Home'){vIdx=0;showV()}
  else if(e.key==='End'){vIdx=vList.length-1;showV()}
});
let vsx=null;
$('#vStage').addEventListener('touchstart',e=>{vsx=e.touches[0].clientX},{passive:true});
$('#vStage').addEventListener('touchend',e=>{if(vsx===null)return;const dx=e.changedTouches[0].clientX-vsx;
  if(Math.abs(dx)>45)goV(dx<0?1:-1);vsx=null},{passive:true});
window.openViewer=openViewer;

/* ---------------- 41N · 代号动能背景 — 纯矢量绘制，无位图，绝不抖动 ----------------
   41n 是项目代号，不是地理坐标：把这三个字符本身当作识别母题，
   下层动能场只做「相位 / 亮度 / 匀速位移」变化，固定位置的线条绝不缩放平移。 */
(function(){
  const cv=$('#bg41n'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const P='239,236,228', R='214,69,53';
  let w=0,h=0,dpr=1,t0=performance.now(),raf=0,reduce=false;
  let sparks=[];

  function seed(){
    sparks=[];
    const n=Math.max(26,Math.min(60,Math.round(w/28)));
    for(let i=0;i<n;i++){
      sparks.push({
        x: Math.round((i*97.13 + i*i*13.7)%Math.max(1,w)),
        y: (i*173.71)%Math.max(1,h),
        v: 7+((i*7)%11),                 // px/s，匀速上升（动能）
        r: 0.8+((i*3)%5)*0.32,
        a: 0.14+((i*5)%7)*0.05,
        tail: 10+((i*11)%26)
      });
    }
  }
  function resize(){
    const rect=cv.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,2);
    w=Math.max(1,rect.width); h=Math.max(1,rect.height);
    cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    seed();
  }

  function draw(now){
    const t=(now-t0)/1000;
    ctx.clearRect(0,0,w,h);             // 整数像素清屏

    /* 1. 呼吸式环境辉光：只改 alpha，不改尺寸 / 位置 */
    const g=ctx.createRadialGradient(w*.72,h*.44,0,w*.72,h*.44,Math.max(w,h)*.66);
    const br=.5+.5*Math.sin(t*.45);
    g.addColorStop(0,'rgba('+P+','+(.05+.022*br).toFixed(3)+')');
    g.addColorStop(1,'rgba('+P+',0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

    /* 2. 竖向数据列：x 固定，能量波沿 x 推进，仅亮度变化 → 零位移、绝对不抖 */
    const cols=Math.max(18,Math.round(w/26)), gap=w/cols;
    const wv=(t*66)%(w+300)-150;        // 纸白主波
    const rv=wv-170;                    // 朱红尾波
    ctx.lineWidth=1;
    for(let i=0;i<=cols;i++){
      const x=Math.round(i*gap)+.5;
      const ew=Math.exp(-Math.pow(x-wv,2)/(2*78*78));
      const er=Math.exp(-Math.pow(x-rv,2)/(2*54*54));
      const a=.028+.20*ew;
      if(a>.031){ ctx.strokeStyle='rgba('+P+','+a.toFixed(3)+')';
        ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke(); }
      if(er>.02){ ctx.strokeStyle='rgba('+R+','+(.30*er).toFixed(3)+')';
        ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke(); }
    }

    /* 3. 动能光点：匀速上升 + 短拖尾，坐标取整，矢量圆点 */
    for(const s of sparks){
      const cycle=h+60;
      const y=((s.y-(t*s.v)%cycle+cycle)%cycle)-30;
      const yy=Math.round(y)+.5, xx=Math.round(s.x)+.5;
      ctx.strokeStyle='rgba('+P+','+(s.a*.45).toFixed(3)+')';ctx.lineWidth=s.r*.8;
      ctx.beginPath();ctx.moveTo(xx,yy-s.tail);ctx.lineTo(xx,yy);ctx.stroke();
      ctx.fillStyle='rgba('+P+','+s.a.toFixed(3)+')';
      ctx.beginPath();ctx.arc(xx,yy,s.r,0,Math.PI*2);ctx.fill();
    }

    /* 4. 行进虚线「信号线」：lineDashOffset 匀速行进 + 移动光头 */
    ctx.setLineDash([2,14]);ctx.lineDashOffset=-t*34;
    ctx.strokeStyle='rgba('+R+',.34)';ctx.lineWidth=1;
    [h*.30,h*.70].forEach(y=>{const yy=Math.round(y)+.5;
      ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(w,yy);ctx.stroke();});
    ctx.setLineDash([]);ctx.lineDashOffset=0;
    const hx=(t*120)%(w+200)-100, hy=Math.round(h*.70)+.5;
    const hg=ctx.createRadialGradient(hx,hy,0,hx,hy,46);
    hg.addColorStop(0,'rgba('+R+',.30)');hg.addColorStop(1,'rgba('+R+',0)');
    ctx.fillStyle=hg;ctx.fillRect(hx-46,hy-46,92,92);

    /* 5. 四角套准十字 + 底边刻度尺（平面 / 技术代号感） */
    ctx.strokeStyle='rgba('+P+',.28)';ctx.lineWidth=1;
    const pad=26,L=11;
    [[pad,pad],[w-pad,pad],[pad,h-pad],[w-pad,h-pad]].forEach(([x,y])=>{
      const xx=Math.round(x)+.5,yy=Math.round(y)+.5;
      ctx.beginPath();ctx.moveTo(xx-L,yy);ctx.lineTo(xx+L,yy);
      ctx.moveTo(xx,yy-L);ctx.lineTo(xx,yy+L);ctx.stroke();
    });
    ctx.strokeStyle='rgba('+P+',.14)';
    let k=0;
    for(let x=pad;x<w-pad;x+=14,k++){
      const major=k%5===0;
      const xx=Math.round(x)+.5;
      ctx.beginPath();ctx.moveTo(xx,h-pad+.5);
      ctx.lineTo(xx,h-pad-(major?9:4));ctx.stroke();
    }

    /* 6. 微型技术标注（拉丁 / 数字，不依赖中文字形） */
    ctx.font='9px monospace';
    ctx.fillStyle='rgba('+P+',.34)';
    ctx.fillText('41N / CODE IDENTITY',pad,h-pad-18);
    ctx.fillText('SIGNAL '+(0.40+0.0012*(Math.sin(t*1.3)+1)).toFixed(4),w-pad-96,pad-8);
    ctx.fillStyle='rgba('+R+',.55)';
    ctx.fillText('NO. 041 — KINETIC ID',w-pad-150,h-pad-18);

    if(!reduce) raf=requestAnimationFrame(draw);
  }

  // 离屏暂停、减弱动效切静态、resize 补帧
  let visible=true;
  if('IntersectionObserver' in window){
    const bio=new IntersectionObserver(es=>{
      const v=es[0].isIntersecting;
      if(v===visible) return;
      visible=v;
      if(v){ t0=performance.now()-(window._bg41nElapsed||0); raf=requestAnimationFrame(draw); }
      else { cancelAnimationFrame(raf); raf=0; window._bg41nElapsed=performance.now()-t0; }
    },{threshold:0});
    bio.observe(cv);
  }

  const mq=window.matchMedia('(prefers-reduced-motion:reduce)');
  reduce=mq.matches;
  mq.addEventListener && mq.addEventListener('change',e=>{
    reduce=e.matches;
    if(reduce){ cancelAnimationFrame(raf); draw(performance.now()); }
    else if(visible) raf=requestAnimationFrame(draw);
  });

  resize();
  if(reduce) draw(performance.now());
  addEventListener('resize',()=>{ resize(); if(reduce) draw(performance.now()); });
  if(!reduce) raf=requestAnimationFrame(draw);
})();

/* 兜底 3：图片大面积加载失败时（assets 文件夹被移动/改名）给出可见提示，而不是静默空白 */
(function imgGuard(){
  let fails = 0, warned = false;
  const bar = document.createElement('div');
  bar.className = 'imgwarn'; bar.hidden = true;
  bar.innerHTML = '图片未能加载：缺少 <code>assets</code> 文件夹，或它不在本页同一目录。请保持 <code>index.html</code> 与 <code>assets</code> 文件夹同级。';
  document.body.appendChild(bar);

  function check(img){
    if(img.dataset.guarded) return;
    img.dataset.guarded = '1';
    img.addEventListener('error',()=>{
      /* CDN 源失败 → 计入回退；本地源失败 → 计入提示条 */
      const src = img.currentSrc || img.src || '';
      if(CDN_BASE && src.indexOf(CDN_BASE) === 0){
        cdnFail++;
        if(cdnFail >= 2) cdnFallback();
        return;
      }
      fails++;
      if(fails >= 3 && !warned){ warned = true; bar.hidden = false; }
    });
    img.addEventListener('load',()=>{ if(img.naturalWidth === 0) img.dispatchEvent(new Event('error')); });
    if(img.complete && img.naturalWidth === 0 && img.getAttribute('src')) img.dispatchEvent(new Event('error'));
  }
  $$('img').forEach(check);

  /* 后续动态插入的图片（翻页、灯箱）也纳入监控 */
  if('MutationObserver' in window){
    new MutationObserver(muts=>{
      muts.forEach(m=>Array.from(m.addedNodes).forEach(n=>{
        if(n.nodeType === 1){
          if(n.tagName === 'IMG') check(n);
          $$('img', n).forEach(check);
        }
      }));
    }).observe(document.body, {childList:true, subtree:true});
  }
})();

onScroll();
})();

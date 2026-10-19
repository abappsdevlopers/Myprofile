/*!
 * Gold Prod — Floating Audio Player (self-contained, no dependencies)
 * الاستعمال في أي صفحة (الرئيسية، Beat Store، المدونة):
 *   1) <script src="/assets/gold-player.js" defer></script>
 *   2) أي زر/رابط يحمل data-beat-src يشغّل المقطع داخل المشغل:
 *      <button data-beat-src="beats/demo1.mp3" data-beat-title="Dark Trap" data-beat-meta="140 BPM" data-beat-cover="covers/1.jpg">استمع Demo</button>
 *   3) أو برمجياً: GoldPlayer.play({src, title, meta, cover})
 */
(function () {
  if (window.GoldPlayer) return;

  var css = `
  #gp-bar{position:fixed;left:0;right:0;bottom:0;z-index:80;transform:translateY(115%);transition:transform .35s cubic-bezier(.4,0,.2,1);
    background:rgba(12,12,16,.94);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(255,215,0,.28);
    box-shadow:0 -10px 30px rgba(0,0,0,.6);padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));font-family:'Cairo',sans-serif;color:#fff}
  #gp-bar.show{transform:translateY(0)}
  .gp-row{max-width:860px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:10px 12px}
  .gp-cover{width:44px;height:44px;border-radius:10px;object-fit:cover;border:1px solid rgba(255,215,0,.45);flex:none;background:#111}
  .gp-info{flex:1;min-width:0}
  .gp-title{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .gp-meta{font-size:11px;color:#c4c4cc;font-family:'Outfit',sans-serif}
  .gp-btn{width:38px;height:38px;border-radius:12px;border:1px solid rgba(255,215,0,.3);background:rgba(255,215,0,.1);color:#FFD700;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;transition:.2s}
  .gp-btn:hover{background:rgba(255,215,0,.22)}
  .gp-btn:focus-visible,.gp-range:focus-visible{outline:2px solid #FFD700;outline-offset:2px}
  .gp-play{width:42px;height:42px;background:linear-gradient(135deg,#fbbf24,#eab308);color:#000;border:0;box-shadow:0 4px 14px rgba(255,215,0,.35)}
  .gp-play:hover{background:linear-gradient(135deg,#fcd34d,#facc15)}
  .gp-btn svg{width:16px;height:16px;fill:currentColor}
  .gp-prog{order:5;flex-basis:100%;display:flex;align-items:center;gap:8px;direction:ltr;font:600 11px 'Outfit',sans-serif;color:#d4d4dc}
  .gp-prog span{min-width:34px;text-align:center}
  .gp-vol{display:none;align-items:center;gap:6px;direction:ltr;color:#FFD700}
  .gp-vol svg{width:16px;height:16px;fill:currentColor}
  .gp-range{-webkit-appearance:none;appearance:none;height:4px;border-radius:4px;cursor:pointer;flex:1;
    background:linear-gradient(to right,#FFD700 var(--p,0%),rgba(255,255,255,.2) var(--p,0%))}
  .gp-vol .gp-range{flex:none;width:84px}
  .gp-range::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:#FFD700;border:0;box-shadow:0 0 8px rgba(255,215,0,.7)}
  .gp-range::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:#FFD700;border:0}
  @media(min-width:640px){.gp-prog{order:0;flex-basis:auto;flex:1.4}.gp-vol{display:flex}}
  #gp-bar.mini{left:12px;right:auto;bottom:12px;width:auto;border:1px solid rgba(255,215,0,.35);border-radius:999px;padding:6px 8px}
  #gp-bar.mini .gp-info,#gp-bar.mini .gp-prog,#gp-bar.mini .gp-vol{display:none}
  #gp-bar.mini .gp-row{flex-wrap:nowrap;gap:6px}
  #gp-bar.mini .gp-cover{width:36px;height:36px;border-radius:50%}
  body.gp-on{padding-bottom:calc(110px + env(safe-area-inset-bottom,0px))!important}
  body.gp-on.gp-mini-on{padding-bottom:calc(70px + env(safe-area-inset-bottom,0px))!important}
  @keyframes gp-spin{to{transform:rotate(360deg)}}
  #gp-bar.playing.mini .gp-cover{animation:gp-spin 6s linear infinite}
  @media(prefers-reduced-motion:reduce){#gp-bar,#gp-bar.playing.mini .gp-cover{transition:none;animation:none}}`;

  var I = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
    vol: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>',
    min: '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>',
    max: '<svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>'
  };

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var bar = document.createElement('div');
  bar.id = 'gp-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'مشغل Gold Prod');
  bar.innerHTML =
    '<div class="gp-row">' +
      '<img class="gp-cover" alt="" width="44" height="44" decoding="async">' +
      '<div class="gp-info"><div class="gp-title">—</div><div class="gp-meta">GOLD PROD</div></div>' +
      '<button class="gp-btn gp-play" aria-label="تشغيل / إيقاف مؤقت">' + I.play + '</button>' +
      '<div class="gp-prog"><span class="gp-cur">0:00</span><input class="gp-range gp-seek" type="range" min="0" max="1000" value="0" aria-label="التقدم"><span class="gp-rem">-0:00</span></div>' +
      '<div class="gp-vol">' + I.vol + '<input class="gp-range gp-volr" type="range" min="0" max="100" value="80" aria-label="مستوى الصوت"></div>' +
      '<button class="gp-btn gp-min" aria-label="تصغير">' + I.min + '</button>' +
      '<button class="gp-btn gp-close" aria-label="إغلاق المشغل">' + I.close + '</button>' +
    '</div>';
  var audio = new Audio(); audio.preload = 'none';
  function init() {
    document.body.appendChild(bar);
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);

  var $ = function (s) { return bar.querySelector(s); };
  var cover = $('.gp-cover'), title = $('.gp-title'), meta = $('.gp-meta'), playB = $('.gp-play'),
      seek = $('.gp-seek'), cur = $('.gp-cur'), rem = $('.gp-rem'), volR = $('.gp-volr'),
      minB = $('.gp-min'), closeB = $('.gp-close');
  var FALLBACK = 'https://placehold.co/100x100/111/FFD700?text=GP';
  var current = null, vol = 0.8, fadeT = null;
  try { var sv = localStorage.getItem('gp_vol'); if (sv !== null) vol = Math.min(1, Math.max(0, +sv)); } catch (e) {}
  audio.volume = vol; volR.value = vol * 100; paint(volR, vol * 100);

  function fmt(s) { if (!isFinite(s) || s < 0) s = 0; return Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2); }
  function paint(el, pct) { el.style.setProperty('--p', pct + '%'); }
  function emit() {
    document.dispatchEvent(new CustomEvent('goldplayer:state', { detail: { src: current && current.src, playing: !audio.paused } }));
  }
  function ui() {
    playB.innerHTML = audio.paused ? I.play : I.pause;
    bar.classList.toggle('playing', !audio.paused); emit();
  }
  function fade(to, ms, cb) {
    clearInterval(fadeT);
    var from = audio.volume, n = 8, i = 0;
    fadeT = setInterval(function () {
      i++; audio.volume = Math.min(1, Math.max(0, from + (to - from) * i / n));
      if (i >= n) { clearInterval(fadeT); cb && cb(); }
    }, ms / n);
  }
  function show() {
    bar.classList.add('show'); document.body.classList.add('gp-on');
  }
  function swap(t) {
    current = t; cover.src = t.cover || FALLBACK; cover.onerror = function () { cover.onerror = null; cover.src = FALLBACK; };
    title.textContent = t.title || 'Untitled Beat'; meta.textContent = t.meta || 'GOLD PROD';
    audio.src = t.src; audio.load(); seek.value = 0; paint(seek, 0); cur.textContent = '0:00'; rem.textContent = '-0:00';
    show();
    var p = audio.play(); if (p && p.catch) p.catch(function () { ui(); });
    fade(vol, 250);
  }
  function play(t) {
    if (!t || !t.src) return;
    if (current && current.src === t.src) { toggle(); show(); return; }
    if (!audio.paused && current) fade(0, 150, function () { swap(t); }); else swap(t);
  }
  function toggle() { if (!current) return; audio.paused ? audio.play() : audio.pause(); }
  function setMini(m) {
    bar.classList.toggle('mini', m); document.body.classList.toggle('gp-mini-on', m);
    minB.innerHTML = m ? I.max : I.min; minB.setAttribute('aria-label', m ? 'توسيع' : 'تصغير');
  }
  function close() {
    audio.pause(); bar.classList.remove('show', 'mini'); document.body.classList.remove('gp-on', 'gp-mini-on'); setMini(false); current = null; emit();
  }

  playB.onclick = toggle; minB.onclick = function () { setMini(!bar.classList.contains('mini')); }; closeB.onclick = close;
  audio.addEventListener('play', ui); audio.addEventListener('pause', ui);
  audio.addEventListener('ended', function () { ui(); seek.value = 0; paint(seek, 0); });
  audio.addEventListener('error', function () { if (current) { title.textContent = 'تعذّر تحميل المقطع'; ui(); } });
  audio.addEventListener('timeupdate', function () {
    var d = audio.duration, c = audio.currentTime; if (!isFinite(d) || !d) return;
    var p = c / d * 1000; if (!seek._drag) { seek.value = p; paint(seek, p / 10); }
    cur.textContent = fmt(c); rem.textContent = '-' + fmt(d - c);
  });
  seek.addEventListener('input', function () { seek._drag = true; paint(seek, seek.value / 10); if (isFinite(audio.duration)) cur.textContent = fmt(audio.duration * seek.value / 1000); });
  seek.addEventListener('change', function () { if (isFinite(audio.duration)) audio.currentTime = audio.duration * seek.value / 1000; seek._drag = false; });
  volR.addEventListener('input', function () {
    vol = volR.value / 100; audio.volume = vol; paint(volR, volR.value);
    try { localStorage.setItem('gp_vol', vol); } catch (e) {}
  });
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && current && !/INPUT|TEXTAREA|SELECT|BUTTON|A/.test((e.target.tagName || '')) ) { e.preventDefault(); toggle(); }
  });

  // ربط تلقائي لأي عنصر يحمل data-beat-src (حتى العناصر المضافة لاحقاً)
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-beat-src]'); if (!el) return;
    e.preventDefault();
    play({ src: el.dataset.beatSrc, title: el.dataset.beatTitle, meta: el.dataset.beatMeta, cover: el.dataset.beatCover });
  });

  window.GoldPlayer = { play: play, toggle: toggle, close: close, audio: audio };
})();

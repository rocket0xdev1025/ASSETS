/* ===== CONFIG ===== */
const CONFIG = {
  CA: '0xba183698294a30804df16f2aad3106bb3facfa28',
  X: 'https://x.com/hyper_assets',
  TG: '',
  CHAIN: 'hyperevm'
};
/* ================== */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const valid = /^0x[a-fA-F0-9]{40}$/.test(CONFIG.CA);
  const caOut = valid ? CONFIG.CA : '0xba183698294a30804df16f2aad3106bb3facfa28';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
  const hasG = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* links */
  const links = {
    buy: 'https://app.hyperswap.exchange/#/swap?outputCurrency=' + caOut,
    chart: valid ? `https://dexscreener.com/${CONFIG.CHAIN}/${CONFIG.CA}` : 'https://dexscreener.com/hyperevm',
    x: CONFIG.X, tg: CONFIG.TG
  };
  $$('[data-link]').forEach(el => {
    const u = links[el.dataset.link];
    if (u && el.tagName === 'A') el.href = u;
    else if (el.dataset.link === 'tg' && u) { const a = document.createElement('a'); a.className = 'round'; a.href = u; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', 'Join Telegram'); a.innerHTML = '<svg><use href="#i-tg"/></svg>'; el.replaceWith(a); }
  });
  $('#caText').textContent = caOut;

  /* chart embed */
  if (valid) {
    const f = document.createElement('iframe');
    f.src = `https://dexscreener.com/${CONFIG.CHAIN}/${CONFIG.CA}?embed=1&theme=dark&trades=0&info=0`;
    f.title = '$ASSETS chart on DexScreener'; f.loading = 'lazy';
    $('#chartEmbed').appendChild(f); $('#chartOverlay').remove();
  }

  /* copy */
  const toast = $('#toast'); let tt;
  const say = m => { toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 1900); };
  const fallback = t => { const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok; };
  $$('[data-copy-ca]').forEach(b => b.addEventListener('click', async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(caOut); ok = true; } catch (e) { ok = fallback(caOut); }
    const lbl = b.querySelector('span'), prev = lbl ? lbl.textContent : '';
    b.classList.add('copied'); if (lbl) lbl.textContent = 'Copied';
    setTimeout(() => { b.classList.remove('copied'); if (lbl) lbl.textContent = prev; }, 1600);
    say(ok ? (valid ? 'CA copied. Bag secured.' : 'Copied "0xba183698294a30804df16f2aad3106bb3facfa28". CA drops at launch.') : 'Copy failed, select it manually');
  }));

  /* nav hide */
  const nav = $('#nav'); let ly = scrollY;
  addEventListener('scroll', () => { const y = scrollY; nav.classList.toggle('hide', y > ly && y > 200); ly = y; }, { passive: true });

  /* sparkles */
  const sp = $('#sparkles');
  if (!reduce) {
    const n = touch ? 14 : 30;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span'); const star = i % 5 === 0;
      s.className = 'spk' + (star ? ' star' : '');
      if (star) s.innerHTML = '<svg width="10" height="10"><use href="#i-spark"/></svg>';
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDuration = 9 + Math.random() * 12 + 's';
      s.style.animationDelay = -Math.random() * 20 + 's';
      s.style.opacity = .3 + Math.random() * .6;
      sp.appendChild(s);
    }
  }
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused'));
    $$('[data-loop]').forEach(el => io.observe(el));
  }

  /* cursor */
  const cur = $('#cursor');
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    (function loop() { cx += (x - cx) * .22; cy += (y - cy) * .22; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    $$('a,button').forEach(el => { el.addEventListener('mouseenter', () => cur.classList.add('hot')); el.addEventListener('mouseleave', () => cur.classList.remove('hot')); });
  } else cur.remove();

  /* lightbox */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), items = $$('.g-item'); let idx = 0, lastF;
  const show = i => { idx = (i + items.length) % items.length; const it = items[idx]; lbImg.src = it.dataset.full; lbImg.alt = it.querySelector('img').alt; };
  const open = i => { lastF = document.activeElement; show(i); lb.hidden = false; $('.lb-close').focus(); };
  const close = () => { lb.hidden = true; lastF && lastF.focus(); };
  items.forEach((it, i) => it.addEventListener('click', () => open(i)));
  $('.lb-close').onclick = close; $('.lb-prev').onclick = () => show(idx - 1); $('.lb-next').onclick = () => show(idx + 1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'Tab') { const f = $$('.lb-btn'); const a = f.indexOf(document.activeElement); e.preventDefault(); f[(a + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); } });

  /* appraisal notes (static state) */
  const notes = $$('.ap-notes li');
  const setStep = s => notes.forEach((li, i) => li.classList.toggle('on', i <= s));
  setStep(2);

  const loader = $('#loader');
  if (!hasG || reduce) { loader && loader.remove(); return; }

  /* ---------- motion ---------- */
  gsap.registerPlugin(ScrollTrigger);
  const amp = touch ? .5 : 1;
  let lenis;
  if (!touch && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -70 }); } }));
  }

  /* split title */
  $$('[data-split]').forEach(el => { el.innerHTML = [...el.textContent].map(c => `<span class="ch" aria-hidden="true">${c}</span>`).join(''); });
  $$('[data-words]').forEach(el => { el.setAttribute('aria-label', el.textContent); el.innerHTML = el.textContent.split(' ').map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(' '); });

  /* preloader */
  const num = $('#ldNum'), c = { v: 0 };
  gsap.set('.hero-title .ch', { yPercent: 120, rotate: () => gsap.utils.random(-25, 25), opacity: 0 });
  gsap.set(['.hero-sub', '.hero-cta', '.kicker'], { y: 30, opacity: 0 });
  gsap.set('#heroCard', { y: 80, scale: .8, opacity: 0 });
  gsap.set(['.b-hero', '.sfx-boing'], { scale: 0 });
  const intro = gsap.timeline();
  intro.to(c, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => num.textContent = String(Math.round(c.v)).padStart(3, '0') })
    .to('.ld-core', { scale: 1.3, opacity: 0, duration: .35 })
    .to('.ld-panel', { yPercent: i => i % 2 ? 100 : -100, duration: .7, ease: 'power4.inOut', stagger: .08 }, '-=.1')
    .add(() => loader.remove())
    .to('.hero-title .ch', { yPercent: 0, rotate: 0, opacity: 1, duration: .9, ease: 'elastic.out(1,.45)', stagger: .04 }, '-=.45')
    .to('.hero-title .ch', { scaleY: .82, scaleX: 1.12, duration: .12, yoyo: true, repeat: 1, stagger: .02, transformOrigin: '50% 100%' }, '-=.3')
    .to(['.kicker', '.hero-sub', '.hero-cta'], { y: 0, opacity: 1, duration: .6, stagger: .08, ease: 'power3.out' }, '-=.6')
    .to('#heroCard', { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1,.5)' }, '-=.7')
    .to(['.b-hero', '.sfx-boing'], { scale: 1, duration: .6, ease: 'back.out(3)', stagger: .12 }, '-=.6');

  /* hero parallax (pinned on desktop) */
  const htl = gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: touch ? 'bottom top' : '+=70%', scrub: true, pin: !touch } });
  htl.to('.hero-banner img', { scale: 1.25, yPercent: 8 * amp, ease: 'none' }, 0)
    .fromTo('.ghost-word', { xPercent: 5 }, { xPercent: -30 * amp, ease: 'none' }, 0)
    .to('#heroCard', { y: -60 * amp, rotate: -4 * amp, scale: 1.08, ease: 'none' }, 0)
    .to('.bento', { y: 30 * amp, ease: 'none' }, 0)
    .to('.b-hero', { y: -40 * amp, x: 20 * amp, ease: 'none' }, 0)
    .to('.hero-copy', { y: -40 * amp, opacity: .6, ease: 'none' }, 0);

  /* signature: Asset Appraisal */
  const fill = $('#meterFill'), read = $('#apReadout');
  const labels = ['PAPER', 'REAL', 'HYPER REAL'];
  let cur3 = -1;
  const setLabel = s => { if (s === cur3) return; cur3 = s; read.textContent = labels[s]; setStep(s);
    gsap.fromTo(read, { scale: .6, rotate: -8 }, { scale: 1, rotate: 0, duration: .5, ease: 'back.out(3)' });
    gsap.fromTo('#apCard', { scaleY: .86, scaleX: 1.1 }, { scaleY: 1, scaleX: 1, duration: .8, ease: 'elastic.out(1.2,.3)' }); };
  gsap.set(fill, { scaleX: .04 }); setLabel(0);
  const ap = gsap.timeline({ scrollTrigger: { trigger: '#appraisal', start: touch ? 'top 60%' : 'top top', end: touch ? 'bottom 60%' : '+=160%', scrub: .6, pin: touch ? false : '.ap-pin',
    onUpdate: st => setLabel(st.progress < .36 ? 0 : st.progress < .7 ? 1 : 2) } });
  ap.to(fill, { scaleX: .4, ease: 'none', duration: 1 })
    .to('.ap-sfx.s1', { opacity: 1, scale: 1.15, duration: .2, ease: 'back.out(3)' }, .3)
    .to(fill, { scaleX: .72, ease: 'none', duration: 1 })
    .to('.ap-sfx.s2', { opacity: 1, scale: 1.15, duration: .2 }, 1.3)
    .to('#apCard', { rotate: 3, y: -10 * amp, duration: .4 }, 1.2)
    .to(fill, { scaleX: 1, ease: 'none', duration: 1 })
    .to('.ap-sfx.s3', { opacity: 1, scale: 1.25, duration: .2 }, 2.3)
    .to('#apCard', { rotate: -3, scale: 1.06, duration: .4 }, 2.2);

  /* word reveals */
  $$('[data-words]').forEach(h => gsap.from(h.querySelectorAll('.w'), { yPercent: 110, rotate: 6, opacity: 0, stagger: .06, duration: .7, ease: 'back.out(2)', scrollTrigger: { trigger: h, start: 'top 85%' } }));
  gsap.from('.pill', { scale: .6, opacity: 0, stagger: .06, ease: 'back.out(2.5)', duration: .6, scrollTrigger: { trigger: '.pills', start: 'top 85%' } });
  gsap.from('.step', { y: 60, opacity: 0, stagger: .1, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
  gsap.from('.g-item', { clipPath: 'inset(0 100% 0 0)', stagger: .1, duration: .8, ease: 'power3.inOut', scrollTrigger: { trigger: '.gallery', start: 'top 85%' } });
  gsap.fromTo('.join-bg', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.join', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* idle jiggle on hero card (paused off-screen) */
  const jig = gsap.to('#heroCard img', { scaleY: .97, scaleX: 1.02, duration: .9, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3, paused: false });
  ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom top', onToggle: s => s.isActive ? jig.play() : jig.pause() });
})();

(function () {
  'use strict';
  var S = window.SITE, CATS = window.CATEGORIES;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var catLabel = function (k) { var c = CATS.filter(function (c) { return c.key === k; })[0]; return c ? c.label : k; };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  /* ---------- Page transitions ---------- */
  requestAnimationFrame(function () { document.body.classList.add('ready'); });
  window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); document.body.classList.add('ready'); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || reduce) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.protocol.indexOf('http') !== 0 && url.protocol !== 'file:') return;
    if (url.pathname === location.pathname) { closeMenu(); return; } // in-page anchor
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 420);
  });

  /* ---------- Navigation ---------- */
  var nav = $('.nav'), menu = $('.mobile-menu'), menuBtn = $('.menu-btn');
  function onScroll() { if (nav) nav.classList.toggle('solid', window.scrollY > 40 || nav.hasAttribute('data-solid')); }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open'); document.body.classList.remove('locked');
    menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu';
  }
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var open = !menu.classList.contains('open');
    if (!open) return closeMenu();
    menu.classList.add('open'); document.body.classList.add('locked');
    menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.textContent = 'Close';
  });

  /* ---------- Scroll: nav state + gentle parallax ---------- */
  var par = $$('[data-parallax]'), ticking = false;
  function frame() {
    ticking = false; onScroll();
    if (reduce) return;
    var vh = window.innerHeight;
    par.forEach(function (p) {
      var r = p.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var k = parseFloat(p.getAttribute('data-parallax')) || 0.08;
      var off = (r.top + r.height / 2 - vh / 2) * -k;
      p.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* ---------- Reveal on scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  function watch(root) { $$('.reveal', root).forEach(function (n) { io ? io.observe(n) : n.classList.add('in'); }); }

  /* ---------- Artwork rendering (never cropped: frame uses the file's own ratio) ---------- */
  function media(art, alt) {
    if (art.src) {
      var img = el('img'); img.src = art.src; img.alt = alt; img.loading = 'lazy'; img.decoding = 'async';
      if (art.w && art.h) { img.width = art.w; img.height = art.h; }
      if (img.complete) img.classList.add('loaded'); else img.addEventListener('load', function () { img.classList.add('loaded'); });
      return img;
    }
    return el('div', 'ph', 'Image pending');
  }
  function figure(art, list, extra) {
    var f = el('figure', 'art reveal' + (extra ? ' ' + extra : ''));
    var b = el('button', 'art-frame'); b.type = 'button';
    var name = art.title || catLabel(art.category) + ' — artwork';
    b.setAttribute('aria-label', 'View ' + name);
    if (art.w && art.h) b.style.aspectRatio = art.w + ' / ' + art.h;
    b.appendChild(media(art, name));
    b.addEventListener('click', function () { openViewer(list, list.indexOf(art), b); });
    var c = el('figcaption');
    c.appendChild(el('b', null, art.title || '—'));
    c.appendChild(el('span', null, [catLabel(art.category), art.year].filter(Boolean).join(' · ')));
    f.appendChild(b); f.appendChild(c);
    return f;
  }
  function fillSlot(sel, src, label) {
    var slot = $(sel); if (!slot) return;
    if (src) { var i = el('img'); i.src = src; i.alt = label; slot.replaceChildren(i); }
  }

  /* ---------- Home ---------- */
  fillSlot('[data-slot="hero"]', S.hero, 'Painting by Marlon Romero Gomez');
  fillSlot('[data-slot="intro"]', S.introArt, 'Painting by Marlon Romero Gomez');
  fillSlot('[data-slot="portrait"]', S.portrait, 'Marlon Romero Gomez');
  fillSlot('[data-slot="about-art"]', S.aboutArt, 'Painting by Marlon Romero Gomez');

  var works = $('#works');
  if (works) {
    var feat = S.featured.map(function (id) { return S.artworks.filter(function (a) { return a.id === id; })[0]; }).filter(Boolean);
    var slots = ['w-full', 'w-a', 'w-b', 'w-solo', 'w-c', 'w-d'];
    feat.forEach(function (a, i) { works.appendChild(figure(a, feat, slots[i % slots.length])); });
  }

  var exh = $('#exh-list');
  if (exh && S.exhibitions.length) {
    exh.replaceChildren();
    S.exhibitions.forEach(function (x) {
      var li = el('li', 'reveal');
      li.appendChild(el('span', 'n', x.year || ''));
      var t = el('span', 't', x.title || x.venue || '');
      if (x.title && x.venue) t.appendChild(el('small', null, x.venue));
      li.appendChild(t); li.appendChild(el('span', 'p', x.place || ''));
      exh.appendChild(li);
    });
  }

  var det = $('#contact-details');
  if (det) {
    var c = S.contact, add = function (text, href) {
      if (!text) return;
      var n = href ? el('a', null, text) : el('span', null, text);
      if (href) { n.href = href; if (/^http/.test(href)) { n.target = '_blank'; n.rel = 'noopener'; } }
      var row = el('div'); row.appendChild(n); det.appendChild(row);
    };
    add(c.email, c.email && 'mailto:' + c.email);
    add(c.phone, c.phone && 'tel:' + c.phone.replace(/[^\d+]/g, ''));
    add(c.location);
    add(c.instagram && 'Instagram', c.instagram);
    add(c.facebook && 'Facebook', c.facebook);
  }

  /* ---------- Gallery page ---------- */
  var grid = $('#gallery'), tabs = $('#tabs');
  if (grid && tabs) {
    var title = $('#gal-title'), current;
    var keyFromUrl = function () {
      var k = new URLSearchParams(location.search).get('c');
      return CATS.some(function (c) { return c.key === k; }) ? k : CATS[0].key;
    };
    var render = function (key) {
      current = key;
      var list = S.artworks.filter(function (a) { return a.category === key; });
      grid.replaceChildren();
      list.forEach(function (a) { grid.appendChild(figure(a, list)); });
      title.textContent = catLabel(key);
      document.title = catLabel(key) + ' — Marlon Romero Gomez';
      $$('button', tabs).forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.key === key)); });
      watch(grid);
    };
    var show = function (key, push) {
      if (key === current) return;
      if (push) history.pushState(null, '', '?c=' + key);
      if (reduce || !current) return render(key);
      grid.classList.add('swap');
      setTimeout(function () { render(key); grid.classList.remove('swap'); }, 480);
    };
    CATS.forEach(function (c) {
      var b = el('button', null, c.label); b.type = 'button'; b.dataset.key = c.key; b.setAttribute('role', 'tab');
      var n = S.artworks.filter(function (a) { return a.category === c.key; }).length;
      b.appendChild(el('sup', null, String(n).padStart(2, '0')));
      b.addEventListener('click', function () { show(c.key, true); });
      tabs.appendChild(b);
    });
    window.addEventListener('popstate', function () { show(keyFromUrl(), false); });
    show(keyFromUrl(), false);
  }
  watch(document);

  /* ---------- Full-screen viewer ---------- */
  var viewer, stage, cap, count, vList = [], vIdx = 0, opener = null;
  function buildViewer() {
    viewer = el('div', 'viewer'); viewer.setAttribute('role', 'dialog'); viewer.setAttribute('aria-modal', 'true'); viewer.setAttribute('aria-label', 'Artwork viewer');
    var top = el('div', 'viewer-top'); count = el('span', 'label');
    var close = el('button', null, 'Close'); close.type = 'button'; close.addEventListener('click', closeViewer);
    top.appendChild(count); top.appendChild(close);
    stage = el('div', 'viewer-stage');
    var bottom = el('div', 'viewer-bottom'); cap = el('div', 'viewer-cap'); cap.setAttribute('aria-live', 'polite');
    var navs = el('div', 'viewer-nav');
    var prev = el('button', null, '← Previous'), next = el('button', null, 'Next →');
    prev.type = next.type = 'button';
    prev.addEventListener('click', function () { step(-1); }); next.addEventListener('click', function () { step(1); });
    navs.appendChild(prev); navs.appendChild(next); bottom.appendChild(cap); bottom.appendChild(navs);
    viewer.appendChild(top); viewer.appendChild(stage); viewer.appendChild(bottom);
    document.body.appendChild(viewer);

    stage.addEventListener('click', function (e) { if (e.target === stage) closeViewer(); });
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 == null || $('.zoomed', stage)) return;
      var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1); x0 = null;
    });
    document.addEventListener('keydown', function (e) {
      if (!viewer.classList.contains('open')) return;
      if (e.key === 'Escape') closeViewer();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') { // keep focus inside
        var f = $$('button', viewer), i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
  }
  function paint() {
    var art = vList[vIdx], name = art.title || catLabel(art.category) + ' — artwork', node;
    if (art.src) {
      node = el('img'); node.alt = name; node.src = art.src;
      var origin = function (e) {
        var r = stage.getBoundingClientRect();
        node.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
      };
      node.addEventListener('click', function (e) { origin(e); node.classList.toggle('zoomed'); });
      node.addEventListener('pointermove', function (e) { if (node.classList.contains('zoomed')) origin(e); });
      var on = function () { requestAnimationFrame(function () { node.classList.add('show'); }); };
      if (node.complete) on(); else node.addEventListener('load', on);
    } else {
      node = el('div', 'ph', 'Image pending'); node.style.aspectRatio = art.w + ' / ' + art.h;
      requestAnimationFrame(function () { node.classList.add('show'); });
    }
    stage.replaceChildren(node);
    cap.replaceChildren();
    cap.appendChild(el('div', 't', art.title || '—'));
    var meta = [catLabel(art.category), art.medium, art.size, art.year].filter(Boolean).join(' · ');
    cap.appendChild(el('div', 'm', meta));
    if (art.description) cap.appendChild(el('div', 'd', art.description));
    count.textContent = String(vIdx + 1).padStart(2, '0') + ' / ' + String(vList.length).padStart(2, '0');
    var nx = vList[(vIdx + 1) % vList.length]; if (nx.src) { new Image().src = nx.src; } // preload next
  }
  function step(d) { vIdx = (vIdx + d + vList.length) % vList.length; paint(); }
  function openViewer(list, i, from) {
    if (!viewer) buildViewer();
    vList = list; vIdx = Math.max(0, i); opener = from; paint();
    viewer.classList.add('open'); document.body.classList.add('locked');
    $('.viewer-top button', viewer).focus();
  }
  function closeViewer() {
    viewer.classList.remove('open'); document.body.classList.remove('locked');
    if (opener) opener.focus();
  }

  /* ---------- Contact form ---------- */
  var form = $('#contact-form');
  if (form) {
    var started = Date.now(), status = $('.form-status', form), btn = $('button[type="submit"]', form);
    var rules = {
      name: function (v) { return v.length >= 2 || 'Please enter your name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Please enter a valid email address.'; },
      subject: function (v) { return v.length >= 2 || 'Please add a subject.'; },
      message: function (v) { return v.length >= 10 || 'Please write a short message.'; }
    };
    var check = function (name) {
      var input = form.elements[name], res = rules[name](input.value.trim()), field = input.closest('.field');
      field.classList.toggle('invalid', res !== true);
      $('.err', field).textContent = res === true ? '' : res;
      input.setAttribute('aria-invalid', String(res !== true));
      return res === true;
    };
    Object.keys(rules).forEach(function (n) {
      form.elements[n].addEventListener('blur', function () { check(n); });
      form.elements[n].addEventListener('input', function () { if (form.elements[n].closest('.field').classList.contains('invalid')) check(n); });
    });
    var say = function (msg, cls) { status.textContent = msg; status.className = 'form-status ' + (cls || ''); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) { var bad = $('.invalid input, .invalid textarea', form); if (bad) bad.focus(); return say('Please check the highlighted fields.', 'bad'); }
      // Spam protection: hidden honeypot field + minimum time on page. Bots get a silent "success".
      if (form.elements.website.value || Date.now() - started < 3000) { form.reset(); return say('Thank you. Your message has been sent.', 'ok'); }
      if (!S.formEndpoint) return say('The form is not connected yet — please set formEndpoint in js/data.js.', 'bad');
      var data = {}; Object.keys(rules).forEach(function (n) { data[n] = form.elements[n].value.trim(); });
      btn.disabled = true; say('Sending…');
      fetch(S.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); say('Thank you. Your message has been sent — Marlon will reply personally.', 'ok'); })
        .catch(function () { say('Something went wrong and the message was not sent. Please try again in a moment.', 'bad'); })
        .then(function () { btn.disabled = false; });
    });
  }
})();

/* NewFound Partners — interactions */
(function () {
  'use strict';

  /* ---- nav: scrolled state + mobile toggle ---- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  function onScroll() {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    var t = document.getElementById('toTop');
    if (window.scrollY > 600) t.classList.add('show');
    else t.classList.remove('show');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      nav.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        nav.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var toTop = document.getElementById('toTop');
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- count-up stats ---- */
  function formatNum(n) { return n.toLocaleString('en-US'); }
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(Math.floor(eased * target)) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counts = document.querySelectorAll('.stat__num[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counts.forEach(function (el) { cio.observe(el); });
  }

  /* ---- portfolio filter ---- */
  var filterBar = document.getElementById('pfFilters');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.pf-card'));
  var emptyMsg = document.getElementById('pfEmpty');
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.pf__filter');
      if (!btn) return;
      var f = btn.getAttribute('data-filter');
      filterBar.querySelectorAll('.pf__filter').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      var shown = 0;
      cards.forEach(function (c) {
        var cats = c.getAttribute('data-cat') || '';
        var match = f === 'all' || cats.split(' ').indexOf(f) !== -1;
        c.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (emptyMsg) emptyMsg.hidden = shown !== 0;
    });
  }

  /* ---- project modal ---- */
  var modal = document.getElementById('projectModal');
  var PROJECTS = window.NFP_PROJECTS || {};
  if (modal) {
    var pmImg = document.getElementById('pmImg');
    var pmThumbs = document.getElementById('pmThumbs');
    var pmPrev = document.getElementById('pmPrev');
    var pmNext = document.getElementById('pmNext');
    var pmName = document.getElementById('pmName');
    var pmLoc = document.getElementById('pmLoc');
    var pmStatus = document.getElementById('pmStatus');
    var pmAbout = document.getElementById('pmAbout');
    var gallery = [];
    var idx = 0;
    var lastFocused = null;

    function showImg(i) {
      if (!gallery.length) return;
      idx = (i + gallery.length) % gallery.length;
      pmImg.src = gallery[idx];
      Array.prototype.forEach.call(pmThumbs.children, function (b, n) {
        b.classList.toggle('is-active', n === idx);
      });
    }

    function openProject(id) {
      var p = PROJECTS[id];
      if (!p) return;
      gallery = (p.images && p.images.length) ? p.images.slice() : [];
      pmName.textContent = p.title || '';
      pmLoc.textContent = p.location || '';
      pmAbout.textContent = p.about || '';
      pmStatus.textContent = p.status || '';
      pmStatus.classList.toggle('is-active', p.status === 'Active');
      // build thumb dots
      pmThumbs.innerHTML = '';
      var multi = gallery.length > 1;
      pmPrev.classList.toggle('is-hidden', !multi);
      pmNext.classList.toggle('is-hidden', !multi);
      if (multi) {
        gallery.forEach(function (_, n) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', 'Image ' + (n + 1));
          b.addEventListener('click', function () { showImg(n); });
          pmThumbs.appendChild(b);
        });
      }
      pmImg.alt = p.title || 'Project image';
      showImg(0);
      lastFocused = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('pm-open');
    }

    function closeProject() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('pm-open');
      pmImg.src = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    document.querySelectorAll('.pf-card[data-project]').forEach(function (card) {
      card.addEventListener('click', function () { openProject(card.getAttribute('data-project')); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card.getAttribute('data-project')); }
      });
    });
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closeProject);
    });
    pmPrev.addEventListener('click', function () { showImg(idx - 1); });
    pmNext.addEventListener('click', function () { showImg(idx + 1); });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeProject();
      else if (e.key === 'ArrowLeft') showImg(idx - 1);
      else if (e.key === 'ArrowRight') showImg(idx + 1);
    });
  }

  /* ---- active nav link on scroll ---- */
  var sections = ['approach', 'portfolio', 'team', 'contact'];
  var navAnchors = {};
  links && links.querySelectorAll('a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#') navAnchors[href.slice(1)] = a;
  });
  function markActive() {
    var pos = window.scrollY + 120, current = '';
    sections.forEach(function (id) {
      var s = document.getElementById(id);
      if (s && s.offsetTop <= pos) current = id;
    });
    Object.keys(navAnchors).forEach(function (id) {
      navAnchors[id].classList.toggle('is-current', id === current && !navAnchors[id].classList.contains('nav__cta'));
    });
  }
  window.addEventListener('scroll', markActive, { passive: true });
  markActive();

})();

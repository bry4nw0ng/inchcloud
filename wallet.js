(function () {
  "use strict";

  var PEEK = 58;
  var N = 6;
  var state = { focused: null, act: {} };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---- shuffle line (about panel) — click the underlined text to randomize ----
  var actions = [
    'overpacking for a three-day trip',
    'ruining another steak in pursuit of the perfect one',
    'praying that the flush comes out on the river',
    'conquering the planet',
    'thinking about getting a second bowl of chipotle',
    'trying out random tft comps',
    'practicing bowser/terry combos',
    'getting lost in a fan-made pokemon rom hack',
    'exploring a minecraft modpack',
    'launching threes with more confidence than accuracy',
    'training to hit 185 bench press before the end of the year',
    'looking for a festival set to leave in the background',
    'tinkering with this website',
  ];

  // ---- activity data (work detail) ----
  var work = [
    { logo: 'assets/logos/assurant.jpeg', company: 'assurant', role: 'global tax tech & operations intern', dates: '07/25 — 05/26',
      desc: "automating the global tax team's manual reconciliation workflows — and building the dashboards that keep them honest.",
      tags: ['python', 'sql', 'excel automation'] },
    { logo: 'assets/logos/sbu.jpeg', company: 'stony brook university', role: 'software engineering intern · hr dept', dates: '02/25 — 05/25',
      desc: "shipping features and fixes across the department's internal web apps — and keeping the team's site and tooling alive.",
      tags: ['javascript', 'php', 'mysql'] },
    { logo: 'assets/logos/nobledesktop.jpeg', company: 'noble desktop', role: 'python teaching assistant', dates: '07/24 — 08/24',
      desc: "walking high-schoolers through their first python programs — labs, office hours, and a lot of debugging side by side.",
      tags: ['python', 'pygame', 'teaching'] }
  ];
  var extra = [
    { logo: 'assets/logos/google.jpeg', company: 'google & basta', role: 'software engineering fellow', dates: '09/25 — 12/25',
      desc: 'a 10-week fellowship built on pair programming, mentored one-on-one by a google senior swe.',
      tags: ['pair programming', 'mentorship'] },
    { logo: 'assets/logos/bnl.jpeg', company: 'brookhaven national laboratory', role: 'diversity professional leadership network extern', dates: '08/24 — 05/25',
      desc: 'job shadows plus 1:1 coaching — a year of watching how real engineering teams actually work.',
      tags: ['job shadow', 'coaching'] },
    { logo: 'assets/logos/casb.png', company: 'chinese association at stony brook', role: 'webmaster · fundraising chair · graphic designer', dates: '2022 — 2026',
      desc: 'webmaster now, fundraising chair (raised $1,000+), and before that the graphic designer — ran the site, ran the money, and made the posters.',
      tags: ['leadership', 'design', 'fundraising'] }
  ];

  // ---- coursework data (student detail) ----
  // tags drive the colored tab on each row: 'eng' (cs, maroon) and
  // 'des' (design, gold). list both to split the tab (top half / bottom half).
  var courses = [
    // cs
    { name: 'oop',                           code: 'cse 114',     tags: ['eng'] },
    { name: 'data structures',               code: 'cse 214',     tags: ['eng'] },
    { name: 'foundations of cs',             code: 'cse 215',     tags: ['eng'] },
    { name: 'programming abstractions',      code: 'cse 216',     tags: ['eng'] },
    { name: 'systems fundamentals',          code: 'cse 220/320', tags: ['eng'] },
    { name: 'theory of computation',         code: 'cse 303',     tags: ['eng'] },
    { name: 'computing ethics & law',        code: 'cse 312',     tags: ['eng'] },
    { name: 'scripting languages',           code: 'cse 337',     tags: ['eng'] },
    { name: 'technical communication',       code: 'cse 300',     tags: ['eng'] },
    { name: 'computer networks',             code: 'cse 310',     tags: ['eng'] },
    { name: 'data science',                  code: 'cse 351',     tags: ['eng'] },
    { name: 'nlp',                           code: 'cse 354',     tags: ['eng'] },
    { name: 'algorithms',                    code: 'cse 373',     tags: ['eng'] },
    { name: 'python fintech, ai & cloud',    code: 'ise 391',     tags: ['eng'] },
    { name: 'machine learning',              code: 'cse 353',     tags: ['eng'] },
    // both
    { name: 'software development',          code: 'cse 316',     tags: ['eng', 'des'] },
    { name: 'software engineering',          code: 'cse 416',     tags: ['eng', 'des'] },
    { name: 'web design & culture',          code: 'ars 327',     tags: ['eng', 'des'] },
    // design
    { name: 'digital art',                   code: 'ars 225',     tags: ['des'] },
    { name: 'digital media history/theory',  code: 'arh 207',     tags: ['des'] }
  ];
  var skills = [
    { name: 'react',    tags: ['eng'] },
    { name: 'python',   tags: ['eng'] },
    { name: 'postgres', tags: ['eng'] },
    { name: 'pytorch',  tags: ['eng'] },
    { name: 'figma',    tags: ['des'] },
    { name: 'adobe cc', tags: ['des'] }
  ];

  // colored category tabs shared by course + skill rows
  function tabsHtml(tags) {
    return '<div class="course__tabs">' + tags.map(function (t) {
      return '<span class="course__tab course__tab--' + t + '"></span>';
    }).join('') + '</div>';
  }
  function courseRow(c) {
    return '<div class="course">' + tabsHtml(c.tags) +
      '<div class="course__name">' + esc(c.name) + '</div>' +
      '<div class="course__meta">' + esc(c.code) + '</div>' +
    '</div>';
  }
  function skillPill(s) {
    return '<span class="skill">' +
      '<span class="skill__cube skill__cube--' + s.tags[0] + '"></span>' +
      esc(s.name) +
    '</span>';
  }

  function activityRow(it, key) {
    var tags = it.tags.map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join('');
    return '<div class="activity" data-actrow="' + key + '">' +
      '<div class="activity__head" data-acttoggle="' + key + '">' +
        '<div class="activity__logo"><img src="' + it.logo + '" alt="' + esc(it.company) + '"></div>' +
        '<div class="activity__main">' +
          '<div class="activity__company">' + esc(it.company) + '</div>' +
          '<div class="activity__role">' + esc(it.role) + '</div>' +
          '<div class="activity__dates">' + esc(it.dates) + '</div>' +
        '</div>' +
        '<svg class="activity__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b6b6ab" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>' +
      '</div>' +
      '<div class="activity__body">' +
        '<div class="activity__inner">' +
          '<p class="activity__desc">' + esc(it.desc) + '</p>' +
          '<div class="activity__tags">' + tags + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // clone a <template> from index.html by id, returning its root element
  function tmpl(id) {
    return document.getElementById(id).content.firstElementChild.cloneNode(true);
  }

  // ---- build DOM ----
  var wallet = document.getElementById('wallet');
  wallet.className = 'wallet';

  var back = document.createElement('div');
  back.className = 'back-btn';
  back.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1c1c1a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>';
  back.addEventListener('click', function () { state.focused = null; state.act = {}; apply(); });
  wallet.appendChild(back);

  var cardEls = [];
  var panelEls = [];
  for (var i = 0; i < N; i++) {
    (function (idx) {
      var card = document.createElement('div');
      card.className = 'card';
      card.appendChild(tmpl('face-' + idx));
      card.addEventListener('click', function () {
        state.focused = (state.focused === idx) ? null : idx;
        state.act = {};
        apply();
      });
      wallet.appendChild(card);
      cardEls[idx] = card;

      var panel = tmpl('detail-' + idx);
      wallet.appendChild(panel);
      panelEls[idx] = panel;
    })(i);
  }

  // work panel: render activity rows from the work/extra data into the
  // [data-group] anchors in the detail-2 template (keeps DOM order identical)
  panelEls[2].querySelector('[data-group="work"]').insertAdjacentHTML('afterend',
    work.map(function (it, i) { return activityRow(it, 'w' + i); }).join(''));
  panelEls[2].querySelector('[data-group="extra"]').insertAdjacentHTML('afterend',
    extra.map(function (it, i) { return activityRow(it, 'e' + i); }).join(''));

  // student panel: course rows + the skills marquee (rendered into both groups
  // so the track loops seamlessly)
  panelEls[1].querySelector('[data-courses]').innerHTML = courses.map(courseRow).join('');
  var skillsHtml = skills.map(skillPill).join('');
  panelEls[1].querySelectorAll('[data-skills]').forEach(function (g) { g.innerHTML = skillsHtml; });

  // about panel: clicking the underlined text swaps in a random action
  // (never the same one twice in a row)
  //
  // actions vary in length, so the longest ones wrap to an extra line. left
  // alone, that makes the paragraph (and everything below it) grow and shrink
  // as the text changes. lockShuffleHeight() measures the tallest variant and
  // pins the paragraph's min-height to it, so the block always reserves the
  // taller height — short actions just leave the extra line blank instead of
  // shifting the rest of the panel.
  var lockShuffleHeight = function () {};
  (function () {
    var el = panelEls[0].querySelector('[data-shuffle]');
    if (!el) return;
    var para = el.closest('.lead');
    var cur = Math.floor(Math.random() * actions.length);
    el.textContent = actions[cur];
    el.addEventListener('click', function () {
      var next = cur;
      while (actions.length > 1 && next === cur) {
        next = Math.floor(Math.random() * actions.length);
      }
      cur = next;
      el.textContent = actions[cur];
    });

    lockShuffleHeight = function () {
      // offsetParent is null while the panel is display:none — can't measure yet
      if (!para || para.offsetParent === null) return;
      para.style.minHeight = '';
      var max = 0;
      for (var i = 0; i < actions.length; i++) {
        el.textContent = actions[i];
        if (para.offsetHeight > max) max = para.offsetHeight;
      }
      el.textContent = actions[cur];
      para.style.minHeight = max + 'px';
    };
    // width changes the wrap point, so remeasure when the window resizes
    window.addEventListener('resize', lockShuffleHeight);
  })();

  // [data-copy] elements (footer mail pill + about-me email): copy to clipboard
  // and flash "copied!" instead of navigating
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  document.querySelectorAll('[data-copy]').forEach(function (el) {
    var label = el.querySelector('[data-copy-label]') || el;
    var original = label.textContent;
    var revert;

    function flash() {
      label.textContent = 'copied!';
      clearTimeout(revert);
      revert = setTimeout(function () { label.textContent = original; }, 1500);
    }
    function copy() {
      var text = el.getAttribute('data-copy');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(flash, function () { fallbackCopy(text); flash(); });
      } else {
        fallbackCopy(text);
        flash();
      }
    }
    el.addEventListener('click', function (e) { e.preventDefault(); copy(); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); }
    });
  });

  // wire activity toggles inside work panel
  panelEls[2].querySelectorAll('[data-acttoggle]').forEach(function (el) {
    var key = el.getAttribute('data-acttoggle');
    el.addEventListener('click', function () {
      if (state.act[key]) { delete state.act[key]; } else { state.act[key] = true; }
      apply();
    });
  });

  // ---- positioning (computed per state, so kept inline) ----
  function positionCard(el, i) {
    var stackPos = N - 1 - i;
    var f = state.focused;
    el.style.zIndex = String(stackPos + 1);
    if (f === null) {
      el.style.top = (stackPos * PEEK) + 'px';
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      return;
    }
    if (i === f) {
      el.style.top = '0px';
      el.style.zIndex = '200';
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      return;
    }
    var up = stackPos < (N - 1 - f);
    el.style.top = (stackPos * PEEK) + 'px';
    el.style.transform = 'translateY(' + (up ? '-135%' : '135%') + ')';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
  }

  function apply() {
    var active = state.focused !== null;
    wallet.classList.toggle('is-active', active);
    // active: let the open panel (now in normal flow) drive the wallet's height
    // so the whole page scrolls — no fixed box, no inner scrollbar
    wallet.style.height = active ? 'auto' : (5 * PEEK + 314) + 'px';

    for (var i = 0; i < N; i++) {
      positionCard(cardEls[i], i);
      panelEls[i].classList.toggle('is-open', state.focused === i);
    }

    // the about panel just became visible — now that it has layout, reserve
    // space for the tallest shuffle action so swapping text doesn't shift things
    if (state.focused === 0) lockShuffleHeight();

    panelEls[2].querySelectorAll('[data-actrow]').forEach(function (row) {
      row.classList.toggle('is-open', !!state.act[row.getAttribute('data-actrow')]);
    });
  }

  // ---- initial load-in: every card slides up from the bottom ----
  // seed each card below its resting spot, then let apply() animate it home
  for (var j = 0; j < N; j++) {
    cardEls[j].style.transform = 'translateY(135%)';
    cardEls[j].style.opacity = '0';
    // stagger by stack position so the cards fan in instead of moving as one
    cardEls[j].style.transitionDelay = ((N - 1 - j) * 0.06) + 's';
  }
  // reserve the wallet's resting height now (cards are absolutely positioned,
  // so without this the wallet collapses until apply() runs — which, with the
  // preload below, is late enough that the footer visibly rides up to the top
  // and then snaps back down once the cards start falling in)
  wallet.style.height = (5 * PEEK + 314) + 'px';

  // commit the seeded state before the transition runs
  void wallet.offsetHeight;

  // the card faces' images live inside <template>s, so the browser doesn't
  // fetch them until the faces are cloned into the DOM (just above). if we
  // animate right away the cards slide up with empty <img> slots and the art
  // "blinks" in once it decodes. so: preload every card image, then start the
  // slide-up once they're all ready — with a timeout fallback so a slow or
  // broken image can never stall the intro.
  function preloadCardImages() {
    var imgs = [];
    for (var i = 0; i < N; i++) {
      cardEls[i].querySelectorAll('img').forEach(function (img) { imgs.push(img); });
    }
    return Promise.all(imgs.map(function (img) {
      // decode() waits for the pixels, not just the response; if it's already
      // loaded this resolves instantly. swallow errors so one bad image can't
      // reject the whole batch.
      if (img.decode) return img.decode().catch(function () {});
      if (img.complete) return Promise.resolve();
      return new Promise(function (res) {
        img.addEventListener('load', res, { once: true });
        img.addEventListener('error', res, { once: true });
      });
    }));
  }

  function startEntrance() {
    requestAnimationFrame(function () {
      apply();
      // clear the stagger so it doesn't bleed into focus/back animations
      window.setTimeout(function () {
        for (var k = 0; k < N; k++) cardEls[k].style.transitionDelay = '';
      }, 900);
    });
  }

  // race the preload against a cap so the intro always plays promptly
  var started = false;
  function go() { if (!started) { started = true; startEntrance(); } }
  preloadCardImages().then(go);
  window.setTimeout(go, 1200);

  // ---- project videos: click-to-play posters + polite background buffering ----
  // each .proj__media shows a paper poster tile over a lazy <video>. clicking
  // the tile reveals and plays the (by-then hopefully buffered) clip. separately
  // we warm the clips in the background — after the intro, one at a time, and
  // never on slow/metered connections — so they're ready by the time the user
  // reaches the projects card.
  var medias = Array.prototype.slice.call(document.querySelectorAll('[data-media]'));

  medias.forEach(function (m) {
    var vid = m.querySelector('[data-vid]');
    var poster = m.querySelector('[data-poster]');
    if (!vid || !poster) return;
    poster.addEventListener('click', function () {
      m.classList.add('is-playing');
      vid.preload = 'auto';
      vid.play().catch(function () {});
    });
  });

  function warmVideos() {
    // respect data-saver and slow connections — don't pull ~100MB unasked
    var conn = navigator.connection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;

    var vids = medias.map(function (m) { return m.querySelector('[data-vid]'); })
      .filter(Boolean);
    var i = 0;
    (function next() {
      if (i >= vids.length) return;
      var v = vids[i++];
      // user already tapped play on this one? its own playback is buffering it
      if (v.preload === 'auto') { next(); return; }
      v.preload = 'auto';
      var done = false;
      function advance() {
        if (done) return;
        done = true;
        window.clearTimeout(cap);
        next();
      }
      // move to the next once this one can play through, on error, or after a
      // cap so one big/slow file can't block the rest forever
      v.addEventListener('canplaythrough', advance, { once: true });
      v.addEventListener('error', advance, { once: true });
      var cap = window.setTimeout(advance, 20000);
      v.load();
    })();
  }

  if (medias.length) {
    var idle = window.requestIdleCallback || function (fn) { return window.setTimeout(fn, 1); };
    // let the intro breathe before we start pulling video bytes
    window.setTimeout(function () { idle(warmVideos); }, 2000);
  }
})();

(function () {
  "use strict";

  // one card per face template in index.html, so adding a pass there is the
  // only edit needed — nothing in here has to be kept in step with the markup.
  var N = document.querySelectorAll('template[id^="face-"]').length;
  if (document.querySelectorAll('template[id^="detail-"]').length !== N) {
    console.warn('wallet: face/detail template counts disagree — every face-N needs a detail-N');
  }

  // ---- geometry ----
  // the card is 8/5 in css (aspect-ratio on every face), matching the art.
  // everything else is expressed as a fraction of the card so the stack scales
  // with the viewport instead of assuming the 480×300 desktop size.
  var RATIO = 8 / 5;           // card width : height
  var PEEK_RATIO = 58 / 300;   // exposed strip per stacked card, as a fraction
  var SLACK = 14;              // fixed breathing room under the stack
  var geo = { cardH: 300, peek: 58 };

  function measure() {
    // derived from the wallet's width rather than read off a card: the intro
    // seeds card positions before anything has painted, so there is no laid-out
    // card to measure yet.
    var w = wallet.clientWidth;
    if (w) {
      geo.cardH = w / RATIO;
      geo.peek = geo.cardH * PEEK_RATIO;
    }
    return geo;
  }
  function restingHeight() {
    return (N - 1) * geo.peek + geo.cardH + SLACK;
  }

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
      desc: "automated a lot of the global tax team's manual work. set up overdue-item emails to accountants, scheduled excel workbook refreshes, and moved their old excel due-date tracker into microsoft lists.",
      tags: ['python', 'sql', 'power bi', 'power automate'] },
    { logo: 'assets/logos/sbu.jpeg', company: 'stony brook university', role: 'software engineering intern · hr dept', dates: '02/25 — 05/25',
      desc: "automated how the hr website's calendars got updated. wrote php and python scripts for auto-deploys and log metrics. used silktide to make the site more accessible and lift its ux score. the rest was upkeep, fixing broken links as things changed and updating pages through omni cms.",
      tags: ['js', 'php', 'python', 'cms', 'silktide'] },
    { logo: 'assets/logos/nobledesktop.jpeg', company: 'noble desktop', role: 'python teaching assistant', dates: '07/24 — 08/24 · 06/26 — 07/26',
      desc: "helped teach python to students from high school through university, online and in person. ran sessions on python basics, data science, and machine learning, with a lot of debugging side by side.",
      tags: ['python', 'numpy', 'pandas', 'seaborn', 'sklearn'] }
  ];
  var extra = [
    { logo: 'assets/logos/google.jpeg', company: 'google & basta', role: 'software engineering fellow', dates: '09/25 — 12/25',
      desc: 'a 10-week fellowship built on pair programming, mentored 1:1 by a google senior swe.' },
    { logo: 'assets/logos/bnl.jpeg', company: 'brookhaven national laboratory', role: 'diversity professional leadership network extern', dates: '08/24 — 05/25',
      desc: "mentored by an electrical engineering manager who worked on the lab's particle accelerator collider. a year of job shadows and 1:1 coaching, seeing how real engineering teams actually work." },
    { logo: 'assets/logos/casb.png', company: 'chinese association at stony brook', role: 'webmaster · fundraising chair · graphic designer', dates: '2022 — 2026',
      desc: "spent all four undergrad years spreading chinese culture on campus through events, fundraisers, and collaborations with other clubs. served as webmaster, fundraising chair, graphic designer, and representative along the way." }
  ];
  var education = [
    { logo: 'assets/logos/sbu2.png', company: 'stony brook university', role: 'b.s. computer science · minor digital arts', dates: '08/22 — 05/26',
      desc: "studied computer science with a digital arts minor. more on the coursework and skills over in the student pass." },
    { logo: 'assets/logos/stuy.jpeg', company: 'stuyvesant high school', role: 'high school diploma', dates: '09/18 — 06/22',
      desc: "one of nyc's specialized public high schools, where the cs classes first got me hooked on building things." }
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
    { name: 'python',     tags: ['eng'] },
    { name: 'java',       tags: ['eng'] },
    { name: 'javascript', tags: ['eng'] },
    { name: 'c',          tags: ['eng'] },
    { name: 'react',      tags: ['eng'] },
    { name: 'pytorch',    tags: ['eng'] },
    { name: 'numpy',      tags: ['eng'] },
    { name: 'pandas',     tags: ['eng'] },
    { name: 'sql',        tags: ['eng'] },
    { name: 'git',        tags: ['eng'] },
    { name: 'figma',      tags: ['des'] },
    { name: 'canva',      tags: ['des'] },
    { name: 'adobe cc',   tags: ['des'] }
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
    var tags = (it.tags || []).map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join('');
    return '<div class="activity" data-actrow="' + key + '">' +
      '<div class="activity__head" data-acttoggle="' + key + '" role="button" tabindex="0"' +
        ' aria-expanded="false" aria-controls="actbody-' + key + '">' +
        // alt="" because the company name sits in the text right beside it —
        // with the row now a button, a duplicate would land in its own name
        '<div class="activity__logo"><img src="' + it.logo + '" alt=""></div>' +
        '<div class="activity__main">' +
          '<div class="activity__company">' + esc(it.company) + '</div>' +
          '<div class="activity__role">' + esc(it.role) + '</div>' +
          '<div class="activity__dates">' + esc(it.dates) + '</div>' +
        '</div>' +
        '<svg class="activity__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b6b6ab" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>' +
      '</div>' +
      '<div class="activity__body" id="actbody-' + key + '">' +
        '<div class="activity__inner">' +
          '<p class="activity__desc">' + esc(it.desc) + '</p>' +
          (tags ? '<div class="activity__tags">' + tags + '</div>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // clone a <template> from index.html by id, returning its root element
  function tmpl(id) {
    var t = document.getElementById(id);
    if (!t) throw new Error('wallet: missing <template id="' + id + '">');
    return t.content.firstElementChild.cloneNode(true);
  }

  // the card faces are art with no text equivalent, so each card carries its
  // own name. kept short on purpose: with arrow-key browsing a screen reader
  // reads this on every keypress. falls back if a face is added without one.
  var CARD_LABELS = [
    'my id',
    'student id',
    'professional experience',
    'projects',
    'chinese association at stony brook',
    'more about me',
  ];

  // ---- build DOM ----
  var wallet = document.getElementById('wallet');
  wallet.className = 'wallet';

  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'back-btn';
  back.setAttribute('aria-label', 'close this pass');
  back.tabIndex = -1;      // nothing is open yet; apply() takes it from here
  back.innerHTML = '<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1c1c1a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>';
  back.addEventListener('click', closeCard);
  wallet.appendChild(back);

  var cardEls = [];
  var panelEls = [];
  for (var i = 0; i < N; i++) {
    (function (idx) {
      var card = document.createElement('div');
      card.className = 'card';
      card.appendChild(tmpl('face-' + idx));
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', CARD_LABELS[idx] || ('card ' + (idx + 1)));
      card.setAttribute('aria-expanded', 'false');
      card.setAttribute('aria-controls', 'panel-' + idx);
      card.addEventListener('click', function () { toggleCard(idx); });
      card.addEventListener('keydown', function (e) { cardKey(e, idx); });
      wallet.appendChild(card);
      cardEls[idx] = card;

      var panel = tmpl('detail-' + idx);
      panel.id = 'panel-' + idx;
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
  panelEls[2].querySelector('[data-group="education"]').insertAdjacentHTML('afterend',
    education.map(function (it, i) { return activityRow(it, 'ed' + i); }).join(''));

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

    var lockedAt = -1;   // panel width the current min-height was measured at

    lockShuffleHeight = function () {
      // offsetParent is null while the panel is display:none — can't measure yet
      if (!para || para.offsetParent === null) return;
      // the answer only depends on where the text wraps, so it goes stale only
      // when the paragraph's width changes. worth checking: the loop below
      // forces a synchronous layout per action, and this runs on every resize
      // frame and every open of the about panel.
      if (para.clientWidth === lockedAt) return;
      lockedAt = para.clientWidth;
      para.style.minHeight = '';
      var max = 0;
      for (var i = 0; i < actions.length; i++) {
        el.textContent = actions[i];
        if (para.offsetHeight > max) max = para.offsetHeight;
      }
      el.textContent = actions[cur];
      para.style.minHeight = max + 'px';
    };
    // width changes the wrap point, so this needs to rerun on resize — but it
    // rides the single rAF-coalesced resize handler below (via apply) rather
    // than adding a listener of its own that fires on every raw resize event.
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
    function toggle() {
      if (state.act[key]) { delete state.act[key]; } else { state.act[key] = true; }
      apply();
    }
    el.addEventListener('click', toggle);
    // these rows are role=button on a div (their contents are divs, which a
    // real <button> may not legally hold), so enter/space are ours to wire
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // ---- keyboard ----
  // cards are role=button, so enter and space toggle them exactly like a click.
  // arrows walk the stack visually rather than by index: positionCard puts
  // index 0 at the BOTTOM (stackPos = N - 1 - i), so up increments and down
  // decrements. get that backwards and the whole thing feels inverted.
  function toggleCard(i) {
    state.focused = (state.focused === i) ? null : i;
    state.act = {};
    apply();
  }

  function closeCard() {
    var i = state.focused;
    if (i === null) return;
    state.focused = null;
    state.act = {};
    apply();
    // apply() has already lifted inert, so the card can take focus again —
    // without this, closing strands focus on a collapsed element
    cardEls[i].focus();
  }

  function cardKey(e, idx) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();          // space would otherwise scroll the page
      toggleCard(idx);
      return;
    }
    // walking the stack only means anything while it is closed; with a panel
    // open the other cards are inert and could not take focus regardless
    if (state.focused !== null) return;
    var next;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = idx + 1;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = idx - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = N - 1;
    else return;
    e.preventDefault();
    // stop at the ends rather than wrapping — tab also moves between cards,
    // and wrapping arrows on top of that reads as unpredictable
    if (next >= 0 && next < N) cardEls[next].focus();
  }

  // escape works from anywhere inside the open panel, not just from the card
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    // a project video in fullscreen also exits on escape — let the browser have
    // that one rather than collapsing the panel out from under the user
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    closeCard();
  });

  // ---- positioning (computed per state, so kept inline) ----
  function positionCard(el, i) {
    var stackPos = N - 1 - i;
    var f = state.focused;
    el.style.zIndex = String(stackPos + 1);
    if (f === null) {
      el.style.top = (stackPos * geo.peek) + 'px';
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
    el.style.top = (stackPos * geo.peek) + 'px';
    el.style.transform = 'translateY(' + (up ? '-135%' : '135%') + ')';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
  }

  function apply() {
    var active = state.focused !== null;
    wallet.classList.toggle('is-active', active);
    // active: let the open panel (now in normal flow) drive the wallet's height
    // so the whole page scrolls — no fixed box, no inner scrollbar
    wallet.style.height = active ? 'auto' : restingHeight() + 'px';

    for (var i = 0; i < N; i++) {
      positionCard(cardEls[i], i);
      panelEls[i].classList.toggle('is-open', state.focused === i);
      // the buried cards are invisible to the mouse (opacity + pointer-events)
      // but tab does not read either of those — inert takes them out of the tab
      // order and the accessibility tree together
      var buried = active && state.focused !== i;
      cardEls[i].setAttribute('aria-expanded', state.focused === i ? 'true' : 'false');
      cardEls[i].setAttribute('tabindex', buried ? '-1' : '0');
      if ('inert' in cardEls[i]) { cardEls[i].inert = buried; }
    }
    // same story for the back button, which is opacity:0 when nothing is open
    back.tabIndex = active ? 0 : -1;
    if ('inert' in back) { back.inert = !active; }

    // the about panel just became visible — now that it has layout, reserve
    // space for the tallest shuffle action so swapping text doesn't shift things
    if (state.focused === 0) lockShuffleHeight();

    panelEls[2].querySelectorAll('[data-actrow]').forEach(function (row) {
      row.classList.toggle('is-open', !!state.act[row.getAttribute('data-actrow')]);
    });
    panelEls[2].querySelectorAll('[data-acttoggle]').forEach(function (el) {
      el.setAttribute('aria-expanded', state.act[el.getAttribute('data-acttoggle')] ? 'true' : 'false');
    });
  }

  // ---- initial load-in: every card slides up from the bottom ----
  measure();

  // seed each card at its final `top` but pushed below the wallet, so the only
  // things the intro animates are transform + opacity. (setting `top` for the
  // first time inside the entrance would snap instead of animating — a
  // transition can't interpolate from `auto` — and that snap, happening
  // mid-slide, is what made the fan-out look jumbled.)
  for (var j = 0; j < N; j++) {
    var seedPos = N - 1 - j;
    cardEls[j].style.top = (seedPos * geo.peek) + 'px';
    cardEls[j].style.zIndex = String(seedPos + 1);
    cardEls[j].style.transform = 'translateY(135%)';
    cardEls[j].style.opacity = '0';
    // stagger by stack position so the cards fan in instead of moving as one
    cardEls[j].style.transitionDelay = (seedPos * 0.06) + 's';
  }
  // reserve the wallet's resting height now (cards are absolutely positioned,
  // so without this the wallet collapses until apply() runs — which, with the
  // preload below, is late enough that the footer visibly rides up to the top
  // and then snaps back down once the cards start falling in)
  wallet.style.height = restingHeight() + 'px';

  // commit the seeded state before the transition runs
  void wallet.offsetHeight;

  // ---- preloader gate ----
  // the faces live inside <template>s and two of them are css backgrounds, so
  // none of this art is fetched until the faces are cloned into the DOM. the
  // <link rel="preload"> hints in index.html start the downloads earlier; this
  // gate makes sure we don't animate until they've actually decoded.
  //
  // read off the <link rel="preload" data-face> hints in index.html instead of
  // being listed again here. scraping the DOM for <img> wouldn't work — it
  // silently misses nyc-skyline and sbu-card, which are css background-images —
  // and a second hand-kept copy would drift: add a pass, forget this list, and
  // the gate opens on art that hasn't decoded.
  var FACE_IMAGES = Array.prototype.map.call(
    document.querySelectorAll('link[data-face]'),
    function (link) { return link.getAttribute('href'); }
  );
  

  var MIN_SHOWN = 1250;   // the cloud always gets its full beat, even on a warm
                          // cache where the art is ready immediately
  var MAX_WAIT  = 4000;   // a 404 or a stalled network must never trap the user

  function preloadFaces() {
    return Promise.all(FACE_IMAGES.map(function (src) {
      return new Promise(function (res) {
        var img = new Image();
        img.src = src;
        // decode() waits for pixels, not just bytes, and resolves instantly if
        // the image is already cached. res on failure too — one broken file
        // must not hold the whole batch.
        if (img.decode) { img.decode().then(res, res); }
        else { img.onload = img.onerror = res; }
      });
    }));
  }

  var entranceStarted = false;

  function startEntrance() {
    entranceStarted = true;
    requestAnimationFrame(function () {
      apply();
      // clear the stagger so it doesn't bleed into focus/back animations.
      // driven off the last card's own transition rather than a fixed timer,
      // which previously left the delays live if the user tapped early.
      var last = cardEls[0];   // stack position N-1 — the biggest delay
      var cleared = false;
      function clearDelays(e) {
        // transitionend fires per property; opacity (.4s) lands before
        // transform (.6s), and rewriting transition-delay on an in-flight
        // transform would restart it. wait for the transform specifically.
        if (e && e.propertyName !== 'transform') return;
        if (cleared) return;
        cleared = true;
        last.removeEventListener('transitionend', clearDelays);
        for (var k = 0; k < N; k++) cardEls[k].style.transitionDelay = '';
      }
      last.addEventListener('transitionend', clearDelays);
      window.setTimeout(clearDelays, 1400);   // backstop if the event is missed
    });
  }

  var preloader = document.getElementById('preloader');
  // it is already on screen — css shows it by default. performance.now() rather
  // than Date.now() so a clock adjustment mid-load can't skew the hold.
  var shownAt = performance.now();
  var settled = false;

  function finish() {
    if (settled) return;
    settled = true;
    // hold the cloud for its full beat even if the art was ready instantly,
    // then cross its fade with the cards rising so the two overlap rather
    // than play back to back
    var held = Math.max(0, MIN_SHOWN - (performance.now() - shownAt));
    window.setTimeout(function () {
      preloader.classList.add('is-done');
      window.setTimeout(startEntrance, 200);
      window.setTimeout(function () { preloader.classList.add('is-gone'); }, 500);
    }, held);
  }

  preloadFaces().then(finish);
  window.setTimeout(finish, MAX_WAIT);

  // the card's height follows the wallet's width, so a rotation or window drag
  // changes the whole stack's spacing — remeasure and re-lay-out. coalesced
  // into one frame because resize fires continuously while dragging.
  var resizeRaf = 0;
  window.addEventListener('resize', function () {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = 0;
      measure();
      // before the intro fires the cards are still seeded off-screen; just keep
      // the reserved height honest rather than starting the entrance early
      if (entranceStarted) { apply(); }
      else { wallet.style.height = restingHeight() + 'px'; }
    });
  });

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

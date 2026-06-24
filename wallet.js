(function () {
  "use strict";

  var PEEK = 58;
  var N = 6;
  var state = { focused: null, act: null };

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
    'learning bowser/terry combos',
    'getting lost in a fan-made pokemon rom hack',
    'exploring a minecraft modpack',
    'launching threes with more confidence than accuracy',
    'training to hit 185 bench before the end of the year',
    'looking for a festival set to leave in the background',
  ];

  // ---- activity data (work detail) ----
  var work = [
    { logo: 'assets/assurant.jpeg', company: 'assurant', role: 'global tax tech & operations intern', dates: '07/25 — 05/26',
      desc: "automating the global tax team's manual reconciliation workflows — and building the dashboards that keep them honest.",
      tags: ['python', 'sql', 'excel automation'] },
    { logo: 'assets/sbu.jpeg', company: 'stony brook university', role: 'software engineering intern · hr dept', dates: '02/25 — 05/25',
      desc: "shipping features and fixes across the department's internal web apps — and keeping the team's site and tooling alive.",
      tags: ['javascript', 'php', 'mysql'] },
    { logo: 'assets/nobledesktop.jpeg', company: 'noble desktop', role: 'python teaching assistant', dates: '07/24 — 08/24',
      desc: "walking high-schoolers through their first python programs — labs, office hours, and a lot of debugging side by side.",
      tags: ['python', 'pygame', 'teaching'] }
  ];
  var extra = [
    { logo: 'assets/google.jpeg', company: 'google & basta', role: 'software engineering fellow', dates: '09/25 — 12/25',
      desc: 'a 10-week fellowship built on pair programming, mentored one-on-one by a google senior swe.',
      tags: ['pair programming', 'mentorship'] },
    { logo: 'assets/bnl.jpeg', company: 'brookhaven national laboratory', role: 'diversity professional leadership network extern', dates: '08/24 — 05/25',
      desc: 'job shadows plus 1:1 coaching — a year of watching how real engineering teams actually work.',
      tags: ['job shadow', 'coaching'] },
    { logo: 'assets/casb.png', company: 'chinese association at stony brook', role: 'webmaster · fundraising chair · graphic designer', dates: '2022 — 2026',
      desc: 'webmaster now, fundraising chair (raised $1,000+), and before that the graphic designer — ran the site, ran the money, and made the posters.',
      tags: ['leadership', 'design', 'fundraising'] }
  ];

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
  back.addEventListener('click', function () { state.focused = null; state.act = null; apply(); });
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
        state.act = null;
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
      state.act = (state.act === key) ? null : key;
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
    wallet.style.height = active ? '830px' : (5 * PEEK + 314) + 'px';

    for (var i = 0; i < N; i++) {
      positionCard(cardEls[i], i);
      panelEls[i].classList.toggle('is-open', state.focused === i);
    }

    // the about panel just became visible — now that it has layout, reserve
    // space for the tallest shuffle action so swapping text doesn't shift things
    if (state.focused === 0) lockShuffleHeight();

    panelEls[2].querySelectorAll('[data-actrow]').forEach(function (row) {
      row.classList.toggle('is-open', state.act === row.getAttribute('data-actrow'));
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
  // commit the seeded state before the transition runs
  void wallet.offsetHeight;

  requestAnimationFrame(function () {
    apply();
    // clear the stagger so it doesn't bleed into focus/back animations
    window.setTimeout(function () {
      for (var k = 0; k < N; k++) cardEls[k].style.transitionDelay = '';
    }, 900);
  });
})();

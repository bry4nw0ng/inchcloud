(function () {
  "use strict";

  var PEEK = 58;
  var N = 6;
  var state = { focused: null, act: null };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---- card faces (index 0 = bottom of stack, 5 = top) ----
  var faces = [
    // 0 — NYC ID
    '<div class="card-nyc">' +
      '<div class="card-nyc__name">bryan wong</div>' +
      '<img class="id-photo id-photo--nyc" src="assets/bryan-id.jpg" alt="bryan wong" draggable="false">' +
      '<div class="card-nyc__badge">est. 2004</div>' +
    '</div>',
    // 1 — STUDENT
    '<div class="card-student">' +
      '<div class="card-student__title">stony brook university</div>' +
      '<img class="id-photo id-photo--grad" src="assets/bryan-grad.jpg" alt="bryan wong graduation" draggable="false">' +
      '<div class="card-student__meta">' +
        '<div class="card-student__year">class of 2026</div>' +
        '<div class="card-student__degree">b.s. computer science · minor digital arts</div>' +
      '</div>' +
    '</div>',
    // 2 — WORK
    '<div class="card-work">' +
      '<div class="card-work__orb"></div>' +
      '<div class="card-work__sheen"></div>' +
      '<div><div class="card-work__title">professional experience</div></div>' +
      '<div class="card-work__chips">' +
        '<svg width="46" height="35" viewBox="0 0 44 34" fill="none" stroke="rgba(28,46,55,.55)" stroke-width="1.3"><rect x="1" y="1" width="42" height="32" rx="5"></rect><path d="M1 12h13M30 12h13M1 22h13M30 22h13"></path><rect x="14" y="8" width="16" height="18" rx="3"></rect></svg>' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c2e37" stroke-width="1.5" stroke-linecap="round" style="opacity:.55;"><path d="M5 10.5a3 3 0 0 1 0 3"></path><path d="M8.5 8a6 6 0 0 1 0 8"></path><path d="M12 5.5a9.5 9.5 0 0 1 0 13"></path></svg>' +
      '</div>' +
      '<div class="card-work__foot">' +
        '<div class="card-work__holder-wrap">' +
          '<div class="card-work__holder-label">cardholder</div>' +
          '<div class="card-work__holder-name">b. w.</div>' +
        '</div>' +
      '</div>' +
    '</div>',
    // 3 — PROJECTS
    '<img class="card-img card-img--projects" src="assets/projects-card.png" alt="projects" draggable="false">',
    // 4 — CLUB
    '<img class="card-img card-img--club" src="assets/casb-photo.png" alt="casb night market" draggable="false">',
    // 5 — PERSONAL (boarding pass)
    '<img class="card-img card-img--boarding" src="assets/boarding-pass.png" alt="boarding pass" draggable="false">'
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

  // ---- detail panels ----
  var details = [];

  // 0 — NYC
  details[0] = '<div class="detail detail--card detail--nyc">' +
    '<div class="kicker">who</div>' +
    '<p class="lead">cs grad who keeps drifting to the product side — talking to users, sketching flows, deciding what\'s worth shipping. comfortable in the code, happiest figuring out what to build and why.</p>' +
    '<div class="link-col">' +
      '<a class="link-row" href="https://linkedin.com/in/bry4nw0ng" target="_blank" rel="noopener">linkedin.com/in/bry4nw0ng <span class="link-row__arrow">↗</span></a>' +
      '<a class="link-row" href="https://github.com/bry4nw0ng" target="_blank" rel="noopener">github.com/bry4nw0ng <span class="link-row__arrow">↗</span></a>' +
    '</div>' +
  '</div>';

  // 1 — STUDENT
  details[1] = '<div class="detail detail--card detail--student">' +
    '<div class="kicker">standout courses</div>' +
    '<div class="chips">' +
      ['2d game programming', 'nlp', 'machine learning', 'data science'].map(function (c) {
        return '<span class="chip">' + c + '</span>';
      }).join('') +
    '</div>' +
    '<div class="kicker kicker--gap">skills</div>' +
    '<p class="skills-list">react · python · figma · postgres · pytorch · adobe cc</p>' +
    '<p class="note">b.s. computer science with a minor in digital arts — the design half is on purpose.</p>' +
  '</div>';

  // 2 — WORK
  details[2] = '<div class="detail detail--card detail--work">' +
    '<div class="detail__title-wrap"><div class="detail__title">recent activity</div></div>' +
    '<div class="activity-group">work</div>' +
    work.map(function (it, i) { return activityRow(it, 'w' + i); }).join('') +
    '<div class="activity-group activity-group--later">extracurriculars</div>' +
    extra.map(function (it, i) { return activityRow(it, 'e' + i); }).join('') +
  '</div>';

  // 3 — PROJECTS (loose-leaf)
  details[3] = '<div class="detail detail--paper">' +
    '<div class="looseleaf__margin"></div>' +
    '<div class="proj proj--first">' +
      '<div class="proj__head"><span class="proj__name">p4sbu</span><span class="proj__date">apr 2025</span></div>' +
      '<div class="proj__stack">react · node · express · postgres · mapbox · heroku</div>' +
      '<p class="proj__desc">a full-stack campus parking system. real-time lot availability, reservations, and secure payments; mapbox routes you to the nearest open spot, and an admin dashboard handles live changes + analytics.</p>' +
      '<div class="slot slot--wide">drop a p4sbu screenshot</div>' +
    '</div>' +
    '<div class="proj">' +
      '<div class="proj__head"><span class="proj__name">phreddit</span><span class="proj__date">dec 2024</span></div>' +
      '<div class="proj__stack">mongodb · express · react · node</div>' +
      '<p class="proj__desc">a full-stack reddit clone — posts, comments, voting, communities. mern stack, restful apis, jwt auth + session cookies.</p>' +
      '<div class="slot slot--wide">drop a phreddit screenshot</div>' +
    '</div>' +
  '</div>';

  // 4 — CLUB
  details[4] = '<div class="detail detail--card detail--club">' +
    '<div class="kicker">leadership</div>' +
    '<p class="club__lead">webmaster now, ex-fundraising chair (raised <strong>$1,000+</strong>), and before all that the graphic designer. so: ran the site, ran the money, and made the posters.</p>' +
    '<div class="kicker kicker--gap">design work</div>' +
    '<div class="design-grid">' +
      '<div class="slot slot--tile">poster</div>' +
      '<div class="slot slot--tile">flyer</div>' +
      '<div class="slot slot--tile">graphic</div>' +
    '</div>' +
    '<p class="club__note">craft, shown — drop the real work in here.</p>' +
  '</div>';

  // 5 — PERSONAL
  details[5] = '<div class="detail detail--card detail--personal">' +
    '<div class="kicker">off the clock</div>' +
    '<p class="personal__lead">weekends are for trails and the occasional very wrong turn.</p>' +
  '</div>';

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
      card.innerHTML = faces[idx];
      card.addEventListener('click', function () {
        state.focused = (state.focused === idx) ? null : idx;
        state.act = null;
        apply();
      });
      wallet.appendChild(card);
      cardEls[idx] = card;

      var holder = document.createElement('div');
      holder.innerHTML = details[idx];
      var panel = holder.firstChild;
      wallet.appendChild(panel);
      panelEls[idx] = panel;
    })(i);
  }

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

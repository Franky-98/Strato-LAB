// Strato Lab: script del sito
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Forma "cookie": raggio che oscilla attorno a un cerchio.
  function cookie(cx, cy, R, n, a, rot) {
    var d = '', N = 160;
    for (var i = 0; i <= N; i++) {
      var th = i / N * Math.PI * 2;
      var r = R * (1 + a * Math.cos(n * th + rot));
      d += (i ? 'L' : 'M') + (cx + r * Math.cos(th)).toFixed(2) + ' ' + (cy + r * Math.sin(th)).toFixed(2);
    }
    return d + 'Z';
  }
  var shapes = document.querySelectorAll('svg[data-cookie]');
  for (var i = 0; i < shapes.length; i++) {
    var s = shapes[i];
    s.querySelector('path').setAttribute('d', cookie(32, 32, 28 / (1 + parseFloat(s.getAttribute('data-a'))), parseInt(s.getAttribute('data-cookie'), 10), parseFloat(s.getAttribute('data-a')), 0));
  }

  // Hero: tre forme che respirano, la grande è riempita di linee di strato.
  var pBig = document.getElementById('pBig'), pS1 = document.getElementById('pS1'), pS2 = document.getElementById('pS2');
  var st = ''; for (var y = 6; y < 400; y += 9) st += 'M0 ' + y + 'H400';
  document.getElementById('stripes').setAttribute('d', st);
  function drawHero(t) {
    pBig.setAttribute('d', cookie(200, 200, 148, 9, 0.065 + 0.055 * Math.sin(t * 0.9), t * 0.35));
    pS1.setAttribute('d', cookie(76, 326, 54, 6, 0.09 + 0.05 * Math.sin(t * 1.3 + 1), -t * 0.5));
    pS2.setAttribute('d', cookie(336, 66, 40, 12, 0.06 + 0.03 * Math.sin(t * 1.1 + 2), t * 0.6));
  }
  drawHero(0);

  // Materiali
  var MATS = [
    { n: 'PLA', t: '~55 °C', d: 'Il più facile da stampare: dettagli netti e tantissimi colori.', u: 'Prototipi, modelli, oggetti da interno.', m: [0.25, 0.9, 0.1, 0.3] },
    { n: 'PETG', t: '~75 °C', d: 'Tenace, resiste all\'umidità e agli urti senza rompersi di netto.', u: 'Contenitori, supporti, parti funzionali.', m: [0.45, 0.6, 0.35, 0.5] },
    { n: 'ASA', t: '~95 °C', d: 'Come l\'ABS ma stabile ai raggi UV e agli agenti atmosferici.', u: 'Esterni, auto, moto, nautica.', m: [0.7, 0.65, 0.25, 0.95] },
    { n: 'TPU 95A', t: '~80 °C', d: 'Flessibile ed elastico, assorbe urti e vibrazioni.', u: 'Guarnizioni, paraurti, impugnature.', m: [0.5, 0.1, 0.95, 0.6] },
    { n: 'Nylon rinforzato', t: '>100 °C', d: 'Rigido e resistente all\'usura e alla fatica.', u: 'Ingranaggi, boccole, staffe sotto carico.', m: [0.85, 0.8, 0.3, 0.45] }
  ];
  var LABELS = ['Calore', 'Rigidità', 'Flessibilità', 'Raggi UV'];
  var seg = document.getElementById('seg'), metrics = document.getElementById('metrics');
  var waves = [], tracks = [], values = [0.25, 0.9, 0.1, 0.3];
  LABELS.forEach(function (l, i) {
    var wrap = document.createElement('div');
    wrap.className = 'metric';
    wrap.innerHTML = '<span class="label"><span>' + l + '</span></span><svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path class="track"/><path class="wave"/></svg>';
    metrics.appendChild(wrap);
    tracks.push(wrap.querySelector('.track'));
    waves.push(wrap.querySelector('.wave'));
  });
  function drawWaves(phase) {
    for (var i = 0; i < waves.length; i++) {
      var v = Math.max(0.06, values[i]), len = v * 300 - 6, d = '';
      for (var x = 0; x <= len; x += 3) {
        d += (x ? 'L' : 'M') + x.toFixed(1) + ' ' + (10 + 4 * Math.sin(x / 7 + phase)).toFixed(1);
      }
      waves[i].setAttribute('d', d || 'M0 10');
      tracks[i].setAttribute('d', 'M' + (len + 12).toFixed(1) + ' 10H300');
    }
  }
  function pick(idx) {
    var m = MATS[idx];
    document.getElementById('m-name').textContent = m.n;
    document.getElementById('m-temp').textContent = 'Resiste fino a ' + m.t;
    document.getElementById('m-desc').textContent = m.d;
    document.getElementById('m-uses').textContent = 'Ideale per: ' + m.u;
    values = m.m;
    var bs = seg.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', i === idx ? 'true' : 'false');
    drawWaves(0);
  }
  MATS.forEach(function (m, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = m.n;
    b.addEventListener('click', function () { pick(i); });
    seg.appendChild(b);
  });
  pick(0);

  if (!reduce) {
    var t0 = null;
    (function loop(ts) {
      if (t0 === null) t0 = ts;
      var t = (ts - t0) / 1000;
      drawHero(t);
      drawWaves(-t * 2.2);
      requestAnimationFrame(loop);
    })(performance.now());
  }

  // Stima rapida (valori di esempio)
  var eMat = document.getElementById('e-mat'), eG = document.getElementById('e-g'), eQ = document.getElementById('e-q');
  var eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  function fill(el) { el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); }
  function estimate() {
    var g = +eG.value, q = +eQ.value, rate = +eMat.value;
    var disc = q >= 50 ? 0.3 : q >= 20 ? 0.2 : q >= 10 ? 0.1 : 0;
    var unit = (6 + g * rate) * (1 - disc);
    var tot = unit * q + 3;
    document.getElementById('o-g').textContent = g + ' g';
    document.getElementById('o-q').textContent = q;
    document.getElementById('r-tot').textContent = eur.format(tot);
    document.getElementById('r-unit').textContent = eur.format(unit) + ' a pezzo, più 3 € di avvio ordine.';
    document.getElementById('r-disc').textContent = disc ? 'Sconto quantità incluso: ' + Math.round(disc * 100) + '%.' : 'Sopra i 10 pezzi parte lo sconto quantità.';
    fill(eG); fill(eQ);
  }
  [eMat, eG, eQ].forEach(function (el) { el.addEventListener('input', estimate); });
  estimate();

  // Copia indirizzo e testo della richiesta
  function copier(getText, getNode, done) {
    var text = getText();
    function fallback() {
      try { var r = document.createRange(); r.selectNodeContents(getNode()); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
      done(false);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }
  var mailBtn = document.getElementById('copymail');
  mailBtn.addEventListener('click', function () {
    copier(function () { return document.getElementById('mailaddr').textContent; }, function () { return document.getElementById('mailaddr'); },
      function (ok) { mailBtn.textContent = ok ? 'Copiato' : 'Selezionato'; setTimeout(function () { mailBtn.textContent = 'Copia'; }, 1800); });
  });
  var result = document.getElementById('result'), out = document.getElementById('out');
  document.getElementById('quote').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (id) { return document.getElementById(id).value.trim(); };
    out.textContent = [
      'Richiesta di preventivo',
      'Nome: ' + v('f-nome'),
      'Email: ' + v('f-email'),
      'Tipo di lavoro: ' + v('f-tipo'),
      'Materiale: ' + v('f-mat'),
      'Quantità: ' + (v('f-qta') || '1'),
      'Serve entro il: ' + (v('f-data') || 'non specificato'),
      'Descrizione: ' + (v('f-desc') || 'nessuna'),
      '',
      'Allego il file 3D (STL, 3MF o STEP).'
    ].join('\n');
    result.classList.add('show');
  });
  document.getElementById('copyout').addEventListener('click', function () {
    copier(function () { return out.textContent; }, function () { return out; },
      function (ok) { document.getElementById('copystate').textContent = ok ? 'Copiato' : 'Testo selezionato, copialo a mano'; });
  });

  // Ogni blocco si apre quando entra nello schermo
  if ('IntersectionObserver' in window && !reduce) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var b = e.target;
        b.classList.remove('pre');
        io.unobserve(b);
        setTimeout(function () { b.classList.add('done'); }, 1700);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('.block:not(.hero)'), function (b) {
      var items = b.querySelectorAll('.sec-head, .grid-3 > *, .steps > li, .faq > details, .seg, .mat, .est, .contact .info, .contact form');
      Array.prototype.forEach.call(items, function (it, i) { it.classList.add('pop'); it.style.setProperty('--i', Math.min(i, 8)); });
      b.classList.add('pre');
      io.observe(b);
    });
  }

  // Il pulsante flottante sparisce quando si è già nei contatti
  var fab = document.getElementById('fab'), cont = document.getElementById('contatti');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { fab.classList.toggle('gone', en[0].isIntersecting); }, { threshold: 0.15 }).observe(cont);
  }
})();

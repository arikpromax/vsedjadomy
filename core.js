// Спільне для всіх сторінок: сховище, шапка/підвал, картка товару, кошик, обране, порівняння
var VD = (function () {
  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₴'; }
  function plural(n, one, few, many) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
    return many;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function param(k) { return new URLSearchParams(location.search).get(k); }
  function icon(id, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '"><use href="#i-' + id + '"/></svg>'; }
  function byId(id) { id = Number(id); for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function cat(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return null; }
  function url(p) { return 'tovar.html?id=' + p.id; }
  function code(p) { return String(100000 + p.id * 37); }

  /* ---------- storage (browser only; will move to the server with the admin panel) ---------- */
  function get(k, d) { try { var v = localStorage.getItem('vd_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem('vd_' + k, JSON.stringify(v)); } catch (e) {} }
  var store = {
    cart: function () { return get('cart', []); },
    setCart: function (c) { set('cart', c); paint(); },
    add: function (id, q, col) {
      var c = store.cart(), it = null;
      for (var i = 0; i < c.length; i++) if (c[i].id === id) it = c[i];
      if (it) it.q += q || 1; else c.push({ id: id, q: q || 1, col: col || null });
      store.setCart(c);
    },
    count: function () { return store.cart().reduce(function (s, i) { return s + i.q; }, 0); },
    total: function () { return store.cart().reduce(function (s, i) { var p = byId(i.id); return s + (p ? p.p * i.q : 0); }, 0); },
    list: function (k) { return get(k, []); },
    toggle: function (k, id) { var l = get(k, []), i = l.indexOf(id); if (i > -1) l.splice(i, 1); else l.push(id); set(k, l); paint(); return i === -1; },
    has: function (k, id) { return get(k, []).indexOf(id) > -1; },
    user: function () { return get('user', null); },
    setUser: function (u) { saveUser(u); },
    orders: function () { return get('orders', []); },
    setOrders: function (o) { set('orders', o); },
    pref: function () { return get('pay', null); },
    setPref: function (p) { set('pay', p); },
    get: get, set: set
  };

  /* ---------- phone ---------- */
  function phoneDigits(v) {
    var d = String(v).replace(/\D/g, '');
    if (d.indexOf('380') === 0) d = d.slice(3); else if (d.indexOf('80') === 0) d = d.slice(2); else if (d.indexOf('0') === 0) d = d.slice(1);
    return d.slice(0, 9);
  }
  function phoneFmt(v) {
    var d = phoneDigits(v), s = '+380';
    if (d.length) s += ' ' + d.slice(0, 2);
    if (d.length > 2) s += ' ' + d.slice(2, 5);
    if (d.length > 5) s += ' ' + d.slice(5, 7);
    if (d.length > 7) s += ' ' + d.slice(7, 9);
    return s;
  }
  function phoneOk(v) { return phoneDigits(v).length === 9; }
  function phoneMask(input) {
    input.addEventListener('focus', function () { if (!input.value) input.value = '+380 '; });
    input.addEventListener('input', function () { input.value = phoneFmt(input.value); });
    input.addEventListener('blur', function () { if (phoneDigits(input.value) === '') input.value = ''; });
  }

  /* ---------- toast & modal ---------- */
  var tt;
  function toast(html) {
    var t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = html;
    t.classList.add('on');
    clearTimeout(tt);
    tt = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }
  function modal(html, cls) {
    closeModal();
    var m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = '<div class="modal__box ' + (cls || '') + '" role="dialog" aria-modal="true"><button class="modal__x" aria-label="Закрити">' + icon('x') + '</button>' + html + '</div>';
    document.body.appendChild(m);
    document.body.classList.add('noscroll');
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.modal__x')) closeModal(); });
    var f = $('input,select,textarea', m); if (f) setTimeout(function () { f.focus(); }, 50);
    return m;
  }
  function closeModal() { var m = $('.modal'); if (m) m.remove(); document.body.classList.remove('noscroll'); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ---------- login: Google or email (no phone, no Apple) ---------- */
  function authHtml(title) {
    return '<div class="auth">' + (title ? '<h3 class="modal__t">' + title + '</h3>' : '') +
      '<p class="modal__p">Увійдіть, щоб бачити свої замовлення й обране та швидше оформлювати покупки.</p>' +
      '<div class="auth__btns"><button type="button" class="btn btn--line btn--wide auth__g"><svg class="ic ic--c"><use href="#i-google"/></svg>Продовжити через Google</button>' +
      '<button type="button" class="btn btn--line btn--wide auth__e">' + icon('mail') + 'Увійти через електронну пошту</button></div>' +
      '<div class="form auth__form" hidden><p class="auth__via"></p>' +
      '<label class="fld"><span>Електронна пошта</span><input name="email" type="email" autocomplete="email" placeholder="name@gmail.com"></label>' +
      '<div class="auth__code" hidden><label class="fld"><span>Код із листа</span><input name="code" inputmode="numeric" maxlength="4" autocomplete="one-time-code"></label>' +
      '<p class="auth__demo">Демо-режим: листи ще не підключено, введіть <b>1234</b></p></div>' +
      '<button type="button" class="btn btn--accent btn--wide auth__go">Отримати код</button><button type="button" class="auth__back">' + icon('left') + 'Інші способи входу</button></div></div>';
  }
  function authBind(box, done) {
    // a plain block, not a <form>: it also sits inside the checkout form
    var f = $('.auth__form', box), btns = $('.auth__btns', box), go = $('.auth__go', box), step = 1, via = 'email';
    var email = $('[name=email]', f), codeIn = $('[name=code]', f);
    function open(v) {
      via = v; btns.hidden = true; f.hidden = false; step = 1;
      $('.auth__via', f).innerHTML = v === 'google'
        ? '<b>Вхід через Google</b> (демо): після запуску тут відкриється вікно Google. Поки вкажіть Gmail.'
        : '<b>Вхід через пошту:</b> надішлемо код на вашу адресу.';
      go.textContent = v === 'google' ? 'Увійти' : 'Отримати код';
      $('.auth__code', f).hidden = true; email.readOnly = false; email.focus();
    }
    function submit() {
      var em = email.value.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(em)) return bad(email, 'Вкажіть електронну пошту');
      if (via === 'email' && step === 1) { step = 2; $('.auth__code', f).hidden = false; email.readOnly = true; go.textContent = 'Увійти'; codeIn.focus(); return; }
      if (via === 'email' && codeIn.value !== '1234') return bad(codeIn, 'Невірний код');
      login(em, via);
      done && done();
    }
    $('.auth__g', box).addEventListener('click', function () { open('google'); });
    $('.auth__e', box).addEventListener('click', function () { open('email'); });
    $('.auth__back', box).addEventListener('click', function () { f.hidden = true; btns.hidden = false; });
    go.addEventListener('click', submit);
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  }
  function login(email, via) {
    var users = get('users', {}), u = users[email] || { email: email, name: '', surname: '', patr: '', phone: '' };
    u.via = via; users[email] = u; set('users', users);
    var o = get('orders', []); o.forEach(function (x) { if (!x.uid) x.uid = email; }); set('orders', o); // замовлення, зроблені в цьому браузері без входу
    set('user', u); paint();
  }
  function auth(done) {
    var m = modal(authHtml('Вхід до кабінету'), 'modal__box--s');
    authBind(m, function () { closeModal(); toast('Ви увійшли'); done && done(); });
  }
  function saveUser(u) { set('user', u); var users = get('users', {}); if (u && u.email) { users[u.email] = u; set('users', users); } paint(); }

  /* ---------- header / footer ---------- */
  function catList(cls) {
    return '<div class="cat__list">' + CATS.map(function (c) {
      return '<a href="katalog.html?cat=' + c.id + '">' + icon(c.ic) + c.n + icon('right', 'ar') + '</a>';
    }).join('') + '</div>';
  }
  function header() {
    var el = $('#hd');
    if (!el) return;
    var u = store.user();
    el.innerHTML = '<div class="wrap hd__in">' +
      '<a class="logo" href="index.html"><svg class="logo__mark"><use href="#i-house"/></svg><span class="logo__txt"><b>Все для дому</b><small>техніка · іграшки · велосипеди</small></span></a>' +
      '<button class="hd__sbtn" aria-label="Пошук">' + icon('search') + '</button>' +
      '<form class="hd__search" action="katalog.html">' + icon('search') + '<input type="search" name="q" placeholder="Пошук товару" value="' + esc(param('q') || '') + '" autocomplete="off"></form>' +
      '<div class="hd__phone"><a href="' + SHOP.phoneHref + '"><b>' + SHOP.phone + '</b>' + icon('down') + '</a><small>Нова Одеса, Центральна, 172</small></div>' +
      '<button class="hd__call">Передзвоніть мені</button>' +
      '<a class="hd__ic hd__ic--cmp" href="porivniannia.html">' + icon('scales') + '<i data-n="0">0</i><span>Порівняння</span></a>' +
      '<a class="hd__ic hd__ic--user" href="kabinet.html">' + icon('user') + '<span>' + (u && u.name ? esc(u.name) : 'Кабінет') + '</span></a>' +
      '<a class="hd__ic hic--cart" href="koshyk.html">' + icon('cart') + '<i data-n="0">0</i><span>Кошик</span></a>' +
      '</div>';
    if (document.body.dataset.page !== 'home') {
      el.insertAdjacentHTML('afterend', '<div class="wrap subnav"><nav class="cat cat--drop"><button class="cat__head">' + icon('menu') + '<span>Каталог товарів</span>' + icon('down', 'cat__dd') + '</button>' + catList() + '</nav><nav class="crumbs" id="crumbs"></nav></div>');
    }
    // slim bar that follows the page when scrolled past the header (like Rozetka)
    document.body.insertAdjacentHTML('afterbegin', '<div class="hdm" aria-hidden="true"><div class="wrap hdm__in">' +
      '<nav class="cat cat--drop hdm__cat"><button class="cat__head" aria-label="Каталог">' + icon('grid') + '<span>Каталог</span></button>' + catList() + '</nav>' +
      '<a class="logo hdm__logo" href="index.html"><svg class="logo__mark"><use href="#i-house"/></svg><span class="logo__txt"><b>Все для дому</b></span></a>' +
      '<form class="hdm__search" action="katalog.html">' + icon('search') + '<input type="search" name="q" placeholder="Я шукаю…" autocomplete="off"><button>Знайти</button></form>' +
      '<button class="hdm__sbtn" aria-label="Пошук">' + icon('search') + '</button>' +
      '<a class="hd__ic hd__ic--cmp" href="porivniannia.html" aria-label="Порівняння">' + icon('scales') + '<i data-n="0">0</i></a>' +
      '<a class="hd__ic hd__ic--user" href="kabinet.html" aria-label="Кабінет">' + icon('user') + '</a>' +
      '<a class="hd__ic hic--cart" href="koshyk.html" aria-label="Кошик">' + icon('cart') + '<i data-n="0">0</i></a>' +
      '</div></div>');
    var bar = $('.hdm');
    function follow() {
      var on = el.getBoundingClientRect().bottom < 0;
      if (on !== bar.classList.contains('on')) {
        bar.classList.toggle('on', on); bar.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (!on) { bar.classList.remove('search-open'); $$('.cat--drop.open', bar).forEach(function (x) { x.classList.remove('open'); }); }
      }
    }
    window.addEventListener('scroll', follow, { passive: true });
    follow();
    $('.hdm__sbtn').addEventListener('click', function () { bar.classList.toggle('search-open'); if (bar.classList.contains('search-open')) $('.hdm__search input').focus(); });

    var sb = $('.hd__sbtn');
    sb.addEventListener('click', function () { el.classList.toggle('search-open'); if (el.classList.contains('search-open')) $('.hd__search input').focus(); });
    $('.hd__call').addEventListener('click', callback);
  }
  function footer() {
    var el = $('#ft');
    if (!el) return;
    el.innerHTML = '<div class="wrap foot__in">' +
      '<div><a class="logo logo--light" href="index.html"><svg class="logo__mark"><use href="#i-house"/></svg><span class="logo__txt"><b>Все для дому</b><small>техніка · іграшки · велосипеди</small></span></a>' +
      '<p>' + SHOP.address + '<br><a href="' + SHOP.phoneHref + '">' + SHOP.phone + '</a></p>' +
      '<div class="soc"><a href="' + SHOP.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + icon('ig') + '</a></div></div>' +
      '<div><h4>Каталог</h4>' + CATS.slice(2, 9).map(function (c) { return '<a href="katalog.html?cat=' + c.id + '">' + c.n + '</a>'; }).join('') + '</div>' +
      '<div><h4>Покупцям</h4><a href="kabinet.html">Особистий кабінет</a><a href="kabinet.html#orders">Мої замовлення</a><a href="porivniannia.html">Порівняння</a><a href="koshyk.html">Кошик</a></div>' +
      '<div><h4>Оплата</h4><span>Карткою Visa, Mastercard</span><span>Apple Pay, Google Pay</span><span>Частинами: ПриватБанк, monobank, A-Банк</span><span>Кредит, при отриманні</span></div>' +
      '</div><div class="wrap foot__bottom">© 2026 «Все для дому» · Нова Одеса</div>';
  }
  function paint() {
    var n = store.count();
    $$('.hic--cart i, .tab-cart i').forEach(function (i) { i.textContent = n; i.dataset.n = n; });
    var c = store.list('cmp').length;
    $$('.hd__ic--cmp i').forEach(function (i) { i.textContent = c; i.dataset.n = c; });
    var u = store.user(), us = $('.hd__ic--user span');
    if (us) us.textContent = u && u.name ? u.name : 'Кабінет';
  }
  function callback() {
    var u = store.user() || {};
    var m = modal('<h3 class="modal__t">Передзвонимо вам</h3><p class="modal__p">Залиште номер — менеджер зателефонує протягом 15 хвилин у робочий час.</p>' +
      '<form class="form" novalidate><label class="fld"><span>Ім’я</span><input name="name" value="' + esc(u.name || '') + '" autocomplete="given-name"></label>' +
      '<label class="fld"><span>Телефон *</span><input name="phone" type="tel" value="' + (u.phone ? phoneFmt(u.phone) : '') + '" autocomplete="tel"></label>' +
      '<button class="btn btn--accent btn--wide">Чекаю дзвінка</button></form>', 'modal__box--s');
    var f = $('form', m); phoneMask(f.phone);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!phoneOk(f.phone.value)) { bad(f.phone, 'Вкажіть номер повністю'); return; }
      var l = get('callbacks', []); l.push({ name: f.name.value, phone: phoneFmt(f.phone.value), at: Date.now() }); set('callbacks', l);
      closeModal(); toast('Дякуємо! Передзвонимо на ' + esc(phoneFmt(f.phone.value)));
    });
  }
  function bad(input, msg) {
    var f = input.closest('.fld') || input.parentNode;
    f.classList.add('fld--bad');
    var e = $('.fld__err', f); if (!e) { e = document.createElement('small'); e.className = 'fld__err'; f.appendChild(e); }
    e.textContent = msg;
    input.addEventListener('input', function clr() { f.classList.remove('fld--bad'); input.removeEventListener('input', clr); }, { once: true });
    input.focus();
  }

  /* ---------- product card ---------- */
  function card(p) {
    var parts = p.p >= 500;
    return '<article class="pc" data-id="' + p.id + '">' +
      '<div class="pc__media"><a href="' + url(p) + '" class="pc__img ph">' + icon('img') + '</a></div>' +
      '<div class="pc__bar"><div class="pc__btns">' +
        '<button class="pc-fav' + (store.has('fav', p.id) ? ' on' : '') + '" data-fav="' + p.id + '" aria-label="В обране">' + icon('heart') + '</button>' +
        '<button class="pc-cmp' + (store.has('cmp', p.id) ? ' on' : '') + '" data-cmp="' + p.id + '" aria-label="Порівняти">' + icon('scales') + '</button>' +
      '</div></div>' +
      '<div class="pc__rate"><svg class="pc__star"><use href="#i-star"/></svg><b>' + p.r.toFixed(1) + '</b><span>' + p.c + ' ' + plural(p.c, 'відгук', 'відгуки', 'відгуків') + '</span></div>' +
      '<h3><a href="' + url(p) + '">' + esc(p.n) + '</a></h3>' +
      '<div class="pc__col">' + (p.col || []).map(function (c, i) { return '<i' + (i ? '' : ' class="on"') + ' style="background:' + c + '"></i>'; }).join('') + '</div>' +
      '<span class="pc__stock' + (p.low ? ' pc__stock--low' : '') + '">' + (p.low ? 'Закінчується' : 'В наявності') + '</span>' +
      '<div class="pc__cost">' +
        '<div class="pc__old">' + (p.o ? '<s>' + money(p.o) + '</s><em>−' + money(p.o - p.p) + '</em>' : '') + '</div>' +
        '<div class="pc__row"><b' + (p.o ? ' class="is-sale"' : '') + '>' + money(p.p) + '</b>' +
        '<button class="pc__buy" data-buy="' + p.id + '" aria-label="Купити">' + icon('cart') + '</button></div>' +
        '<span class="pc__parts">' + (parts ? icon('parts') + 'або ' + money(Math.ceil(p.p / 12)) + ' × 12 міс' : '') + '</span>' +
      '</div></article>';
  }

  /* grid collapsed to two rows with a fade + red arrow */
  function collapse(grid) {
    var wrap = grid.closest('.gwrap');
    if (!wrap) {
      wrap = document.createElement('div'); wrap.className = 'gwrap clip';
      grid.parentNode.insertBefore(wrap, grid); wrap.appendChild(grid);
      var btn = document.createElement('button'); btn.className = 'expand'; btn.setAttribute('aria-label', 'Показати ще'); btn.innerHTML = icon('down');
      wrap.parentNode.insertBefore(btn, wrap.nextSibling);
      btn.addEventListener('click', function () { var open = wrap.classList.toggle('clip') === false; btn.classList.toggle('open', open); fit(); });
      window.addEventListener('resize', fit);
      if (document.fonts) document.fonts.ready.then(fit);
    } else { wrap.classList.add('clip'); wrap.nextElementSibling.classList.remove('open'); }
    var b = wrap.nextElementSibling;
    function fit() {
      if (!wrap.classList.contains('clip')) { wrap.style.maxHeight = wrap.scrollHeight + 'px'; return; }
      var cards = $$('.pc', grid), cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length, last = cards[cols * 2 - 1];
      b.hidden = !cards[cols * 2];
      if (b.hidden) { wrap.style.maxHeight = 'none'; return; }
      wrap.style.maxHeight = (last.offsetTop + last.offsetHeight) + 'px';
    }
    fit();
  }

  /* ---------- clicks everywhere ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-buy]');
    if (b) {
      e.preventDefault();
      var p = byId(b.dataset.buy);
      store.add(p.id, 1, b.dataset.col || null);
      var hic = $('.hic--cart'); if (hic) { hic.classList.remove('bump'); void hic.offsetWidth; hic.classList.add('bump'); }
      b.classList.add('done'); setTimeout(function () { b.classList.remove('done'); }, 900);
      toast('Додано в кошик: ' + esc(p.n) + ' <a href="koshyk.html">Перейти в кошик</a>');
      return;
    }
    var f = e.target.closest('[data-fav]');
    if (f) {
      e.preventDefault();
      var on = store.toggle('fav', Number(f.dataset.fav));
      $$('[data-fav="' + f.dataset.fav + '"]').forEach(function (x) { x.classList.toggle('on', on); });
      toast(on ? 'Додано в обране <a href="kabinet.html#fav">Обране</a>' : 'Прибрано з обраного');
      return;
    }
    var m = e.target.closest('[data-cmp]');
    if (m) {
      e.preventDefault();
      var onc = store.toggle('cmp', Number(m.dataset.cmp));
      $$('[data-cmp="' + m.dataset.cmp + '"]').forEach(function (x) { x.classList.toggle('on', onc); });
      toast(onc ? 'Додано до порівняння (' + store.list('cmp').length + ') <a href="porivniannia.html">Порівняти</a>' : 'Прибрано з порівняння');
      return;
    }
    var ch = e.target.closest('.cat__head');
    if (ch) {
      var c = ch.closest('.cat');
      if (c.classList.contains('cat--drop') || window.innerWidth <= 1000) c.classList.toggle('open');
      return;
    }
    if (!e.target.closest('.cat--drop')) $$('.cat--drop.open').forEach(function (x) { x.classList.remove('open'); });
  });

  /* ---------- boot ---------- */
  header();
  footer();
  paint();
  $$('[data-maps]').forEach(function (a) { a.href = SHOP.maps; });
  window.addEventListener('storage', paint);

  return {
    $: $, $$: $$, money: money, plural: plural, esc: esc, param: param, icon: icon, byId: byId, cat: cat, url: url, code: code,
    store: store, toast: toast, modal: modal, closeModal: closeModal, card: card, collapse: collapse, paint: paint,
    phoneFmt: phoneFmt, phoneOk: phoneOk, phoneDigits: phoneDigits, phoneMask: phoneMask, bad: bad,
    auth: auth, authHtml: authHtml, authBind: authBind,
    crumbs: function (list) {
      var el = $('#crumbs'); if (!el) return;
      el.innerHTML = '<a href="index.html">Головна</a>' + list.map(function (x) { return icon('right') + (x.href ? '<a href="' + x.href + '">' + esc(x.n) + '</a>' : '<span>' + esc(x.n) + '</span>'); }).join('');
    }
  };
})();

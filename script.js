// ---------- products (until the shop's real catalogue is connected) ----------
var PRODUCTS = {
  hits: [
    { n: 'Пральна машина 6 кг, 1000 об/хв, інверторний мотор', p: 13999, o: 15999, r: 4.9, c: 84, t: ['sale', 'pct:−12%'] },
    { n: 'Газова плита з електродуховкою, 4 конфорки', p: 11499, r: 4.8, c: 37, t: ['hit', 'parts'], col: ['#f1f2f4', '#2b2d31'] },
    { n: 'Електрочайник скляний з підсвіткою, 1,8 л', p: 299, r: 4.7, c: 212, t: ['hit'], col: ['#e9edf1', '#222', '#c9a46a'] },
    { n: 'Велосипед дитячий 20", для дітей 6–9 років', p: 4200, r: 5.0, c: 19, t: ['parts'], col: ['#e0262f', '#2f6fec', '#222'] },
    { n: 'Дитяча кухня з водою, звуком і посудом', p: 1845, o: 2050, r: 4.9, c: 56, t: ['sale', 'pct:−10%'] },
    { n: 'Телевізор 43" Smart TV, 4K UHD', p: 12999, o: 14499, r: 4.8, c: 128, t: ['sale', 'parts'] },
    { n: 'Холодильник двокамерний No Frost, 185 см', p: 15499, r: 4.7, c: 44, t: ['parts'], col: ['#e9edf1', '#222'] },
    { n: 'Квадрокоптер C58-mini з камерою та кейсом', p: 1400, r: 4.6, c: 23, t: ['new'] },
    { n: 'Мікрохвильова піч 20 л, 700 Вт', p: 2899, o: 3199, r: 4.8, c: 91, t: ['pct:−9%'], col: ['#222', '#f1f2f4'] },
    { n: 'Пилосос без мішка, 2000 Вт, HEPA-фільтр', p: 3299, r: 4.7, c: 65, t: ['hit', 'parts'] },
    { n: 'Праска з парогенератором, 2400 Вт', p: 1299, r: 4.8, c: 73, col: ['#5b6cff', '#e0262f'] },
    { n: 'Блендер занурювальний 1000 Вт з насадками', p: 1099, o: 1249, r: 4.7, c: 58, t: ['pct:−12%'] },
    { n: 'Обігрівач масляний, 11 секцій, 2500 Вт', p: 2499, r: 4.9, c: 102, t: ['hit'] },
    { n: 'Самокат дитячий триколісний зі світними колесами', p: 799, r: 4.8, c: 41, col: ['#ff6fa5', '#3fc1ff', '#7bd36b'] },
    { n: 'Мультиварка 5 л, 45 програм', p: 2199, o: 2499, r: 4.8, c: 67, t: ['sale', 'pct:−12%'] }
  ],
  toys: [
    { n: 'Інтерактивний робот-пес, звук і світло', p: 1161, o: 1290, r: 4.9, c: 42, t: ['sale', 'pct:−10%'] },
    { n: 'Танк на радіокеруванні, стріляє кульками', p: 1350, r: 4.8, c: 31, t: ['hit'], col: ['#4b5b3a', '#c2b280'] },
    { n: 'Туалетний столик для дівчинки з дзеркалом', p: 1690, r: 5.0, c: 27, col: ['#ff8fb1', '#b58cff'] },
    { n: 'Дитячий намет-вігвам з віконцем', p: 890, r: 4.7, c: 18, col: ['#8ec5ff', '#ffb3c7'] },
    { n: 'Аерохокей на ніжках, 100 см', p: 2450, r: 4.9, c: 22, t: ['hit'] },
    { n: 'Пенніборд зі світними колесами', p: 850, r: 4.8, c: 64, col: ['#ff6fa5', '#3fc1ff', '#ffd23f'] },
    { n: 'Лялька з набором одягу та аксесуарів', p: 599, o: 665, r: 4.7, c: 39, t: ['pct:−10%'] },
    { n: 'Конструктор «Місто», 480 деталей', p: 799, r: 4.9, c: 57, t: ['new'] },
    { n: 'М’яке інтерактивне цуценя, вчить букви', p: 649, o: 720, r: 4.8, c: 48, t: ['sale', 'pct:−10%'] },
    { n: 'Машинка-позашляховик на пульті, 4×4', p: 1099, r: 4.6, c: 33, col: ['#e0262f', '#2f6fec'] },
    { n: 'Дитячий електромобіль на акумуляторі, 12 В', p: 6999, o: 7699, r: 4.9, c: 26, t: ['sale', 'parts'], col: ['#e0262f', '#fff', '#222'] },
    { n: 'Залізниця з потягом і вагонами, 3,2 м', p: 1299, r: 4.8, c: 35, t: ['hit'] },
    { n: 'Ігровий набір «Лікар» у валізі', p: 459, r: 4.7, c: 29 },
    { n: 'Пазл 1000 елементів «Карпати»', p: 299, r: 4.9, c: 47, t: ['new'] },
    { n: 'Набір для творчості: пластилін, 24 кольори', p: 249, o: 279, r: 4.6, c: 52, t: ['pct:−10%'] }
  ]
};

function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₴'; }
function plural(n, one, few, many) {
  var a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
}
function card(x) {
  var t = x.t || [];
  var badges = [];
  var pct = t.filter(function (v) { return v.indexOf('pct:') === 0; })[0];
  if (pct) badges.push('<span class="bd">' + pct.slice(4) + '</span>');
  else if (t.indexOf('sale') > -1) badges.push('<span class="bd">Акція</span>');
  if (t.indexOf('hit') > -1) badges.push('<span class="bd bd--hit">Хіт</span>');
  if (t.indexOf('new') > -1) badges.push('<span class="bd bd--new">Новинка</span>');
  var parts = t.indexOf('parts') > -1 || x.p >= 3000;
  return '<article class="pc">' +
    '<div class="pc__media">' +
      '<a href="#" class="pc__img ph"><svg class="ic"><use href="#i-img"/></svg></a>' +
      '<div class="pc__badges">' + badges.join('') + '</div>' +
      '<div class="pc__btns">' +
        '<button class="pc-fav" aria-label="В обране"><svg class="ic"><use href="#i-heart"/></svg></button>' +
        '<button class="pc-cmp" aria-label="Порівняти"><svg class="ic"><use href="#i-scales"/></svg></button>' +
      '</div>' +
    '</div>' +
    '<div class="pc__rate"><svg class="pc__star"><use href="#i-star"/></svg><b>' + x.r.toFixed(1) + '</b><span>' + x.c + ' ' + plural(x.c, 'відгук', 'відгуки', 'відгуків') + '</span></div>' +
    '<h3><a href="#">' + x.n + '</a></h3>' +
    '<div class="pc__col">' + (x.col || []).map(function (c, i) { return '<i' + (i ? '' : ' class="on"') + ' style="background:' + c + '"></i>'; }).join('') + '</div>' +
    '<span class="pc__stock">В наявності</span>' +
    '<div class="pc__cost">' +
      (x.o ? '<div class="pc__old"><s>' + money(x.o) + '</s><em>−' + money(x.o - x.p) + '</em></div>' : '<div class="pc__old"></div>') +
      '<b' + (x.o ? ' class="is-sale"' : '') + '>' + money(x.p) + '</b>' +
      '<span class="pc__parts">' + (parts ? '<svg class="ic"><use href="#i-parts"/></svg>або ' + money(Math.ceil(x.p / 12)) + ' × 12 міс' : '') + '</span>' +
    '</div>' +
    '<button class="pc__buy" data-name="' + x.n.replace(/"/g, '&quot;') + '"><svg class="ic"><use href="#i-cart"/></svg>Купити</button>' +
    '</article>';
}

// render grids, collapsed to two rows with a fade + red arrow
document.querySelectorAll('.grid[data-list]').forEach(function (grid) {
  grid.innerHTML = (PRODUCTS[grid.dataset.list] || []).map(card).join('');
  var wrap = document.createElement('div');
  wrap.className = 'gwrap clip';
  grid.parentNode.insertBefore(wrap, grid);
  wrap.appendChild(grid);
  var btn = document.createElement('button');
  btn.className = 'expand';
  btn.setAttribute('aria-label', 'Показати ще');
  btn.innerHTML = '<svg class="ic"><use href="#i-down"/></svg>';
  wrap.parentNode.insertBefore(btn, wrap.nextSibling);
  function fit() {
    if (!wrap.classList.contains('clip')) { wrap.style.maxHeight = wrap.scrollHeight + 'px'; return; }
    // show two rows (top and bottom) down to the very bottom of the second one, faded like on Allo
    var cards = grid.querySelectorAll('.pc');
    var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    var last = cards[cols * 2 - 1];
    btn.hidden = !cards[cols * 2];
    if (btn.hidden) { wrap.classList.remove('clip'); wrap.style.maxHeight = 'none'; return; }
    wrap.style.maxHeight = (last.offsetTop + last.offsetHeight) + 'px';
  }
  btn.addEventListener('click', function () {
    var open = wrap.classList.toggle('clip') === false;
    btn.classList.toggle('open', open);
    fit();
  });
  fit();
  window.addEventListener('resize', fit);
  if (document.fonts) document.fonts.ready.then(fit);
});

// banner slider: arrows, dots, swipe, auto
(function () {
  var box = document.querySelector('.banner');
  if (!box) return;
  var slides = box.querySelectorAll('.bslide');
  var dots = box.querySelectorAll('.banner__dots i');
  var cur = 0, timer;
  function show(n) {
    cur = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('on', i === cur); });
    dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
  }
  function auto() { clearInterval(timer); timer = setInterval(function () { show(cur + 1); }, 6000); }
  box.querySelectorAll('.banner__arr').forEach(function (b) {
    b.addEventListener('click', function () { show(cur + Number(b.dataset.dir)); auto(); });
  });
  dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); auto(); }); });
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { show(cur + (dx < 0 ? 1 : -1)); auto(); }
    x0 = null;
  });
  auto();
})();

// catalog button opens the list on narrow screens; search icon opens the field on phones
(function () {
  var cat = document.querySelector('.cat');
  if (cat) cat.querySelector('.cat__head').addEventListener('click', function () {
    if (window.innerWidth <= 1000) cat.classList.toggle('open');
  });
  var hd = document.querySelector('.hd'), sb = document.querySelector('.hd__sbtn');
  if (hd && sb) sb.addEventListener('click', function () {
    hd.classList.toggle('search-open');
    if (hd.classList.contains('search-open')) hd.querySelector('.hd__search input').focus();
  });
})();

// countdown to the end of the sale
(function () {
  var box = document.querySelector('.timer');
  if (!box) return;
  var end = new Date(box.dataset.end).getTime();
  var el = {};
  box.querySelectorAll('[data-t]').forEach(function (i) { el[i.dataset.t] = i; });
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var left = Math.max(0, Math.floor((end - Date.now()) / 1000));
    el.d.textContent = Math.floor(left / 86400);
    el.h.textContent = pad(Math.floor(left % 86400 / 3600));
    el.m.textContent = pad(Math.floor(left % 3600 / 60));
    el.s.textContent = pad(left % 60);
  }
  tick();
  setInterval(tick, 1000);
})();

// cart counter, favourites, compare, filter pills
(function () {
  var toast = document.querySelector('.toast'), tt;
  function say(t) {
    toast.textContent = t;
    toast.classList.add('on');
    clearTimeout(tt);
    tt = setTimeout(function () { toast.classList.remove('on'); }, 1800);
  }
  var count = 0, cmp = 0;
  var cmpBadge = document.querySelectorAll('.hd__ic--cmp i');
  var badges = document.querySelectorAll('.hic--cart i, .tab-cart i');
  function paint() { badges.forEach(function (i) { i.textContent = count; i.dataset.n = count; }); }
  paint();
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.buy, .pc__buy');
    if (b) {
      count++;
      paint();
      var hic = document.querySelector('.hic--cart');
      hic.classList.remove('bump'); void hic.offsetWidth; hic.classList.add('bump');
      b.classList.add('done');
      setTimeout(function () { b.classList.remove('done'); }, 900);
      say('Додано в кошик: ' + (b.dataset.name || 'товар'));
      return;
    }
    var f = e.target.closest('.pc-fav');
    if (f) { f.classList.toggle('on'); say(f.classList.contains('on') ? 'Додано в обране' : 'Прибрано з обраного'); return; }
    var m = e.target.closest('.pc-cmp');
    if (m) {
      m.classList.toggle('on');
      var on = m.classList.contains('on');
      cmp += on ? 1 : -1;
      cmpBadge.forEach(function (i) { i.textContent = cmp; i.dataset.n = cmp; });
      say(on ? 'Додано до порівняння (' + cmp + ')' : 'Прибрано з порівняння');
      return;
    }
    var s = e.target.closest('.pills span');
    if (s) s.parentNode.querySelectorAll('span').forEach(function (x) { x.classList.toggle('on', x === s); });
  });
})();

// category tiles: arrows scroll the row sideways
(function () {
  var wrap = document.querySelector('.tiles-wrap');
  if (!wrap) return;
  var row = wrap.querySelector('.tiles');
  var l = wrap.querySelector('.tiles__arr--l'), r = wrap.querySelector('.tiles__arr--r');
  function upd() {
    l.disabled = row.scrollLeft < 4;
    r.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
  }
  [l, r].forEach(function (b) {
    b.addEventListener('click', function () { row.scrollBy({ left: Number(b.dataset.dir) * row.clientWidth * 0.8, behavior: 'smooth' }); });
  });
  row.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  upd();
})();

// Логіка окремих сторінок: головна, каталог, товар, кошик, оформлення, кабінет, порівняння
(function () {
  const V = VD, { $, $$, money, esc, icon, store, plural } = V;
  const page = document.body.dataset.page;
  const root = $('#page');
  const word = (n, a, b, c) => n + ' ' + plural(n, a, b, c);
  const goods = n => word(n, 'товар', 'товари', 'товарів');
  const reviewsWord = n => word(n, 'відгук', 'відгуки', 'відгуків');
  const dateStr = t => new Date(t).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const partsChoices = (p, bank) => [2, 3, 4, 6, 10, 12, 24].filter(n => n <= bank.max && p >= bank.min);
  const annuity = (sum, m) => { const r = CREDIT.ratePerMonth; return sum * r / (1 - Math.pow(1 + r, -m)); };

  /* ================= Нова Пошта (працює без ключа: пошук міст і відділень) ================= */
  const NP_TYPE = { postomat: 'f9316480-5f2d-425d-bc2c-ac7cd29decf0' };
  function np(model, method, props) {
    return fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: '', modelName: model, calledMethod: method, methodProperties: props })
    }).then(r => r.json()).then(j => { if (!j.success) throw new Error((j.errors || []).join(', ')); return j.data || []; });
  }
  const npCities = q => np('Address', 'searchSettlements', { CityName: q, Limit: '20', Page: '1' })
    .then(d => ((d[0] && d[0].Addresses) || []).filter(a => Number(a.Warehouses) > 0).map(a => ({
      ref: a.DeliveryCity, name: a.MainDescription, type: a.SettlementTypeCode || 'м.',
      area: [a.Area && a.Area + ' обл.', a.Region && a.Region + ' р-н'].filter(Boolean).join(', '), present: a.Present
    })));
  const npPoints = (cityRef, postomat) => np('AddressGeneral', 'getWarehouses', Object.assign({ CityRef: cityRef, Limit: '500', Page: '1', Language: 'UA' }, postomat ? { TypeOfWarehouseRef: NP_TYPE.postomat } : {}))
    .then(all => (postomat ? all : all.filter(w => w.TypeOfWarehouse !== NP_TYPE.postomat))
      .sort((a, b) => (Number(a.Number) || 0) - (Number(b.Number) || 0)).map(w => ({ ref: w.Ref, name: w.Description })));

  /* ================= ГОЛОВНА ================= */
  function home() {
    // банер
    const box = $('.banner');
    if (box) {
      const slides = $$('.bslide', box), dots = $$('.banner__dots i', box);
      let cur = 0, timer;
      const show = n => { cur = (n + slides.length) % slides.length; slides.forEach((s, i) => s.classList.toggle('on', i === cur)); dots.forEach((d, i) => d.classList.toggle('on', i === cur)); };
      const auto = () => { clearInterval(timer); timer = setInterval(() => show(cur + 1), 6000); };
      $$('.banner__arr', box).forEach(b => b.addEventListener('click', () => { show(cur + Number(b.dataset.dir)); auto(); }));
      dots.forEach((d, i) => d.addEventListener('click', () => { show(i); auto(); }));
      let x0 = null;
      box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
      box.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { show(cur + (dx < 0 ? 1 : -1)); auto(); } x0 = null; });
      auto();
    }
    // плитки-підбірки під банером
    const tw = $('.tiles-wrap');
    if (tw) {
      $('.tiles', tw).innerHTML = SETS.map(s => { const n = PRODUCTS.filter(s.f).length; return `<a class="tile" href="katalog.html?set=${s.id}"><span class="tile__ic">${icon(s.ic)}</span><b>${esc(s.n)}</b><small>${goods(n)}</small></a>`; }).join('');
      const row = $('.tiles', tw), l = $('.tiles__arr--l', tw), r = $('.tiles__arr--r', tw);
      const upd = () => { l.disabled = row.scrollLeft < 4; r.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4; };
      [l, r].forEach(b => b.addEventListener('click', () => row.scrollBy({ left: Number(b.dataset.dir) * row.clientWidth * 0.8, behavior: 'smooth' })));
      row.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    }
    // блоки товарів з фільтрами-пігулками
    const toyCats = ['igrashky', 'konstruktory', 'transport'];
    const FILTERS = {
      hits: [() => HOME.hits.map(V.byId), ...['tekhnika', 'kukhnia', 'igrashky', 'velo'].map(c => () => PRODUCTS.filter(p => p.cat === c))],
      toys: [() => HOME.toys.map(V.byId),
        () => PRODUCTS.filter(p => p.g === 'g' || (p.g === 'u' && toyCats.includes(p.cat))),
        () => PRODUCTS.filter(p => p.g === 'b' || (p.g === 'u' && toyCats.includes(p.cat))),
        () => PRODUCTS.filter(p => p.age && p.age[0] < 3),
        () => PRODUCTS.filter(p => p.age && p.age[0] <= 7 && p.age[1] >= 3),
        () => PRODUCTS.filter(p => p.age && p.age[1] >= 8)]
    };
    $$('.grid[data-list]').forEach(grid => {
      const list = grid.dataset.list, pills = $('.pills', grid.closest('.block'));
      const draw = i => { grid.innerHTML = FILTERS[list][i]().map(V.card).join(''); V.collapse(grid); };
      draw(0);
      if (pills) $$('span', pills).forEach((s, i) => s.addEventListener('click', () => { $$('span', pills).forEach(x => x.classList.toggle('on', x === s)); draw(i); }));
    });
  }

  /* ================= КАТАЛОГ ================= */
  function katalog() {
    const catId = V.param('cat'), q = (V.param('q') || '').trim(), c = V.cat(catId), set = SETS.find(s => s.id === V.param('set'));
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    let pool = PRODUCTS.filter(p => {
      if (set) return set.f(p);
      if (catId === 'akcii') return !!p.o;
      if (catId === 'novynky') return (p.t || []).includes('new');
      if (c) return p.cat === catId;
      return true;
    });
    if (words.length) pool = pool.filter(p => { const s = (p.n + ' ' + (V.cat(p.cat) || {}).n).toLowerCase(); return words.every(w => s.includes(w)); });
    const title = q ? 'Результати пошуку «' + q + '»' : set ? set.n : c ? c.n : 'Усі товари';
    document.title = title + ' — Все для дому';
    V.crumbs(q ? [{ n: 'Пошук' }] : set ? [{ n: 'Підбірки' }, { n: set.n }] : [{ n: c ? c.n : 'Каталог' }]);
    const isToys = pool.some(p => p.age);
    const st = { min: '', max: '', sale: false, parts: false, hit: false, isnew: false, g: '', age: '', sort: 'pop', shown: 12, cat: '' };
    const prices = pool.map(p => p.p);
    const lo = prices.length ? Math.min(...prices) : 0, hi = prices.length ? Math.max(...prices) : 0;
    const catsHere = [...new Set(pool.map(p => p.cat))];
    root.innerHTML = `
      <div class="kat">
        <aside class="flt">
          <div class="flt__head"><b>Фільтри</b><button class="flt__x" aria-label="Закрити">${icon('x')}</button></div>
          ${catsHere.length > 1 ? `<div class="flt__g"><h4>Категорія</h4>${catsHere.map(id => `<label class="chk"><input type="radio" name="fcat" value="${id}"><span>${esc(V.cat(id).n)}</span><em>${pool.filter(p => p.cat === id).length}</em></label>`).join('')}<label class="chk"><input type="radio" name="fcat" value="" checked><span>Усі категорії</span></label></div>` : ''}
          <div class="flt__g"><h4>Ціна, ₴</h4><div class="flt__price"><input type="number" inputmode="numeric" name="min" placeholder="${lo}"><span>—</span><input type="number" inputmode="numeric" name="max" placeholder="${hi}"></div></div>
          <div class="flt__g"><h4>Пропозиції</h4>
            <label class="chk"><input type="checkbox" name="sale"><span>Зі знижкою</span><em>${pool.filter(p => p.o).length}</em></label>
            <label class="chk"><input type="checkbox" name="parts"><span>Можна частинами</span><em>${pool.filter(p => p.p >= 500).length}</em></label>
            <label class="chk"><input type="checkbox" name="hit"><span>Хіти продажу</span><em>${pool.filter(p => (p.t || []).includes('hit')).length}</em></label>
            <label class="chk"><input type="checkbox" name="isnew"><span>Новинки</span><em>${pool.filter(p => (p.t || []).includes('new')).length}</em></label>
          </div>
          ${isToys ? `<div class="flt__g"><h4>Для кого</h4>
            <label class="chk"><input type="radio" name="g" value="" checked><span>Усім</span></label>
            <label class="chk"><input type="radio" name="g" value="g"><span>Дівчаткам</span></label>
            <label class="chk"><input type="radio" name="g" value="b"><span>Хлопчикам</span></label></div>
          <div class="flt__g"><h4>Вік</h4>
            <label class="chk"><input type="radio" name="age" value="" checked><span>Будь-який</span></label>
            <label class="chk"><input type="radio" name="age" value="0"><span>До 3 років</span></label>
            <label class="chk"><input type="radio" name="age" value="3"><span>3–7 років</span></label>
            <label class="chk"><input type="radio" name="age" value="8"><span>8–15 років</span></label></div>` : ''}
          <button class="btn btn--accent btn--wide flt__apply"></button>
          <button class="flt__reset">Скинути фільтри</button>
        </aside>
        <section class="kat__main">
          <div class="kat__top"><h1 class="title">${esc(title)}</h1><span class="kat__n"></span></div>
          <div class="kat__bar">
            <button class="kat__fbtn">${icon('filter')}Фільтри</button>
            <label class="kat__sort">Сортування:<select>
              <option value="pop">За популярністю</option><option value="cheap">Від дешевих до дорогих</option>
              <option value="exp">Від дорогих до дешевих</option><option value="rate">За рейтингом</option><option value="new">Новинки</option></select></label>
          </div>
          <div class="kat__chips"></div>
          <div class="pgrid"></div>
          <button class="btn btn--line kat__more">Показати ще</button>
        </section>
      </div>`;
    const aside = $('.flt'), grid = $('.pgrid'), more = $('.kat__more');
    function filtered() {
      let l = pool.filter(p => (!st.cat || p.cat === st.cat)
        && (!st.min || p.p >= +st.min) && (!st.max || p.p <= +st.max)
        && (!st.sale || p.o) && (!st.parts || p.p >= 500)
        && (!st.hit || (p.t || []).includes('hit')) && (!st.isnew || (p.t || []).includes('new'))
        && (!st.g || p.g === st.g || p.g === 'u')
        && (!st.age || (p.age && (st.age === '0' ? p.age[0] < 3 : st.age === '3' ? p.age[0] <= 7 && p.age[1] >= 3 : p.age[1] >= 8))));
      const s = { pop: (a, b) => b.c - a.c, cheap: (a, b) => a.p - b.p, exp: (a, b) => b.p - a.p, rate: (a, b) => b.r - a.r || b.c - a.c, new: (a, b) => ((b.t || []).includes('new') - (a.t || []).includes('new')) || b.id - a.id }[st.sort];
      return l.sort(s);
    }
    function chips() {
      const ch = [];
      if (st.cat) ch.push(['cat', V.cat(st.cat).n]);
      if (st.min || st.max) ch.push(['price', (st.min || lo) + ' – ' + (st.max || hi) + ' ₴']);
      [['sale', 'Зі знижкою'], ['parts', 'Частинами'], ['hit', 'Хіти'], ['isnew', 'Новинки']].forEach(([k, n]) => st[k] && ch.push([k, n]));
      if (st.g) ch.push(['g', st.g === 'g' ? 'Дівчаткам' : 'Хлопчикам']);
      if (st.age) ch.push(['age', { 0: 'До 3 років', 3: '3–7 років', 8: '8–15 років' }[st.age]]);
      $('.kat__chips').innerHTML = ch.map(([k, n]) => `<button data-k="${k}">${esc(n)}${icon('x')}</button>`).join('') + (ch.length > 1 ? '<button data-k="all" class="kat__clear">Скинути все</button>' : '');
    }
    function draw() {
      const l = filtered();
      $('.kat__n').textContent = goods(l.length);
      $('.flt__apply').textContent = 'Показати ' + goods(l.length);
      grid.innerHTML = l.length ? l.slice(0, st.shown).map(V.card).join('') : `<div class="empty">${icon('search')}<h3>Нічого не знайшли</h3><p>Спробуйте змінити фільтри або пошуковий запит.</p><a class="btn btn--dark" href="katalog.html">Усі товари</a></div>`;
      grid.classList.toggle('pgrid--empty', !l.length);
      more.hidden = l.length <= st.shown;
      more.textContent = 'Показати ще ' + Math.min(12, l.length - st.shown);
      chips();
    }
    aside.addEventListener('input', e => {
      const t = e.target;
      if (t.name === 'fcat') st.cat = t.value; else if (t.type === 'checkbox') st[t.name] = t.checked; else st[t.name] = t.value;
      st.shown = 12; draw();
    });
    $('.kat__sort select').addEventListener('change', e => { st.sort = e.target.value; draw(); });
    more.addEventListener('click', () => { st.shown += 12; draw(); });
    const reset = () => { Object.assign(st, { min: '', max: '', sale: false, parts: false, hit: false, isnew: false, g: '', age: '', cat: '', shown: 12 }); $$('input', aside).forEach(i => { if (i.type === 'checkbox') i.checked = false; else if (i.type === 'radio') i.checked = i.value === ''; else i.value = ''; }); draw(); };
    $('.flt__reset').addEventListener('click', reset);
    $('.kat__chips').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const k = b.dataset.k;
      if (k === 'all') return reset();
      if (k === 'price') { st.min = st.max = ''; $('[name=min]', aside).value = $('[name=max]', aside).value = ''; }
      else if (k === 'cat' || k === 'g' || k === 'age') { st[k] = ''; const r = $(`[name=${k === 'cat' ? 'fcat' : k}][value=""]`, aside); if (r) r.checked = true; }
      else { st[k] = false; $(`[name=${k}]`, aside).checked = false; }
      draw();
    });
    const openF = o => { aside.classList.toggle('open', o); document.body.classList.toggle('noscroll', o); };
    $('.kat__fbtn').addEventListener('click', () => openF(true));
    $('.flt__x').addEventListener('click', () => openF(false));
    $('.flt__apply').addEventListener('click', () => openF(false));
    draw();
  }

  /* ================= ТОВАР ================= */
  const BLURB = {
    tekhnika: 'Велика побутова техніка з офіційною гарантією. Допоможемо з доставкою та підключенням.',
    kukhnia: 'Техніка для кухні на кожен день: проста в користуванні й надійна.',
    tv: 'Телевізор зі Smart TV: YouTube, Netflix і Megogo без приставки.',
    dim: 'Техніка для дому, яка заощаджує час і сили.',
    igrashky: 'Іграшка з сертифікатом якості, безпечна для дітей зазначеного віку.',
    konstruktory: 'Розвиває уяву, дрібну моторику й терпіння. Деталі сумісні з популярними конструкторами.',
    transport: 'Дитячий транспорт для прогулянок: міцний, легкий і безпечний.',
    velo: 'Велосипед перед видачею збираємо й налаштовуємо в магазині.',
    koliasky: 'Коляску можна покатати й скласти в магазині перед покупкою.',
    kylymy: 'Килим легко чиститься, не линяє й не ковзає підлогою.',
    shpalery: 'Шпалери в наявності в магазині — можна подивитися фактуру наживо.'
  };
  const SAMPLE_REVIEWS = [
    { n: 'Олена', r: 5, t: 'Все прийшло швидко, упаковано добре. Дякую магазину!' },
    { n: 'Сергій', r: 5, t: 'Забирав у магазині в Новій Одесі — все показали й пояснили. Задоволений.' },
    { n: 'Ірина', r: 4, t: 'Хороша якість за свою ціну. Рекомендую.' }
  ];
  function tovar() {
    const p = V.byId(V.param('id'));
    if (!p) { root.innerHTML = `<div class="empty">${icon('box')}<h3>Товар не знайдено</h3><a class="btn btn--dark" href="katalog.html">До каталогу</a></div>`; return; }
    const c = V.cat(p.cat);
    document.title = p.n + ' — Все для дому';
    V.crumbs([{ n: c.n, href: 'katalog.html?cat=' + c.id }, { n: p.n }]);
    const banks = BANKS.filter(b => p.p >= b.min);
    let bank = banks[0], nPay = bank ? Math.min(...partsChoices(p.p, bank).filter(n => n >= 4).concat([partsChoices(p.p, bank).slice(-1)[0]])) : 0, term = 12, col = p.col ? 0 : null;
    const myReviews = store.get('rev_' + p.id, []);
    const reviews = myReviews.concat(SAMPLE_REVIEWS);
    const spec = Object.assign({ 'Категорія': c.n, 'Код товару': V.code(p) }, p.spec || {}, { 'Гарантія': ['igrashky', 'konstruktory', 'kylymy', 'shpalery'].includes(p.cat) ? '14 днів на обмін' : '12 місяців' });
    root.innerHTML = `
      <div class="pp">
        <div class="pp__gal">
          <div class="pp__main ph">${icon('img')}<span>Фото товару</span></div>
          <div class="pp__thumbs">${[0, 1, 2, 3].map(i => `<button class="ph${i ? '' : ' on'}">${icon('img')}</button>`).join('')}</div>
        </div>
        <div class="pp__info">
          <h1 class="pp__t">${esc(p.n)}</h1>
          <div class="pp__meta"><span class="pp__rate"><svg class="pc__star"><use href="#i-star"/></svg><b>${p.r.toFixed(1)}</b></span><a href="#tab-rev" data-tab="rev">${reviewsWord(reviews.length + p.c - SAMPLE_REVIEWS.length)}</a><span>Код: ${V.code(p)}</span></div>
          ${p.col ? `<div class="pp__col"><span>Колір:</span>${p.col.map((x, i) => `<button class="${i ? '' : 'on'}" data-i="${i}" style="background:${x}" aria-label="Колір ${i + 1}"></button>`).join('')}</div>` : ''}
          <div class="pp__box">
            <div class="pp__stock${p.low ? ' pp__stock--low' : ''}">${p.low ? 'Закінчується' : 'В наявності'} · відправимо сьогодні</div>
            ${p.o ? `<div class="pp__old"><s>${money(p.o)}</s><em>−${money(p.o - p.p)}</em></div>` : ''}
            <div class="pp__price${p.o ? ' is-sale' : ''}">${money(p.p)}</div>
            <div class="pp__btns">
              <button class="btn btn--accent pp__buy" data-buy="${p.id}">${icon('cart')}Купити</button>
              <button class="btn btn--line pp__one">${icon('bolt')}Купити в 1 клік</button>
              <button class="pp__ic pc-fav${store.has('fav', p.id) ? ' on' : ''}" data-fav="${p.id}" aria-label="В обране">${icon('heart')}</button>
              <button class="pp__ic pc-cmp${store.has('cmp', p.id) ? ' on' : ''}" data-cmp="${p.id}" aria-label="Порівняти">${icon('scales')}</button>
            </div>
          </div>
          ${bank ? `<div class="pp__parts">
            <h3>${icon('parts')}Оплата частинами</h3>
            <div class="seg pp__banks">${banks.map((b, i) => `<button class="${i ? '' : 'on'}" data-b="${b.id}"><b>${esc(b.n)}</b><small>${esc(b.prog)}</small></button>`).join('')}</div>
            <div class="pp__n"></div>
            <div class="pp__calc"></div>
            <button class="btn btn--dark pp__pbuy">Купити частинами</button>
          </div>` : ''}
          ${p.p >= CREDIT.min ? `<div class="pp__credit">
            <h3>${icon('bank')}Кредит</h3>
            <div class="pp__terms">${CREDIT.terms.map(t => `<button class="${t === term ? 'on' : ''}" data-t="${t}">${t} міс</button>`).join('')}</div>
            <div class="pp__ccalc"></div>
            <button class="btn btn--line pp__cbuy">Оформити кредит</button>
          </div>` : ''}
          <div class="pp__dlv">
            <div>${icon('store')}<p><b>Самовивіз з магазину</b><span>Нова Одеса, Центральна, 172 · сьогодні</span></p><em>Безкоштовно</em></div>
            <div>${icon('truck')}<p><b>Нова Пошта: відділення чи поштомат</b><span>1–3 дні по Україні</span></p><em>За тарифами перевізника</em></div>
            <div>${icon('courier')}<p><b>Кур’єр Нової Пошти</b><span>2–3 дні, до дверей</span></p><em>За тарифами перевізника</em></div>
            <div>${icon('shield')}<p><b>Гарантія і повернення</b><span>Обмін або повернення протягом 14 днів</span></p></div>
          </div>
        </div>
      </div>
      <div class="ptabs">
        <div class="ptabs__nav"><button class="on" data-tab="desc">Опис</button><button data-tab="spec">Характеристики</button><button data-tab="rev">Відгуки <i>${reviews.length + p.c - SAMPLE_REVIEWS.length}</i></button></div>
        <div class="ptabs__pane on" id="tab-desc"><p><b>${esc(p.n)}</b>. ${BLURB[p.cat] || ''}</p><p>Купуйте в магазині «Все для дому» в Новій Одесі або замовляйте з доставкою Новою Поштою по всій Україні. Оплата карткою, частинами, у кредит або під час отримання.</p></div>
        <div class="ptabs__pane" id="tab-spec"><dl class="spec">${Object.keys(spec).map(k => `<div><dt>${esc(k)}</dt><dd>${esc(spec[k])}</dd></div>`).join('')}</dl></div>
        <div class="ptabs__pane" id="tab-rev">
          <form class="rev-form form" novalidate><h4>Залишити відгук</h4>
            <div class="rev-form__stars">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-s="${i}" class="on" aria-label="${i}"><svg><use href="#i-star"/></svg></button>`).join('')}</div>
            <label class="fld"><span>Ім’я</span><input name="name" required></label>
            <label class="fld"><span>Відгук</span><textarea name="text" rows="3" required></textarea></label>
            <button class="btn btn--dark">Надіслати відгук</button></form>
          <div class="revs">${reviews.map(r => `<div class="rev"><div class="rev__h"><b>${esc(r.n)}</b><span>${'<svg class="pc__star"><use href="#i-star"/></svg>'.repeat(r.r)}</span></div><p>${esc(r.t)}</p></div>`).join('')}</div>
        </div>
      </div>
      <section class="block"><div class="block__head"><h2 class="title">Схожі товари</h2></div><div class="pgrid pgrid--5">${PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 5).map(V.card).join('') || PRODUCTS.slice(0, 5).map(V.card).join('')}</div></section>`;

    // колір
    $$('.pp__col button').forEach(b => b.addEventListener('click', () => { $$('.pp__col button').forEach(x => x.classList.toggle('on', x === b)); col = +b.dataset.i; $('.pp__buy').dataset.col = col; }));
    // частинами
    function drawParts() {
      if (!bank) return;
      const ch = partsChoices(p.p, bank);
      if (!ch.includes(nPay)) nPay = ch[Math.min(2, ch.length - 1)];
      $('.pp__n').innerHTML = ch.map(n => `<button class="${n === nPay ? 'on' : ''}" data-n="${n}">${n}</button>`).join('');
      $('.pp__calc').innerHTML = `<b>${nPay} ${plural(nPay, 'платіж', 'платежі', 'платежів')} по ${money(Math.ceil(p.p / nPay))}</b><span>Перший платіж — під час оформлення. Умови банку уточнюємо при підключенні.</span>`;
    }
    if (bank) {
      $('.pp__banks').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; bank = BANKS.find(x => x.id === b.dataset.b); $$('.pp__banks button').forEach(x => x.classList.toggle('on', x === b)); drawParts(); });
      $('.pp__n').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; nPay = +b.dataset.n; drawParts(); });
      $('.pp__pbuy').addEventListener('click', () => go({ method: 'parts', bank: bank.id, n: nPay }));
      drawParts();
    }
    // кредит
    function drawCredit() { const m = annuity(p.p, term); $('.pp__ccalc').innerHTML = `<b>≈ ${money(Math.ceil(m))} / міс на ${term} міс</b><span>Орієнтовний розрахунок. Остаточні умови — після схвалення банком.</span>`; }
    if ($('.pp__credit')) {
      $('.pp__terms').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; term = +b.dataset.t; $$('.pp__terms button').forEach(x => x.classList.toggle('on', x === b)); drawCredit(); });
      $('.pp__cbuy').addEventListener('click', () => go({ method: 'credit', term }));
      drawCredit();
    }
    function go(pref) {
      if (!store.cart().some(i => i.id === p.id)) store.add(p.id, 1, col);
      store.setPref(pref);
      location.href = 'oformlennia.html';
    }
    // купити в 1 клік
    $('.pp__one').addEventListener('click', () => {
      const u = store.user() || {};
      const m = V.modal(`<h3 class="modal__t">Купити в 1 клік</h3><p class="modal__p">${esc(p.n)} — <b>${money(p.p)}</b><br>Залиште номер: менеджер передзвонить і оформить замовлення за вас.</p>
        <form class="form" novalidate><label class="fld"><span>Ім’я</span><input name="name" value="${esc(u.name || '')}"></label>
        <label class="fld"><span>Телефон *</span><input name="phone" type="tel" value="${u.phone ? V.phoneFmt(u.phone) : ''}"></label>
        <button class="btn btn--accent btn--wide">Замовити</button></form>`, 'modal__box--s');
      const f = $('form', m); V.phoneMask(f.phone);
      f.addEventListener('submit', e => {
        e.preventDefault();
        if (!V.phoneOk(f.phone.value)) return V.bad(f.phone, 'Вкажіть номер повністю');
        const o = saveOrder({ items: [{ id: p.id, q: 1, col }], sum: p.p, delivery: { type: 'call', text: 'Уточнимо по телефону' }, pay: { method: 'call', text: 'Уточнимо по телефону' }, recipient: { name: f.name.value.trim(), phone: V.phoneFmt(f.phone.value) }, status: 'Передзвонимо' });
        V.modal(`<div class="done">${icon('check')}<h3>Замовлення №${o.no} прийнято</h3><p>Передзвонимо на ${esc(o.recipient.phone)} протягом 15 хвилин у робочий час.</p><a class="btn btn--dark" href="kabinet.html#orders">Мої замовлення</a></div>`, 'modal__box--s');
      });
    });
    // вкладки
    const tab = id => { $$('.ptabs__nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === id)); $$('.ptabs__pane').forEach(x => x.classList.toggle('on', x.id === 'tab-' + id)); };
    $$('[data-tab]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); tab(b.dataset.tab); if (b.tagName === 'A') $('.ptabs').scrollIntoView({ behavior: 'smooth' }); }));
    $$('.ptabs__thumbs, .pp__thumbs button').forEach(b => b.addEventListener('click', () => $$('.pp__thumbs button').forEach(x => x.classList.toggle('on', x === b))));
    // відгук
    let stars = 5;
    const rf = $('.rev-form');
    $('.rev-form__stars').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; stars = +b.dataset.s; $$('.rev-form__stars button').forEach(x => x.classList.toggle('on', +x.dataset.s <= stars)); });
    rf.addEventListener('submit', e => {
      e.preventDefault();
      if (!rf.name.value.trim()) return V.bad(rf.name, 'Вкажіть ім’я');
      if (rf.text.value.trim().length < 5) return V.bad(rf.text, 'Напишіть кілька слів');
      const l = store.get('rev_' + p.id, []); l.unshift({ n: rf.name.value.trim(), r: stars, t: rf.text.value.trim() }); store.set('rev_' + p.id, l);
      $('.revs').insertAdjacentHTML('afterbegin', `<div class="rev rev--new"><div class="rev__h"><b>${esc(rf.name.value.trim())}</b><span>${'<svg class="pc__star"><use href="#i-star"/></svg>'.repeat(stars)}</span></div><p>${esc(rf.text.value.trim())}</p></div>`);
      rf.reset(); V.toast('Дякуємо за відгук!');
    });
  }

  /* ================= ЗАМОВЛЕННЯ (спільне) ================= */
  function saveOrder(o) {
    const list = store.orders();
    const no = String(Date.now()).slice(-7);
    const order = Object.assign({ no, at: Date.now() }, o);
    order.items = order.items.map(i => { const p = V.byId(i.id); return Object.assign({ n: p.n, price: p.p }, i); });
    order.uid = (store.user() || {}).email || null; // без входу — прив’яжеться, коли покупець увійде з цього браузера
    list.unshift(order); store.setOrders(list);
    return order;
  }

  /* ================= КОШИК ================= */
  function koshyk() {
    V.crumbs([{ n: 'Кошик' }]);
    V.cartView(root);
  }

  /* ================= ОФОРМЛЕННЯ ================= */
  function oformlennia() {
    V.crumbs([{ n: 'Кошик', href: 'koshyk.html' }, { n: 'Оформлення замовлення' }]);
    const cart = V.selected();
    if (!cart.length) { root.innerHTML = `<h1 class="title page__t">Оформлення замовлення</h1><div class="empty">${icon('cart')}<h3>Кошик порожній</h3><a class="btn btn--accent" href="katalog.html">До каталогу</a></div>`; return; }
    const sum = cart.reduce((s, i) => s + V.byId(i.id).p * i.q, 0), qty = cart.reduce((s, i) => s + i.q, 0), u = store.user() || {}, pref = store.pref() || {};
    const city = store.get('city', { name: 'Нова Одеса', area: 'Миколаївська обл., Миколаївський р-н', ref: null });
    const st = { dlv: pref.dlv || (city.name === 'Нова Одеса' ? 'pickup' : 'np'), pay: pref.method || 'cod', bank: pref.bank || BANKS[0].id, n: pref.n || 4, term: pref.term || 12, point: null };
    const DLV = [
      { id: 'pickup', n: 'Самовивіз з нашого магазину', ic: 'store', price: 'Безкоштовно', free: true },
      { id: 'np', n: 'Самовивіз з Нової Пошти', ic: 'truck', price: 'За тарифами перевізника' },
      { id: 'postomat', n: 'Самовивіз з поштоматів Нової Пошти', ic: 'box', price: 'За тарифами перевізника' },
      { id: 'ukr', n: 'Самовивіз з Укрпошти', ic: 'pin', price: 'За тарифами перевізника' },
      { id: 'courier', n: 'Кур’єр Нової Пошти', sub: 'Середній термін доставки 2–3 дні', ic: 'courier', price: 'За тарифами перевізника' }
    ];
    const PAY = [
      { id: 'cod', n: 'Оплата під час отримання товару', sub: 'Готівкою або карткою. На Новій Пошті — комісія перевізника 20 ₴ + 2% від суми' },
      { id: 'card', n: 'Оплатити зараз карткою', sub: 'Visa, Mastercard, Apple Pay, Google Pay — через захищений платіжний сервіс' },
      { id: 'parts', n: 'Оплата частинами', sub: BANKS.map(b => b.n).join(', '), min: 300 },
      { id: 'credit', n: 'Кредит', sub: 'Від 6 до 36 місяців, рішення банку за кілька хвилин', min: CREDIT.min },
      { id: 'invoice', n: 'Оплата на рахунок (для ФОП і юросіб)', sub: 'Надішлемо рахунок-фактуру на email' }
    ].filter(x => !x.min || sum >= x.min);
    if (!PAY.some(x => x.id === st.pay)) st.pay = 'cod';
    root.innerHTML = `<h1 class="title page__t">Оформлення замовлення</h1>
      <form class="co" novalidate>
        <div class="co__main">
          ${u.email ? `<section class="co__sec co__me">${icon('user')}<p>Ви увійшли як <b>${esc(u.email)}</b></p><a href="kabinet.html">Кабінет</a></section>`
            : `<section class="co__sec co__login"><div class="co__h"><h2>Увійдіть для оформлення замовлення</h2></div><div class="co__auth"></div><p class="co__guest">або просто заповніть дані нижче — оформимо й без входу</p></section>`}
          <section class="co__sec"><div class="co__h"><h2>Замовлення</h2><a href="koshyk.html">${icon('edit')}Редагувати</a></div>
            <div class="co__items">${cart.map(i => { const p = V.byId(i.id); return `<div class="co__item"><span class="ph">${icon('img')}</span><a href="${V.url(p)}">${esc(p.n)}</a><span>${i.q} шт.</span><b>${money(p.p * i.q)}</b></div>`; }).join('')}</div></section>

          <section class="co__sec"><div class="co__h"><h2>Доставка</h2></div>
            <div class="city"><span class="city__ic">${icon('pin')}</span><p><b class="city__n"></b><span class="city__a"></span></p><button type="button" class="city__ch">Змінити</button></div>
            <div class="opts" data-group="dlv">${DLV.map(d => `
              <div class="opt" data-v="${d.id}">
                <label class="opt__row"><input type="radio" name="dlv" value="${d.id}"><span class="opt__ic">${icon(d.ic)}</span><span class="opt__n">${d.n}${d.sub ? `<small>${d.sub}</small>` : ''}</span><em class="${d.free ? 'free' : ''}">${d.price}</em></label>
                <div class="opt__body" data-body="${d.id}"></div>
              </div>`).join('')}</div></section>

          <section class="co__sec"><div class="co__h"><h2>Оплата</h2></div>
            <div class="opts" data-group="pay">${PAY.map(x => `
              <div class="opt" data-v="${x.id}">
                <label class="opt__row"><input type="radio" name="pay" value="${x.id}"><span class="opt__n">${x.n}<small>${x.sub}</small></span>${x.id === 'card' ? `<span class="opt__cards">${icon('card')}</span>` : ''}</label>
                <div class="opt__body" data-body="${x.id}"></div>
              </div>`).join('')}</div></section>

          <section class="co__sec"><div class="co__h"><h2>Отримувач</h2></div>
            <div class="grid2">
              <label class="fld"><span>Прізвище</span><input name="surname" autocomplete="family-name" value="${esc(u.surname || '')}"></label>
              <label class="fld"><span>Ім’я</span><input name="name" autocomplete="given-name" value="${esc(u.name || '')}"></label>
              <label class="fld"><span>По батькові</span><input name="patr" value="${esc(u.patr || '')}"></label>
              <label class="fld"><span>Мобільний телефон</span><input name="phone" type="tel" autocomplete="tel" placeholder="+380 __ ___ __ __" value="${u.phone ? V.phoneFmt(u.phone) : ''}"></label>
              <label class="fld fld--full"><span>Email (необов’язково) — надішлемо чек і статус замовлення</span><input name="email" type="email" autocomplete="email" value="${esc(u.email || '')}"></label>
            </div>
            <button type="button" class="co__cmt-btn">${icon('plus')}Додати коментар до замовлення</button>
            <label class="fld co__cmt" hidden><span>Коментар</span><textarea name="comment" rows="3" placeholder="Наприклад: зателефонуйте перед відправкою"></textarea></label>
            <label class="chk co__nocall"><input type="checkbox" name="nocall"><span>Мені можна не телефонувати для підтвердження</span></label>
          </section>
        </div>
        <aside class="sum co__sum">
          <h3>Разом</h3>
          <div><span>${goods(qty)} на суму</span><b>${money(sum)}</b></div>
          <div><span>Вартість доставки</span><b class="co__dprice"></b></div>
          <div class="sum__total"><span>До сплати</span><b>${money(sum)}</b></div>
          <p class="co__payline"></p>
          <button class="btn btn--accent btn--wide co__go">Замовлення підтверджую</button>
          <p class="sum__note">Підтверджуючи замовлення, я погоджуюсь з умовами покупки, обміну й повернення.</p>
        </aside>
      </form>`;
    const f = $('.co');
    V.phoneMask(f.phone);
    const ab = $('.co__auth');
    if (ab) { ab.innerHTML = V.authHtml(''); $('.modal__p', ab).remove(); V.authBind(ab, () => location.reload()); }

    // місто
    function drawCity() { $('.city__n').textContent = city.name; $('.city__a').textContent = city.area || ''; }
    drawCity();
    if (!city.ref) npCities(city.name).then(l => { const x = l.find(a => a.name === city.name) || l[0]; if (x) { city.ref = x.ref; city.area = x.area; store.set('city', city); drawCity(); } }).catch(() => {});
    $('.city__ch').addEventListener('click', pickCity);
    function pickCity() {
      const quick = ['Нова Одеса', 'Миколаїв', 'Одеса', 'Київ', 'Вознесенськ', 'Первомайськ'];
      const m = V.modal(`<h3 class="modal__t">Куди доставити замовлення?</h3>
        <p class="modal__p">Вкажіть ваш населений пункт, щоб бачити доступні способи доставки</p>
        <label class="fld"><span>Населений пункт</span><input class="cityq" value="${esc(city.name)}" autocomplete="off"></label>
        <div class="ac"></div>
        <div class="cityq__chips">${quick.map(q => `<button type="button" class="${q === city.name ? 'on' : ''}">${q}</button>`).join('')}</div>
        <div class="modal__foot"><button type="button" class="btn btn--line modal__close">Закрити</button></div>`);
      const inp = $('.cityq', m), ac = $('.ac', m);
      let timer, last = [];
      const choose = a => { Object.assign(city, { name: a.name, area: a.area, ref: a.ref }); store.set('city', city); drawCity(); st.point = null; renderDlv(); V.closeModal(); };
      const hl = (s, q) => esc(s).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<b>$1</b>');
      const search = q => {
        if (q.trim().length < 2) { ac.innerHTML = ''; return; }
        ac.innerHTML = '<div class="ac__msg">Шукаємо…</div>';
        npCities(q.trim()).then(l => {
          last = l;
          ac.innerHTML = l.length ? l.map((a, i) => `<button type="button" data-i="${i}">${esc(a.type)} ${hl(a.name, q.trim())}${a.area ? ' — ' + esc(a.area) : ''}</button>`).join('') : '<div class="ac__msg">Нічого не знайшли</div>';
        }).catch(() => { ac.innerHTML = '<div class="ac__msg">Нова Пошта не відповідає. Спробуйте ще раз.</div>'; });
      };
      inp.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => search(inp.value), 300); });
      inp.select();
      ac.addEventListener('click', e => { const b = e.target.closest('button'); if (b) choose(last[+b.dataset.i]); });
      $('.cityq__chips', m).addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        inp.value = b.textContent;
        npCities(b.textContent).then(l => { const x = l.find(a => a.name === b.textContent) || l[0]; if (x) choose(x); }).catch(() => search(b.textContent));
      });
      $('.modal__close', m).addEventListener('click', V.closeModal);
    }

    // доставка
    function renderDlv() {
      $$('[data-group=dlv] .opt').forEach(o => { const on = o.dataset.v === st.dlv; o.classList.toggle('on', on); $('input', o).checked = on; $('.opt__body', o).innerHTML = ''; });
      const body = $(`[data-body=${st.dlv}]`);
      if (st.dlv === 'pickup') body.innerHTML = `<p class="opt__info">${icon('store')}<span><b>${SHOP.address}</b>Замовлення буде готове до видачі в день оформлення — зателефонуємо, щойно зберемо.${city.name !== 'Нова Одеса' ? '<br><em>Магазин у Новій Одесі. Для іншого міста оберіть Нову Пошту.</em>' : ''}</span></p>`;
      if (st.dlv === 'np' || st.dlv === 'postomat') {
        body.innerHTML = `<div class="sel"><select name="point" disabled><option>Завантажуємо ${st.dlv === 'np' ? 'відділення' : 'поштомати'}…</option></select></div>`;
        const s = $('select', body);
        const load = () => npPoints(city.ref, st.dlv === 'postomat').then(l => {
          if (!l.length) { s.innerHTML = '<option value="">У цьому місті таких немає</option>'; return; }
          s.innerHTML = `<option value="">Оберіть ${st.dlv === 'np' ? 'відділення' : 'поштомат'} (${l.length})</option>` + l.map(w => `<option value="${esc(w.ref)}"${st.point === w.ref ? ' selected' : ''}>${esc(w.name)}</option>`).join('');
          s.disabled = false;
        }).catch(() => { s.innerHTML = '<option value="">Нова Пошта не відповідає — спробуйте пізніше</option>'; });
        if (city.ref) load(); else npCities(city.name).then(l => { const x = l.find(a => a.name === city.name) || l[0]; if (x) { city.ref = x.ref; store.set('city', city); load(); } }).catch(() => { s.innerHTML = '<option value="">Нова Пошта не відповідає</option>'; });
        s.addEventListener('change', () => { st.point = s.value; });
      }
      if (st.dlv === 'courier') body.innerHTML = `<div class="grid3"><label class="fld"><span>Вулиця</span><input name="street"></label><label class="fld"><span>Будинок</span><input name="house"></label><label class="fld"><span>Квартира</span><input name="flat"></label></div>`;
      if (st.dlv === 'ukr') body.innerHTML = `<label class="fld"><span>Індекс або адреса відділення Укрпошти</span><input name="ukr" placeholder="Наприклад: 56600"></label>`;
      $('.co__dprice').textContent = st.dlv === 'pickup' ? 'безкоштовно' : 'за тарифами перевізника';
    }

    // оплата
    function renderPay() {
      $$('[data-group=pay] .opt').forEach(o => { const on = o.dataset.v === st.pay; o.classList.toggle('on', on); $('input', o).checked = on; $('.opt__body', o).innerHTML = ''; });
      const body = $(`[data-body=${st.pay}]`);
      let line = '';
      if (st.pay === 'parts') {
        const banks = BANKS.filter(b => sum >= b.min);
        if (!banks.some(b => b.id === st.bank)) st.bank = banks[0].id;
        const bank = BANKS.find(b => b.id === st.bank), ch = partsChoices(sum, bank);
        if (!ch.includes(st.n)) st.n = ch[Math.min(2, ch.length - 1)];
        body.innerHTML = `<div class="seg co__banks">${banks.map(b => `<button type="button" class="${b.id === st.bank ? 'on' : ''}" data-b="${b.id}"><b>${esc(b.n)}</b><small>${esc(b.prog)}</small></button>`).join('')}</div>
          <div class="pp__n co__n">${ch.map(n => `<button type="button" class="${n === st.n ? 'on' : ''}" data-n="${n}">${n}</button>`).join('')}</div>
          <p class="opt__info">${icon('parts')}<span><b>${st.n} ${plural(st.n, 'платіж', 'платежі', 'платежів')} по ${money(Math.ceil(sum / st.n))}</b>Після підтвердження відкриється застосунок банку — підтвердіть оплату там.</span></p>`;
        line = `${bank.n}: ${st.n} × ${money(Math.ceil(sum / st.n))}`;
      }
      if (st.pay === 'credit') {
        body.innerHTML = `<div class="pp__terms co__terms">${CREDIT.terms.map(t => `<button type="button" class="${t === st.term ? 'on' : ''}" data-t="${t}">${t} міс</button>`).join('')}</div>
          <p class="opt__info">${icon('bank')}<span><b>≈ ${money(Math.ceil(annuity(sum, st.term)))} / міс на ${st.term} міс</b>Орієнтовно. Після підтвердження заповните коротку анкету банку, рішення — за кілька хвилин.</span></p>`;
        line = `Кредит: ≈ ${money(Math.ceil(annuity(sum, st.term)))} × ${st.term} міс`;
      }
      if (st.pay === 'card') { body.innerHTML = `<p class="opt__info">${icon('card')}<span><b>Оплата після підтвердження замовлення</b>Відкриємо захищену сторінку платіжного сервісу. Дані картки ми не бачимо й не зберігаємо.</span></p>`; line = 'Оплата карткою онлайн'; }
      if (st.pay === 'invoice') body.innerHTML = `<div class="grid2"><label class="fld"><span>Назва ФОП / компанії</span><input name="company"></label><label class="fld"><span>ЄДРПОУ / ІПН</span><input name="edrpou" inputmode="numeric"></label></div>`;
      $('.co__payline').textContent = line;
    }

    f.addEventListener('change', e => {
      if (e.target.name === 'dlv') { st.dlv = e.target.value; st.point = null; renderDlv(); }
      if (e.target.name === 'pay') { st.pay = e.target.value; renderPay(); }
    });
    f.addEventListener('click', e => {
      const b = e.target.closest('button[data-b], button[data-n], button[data-t]');
      if (!b) return;
      if (b.dataset.b) st.bank = b.dataset.b; if (b.dataset.n) st.n = +b.dataset.n; if (b.dataset.t) st.term = +b.dataset.t;
      renderPay();
    });
    $('.co__cmt-btn').addEventListener('click', () => { $('.co__cmt').hidden = false; $('.co__cmt-btn').hidden = true; f.comment.focus(); });
    renderDlv(); renderPay();

    // підтвердження
    f.addEventListener('submit', e => {
      e.preventDefault();
      const v = n => (f[n] && f[n].value || '').trim();
      if (st.dlv === 'np' || st.dlv === 'postomat') { const s = f.point; if (!s || !s.value) return V.bad(s || $('.city__ch'), st.dlv === 'np' ? 'Оберіть відділення' : 'Оберіть поштомат'); }
      if (st.dlv === 'courier') { if (!v('street')) return V.bad(f.street, 'Вкажіть вулицю'); if (!v('house')) return V.bad(f.house, 'Вкажіть будинок'); }
      if (st.dlv === 'ukr' && !v('ukr')) return V.bad(f.ukr, 'Вкажіть відділення Укрпошти');
      if (!v('surname')) return V.bad(f.surname, 'Введіть прізвище отримувача');
      if (!v('name')) return V.bad(f.name, 'Введіть ім’я отримувача');
      if (!V.phoneOk(f.phone.value)) return V.bad(f.phone, 'Введіть номер мобільного телефону отримувача');
      if (v('email') && !/^\S+@\S+\.\S+$/.test(v('email'))) return V.bad(f.email, 'Перевірте email');
      const dname = DLV.find(d => d.id === st.dlv).n;
      const dtext = st.dlv === 'pickup' ? 'Самовивіз: ' + SHOP.address
        : st.dlv === 'courier' ? `Кур’єр НП: ${city.name}, ${v('street')}, ${v('house')}${v('flat') ? ', кв. ' + v('flat') : ''}`
        : st.dlv === 'ukr' ? `Укрпошта: ${city.name}, ${v('ukr')}`
        : `${dname}: ${city.name}, ${f.point.options[f.point.selectedIndex].text}`;
      const bank = BANKS.find(b => b.id === st.bank);
      const ptext = { cod: 'Під час отримання', card: 'Карткою онлайн', invoice: 'На рахунок' + (v('company') ? ': ' + v('company') : ''), parts: `Частинами, ${bank.n}: ${st.n} × ${money(Math.ceil(sum / st.n))}`, credit: `Кредит на ${st.term} міс` }[st.pay];
      const status = { cod: 'Прийнято', invoice: 'Очікує оплати рахунку', card: 'Очікує оплати', parts: 'Очікує підтвердження банку', credit: 'Заявка на кредит' }[st.pay];
      const o = saveOrder({
        items: cart.map(i => ({ id: i.id, q: i.q, col: i.col })), sum,
        delivery: { type: st.dlv, text: dtext }, pay: { method: st.pay, text: ptext, bank: st.bank, n: st.n, term: st.term },
        recipient: { surname: v('surname'), name: v('name'), patr: v('patr'), phone: V.phoneFmt(f.phone.value), email: v('email') },
        comment: v('comment'), nocall: f.nocall.checked, status
      });
      const usr = store.user();
      if (usr) store.setUser(Object.assign(usr, { phone: usr.phone || V.phoneDigits(f.phone.value), name: usr.name || v('name'), surname: usr.surname || v('surname'), patr: usr.patr || v('patr') }));
      store.setCart(store.cart().filter(i => i.sel === false)); store.setPref(null);
      if (st.pay === 'card' || st.pay === 'parts' || st.pay === 'credit') payStep(o); else done(o);
    });

    // демо-сторінка платіжного сервісу / банку
    function payStep(o) {
      const t = { card: ['Оплата карткою', 'Тут відкриється захищена сторінка платіжного сервісу (LiqPay, WayForPay або monobank) — після підключення магазину.', 'Оплатити ' + money(o.sum), 'Оплачено'],
        parts: ['Підтвердження в банку', `${o.pay.text}. Тут відкриється застосунок або сторінка банку для підтвердження.`, 'Підтвердити в банку', 'Схвалено банком'],
        credit: ['Заявка на кредит', `Кредит на ${o.pay.term} міс. Тут відкриється анкета банку-партнера.`, 'Надіслати анкету', 'Кредит схвалено'] }[o.pay.method];
      const m = V.modal(`<div class="paydemo"><span class="paydemo__tag">Демо-режим</span><h3 class="modal__t">${t[0]}</h3><p class="modal__p">${t[1]}</p>
        <div class="paydemo__sum"><span>Замовлення №${o.no}</span><b>${money(o.sum)}</b></div>
        <button class="btn btn--accent btn--wide paydemo__ok">${t[2]}</button><button class="btn btn--line btn--wide paydemo__later">Оплачу пізніше</button></div>`, 'modal__box--s');
      $('.paydemo__ok', m).addEventListener('click', () => { setStatus(o.no, t[3]); o.status = t[3]; V.closeModal(); done(o); });
      $('.paydemo__later', m).addEventListener('click', () => { V.closeModal(); done(o); });
    }
    function done(o) {
      window.scrollTo(0, 0);
      V.crumbs([{ n: 'Замовлення оформлено' }]);
      root.innerHTML = `<div class="done done--page">${icon('check')}<h1>Дякуємо! Замовлення №${o.no} оформлено</h1>
        <p>Статус: <b>${esc(o.status)}</b>. ${o.nocall ? 'Підтвердження надішлемо в SMS.' : 'Ми зателефонуємо на ' + esc(o.recipient.phone) + ' для підтвердження.'}</p>
        <div class="done__box"><div><span>Доставка</span><b>${esc(o.delivery.text)}</b></div><div><span>Оплата</span><b>${esc(o.pay.text)}</b></div><div><span>Сума</span><b>${money(o.sum)}</b></div></div>
        ${o.uid ? '' : '<p class="done__hint">Увійдіть через Google або пошту — і це замовлення з’явиться у вашому кабінеті.</p>'}
        <div class="done__btns"><a class="btn btn--accent" href="kabinet.html#orders">${o.uid ? 'Мої замовлення' : 'Увійти в кабінет'}</a><a class="btn btn--line" href="index.html">На головну</a></div></div>`;
    }
  }
  function setStatus(no, s) { const l = store.orders(); const o = l.find(x => x.no === no); if (o) { o.status = s; store.setOrders(l); } }

  /* ================= КАБІНЕТ ================= */
  function kabinet() {
    V.crumbs([{ n: 'Особистий кабінет' }]);
    const back = V.param('back');
    function login() {
      root.innerHTML = `<div class="auth-page"><h1 class="title">Вхід до кабінету</h1><div class="auth-page__box"></div></div>`;
      const box = $('.auth-page__box');
      box.innerHTML = V.authHtml('');
      V.authBind(box, () => {
        const x = store.user(), last = store.orders().find(o => o.uid === x.email);
        if (last && !x.name) { const r = last.recipient; store.setUser(Object.assign(x, { name: r.name || '', surname: r.surname || '', patr: r.patr || '', phone: V.phoneDigits(r.phone || '') })); }
        if (back) { location.href = back; return; }
        location.reload();
      });
    }
    const u = store.user();
    if (!u) return login();
    const TABS = [['orders', 'box', 'Мої замовлення'], ['fav', 'heart', 'Обране'], ['cmp', 'scales', 'Порівняння'], ['profile', 'user', 'Особисті дані']];
    root.innerHTML = `<div class="cab">
      <aside class="cab__side"><div class="cab__me"><span>${icon('user')}</span><p><b class="cab__name"></b><small>${esc(u.email)}</small></p></div>
        <nav>${TABS.map(t => `<a href="${t[0] === 'cmp' ? 'porivniannia.html' : '#' + t[0]}" data-t="${t[0]}">${icon(t[1])}${t[2]}</a>`).join('')}<button class="cab__out">${icon('logout')}Вийти</button></nav></aside>
      <section class="cab__main"></section></div>`;
    const main = $('.cab__main');
    const nameOf = () => { const x = store.user(); return [x.name, x.surname].filter(Boolean).join(' ') || 'Мій кабінет'; };
    $('.cab__name').textContent = nameOf();
    function show() {
      const t = (location.hash || '#orders').slice(1);
      $$('.cab__side a').forEach(a => a.classList.toggle('on', a.dataset.t === t));
      if (t === 'fav') return fav();
      if (t === 'profile') return profile();
      orders();
    }
    function orders() {
      const l = store.orders().filter(o => o.uid === store.user().email);
      if (!l.length) { main.innerHTML = `<h2 class="title">Мої замовлення</h2><div class="empty">${icon('box')}<h3>Замовлень ще немає</h3><a class="btn btn--accent" href="katalog.html">До каталогу</a></div>`; return; }
      const cls = s => /скасов/i.test(s) ? 'st--off' : /оплачено|схвален|прийнято/i.test(s) ? 'st--ok' : 'st--wait';
      main.innerHTML = `<h2 class="title">Мої замовлення</h2>` + l.map(o => `
        <article class="ord" data-no="${o.no}">
          <div class="ord__h"><b>№ ${o.no}</b><span>від ${dateStr(o.at)}</span><em class="st ${cls(o.status)}">${esc(o.status)}</em><strong>${money(o.sum)}</strong></div>
          <ul class="ord__items">${o.items.map(i => `<li><span class="ph">${icon('img')}</span><a href="tovar.html?id=${i.id}">${esc(i.n)}</a><span>${i.q} × ${money(i.price)}</span></li>`).join('')}</ul>
          <div class="ord__info"><p>${icon('truck')}${esc(o.delivery.text)}</p><p>${icon('card')}${esc(o.pay.text)}</p></div>
          <div class="ord__btns"><button class="btn btn--line ord__again">${icon('cart')}Повторити замовлення</button>${/скасов|оплачено/i.test(o.status) ? '' : '<button class="ord__cancel">Скасувати</button>'}</div>
        </article>`).join('');
    }
    function fav() {
      const l = store.list('fav').map(V.byId).filter(Boolean);
      main.innerHTML = `<h2 class="title">Обране</h2>` + (l.length ? `<div class="pgrid">${l.map(V.card).join('')}</div>` : `<div class="empty">${icon('heart')}<h3>Тут поки порожньо</h3><p>Натискайте сердечко на товарах, щоб зберегти їх тут.</p><a class="btn btn--accent" href="katalog.html">До каталогу</a></div>`);
    }
    function profile() {
      const x = store.user();
      main.innerHTML = `<h2 class="title">Особисті дані</h2><form class="form prof" novalidate><div class="grid2">
        <label class="fld"><span>Прізвище</span><input name="surname" value="${esc(x.surname || '')}"></label>
        <label class="fld"><span>Ім’я</span><input name="name" value="${esc(x.name || '')}"></label>
        <label class="fld"><span>По батькові</span><input name="patr" value="${esc(x.patr || '')}"></label>
        <label class="fld"><span>Телефон для доставки</span><input name="phone" type="tel" value="${x.phone ? V.phoneFmt(x.phone) : ''}" placeholder="+380 __ ___ __ __"></label>
        <label class="fld"><span>Email (вхід)</span><input value="${esc(x.email || '')}" readonly></label>
        <label class="fld"><span>Дата народження</span><input name="birth" type="date" value="${esc(x.birth || '')}"></label>
        </div><button class="btn btn--accent">Зберегти</button></form>`;
      const f = $('form', main);
      V.phoneMask(f.phone);
      f.addEventListener('submit', e => {
        e.preventDefault();
        if (f.phone.value && !V.phoneOk(f.phone.value)) return V.bad(f.phone, 'Вкажіть номер повністю');
        store.setUser(Object.assign(store.user(), { surname: f.surname.value.trim(), name: f.name.value.trim(), patr: f.patr.value.trim(), phone: V.phoneDigits(f.phone.value), birth: f.birth.value }));
        $('.cab__name').textContent = nameOf(); $('.hd__ic--user span').textContent = store.user().name || 'Кабінет';
        V.toast('Дані збережено');
      });
    }
    main.addEventListener('click', e => {
      const o = e.target.closest('.ord'); if (!o) return;
      const ord = store.orders().find(x => x.no === o.dataset.no);
      if (e.target.closest('.ord__again')) { ord.items.forEach(i => store.add(i.id, i.q, i.col)); location.href = 'koshyk.html'; }
      if (e.target.closest('.ord__cancel')) { setStatus(ord.no, 'Скасовано'); V.toast('Замовлення №' + ord.no + ' скасовано'); orders(); }
    });
    $('.cab__out').addEventListener('click', () => { store.setUser(null); location.href = 'kabinet.html'; });
    window.addEventListener('hashchange', show);
    show();
  }

  /* ================= ПОРІВНЯННЯ ================= */
  function porivniannia() {
    V.crumbs([{ n: 'Порівняння' }]);
    let diff = false;
    function draw() {
      const l = store.list('cmp').map(V.byId).filter(Boolean);
      if (!l.length) { root.innerHTML = `<h1 class="title page__t">Порівняння</h1><div class="empty">${icon('scales')}<h3>Немає товарів для порівняння</h3><p>Натисніть значок ваг на картці товару, щоб додати його сюди.</p><a class="btn btn--accent" href="katalog.html">До каталогу</a></div>`; return; }
      const keys = ['Ціна', 'Рейтинг', 'Категорія'].concat([...new Set(l.flatMap(p => Object.keys(p.spec || {})))]);
      const val = (p, k) => k === 'Ціна' ? money(p.p) : k === 'Рейтинг' ? p.r.toFixed(1) + ' (' + reviewsWord(p.c) + ')' : k === 'Категорія' ? V.cat(p.cat).n : (p.spec || {})[k] || '—';
      const rows = keys.filter(k => !diff || new Set(l.map(p => val(p, k))).size > 1);
      root.innerHTML = `<div class="cmp__top"><h1 class="title page__t">Порівняння <span>${goods(l.length)}</span></h1>
        <label class="chk"><input type="checkbox" class="cmp__diff"${diff ? ' checked' : ''}><span>Лише відмінності</span></label><button class="cmp__clear">${icon('trash')}Очистити</button></div>
        <div class="cmp__wrap"><table class="cmp"><thead><tr><th></th>${l.map(p => `<th><div class="cmp__p"><button class="cmp__x" data-cmp="${p.id}" aria-label="Прибрати">${icon('x')}</button><a class="ph" href="${V.url(p)}">${icon('img')}</a><a href="${V.url(p)}">${esc(p.n)}</a><div class="cmp__buy"><b class="${p.o ? 'is-sale' : ''}">${money(p.p)}</b><button class="pc__buy" data-buy="${p.id}" aria-label="Купити">${icon('cart')}</button></div></div></th>`).join('')}</tr></thead>
        <tbody>${rows.map(k => `<tr><th>${esc(k)}</th>${l.map(p => `<td>${esc(val(p, k))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    root.addEventListener('change', e => { if (e.target.classList.contains('cmp__diff')) { diff = e.target.checked; draw(); } });
    root.addEventListener('click', e => {
      if (e.target.closest('.cmp__clear')) { store.set('cmp', []); V.paint(); draw(); }
      if (e.target.closest('.cmp__x')) setTimeout(draw, 0);
    });
    draw();
  }

  const PAGES = { home, katalog, tovar, koshyk, oformlennia, kabinet, porivniannia };
  if (PAGES[page]) PAGES[page]();
})();

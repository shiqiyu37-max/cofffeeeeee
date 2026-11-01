(() => {
  'use strict';
  const products = window.HAISHI_DATA || [];
  const byId = new Map(products.map(p => [p.id, p]));
  const root = document.body.dataset.siteRoot || '.';
  const storageKey = 'haishi-coffee-unified-selection-v1';
  const money = cents => '¥' + Number((cents / 100).toFixed(2));
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const weightLabel = g => g === 5000 ? '5kg整批' : g + 'g';
  const cover = p => `${root}/assets/${p.scene||p.id+'-scene.png'}`;
  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) cart = saved.filter(row => byId.has(row.id) && !byId.get(row.id).soldOut && byId.get(row.id).sizes.some(s => s.grams === row.grams) && Number.isInteger(row.quantity) && row.quantity > 0 && row.quantity <= 99);
  } catch (_) {}
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch (_) {}
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = cart.reduce((n, row) => n + row.quantity, 0));
  }
  save();

  let toastTimer;
  function toast(message) {
    let el = document.querySelector('.site-toast');
    if (!el) { el = document.createElement('div'); el.className = 'site-toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = message; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.hidden = true, 2600);
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'site-dialog'; dialog.setAttribute('aria-labelledby', 'dialog-title');
  document.body.append(dialog);
  let previousFocus, dialogKind, chosen, grams, quantity = 1;
  function open(content, kind) {
    if (!dialog.open) previousFocus = document.activeElement;
    dialogKind = kind;
    dialog.innerHTML = '<button class="dialog-close" type="button" data-action="close-dialog" aria-label="关闭">×</button><div class="dialog-inner">' + content + '</div>';
    if (!dialog.open) dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
  }
  function restorePage() { if (dialog.open) return; document.documentElement.style.overflow = ''; previousFocus?.focus({preventScroll:true}); }
  function close() { dialog.close(); restorePage(); }
  dialog.addEventListener('close', restorePage);
  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) close();
  });

  function priceOf(row) { return byId.get(row.id).sizes.find(s => s.grams === row.grams).retailCents; }
  function total() { return cart.reduce((n, row) => n + priceOf(row) * row.quantity, 0); }
  function selectionText() {
    return ['海市咖啡｜选豆单', ...cart.map((row, i) => `${i+1}. ${byId.get(row.id).name} ${weightLabel(row.grams)} × ${row.quantity}，${money(priceOf(row) * row.quantity)}`), '', '商品小计：' + money(total()) + '（未含运费及优惠）', '研磨需求：请与我确认', '请确认当前批次、库存、发货安排及应付金额后再付款。'].join('\n');
  }

  function choose(id) {
    chosen = byId.get(id); if (!chosen) return;
    if (chosen.soldOut) { toast(chosen.name + '已售罄'); return; }
    grams = chosen.sizes[0].grams; quantity = 1;
    open(`<div class="dialog-product"><img src="${escape(cover(chosen))}" alt="" width="98" height="98"><div><p class="dialog-eyebrow">选择规格</p><h2 id="dialog-title">${escape(chosen.name)}</h2><p>${escape(chosen.descriptor)}</p></div></div><fieldset><legend>请选择重量</legend><div class="size-options${chosen.bulkOnly?' is-bulk':''}">${chosen.sizes.map((s, i) => `<label class="size-option"><input type="radio" name="bean-size" value="${s.grams}" ${i === 0 ? 'checked' : ''}><b>${weightLabel(s.grams)}</b><span>${money(s.retailCents)}</span>${s.grams === 454 ? '<small>227g × 2 包装</small>' : s.grams===5000?'<small>整批售卖，不拆分</small>':''}</label>`).join('')}</div></fieldset><div class="quantity-row"><span>数量</span><div class="stepper"><button type="button" data-action="quantity-minus" aria-label="减少数量">−</button><output id="chosen-quantity" aria-live="polite">1</output><button type="button" data-action="quantity-plus" aria-label="增加数量">＋</button></div></div><button class="clay-button dialog-add" type="button" data-action="add-selection">加入选豆单 <span aria-hidden="true">＋</span><strong id="chosen-total">${money(chosen.sizes[0].retailCents)}</strong></button><p class="dialog-note">${chosen.bulkOnly?'仅按5kg整批售卖，不提供其他拆分规格。':''}需要研磨时，请在微信说明使用器具并确认研磨选项。选豆单用于整理意向，批次与库存以下单确认为准。</p>`, 'choose');
    updateChosen();
  }
  function updateChosen() {
    dialog.querySelector('#chosen-quantity').value = quantity;
    dialog.querySelector('#chosen-quantity').textContent = quantity;
    dialog.querySelector('#chosen-total').textContent = money(chosen.sizes.find(s => s.grams === grams).retailCents * quantity);
    dialog.querySelector('[data-action="quantity-minus"]').disabled = quantity === 1;
    dialog.querySelector('[data-action="quantity-plus"]').disabled = quantity === 99;
  }
  dialog.addEventListener('change', e => { if (e.target.name === 'bean-size') { grams = Number(e.target.value); updateChosen(); } });

  function showCart() {
    if (!cart.length) {
      open('<p class="dialog-eyebrow">你的选豆单</p><h2 id="dialog-title">先挑一支喜欢的。</h2><div class="cart-empty"><span class="clay-icon beans" aria-hidden="true"></span><p>选好豆款、规格和数量后，再到微信确认下单。</p><a class="clay-button" href="' + root + '/index.html#bean-shelf">去选咖啡 ↗</a></div>', 'cart');
      return;
    }
    const rows = cart.map((row, i) => {
      const p = byId.get(row.id);
      return `<article class="cart-row"><img src="${escape(cover(p))}" alt="" width="62" height="62"><div><h3>${escape(p.name)}</h3><p>${weightLabel(row.grams)}${row.grams === 454 ? ' · 227g × 2' : ''} / ${money(priceOf(row))}</p><div class="stepper"><button type="button" data-action="cart-minus" data-index="${i}" aria-label="减少${escape(p.name)}数量">−</button><output aria-label="${escape(p.name)}数量">${row.quantity}</output><button type="button" data-action="cart-plus" data-index="${i}" aria-label="增加${escape(p.name)}数量">＋</button></div></div><div class="cart-row-total"><strong>${money(priceOf(row)*row.quantity)}</strong><button type="button" data-action="cart-remove" data-index="${i}">移除</button></div></article>`;
    }).join('');
    const shipping = total() >= 18800 ? '商品小计已达 188 元。优惠后商品实付仍满 188 元时，同一顾客、同一收货地址一单顺丰包邮，偏远地区除外。' : `距 188 元包邮门槛还差 ${money(18800 - total())}。按优惠后商品实付计算，同一顾客、同一收货地址一单，偏远地区除外。`;
    open(`<p class="dialog-eyebrow">确认规格与数量</p><h2 id="dialog-title">你的选豆单</h2><div class="cart-rows">${rows}</div><div class="cart-total"><span>商品小计</span><strong>${money(total())}</strong></div><p class="dialog-note">未含运费及优惠，实际应付金额在微信确认。</p><div class="shipping-hint">${shipping}</div><div class="cart-cta"><button type="button" class="clay-button" data-action="copy-selection">复制选豆单 <span aria-hidden="true">↗</span></button><button class="text-button" type="button" data-action="wechat">联系海市工作微信 ↗</button></div><details class="cart-draft"><summary>查看下单文案</summary><label class="sr-only" for="order-draft">可复制的下单文案</label><textarea id="order-draft" readonly>${escape(selectionText())}</textarea></details>`, 'cart');
  }

  function wechat() {
    open('<p class="dialog-eyebrow">微信下单与售后</p><h2 id="dialog-title">联系海市咖啡</h2><p class="contact-dialog-intro">把选豆单发给我，确认可供批次、研磨需求、运费和金额后，在微信完成下单。</p><div class="contact-qr"><div class="qr-pending"><strong>工作微信二维码</strong><small>设计预留位置<br>待放入海市工作微信二维码</small></div></div><ol class="contact-steps"><li>在网站选好豆款、规格和数量。</li><li>复制选豆单，添加工作微信后发送。</li><li>确认当前批次与应付金额，再转账下单。</li></ol><button type="button" class="clay-button dialog-add" data-action="cart">查看选豆单 <span aria-hidden="true">↗</span></button><p class="dialog-note">此处是联系入口，不是收款码。</p>', 'wechat');
    // The user supplies this contact image; its absence keeps the honest preview placeholder.
    const qr = new Image();
    qr.alt = '海市咖啡工作微信二维码';
    qr.onload = () => { if (dialogKind === 'wechat') dialog.querySelector('.contact-qr')?.replaceChildren(qr); };
    if (window.HAISHI_WORK_WECHAT_QR) qr.src = root + '/' + window.HAISHI_WORK_WECHAT_QR;
  }

  async function copySelection() {
    const text = selectionText();
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (_) {
      const input = dialog.querySelector('#order-draft');
      if (input) {
        input.closest('details').open = true; input.focus(); input.select();
        try { ok = document.execCommand('copy'); } catch (_) {}
      }
    }
    toast(ok ? '选豆单已复制，可以发到微信确认。' : '请在下单文案中长按选择并复制。');
  }

  document.addEventListener('click', e => {
    const control = e.target.closest('[data-action]'); if (!control) return;
    const action = control.dataset.action;
    if (action === 'choose') choose(control.dataset.id);
    if (action === 'cart') showCart();
    if (action === 'wechat') wechat();
    if (action === 'close-dialog') close();
    if (action === 'quantity-minus' || action === 'quantity-plus') { quantity = Math.max(1, Math.min(99, quantity + (action === 'quantity-plus' ? 1 : -1))); updateChosen(); }
    if (action === 'add-selection') {
      if (!chosen || chosen.soldOut) return;
      const row = cart.find(r => r.id === chosen.id && r.grams === grams);
      if (row) row.quantity = Math.min(99, row.quantity + quantity); else cart.push({id:chosen.id,grams,quantity});
      save(); close(); toast(`${chosen.name} ${weightLabel(grams)} 已加入选豆单`);
      document.dispatchEvent(new CustomEvent('haishi:selection-added', {detail: {id: chosen.id, grams, quantity}}));
    }
    if (action === 'cart-minus' || action === 'cart-plus' || action === 'cart-remove') {
      const index = Number(control.dataset.index); const row = cart[index]; if (!row) return;
      if (action === 'cart-remove') cart.splice(index, 1);
      else { row.quantity = Math.min(99, row.quantity + (action === 'cart-plus' ? 1 : -1)); if (row.quantity < 1) cart.splice(index, 1); }
      save(); showCart();
      dialog.querySelector(`[data-action="${action}"][data-index="${index}"]`)?.focus({preventScroll:true});
    }
    if (action === 'copy-selection') copySelection();
    if (action === 'reset-search') {
      const input = document.querySelector('#bean-search'); if (input) input.value = '';
      filter = 'all'; applyFilters(); input?.focus({preventScroll:true});
    }
  });

  const cards = [...document.querySelectorAll('.product-card')];
  let filter = 'all';
  function applyFilters() {
    const query = document.querySelector('#bean-search')?.value.trim().toLocaleLowerCase() || '';
    let count = 0;
    cards.forEach(card => {
      const show = (filter === 'all' || card.dataset.tags.split(' ').includes(filter)) && (!query || card.dataset.search.toLocaleLowerCase().includes(query));
      card.hidden = !show; if (show) count++;
    });
    document.querySelectorAll('.catalog-filter button').forEach(b => { const active = b.dataset.filter === filter; b.classList.toggle('selected', active); b.setAttribute('aria-pressed', String(active)); });
    const status = document.querySelector('.filter-status'); if (status) status.textContent = query ? `找到 ${count} 款` : `共 ${count} 款`;
    const empty = document.querySelector('.empty-search'); if (empty) empty.hidden = count > 0;
  }
  document.querySelectorAll('.catalog-filter button').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; applyFilters(); }));
  document.querySelector('#bean-search')?.addEventListener('input', applyFilters);
  window.addEventListener('storage', e => { if (e.key === storageKey) location.reload(); });
})();

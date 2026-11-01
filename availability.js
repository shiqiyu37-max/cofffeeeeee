(() => {
  'use strict';
  const unavailable = new Set(['item-12']);
  const isSoldOut = id => unavailable.has(id);
  window.HaishiStock = {isSoldOut};
  (window.HAISHI_DATA || []).forEach(p => { if (isSoldOut(p.id)) p.soldOut = true; });

  const style = document.createElement('style');
  style.id = 'haishi-stock-style';
  style.textContent = `
    .is-sold-out{cursor:default!important;position:relative;opacity:1!important}
    .is-sold-out .bean-art,.is-sold-out .cover-button{position:relative}
    .is-sold-out .bean-art>img,.is-sold-out .cover-button>img,
    .related-card.is-sold-out>img,.catalog-row.is-sold-out>img{filter:grayscale(1);opacity:.52}
    .is-sold-out .scene-notes,.is-sold-out .scene-extension{display:none}
    .is-sold-out:hover,.is-sold-out:active,
    .is-sold-out:hover .bean-art,.is-sold-out:hover img{transform:none!important;translate:none!important}
    .is-sold-out .bean-name,.is-sold-out .bean-price,.is-sold-out .card-flavor,
    .is-sold-out .card-title,.is-sold-out .flavor-tags{color:#858783!important}
    .is-sold-out .detail-arrow,.is-sold-out .gallery-edition i{visibility:hidden}
    .is-sold-out button,.is-sold-out a{cursor:default!important}
    .is-sold-out .add-btn{background:#e7e8e5;color:#757871;box-shadow:none}
    .stock-watermark{position:absolute;left:50%;top:50%;z-index:5;
      display:block;transform:translate(-50%,-50%) rotate(-12deg);
      padding:.19em .30em .23em .48em;border:2px solid currentColor;
      border-radius:3px;color:rgba(88,92,87,.70);background:rgba(255,255,255,.73);
      font:600 clamp(27px,3.2vw,46px)/1.25 sans-serif;letter-spacing:.23em;
      white-space:nowrap;pointer-events:none;user-select:none}
    .bean-art .stock-watermark{left:calc(50% + 18px)}
    .catalog-row.is-sold-out{color:#81867e}
    .stock-status{display:inline-block;margin-left:12px;padding:4px 9px;
      border:1px solid #c9ccc6;border-radius:4px;color:#787e73;
      font:500 13px/1.4 sans-serif;letter-spacing:.08em;vertical-align:middle}
    .stock-unavailable-button{background:#e7e8e5!important;color:#757871!important;
      box-shadow:none!important;cursor:default!important;opacity:1!important}
    @media(max-width:600px){.stock-watermark{font-size:30px}.stock-status{font-size:12px}}
  `;
  document.head.append(style);

  function disable(element) {
    element.setAttribute('aria-disabled', 'true');
    element.setAttribute('tabindex', '-1');
    if ('disabled' in element) element.disabled = true;
    if (element.tagName === 'A') element.removeAttribute('href');
  }
  function markCard(card) {
    if (card.classList.contains('is-sold-out')) return;
    card.classList.add('is-sold-out');
    card.setAttribute('aria-label', '贝多芬，已售罄');
    card.setAttribute('aria-disabled', 'true');
    if (card.matches('button,a')) disable(card);
    card.querySelectorAll('button,a,input,select').forEach(disable);
    if (card.matches('.catalog-row')) {
      const name = card.querySelector('.catalog-name');
      if (name) name.append(' · 已售罄');
      return;
    }
    const art = card.querySelector('.bean-art,.cover-button') || card;
    const label = document.createElement('span');
    label.className = 'stock-watermark'; label.textContent = '售罄';
    label.setAttribute('aria-hidden', 'true'); art.append(label);
    card.querySelectorAll('.gallery-hint,.add-btn').forEach(e => {e.textContent = '已售罄';});
  }
  function refresh() {
    document.querySelectorAll('.product-card[data-product="item-12"],.bean-card[data-id="item-12"],.catalog-row[data-id="item-12"]').forEach(markCard);
    document.querySelectorAll('.related-card[href*="item-12.html"]').forEach(markCard);
    document.querySelectorAll('[data-action="choose"][data-id="item-12"]').forEach(button => {
      disable(button);button.classList.add('stock-unavailable-button');
      if (button.textContent !== '已售罄') button.textContent = '已售罄';
    });
    if (document.body.dataset.productId === 'item-12') {
      const heading = document.querySelector('main h1');
      if (heading && !heading.querySelector('.stock-status')) {
        const status = document.createElement('span');status.className = 'stock-status';
        status.textContent = '已售罄';heading.append(status);
      }
    }
  }
  // A capture guard also covers keyboard-generated and delegated clicks.
  document.addEventListener('click', event => {
    const target = event.target.closest('.is-sold-out,[data-action][data-id="item-12"],[data-bean-action][data-id="item-12"]');
    if (target) {event.preventDefault();event.stopImmediatePropagation();}
  }, true);
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;pending = true;
    queueMicrotask(() => {pending = false;refresh();});
  });
  observer.observe(document.body, {childList:true,subtree:true});
  refresh();
})();

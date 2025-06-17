const CONVENIENCE_FEE = 99;
bagItems = bagItems || JSON.parse(localStorage.getItem('bagItems')) || [];
let bagItemObjects;

onLoad();

function onLoad() {
    loadBagItemObjects();
    displayBagItems();
    displayBagSummary();
    displayBagIcon();
}

function buildCounts() {
    const counts = {};
    bagItems.forEach(id => counts[id] = (counts[id] || 0) + 1);
    return counts;
}

function loadBagItemObjects() {
  const counts = {};
  bagItems.forEach(id => counts[id] = (counts[id] || 0) + 1);

  const seen = new Set();
  bagItemObjects = [];
  for (const id of bagItems) {
    if (seen.has(id)) continue;
    const product = items.find(it => it.id == id);
    if (product) {
      bagItemObjects.push({ ...product, qty: counts[id] });
      seen.add(id);
    }
  }
}

function displayBagItems() {
    const container = document.querySelector('.bag-items-container');
    let innerHTML = '';
    bagItemObjects.forEach(item => innerHTML += generateItemHTML(item));
    container.innerHTML = innerHTML;
}

function displayBagSummary() {
    const summary = document.querySelector('.bag-summary');
    const totalItem = bagItems.length;
    const totalMRP = bagItemObjects.reduce((s, i) => s + i.original_price * i.qty, 0);
    const totalDiscount = bagItemObjects.reduce((s, i) => s + (i.original_price - i.current_price) * i.qty, 0);
    const finalPayment = totalMRP - totalDiscount + CONVENIENCE_FEE;
    summary.innerHTML = `
        <div class="bag-details-container">
            <div class="price-header">PRICE DETAILS (${totalItem} Items)</div>
            <div class="price-item"><span class="price-item-tag">Total MRP</span><span class="price-item-value">₹${totalMRP}</span></div>
            <div class="price-item"><span class="price-item-tag">Discount on MRP</span><span class="price-item-value priceDetail-base-discount">-₹${totalDiscount}</span></div>
            <div class="price-item"><span class="price-item-tag">Convenience Fee</span><span class="price-item-value">₹${CONVENIENCE_FEE}</span></div>
            <hr>
            <div class="price-footer"><span class="price-item-tag">Total Amount</span><span class="price-item-value">₹${finalPayment}</span></div>
        </div>
        <button class="btn-place-order"><div class="css-xjhrni">PLACE ORDER</div></button>`;
}

function incrementQty(id) {
    bagItems.push(id);
    localStorage.setItem('bagItems', JSON.stringify(bagItems));
    refreshBag();
}

function decrementQty(id) {
    const idx = bagItems.indexOf(id);
    if (idx > -1) bagItems.splice(idx, 1);
    localStorage.setItem('bagItems', JSON.stringify(bagItems));
    refreshBag();
}

function removeFromBag(id) {
    bagItems = bagItems.filter(bagItemId => bagItemId != id);
    localStorage.setItem('bagItems', JSON.stringify(bagItems));
    refreshBag();
}

function refreshBag() {
    loadBagItemObjects();
    displayBagIcon();
    displayBagItems();
    displayBagSummary();
}

function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function generateItemHTML(item) {
    return `
    <div class="bag-item-container">
        <div class="item-left-part">
            <img class="bag-item-img" src="${item.image}">
            <div class="qty-controller">
                <button class="qty-btn" onclick="decrementQty('${item.id}')">-</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-btn" onclick="incrementQty('${item.id}')">+</button>
            </div>
        </div>
        <div class="item-right-part">
            <div class="company">${item.company}</div>
            <div class="item-name">${item.item_name}</div>
            <div class="price-container">
                <span class="current-price">Rs ${item.current_price}</span>
                <span class="original-price">Rs ${item.original_price}</span>
                <span class="discount-percentage">(${item.discount_percentage}% OFF)</span>
            </div>
            <div class="return-period"><span class="return-period-days">${item.return_period} days</span> return available</div>
            <div class="delivery-details">Delivery by <span class="delivery-details-days">${getDeliveryDate()}</span></div>
        </div>
        <div class="remove-from-cart" onclick="removeFromBag('${item.id}')">x</div>
    </div>`;
}

function displayBagIcon() {
    const badge = document.querySelector('.bag-item-count');
    if (!badge) return;
    badge.style.visibility = bagItems.length ? 'visible' : 'hidden';
    badge.textContent = bagItems.length;
}

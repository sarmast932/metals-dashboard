document.addEventListener("DOMContentLoaded", function () {

  // ================= TAB SYSTEM =================

  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // ================= GLOBAL STATE =================

  let prices = { Gold: 0, Silver: 0 };

  function format(num) {
    return Number(num || 0).toLocaleString("en-US");
  }

  // ================= MARKET =================

  async function refresh() {
    try {
      const gold = await DataService.fetchPlan("Gold");
      const silver = await DataService.fetchPlan("Silver");

      renderMarket("Gold", gold);
      renderMarket("Silver", silver);

    } catch (e) {
      console.log("Market fetch error");
    }
  }

  function renderMarket(plan, data) {

    const toman = Math.floor(data.priceRial / 10);
    const prev = Math.floor(data.prevPriceRial / 10);

    prices[plan] = toman;

    const delta = toman - prev;
    const percent = prev > 0 ? (delta / prev) * 100 : 0;
    const date = new Date(data.date).toLocaleDateString("fa-IR");

    let html = `<h3>${plan === "Gold"
      ? "شمش طلای بیمه‌نامه کاریزما"
      : "شمش نقره بیمه‌نامه کاریزما"}</h3>`;

    html += `قیمت: ${format(toman)} تومان<br>`;

    if (plan === "Gold") {
      html += `معادل 18 عیار (ضریب 0.75): ${format(toman * 0.75)} تومان<br>`;
    }

    html += `تغییر 24ساعته: ${format(delta)} (${percent.toFixed(2)}٪)<br>`;
    html += `تاریخ: ${date}`;

    document.getElementById(plan.toLowerCase() + "Market").innerHTML = html;

    checkAlerts(plan, toman);
  }

  // ================= PORTFOLIO =================

  function renderPortfolio(plan) {

    const section = document.getElementById(plan.toLowerCase() + "PortfolioSection");
    const buys = PortfolioEngine.get(plan);
    const stats = PortfolioEngine.calculate(plan, prices[plan] || 0);

    let html = `<h3>پرتفوی ${plan}</h3>`;

    html += `
      <input type="number" id="${plan}Qty" placeholder="گرم">
      <input type="number" id="${plan}Price" placeholder="قیمت خرید (تومان)">
      <button data-action="add" data-plan="${plan}">ثبت</button>
      <hr>
    `;

    if (buys.length > 0) {

      html += `<table>
        <tr>
          <th>#</th>
          <th>گرم</th>
          <th>قیمت خرید</th>
          <th>عملیات</th>
        </tr>`;

      buys.forEach((b, i) => {
        html += `
          <tr>
            <td>${i + 1}</td>
            <td>${b.qty}</td>
            <td>${format(b.price)}</td>
            <td>
              <button data-action="edit" data-plan="${plan}" data-index="${i}">✏</button>
              <button data-action="delete" data-plan="${plan}" data-index="${i}">❌</button>
            </td>
          </tr>
        `;
      });

      html += `</table>`;
    }

    html += `<hr>
      مجموع گرم: ${stats.qty.toFixed(3)}<br>
      ارزش فعلی: ${format(stats.value)} تومان<br>
      سود خالص (پس از کسر 1٪ فروش): ${format(stats.net)} تومان<br>
      درصد بازده: ${stats.percent.toFixed(2)}٪<br>
      نقطه سر به سر: ${format(stats.breakEven.toFixed(0))} تومان`;

    section.innerHTML = html;
  }

  document.body.addEventListener("click", function (e) {

    const action = e.target.dataset.action;
    if (!action) return;

    const plan = e.target.dataset.plan;

    if (action === "add") {
      const qty = parseFloat(document.getElementById(plan + "Qty").value);
      const price = parseFloat(document.getElementById(plan + "Price").value);
      if (!qty || !price) return;
      PortfolioEngine.add(plan, qty, price);
      renderPortfolio(plan);
    }

    if (action === "delete") {
      PortfolioEngine.remove(plan, parseInt(e.target.dataset.index));
      renderPortfolio(plan);
    }

    if (action === "edit") {
      const index = parseInt(e.target.dataset.index);
      const item = PortfolioEngine.get(plan)[index];

      const newQty = prompt("گرم جدید:", item.qty);
      const newPrice = prompt("قیمت جدید:", item.price);

      if (!newQty || !newPrice) return;

      PortfolioEngine.update(plan, index, parseFloat(newQty), parseFloat(newPrice));
      renderPortfolio(plan);
    }
  });

  // ================= ALERT SYSTEM =================

  function updateAlertUI(plan) {

    const alerts = SettingsEngine.get().alerts[plan];
    const statusEl = document.getElementById(plan.toLowerCase() + "AlertStatus");

    if (!alerts.high && !alerts.low) {
      statusEl.innerHTML = "هشداری فعال نیست";
      return;
    }

    statusEl.innerHTML =
      `فعال → بالاتر از: ${alerts.high ? format(alerts.high) : "-"} | ` +
      `پایین‌تر از: ${alerts.low ? format(alerts.low) : "-"}`;
  }

  function checkAlerts(plan, price) {

    const alerts = SettingsEngine.get().alerts[plan];

    if (alerts.high && price > alerts.high) {
      alert(`${plan} از حد بالایی عبور کرد`);
    }

    if (alerts.low && price < alerts.low) {
      alert(`${plan} از حد پایینی عبور کرد`);
    }
  }

  document.getElementById("saveGoldAlert").addEventListener("click", function () {
    const high = parseFloat(document.getElementById("goldAlertHigh").value) || null;
    const low = parseFloat(document.getElementById("goldAlertLow").value) || null;
    SettingsEngine.setAlert("Gold", high, low);
    updateAlertUI("Gold");
  });

  document.getElementById("clearGoldAlert").addEventListener("click", function () {
    SettingsEngine.clearAlert("Gold");
    updateAlertUI("Gold");
  });

  document.getElementById("saveSilverAlert").addEventListener("click", function () {
    const high = parseFloat(document.getElementById("silverAlertHigh").value) || null;
    const low = parseFloat(document.getElementById("silverAlertLow").value) || null;
    SettingsEngine.setAlert("Silver", high, low);
    updateAlertUI("Silver");
  });

  document.getElementById("clearSilverAlert").addEventListener("click", function () {
    SettingsEngine.clearAlert("Silver");
    updateAlertUI("Silver");
  });

  // ================= INIT =================

  renderPortfolio("Gold");
  renderPortfolio("Silver");

  updateAlertUI("Gold");
  updateAlertUI("Silver");

  refresh();
  setInterval(refresh, 60000);

});
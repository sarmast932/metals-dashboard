const PortfolioEngine = (function () {

  const KEY = "portfolio_v4";

  let state = JSON.parse(localStorage.getItem(KEY)) || {
    Gold: [],
    Silver: []
  };

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function add(plan, qty, price) {
    state[plan].push({ qty, price });
    save();
  }

  function update(plan, index, qty, price) {
    state[plan][index] = { qty, price };
    save();
  }

  function remove(plan, index) {
    state[plan].splice(index, 1);
    save();
  }

  function clear() {
    state = { Gold: [], Silver: [] };
    save();
  }

  function get(plan) {
    return state[plan];
  }

  function calculate(plan, currentPrice) {

    let qty = 0;
    let invest = 0;

    state[plan].forEach(b => {
      qty += b.qty;
      invest += b.qty * b.price;
    });

    const value = qty * currentPrice;
    const gross = value - invest;
    const fee = value * 0.01;
    const net = gross - fee;
    const percent = invest > 0 ? (net / invest) * 100 : 0;
    const breakEven = qty > 0 ? invest / (qty * 0.99) : 0;

    return { qty, invest, value, net, percent, breakEven };
  }

  return { add, update, remove, clear, get, calculate };

})();
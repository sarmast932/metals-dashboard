const DataService = (function () {

  async function fetchPlan(plan) {
    const res = await fetch(`https://inv.charisma.ir/pub/Plans/${plan}`);
    const json = await res.json();

    return {
      priceRial: json.data.latestIndexPrice.index,
      prevPriceRial: json.data.prevIndexPrice.index,
      date: json.data.indexDate
    };
  }

  return { fetchPlan };

})();
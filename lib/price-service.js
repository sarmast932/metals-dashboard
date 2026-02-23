export async function fetchPrices() {

  // اینجا همان logic فعلی fetch قیمت را منتقل کن

  const gold = await fetchGold()
  const silver = await fetchSilver()

  return {
    gold,
    silver
  }
}
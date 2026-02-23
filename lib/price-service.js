async function fetchCharismaPrice(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`)
  }

  const json = await response.json()

  if (!json.isSuccess || !json.data?.latestIndexPrice?.index) {
    throw new Error("Invalid Charisma API response")
  }

  return json.data.latestIndexPrice.index
}

async function fetchPrices() {
  try {
    const [gold, silver] = await Promise.all([
      fetchCharismaPrice("https://inv.charisma.ir/pub/Plans/Gold"),
      fetchCharismaPrice("https://inv.charisma.ir/pub/Plans/Silver")
    ])

    return {
      gold,
      silver
    }

  } catch (error) {
    console.error("charisma price-service error:", error.message)
    throw error
  }
}

module.exports = { fetchPrices }
const fetch = require("node-fetch")

const GOLD_URL = "https://inv.charisma.ir/pub/Plans/Gold"
const SILVER_URL = "https://inv.charisma.ir/pub/Plans/Silver"

function calculateChange(latest, prev) {
  const change = latest - prev
  const percent = (change / prev) * 100
  return { change, percent }
}

function toToman(rial) {
  return rial / 10
}

function toJalali(dateStr) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).format(date)
}

module.exports = async function handler(req, res) {
  try {

    const [goldRes, silverRes] = await Promise.all([
      fetch(GOLD_URL),
      fetch(SILVER_URL)
    ])

    const goldJson = await goldRes.json()
    const silverJson = await silverRes.json()

    const goldData = goldJson.data
    const silverData = silverJson.data

    const goldLatest = goldData.latestIndexPrice.index
    const goldPrev = goldData.prevIndexPrice.index

    const silverLatest = silverData.latestIndexPrice.index
    const silverPrev = silverData.prevIndexPrice.index

    const goldChange = calculateChange(goldLatest, goldPrev)
    const silverChange = calculateChange(silverLatest, silverPrev)

    return res.status(200).json({
      success: true,
      gold: {
        priceToman: toToman(goldLatest),
        price18k: toToman(goldLatest) * 0.75,
        changeToman: toToman(goldChange.change),
        percent: goldChange.percent,
        date: toJalali(goldData.indexDate)
      },
      silver: {
        priceToman: toToman(silverLatest),
        changeToman: toToman(silverChange.change),
        percent: silverChange.percent,
        date: toJalali(silverData.indexDate)
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
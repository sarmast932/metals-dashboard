const { getAllAlerts } = require("../lib/alert-registry");
const { evaluateAlert } = require("../lib/alert-engine");
const { savePriceSnapshot } = require("../lib/history");

// نسخه تستی با نوسان تصادفی کوچک
async function getPrices() {
  const baseGold = 32000000;

  // نوسان ±0.2٪
  const randomFactor = 1 + (Math.random() - 0.5) * 0.004;

  return {
    gold: Math.floor(baseGold * randomFactor),
    silver: 450000
  };
}

module.exports = async function handler(req, res) {
  try {
    const prices = await getPrices();

    for (const asset of Object.keys(prices)) {
      await savePriceSnapshot(asset, prices[asset]);
    }

    const alerts = await getAllAlerts();
    let triggeredCount = 0;

    for (const alert of alerts) {
      const currentPrice = prices[alert.asset];
      if (!currentPrice) continue;

      const isTriggered = await evaluateAlert(alert, currentPrice);
      if (isTriggered) triggeredCount++;
    }

    return res.status(200).json({
      success: true,
      prices,
      triggered: triggeredCount
    });

  } catch (error) {
    console.error("price-check error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
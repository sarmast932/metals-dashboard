const { redis } = require("../lib/redis");
const { getAllAlerts } = require("../lib/alert-registry");
const { evaluateAlert } = require("../lib/alert-engine");
const { savePriceSnapshot } = require("../lib/history");

// فعلاً قیمت تستی است — بعداً به price-service واقعی وصل می‌کنیم
async function getPrices() {
  return {
    gold: 32000000,
    silver: 450000
  };
}

module.exports = async function handler(req, res) {
  try {
    // 1️⃣ گرفتن قیمت فعلی
    const prices = await getPrices();

    // 2️⃣ ذخیره snapshot در history
    for (const asset of Object.keys(prices)) {
      await savePriceSnapshot(asset, prices[asset]);
    }

    // 3️⃣ گرفتن همه alertها
    const alerts = await getAllAlerts();

    let triggeredCount = 0;

    // 4️⃣ ارزیابی alertها
    for (const alert of alerts) {
      const currentPrice = prices[alert.asset];

      if (!currentPrice) continue;

      const isTriggered = await evaluateAlert(alert, currentPrice);

      if (isTriggered) {
        triggeredCount++;
      }
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
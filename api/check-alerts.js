const { evaluatePriceCross } = require("../lib/alert-engine");
const { getAllAlerts } = require("../lib/alert-registry");

async function fetchGoldPrice() {
  return 32000000;
}

async function sendTelegram(message) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });
}

module.exports = async function (req, res) {
  try {
    const currentPrice = await fetchGoldPrice();

    const alerts = await getAllAlerts();

    const triggeredAlerts = [];

    for (const alert of alerts) {
      const triggered = await evaluatePriceCross(alert, currentPrice);

      if (triggered) {
        triggeredAlerts.push(alert);

        await sendTelegram(
          `🚨 ${alert.asset.toUpperCase()} crossed ${alert.threshold}
Current price: ${currentPrice}`
        );
      }
    }

    return res.status(200).json({
      success: true,
      price: currentPrice,
      totalAlerts: alerts.length,
      triggeredCount: triggeredAlerts.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
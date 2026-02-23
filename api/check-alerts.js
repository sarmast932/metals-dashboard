const { evaluatePriceCross } = require("../lib/alert-engine");

async function fetchGoldPrice() {
  // فعلاً قیمت تستی
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

    const alert = {
      id: "gold-1",
      asset: "gold",
      type: "price-cross",
      direction: "above",
      threshold: 31000000,
      level: "critical",
      enabled: true,
    };

    const triggered = await evaluatePriceCross(alert, currentPrice);

    if (triggered) {
      await sendTelegram(
        `🚨 Gold crossed ${alert.threshold}\nCurrent price: ${currentPrice}`
      );
    }

    return res.status(200).json({
      success: true,
      price: currentPrice,
      alertTriggered: triggered,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
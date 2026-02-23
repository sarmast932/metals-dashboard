import { redis } from "../lib/redis";
import { getAllAlerts } from "../lib/alert-registry";
import { evaluatePriceCross } from "../lib/alert-engine";

// ⬇️ فعلاً قیمت تستی
async function getPrices() {
  return {
    gold: 32000000,
    silver: 450000
  };
}

export default async function handler(req, res) {
  try {

    // 1️⃣ گرفتن قیمت
    const prices = await getPrices();

    // 2️⃣ ذخیره در history
    for (const asset of Object.keys(prices)) {
      const ts = Date.now();
      const key = `history:${asset}`;
      const record = { price: prices[asset], at: ts };

      await redis.zadd(key, {
        score: ts,
        member: JSON.stringify(record)
      });
    }

    // 3️⃣ اجرای alert
    const alerts = await getAllAlerts();
    let triggered = 0;

    for (const alert of alerts) {
      const currentPrice = prices[alert.asset];
      const isTriggered = await evaluatePriceCross(alert, currentPrice);

      if (isTriggered) {
        triggered++;
      }
    }

    return res.status(200).json({
      success: true,
      prices,
      triggered
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
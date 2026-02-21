import { sendTelegramMessage } from "./send-telegram.js";

let lastState = {
  goldAbove: false,
  silverAbove: false
};

const GOLD_THRESHOLD = 260000000;   // ریال
const SILVER_THRESHOLD = 6000000;   // ریال

export default async function handler(req, res) {

  try {

    const goldResponse = await fetch("https://inv.charisma.ir/pub/Plans/Gold");
    const silverResponse = await fetch("https://inv.charisma.ir/pub/Plans/Silver");

    const goldData = await goldResponse.json();
    const silverData = await silverResponse.json();

    const goldPrice = goldData.data.latestIndexPrice.index;
    const silverPrice = silverData.data.latestIndexPrice.index;

    let messages = [];

    // ===== GOLD CHECK =====
    if (goldPrice > GOLD_THRESHOLD && !lastState.goldAbove) {
      messages.push(`🔴 هشدار بحرانی طلا\nقیمت از حد تعیین شده عبور کرد.\nقیمت فعلی: ${goldPrice.toLocaleString()} ریال`);
      lastState.goldAbove = true;
    }

    if (goldPrice <= GOLD_THRESHOLD) {
      lastState.goldAbove = false;
    }

    // ===== SILVER CHECK =====
    if (silverPrice > SILVER_THRESHOLD && !lastState.silverAbove) {
      messages.push(`🔴 هشدار بحرانی نقره\nقیمت از حد تعیین شده عبور کرد.\nقیمت فعلی: ${silverPrice.toLocaleString()} ریال`);
      lastState.silverAbove = true;
    }

    if (silverPrice <= SILVER_THRESHOLD) {
      lastState.silverAbove = false;
    }

    // ===== SEND IF NEEDED =====
    for (const msg of messages) {
      await sendTelegramMessage(msg);
    }

    res.status(200).json({
      gold: goldPrice,
      silver: silverPrice,
      alertsSent: messages.length
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

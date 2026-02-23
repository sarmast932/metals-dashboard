const { generateReport } = require("../lib/history")
const { buildReportMessage } = require("../lib/report-builder")

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID

async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })
  })

  if (!response.ok) {
    throw new Error("Telegram send failed")
  }
}

module.exports = async function handler(req, res) {
  try {
    const goldReport = await generateReport("gold", 24)
    const silverReport = await generateReport("silver", 24)

    if (!goldReport || !silverReport) {
      return res.status(400).json({ error: "Not enough data" })
    }

    const message = buildReportMessage(goldReport, silverReport)

    await sendTelegram(message)

    return res.status(200).json({ success: true })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
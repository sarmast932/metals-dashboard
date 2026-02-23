const https = require("https")
const { generateReport } = require("../lib/history")
const { buildReportMessage } = require("../lib/report-builder")

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID

function sendTelegram(message) {
  return new Promise((resolve, reject) => {
    if (!BOT_TOKEN) return reject(new Error("BOT_TOKEN missing"))
    if (!CHAT_ID) return reject(new Error("CHAT_ID missing"))

    const data = JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })

    const options = {
      hostname: "api.telegram.org",
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    }

    const req = https.request(options, res => {
      let body = ""
      res.on("data", chunk => body += chunk)
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve()
        } else {
          reject(new Error(body))
        }
      })
    })

    req.on("error", reject)
    req.write(data)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  try {
    const goldReport = await generateReport("gold", 24)
    const silverReport = await generateReport("silver", 24)

    if (!goldReport || !silverReport) {
      return res.status(400).json({
        success: false,
        error: "Not enough data for report"
      })
    }

    const message = buildReportMessage(goldReport, silverReport)

    await sendTelegram(message)

    return res.status(200).json({
      success: true
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
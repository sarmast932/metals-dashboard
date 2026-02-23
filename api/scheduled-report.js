const https = require("https")
const { generateReportByRange } = require("../lib/history")
const { buildReportMessage } = require("../lib/report-builder")

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID

function sendTelegram(message) {
  return new Promise((resolve, reject) => {
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

function getSessionRange() {
  const now = new Date()

  const utcHour = now.getUTCHours()
  const utcMinute = now.getUTCMinutes()

  // convert to Tehran time
  const tehran = new Date(now.getTime() + (3.5 * 60 * 60 * 1000))
  const hour = tehran.getHours()

  let from = new Date(tehran)
  let to = new Date(tehran)

  if (hour >= 9 && hour < 16) {
    from.setHours(9,0,0,0)
    to.setHours(16,0,0,0)
  }
  else if (hour >= 16 && hour < 23) {
    from.setHours(16,0,0,0)
    to.setHours(23,0,0,0)
  }
  else {
    // شب تا 9 صبح
    if (hour < 9) {
      from.setDate(from.getDate() - 1)
      from.setHours(23,0,0,0)
      to.setHours(9,0,0,0)
    } else {
      from.setHours(23,0,0,0)
      to.setDate(to.getDate() + 1)
      to.setHours(9,0,0,0)
    }
  }

  return {
    fromTs: from.getTime() - (3.5 * 60 * 60 * 1000),
    toTs: to.getTime() - (3.5 * 60 * 60 * 1000)
  }
}

module.exports = async function handler(req, res) {
  try {
    const { fromTs, toTs } = getSessionRange()

    const goldReport = await generateReportByRange("gold", fromTs, toTs)
    const silverReport = await generateReportByRange("silver", fromTs, toTs)

    if (!goldReport || !silverReport) {
      return res.status(400).json({
        success: false,
        error: "Not enough data in this session"
      })
    }

    const message = buildReportMessage(goldReport, silverReport)

    await sendTelegram(message)

    return res.status(200).json({
      success: true,
      session: { fromTs, toTs }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
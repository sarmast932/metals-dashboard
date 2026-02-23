const { generateReportByRange } = require("../lib/history")

function buildSessionRange(session) {
  const now = new Date()
  const tehran = new Date(now.getTime() + (3.5 * 60 * 60 * 1000))

  let from = new Date(tehran)
  let to = new Date(tehran)

  if (session === "morning") {
    from.setDate(from.getDate() - 1)
    from.setHours(23,0,0,0)
    to.setHours(9,0,0,0)
  }
  else if (session === "afternoon") {
    from.setHours(9,0,0,0)
    to.setHours(16,0,0,0)
  }
  else if (session === "night") {
    from.setHours(16,0,0,0)
    to.setHours(23,0,0,0)
  }
  else {
    return null
  }

  return {
    fromTs: from.getTime() - (3.5 * 60 * 60 * 1000),
    toTs: to.getTime() - (3.5 * 60 * 60 * 1000)
  }
}

module.exports = async function handler(req, res) {
  try {
    const { asset, session } = req.query

    if (!asset || !session) {
      return res.status(400).json({
        success: false,
        error: "asset and session required"
      })
    }

    const range = buildSessionRange(session)

    if (!range) {
      return res.status(400).json({
        success: false,
        error: "invalid session"
      })
    }

    const report = await generateReportByRange(
      asset,
      range.fromTs,
      range.toTs
    )

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "no data in this session"
      })
    }

    return res.status(200).json({
      success: true,
      report
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
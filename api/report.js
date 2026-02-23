const { generateReport } = require("../lib/history")

module.exports = async function handler(req, res) {
  try {
    const { asset, hours } = req.query

    if (!asset) {
      return res.status(400).json({ error: "asset required" })
    }

    const report = await generateReport(
      asset,
      Number(hours) || 24
    )

    if (!report) {
      return res.status(404).json({
        error: "Not enough data"
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
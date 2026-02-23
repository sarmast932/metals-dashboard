const { generateReport } = require("../lib/history")

module.exports = async function handler(req, res) {
  try {
    const report = await generateReport("gold", 24)

    return res.status(200).json({
      success: true,
      reportExists: !!report
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
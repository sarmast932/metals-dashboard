const { getRecentHistory } = require('../lib/history')

module.exports = async function handler(req, res) {
  try {
    const { asset, limit } = req.query

    if (!asset) {
      return res.status(400).json({ error: 'asset required' })
    }

    const data = await getRecentHistory(asset, Number(limit) || 100)

    return res.status(200).json({
      count: data.length,
      data
    })

  } catch (error) {
    console.error('history error:', error)
    return res.status(500).json({ error: error.message })
  }
}
import { getRecentHistory } from '../lib/history'

export default async function handler(req, res) {

  const { asset, limit } = req.query

  if (!asset) {
    return res.status(400).json({ error: 'asset required' })
  }

  const data = await getRecentHistory(asset, Number(limit) || 100)

  return res.status(200).json({
    count: data.length,
    data
  })
}
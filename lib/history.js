const { redis } = require('./redis')

const MAX_RECORDS = 2000
const RETENTION_HOURS = 48

async function savePriceSnapshot(asset, price) {
  const timestamp = Date.now()
  const key = `history:${asset}`

  const record = { price, at: timestamp }

  await redis.zadd(key, {
    score: timestamp,
    member: JSON.stringify(record)
  })

  const currentCount = await redis.zcard(key)
  if (currentCount > MAX_RECORDS) {
    await redis.zremrangebyrank(key, 0, currentCount - MAX_RECORDS - 1)
  }

  const cutoff = timestamp - (RETENTION_HOURS * 60 * 60 * 1000)
  await redis.zremrangebyscore(key, 0, cutoff)
}

async function getWindowData(asset, hours = 24) {
  const key = `history:${asset}`
  const now = Date.now()
  const cutoff = now - (hours * 60 * 60 * 1000)

  const raw = await redis.zrange(key, 0, -1)
  if (!raw || raw.length === 0) return []

  const parsed = raw.map(r =>
    typeof r === 'string' ? JSON.parse(r) : r
  )

  return parsed.filter(r => r.at >= cutoff)
}

async function generateReport(asset, hours = 24) {
  const data = await getWindowData(asset, hours)
  if (data.length === 0) return null

  const prices = data.map(d => d.price)

  const first = data[0].price
  const last = data[data.length - 1].price
  const max = Math.max(...prices)
  const min = Math.min(...prices)

  const change = last - first
  const percentChange = (change / first) * 100

  return {
    asset,
    windowHours: hours,
    current: last,
    open: first,
    high: max,
    low: min,
    change,
    percentChange
  }
}

module.exports = {
  savePriceSnapshot,
  generateReport
}
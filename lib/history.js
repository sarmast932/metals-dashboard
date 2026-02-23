const { redis } = require('./redis')

const MAX_RECORDS = 2000
const RETENTION_HOURS = 48

async function savePriceSnapshot(asset, price) {
  const timestamp = Date.now()
  const key = `history:${asset}`

  const record = {
    price,
    at: timestamp
  }

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

  return true
}

async function getRecentHistory(asset, limit = 100) {
  const key = `history:${asset}`
  const raw = await redis.zrange(key, -limit, -1)

  if (!raw || raw.length === 0) return []

  return raw.map(item =>
    typeof item === 'string' ? JSON.parse(item) : item
  )
}

async function getClosestBefore(asset, timestamp) {
  const key = `history:${asset}`

  const raw = await redis.zrevrangebyscore(
    key,
    timestamp,
    0,
    { count: 1 }
  )

  if (!raw || raw.length === 0) return null

  const item = raw[0]
  return typeof item === 'string' ? JSON.parse(item) : item
}

module.exports = {
  savePriceSnapshot,
  getRecentHistory,
  getClosestBefore
}
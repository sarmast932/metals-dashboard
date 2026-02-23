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

  // Trim by count
  await redis.zremrangebyrank(key, 0, -(MAX_RECORDS + 1))

  // Trim by age
  const cutoff = timestamp - (RETENTION_HOURS * 60 * 60 * 1000)
  await redis.zremrangebyscore(key, 0, cutoff)

  return true
}

async function getRecentHistory(asset, limit = 100) {
  const key = `history:${asset}`
  const raw = await redis.zrange(key, -limit, -1)
  return raw.map(item => JSON.parse(item))
}

module.exports = {
  savePriceSnapshot,
  getRecentHistory
}
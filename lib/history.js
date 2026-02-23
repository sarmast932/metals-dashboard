const { Redis } = require("@upstash/redis")

function getRedis() {
  return new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN
  })
}

const MAX_RECORDS = 2000
const RETENTION_HOURS = 48

async function savePriceSnapshot(asset, price) {
  const redis = getRedis()

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

async function getRangeData(asset, fromTs, toTs) {
  const redis = getRedis()
  const key = `history:${asset}`

  const raw = await redis.zrange(key, 0, -1)
  if (!raw || raw.length === 0) return []

  const parsed = raw.map(r =>
    typeof r === "string" ? JSON.parse(r) : r
  )

  return parsed.filter(r => r.at >= fromTs && r.at <= toTs)
}

async function generateReportByRange(asset, fromTs, toTs) {
  const data = await getRangeData(asset, fromTs, toTs)
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
    from: fromTs,
    to: toTs,
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
  generateReportByRange
}
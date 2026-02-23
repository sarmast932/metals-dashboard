import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const MAX_RECORDS = 2000   // حدود 24-48 ساعت بسته به interval
const RETENTION_HOURS = 48

export async function savePriceSnapshot(asset, price) {
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

  // Trim by count (حفاظت از رشد بی‌نهایت)
  await redis.zremrangebyrank(key, 0, -(MAX_RECORDS + 1))

  // Trim by age (حفاظت زمانی)
  const cutoff = timestamp - (RETENTION_HOURS * 60 * 60 * 1000)
  await redis.zremrangebyscore(key, 0, cutoff)

  return true
}

export async function getRecentHistory(asset, limit = 100) {
  const key = `history:${asset}`

  const raw = await redis.zrange(key, -limit, -1)

  return raw.map(item => JSON.parse(item))
}
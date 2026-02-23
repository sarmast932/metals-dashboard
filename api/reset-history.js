const { Redis } = require("@upstash/redis")

const SECRET = process.env.RESET_SECRET

function getRedis() {
  return new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN
  })
}

module.exports = async function handler(req, res) {
  try {
    const { key } = req.query

    if (!SECRET || key !== SECRET) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized"
      })
    }

    const redis = getRedis()

    await redis.del("history:gold")
    await redis.del("history:silver")

    return res.status(200).json({
      success: true,
      message: "History reset completed"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
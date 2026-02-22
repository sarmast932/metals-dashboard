const { Redis } = require("@upstash/redis");

if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
  throw new Error("Redis environment variables are missing");
}

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

module.exports = { redis };
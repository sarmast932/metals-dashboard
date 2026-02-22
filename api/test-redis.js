const { redis } = require("../lib/redis");

module.exports = async function (req, res) {
  try {
    const key = "test:connection";
    const value = {
      message: "Redis is connected",
      time: Date.now(),
    };

    await redis.set(key, value);
    const stored = await redis.get(key);

    return res.status(200).json({
      success: true,
      written: value,
      read: stored,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
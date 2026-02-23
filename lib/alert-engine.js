const { redis } = require("./redis");

const COOLDOWN_SECONDS = 1800; // 30 دقیقه

async function evaluatePriceCross(alert, currentPrice) {
  const stateKey = `alert:state:${alert.id}`;
  const cooldownKey = `alert:cooldown:${alert.id}`;

  let state = { isTriggered: false };

  try {
    const rawState = await redis.get(stateKey);
    if (rawState) {
      state =
        typeof rawState === "string"
          ? JSON.parse(rawState)
          : rawState;
    }
  } catch (err) {
    // اگر داده خراب باشد، reset می‌کنیم
    state = { isTriggered: false };
  }

  const isAbove = currentPrice >= alert.threshold;
  let shouldTrigger = false;

  if (alert.direction === "above") {
    if (!state.isTriggered && isAbove) {
      shouldTrigger = true;
    }
  }

  if (alert.direction === "below") {
    if (!state.isTriggered && !isAbove) {
      shouldTrigger = true;
    }
  }

  const cooldown = await redis.get(cooldownKey);
  if (cooldown) return false;

  if (shouldTrigger) {
    const newState = {
      isTriggered: true,
      lastTriggeredAt: Date.now(),
    };

    await redis.set(stateKey, JSON.stringify(newState));
    await redis.set(cooldownKey, "1", { ex: COOLDOWN_SECONDS });

    return true;
  }

  // Reset logic
  if (
    (alert.direction === "above" && !isAbove) ||
    (alert.direction === "below" && isAbove)
  ) {
    await redis.set(
      stateKey,
      JSON.stringify({ isTriggered: false })
    );
  }

  return false;
}

module.exports = { evaluatePriceCross };
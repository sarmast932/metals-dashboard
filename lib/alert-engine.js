const { redis } = require("./redis");
const { getClosestBefore } = require("./history");

const COOLDOWN_SECONDS = 1800;

async function evaluateAlert(alert, currentPrice) {
  if (alert.type === "percent-change") {
    return evaluatePercentChange(alert, currentPrice);
  }

  return evaluatePriceCross(alert, currentPrice);
}

async function evaluatePriceCross(alert, currentPrice) {
  const stateKey = `alert:state:${alert.id}`;
  const cooldownKey = `alert:cooldown:${alert.id}`;

  let state = {
    lastPrice: null,
    lastSide: null,
    isTriggered: false,
  };

  try {
    const rawState = await redis.get(stateKey);
    if (rawState) {
      state =
        typeof rawState === "string"
          ? JSON.parse(rawState)
          : rawState;
    }
  } catch (err) {}

  const currentSide =
    currentPrice >= alert.threshold ? "above" : "below";

  let shouldTrigger = false;

  if (state.lastSide) {
    if (
      state.lastSide === "below" &&
      currentSide === "above" &&
      alert.direction === "above"
    ) {
      shouldTrigger = true;
    }

    if (
      state.lastSide === "above" &&
      currentSide === "below" &&
      alert.direction === "below"
    ) {
      shouldTrigger = true;
    }
  }

  const cooldown = await redis.get(cooldownKey);
  if (cooldown) shouldTrigger = false;

  const newState = {
    lastPrice: currentPrice,
    lastSide: currentSide,
    isTriggered: shouldTrigger
      ? true
      : state.isTriggered,
  };

  await redis.set(stateKey, JSON.stringify(newState));

  if (shouldTrigger) {
    await redis.set(cooldownKey, "1", {
      ex: COOLDOWN_SECONDS,
    });
    return true;
  }

  return false;
}

async function evaluatePercentChange(alert, currentPrice) {
  const stateKey = `alert:state:${alert.id}`;
  const cooldownKey = `alert:cooldown:${alert.id}`;

  const windowMs = alert.windowMinutes * 60 * 1000;
  const targetTimestamp = Date.now() - windowMs;

  const past = await getClosestBefore(
    alert.asset,
    targetTimestamp
  );

  if (!past) return false;

  const percentChange =
    ((currentPrice - past.price) / past.price) * 100;

  const absoluteChange = Math.abs(percentChange);

  const cooldown = await redis.get(cooldownKey);
  if (cooldown) return false;

  if (absoluteChange >= alert.percent) {
    await redis.set(cooldownKey, "1", {
      ex: COOLDOWN_SECONDS,
    });

    await redis.set(
      stateKey,
      JSON.stringify({
        lastTriggeredAt: Date.now(),
        percentChange,
      })
    );

    return true;
  }

  return false;
}

module.exports = { evaluateAlert };
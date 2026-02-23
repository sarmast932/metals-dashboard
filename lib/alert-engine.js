const { redis } = require("./redis");

const COOLDOWN_SECONDS = 1800;

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
      if (typeof rawState === "string") {
        state = JSON.parse(rawState);
      } else {
        state = rawState;
      }
    }
  } catch (err) {
    state = {
      lastPrice: null,
      lastSide: null,
      isTriggered: false,
    };
  }

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
    isTriggered: shouldTrigger ? true : state.isTriggered,
  };

  await redis.set(stateKey, JSON.stringify(newState));

  if (shouldTrigger) {
    await redis.set(cooldownKey, "1", { ex: COOLDOWN_SECONDS });
    return true;
  }

  return false;
}

module.exports = { evaluatePriceCross };
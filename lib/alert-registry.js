const { redis } = require("./redis");

const ALERT_LIST_KEY = "alerts:list";

async function getAllAlerts() {
  const rawList = await redis.get(ALERT_LIST_KEY);

  if (!rawList) return [];

  let alertKeys;

  if (typeof rawList === "string") {
    alertKeys = JSON.parse(rawList);
  } else {
    alertKeys = rawList;
  }

  const alerts = [];

  for (const key of alertKeys) {
    const rawAlert = await redis.get(key);

    if (!rawAlert) continue;

    const alert =
      typeof rawAlert === "string"
        ? JSON.parse(rawAlert)
        : rawAlert;

    if (alert.enabled) {
      alerts.push(alert);
    }
  }

  return alerts;
}

async function addAlert(alert) {
  const key = `alert:${alert.asset}:${alert.id}`;

  await redis.set(key, JSON.stringify(alert));

  let list = await redis.get(ALERT_LIST_KEY);

  if (!list) {
    list = [];
  } else if (typeof list === "string") {
    list = JSON.parse(list);
  }

  if (!list.includes(key)) {
    list.push(key);
    await redis.set(ALERT_LIST_KEY, JSON.stringify(list));
  }
}

module.exports = {
  getAllAlerts,
  addAlert,
};
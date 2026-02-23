const { addAlert } = require("../lib/alert-registry");

module.exports = async function handler(req, res) {
  try {
    const alert = {
      id: "percent-1",
      asset: "gold",
      type: "percent-change",
      percent: 0.01,          // 0.01% برای تست سریع
      windowMinutes: 1,
      enabled: true
    };

    await addAlert(alert);

    return res.status(200).json({
      success: true,
      alert
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
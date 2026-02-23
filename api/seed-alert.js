const { addAlert } = require("../lib/alert-registry");

module.exports = async function (req, res) {
  try {
    const alert = {
      id: "1",
      asset: "gold",
      type: "price-cross",
      direction: "above",
      threshold: 31000000,
      level: "critical",
      enabled: true,
    };

    await addAlert(alert);

    return res.status(200).json({
      success: true,
      message: "Alert seeded",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
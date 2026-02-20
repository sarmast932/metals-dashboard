const SettingsEngine = (function () {

  const KEY = "settings_v3";

  let state = JSON.parse(localStorage.getItem(KEY)) || {
    alerts: {
      Gold: { high: null, low: null },
      Silver: { high: null, low: null }
    }
  };

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function get() {
    return state;
  }

  function setAlert(plan, high, low) {
    state.alerts[plan] = { high, low };
    save();
  }

  function clearAlert(plan) {
    state.alerts[plan] = { high: null, low: null };
    save();
  }

  return {
    get,
    setAlert,
    clearAlert
  };

})();
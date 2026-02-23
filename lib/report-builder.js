function formatNumber(num) {
  return Number(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function formatPercent(p) {
  return Number(p).toFixed(2) + "%"
}

function buildReportMessage(goldReport, silverReport) {
  return `
📊 گزارش بازار کاریزما

🟡 طلا:
قیمت فعلی: ${formatNumber(goldReport.current)}
بیشینه: ${formatNumber(goldReport.high)}
کمینه: ${formatNumber(goldReport.low)}
تغییر: ${formatPercent(goldReport.percentChange)}

⚪ نقره:
قیمت فعلی: ${formatNumber(silverReport.current)}
بیشینه: ${formatNumber(silverReport.high)}
کمینه: ${formatNumber(silverReport.low)}
تغییر: ${formatPercent(silverReport.percentChange)}

⏰ بازه: 24 ساعت اخیر
`
}

module.exports = { buildReportMessage }
export default async function handler(req, res) {

  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: "Missing BOT_TOKEN or CHAT_ID" });
  }

  try {

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ اتصال ربات با موفقیت برقرار شد.\nسیستم هشدار آماده فعال‌سازی است.",
        parse_mode: "HTML"
      })
    });

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

}

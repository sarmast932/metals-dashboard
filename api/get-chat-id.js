export default async function handler(req, res) {

  const token = process.env.BOT_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "BOT_TOKEN not set" });
  }

  try {

    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await response.json();

    if (!data.ok) {
      return res.status(500).json({ error: "Telegram API error", data });
    }

    const updates = data.result;

    if (!updates.length) {
      return res.status(200).json({ message: "No messages yet. Send a message to the bot first." });
    }

    const lastMessage = updates[updates.length - 1];

    return res.status(200).json({
      chat_id: lastMessage.message.chat.id,
      username: lastMessage.message.chat.username,
      first_name: lastMessage.message.chat.first_name
    });

  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }

}

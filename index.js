require("dotenv").config();
const express = require("express");
const axios = require("axios");
const prompt = require("./prompt");

const app = express();
app.use(express.json());

// Telegram webhook
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body.message;

    if (!msg || !msg.text) return res.sendStatus(200);

    const text = msg.text;
    if (text.split(" ").length < 3) return res.sendStatus(200);

    // Send to AI
    const aiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
        },
      }
    );

    const reply = aiRes.data.choices[0].message.content;

    // Reply to Telegram
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: msg.chat.id,
        text: reply,
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Error:", err.message);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

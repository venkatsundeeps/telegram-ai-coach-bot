/**
 * Telegram AI Coach Bot
 * Stateless, privacy-safe webhook server
 */

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const prompt = require("./prompt");

const app = express();
app.use(express.json());

// Health check (important for Render)
app.get("/", (req, res) => {
  res.send("Telegram AI Coach Bot is running");
});

/**
 * Telegram Webhook
 */
app.post("/webhook", async (req, res) => {
  console.log("===== WEBHOOK HIT 1=====");
  console.log(JSON.stringify(req.body, null, 2));
  try {
    const message = req.body.message;
    console.log("===== WEBHOOK HIT =====");
    console.log(JSON.stringify(req.body, null, 2));
    // Ignore non-text messages
    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
    const userText = message.text.trim();

    // Ignore very short messages (noise)
    if (userText.split(" ").length < 3) {
      return res.sendStatus(200);
    }

    console.log("Received:", userText);

    // Call AI (OpenAI example)
    // const aiResponse = await axios.post(
    //   "https://api.openai.com/v1/chat/completions",
    //   {
    //     model: "gpt-4.1-mini",
    //     messages: [
    //       { role: "system", content: prompt },
    //       { role: "user", content: userText },
    //     ],
    //     temperature: 0.4,
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.AI_API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    const replyText =
      aiResponse.data.choices[0].message.content ||
      "Unable to generate response right now.";

    // Send reply back to Telegram
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: replyText,
      }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.sendStatus(200); // always acknowledge Telegram
  }
});

// REQUIRED for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Telegram → Gemini → Reply
 * Stateless, production-safe
 */

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const prompt = require("./prompt");

const app = express();
app.use(express.json());

/* ---------- Health check ---------- */
app.get("/", (req, res) => {
  res.send("Telegram AI Coach Bot running");
});

/* ---------- Gemini REST helper ---------- */
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(finalPrompt) {
  const response = await axios.post(
    `${GEMINI_ENDPOINT}?key=${process.env.AI_API_KEY}`,
    {
      contents: [
        {
          role: "user",
          parts: [{ text: finalPrompt }],
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return (
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Unable to generate response."
  );
}

/* ---------- Telegram Webhook ---------- */
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.message;

    // Ignore non-text messages
    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
    const userText = message.text.trim();

    // Reply with instructions for very short messages
    if (userText.split(" ").length < 3) {
      await axios.post(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          chat_id: chatId,
          text: "Hi! Please send a message with at least 3 words so I can help you as your AI coach. For example: 'How do I improve focus?'",
        }
      );
      return res.sendStatus(200);
    }

    console.log("Received:", userText);

    const finalPrompt = `${prompt}

Coach message:
${userText}
`;

    const aiReply = await callGemini(finalPrompt);

    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: aiReply,
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.response?.data || err.message);
    res.sendStatus(200); // Always acknowledge Telegram
  }
});

/* ---------- Start server (Render compatible) ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

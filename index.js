require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  console.log("UPDATE RECEIVED");

  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  console.log("TEXT:", msg.text);

  await axios.post(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      chat_id: msg.chat.id,
      text: `Echo: ${msg.text}`,
    }
  );

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});

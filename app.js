require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const handleTikTokLink = require("./src/controllers/tiktokController");
const handleFacebookLink = require("./src/controllers/facebookController");

// --- START: Added Web Server for UptimeRobot ---
const express = require('express');
const app = express();
// Render automatically provides the PORT environment variable.
const port = process.env.PORT || 3000;

// This is the endpoint UptimeRobot will ping.
app.get('/', (req, res) => {
  res.send('Bot is awake and listening!');
});

// Start the web server.
app.listen(port, () => {
  console.log(`Keep-alive server is running on port ${port}`);
});
// --- END: Added Web Server for UptimeRobot ---


// --- Your Existing Bot Code ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

client.once("ready", () => {
  console.log(`Welcome, smlsamaa! 🤫`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Handle TikTok videos
  if (await handleTikTokLink(message)) return;

  // Handle Facebook videos
  if (await handleFacebookLink(message)) return;
});

// This logs your bot in.
client.login(TOKEN);
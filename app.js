require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const handleTikTokLink = require("./src/controllers/tiktokController");
const handleFacebookLink = require("./src/controllers/facebookController");

// --- START: Added Web Server for UptimeRobot ---
const express = require('express');
const app = express();
// Render automatically provides the PORT environment variable.
const port = process.env.PORT || 3000;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// This is the endpoint UptimeRobot will ping.
app.get('/', (req, res) => {
  res.send('Bot is awake and listening!');
});

// Simple debug endpoint to verify binaries and environment
app.get('/debug', async (req, res) => {
  try {
    const checks = {};
    try {
      const { stdout } = await execAsync('which yt-dlp || command -v yt-dlp || echo "not found"');
      checks.yt_dlp_path = stdout.trim();
    } catch (e) {
      checks.yt_dlp_path = `error: ${e.message}`;
    }

    try {
      const { stdout } = await execAsync('/usr/local/bin/yt-dlp --version || yt-dlp --version');
      checks.yt_dlp_version = stdout.trim();
    } catch (e) {
      checks.yt_dlp_version = `error: ${e.message}`;
    }

    try {
      const { stdout } = await execAsync('ffmpeg -version | head -n 1');
      checks.ffmpeg_version = stdout.trim();
    } catch (e) {
      checks.ffmpeg_version = `error: ${e.message}`;
    }

    try {
      const { stdout } = await execAsync('python3 -V');
      checks.python3_version = stdout.trim();
    } catch (e) {
      checks.python3_version = `error: ${e.message}`;
    }

    res.json({ ok: true, port, env: process.env.NODE_ENV || 'development', checks });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Start the web server.
app.listen(port, () => {
  console.log(`Keep-alive server is running on port ${port}`);
  // Startup self-checks
  execAsync('/usr/local/bin/yt-dlp --version || yt-dlp --version')
    .then(({ stdout }) => console.log(`[Startup] yt-dlp version: ${stdout.trim()}`))
    .catch(err => console.warn(`[Startup] yt-dlp check failed: ${err.message}`));
  execAsync('ffmpeg -version | head -n 1')
    .then(({ stdout }) => console.log(`[Startup] ffmpeg: ${stdout.trim()}`))
    .catch(err => console.warn(`[Startup] ffmpeg check failed: ${err.message}`));
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
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const handleTikTokLink = require("./controllers/tiktokController");
const handleFacebookLink = require("./controllers/facebookController");

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

client.login(TOKEN);

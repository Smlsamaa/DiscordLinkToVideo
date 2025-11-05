<h1>📹 Social Media Link Bot 🤖<h1></h1>
<p>A simple Discord bot built with discord.js that automatically processes and responds to TikTok and Facebook video links posted in your server.</p>
<p>This bot watches for new messages and, if it detects a link from TikTok or Facebook, it uses its controllers (tiktokController.js and facebookController.js) to handle them.</p>

##✨ Features
TikTok Link Handling: Automatically detects and processes TikTok video links.

Facebook Link Handling: Automatically detects and processes Facebook video links.

Bot Activity: Ignores all messages sent by other bots (including itself) to prevent loops.

Lightweight: Runs as a simple Node.js application.

##🛠️ Technologies Used
Node.js: The runtime environment.

discord.js: The primary library for interacting with the Discord API.

axios: Used for making HTTP requests (likely within the controllers) to fetch data from social media.

dotenv: For loading environment variables (like your bot token) from a .env file.

##🚀 Getting Started
Follow these instructions to get a copy of the bot up and running on your own machine or server.

Prerequisites
Node.js (v16.9.0 or higher is recommended)

npm (which comes with Node.js)

A Discord Bot Token

Go to the Discord Developer Portal.

Create a "New Application".

Go to the "Bot" tab, click "Add Bot", and then "Yes, do it!".

Under the bot's username, click "Reset Token" to get your token. Keep this secret!

You must also enable the Message Content Intent privileged intent on this same page.

Installation & Setup
Clone the repository (or download the files):

Bash

git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
Install all required dependencies:

This will read your package.json file and install discord.js, dotenv, and axios.

Bash

npm install
Create your environment file:

Create a new file in the project's root directory named .env

Open the file and add your secret bot token like this:

Code snippet

# .env file
TOKEN=YOUR_SECRET_BOT_TOKEN_GOES_HERE
Running the Bot
Start the bot:

Bash

npm start
This command runs node app.js, as defined in your package.json.

Check the console:

If everything is correct, your console will log your ready message:

Welcome, smlsamaa! 🤫
Your bot is now online and will start watching for links!

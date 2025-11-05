const axios = require("axios");

async function fetchTikTokVideo(url) {
  try {
    const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const data = response.data.data;

    if (!data || !data.play) return null;
    return data.play;
  } catch (err) {
    console.error("❌ TikTok Service Error:", err.message);
    return null;
  }
}

module.exports = { fetchTikTokVideo };

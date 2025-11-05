const axios = require("axios");

async function fetchFacebookVideo(url) {
  try {
    const res = await axios.get(
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
    );

    const data = res.data?.data;
    if (!data || !data.play) {
      console.warn("⚠️ No video data found for Facebook URL:", url);
      return null;
    }

    return data.play;
  } catch (err) {
    console.error("❌ Facebook Service Error:", err.message);
    return null;
  }
}

module.exports = { fetchFacebookVideo };

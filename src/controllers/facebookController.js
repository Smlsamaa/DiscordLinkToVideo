const { isFacebookUrl } = require("../utils/regex");
const { fetchFacebookVideo } = require("../services/facebookService");

module.exports = async function handleFacebookLink(message) {
  const content = message.content;
  if (!isFacebookUrl(content)) return false;

  const url = content.match(isFacebookUrl.regex)[1];
  const fetchingMsg = await message.channel.send("📥 Fetching Facebook video...");

  try {
    const videoUrl = await fetchFacebookVideo(url);

    if (!videoUrl) {
      await fetchingMsg.edit("⚠️ Couldn't find the Facebook video (maybe private or unavailable).");
      return true;
    }

    await message.channel.send({
      files: [{ attachment: videoUrl, name: "facebook.mp4" }]
    });

    await Promise.all([
      message.delete().catch(console.error),
      fetchingMsg.delete().catch(console.error)
    ]);

    return true;

  } catch (err) {
    console.error("❌ Facebook Controller Error:", err.message);
    await fetchingMsg.edit("❌ Failed to fetch Facebook video.");
    return true;
  }
};

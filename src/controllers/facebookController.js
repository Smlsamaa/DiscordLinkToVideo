// facebookController.js
const { isFacebookUrl } = require("../utils/regex");
const { fetchFacebookVideo } = require("../services/facebookService");

module.exports = async function handleFacebookLink(message) {
  const content = message.content;
  if (!isFacebookUrl(content)) return false;

  const url = content.match(isFacebookUrl.regex)[1];
  const fetchingMsg = await message.channel.send("Đợi cậu Minh tí, cậu đang tìm...");

  try {
    // Get the direct video URL from our service
    const videoUrl = await fetchFacebookVideo(url);

    if (!videoUrl) {
      await fetchingMsg.edit("Đéo tìm thấy vid em ơi");
      return true;
    }

    console.log("[FB Controller] Got video URL:", videoUrl);

    // Use Discord markdown hyperlink format: [text](url)
    // This shows only "Facebook Video" as a clickable link
    await message.channel.send(`[Vid của em giai đây](${videoUrl})`);

    // Clean up the original message and the "fetching" message
    await Promise.all([
      message.delete().catch(err => console.error("Couldn't delete message:", err)),
      fetchingMsg.delete().catch(err => console.error("Couldn't delete fetching message:", err))
    ]);

    console.log("[FB Controller] ✅ Successfully posted Facebook video!");
    return true;

  } catch (err) {
    console.error("❌ Facebook Controller Error:", err.message);
    await fetchingMsg.edit("Cậu Minh ốm rồi (cậu bận)");
    return true;
  }
};
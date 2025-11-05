const { isTikTokUrl } = require("../utils/regex");
const { fetchTikTokVideo } = require("../services/tiktokService");

module.exports = async function handleTikTokLink(message) {
  const content = message.content;
  if (!isTikTokUrl(content)) return false;

  const url = content.match(isTikTokUrl.regex)[1];
  const cleanUrl = url.split("?")[0];

  const fetchingMsg = await message.channel.send("Đợi cậu Minh tí, cậu đang tìm...");

  try {
    const videoUrl = await fetchTikTokVideo(cleanUrl);

    if (!videoUrl) {
      await fetchingMsg.edit("Đéo tìm thấy vid em ơi");
      return true;
    }

    await message.channel.send({
      files: [{ attachment: videoUrl, name: "tiktok.mp4" }]
    });

    await Promise.all([
      message.delete().catch(console.error),
      fetchingMsg.delete().catch(console.error)
    ]);

    return true;

  } catch (err) {
    console.error("❌ TikTok Controller Error:", err.message);
    await fetchingMsg.edit("Bot hỏng r");
    return true;
  }
};

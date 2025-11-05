const tiktokRegex = /(https?:\/\/(?:www\.|m\.|vt\.|vm\.|t\.|s\.)?tiktok\.com\/[^\s]+)/i;
const facebookRegex = /(https?:\/\/(?:www\.|m\.)?facebook\.com\/[^\s]+)/i;

function isTikTokUrl(text) {
  return tiktokRegex.test(text);
}

function isFacebookUrl(text) {
  return facebookRegex.test(text);
}

isTikTokUrl.regex = tiktokRegex;
isFacebookUrl.regex = facebookRegex;

module.exports = { isTikTokUrl, isFacebookUrl };

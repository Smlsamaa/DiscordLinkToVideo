const tiktokRegex = /(https?:\/\/(?:www\.|m\.|vt\.|vm\.|t\.|s\.)?tiktok\.com\/[^\s]+)/i;

// Updated Facebook regex to catch more URL formats:
// - www.facebook.com
// - m.facebook.com (mobile)
// - web.facebook.com (desktop web version)
// - facebook.com (no subdomain)
// Matches: /watch, /reel, /share, /video, /story, etc.
const facebookRegex = /(https?:\/\/(?:www\.|m\.|web\.)?facebook\.com\/[^\s]+)/i;

function isTikTokUrl(text) {
  return tiktokRegex.test(text);
}

function isFacebookUrl(text) {
  return facebookRegex.test(text);
}

isTikTokUrl.regex = tiktokRegex;
isFacebookUrl.regex = facebookRegex;

module.exports = { isTikTokUrl, isFacebookUrl };
// facebookService.js
const { execFile } = require("child_process");
const { promisify } = require("util");
const axios = require("axios");

const execFileAsync = promisify(execFile);

const ytDlpPath = "C:\\tools\\yt-dlp.exe";
const ffmpegPath = "C:\\tools\\ffmpeg.exe";

// Method 1: Try yt-dlp first
async function tryYtDlp(url) {
  try {
    console.log("[FB Service] Trying yt-dlp method...");
    
    const { stdout } = await execFileAsync(ytDlpPath, [
      "--get-url",
      "--format", "best[ext=mp4]/best",
      "--ffmpeg-location", ffmpegPath,
      "--no-check-certificates",
      url
    ], {
      timeout: 20000
    });

    const videoUrl = stdout.trim();
    if (videoUrl && videoUrl.startsWith("http")) {
      console.log("[FB Service] yt-dlp succeeded!");
      return videoUrl;
    }
    return null;
  } catch (err) {
    console.error("[FB Service] yt-dlp failed:", err.message);
    return null;
  }
}

// Method 2: Fallback to API
async function tryApi(url) {
  try {
    console.log("[FB Service] Trying API method...");
    
    const apiUrl = `https://www.fbdownloader.net/api/video?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    if (response.data && (response.data.hd || response.data.sd)) {
      const videoUrl = response.data.hd || response.data.sd;
      console.log("[FB Service] API succeeded!");
      return videoUrl;
    }
    return null;
  } catch (err) {
    console.error("[FB Service] API failed:", err.message);
    return null;
  }
}

// Main function: Try both methods
async function fetchFacebookVideo(url) {
  console.log(`[FB Service] Fetching video for: ${url}`);

  // Try yt-dlp first
  let videoUrl = await tryYtDlp(url);
  
  // If yt-dlp fails, try API
  if (!videoUrl) {
    console.log("[FB Service] yt-dlp failed, trying API fallback...");
    videoUrl = await tryApi(url);
  }

  if (videoUrl) {
    console.log("[FB Service] Successfully got video URL!");
    return videoUrl;
  }

  console.warn("⚠️ All methods failed for:", url);
  return null;
}

module.exports = { fetchFacebookVideo };
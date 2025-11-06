// facebookService.js
const { execFile, exec } = require("child_process");
const { promisify } = require("util");
const axios = require("axios");
const os = require("os");

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

// Detect OS and set appropriate paths
const isWindows = os.platform() === "win32";
const ytDlpPath = isWindows ? "C:\\tools\\yt-dlp.exe" : "python3 -m yt_dlp";
const ffmpegPath = isWindows ? "C:\\tools\\ffmpeg.exe" : "ffmpeg";

// Method 1: Try yt-dlp first
async function tryYtDlp(url) {
  try {
    console.log("[FB Service] Trying yt-dlp method...");
    console.log(`[FB Service] Platform: ${os.platform()}, yt-dlp path: ${ytDlpPath}`);
    
    let stdout;
    
    if (isWindows) {
      // On Windows, use execFile with explicit paths
      const args = [
        "--get-url",
        "--format", "best[ext=mp4]/best",
        "--ffmpeg-location", ffmpegPath,
        "--no-check-certificates",
        url
      ];
      
      const result = await execFileAsync(ytDlpPath, args, {
        timeout: 20000
      });
      stdout = result.stdout;
    } else {
      // On Linux, use python3 -m yt_dlp since pip3 installs it as a Python module
      // This is more reliable than trying to find yt-dlp in PATH
      const cmd = `${ytDlpPath} --get-url --format "best[ext=mp4]/best" --no-check-certificates "${url}"`;
      
      const result = await execAsync(cmd, {
        timeout: 20000,
        env: { ...process.env, PATH: process.env.PATH } // Ensure PATH is inherited
      });
      stdout = result.stdout;
    }

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
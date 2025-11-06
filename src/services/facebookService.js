// facebookService.js
const { execFile, exec } = require("child_process");
const { promisify } = require("util");
const axios = require("axios");
const os = require("os");

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

// Detect OS and set appropriate paths
const isWindows = os.platform() === "win32";
const ffmpegPath = isWindows ? "C:\\tools\\ffmpeg.exe" : "ffmpeg";

// Helper function to find yt-dlp on Linux
async function findYtDlpPath() {
  // Prefer explicit env override (set by runtime installer)
  if (process.env.YTDLP_PATH) {
    try {
      await execAsync(`${process.env.YTDLP_PATH} --version`, { timeout: 5000 });
      console.log(`[FB Service] Using YTDLP_PATH: ${process.env.YTDLP_PATH}`);
      return process.env.YTDLP_PATH;
    } catch (_) {
      console.warn(`[FB Service] YTDLP_PATH is set but not executable: ${process.env.YTDLP_PATH}`);
    }
  }
  if (isWindows) {
    return "C:\\tools\\yt-dlp.exe";
  }
  
  // Try multiple methods to find yt-dlp on Linux
  const methods = [
    "yt-dlp",  // Direct command (if in PATH)
    "/usr/local/bin/yt-dlp",  // System-wide installation
    "/usr/bin/yt-dlp",  // Alternative system path
    "/tmp/yt-dlp", // Runtime-installed fallback
    "python3 -m yt_dlp",  // Python module
    "python3 -m yt-dlp"  // Alternative module name
  ];
  
  // Try to find which one works
  for (const method of methods) {
    try {
      // Test if the command exists/works with a simple version check
      const testCmd = method.includes("python3") 
        ? `${method} --version`
        : `${method} --version`;
      
      await execAsync(testCmd, { timeout: 5000 });
      console.log(`[FB Service] Found yt-dlp at: ${method}`);
      return method;
    } catch (err) {
      // Continue to next method
      continue;
    }
  }
  
  // If none found, return the first one (will try and fail gracefully)
  console.log("[FB Service] Could not find yt-dlp, will try: yt-dlp");
  return "yt-dlp";
}

// Method 1: Try yt-dlp first
async function tryYtDlp(url) {
  try {
    console.log("[FB Service] Trying yt-dlp method...");
    const ytDlpPath = await findYtDlpPath();
    console.log(`[FB Service] Platform: ${os.platform()}, using: ${ytDlpPath}`);
    
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
        timeout: 40000
      });
      stdout = result.stdout;
      if (result.stderr) {
        console.warn(`[FB Service] yt-dlp stderr (win): ${result.stderr.substring(0, 500)}`);
      }
    } else {
      // On Linux, try the found method
      const args = [
        "--get-url",
        "--format", "best[ext=mp4]/best",
        "--no-check-certificates",
        url
      ];
      
      if (ytDlpPath.includes("python3")) {
        // If it's a python module, use exec with shell
        const cmd = `${ytDlpPath} ${args.join(" ")}`;
        const result = await execAsync(cmd, {
          timeout: 40000,
          env: process.env
        });
        stdout = result.stdout;
        if (result.stderr) {
          console.warn(`[FB Service] yt-dlp stderr (linux-py): ${result.stderr.substring(0, 500)}`);
        }
      } else {
        // If it's a direct executable, use execFile
        try {
          const result = await execFileAsync(ytDlpPath, args, {
            timeout: 40000
          });
          stdout = result.stdout;
          if (result.stderr) {
            console.warn(`[FB Service] yt-dlp stderr (linux-file): ${result.stderr.substring(0, 500)}`);
          }
        } catch (err) {
          // Fallback to exec if execFile fails
          const cmd = `${ytDlpPath} ${args.join(" ")}`;
          const result = await execAsync(cmd, {
            timeout: 40000,
            env: process.env
          });
          stdout = result.stdout;
          if (result.stderr) {
            console.warn(`[FB Service] yt-dlp stderr (linux-exec): ${result.stderr.substring(0, 500)}`);
          }
        }
      }
    }

    const videoUrl = stdout.trim();
    if (videoUrl && videoUrl.startsWith("http")) {
      console.log("[FB Service] yt-dlp succeeded!");
      return videoUrl;
    }
    return null;
  } catch (err) {
    console.error("[FB Service] yt-dlp failed:", err.message);
    if (err.code !== undefined) console.error(`[FB Service] yt-dlp exit code: ${err.code}`);
    if (err.stderr) console.error(`[FB Service] yt-dlp stderr: ${String(err.stderr).substring(0, 800)}`);
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
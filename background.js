// Background service worker for GrabClip extension

// 支持的平台配置，包含域名关键字和对应的平台名称
const supportedPlatforms = [
  // { domain: "douyin.com", name: "douyin" },
  { domain: "tiktok.com", name: "tiktok" },
  { domain: "instagram.com", name: "instagram" },
  // { domain: "weibo.com", name: "weibo" },
  { domain: "bilibili.com", name: "bilibili" },
  // { domain: "xiaohongshu.com", name: "rednote" },
  { domain: "facebook.com", name: "facebook" },
  // { domain: "twitter.com", name: "twitter" },
  // { domain: "x.com", name: "twitter" },
];

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log("GrabClip extension installed:", details.reason);
});

// Check if the domain is supported
function isSupportedDomain(url) {
  if (!url || !url.startsWith('http')) {
    return false;
  }
  try {
    const domain = new URL(url).hostname;
    return supportedPlatforms.some((config) => domain.includes(config.domain));
  } catch (error) {
    console.log(`Error parsing URL ${url}:`, error);
    return false;
  }
}


// Listen for extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log("Extension icon clicked on tab:", tab.id, tab.url);

  let videoInfo = null;
  let platform = null;
  
  // Check if tab has a valid URL and is supported
  if (!isSupportedDomain(tab.url)) {
      console.log('Unsupported platform or invalid URL:', tab.url);
    return;
  }
  
  const hostname = new URL(tab.url).hostname;
  supportedPlatforms.some((config) => {
    if (hostname.includes(config.domain)) {
      platform = config.name;
      return true;
    }
    return false;
  });

  try {
    // Get video info from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      platform: platform,
      action: "getCurrentVideoPage",
    });

    if (response && response.success && response.videoInfo) {
      videoInfo = response.videoInfo;
      
      console.log("Got video info:", videoInfo);
    } else {
      console.log("Failed to get video info:", response?.error || "Unknown error");
      videoInfo = null;
    }
  } catch (error) {
    console.log("Error handling icon click:", error);
    videoInfo = null;
  }

  if (videoInfo) {
    // Open GrapClip in new tab
    const uiLanguage = chrome.i18n.getUILanguage();
    const langCode = uiLanguage.startsWith("zh") ? uiLanguage.replace("_", "-") : uiLanguage.substring(0, 2);
    let targetUrl = `https://grabclip.com/${encodeURIComponent(videoInfo.platform)}/${encodeURIComponent(langCode)}/?url=${encodeURIComponent(videoInfo.url)}`;
    chrome.tabs.create(
      {
        url: targetUrl,
        active: true,
      },
      (newTab) => {
        console.log("Video opened in new tab:", newTab.id);
      }
    );
  } else {
    console.log("Failed to get video info.")
  }
});

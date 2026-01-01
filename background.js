// 定义平台配置
const PLATFORMS = {
  tiktok: {
    name: 'tiktok',
    displayName: 'TikTok',
    domains: ['tiktok.com'],
    needCookie: false
  }
};


// 背景脚本，处理插件的后台任务和消息通信
// 监听插件安装事件
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Plugin installed or updated:', details);

  // 安装时的初始化操作
  if (details.reason === 'install') {
    console.log('Plugin installed version:', chrome.runtime.getManifest().version);
    // 可以在这里设置初始配置
  }
  else if (details.reason === 'update') {
    console.log('Plugin updated to version:', chrome.runtime.getManifest().version);
  }
});


function getPlatformFromUrl(url) {
  if (!url || !url.startsWith('http')) {
    return null;
  }
  try {
    const hostname = new URL(url).hostname;
    for (const platform of Object.values(PLATFORMS)) {
      if (platform.domains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      )) {
        return platform;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error parsing URL ${url}:`, error);
    return null;
  }
}


// 处理视频分析逻辑的统一函数
async function handleVideoPageAnalysis(tab, platform) {
  try {
    // Get video info from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      platformName: platform.name,
      action: "extractVideoPageInfo",
    });

    console.log("Response from content script:", response);
    let videoPageInfo = null;
    if (response && response.success && response.data && response.data.url) {
      videoPageInfo = response.data;
      console.log("Got video page info:", videoPageInfo);

      // Open GrapClip in new tab
      const uiLanguage = chrome.i18n.getUILanguage();
      const langCode = uiLanguage.startsWith("zh") ? uiLanguage.replace("_", "-") : uiLanguage.substring(0, 2);

      // 在回调内部构建URL并打开新窗口
      let targetUrl = `https://grabclip.com/${platform.name}/${langCode}/?url=${encodeURIComponent(videoPageInfo.url)}`;

      chrome.tabs.create({
        url: targetUrl,
        active: true,
      }, (newTab) => {
        console.log("Opened in new tab:", newTab.id);
      });
      return { success: true };
    } else {
      console.log("Failed to get video page info:", response?.error || "Unknown error");
      return { success: false, error: response?.error || "Unknown error" };
    }
  } catch (error) {
    console.error("Error handling video analysis:", error);
    return { success: false, error: error.message };
  }
}

// Listen for extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log("Extension icon clicked on tab:", tab.id, tab.url);

  let platform = getPlatformFromUrl(tab.url);
  if (!platform) {
    console.log('Unsupported platform or invalid URL:', tab.url);
    return;
  }

  const analysisResult = await handleVideoPageAnalysis(tab, platform);
  console.log("Analysis result:", analysisResult);
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Message received in background:", message);
  const { action, platformName, tabUrl } = message;
  
  if (action === 'buttonClicked' && platformName && sender.tab) {
    console.log('Page button clicked for platform:', platformName);
    
    // 验证平台是否支持
    const platform = Object.values(PLATFORMS).find(p => p.name === platformName);
    if (!platform) {
      console.log('Unsupported platform:', platformName);
      sendResponse({ success: false, error: 'Unsupported platform' });
      return true;
    }
    
    // 处理视频分析
    const analysisResult = await handleVideoPageAnalysis(sender.tab, platform);
    sendResponse(analysisResult);
    return true;
  }
  
  return false;
});


// 后台脚本的其他功能可以根据需要添加
console.log('Background script loaded.');
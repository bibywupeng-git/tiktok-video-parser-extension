// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { platform, action } = message;

  switch (action) {
    case 'getCurrentVideoPage':
      handleGetCurrentVideoPage(platform, sendResponse);
      break;

    default:
      console.error(`Unknown action: ${action}`);
      sendResponse({
        success: false,
        error: `Unknown action: ${action}`
      });
  }
});


function getAnalyzerForPlatform(platform) {
  if (!platform) {
    return null;
  }
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return window.TikTokAnalyzer;
    case 'bilibili':
      return window.BilibiliAnalyzer;
    case 'instagram':
      return window.InstagramAnalyzer;
    case 'facebook':
      return window.FacebookAnalyzer;

    // case 'douyin':
    //   return window.DouyinAnalyzer;

    default:
      return null;
  }
}


function handleGetCurrentVideoPage(platform, sendResponse) {
  try {
    const analyzer = getAnalyzerForPlatform(platform);
    if (!analyzer) {
      console.error(`No analyzer found for platform: ${platform}`);
      sendResponse({
        success: false,
        error: `Unsupported platform: ${platform}`
      });
      return;
    }
    
    if (typeof analyzer.analyzeVideoInfo !== 'function') {
      sendResponse({
        success: false,
        error: `Analyzer ${analyzerName || platform} does not have analyzeVideoInfo method`
      });
      return;
    }
    
    const videoInfo = analyzer.analyzeVideoInfo();
    if (videoInfo) {
      sendResponse({
        success: true,
        videoInfo: videoInfo
      });
    } else {
      sendResponse({
        success: false,
        error: 'No video info found'
      });
    }
  } catch (error) {
    console.error(`Error in handleGetCurrentVideoPage: ${error.message}`);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}


function getPlatformByUrl(url) {
  if (!url || !url.startsWith('http')) {
    console.error(`Invalid URL: ${url}`);
    return null;
  }
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    for (const platform of Object.values(window.PLATFORMS)) {
      if (platform.domains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      )) {
        return platform;
      }
    }
    console.error(`No platform found for URL: ${url}`);
    return null;
  } catch (error) {
    console.error(`Get platform from URL ${url}:`, error);
    return null;
  }
}


function getAnalyzerForPlatformAnalyzer(platformName) {
  if (!platformName) {
    console.error("Platform name is required");
    return null;
  }

  const platform = window.PLATFORMS[platformName];
  if (!platform || !platform.analyzer) {
    console.error(`No analyzer found for platform: ${platformName}`);
    return null;
  }
  return new platform.analyzer();
}


function initializeExtension() {
  const platform = getPlatformByUrl(window.location.href);
  if (!platform) {
    console.log("Unsupported platform or URL");
    return;
  }
  if (!platform.analyzer) {
    console.error(`No analyzer found for platform: ${platformName}`);
    return null;
  }
  const analyzer = new platform.analyzer();

  console.log(`initializeExtension for platform: ${platform.name}`);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => analyzer.insertDownloadButton());
  } else {
    analyzer.insertDownloadButton();
  }
}

// Start extension initialization
initializeExtension();


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { platformName, action } = message;

  switch (action) {
    case "extractVideoPageInfo":
      extractVideoPageInfo(platformName, sendResponse);
      break;

    default:
      console.warn("Unknown message type:", action);
      sendResponse({ success: false, error: "Unknown message type" });
  }

  return true;
});


function extractVideoPageInfo(platformName, sendResponse) {
  try {
    console.log(`extractVideoPageInfo for platform: ${platformName}`);
    const analyzer = getAnalyzerForPlatformAnalyzer(platformName);
    if (!analyzer) {
      console.error(`No analyzer found for platform: ${platformName}`);
      sendResponse({
        success: false,
        error: `Unsupported platform: ${platformName}`,
      });
      return;
    }

    const videoPageInfo = analyzer.extractVideoPageInfo();
    console.log(`extractVideoPageInfo for platform: ${platformName} videoPageInfo:`, videoPageInfo);
    if (videoPageInfo !== null) {
      sendResponse({
        success: true,
        data: videoPageInfo,
      });
    } else {
      sendResponse({
        success: false,
        error: "No video info found",
      });
    }
  } catch (error) {
    console.error(`Error in extractVideoPageInfo: ${error.message}`);
    sendResponse({
      success: false,
      error: error.message,
    });
  }
}

// TikTok video analyzer module

// Configuration constants
const BUTTON_CONFIG = {
  NORMAL: {
    size: 48,
    svgSize: 24,
    marginBottom: 20
  },
  MINI: {
    size: 32,
    svgSize: 16,
    marginBottom: 0
  }
};

// Button click handler factory
function createButtonClickHandler(article = null) {
  return () => {
    try {
      let url;
      if (article) {
        const videoInfo = analyzeArticleVideoInfo(article);
        url = videoInfo?.url || window.location.href;
      } else {
        url = window.location.href;
      }
      
      const uiLanguage = chrome.i18n.getUILanguage();
      let langCode = uiLanguage.substring(0, 2);
      if (uiLanguage.startsWith("zh")) {
        langCode = uiLanguage.replace("_", "-");
      }
      
      const targetUrl = `https://grabclip.com/tiktok/${encodeURIComponent(langCode)}/?url=${encodeURIComponent(url)}`;
      window.open(targetUrl, "_blank");
    } catch (error) {
      console.error("Error in GrabClip button click:", error);
    }
  };
}

// Create button function with configurable size
function createGrabClipButton(article = null, buttonType = "NORMAL") {
  const config = BUTTON_CONFIG[buttonType] || BUTTON_CONFIG.NORMAL;
  const button = document.createElement("button");
  
  button.type = "button";
  button.ariaLabel = "Grabclip";
  button.setAttribute("data-grabclip-button", "true");
  
  // Set button styles
  button.style.cssText = `
    background-color: #1296db;
    border: none;
    border-radius: 50%;
    width: ${config.size}px;
    height: ${config.size}px;
    padding: 0;
    ${config.marginBottom > 0 ? `margin-bottom: ${config.marginBottom}px;` : ""}
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  `;
  
  // Create span wrapper for icon
  const span = document.createElement("span");
  span.setAttribute("data-e2e", "grabclip-icon");
  span.style.cssText = `
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Create SVG icon with white fill
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("height", config.svgSize);
  svg.setAttribute("width", config.svgSize);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("fill", "white");
  svg.setAttribute("version", "1.1");
  svg.setAttribute("viewBox", "0 0 1024 1024");
  svg.setAttribute("class", "icon");
  
  // Create path element
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M822.08 864h-576a64 64 0 1 0 0 128h576a64 64 0 0 0 0-128zM480 753.28a103.36 103.36 0 0 0 106.24 0 953.6 953.6 0 0 0 294.08-294.08A103.36 103.36 0 1 0 704 352a704 704 0 0 1-49.6 67.84l-23.36-298.24a96 96 0 0 0-193.92 0l-23.36 300.16A564.8 564.8 0 0 1 364.16 352a103.36 103.36 0 1 0-177.28 106.56A953.92 953.92 0 0 0 480 753.28z"
  );
  
  // Assemble the DOM structure
  svg.appendChild(path);
  span.appendChild(svg);
  button.appendChild(span);
  
  // Add hover effect
  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "#70c1e6";
  });
  
  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "#1296db";
  });
  
  // Add click event
  button.addEventListener("click", createButtonClickHandler(article));
  
  return button;
}

// Generic video URL extractor function
function extractVideoUrl(container = document, isArticle = false) {
  let creatorId = "";
  let videoId = "";
  
  // Select appropriate elements based on context
  const creatorSelector = isArticle 
    ? "div[class*='DivCreatorInfoContainer'] a" 
    : "article[id*='-item-'][style=''] div[class*='DivCreatorInfoContainer'] a";
  
  const videoSelector = isArticle 
    ? "div[class*='DivBasicPlayerWrapper'] div[class*='xgplayer-container']" 
    : "article[id*='-item-'][style=''] div[class*='DivBasicPlayerWrapper'] div[class*='xgplayer-container']";
  
  // Extract creator ID
  const creatorInfo = container.querySelector(creatorSelector);
  if (creatorInfo) {
    const parts = creatorInfo.href.split("/");
    creatorId = parts[parts.length - 1] || "";
  }
  
  // Extract video ID
  const videoInfo = container.querySelector(videoSelector);
  if (videoInfo) {
    const parts = videoInfo.id.split("-");
    videoId = parts[parts.length - 1];
  }
  
  // Construct video URL
  let videoUrl = "";
  if (videoId) {
    if (creatorId) {
      videoUrl = `https://www.tiktok.com/${creatorId}/video/${videoId}`;
    } else {
      videoUrl = `https://www.tiktok.com/video/${videoId}`;
    }
  }
  
  return videoUrl;
}

function analyzeVideoInfo() {
  const url = window.location.href;
  
  let videoPageUrl = "";
  
  if (isTikTokVideoPage(url)) {
    videoPageUrl = url;
  } else {
    videoPageUrl = extractVideoUrl();
  }
  
  if (!videoPageUrl) {
    videoPageUrl = url;
  }
  
  return {
    platform: "tiktok",
    url: videoPageUrl,
  };
}

function analyzeArticleVideoInfo(article) {
  let videoPageUrl = extractVideoUrl(article, true);
  return {
    platform: "tiktok",
    url: videoPageUrl,
  };
}

function isTikTokVideoPage(url) {
  // - https://www.tiktok.com/video/7476546872253893934
  // - https://www.tiktok.com/@petervufriends/video/7476546872253893934
  // - https://m.tiktok.com/v/680586780545.html
  // - https://vm.tiktok.com/ZMLp2UG/
  
  try {
    // Check if URL is from TikTok domain
    const domain = new URL(url).hostname;
    if (!domain.endsWith(".tiktok.com")) {
      return false;
    }
    
    return (
      url.includes("/video/") ||
      url.includes("/v/") ||
      url.match(/vm\.tiktok\.com\/[A-Za-z0-9]+\/?/) !== null
    );
  } catch (error) {
    console.error("Error checking TikTok video page:", error);
    return false;
  }
}

// Find action bar and add grabclip button
function addGrabClipButton() {
  // Try to find articles first
  const articles = document.querySelectorAll('article[id*="-item-"]');
  if (articles.length > 0) {
    articles.forEach((article) => {
      // Check if button already exists
      if (article.querySelector('button[data-grabclip-button="true"]')) {
        return;
      }
      
      const actionBar = article.querySelector('section[class*="ActionBar"]');
      if (!actionBar) {
        return;
      }
      
      // Create normal size button
      const button = createGrabClipButton(article, "NORMAL");
      // Add button at the first position
      actionBar.insertBefore(button, actionBar.firstChild);
    });
    return;
  }
  
  // Try to find mini button location if no articles found
  const buttonRow = document.querySelector(
    'div[class*="DivMainContent"] div[class*="DivFlexCenterRowWithGap"]'
  );
  if (buttonRow) {
    // Check if button already exists
    if (buttonRow.querySelector('button[data-grabclip-button="true"]')) {
      return;
    }
    
    // Create mini button
    const button = createGrabClipButton(null, "MINI");
    // Add button at the first position
    buttonRow.insertBefore(button, buttonRow.firstChild);
  }
}

// Initialize button adding functionality
function initGrabClipButton() {
  // Add button initially
  addGrabClipButton();
  
  // Set up mutation observer to handle dynamic content
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    mutations.forEach((mutation) => {
      // Check for added nodes
      if (mutation.addedNodes.length > 0) {
        const hasArticle = Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return (
              node.matches('article[id*="-item-"]') ||
              node.querySelector('article[id*="-item-"]') ||
              node.matches('section[class*="ActionBar"]') ||
              node.querySelector('section[class*="ActionBar"]') ||
              node.matches(
                'div[class*="DivMainContent"] div[class*="DivFlexCenterRowWithGap"]'
              ) ||
              node.querySelector(
                'div[class*="DivMainContent"] div[class*="DivFlexCenterRowWithGap"]'
              )
            );
          }
          return false;
        });
        
        if (hasArticle) {
          shouldUpdate = true;
        }
      }
    });
    
    if (shouldUpdate) {
      // Add button to new or updated articles/action bars
      setTimeout(addGrabClipButton, 100);
    }
  });
  
  // Observe the document body for changes, including attribute changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "id"],
  });
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGrabClipButton);
} else {
  // DOM is already loaded
  initGrabClipButton();
}

// Export functions for use in content script
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    analyzeVideoInfo,
  };
} else {
  // For content script usage
  window.TikTokAnalyzer = {
    analyzeVideoInfo,
  };
}
// Bilibili video analyzer module

// Button click handler factory
function createButtonClickHandler() {
  return () => {
    try {
      let url;
      // <meta data-vue-meta="true" itemprop="url" content="https://www.bilibili.com/video/BV1sY4y1Z7Ei/">

      const metaUrl = document.querySelector('meta[itemprop="url"]');
      if (metaUrl) {
        url = metaUrl.content;
      } else {
        url = window.location.href;
      }
      
      const uiLanguage = chrome.i18n.getUILanguage();
      let langCode = uiLanguage.substring(0, 2);
      if (uiLanguage.startsWith("zh")) {
        langCode = uiLanguage.replace("_", "-");
      }
      
      const targetUrl = `https://grabclip.com/bilibili/${encodeURIComponent(langCode)}/?url=${encodeURIComponent(url)}`;
      window.open(targetUrl, "_blank");
    } catch (error) {
      console.error("Error in GrabClip button click:", error);
    }
  };
}

// Create button function with configurable size
// Create button function with configurable size
function createGrabClipButton() {
  const button = document.createElement("button");
  
  button.type = "button";
  button.ariaLabel = "Grabclip";
  button.setAttribute("data-grabclip-button", "true");
  
  // Set button styles
  button.style.cssText = `
    background-color: #1296db;
    border: none;
    border-radius: 50%;
    margin-right: 30px;
    margin-left: 10px;
    width: 36px;
    height: 36px;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  `;
  
  // Create span wrapper for icon
  const span = document.createElement("span");
  span.style.cssText = `
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Create SVG icon with white fill
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("height", "24");
  svg.setAttribute("width", "24");
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
  button.addEventListener("click", createButtonClickHandler());
  
  return button;
}


// Check if URL is a Bilibili video page
function isBilibiliVideoPage(url) {
  // Examples:
  // - https://www.bilibili.com/video/BV1xx411c7m9
  // - https://b23.tv/BV1xx411c7m9
  
  try {
    const hostname = new URL(url).hostname;
    if (!hostname || !(hostname.includes("bilibili.com") || hostname.includes("b23.tv"))) {
      return false;
    }
    
    return url.includes("/video/") || url.includes("/BV") || url.includes("/av");
  } catch (error) {
    console.error("Error checking Bilibili video page:", error);
    return false;
  }
}


// Analyze video information
function analyzeVideoInfo() {
  const url = window.location.href;
  
  let videoPageUrl = "";
  
  if (isBilibiliVideoPage(url)) {
    videoPageUrl = url;
  } else {
    // <meta data-vue-meta="true" itemprop="url" content="https://www.bilibili.com/video/BV1RLm9BZEp9/"></meta>
    const metaUrl = document.querySelector("meta[itemprop='url']");
    if (metaUrl) {
      videoPageUrl = metaUrl.content;
    }
  }
  
  if (!videoPageUrl) {
    videoPageUrl = url;
  }
  
  return {
    platform: "bilibili",
    url: videoPageUrl
  };
}


// Add GrabClip button to Bilibili page
function addGrabClipButton() {
  // Try to find video player container
  const toolbarContainer = document.querySelector("div.video-toolbar-left-main");
  if (!toolbarContainer) {
    return;
  }
  
  // Check if button already exists
  if (toolbarContainer.querySelector('button[data-grabclip-button="true"]')) {
    return;
  }

  const button = createGrabClipButton();
  toolbarContainer.insertBefore(button, toolbarContainer.firstChild);
}

// Initialize button adding functionality
function initGrabClipButton() {
  // Add button initially
  addGrabClipButton();
  
  // Set up mutation observer to handle dynamic content updates
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    mutations.forEach((mutation) => {
      // Check for added nodes or attribute changes
      if (mutation.addedNodes.length > 0 || mutation.type === 'attributes') {
        const hasToolbar = Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return (
              node.matches('div.video-toolbar-left-main') ||
              node.querySelector('div.video-toolbar-left-main')
            );
          }
          return false;
        });
        
        // Also check if the toolbar itself changed attributes
        if (mutation.type === 'attributes' && mutation.target.matches('div.video-toolbar-left-main')) {
          shouldUpdate = true;
        }
        
        if (hasToolbar) {
          shouldUpdate = true;
        }
      }
    });
    
    if (shouldUpdate) {
      // Add button to new or updated toolbar
      setTimeout(addGrabClipButton, 100);
    }
  });
  
  // Observe the document body for changes, including attribute changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id']
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
  window.BilibiliAnalyzer = {
    analyzeVideoInfo,
  };
}

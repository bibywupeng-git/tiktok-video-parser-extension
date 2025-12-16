// Bilibili video analyzer module

// Constants
const BUTTON_ATTRIBUTE = 'data-grabclip-button';
const TOOLBAR_SELECTOR = 'div.video-toolbar-left-main';
const GRABCLIP_BASE_URL = 'https://grabclip.com/bilibili/';
const BUTTON_STYLES = `
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
const SPAN_STYLES = `
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const BUTTON_COLORS = {
  DEFAULT: '#1296db',
  HOVER: '#70c1e6'
};

/**
 * Get the current video page URL from meta tag or window location
 * @returns {string} The video page URL
 */
function getCurrentVideoUrl() {
  const metaUrl = document.querySelector('meta[itemprop="url"]');
  return metaUrl ? metaUrl.content : window.location.href;
}

/**
 * Get language code from Chrome UI language
 * @returns {string} Formatted language code
 */
function getLanguageCode() {
  const uiLanguage = chrome.i18n.getUILanguage();
  
  if (uiLanguage.startsWith('zh')) {
    return uiLanguage.replace('_', '-');
  }
  
  return uiLanguage.substring(0, 2);
}

/**
 * Handle GrabClip button click
 */
function handleGrabClipButtonClick() {
  try {
    const videoUrl = getCurrentVideoUrl();
    const langCode = getLanguageCode();
    const targetUrl = `${GRABCLIP_BASE_URL}${encodeURIComponent(langCode)}/?url=${encodeURIComponent(videoUrl)}`;
    
    window.open(targetUrl, '_blank');
  } catch (error) {
    console.error('GrabClip button click error:', error);
  }
}

/**
 * Create the GrabClip button element
 * @returns {HTMLButtonElement} The created button element
 */
function createGrabClipButton() {
  const button = document.createElement('button');
  
  button.type = 'button';
  button.ariaLabel = 'Grabclip';
  button.setAttribute(BUTTON_ATTRIBUTE, 'true');
  button.style.cssText = BUTTON_STYLES;
  
  // Create span wrapper for icon
  const span = document.createElement('span');
  span.style.cssText = SPAN_STYLES;
  
  // Create SVG icon
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('height', '24');
  svg.setAttribute('width', '24');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('fill', 'white');
  svg.setAttribute('version', '1.1');
  svg.setAttribute('viewBox', '0 0 1024 1024');
  svg.setAttribute('class', 'icon');
  
  // Create path element
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M822.08 864h-576a64 64 0 1 0 0 128h576a64 64 0 0 0 0-128zM480 753.28a103.36 103.36 0 0 0 106.24 0 953.6 953.6 0 0 0 294.08-294.08A103.36 103.36 0 1 0 704 352a704 704 0 0 1-49.6 67.84l-23.36-298.24a96 96 0 0 0-193.92 0l-23.36 300.16A564.8 564.8 0 0 1 364.16 352a103.36 103.36 0 1 0-177.28 106.56A953.92 953.92 0 0 0 480 753.28z'
  );
  
  // Assemble the DOM structure
  svg.appendChild(path);
  span.appendChild(svg);
  button.appendChild(span);
  
  // Add hover effect
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = BUTTON_COLORS.HOVER;
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = BUTTON_COLORS.DEFAULT;
  });
  
  // Add click event
  button.addEventListener('click', handleGrabClipButtonClick);
  
  return button;
}

/**
 * Check if URL is a Bilibili video page
 * @param {string} url - The URL to check
 * @returns {boolean} True if it's a Bilibili video page, false otherwise
 */
function isBilibiliVideoPage(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    if (!hostname || !(hostname.includes('bilibili.com') || hostname.includes('b23.tv'))) {
      return false;
    }
    
    return url.includes('/video/') || url.includes('/BV') || url.includes('/av');
  } catch (error) {
    console.error('Error checking Bilibili video page:', error);
    return false;
  }
}

/**
 * Analyze video information from the current page
 * @returns {Object} Video information including platform and URL
 */
function analyzeVideoInfo() {
  const currentUrl = window.location.href;
  let videoUrl = currentUrl;
  
  // If current URL isn't a video page, try to get it from meta tag
  if (!isBilibiliVideoPage(currentUrl)) {
    const metaUrl = document.querySelector('meta[itemprop="url"]');
    if (metaUrl && isBilibiliVideoPage(metaUrl.content)) {
      videoUrl = metaUrl.content;
    }
  }
  
  return {
    platform: 'bilibili',
    url: videoUrl
  };
}

/**
 * Add GrabClip button to the Bilibili video page toolbar
 */
function addGrabClipButton() {
  // Try to find video player toolbar container
  const toolbarContainer = document.querySelector(TOOLBAR_SELECTOR);
  if (!toolbarContainer) {
    return;
  }
  
  // Check if button already exists
  if (toolbarContainer.querySelector(`button[${BUTTON_ATTRIBUTE}]`)) {
    return;
  }

  const button = createGrabClipButton();
  toolbarContainer.insertBefore(button, toolbarContainer.firstChild);
}

/**
 * Initialize the GrabClip button functionality
 */
function initializeGrabClipButton() {
  // Add button initially
  addGrabClipButton();
  
  // Set up mutation observer to handle dynamic content updates
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    mutations.forEach((mutation) => {
      // Check for toolbar container in added nodes
      if (mutation.addedNodes.length > 0) {
        const hasToolbar = Array.from(mutation.addedNodes)
          .filter(node => node.nodeType === Node.ELEMENT_NODE)
          .some(node => node.matches(TOOLBAR_SELECTOR) || node.querySelector(TOOLBAR_SELECTOR));
        
        if (hasToolbar) {
          shouldUpdate = true;
        }
      }
      
      // Check if toolbar itself changed attributes
      if (mutation.type === 'attributes' && mutation.target.matches(TOOLBAR_SELECTOR)) {
        shouldUpdate = true;
      }
    });
    
    if (shouldUpdate) {
      // Add button to new or updated toolbar with a small delay
      setTimeout(addGrabClipButton, 1000);
    }
  });
  
  // Observe the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id']
  });
}

/**
 * Initialize the extension when DOM is ready
 */
function initializeExtension() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGrabClipButton);
  } else {
    // DOM is already loaded
    initializeGrabClipButton();
  }
}

// Start extension initialization
initializeExtension();

// Export functions for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeVideoInfo,
  };
} else {
  // For content script usage
  window.BilibiliAnalyzer = {
    analyzeVideoInfo,
  };
}

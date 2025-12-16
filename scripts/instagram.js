// Instagram video analyzer module

// Constants
const BUTTON_ATTRIBUTE = 'data-grabclip-button';
const GRABCLIP_BASE_URL = 'https://grabclip.com/instagram/';
const BUTTON_COLORS = {
  DEFAULT: '#1296db',
  HOVER: '#70c1e6'
};

const BUTTON_STYLES = `
  background-color: #1296db;
  border: none;
  border-radius: 50%;
  margin: 0 8px 20px 8px;
  width: 32px;
  height: 32px;
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

/**
 * Check if the current URL is an Instagram video page
 * @param {string} url - The URL to check
 * @returns {boolean} True if it's an Instagram video page, false otherwise
 */
function isInstagramVideoPage(url) {
  if (!url) return false;
  // Instagram video URLs typically have formats like:
  // https://www.instagram.com/p/POST_ID/
  // https://www.instagram.com/reel/REEL_ID/
  // https://www.instagram.com/tv/TV_ID/
  const videoPattern = /instagram\.com\/(p|reel|tv)\//i;
  return videoPattern.test(url);
}

/**
 * Analyze video information from the current page
 * @returns {Object} Video information including platform and URL
 */
function analyzeVideoInfo() {
  const currentUrl = window.location.href;
  let videoUrl = currentUrl;
  
  // If current URL isn't a video page, try to extract it
  if (!isInstagramVideoPage(currentUrl)) {
    // For Instagram, we can try to get the canonical URL from meta tag
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag && isInstagramVideoPage(canonicalTag.href)) {
      videoUrl = canonicalTag.href;
    }
  }
  
  return {
    platform: 'instagram',
    url: videoUrl
  };
}



/**
 * Get the current video page URL from meta tag or window location
 * @returns {string} The video page URL
 */
function getCurrentVideoUrl() {
  return window.location.href;
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
  svg.setAttribute('height', '22');
  svg.setAttribute('width', '22');
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
 * Add GrabClip button to the Bilibili video page toolbar
 */
function addGrabClipButton() {
  // aria-label="Like"
  const svgs = document.querySelectorAll(
    'div[class*="html-div"] svg polygon[points="20 21 12 13.44 4 21 4 3 20 3 20 21"]'
  );
  if (!svgs.length) {
    console.log('No like SVG found');
    return;
  }
  
  // 循环所有svg
  svgs.forEach(svg => {
    const parentDiv = svg.closest('div[class*="html-div"]');
    if (!parentDiv) {
      console.log("No parent div found");
      return;
    };

    const toolbarDiv = parentDiv.parentElement;
    if (!toolbarDiv) {
      console.log("No toolbar div found");
      return;
    }

      // Check if button already exists
    if (toolbarDiv.querySelector(`button[${BUTTON_ATTRIBUTE}]`)) {
      return;
    }

    const button = createGrabClipButton();
    toolbarDiv.insertBefore(button, toolbarDiv.firstChild);
  });
}

/**
 * Initialize the GrabClip button functionality
 */
function initializeGrabClipButton() {
  // Add button initially
  console.log('addGrabClipButton');
  addGrabClipButton();
  
  // Set up mutation observer to handle dynamic content updates
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    mutations.forEach((mutation) => {
      // Check for added nodes with relevant content
      if (mutation.addedNodes.length > 0) {
        const hasRelevantContent = Array.from(mutation.addedNodes)
          .filter(node => node.nodeType === Node.ELEMENT_NODE)
          .some(node => {
            // Check if node or its children contain like buttons or video elements
            return node.querySelector('svg[aria-label="Like"]') || 
                   node.querySelector('video');
          });
        
        if (hasRelevantContent) {
          shouldUpdate = true;
        }
      }
    });
    
    if (shouldUpdate) {
      // Add button to new or updated content with a small delay
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
 * Initialize extension when DOM is ready
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
  window.InstagramAnalyzer = {
    analyzeVideoInfo,
  };
}

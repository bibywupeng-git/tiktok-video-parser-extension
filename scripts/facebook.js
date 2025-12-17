// Facebook video analyzer module

// Constants
const BUTTON_DATA_ATTRIBUTE = 'data-grabclip-button';
const GRABCLIP_BASE_URL = 'https://grabclip.com/facebook/';
const BUTTON_STYLE = {
  DEFAULT_COLOR: '#1296db',
  HOVER_COLOR: '#70c1e6'
};

const BUTTON_CSS = {
  STANDARD: `
    background-color: ${BUTTON_STYLE.DEFAULT_COLOR};
    border: none;
    border-radius: 50%;
    margin: 0 auto 0 auto;
    width: 36px;
    height: 36px;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  `,
  MINI: `
    background-color: ${BUTTON_STYLE.DEFAULT_COLOR};
    border: none;
    border-radius: 50%;
    margin-left: 16px;
    margin-right: 8px;
    width: 24px;
    height: 24px;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  `
};

const SPAN_CSS = `
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Check if the given URL is a Facebook video page
 * @param {string} url - The URL to check
 * @returns {boolean} True if it's a Facebook video page, false otherwise
 */
function isFacebookVideoUrl(url) {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    if (!hostname || !hostname.includes('facebook.com')) {
      return false;
    }
    
    // Check if URL contains reel or videos path with actual video ID
    const videoRegex = /\/(reel|videos)\/\d+/;
    return videoRegex.test(url);
  } catch (error) {
    console.error('Error checking Facebook video URL:', error);
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
  
  // If current URL isn't a video page, try to extract it from page elements
  if (!isFacebookVideoUrl(currentUrl)) {
    const videoIdElement = document.querySelector('div[data-video-id]');
    if (videoIdElement) {
      videoUrl = `https://www.facebook.com/reel/${videoIdElement.dataset.videoId}`;
    }
  }
  
  return {
    platform: 'facebook',
    url: videoUrl
  };
}

/**
 * Analyze video information from current element context
 * @param {HTMLElement} element - The element context to analyze from
 * @returns {Object} Video information including platform and URL
 */
function analyzeVideoInfoFromElement(element) {
  const currentUrl = window.location.href;
  let videoUrl = currentUrl;
  
  // If current URL isn't a video page, try to extract from parent elements
  if (!isFacebookVideoUrl(currentUrl)) {
    let parentElement = element;
    while (parentElement) {
      const videoIdElement = parentElement.querySelector('div[data-video-id]');
      if (videoIdElement) {
        videoUrl = `https://www.facebook.com/reel/${videoIdElement.dataset.videoId}`;
        break;
      }
      parentElement = parentElement.parentElement;
    }
  }
  
  return {
    platform: 'facebook',
    url: videoUrl
  };
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
 * Handle GrabClip button click event
 * @param {HTMLButtonElement} button - The clicked button element
 */
function handleButtonClick(button) {
  try {
    const videoInfo = analyzeVideoInfoFromElement(button);
    const videoUrl = videoInfo.url;
    const langCode = getLanguageCode();
    const targetUrl = `${GRABCLIP_BASE_URL}${encodeURIComponent(langCode)}/?url=${encodeURIComponent(videoUrl)}`;
    
    window.open(targetUrl, '_blank');
  } catch (error) {
    console.error('GrabClip button click error:', error);
  }
}

/**
 * Create a GrabClip button element
 * @param {string} buttonType - Type of button to create: 'standard' or 'mini'
 * @returns {HTMLButtonElement} The created button element
 */
function createButton(buttonType = 'standard') {
  const button = document.createElement('button');
  const isMini = buttonType === 'mini';
  
  button.type = 'button';
  button.ariaLabel = 'Grabclip';
  button.setAttribute(BUTTON_DATA_ATTRIBUTE, 'true');
  button.style.cssText = isMini ? BUTTON_CSS.MINI : BUTTON_CSS.STANDARD;
  
  // Create span wrapper for icon
  const span = document.createElement('span');
  span.style.cssText = SPAN_CSS;
  
  // Create SVG icon
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('height', isMini ? '16' : '24');
  svg.setAttribute('width', isMini ? '16' : '24');
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
    button.style.backgroundColor = BUTTON_STYLE.HOVER_COLOR;
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = BUTTON_STYLE.DEFAULT_COLOR;
  });
  
  // Add click event
  button.addEventListener('click', () => handleButtonClick(button));
  
  return button;
}

/**
 * Add GrabClip button to Reel page
 */
function addButtonToReelPage() {
  const moreButtons = document.querySelectorAll(
    'div[aria-expanded] svg path[d="M5 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm9-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"]'
  );
  
  if (!moreButtons.length) {
    return;
  }
  
  moreButtons.forEach((moreButton) => {
    let container = moreButton.closest('div');
    
    // Find appropriate container with enough child elements
    while (container) {
      if (container.childElementCount > 2) {
        // Check if button already exists
        if (container.querySelector(`button[${BUTTON_DATA_ATTRIBUTE}]`)) {
          return;
        }
        
        // Create and add GrabClip button
        const button = createButton('standard');
        container.insertBefore(button, container.firstChild);
        break;
      }
      
      container = container.parentElement;
    }
  });
}

/**
 * Add GrabClip button to Video page after slider bar
 */
function addButtonToVideoPage() {
  const sliderBar = document.querySelector('div[role="slider"][aria-orientation="horizontal"]');
  if (!sliderBar) {
    return;
  }
  
  const sliderBarParent = sliderBar.parentElement;
  if (!sliderBarParent) {
    return;
  }
  
  // Check if button already exists
  if (sliderBarParent.querySelector(`button[${BUTTON_DATA_ATTRIBUTE}]`)) {
    return;
  }
  
  // Create and add mini GrabClip button after slider bar
  const button = createButton('mini');
  sliderBarParent.insertBefore(button, sliderBar.nextSibling);
}

/**
 * Add GrabClip button based on current page type
 */
function addGrabClipButton() {
  const url = window.location.href;
  
  if (url.includes('/reel/')) {
    addButtonToReelPage();
  } else if (url.includes('/videos/')) {
    addButtonToVideoPage();
  }
}

/**
 * Initialize the GrabClip button functionality
 */
function initializeGrabClip() {
  // Add button initially
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
            return node.querySelector('div[role="slider"][aria-orientation="horizontal"]') ||
                   node.querySelector('div[aria-expanded] svg path[d="M5 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm9-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"]');
          });
        
        if (hasRelevantContent) {
          shouldUpdate = true;
        }
      }
    });
    
    if (shouldUpdate) {
      // Add button to new or updated content with a delay
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
    document.addEventListener('DOMContentLoaded', initializeGrabClip);
  } else {
    // DOM is already loaded
    initializeGrabClip();
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
  window.FacebookAnalyzer = {
    analyzeVideoInfo,
  };
}

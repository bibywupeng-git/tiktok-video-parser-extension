// TikTok video analyzer module

// Constants
const BUTTON_ATTRIBUTE = 'data-grabclip-button';
const GRABCLIP_BASE_URL = 'https://grabclip.com/tiktok/';
const BUTTON_COLORS = {
  DEFAULT: '#1296db',
  HOVER: '#70c1e6'
};
const SPAN_STYLES = `
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const SVG_PATH = 'M822.08 864h-576a64 64 0 1 0 0 128h576a64 64 0 0 0 0-128zM480 753.28a103.36 103.36 0 0 0 106.24 0 953.6 953.6 0 0 0 294.08-294.08A103.36 103.36 0 1 0 704 352a704 704 0 0 1-49.6 67.84l-23.36-298.24a96 96 0 0 0-193.92 0l-23.36 300.16A564.8 564.8 0 0 1 364.16 352a103.36 103.36 0 1 0-177.28 106.56A953.92 953.92 0 0 0 480 753.28z';

// Button configuration constants
const BUTTON_SIZES = {
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

// DOM selectors
const SELECTORS = {
  ARTICLE: 'article[id*="-item-"]',
  ACTION_BAR: 'section[class*="ActionBar"]',
  BUTTON_ROW: 'div[class*="DivMainContent"] div[class*="DivFlexCenterRowWithGap"]',
  CREATOR_INFO: 'div[class*="DivCreatorInfoContainer"] a',
  VIDEO_CONTAINER: 'div[class*="DivBasicPlayerWrapper"] div[class*="xgplayer-container"]'
};

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
 * Construct the GrabClip target URL
 * @param {string} videoUrl - The video URL to share
 * @returns {string} The constructed GrabClip URL
 */
function constructGrabClipUrl(videoUrl) {
  const langCode = getLanguageCode();
  return `${GRABCLIP_BASE_URL}${encodeURIComponent(langCode)}/?url=${encodeURIComponent(videoUrl)}`;
}

/**
 * Handle GrabClip button click event
 * @param {HTMLElement|null} article - The article element containing the video
 */
function handleGrabClipButtonClick(article = null) {
  try {
    let videoUrl;
    
    if (article) {
      const videoInfo = analyzeArticleVideoInfo(article);
      videoUrl = videoInfo?.url || window.location.href;
    } else {
      videoUrl = window.location.href;
    }
    
    const targetUrl = constructGrabClipUrl(videoUrl);
    window.open(targetUrl, '_blank');
  } catch (error) {
    console.error('GrabClip button click error:', error);
  }
}

/**
 * Create button styles based on size configuration
 * @param {Object} sizeConfig - Button size configuration
 * @returns {string} CSS styles for the button
 */
function createButtonStyles(sizeConfig) {
  return `
    background-color: ${BUTTON_COLORS.DEFAULT};
    border: none;
    border-radius: 50%;
    width: ${sizeConfig.size}px;
    height: ${sizeConfig.size}px;
    padding: 0;
    ${sizeConfig.marginBottom > 0 ? `margin-bottom: ${sizeConfig.marginBottom}px;` : ''}
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  `;
}

/**
 * Create SVG icon for the button
 * @param {number} size - SVG size in pixels
 * @returns {SVGElement} The created SVG element
 */
function createSvgIcon(size) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('height', size);
  svg.setAttribute('width', size);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('fill', 'white');
  svg.setAttribute('version', '1.1');
  svg.setAttribute('viewBox', '0 0 1024 1024');
  svg.setAttribute('class', 'icon');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', SVG_PATH);
  svg.appendChild(path);
  
  return svg;
}

/**
 * Create the GrabClip button element
 * @param {HTMLElement|null} article - The article element containing the video
 * @param {string} buttonType - Button type ('NORMAL' or 'MINI')
 * @returns {HTMLButtonElement} The created button element
 */
function createGrabClipButton(article = null, buttonType = 'NORMAL') {
  const sizeConfig = BUTTON_SIZES[buttonType] || BUTTON_SIZES.NORMAL;
  const button = document.createElement('button');
  
  button.type = 'button';
  button.ariaLabel = 'Grabclip';
  button.setAttribute(BUTTON_ATTRIBUTE, 'true');
  button.style.cssText = createButtonStyles(sizeConfig);
  
  // Create span wrapper for icon
  const span = document.createElement('span');
  span.setAttribute('data-e2e', 'grabclip-icon');
  span.style.cssText = SPAN_STYLES;
  
  // Create and add SVG icon
  const svg = createSvgIcon(sizeConfig.svgSize);
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
  button.addEventListener('click', () => handleGrabClipButtonClick(article));
  
  return button;
}

/**
 * Generic video URL extractor function
 * @param {HTMLElement|Document} container - The container element to search in
 * @param {boolean} isArticle - Whether the container is an article element
 * @returns {string} Extracted video URL or empty string if not found
 */
function extractVideoUrl(container = document, isArticle = false) {
  let creatorId = '';
  let videoId = '';
  
  // Build selectors with proper context
  const creatorSelector = isArticle 
    ? SELECTORS.CREATOR_INFO 
    : `${SELECTORS.ARTICLE}[style=''] ${SELECTORS.CREATOR_INFO}`;
  
  const videoSelector = isArticle 
    ? SELECTORS.VIDEO_CONTAINER 
    : `${SELECTORS.ARTICLE}[style=''] ${SELECTORS.VIDEO_CONTAINER}`;
  
  // Extract creator ID
  const creatorInfo = container.querySelector(creatorSelector);
  if (creatorInfo) {
    const parts = creatorInfo.href.split('/');
    creatorId = parts[parts.length - 1] || '';
  }
  
  // Extract video ID
  const videoInfo = container.querySelector(videoSelector);
  if (videoInfo) {
    const parts = videoInfo.id.split('-');
    videoId = parts[parts.length - 1];
  }
  
  // Construct video URL
  if (videoId) {
    if (creatorId) {
      return `https://www.tiktok.com/${creatorId}/video/${videoId}`;
    }
    return `https://www.tiktok.com/video/${videoId}`;
  }
  
  return '';
}

/**
 * Check if URL is a TikTok video page
 * @param {string} url - The URL to check
 * @returns {boolean} True if it's a TikTok video page, false otherwise
 */
function isTikTokVideoPage(url) {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    if (!domain.endsWith('.tiktok.com')) {
      return false;
    }
    
    return (
      url.includes('/video/') ||
      url.includes('/v/') ||
      url.match(/vm\.tiktok\.com\/[A-Za-z0-9]+\/?/) !== null
    );
  } catch (error) {
    console.error('Error checking TikTok video page:', error);
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
  
  // If current URL isn't a video page, try to extract it
  if (!isTikTokVideoPage(currentUrl)) {
    const extractedUrl = extractVideoUrl();
    if (extractedUrl) {
      videoUrl = extractedUrl;
    }
  }
  
  return {
    platform: 'tiktok',
    url: videoUrl
  };
}

/**
 * Analyze video information from a specific article element
 * @param {HTMLElement} article - The article element containing the video
 * @returns {Object} Video information including platform and URL
 */
function analyzeArticleVideoInfo(article) {
  const videoUrl = extractVideoUrl(article, true);
  
  return {
    platform: 'tiktok',
    url: videoUrl
  };
}

/**
 * Add GrabClip button to articles with action bars
 * @returns {boolean} True if buttons were added, false otherwise
 */
function addButtonsToArticles() {
  const articles = document.querySelectorAll(SELECTORS.ARTICLE);
  let buttonsAdded = false;
  
  articles.forEach((article) => {
    // Check if button already exists
    if (article.querySelector(`button[${BUTTON_ATTRIBUTE}]`)) {
      return;
    }
    
    const actionBar = article.querySelector(SELECTORS.ACTION_BAR);
    if (actionBar) {
      // Create normal size button
      const button = createGrabClipButton(article, 'NORMAL');
      // Add button at the first position
      actionBar.insertBefore(button, actionBar.firstChild);
      buttonsAdded = true;
    }
  });
  
  return buttonsAdded;
}

/**
 * Add mini GrabClip button to the main content area
 * @returns {boolean} True if button was added, false otherwise
 */
function addMiniButtonToMainContent() {
  const buttonRow = document.querySelector(SELECTORS.BUTTON_ROW);
  
  if (buttonRow) {
    // Check if button already exists
    if (buttonRow.querySelector(`button[${BUTTON_ATTRIBUTE}]`)) {
      return false;
    }
    
    // Create mini button
    const button = createGrabClipButton(null, 'MINI');
    // Add button at the first position
    buttonRow.insertBefore(button, buttonRow.firstChild);
    return true;
  }
  
  return false;
}

/**
 * Add GrabClip buttons to the page
 */
function addGrabClipButtons() {
  // Try to add buttons to articles first
  const articlesProcessed = addButtonsToArticles();
  
  // If no articles found, try to add mini button to main content
  if (!articlesProcessed) {
    addMiniButtonToMainContent();
  }
}

/**
 * Check if a mutation contains relevant elements for button addition
 * @param {MutationRecord} mutation - The mutation record to check
 * @returns {boolean} True if the mutation contains relevant elements
 */
function mutationContainsRelevantElements(mutation) {
  return Array.from(mutation.addedNodes).some((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }
    
    const element = node;
    return (
      element.matches(SELECTORS.ARTICLE) ||
      element.querySelector(SELECTORS.ARTICLE) ||
      element.matches(SELECTORS.ACTION_BAR) ||
      element.querySelector(SELECTORS.ACTION_BAR) ||
      element.matches(SELECTORS.BUTTON_ROW) ||
      element.querySelector(SELECTORS.BUTTON_ROW)
    );
  });
}

/**
 * Initialize button adding functionality
 */
function initializeGrabClipButtons() {
  // Add button initially
  addGrabClipButtons();
  
  // Set up mutation observer to handle dynamic content
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    mutations.forEach((mutation) => {
      // Check for added nodes with relevant elements
      if (mutation.addedNodes.length > 0 && mutationContainsRelevantElements(mutation)) {
        shouldUpdate = true;
      }
    });
    
    if (shouldUpdate) {
      // Add button to new or updated articles/action bars
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
    document.addEventListener('DOMContentLoaded', initializeGrabClipButtons);
  } else {
    // DOM is already loaded
    initializeGrabClipButtons();
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
  window.TikTokAnalyzer = {
    analyzeVideoInfo,
  };
}
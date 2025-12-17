// Facebook video analyzer module

// Constants
const BUTTON_ATTRIBUTE = 'data-grabclip-button';
const GRABCLIP_BASE_URL = 'https://grabclip.com/facebook/';
const BUTTON_COLORS = {
  DEFAULT: '#1296db',
  HOVER: '#70c1e6'
};

const BUTTON_STYLES = `
  background-color: #1296db;
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
`;

const MIN_BUTTON_STYLES = `
  background-color: #1296db;
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
`;

const SPAN_STYLES = `
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Check if the current URL is a Facebook video page
 * @param {string} url - The URL to check
 * @returns {boolean} True if it's a Facebook video page, false otherwise
 */
function isFacebookVideoPage(url) {
  if (!url) return false;
  // https://www.facebook.com/reel/1547742986161006
  // https://www.facebook.com/orion88888888/videos/1150445677243473
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    if (!hostname || !hostname.includes('facebook.com')) {
      return false;
    }
    
    // 检查是否包含reel或videos路径，并且后面跟着视频ID数值
    const videoRegex = /\/(reel|videos)\/\d+/;
    return videoRegex.test(url);
  } catch (error) {
    console.error('Error checking Facebook video page:', error);
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
  if (!isFacebookVideoPage(currentUrl)) {
      // div[data-video-id]
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

function analyzeCurrentVideoInfo(curElement) {
  const currentUrl = window.location.href;
  let videoUrl = currentUrl;
  
  // If current URL isn't a video page, try to extract it
  if (!isFacebookVideoPage(currentUrl)) {
      // 循环父节点中查找子节点中有没有div[data-video-id]
      let parentElement = curElement;
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
 * Handle GrabClip button click
 */
function handleGrabClipButtonClick(button) {
  try {
    const videoInfo = analyzeCurrentVideoInfo(button);
    const videoUrl = videoInfo.url;
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
  button.addEventListener('click', () => handleGrabClipButtonClick(button));
  
  return button;
}

function createMinGrabClipButton() {
  const button = document.createElement('button');
  
  button.type = 'button';
  button.ariaLabel = 'Grabclip';
  button.setAttribute(BUTTON_ATTRIBUTE, 'true');
  button.style.cssText = MIN_BUTTON_STYLES;
  
  // Create span wrapper for icon
  const span = document.createElement('span');
  span.style.cssText = SPAN_STYLES;
  
  // Create SVG icon
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('height', '16');
  svg.setAttribute('width', '16');
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
  button.addEventListener('click', () => handleGrabClipButtonClick(button));
  
  return button;
}

function addReelPageGrabClipButton() {
  const moreButtons = document.querySelectorAll(
      'div[aria-expanded] svg path[d="M5 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm9-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"]'
    );
    
    if (!moreButtons.length) {
      console.log('No more buttons found');
      return;  
    }

    moreButtons.forEach((moreButton) => {
      // 根据当前more按钮，向父div节点查找，直到发现div中包含了>1个子div节点
      let currentNode = moreButton.closest('div');
      
      // 向上查找父节点，直到找到合适的容器
      while (currentNode) {
        // 检查是否包含>2个子节点
        if (currentNode.childElementCount > 2) {
          // 检查按钮是否已经存在
          if (currentNode.querySelector(`button[${BUTTON_ATTRIBUTE}]`)) {
            return;
          }
          
          // 创建并添加GrabClip按钮
          const button = createGrabClipButton();
          currentNode.insertBefore(button, currentNode.firstChild);
          break;
        }
        
        // 继续向上查找
        currentNode = currentNode.parentElement;
      }
    });
}


function addVideoPageGrabClipButton() {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>addVideoPageGrabClipButton');

  const sliderBar  = document.querySelector('div[role="slider"][aria-orientation="horizontal"]');
  if (!sliderBar) {
    console.log('No slider bar found');
    return;
  }
    
  const sliderBarParent = sliderBar.parentElement;
  if (!sliderBarParent) {
    console.log('No slider bar parent found');
    return;
  }

  // 检查按钮是否已经存在
  if (sliderBar.querySelector(`button[${BUTTON_ATTRIBUTE}]`)) {
    return;
  }

  // 创建并添加GrabClip按钮到sliderBar后面
  const button = createMinGrabClipButton();
  sliderBarParent.insertBefore(button, sliderBar.nextSibling);
}


/**
 * Add GrabClip button to the Facebook video page
 */
function addGrabClipButton() {
  const url = window.location.href;

  if (url.includes('/reel/')) {
    addReelPageGrabClipButton();
  } else if(url.includes('/videos/')) {
    addVideoPageGrabClipButton();
  }
}

/**
 * Initialize the GrabClip button functionality
 */
function initializeGrabClipButton() {
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
            return node.querySelector('div[role="slider"][aria-orientation="horizontal"]');
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
  window.FacebookAnalyzer = {
    analyzeVideoInfo,
  };
}

const PLATFORM_NAME = 'tiktok';
const BUTTON_ATTRIBUTE = 'data-grabclip-button';

// Button configuration constants
const PARAMS = {
  NORMAL: {
    size: '48px',
    svgSize: '24px',
    margin: {
      top: '0px',
      right: '0px',
      bottom: '20px',
      left: '0px'
    }
  },
  MINI: {
    size: '32px',
    svgSize: '16px',
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
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


class TikTokAnalyzer extends window.BaseAnalyzer {
  constructor() {
    super(PLATFORM_NAME);
    this.observer = null;
  }


  isVideoPage(url) {
    try {
      const supportedDomains = PLATFORM_INFO.domains;
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      const pathname = parsedUrl.pathname;
      
      const isSupported = supportedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
      if (!isSupported) {
        return false;
      }
      
      return pathname.includes('/video/') || pathname.includes('/v/');
    } catch (error) {
      console.error('Error checking TikTok video page:', error);
      return false;
    }
  }


  extractVideoPageInfo() {
    try {
      let curPageUrl = window.location.href;

      if (!this.isVideoPage(curPageUrl)) {  
        let creatorId = '';
        let videoId = '';
        
        // Build selectors for article context
        const creatorSelector = `${SELECTORS.ARTICLE}[style=''] ${SELECTORS.CREATOR_INFO}`;
        const videoSelector = `${SELECTORS.ARTICLE}[style=''] ${SELECTORS.VIDEO_CONTAINER}`;
        
        // Extract creator ID
        const creatorInfo = document.querySelector(creatorSelector);
        if (creatorInfo) {
          const parts = creatorInfo.href.split('/');
          creatorId = parts[parts.length - 1] || '';
        }
        
        // Extract video ID
        const videoInfo = document.querySelector(videoSelector);
        if (videoInfo) {
          const parts = videoInfo.id.split('-');
          videoId = parts[parts.length - 1];
        }
        
        // Construct video URL
        if (videoId) {
          if (creatorId) {
            curPageUrl = `https://www.tiktok.com/${creatorId}/video/${videoId}`;
          }
          curPageUrl = `https://www.tiktok.com/video/${videoId}`;
        }
      }
        
      return {
        platform: PLATFORM_NAME,
        url: curPageUrl
      };
    }
    catch (error) {
      console.error('Error extracting TikTok video page info:', error);
      return null;
    }
  }

  
  addButtonsToArticles() {
    const articles = document.querySelectorAll(SELECTORS.ARTICLE);
    let buttonsAdded = false;
    
    articles.forEach((article) => {
      // Check if button already exists
      if (article.querySelector(`button[${BUTTON_ATTRIBUTE}]`)) {
        buttonsAdded = true;
        return;
      }
      
      const actionBar = article.querySelector(SELECTORS.ACTION_BAR);
      if (actionBar) {
        // Create normal size button
        const button = this.createGrabClipButton(PLATFORM_INFO, PARAMS.NORMAL);
        // Add button at the first position
        actionBar.insertBefore(button, actionBar.firstChild);
        buttonsAdded = true;
      }
    });
    
    return buttonsAdded;
  }

  addMiniButtonToMainContent() {
    const buttonRow = document.querySelector(SELECTORS.BUTTON_ROW);
    
    if (buttonRow) {
      // Check if button already exists
      if (buttonRow.querySelector(`button[${BUTTON_ATTRIBUTE}]`)) {
        return true;
      }
      
      // Create mini button
      const button = this.createGrabClipButton(PLATFORM_INFO, PARAMS.MINI);
      // Add button at the first position
      buttonRow.insertBefore(button, buttonRow.firstChild);
      return true;
    }
    
    return false;
  }

  /**
   * 添加截取片段按钮
   * @returns {void}
   */
  addGrabClipButton() {
    try {
      console.log("TikTokAnalyzer addGrabClipButton");

      // Try to add buttons to articles first
      const articlesProcessed = this.addButtonsToArticles();
      console.log("TikTokAnalyzer addButtonsToArticles", articlesProcessed);

      // If no articles found, try to add mini button to main content
      if (!articlesProcessed) {
        const miniButtonAdded = this.addMiniButtonToMainContent();
        console.log("TikTokAnalyzer addMiniButtonToMainContent", miniButtonAdded);
      }
    } catch (error) {
      console.error("Error adding GrabClip button:", error);
    }
  }

  /**
   * 插入下载按钮
   */
  insertDownloadButton() {
    console.log("TikTokAnalyzer insertDownloadButton");

    // 初始添加按钮
    this.addGrabClipButton();
    
    // 配置观察器，设置需要观察的选择器
    this.configureObserver({
      selectors: [
        SELECTORS.ARTICLE,
        SELECTORS.ACTION_BAR,
        SELECTORS.BUTTON_ROW
      ]
    });
    
    // 初始化MutationObserver以监听异步加载的内容
    this.initMutationObserver();
  }
}

// 导出到全局作用域
const PLATFORM_INFO = {
  name: PLATFORM_NAME,
  displayName: 'TikTok',
  domains: ['tiktok.com'],
  needCookie: false,
  analyzer: TikTokAnalyzer,
};
window.PLATFORMS = {
  ...window.PLATFORMS,
    [PLATFORM_NAME]: PLATFORM_INFO,
};
class BaseAnalyzer {
  constructor(platformName) {
    if (new.target === BaseAnalyzer) {
      throw new Error("Cannot instantiate abstract class BaseAnalyzer");
    }
    this.platformName = platformName;
    this.observer = null;
    this.observerConfig = {
      selectors: [], // 子类需要观察的选择器列表
      checkElementAdded: null // 子类提供的自定义检查函数
    };
  }

  /**
   * 检查当前URL是否支持
   * @param {string} url - 当前页面URL
   * @returns {boolean} - 是否支持该URL
   */
  isVideoPage(url) {
    throw new Error("Subclass must implement isVideoPage method");
  }

  /**
   * 从页面提取视频信息
   */
  extractVideoPageInfo() {
    throw new Error("Subclass must implement extractVideoPageInfo method");
  }

  /**
   * 插入下载按钮
   * @returns {Promise<void>}
   */
  insertDownloadButton() {
    throw new Error("Subclass must implement insertDownloadButton method");
  }


  getLangCode() {
    const supportLangCodes = ["zh", "en", "bn", "cs", "de", "es", "ru", "it", "ms", "nl", "fr", "tl", "id", "vi", "pt", "pl", "tr", "uk", "fa", "hi", "lo", "my", "th", "ja", "ko", "zh-HK"];
    let uiLanguage = navigator.language || "en";

    // 兼容处理
    uiLanguage = uiLanguage.replace("_", "-")

    const lowerCaseLang = uiLanguage.toLowerCase();
    if (lowerCaseLang.startsWith("zh-")) {
      if (lowerCaseLang.endsWith("cn")) {
        return "zh"
      }
      else {
        return uiLanguage
      }
    }
    
    uiLanguage = uiLanguage.substring(0, 2);
    if (supportLangCodes.includes(uiLanguage)) {
      return uiLanguage;
    } else {
      return "en";
    }
  }

  
  /**
   * Handle click event for GrabClip button
   */
  async handleGrabClipButtonClick(platform) {
    try {
      console.log(`handleGrabClipButtonClick for platform: ${platform.name}`);
      // 获取视频URL
      const videoPageInfo = this.extractVideoPageInfo();
      if (videoPageInfo && videoPageInfo.url) {
        console.log("Got video page info:", videoPageInfo);

        // Open GrapClip in new tab
        const langCode = this.getLangCode();

        // 在回调内部构建URL并打开新窗口
        let targetUrl = `https://grabclip.com/${platform.name}/${langCode}/?url=${encodeURIComponent(videoPageInfo.url)}`;

        if (platform.needCookie) {
          const urlParams = [];
          const cookieDataKey = `cookieData_${platform.name}`;
          const cookieData = await chrome.storage.local.get([cookieDataKey]);
          const storageCookieDict = cookieData[cookieDataKey]?.cookies || {};

          if (storageCookieDict && Object.keys(storageCookieDict).length > 0) {
            platform.cookieKeys.forEach((element) => {
              if (storageCookieDict[element.name]) {
                urlParams.push(
                  `${element.paramName}=${encodeURIComponent(
                    storageCookieDict[element.name]
                  )}`
                );
              }
            });
          }
          // 添加urlParams到URL
          if (urlParams.length > 0) {
            targetUrl += `&${urlParams.join("&")}`;
          }
        }
        // 打开新窗口
        window.open(targetUrl, "_blank");
      } else {
        console.log("Failed to get video page info");
      }
    } catch (error) {
      console.error(`GrabClip button click error for ${platform.name}:`, error);
    }
  }

  /**
   * 配置DOM监听选项
   * @param {Object} config - 监听配置
   * @param {Array<string>} config.selectors - 需要观察的CSS选择器列表
   * @param {Function} config.checkElementAdded - 自定义检查函数，判断是否需要添加按钮
   */
  configureObserver(config) {
    if (config.selectors) {
      this.observerConfig.selectors = config.selectors;
    }
    if (config.checkElementAdded) {
      this.observerConfig.checkElementAdded = config.checkElementAdded;
    }
  }

  /**
   * 初始化MutationObserver以监听DOM变化
   */
  initMutationObserver() {
    // 如果已经存在观察器，先停止观察
    if (this.observer) {
      this.observer.disconnect();
    }

    // 配置观察选项
    const observerOptions = {
      childList: true, // 观察目标节点的子节点的添加和移除
      subtree: true,   // 观察目标节点的整个子树
      attributes: false,
      characterData: false
    };

    // 创建观察器实例
    this.observer = new MutationObserver((mutationsList) => {
      // 遍历所有突变
      for (let mutation of mutationsList) {
        // 只处理子节点添加的情况
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // 检查是否添加了需要观察的元素
          let shouldAddButtons = false;
          
          // 遍历所有添加的节点
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 1. 使用子类配置的选择器检查
              const selectorMatch = this.observerConfig.selectors.some(selector => {
                return node.matches(selector) || node.querySelector(selector);
              });
              
              // 2. 使用子类提供的自定义检查函数
              const customCheckMatch = this.observerConfig.checkElementAdded 
                ? this.observerConfig.checkElementAdded(node) 
                : false;
              
              // 如果匹配到任何条件，标记需要添加按钮
              if (selectorMatch || customCheckMatch) {
                shouldAddButtons = true;
                break;
              }
            }
          }
          
          // 如果检测到相关元素添加，重新添加按钮
          if (shouldAddButtons) {
            // 确保子类实现了addGrabClipButton方法
            if (typeof this.addGrabClipButton === 'function') {
              this.addGrabClipButton();
            }
          }
        }
      }
    });

    // 开始观察整个文档
    this.observer.observe(document.body, observerOptions);
  }

  /**
   * Create the GrabClip button element
   * @returns {HTMLButtonElement} The created button element
   */
  createGrabClipButton(platform, param = {}) {
    param = param || {};
    param.size = param.size || "36px";
    param.svgSize = param.svgSize || "24px";

    param.margin = param.margin || {};
    param.margin.top = param.margin.top || "0px";
    param.margin.right = param.margin.right || "0px";
    param.margin.bottom = param.margin.bottom || "0px";
    param.margin.left = param.margin.left || "0px";

    const BUTTON_ATTRIBUTE = "data-grabclip-button";
    const BUTTON_COLORS = {
      DEFAULT: "#1296db",
      HOVER: "#70c1e6",
    };

    const button = document.createElement("button");
    button.type = "button";
    button.ariaLabel = "Grabclip";
    button.setAttribute(BUTTON_ATTRIBUTE, "true");
    button.style.cssText = `
      background-color: ${BUTTON_COLORS.DEFAULT};
      border: none;
      border-radius: 50%;
      margin: ${param.margin.top} ${param.margin.right} ${param.margin.bottom} ${param.margin.left};
      width: ${param.size};
      height: ${param.size};
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;

    // Create span wrapper for icon
    const span = document.createElement("span");
    span.style.cssText =
      "color: white; display: flex; align-items: center; justify-content: center;";

    // Create SVG icon
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("height", param.svgSize);
    svg.setAttribute("width", param.svgSize);
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
      button.style.backgroundColor = BUTTON_COLORS.HOVER;
    });

    button.addEventListener("mouseleave", () => {
      button.style.backgroundColor = BUTTON_COLORS.DEFAULT;
    });

    // Add click event using base class method
    button.addEventListener("click", () =>
      this.handleGrabClipButtonClick(platform)
    );
    return button;
  }
}

// 导出到全局作用域
window.BaseAnalyzer = BaseAnalyzer;

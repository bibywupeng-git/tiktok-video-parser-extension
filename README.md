# TikTok Video Downloader (No Watermark & HD) - GrabClip

> An open-source Chrome extension to download TikTok videos without watermarks in HD/4K quality. Fast, free, and unlimited.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue)](https://grabclip.com/tiktok)

## 📖 Introduction

**GrabClip for TikTok** is a powerful browser extension designed to enhance your video collecting experience. It allows you to seamlessly download videos from TikTok without the annoying watermark.

Whether you need to save videos for offline viewing, content archiving, or editing, this tool provides a secure and fast solution.

🔗 **Official Web Version:** [GrabClip TikTok Downloader](https://grabclip.com/tiktok)  
*(Use our online tool for advanced features like downloading video (MP4) or audio (MP3), along with broader multi-platform support including Instagram, Facebook, Twitter, Douyin and more.)*

## ✨ Features

- **No Watermark:** Download clean videos without the TikTok logo/ID.
- **HD & 4K Support:** Get the highest quality available (MP4 format).
- **Fast & Lightweight:** Optimized for Chrome, no lag.
- **100% Free:** No hidden costs, no login required.
- **Privacy Focused:** We do not store your download history or personal data.

## 🚀 Installation

### Option 1: From Chrome Web Store (Recommended)
*Link coming soon...* (Pending Review)

### Option 2: Manual Installation (Developer Mode)
If you want to use the latest version immediately or contribute to the code:

1.  **Download** this repository (Click `Code` -> `Download ZIP`) and unzip it.
2.  Open your Chrome browser and navigate to `chrome://extensions/`.
3.  Toggle **"Developer mode"** in the top right corner.
4.  Click the **"Load unpacked"** button.
5.  Select the folder where you unzipped this repository.
6.  The extension is now installed! Pin it to your toolbar for easy access.

## 🛠 Usage

1. Open any **TikTok** video page.  
2. Click the **download button** next to the video or the **extension icon** in your browser toolbar.  
3. The extension automatically copies the video's URL and opens a new tab to:  
   `https://www.grabclip.com/tiktok/` — the URL is passed to the web tool.  
4. The web page parses the link and loads a no-watermark preview.  
5. Choose your preferred output:
   - **MP4** — download the highest available no-watermark video quality (HD / 4K when available)  
   - **MP3** — extract and download audio only

**Notes**
- The extension only copies the video URL and forwards it to the GrabClip web tool for processing; the actual parsing and file generation happen on the website.  
- For privacy: the extension activates only on TikTok video pages and does not store your browsing history or personal data.


## 📂 Project Structure

```text
TikTokVideoDownloader/
├── _locales/            # Internationalization (i18n) files
├── images/              # Extension icons (16, 48, 128px)
├── scripts/             # Core logic
│   ├── content.js       # Page interaction script
│   └── tiktok.js        # TikTok-specific functionality
├── background.js        # Service worker
├── manifest.json        # Configuration & Permissions
├── package.json         # Project dependencies
├── package-lock.json    # Dependency lock file
├── LICENSE              # License information
└── README.md            # Documentation
```

## 🔒 Privacy Policy

This extension respects your privacy.

We do not collect your personal information, passwords, or browsing history.

The extension only activates when you are on a specific video URL to facilitate the download request.

For more details, please view our Privacy Policy.

👉 **https://grabclip.com/privacy_policy**

## 🤝 Contributing

We welcome contributions from the community!

1. **Fork** this repository  
2. Create your feature branch  
   ```bash
   git checkout -b feature/amazing-feature
    ```
3. **Commit** your changes  
4. **Push** to the branch  
5. Open a **Pull Request** on GitHub.

You can contribute by:

- Improving the code

- Adding new language translations

- Optimizing detection logic

- Fixing bugs

- Enhancing documentation

Thank you for helping improve GrabClip!

## 📝 License
Distributed under the MIT License. See [LICENSE](https://opensource.org/licenses/MIT) for more information.

## 📞 Contact & Support
For issues, feature requests, or DMCA inquiries:

Official Website: https://www.grabclip.com
Report Bug: GitHub Issues

## ⚠️ Disclaimer

This project is **not affiliated**, **endorsed**, or **sponsored** by TikTok.  
It is an independent, open-source utility created for educational and personal archiving purposes only.

Users are responsible for ensuring that video downloads comply with TikTok’s Terms of Service and local laws.

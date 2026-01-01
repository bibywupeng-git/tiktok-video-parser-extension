# TikTok Video Parser Extension (Chrome)

A lightweight, open-source Chrome extension focused on parsing TikTok video pages
and forwarding video URLs to a web-based processing flow.

This project is designed with a minimal architecture and clear separation between
the browser extension and the web-based processing layer.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 📖 Introduction

This Chrome extension helps users interact with TikTok video pages by extracting
video URLs and redirecting them to a dedicated web-based processing page.

The extension itself does **not** download or process media files locally.  
All parsing and file generation are handled externally via a web interface.

The goal of this project is to demonstrate a clean, permission-minimized browser
extension architecture for handling video page parsing workflows.

---

## ✨ Features

- Parse TikTok video page URLs
- Open a new tab to a web-based processing page
- Minimal permissions and lightweight implementation
- Clear separation between extension logic and web processing
- No local storage of user data or browsing history

---

## 🚀 Installation

### Manual Installation (Developer Mode)

This extension can be installed locally for development or evaluation purposes:

1. Download this repository (Click **Code → Download ZIP**) and unzip it.
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the unzipped project folder
6. The extension will appear in your browser toolbar

---

## 🛠 Usage

1. Open any TikTok video page in your browser.

2. You can start the parsing process in either of the following ways:
   - Click the extension icon in the browser toolbar, or
   - Click the parse button added by the extension directly on the TikTok video page.

3. The extension will automatically copy the video link and open a new tab:
   https://grabclip.com/tiktok

4. The page will parse the video source and display a preview.
   You can then choose to download:
   - The highest available quality video (MP4, no watermark), or
   - Audio only (MP3)

The extension serves as a convenient entry point from TikTok,
while the parsing and download process is handled on the website.


### Notes

- The extension only activates on TikTok video pages.
- No media files are downloaded or processed directly by the extension.
- All media-related operations occur on the external web page.
- The extension does not track or store personal data.

---

## 📂 Project Structure

## 📁 Project Structure

```text
tiktok-video-parser-extension/
├── analyzers/              # Parsing logic modules
├── background.js           # Background service worker
├── content.js              # Injects parse button into TikTok pages
├── icons/                  # Extension icons
├── _locales/               # Internationalization messages
├── manifest.json           # Chrome extension configuration
└── README.md               # Project documentation
```

## 🔒 Privacy Policy

This project respects user privacy.

- No personal data is collected or stored
- No browsing history is tracked
- The extension operates only on supported video pages

For more details, please review the Privacy Policy:

👉 https://grabclip.com/privacy_policy

## 🤝 Contributing

Contributions are welcome and appreciated.

If you’d like to contribute to this project, please follow these steps:

1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
    ```
3. Make your changes
4. Commit your changes with a clear message
5. Push your branch to your fork
6. Open a Pull Request

Suggested contribution areas include:
- Code improvements and refactoring
- Bug fixes
- Documentation updates
- Localization and translations

## 📝 License

This project is licensed under the MIT License.  
See the [LICENSE](https://opensource.org/licenses/MIT) file for details.

## ⚠️ Disclaimer

This project is not affiliated with, endorsed by, or sponsored by TikTok.

It is intended for educational and technical demonstration purposes only.
Users are responsible for ensuring compliance with applicable laws and
platform terms of service.

# BDC Tooltip for Arena Breakout Infinite

BDC Tooltip is a small, standalone browser Add‑on (Manifest V3) that improves the "BDC" (Ban, Discipline, and Complaint) interface in Arena Breakout Infinite. It is distributed as a Chrome/Edge extension (unpacked or packaged) and runs directly as a browser extension—no userscript manager required.

## Features

- **Video Speed Controls:** Adds a dropdown menu to the video player to control playback speed (`0.25x`–`2.0x`).
- **Frame-by-frame stepping:** Step forward/back by `~1/60s` for precise review.
- **English placeholder texts:** Replaces local placeholders with helpful English prompts in BDC input fields.
- **Hide watermark:** Hides intrusive watermark overlays on the video player.
- **Forward and Backward** Added Buttons to skip `5sek` For-/ and Backwards
- **Jump to Start** Added Button to Jump to the beginning of the Video

## Installation

### Install via Web Store

1. Open `https://chromewebstore.google.com/detail/bdc-tooltip/cndanhamjpdhjpapnfcbcgaknandamic`
2. Add the AddOn to your Browser
3. The extension will be installed and activate on pages under `*.arenabreakoutinfinite.com`.

### Install as an unpacked extension (Developer / quick test)

1. Open `chrome://extensions/` (or `edge://extensions/`) in your browser.
2. Enable **Developer mode** (toggle in the top-right).
3. Click **Load unpacked** and select the repository folder (the folder containing `manifest.json`).
4. The extension will be installed and activate on pages under `*.arenabreakoutinfinite.com`.

## Usage

- After installation the add‑on will run automatically on `*.arenabreakoutinfinite.com` and inject the player controls and UI improvements.

## Compatibility & Privacy

- **Scope:** Runs only on pages under `*.arenabreakoutinfinite.com` as declared in `manifest.json`.
- **Privacy:** All behavior runs locally in the page context; no external servers are contacted and no user data is transmitted.
- **License:** MIT — see `LICENSE`.

## Changelog

- **v1.0.0:** Initial release — core video controls, frame stepping, UI improvements, and watermark removal.
- **v1.0.1:** Fixed dynamic page reload handling so the Settings button reappears reliably.  Improved watermark handling to re-apply after player/content refreshes.
- **v1.1.0:** Added Utility Buttons: -/+ 5 sek Buttons and a Button to jump back to the beginning.     And release on Chrome Web Store.


## Credits & Feedback

- **Author:** Anytnq>
- **Report issues / request features:** Open an issue in the GitHub repository.

---

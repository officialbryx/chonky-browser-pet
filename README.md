# Chonky Browser Pet

Chonky is a tiny chonky pixel-art cat who keeps you company while you browse. Chonky wanders, sits, naps, snacks, and plays right on top of the pages you visit — and lives in your toolbar too. Give Chonky a treat, play, go for a stroll, or take a nap together. Happiness and tummy stats are saved locally with Chrome storage; no account, backend, or network access is needed.

## Features

- **Lives on your pages.** A small Chonky floats in the corner of every tab, wandering around, sitting, sleeping (zzz), snacking on a fish, and playing with a yarn ball on a randomized loop so it never feels repetitive.
- **Click to pet.** Click (or tab to and press Enter/Space on) Chonky on any page for a happy purr, a heart, and a little happiness boost.
- **Toolbar popup.** Open the toolbar icon for the full care panel: Play, Treat, Stroll, and Nap buttons, plus Happiness and Full tummy meters.
- **One switch to turn it off.** Toggle "Let Chonky roam your pages" in the popup to hide the on-page companion any time; the toolbar popup still works either way.
- **Respects reduced motion.** If your system prefers reduced motion, Chonky settles into a calm, mostly-still pose instead of animating.
- **Private by design.** Everything is stored locally with `chrome.storage`; there's no account, backend, or network access.

## Install in Chrome

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
3. Select **Load unpacked** and choose the project folder.
4. Select Chonky's toolbar icon to open the popup, or just start browsing to meet Chonky on your pages. Pin the extension to keep the popup close by.

Chrome will note that the extension "can read and change data on all websites" — that permission is only used to draw Chonky's little overlay on top of pages; the extension never reads or modifies page content.

## Development

The extension uses plain HTML, CSS, and JavaScript, with no build step or external dependencies.

- `popup.html` / `popup.css` / `popup.js` — the toolbar care panel.
- `content.js` — injects Chonky's on-page companion (via an isolated Shadow DOM) into every tab.
- `cat.svg` — the pixel-art cat used in the popup.
- `manifest.json` — the Manifest V3 configuration.

Reload Chonky from `chrome://extensions` after making changes to see them take effect.

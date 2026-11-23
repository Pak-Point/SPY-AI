# SPY AI — Image to Video

SPY AI is a browser-based image-to-video app starter. It uses the xAI video API through a Cloudflare Worker so the API key is never placed in browser code.

## Files
- `index.html`, `style.css`, `app.js`: web app
- `worker/index.js`: API proxy
- `worker/wrangler.toml`: Cloudflare Worker configuration
- `manifest.webmanifest`, `sw.js`: installable PWA basics

## Setup overview
1. Deploy the `worker` folder to Cloudflare Workers.
2. Add the secret `XAI_API_KEY` in Worker settings. Never put this key in app.js or GitHub.
3. Copy the Worker URL into `API_BASE` in `app.js`, replacing the placeholder.
4. Enable GitHub Pages for the repository (main branch, root folder).

Video generation is a paid API service. Check current xAI pricing before generating videos. Image-to-video requests use the Grok Imagine Video 1.5 Lite model.

This is a web/PWA starter, not a compiled Android APK. Android packaging with Capacitor can be added after the web version is connected and tested.

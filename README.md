# SPY AI

A mobile-friendly browser app with two separate AI features:

- **Nano Banana Image Generator** — calls the Gemini API through a Cloudflare Worker using the `gemini-nano-banana-2.1` model.
- **Image to Video** — keeps the existing xAI video API as a separate optional service.

## Files
- `index.html`, `style.css`, `app.js`: web app
- `worker/index.js`: Cloudflare Worker API proxy
- `worker/wrangler.toml`: Worker configuration
- `manifest.webmanifest`, `sw.js`: installable PWA basics

## Cloudflare Worker setup
1. Deploy the contents of `worker/index.js` to a Cloudflare Worker.
2. Add a Cloudflare Worker Secret named `GEMINI_API_KEY` with your Google AI Studio API key.
3. For the optional video feature only, add `XAI_API_KEY` with a valid xAI API key. Without it, image generation can still work.
4. Set the Worker URL in the app browser's local storage using the key `SPY_AI_API_BASE`, or change `API_BASE` in `app.js` to the deployed Worker URL.

Never put API keys in browser JavaScript or GitHub files.

## API routes
- `POST /api/image` — Gemini Nano Banana image generation.
- `POST /api/generate` — optional xAI image-to-video generation.
- `GET /api/status/{request_id}` — optional xAI video status.

## Pricing and availability
Gemini API quotas, model access, and charges depend on the current Google AI Studio account tier and model availability. Check the current Google AI Studio pricing page before generating images. The xAI video API is a separate service and may incur charges.

This is a web/PWA app starter, not a compiled Android APK. Android packaging can be added after the web version is deployed and tested.

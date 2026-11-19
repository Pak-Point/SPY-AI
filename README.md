# Pak Point WhatsApp Downloader Bot

A starter WhatsApp Web bot for public YouTube, TikTok and Instagram links, limited to content the sender is authorized to download.

## Important limitations

- This uses an unofficial WhatsApp Web library (Baileys), not the official WhatsApp Business Platform. Using automation with a personal WhatsApp account can violate WhatsApp terms or lead to account restrictions. Use a spare number; do not use your primary number.
- Free hosting may sleep, restart, or lose local pairing files. A persistent disk is recommended for `.auth_info`; many free plans do not provide one.
- Platform access and download availability can change. Private, login-required, DRM-protected, age-restricted or otherwise inaccessible content is not bypassed.
- Only download/share content you own or have permission to use. Respect copyright and platform terms.
- This starter sends video files up to about 45 MB. It does not promise that every platform link will work.

## Run locally

Requires Node.js 20+ and Python 3.

```bash
pip install -r requirements.txt
npm install
npm start
```

Scan the QR printed in the terminal using WhatsApp > Linked devices > Link a device. Keep the `.auth_info` folder private and persistent. Never commit it.

Send `menu` to the linked WhatsApp account, then send a supported public video link.

## Deploy

The included `render.yaml` is a free-worker starting point. Connect this private GitHub repository to Render and create the service from the Blueprint. Free services can sleep/restart and may not retain the WhatsApp session; reliable 24/7 operation generally needs a paid always-on host and persistent storage.

## Security

Never share the QR code, session files, or environment secrets. If the account is unexpectedly logged out, delete the saved session on the host and pair again.
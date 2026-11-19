const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const AUTH_DIR = process.env.AUTH_DIR || ".auth_info";
const DOWNLOAD_DIR = "downloads";
const MAX_BYTES = 45 * 1024 * 1024;
const ALLOWED_HOSTS = [
  "youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com",
  "tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com",
  "instagram.com", "www.instagram.com"
];
fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

function validMediaUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && ALLOWED_HOSTS.includes(u.hostname.toLowerCase());
  } catch { return false; }
}
function downloadMedia(url, output) {
  return new Promise((resolve, reject) => {
    const args = ["-m", "yt_dlp", "--no-playlist", "--max-filesize", String(MAX_BYTES),
      "-f", "best[ext=mp4][filesize<45M]/best[filesize<45M]",
      "--merge-output-format", "mp4", "-o", output, url];
    const p = spawn("python3", args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", d => { err += d.toString(); if (err.length > 4000) err = err.slice(-4000); });
    p.on("error", reject);
    p.on("close", code => code === 0 ? resolve() : reject(new Error(err || "Download failed")));
  });
}
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  let version;
  try { ({ version } = await fetchLatestBaileysVersion()); } catch {}
  const sock = makeWASocket({
    version, auth: state, logger: pino({ level: "silent" }),
    printQRInTerminal: true, browser: ["Pak Point", "Chrome", "1.0.0"],
    getMessage: async () => ({ conversation: "Pak Point" })
  });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") console.log("Pak Point Bot connected.");
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log("WhatsApp connection closed:", code);
      if (code !== DisconnectReason.loggedOut) setTimeout(startBot, 4000);
      else console.log("Logged out. Remove auth data and pair again.");
    }
  });
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const m of messages) {
      if (!m.message || m.key.fromMe || m.key.remoteJid === "status@broadcast") continue;
      const jid = m.key.remoteJid;
      const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
      const url = body.match(/https?:\/\/[^\s]+/i)?.[0]?.replace(/[),.]+$/, "");
      if (/^(hi|hello|start|menu|help)$/i.test(body.trim())) {
        await sock.sendMessage(jid, { text:
          "🌐 *PAK POINT DOWNLOADER*\n\nYouTube, TikTok یا Instagram کی public video کا link بھیجیں۔\n\nصرف وہ مواد بھیجیں جسے download کرنے کی آپ کو اجازت ہو۔ Private، login-required یا DRM محفوظ مواد سپورٹ نہیں ہے۔\n\nفائل سائز کی حد تقریباً 45 MB ہے۔" });
        continue;
      }
      if (!url) {
        await sock.sendMessage(jid, { text: "براہِ کرم YouTube، TikTok یا Instagram کا public video link بھیجیں۔ مدد کے لیے *menu* لکھیں۔" });
        continue;
      }
      if (!validMediaUrl(url)) {
        await sock.sendMessage(jid, { text: "یہ supported platform link نہیں ہے۔ صرف YouTube، TikTok یا Instagram کے HTTPS links بھیجیں۔" });
        continue;
      }
      const file = path.join(DOWNLOAD_DIR, `media-${Date.now()}-${Math.random().toString(16).slice(2)}.mp4`);
      try {
        await sock.sendMessage(jid, { text: "⏳ Pak Point آپ کے مجاز public media link کو process کر رہا ہے..." });
        await downloadMedia(url, file);
        const stat = fs.statSync(file);
        if (stat.size > MAX_BYTES) throw new Error("File exceeds size limit");
        await sock.sendMessage(jid, {
          video: fs.readFileSync(file), mimetype: "video/mp4",
          fileName: "Pak-Point-Video.mp4",
          caption: "✅ Pak Point Downloader\nصرف مجاز مواد استعمال کریں۔"
        });
      } catch (e) {
        console.error("Media processing error:", e.message);
        await sock.sendMessage(jid, { text: "❌ ویڈیو حاصل نہیں ہو سکی۔ ممکن ہے link unavailable ہو، platform نے access محدود کیا ہو، یا فائل 45 MB سے بڑی ہو۔ Private/login-required یا DRM مواد کو bypass نہیں کیا جاتا۔" });
      } finally {
        try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch {}
      }
    }
  });
}
startBot().catch(e => { console.error(e); process.exit(1); });

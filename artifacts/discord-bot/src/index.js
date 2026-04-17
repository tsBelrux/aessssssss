// ═══════════════════════════════════════════════════════════════
// Aishivex — Ultra Aesthetic Gaming Community Discord Bot v3
// discord.js v14 | Gemini AI | XP | Music | Full Mod
// ═══════════════════════════════════════════════════════════════

import http              from "http";
import { createRequire } from "module";
import { dirname }       from "path";
import {
  Client,
  GatewayIntentBits,
  Partials,
}                        from "discord.js";

// ── FFmpeg PATH kurulumu (müzik için kritik!) ──────────────
// @discordjs/voice FFmpeg'i PATH üzerinden bulur
const _require    = createRequire(import.meta.url);
const ffmpegPath  = _require("ffmpeg-static");
if (ffmpegPath) {
  const ffmpegDir = dirname(ffmpegPath);
  process.env.PATH        = `${ffmpegDir}:${process.env.PATH ?? ""}`;
  process.env.FFMPEG_PATH = ffmpegPath;
  console.log("✦ FFmpeg hazır:", ffmpegPath);
} else {
  console.warn("⚠️  FFmpeg bulunamadı — müzik çalışmayabilir.");
}

// ── Token kontrolü ─────────────────────────────────────────
if (!process.env.TOKEN) {
  console.error("❌ TOKEN bulunamadı! Replit Secrets'a TOKEN ekleyin.");
  process.exit(1);
}

// ── Discord Client (tüm intent'ler) ────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User,
  ],
});

// ── Event yükleyici ────────────────────────────────────────
async function loadEvents() {
  const modules = [
    "./events/ready.js",
    "./events/interactionCreate.js",
    "./events/messageCreate.js",
    "./events/guildMemberAdd.js",
    "./events/messageReactionAdd.js",
    "./events/messageReactionRemove.js",
    "./events/voiceStateUpdate.js",
  ];

  for (const path of modules) {
    const event = await import(path);
    const { name, once, execute } = event;
    if (!name || !execute) continue;

    if (once) {
      client.once(name, (...args) => execute(...args, client));
    } else {
      client.on(name,   (...args) => execute(...args, client));
    }
    console.log(`✦ Event yüklendi: ${name}`);
  }
}

// ── Keep-alive HTTP (Replit uyku modunu engeller) ──────────
const PORT = parseInt(process.env.PORT ?? "3000", 10);
http
  .createServer((_, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("꒰🌸 Aishivex is alive! ✦");
  })
  .listen(PORT, "0.0.0.0", () => {
    console.log(`✦ Keep-alive sunucu: port ${PORT}`);
  });

// ── Hata yönetimi ──────────────────────────────────────────
client.on("error",  (err) => console.error("Discord hatası:", err.message));
client.on("warn",   (msg) => console.warn("Discord uyarı:", msg));
process.on("unhandledRejection", (err) => {
  // play-dl AbortError gibi beklenen hataları gizle
  const msg = err?.message ?? String(err);
  if (msg.includes("AbortError") || msg.includes("ERR_STREAM_DESTROYED")) return;
  console.error("Yakalanmayan hata:", msg);
});

// ── Başlat ────────────────────────────────────────────────
(async () => {
  await loadEvents();
  await client.login(process.env.TOKEN);
})();

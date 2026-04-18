// ═══════════════════════════════════════════════════════════════
// Aishivex — Ultra Aesthetic Gaming Community Discord Bot v4
// discord.js v14 | Gemini AI | XP | Music | Full Mod | AutoMod
// Anti-Raid | ModLog | Disboard Bump | Fun Commands
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
const _require   = createRequire(import.meta.url);
const ffmpegPath = _require("ffmpeg-static");
if (ffmpegPath) {
  const dir = dirname(ffmpegPath);
  process.env.PATH        = `${dir}:${process.env.PATH ?? ""}`;
  process.env.FFMPEG_PATH = ffmpegPath;
  console.log("✦ FFmpeg hazır:", ffmpegPath);
} else {
  console.warn("⚠️  FFmpeg bulunamadı — müzik çalışmayabilir.");
}

if (!process.env.TOKEN) {
  console.error("❌ TOKEN bulunamadı! Replit Secrets'a TOKEN ekleyin.");
  process.exit(1);
}

// ── Discord Client ──────────────────────────────────────────
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
    "./events/messageDelete.js",
    "./events/messageUpdate.js",
    "./events/guildMemberAdd.js",
    "./events/guildMemberRemove.js",
    "./events/guildBanAdd.js",
    "./events/guildBanRemove.js",
    "./events/messageReactionAdd.js",
    "./events/messageReactionRemove.js",
    "./events/voiceStateUpdate.js",
  ];

  for (const path of modules) {
    const event = await import(path);
    const { name, once, execute } = event;
    if (!name || !execute) continue;
    if (once) client.once(name, (...args) => execute(...args, client));
    else       client.on(name,   (...args) => execute(...args, client));
    console.log(`✦ Event yüklendi: ${name}`);
  }
}

// ── Keep-alive HTTP ─────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? "3000", 10);
http
  .createServer((_, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("꒰🌸 Aishivex v4 is alive! ✦");
  })
  .listen(PORT, "0.0.0.0", () => console.log(`✦ Keep-alive sunucu: port ${PORT}`));

// ── Hata yönetimi ───────────────────────────────────────────
client.on("error", (err) => console.error("Discord hatası:", err.message));
process.on("unhandledRejection", (err) => {
  const msg = err?.message ?? String(err);
  if (["AbortError", "ERR_STREAM_DESTROYED", "VOICE_CONNECTION_TIMEOUT"].some((k) => msg.includes(k))) return;
  console.error("Yakalanmayan hata:", msg);
});

// ── Başlat ──────────────────────────────────────────────────
(async () => {
  await loadEvents();
  await client.login(process.env.TOKEN);
})();

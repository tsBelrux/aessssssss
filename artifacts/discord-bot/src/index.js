// ═══════════════════════════════════════════════════════════════
// Aishivex — Ultra Aesthetic Gaming Community Discord Bot
// discord.js v14 | Gemini AI | XP System | Music | Mod
// ═══════════════════════════════════════════════════════════════

import http from "http";
import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";

// ── Token kontrolü ─────────────────────────────────────────
if (!process.env.TOKEN) {
  console.error("❌ TOKEN bulunamadı! Replit Secrets'a ekleyin.");
  process.exit(1);
}
if (!process.env.AI_INTEGRATIONS_GEMINI_BASE_URL) {
  console.warn("⚠️  AI_INTEGRATIONS_GEMINI_BASE_URL bulunamadı. /ai komutu çalışmayabilir.");
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

// ── Event Yükleyici ─────────────────────────────────────────
async function loadEvents() {
  const events = [
    await import("./events/ready.js"),
    await import("./events/interactionCreate.js"),
    await import("./events/messageCreate.js"),
    await import("./events/guildMemberAdd.js"),
    await import("./events/messageReactionAdd.js"),
    await import("./events/messageReactionRemove.js"),
    await import("./events/voiceStateUpdate.js"),
  ];

  for (const event of events) {
    const { name, once, execute } = event;
    if (!name || !execute) continue;

    if (once) {
      client.once(name, (...args) => execute(...args, client));
    } else {
      client.on(name, (...args) => execute(...args, client));
    }
    console.log(`✦ Event yüklendi: ${name}`);
  }
}

// ── Keep-alive HTTP sunucu (Replit için) ────────────────────
// Bu sunucu botun uyanık kalmasını sağlar
const PORT = process.env.PORT ?? 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("꒰🌸 Aishivex is alive! ✦");
  })
  .listen(PORT, "0.0.0.0", () => {
    console.log(`✦ Keep-alive sunucu: port ${PORT}`);
  });

// ── Hata yönetimi ───────────────────────────────────────────
client.on("error",    (err) => console.error("Discord hatası:", err.message));
client.on("warn",     (msg) => console.warn("Discord uyarı:", msg));
process.on("unhandledRejection", (err) =>
  console.error("Yakalanmayan hata:", err?.message ?? err)
);

// ── Başlat ──────────────────────────────────────────────────
(async () => {
  await loadEvents();
  await client.login(process.env.TOKEN);
})();

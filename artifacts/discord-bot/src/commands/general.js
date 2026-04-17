// ─────────────────────────────────────────────────────────────
// General Commands — Aishivex
// ping, botinfo, serverinfo, userinfo, avatar, 8ball, coinflip, poll
// ─────────────────────────────────────────────────────────────

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { buildEmbed, COLORS, FLOWER, STAR, GLYPH } from "../utils/embed.js";

// ── 8ball yanıtları / 8ball responses ─────────────────────
const BALL_RESPONSES = [
  { text: "Kesinlikle evet! ✦",          positive: true  },
  { text: "Bence evet 🌸",               positive: true  },
  { text: "Evet, şüphesiz!",             positive: true  },
  { text: "İşaretler evet diyor 𓂃",     positive: true  },
  { text: "Büyük ihtimalle evet!",       positive: true  },
  { text: "Outlook iyi görünüyor 🌸",    positive: true  },
  { text: "Daha sonra sor 🌸",           positive: null  },
  { text: "Henüz söyleyemem...",         positive: null  },
  { text: "Konsantrasyon yeniden dene",  positive: null  },
  { text: "Cevap belirsiz... 𓂃",        positive: null  },
  { text: "Kesinlikle hayır ❌",          positive: false },
  { text: "Bence hayır...",              positive: false },
  { text: "Olmaz olmaz 🌸",              positive: false },
  { text: "Çok şüpheliyim",             positive: false },
  { text: "Outlook iyi değil... ✦",     positive: false },
];

// ─────────────────────────────────────────────────────────────
// /ping
// ─────────────────────────────────────────────────────────────
export const pingData = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("꒰📡 Bot gecikmesini kontrol et ✦");

export async function executePing(ctx) {
  const isI = isInteraction(ctx);
  const sent = isI ? await ctx.reply({ content: "𓂃 Ölçülüyor...", fetchReply: true }) : await ctx.reply("𓂃 Ölçülüyor...");
  const latency = sent.createdTimestamp - (isI ? ctx.createdTimestamp : ctx.createdTimestamp);
  const wsLatency = ctx.client.ws.ping;

  const embed = buildEmbed({
    title: `${STAR} Pong!`,
    color: COLORS.purple,
    fields: [
      { name: "📡 Bot Gecikmesi",    value: `\`${latency}ms\``,   inline: true },
      { name: "💓 WebSocket",        value: `\`${wsLatency}ms\``, inline: true },
    ],
    timestamp: false,
  });

  if (isI) await ctx.editReply({ content: null, embeds: [embed] });
  else await sent.edit({ content: null, embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /botinfo
// ─────────────────────────────────────────────────────────────
export const botinfoData = new SlashCommandBuilder()
  .setName("botinfo")
  .setDescription("꒰🤖 Aishivex hakkında bilgi ✦");

export async function executeBotinfo(ctx) {
  const bot     = ctx.client.user;
  const uptime  = formatUptime(process.uptime());
  const mem     = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

  const embed = buildEmbed({
    title:       `${FLOWER} Aishivex Bot Bilgisi`,
    description: "Ultra aesthetic gaming community botu 🌸",
    color:       COLORS.pink,
    thumbnail:   bot.displayAvatarURL({ dynamic: true, size: 256 }),
    fields: [
      { name: "✦ Bot Adı",        value: bot.tag,                          inline: true },
      { name: "𓂃 Prefix",        value: "`!` veya `/`",                   inline: true },
      { name: "🌸 Sunucu Sayısı", value: `${ctx.client.guilds.cache.size}`, inline: true },
      { name: "📡 Gecikme",       value: `${ctx.client.ws.ping}ms`,         inline: true },
      { name: "⏱️ Çalışma Süresi",value: uptime,                           inline: true },
      { name: "💾 RAM Kullanımı", value: `${mem} MB`,                       inline: true },
      { name: "🔧 discord.js",    value: "v14",                             inline: true },
      { name: "⚡ Node.js",       value: process.version,                   inline: true },
      { name: "🤖 AI",            value: "Gemini 2.5 Flash",                inline: true },
    ],
  });

  reply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /serverinfo
// ─────────────────────────────────────────────────────────────
export const serverinfoData = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("꒰🏰 Sunucu bilgilerini gör ✦");

export async function executeServerinfo(ctx) {
  const g = ctx.guild;
  const owner = await g.fetchOwner().catch(() => null);

  const embed = buildEmbed({
    title:       `${FLOWER} ${g.name}`,
    color:       COLORS.purple,
    thumbnail:   g.iconURL({ dynamic: true, size: 256 }),
    fields: [
      { name: "👑 Sahip",           value: owner?.user.tag ?? "Bilinmiyor",            inline: true  },
      { name: "👥 Üye Sayısı",      value: `${g.memberCount}`,                         inline: true  },
      { name: "📅 Kuruluş",         value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`, inline: true },
      { name: "💬 Kanallar",        value: `${g.channels.cache.size}`,                 inline: true  },
      { name: "🎭 Roller",          value: `${g.roles.cache.size}`,                    inline: true  },
      { name: "😀 Emojiler",        value: `${g.emojis.cache.size}`,                   inline: true  },
      { name: "🔒 Doğrulama",       value: g.verificationLevel.toString(),             inline: true  },
      { name: "🚀 Boost",           value: `${g.premiumSubscriptionCount ?? 0}`,       inline: true  },
      { name: "🆔 Sunucu ID",       value: `\`${g.id}\``,                              inline: false },
    ],
  });

  reply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /userinfo
// ─────────────────────────────────────────────────────────────
export const userinfoData = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("꒰👤 Kullanıcı bilgilerini gör ✦")
  .addUserOption((o) => o.setName("kullanici").setDescription("Hangi kullanıcı?").setRequired(false));

export async function executeUserinfo(ctx) {
  const isI     = isInteraction(ctx);
  const target  = isI
    ? (ctx.options.getMember("kullanici") ?? ctx.member)
    : (ctx.mentions.members?.first() ?? ctx.member);

  const user    = target.user;
  const roles   = target.roles.cache
    .filter((r) => r.name !== "@everyone")
    .sort((a, b) => b.position - a.position)
    .map((r) => r.toString())
    .slice(0, 10)
    .join(", ") || "Rol yok";

  const embed = buildEmbed({
    title:       `${FLOWER} ${user.username}`,
    color:       target.displayHexColor !== "#000000" ? parseInt(target.displayHexColor.slice(1), 16) : COLORS.pink,
    thumbnail:   user.displayAvatarURL({ dynamic: true, size: 256 }),
    fields: [
      { name: "🏷️ Kullanıcı Adı",   value: user.tag,                                              inline: true  },
      { name: "🆔 ID",               value: `\`${user.id}\``,                                      inline: true  },
      { name: "📅 Hesap Tarihi",     value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,   inline: true  },
      { name: "📥 Katılma Tarihi",   value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>`,  inline: true  },
      { name: "🎭 En Yüksek Rol",    value: target.roles.highest.toString(),                       inline: true  },
      { name: "🤖 Bot mu?",          value: user.bot ? "Evet" : "Hayır",                           inline: true  },
      { name: `✦ Roller (${target.roles.cache.size - 1})`, value: roles,                          inline: false },
    ],
  });

  reply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /avatar
// ─────────────────────────────────────────────────────────────
export const avatarData = new SlashCommandBuilder()
  .setName("avatar")
  .setDescription("꒰🖼️ Kullanıcı avatarını gör ✦")
  .addUserOption((o) => o.setName("kullanici").setDescription("Kimin avatarı?").setRequired(false));

export async function executeAvatar(ctx) {
  const isI   = isInteraction(ctx);
  const target = isI
    ? (ctx.options.getUser("kullanici") ?? ctx.user)
    : (ctx.mentions.users?.first() ?? ctx.author);

  const avatarUrl = target.displayAvatarURL({ dynamic: true, size: 1024 });

  const embed = buildEmbed({
    title:  `${FLOWER} ${target.username}'in Avatarı`,
    color:  COLORS.pink,
    image:  avatarUrl,
    fields: [
      { name: "🔗 Link", value: `[Tam Boyut](${avatarUrl})`, inline: false },
    ],
    timestamp: false,
  });

  reply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /8ball
// ─────────────────────────────────────────────────────────────
export const eightBallData = new SlashCommandBuilder()
  .setName("8ball")
  .setDescription("꒰🎱 Sihirli 8 top! Ask the magic ball ✦")
  .addStringOption((o) => o.setName("soru").setDescription("Sorun nedir?").setRequired(true));

export async function executeEightBall(ctx) {
  const isI      = isInteraction(ctx);
  const question = isI ? ctx.options.getString("soru") : ctx.content.replace(/^!8ball\s*/i, "");
  const answer   = BALL_RESPONSES[Math.floor(Math.random() * BALL_RESPONSES.length)];

  const color = answer.positive === true ? COLORS.green
    : answer.positive === false ? COLORS.red
    : COLORS.blue;

  const embed = buildEmbed({
    title:       "꒰🎱 Sihirli 8 Top",
    color,
    fields: [
      { name: `${GLYPH} Soru`,   value: question,      inline: false },
      { name: `${STAR} Cevap`,   value: answer.text,   inline: false },
    ],
    timestamp: false,
  });

  reply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /coinflip
// ─────────────────────────────────────────────────────────────
export const coinflipData = new SlashCommandBuilder()
  .setName("coinflip")
  .setDescription("꒰🪙 Para at! Flip a coin ✦");

export async function executeCoinflip(ctx) {
  const result = Math.random() < 0.5 ? "🌸 Yazı" : "⭐ Tura";
  const embed = buildEmbed({
    title:       "꒰🪙 Para Atışı",
    description: `**${result}!**`,
    color:       Math.random() < 0.5 ? COLORS.pink : COLORS.yellow,
    timestamp:   false,
  });
  reply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /poll
// ─────────────────────────────────────────────────────────────
export const pollData = new SlashCommandBuilder()
  .setName("poll")
  .setDescription("꒰📊 Anket oluştur! Create a poll ✦")
  .addStringOption((o) => o.setName("soru").setDescription("Anket sorusu").setRequired(true))
  .addStringOption((o) => o.setName("a").setDescription("1. Seçenek").setRequired(true))
  .addStringOption((o) => o.setName("b").setDescription("2. Seçenek").setRequired(true))
  .addStringOption((o) => o.setName("c").setDescription("3. Seçenek (opsiyonel)").setRequired(false))
  .addStringOption((o) => o.setName("d").setDescription("4. Seçenek (opsiyonel)").setRequired(false));

export async function executePoll(ctx) {
  const isI      = isInteraction(ctx);
  const question = isI ? ctx.options.getString("soru") : "Anket";
  const opts     = isI
    ? ["a", "b", "c", "d"].map((k) => ctx.options.getString(k)).filter(Boolean)
    : [];

  const emojis = ["🅰️", "🅱️", "🇨", "🇩"];
  const rows   = opts.map((o, i) => `${emojis[i]} ${o}`).join("\n");

  const embed = buildEmbed({
    title:       `꒰📊 Anket: ${question}`,
    description: rows || "Seçenekler bulunamadı.",
    color:       COLORS.blue,
  });

  const msg = await (isI ? ctx.reply({ embeds: [embed], fetchReply: true }) : ctx.channel.send({ embeds: [embed] }));
  for (let i = 0; i < opts.length; i++) {
    try { await msg.react(emojis[i]); } catch {}
  }
  if (isI && !ctx.replied) ctx.reply({ embeds: [embed] }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────
// /announce
// ─────────────────────────────────────────────────────────────
export const announceData = new SlashCommandBuilder()
  .setName("announce")
  .setDescription("꒰📢 Kanal duyurusu yap (Admin) ✦")
  .addChannelOption((o) => o.setName("kanal").setDescription("Duyuru kanalı").setRequired(true))
  .addStringOption((o) => o.setName("mesaj").setDescription("Duyuru metni").setRequired(true))
  .addStringOption((o) => o.setName("baslik").setDescription("Başlık (opsiyonel)").setRequired(false));

export async function executeAnnounce(ctx) {
  const isI    = isInteraction(ctx);
  if (!ctx.member.permissions.has(8n)) {
    return reply(ctx, { content: "❌ Bu komut için Administrator yetkisi gerekli.", ephemeral: true });
  }

  const channel = isI ? ctx.options.getChannel("kanal") : ctx.mentions.channels?.first();
  const message = isI ? ctx.options.getString("mesaj") : "";
  const title   = isI ? (ctx.options.getString("baslik") ?? "꒰📢 Duyuru") : "꒰📢 Duyuru";

  if (!channel?.isTextBased()) return reply(ctx, { content: "❌ Geçersiz kanal!", ephemeral: true });

  const embed = buildEmbed({
    title,
    description: message,
    color:       COLORS.pink,
  });

  await channel.send({ content: "@everyone", embeds: [embed] });
  reply(ctx, { content: `✦ Duyuru ${channel} kanalına gönderildi 🌸`, ephemeral: true });
}

// ─────────────────────────────────────────────────────────────
// Yardımcı fonksiyonlar / Helpers
// ─────────────────────────────────────────────────────────────
function isInteraction(ctx) {
  return ctx.constructor.name.includes("Interaction");
}

function reply(ctx, opts) {
  const isI = isInteraction(ctx);
  if (isI) {
    if (ctx.replied || ctx.deferred) return ctx.editReply(opts).catch(() => {});
    return ctx.reply(opts).catch(() => {});
  }
  return ctx.reply(opts).catch(() => {});
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d) parts.push(`${d}g`);
  if (h) parts.push(`${h}s`);
  if (m) parts.push(`${m}d`);
  parts.push(`${s}sn`);
  return parts.join(" ");
}

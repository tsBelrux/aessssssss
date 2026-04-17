// ─────────────────────────────────────────────────────────────
// Message Create Event — Aishivex
// Prefix komutları (!play, !ai…) + XP sistemi + mention handler
// ─────────────────────────────────────────────────────────────

import { buildEmbed, COLORS } from "../utils/embed.js";
import { awardMessageXP, getRoleForLevel } from "../utils/xp.js";
import { execute as executeAI }                       from "../commands/ai.js";
import { execute as executeLevel, executeLb }         from "../commands/level.js";
import { executePlay, executeSkip, executeStop, executeQueue } from "../commands/music.js";
import { executeMute, executeUnmute, executeClear }   from "../commands/mod.js";

const PREFIX = "!";

export const name = "messageCreate";
export const once = false;

export async function execute(message, client) {
  // Bot mesajlarını ve DM'leri yoksay
  if (message.author.bot || !message.guild) return;

  // ── XP sistemi ────────────────────────────────────────────
  const xpResult = awardMessageXP(message.guild.id, message.author.id);
  if (xpResult?.leveled) {
    await handleLevelUp(message, xpResult.user);
  }

  // ── @Aishivex mention → AI ────────────────────────────────
  if (message.mentions.has(client.user) && !message.content.startsWith(PREFIX)) {
    const question = message.content.replace(`<@${client.user.id}>`, "").trim();
    if (question) {
      return executeAI(message, question);
    }
    const embed = buildEmbed({
      title:       "꒰🌸 Merhaba!",
      description: "Bana bir şey sor! Örneğin: `@Aishivex Valorant için iyi agent hangisi?` ✦",
      color:       COLORS.pink,
    });
    return message.reply({ embeds: [embed] });
  }

  // ── Prefix komut kontrolü ─────────────────────────────────
  if (!message.content.startsWith(PREFIX)) return;

  const args    = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  switch (command) {
    // AI
    case "ai":
    case "sor":
    case "ask": {
      const question = args.join(" ");
      if (!question) return message.reply("꒰🌸 Bir şey sor! Örn: `!ai Minecraft'ta diamond nerede bulunur?`");
      return executeAI(message, question);
    }

    // Level
    case "level":
    case "rank":
    case "xp":
    case "seviye":
      return executeLevel(message);

    case "leaderboard":
    case "lb":
    case "siralama":
      return executeLb(message);

    // Music
    case "play":
    case "p":
      return executePlay(message, args.join(" "));
    case "skip":
    case "s":
      return executeSkip(message);
    case "stop":
      return executeStop(message);
    case "queue":
    case "q":
    case "kuyruk":
      return executeQueue(message);

    // Moderation
    case "mute":
    case "sustur": {
      const target   = message.mentions.members?.first();
      const duration = parseInt(args[1]) || 5;
      const reason   = args.slice(2).join(" ") || "Sebep belirtilmedi";
      return executeMute(message, target, duration, reason);
    }
    case "unmute":
    case "unsustur": {
      const target = message.mentions.members?.first();
      return executeUnmute(message, target);
    }
    case "clear":
    case "temizle":
    case "purge":
      return executeClear(message, args[0]);

    // Help
    case "help":
    case "yardim":
    case "yardım":
    case "komutlar":
      return sendHelp(message);
  }
}

// ── Level up bildirimi / Level up notification ─────────────
async function handleLevelUp(message, user) {
  const roleName = getRoleForLevel(user.level);

  const embed = buildEmbed({
    title:       `꒰🏆 Seviye Atladın!`,
    description: `${message.author} **${user.level}. seviyeye** ulaştı! Tebrikler 🌸✦`,
    color:       COLORS.yellow,
    thumbnail:   message.author.displayAvatarURL({ dynamic: true }),
  });

  try {
    const levelMsg = await message.channel.send({ embeds: [embed] });
    setTimeout(() => levelMsg.delete().catch(() => {}), 15_000);
  } catch {}

  // Seviye rolü ver
  if (roleName) {
    const role = message.guild.roles.cache.find((r) => r.name === roleName);
    if (role) {
      try { await message.member.roles.add(role); }
      catch (err) { console.error("Rol eklenemedi:", err.message); }
    }
  }
}

// ── Yardım mesajı / Help message ──────────────────────────
async function sendHelp(message) {
  const embed = buildEmbed({
    title:       "꒰🌸 Aishivex Komutları",
    description: "Prefix: `!` veya Slash: `/`",
    color:       COLORS.pink,
    fields: [
      { name: "꒰🤖 AI",        value: "`!ai <soru>` veya `@Aishivex <soru>`",       inline: false },
      { name: "꒰🏆 Seviye",    value: "`!level`, `!leaderboard`",                   inline: false },
      { name: "꒰🎵 Müzik",     value: "`!play <şarkı>`, `!skip`, `!stop`, `!queue`", inline: false },
      { name: "꒰🔧 Mod",       value: "`!mute @kişi`, `!unmute @kişi`, `!clear <n>`",inline: false },
    ],
    timestamp: false,
  });
  return message.reply({ embeds: [embed] });
}

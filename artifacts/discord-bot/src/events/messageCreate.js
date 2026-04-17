// ─────────────────────────────────────────────────────────────
// Message Create — Aishivex
// Prefix komutlar (!) + XP sistemi + @mention AI
// ─────────────────────────────────────────────────────────────

import { buildEmbed, COLORS } from "../utils/embed.js";
import { awardMessageXP, getRoleForLevel }         from "../utils/xp.js";
import { execute as executeAI }                    from "../commands/ai.js";
import { execute as executeLevel, executeLb }      from "../commands/level.js";
import {
  executePing, executeBotinfo, executeServerinfo,
  executeUserinfo, executeAvatar, executeEightBall,
  executeCoinflip,
}                                                  from "../commands/general.js";
import {
  executePlay, executeSkip, executeStop,
  executePause, executeResume, executeQueue, executeNowplaying,
}                                                  from "../commands/music.js";
import {
  executeBan, executeKick,
  executeWarn, executeWarnings, executeClearwarns,
  executeMute, executeUnmute,
  executeClear, executeSlowmode,
  executeLock, executeUnlock,
  executeNickname, executePurge,
}                                                  from "../commands/mod.js";

const PREFIX = "!";

export const name = "messageCreate";
export const once = false;

export async function execute(message, client) {
  if (message.author.bot || !message.guild) return;

  // ── XP ──────────────────────────────────────────────────
  const xpResult = awardMessageXP(message.guild.id, message.author.id);
  if (xpResult?.leveled) handleLevelUp(message, xpResult.user);

  // ── @Mention → AI ───────────────────────────────────────
  if (message.mentions.has(client.user) && !message.content.startsWith(PREFIX)) {
    const question = message.content
      .replace(new RegExp(`<@!?${client.user.id}>`, "g"), "")
      .trim();
    if (question) return executeAI(message, question);

    return message.reply({
      embeds: [buildEmbed({
        title:       "꒰🌸 Merhaba!",
        description: "Bana bir şey sor! Örn: `@Aishivex Valorant'ta hangi agent iyi?` ✦",
        color:       COLORS.pink,
      })],
    });
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args    = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  try {
    switch (command) {
      // AI
      case "ai": case "sor": case "ask": {
        const q = args.join(" ");
        if (!q) return message.reply("꒰🌸 Bir şey sor! Örn: `!ai Minecraft'ta ne yapabilirim?`");
        return executeAI(message, q);
      }

      // General
      case "ping":     return executePing(message);
      case "botinfo":  return executeBotinfo(message);
      case "serverinfo": return executeServerinfo(message);
      case "userinfo":   return executeUserinfo(message);
      case "avatar":     return executeAvatar(message);
      case "8ball": {
        const q = args.join(" ");
        if (!q) return message.reply("Bir soru sor! Örn: `!8ball Bugün şanslı mıyım?`");
        return executeEightBall(message);
      }
      case "coinflip":   return executeCoinflip(message);

      // Level
      case "level": case "rank": case "xp": case "seviye":
        return executeLevel(message);
      case "leaderboard": case "lb": case "siralama":
        return executeLb(message);

      // Music
      case "play": case "p": {
        const q = args.join(" ");
        return executePlay(message, q);
      }
      case "skip": case "s":  return executeSkip(message);
      case "stop":            return executeStop(message);
      case "pause":           return executePause(message);
      case "resume":          return executeResume(message);
      case "queue": case "q": return executeQueue(message);
      case "nowplaying": case "np": return executeNowplaying(message);

      // Moderation
      case "ban":
        return executeBan(message);
      case "kick":
        return executeKick(message);
      case "warn":
        return executeWarn(message);
      case "warnings":
        return executeWarnings(message);
      case "clearwarns":
        return executeClearwarns(message);
      case "mute": case "sustur":
        return executeMute(message);
      case "unmute": case "unsustur":
        return executeUnmute(message);
      case "clear": case "temizle":
        return executeClear(message, args[0]);
      case "slowmode":
        return executeSlowmode(message, args[0]);
      case "lock":
        return executeLock(message);
      case "unlock":
        return executeUnlock(message);
      case "nickname": case "nick":
        return executeNickname(message);
      case "purge":
        return executePurge(message);

      // Help
      case "help": case "yardim": case "yardım": case "h":
        return sendHelp(message);
    }
  } catch (err) {
    console.error(`Prefix komut hatası (${command}):`, err.message);
  }
}

// ── Level up bildirimi ─────────────────────────────────────
async function handleLevelUp(message, user) {
  const embed = buildEmbed({
    title:       `꒰🏆 Seviye Atladın!`,
    description: `${message.author} **${user.level}. seviyeye** ulaştı! Tebrikler 🎉✦`,
    color:       COLORS.yellow,
    thumbnail:   message.author.displayAvatarURL({ dynamic: true }),
  });

  try {
    const msg = await message.channel.send({ embeds: [embed] });
    setTimeout(() => msg.delete().catch(() => {}), 12_000);
  } catch {}

  const roleName = getRoleForLevel(user.level);
  if (roleName) {
    const role = message.guild.roles.cache.find((r) => r.name === roleName);
    if (role) {
      try { await message.member.roles.add(role); }
      catch (err) { console.error("Rol eklenemedi:", err.message); }
    }
  }
}

// ── Help ──────────────────────────────────────────────────
function sendHelp(message) {
  const embed = buildEmbed({
    title:       "꒰🌸 Aishivex — Komut Listesi",
    description: `Prefix: \`!\`  |  Slash: \`/\`  |  AI: \`@Aishivex\``,
    color:       COLORS.pink,
    fields: [
      { name: "꒰🤖 AI",          value: "`!ai <soru>` `@Aishivex <soru>`",                                  inline: false },
      { name: "꒰📊 Genel",       value: "`!ping` `!botinfo` `!serverinfo` `!userinfo` `!avatar` `!8ball` `!coinflip`", inline: false },
      { name: "꒰🏆 Seviye",      value: "`!level` `!leaderboard`",                                          inline: false },
      { name: "꒰🎵 Müzik",       value: "`!play` `!skip` `!stop` `!pause` `!resume` `!queue` `!np`",        inline: false },
      { name: "꒰🔧 Moderasyon",  value: "`!ban` `!kick` `!warn` `!mute` `!clear` `!lock` `!slowmode` `!purge`", inline: false },
    ],
    timestamp: false,
  });
  return message.reply({ embeds: [embed] });
}

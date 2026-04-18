// ═══════════════════════════════════════════════════════════════
// Message Create — Aishivex
// AutoMod · XP · Prefix Komutlar · Auto-Replies · Kelime Oyunu
// Disboard Bump Dedektörü
// ═══════════════════════════════════════════════════════════════

import { PermissionFlagsBits }                         from "discord.js";
import { buildEmbed, COLORS }                          from "../utils/embed.js";
import { awardMessageXP, getRoleForLevel }             from "../utils/xp.js";
import { checkSpam, getGuildConfig, resetSpamRecord }  from "../utils/automod.js";
import { addWarning }                                  from "../utils/warnings.js";
import { logAutomod }                                  from "../utils/modlog.js";
import { handleBumpMessage }                           from "../utils/bump.js";
import { wordGames, endWordGame }                      from "../commands/fun.js";

import { execute as executeAI }                        from "../commands/ai.js";
import { execute as executeLevel, executeLb }          from "../commands/level.js";
import {
  executePing, executeBotinfo, executeServerinfo,
  executeUserinfo, executeAvatar, executeEightBall, executeCoinflip,
}                                                      from "../commands/general.js";
import {
  executePlay, executeSkip, executeStop,
  executePause, executeResume, executeQueue, executeNowplaying,
}                                                      from "../commands/music.js";
import {
  executeBan, executeKick,
  executeWarn, executeWarnings, executeClearwarns,
  executeMute, executeUnmute,
  executeClear, executeSlowmode,
  executeLock, executeUnlock,
  executeNickname, executePurge,
}                                                      from "../commands/mod.js";
import { notifyMod }                                   from "../commands/protection.js";

const PREFIX = "!";

export const name = "messageCreate";
export const once = false;

// ── Otomatik yanıtlar ─────────────────────────────────────
const AUTO_REPLIES = [
  { match: /^gg[!.]*$/i,                      replies: ["GG! 🎮", "İyi oyun! 🌸", "GG EZ ✦", "Tebrikler! 🎉"] },
  { match: /\b(rip|ripbozo)\b/i,              replies: ["F 🌸", "RIP 😔", "Geçmiş olsun... ✦", "F in the chat 🌸"] },
  { match: /^f$/i,                            replies: ["F 🌸", "Biz de seninle 💔"] },
  { match: /\b(günaydın|sabah|gm)\b/i,        replies: ["Günaydın! ☀️ 🌸", "İyi sabahlar! ✦", "Hayırlı sabahlar! 🌸"] },
  { match: /\b(gece|uyku|iyi geceler|gn)\b/i, replies: ["İyi geceler! 🌙🌸", "Tatlı rüyalar ✦", "Uyku süresi! 🌙"] },
  { match: /\baishivex\b/i,                   replies: ["Evet? 👀🌸", "Beni mi çağırdın? ✦", "Buradayım! 🌸", "Ne var ne yok? 👀"] },
  { match: /\b(ez|kolay)\b/i,                 replies: ["EZ Clap 👏", "Kolaymış öyle 😏", "Minik 31ci EZ ✦"] },
  { match: /\b(sıkıl|sıkıldım|boring)\b/i,   replies: ["꒰🎮 Bir oyun oyna!", "꒰🎵 Müzik açalım mı? `/play`", "꒰🎲 `/dice` ile zar at! 🌸"] },
  { match: /\b(gg wp)\b/i,                    replies: ["GG WP! İyi oyun iki tarafa da 🌸", "Well Played! ✦"] },
  { match: /merhaba|selam|hey|hello|hi\b/i,   replies: ["Merhaba! 🌸", "Selam! ✦", "Hey! 🌸", "Nasılsın? 🌸"] },
];

// ── Rastgele seç ──────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function sendTmp(channel, text, ms = 7000) {
  try { const m = await channel.send(text); setTimeout(() => m.delete().catch(() => {}), ms); }
  catch {}
}

export async function execute(message, client) {
  if (!message.guild) return;
  if (message.author.bot) {
    // Disboard bump dedektörü (bot mesajlarını da kontrol et)
    await handleBumpMessage(message);
    return;
  }

  // ════════════════════════════════════════════════════════
  // ── AutoMod (Spam · Link · Mention)  ────────────────────
  // ════════════════════════════════════════════════════════
  const cfg = getGuildConfig(message.guild.id);
  const spamResult = checkSpam(message, cfg);

  if (spamResult) {
    const { action, reason } = spamResult;
    try { await message.delete(); } catch {}
    logAutomod(message.guild, message.author.id, message.author.tag, action, reason, message.channel);

    if (action === "delete") {
      sendTmp(message.channel, `꒰⚠️ ${message.author} mesajın kaldırıldı: **${reason}** 🌸`);
      return;
    }
    if (action === "warn") {
      addWarning(message.guild.id, message.author.id, client.user.id, `[AutoMod] ${reason}`);
      sendTmp(message.channel, `꒰⚠️ ${message.author} **Uyarıldı** — ${reason} 🌸`);
      return;
    }
    if (action === "mute") {
      try {
        await message.member.timeout(10 * 60 * 1000, `[AutoMod] ${reason}`);
        resetSpamRecord(message.guild.id, message.author.id);
        sendTmp(message.channel, `꒰🔇 ${message.author} **10 dakika susturuldu** — ${reason} 🌸`);
      } catch {}
      return;
    }
  }

  // ════════════════════════════════════════════════════════
  // ── Kelime Türetmece Oyunu Kontrolü ────────────────────
  // ════════════════════════════════════════════════════════
  const game = wordGames.get(message.guild.id);
  if (game?.active && game.channelId === message.channelId) {
    const word = message.content.trim().toLowerCase();

    // Sadece harf içeriyorsa (komut değilse)
    if (/^[a-zA-ZğüşöçıĞÜŞÖÇİ]+$/.test(word) && word.length >= 2) {
      const lastLetter = game.lastWord.at(-1);

      if (!word.startsWith(lastLetter)) {
        sendTmp(message.channel, `꒰❌ ${message.author} **"${word}"** kelimesi **"${lastLetter.toUpperCase()}"** harfiyle başlamalı! 🌸`);
      } else if (game.used.has(word)) {
        sendTmp(message.channel, `꒰❌ ${message.author} **"${word}"** daha önce kullanıldı! 🌸`);
      } else {
        game.used.add(word);
        game.lastWord = word;
        const score = (game.players.get(message.author.id) ?? 0) + 1;
        game.players.set(message.author.id, score);
        message.react("✅").catch(() => {});
        sendTmp(message.channel, `꒰✅ **${word}** — sıradaki harf: **${word.at(-1).toUpperCase()}** 🌸 (${message.author.username}: ${score}p)`);
      }
      return;
    }
  }

  // ════════════════════════════════════════════════════════
  // ── XP ──────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════
  const xpResult = awardMessageXP(message.guild.id, message.author.id);
  if (xpResult?.leveled) handleLevelUp(message, xpResult.user);

  // ════════════════════════════════════════════════════════
  // ── @Mention → AI ───────────────────────────────────────
  // ════════════════════════════════════════════════════════
  if (message.mentions.has(client.user) && !message.content.startsWith(PREFIX)) {
    const question = message.content.replace(new RegExp(`<@!?${client.user.id}>`, "g"), "").trim();
    if (question) return executeAI(message, question);
    return message.reply({
      embeds: [buildEmbed({ title: "꒰🌸 Merhaba!", description: "Bana bir şey sor! Örn: `@Aishivex Valorant'ta hangi agent iyi?` ✦", color: COLORS.pink })],
    });
  }

  // ════════════════════════════════════════════════════════
  // ── Otomatik Yanıtlar (prefix komut değilse) ────────────
  // ════════════════════════════════════════════════════════
  if (!message.content.startsWith(PREFIX)) {
    // Keyword auto-replies
    for (const rule of AUTO_REPLIES) {
      if (rule.match.test(message.content)) {
        try { await message.reply(pick(rule.replies)); } catch {}
        return;
      }
    }

    // %3 şans → rastgele emoji reaksiyon
    if (Math.random() < 0.03) {
      const emojis = ["🌸", "✦", "🎮", "💜", "🤍", "⭐", "🎵"];
      message.react(pick(emojis)).catch(() => {});
    }
    return;
  }

  // ════════════════════════════════════════════════════════
  // ── Prefix Komutları ─────────────────────────────────────
  // ════════════════════════════════════════════════════════
  const args    = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  try {
    switch (command) {
      case "ai": case "sor": case "ask": {
        const q = args.join(" ");
        if (!q) return message.reply("꒰🌸 Bir şey sor! Örn: `!ai Minecraft'ta ne yapabilirim?`");
        return executeAI(message, q);
      }
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
      case "coinflip": return executeCoinflip(message);
      case "level": case "rank": case "xp": case "seviye":
        return executeLevel(message);
      case "leaderboard": case "lb": case "siralama":
        return executeLb(message);
      case "play": case "p":
        return executePlay(message, args.join(" "));
      case "skip": case "s":  return executeSkip(message);
      case "stop":            return executeStop(message);
      case "pause":           return executePause(message);
      case "resume":          return executeResume(message);
      case "queue": case "q": return executeQueue(message);
      case "nowplaying": case "np": return executeNowplaying(message);
      case "ban":          return executeBan(message);
      case "kick":         return executeKick(message);
      case "warn":         return executeWarn(message);
      case "warnings":     return executeWarnings(message);
      case "clearwarns":   return executeClearwarns(message);
      case "mute": case "sustur":    return executeMute(message);
      case "unmute": case "unsustur":return executeUnmute(message);
      case "clear": case "temizle": return executeClear(message, args[0]);
      case "slowmode":     return executeSlowmode(message, args[0]);
      case "lock":         return executeLock(message);
      case "unlock":       return executeUnlock(message);
      case "nickname": case "nick": return executeNickname(message);
      case "purge":        return executePurge(message);
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
    if (role) try { await message.member.roles.add(role); } catch {}
  }
}

// ── Help ──────────────────────────────────────────────────
function sendHelp(message) {
  const embed = buildEmbed({
    title:       "꒰🌸 Aishivex — Tüm Komutlar",
    description: `Prefix: \`!\`  |  Slash: \`/\`  |  AI: \`@Aishivex <soru>\``,
    color:       COLORS.pink,
    fields: [
      { name: "꒰🤖 AI",          value: "`!ai` `@Aishivex`",                                                inline: false },
      { name: "꒰📊 Genel",       value: "`!ping` `!botinfo` `!serverinfo` `!userinfo` `!avatar` `!8ball` `!coinflip`", inline: false },
      { name: "꒰🏆 Seviye",      value: "`!level` `!leaderboard`",                                          inline: false },
      { name: "꒰🎵 Müzik",       value: "`!play` `!skip` `!stop` `!pause` `!resume` `!queue` `!np`",        inline: false },
      { name: "꒰🔧 Moderasyon",  value: "`!ban` `!kick` `!warn` `!mute` `!clear` `!lock` `!slowmode` `!purge`", inline: false },
      { name: "꒰🛡️ Koruma",     value: "`/automod` `/lockdown` `/unlockdown` `/raidstatus`",               inline: false },
      { name: "꒰🎮 Eğlence",     value: "`/rps` `/love` `/ship` `/dice` `/trivia` `/mock` `/reverse` `/choose` `/fact` `/rate`", inline: false },
      { name: "꒰📝 Kelime",      value: "`/kelime-baslat` — Kelime Türetmece Oyunu 🌸",                    inline: false },
      { name: "꒰🚀 Bump",        value: "`/bumpdurum` — Disboard bump durumunu gör",                       inline: false },
    ],
    timestamp: false,
  });
  return message.reply({ embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// Interaction Create — Aishivex
// Tüm slash komutları + button interactions
// ─────────────────────────────────────────────────────────────

import { buildEmbed, COLORS } from "../utils/embed.js";
import { execute as executeAI }                    from "../commands/ai.js";
import {
  executePing, executeBotinfo, executeServerinfo,
  executeUserinfo, executeAvatar, executeEightBall,
  executeCoinflip, executePoll, executeAnnounce,
}                                                  from "../commands/general.js";
import { execute as executeLevel, executeLb }      from "../commands/level.js";
import { execute as executeSetupRoles }            from "../commands/setupRoles.js";
import {
  executeBan, executeUnban, executeKick,
  executeWarn, executeWarnings, executeClearwarns,
  executeMute, executeUnmute,
  executeClear, executeSlowmode,
  executeLock, executeUnlock,
  executeNickname, executePurge,
}                                                  from "../commands/mod.js";
import {
  executePlay, executeSkip, executeStop,
  executePause, executeResume,
  executeVolume, executeNowplaying, executeQueue,
}                                                  from "../commands/music.js";
import {
  executeAutomod, executeLockdown, executeUnlockdown, executeRaidstatus,
}                                                  from "../commands/protection.js";
import {
  executeRps, executeLove, executeShip, executeMock, executeReverse,
  executeDice, executeChoose, executeTrivia, executeKelime,
  executeFact, executeRate, executeBumpdurum,
}                                                  from "../commands/fun.js";

export const name = "interactionCreate";
export const once = false;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName: cmd } = interaction;

  try {
    switch (cmd) {
      case "ai":           return executeAI(interaction, interaction.options.getString("soru"));
      case "ping":         return executePing(interaction);
      case "botinfo":      return executeBotinfo(interaction);
      case "serverinfo":   return executeServerinfo(interaction);
      case "userinfo":     return executeUserinfo(interaction);
      case "avatar":       return executeAvatar(interaction);
      case "8ball":        return executeEightBall(interaction);
      case "coinflip":     return executeCoinflip(interaction);
      case "poll":         return executePoll(interaction);
      case "announce":     return executeAnnounce(interaction);
      case "level":        return executeLevel(interaction);
      case "leaderboard":  return executeLb(interaction);
      case "setup-roles":  return executeSetupRoles(interaction);
      case "ban":          return executeBan(interaction);
      case "unban":        return executeUnban(interaction);
      case "kick":         return executeKick(interaction);
      case "warn":         return executeWarn(interaction);
      case "warnings":     return executeWarnings(interaction);
      case "clearwarns":   return executeClearwarns(interaction);
      case "mute":         return executeMute(interaction);
      case "unmute":       return executeUnmute(interaction);
      case "clear":        return executeClear(interaction);
      case "slowmode":     return executeSlowmode(interaction);
      case "lock":         return executeLock(interaction);
      case "unlock":       return executeUnlock(interaction);
      case "nickname":     return executeNickname(interaction);
      case "purge":        return executePurge(interaction);
      case "play":         return executePlay(interaction);
      case "skip":         return executeSkip(interaction);
      case "stop":         return executeStop(interaction);
      case "pause":        return executePause(interaction);
      case "resume":       return executeResume(interaction);
      case "volume":       return executeVolume(interaction);
      case "nowplaying":   return executeNowplaying(interaction);
      case "queue":        return executeQueue(interaction);
      case "automod":      return executeAutomod(interaction);
      case "lockdown":     return executeLockdown(interaction);
      case "unlockdown":   return executeUnlockdown(interaction);
      case "raidstatus":   return executeRaidstatus(interaction);
      // Fun
      case "rps":          return executeRps(interaction);
      case "love":         return executeLove(interaction);
      case "ship":         return executeShip(interaction);
      case "mock":         return executeMock(interaction);
      case "reverse":      return executeReverse(interaction);
      case "dice":         return executeDice(interaction);
      case "choose":       return executeChoose(interaction);
      case "trivia":       return executeTrivia(interaction);
      case "kelime-baslat":return executeKelime(interaction);
      case "fact":         return executeFact(interaction);
      case "rate":         return executeRate(interaction);
      case "bumpdurum":    return executeBumpdurum(interaction);
      default:
        return interaction.reply({ embeds: [buildEmbed({ title: "❓", description: "Bilinmeyen komut 🌸", color: COLORS.gray })], ephemeral: true });
    }
  } catch (err) {
    console.error(`Slash hata (${cmd}):`, err);
    const embed = buildEmbed({ title: "❌ Hata", description: "Komut çalıştırılırken bir hata oluştu 🌸", color: COLORS.red });
    try {
      if (interaction.replied || interaction.deferred) interaction.editReply({ embeds: [embed] });
      else interaction.reply({ embeds: [embed], ephemeral: true });
    } catch {}
  }
}

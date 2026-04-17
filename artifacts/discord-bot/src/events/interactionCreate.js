// ─────────────────────────────────────────────────────────────
// Interaction Create — Aishivex
// Tüm slash komutlarını yönetir
// ─────────────────────────────────────────────────────────────

import { buildEmbed, COLORS } from "../utils/embed.js";

// AI
import { execute as executeAI }                    from "../commands/ai.js";
// General
import {
  executePing, executeBotinfo, executeServerinfo,
  executeUserinfo, executeAvatar, executeEightBall,
  executeCoinflip, executePoll, executeAnnounce,
}                                                  from "../commands/general.js";
// Level
import { execute as executeLevel, executeLb }      from "../commands/level.js";
// Roles
import { execute as executeSetupRoles }            from "../commands/setupRoles.js";
// Mod
import {
  executeBan, executeUnban, executeKick,
  executeWarn, executeWarnings, executeClearwarns,
  executeMute, executeUnmute,
  executeClear, executeSlowmode,
  executeLock, executeUnlock,
  executeNickname, executePurge,
}                                                  from "../commands/mod.js";
// Music
import {
  executePlay, executeSkip, executeStop,
  executePause, executeResume,
  executeVolume, executeNowplaying, executeQueue,
}                                                  from "../commands/music.js";
// Protection
import {
  executeAutomod, executeLockdown, executeUnlockdown, executeRaidstatus,
}                                                  from "../commands/protection.js";

export const name = "interactionCreate";
export const once = false;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName: cmd } = interaction;

  try {
    switch (cmd) {
      // AI
      case "ai":           return executeAI(interaction, interaction.options.getString("soru"));

      // General
      case "ping":         return executePing(interaction);
      case "botinfo":      return executeBotinfo(interaction);
      case "serverinfo":   return executeServerinfo(interaction);
      case "userinfo":     return executeUserinfo(interaction);
      case "avatar":       return executeAvatar(interaction);
      case "8ball":        return executeEightBall(interaction);
      case "coinflip":     return executeCoinflip(interaction);
      case "poll":         return executePoll(interaction);
      case "announce":     return executeAnnounce(interaction);

      // Level
      case "level":        return executeLevel(interaction);
      case "leaderboard":  return executeLb(interaction);

      // Reaction Roles
      case "setup-roles":  return executeSetupRoles(interaction);

      // Moderation
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

      // Music
      case "play":         return executePlay(interaction);
      case "skip":         return executeSkip(interaction);
      case "stop":         return executeStop(interaction);
      case "pause":        return executePause(interaction);
      case "resume":       return executeResume(interaction);
      case "volume":       return executeVolume(interaction);
      case "nowplaying":   return executeNowplaying(interaction);
      case "queue":        return executeQueue(interaction);

      // Protection
      case "automod":      return executeAutomod(interaction);
      case "lockdown":     return executeLockdown(interaction);
      case "unlockdown":   return executeUnlockdown(interaction);
      case "raidstatus":   return executeRaidstatus(interaction);

      default:
        return interaction.reply({
          embeds: [buildEmbed({ title: "❓", description: "Bilinmeyen komut 🌸", color: COLORS.gray })],
          ephemeral: true,
        });
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

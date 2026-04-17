// ─────────────────────────────────────────────────────────────
// Interaction Create Event — Aishivex
// Tüm slash komutlarını yönetir
// ─────────────────────────────────────────────────────────────

import { buildEmbed, COLORS } from "../utils/embed.js";
import { execute as executeAI }                         from "../commands/ai.js";
import { execute as executeLevel, executeLb }           from "../commands/level.js";
import { execute as executeSetupRoles }                 from "../commands/setupRoles.js";
import {
  executePlay,
  executeSkip,
  executeStop,
  executeQueue,
}                                                       from "../commands/music.js";
import {
  executeMute,
  executeUnmute,
  executeClear,
}                                                       from "../commands/mod.js";

export const name = "interactionCreate";
export const once = false;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case "ai":          return executeAI(interaction, interaction.options.getString("soru"));
      case "level":       return executeLevel(interaction);
      case "leaderboard": return executeLb(interaction);
      case "setup-roles": return executeSetupRoles(interaction);
      case "play":        return executePlay(interaction);
      case "skip":        return executeSkip(interaction);
      case "stop":        return executeStop(interaction);
      case "queue":       return executeQueue(interaction);
      case "mute":        return executeMute(interaction);
      case "unmute":      return executeUnmute(interaction);
      case "clear":       return executeClear(interaction);
      default: {
        const embed = buildEmbed({
          title:       "❓ Bilinmeyen Komut",
          description: "Bu komutu tanımıyorum 🌸",
          color:       COLORS.gray,
        });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  } catch (err) {
    console.error(`Slash komut hatası (${commandName}):`, err);
    const embed = buildEmbed({
      title:       "❌ Hata",
      description: "Komut çalıştırılırken bir hata oluştu 🌸",
      color:       COLORS.red,
    });
    if (interaction.replied || interaction.deferred) {
      interaction.editReply({ embeds: [embed] }).catch(() => {});
    } else {
      interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
    }
  }
}

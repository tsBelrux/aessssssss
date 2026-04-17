// ─────────────────────────────────────────────────────────────
// Level Command — Aishivex
// /level — kullanıcının seviye kartını göster
// ─────────────────────────────────────────────────────────────

import { SlashCommandBuilder } from "discord.js";
import { buildEmbed, COLORS } from "../utils/embed.js";
import { getUser, xpForLevel, getLeaderboard } from "../utils/xp.js";

export const data = new SlashCommandBuilder()
  .setName("level")
  .setDescription("꒰🏆 Seviyeni ve XP'ini gör! Check your level ✦")
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Başka birinin seviyesini gör").setRequired(false)
  );

export const aliases = ["level", "rank", "xp", "seviye"];

export async function execute(ctx, _args) {
  const isInteraction = ctx.constructor.name.includes("Interaction");

  const targetUser = isInteraction
    ? (ctx.options.getUser("kullanici") ?? ctx.user)
    : ctx.mentions?.users?.first() ?? ctx.author;

  const { user } = getUser(ctx.guild.id, targetUser.id);

  const currentLevel     = user.level;
  const currentXP        = user.xp;
  const neededXP         = xpForLevel(currentLevel + 1);
  const progressPercent  = Math.round((currentXP / neededXP) * 100);
  const progressBar      = buildProgressBar(progressPercent);

  // Leaderboard sırası
  const lb    = getLeaderboard(ctx.guild.id, 100);
  const rank  = lb.findIndex((e) => e.userId === targetUser.id) + 1;

  const embed = buildEmbed({
    title:       `✦ ${targetUser.displayName}'in Profili`,
    description: `꒰🌸 **Seviye ${currentLevel}** — ${user.totalXp.toLocaleString()} toplam XP`,
    color:       COLORS.purple,
    thumbnail:   targetUser.displayAvatarURL({ dynamic: true, size: 256 }),
    fields: [
      {
        name:   "𓂃 Seviye İlerlemesi",
        value:  `${progressBar}\n\`${currentXP} / ${neededXP} XP\` — %${progressPercent}`,
        inline: false,
      },
      {
        name:   "✦ Sıralama",
        value:  rank > 0 ? `#${rank}` : "Henüz sıralamada yok",
        inline: true,
      },
      {
        name:   "🌸 Toplam XP",
        value:  user.totalXp.toLocaleString(),
        inline: true,
      },
    ],
  });

  if (isInteraction) await ctx.reply({ embeds: [embed] });
  else await ctx.reply({ embeds: [embed] });
}

// ── Progress bar oluştur / Build progress bar ──────────────
function buildProgressBar(percent, length = 12) {
  const filled = Math.round((percent / 100) * length);
  const empty  = length - filled;
  return "▓".repeat(filled) + "░".repeat(empty);
}

// ─────────────────────────────────────────────────────────────
// Leaderboard Command
// ─────────────────────────────────────────────────────────────

export const lbData = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("꒰🏅 Sunucu sıralamasını gör! Server leaderboard ✦");

export async function executeLb(ctx) {
  const isInteraction = ctx.constructor.name.includes("Interaction");
  const lb = getLeaderboard(ctx.guild.id, 10);

  if (!lb.length) {
    const embed = buildEmbed({
      title:       "꒰🏅 Leaderboard",
      description: "Henüz kimse XP kazanmadı! Sohbet etmeye başla 🌸",
      color:       COLORS.yellow,
    });
    if (isInteraction) return ctx.reply({ embeds: [embed] });
    return ctx.reply({ embeds: [embed] });
  }

  const medals = ["🥇", "🥈", "🥉"];
  const rows = lb.map((entry, i) => {
    const medal = medals[i] ?? `**#${i + 1}**`;
    return `${medal} <@${entry.userId}> — Seviye **${entry.level}** • ${entry.totalXp.toLocaleString()} XP`;
  });

  const embed = buildEmbed({
    title:       "꒰🏆 Sunucu Sıralaması",
    description: rows.join("\n"),
    color:       COLORS.yellow,
  });

  if (isInteraction) await ctx.reply({ embeds: [embed] });
  else await ctx.reply({ embeds: [embed] });
}

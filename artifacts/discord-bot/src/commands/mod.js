// ─────────────────────────────────────────────────────────────
// Moderation Commands — Aishivex
// mute, unmute, clear — sadece staff rolleri
// ─────────────────────────────────────────────────────────────

import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { buildEmbed, COLORS } from "../utils/embed.js";

// Staff rol adları
const STAFF_ROLES = ["Kurucu", "Admin", "Moderatör"];

function hasStaffRole(member) {
  return member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
         member.roles.cache.some((r) => STAFF_ROLES.includes(r.name));
}

// ─────────────────────────────────────────────────────────────
// /mute
// ─────────────────────────────────────────────────────────────
export const muteData = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("꒰🔇 Kullanıcıyı sustur (timeout) ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) => opt.setName("kullanici").setDescription("Kim susturulsun?").setRequired(true))
  .addIntegerOption((opt) =>
    opt.setName("sure").setDescription("Kaç dakika? (varsayılan: 5)").setRequired(false).setMinValue(1).setMaxValue(1440)
  )
  .addStringOption((opt) => opt.setName("sebep").setDescription("Neden?").setRequired(false));

export async function executeMute(ctx, targetArg, durationArg, reasonArg) {
  const isInteraction = ctx.constructor.name.includes("Interaction");

  if (!hasStaffRole(isInteraction ? ctx.member : ctx.member)) {
    const embed = buildEmbed({ title: "❌", description: "Bu komutu kullanmak için yetkin yok! 🌸", color: COLORS.red });
    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
  }

  const target   = isInteraction ? ctx.options.getMember("kullanici") : targetArg;
  const minutes  = isInteraction ? (ctx.options.getInteger("sure") ?? 5) : (durationArg ?? 5);
  const reason   = isInteraction ? (ctx.options.getString("sebep") ?? "Sebep belirtilmedi") : (reasonArg ?? "Sebep belirtilmedi");

  if (!target) {
    const embed = buildEmbed({ title: "❌", description: "Kullanıcı bulunamadı! 🌸", color: COLORS.red });
    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
  }

  try {
    await target.timeout(minutes * 60 * 1000, reason);

    const embed = buildEmbed({
      title:       "꒰🔇 Susturuldu",
      description: `${target} **${minutes} dakika** susturuldu.\n𓂃 Sebep: *${reason}*`,
      color:       COLORS.gray,
    });
    return isInteraction ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  } catch (err) {
    const embed = buildEmbed({ title: "❌", description: `Susturulamadı: ${err.message}`, color: COLORS.red });
    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
  }
}

// ─────────────────────────────────────────────────────────────
// /unmute
// ─────────────────────────────────────────────────────────────
export const unmuteData = new SlashCommandBuilder()
  .setName("unmute")
  .setDescription("꒰🔊 Kullanıcının susturmasını kaldır ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) => opt.setName("kullanici").setDescription("Kim serbest bırakılsın?").setRequired(true));

export async function executeUnmute(ctx, targetArg) {
  const isInteraction = ctx.constructor.name.includes("Interaction");

  if (!hasStaffRole(isInteraction ? ctx.member : ctx.member)) {
    const embed = buildEmbed({ title: "❌", description: "Bu komutu kullanmak için yetkin yok! 🌸", color: COLORS.red });
    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
  }

  const target = isInteraction ? ctx.options.getMember("kullanici") : targetArg;
  if (!target) {
    const embed = buildEmbed({ title: "❌", description: "Kullanıcı bulunamadı! 🌸", color: COLORS.red });
    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
  }

  try {
    await target.timeout(null);
    const embed = buildEmbed({
      title:       "꒰🔊 Susturma Kaldırıldı",
      description: `${target} artık konuşabilir 🌸`,
      color:       COLORS.green,
    });
    return isInteraction ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  } catch (err) {
    const embed = buildEmbed({ title: "❌", description: `İşlem yapılamadı: ${err.message}`, color: COLORS.red });
    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
  }
}

// ─────────────────────────────────────────────────────────────
// /clear
// ─────────────────────────────────────────────────────────────
export const clearData = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("꒰🧹 Kanalı temizle! Clear messages ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption((opt) =>
    opt.setName("adet").setDescription("Kaç mesaj silinsin? (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)
  );

export async function executeClear(ctx, amountArg) {
  const isInteraction = ctx.constructor.name.includes("Interaction");

  if (!hasStaffRole(isInteraction ? ctx.member : ctx.member)) {
    const embed = buildEmbed({ title: "❌", description: "Bu komutu kullanmak için yetkin yok! 🌸", color: COLORS.red });
    return isInteraction ? ctx.reply({ embeds: [embed], ephemeral: true }) : ctx.reply({ embeds: [embed] });
  }

  const amount  = isInteraction ? ctx.options.getInteger("adet") : (parseInt(amountArg) || 10);
  const channel = isInteraction ? ctx.channel : ctx.channel;

  if (isInteraction) await ctx.deferReply({ ephemeral: true });

  try {
    const deleted = await channel.bulkDelete(amount, true);
    const embed = buildEmbed({
      title:       "꒰🧹 Temizlendi",
      description: `**${deleted.size}** mesaj silindi 🌸`,
      color:       COLORS.green,
    });
    if (isInteraction) await ctx.editReply({ embeds: [embed] });
    else {
      const reply = await ctx.reply({ embeds: [embed] });
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    }
  } catch (err) {
    const embed = buildEmbed({ title: "❌", description: `Mesajlar silinemedi: ${err.message}`, color: COLORS.red });
    if (isInteraction) await ctx.editReply({ embeds: [embed] });
    else ctx.reply({ embeds: [embed] });
  }
}

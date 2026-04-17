// ─────────────────────────────────────────────────────────────
// Full Moderation Commands — Aishivex
// ban, unban, kick, warn, warnings, clearwarns,
// mute, unmute, clear, slowmode, lock, unlock, nickname, purge
// ─────────────────────────────────────────────────────────────

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { buildEmbed, COLORS } from "../utils/embed.js";
import { addWarning, getWarnings, clearWarnings } from "../utils/warnings.js";

const STAFF_ROLES = ["Kurucu", "Admin", "Moderatör"];

// ── Yetki kontrolü ─────────────────────────────────────────
function hasStaff(member) {
  return (
    member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
    member.roles.cache.some((r) => STAFF_ROLES.includes(r.name))
  );
}
function hasAdmin(member) {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.roles.cache.some((r) => ["Kurucu", "Admin"].includes(r.name))
  );
}

function isI(ctx)   { return ctx.constructor.name.includes("Interaction"); }
function iMember(ctx) { return isI(ctx) ? ctx.member : ctx.member; }

async function safeReply(ctx, opts) {
  try {
    if (isI(ctx)) {
      if (ctx.replied || ctx.deferred) return ctx.editReply(opts);
      return ctx.reply(opts);
    }
    return ctx.reply(opts);
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// /ban
// ─────────────────────────────────────────────────────────────
export const banData = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("꒰🔨 Kullanıcıyı banla ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((o) => o.setName("kullanici").setDescription("Kim banlanacak?").setRequired(true))
  .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
  .addIntegerOption((o) => o.setName("mesaj_sil").setDescription("Kaç günlük mesajı silinsin? (0-7)").setMinValue(0).setMaxValue(7).setRequired(false));

export async function executeBan(ctx) {
  if (!hasAdmin(iMember(ctx))) return safeReply(ctx, { content: "❌ Bu komut için Admin yetkisi gerekli.", ephemeral: true });

  const target = isI(ctx) ? ctx.options.getUser("kullanici") : ctx.mentions.users?.first();
  const reason = isI(ctx) ? (ctx.options.getString("sebep") ?? "Sebep belirtilmedi") : "Sebep belirtilmedi";
  const days   = isI(ctx) ? (ctx.options.getInteger("mesaj_sil") ?? 0) : 0;

  if (!target) return safeReply(ctx, { content: "❌ Kullanıcı belirt!", ephemeral: true });

  try {
    await ctx.guild.members.ban(target, { reason, deleteMessageDays: days });
    const embed = buildEmbed({
      title:       "꒰🔨 Yasaklandı",
      description: `**${target.tag}** sunucudan yasaklandı.\n𓂃 Sebep: *${reason}*`,
      color:       COLORS.red,
    });
    safeReply(ctx, { embeds: [embed] });
  } catch (err) {
    safeReply(ctx, { content: `❌ Ban uygulanamadı: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /unban
// ─────────────────────────────────────────────────────────────
export const unbanData = new SlashCommandBuilder()
  .setName("unban")
  .setDescription("꒰✅ Ban kaldır ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addStringOption((o) => o.setName("kullanici_id").setDescription("Kullanıcı ID'si").setRequired(true));

export async function executeUnban(ctx) {
  if (!hasAdmin(iMember(ctx))) return safeReply(ctx, { content: "❌ Bu komut için Admin yetkisi gerekli.", ephemeral: true });

  const userId = isI(ctx) ? ctx.options.getString("kullanici_id") : ctx.args?.[0];
  if (!userId) return safeReply(ctx, { content: "❌ Kullanıcı ID'si gir!", ephemeral: true });

  try {
    const user = await ctx.client.users.fetch(userId);
    await ctx.guild.members.unban(userId);
    const embed = buildEmbed({
      title:       "꒰✅ Ban Kaldırıldı",
      description: `**${user.tag}** tekrar sunucuya girebilir 🌸`,
      color:       COLORS.green,
    });
    safeReply(ctx, { embeds: [embed] });
  } catch (err) {
    safeReply(ctx, { content: `❌ Unban uygulanamadı: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /kick
// ─────────────────────────────────────────────────────────────
export const kickData = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("꒰👢 Kullanıcıyı at ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((o) => o.setName("kullanici").setDescription("Kim atılacak?").setRequired(true))
  .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false));

export async function executeKick(ctx) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Bu komut için Moderatör yetkisi gerekli.", ephemeral: true });

  const target = isI(ctx) ? ctx.options.getMember("kullanici") : ctx.mentions.members?.first();
  const reason = isI(ctx) ? (ctx.options.getString("sebep") ?? "Sebep belirtilmedi") : "Sebep belirtilmedi";

  if (!target) return safeReply(ctx, { content: "❌ Kullanıcı belirt!", ephemeral: true });

  try {
    await target.kick(reason);
    const embed = buildEmbed({
      title:       "꒰👢 Atıldı",
      description: `**${target.user.tag}** sunucudan atıldı.\n𓂃 Sebep: *${reason}*`,
      color:       COLORS.red,
    });
    safeReply(ctx, { embeds: [embed] });
  } catch (err) {
    safeReply(ctx, { content: `❌ Kick uygulanamadı: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /warn
// ─────────────────────────────────────────────────────────────
export const warnData = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("꒰⚠️ Kullanıcıyı uyar ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((o) => o.setName("kullanici").setDescription("Uyarılacak kişi").setRequired(true))
  .addStringOption((o) => o.setName("sebep").setDescription("Uyarı sebebi").setRequired(true));

export async function executeWarn(ctx) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Bu komut için Moderatör yetkisi gerekli.", ephemeral: true });

  const target  = isI(ctx) ? ctx.options.getMember("kullanici") : ctx.mentions.members?.first();
  const reason  = isI(ctx) ? ctx.options.getString("sebep") : "Sebep belirtilmedi";
  const modId   = isI(ctx) ? ctx.user.id : ctx.author.id;

  if (!target) return safeReply(ctx, { content: "❌ Kullanıcı belirt!", ephemeral: true });
  if (target.id === ctx.guild.members.me?.id) return safeReply(ctx, { content: "❌ Beni uyaramazsın 🌸", ephemeral: true });

  const { warn, total } = addWarning(ctx.guild.id, target.id, modId, reason);

  const embed = buildEmbed({
    title:       `꒰⚠️ Uyarıldı — ${total}. Uyarı`,
    description: `${target} uyarıldı!\n𓂃 Sebep: *${reason}*`,
    color:       COLORS.yellow,
    fields: [
      { name: "📊 Toplam Uyarı", value: `${total}/3`, inline: true },
      { name: "🆔 Uyarı ID",    value: `\`${warn.id}\``, inline: true },
    ],
  });

  safeReply(ctx, { embeds: [embed] });

  // 3 uyarıda otomatik 30 dakika mute
  if (total >= 3) {
    try {
      await target.timeout(30 * 60 * 1000, "3 uyarı sınırına ulaşıldı — otomatik mute");
      ctx.channel?.send(`꒰⚠️ ${target} 3 uyarıya ulaştığı için **30 dakika** susturuldu! 🌸`).catch(() => {});
    } catch {}
  }
}

// ─────────────────────────────────────────────────────────────
// /warnings
// ─────────────────────────────────────────────────────────────
export const warningsData = new SlashCommandBuilder()
  .setName("warnings")
  .setDescription("꒰📋 Kullanıcı uyarılarını gör ✦")
  .addUserOption((o) => o.setName("kullanici").setDescription("Kimin uyarıları?").setRequired(true));

export async function executeWarnings(ctx) {
  const target = isI(ctx) ? ctx.options.getMember("kullanici") : ctx.mentions.members?.first();
  if (!target) return safeReply(ctx, { content: "❌ Kullanıcı belirt!", ephemeral: true });

  const warns = getWarnings(ctx.guild.id, target.id);

  if (!warns.length) {
    return safeReply(ctx, {
      embeds: [buildEmbed({ title: "꒰📋 Uyarılar", description: `${target} temiz! Hiç uyarısı yok 🌸`, color: COLORS.green })],
    });
  }

  const rows = warns.map((w, i) => {
    const date = new Date(w.timestamp);
    return `\`#${i + 1}\` — *${w.reason}* — <t:${Math.floor(date.getTime() / 1000)}:R>`;
  });

  const embed = buildEmbed({
    title:       `꒰⚠️ ${target.user.username} — ${warns.length} Uyarı`,
    description: rows.join("\n"),
    color:       COLORS.yellow,
  });
  safeReply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /clearwarns
// ─────────────────────────────────────────────────────────────
export const clearwarnsData = new SlashCommandBuilder()
  .setName("clearwarns")
  .setDescription("꒰🧹 Uyarıları temizle ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((o) => o.setName("kullanici").setDescription("Kimin uyarıları temizlensin?").setRequired(true));

export async function executeClearwarns(ctx) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Yetki yok!", ephemeral: true });
  const target = isI(ctx) ? ctx.options.getMember("kullanici") : ctx.mentions.members?.first();
  if (!target) return safeReply(ctx, { content: "❌ Kullanıcı belirt!", ephemeral: true });

  const count = clearWarnings(ctx.guild.id, target.id);
  const embed = buildEmbed({
    title:       "꒰🧹 Uyarılar Temizlendi",
    description: `${target} kullanıcısının **${count}** uyarısı silindi 🌸`,
    color:       COLORS.green,
  });
  safeReply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /mute (timeout)
// ─────────────────────────────────────────────────────────────
export const muteData = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("꒰🔇 Kullanıcıyı sustur (timeout) ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((o) => o.setName("kullanici").setDescription("Kim susturulsun?").setRequired(true))
  .addIntegerOption((o) => o.setName("sure").setDescription("Kaç dakika? (varsayılan 5)").setMinValue(1).setMaxValue(40320).setRequired(false))
  .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false));

export async function executeMute(ctx) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Yetki yok!", ephemeral: true });

  const target  = isI(ctx) ? ctx.options.getMember("kullanici") : ctx.mentions.members?.first();
  const minutes = isI(ctx) ? (ctx.options.getInteger("sure") ?? 5) : 5;
  const reason  = isI(ctx) ? (ctx.options.getString("sebep") ?? "Sebep belirtilmedi") : "Sebep belirtilmedi";

  if (!target) return safeReply(ctx, { content: "❌ Kullanıcı belirt!", ephemeral: true });

  try {
    await target.timeout(minutes * 60 * 1000, reason);
    const embed = buildEmbed({
      title:       "꒰🔇 Susturuldu",
      description: `${target} **${minutes} dakika** susturuldu.\n𓂃 Sebep: *${reason}*`,
      color:       COLORS.gray,
    });
    safeReply(ctx, { embeds: [embed] });
  } catch (err) {
    safeReply(ctx, { content: `❌ Susturulamadı: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /unmute
// ─────────────────────────────────────────────────────────────
export const unmuteData = new SlashCommandBuilder()
  .setName("unmute")
  .setDescription("꒰🔊 Susturmayı kaldır ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((o) => o.setName("kullanici").setDescription("Kim serbest bırakılsın?").setRequired(true));

export async function executeUnmute(ctx) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Yetki yok!", ephemeral: true });
  const target = isI(ctx) ? ctx.options.getMember("kullanici") : ctx.mentions.members?.first();
  if (!target) return safeReply(ctx, { content: "❌ Kullanıcı belirt!", ephemeral: true });

  try {
    await target.timeout(null);
    safeReply(ctx, { embeds: [buildEmbed({ title: "꒰🔊 Susturma Kaldırıldı", description: `${target} artık konuşabilir 🌸`, color: COLORS.green })] });
  } catch (err) {
    safeReply(ctx, { content: `❌ İşlem yapılamadı: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /clear
// ─────────────────────────────────────────────────────────────
export const clearData = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("꒰🧹 Mesajları sil ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption((o) => o.setName("adet").setDescription("Kaç mesaj? (1-100)").setMinValue(1).setMaxValue(100).setRequired(true));

export async function executeClear(ctx, amountArg) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Yetki yok!", ephemeral: true });

  const amount  = isI(ctx) ? ctx.options.getInteger("adet") : (parseInt(amountArg) || 10);
  if (isI(ctx)) await ctx.deferReply({ ephemeral: true });

  try {
    const deleted = await ctx.channel.bulkDelete(amount, true);
    const embed   = buildEmbed({ title: "꒰🧹 Temizlendi", description: `**${deleted.size}** mesaj silindi 🌸`, color: COLORS.green });
    if (isI(ctx)) ctx.editReply({ embeds: [embed] });
    else {
      const m = await ctx.reply({ embeds: [embed] });
      setTimeout(() => m.delete().catch(() => {}), 5000);
    }
  } catch (err) {
    safeReply(ctx, { content: `❌ Silinemedi: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /slowmode
// ─────────────────────────────────────────────────────────────
export const slowmodeData = new SlashCommandBuilder()
  .setName("slowmode")
  .setDescription("꒰🐢 Kanal yavaş modunu ayarla ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addIntegerOption((o) => o.setName("saniye").setDescription("Kaç saniye? (0 = kapat)").setMinValue(0).setMaxValue(21600).setRequired(true));

export async function executeSlowmode(ctx, secsArg) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Yetki yok!", ephemeral: true });
  const secs = isI(ctx) ? ctx.options.getInteger("saniye") : (parseInt(secsArg) || 0);

  try {
    await ctx.channel.setRateLimitPerUser(secs);
    const text  = secs === 0 ? "Yavaş mod kapatıldı 🌸" : `Yavaş mod **${secs} saniye** olarak ayarlandı 🌸`;
    safeReply(ctx, { embeds: [buildEmbed({ title: "꒰🐢 Yavaş Mod", description: text, color: COLORS.blue })] });
  } catch (err) {
    safeReply(ctx, { content: `❌ Ayarlanamadı: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /lock
// ─────────────────────────────────────────────────────────────
export const lockData = new SlashCommandBuilder()
  .setName("lock")
  .setDescription("꒰🔒 Kanalı kilitle ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function executeLock(ctx) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Yetki yok!", ephemeral: true });
  try {
    await ctx.channel.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: false });
    safeReply(ctx, { embeds: [buildEmbed({ title: "꒰🔒 Kanal Kilitlendi", description: "Artık kimse mesaj gönderemiyor 🔒", color: COLORS.red })] });
  } catch (err) {
    safeReply(ctx, { content: `❌ Kilitlenemedi: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /unlock
// ─────────────────────────────────────────────────────────────
export const unlockData = new SlashCommandBuilder()
  .setName("unlock")
  .setDescription("꒰🔓 Kanalı aç ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function executeUnlock(ctx) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Yetki yok!", ephemeral: true });
  try {
    await ctx.channel.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: null });
    safeReply(ctx, { embeds: [buildEmbed({ title: "꒰🔓 Kanal Açıldı", description: "Herkes tekrar mesaj gönderebilir 🌸", color: COLORS.green })] });
  } catch (err) {
    safeReply(ctx, { content: `❌ Açılamadı: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /nickname
// ─────────────────────────────────────────────────────────────
export const nicknameData = new SlashCommandBuilder()
  .setName("nickname")
  .setDescription("꒰✏️ Kullanıcı lakabını değiştir ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
  .addUserOption((o) => o.setName("kullanici").setDescription("Kimin lakabı değişsin?").setRequired(true))
  .addStringOption((o) => o.setName("isim").setDescription("Yeni lakap (boş bırak = sıfırla)").setRequired(false));

export async function executeNickname(ctx) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Yetki yok!", ephemeral: true });
  const target = isI(ctx) ? ctx.options.getMember("kullanici") : ctx.mentions.members?.first();
  const nick   = isI(ctx) ? (ctx.options.getString("isim") ?? null) : null;
  if (!target) return safeReply(ctx, { content: "❌ Kullanıcı belirt!", ephemeral: true });

  try {
    await target.setNickname(nick);
    const text = nick ? `${target}'in lakabı **${nick}** olarak değiştirildi 🌸` : `${target}'in lakabı sıfırlandı 🌸`;
    safeReply(ctx, { embeds: [buildEmbed({ title: "꒰✏️ Lakap Değiştirildi", description: text, color: COLORS.blue })] });
  } catch (err) {
    safeReply(ctx, { content: `❌ Değiştirilemedi: ${err.message}`, ephemeral: true });
  }
}

// ─────────────────────────────────────────────────────────────
// /purge — belirli kullanıcının mesajlarını sil
// ─────────────────────────────────────────────────────────────
export const purgeData = new SlashCommandBuilder()
  .setName("purge")
  .setDescription("꒰🗑️ Belirli kullanıcının mesajlarını sil ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addUserOption((o) => o.setName("kullanici").setDescription("Kimin mesajları silinsin?").setRequired(true))
  .addIntegerOption((o) => o.setName("adet").setDescription("Kaç mesaj aransın? (1-100)").setMinValue(1).setMaxValue(100).setRequired(false));

export async function executePurge(ctx) {
  if (!hasStaff(iMember(ctx))) return safeReply(ctx, { content: "❌ Yetki yok!", ephemeral: true });
  if (isI(ctx)) await ctx.deferReply({ ephemeral: true });

  const target = isI(ctx) ? ctx.options.getUser("kullanici") : ctx.mentions.users?.first();
  const search = isI(ctx) ? (ctx.options.getInteger("adet") ?? 50) : 50;

  if (!target) return safeReply(ctx, { content: "❌ Kullanıcı belirt!", ephemeral: true });

  try {
    const messages = await ctx.channel.messages.fetch({ limit: search });
    const toDelete = messages.filter((m) => m.author.id === target.id && Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
    await ctx.channel.bulkDelete(toDelete, true);

    const embed = buildEmbed({ title: "꒰🗑️ Temizlendi", description: `${target.tag}'nin **${toDelete.size}** mesajı silindi 🌸`, color: COLORS.green });
    if (isI(ctx)) ctx.editReply({ embeds: [embed] });
    else ctx.reply({ embeds: [embed] });
  } catch (err) {
    safeReply(ctx, { content: `❌ Silinemedi: ${err.message}`, ephemeral: true });
  }
}

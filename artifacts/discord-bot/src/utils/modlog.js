// ═══════════════════════════════════════════════════════════════
// Mod Log Utility — Aishivex
// Sunucuda olan her şeyi log kanalına gönderir
// ═══════════════════════════════════════════════════════════════

import { EmbedBuilder }   from "discord.js";
import { getGuildConfig } from "./automod.js";

// Renk sabitleri
const C = {
  red:    0xe74c3c,
  orange: 0xe67e22,
  blue:   0x5865f2,
  green:  0x57f287,
  yellow: 0xfee75c,
  gray:   0x95a5a6,
  pink:   0xff99cc,
  purple: 0xcc99ff,
};

// ── Log gönder ─────────────────────────────────────────────
export async function modlog(guild, { title, description, color = C.gray, fields = [], footer }) {
  const cfg = getGuildConfig(guild.id);
  const channelId = cfg.logChannelId;
  if (!channelId) return;

  try {
    const ch = guild.channels.cache.get(channelId)
      ?? await guild.channels.fetch(channelId).catch(() => null);
    if (!ch?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description ?? null)
      .setColor(color)
      .setTimestamp();

    if (fields.length) embed.addFields(fields);
    if (footer) embed.setFooter({ text: footer });

    await ch.send({ embeds: [embed] });
  } catch {}
}

// ═══════════════════════════════════════════════════════════
// Hazır log fonksiyonları
// ═══════════════════════════════════════════════════════════

export function logMessageDelete(message) {
  if (!message.guild || message.author?.bot) return;
  return modlog(message.guild, {
    title:       "꒰🗑️ Mesaj Silindi",
    description: message.content ? `\`\`\`${message.content.slice(0, 1000)}\`\`\`` : "*Mesaj içeriği yok (medya/embed)*",
    color:       C.red,
    fields: [
      { name: "👤 Kullanıcı",  value: `${message.author?.tag ?? "Bilinmiyor"} (${message.author?.id ?? "?"})`, inline: true },
      { name: "📌 Kanal",      value: `<#${message.channelId}>`, inline: true },
    ],
    footer: `Mesaj ID: ${message.id}`,
  });
}

export function logMessageUpdate(oldMsg, newMsg) {
  if (!newMsg.guild || newMsg.author?.bot) return;
  if (oldMsg.content === newMsg.content) return;
  return modlog(newMsg.guild, {
    title:       "꒰✏️ Mesaj Düzenlendi",
    color:       C.orange,
    fields: [
      { name: "👤 Kullanıcı",   value: `${newMsg.author?.tag} (${newMsg.author?.id})`, inline: true },
      { name: "📌 Kanal",       value: `<#${newMsg.channelId}>`, inline: true },
      { name: "🔗 Mesaja Git",  value: `[Tıkla](${newMsg.url})`, inline: true },
      { name: "📝 Önce",        value: `\`\`\`${(oldMsg.content || "*yok*").slice(0, 500)}\`\`\``, inline: false },
      { name: "📝 Sonra",       value: `\`\`\`${(newMsg.content || "*yok*").slice(0, 500)}\`\`\``, inline: false },
    ],
  });
}

export function logMemberJoin(member) {
  const accAge = Math.floor((Date.now() - member.user.createdTimestamp) / 86400000);
  return modlog(member.guild, {
    title:       "꒰📥 Üye Katıldı",
    color:       C.green,
    fields: [
      { name: "👤 Kullanıcı",    value: `${member.user.tag} (${member.id})`, inline: true },
      { name: "📅 Hesap Yaşı",  value: `${accAge} gün`, inline: true },
      { name: "👥 Toplam Üye",  value: `${member.guild.memberCount}`, inline: true },
    ],
    footer: `ID: ${member.id}`,
  });
}

export function logMemberLeave(member) {
  const roles = member.roles.cache
    .filter((r) => r.name !== "@everyone")
    .map((r) => r.name).join(", ") || "Yok";
  return modlog(member.guild, {
    title:       "꒰📤 Üye Ayrıldı",
    color:       C.orange,
    fields: [
      { name: "👤 Kullanıcı",  value: `${member.user.tag} (${member.id})`, inline: true },
      { name: "📅 Katılma",    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
      { name: "🎭 Roller",     value: roles.slice(0, 200), inline: false },
    ],
    footer: `ID: ${member.id}`,
  });
}

export function logBanAdd(ban) {
  return modlog(ban.guild, {
    title:       "꒰🔨 Kullanıcı Banlandı",
    color:       C.red,
    fields: [
      { name: "👤 Kullanıcı",  value: `${ban.user.tag} (${ban.user.id})`, inline: true },
      { name: "📋 Sebep",      value: ban.reason ?? "Belirtilmedi", inline: true },
    ],
    footer: `ID: ${ban.user.id}`,
  });
}

export function logBanRemove(ban) {
  return modlog(ban.guild, {
    title:       "꒰✅ Ban Kaldırıldı",
    color:       C.green,
    fields: [
      { name: "👤 Kullanıcı",  value: `${ban.user.tag} (${ban.user.id})`, inline: true },
    ],
    footer: `ID: ${ban.user.id}`,
  });
}

export function logTimeout(member, durationMs, reason, moderator) {
  return modlog(member.guild, {
    title:       "꒰🔇 Kullanıcı Susturuldu (Timeout)",
    color:       C.yellow,
    fields: [
      { name: "👤 Kullanıcı",   value: `${member.user.tag} (${member.id})`, inline: true },
      { name: "⏱️ Süre",        value: `${Math.round(durationMs / 60000)} dakika`, inline: true },
      { name: "👮 Moderatör",   value: moderator ?? "Bilinmiyor", inline: true },
      { name: "📋 Sebep",       value: reason ?? "Belirtilmedi", inline: false },
    ],
  });
}

export function logChannelLock(channel, locked, moderator) {
  return modlog(channel.guild, {
    title:       locked ? "꒰🔒 Kanal Kilitlendi" : "꒰🔓 Kanal Açıldı",
    color:       locked ? C.red : C.green,
    fields: [
      { name: "📌 Kanal",     value: `<#${channel.id}>`, inline: true },
      { name: "👮 Moderatör",  value: moderator ?? "Bilinmiyor", inline: true },
    ],
  });
}

export function logAutomod(guild, userId, userTag, action, reason, channel) {
  return modlog(guild, {
    title:       `꒰🛡️ AutoMod → ${action.toUpperCase()}`,
    color:       action === "mute" ? C.red : C.yellow,
    fields: [
      { name: "👤 Kullanıcı",  value: `${userTag} (${userId})`, inline: true },
      { name: "📌 Kanal",      value: `<#${channel.id}>`, inline: true },
      { name: "⚡ Eylem",      value: action, inline: true },
      { name: "📋 Sebep",      value: reason, inline: false },
    ],
  });
}

export function logVoiceMove(oldState, newState) {
  if (!newState.guild) return;
  const member = newState.member;
  if (member?.user?.bot) return;

  let title, color, fields;

  if (!oldState.channelId && newState.channelId) {
    title = "꒰🎙️ Ses Kanalına Girdi";
    color = C.green;
    fields = [
      { name: "👤 Kullanıcı", value: `${member.user.tag}`, inline: true },
      { name: "📢 Kanal",     value: `<#${newState.channelId}>`, inline: true },
    ];
  } else if (oldState.channelId && !newState.channelId) {
    title = "꒰🎙️ Ses Kanalından Çıktı";
    color = C.orange;
    fields = [
      { name: "👤 Kullanıcı", value: `${member.user.tag}`, inline: true },
      { name: "📢 Kanal",     value: `<#${oldState.channelId}>`, inline: true },
    ];
  } else if (oldState.channelId !== newState.channelId) {
    title = "꒰🎙️ Ses Kanalı Değiştirdi";
    color = C.blue;
    fields = [
      { name: "👤 Kullanıcı", value: `${member.user.tag}`, inline: true },
      { name: "📢 Önceki",    value: `<#${oldState.channelId}>`, inline: true },
      { name: "📢 Yeni",      value: `<#${newState.channelId}>`, inline: true },
    ];
  } else return;

  return modlog(newState.guild, { title, color, fields });
}

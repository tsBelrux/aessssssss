// ═══════════════════════════════════════════════════════════════
// Protection Commands — Aishivex
// /automod · /lockdown · /unlockdown · /antiraid · /raidstatus
// ═══════════════════════════════════════════════════════════════

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { buildEmbed, COLORS } from "../utils/embed.js";
import { getGuildConfig, setGuildConfig, clearRaidState, isRaidActive } from "../utils/automod.js";

function isI(ctx)  { return ctx.constructor.name.includes("Interaction"); }
async function safeReply(ctx, opts) {
  try {
    if (isI(ctx)) { if (ctx.replied || ctx.deferred) return ctx.editReply(opts); return ctx.reply(opts); }
    return ctx.reply(opts);
  } catch {}
}
function hasAdmin(member) { return member.permissions.has(PermissionFlagsBits.Administrator); }
function hasMod(member)   { return member.permissions.has(PermissionFlagsBits.ModerateMembers); }

// ─────────────────────────────────────────────────────────────
// /automod  — automod ayarları
// ─────────────────────────────────────────────────────────────
export const automodData = new SlashCommandBuilder()
  .setName("automod")
  .setDescription("꒰🛡️ AutoMod ayarlarını yönet ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((sub) =>
    sub.setName("status").setDescription("꒰📊 Mevcut ayarları gör")
  )
  .addSubcommand((sub) =>
    sub
      .setName("set")
      .setDescription("꒰⚙️ Bir özelliği aç/kapat")
      .addStringOption((o) =>
        o
          .setName("ozellik")
          .setDescription("Hangi özellik?")
          .setRequired(true)
          .addChoices(
            { name: "🛡️ Anti-Spam",        value: "antiSpam"       },
            { name: "🚨 Anti-Raid",         value: "antiRaid"       },
            { name: "🔗 Invite Filtresi",   value: "inviteFilter"   },
            { name: "📢 Mention Filtresi",  value: "mentionFilter"  },
            { name: "🔤 Caps Filtresi",     value: "capsFilter"     },
            { name: "🌐 Link Filtresi",     value: "linkFilter"     },
            { name: "🛑 Tüm Koruma",        value: "enabled"        },
            { name: "⚡ Raid→Hesap Kickle", value: "kickNewAccounts"},
          )
      )
      .addStringOption((o) =>
        o
          .setName("deger")
          .setDescription("Açık mı kapalı mı?")
          .setRequired(true)
          .addChoices({ name: "✅ Açık", value: "true" }, { name: "❌ Kapalı", value: "false" })
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("logkanal")
      .setDescription("꒰📋 AutoMod log kanalını ayarla")
      .addChannelOption((o) =>
        o.setName("kanal").setDescription("Log kanalı").setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("modkanal")
      .setDescription("꒰🔧 Mod bildirim kanalını ayarla")
      .addChannelOption((o) =>
        o.setName("kanal").setDescription("Mod kanalı").setRequired(true)
      )
  );

export async function executeAutomod(ctx) {
  if (!hasAdmin(ctx.member)) return safeReply(ctx, { content: "❌ Administrator yetkisi gerekli.", ephemeral: true });

  const sub  = ctx.options.getSubcommand();
  const gId  = ctx.guild.id;
  const cfg  = getGuildConfig(gId);

  if (sub === "status") {
    const toggles = [
      ["🛡️ Anti-Spam",        cfg.antiSpam],
      ["🚨 Anti-Raid",         cfg.antiRaid],
      ["🔗 Invite Filtresi",   cfg.inviteFilter],
      ["📢 Mention Filtresi",  cfg.mentionFilter],
      ["🔤 Caps Filtresi",     cfg.capsFilter],
      ["🌐 Link Filtresi",     cfg.linkFilter],
      ["⚡ Yeni Hesap Kick",   cfg.kickNewAccounts],
    ];

    const rows = toggles.map(([name, val]) => `${val ? "🟢" : "🔴"} **${name}**`).join("\n");
    const embed = buildEmbed({
      title:       "꒰🛡️ AutoMod Durumu",
      description: `Genel Koruma: ${cfg.enabled ? "**🟢 Açık**" : "**🔴 Kapalı**"}\n\n${rows}`,
      color:       cfg.enabled ? COLORS.green : COLORS.red,
      fields: [
        { name: "📊 Spam Eşiği",      value: `${cfg.spamThreshold} mesaj/5s`,      inline: true },
        { name: "🚨 Raid Eşiği",      value: `${cfg.raidThreshold} katılım/20s`,   inline: true },
        { name: "🔞 Min. Hesap Yaşı", value: `${cfg.minAccountAge} gün`,            inline: true },
        { name: "📋 Log Kanalı",      value: cfg.logChannelId  ? `<#${cfg.logChannelId}>`  : "Ayarlanmadı", inline: true },
        { name: "🔧 Mod Kanalı",      value: cfg.modChannelId  ? `<#${cfg.modChannelId}>`  : "Ayarlanmadı", inline: true },
      ],
    });
    return safeReply(ctx, { embeds: [embed] });
  }

  if (sub === "set") {
    const feature = ctx.options.getString("ozellik");
    const value   = ctx.options.getString("deger") === "true";
    setGuildConfig(gId, { [feature]: value });

    const embed = buildEmbed({
      title:       "꒰⚙️ AutoMod Güncellendi",
      description: `**${feature}** → ${value ? "🟢 Açık" : "🔴 Kapalı"} 🌸`,
      color:       value ? COLORS.green : COLORS.red,
    });
    return safeReply(ctx, { embeds: [embed] });
  }

  if (sub === "logkanal" || sub === "modkanal") {
    const ch    = ctx.options.getChannel("kanal");
    const field = sub === "logkanal" ? "logChannelId" : "modChannelId";
    if (ch.type !== ChannelType.GuildText) return safeReply(ctx, { content: "❌ Metin kanalı seç!", ephemeral: true });
    setGuildConfig(gId, { [field]: ch.id });

    const embed = buildEmbed({
      title:       `꒰📋 ${sub === "logkanal" ? "Log" : "Mod"} Kanalı Ayarlandı`,
      description: `${ch} kanalı seçildi 🌸`,
      color:       COLORS.blue,
    });
    return safeReply(ctx, { embeds: [embed] });
  }
}

// ─────────────────────────────────────────────────────────────
// /lockdown — acil sunucu kilitleme
// ─────────────────────────────────────────────────────────────
export const lockdownData = new SlashCommandBuilder()
  .setName("lockdown")
  .setDescription("꒰🔴 ACİL DURUM: Tüm kanalları kilitle ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((o) =>
    o.setName("sebep").setDescription("Lockdown sebebi").setRequired(false)
  );

export async function executeLockdown(ctx) {
  if (!hasAdmin(ctx.member)) return safeReply(ctx, { content: "❌ Administrator yetkisi gerekli.", ephemeral: true });

  if (isI(ctx)) await ctx.deferReply();
  const reason = isI(ctx) ? (ctx.options.getString("sebep") ?? "Belirtilmedi") : "Belirtilmedi";

  const channels = ctx.guild.channels.cache.filter((c) => c.type === ChannelType.GuildText);
  let locked = 0;

  for (const [, ch] of channels) {
    try {
      await ch.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: false });
      locked++;
    } catch {}
  }

  const embed = buildEmbed({
    title:       "꒰🔴 SUNUCU KİLİTLENDİ",
    description: [
      `**${locked}** metin kanalı kilitlendi!`,
      `𓂃 Sebep: *${reason}*`,
      "",
      `꒰⚠️ Raid veya başka bir tehdit mi var?`,
      `Durumu çözünce \`/unlockdown\` komutunu kullan.`,
    ].join("\n"),
    color: COLORS.red,
  });

  if (isI(ctx)) ctx.editReply({ embeds: [embed] });
  else ctx.reply({ embeds: [embed] });

  // Mod kanalına bildir
  const cfg = getGuildConfig(ctx.guild.id);
  notifyMod(ctx.guild, cfg, embed);
}

// ─────────────────────────────────────────────────────────────
// /unlockdown
// ─────────────────────────────────────────────────────────────
export const unlockdownData = new SlashCommandBuilder()
  .setName("unlockdown")
  .setDescription("꒰🟢 Sunucu kilidini aç ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function executeUnlockdown(ctx) {
  if (!hasAdmin(ctx.member)) return safeReply(ctx, { content: "❌ Administrator yetkisi gerekli.", ephemeral: true });
  if (isI(ctx)) await ctx.deferReply();

  const channels = ctx.guild.channels.cache.filter((c) => c.type === ChannelType.GuildText);
  let unlocked = 0;

  for (const [, ch] of channels) {
    try {
      await ch.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: null });
      unlocked++;
    } catch {}
  }

  // Raid durumunu sıfırla
  clearRaidState(ctx.guild.id);

  const embed = buildEmbed({
    title:       "꒰🟢 Kilit Açıldı",
    description: `**${unlocked}** metin kanalı yeniden açıldı 🌸\nRaid durumu sıfırlandı ✦`,
    color:       COLORS.green,
  });

  if (isI(ctx)) ctx.editReply({ embeds: [embed] });
  else ctx.reply({ embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /raidstatus — raid durumunu gör
// ─────────────────────────────────────────────────────────────
export const raidstatusData = new SlashCommandBuilder()
  .setName("raidstatus")
  .setDescription("꒰🚨 Anti-Raid durumunu gör ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function executeRaidstatus(ctx) {
  const active = isRaidActive(ctx.guild.id);
  const cfg    = getGuildConfig(ctx.guild.id);

  const embed = buildEmbed({
    title:       "꒰🚨 Anti-Raid Durumu",
    description: active
      ? "⚠️ **RAID ALGI AKTIF!** Yoğun üye katılımı tespit edildi.\n`/unlockdown` ile normal moda dön."
      : "✅ **Normal.** Şüpheli katılım tespit edilmedi.",
    color: active ? COLORS.red : COLORS.green,
    fields: [
      { name: "🚨 Raid Eşiği",  value: `${cfg.raidThreshold} katılım/20s`, inline: true },
      { name: "🛡️ Anti-Raid",   value: cfg.antiRaid ? "🟢 Açık" : "🔴 Kapalı", inline: true },
      { name: "⚡ Hesap Kick",  value: cfg.kickNewAccounts ? "🟢 Açık" : "🔴 Kapalı", inline: true },
    ],
  });
  safeReply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// Yardımcı: Mod kanalına bildirim gönder
// ─────────────────────────────────────────────────────────────
export async function notifyMod(guild, cfg, embed) {
  if (!cfg.modChannelId) return;
  try {
    const ch = await guild.channels.fetch(cfg.modChannelId);
    if (ch?.isTextBased()) await ch.send({ embeds: [embed] });
  } catch {}
}

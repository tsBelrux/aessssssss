// ─────────────────────────────────────────────────────────────
// Guild Member Add — Aishivex
// Hoş geldin embed + Yeni Üye rolü + Anti-Raid koruması
// ─────────────────────────────────────────────────────────────

import { ChannelType, PermissionFlagsBits }   from "discord.js";
import { buildEmbed, COLORS }                 from "../utils/embed.js";
import { checkRaid, getGuildConfig }          from "../utils/automod.js";
import { notifyMod }                          from "../commands/protection.js";

export const name = "guildMemberAdd";
export const once = false;

export async function execute(member) {
  const guild    = member.guild;
  const channels = guild.channels.cache;
  const cfg      = getGuildConfig(guild.id);

  // ════════════════════════════════════════════════════════
  // ── Anti-Raid Kontrolü ──────────────────────────────────
  // ════════════════════════════════════════════════════════
  const { raid, count, isNewAccount } = checkRaid(member, cfg);

  if (raid) {
    console.warn(`🚨 RAID TESPİT! ${guild.name}: ${count} katılım/20s`);

    // Yeni (şüpheli) hesapları kickle
    if (cfg.kickNewAccounts && isNewAccount) {
      try {
        await member.kick("[AutoMod] Anti-Raid: Şüpheli yeni hesap");
        console.log(`⚡ Anti-Raid kick: ${member.user.tag}`);
      } catch (err) {
        console.error("Anti-Raid kick hatası:", err.message);
      }
    }

    // Mod kanalına acil bildirim
    const raidEmbed = buildEmbed({
      title:       "꒰🚨 RAID ALGI! ACİL DURUM",
      description: [
        `**${count}** üye **20 saniyede** katıldı!`,
        `Son katılan: ${member.user.tag} (\`${member.user.id}\`)`,
        "",
        `⚠️ Hesap yaşı: ${Math.floor((Date.now() - member.user.createdTimestamp) / 86400000)} gün`,
        cfg.kickNewAccounts ? "⚡ Yeni hesaplar otomatik atılıyor!" : "❕ Yeni hesap kickleme: kapalı",
        "",
        `꒰🔴 \`/lockdown\` komutu ile sunucuyu kilitleyebilirsin!`,
        `꒰🟢 Tehdit geçince \`/unlockdown\` ile aç.`,
      ].join("\n"),
      color: COLORS.red,
    });

    notifyMod(guild, cfg, raidEmbed).catch(() => {});
    return; // Raid sırasında welcome mesajı gönderme
  }

  // ════════════════════════════════════════════════════════
  // ── Otomatik "Yeni Üye" rolü ver ────────────────────────
  // ════════════════════════════════════════════════════════
  const newMemberRole = guild.roles.cache.find((r) => r.name === "Yeni Üye");
  if (newMemberRole) {
    try { await member.roles.add(newMemberRole); }
    catch (err) { console.error("Yeni Üye rolü verilemedi:", err.message); }
  }

  // ════════════════════════════════════════════════════════
  // ── Hoş geldin kanalını bul ─────────────────────────────
  // ════════════════════════════════════════════════════════
  let welcomeChannel = null;
  for (const [, ch] of channels) {
    if (
      ch?.type === ChannelType.GuildText &&
      (ch.name.includes("ho") || ch.name.includes("welc")) &&
      (ch.name.includes("geldin") || ch.name.includes("come"))
    ) {
      welcomeChannel = ch;
      break;
    }
  }
  if (!welcomeChannel) return;

  // ── Hoş geldin mesajı ──────────────────────────────────
  const embed = buildEmbed({
    title:       `꒰🌸 Hoş Geldin, ${member.user.displayName}!`,
    description: [
      `✦ Seni aramızda görmek harika! ${member} 🎉`,
      "",
      `꒰📌 Kurallarımızı okumayı unutma!`,
      `꒰🎨 **#🎨・rol-al** kanalından oyun rolünü seç`,
      `꒰💬 **#˚・genel-sohbet** kanalında sohbet et 🌸`,
      `꒰🏆 Mesaj atarak XP kazan ve seviye yüksel!`,
      "",
      `𓂃 *Sen sunucumuzun **${guild.memberCount}. üyesisin*** ✦`,
    ].join("\n"),
    color:     COLORS.pink,
    thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 512 }),
  });

  try {
    await welcomeChannel.send({ content: `꒰🌸 ${member}`, embeds: [embed] });
  } catch (err) {
    console.error("Hoş geldin mesajı gönderilemedi:", err.message);
  }
}

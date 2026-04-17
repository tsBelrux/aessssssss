// ─────────────────────────────────────────────────────────────
// Guild Member Add — Aishivex
// Yeni üye gelince hoş geldin embed + otomatik "Yeni Üye" rolü
// ─────────────────────────────────────────────────────────────

import { ChannelType } from "discord.js";
import { buildEmbed, COLORS } from "../utils/embed.js";

export const name = "guildMemberAdd";
export const once = false;

export async function execute(member) {
  const guild    = member.guild;
  const channels = guild.channels.cache;

  // ── Otomatik "Yeni Üye" rolü ver ────────────────────────
  const newMemberRole = guild.roles.cache.find(
    (r) => r.name === "Yeni Üye"
  );
  if (newMemberRole) {
    try { await member.roles.add(newMemberRole); }
    catch (err) { console.error("Yeni Üye rolü verilemedi:", err.message); }
  }

  // ── Hoş geldin kanalını bul ──────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Guild Member Add Event — Aishivex
// Yeni üye geldiğinde #hoş-geldin kanalına estetik mesaj gönder
// ─────────────────────────────────────────────────────────────

import { ChannelType } from "discord.js";
import { buildEmbed, COLORS } from "../utils/embed.js";

export const name = "guildMemberAdd";
export const once = false;

export async function execute(member) {
  const guild    = member.guild;
  const channels = await guild.channels.fetch();

  // #hoş-geldin kanalını bul
  let welcomeChannel = null;
  for (const [, ch] of channels) {
    if (ch?.type === ChannelType.GuildText && ch.name.includes("ho") && ch.name.includes("geldin")) {
      welcomeChannel = ch;
      break;
    }
  }
  if (!welcomeChannel) return;

  // Kaçıncı üye?
  const memberCount = guild.memberCount;

  const embed = buildEmbed({
    title:       `꒰🌸 Hoş Geldin, ${member.user.displayName}!`,
    description: [
      `✦ Aramıza katıldığın için çok mutluyuz! 🎉`,
      ``,
      `꒰📌 Kurallarımızı okumayı unutma!`,
      `꒰🎨 <#> kanalından oyun rolünü al`,
      `꒰💬 Sohbete katıl, eğlen 🌸`,
      ``,
      `𓂃 *Sen sunucumuzun **${memberCount}. üyesisin***`,
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

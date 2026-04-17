// ─────────────────────────────────────────────────────────────
// Setup Reaction Roles — Aishivex
// Admin komutu: #rol-al kanalında reaction role mesajı oluştur
// ─────────────────────────────────────────────────────────────

import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { buildEmbed, COLORS } from "../utils/embed.js";

const __dirname  = dirname(fileURLToPath(import.meta.url));
const RR_FILE    = join(__dirname, "../data/reactionRoles.json");

// Emoji → Rol adı eşleştirmesi
export const REACTION_ROLES = {
  "🎯": "Valorant",
  "🔫": "CS2",
  "⛏️": "Minecraft",
  "👑": "League of Legends",
  "🚗": "GTA RP",
  "🎵": "Müzik Sever",
};

// ── Kayıtlı verileri yükle / Load saved data ──────────────
export function loadRRData() {
  if (!existsSync(RR_FILE)) return {};
  try { return JSON.parse(readFileSync(RR_FILE, "utf8")); }
  catch { return {}; }
}

// ── Verileri kaydet / Save data ────────────────────────────
export function saveRRData(data) {
  writeFileSync(RR_FILE, JSON.stringify(data, null, 2), "utf8");
}

export const data = new SlashCommandBuilder()
  .setName("setup-roles")
  .setDescription("꒰🎨 #rol-al kanalında reaction role mesajı oluştur (Admin only) ✦")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(ctx) {
  await ctx.deferReply({ ephemeral: true });

  const guild    = ctx.guild;
  const channels = await guild.channels.fetch();

  // #rol-al kanalını bul
  let rolChannel = null;
  for (const [, ch] of channels) {
    if (ch?.name?.includes("rol-al")) { rolChannel = ch; break; }
  }

  if (!rolChannel) {
    return ctx.editReply({ content: "❌ `#rol-al` kanalı bulunamadı. Önce sunucu kurulumunu yapın." });
  }

  // Embed mesajı oluştur
  const emojiList = Object.entries(REACTION_ROLES)
    .map(([emoji, role]) => `${emoji} → **${role}**`)
    .join("\n");

  const embed = buildEmbed({
    title:       "꒰🎨 Oyun Rollerini Seç!",
    description: `Aşağıdaki emojilere tıklayarak rol alabilirsin 🌸\n\n${emojiList}\n\n✦ *Rolü kaldırmak için emojiye tekrar tıkla*`,
    color:       COLORS.pink,
    timestamp:   false,
  });

  // Eski mesajı varsa sil
  const rrData = loadRRData();
  if (rrData[guild.id]?.messageId) {
    try {
      const oldMsg = await rolChannel.messages.fetch(rrData[guild.id].messageId);
      await oldMsg.delete();
    } catch {}
  }

  // Yeni mesaj gönder
  const message = await rolChannel.send({ embeds: [embed] });

  // Emojileri ekle
  for (const emoji of Object.keys(REACTION_ROLES)) {
    try { await message.react(emoji); }
    catch (err) { console.error(`Emoji eklenemedi ${emoji}:`, err.message); }
  }

  // Mesaj ID'sini kaydet
  if (!rrData[guild.id]) rrData[guild.id] = {};
  rrData[guild.id].messageId  = message.id;
  rrData[guild.id].channelId  = rolChannel.id;
  saveRRData(rrData);

  await ctx.editReply({ content: `✦ Reaction role mesajı ${rolChannel} kanalında oluşturuldu 🌸` });
}

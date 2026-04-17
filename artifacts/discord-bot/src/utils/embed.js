// ─────────────────────────────────────────────────────────────
// Aesthetic Embed Builder — Aishivex
// Soft pink/purple palette with stars, flowers, glyphs
// ─────────────────────────────────────────────────────────────

import { EmbedBuilder } from "discord.js";

// Ana renkler / Main colors
export const COLORS = {
  pink:   0xff99cc,
  purple: 0xcc99ff,
  blue:   0x99ccff,
  green:  0xaaffcc,
  yellow: 0xffdd99,
  gray:   0xcccccc,
  red:    0xff6b6b,
  dark:   0x2b2d31,
};

// Bot branding
export const FOOTER = "Aishivex ✦ aesthetic gaming";
export const STAR   = "✦";
export const FLOWER = "🌸";
export const GLYPH  = "𓂃";

/**
 * Temel güzel embed oluşturur / Creates a base aesthetic embed
 * @param {object} options
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {number} [options.color]
 * @param {string} [options.thumbnail]
 * @param {string} [options.image]
 * @param {Array}  [options.fields]
 * @param {boolean} [options.timestamp]
 */
export function buildEmbed({
  title,
  description,
  color = COLORS.pink,
  thumbnail,
  image,
  fields = [],
  timestamp = true,
} = {}) {
  const embed = new EmbedBuilder().setColor(color).setFooter({ text: FOOTER });

  if (title)       embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (thumbnail)   embed.setThumbnail(thumbnail);
  if (image)       embed.setImage(image);
  if (fields.length) embed.addFields(fields);
  if (timestamp)   embed.setTimestamp();

  return embed;
}

/**
 * Hata embedi / Error embed
 */
export function errorEmbed(message) {
  return buildEmbed({
    title: `❌ Hata`,
    description: message,
    color: COLORS.red,
  });
}

/**
 * Başarı embedi / Success embed
 */
export function successEmbed(message) {
  return buildEmbed({
    title: `${STAR} Başarılı`,
    description: message,
    color: COLORS.green,
  });
}

/**
 * Bilgi embedi / Info embed
 */
export function infoEmbed(title, description) {
  return buildEmbed({ title: `${FLOWER} ${title}`, description, color: COLORS.purple });
}

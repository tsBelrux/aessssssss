// ─────────────────────────────────────────────────────────────
// Music Commands — Aishivex
// play, skip, stop, queue komutları
// ─────────────────────────────────────────────────────────────

import { SlashCommandBuilder } from "discord.js";
import { buildEmbed, COLORS } from "../utils/embed.js";
import { getQueue, createQueue, formatDuration } from "../utils/musicManager.js";

// ─────────────────────────────────────────────────────────────
// /play
// ─────────────────────────────────────────────────────────────
export const playData = new SlashCommandBuilder()
  .setName("play")
  .setDescription("꒰🎵 Müzik çal! Play a song ✦")
  .addStringOption((opt) =>
    opt.setName("sarki").setDescription("Şarkı adı veya YouTube URL'si").setRequired(true)
  );

export async function executePlay(ctx, queryArg) {
  const isInteraction = ctx.constructor.name.includes("Interaction");
  if (isInteraction) await ctx.deferReply();

  const member = isInteraction ? ctx.member : ctx.member;
  const voiceChannel = member?.voice?.channel;

  if (!voiceChannel) {
    const embed = buildEmbed({ title: "❌", description: "Önce bir ses kanalına gir! 🌸", color: COLORS.red });
    return isInteraction ? ctx.editReply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  }

  const query = isInteraction ? ctx.options.getString("sarki") : queryArg;
  if (!query) {
    const embed = buildEmbed({ title: "❌", description: "Şarkı adı veya URL gir! 🌸", color: COLORS.red });
    return isInteraction ? ctx.editReply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  }

  let queue = getQueue(ctx.guild.id);

  if (!queue) {
    try {
      queue = await createQueue(ctx.guild, isInteraction ? ctx.channel : ctx, voiceChannel);
    } catch (err) {
      console.error("Ses bağlantısı hatası:", err.message);
      const embed = buildEmbed({ title: "❌", description: "Ses kanalına bağlanılamadı. Voice izni var mı? 🌸", color: COLORS.red });
      return isInteraction ? ctx.editReply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
    }
  }

  const requester = isInteraction ? ctx.user.username : ctx.author.username;
  const song = await queue.addSong(query, requester);

  if (!song) {
    const embed = buildEmbed({ title: "❌", description: "Şarkı bulunamadı! Başka bir şey dene 🌸", color: COLORS.red });
    return isInteraction ? ctx.editReply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  }

  const isNowPlaying = queue.songs.length === 1;
  const embed = buildEmbed({
    title:       isNowPlaying ? "꒰🎵 Şimdi Çalıyor!" : "꒰🎵 Kuyruğa Eklendi",
    description: `**[${song.title}](${song.url})**`,
    color:       COLORS.pink,
    thumbnail:   song.thumbnail,
    fields: [
      { name: "⏱️ Süre",      value: formatDuration(song.duration), inline: true },
      { name: "🌸 İsteyen",   value: song.requestedBy,              inline: true },
      { name: "✦ Sıra",       value: `#${queue.songs.length}`,      inline: true },
    ],
  });

  return isInteraction ? ctx.editReply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /skip
// ─────────────────────────────────────────────────────────────
export const skipData = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("꒰⏭️ Mevcut şarkıyı atla! Skip current song ✦");

export async function executeSkip(ctx) {
  const isInteraction = ctx.constructor.name.includes("Interaction");
  const queue = getQueue(ctx.guild.id);

  if (!queue || !queue.currentSong) {
    const embed = buildEmbed({ title: "❌", description: "Şu an çalan şarkı yok! 🌸", color: COLORS.red });
    return isInteraction ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  }

  const skipped = queue.currentSong.title;
  queue.skip();

  const embed = buildEmbed({
    title:       "꒰⏭️ Atlandı",
    description: `**${skipped}** atlandı 🌸`,
    color:       COLORS.blue,
  });
  return isInteraction ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /stop
// ─────────────────────────────────────────────────────────────
export const stopData = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("꒰⏹️ Müziği durdur ve çık! Stop music & disconnect ✦");

export async function executeStop(ctx) {
  const isInteraction = ctx.constructor.name.includes("Interaction");
  const queue = getQueue(ctx.guild.id);

  if (!queue) {
    const embed = buildEmbed({ title: "❌", description: "Zaten müzik çalmıyor! 🌸", color: COLORS.red });
    return isInteraction ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  }

  queue.destroy();

  const embed = buildEmbed({
    title:       "꒰⏹️ Durduruldu",
    description: "Müzik durduruldu, ses kanalından çıkıldı 🌸",
    color:       COLORS.gray,
  });
  return isInteraction ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /queue
// ─────────────────────────────────────────────────────────────
export const queueData = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("꒰📋 Müzik kuyruğunu gör! Show music queue ✦");

export async function executeQueue(ctx) {
  const isInteraction = ctx.constructor.name.includes("Interaction");
  const queue = getQueue(ctx.guild.id);

  if (!queue || !queue.songs.length) {
    const embed = buildEmbed({
      title:       "꒰📋 Kuyruk",
      description: "Kuyruk boş! `/play` ile müzik ekle 🌸",
      color:       COLORS.blue,
    });
    return isInteraction ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
  }

  const rows = queue.songs.slice(0, 10).map((s, i) => {
    const prefix = i === 0 ? "▶️ **Şimdi:**" : `\`#${i + 1}\``;
    return `${prefix} [${s.title}](${s.url}) — ${formatDuration(s.duration)}`;
  });

  const remaining = queue.songs.length > 10 ? `\n*… ve ${queue.songs.length - 10} şarkı daha*` : "";

  const embed = buildEmbed({
    title:       `꒰🎵 Kuyruk — ${queue.songs.length} şarkı`,
    description: rows.join("\n") + remaining,
    color:       COLORS.purple,
  });
  return isInteraction ? ctx.reply({ embeds: [embed] }) : ctx.reply({ embeds: [embed] });
}

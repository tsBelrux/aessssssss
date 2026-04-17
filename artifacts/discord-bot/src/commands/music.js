// ─────────────────────────────────────────────────────────────
// Music Commands — Aishivex (FFmpeg Fixed ✓)
// play, skip, stop, queue, pause, resume, volume, nowplaying
// ─────────────────────────────────────────────────────────────

import { SlashCommandBuilder } from "discord.js";
import { buildEmbed, COLORS } from "../utils/embed.js";
import { getQueue, createQueue, formatDuration } from "../utils/musicManager.js";

function isI(ctx)  { return ctx.constructor.name.includes("Interaction"); }
async function safeDefer(ctx) { if (isI(ctx)) await ctx.deferReply().catch(() => {}); }
async function safeReply(ctx, opts) {
  try {
    if (isI(ctx)) { if (ctx.deferred || ctx.replied) return ctx.editReply(opts); return ctx.reply(opts); }
    return ctx.reply(opts);
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// /play
// ─────────────────────────────────────────────────────────────
export const playData = new SlashCommandBuilder()
  .setName("play")
  .setDescription("꒰🎵 Müzik çal! Play a song ✦")
  .addStringOption((o) => o.setName("sarki").setDescription("Şarkı adı veya YouTube URL'si").setRequired(true));

export async function executePlay(ctx, queryArg) {
  await safeDefer(ctx);
  const voiceCh = ctx.member?.voice?.channel;
  if (!voiceCh) return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: "Önce bir ses kanalına gir! 🌸", color: COLORS.red })] });

  const query = isI(ctx) ? ctx.options.getString("sarki") : queryArg;
  if (!query?.trim()) return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: "Şarkı adı veya URL gir!", color: COLORS.red })] });

  let queue = getQueue(ctx.guild.id);
  if (!queue) {
    try {
      queue = await createQueue(ctx.guild, ctx.channel, voiceCh);
    } catch (err) {
      console.error("Ses bağlantısı hatası:", err.message);
      return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: `Ses kanalına bağlanılamadı!\n\`${err.message}\``, color: COLORS.red })] });
    }
  }

  const requester = isI(ctx) ? ctx.user.username : ctx.author.username;
  const song = await queue.addSong(query.trim(), requester);
  if (!song) return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: "Şarkı bulunamadı! Başka bir şey dene 🌸", color: COLORS.red })] });

  const isNowPlaying = queue.songs.length === 1;
  const embed = buildEmbed({
    title:     isNowPlaying ? "꒰🎵 Şimdi Çalıyor!" : "꒰🎵 Kuyruğa Eklendi",
    description: `**[${song.title}](${song.url})**`,
    color:     COLORS.pink,
    thumbnail: song.thumbnail,
    fields: [
      { name: "⏱️ Süre",     value: formatDuration(song.duration), inline: true },
      { name: "🌸 İsteyen", value: song.requestedBy,               inline: true },
      { name: "✦ Sıra",     value: `#${queue.songs.length}`,       inline: true },
    ],
  });
  safeReply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /skip
// ─────────────────────────────────────────────────────────────
export const skipData = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("꒰⏭️ Şarkıyı atla ✦");

export async function executeSkip(ctx) {
  const queue = getQueue(ctx.guild.id);
  if (!queue?.currentSong) return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: "Şarkı çalmıyor! 🌸", color: COLORS.red })] });
  const title = queue.currentSong.title;
  queue.skip();
  safeReply(ctx, { embeds: [buildEmbed({ title: "꒰⏭️ Atlandı", description: `**${title}** atlandı 🌸`, color: COLORS.blue })] });
}

// ─────────────────────────────────────────────────────────────
// /stop
// ─────────────────────────────────────────────────────────────
export const stopData = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("꒰⏹️ Müziği durdur ve çık ✦");

export async function executeStop(ctx) {
  const queue = getQueue(ctx.guild.id);
  if (!queue) return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: "Müzik çalmıyor! 🌸", color: COLORS.red })] });
  queue.destroy();
  safeReply(ctx, { embeds: [buildEmbed({ title: "꒰⏹️ Durduruldu", description: "Müzik durduruldu, ses kanalından çıkıldı 🌸", color: COLORS.gray })] });
}

// ─────────────────────────────────────────────────────────────
// /pause
// ─────────────────────────────────────────────────────────────
export const pauseData = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("꒰⏸️ Müziği duraklat ✦");

export async function executePause(ctx) {
  const queue = getQueue(ctx.guild.id);
  if (!queue) return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: "Müzik çalmıyor! 🌸", color: COLORS.red })] });
  const ok = queue.pause();
  safeReply(ctx, { embeds: [buildEmbed({ title: ok ? "꒰⏸️ Duraklatıldı" : "❌ Zaten duraklatılmış", description: ok ? "Devam ettirmek için `/resume`" : "🌸", color: ok ? COLORS.blue : COLORS.red })] });
}

// ─────────────────────────────────────────────────────────────
// /resume
// ─────────────────────────────────────────────────────────────
export const resumeData = new SlashCommandBuilder()
  .setName("resume")
  .setDescription("꒰▶️ Müziği devam ettir ✦");

export async function executeResume(ctx) {
  const queue = getQueue(ctx.guild.id);
  if (!queue) return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: "Müzik çalmıyor! 🌸", color: COLORS.red })] });
  const ok = queue.resume();
  safeReply(ctx, { embeds: [buildEmbed({ title: ok ? "꒰▶️ Devam Ediyor" : "❌ Zaten çalıyor", description: ok ? "Müzik devam ediyor 🌸" : "🌸", color: ok ? COLORS.green : COLORS.red })] });
}

// ─────────────────────────────────────────────────────────────
// /volume
// ─────────────────────────────────────────────────────────────
export const volumeData = new SlashCommandBuilder()
  .setName("volume")
  .setDescription("꒰🔊 Ses seviyesini ayarla ✦")
  .addIntegerOption((o) => o.setName("seviye").setDescription("0-200 arası").setMinValue(0).setMaxValue(200).setRequired(true));

export async function executeVolume(ctx, volArg) {
  const queue = getQueue(ctx.guild.id);
  if (!queue) return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: "Müzik çalmıyor! 🌸", color: COLORS.red })] });
  const vol = isI(ctx) ? ctx.options.getInteger("seviye") : (parseInt(volArg) || 100);
  queue.setVolume(vol / 100);
  safeReply(ctx, { embeds: [buildEmbed({ title: "꒰🔊 Ses Seviyesi", description: `Ses seviyesi **%${vol}** olarak ayarlandı 🌸`, color: COLORS.blue })] });
}

// ─────────────────────────────────────────────────────────────
// /nowplaying
// ─────────────────────────────────────────────────────────────
export const nowplayingData = new SlashCommandBuilder()
  .setName("nowplaying")
  .setDescription("꒰🎵 Şu an çalan şarkıyı gör ✦");

export async function executeNowplaying(ctx) {
  const queue = getQueue(ctx.guild.id);
  if (!queue?.currentSong) return safeReply(ctx, { embeds: [buildEmbed({ title: "❌", description: "Şu an bir şarkı çalmıyor! 🌸", color: COLORS.red })] });

  const song = queue.currentSong;
  const embed = buildEmbed({
    title:       "꒰🎵 Şu An Çalıyor",
    description: `**[${song.title}](${song.url})**`,
    color:       COLORS.pink,
    thumbnail:   song.thumbnail,
    fields: [
      { name: "⏱️ Süre",     value: formatDuration(song.duration), inline: true },
      { name: "🌸 İsteyen", value: song.requestedBy,               inline: true },
      { name: "⏸️ Durum",   value: queue.paused ? "Duraklatılmış" : "Çalıyor", inline: true },
    ],
  });
  safeReply(ctx, { embeds: [embed] });
}

// ─────────────────────────────────────────────────────────────
// /queue
// ─────────────────────────────────────────────────────────────
export const queueData = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("꒰📋 Müzik kuyruğunu gör ✦");

export async function executeQueue(ctx) {
  const queue = getQueue(ctx.guild.id);
  if (!queue?.songs.length) {
    return safeReply(ctx, { embeds: [buildEmbed({ title: "꒰📋 Kuyruk", description: "Kuyruk boş! `/play` ile şarkı ekle 🌸", color: COLORS.blue })] });
  }

  const rows = queue.songs.slice(0, 10).map((s, i) => {
    const p = i === 0 ? "▶️ **Şimdi:**" : `\`#${i + 1}\``;
    return `${p} [${s.title}](${s.url}) — ${formatDuration(s.duration)}`;
  });
  const extra = queue.songs.length > 10 ? `\n*… ve ${queue.songs.length - 10} şarkı daha*` : "";

  const embed = buildEmbed({
    title:       `꒰🎵 Kuyruk — ${queue.songs.length} şarkı`,
    description: rows.join("\n") + extra,
    color:       COLORS.purple,
  });
  safeReply(ctx, { embeds: [embed] });
}

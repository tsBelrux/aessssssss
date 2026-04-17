// ─────────────────────────────────────────────────────────────
// Music Queue Manager — Aishivex (FFmpeg FIXED)
// Her sunucu için ayrı kuyruk; FFmpeg ile güvenilir oynatma
// ─────────────────────────────────────────────────────────────

import { createRequire } from "module";
import { dirname } from "path";
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior,
  StreamType,
} from "@discordjs/voice";
import * as playDl from "play-dl";

// ── FFmpeg yolunu PATH'e ekle / Add FFmpeg binary to PATH ──
const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static");
if (ffmpegPath) {
  const ffmpegDir = dirname(ffmpegPath);
  process.env.PATH = `${ffmpegDir}:${process.env.PATH ?? ""}`;
  process.env.FFMPEG_PATH = ffmpegPath;
  console.log("✦ FFmpeg yüklendi:", ffmpegPath);
} else {
  console.warn("⚠️  FFmpeg bulunamadı — müzik çalışmayabilir!");
}

// Guild ID → MusicQueue map
const queues = new Map();

export class MusicQueue {
  constructor(guild, textChannel, voiceChannel, connection) {
    this.guild       = guild;
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection  = connection;
    this.songs       = [];
    this.currentSong = null;
    this.volume      = 1.0;
    this.paused      = false;

    this.player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
    });

    this.connection.subscribe(this.player);

    // Şarkı bitince sıradakini çal
    this.player.on(AudioPlayerStatus.Idle, () => {
      if (this.songs.length > 0) this.songs.shift();
      this._play();
    });

    this.player.on("error", (err) => {
      console.error("Oynatıcı hatası:", err.message);
      if (this.songs.length > 0) this.songs.shift();
      this._play();
    });

    // Bağlantı kopunca temizle
    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        this.destroy();
      }
    });
  }

  // ── Şarkı ara ve kuyruğa ekle ────────────────────────────
  async addSong(query, requestedBy) {
    try {
      let songInfo;

      if (playDl.yt_validate(query) === "video") {
        // Direkt URL
        const info = await playDl.video_info(query);
        const d    = info.video_details;
        songInfo = {
          title:       d.title ?? "Bilinmeyen Şarkı",
          url:         d.url,
          duration:    d.durationInSec ?? 0,
          thumbnail:   d.thumbnails?.[0]?.url ?? null,
          requestedBy,
        };
      } else {
        // Arama
        const results = await playDl.search(query, {
          source: { youtube: "video" },
          limit: 1,
        });
        if (!results.length) return null;
        const v = results[0];
        songInfo = {
          title:       v.title ?? "Bilinmeyen Şarkı",
          url:         v.url,
          duration:    v.durationInSec ?? 0,
          thumbnail:   v.thumbnails?.[0]?.url ?? null,
          requestedBy,
        };
      }

      this.songs.push(songInfo);
      // İlk şarkıysa hemen çal
      if (this.songs.length === 1) await this._play();
      return songInfo;
    } catch (err) {
      console.error("Şarkı arama hatası:", err.message);
      return null;
    }
  }

  // ── İç oynatma metodu / Internal play ────────────────────
  async _play() {
    if (!this.songs.length) {
      this.currentSong = null;
      return;
    }

    const song = this.songs[0];
    this.currentSong = song;

    try {
      const stream = await playDl.stream(song.url, { quality: 2 });

      // StreamType.Arbitrary → FFmpeg tarafından Opus'a dönüştürülür
      // Bu yaklaşım opusscript bağımsız çalışır ve en güvenilir yöntemdir
      const resource = createAudioResource(stream.stream, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true,
      });

      resource.volume?.setVolume(this.volume);
      this.player.play(resource);
      this.paused = false;
      console.log(`♪ Çalıyor: ${song.title}`);
    } catch (err) {
      console.error("Oynatma başlatma hatası:", err.message);
      if (this.songs.length > 0) this.songs.shift();
      await this._play();
    }
  }

  // ── Skip ──────────────────────────────────────────────────
  skip() {
    if (this.songs.length === 0) return false;
    this.player.stop(true);
    return true;
  }

  // ── Pause / Resume ────────────────────────────────────────
  pause() {
    if (this.paused) return false;
    this.player.pause();
    this.paused = true;
    return true;
  }

  resume() {
    if (!this.paused) return false;
    this.player.unpause();
    this.paused = false;
    return true;
  }

  // ── Volume ────────────────────────────────────────────────
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(2, vol));
    const res = this.player.state?.resource;
    if (res?.volume) res.volume.setVolume(this.volume);
  }

  // ── Destroy ───────────────────────────────────────────────
  destroy() {
    this.songs = [];
    this.currentSong = null;
    this.player.stop(true);
    try { this.connection.destroy(); } catch {}
    queues.delete(this.guild.id);
  }
}

// ── Factory fonksiyonları ─────────────────────────────────
export function getQueue(guildId) { return queues.get(guildId) ?? null; }

export async function createQueue(guild, textChannel, voiceChannel) {
  const connection = joinVoiceChannel({
    channelId:      voiceChannel.id,
    guildId:        guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  const queue = new MusicQueue(guild, textChannel, voiceChannel, connection);
  queues.set(guild.id, queue);
  return queue;
}

// ── Süre formatı / Duration formatter ─────────────────────
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "∞";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

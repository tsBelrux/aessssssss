// ═══════════════════════════════════════════════════════════════
// Music Queue Manager — Aishivex v3 (ytdl-core FIX)
// @distube/ytdl-core kullanarak güvenilir ses akışı
// ═══════════════════════════════════════════════════════════════

import { createRequire } from "module";
import { dirname }       from "path";
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior,
  StreamType,
}                        from "@discordjs/voice";
import ytdl              from "@distube/ytdl-core";
import * as playDl       from "play-dl";

// ── FFmpeg yolunu PATH'e ekle ──────────────────────────────
const _require    = createRequire(import.meta.url);
const ffmpegPath  = _require("ffmpeg-static");
if (ffmpegPath) {
  const dir = dirname(ffmpegPath);
  process.env.PATH        = `${dir}:${process.env.PATH ?? ""}`;
  process.env.FFMPEG_PATH = ffmpegPath;
  console.log("✦ MusicManager FFmpeg:", ffmpegPath);
}

// Guild ID → MusicQueue
const queues = new Map();

export class MusicQueue {
  constructor(guild, textChannel, voiceChannel, connection) {
    this.guild        = guild;
    this.textChannel  = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection   = connection;
    this.songs        = [];
    this.currentSong  = null;
    this.volume       = 0.5;
    this.paused       = false;

    this.player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
    });
    this.connection.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, () => {
      if (this.songs.length > 0) this.songs.shift();
      this._play();
    });

    this.player.on("error", (err) => {
      console.error("[Music] Oynatıcı hatası:", err.message);
      if (this.songs.length > 0) this.songs.shift();
      setTimeout(() => this._play(), 1000);
    });

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

  // ── Şarkı ara ve kuyruğa ekle ──────────────────────────
  async addSong(query, requestedBy) {
    try {
      let songInfo;

      // YouTube URL mi?
      if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(query)) {
        const info = await ytdl.getInfo(query);
        const d    = info.videoDetails;
        songInfo = {
          title:       d.title ?? "Bilinmeyen Şarkı",
          url:         d.video_url,
          duration:    parseInt(d.lengthSeconds) || 0,
          thumbnail:   d.thumbnails?.at(-1)?.url ?? null,
          requestedBy,
        };
      } else {
        // play-dl ile YouTube araması
        const results = await playDl.search(query, {
          source: { youtube: "video" },
          limit: 1,
        });
        if (!results?.length) return null;
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
      if (this.songs.length === 1) await this._play();
      return songInfo;
    } catch (err) {
      console.error("[Music] Şarkı arama hatası:", err.message);
      return null;
    }
  }

  // ── İç oynatma metodu ──────────────────────────────────
  async _play() {
    if (!this.songs.length) { this.currentSong = null; return; }

    const song = this.songs[0];
    this.currentSong = song;

    try {
      // @distube/ytdl-core ile ses akışı — çok daha güvenilir
      const stream = ytdl(song.url, {
        filter:          "audioonly",
        quality:         "highestaudio",
        highWaterMark:   1 << 25, // 32 MB buffer
        requestOptions:  {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        },
      });

      stream.on("error", (err) => {
        console.error("[Music] Stream hatası:", err.message);
        if (this.songs.length > 0) this.songs.shift();
        setTimeout(() => this._play(), 1000);
      });

      // StreamType.Arbitrary → FFmpeg ile PCM→Opus dönüşümü
      const resource = createAudioResource(stream, {
        inputType:    StreamType.Arbitrary,
        inlineVolume: true,
      });
      resource.volume?.setVolume(this.volume);

      this.player.play(resource);
      this.paused = false;
      console.log(`[Music] ♪ Çalıyor: ${song.title}`);
    } catch (err) {
      console.error("[Music] Oynatma başlatma hatası:", err.message);
      if (this.songs.length > 0) this.songs.shift();
      setTimeout(() => this._play(), 1500);
    }
  }

  skip()    { if (!this.songs.length) return false; this.player.stop(true); return true; }
  pause()   { if (this.paused) return false; this.player.pause();   this.paused = true;  return true; }
  resume()  { if (!this.paused) return false; this.player.unpause(); this.paused = false; return true; }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(2, vol));
    const res = this.player.state?.resource;
    if (res?.volume) res.volume.setVolume(this.volume);
  }

  destroy() {
    this.songs = []; this.currentSong = null;
    this.player.stop(true);
    try { this.connection.destroy(); } catch {}
    queues.delete(this.guild.id);
  }
}

// ── Factory ────────────────────────────────────────────────
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

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "∞";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

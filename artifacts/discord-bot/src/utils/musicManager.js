// ═══════════════════════════════════════════════════════════════
// Music Queue Manager — Aishivex v4
// Ses kaynağı: SoundCloud (play-dl) — Replit'te çalışır ✓
// YouTube URL girilirse → başlık çıkar → SoundCloud'da ara
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
import * as playDl       from "play-dl";

// ── FFmpeg PATH (SoundCloud arbitrary stream için gerekli) ─
const _require   = createRequire(import.meta.url);
const ffmpegPath = _require("ffmpeg-static");
if (ffmpegPath) {
  const dir = dirname(ffmpegPath);
  process.env.PATH        = `${dir}:${process.env.PATH ?? ""}`;
  process.env.FFMPEG_PATH = ffmpegPath;
  console.log("✦ MusicManager FFmpeg:", ffmpegPath);
}

// ── SoundCloud token başlat (startup'ta bir kez) ───────────
let scReady = false;
export async function initSoundCloud() {
  if (scReady) return;
  try {
    const clientId = await playDl.getFreeClientID();
    if (clientId) {
      await playDl.setToken({ soundcloud: { client_id: clientId } });
      scReady = true;
      console.log("✦ SoundCloud token hazır ✓");
    }
  } catch (e) {
    console.warn("[Music] SoundCloud token alınamadı:", e.message);
  }
}

// Guild ID → MusicQueue
const queues = new Map();

// ── YouTube URL → başlık çıkar ─────────────────────────────
const YT_REGEX = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;

async function resolveSearchQuery(query) {
  // YouTube URL ise → video_info ile başlığı al, SoundCloud'da ara
  if (YT_REGEX.test(query)) {
    try {
      const info = await playDl.video_info(query);
      const title = info.video_details?.title;
      console.log(`[Music] YouTube URL → başlık: "${title}" → SoundCloud'da aranıyor`);
      return { searchQuery: title, ytTitle: title, ytUrl: query };
    } catch {
      // video_info başarısızsa URL'yi düz metin olarak kullan
    }
  }
  return { searchQuery: query, ytTitle: null, ytUrl: null };
}

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
      setTimeout(() => this._play(), 1500);
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

  // ── Şarkı ara + kuyruğa ekle ───────────────────────────
  async addSong(query, requestedBy) {
    await initSoundCloud();

    const { searchQuery, ytTitle, ytUrl } = await resolveSearchQuery(query);

    // SoundCloud'da ara
    try {
      const results = await playDl.search(searchQuery, {
        source: { soundcloud: "tracks" },
        limit: 1,
      });

      if (!results?.length) {
        console.warn("[Music] SoundCloud'da bulunamadı:", searchQuery);
        return null;
      }

      const track = results[0];
      const info = {
        title:     ytTitle ? `${ytTitle}` : (track.name ?? "Bilinmeyen Şarkı"),
        url:       track.url,
        scUrl:     track.url,
        duration:  track.durationInMs ? Math.floor(track.durationInMs / 1000) : 0,
        thumbnail: track.thumbnail ?? null,
        requestedBy,
        source:    "SoundCloud",
      };

      this.songs.push(info);
      if (this.songs.length === 1) await this._play();
      return info;
    } catch (err) {
      console.error("[Music] Şarkı arama hatası:", err.message);
      return null;
    }
  }

  // ── Oynatma — SoundCloud stream ────────────────────────
  async _play() {
    if (!this.songs.length) { this.currentSong = null; return; }
    const song = this.songs[0];
    this.currentSong = song;

    try {
      await initSoundCloud();

      // SoundCloud stream aç
      const stream = await playDl.stream(song.scUrl ?? song.url);
      console.log(`[Music] ♪ Çalıyor: ${song.title} [${stream.type}]`);

      // SoundCloud → arbitrary → FFmpeg ile Opus'a çevir
      const resource = createAudioResource(stream.stream, {
        inputType:    stream.type,
        inlineVolume: true,
      });
      resource.volume?.setVolume(this.volume);

      this.player.play(resource);
      this.paused = false;
    } catch (err) {
      console.error("[Music] Stream açma hatası:", err.message);
      if (this.songs.length > 0) this.songs.shift();
      if (this.songs.length > 0) setTimeout(() => this._play(), 1500);
      else this.currentSong = null;
    }
  }

  skip()   { if (!this.songs.length) return false; this.player.stop(true); return true; }
  pause()  { if (this.paused) return false; this.player.pause();   this.paused = true;  return true; }
  resume() { if (!this.paused) return false; this.player.unpause(); this.paused = false; return true; }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(2, vol));
    const resource = this.player.state?.resource;
    if (resource?.volume) resource.volume.setVolume(this.volume);
  }

  destroy() {
    this.songs = []; this.currentSong = null;
    this.player.stop(true);
    try { this.connection.destroy(); } catch {}
    queues.delete(this.guild.id);
  }
}

// ── Factory ─────────────────────────────────────────────────
export function getQueue(guildId) { return queues.get(guildId) ?? null; }

export async function createQueue(guild, textChannel, voiceChannel) {
  const connection = joinVoiceChannel({
    channelId:      voiceChannel.id,
    guildId:        guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf:       true,
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

// ─────────────────────────────────────────────────────────────
// Music Queue Manager — Aishivex
// Her sunucu için ayrı müzik kuyruğu
// ─────────────────────────────────────────────────────────────

import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import * as playDl from "play-dl";

// Guild ID → MusicQueue instance
const queues = new Map();

export class MusicQueue {
  constructor(guild, textChannel, voiceChannel, connection) {
    this.guild        = guild;
    this.textChannel  = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection   = connection;
    this.songs        = [];          // kuyruk listesi
    this.currentSong  = null;
    this.player       = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
    });

    this.connection.subscribe(this.player);

    // Şarkı bitince sıradakini çal
    this.player.on(AudioPlayerStatus.Idle, () => {
      this.songs.shift();
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

    this.player.on("error", (err) => {
      console.error("Müzik oynatıcı hatası:", err.message);
      this.songs.shift();
      this._play();
    });
  }

  // ── Şarkı ekle / Add song to queue ──────────────────────
  async addSong(query, requestedBy) {
    let songInfo;
    try {
      // URL mi yoksa arama mı?
      if (playDl.yt_validate(query) === "video") {
        const info = await playDl.video_info(query);
        songInfo = {
          title:       info.video_details.title,
          url:         info.video_details.url,
          duration:    info.video_details.durationInSec,
          thumbnail:   info.video_details.thumbnails?.[0]?.url,
          requestedBy,
        };
      } else {
        const results = await playDl.search(query, { source: { youtube: "video" }, limit: 1 });
        if (!results.length) return null;
        const video = results[0];
        songInfo = {
          title:       video.title,
          url:         video.url,
          duration:    video.durationInSec,
          thumbnail:   video.thumbnails?.[0]?.url,
          requestedBy,
        };
      }
    } catch (err) {
      console.error("Şarkı arama hatası:", err.message);
      return null;
    }

    this.songs.push(songInfo);

    // Kuyrukta tek şarkıysa hemen çal
    if (this.songs.length === 1) this._play();

    return songInfo;
  }

  // ── İç oynatma metodu / Internal play method ──────────
  async _play() {
    if (!this.songs.length) {
      this.currentSong = null;
      return;
    }

    const song = this.songs[0];
    this.currentSong = song;

    try {
      const stream = await playDl.stream(song.url, { quality: 2 });
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });
      this.player.play(resource);
    } catch (err) {
      console.error("Oynatma hatası:", err.message);
      this.songs.shift();
      this._play();
    }
  }

  // ── Sonraki şarkıya geç / Skip ──────────────────────────
  skip() {
    this.player.stop(true); // Idle event'ini tetikler, _play çağırır
  }

  // ── Durdur ve çık / Stop & disconnect ──────────────────
  destroy() {
    this.songs = [];
    this.player.stop(true);
    try { this.connection.destroy(); } catch {}
    queues.delete(this.guild.id);
  }
}

// ── Queue factory / Kuyruk başlat veya getir ──────────────
export function getQueue(guildId) {
  return queues.get(guildId) ?? null;
}

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

// ── Saniye → süre formatı / Seconds → duration format ─────
export function formatDuration(seconds) {
  if (!seconds) return "∞";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

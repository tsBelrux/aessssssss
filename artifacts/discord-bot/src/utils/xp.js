// ─────────────────────────────────────────────────────────────
// XP & Leveling System — Aishivex
// Mesaj ve ses kanalı için XP sistemi
// ─────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const XP_FILE = join(__dirname, "../data/xp.json");

// Cooldown süresi (ms) — aynı kullanıcı 60 saniyede bir XP alır
const MESSAGE_COOLDOWN = 60_000;
// Mesaj başına min/max XP
const XP_MIN = 15;
const XP_MAX = 25;
// Ses kanalı XP (dakika başı)
const VOICE_XP_PER_MINUTE = 10;
// Seviye için gereken XP (MEE6 formülü)
const xpForLevel = (level) => 5 * level * level + 50 * level + 100;

// XP cooldown takibi (userId → timestamp)
const cooldowns = new Map();
// Ses kanalı katılma zamanı takibi (userId → joinTimestamp)
const voiceJoins = new Map();

// ── Dosya yükle / Load file ─────────────────────────────────
function loadData() {
  if (!existsSync(XP_FILE)) return {};
  try {
    return JSON.parse(readFileSync(XP_FILE, "utf8"));
  } catch {
    return {};
  }
}

// ── Dosyaya kaydet / Save to file ──────────────────────────
function saveData(data) {
  writeFileSync(XP_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ── Kullanıcı verisini getir / Get user data ───────────────
export function getUser(guildId, userId) {
  const data = loadData();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) {
    data[guildId][userId] = { xp: 0, level: 0, totalXp: 0 };
  }
  return { data, user: data[guildId][userId] };
}

// ── Mesaj XP ver / Award message XP ───────────────────────
export function awardMessageXP(guildId, userId) {
  const key = `${guildId}:${userId}`;
  const now = Date.now();

  // Cooldown kontrolü
  if (cooldowns.has(key) && now - cooldowns.get(key) < MESSAGE_COOLDOWN) {
    return null; // cooldown'da, XP verme
  }
  cooldowns.set(key, now);

  const xpGain = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
  return addXP(guildId, userId, xpGain);
}

// ── Ses XP kayıt başlat / Start voice XP tracking ─────────
export function startVoiceXP(guildId, userId) {
  voiceJoins.set(`${guildId}:${userId}`, Date.now());
}

// ── Ses XP kayıt bitir / Stop voice XP tracking ────────────
export function stopVoiceXP(guildId, userId) {
  const key = `${guildId}:${userId}`;
  const joinedAt = voiceJoins.get(key);
  if (!joinedAt) return null;

  voiceJoins.delete(key);
  const minutes = Math.floor((Date.now() - joinedAt) / 60_000);
  if (minutes < 1) return null;

  const xpGain = minutes * VOICE_XP_PER_MINUTE;
  return addXP(guildId, userId, xpGain);
}

// ── XP ekle & seviye kontrolü / Add XP + level check ──────
function addXP(guildId, userId, amount) {
  const { data, user } = getUser(guildId, userId);
  user.xp += amount;
  user.totalXp += amount;

  let leveled = false;
  while (user.xp >= xpForLevel(user.level + 1)) {
    user.xp -= xpForLevel(user.level + 1);
    user.level += 1;
    leveled = true;
  }

  data[guildId][userId] = user;
  saveData(data);

  return { user, leveled, amount };
}

// ── Sunucu sıralaması / Guild leaderboard ──────────────────
export function getLeaderboard(guildId, limit = 10) {
  const data = loadData();
  if (!data[guildId]) return [];

  return Object.entries(data[guildId])
    .map(([userId, d]) => ({ userId, ...d }))
    .sort((a, b) => b.totalXp - a.totalXp)
    .slice(0, limit);
}

// ── Seviye için gereken XP (dışa aktarım) / Export xpForLevel ─
export { xpForLevel };

// ── Seviye adına göre rol adı / Role name by level ─────────
export function getRoleForLevel(level) {
  if (level >= 15) return "Sadık Üye";
  if (level >= 5)  return "Aktif Üye";
  return null;
}

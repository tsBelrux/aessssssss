// ═══════════════════════════════════════════════════════════════
// AutoMod Engine — Aishivex
// Anti-Spam · Anti-Raid · Invite Filter · Mass Mention · Caps
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath }                           from "url";
import { dirname, join }                           from "path";
import { PermissionFlagsBits }                     from "discord.js";

const __dirname  = dirname(fileURLToPath(import.meta.url));
const CFG_FILE   = join(__dirname, "../data/automod.json");

// ── Varsayılan ayarlar ─────────────────────────────────────
const DEFAULTS = {
  enabled:        true,
  antiSpam:       true,
  antiRaid:       true,
  inviteFilter:   true,
  mentionFilter:  true,
  capsFilter:     true,
  linkFilter:     false,
  spamThreshold:  5,         // X mesaj / 5 saniyede spam
  raidThreshold:  8,         // X katılım / 20 saniyede raid
  muteOnSpam:     true,
  kickNewAccounts:false,     // Raid sırasında eski olmayan hesapları at
  minAccountAge:  7,         // Gün cinsinden
  logChannelId:   null,
  modChannelId:   null,
};

// ── Config yükle / kaydet ─────────────────────────────────
function loadCfg() {
  if (!existsSync(CFG_FILE)) return {};
  try { return JSON.parse(readFileSync(CFG_FILE, "utf8")); }
  catch { return {}; }
}
function saveCfg(data) { writeFileSync(CFG_FILE, JSON.stringify(data, null, 2)); }

export function getGuildConfig(guildId) {
  const all = loadCfg();
  return { ...DEFAULTS, ...(all[guildId] ?? {}) };
}
export function setGuildConfig(guildId, patch) {
  const all = loadCfg();
  all[guildId] = { ...DEFAULTS, ...(all[guildId] ?? {}), ...patch };
  saveCfg(all);
  return all[guildId];
}

// ══════════════════════════════════════════════════════════════
// Anti-Spam — In-memory tracker
// ══════════════════════════════════════════════════════════════
// Map: guildId → Map: userId → { msgs: [{content, ts}], violations }
const spamTracker   = new Map();
const SPAM_WINDOW   = 5_000;  // 5 saniye
const DUP_WINDOW    = 8_000;  // 8 saniye
const MENTION_LIMIT = 5;

/**
 * Mesajı anti-spam motoruna ver.
 * @returns {{ action: 'none'|'delete'|'mute'|'warn', reason: string }|null}
 */
export function checkSpam(message, cfg) {
  if (!cfg.enabled) return null;
  const { guild, author, content, mentions } = message;
  const gId = guild.id;
  const uId = author.id;
  const now = Date.now();

  // ── Moderasyon rolü kontrolü — muaf tut ─────────────────
  if (message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) return null;

  // ── Küfür / invite link filtresi ────────────────────────
  if (cfg.inviteFilter) {
    const inviteRe = /discord(?:\.gg|app\.com\/invite|\.com\/invite)\/[\w-]+/i;
    if (inviteRe.test(content)) {
      return { action: "delete", reason: "Discord davet linki" };
    }
  }

  // ── Kötü amaçlı link filtresi ───────────────────────────
  if (cfg.linkFilter) {
    const linkRe = /https?:\/\/(?!discord\.com|tenor\.com|giphy\.com)\S+\.\S+/i;
    if (linkRe.test(content)) {
      return { action: "delete", reason: "İzinsiz link" };
    }
  }

  // ── Mass mention ─────────────────────────────────────────
  if (cfg.mentionFilter) {
    const total = mentions.users.size + mentions.roles.size;
    if (total >= MENTION_LIMIT) {
      return { action: "mute", reason: `Toplu mention (${total} kişi/rol)` };
    }
  }

  // ── Caps filtresi ────────────────────────────────────────
  if (cfg.capsFilter && content.length >= 12) {
    const upper = content.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, "");
    if (upper.length > 0) {
      const capsRatio = (content.match(/[A-ZĞÜŞÖÇİ]/g)?.length ?? 0) / upper.length;
      if (capsRatio > 0.75) {
        return { action: "delete", reason: "Aşırı büyük harf" };
      }
    }
  }

  // ── Anti-spam rate limit ─────────────────────────────────
  if (cfg.antiSpam) {
    if (!spamTracker.has(gId)) spamTracker.set(gId, new Map());
    const guildMap = spamTracker.get(gId);
    if (!guildMap.has(uId)) guildMap.set(uId, { msgs: [], violations: 0 });

    const record = guildMap.get(uId);

    // Eski mesajları temizle
    record.msgs = record.msgs.filter((m) => now - m.ts < SPAM_WINDOW);
    record.msgs.push({ content, ts: now });

    // Hız kontrolü
    if (record.msgs.length >= cfg.spamThreshold) {
      record.violations++;
      record.msgs = [];
      return record.violations >= 2
        ? { action: "mute", reason: `Spam tespit edildi (${cfg.spamThreshold}+ mesaj/5s)` }
        : { action: "warn", reason: `Spam uyarısı (${cfg.spamThreshold}+ mesaj/5s)` };
    }

    // Duplikat mesaj kontrolü
    const dupCount = record.msgs.filter((m) => m.content === content && now - m.ts < DUP_WINDOW).length;
    if (dupCount >= 3) {
      record.violations++;
      record.msgs = [];
      return { action: "mute", reason: "Tekrarlayan mesaj spam" };
    }
  }

  return null;
}

// ── Kullanıcı tracker sıfırla (ceza sonrası) ──────────────
export function resetSpamRecord(guildId, userId) {
  spamTracker.get(guildId)?.delete(userId);
}

// Periyodik bellek temizliği
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [, guildMap] of spamTracker) {
    for (const [uid, record] of guildMap) {
      record.msgs = record.msgs.filter((m) => m.ts > cutoff);
      if (!record.msgs.length) guildMap.delete(uid);
    }
  }
}, 60_000);

// ══════════════════════════════════════════════════════════════
// Anti-Raid — Join tracker
// ══════════════════════════════════════════════════════════════
const joinTracker = new Map(); // guildId → [timestamp]
const RAID_WINDOW = 20_000;   // 20 saniye
const raidState   = new Map(); // guildId → boolean (raid aktif mi)

/**
 * Üye katılımını kontrol et.
 * @returns {{ raid: boolean, count: number, isNewAccount: boolean }}
 */
export function checkRaid(member, cfg) {
  if (!cfg.enabled || !cfg.antiRaid) return { raid: false, count: 0, isNewAccount: false };

  const guildId  = member.guild.id;
  const now      = Date.now();
  const ageMs    = cfg.minAccountAge * 24 * 60 * 60 * 1000;
  const accAge   = now - member.user.createdTimestamp;
  const isNew    = accAge < ageMs;

  if (!joinTracker.has(guildId)) joinTracker.set(guildId, []);
  const joins = joinTracker.get(guildId);
  joins.push(now);

  // Eski kayıtları temizle
  const recent = joins.filter((t) => now - t < RAID_WINDOW);
  joinTracker.set(guildId, recent);

  const raidDetected = recent.length >= cfg.raidThreshold;
  if (raidDetected) raidState.set(guildId, true);

  return { raid: raidDetected, count: recent.length, isNewAccount: isNew };
}

export function isRaidActive(guildId)   { return raidState.get(guildId) ?? false; }
export function clearRaidState(guildId) { raidState.delete(guildId); joinTracker.delete(guildId); }

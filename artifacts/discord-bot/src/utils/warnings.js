// ─────────────────────────────────────────────────────────────
// Warnings System — Aishivex
// Kullanıcı uyarı sistemi; 3 uyarıda otomatik mute
// ─────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname  = dirname(fileURLToPath(import.meta.url));
const WARN_FILE  = join(__dirname, "../data/warnings.json");

// ── Yükle / Load ───────────────────────────────────────────
function load() {
  if (!existsSync(WARN_FILE)) return {};
  try { return JSON.parse(readFileSync(WARN_FILE, "utf8")); }
  catch { return {}; }
}

// ── Kaydet / Save ──────────────────────────────────────────
function save(data) {
  writeFileSync(WARN_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ── Uyarı ekle / Add warning ───────────────────────────────
export function addWarning(guildId, userId, moderatorId, reason) {
  const data = load();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = [];

  const warn = {
    id:          Date.now(),
    moderatorId,
    reason,
    timestamp:   new Date().toISOString(),
  };
  data[guildId][userId].push(warn);
  save(data);
  return { warn, total: data[guildId][userId].length };
}

// ── Uyarıları getir / Get warnings ─────────────────────────
export function getWarnings(guildId, userId) {
  const data = load();
  return data[guildId]?.[userId] ?? [];
}

// ── Uyarıları temizle / Clear warnings ─────────────────────
export function clearWarnings(guildId, userId) {
  const data = load();
  if (!data[guildId]) return 0;
  const count = (data[guildId][userId] ?? []).length;
  data[guildId][userId] = [];
  save(data);
  return count;
}

// ── Belirli uyarıyı sil / Delete specific warning ─────────
export function removeWarning(guildId, userId, warnId) {
  const data = load();
  if (!data[guildId]?.[userId]) return false;
  const before = data[guildId][userId].length;
  data[guildId][userId] = data[guildId][userId].filter((w) => w.id !== warnId);
  save(data);
  return data[guildId][userId].length < before;
}

// ═══════════════════════════════════════════════════════════════
// Disboard Bump Tracker — Aishivex
// Disboard bot mesajını algılar → 2 saat sonra hatırlatma gönderir
// ═══════════════════════════════════════════════════════════════

const DISBOARD_ID   = "302050872383242240";
const BUMP_COOLDOWN = 2 * 60 * 60 * 1000; // 2 saat

// guildId → { timer, channelId, lastBump }
const bumpTimers = new Map();

// ── Disboard mesajını işle ──────────────────────────────────
export async function handleBumpMessage(message) {
  if (message.author?.id !== DISBOARD_ID && !message.webhookId) return false;
  if (message.author?.id !== DISBOARD_ID) return false;

  // Mesaj içeriği ve embed içeriğini birleştir
  const embedText = (message.embeds ?? [])
    .map((e) => `${e.title ?? ""} ${e.description ?? ""} ${e.fields?.map((f) => f.value).join(" ") ?? ""}`)
    .join(" ")
    .toLowerCase();
  const fullText = (message.content + " " + embedText).toLowerCase();

  // ── Başarılı bump algılama ─────────────────────────────
  const bumpSuccess =
    fullText.includes("bump done") ||
    fullText.includes("bumped") ||
    fullText.includes("başarıyla") ||
    fullText.includes("çarpıcılar listesi") ||
    fullText.includes("sunucu yükseltildi");

  if (bumpSuccess) {
    scheduleReminder(message.guild, message.channel, BUMP_COOLDOWN, "success");
    return true;
  }

  // ── Cooldown mesajı algılama ───────────────────────────
  const cooldownMatch = fullText.match(/(?:please wait|lütfen bekle|(\d+)\s*(saniye|dakika|saat|second|minute|hour))/i);
  if (cooldownMatch) {
    const remaining = parseRemainingMs(fullText);
    if (remaining > 0) {
      scheduleReminder(message.guild, message.channel, remaining, "cooldown");
      return true;
    }
  }

  return false;
}

// ── Kalan süreyi millisaniyeye çevir ───────────────────────
function parseRemainingMs(text) {
  const patterns = [
    { re: /(\d+)\s*(?:saat|hour)/i,   mult: 3600000 },
    { re: /(\d+)\s*(?:dakika|minute)/i, mult: 60000  },
    { re: /(\d+)\s*(?:saniye|second)/i, mult: 1000   },
  ];
  let total = 0;
  for (const { re, mult } of patterns) {
    const m = text.match(re);
    if (m) total += parseInt(m[1]) * mult;
  }
  return total;
}

// ── Hatırlatıcı zamanla ────────────────────────────────────
function scheduleReminder(guild, channel, delay, type) {
  // Önceki timer'ı iptal et
  const existing = bumpTimers.get(guild.id);
  if (existing?.timer) clearTimeout(existing.timer);

  const readyAt = Date.now() + delay;
  const minutes = Math.ceil(delay / 60000);

  console.log(`[Bump] ${guild.name} → ${minutes} dakika sonra hatırlatma (${type})`);

  const timer = setTimeout(async () => {
    bumpTimers.delete(guild.id);
    try {
      await channel.send({
        content: [
          "꒰🚀 **BUMP ZAMANI!** @here",
          "",
          "Sunucumuzu Disboard'da öne çıkar! ✦",
          "👉 `/bump` komutunu kullan 🌸",
        ].join("\n"),
      });
    } catch (err) {
      console.error("[Bump] Hatırlatıcı gönderilemedi:", err.message);
    }
  }, delay);

  bumpTimers.set(guild.id, { timer, readyAt, channelId: channel.id });
}

// ── Bump durumunu öğren ────────────────────────────────────
export function getBumpStatus(guildId) {
  const data = bumpTimers.get(guildId);
  if (!data) return { scheduled: false };
  const remaining = data.readyAt - Date.now();
  return {
    scheduled: true,
    remainingMs: remaining,
    remainingMin: Math.ceil(remaining / 60000),
  };
}

// ── Bump timer'ını iptal et ────────────────────────────────
export function cancelBump(guildId) {
  const data = bumpTimers.get(guildId);
  if (data?.timer) clearTimeout(data.timer);
  bumpTimers.delete(guildId);
}

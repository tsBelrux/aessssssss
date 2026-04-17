// ─────────────────────────────────────────────────────────────
// Voice State Update — Aishivex
// Ses kanalı katılma/ayrılma olaylarında XP ver
// ─────────────────────────────────────────────────────────────

import { startVoiceXP, stopVoiceXP, getRoleForLevel } from "../utils/xp.js";

export const name = "voiceStateUpdate";
export const once = false;

export async function execute(oldState, newState) {
  const userId  = newState.id;
  const guildId = newState.guild.id;

  // Bot yoksay
  if (newState.member?.user?.bot) return;

  // Ses kanalına katıldı (önceden yoktu, şimdi var)
  if (!oldState.channelId && newState.channelId) {
    startVoiceXP(guildId, userId);
    return;
  }

  // Ses kanalından ayrıldı
  if (oldState.channelId && !newState.channelId) {
    const result = stopVoiceXP(guildId, userId);
    if (result?.leveled) {
      // Level up bildirimi — mesaj kanalı bul
      const textChannels = newState.guild.channels.cache.filter(
        (ch) => ch.isTextBased() && ch.name.includes("genel")
      );
      const ch = textChannels.first();
      if (!ch) return;

      const roleName = getRoleForLevel(result.user.level);
      let msg = `꒰🏆 ${newState.member} ses kanalında vakit geçirerek **${result.user.level}. seviyeye** ulaştı! ✦`;
      if (roleName) {
        const role = newState.guild.roles.cache.find((r) => r.name === roleName);
        if (role) {
          try { await newState.member.roles.add(role); }
          catch {}
          msg += ` • **${roleName}** rolü verildi 🌸`;
        }
      }

      try {
        const sent = await ch.send(msg);
        setTimeout(() => sent.delete().catch(() => {}), 15_000);
      } catch {}
    }
    return;
  }

  // Kanal değiştirdi — XP sayacını sıfırla
  if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    stopVoiceXP(guildId, userId);
    startVoiceXP(guildId, userId);
  }
}

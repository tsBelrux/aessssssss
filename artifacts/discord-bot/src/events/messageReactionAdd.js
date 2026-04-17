// ─────────────────────────────────────────────────────────────
// Message Reaction Add — Aishivex
// Reaction role: emojiye tıklayınca rol ver
// ─────────────────────────────────────────────────────────────

import { loadRRData, REACTION_ROLES } from "../commands/setupRoles.js";

export const name = "messageReactionAdd";
export const once = false;

export async function execute(reaction, user) {
  if (user.bot) return;

  // Partial kontrolü — mesaj veya reaction tam yüklü değilse fetch et
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }
  if (reaction.message.partial) {
    try { await reaction.message.fetch(); } catch { return; }
  }

  const guild   = reaction.message.guild;
  if (!guild) return;

  const rrData  = loadRRData();
  const config  = rrData[guild.id];
  if (!config || config.messageId !== reaction.message.id) return;

  const emoji    = reaction.emoji.name;
  const roleName = REACTION_ROLES[emoji];
  if (!roleName) return;

  // Rol bul
  const role = guild.roles.cache.find((r) => r.name === roleName);
  if (!role) return;

  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  try {
    await member.roles.add(role);
  } catch (err) {
    console.error(`Rol eklenemedi (${roleName}):`, err.message);
  }
}

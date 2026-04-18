// Düzenlenen mesaj logu
import { logMessageUpdate } from "../utils/modlog.js";

export const name = "messageUpdate";
export const once = false;

export async function execute(oldMsg, newMsg) {
  if (!newMsg.guild) return;
  await logMessageUpdate(oldMsg, newMsg);
}

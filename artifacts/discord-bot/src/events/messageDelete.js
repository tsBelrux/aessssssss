// Silinen mesaj logu
import { logMessageDelete } from "../utils/modlog.js";

export const name = "messageDelete";
export const once = false;

export async function execute(message) {
  if (!message.guild) return;
  await logMessageDelete(message);
}

// Ban kaldırma logu
import { logBanRemove } from "../utils/modlog.js";

export const name = "guildBanRemove";
export const once = false;

export async function execute(ban) {
  await logBanRemove(ban);
}

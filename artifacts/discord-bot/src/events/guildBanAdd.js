// Ban logu
import { logBanAdd } from "../utils/modlog.js";

export const name = "guildBanAdd";
export const once = false;

export async function execute(ban) {
  await logBanAdd(ban);
}

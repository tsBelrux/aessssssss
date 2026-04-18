// Ayrılan üye logu
import { logMemberLeave } from "../utils/modlog.js";

export const name = "guildMemberRemove";
export const once = false;

export async function execute(member) {
  await logMemberLeave(member);
}

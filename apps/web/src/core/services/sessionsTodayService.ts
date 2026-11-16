import type { SessionCorrection } from "@gym-checkin/shared";
import { adminSessionsApi } from "../api/adminSessionsApi";
import { HttpError } from "../api/httpError";
import type { AdminSession, AdminSessionDto } from "../types/adminSessions";

const toSession = (dto: AdminSessionDto): AdminSession => ({
  id: dto.id,
  entryAt: new Date(dto.entryAt),
  exitAt: dto.exitAt ? new Date(dto.exitAt) : null,
  closedBy: dto.closedBy,
  name: dto.user.name,
  room: dto.user.room,
});

// The API's 400 messages, in the language reception reads
const MESSAGES: Record<string, string> = {
  "The exit must be after the entry": "A saída tem de ser depois da entrada.",
  "Times cannot be in the future": "As horas não podem estar no futuro.",
};

function errorMessage(err: unknown): string {
  if (err instanceof HttpError) {
    if (MESSAGES[err.message]) return MESSAGES[err.message];
    if (err.status === 409) return "A sessão mudou entretanto. A lista foi atualizada.";
    if (err.status === 404) return "Esta sessão já não existe.";
  }
  return "Não foi possível guardar. Tenta outra vez.";
}

async function correct(id: string, body: SessionCorrection): Promise<void> {
  try {
    await adminSessionsApi.correct(id, body);
  } catch (err) {
    throw new Error(errorMessage(err), { cause: err });
  }
}

export const sessionsTodayService = {
  /**
   * Today's sessions in the browser's time zone (the residence's): the
   * client computes local midnight, so the API never guesses a time zone.
   */
  listToday: async (now = new Date()): Promise<AdminSession[]> => {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const list = await adminSessionsApi.list({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    return list.map(toSession);
  },

  /** The student handed the key back. */
  closeNow: (id: string) => correct(id, { exitAt: new Date().toISOString() }),

  /** Values come from datetime-local inputs (local time); empty = unchanged. */
  correctTimes: (id: string, entryLocal: string, exitLocal: string) =>
    correct(id, {
      ...(entryLocal && { entryAt: new Date(entryLocal).toISOString() }),
      ...(exitLocal && { exitAt: new Date(exitLocal).toISOString() }),
    }),
};

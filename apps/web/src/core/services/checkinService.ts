import { checkinApi } from "../api/checkinApi";
import { HttpError } from "../api/httpError";
import type { OpenSession, OpenSessionDto } from "../types/checkin";

const toOpenSession = (dto: OpenSessionDto): OpenSession => ({
  id: dto.id,
  entryAt: new Date(dto.entryAt),
});

/** Turns a failed check-in/checkout into a message the user can act on. */
function errorMessage(err: unknown): string {
  if (err instanceof HttpError) {
    if (err.status === 409) return "O teu estado mudou entretanto. Já atualizámos.";
    if (err.status === 403) return "Este método de entrada não está ativo.";
    if (err.status === 429) return "Demasiados pedidos. Espera um pouco.";
  }
  return "Não foi possível concluir. Tenta outra vez.";
}

/** Rethrows with a user-facing message, keeping the HttpError as `cause`. */
async function withMessage<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (err) {
    throw new Error(errorMessage(err), { cause: err });
  }
}

export const checkinService = {
  getOpenSession: async (): Promise<OpenSession | null> => {
    const { session } = await withMessage(checkinApi.getCurrent());
    return session ? toOpenSession(session) : null;
  },

  // SIMPLE is the only method until Phase 3 (QR) adds a token to the request
  checkIn: async (): Promise<OpenSession> =>
    toOpenSession(await withMessage(checkinApi.checkIn("SIMPLE"))),

  checkOut: async (): Promise<void> => withMessage(checkinApi.checkOut()),
};

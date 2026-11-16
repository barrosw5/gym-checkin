import { checkinApi } from "../api/checkinApi";
import { HttpError } from "../api/httpError";
import type { CheckinMethodName } from "@gym-checkin/shared";
import type {
  CheckinRequestStatus,
  OpenSession,
  OpenSessionDto,
} from "../types/checkin";

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

/** Outcome of scanning the reception QR. Errors are thrown with a message. */
export type QrCheckinResult =
  | { status: "checked-in"; session: OpenSession }
  // Scanned while already inside (e.g. on the way out): not an error
  | { status: "already-in" };

function qrErrorMessage(err: unknown): string {
  // 403 here means the token is too old (the login took a while) or forged
  if (err instanceof HttpError && err.status === 403) {
    return "O código expirou. Volta a ler o QR no ecrã da receção.";
  }
  return errorMessage(err);
}

export const checkinService = {
  getOpenSession: async (): Promise<OpenSession | null> => {
    const { session } = await withMessage(checkinApi.getCurrent());
    return session ? toOpenSession(session) : null;
  },

  /** Check-in from the QR link: proof of presence is the token. */
  checkInWithQr: async (token: string): Promise<QrCheckinResult> => {
    try {
      const dto = await checkinApi.checkIn({ method: "SCREEN_QR", token });
      return { status: "checked-in", session: toOpenSession(dto) };
    } catch (err) {
      if (err instanceof HttpError && err.status === 409) {
        return { status: "already-in" };
      }
      throw new Error(qrErrorMessage(err), { cause: err });
    }
  },

  checkOut: async (): Promise<void> => withMessage(checkinApi.checkOut()),

  /** Which buttons to show; the API re-checks on every action anyway. */
  getEnabledMethods: async (): Promise<CheckinMethodName[]> =>
    (await withMessage(checkinApi.getMethods())).enabledMethods,

  /** Method B: ask reception to let the user in. */
  requestEntry: async (): Promise<void> => {
    try {
      await checkinApi.createRequest();
    } catch (err) {
      if (err instanceof HttpError && err.status === 409) {
        throw new Error(
          "Já tens um pedido à espera, ou já estás no ginásio.",
          { cause: err },
        );
      }
      throw new Error(errorMessage(err), { cause: err });
    }
  },

  /** Status of the user's latest request, or null if they never asked. */
  getMyRequestStatus: async (): Promise<CheckinRequestStatus | null> =>
    (await withMessage(checkinApi.getMyRequest())).request?.status ?? null,
};

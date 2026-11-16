import type { CheckinMethodName } from "@gym-checkin/shared";
import { checkinApi } from "../api/checkinApi";
import { HttpError } from "../api/httpError";
import { TranslatableError, type MessageKey } from "../i18n/types";
import type {
  CheckinRequestStatus,
  OpenSession,
  OpenSessionDto,
} from "../types/checkin";

const toOpenSession = (dto: OpenSessionDto): OpenSession => ({
  id: dto.id,
  entryAt: new Date(dto.entryAt),
});

/** Which message explains a failed check-in/checkout (shown in the user's language). */
function errorKey(err: unknown): MessageKey {
  if (err instanceof HttpError) {
    if (err.status === 409) return "errors.checkin.stateChanged";
    if (err.status === 403) return "errors.checkin.methodDisabled";
    if (err.status === 429) return "errors.tooManyRequests";
  }
  return "errors.unexpected";
}

/** Rethrows as a TranslatableError, keeping the HttpError as `cause`. */
async function withMessage<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (err) {
    throw new TranslatableError(errorKey(err), undefined, { cause: err });
  }
}

/** Outcome of scanning the reception QR. Errors are thrown as TranslatableError. */
export type QrCheckinResult =
  | { status: "checked-in"; session: OpenSession }
  // Scanned while already inside (e.g. on the way out): not an error
  | { status: "already-in" };

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
      // 403 here means the token is too old (the login took a while) or forged
      const key =
        err instanceof HttpError && err.status === 403 ? "errors.checkin.qrExpired" : errorKey(err);
      throw new TranslatableError(key, undefined, { cause: err });
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
      const key =
        err instanceof HttpError && err.status === 409
          ? "errors.checkin.alreadyPending"
          : errorKey(err);
      throw new TranslatableError(key, undefined, { cause: err });
    }
  },

  /** Status of the user's latest request, or null if they never asked. */
  getMyRequestStatus: async (): Promise<CheckinRequestStatus | null> =>
    (await withMessage(checkinApi.getMyRequest())).request?.status ?? null,
};

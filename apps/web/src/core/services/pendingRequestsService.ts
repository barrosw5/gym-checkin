import { adminRequestsApi } from "../api/adminRequestsApi";
import { HttpError } from "../api/httpError";
import { TranslatableError, type MessageKey } from "../i18n/types";
import type {
  PendingRequest,
  PendingRequestDto,
  RequestDecision,
} from "../types/requests";

const toPendingRequest = (dto: PendingRequestDto): PendingRequest => ({
  id: dto.id,
  createdAt: new Date(dto.createdAt),
  name: dto.user.name,
  room: dto.user.room,
});

function decisionErrorKey(err: unknown): MessageKey {
  if (err instanceof HttpError) {
    if (err.status === 409 && err.message === "The student is already in the gym") {
      return "errors.requests.studentInside";
    }
    // Decided by a colleague, or expired, or gone
    if (err.status === 409 || err.status === 404) return "errors.requests.notPending";
  }
  return "errors.unexpected";
}

export const pendingRequestsService = {
  /** Live pending list. Returns a function that stops listening. */
  subscribe: (
    onChange: (list: PendingRequest[]) => void,
    onConnectionLost: () => void,
  ): (() => void) =>
    adminRequestsApi.openStream(
      (list) => onChange(list.map(toPendingRequest)),
      onConnectionLost,
    ),

  decide: async (id: string, decision: RequestDecision): Promise<void> => {
    try {
      await adminRequestsApi.decide(id, decision);
    } catch (err) {
      throw new TranslatableError(decisionErrorKey(err), undefined, { cause: err });
    }
  },
};

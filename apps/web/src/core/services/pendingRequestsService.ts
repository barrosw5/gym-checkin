import { adminRequestsApi } from "../api/adminRequestsApi";
import { HttpError } from "../api/httpError";
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

function decisionErrorMessage(err: unknown): string {
  if (err instanceof HttpError) {
    if (err.status === 409 && err.message.includes("already in the gym")) {
      return "Este estudante já está no ginásio.";
    }
    // Decided by a colleague, or expired, or gone
    if (err.status === 409 || err.status === 404) {
      return "Este pedido já não está pendente.";
    }
  }
  return "Não foi possível concluir. Tenta outra vez.";
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
      throw new Error(decisionErrorMessage(err), { cause: err });
    }
  },
};

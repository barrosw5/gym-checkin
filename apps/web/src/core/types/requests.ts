// Mirrors the API's PendingCheckinRequest (dates arrive as ISO strings)
export interface PendingRequestDto {
  id: string;
  createdAt: string;
  expiresAt: string;
  user: { name: string; room: string };
}

/** A pending request with its dates parsed, as the reception list shows it. */
export interface PendingRequest {
  id: string;
  createdAt: Date;
  name: string;
  room: string;
}

export type RequestDecision = "approve" | "reject";

// Mirrors the API's OpenSession (dates arrive as ISO strings in JSON)
export interface OpenSessionDto {
  id: string;
  entryAt: string;
}

/** A session in progress, with the date already parsed by the service. */
export interface OpenSession {
  id: string;
  entryAt: Date;
}

export type CheckinRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

// Mirrors the API's MyCheckinRequest (method B: asking reception)
export interface MyCheckinRequestDto {
  id: string;
  status: CheckinRequestStatus;
  createdAt: string;
  expiresAt: string;
}

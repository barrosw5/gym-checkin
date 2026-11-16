// Mirrors the API's session as reception sees it (dates as ISO strings)
export interface AdminSessionDto {
  id: string;
  entryAt: string;
  exitAt: string | null;
  method: string;
  closedBy: string | null;
  user: { name: string; room: string };
}

/** A session with parsed dates, as the reception list shows it. */
export interface AdminSession {
  id: string;
  entryAt: Date;
  exitAt: Date | null;
  closedBy: string | null;
  name: string;
  room: string;
}

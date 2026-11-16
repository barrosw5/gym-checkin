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

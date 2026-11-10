export type Role = "STUDENT" | "RECEPTION" | "ADMIN";

// Mirrors what GET /auth/me returns (passwordHash is never sent by the API)
export interface User {
  id: string;
  name: string;
  room: string;
  username: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

// Mirrors GET /api/admin/qr/current (dates arrive as ISO strings in JSON)
export interface QrTokenDto {
  token: string;
  refreshAt: string;
  windowSeconds: number;
}

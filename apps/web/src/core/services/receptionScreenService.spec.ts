import { afterEach, describe, expect, it, vi } from "vitest";
import { qrApi } from "../api/qrApi";
import { checkinUrl, receptionScreenService, secondsUntil } from "./receptionScreenService";

describe("receptionScreenService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("builds an absolute check-in link with the token escaped", () => {
    expect(checkinUrl("https://gym.test", "a/b")).toBe("https://gym.test/c/a%2Fb");
  });

  it("dates the next code from this device's clock, whatever it says", async () => {
    vi.useFakeTimers({ now: 1_000 });
    vi.spyOn(qrApi, "getCurrent").mockResolvedValue({
      token: "t",
      refreshAt: "2026-01-01T00:00:30.000Z",
      windowSeconds: 30,
      secondsLeft: 12.5,
    });

    await expect(receptionScreenService.getQr("https://gym.test")).resolves.toEqual({
      url: "https://gym.test/c/t",
      expiresAt: 13_500,
      windowSeconds: 30,
    });
  });

  it.each([
    [10_000, 0, 10],
    [10_000, 9_001, 1],
    [10_000, 10_000, 0],
    [10_000, 12_000, 0],
  ])("counts whole seconds until %i at %i", (expiresAt, now, seconds) => {
    expect(secondsUntil(expiresAt, now)).toBe(seconds);
  });
});

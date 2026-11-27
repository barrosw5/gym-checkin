import { afterEach, describe, expect, it, vi } from "vitest";
import { demoApi } from "../api/demoApi";
import { HttpError } from "../api/httpError";
import { demoService } from "./demoService";

describe("demoService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gives the occupancy of an open demo, marking a full gym", async () => {
    vi.spyOn(demoApi, "getStatus").mockResolvedValue({ enabled: true, occupancy: { count: 10, capacity: 10 } });

    await expect(demoService.getOccupancy()).resolves.toEqual({ count: 10, capacity: 10, isFull: true });
  });

  it("gives null when there is no demo", async () => {
    vi.spyOn(demoApi, "getStatus").mockResolvedValue({ enabled: false });

    await expect(demoService.getOccupancy()).resolves.toBeNull();
  });

  it("gives null instead of failing when the API does not answer", async () => {
    vi.spyOn(demoApi, "getStatus").mockRejectedValue(new Error("offline"));

    await expect(demoService.getOccupancy()).resolves.toBeNull();
  });

  it.each([
    [429, "errors.tooManyRequests"],
    [404, "errors.login.failed"],
  ])("turns a %i on demo login into a message", async (status, key) => {
    vi.spyOn(demoApi, "login").mockRejectedValue(new HttpError(status, "no"));

    await expect(demoService.login("STUDENT")).rejects.toMatchObject({ key });
  });
});

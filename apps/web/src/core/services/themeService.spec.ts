import { afterEach, describe, expect, it, vi } from "vitest";
import { themeService } from "./themeService";

// Node has no localStorage or matchMedia: tiny fakes with what the service uses
const fakeStorage = (saved: string | null) => ({ getItem: () => saved, setItem: vi.fn() });
const blockedStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

describe("themeService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the saved choice", () => {
    vi.stubGlobal("localStorage", fakeStorage("dark"));
    expect(themeService.getSavedTheme()).toBe("dark");
  });

  it.each([null, "", "blue"])("ignores %o, so the device decides", (saved) => {
    vi.stubGlobal("localStorage", fakeStorage(saved));
    expect(themeService.getSavedTheme()).toBeNull();
  });

  it("survives blocked storage", () => {
    vi.stubGlobal("localStorage", blockedStorage);
    expect(themeService.getSavedTheme()).toBeNull();
    expect(() => themeService.saveTheme("light")).not.toThrow();
  });

  it.each([
    [true, "dark"],
    [false, "light"],
  ])("reads the device theme (prefers dark: %s)", (matches, expected) => {
    vi.stubGlobal("matchMedia", () => ({ matches }));
    expect(themeService.getSystemTheme()).toBe(expected);
  });

  it("reports device changes until cleaned up", () => {
    const query = Object.assign(new EventTarget(), { matches: false });
    vi.stubGlobal("matchMedia", () => query);
    const onChange = vi.fn();

    const stop = themeService.watchSystemTheme(onChange);
    query.matches = true;
    query.dispatchEvent(new Event("change"));
    stop();
    query.dispatchEvent(new Event("change"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("dark");
  });
});

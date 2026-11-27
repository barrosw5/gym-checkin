import { describe, expect, it } from "vitest";
import { navItems } from "./navigation";

const paths = (role: Parameters<typeof navItems>[0]) => navItems(role).map((i) => i.to);

describe("navItems", () => {
  it("gives students their home and the statistics, no staff pages", () => {
    expect(paths("STUDENT")).toEqual(["/dashboard", "/stats"]);
  });

  it("gives reception the desk, statistics and the QR screen, no accounts", () => {
    expect(paths("RECEPTION")).toEqual(["/reception", "/stats", "/reception/screen"]);
  });

  it("gives the admin everything reception has, plus accounts", () => {
    expect(paths("ADMIN")).toEqual(["/reception", "/stats", "/admin", "/reception/screen"]);
  });

  it("opens only the QR screen in a new tab", () => {
    expect(navItems("ADMIN").filter((i) => i.newTab).map((i) => i.to)).toEqual(["/reception/screen"]);
  });
});

import { describe, expect, it } from "vitest";
import type { AdminUser } from "../types/adminUsers";
import { filterUsers } from "./filterUsers";

const user = (name: string, username: string, room: string): AdminUser => ({
  id: username,
  name,
  username,
  room,
  role: "STUDENT",
  active: true,
});
const users = [user("Inês Rocha", "ines.rocha", "318"), user("Rui Costa", "rui.costa", "102")];
const found = (query: string) => filterUsers(users, query).map((u) => u.username);

describe("filterUsers", () => {
  it("ignores accents and capitals", () => {
    expect(found("INES")).toEqual(["ines.rocha"]);
    expect(found("inês")).toEqual(["ines.rocha"]);
  });

  it("searches the username and the member number too", () => {
    expect(found("rui.c")).toEqual(["rui.costa"]);
    expect(found("318")).toEqual(["ines.rocha"]);
  });

  it("shows everyone for an empty search, nobody for no match", () => {
    expect(found("  ")).toHaveLength(2);
    expect(found("zzz")).toEqual([]);
  });
});

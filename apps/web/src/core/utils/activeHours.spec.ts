import { describe, expect, it } from "vitest";
import { activeHours } from "./activeHours";

const week = (busy: Record<number, number[]>) =>
  Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => (busy[day]?.includes(hour) ? 1 : 0)),
  );

describe("activeHours", () => {
  it("goes from the first to the last busy hour of any day, gaps included", () => {
    expect(activeHours(week({ 0: [7, 8], 5: [11] }))).toEqual([7, 8, 9, 10, 11]);
  });

  it("shows the whole day when nobody came", () => {
    expect(activeHours(week({}))).toHaveLength(24);
  });
});

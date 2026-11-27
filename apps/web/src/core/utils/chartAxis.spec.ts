import { describe, expect, it } from "vitest";
import { chartAxis } from "./chartAxis";

const day = (today: (minute: number) => number | null, typical: (minute: number) => number | null = () => 0) =>
  Array.from({ length: 1441 }, (_, minute) => ({ minute, today: today(minute), typical: typical(minute) }));

describe("chartAxis", () => {
  it("covers the busy hours, widened to 3-hour ticks", () => {
    const rows = day((m) => (m >= 430 && m <= 1300 ? 2 : 0));

    expect(chartAxis(rows)).toEqual({
      domain: [360, 1440],
      ticks: [360, 540, 720, 900, 1080, 1260, 1440],
    });
  });

  it("counts the typical day too, for the hours still ahead today", () => {
    const rows = day(
      (m) => (m >= 600 && m <= 660 ? 1 : null),
      (m) => (m >= 540 && m <= 1200 ? 0.5 : 0),
    );

    expect(chartAxis(rows).domain).toEqual([540, 1260]);
  });

  it("shows the whole day when nobody came", () => {
    expect(chartAxis(day(() => 0)).domain).toEqual([0, 1440]);
  });
});

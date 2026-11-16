import { Injectable } from '@nestjs/common';
import { RESIDENCE_TIME_ZONE, type StatsRange, type StatsSummary } from '@gym-checkin/shared';
import { ClosedBy } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { heatmap, typicalDay, visitDuration } from './aggregate.js';
import { occupancyCurve } from './occupancy-curve.js';
import { averageOccupancyBySlot, type SessionSpan } from './occupancy-slots.js';
import { statsWindow } from './stats-window.js';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /** Aggregates only (GDPR): the query reads times, never who. */
  async summary(range: StatsRange, now = new Date()): Promise<StatsSummary> {
    const { from, to } = statsWindow(range, now, RESIDENCE_TIME_ZONE);

    const rows = await this.prisma.session.findMany({
      where: {
        // Every visit that overlaps the period, still open ones included.
        // now, not to: to is floored to 15 min, and today's curve needs the latest entries
        entryAt: { lt: now },
        AND: [
          { OR: [{ exitAt: null }, { exitAt: { gt: from } }] },
          // Auto-closed visits are forgotten keys, not real times (CLAUDE.md).
          // closedBy is null while a visit is open: "not AUTO" alone would drop those
          { OR: [{ closedBy: null }, { closedBy: { not: ClosedBy.AUTO } }] },
        ],
      },
      select: { entryAt: true, exitAt: true },
    });

    // Still inside: count them until now
    const spans: SessionSpan[] = rows.map((r) => ({ entryAt: r.entryAt, exitAt: r.exitAt ?? now }));
    const slots = averageOccupancyBySlot(spans, from, to, RESIDENCE_TIME_ZONE);
    // Durations: only visits that started in the period and are over
    const finished = rows.filter(
      (r): r is { entryAt: Date; exitAt: Date } => r.exitAt !== null && r.entryAt >= from,
    );

    return {
      range,
      from: from.toISOString(),
      to: to.toISOString(),
      typicalDay: typicalDay(slots),
      heatmap: heatmap(slots),
      duration: visitDuration(finished),
      today: occupancyCurve(spans, statsWindow('today', now, RESIDENCE_TIME_ZONE).from, now).map((p) => ({
        at: p.at.toISOString(),
        count: p.count,
      })),
    };
  }
}

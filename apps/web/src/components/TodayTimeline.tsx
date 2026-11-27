import type { AdminSession } from "../core/types/adminSessions";
import { cn } from "../core/utils/cn";
import { formatMinute, formatTime } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";

export interface TodayTimelineProps {
  sessions: AdminSession[];
  /** Open visits are drawn up to now. */
  now: Date;
}

const minuteOf = (date: Date) => date.getHours() * 60 + date.getMinutes();
const TICK_MINUTES = 180;

/**
 * Staff only: today's visits as bars on one time axis (a Gantt), the
 * exact picture behind the occupancy curve. Names are fine here: the same
 * people already see them in the list (GDPR: never shown to students).
 */
export default function TodayTimeline({ sessions, now }: TodayTimelineProps) {
  const { t, languageTag } = useTranslation();
  const nowMinute = minuteOf(now);
  // Oldest first: reads top to bottom like the day went
  const visits = [...sessions].sort((a, b) => a.entryAt.getTime() - b.entryAt.getTime());
  // A visit that began yesterday starts at the left edge
  const startOf = (s: AdminSession) => (s.entryAt.toDateString() === now.toDateString() ? minuteOf(s.entryAt) : 0);
  // The axis starts near the first visit: no room wasted on the empty night
  const from = Math.floor(Math.min(...visits.map(startOf), 1440 - TICK_MINUTES) / TICK_MINUTES) * TICK_MINUTES;
  const percent = (minutes: number) => `${(minutes / (1440 - from)) * 100}%`;
  const ticks = Array.from({ length: (1440 - from) / TICK_MINUTES + 1 }, (_, i) => from + i * TICK_MINUTES);

  return (
    <div>
      <ol className="flex flex-col gap-1.5">
        {visits.map((s) => {
          const start = startOf(s);
          const end = s.exitAt ? minuteOf(s.exitAt) : nowMinute;
          const label = t("sessions.timelineLabel", {
            name: s.name,
            from: formatTime(s.entryAt, languageTag),
            to: s.exitAt ? formatTime(s.exitAt, languageTag) : t("sessions.timelineNow"),
          });
          return (
            <li key={s.id} className="grid grid-cols-[6rem_1fr] items-center gap-2 text-sm">
              <span className="truncate text-ink-2" aria-hidden="true">
                {s.name}
              </span>
              <span className="relative h-4 rounded-sm bg-raised">
                <span className="sr-only">{label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0 rounded-sm",
                    s.exitAt ? "bg-data/45" : "bg-data",
                    s.closedBy === "AUTO" && "bg-warn-solid/70",
                  )}
                  // Dynamic: where the bar starts and how long it is (at least visible)
                  style={{ left: percent(start - from), width: `max(3px, ${percent(Math.max(0, end - start))})` }}
                  title={label}
                />
              </span>
            </li>
          );
        })}
      </ol>
      {/* Sticky: the hours stay visible while the visits scroll */}
      <div aria-hidden="true" className="sticky bottom-0 grid grid-cols-[6rem_1fr] gap-2 bg-surface pt-2 text-xs text-ink-3 tabular-nums">
        <span />
        <span className="flex justify-between">
          {ticks.map((minute) => (
            <span key={minute}>{formatMinute(minute)}</span>
          ))}
        </span>
      </div>
    </div>
  );
}

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
const TICKS = [0, 360, 720, 1080, 1440];

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
  const percent = (minute: number) => `${(minute / 1440) * 100}%`;

  return (
    <div>
      <ol className="flex flex-col gap-1.5">
        {visits.map((s) => {
          // A visit that began yesterday starts at the left edge
          const start = s.entryAt.toDateString() === now.toDateString() ? minuteOf(s.entryAt) : 0;
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
                  style={{ left: percent(start), width: `max(3px, ${percent(Math.max(0, end - start))})` }}
                  title={label}
                />
              </span>
            </li>
          );
        })}
      </ol>
      <div aria-hidden="true" className="mt-2 grid grid-cols-[6rem_1fr] gap-2 text-xs text-ink-3 tabular-nums">
        <span />
        <span className="flex justify-between">
          {TICKS.map((minute) => (
            <span key={minute}>{formatMinute(minute)}</span>
          ))}
        </span>
      </div>
    </div>
  );
}

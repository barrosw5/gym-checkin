import { cn } from "../../core/utils/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  /** Names the group for screen readers (e.g. "Period"). */
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * A few mutually exclusive choices side by side (period, list/timeline).
 * Buttons with aria-pressed: simple, and every option is one Tab stop.
 */
export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex rounded-lg bg-slate-100 p-0.5 text-sm", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              // Looks 36 px; the invisible ::before makes the tap area 44 px
              "relative h-9 rounded-md px-3 whitespace-nowrap transition-colors duration-150 before:absolute before:inset-x-0 before:-inset-y-1",
              active
                ? "bg-white font-medium text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

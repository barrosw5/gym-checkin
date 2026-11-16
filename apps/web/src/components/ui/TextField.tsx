import { useId, type InputHTMLAttributes } from "react";
import { cn } from "../../core/utils/cn";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Always visible above the input (a placeholder is not a label). */
  label: string;
  /** Shown under the input and linked to it for screen readers. */
  error?: string;
}

export default function TextField({ label, error, className, ...rest }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          // text-base: 16 px stops iOS from zooming in when the field gets focus
          "h-11 rounded-lg bg-white px-3 text-base text-slate-900 ring-1 ring-inset",
          "transition-[box-shadow] duration-150 focus:outline-none focus:ring-2",
          error ? "ring-red-700" : "ring-slate-900/15 focus:ring-navy-500",
        )}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

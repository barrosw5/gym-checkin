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
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          // text-base: 16 px stops iOS from zooming in when the field gets focus
          "min-h-11 rounded-xl border bg-white px-3 text-base text-slate-900",
          error ? "border-red-700" : "border-slate-300 focus:border-navy-500",
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

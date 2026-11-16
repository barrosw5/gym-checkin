import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../core/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Takes the whole width: the main action on a phone screen. */
  fullWidth?: boolean;
  /** A request is in flight: disabled, with a spinner, announced as busy. */
  loading?: boolean;
}

// Navy is the one accent: only the primary action is filled with it
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-navy-700 text-white hover:bg-navy-800",
  secondary: "bg-white text-slate-900 ring-1 ring-inset ring-slate-900/15 hover:bg-slate-100",
  danger: "bg-white text-red-700 ring-1 ring-inset ring-red-700/30 hover:bg-red-50",
  ghost: "text-navy-700 hover:bg-navy-50",
};

const SIZES: Record<ButtonSize, string> = {
  // sm stays 36 px: secondary row actions on the reception PC
  sm: "h-9 px-3 text-sm",
  // 44 px: the minimum touch target on a phone (WCAG 2.5.8)
  md: "h-11 px-4 text-[15px]",
  lg: "h-12 px-5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      // type="button" by default: a button inside a form must not submit by accident
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium",
        "transition-[background-color,color,transform] duration-150 ease-(--ease-out) active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

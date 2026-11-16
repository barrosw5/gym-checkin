import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../core/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "ghost";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Takes the whole width: the main action on a phone screen. */
  fullWidth?: boolean;
  /** A request is in flight: disabled, with a spinner, announced as busy. */
  loading?: boolean;
}

// Every text/background pair here is checked for WCAG AA contrast
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-navy-700 text-white hover:bg-navy-800",
  secondary: "border-2 border-navy-700 bg-white text-navy-700 hover:bg-navy-50",
  success: "bg-green-700 text-white hover:bg-green-800",
  warning: "bg-ember-700 text-white hover:bg-ember-700/90",
  danger: "bg-red-700 text-white hover:bg-red-800",
  ghost: "text-navy-700 underline-offset-4 hover:underline",
};

const SIZES: Record<ButtonSize, string> = {
  // min-h-11 = 44 px: the minimum touch target on a phone (WCAG 2.5.8)
  md: "min-h-11 px-4 text-base",
  lg: "min-h-14 px-6 text-lg",
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
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
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

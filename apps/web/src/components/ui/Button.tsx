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

// Lime is the one accent: only the primary action is filled with it
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "bg-surface text-ink ring-1 ring-inset ring-line-strong hover:bg-raised",
  danger: "bg-surface text-danger ring-1 ring-inset ring-danger/30 hover:bg-danger-soft",
  ghost: "text-accent-ink hover:bg-accent-soft",
};

const SIZES: Record<ButtonSize, string> = {
  // sm looks 36 px (compact row actions), but an invisible ::before adds 4 px
  // above and below, so the area you can tap is still 44 px
  sm: "relative h-9 px-3 text-sm before:absolute before:inset-x-0 before:-inset-y-1",
  // 44 px: the touch target the project asks for (WCAG 2.5.5, "AAA")
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

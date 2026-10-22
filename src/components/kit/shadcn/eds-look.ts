// EDS's measurements and colours as plain Tailwind classes, for dressing shadcn (and the Test
// registry's) components so they render identically to @adaptavant/eds-core. Colours read EDS's own
// CSS variables (set by its Root on <html>), so a brand or theme change reaches all three kits.
// Values were read from eds-core's rendered DOM. Classes are written out in full so Tailwind finds them.
import type { ButtonSize, ButtonVariant } from "../types";

/** EDS Button: rounded-full, 1px border, text-body-12/14 with a font-strong label, focus-ring. */
export const edsButtonBase = [
  "relative gap-1 rounded-full border border-solid shadow-none transition-colors duration-300 ease-[ease] whitespace-nowrap font-normal",
  "focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-offset-1",
  "focus-visible:ring-[color:var(--border-focus)] focus-visible:ring-offset-[color:var(--background-neutral)]",
  "disabled:opacity-100 disabled:cursor-default",
].join(" ");

export const edsButtonSize: Record<ButtonSize, { button: string; square: string; icon: string }> = {
  small: { button: "h-6 px-3 py-0 text-[12px] leading-[20px]", square: "h-6 w-6 p-0", icon: "[&_svg]:size-4" },
  standard: { button: "h-8 px-4 py-0 text-[12px] leading-[20px]", square: "h-8 w-8 p-0", icon: "[&_svg]:size-4" },
  large: { button: "h-10 px-5 py-0 text-[14px] leading-[22px]", square: "h-10 w-10 p-0", icon: "[&_svg]:size-5" },
  xLarge: { button: "h-12 px-6 py-0 text-[14px] leading-[22px]", square: "h-12 w-12 p-0", icon: "[&_svg]:size-5" },
};

/** Colours per EDS variant, including hover, pressed (active / aria-pressed / open menu) and disabled. */
export const edsButtonVariant: Record<ButtonVariant, string> = {
  accentPrimary: "border-transparent bg-[color:var(--background-accent)] text-[color:var(--text-onPrimary)] hover:text-[color:var(--text-onPrimary)] hover:bg-[color:var(--background-accent-hover)] active:bg-[color:var(--background-accent-pressed)] aria-pressed:bg-[color:var(--background-accent-pressed)] disabled:bg-[color:var(--background-neutral-disabled)] disabled:text-[color:var(--text-onPrimary-disabled)]",
  accentSecondary: "border-[color:var(--border-accent)] bg-transparent text-[color:var(--text-accent)] hover:border-transparent hover:bg-[color:var(--background-accent-hover)] hover:text-[color:var(--text-onPrimary)] active:bg-[color:var(--background-accent-pressed)] disabled:border-[color:var(--border-secondary)] disabled:text-[color:var(--text-disabled)]",
  criticalPrimary: "border-transparent bg-[color:var(--background-critical)] text-[color:var(--text-critical-onPrimary)] hover:text-[color:var(--text-critical-onPrimary)] hover:bg-[color:var(--background-critical-hover)] active:bg-[color:var(--background-critical-pressed)] disabled:bg-[color:var(--background-neutral-disabled)] disabled:text-[color:var(--text-onPrimary-disabled)]",
  criticalSecondary: "border-[color:var(--border-secondary)] bg-[color:var(--background-neutral)] text-[color:var(--text-critical)] hover:border-transparent hover:bg-[color:var(--background-critical-secondary-hover)] hover:text-[color:var(--text-critical)] active:border-transparent active:bg-[color:var(--background-critical-secondary-pressed)] disabled:text-[color:var(--text-disabled)]",
  criticalTertiary: "border-transparent bg-transparent text-[color:var(--text-critical)] hover:bg-[color:var(--background-critical-secondary-hover)] hover:text-[color:var(--text-critical)] active:bg-[color:var(--background-critical-secondary-pressed)] disabled:text-[color:var(--text-disabled)]",
  inversePrimary: "border-transparent bg-[color:var(--background-neutral)] text-[color:var(--text-primary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--background-neutral-hover)] active:bg-[color:var(--background-neutral-pressed)] disabled:text-[color:var(--text-disabled)]",
  neutralPrimary: "border-[color:var(--border-secondary)] bg-[color:var(--background-neutral)] text-[color:var(--text-primary)] hover:border-transparent hover:bg-[color:var(--background-inverse-hover)] hover:text-[color:var(--text-inverse)] active:border-transparent active:bg-[color:var(--background-inverse-pressed)] active:text-[color:var(--text-inverse)] aria-pressed:border-transparent aria-pressed:bg-[color:var(--background-inverse-pressed)] aria-pressed:text-[color:var(--text-inverse)] disabled:text-[color:var(--text-disabled)]",
  neutralSecondary: "border-[color:var(--border-secondary)] bg-[color:var(--background-neutral)] text-[color:var(--text-primary)] hover:border-transparent hover:bg-[color:var(--background-neutral-hover)] hover:text-[color:var(--text-primary)] active:border-transparent active:bg-[color:var(--background-neutral-pressed)] aria-pressed:border-transparent aria-pressed:bg-[color:var(--background-neutral-pressed)] disabled:text-[color:var(--text-disabled)]",
  neutralSecondaryIntense: "border-[color:var(--border-primary)] bg-[color:var(--background-neutral)] text-[color:var(--text-primary)] hover:border-transparent hover:bg-[color:var(--background-inverse-hover)] hover:text-[color:var(--text-inverse)] active:border-transparent active:bg-[color:var(--background-inverse-pressed)] active:text-[color:var(--text-inverse)] aria-pressed:border-transparent aria-pressed:bg-[color:var(--background-inverse-pressed)] aria-pressed:text-[color:var(--text-inverse)] disabled:border-[color:var(--border-secondary)] disabled:text-[color:var(--text-disabled)]",
  neutralTertiary: "border-transparent bg-transparent text-[color:var(--text-secondary)] hover:bg-[color:var(--background-neutral-hover)] hover:text-[color:var(--text-secondary)] active:bg-[color:var(--background-neutral-pressed)] aria-pressed:bg-[color:var(--background-neutral-pressed)] disabled:text-[color:var(--text-disabled)]",
};

// Stand-in for the EDS Button until @adaptavant/eds-core can be installed.
// Same props as https://earth.anywhere.co/components/button, so the swap is:
//   export { Button } from "@adaptavant/eds-core";
import type { ComponentType, ReactNode, SVGProps } from "react";

export type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type ButtonVariant =
  | "accentPrimary"
  | "accentSecondary"
  | "criticalPrimary"
  | "criticalSecondary"
  | "criticalTertiary"
  | "inversePrimary"
  | "neutralPrimary"
  | "neutralSecondary"
  | "neutralSecondaryIntense"
  | "neutralTertiary";

export type ButtonSize = "small" | "standard" | "large" | "xLarge";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconStart?: Icon;
  iconEnd?: Icon;
  loadingLabel?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isPressed?: boolean;
  children?: ReactNode;
  id?: string;
  type?: "button" | "submit" | "reset";
  form?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  /** Not in EDS: used only by IconButton below for the accessible name. */
  "aria-label"?: string;
};

const variants: Record<ButtonVariant, string> = {
  accentPrimary: "bg-neutral-900 text-white hover:bg-neutral-700",
  accentSecondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
  criticalPrimary: "bg-[#b4432f] text-white hover:bg-[#9c3a29]",
  criticalSecondary: "border border-[#b4432f] text-[#b4432f] hover:bg-[#fbecea]",
  criticalTertiary: "text-[#b4432f] hover:bg-[#fbecea]",
  inversePrimary: "bg-white text-neutral-900 hover:bg-neutral-100",
  neutralPrimary: "bg-neutral-900 text-white hover:bg-neutral-800",
  neutralSecondary: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
  neutralSecondaryIntense: "border border-neutral-500 bg-white text-neutral-900 hover:bg-neutral-50",
  neutralTertiary: "text-neutral-800 hover:bg-neutral-100",
};

const sizes: Record<ButtonSize, { button: string; icon: string; square: string }> = {
  small: { button: "h-8 px-3 text-sm gap-1.5", icon: "h-4 w-4", square: "h-8 w-8" },
  standard: { button: "h-10 px-4 text-[15px] gap-2", icon: "h-5 w-5", square: "h-10 w-10" },
  large: { button: "h-12 px-5 text-[17px] gap-2", icon: "h-5 w-5", square: "h-12 w-12" },
  xLarge: { button: "h-14 px-6 text-lg gap-2.5", icon: "h-6 w-6", square: "h-14 w-14" },
};

export function Button({
  variant = "accentPrimary",
  size = "standard",
  iconStart: IconStart,
  iconEnd: IconEnd,
  loadingLabel,
  isDisabled = false,
  isLoading = false,
  isPressed,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const s = sizes[size];
  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      aria-pressed={isPressed}
      aria-busy={isLoading || undefined}
      className={`relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] disabled:cursor-not-allowed disabled:opacity-40 ${
        variants[variant]
      } ${s.button} ${isPressed ? "ring-2 ring-inset ring-neutral-900/20" : ""}`}
      {...rest}
    >
      <span className={`inline-flex items-center gap-[inherit] ${isLoading ? "invisible" : ""}`}>
        {IconStart && <IconStart className={s.icon} />}
        {children}
        {IconEnd && <IconEnd className={s.icon} />}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center" role="status" aria-label={loadingLabel ?? "Loading"}>
          <span className={`${s.icon} animate-spin rounded-full border-2 border-current border-t-transparent`} />
        </span>
      )}
    </button>
  );
}

/** Round icon-only button. Check `edscli search icon button` for the EDS equivalent before swapping. */
export function IconButton({
  icon: IconComponent,
  label,
  variant = "neutralTertiary",
  size = "standard",
  ...rest
}: Omit<ButtonProps, "children" | "iconStart" | "iconEnd"> & { icon: Icon; label: string }) {
  const s = sizes[size];
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={rest.isDisabled}
      onClick={rest.onClick}
      aria-expanded={rest["aria-expanded"]}
      aria-haspopup={rest["aria-haspopup"]}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] ${variants[variant]} ${s.square}`}
    >
      <IconComponent className={s.icon} />
    </button>
  );
}

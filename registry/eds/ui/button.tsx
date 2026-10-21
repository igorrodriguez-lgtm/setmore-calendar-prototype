import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// EDS Button on shadcn structure: EDS prop names and variants, shadcn theme tokens for colour.
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        accentPrimary: "bg-primary text-primary-foreground hover:bg-primary/85",
        accentSecondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        neutralPrimary: "bg-foreground text-background hover:bg-foreground/85",
        neutralSecondary: "border border-input bg-background hover:bg-accent",
        neutralSecondaryIntense: "border border-foreground bg-background hover:bg-accent",
        neutralTertiary: "hover:bg-accent",
        criticalPrimary: "bg-destructive text-white hover:bg-destructive/90",
        criticalSecondary: "border border-destructive text-destructive hover:bg-destructive/10",
        criticalTertiary: "text-destructive hover:bg-destructive/10",
        inversePrimary: "bg-background text-foreground hover:bg-background/90",
      },
      size: {
        small: "h-7 px-3 text-xs [&_svg]:size-3.5",
        standard: "h-9 px-4 text-sm [&_svg]:size-4",
        large: "h-10 px-5 text-sm [&_svg]:size-5",
        xLarge: "h-12 px-6 text-base [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "accentPrimary", size: "standard" },
  }
);

type Variant = NonNullable<Parameters<typeof buttonVariants>[0]>["variant"];
type Size = NonNullable<Parameters<typeof buttonVariants>[0]>["size"];
type IconType = React.ComponentType<{ className?: string }>;

export type ButtonProps = Omit<React.ComponentProps<"button">, "disabled"> & {
  variant?: Variant;
  size?: Size;
  /** Icon component (not an element) shown before the label, e.g. iconStart={PlusIcon}. */
  iconStart?: IconType;
  iconEnd?: IconType;
  isDisabled?: boolean;
  /** Shows a spinner in place of the label and keeps the button's width. */
  isLoading?: boolean;
  loadingLabel?: string;
  isPressed?: boolean;
  /** Render the child element (e.g. a link) with button styles. */
  asChild?: boolean;
};

function Button({
  className,
  variant,
  size,
  iconStart: IconStart,
  iconEnd: IconEnd,
  isDisabled,
  isLoading,
  loadingLabel = "Loading",
  isPressed,
  asChild,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), isPressed && "bg-accent", className);
  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    );
  }
  return (
    <button type={type} className={classes} disabled={isDisabled || isLoading} aria-pressed={isPressed} aria-busy={isLoading || undefined} {...props}>
      <span className={cn("inline-flex items-center gap-[inherit]", isLoading && "invisible")}>
        {IconStart && <IconStart />}
        {children}
        {IconEnd && <IconEnd />}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center" role="status" aria-label={loadingLabel}>
          <Loader2 className="animate-spin" />
        </span>
      )}
    </button>
  );
}

export type IconButtonProps = Omit<ButtonProps, "iconStart" | "iconEnd" | "children" | "asChild"> & {
  icon: IconType;
  "aria-label": string;
};

/** Round, icon-only button. aria-label is required. */
function IconButton({ icon: Icon, className, size = "standard", variant, ...props }: IconButtonProps) {
  const square = { small: "w-7 px-0", standard: "w-9 px-0", large: "w-10 px-0", xLarge: "w-12 px-0" }[size ?? "standard"];
  return (
    <Button {...props} variant={variant} size={size} className={cn(square, className)} title={props["aria-label"]}>
      <Icon />
    </Button>
  );
}

export { Button, IconButton, buttonVariants };

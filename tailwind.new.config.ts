import { tokens } from "@adaptavant/eds-brands/setmore";
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";

// "New" mode: the Setmore light-refresh calendar (design/new), built from shadcn components and
// styled only with EDS tokens. Everything is scoped under html[data-ds="new"], like Test mode, so
// nothing reaches the shadcn, EDS or Test modes.
//
// Colours: the Setmore brand's own EDS colour tokens are emitted as CSS variables (same names as
// eds-core's, e.g. --background-accent) inside the New scope, then the shadcn variables point at
// them. Components only ever use the theme names below, never hex values.
const { global: g, colorSchemes } = tokens;
const light = colorSchemes.light as Record<string, Record<string, string>>;
const SCOPE = 'html[data-ds="new"]';

const flatten = (obj: Record<string, unknown>, prefix: string): Record<string, string> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [`--${prefix}-${k}`, String(v)]));

const edsVars = {
  ...flatten(light.background, "background"),
  ...flatten(light.border, "border"),
  ...flatten(light.icon, "icon"),
  ...flatten(light.text, "text"),
  ...flatten(light.status, "status"),
  ...flatten(light.general, "general"),
  ...flatten(light.palette, "palette"),
  ...flatten(light.shadow, "shadow"),
};

// shadcn's variable names, mapped onto EDS semantic tokens.
const shadcnVars = {
  "--background": "var(--background-canvas)",
  "--foreground": "var(--text-primary)",
  "--card": "var(--background-neutral)",
  "--card-foreground": "var(--text-primary)",
  "--popover": "var(--background-menu)",
  "--popover-foreground": "var(--text-primary)",
  "--primary": "var(--background-accent)",
  "--primary-foreground": "var(--text-onPrimary)",
  // Tonal (the design's --brand-tonal / --brand-on-tonal). EDS has no tonal-button token; these are
  // the closest accent tokens that stay visible on white and pass AA contrast.
  "--secondary": "var(--background-accent-secondary-hover)",
  "--secondary-foreground": "var(--text-accent-pressed)",
  "--muted": "var(--background-neutral-secondary)",
  "--muted-foreground": "var(--text-secondary)",
  "--accent": "var(--background-neutral-hover)",
  "--accent-foreground": "var(--text-primary)",
  "--destructive": "var(--background-critical)",
  "--destructive-foreground": "var(--text-critical-onPrimary)",
  "--border": "var(--border-secondary)",
  "--input": "var(--border-input)",
  "--ring": "var(--border-focus)",
};

// Tailwind colour from a CSS variable, with /opacity support.
const v = (name: string) => `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;

// Calendar and person colours use EDS palette families (bg / border / text).
const PALETTES = ["gray", "dark-gray", "light-pink", "pink", "red", "maroon", "orange", "violet", "yellow", "green", "dark-green", "blue", "dark-blue"];
const paletteColors = Object.fromEntries(
  PALETTES.map((p) => [
    `pal-${p}`,
    { bg: v(`palette-${p}-background`), border: v(`palette-${p}-border`), text: v(`palette-${p}-text`) },
  ])
);

const typo = g.typography as unknown as {
  fontFamily: { body: string; fallback: string };
  body: Record<string, { fontSize: string; lineHeight: string }>;
  heading: Record<string, { fontSize: string; lineHeight: string }>;
};
const size = (t: { fontSize: string; lineHeight: string }): [string, string] => [t.fontSize, t.lineHeight];
const radius = g.radius as unknown as Record<string, string>;

const config: Config = {
  important: SCOPE,
  corePlugins: { preflight: false },
  content: ["./src/components/new-ui/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: v("border"),
        input: v("input"),
        ring: v("ring"),
        background: v("background"),
        foreground: v("foreground"),
        primary: { DEFAULT: v("primary"), foreground: v("primary-foreground") },
        secondary: { DEFAULT: v("secondary"), foreground: v("secondary-foreground") },
        destructive: { DEFAULT: v("destructive"), foreground: v("destructive-foreground") },
        muted: { DEFAULT: v("muted"), foreground: v("muted-foreground") },
        accent: { DEFAULT: v("accent"), foreground: v("accent-foreground") },
        popover: { DEFAULT: v("popover"), foreground: v("popover-foreground") },
        card: { DEFAULT: v("card"), foreground: v("card-foreground") },
        // EDS semantic tokens used directly by the calendar.
        canvas: { DEFAULT: v("background-canvas"), secondary: v("background-canvas-secondary") },
        hover: v("background-neutral-hover"),
        pressed: v("background-neutral-pressed"),
        inverse: { DEFAULT: v("background-inverse"), foreground: v("text-inverse") },
        subtle: v("text-tertiary"),
        caution: v("text-caution-secondary"),
        positive: v("text-positive"),
        line: v("border-tertiary"),
        "input-hover": v("border-input-hover"),
        busy: { DEFAULT: v("background-neutral-secondary"), bar: v("border-hover"), text: v("text-secondary") },
        overlay: v("general-constant-black"),
        status: { available: v("status-available"), offline: v("status-offline"), border: v("status-border") },
        avatar: v("background-avatar"),
        ...paletteColors,
      },
      // EDS radius tokens (4, 6, 8, 12, 16, full).
      borderRadius: {
        none: radius.none,
        sm: radius["4px"],
        DEFAULT: radius["6px"],
        md: radius["8px"],
        lg: radius["12px"],
        xl: radius["16px"],
        full: radius.full,
      },
      // EDS type scale: body 12 / 14 / 16, headings 16 / 18 / 24 / 32.
      fontSize: {
        xs: size(typo.body["12"]),
        sm: size(typo.body["14"]),
        base: size(typo.body["16"]),
        lg: size(typo.heading["18"]),
        xl: size(typo.heading["20"]),
        "2xl": size(typo.heading["24"]),
        badge: size(typo.body["10"]),
      },
      fontFamily: { sans: [typo.fontFamily.body, typo.fontFamily.fallback] },
      boxShadow: { sm: "var(--shadow-10)", md: "var(--shadow-20)", lg: "var(--shadow-30)", xl: "var(--shadow-40)" },
      // Layout measurements from the boards (no EDS token; named here so components carry no px).
      width: { nav: "236px", rail: "64px", panel: "380px", hover: "340px", dialog: "400px", menu: "300px", popover: "320px", zone: "56px", gutter: "60px" },
      minWidth: { teamcol: "160px", zonecol: "120px" },
      height: { toolbar: "68px", dayhead: "58px" },
      // Design: 120ms fades. EDS animation duration token: 100ms.
      transitionDuration: { fast: (g.animation as unknown as { duration: Record<string, string> }).duration["100"] },
    },
  },
  plugins: [
    animate,
    plugin(({ addBase }) => {
      addBase({ [`${SCOPE}, ${SCOPE} .light`]: { ...edsVars, ...shadcnVars } });
    }),
  ],
};

export default config;

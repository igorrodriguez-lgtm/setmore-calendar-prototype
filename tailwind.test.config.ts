import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// "Test" mode: Thani's Earth shadcn registry (eds-base + setmore-black), mapped from its
// Tailwind v4 theme into v3. Scoped under html[data-kit="test"] like the shadcn config, so it
// never collides with the EDS preset or the shadcn kit. The registry's colours are plain hex,
// so they're used as var(--x) directly (no hsl()), through color-mix so /opacity modifiers work.
// <alpha-value> is filled in by Tailwind (1 when there's no /opacity modifier).
const color = (name: string) => `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;

const config: Config = {
  important: 'html[data-kit="test"]',
  darkMode: "class",
  corePlugins: { preflight: false },
  content: [
    "./src/components/test-ui/**/*.{ts,tsx}",
    "./src/components/kit/test/**/*.{ts,tsx}",
    // Fallbacks for components the registry doesn't have: stock shadcn, coloured by the Test theme.
    "./src/components/shadcn/**/*.{ts,tsx}",
    "./src/components/kit/shadcn/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: color("border"),
        input: color("input"),
        ring: color("ring"),
        background: color("background"),
        foreground: color("foreground"),
        primary: { DEFAULT: color("primary"), foreground: color("primary-foreground") },
        secondary: { DEFAULT: color("secondary"), foreground: color("secondary-foreground") },
        destructive: { DEFAULT: color("destructive"), foreground: color("destructive-foreground") },
        muted: { DEFAULT: color("muted"), foreground: color("muted-foreground") },
        accent: { DEFAULT: color("accent"), foreground: color("accent-foreground") },
        popover: { DEFAULT: color("popover"), foreground: color("popover-foreground") },
        card: { DEFAULT: color("card"), foreground: color("card-foreground") },
      },
      // eds-base cssVars.theme
      borderRadius: { sm: "4px", md: "4px", lg: "8px", xl: "8px" },
      fontSize: { sm: ["12px", "20px"] },
      boxShadow: { md: "var(--eds-shadow-20)", lg: "var(--eds-shadow-30)" },
      ringWidth: { 3: "1px" },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
    },
  },
  plugins: [animate],
};

export default config;

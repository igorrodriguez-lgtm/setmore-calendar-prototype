import { tokens } from "@adaptavant/eds-brands/setmore-black";
import { createPreset } from "@adaptavant/eds-core/tailwind";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

// EDS styles for the app and the EDS kit. shadcn components get their own config
// (tailwind.shadcn.config.ts) because the EDS preset replaces Tailwind's theme.
const config: Config = {
  presets: [createPreset(tokens)],
  content: [
    "./node_modules/@adaptavant/eds-core/dist/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/calendar/**/*.{ts,tsx}",
    "./src/components/eds/**/*.{ts,tsx}",
    "./src/components/kit/*.{ts,tsx}",
  ],
  plugins: [
    // The EDS preset maps every text-[…] class to a colour, and its type scale stops at 8/10/12px.
    // Setmore's calendar grid uses 9 and 11px, so dense grid text uses fs-* instead.
    plugin(({ matchUtilities }) => {
      matchUtilities({ fs: (value) => ({ fontSize: value }) }, { values: { 8: "8px", 9: "9px", 10: "10px", 11: "11px", 12: "12px", 13: "13px", 15: "15px" } });
    }),
  ],
};

export default config;

"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { edsKit } from "../eds";
import { shadcnKit } from "./shadcn";
import type { Kit } from "./types";

const kits = { eds: edsKit, shadcn: shadcnKit };
type KitName = keyof typeof kits;
const STORAGE_KEY = "calendar-prototype-kit";

const KitContext = createContext<{ kit: Kit; setKit: (name: KitName) => void }>({ kit: edsKit, setKit: () => {} });

export function KitProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<KitName>("eds");

  useEffect(() => {
    // A ?kit=eds or ?kit=shadcn link wins over the last choice saved in this browser.
    const fromUrl = new URLSearchParams(window.location.search).get("kit");
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    const initial = fromUrl ?? saved;
    if (initial === "eds" || initial === "shadcn") setName(initial);
  }, []);

  const setKit = (next: KitName) => {
    setName(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return <KitContext.Provider value={{ kit: kits[name], setKit }}>{children}</KitContext.Provider>;
}

/** The active kit's building blocks: `const { Button, Modal } = useKit();` */
export function useKit() {
  return useContext(KitContext).kit;
}

/** Floating switch to compare the two kits on the same screens. */
export function KitToggle() {
  const { kit, setKit } = useContext(KitContext);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 text-sm shadow-lg">
      <span className="px-2 text-neutral-500">Built with</span>
      {(Object.keys(kits) as KitName[]).map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => setKit(name)}
          aria-pressed={kit.name === name}
          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
            kit.name === name ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          {kits[name].label}
        </button>
      ))}
    </div>
  );
}

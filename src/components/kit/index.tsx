"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { edsKit } from "../eds";
import { shadcnKit } from "./shadcn";
import { testKit } from "./test";
import { Toaster } from "../shadcn/sonner";
import type { Kit } from "./types";

// Toggle order: shadcn, EDS, Test, New. "New" is the light-refresh design (design/new): a separate
// calendar built in components/new-ui, so its slot here only reuses the EDS kit for anything shared.
const kits = { shadcn: shadcnKit, eds: edsKit, test: testKit, new: { ...edsKit, name: "new", label: "New" } satisfies Kit };
type KitName = keyof typeof kits;
const STORAGE_KEY = "calendar-prototype-kit";

const KitContext = createContext<{ kit: Kit; name: KitName; setKit: (name: KitName) => void }>({ kit: edsKit, name: "eds", setKit: () => {} });

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
    if (initial === "eds" || initial === "shadcn" || initial === "test" || initial === "new") setName(initial);
  }, []);

  // shadcn and Test styles are scoped to html[data-kit="…"] (see tailwind.shadcn.config.ts and tailwind.test.config.ts).
  // New mode's styles are scoped to html[data-ds="new"] (see tailwind.new.config.ts).
  useEffect(() => {
    document.documentElement.dataset.kit = name;
    if (name === "new") document.documentElement.dataset.ds = "new";
    else delete document.documentElement.dataset.ds;
  }, [name]);

  const setKit = (next: KitName) => {
    setName(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return (
    <KitContext.Provider value={{ kit: kits[name], name, setKit }}>
      {children}
      {name !== "eds" && name !== "new" && <Toaster position="bottom-left" offset={16} />}
    </KitContext.Provider>
  );
}

/** The active kit's building blocks: `const { Button, Modal } = useKit();` */
export function useKit() {
  return useContext(KitContext).kit;
}

/** Which toggle option is active ("new" swaps in the light-refresh calendar). */
export function useKitName() {
  return useContext(KitContext).name;
}

/** Floating switch to compare the two kits on the same screens. */
export function KitToggle() {
  const { name: active, setKit } = useContext(KitContext);
  return (
    <div data-print-hide className="fixed bottom-5 right-5 z-[80] flex items-center gap-1 rounded-full border border-secondary bg-canvas p-1 text-body-12 shadow-30">
      <span className="px-2 text-secondary">Built with</span>
      <a href="/registry" className="mr-1 rounded-full px-3 py-1 font-strong text-primary hover:bg-neutral-hover focus-visible:focus-ring" title="EDS as a shadcn registry">
        Registry proof of concept →
      </a>
      <span aria-hidden className="h-4 w-px bg-tertiary" />
      {(Object.keys(kits) as KitName[]).map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => setKit(name)}
          aria-pressed={active === name}
          className={`rounded-full px-3 py-1 font-strong transition-colors ${
            active === name ? "bg-inverse text-onPrimary" : "text-primary hover:bg-neutral-hover"
          }`}
        >
          {kits[name].label}
        </button>
      ))}
    </div>
  );
}

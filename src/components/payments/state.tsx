"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

/** Before = the current Figma ("Payments settings - layout Quick fix"), After = the improved version. */
export type Version = "before" | "after";

/** Every account state both versions support, in the order a merchant moves through them. */
export const STATES = [
  { id: "empty", label: "Empty", hint: "Nothing connected" },
  { id: "cash", label: "Cash only", hint: "No online provider" },
  { id: "connecting", label: "Connecting", hint: "Stripe onboarding open" },
  { id: "setup", label: "Stripe connected", hint: "Setup incomplete" },
  { id: "full", label: "Stripe fully set up", hint: "Everything on" },
  { id: "other", label: "Other provider", hint: "Square connected" },
] as const;
export type AccountState = (typeof STATES)[number]["id"];

/** The Figma explorations for "Stripe connected", so Before can show each one. */
export const BEFORE_OPTIONS = [
  { id: "c", label: "Option C" },
  { id: "c-live", label: "Option C · live features" },
  { id: "a", label: "Option A" },
  { id: "b", label: "Option B" },
  { id: "b-open", label: "Option B · guide expanded" },
] as const;
export type BeforeOption = (typeof BEFORE_OPTIONS)[number]["id"];

/** Where the first-connection journey is, so the flow can be clicked end to end. */
export type FlowStep =
  | "landing"
  | "landing-2"
  | "choose"
  | "provider-modal"
  | "onboarding"
  | "done";

interface Prototype {
  version: Version;
  state: AccountState;
  option: BeforeOption;
  compare: boolean;
  /** True right after the connect flow finishes, so the page can show its success moment once. */
  justConnected: boolean;
  /** Ends a connect flow: moves to the given state and marks it as just connected. */
  finishConnect: (to: AccountState) => void;
  dismissConnected: () => void;
  setVersion: (v: Version) => void;
  setState: (s: AccountState) => void;
  setOption: (o: BeforeOption) => void;
  setCompare: (on: boolean) => void;
}

const Ctx = createContext<Prototype | null>(null);

const isVersion = (v: string | null): v is Version => v === "before" || v === "after";
const isState = (v: string | null): v is AccountState => STATES.some((s) => s.id === v);
const isOption = (v: string | null): v is BeforeOption => BEFORE_OPTIONS.some((o) => o.id === v);

/** The toggles live in the URL (?v=before|after&s=<state>&opt=<option>&compare=1) so any view can be linked. */
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const router = useRouter();
  const v = params.get("v");
  const s = params.get("s");
  const o = params.get("opt");
  const version: Version = isVersion(v) ? v : "after";
  const state: AccountState = isState(s) ? s : "empty";
  const option: BeforeOption = isOption(o) ? o : "c";
  const compare = params.get("compare") === "1";

  const justConnected = params.get("new") === "1";

  const updateMany = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );
  const update = useCallback((key: string, value: string | null) => updateMany({ [key]: value }), [updateMany]);

  const value = useMemo<Prototype>(
    () => ({
      version,
      state,
      option,
      compare,
      justConnected,
      finishConnect: (to) => updateMany({ s: to, new: "1" }),
      dismissConnected: () => update("new", null),
      setVersion: (x) => update("v", x),
      setState: (x) => updateMany({ s: x, new: null }),
      setOption: (x) => update("opt", x),
      setCompare: (on) => update("compare", on ? "1" : null),
    }),
    [version, state, option, compare, justConnected, update, updateMany],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrototype(): Prototype {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrototype must be used inside PrototypeProvider");
  return ctx;
}

/**
 * One version's own view of the account. In side-by-side mode each pane keeps its own flow position and
 * dialogs, so clicking through Before never moves After.
 */
export function usePane(start: FlowStep = "landing") {
  const [flow, setFlow] = useState<FlowStep>(start);
  const [dialog, setDialog] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  return { flow, setFlow, dialog, setDialog, settingsOpen, setSettingsOpen };
}
export type Pane = ReturnType<typeof usePane>;

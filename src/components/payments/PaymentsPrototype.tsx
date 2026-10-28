"use client";

import { AfterView } from "./After";
import { BeforeView } from "./Before";
import { DevPanel } from "./shared";
import { PrototypeProvider, usePrototype } from "./state";

/** /payments?v=before|after&s=<state>&opt=<Figma option>&compare=1 */
export function PaymentsPrototype() {
  return (
    <PrototypeProvider>
      <Views />
      <DevPanel />
    </PrototypeProvider>
  );
}

function Views() {
  const { version, state, option, compare } = usePrototype();
  // Keyed by state, so switching state in the panel starts each view's own flow afresh.
  const before = <BeforeView key={`b-${state}-${option}`} state={state} option={option} />;
  const after = <AfterView key={`a-${state}`} state={state} />;
  if (compare) {
    return (
      <div className="pp pp-compare">
        <section className="pp-pane" aria-label="Before">
          <div className="pp-pane-label">BEFORE · current Figma</div>
          {before}
        </section>
        <section className="pp-pane" aria-label="After">
          <div className="pp-pane-label">AFTER · improved</div>
          {after}
        </section>
      </div>
    );
  }
  return <div className="pp">{version === "before" ? before : after}</div>;
}
